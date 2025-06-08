'use strict'
/* global $, confirm, fetch, localStorage, open, Papa, sessionStorage */
import Reader from './Reader.js'
import { DictionaryEntry, Domains, Efforts, MODELS, Options, SystemInstructions, Tones, Translation } from './Translation.js'
import Utils from './Utils.js'
const $addWordButton = $( "#add-word-button" )
const $apiKeyTexts = $( ".api-key-text" )
const $boldTextSwitch = $( "#bold-text-switch" )
const $checkedOptions = $('.checked-option')
const $chutesApiTokenText = $( "#chutes-api-token-text" )
const $copyButtons = $( ".copy-button" )
const $customDictionarySwitch = $( "#custom-dictionary-switch" )
const $defineModal = $( "#define-modal" )
const $deleteButton = $( "#delete-button" )
const $domainSelect = $( "#domain-select" )
const $fontFamilyText = $( "#font-family-text" )
const $fontSizeText = $( "#font-size-text" )
const $geminiApiKeyText = $( "#gemini-api-key-text" )
const $groqApiKeyText = $( "#groq-api-key-text" )
const $inputTextarea = $( "#input-textarea" )
const $justifyTextSwitch = $( "#justify-text-switch" )
const $lineHeightText = $( "#line-height-text" )
const $openrouterApiKeyText = $( "#openrouter-api-key-text" )
const $originalLanguageSelect = $( "#original-language-select" )
const $outputTextarea = $( "#output-textarea" )
const $retranslateButton = $( "#retranslate-button" )
const $sourceText = $( "#source-text" )
const $sourceTextLanguageSelect = $( "#source-text-language-select" )
const $targetTextarea = $( "#target-textarea" )
const $targetTextLanguageSelect = $( "#target-text-language-select" )
const $translateButton = $( "#translate-button" )
const $textLanguageSelects = $( ".text-language-select" )
const $translationTranslators = $( "[data-translation-translator-value]" )
const $translators = $( "[data-translator-value]" )
let customDictionary: DictionaryEntry[] = []
let b2bAuthToken: string | undefined = undefined
let textareaTranslation: Translation | null = null
let dictionaryTranslation: Translation | null = null
function setReaderTheme (readerTheme: string, prevReaderTheme = null): void {
  let $readerTheme = $( "[data-reader-theme-value]" )
  $( document.body ).removeClass( prevReaderTheme ?? $readerTheme.filter( ".active" ).data( "reader-theme-value" ) ).addClass( readerTheme )
  $readerTheme = $readerTheme.filter( `[data-reader-theme-value="${readerTheme}"]` )
  $( document.body ).css( "--reader-font-weight", $readerTheme.data( "reader-theme-font-weight" ) ?? "" )
  $fontFamilyText.val( $readerTheme.data( "reader-theme-font-family" ) ).change()
  $fontSizeText.val( $readerTheme.data( "reader-theme-font-size" ) ).change()
  const lineHeight = $readerTheme.data( "reader-theme-line-height" )
  if (typeof lineHeight === 'string' && lineHeight.startsWith('--')) {
    $lineHeightText.val( 1.6 ).change()
    $( document.body ).css( "--opt-line-height", `var(${lineHeight})` )
    $lineHeightText.attr( "readonly" , "true" )
  } else {
    $lineHeightText.removeAttr( "readonly" )
    $lineHeightText.val( lineHeight ).change()
  }
  $boldTextSwitch.prop( "checked", $readerTheme.data( "reader-theme-bold-text" ) ?? false ).change()
  $justifyTextSwitch.prop( "checked", $readerTheme.data( "reader-theme-justify-text" ) ?? false ).change()
}
function showActiveReaderTheme (readerTheme: string, focus = false): void {
  const $themeSwitcher = $( "#reader-theme" )
  if ($themeSwitcher == null) return
  const $readerThemes = $( "[data-reader-theme-value]" )
  $readerThemes.removeClass( "active" )
  $readerThemes.filter( `[data-reader-theme-value="${readerTheme}"]` ).addClass( "active" )
  if (focus) $themeSwitcher.focus()
}
function showActiveTranslator (translator: string, focus = false): void {
  const $translatorSwitcher = $( "#translator" )
  if ($translatorSwitcher == null) return
  $translators.removeClass( "active" )
  $translators.filter( `[data-translator-value="${translator}"]` ).addClass( "active" )
  if (focus) $translatorSwitcher.focus()
}
function setStoredCustomDictionaryAndReloadCounter (customDictionary: DictionaryEntry[]): void {
  $( "#custom-dictionary-count-number" ).text( customDictionary.length )
  if (customDictionary.length > 0) {
    customDictionary.sort((a, b) => {
      const originalLanguageDifference = a.ori_lang.localeCompare(b.ori_lang)
      if (originalLanguageDifference !== 0) return originalLanguageDifference
      const destinationLanguageDifference = a.des_lang.localeCompare(b.des_lang)
      if (destinationLanguageDifference !== 0) return destinationLanguageDifference
      const wordLengthDifference = a.ori_word.split(/(?:)/u).length - b.ori_word.split(/(?:)/u).length
      if (wordLengthDifference !== 0) return wordLengthDifference
      const destinationWordDifference = a.des_word.localeCompare(b.des_word, 'vi', { ignorePunctuation: true })
      if (destinationWordDifference !== 0) return destinationWordDifference
      return a.ori_word.localeCompare(b.ori_word, 'vi', { ignorePunctuation: true })
    })
    localStorage.setItem('customDictionary', JSON.stringify(customDictionary))
  } else {
    localStorage.removeItem('customDictionary')
  }
}
function appendTranslatedTextIntoOutputTextarea (translatedText: string, text: string, options: Options): void {
  const $outputTextarea = $( "#output-textarea" )
  $outputTextarea.empty()
  if (options.isBilingualEnabled) {
    const translatedLines = translatedText.split('\n')
    text.split('\n').forEach((element, index) => {
      const paragraph = document.createElement('p')
      if (element.replace(/^\s+/, '').length === 0) {
        $( paragraph ).append( document.createElement('br') )
      } else if (/^\p{P}+$/u.test(element)) {
        $( paragraph ).text( translatedLines[index] )
      } else {
        const span = document.createElement('span')
        $( span ).text( element )
        $( span ).on( "dblclick", function () {
          $( "[data-bs-target='#dictionary-modal']").click()
          $sourceText.val( $( this ).text() )
        })
        $( paragraph ).append( span, document.createElement('br'), translatedLines[index] )
      }
      $outputTextarea.append( paragraph )
    })
  } else {
    translatedText.split('\n').forEach(element => {
      const paragraph = document.createElement('p')
      if (element.replace(/^\s+/, '').length === 0) {
        $( paragraph ).append( document.createElement('br') )
      } else {
        $( paragraph ).text( element )
      }
      $outputTextarea.append( paragraph )
    })
  }
}
$( window ).on( "unload", () => {
  Object.keys(localStorage).filter((element) => element.includes('eruda')).forEach((element) => {
    localStorage.removeItem(element)
  })
})
$( document ).ready(() => {
  Reader.loadReaderThemesOptions($( ".reader-theme-toggle .dropdown-menu" ))
  const $readerThemes = $( "[data-reader-theme-value]" )
  const preferredReaderTheme = sessionStorage.getItem('readerTheme') ?? $readerThemes.filter( ".active" ).data( "reader-theme-value" )
  setReaderTheme(preferredReaderTheme)
  showActiveReaderTheme(preferredReaderTheme)
  $readerThemes.on( "click", function () {
    const readerTheme = $( this ).data( "reader-theme-value" )
    setReaderTheme(readerTheme, $readerThemes.filter( ".active" ).data( "reader-theme-value" ))
    showActiveReaderTheme(readerTheme, true)
    sessionStorage.setItem('readerTheme', readerTheme)
  })
  showActiveTranslator(sessionStorage.getItem('translator') ?? $translators.filter( ".active" ).data( "translator-value" ))
  const $modelSelects = $( ".model-select" )
  $modelSelects.each((index, a) => {
    $( a ).empty()
    Object.entries(MODELS[$( a ).prop( "id" ).replace('dictionary-', '').split('-').slice(0, -2).join('_').toUpperCase()]).forEach(([first, second]) => {
      const optgroup = document.createElement('optgroup')
      $( optgroup ).prop( "label", first )
      second.forEach(b => {
        const option = document.createElement('option')
        if (typeof b === 'object') {
          const { modelId, modelName, selected } = b
          if (modelName != null) $( option ).val( modelId )
          $( option ).text( modelName ?? modelId )
          $( option ).prop( "selected", selected )
        } else {
          $( option ).text( b )
        }
        $( optgroup ).append( option )
      })
      $( a ).append( optgroup )
    })
  })
  $('.string-value-option').each((_index, element) => {
    $( element ).val( sessionStorage.getItem(($( element ).prop( "id" ) as string).split('-').slice(0, -1).map((element, index) => index > 0 ? element.charAt(0).toUpperCase() + element.substring(1) : element).join('')) ?? $( element ).val() as string )
  })
  $('.number-value-option').each((_index, element) => {
    $( element ).val( parseFloat(sessionStorage.getItem(($( element ).prop( "id" ) as string).split('-').slice(0, -1).map((element, index) => index > 0 ? element.charAt(0).toUpperCase() + element.substring(1) : element).join('')) ?? $( element ).val() as string) )
  })
  $checkedOptions.each((_index, element) => {
    $( element ).prop( "checked", sessionStorage.getItem(($( element ).prop( "id" ) as string).split('-').slice(0, -1).map((element, index) => index > 0 ? element.charAt(0).toUpperCase() + element.substring(1) : element).join('')) ?? $( element ).prop( "checked" ) )
  })
  $apiKeyTexts.each((index, element) => {
    $( element ).val( localStorage.getItem($( element ).prop( "id" ).split('-').slice(0, -1).join('_').toUpperCase()) ?? "" )
  })
  customDictionary = JSON.parse(localStorage.getItem('customDictionary') ?? '[]')
  setStoredCustomDictionaryAndReloadCounter(customDictionary)
  fetch(`${Utils.CORS_HEADER_PROXY}https://lingvanex.com/lingvanex_demo_page/js/api-base.js`).then(value => value.text()).then(value => {
    b2bAuthToken = value.match(/B2B_AUTH_TOKEN="([^"]+)"/)?.[1]
  }).catch(() => {
    if ($originalLanguageSelect.val() === 'null') $originalLanguageSelect.val( "en" )
    $originalLanguageSelect.find( "option[value='null']" ).remove()
  })
})
$( document ).on( "keydown", (event) => {
  if (event.altKey) {
    if (event.keyCode === 37) event.preventDefault()
    if (event.keyCode === 39) event.preventDefault()
  }
})
$fontFamilyText.on( "change", function () {
  const fontFamily = Reader.fontMapper($( this ).val() as string)
  $( this ).val( fontFamily )
  $( document.body ).css( "--reader-font-family", Reader.getCssFontFamily(fontFamily) )
})
$fontSizeText.on( "change", function () {
  const raw = $( this ).val() as string
  const parsed = parseFloat(raw.length === 0 ? $( this ).attr( "value" ) as string : raw)
  const value = Utils.clamp(parsed, $( this ).prop( "min" ), $( this ).prop( "max" ))
  $( this ).val( value )
  $( document.body ).css( "--reader-font-size", value === 1 ? "" : `${value}em` )
})
$lineHeightText.on( "change", function () {
  const raw = $( this ).val() as string
  const parsed = parseFloat(raw.length === 0 ? $( this ).attr( "value" ) as string : raw)
  const value = Utils.clamp(parsed, $( this ).prop( "min" ), $( this ).prop( "max" ))
  $( this ).val( value )
  $( document.body ).css( "--reader-line-height", value === 1.2 ? "" : `${value}em` )
})
$boldTextSwitch.on( "change", function () {
  if ($( this ).prop( "checked" ) as boolean) $( ".textarea" ).addClass( "bold-text" )
  else $( ".textarea" ).removeClass( "bold-text" )
})
$justifyTextSwitch.on( "change", function () {
  $( document.body ).css( "--reader-text-align", $( this ).prop( "checked" ) as boolean ? "justify" : "" )
})
$translators.on( "click", function () {
  const translator = $( this ).data( "translator-value" )
  showActiveTranslator(translator, true)
  sessionStorage.setItem('translator', translator)
})
$( ".value-option" ).on( "change", function () {
  sessionStorage.setItem(($( this ).prop( "id" ) as string).split('-').slice(0, -1).map((element, index) => index > 0 ? element.charAt(0).toUpperCase() + element.substring(1) : element).join(''), $( this ).val() as string )
})
$checkedOptions.on( "change", function () {
  sessionStorage.setItem(($( this ).prop( "id" ) as string).split('-').slice(0, -1).map((element, index) => index > 0 ? element.charAt(0).toUpperCase() + element.substring(1) : element).join(''), $( this ).prop( "checked" ))
})
$apiKeyTexts.on( "change", function () {
  localStorage.setItem($( this ).prop( "id" ).split('-').slice(0, -1).join('_').toUpperCase(), $( this ).val() as string)
})
$domainSelect.on( "change", function () {
  $( `#dictionary-${$( this ).prop( "id" )}` ).val( $( this ).val() as string ).change()
})
$( "#dictionary-modal" ).on( "hide.bs.modal", () => {
  if (dictionaryTranslation != null) dictionaryTranslation.abortController.abort()
  $( "#source-text, #target-textarea" ).val( "" ).prop( "readOnly", false )
  $textLanguageSelects.prop( "disabled", false )
  $( "[data-translation-translator-value], .text-language-select, #add-word-button, #delete-button" ).removeClass( "disabled" )
})
$( "#custom-dictionary-input" ).on( "change", function () {
  // @ts-expect-error Papaparse
  Papa.parse($( this ).prop( "files" )[0], {
    header: true,
    skipEmptyLines: true,
    complete: (results: { data: Record<string, string>[] }) => {
      customDictionary = results.data.map(a => {
        const COLUMN_NAME_MAP: Record<string, keyof DictionaryEntry> = {
          'Original language': 'ori_lang',
          'Destination language': 'des_lang',
          'Original word': 'ori_word',
          'Destination word': 'des_word'
        }
        const row: DictionaryEntry = { ori_lang: '', des_lang: '', ori_word: '', des_word: '' }
        Object.keys(COLUMN_NAME_MAP).forEach(b => {
          row[COLUMN_NAME_MAP[b]] = a[b]
        })
        return row
      })
      setStoredCustomDictionaryAndReloadCounter(customDictionary)
      $sourceText.trigger( "input" )
      $( this ).val( "" )
    }
  })
})
$( "#delete-all-button" ).on( "click", function () {
  if (!confirm('Bạn có chắc chắn muốn xoá tất cả từ trong từ điển?')) return
  customDictionary = []
  setStoredCustomDictionaryAndReloadCounter(customDictionary)
})
$translationTranslators.on( "click", function () {
  const sourceText = $sourceText.val() as string
  if (sourceText.length === 0) return
  const previousTargetText = $targetTextarea.val() as string
  $textLanguageSelects.prop( "disabled", true )
  $targetTextarea.val( "Đang dịch..." )
  $( "#source-text, #target-textarea" ).prop( "readOnly", true )
  $( "[data-translation-translator-value], #add-word-button, #delete-button" ).addClass( "disabled" )
  dictionaryTranslation = new Translation(sourceText, $targetTextLanguageSelect.val() as string, $sourceTextLanguageSelect.val() as string || null, {
    GEMINI_API_KEY: $geminiApiKeyText.val() as string,
    GROQ_API_KEY: $groqApiKeyText.val() as string,
    CHUTES_API_TOKEN: $chutesApiTokenText.val() as string,
    OPENROUTER_API_KEY: $openrouterApiKeyText.val() as string,
    TVLY_API_KEY: $( "#tvly-api-key-text" ).val() as string,
    isCustomDictionaryEnabled: $customDictionarySwitch.prop( "checked" ),
    translatorId: $( this ).data( "translation-translator-value" ),
    googleGenaiModelId: $( "#dictionary-google-genai-model-select" ).val() as string,
    isThinkingModeEnabled: $( "#dictionary-thinking-mode-switch" ).prop( "checked" ),
    isGroundingWithGoogleSearchEnabled: $( "#grounding-with-google-search-switch" ).prop( "checked" ),
    openaiModelId: $( "#dictionary-openai-model-select" ).val() as string,
    effort: $( "#dictionary-effort-select" ).val() as Efforts,
    isOpenaiWebSearchEnabled: $( "#openai-web-search-switch" ).prop( "checked" ),
    groqModelId: $( "#dictionary-groq-model-select" ).val() as string,
    isGroqWebSearchEnabled: $( "#groq-web-search-switch" ).prop( "checked" ),
    chutesModelId: $( "#dictionary-chutes-model-text" ).val() as string,
    isChutesWebSearchEnabled: $( "#chutes-web-search-switch" ).prop( "checked" ),
    openrouterModelId: $( "#dictionary-openrouter-model-text" ).val() as string,
    isOpenrouterWebSearchEnabled: $( "#openrouter-web-search-switch" ).prop( "checked" ),
    systemInstruction: $( "#dictionary-system-instruction-select" ).val() as SystemInstructions,
    temperature: parseFloat($( "#dictionary-temperature-text" ).val() as string),
    topP: parseFloat($( "#dictionary-top-p-text" ).val() as string),
    topK: parseFloat($( "#dictionary-top-k-text" ).val() as string),
    tone: $( "#dictionary-tone-select" ).val() as Tones,
    domain: $( `#dictionary-${$domainSelect.prop( "id" )}` ).val() as Domains,
    customDictionary,
    isCustomPromptEnabled: $( "#dictionary-custom-prompt-switch" ).prop( "checked" ),
    customPrompt: $( "#dictionary-custom-prompt-textarea" ).val() as string
  })
  dictionaryTranslation.translateText(translatedText => {
    $targetTextarea.val( translatedText ).trigger( "input" )
  }).catch(() => {
    if (!((textareaTranslation as Translation).abortController.signal.aborted as boolean)) $targetTextarea.val( previousTargetText )
  }).finally(() => {
    $( "#source-text, #target-textarea" ).prop( "readOnly", false )
    $textLanguageSelects.prop( "disabled", false )
    $( "[data-translation-translator-value], .text-language-select, #add-word-button, #delete-button" ).removeClass( "disabled" )
  })
})
$( "[data-define-url]" ).on( "click", function () {
  const sourceText = $sourceText.val() as string
  if (sourceText.length === 0) return
  const method = $( this ).data( "define-method" ) ?? 'showInModal'
  const url = `${method.endsWith('WithCorsProxy') ? Utils.CORS_HEADER_PROXY : ''}${$( this ).data( "define-url" ).replace('%l', ($sourceTextLanguageSelect.val() as string).split('-')[0]).replace('%s', sourceText)}`
  switch (method) {
    case 'openInNewWindow':
      open(url, '_blank', 'width=1000,height=577')
      break
    case 'showInModalWithCorsProxy':
    case 'showInModal':
    default: {
      // @ts-expect-error $().modal()
      $defineModal.modal( "show" )
      $defineModal.find( "iframe" ).prop( "contentWindow" ).location.replace(url)
    }
  }
})
$textLanguageSelects.on( "change", () => {
  $sourceText.trigger( "input" )
})
$sourceText.on( "input", function () {
  $targetTextarea.val( customDictionary.find(({ ori_lang, des_lang, ori_word }) => ori_lang === $sourceTextLanguageSelect.val() && des_lang === $targetTextLanguageSelect.val() && ori_word === $( this ).val())?.des_word ?? $targetTextarea.val() as string ) // eslint-disable-line camelcase
})
$targetTextarea.on( "input", function () {
  $( this ).val( ($( this ).val() as string).replace(/\n/g, ' ') )
})
$addWordButton.on( "click", () => {
  const originalLanguage = $sourceTextLanguageSelect.val() as string
  const destinationLanguage = $targetTextLanguageSelect.val() as string
  const originalWord = $sourceText.val() as string
  const destinationWord = $targetTextarea.val() as string
  if (originalWord.length === 0 || destinationWord.length === 0) return
  const wordIndex = customDictionary.findIndex(({ ori_lang, des_lang, ori_word }) => ori_lang === originalLanguage && des_lang === destinationLanguage && ori_word === originalWord) // eslint-disable-line camelcase
  if (wordIndex !== -1) customDictionary.splice(wordIndex, 1)
  customDictionary.push({
    ori_lang: originalLanguage,
    des_lang: destinationLanguage,
    ori_word: originalWord,
    des_word: destinationWord
  })
  $( "#source-text, #target-textarea" ).val( "" )
  setStoredCustomDictionaryAndReloadCounter(customDictionary)
})
$deleteButton.on( "click", () => {
  const wordIndex = customDictionary.findIndex(({ ori_lang, des_lang, ori_word }) => ori_lang === $sourceTextLanguageSelect.val() && des_lang === $targetTextLanguageSelect.val() && ori_word === $sourceText.val()) // eslint-disable-line camelcase
  if (wordIndex === -1 || !confirm('Bạn có chắc chắn muốn xoá từ này?')) return
  customDictionary.splice(wordIndex, 1)
  setStoredCustomDictionaryAndReloadCounter(customDictionary)
})
$( "#copy-csv-button" ).on( "click", () => {
  /* eslint-disable-next-line no-void */
  void (async function () {
    try {
      // @ts-expect-error Papaparse
      await navigator.clipboard.writeText(Papa.unparse(customDictionary.map(a => {
        const COLUMN_NAME_MAP: Record<string, string> = {
          ori_lang: 'Original language',
          ori_word: 'Original word',
          des_lang: 'Destination language',
          des_word: 'Destination word'
        }
        const row: Record<string, string> = {}
        Object.keys(COLUMN_NAME_MAP).forEach(b => {
          row[COLUMN_NAME_MAP[b]] = a[b as keyof DictionaryEntry]
        })
        return row
      })))
    } catch {
      // continue regardless of error
    }
  }())
})
$defineModal.on( "hide.bs.modal", () => {
  const iframe = document.createElement('iframe')
  $( iframe ).addClass(['position-absolute', 'start-50', 'top-50', 'translate-middle'])
  $( iframe ).prop( "allowfullscreen", true )
  $( iframe ).prop( "height", 390 )
  $( iframe ).prop( "sandbox", "allow-same-origin allow-scripts" )
  $( iframe ).prop( "src", 'about:blank' )
  $( iframe ).prop( "width", "100%" )
  $defineModal.find( "iframe" ).replaceWith( $( iframe ).prop( "outerHTML") )
})
$copyButtons.on( "click", function () {
  const target = $( this ).data( "target" )
  const $target = $( target )
  let targetContent = ''
  if ($target.length > 0) targetContent = $target.val()
  else if (target === 'textareaTranslation' && textareaTranslation != null) targetContent = textareaTranslation.translatedText
  /* eslint-disable-next-line no-void */
  void (async function () {
    try {
      await navigator.clipboard.writeText(targetContent)
    } catch {
      // continue regardless of error
    }
  }())
})
$( ".paste-button" ).on( "click", function () {
  const $target = $( $( this ).data( "target" ) )
  if ($target.length === 0) return
  /* eslint-disable-next-line no-void */
  void navigator.clipboard.readText().then(value => {
    if ($target.val().length === 0 || ($target.val() !== value && confirm('Bạn có chắc chắn muốn thay thế văn bản hiện tại?'))) {
      $target.val( value ).trigger( "input" )
      if ($target.prop( "id" ) === $inputTextarea.prop( "id" ) && $translateButton.text() === 'Sửa') $translateButton.click().click()
    }
  })
})
$retranslateButton.on( "click", () => {
  if (confirm('Bạn có chắc chắn muốn dịch lại?')) $translateButton.click().click()
})
$( ".language-select" ).on( "change", function () {
  const $textLanguageSelect = $textLanguageSelects.filter( `#${$( this ).prop( "id" ).replace('original', 'source-text').replace('destination', 'target-text')}` )
  const value = $( this ).val() as string
  $textLanguageSelect.val( value !== 'null' ? value : $textLanguageSelect.val() as string ).change()
})
$translateButton.on( "click", function () {
  const $textareaCopyButton = $copyButtons.filter( `[data-target="#${$inputTextarea.prop( "id" ) as string}"]` )
  switch ($( this ).text()) {
    case 'Dịch': {
      const inputText = $inputTextarea.val() as string
      if (inputText.length === 0) break
      $outputTextarea.text( "Đang dịch..." )
      $inputTextarea.hide()
      $outputTextarea.show()
      $( this ).text( "Huỷ" )
      textareaTranslation = new Translation(inputText, $( "#destination-language-select" ).val() as string, $originalLanguageSelect.val() as string | null, {
        translatorId: $translators.filter( ".active" ).data( "translator-value" ),
        googleGenaiModelId: $( "#google-genai-model-select" ).val() as string,
        isThinkingModeEnabled: $( "#thinking-mode-switch" ).prop( "checked" ),
        GEMINI_API_KEY: $geminiApiKeyText.val() as string,
        openaiModelId: $( "#openai-model-select" ).val() as string,
        effort: $( "#effort-select" ).val() as Efforts,
        groqModelId: $( "#groq-model-select" ).val() as string,
        GROQ_API_KEY: $groqApiKeyText.val() as string,
        chutesModelId: $( "#chutes-model-text" ).val() as string,
        CHUTES_API_TOKEN: $chutesApiTokenText.val() as string,
        openrouterModelId: $( "#openrouter-model-text" ).val() as string,
        OPENROUTER_API_KEY: $openrouterApiKeyText.val() as string,
        isBilingualEnabled: $( "#bilingual-switch" ).prop( "checked" ),
        systemInstruction: $( "#system-instruction-select" ).val() as SystemInstructions,
        temperature: parseFloat($( "#temperature-text" ).val() as string),
        topP: parseFloat($( "#top-p-text" ).val() as string),
        topK: parseFloat($( "#top-k-text" ).val() as string),
        tone: $( "#tone-select" ).val() as Tones,
        domain: $domainSelect.val() as Domains,
        customDictionary,
        isCustomPromptEnabled: $( "#custom-prompt-switch" ).prop( "checked" ),
        customPrompt: $( "#custom-prompt-textarea" ).val() as string,
        isCustomDictionaryEnabled: $customDictionarySwitch.prop( "checked" ),
        B2B_AUTH_TOKEN: b2bAuthToken
      })
      textareaTranslation.translateText(appendTranslatedTextIntoOutputTextarea).catch(reason => {
        if ((textareaTranslation as Translation).abortController.signal.aborted as boolean) return
        console.error(reason)
        $outputTextarea.text( reason )
      }).finally(() => {
        sessionStorage.setItem('responseText', (textareaTranslation as Translation).responseText)
        if ((textareaTranslation as Translation).abortController.signal.aborted as boolean) return
        $( this ).text( "Sửa" )
        $textareaCopyButton.data( "target", "textareaTranslation" )
        $retranslateButton.removeClass( "disabled" )
      })
      break
    }
    case 'Huỷ':
      if (textareaTranslation != null) textareaTranslation.abortController.abort()
      // fallthrough
    case 'Sửa':
      $outputTextarea.text( "" )
      $outputTextarea.hide()
      $inputTextarea.show()
      $textareaCopyButton.data( "target", `#${$inputTextarea.prop( "id" ) as string}` )
      $( this ).text( "Dịch" )
      $retranslateButton.addClass( "disabled" )
  }
})
$inputTextarea.on( "input", function () {
  $( "#character-count-number" ).text( ($( this ).val() as string).length )
})