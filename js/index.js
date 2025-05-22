'use strict';
/* global $, Papa */
import Reader from './Reader.js';
import { MODELS, SystemInstructions, Translation, Translators } from './Translation.js';
import Utils from './Utils.js';
const $addWordButton = $('#add-word-button');
const $apiKeyTexts = $('.api-key-text');
const $boldTextSwitch = $('#bold-text-switch');
const $copyButtons = $('.copy-button');
const $customDictionarySwitch = $('#custom-dictionary-switch');
const $deleteButton = $('#delete-button');
const $domainSelect = $('#domain-select');
const $fontFamilyText = $('#font-family-text');
const $fontSizeText = $('#font-size-text');
const $geminiApiKeyText = $('#gemini-api-key-text');
const $groqApiKeyText = $('#groq-api-key-text');
const $inputTextarea = $('#input-textarea');
const $justifyTextSwitch = $('#justify-text-switch');
const $lineHeightText = $('#line-height-text');
const $openrouterApiKeyText = $('#openrouter-api-key-text');
const $outputTextarea = $('#output-textarea');
const $retranslateButton = $('#retranslate-button');
const $sourceText = $('#source-text');
const $sourceTextLanguageSelect = $('#source-text-language-select');
const $stringValueOptions = $('.string-value-option');
const $systemInstructionSelect = $('#system-instruction-select');
const $targetText = $('#target-text');
const $targetTextLanguageSelect = $('#target-text-language-select');
const $translateButton = $('#translate-button');
const $translationTranslators = $('[data-translation-translator-value]');
const $translators = $('[data-translator-value]');
const translationStorage = {
    translator: Translators.GOOGLE_GENAI_TRANSLATE,
    googleGenaiModel: Object.values(MODELS.GOOGLE_GENAI).flat().filter(element => typeof element === 'object').find((element) => element.selected)?.modelId,
    openaiModel: Object.values(MODELS.OPENAI).flat().filter(element => typeof element === 'object').find((element) => element.selected)?.modelId,
    groqModel: Object.values(MODELS.GROQ).flat().filter(element => typeof element === 'object').find((element) => element.selected)?.modelId,
    openrouterModel: 'qwen/qwen3-235b-a22b',
    systemInstruction: SystemInstructions.GPT4OMINI,
    ...JSON.parse(window.localStorage.getItem('translation') ?? '{}')
};
let customDictionary = [];
let textareaTranslation = null;
let dictionaryTranslation = null;
function syncReaderThemeSettings($readerTheme) {
    $(document.body).css('--reader-font-weight', $readerTheme.data('reader-theme-font-weight') ?? '');
    const fontFamily = $readerTheme.data('reader-theme-font-family');
    if (fontFamily != null && $fontFamilyText.val().length === 0)
        $fontFamilyText.val(fontFamily).change();
    $fontSizeText.val($readerTheme.data('reader-theme-font-size')).change();
    const lineHeight = $readerTheme.data('reader-theme-line-height');
    if (typeof lineHeight === 'string' && lineHeight.startsWith('--')) {
        $lineHeightText.val(1.6).change();
        $(document.body).css('--opt-line-height', `var(${lineHeight})`);
        $lineHeightText.attr('readonly', 'true');
    }
    else {
        $lineHeightText.removeAttr('readonly');
        $lineHeightText.val(lineHeight).change();
    }
    $boldTextSwitch.prop('checked', $readerTheme.data('reader-theme-bold-text')).change();
    $justifyTextSwitch.prop('checked', $readerTheme.data('reader-theme-justify-text') ?? false).change();
}
function showActiveTranslator(translator, focus = false) {
    const $translatorSwitcher = $('#translator');
    if ($translatorSwitcher == null)
        return;
    $translators.removeClass('active');
    $translators.filter(`[data-translator-value="${translator}"]`).addClass('active');
    if (focus)
        $translatorSwitcher.focus();
}
function setStoredCustomDictionaryAndReloadCounter(customDictionary) {
    $('#custom-dictionary-count-number').text(customDictionary.length);
    if (customDictionary.length > 0) {
        customDictionary.sort((a, b) => {
            const wordLengthDifference = a.originalWord.split(/(?:)/u).length - b.originalWord.split(/(?:)/u).length;
            if (wordLengthDifference !== 0)
                return wordLengthDifference;
            const destinationWordDifference = a.destinationWord.localeCompare(b.destinationWord, 'vi', { ignorePunctuation: true });
            if (destinationWordDifference !== 0)
                return destinationWordDifference;
            return a.originalWord.localeCompare(b.originalWord, 'vi', { ignorePunctuation: true });
        });
        window.localStorage.setItem('customDictionary', JSON.stringify(customDictionary));
    }
    else {
        window.localStorage.removeItem('customDictionary');
    }
}
function appendTranslatedTextIntoOutputTextarea(translatedText, text, options) {
    const $outputTextarea = $('#output-textarea');
    $outputTextarea.empty();
    if (options.isBilingualEnabled) {
        const translatedLines = translatedText.split('\n');
        text.split('\n').forEach((element, index) => {
            const paragraph = document.createElement('p');
            if (element.replace(/^\s+/g, '').length === 0) {
                $(paragraph).append(document.createElement('br'));
            }
            else if (/^\p{P}+$/u.test(translatedLines[index])) {
                $(paragraph).text(element);
            }
            else {
                $(paragraph).append(element, document.createElement('br'), translatedLines[index]);
            }
            $outputTextarea.append(paragraph);
        });
    }
    else {
        translatedText.split('\n').forEach(element => {
            const paragraph = document.createElement('p');
            if (element.replace(/^\s+/g, '').length === 0) {
                $(paragraph).append(document.createElement('br'));
            }
            else {
                $(paragraph).text(element);
            }
            $outputTextarea.append(paragraph);
        });
    }
}
$(window).on('unload', () => {
    Object.keys(window.localStorage).filter((element) => element.includes('eruda')).forEach((element) => {
        window.localStorage.removeItem(element);
    });
});
$(document).ready(() => {
    Reader.loadReaderThemesOptions();
    const $readerThemes = $('[data-reader-theme-value]');
    $readerThemes.on('click', function () {
        const readerTheme = $(this).data('reader-theme-value');
        Reader.setReaderTheme(readerTheme, syncReaderThemeSettings, $readerThemes.filter('.active').data('reader-theme-value'));
        Reader.showActiveReaderTheme(readerTheme, true);
    });
    showActiveTranslator(translationStorage.translator);
    const $modelSelects = $('.model-select');
    $modelSelects.each((index, a) => {
        $(a).empty();
        Object.entries(MODELS[$(a).prop('id').replace('dictionary-', '').split('-').slice(0, -2).join('_').toUpperCase()]).forEach(([first, second]) => {
            const optgroup = document.createElement('optgroup');
            $(optgroup).prop('label', first);
            second.forEach(b => {
                const option = document.createElement('option');
                if (typeof b === 'object') {
                    const { modelId, modelName, selected } = b;
                    if (modelName != null)
                        $(option).val(modelId);
                    $(option).text(modelName ?? modelId);
                    $(option).prop('selected', selected);
                }
                else {
                    $(option).text(b);
                }
                $(optgroup).append(option);
            });
            $(a).append(optgroup);
        });
    });
    $stringValueOptions.each((_index, element) => {
        $(element).val(translationStorage[$(element).prop('id').split('-').slice(0, -1).map((element, index) => index > 0 ? element.charAt(0).toUpperCase() + element.substring(1) : element).join('')]);
    });
    $apiKeyTexts.each((index, element) => {
        $(element).val(window.localStorage.getItem($(element).prop('id').split('-').slice(0, -1).join('_').toUpperCase()) ?? '');
    });
    $systemInstructionSelect.val(translationStorage.systemInstruction);
    customDictionary = JSON.parse(window.localStorage.getItem('customDictionary') ?? '[]');
    setStoredCustomDictionaryAndReloadCounter(customDictionary);
});
$fontFamilyText.on('change', function () {
    const fontFamily = Reader.fontMapper($(this).val());
    $(this).val(fontFamily);
    $(document.body).css('--reader-font-family', fontFamily.split(', ').map((element) => element.includes(' ') ? `'${element}'` : (element.startsWith('--') ? `var(${element})` : element)).join(', '));
});
$fontSizeText.on('change', function () {
    const raw = $(this).val();
    const parsed = parseFloat(raw.length === 0 ? $(this).attr('value') : raw);
    const value = Utils.clamp(parsed, $(this).prop('min'), $(this).prop('max'));
    $(this).val(value);
    $(document.body).css('--reader-font-size', value === 1 ? '' : `${value}em`);
});
$lineHeightText.on('change', function () {
    const raw = $(this).val();
    const parsed = parseFloat(raw.length === 0 ? $(this).attr('value') : raw);
    const value = Utils.clamp(parsed, $(this).prop('min'), $(this).prop('max'));
    $(this).val(value);
    $(document.body).css('--reader-line-height', value === 1.2 ? '' : `${value}em`);
});
$boldTextSwitch.on('change', function () {
    if ($(this).prop('checked'))
        $('.textarea').addClass('bold-text');
    else
        $('.textarea').removeClass('bold-text');
});
$justifyTextSwitch.on('change', function () {
    $(document.body).css('--reader-text-align', $(this).prop('checked') ? 'justify' : '');
});
$translators.on('click', function () {
    const translator = $(this).data('translator-value');
    window.localStorage.setItem('translation', JSON.stringify({ ...translationStorage, translator }));
    showActiveTranslator(translator, true);
});
$stringValueOptions.on('change', function () {
    translationStorage[$(this).prop('id').split('-').slice(0, -1).map((element, index) => index > 0 ? element.charAt(0).toUpperCase() + element.substring(1) : element).join('')] = $(this).val();
    window.localStorage.setItem('translation', JSON.stringify(translationStorage));
});
$apiKeyTexts.on('change', function () {
    window.localStorage.setItem($(this).prop('id').split('-').slice(0, -1).join('_').toUpperCase(), $(this).val());
});
$systemInstructionSelect.on('change', function () {
    window.localStorage.setItem('translation', JSON.stringify({ ...translationStorage, systemInstruction: $(this).val() }));
});
$domainSelect.on('change', function () {
    $(`#dictionary-${$(this).prop('id')}`).val($(this).val());
});
$('#dictionary-modal').on('hide.bs.modal', () => {
    if (dictionaryTranslation != null)
        dictionaryTranslation.abortController.abort();
    $('#source-text, #target-text').val('').prop('readOnly', false);
    $('#add-word-button, #delete-button, [translation-translator-value]').removeClass('disabled');
});
$('#custom-dictionary-input').on('change', function () {
    // @ts-expect-error Papaparse
    Papa.parse($(this).prop('files')[0], {
        header: true,
        skipEmptyLines: true,
        complete: (results) => {
            customDictionary = results.data.map(a => {
                const COLUMN_NAME_MAP = {
                    'Original language': 'originalLanguage',
                    'Destination language': 'destinationLanguage',
                    'Original word': 'originalWord',
                    'Destination word': 'destinationWord'
                };
                const row = { originalLanguage: '', destinationLanguage: '', originalWord: '', destinationWord: '' };
                Object.keys(COLUMN_NAME_MAP).forEach(b => {
                    row[COLUMN_NAME_MAP[b]] = a[b];
                });
                return row;
            });
            setStoredCustomDictionaryAndReloadCounter(customDictionary);
            $sourceText.trigger('input');
            $(this).val('');
        }
    });
});
$('#delete-all-button').on('click', function () {
    if (!window.confirm('Bạn có chắc chắn muốn xoá tất cả từ trong từ điển?'))
        return;
    customDictionary = [];
    setStoredCustomDictionaryAndReloadCounter(customDictionary);
});
$translationTranslators.on('click', function () {
    const sourceText = $sourceText.val();
    if (sourceText.length === 0)
        return;
    const previousTargetText = $targetText.val();
    $targetText.val('Đang dịch...');
    $('#source-text, #target-text').prop('readOnly', true);
    $('#add-word-button, #delete-button, [translation-translator-value]').addClass('disabled');
    dictionaryTranslation = new Translation(sourceText, $targetTextLanguageSelect.val(), $sourceTextLanguageSelect.val(), {
        translatorId: $(this).data('translation-translator-value'),
        googleGenaiModelId: $('#dictionary-google-genai-model-select').val(),
        isThinkingModeEnabled: $('#dictionary-thinking-mode-switch').prop('checked'),
        isGroundingWithGoogleSearchEnabled: $('#grounding-with-google-search-switch').prop('checked'),
        GEMINI_API_KEY: $geminiApiKeyText.val(),
        openaiModelId: $('#dictionary-openai-model-select').val(),
        isWebSearchEnabled: $('#web-search-switch').prop('checked'),
        groqModelId: $('#dictionary-groq-model-select').val(),
        GROQ_API_KEY: $groqApiKeyText.val(),
        openrouterModelId: $('#dictionary-openrouter-model-text').val(),
        OPENROUTER_API_KEY: $openrouterApiKeyText.val(),
        systemInstruction: $('#dictionary-system-instruction-select').val(),
        temperature: parseFloat($('#dictionary-temperature-text').val()),
        topP: parseFloat($('#dictionary-top-p-text').val()),
        topK: parseFloat($('#dictionary-top-k-text').val()),
        tone: $('#dictionary-tone-select').val(),
        domain: $(`#dictionary-${$domainSelect.prop('id')}`).val(),
        isCustomDictionaryEnabled: $customDictionarySwitch.prop('checked'),
        customDictionary,
        isCustomPromptEnabled: $('#dictionary-custom-prompt-switch').prop('checked'),
        customPrompt: $('#dictionary-custom-prompt-textarea').val()
    });
    dictionaryTranslation.translateText(translatedText => {
        $targetText.val(translatedText);
    }).catch(() => {
        if (!textareaTranslation?.abortController.signal.aborted)
            $targetText.val(previousTargetText);
    }).finally(() => {
        $('#source-text, #target-text').prop('readOnly', false);
        $('#add-word-button, #delete-button, [translation-translator-value]').removeClass('disabled');
    });
});
$('[data-define-url]').on('click', function () {
    if ($sourceText.val().length === 0)
        return;
    window.open($(this).data('define-url').replace('%l', $sourceTextLanguageSelect.val().split('-')[0]).replace('%s', $sourceText.val()), '_blank', 'width=1000,height=577');
});
$sourceText.on('input', function () {
    $targetText.val(customDictionary.find(({ originalLanguage, destinationLanguage, originalWord }) => originalLanguage === $sourceTextLanguageSelect.val() && destinationLanguage === $targetTextLanguageSelect.val() && originalWord === $(this).val())?.destinationWord ?? $targetText.val());
});
$addWordButton.on('click', () => {
    const originalLanguage = $sourceTextLanguageSelect.val();
    const destinationLanguage = $targetTextLanguageSelect.val();
    const originalWord = $sourceText.val();
    const destinationWord = $targetText.val();
    if (originalWord.length === 0 || destinationWord.length === 0)
        return;
    const wordIndex = customDictionary.findIndex(element => element.originalLanguage === originalLanguage && element.destinationLanguage === destinationLanguage && element.originalWord === originalWord);
    if (wordIndex !== -1)
        customDictionary.splice(wordIndex, 1);
    customDictionary.push({
        originalLanguage: $sourceTextLanguageSelect.val(),
        destinationLanguage: $targetTextLanguageSelect.val(),
        originalWord,
        destinationWord
    });
    $('#source-text, #target-text').val('');
    setStoredCustomDictionaryAndReloadCounter(customDictionary);
});
$deleteButton.on('click', () => {
    const wordIndex = customDictionary.findIndex(({ originalLanguage, destinationLanguage, originalWord }) => originalLanguage === $sourceTextLanguageSelect.val() && destinationLanguage === $targetTextLanguageSelect.val() && originalWord === $sourceText.val());
    if (wordIndex === -1 || !window.confirm('Bạn có chắc chắn muốn xoá từ này?'))
        return;
    customDictionary.splice(wordIndex, 1);
    $targetText.val('');
    setStoredCustomDictionaryAndReloadCounter(customDictionary);
});
$('#copy-csv-button').on('click', () => {
    void (async function () {
        try {
            // @ts-expect-error Papaparse
            await navigator.clipboard.writeText(Papa.unparse(customDictionary.map(a => {
                const COLUMN_NAME_MAP = {
                    originalLanguage: 'Original language',
                    originalWord: 'Original word',
                    destinationLanguage: 'Destination language',
                    destinationWord: 'Destination word'
                };
                const row = {};
                Object.keys(COLUMN_NAME_MAP).forEach(b => {
                    row[COLUMN_NAME_MAP[b]] = a[b];
                });
                return row;
            })));
        }
        catch {
            // continue regardless of error
        }
    }());
});
$copyButtons.on('click', function () {
    const target = $(this).data('target');
    const $target = $(target);
    let targetContent = '';
    if ($target.length > 0)
        targetContent = $target.val();
    else if (target === 'textareaTranslation' && textareaTranslation != null)
        targetContent = textareaTranslation.translatedText;
    void (async function () {
        try {
            await navigator.clipboard.writeText(targetContent);
        }
        catch {
            // continue regardless of error
        }
    }());
});
$('.paste-button').on('click', function () {
    const $target = $($(this).data('target'));
    if ($target.length === 0)
        return;
    void navigator.clipboard.readText().then(value => {
        if ($target.val().length === 0 || window.confirm('Bạn có chắc chắn muốn thay thế văn bản hiện tại?')) {
            $target.val(value).trigger('input');
            if ($target.prop('id') === $inputTextarea.prop('id') && $translateButton.text() === 'Sửa')
                $translateButton.click().click();
        }
    });
});
$retranslateButton.on('click', () => {
    if (window.confirm('Bạn có chắc chắn muốn dịch lại?'))
        $translateButton.click().click();
});
$translateButton.on('click', function () {
    const $textareaCopyButton = $copyButtons.filter(`[data-target="#${$inputTextarea.prop('id')}"]`);
    switch ($(this).text()) {
        case 'Dịch': {
            const inputText = $inputTextarea.val();
            if (inputText.length === 0)
                break;
            $outputTextarea.text('Đang dịch...');
            $inputTextarea.hide();
            $outputTextarea.show();
            $(this).text('Huỷ');
            textareaTranslation = new Translation(inputText, $('#destination-language-select').val(), $('#original-language-select').val(), {
                translatorId: $('[data-translator-value]').filter('.active').data('translator-value'),
                googleGenaiModelId: $('#google-genai-model-select').val(),
                isThinkingModeEnabled: $('#thinking-mode-switch').prop('checked'),
                GEMINI_API_KEY: $geminiApiKeyText.val(),
                openaiModelId: $('#openai-model-select').val(),
                groqModelId: $('#groq-model-select').val(),
                GROQ_API_KEY: $groqApiKeyText.val(),
                openrouterModelId: $('#openrouter-model-text').val(),
                OPENROUTER_API_KEY: $openrouterApiKeyText.val(),
                isBilingualEnabled: $('#bilingual-switch').prop('checked'),
                systemInstruction: $('#system-instruction-select').val(),
                temperature: parseFloat($('#temperature-text').val()),
                topP: parseFloat($('#top-p-text').val()),
                topK: parseFloat($('#top-k-text').val()),
                tone: $('#tone-select').val(),
                domain: $domainSelect.val(),
                isCustomDictionaryEnabled: $customDictionarySwitch.prop('checked'),
                customDictionary,
                isCustomPromptEnabled: $('#custom-prompt-switch').prop('checked'),
                customPrompt: $('#custom-prompt-textarea').val()
            });
            textareaTranslation.translateText(appendTranslatedTextIntoOutputTextarea).then(() => {
                if (textareaTranslation?.abortController.signal.aborted)
                    return;
                $(this).text('Sửa');
                $textareaCopyButton.data('target', 'textareaTranslation');
                $retranslateButton.removeClass('disabled');
            }).catch(() => {
                if (!textareaTranslation?.abortController.signal.aborted)
                    $(this).click();
            });
            break;
        }
        case 'Huỷ':
            textareaTranslation?.abortController.abort();
        // fallthrough
        case 'Sửa':
            $outputTextarea.text('');
            $outputTextarea.hide();
            $inputTextarea.show();
            $textareaCopyButton.data('target', `#${$inputTextarea.prop('id')}`);
            $(this).text('Dịch');
            $retranslateButton.addClass('disabled');
    }
});
$inputTextarea.on('input', function () {
    $('#character-count-number').text($(this).val().length);
});
//# sourceMappingURL=index.js.map