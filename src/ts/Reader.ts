'use strict'
/* global $ */
import Utils from './Utils.js'
interface Theme {
  active?: boolean
  boldText?: boolean
  fontFamily?: string
  fontSize?: number
  fontWeight?: number
  justifyText?: boolean
  lineHeight?: number
  name: string
  value: string
}
interface ThemeGroup {
  boldText?: boolean
  fontFamily?: string
  fontSize?: number
  fontWeight?: number
  justifyText?: boolean
  lineHeight?: number
  themes: Theme[]
  title: string
}
type ThemeItem = ThemeGroup | Theme
export default class Reader {
  public static readonly THEMES: ThemeItem[] = [
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
  public static readonly FONT_MAP: string[][] = Object.entries({
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
    Bookerly: 'Bookerly',
    'Minion Pro': 'Minion Pro',
    'Noto Serif': 'Noto Serif',
    Roboto: 'Roboto-ttf',
    'SVN-Times New Roman': 'SVN-Times New Roman',
    Quicksand: 'Quicksand',
    'iCiel Domaine Text': 'iCiel Domaine Text',
    'P22 Typewriter': 'P22 Typewriter',
    'SVN-Helvetica Neue': 'SVN-Helvetica Neue',
    'Trixi Pro': 'Trixi Pro',

    /* Các phông chữ của Google Play Sách */
    Helvetica: 'Helvetica-ttf',
    Verdana: 'Verdana',
    Literata: 'Literata',
    Baskerville: 'Baskerville-ttf',
    Cochin: 'Cochin-ttc',
    Palatino: 'Palatino-ttc',
    Times: 'Times-ttc',

    /* Các phông chữ của Rakuten Kobo */
    Avenir: 'Avenir-ttc',
    Georgia: 'Georgia',
    OpenDyslexic: 'OpenDyslexic',
    Optima: 'Optima-ttc',
    'Trebuchet MS': 'Trebuchet MS',

    /* Các phông chữ của Apple Sách */
    // Athelas: 'Athelas-ttc',
    // 'Avenir Next': 'Avenir Next-ttc',
    'Canela Text': 'Canela Text',
    Charter: 'Charter-ttc',
    'Iowan Old Style': 'Iowan Old Style-ttc',
    'San Francisco': 'SF Pro Text',
    'Proxima Nova': 'Proxima Nova',
    'Publico Text': 'Publico Text',
    'New York': 'New York Small',
    // Seravek: 'Seravek-ttc',
    'Times New Roman': 'Times New Roman',

    /* Khác */
    'Amazon Ember': 'Amazon Ember',
    'Apple SD Gothic Neo': 'Apple SD Gothic Neo-otf',
    'Atkinson Hyperlegible': 'Atkinson Hyperlegible',
    'A-OTF Ryumin Pr5': 'A-OTF Ryumin Pr5',
    // Calibri: 'Calibri-ttf',
    // 'Comic Sans': 'Comic Sans-ttf',
    // 'Comic Sans MS': 'Comic Sans MS-ttf',
    // Courier: 'courier-ttf',
    'Crimson Text': 'Crimson Text',
    FiraSans: 'FiraSans',
    HiraginoMin: 'HiraginoMin',
    'Hiragino Mincho Pro': 'Hiragino Mincho Pro-otf',
    'Hiragino Mincho ProN': 'Hiragino Mincho ProN-otf',
    'Hiragino Sans': 'Hiragino Sans-otf',
    Lora: 'Lora',
    'new-york': 'new-york',
    'PingFang SC': 'PingFang SC-ttc',
    'PingFang TC': 'PingFang TC-ttc',
    // Sitka: 'Sitka-ttf',
    'Songti SC': 'Songti SC-ttc',
    'Songti TC': 'Songti TC-ttc',
    STBShusong: 'STBShusong',
    'STSong TC': 'STSong TC',
    TBMincho: 'TBMincho',
    Thonburi: 'Thonburi-ttf'
  })
  public static getCssFontFamily (fontFamily: string): string {
    return fontFamily.split(', ').map((element: string) => element.includes(' ') ? `'${element}'` : (element.startsWith('--') ? `var(${element})` : element)).join(', ')
  }
  private static setThemeValue (theme: Theme, $dropdownItem: JQuery<HTMLButtonElement>, valueKey: keyof Theme): void {
    const value = theme[valueKey]
    switch (valueKey) {
      case 'active':
        if (value) $dropdownItem.addClass( "active" )
        break
      case 'boldText':
        $dropdownItem.attr( "data-reader-theme-bold-text", String(value) )
        $dropdownItem.css( "font-weight", "bold" )
        break
      case 'fontFamily':
        $dropdownItem.attr( "data-reader-theme-font-family", value as string )
        $dropdownItem.css( "font-family", Reader.getCssFontFamily(Reader.fontMapper(value as string)) )
        break
      case 'fontSize':
        $dropdownItem.attr( "data-reader-theme-font-size", value as number )
        break
      case 'fontWeight':
        $dropdownItem.attr( "data-reader-theme-font-weight", value as number )
        if ($dropdownItem.css( "font-weight" ) !== "bold") $dropdownItem.css( "font-weight", value as number )
        break
      case 'justifyText':
        $dropdownItem.attr( "data-reader-theme-justify-text", value as string )
        break
      case 'lineHeight':
        $dropdownItem.attr( "data-reader-theme-line-height", value as number )
        break
      case 'value':
        $dropdownItem.attr( "data-reader-theme-value", value as string )
    }
  }
  public static loadReaderThemesOptions ($dropdownMenu: JQuery<HTMLDivElement>): void {
    const unorderedList = document.createElement('ul')
    Reader.THEMES.forEach((a: ThemeItem) => {
      const listItem = document.createElement('li')
      if (Utils.has.call(a, 'title') && Utils.has.call(a, 'themes')) {
        const dropdownHeader = document.createElement('h6')
        const themeGroup = a as ThemeGroup
        $( dropdownHeader ).addClass( ['align-items-center', 'd-flex', 'dropdown-header'] )
        $( dropdownHeader ).text( themeGroup.title )
        $( listItem ).append( dropdownHeader )
        $( unorderedList ).append( listItem.cloneNode(true) as HTMLLIElement )
        $( listItem ).empty()
        themeGroup.themes.forEach((b: Theme) => {
          const dropdownItem = document.createElement('button')
          const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg')
          const use = document.createElementNS('http://www.w3.org/2000/svg', 'use')
          $( dropdownItem ).addClass( ['align-items-center', 'd-flex', 'dropdown-item' ])
          $( dropdownItem ).prop( "type", "button" )
          $( dropdownItem ).text( b.name )
          $( svg ).addClass( ['bi', 'd-none', 'ms-auto'] )
          use.setAttributeNS('http://www.w3.org/2000/svg', 'href', '#check2')
          $( svg ).append( use )
          $( dropdownItem ).append( " ", svg )
          ;([...Object.keys(themeGroup).filter(c => c !== 'title' && c !== 'themes'), ...Object.keys(b).filter(c => c !== 'name')] as (keyof Theme)[]).forEach(c => {
            Reader.setThemeValue({ ...a, ...b }, $( dropdownItem ), c)
          })
          $( listItem ).append( dropdownItem )
          $( unorderedList ).append( listItem.cloneNode(true) as HTMLLIElement )
          $( listItem ).empty()
        })
      } else if (Utils.has.call(a, 'name') && Utils.has.call(a, 'value')) {
        const dropdownItem = document.createElement('button')
        const theme = a as Theme
        const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg')
        const use = document.createElementNS('http://www.w3.org/2000/svg', 'use')
        $( dropdownItem ).addClass( ['align-items-center', 'd-flex', 'dropdown-item'] )
        $( dropdownItem ).prop( "type", "button" )
        $( dropdownItem ).text( theme.name )
        $( svg ).addClass( ['bi', 'd-none', 'ms-auto'] )
        use.setAttributeNS('http://www.w3.org/2000/svg', 'href', '#check2')
        $(svg).append(use)
        $(dropdownItem).append(" ", svg)
        ;(Object.keys(a) as (keyof Theme)[]).filter(b => b !== 'name').forEach(c => {
          Reader.setThemeValue(theme, $( dropdownItem ), c)
        })
        $( listItem ).append( dropdownItem )
        $( unorderedList ).append( listItem.cloneNode(true) as HTMLLIElement )
        $( listItem ).empty()
      }
    })
    $dropdownMenu.html( unorderedList.innerHTML )
  }
  public static fontMapper (fontFamily: string): string {
    return fontFamily.replace(/['"]/g, '').split(/, */).map(element => element.trim()).filter(element => element.length > 0).map(element => Reader.FONT_MAP.find(([first, second]) => first === element || second === element)?.[1] ?? element).join(', ')
  }
}