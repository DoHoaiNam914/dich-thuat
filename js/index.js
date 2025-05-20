'use strict';
/* global $, Papa */
import * as Reader from './Reader.js';
import { MODELS, SystemInstructions, Translation, Translators } from './Translation.js';
const $addWordButton = $('#add-word-button');
const $apiKeyTexts = $('.api-key-text');
const $copyButtons = $('.copy-button');
const $customDictionarySwitch = $('#custom-dictionary-switch');
const $deleteButton = $('#delete-button');
const $fontFamilyText = $('#font-family-text');
const $geminiApiKeyText = $('#gemini-api-key-text');
const $inputTextarea = $('#input-textarea');
const $modelSelects = $('.model-select');
const $outputTextarea = $('#output-textarea');
const $retranslateButton = $('#retranslate-button');
const $sourceText = $('#source-text');
const $sourceTextLanguageSelect = $('#source-text-language-select');
const $systemInstructionSelect = $('#system-instruction-select');
const $targetText = $('#target-text');
const $targetTextLanguageSelect = $('#target-text-language-select');
const $translateButton = $('#translate-button');
const $translationTranslators = $('[data-translation-translator-value]');
const $translators = $('[data-translator-value]');
const translationStorage = { translator: Translators.GOOGLE_GENAI_TRANSLATE, googleGenaiModel: Object.values(MODELS.GOOGLE_GENAI).flat().find(element => element.selected).modelId, openaiModel: Object.values(MODELS.OPENAI).flat().find(element => element.selected).modelId, systemInstruction: SystemInstructions.GPT4OMINI, ...JSON.parse(window.localStorage.getItem('translation') ?? '{}') };
let customDictionary = [];
let textareaTranslation = null;
let dictionaryTranslation = null;
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
    if (customDictionary.length > 0)
        window.localStorage.setItem('customDictionary', JSON.stringify(customDictionary));
    else
        window.localStorage.removeItem('customDictionary');
}
function appendTranslatedTextIntoOutputTextarea(translatedText, text, options) {
    const $outputTextarea = $('#output-textarea');
    $outputTextarea.empty();
    if (options.bilingualEnabled) {
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
    const preferredReaderTheme = Reader.getPreferredReaderTheme();
    Reader.setReaderTheme(preferredReaderTheme);
    Reader.showActiveReaderTheme(preferredReaderTheme);
    const $readerThemes = $('[data-reader-theme-value]');
    $readerThemes.on('click', function () {
        const readerTheme = $(this).data('reader-theme-value');
        window.localStorage.setItem('readerTheme', readerTheme);
        Reader.setReaderTheme(readerTheme, $readerThemes.filter('.active').data('reader-theme-value'));
        Reader.showActiveReaderTheme(readerTheme, true);
    });
    showActiveTranslator(translationStorage.translator);
    const $googleGenaiModelSelects = $('#google-genai-model-select, #dictionary-google-genai-model-select');
    $googleGenaiModelSelects.empty();
    Object.entries(MODELS.GOOGLE_GENAI).forEach(([first, second]) => {
        const optgroup = document.createElement('optgroup');
        $(optgroup).prop('label', first);
        second.forEach(element => {
            const option = document.createElement('option');
            if (typeof element === 'object') {
                const { modelId, modelName, selected } = element;
                if (modelName != null)
                    $(option).val(modelId);
                $(option).text(modelName ?? modelId);
                $(option).prop('selected', selected);
            }
            else {
                $(option).text(element);
            }
            $(optgroup).append(option);
        });
        $googleGenaiModelSelects.append(optgroup);
    });
    const $openaiModelSelects = $('#openai-model-select, #dictionary-openai-model-select');
    $openaiModelSelects.empty();
    Object.entries(MODELS.OPENAI).forEach(([first, second]) => {
        const optgroup = document.createElement('optgroup');
        $(optgroup).prop('label', first);
        second.forEach(element => {
            const option = document.createElement('option');
            if (typeof element === 'object') {
                const { modelId, modelName, selected } = element;
                if (modelName != null)
                    $(option).val(modelId);
                $(option).text(modelName ?? modelId);
                $(option).prop('selected', selected);
            }
            else {
                $(option).text(element);
            }
            $(optgroup).append(option);
        });
        $openaiModelSelects.append(optgroup);
    });
    $modelSelects.each((_index, element) => {
        $(element).val(translationStorage[$(element).prop('id').split('-').slice(0, -1).map((element, index) => index > 0 ? element.charAt(0).toUpperCase() + element.substring(1) : element).join('')]);
    });
    $apiKeyTexts.each((_index, element) => {
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
$('#font-size-text').on('change', function () {
    let value = parseFloat($(this).val());
    value = Math.min($(this).prop('max'), Math.max($(this).prop('min'), String(value).length === 0 ? $(this).prop('value') : value));
    $(this).val(value);
    $(document.body).css('--reader-font-size', `${value}em`);
});
$('#line-height-text').on('change', function () {
    let value = parseFloat($(this).val());
    value = Math.min($(this).prop('max'), Math.max($(this).prop('min'), String(value).length === 0 ? $(this).prop('value') : value));
    $(this).val(value);
    $(document.body).css('--reader-line-height', `${value}em`);
});
$('#bold-text-switch').on('change', function () {
    const themeFontWeight = $('[data-reader-theme-value]').filter('.active').data('reader-theme-font-weight');
    $(document.body).css('--reader-font-weight', $(this).prop('checked') ? 'bold' : themeFontWeight ?? null);
});
$('#justify-text-switch').on('change', function () {
    $(document.body).css('--reader-text-align', $(this).prop('checked') ? 'justify' : '');
});
$translators.on('click', function () {
    const translator = $(this).data('translator-value');
    window.localStorage.setItem('translation', JSON.stringify({ ...translationStorage, translator }));
    showActiveTranslator(translator, true);
});
$modelSelects.on('change', function () {
    translationStorage[$(this).prop('id').split('-').slice(0, -1).map((element, index) => index > 0 ? element.charAt(0).toUpperCase() + element.substring(1) : element).join('')] = $(this).val();
    window.localStorage.setItem('translation', JSON.stringify(translationStorage));
});
$apiKeyTexts.on('change', function () {
    window.localStorage.setItem($(this).prop('id').split('-').slice(0, -1).join('_').toUpperCase(), $(this).val());
});
$systemInstructionSelect.on('change', function () {
    window.localStorage.setItem('translation', JSON.stringify({ ...translationStorage, systemInstruction: $(this).val() }));
});
$('#dictionary-modal').on('hide.bs.modal', () => {
    if (dictionaryTranslation != null)
        dictionaryTranslation.abortController.abort();
    $('#source-text, #target-text').val('');
});
$('#custom-dictionary-input').on('change', function () {
    const fileReader = new FileReader();
    fileReader.onload = () => {
        // @ts-expect-error
        customDictionary = Papa.parse(fileReader.result, {
            header: true,
            skipEmptyLines: true
        }).data.map(a => {
            const COLUMN_NAME_MAP = {
                'Original language': 'originalLanguage',
                'Destination language': 'destinationLanguage',
                'Original word': 'originalWord',
                'Destination word': 'destinationWord'
            };
            const row = {};
            Object.keys(COLUMN_NAME_MAP).forEach(b => {
                row[COLUMN_NAME_MAP[b]] = a[b];
            });
            return row;
        }).toSorted((a, b) => Boolean(a.originalWord.split(/(?:)/u).length - b.originalWord.split(/(?:)/u).length) || Boolean(a.destinationWord.localeCompare(b.destinationWord, 'vi', { ignorePunctuation: true })) || Boolean(a.originalWord.localeCompare(b.originalWord, 'vi', { ignorePunctuation: true }))) ?? [];
        setStoredCustomDictionaryAndReloadCounter(customDictionary);
        $sourceText.trigger('input');
        $(this).val('');
    };
    fileReader.readAsText($(this).prop('files')[0]);
});
$('#delete-all-button').on('click', function () {
    if (!window.confirm('Bạn có chắc chắn muốn xoá tất cả từ trong từ điển?'))
        return;
    customDictionary = [];
    setStoredCustomDictionaryAndReloadCounter(customDictionary);
});
$translationTranslators.on('click', function () {
    if ($sourceText.val().length === 0)
        return;
    $sourceText.prop('readOnly', true);
    $targetText.prop('readOnly', true);
    $addWordButton.addClass('disabled');
    $translationTranslators.addClass('disabled');
    dictionaryTranslation = new Translation($sourceText.val(), $targetTextLanguageSelect.val(), $sourceTextLanguageSelect.val(), {
        translatorId: $(this).data('translation-translator-value'),
        googleGenaiModelId: $('#dictionary-google-genai-model-select').val(),
        thinkingModeEnabled: $('#dictionary-thinking-mode-switch').prop('checked'),
        groundingWithGoogleSearchEnabled: $('#grounding-with-google-search-switch').prop('checked'),
        GEMINI_API_KEY: $geminiApiKeyText.val(),
        openaiModelId: $('#dictionary-openai-model-select').val(),
        canWebSearch: $('#web-search-switch').prop('checked'),
        systemInstruction: $('#dictionary-system-instruction-select').val(),
        temperature: parseFloat($('#dictionary-temperature-text').val()),
        topP: parseFloat($('#dictionary-top-p-text').val()),
        topK: parseFloat($('#dictionary-top-k-text').val()),
        tone: $('#dictionary-tone-select').val(),
        domain: $('#dictionary-domain-select').val(),
        customDictionaryEnabled: $customDictionarySwitch.prop('checked'),
        customDictionary,
        customPromptEnabled: $('#dictionary-custom-prompt-switch').prop('checked'),
        customPrompt: $('#dictionary-custom-prompt-textarea').val()
    });
    dictionaryTranslation.translateText(translatedText => {
        $targetText.val(translatedText);
    }).finally(() => {
        $sourceText.prop('readOnly', false);
        $targetText.prop('readOnly', false);
        $addWordButton.removeClass('disabled');
        $translationTranslators.removeClass('disabled');
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
    const originalWord = $sourceText.val();
    const destinationWord = $targetText.val();
    if (originalWord.length === 0 || destinationWord.length === 0)
        return;
    customDictionary.push({
        originalLanguage: $sourceTextLanguageSelect.val(),
        destinationLanguage: $targetTextLanguageSelect.val(),
        originalWord,
        destinationWord
    });
    setStoredCustomDictionaryAndReloadCounter(customDictionary);
});
$deleteButton.on('click', () => {
    const wordIndex = customDictionary.findIndex(({ originalLanguage, destinationLanguage, originalWord }) => originalLanguage === $sourceTextLanguageSelect.val() && destinationLanguage === $targetTextLanguageSelect.val() && originalWord === $sourceText.val());
    if (wordIndex === -1 || !window.confirm('Bạn có chắc chắn muốn xoá từ này?'))
        return;
    customDictionary.splice(wordIndex, 1);
    setStoredCustomDictionaryAndReloadCounter(customDictionary);
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
        catch (_e) { }
    }());
});
$('.paste-button').on('click', function () {
    const $target = $($(this).data('target'));
    if ($target.length === 0)
        return;
    void navigator.clipboard.readText().then(value => {
        if ($target.val().length === 0 || window.confirm('Bạn có chắc chắn muốn thay thế văn bản hiện tại?')) {
            $target.val(value).trigger('input');
        }
    }).finally(() => {
        if ($target.prop('id') === $inputTextarea.prop('id') && $translateButton.text() === 'Sửa')
            $translateButton.click().click();
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
                thinkingModeEnabled: $('#thinking-mode-switch').prop('checked'),
                GEMINI_API_KEY: $geminiApiKeyText.val(),
                openaiModelId: $('#openai-model-select').val(),
                bilingualEnabled: $('#bilingual-switch').prop('checked'),
                systemInstruction: $('#system-instruction-select').val(),
                temperature: parseFloat($('#temperature-text').val()),
                topP: parseFloat($('#top-p-text').val()),
                topK: parseFloat($('#top-k-text').val()),
                tone: $('#tone-select').val(),
                domain: $('#domain-select').val(),
                customDictionaryEnabled: $customDictionarySwitch.prop('checked'),
                customDictionary,
                customPromptEnabled: $('#custom-prompt-switch').prop('checked'),
                customPrompt: $('#custom-prompt-textarea').val()
            });
            textareaTranslation.translateText(appendTranslatedTextIntoOutputTextarea).finally(() => {
                $(this).text('Sửa');
                $retranslateButton.removeClass('disabled');
                $textareaCopyButton.data('target', 'textareaTranslation');
            });
            break;
        }
        case 'Huỷ':
            if (textareaTranslation != null)
                textareaTranslation.abortController.abort();
        // fallthrough
        case 'Sửa':
            $textareaCopyButton.data('target', `#${$inputTextarea.prop('id')}`);
            textareaTranslation = null;
            $outputTextarea.text('');
            $outputTextarea.hide();
            $inputTextarea.show();
            $(this).text('Dịch');
            $retranslateButton.addClass('disabled');
    }
});
$inputTextarea.on('input', function () {
    $('#character-count-number').text($(this).val().length);
});
