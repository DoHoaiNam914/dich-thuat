'use strict'
/* global $ */
const THEMES: Array<{ [key: string]: any }> = [
  {
    name: 'Bootstrap 5',
    value: 'bg-body',
    active: true
  },
  {
    title: 'Amazon Kindle',
    themes: [
      {
        name: 'White',
        fontFamily: 'Bookerly',
        fontSize: 1.09375,
        value: 'com-amazon-kindle-white',
        lineHeight: 1.55,
        justifyText: true
      },
      {
        name: 'White (Japan)',
        fontFamily: 'Hiragino Mincho ProN',
        fontSize: 1.09375,
        value: 'jp-co-amazon-kindle-white',
        lineHeight: 1.55
      },
      {
        name: 'Sepia',
        fontFamily: 'Bookerly',
        fontSize: 1.09375,
        value: 'com-amazon-kindle-sepia',
        lineHeight: 1.55,
        justifyText: true
      },
      {
        name: 'Sepia (Japan)',
        fontFamily: 'Hiragino Mincho ProN',
        fontSize: 1.09375,
        value: 'jp-co-amazon-kindle-sepia',
        lineHeight: 1.55
      },
      {
        name: 'Green',
        fontFamily: 'Bookerly',
        fontSize: 1.09375,
        value: 'com-amazon-kindle-green',
        lineHeight: 1.55,
        justifyText: true
      },
      {
        name: 'Green (Japan)',
        fontFamily: 'Hiragino Mincho ProN',
        fontSize: 1.09375,
        value: 'jp-co-amazon-kindle-green',
        lineHeight: 1.55
      },
      {
        name: 'Black',
        fontFamily: 'Bookerly',
        fontSize: 1.09375,
        value: 'com-amazon-kindle-black',
        lineHeight: 1.55,
        justifyText: true
      },
      {
        name: 'Black (Japan)',
        fontFamily: 'Hiragino Mincho ProN',
        fontSize: 1.09375,
        value: 'jp-co-amazon-kindle-black',
        lineHeight: 1.55
      }
    ]
  },
  {
    title: 'Apple Sách',
    fontSize: 1,
    boldText: false,
    themes: [
      {
        name: 'Nguyên bản',
        value: 'apple-books-original',
        fontFamily: 'New York'
      },
      {
        name: 'Yên tĩnh',
        fontSize: 1.125,
        value: 'apple-books-quiet',
        fontFamily: 'Publico Text, New York',
        fontWeight: 300,
        lineHeight: 1.4,
        justifyText: true
      },
      {
        name: 'Giấy',
        fontSize: 1.25,
        value: 'apple-books-paper',
        fontFamily: 'Charter, New York',
        fontWeight: 300,
        lineHeight: 1.55,
        justifyText: false
      },
      {
        name: 'Đậm',
        fontSize: 1.28125,
        value: 'apple-books-bold',
        fontFamily: 'San Francisco, New York',
        fontWeight: 300,
        boldText: true,
        lineHeight: 1.5,
        justifyText: false
      },
      {
        name: 'Êm dịu',
        fontSize: 1.25,
        value: 'apple-books-calm',
        fontFamily: 'Canela Text, New York',
        fontWeight: 300,
        lineHeight: 1.55,
        justifyText: false
      },
      {
        name: 'Tập trung',
        fontSize: 1.125,
        value: 'apple-books-focus',
        fontFamily: 'Proxima Nova, New York',
        fontWeight: 300,
        lineHeight: 1.4,
        justifyText: true
      }
    ]
  }
]
const FONT_MAP = Object.entries({
  'Phông chữ Bootstrap 5 sans serif': '--bs-font-sans-serif',
  'Phông chữ Bootstrap 5 monospace': '--bs-font-monospace',

  /* Các phông chữ của Readium */
  'Họ phông chữ hệ thống': '--system-font-family',
  'Kiểu chữ kiểu cũ': '--oldStyleTf',
  'Kiểu chữ hiện đại': '--modernTf',
  'Kiểu chữ sans': '--sansTf',
  'Kiểu chữ nhân văn': '--humanistTf',
  'Kiểu chữ monospace': '--monospaceTf',
  'Họ phông chữ Nhật Bản': '--japaneseFontFamily',
  'Serif Nhật': '--serif-ja',
  'Sans serif Nhật': '--sans-serif-ja',
  'Serif Nhật dọc': '--serif-ja-v',
  'Sans serif Nhật dọc': '--sans-serif-ja-v',
  'Họ phông chữ Trung Hoa': '--chineseFontFamily',
  'Họ phông chữ Đài Loan': '--taiwanFontFamily',

  /* Các phông chữ của Waka */
  Bookerly: 'bookerly',
  'Minion Pro': 'minion pro',
  'Noto Serif': 'Noto Serif',
  Roboto: 'Roboto-woff2',
  'SVN-Times New Roman': 'svn-times new roman',
  Quicksand: 'quicksand',
  'iCiel Domaine Text': 'iciel domaine text',
  'P22 Typewriter': 'p22 typewriter',
  'SVN-Helvetica Neue': 'svn-helvetica neue',
  'Trixi Pro': 'trixi pro',

  /* Các phông chữ của Google Play Sách */
  Helvetica: 'helvetica-ttf',
  Verdana: 'verdana',
  Literata: 'literata',
  Baskerville: 'baskerville-ttf',
  Cochin: 'cochin-ttc',
  Palatino: 'palatino-ttc',
  Times: 'times-ttc',

  /* Các phông chữ của Rakuten Kobo */
  Avenir: 'avenir-ttc',
  Georgia: 'georgia',
  OpenDyslexic: 'opendyslexic',
  Optima: 'optima-ttc',
  'Trebuchet MS': 'trebuchet ms',

  /* Các phông chữ của Apple Sách */
  // Athelas: 'athelas-ttc',
  // 'Avenir Next': 'avenir next-ttc',
  'Canela Text': 'canela text',
  Charter: 'charter-ttc',
  'Iowan Old Style': 'iowan old style-ttc',
  'San Francisco': 'sf pro text',
  'Proxima Nova': 'proxima nova',
  'Publico Text': 'publico text',
  'New York': 'new york small',
  // Seravek: 'seravek-ttc',
  'Times New Roman': 'times new roman',

  'Apple SD Gothic Neo': 'apple sd gothic neo-otf',
  'Atkinson Hyperlegible': 'Atkinson Hyperlegible',
  'A-OTF Ryumin Pr5': 'a-otf ryumin pr5',
  // Calibri: 'calibri-ttf',
  // 'Comic Sans': 'comic sans-ttf',
  // 'Comic Sans MS': 'comic sans ms-ttf',
  // Courier: 'courier-ttf',
  'Crimson Text': 'Crimson Text',
  FiraSans: 'FiraSans',
  HiraginoMin: 'hiraginomin',
  'Hiragino Mincho Pro': 'hiragino mincho pro-otf',
  'Hiragino Mincho ProN': 'hiragino mincho pron-otf',
  'Hiragino Sans': 'hiragino sans-otf',
  Lora: 'Lora',
  'PingFang SC': 'pingfang sc-ttc',
  'PingFang TC': 'pingfang tc-ttc',
  'new-york': 'new-york',
  // Sitka: 'sitka-ttf',
  'Songti SC': 'songti sc-ttc',
  'Songti TC': 'songti tc-ttc',
  STBShusong: 'stbshusong',
  'STSong TC': 'stsong tc',
  TBMincho: 'tbmincho',
  Thonburi: 'thonburi-ttf'
})
function setThemeValue (theme, $dropdownItem, valueKey): void {
  const value = theme.themes?.[valueKey] ?? theme[valueKey]
  switch (valueKey) {
    case 'active':
      if (value as boolean) $dropdownItem.addClass('active')
      break
    case 'boldText':
      $dropdownItem.attr('data-reader-theme-bold-text', value)
      break
    case 'fontFamily':
      $dropdownItem.attr('data-reader-theme-font-family', value)
      break
    case 'fontSize':
      $dropdownItem.attr('data-reader-theme-font-size', value)
      break
    case 'fontWeight':
      $dropdownItem.attr('data-reader-theme-font-weight', value)
      break
    case 'justifyText':
      $dropdownItem.attr('data-reader-theme-justify-text', value)
      break
    case 'lineHeight':
      $dropdownItem.attr('data-reader-theme-line-height', value)
      break
    case 'value':
      $dropdownItem.attr('data-reader-theme-value', value)
  }
}
function loadReaderThemesOptions (): void {
  const unorderedList = document.createElement('ul')
  THEMES.forEach(a => {
    const listItem = document.createElement('li')
    if (Object.hasOwn(a, 'title') && Object.hasOwn(a, 'themes')) {
      const dropdownHeader = document.createElement('h6')
      $(dropdownHeader).addClass(['align-items-center', 'd-flex', 'dropdown-header'])
      $(dropdownHeader).text(a.title)
      $(listItem).append(dropdownHeader)
      $(unorderedList).append(listItem.cloneNode(true) as HTMLLIElement)
      $(listItem).empty()
      a.themes.forEach(b => {
        const dropdownItem = document.createElement('button')
        const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg')
        const use = document.createElementNS('http://www.w3.org/2000/svg', 'use')
        $(dropdownItem).addClass(['align-items-center', 'd-flex', 'dropdown-item'])
        $(dropdownItem).prop('type', 'button')
        $(dropdownItem).text(b.name)
        $(svg).addClass(['bi', 'd-none', 'ms-auto'])
        use.setAttributeNS('http://www.w3.org/2000/svg', 'href', '#check2')
        $(svg).append(use)
        dropdownItem.innerHTML += `\n${svg.outerHTML}`
        ;[...Object.keys(a), ...Object.keys(b)].filter(c => c !== 'title' && c !== 'themes' && c !== 'name').forEach(c => {
          setThemeValue({ ...a, themes: b }, $(dropdownItem), c)
        })
        $(listItem).append(dropdownItem)
        $(unorderedList).append(listItem.cloneNode(true) as HTMLLIElement)
        $(listItem).empty()
      })
    } else if (Object.hasOwn(a, 'name') && Object.hasOwn(a, 'value')) {
      const dropdownItem = document.createElement('button')
      const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg')
      const use = document.createElementNS('http://www.w3.org/2000/svg', 'use')
      $(dropdownItem).addClass(['align-items-center', 'd-flex', 'dropdown-item'])
      $(dropdownItem).prop('type', 'button')
      $(dropdownItem).text(a.name)
      $(svg).addClass(['bi', 'd-none', 'ms-auto'])
      use.setAttributeNS('http://www.w3.org/2000/svg', 'href', '#check2')
      $(svg).append(use)
      dropdownItem.innerHTML += `\n${svg.outerHTML}`
      Object.keys(a).filter(b => b !== 'name').forEach(c => {
        setThemeValue(a, $(dropdownItem), c)
      })
      $(listItem).append(dropdownItem)
      $(unorderedList).append(listItem.cloneNode(true) as HTMLLIElement)
      $(listItem).empty()
    }
  })
  $('.reader-theme-toggle .dropdown-menu').html(unorderedList.innerHTML)
}
function fontMapper (fontFamily): string {
  return fontFamily?.replaceAll(/['"]/g, '').split(/, */).filter(element => element.length > 0).map(element => element.length >= 3 && FONT_MAP.some(([first, second]) => first === element || second === element) ? FONT_MAP.find(([first, second]) => first === element || second === element)?.[1] : element).join(', ')
}
function getPreferredReaderTheme (): string {
  return window.localStorage.getItem('readerTheme') ?? THEMES[0].value
}
function setReaderTheme (readerTheme: string, prevReaderTheme = null): void {
  $(document.body).removeClass(prevReaderTheme ?? getPreferredReaderTheme())
  $(document.body).addClass(readerTheme)
  const $readerTheme = $(`[data-reader-theme-value="${readerTheme}"]`)
  const fontFamily = $readerTheme.data('reader-theme-font-family')
  const $fontFamilyText = $('#font-family-text')
  if (fontFamily != null && ($('#font-family-text').val() as string).length === 0) $fontFamilyText.val(fontFamily).change()
  $('#font-size-text').val($readerTheme.data('reader-theme-font-size') ?? 1).change()
  const lineHeight = $readerTheme.data('reader-theme-line-height')
  const $lineHeightText = $('#line-height-text')
  if (typeof lineHeight === 'string' && lineHeight.startsWith('--')) {
    $lineHeightText.val(1.6).change()
    $(document.body).css('--opt-line-height', `var(${lineHeight})`)
    $lineHeightText.attr('readonly', 'true')
  } else {
    $lineHeightText.removeAttr('readonly')
    $lineHeightText.val(lineHeight ?? 1.2).change()
  }
  $('#bold-text-switch').prop('checked', $readerTheme.data('reader-theme-bold-text')).change()
  $('#justify-text-switch').prop('checked', $readerTheme.data('reader-theme-justify-text')).change()
}
function showActiveReaderTheme (readerTheme: string, focus = false): void {
  const $themeSwitcher = $('#reader-theme')
  if ($themeSwitcher == null) return
  const $readerThemes = $('[data-reader-theme-value]')
  $readerThemes.removeClass('active')
  $readerThemes.filter(`[data-reader-theme-value="${readerTheme}"]`).addClass('active')
  if (focus) $themeSwitcher.focus()
}
export { loadReaderThemesOptions, fontMapper, getPreferredReaderTheme, setReaderTheme, showActiveReaderTheme }
