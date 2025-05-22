interface Model {
    modelId: string;
    modelName?: string;
    selected?: boolean;
}
type ModelEntry = string | Model;
type ModelGroup = Record<string, ModelEntry[]>;
type ModelsType = Record<string, ModelGroup>;
declare const MODELS: ModelsType;
interface DictionaryEntry {
    originalLanguage: string;
    destinationLanguage: string;
    originalWord: string;
    destinationWord: string;
}
declare enum Domains {
    BANKING = "Banking",
    ACCOUNTING = "Accounting",
    MANAGEMENT = "Management",
    LAW = "Law",
    LOGISTICS = "Logistics",
    MARKETING = "Marketing",
    SECURITIES_AND_INVESTMENT = "Securities - Investment",
    INSURANCE = "Insurance",
    REAL_ESTATE = "Real Estate",
    MUSIC = "Music",
    PAINTING = "Painting",
    THEATER_AND_CINEMA = "Theater - Cinema",
    POETRY = "Poetry",
    EPIC = "Epic",
    CHILDRENS_STORIES = "Children's Stories",
    HISTORICAL_STORIES = "Historical Stories",
    FICTION = "Fiction",
    SHORT_STORIES = "Short Stories",
    PHYSICS = "Physics",
    CHEMISTRY = "Chemistry",
    INFORMATICS = "Informatics",
    ELECTRONICS = "Electronics",
    MEDICINE = "Medicine",
    MECHANICS = "Mechanics",
    METEOROLOGY_AND_HYDROLOGY = "Meteorology - Hydrology",
    AGRICULTURE = "Agriculture",
    LEGAL_DOCUMENTS = "Legal Documents",
    INTERNAL_DOCUMENTS = "Internal Documents",
    EMAIL = "Email",
    HEALTH = "Health",
    SPORTS = "Sports",
    CULTURE_AND_TOURISM = "Culture - Tourism",
    PRESS = "Press",
    ANIMALS = "Animals",
    NONE = "None"
}
declare enum SystemInstructions {
    GPT4OMINI = "gpt-4o-mini",
    COCCOC_EDU = "coccocEdu",
    DOCTRANSLATE_IO = "doctranslateIo"
}
declare enum Tones {
    NONE = "None",
    SERIOUS = "Serious",
    FRIENDLY = "Friendly",
    HUMOROUS = "Humorous",
    FORMAL = "Formal",
    ROMANTIC = "Romantic"
}
interface Options {
    customDictionary?: DictionaryEntry[];
    customPrompt?: string;
    domain?: Domains;
    GEMINI_API_KEY?: string;
    googleGenaiModelId?: string;
    groqModelId?: string;
    GROQ_API_KEY?: string;
    isBilingualEnabled?: boolean;
    isCustomDictionaryEnabled?: boolean;
    isCustomPromptEnabled?: boolean;
    isGroundingWithGoogleSearchEnabled?: boolean;
    isThinkingModeEnabled?: boolean;
    isWebSearchEnabled?: boolean;
    openaiModelId?: string;
    openrouterModelId?: string;
    OPENROUTER_API_KEY?: string;
    systemInstruction?: SystemInstructions;
    temperature?: number;
    tone?: Tones;
    topP?: number;
    topK?: number;
    translatorId?: Translators;
}
declare enum Translators {
    BAIDU_TRANSLATE = "baiduTranslate",
    DEEPL_TRANSLATE = "deeplTranslate",
    GOOGLE_GENAI_TRANSLATE = "googleGenaiTranslate",
    GOOGLE_TRANSLATE = "googleTranslate",
    GROQ_TRANSLATE = "groqTranslate",
    LINGVANEX = "lingvanex",
    MICROSOFT_TRANSLATOR = "microsoftTranslator",
    OPENAI_TRANSLATOR = "openaiTranslator",
    OPENROUTER_TRANSLATE = "openrouterTranslate",
    PAPAGO = "papago"
}
declare class Translation {
    private readonly text;
    private readonly destinationLanguage;
    private readonly originalLanguage;
    readonly abortController: AbortController;
    translateText: (resolve: (translateText: string, text: string, options: Options) => void) => Promise<void>;
    translatedText: string;
    constructor(text: string, destinationLanguage: string, originalLanguage?: string | null, options?: Options);
    private getPrompt;
    private getSystemInstructions;
    private doctranslateIoResponsePostprocess;
}
export { DictionaryEntry, Domains, Model, MODELS, ModelEntry, Options, SystemInstructions, Tones, Translation, Translators };
//# sourceMappingURL=Translation.d.ts.map