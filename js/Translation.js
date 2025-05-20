'use strict';
import { GoogleGenAI, HarmBlockThreshold, HarmCategory
// @ts-expect-error
 } from 'https://esm.run/@google/genai';
import * as Utils from './Utils.js';
var Translators;
(function (Translators) {
    Translators["BAIDU_TRANSLATE"] = "baiduTranslate";
    Translators["DEEPL_TRANSLATE"] = "deeplTranslate";
    Translators["GOOGLE_GENAI_TRANSLATE"] = "googleGenaiTranslate";
    Translators["GOOGLE_TRANSLATE"] = "googleTranslate";
    Translators["LINGVANEX"] = "lingvanex";
    Translators["MICROSOFT_TRANSLATOR"] = "microsoftTranslator";
    Translators["OPENAI_TRANSLATOR"] = "openaiTranslator";
    Translators["PAPAGO"] = "papago";
})(Translators || (Translators = {}));
var SystemInstructions;
(function (SystemInstructions) {
    SystemInstructions["GPT_4O_MINI"] = "gpt4oMini";
    SystemInstructions["COCCOC_EDU"] = "coccocEdu";
    SystemInstructions["DOCTRANSLATE_IO"] = "doctranslateIo";
})(SystemInstructions || (SystemInstructions = {}));
var Tones;
(function (Tones) {
    Tones["NONE"] = "None";
    Tones["SERIOUS"] = "Serious";
    Tones["FRIENDLY"] = "Friendly";
    Tones["HUMOROUS"] = "Humorous";
    Tones["FORMAL"] = "Formal";
    Tones["ROMANTIC"] = "Romantic";
})(Tones || (Tones = {}));
var Domains;
(function (Domains) {
    Domains["BANKING"] = "Banking";
    Domains["ACCOUNTING"] = "Accounting";
    Domains["MANAGEMENT"] = "Management";
    Domains["LAW"] = "Law";
    Domains["LOGISTICS"] = "Logistics";
    Domains["MARKETING"] = "Marketing";
    Domains["SECURITIES_AND_INVESTMENT"] = "Securities - Investment";
    Domains["INSURANCE"] = "Insurance";
    Domains["REAL_ESTATE"] = "Real Estate";
    Domains["MUSIC"] = "Music";
    Domains["PAINTING"] = "Painting";
    Domains["THEATER_AND_CINEMA"] = "Theater - Cinema";
    Domains["POETRY"] = "Poetry";
    Domains["EPIC"] = "Epic";
    Domains["CHILDRENS_STORIES"] = "Children's Stories";
    Domains["HISTORICAL_STORIES"] = "Historical Stories";
    Domains["FICTION"] = "Fiction";
    Domains["SHORT_STORIES"] = "Short Stories";
    Domains["PHYSICS"] = "Physics";
    Domains["CHEMISTRY"] = "Chemistry";
    Domains["INFORMATICS"] = "Informatics";
    Domains["ELECTRONICS"] = "Electronics";
    Domains["MEDICINE"] = "Medicine";
    Domains["MECHANICS"] = "Mechanics";
    Domains["METEOROLOGY_AND_HYDROLOGY"] = "Meteorology - Hydrology";
    Domains["AGRICULTURE"] = "Agriculture";
    Domains["LEGAL_DOCUMENTS"] = "Legal Documents";
    Domains["INTERNAL_DOCUMENTS"] = "Internal Documents";
    Domains["EMAIL"] = "Email";
    Domains["HEALTH"] = "Health";
    Domains["SPORTS"] = "Sports";
    Domains["CULTURE_AND_TOURISM"] = "Culture - Tourism";
    Domains["PRESS"] = "Press";
    Domains["ANIMALS"] = "Animals";
    Domains["NONE"] = "None";
})(Domains || (Domains = {}));
export default class Translation {
    text;
    originalLanguage;
    destinationLanguage;
    abortController;
    translateText = async (resolve) => { };
    translatedText = '';
    constructor(text, destinationLanguage, originalLanguage = null, options = {}) {
        this.text = text;
        this.originalLanguage = originalLanguage;
        this.destinationLanguage = destinationLanguage;
        this.abortController = new AbortController();
        options = {
            translatorId: Translators.GOOGLE_GENAI_TRANSLATE,
            googleGenaiModelId: 'gemini-2.5-pro-preview-05-06',
            thinkingModeEnabled: true,
            canGroundingWithGoogleSearch: false,
            openaiModelId: 'gpt-4.1',
            canWebSearch: false,
            bilingualEnabled: false,
            systemInstruction: SystemInstructions.GPT_4O_MINI,
            tone: Tones.SERIOUS,
            domain: Domains.NONE,
            customDictionaryEnabled: false,
            customDictionary: [],
            customPromptEnabled: false,
            customPrompt: '',
            temperature: 0.1,
            topP: 0.95,
            topK: -1,
            ...options
        };
        switch (options.translatorId) {
            case Translators.BAIDU_TRANSLATE:
            case Translators.DEEPL_TRANSLATE:
            case Translators.GOOGLE_TRANSLATE:
            case Translators.LINGVANEX:
            case Translators.MICROSOFT_TRANSLATOR:
            case Translators.OPENAI_TRANSLATOR: {
                this.translateText = async (resolve = (translatedText, text, options) => console.log(`${JSON.stringify(options)}\n### TEXT SENTENCE:\n${text}\n### TRANSLATED TEXT:\n${translatedText}`)) => {
                    const { openaiModelId, canWebSearch, systemInstruction, temperature, topP } = options;
                    const prompt = this.getPrompt(systemInstruction, this.text);
                    await window.fetch('https://gateway.api.airapps.co/aa_service=server5/aa_apikey=5N3NR9SDGLS7VLUWSEN9J30P//v3/proxy/open-ai/v1/responses', {
                        body: JSON.stringify({
                            model: openaiModelId,
                            input: [
                                ...this.getSystemInstructions(systemInstruction, this.text, this.originalLanguage, this.destinationLanguage, options).map(element => ({
                                    role: /^o\d/.test(openaiModelId) ? (openaiModelId === 'o1-mini' ? 'user' : 'developer') : 'system',
                                    content: [
                                        {
                                            type: 'input_text',
                                            text: element
                                        }
                                    ]
                                })),
                                {
                                    role: 'user',
                                    content: [
                                        {
                                            type: 'input_text',
                                            text: prompt
                                        }
                                    ]
                                }
                            ],
                            text: {
                                format: {
                                    type: 'text'
                                }
                            },
                            reasoning: {},
                            tools: [
                                ...canWebSearch
                                    ? [{
                                            type: 'web_search_preview',
                                            user_location: {
                                                type: 'approximate'
                                            },
                                            search_context_size: 'medium'
                                        }]
                                    : []
                            ],
                            temperature: temperature === -1 ? 1 : temperature,
                            top_p: topP === -1 ? 1 : topP,
                            store: false
                        }),
                        headers: {
                            'Content-Type': 'application/json',
                            'accept-language': 'vi-VN,vi;q=0.9',
                            'air-user-id': window.crypto.randomUUID()
                        },
                        method: 'POST',
                        signal: this.abortController.signal
                    }).then(async (value) => await value.json()).then(value => {
                        const responseText = value.output.filter(element => element.type === 'message')[0].content[0].text;
                        this.translatedText = systemInstruction === SystemInstructions.DOCTRANSLATE_IO ? this.doctranslateIoResponsePostprocess(responseText, (prompt.match(/(?<=^### TEXT SENTENCE WITH UUID:\n)[\s\S]+(?=\n### TRANSLATED TEXT WITH UUID:$)/) ?? [''])[0]) : responseText;
                        if (this.abortController.signal.aborted)
                            return;
                        resolve(this.translatedText, this.text, options);
                    }).catch(reason => {
                        console.error(reason);
                    });
                };
                break;
            }
            case Translators.PAPAGO:
            case Translators.GOOGLE_GENAI_TRANSLATE:
            default: {
                this.translateText = async (resolve = (translatedText, text, options) => console.log(`${JSON.stringify(options)}\n### TEXT SENTENCE:\n${text}\n### TRANSLATED TEXT:\n${translatedText}`)) => {
                    const { googleGenaiModelId, thinkingModeEnabled, canGroundingWithGoogleSearch, GOOGLE_API_KEY, systemInstruction, temperature, topP, topK } = options;
                    const ai = new GoogleGenAI({
                        apiKey: GOOGLE_API_KEY
                    });
                    const tools = [];
                    if (canGroundingWithGoogleSearch)
                        tools.push({ googleSearch: {} });
                    const config = {
                        ...temperature > -1 ? { temperature } : {},
                        ...topP > -1 ? { topP } : {},
                        ...topK > -1 ? { topK } : {},
                        ...googleGenaiModelId.startsWith('gemini-2.5-flash') && !thinkingModeEnabled
                            ? {
                                thinkingConfig: {
                                    thinkingBudget: 0
                                }
                            }
                            : {},
                        safetySettings: [
                            {
                                category: HarmCategory.HARM_CATEGORY_HARASSMENT,
                                threshold: HarmBlockThreshold.BLOCK_NONE // Block none
                            },
                            {
                                category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
                                threshold: HarmBlockThreshold.BLOCK_NONE // Block none
                            },
                            {
                                category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
                                threshold: HarmBlockThreshold.BLOCK_NONE // Block none
                            },
                            {
                                category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
                                threshold: HarmBlockThreshold.BLOCK_NONE // Block none
                            }
                        ],
                        ...tools.length > 0 ? { tools } : {},
                        responseMimeType: 'text/plain',
                        systemInstruction: this.getSystemInstructions(systemInstruction, this.text, this.originalLanguage, this.destinationLanguage, options).map(element => ({
                            text: element
                        }))
                    };
                    const model = options.googleGenaiModelId;
                    const prompt = this.getPrompt(systemInstruction, this.text);
                    const contents = [
                        {
                            role: 'user',
                            parts: [
                                {
                                    text: `${prompt.split('\n').filter(element => element.length > 0).join('\n')}`
                                }
                            ]
                        }
                    ];
                    const response = await ai.models.generateContentStream({
                        model,
                        config,
                        contents
                    });
                    let responseText = '';
                    for await (const chunk of response) {
                        responseText += chunk.text;
                        this.translatedText = systemInstruction === SystemInstructions.DOCTRANSLATE_IO ? this.doctranslateIoResponsePostprocess(responseText, (prompt.match(/(?<=^### TEXT SENTENCE WITH UUID:\n)[\s\S]+(?=\n### TRANSLATED TEXT WITH UUID:$)/) ?? [''])[0]) : responseText;
                        if (this.translatedText.length === 0)
                            continue;
                        if (this.abortController.signal.aborted)
                            return;
                        resolve(this.translatedText, this.text, options);
                    }
                };
            }
        }
        this.originalLanguage = originalLanguage;
        this.destinationLanguage = destinationLanguage;
    }
    getPrompt(systemInstruction, text) {
        switch (systemInstruction) {
            case SystemInstructions.DOCTRANSLATE_IO:
                return `### TEXT SENTENCE WITH UUID:\n${text.split('\n').map((element) => {
                    if (element.replace(/^\s+/, '').length > 0) {
                        const partedUuid = window.crypto.randomUUID().split('-');
                        return `${partedUuid[0]}#${partedUuid[2].substring(1)}: ${element}`;
                    }
                    return '';
                }).join('\n')}\n### TRANSLATED TEXT WITH UUID:`;
            default:
                return text.split('\n').filter(element => element.replace(/^\s+/, '').length > 0).join('\n');
        }
    }
    getSystemInstructions(systemInstruction, text, originalLanguage, destinationLanguage, options) {
        const systemInstructions = [];
        switch (systemInstruction) {
            case SystemInstructions.COCCOC_EDU: {
                const LANGUAGE_MAP = {
                    en: 'English',
                    vi: 'Vietnamese',
                    ja: 'Japanese',
                    'zh-cn': 'Chinese (Simplified)',
                    'zh-tw': 'Chinese (Traditional)'
                };
                const toLanguage = LANGUAGE_MAP[destinationLanguage];
                const fromLanguage = LANGUAGE_MAP[originalLanguage ?? ''];
                systemInstructions.push(`I want you to act as a ${toLanguage} translator.\nYou are trained on data up to October 2023.`);
                systemInstructions.push(`I will speak to you in ${fromLanguage != null ? `${fromLanguage} and you will ` : 'any language and you will detect the language, '}translate it and answer in the corrected version of my text, exclusively in ${toLanguage}, while keeping the format.\nYour translations must convey all the content in the original text and cannot involve explanations or other unnecessary information.\nPlease ensure that the translated text is natural for native speakers with correct grammar and proper word choices.\nYour output must only contain the translated text and cannot include explanations or other information.`);
                break;
            }
            case SystemInstructions.DOCTRANSLATE_IO: {
                const LANGUAGE_MAP = {
                    en: 'English',
                    vi: 'Vietnamese',
                    ja: 'Japanese',
                    'zh-cn': 'Chinese (simplified)',
                    'zh-tw': 'Chinese (traditional)'
                };
                const originalLang = (LANGUAGE_MAP[originalLanguage ?? ''] ?? LANGUAGE_MAP.en).toUpperCase();
                const destLang = LANGUAGE_MAP[destinationLanguage].toUpperCase();
                const domain = options.domain.replace(Domains.NONE, 'Lifestyle');
                const DOMAIN_INSTRUCTION_MAP = {
                    'Economics - Finance': '- focus on presenting and analyzing information related to the domain.\n- use technical terminology that is precise, clear, neutral, and objective.\n- sentence structure is coherent, presenting information in a logical order.',
                    'Literature - Arts': '- use local words/dialect words/slang/jargon, morphological function words - express emotions/feelings/attitudes.\n- sentences have a structured arrangement, words are selected and polished to create artistic and aesthetic value.\n- use words that are appropriate to the setting and timeline of the story.\n- use words that are easy to understand, easy to visualize, and bring emotions to the reader.\n- make sure the words and sentences flow together like a story from beginning to end.\n- the relationships between characters must be clearly defined and not confused.\n- character names, minor character names, the way characters address each other, and the way the narrator addresses and refers to other characters must be consistent from beginning to end of the story and cannot be changed arbitrarily.\n- the writing is always carefully crafted, emotional, and brings indescribable emotions to the reader.',
                    'Science - Technology': '- use a system of scientific terms, literal, univocal words, complex but standard sentence structures, systems of symbols, formulas, diagrams, models, tables, etc.\n- sentences must have complex structures to fully present the multifaceted content of concepts and theorems. prioritize the use of equal sentences, passive sentences, sentences with missing subjects and sentences with indefinite subjects.',
                    'Administrative documents': '- arranged according to the prescribed format.\n- administrative and objective terms, clear syntax. prioritize the use of declarative sentences, not interrogative or expressive.',
                    Lifestyle: '- the text is simple, close and easy to understand.\n- use the easiest words possible.'
                };
                const tone = options.tone.replace(Tones.NONE, Tones.SERIOUS);
                const TONE_INSTRUCTION_MAP = {
                    Serious: '\n    - Language should be neutral, precise and technical, avoiding emotional elements.\n    - Make everything clear and logical.',
                    Friendly: '\n    - Use language that is warm, approachable, and conversational.\n    - Ensure the language feels natural and relaxed.',
                    Humorous: '\n    - Language must be fun, light and humorous. Use jokes or creative expressions.\n    - Must use entertaining words, wordplay, trendy words, words that young people often use.',
                    Formal: '\n    - Utilize language that is formal, respectful, and professional. Employ complex sentence structures and maintain a formal register.\n    - Choose polite, precise, and refined vocabulary.\n    - Incorporate metaphors, idioms, parallel structures, and couplets where appropriate. Ensure that dialogue between characters is formal and well-ordered.\n    - When relevant, use selectively chosen archaic or classical words, especially if the context pertains to historical or ancient settings.',
                    Romantic: '\n    - Language must be emotional, poetic and artistic.\n    - Choose flowery, sentimental, and erotic words.\n    - The writing is gentle, focusing on subtle feelings about love and deep character emotions.'
                };
                const { customDictionaryEnabled, customDictionary, customPromptEnabled, customPrompt } = options;
                systemInstructions.push(`### ROLE:\nYou are a translation professional with many years of experience, able to translate accurately and naturally between languages. You have a good understanding of the grammar, vocabulary and style of both ${originalLang} and ${destLang}. You also know how to maintain the original meaning and emotion of the text when translating.\n\n### INSTRUCTION:\n- Translate the following paragraphs into ${destLang}, ensuring each sentence is fully understood and free from confusion.\n- Avoid adding any new information, explaining or changing the meaning of the original text.\n- Each translated text segment must have a UUID that exactly matches the UUID of the original text segment.\n- The UUIDs must exactly correspond to the UUIDs in the original text. Do not make up your own UUIDs or confuse the UUIDs of one text with those of another.\n- Only translated into ${destLang} language, not into any other language other than ${destLang}\n- The only priority is translation, do not arbitrarily add your own thoughts and explanations that are not in the original text.\n- Do not insert additional notes or explanations with the words in the translation.\n- Spaces and line breaks must be kept intact, not changed or replaced with /t /n\n- If UUID not have text to translate, just return ""\n- Follow the instruction for translate with domain ${domain}:\n${DOMAIN_INSTRUCTION_MAP[[Domains.BANKING, Domains.ACCOUNTING, Domains.MANAGEMENT, Domains.LAW, Domains.LOGISTICS, Domains.MARKETING, Domains.SECURITIES_AND_INVESTMENT, Domains.INSURANCE, Domains.REAL_ESTATE].some(element => domain === element) ? 'Economics - Finance' : ([Domains.MUSIC, Domains.PAINTING, Domains.THEATER_AND_CINEMA, Domains.POETRY, Domains.EPIC, Domains.CHILDRENS_STORIES, Domains.HISTORICAL_STORIES, Domains.FICTION, Domains.SHORT_STORIES].some(element => domain === element) ? 'Literature - Arts' : ([Domains.PHYSICS, Domains.CHEMISTRY, Domains.INFORMATICS, Domains.ELECTRONICS, Domains.MEDICINE, Domains.MECHANICS, Domains.METEOROLOGY_AND_HYDROLOGY, Domains.AGRICULTURE].some(element => domain === element) ? 'Science - Technology' : ([Domains.LEGAL_DOCUMENTS, Domains.INTERNAL_DOCUMENTS, Domains.EMAIL].some(element => domain === element) ? 'Administrative documents' : 'Lifestyle')))]}\n- Handle special case:\n+ Numbers: Maintain the original numeric values, but adapt formats if necessary (e.g., decimal separators, digit grouping).\n+ Currencies: Convert currency symbols or codes as appropriate for the target language and region.\n+ Dates: Adjust date formats to match the conventions of the target language and culture.\n+ Proper nouns: Generally, do not translate names of people, places, or organizations unless there's a widely accepted equivalent in the target language.\n+ Units of measurement: if they cannot be translated into ${destLang}, convert the unit of measurement to an equivalent system in ${destLang}, but precise calculations are required when converting units and detailed\n### CHAIN OF THOUGHT: Lets thinks step by step to translate but only return the translation:\n1.  Depend on the Input text, find the context and insight of the text by answer all the question below:\n- What is this document about, what is its purpose, who is it for, what is the domain of this document\n- What should be noted when translating this document from ${originalLang} to ${destLang} to ensure the translation is accurate. Especially the technical parameters, measurement units, acronym, technical standards, unit standards are different between ${originalLang} and ${destLang}\n- What is ${originalLang} abbreviations in the context of the document should be understood correctly and translated accurately into ${destLang}. It is necessary to clearly understand the meaning of the abbreviation and not to mistake a ${originalLang} abbreviation for an ${destLang} word.\n- Always make sure that users of the language ${destLang} do not find it difficult to understand when reading\n2. Based on the instructions and rules in INSTRUCTION and what you learned in step 1, proceed to translate the text.\n3. Acting as a reader, give comments on the translation based on the following criteria:\n- Do you understand what the translation is talking about\n- Does the translation follow the rules given in the INSTRUCTION\n- Is the translation really good, perfect? \u200b\u200bIf not good, what is not good, what needs improvement?\n4. Based on the comments in step 3, revise the translation (if necessary).\n### STYLE INSTRUCTION:\n\n        The style of the output must be ${tone}:\n        -${TONE_INSTRUCTION_MAP[tone]}\n\n\n### ADVANCED MISSION (HIGHEST PRIORITY):\n${customDictionaryEnabled ? customDictionary.filter(element => element.originalLanguage === originalLanguage && element.destinationLanguage === destinationLanguage && text.includes(element.originalWord)).map(({ originalWord, destinationWord }) => `Must translate: ${originalWord} into ${destinationWord}`).join('\n') : ''}\n- Follow the instruction below when translate:\n${customPromptEnabled ? customPrompt : ''}\n### OUTPUT FORMAT MUST BE IN JSON:\n{\n"insight": "[In-depth understanding of the text from the analysis step]",\n"rule": "[Rules followed during translation]",\n"translated_string": "uuid: ${destLang} translation of the sentence when using rule\\n  uuid: ${destLang.replace(/E$/, 'e')} translation of the sentence when using rule\\n  .."\n}`);
                break;
            }
            case SystemInstructions.GPT_4O_MINI:
            default: {
                const LANGUAGE_MAP = {
                    'zh-cn': 'Chinese',
                    'zh-tw': 'Chinese',
                    en: 'English',
                    ja: 'Japanese',
                    vi: 'Vietnamese'
                };
                systemInstructions.push(`You will be provided with a user input in ${LANGUAGE_MAP[originalLanguage ?? ''] ?? 'English'}.\nTranslate the text into ${LANGUAGE_MAP[destinationLanguage]}.\nOnly output the translated text, without any additional text.`);
            }
        }
        return systemInstructions;
    }
    doctranslateIoResponsePostprocess(translatedTextWithUuid, textSentenceWithUuid) {
        translatedTextWithUuid = translatedTextWithUuid.replace('({)\\n', '$1\n').replace(/(\\")?"?(?:(?:\n|\\n)?\})?(\n?(?:`{3})?)$/, '$1"\n}$2').replaceAll(/\n(?! *"(?:insight|rule|translated_string|[a-z0-9]{7,8}#[a-z0-9]{2,3})"|\}(?=\n?(?:`{3})?$))/g, '\\n').replace(/("translated_string": ")([[\s--\n]\S]+)(?=")/v, (_match, p1, p2) => `${p1}${p2.replaceAll(/([^\\])"/g, '$1\\"')}`);
        const jsonMatch = translatedTextWithUuid.match(/(\{[\s\S]+\})/);
        const potentialJsonString = (jsonMatch != null ? jsonMatch[0] : translatedTextWithUuid.replace(/^`{3}json\n/, '').replace(/\n`{3}$/, '')).replace(/insight": "[\s\S]+(?=translated_string": ")/, '');
        if (Utils.isValidJson(potentialJsonString)) {
            const parsedResult = JSON.parse(potentialJsonString);
            let translatedStringMap = {};
            if (typeof parsedResult.translated_string !== 'string') {
                translatedStringMap = parsedResult.translated_string;
            }
            else if (Utils.isValidJson(parsedResult.translated_string)) {
                translatedStringMap = JSON.parse(parsedResult.translated_string);
            }
            else {
                const translatedStringParts = parsedResult.translated_string.split(/\s*([a-z0-9]{7,8}#[a-z0-9]{2,3}): (?:[a-z0-9]{7,8}#[a-z0-9]{2,3}: )?/).slice(1);
                for (let i = 0; i < translatedStringParts.length; i += 2) {
                    translatedStringMap[translatedStringParts[i]] = translatedStringParts[i + 1].replace(/\n+$/, '');
                }
            }
            if (Object.keys(translatedStringMap ?? {}).length > 0) {
                return textSentenceWithUuid.split('\n').map(element => {
                    const uuid = (element.match(/^[a-z0-9]{8}#[a-z0-9]{3}/) ?? [''])[0];
                    return translatedStringMap[uuid] ?? '';
                }).join('\n');
            }
        }
        return '';
    }
}
