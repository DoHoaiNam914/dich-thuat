'use strict'
/* global $, Papa */
import * as Reader from './Reader.js'
import Translation from './Translation.js'
const $addWordButton = $('#add-word-button')
const $apiKeyTexts = $('.api-key-text')
const $copyButtons = $('.copy-button')
const $customDictionarySwitch = $('#custom-dictionary-switch')
// const $deleteButton = $('#delete-button')
const $fontFamilyText = $('#font-family-text')
const $googleApiKeyText = $('#google-api-key-text')
const $googleGenaiModelSelect = $('#google-genai-model-select')
const $inputTextarea = $('#input-textarea')
const $modelSelects = $('.model-select')
const $openaiModelSelect = $('#openai-model-select')
const $outputTextarea = $('#output-textarea')
const $sourceText = $('#source-text')
const $sourceTextLanguageSelect = $('#source-text-language-select')
const $systemInstructionSelect = $('#system-instruction-select')
const $targetText = $('#target-text')
const $targetTextLanguageSelect = $('#target-text-language-select')
const $translationTranslators = $('[data-translation-translator-value]')
const $translators = $('[data-translator-value]')
const MODELS: { [key: string]: { [key: string]: any[] } } = {
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
      'gemini-1.5-flash-001',
      'gemini-1.5-flash-002',
      {
        modelId: 'gemini-1.5-flash-8b',
        modelName: 'Gemini 1.5 Flash-8B'
      },
      {
        modelId: 'gemini-1.5-pro',
        modelName: 'Gemini 1.5 Pro'
      },
      'gemini-1.5-pro-001'
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
      {
        modelId: 'gpt-4.1',
        selected: true
      },
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
}
const translationStorage = { translator: 'googleGenaiTranslate', googleGenaiModel: Object.values(MODELS.GOOGLE_GENAI).flat().find(element => element.selected)?.modelId, openaiModel: Object.values(MODELS.OPENAI).flat().find(element => element.selected)?.modelId, systemInstruction: 'gpt4oMini', ...JSON.parse(window.localStorage.getItem('translation') ?? '{}') }
let customDictionary: Array<{ [key: string]: string }> = []
let textareaTranslation: Translation | null = null
function showActiveTranslator (translator: string, focus = false): void {
  const $translatorSwitcher = $('#translator')
  if ($translatorSwitcher == null) return
  $translators.removeClass('active')
  $translators.filter(`[data-translator-value="${translator}"]`).addClass('active')
  if (focus) $translatorSwitcher.focus()
}
function setStoredCustomDictionaryAndReloadCounter (customDictionary): void {
  $('#custom-dictionary-count-number').text(customDictionary.length)
  if (customDictionary.length > 0) window.localStorage.setItem('customDictionary', JSON.stringify(customDictionary))
  else window.localStorage.removeItem('customDictionary')
}
function appendTranslatedTextIntoOutputTextarea (translatedText, text, options): void {
  const $outputTextarea = $('#output-textarea')
  $outputTextarea.empty()
  if (options.bilingualEnabled as boolean) {
    const translatedLines = translatedText.split('\n')
    text.split('\n').forEach((element, index) => {
      const paragraph = document.createElement('p')
      if (element.replace(/^\s+/g, '').length === 0) {
        $(paragraph).append(document.createElement('br'))
      } else if (/^\p{P}+$/u.test(translatedLines[index])) {
        $(paragraph).text(element)
      } else {
        $(paragraph).append(element, document.createElement('br'), translatedLines[index])
      }
      $outputTextarea.append(paragraph)
    })
  } else {
    translatedText.split('\n').forEach(element => {
      const paragraph = document.createElement('p')
      if (element.replace(/^\s+/g, '').length === 0) {
        $(paragraph).append(document.createElement('br'))
      } else {
        $(paragraph).text(element)
      }
      $outputTextarea.append(paragraph)
    })
  }
}
$(window).on('unload', () => {
  Object.keys(window.localStorage).filter((element) => element.includes('eruda')).forEach((element) => {
    window.localStorage.removeItem(element)
  })
})
$(document).ready(() => {
  Reader.loadReaderThemesOptions()
  const preferredReaderTheme = Reader.getPreferredReaderTheme()
  Reader.setReaderTheme(preferredReaderTheme)
  Reader.showActiveReaderTheme(preferredReaderTheme)
  const $readerThemes = $('[data-reader-theme-value]')
  $readerThemes.on('click', function () {
    const readerTheme = $(this).data('reader-theme-value')
    window.localStorage.setItem('readerTheme', readerTheme)
    Reader.setReaderTheme(readerTheme, $readerThemes.filter('.active').data('reader-theme-value'))
    Reader.showActiveReaderTheme(readerTheme, true)
  })
  showActiveTranslator(translationStorage.translator)
  $googleGenaiModelSelect.empty()
  Object.entries(MODELS.GOOGLE_GENAI).forEach(([first, second]) => {
    const optgroup = document.createElement('optgroup')
    $(optgroup).prop('label', first)
    second.forEach(element => {
      const option = document.createElement('option')
      if (typeof element === 'object') {
        const { modelId, modelName, selected } = element
        if (modelName != null) $(option).val(modelId)
        $(option).text(modelName ?? modelId)
        $(option).prop('selected', selected)
      } else {
        $(option).text(element)
      }
      $(optgroup).append(option)
    })
    $googleGenaiModelSelect.append(optgroup)
  })
  $openaiModelSelect.empty()
  Object.entries(MODELS.OPENAI).forEach(([first, second]) => {
    const optgroup = document.createElement('optgroup')
    $(optgroup).prop('label', first)
    second.forEach(element => {
      const option = document.createElement('option')
      if (typeof element === 'object') {
        const { modelId, modelName, selected } = element
        if (modelName != null) $(option).val(modelId)
        $(option).text(modelName ?? modelId)
        $(option).prop('selected', selected)
      } else {
        $(option).text(element)
      }
      $(optgroup).append(option)
    })
    $openaiModelSelect.append(optgroup)
  })
  $modelSelects.each((_index, element) => {
    $(element).val(translationStorage[($(element).prop('id') as string).split('-').slice(0, -1).map((element, index) => index > 0 ? element.charAt(0).toUpperCase() + element.substring(1) : element).join('')])
  })
  $apiKeyTexts.each((_index, element) => {
    $(element).val(window.localStorage.getItem($(element).prop('id').split('-').slice(0, -1).join('_').toUpperCase()) ?? '')
  })
  $systemInstructionSelect.val(translationStorage.systemInstruction)
  customDictionary = JSON.parse(window.localStorage.getItem('customDictionary') ?? '[]')
  setStoredCustomDictionaryAndReloadCounter(customDictionary)
})
$fontFamilyText.on('change', function () {
  const fontFamily = Reader.fontMapper($(this).val())
  $(this).val(fontFamily)
  $(document.body).css('--reader-font-family', fontFamily.split(', ').map((element: string) => element.includes(' ') ? `'${element}'` : (element.startsWith('--') ? `var(${element})` : element)).join(', '))
})
$('#font-size-text').on('change', function () {
  let value: number = parseFloat($(this).val() as string)
  value = Math.min($(this).prop('max'), Math.max($(this).prop('min'), String(value).length === 0 ? $(this).prop('value') : value))
  $(this).val(value)
  $(document.body).css('--reader-font-size', `${value}em`)
})
$('#line-height-text').on('change', function () {
  let value: number = parseFloat($(this).val() as string)
  value = Math.min($(this).prop('max'), Math.max($(this).prop('min'), String(value).length === 0 ? $(this).prop('value') : value))
  $(this).val(value)
  $(document.body).css('--reader-line-height', `${value}em`)
})
$('#bold-text-switch').on('change', function () {
  const themeFontWeight = $('[data-reader-theme-value]').filter('.active').data('reader-theme-font-weight')
  $(document.body).css('--reader-font-weight', $(this).prop('checked') as boolean ? 'bold' : themeFontWeight ?? null)
})
$('#justify-text-switch').on('change', function () {
  $(document.body).css('--reader-text-align', $(this).prop('checked') as boolean ? 'justify' : '')
})
$translators.on('click', function () {
  const translator = $(this).data('translator-value')
  window.localStorage.setItem('translation', JSON.stringify({ ...translationStorage, translator }))
  showActiveTranslator(translator, true)
})
$modelSelects.on('change', function () {
  translationStorage[($(this).prop('id') as string).split('-').slice(0, -1).map((element, index) => index > 0 ? element.charAt(0).toUpperCase() + element.substring(1) : element).join('')] = $(this).val()
  window.localStorage.setItem('translation', JSON.stringify(translationStorage))
})
$apiKeyTexts.on('change', function () {
  window.localStorage.setItem($(this).prop('id').split('-').slice(0, -1).join('_').toUpperCase(), $(this).val() as string)
})
$systemInstructionSelect.on('change', function () {
  window.localStorage.setItem('translation', JSON.stringify({ ...translationStorage, systemInstruction: $(this).val() }))
})
$('#custom-dictionary-input').on('change', function () {
  // @ts-expect-error
  customDictionary = Papa.parse($(this).prop('files')[0], { header: true, skipEmptyLines: true }).result.data.map(a => {
    const COLUMN_NAME_MAP = {
      'Original language': 'originalLanguage',
      'Destination language': 'destinationLanguage',
      'Original word': 'originalWord',
      'Destination word': 'destinationWord'
    }
    const row = {}
    Object.keys(COLUMN_NAME_MAP).forEach(b => {
      row[COLUMN_NAME_MAP[b]] = a[b]
    })
    return row
  }) ?? []
  $(this).val('')
  setStoredCustomDictionaryAndReloadCounter(customDictionary)
})
$('#delete-all-button').on('click', function () {
  customDictionary = []
  setStoredCustomDictionaryAndReloadCounter(customDictionary)
})
$translationTranslators.on('click', function () {
  if (($sourceText.val() as string).length === 0) return
  $sourceText.prop('readOnly', true)
  $targetText.prop('readOnly', true)
  $translationTranslators.addClass('disabled')
  new Translation($sourceText.val(), $targetTextLanguageSelect.val(), $sourceTextLanguageSelect.val(), {
    translatorId: $(this).data('translation-translator-value'),
    googleGenaiModelId: $('#dictionary-google-genai-model-select').val(),
    thinkingModeEnabled: $('#dictionary-thinking-mode-switch').prop('checked'),
    groundingWithGoogleSearchEnabled: $('#grounding-with-google-search-switch').prop('checked'),
    GOOGLE_API_KEY: $googleApiKeyText.val(),
    openaiModelId: $('#dictionary-openai-model-select').val(),
    canWebSearch: $('#web-search-switch').prop('checked'),
    systemInstruction: $('#dictionary-system-instruction-select').val(),
    temperature: parseFloat($('#dictionary-temperature-text').val() as string),
    topP: parseFloat($('#dictionary-top-p-text').val() as string),
    topK: parseFloat($('#dictionary-top-k-text').val() as string),
    tone: $('#dictionary-tone-select').val(),
    domain: $('#dictionary-domain-select').val(),
    customDictionaryEnabled: $customDictionarySwitch.prop('checked'),
    customDictionary,
    customPromptEnabled: $('#dictionary-custom-prompt-switch').prop('checked'),
    customPrompt: $('#dictionary-custom-prompt-textarea').val()
  }).translateText(translatedText => {
    $targetText.val(translatedText)
  }).finally(() => {
    $sourceText.prop('readOnly', false)
    $targetText.prop('readOnly', false)
    $addWordButton.removeClass('disabled')
    $translationTranslators.removeClass('disabled')
  })
})
$('[data-define-url]').on('click', function () {
  if (($sourceText.val() as string).length === 0) return
  window.open($(this).data('define-url').replace('%l', ($sourceTextLanguageSelect.val() as string).split('-')[0]).replace('%s', $sourceText.val()), '_blank', 'width=1000,height=577')
})
$sourceText.on('input', function () {
  $targetText.val(customDictionary.find(({ originalLanguage, destinationLanguage, originalWord }) => originalLanguage === $sourceTextLanguageSelect.val() && destinationLanguage === $targetTextLanguageSelect.val() && originalWord === $(this).val())?.destinationWord ?? ($targetText.val() as string))
})
$addWordButton.on('click', () => {
  const originalWord = $sourceText.val() as string
  const destinationWord = $targetText.val() as string
  if (originalWord.length === 0 || destinationWord.length === 0) return
  customDictionary.push({
    originalLanguage: $sourceTextLanguageSelect.val() as string,
    destinationLanguage: $targetTextLanguageSelect.val() as string,
    originalWord,
    destinationWord
  })
  setStoredCustomDictionaryAndReloadCounter(customDictionary)
})
$copyButtons.on('click', function () {
  const target = $(this).data('target')
  const $target = $(target)
  let targetContent = ''
  if ($target.length > 0) targetContent = $target.val()
  else if (target === 'textareaTranslation' && textareaTranslation != null) targetContent = textareaTranslation.translatedText
  void (async function () {
    try {
      await navigator.clipboard.writeText(targetContent)
    } catch (_e) {}
  }())
})
$('.paste-button').on('click', function () {
  const $target = $($(this).data('target'))
  if ($target.length === 0) return
  void navigator.clipboard.readText().then(value => {
    if ($target.val().length === 0 || window.confirm('Bạn có chắc chắn muốn thay thế văn bản hiện tại?')) $target.val(value).trigger('input')
  })
})
$('#translate-button').on('click', function () {
  const $textareaCopyButton = $copyButtons.filter(`[data-target="#${$inputTextarea.prop('id') as string}"]`)
  switch ($(this).text()) {
    case 'Dịch': {
      const inputText = $inputTextarea.val() as string
      if (inputText.length === 0) break
      $outputTextarea.text('Đang dịch...')
      $inputTextarea.hide()
      $outputTextarea.show()
      $(this).text('Huỷ')
      textareaTranslation = new Translation(inputText, $('#destination-language-select').val(), $('#original-language-select').val(), {
        translatorId: $('[data-translator-value]').filter('.active').data('translator-value'),
        googleGenaiModelId: $googleGenaiModelSelect.val(),
        thinkingModeEnabled: $('#thinking-mode-switch').prop('checked'),
        GOOGLE_API_KEY: $googleApiKeyText.val(),
        openaiModelId: $openaiModelSelect.val(),
        bilingualEnabled: $('#bilingual-switch').prop('checked'),
        systemInstruction: $('#system-instruction-select').val(),
        temperature: parseFloat($('#temperature-text').val() as string),
        topP: parseFloat($('#top-p-text').val() as string),
        topK: parseFloat($('#top-k-text').val() as string),
        tone: $('#tone-select').val(),
        domain: $('#domain-select').val(),
        customDictionaryEnabled: $customDictionarySwitch.prop('checked'),
        customDictionary,
        customPromptEnabled: $('#custom-prompt-switch').prop('checked'),
        customPrompt: $('#custom-prompt-textarea').val()
      })
      textareaTranslation.translateText(appendTranslatedTextIntoOutputTextarea).finally(() => {
        $(this).text('Sửa')
        $textareaCopyButton.data('target', 'textareaTranslation')
      })
      break
    }
    case 'Huỷ':
      if (textareaTranslation != null) textareaTranslation.abortController.abort()
      // fallthrough
    case 'Sửa':
      $textareaCopyButton.data('target', `#${$inputTextarea.prop('id') as string}`)
      textareaTranslation = null
      $outputTextarea.text('')
      $outputTextarea.hide()
      $inputTextarea.show()
      $(this).text('Dịch')
  }
})
$inputTextarea.on('input', function () {
  $('#character-count-number').text(($(this).val() as string).length)
})
