interface Theme {
    active?: boolean;
    boldText?: boolean;
    fontFamily?: string;
    fontSize?: number;
    fontWeight?: number;
    justifyText?: boolean;
    lineHeight?: number;
    name: string;
    value: string;
}
interface ThemeGroup {
    boldText?: boolean;
    fontFamily?: string;
    fontSize?: number;
    fontWeight?: number;
    justifyText?: boolean;
    lineHeight?: number;
    themes: Theme[];
    title: string;
}
type ThemeItem = ThemeGroup | Theme;
export default class Reader {
    static readonly THEMES: ThemeItem[];
    static readonly FONT_MAP: string[][];
    private static setThemeValue;
    static loadReaderThemesOptions(): void;
    static fontMapper(fontFamily: string): string;
    static setReaderTheme(readerTheme: string, syncSettings: ($readerTheme: JQuery<HTMLButtonElement>) => void, prevReaderTheme?: null): void;
    static showActiveReaderTheme(readerTheme: string, focus?: boolean): void;
}
export {};
//# sourceMappingURL=Reader.d.ts.map