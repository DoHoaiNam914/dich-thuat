'use strict';
/* global $ */
import * as Reader from './Reader.js';
import Translation from './Translation.js';
const $copyButtons = $('.copy-button');
const $fontFamilyText = $('#font-family-text');
const $googleGenaiModelSelect = $('#google-genai-model-select');
const $inputTextarea = $('#input-textarea');
const $openaiModelSelect = $('#openai-model-select');
const $outputTextarea = $('#output-textarea');
const $translators = $('[data-translator-value]');
const MODELS = {
    GOOGLE_GENAI: {
        'Gemini 2.5': [
            {
                modelId: 'gemini-2.5-flash-preview-04-17',
                modelName: 'Gemini 2.5 Flash Preview 04-17'
            },
            {
                modelId: 'gemini-2.5-pro-preview-05-06',
                modelName: 'Gemini 2.5 Pro Preview 05-06',
                selected: true
            }
        ],
        'Gemini 2.0': [
            {
                modelId: 'gemini-2.0-flash',
                modelName: 'Gemini 2.0 Flash'
            },
            {
                modelId: 'gemini-2.0-flash-lite',
                modelName: 'Gemini 2.0 Flash-Lite'
            }
        ],
        'Gemini 1.5': [
            {
                modelId: 'gemini-1.5-flash',
                modelName: 'Gemini 1.5 Flash'
            },
            {
                modelId: 'gemini-1.5-flash-001'
            },
            {
                modelId: 'gemini-1.5-flash-002'
            },
            {
                modelId: 'gemini-1.5-flash-8b',
                modelName: 'Gemini 1.5 Flash-8B'
            },
            {
                modelId: 'gemini-1.5-pro',
                modelName: 'Gemini 1.5 Pro'
            },
            {
                modelId: 'gemini-1.5-pro-001'
            }
        ],
        Gemma: [
            {
                modelId: 'gemma-3-1b-it',
                modelName: 'Gemma 3 1B'
            },
            {
                modelId: 'gemma-3-4b-it',
                modelName: 'Gemma 3 4B'
            },
            {
                modelId: 'gemma-3-12b-it',
                modelName: 'Gemma 3 12B'
            },
            {
                modelId: 'gemma-3-27b-it',
                modelName: 'Gemma 3 27B'
            }
        ],
        Other: [
            {
                modelId: 'learnlm-1.5-pro-experimental',
                modelName: 'LearnLM 1.5 Pro Experimental'
            },
            {
                modelId: 'learnlm-2.0-flash-experimental',
                modelName: 'LearnLM 2.0 Flash Experimental'
            }
        ]
    },
    OPENAI: {
        'GPT-4.1': [
            'gpt-4.1',
            'gpt-4.1-mini',
            'gpt-4.1-nano',
            'gpt-4.1-nano-2025-04-14',
            'gpt-4.1-mini-2025-04-14',
            'gpt-4.1-2025-04-14'
        ],
        Reasoning: [
            'o3',
            'o4-mini',
            'o1-pro',
            'o1',
            'o1-2024-12-17',
            'o1-mini',
            'o1-mini-2024-09-12',
            'o1-preview',
            'o1-preview-2024-09-12',
            'o3-2025-04-16',
            'o3-mini',
            'o3-mini-2025-01-31',
            'o4-mini-2025-04-16'
        ],
        'GPT-4o': [
            'gpt-4o',
            'gpt-4o-mini',
            'gpt-4o-mini-2024-07-18',
            'gpt-4o-2024-11-20',
            'gpt-4o-2024-08-06',
            'gpt-4o-2024-05-13'
        ],
        'GPT-4.5': [
            'gpt-4.5-preview-2025-02-27',
            'gpt-4.5-preview'
        ],
        'GPT-4': [
            'gpt-4-turbo-preview',
            'gpt-4-turbo-2024-04-09',
            'gpt-4-turbo',
            'gpt-4-1106-preview',
            'gpt-4-0613',
            'gpt-4-0125-preview',
            'gpt-4'
        ],
        'GPT-3.5': [
            'gpt-3.5-turbo-16k',
            'gpt-3.5-turbo-1106',
            'gpt-3.5-turbo-0125',
            'gpt-3.5-turbo'
        ],
        Other: [
            'chatgpt-4o-latest'
        ]
    }
};
let textareaTranslation = null;
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
function showActiveTranslator(translator, focus = false) {
    const $translatorSwitcher = $('#translator');
    if ($translatorSwitcher == null)
        return;
    $translators.removeClass('active');
    $translators.filter(`[data-translator-value="${translator}"]`).addClass('active');
    if (focus)
        $translatorSwitcher.focus();
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
        const theme = $(this).data('reader-theme-value');
        Reader.setReaderTheme($readerThemes.filter('.active').data('reader-theme-value'), theme);
        Reader.showActiveReaderTheme(theme, true);
    });
    $googleGenaiModelSelect.empty();
    Object.entries(MODELS.GOOGLE_GENAI).forEach(([first, second]) => {
        const optgroup = document.createElement('optgroup');
        $(optgroup).prop('label', first);
        second.forEach(({ modelId, modelName, selected }) => {
            const option = document.createElement('option');
            if (modelName != null)
                $(option).val(modelId);
            $(option).text(modelName ?? modelId);
            $(option).prop('selected', selected);
            $(optgroup).append(option);
        });
        $googleGenaiModelSelect.append(optgroup);
    });
    $openaiModelSelect.empty();
    Object.entries(MODELS.OPENAI).forEach(([first, second]) => {
        const optgroup = document.createElement('optgroup');
        $(optgroup).prop('label', first);
        second.forEach(element => {
            const option = document.createElement('option');
            $(option).text(element);
            $(optgroup).append(option);
        });
        $openaiModelSelect.append(optgroup);
    });
});
$inputTextarea.on('input', function () {
    $('#character-count-number').text($(this).val().length);
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
        if ($target.val().length === 0 || window.confirm('Bạn có chắc chắn muốn thay thế văn bản hiện tại?'))
            $target.val(value).trigger('input');
    });
});
$('#translate-button').on('click', function () {
    const $textareaCopyButton = $copyButtons.filter(`[data-target="#${$inputTextarea.prop('id')}"]`);
    switch ($(this).text()) {
        case 'Dịch':
            $outputTextarea.text('Đang dịch...');
            $inputTextarea.hide();
            $outputTextarea.show();
            $(this).text('Huỷ');
            textareaTranslation = new Translation($inputTextarea.val(), ($('#destination-language-select')).val(), $('#original-language-select').val(), {
                translatorId: $('[data-translator-value]').filter('.active').data('translator-value'),
                googleGenaiModelId: $googleGenaiModelSelect.val(),
                thinkingModeEnabled: $('#thinking-mode-switch').prop('checked'),
                GOOGLE_API_KEY: $('#google-api-key-text').val(),
                openaiModelId: $openaiModelSelect.val(),
                bilingualEnabled: $('#bilingual-switch').prop('checked'),
                systemInstruction: $('#system-instruction-select').val(),
                tone: $('#tone-select').val(),
                domain: $('#domain-select').val(),
                customPrompt: $('#custom-prompt-textarea').val(),
                temperature: parseFloat($('#temperature-text').val()),
                topP: parseFloat($('#top-p-text').val()),
                topK: parseFloat($('#top-k-text').val())
            });
            textareaTranslation.translateText(appendTranslatedTextIntoOutputTextarea).finally(() => {
                $(this).text('Sửa');
                $textareaCopyButton.data('target', 'textareaTranslation');
            });
            break;
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
    }
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
    showActiveTranslator($(this).data('translator-value'), true);
});
