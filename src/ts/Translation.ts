'use strict'
import {
  GoogleGenAI,
  HarmBlockThreshold,
  HarmCategory
// @ts-expect-error
} from 'https://esm.run/@google/genai'
import * as Utils from './Utils.js'
enum Translators {
  BAIDU_TRANSLATE = 'baiduTranslate',
  DEEPL_TRANSLATE = 'deeplTranslate',
  GOOGLE_GENAI_TRANSLATE = 'googleGenaiTranslate',
  GOOGLE_TRANSLATE = 'googleTranslate',
  LINGVANEX = 'lingvanex',
  MICROSOFT_TRANSLATOR = 'microsoftTranslator',
  OPENAI_TRANSLATOR = 'openaiTranslator',
  PAPAGO = 'papago'
}
const MODELS: { [key: string]: { [key: string]: any[] } } = {
  GOOGLE_GENAI: {
    'Gemini 2.5': [
      {
        modelId: 'gemini-2.5-flash-preview-04-17',
        modelName: 'Gemini 2.5 Flash Preview 04-17'
      },
      {
        modelId: 'gemini-2.5-flash-preview-05-20',
        modelName: 'Gemini 2.5 Flash Preview 05-20'
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
enum SystemInstructions {
  GPT4OMINI = 'gpt-4o-mini',
  COCCOC_EDU = 'coccocEdu',
  DOCTRANSLATE_IO = 'doctranslateIo'
}
enum Tones {
  NONE = 'None',
  SERIOUS = 'Serious',
  FRIENDLY = 'Friendly',
  HUMOROUS = 'Humorous',
  FORMAL = 'Formal',
  ROMANTIC = 'Romantic'
}
enum Domains {
  BANKING = 'Banking',
  ACCOUNTING = 'Accounting',
  MANAGEMENT = 'Management',
  LAW = 'Law',
  LOGISTICS = 'Logistics',
  MARKETING = 'Marketing',
  SECURITIES_AND_INVESTMENT = 'Securities - Investment',
  INSURANCE = 'Insurance',
  REAL_ESTATE = 'Real Estate',
  MUSIC = 'Music',
  PAINTING = 'Painting',
  THEATER_AND_CINEMA = 'Theater - Cinema',
  POETRY = 'Poetry',
  EPIC = 'Epic',
  CHILDRENS_STORIES = "Children's Stories",
  HISTORICAL_STORIES = 'Historical Stories',
  FICTION = 'Fiction',
  SHORT_STORIES = 'Short Stories',
  PHYSICS = 'Physics',
  CHEMISTRY = 'Chemistry',
  INFORMATICS = 'Informatics',
  ELECTRONICS = 'Electronics',
  MEDICINE = 'Medicine',
  MECHANICS = 'Mechanics',
  METEOROLOGY_AND_HYDROLOGY = 'Meteorology - Hydrology',
  AGRICULTURE = 'Agriculture',
  LEGAL_DOCUMENTS = 'Legal Documents',
  INTERNAL_DOCUMENTS = 'Internal Documents',
  EMAIL = 'Email',
  HEALTH = 'Health',
  SPORTS = 'Sports',
  CULTURE_AND_TOURISM = 'Culture - Tourism',
  PRESS = 'Press',
  ANIMALS = 'Animals',
  NONE = 'None'
}
class Translation {
  private readonly text: string
  private readonly originalLanguage
  private readonly destinationLanguage
  public readonly abortController
  public translateText = async (resolve): Promise<void> => {}
  public translatedText = ''
  constructor (text, destinationLanguage, originalLanguage: any = null, options: { [key: string]: any } = {}) {
    this.text = text
    this.originalLanguage = originalLanguage
    this.destinationLanguage = destinationLanguage
    this.abortController = new AbortController()
    options = {
      translatorId: Translators.GOOGLE_GENAI_TRANSLATE,
      googleGenaiModelId: Object.values(MODELS.GOOGLE_GENAI).flat().find(element => element.selected).modelId,
      thinkingModeEnabled: true,
      canGroundingWithGoogleSearch: false,
      openaiModelId: Object.values(MODELS.OPENAI).flat().find(element => element.selected)?.modelId,
      canWebSearch: false,
      bilingualEnabled: false,
      systemInstruction: SystemInstructions.GPT4OMINI,
      temperature: 0.1,
      topP: 0.95,
      topK: -1,
      tone: Tones.SERIOUS,
      domain: Domains.NONE,
      customDictionaryEnabled: false,
      customDictionary: [],
      customPromptEnabled: false,
      customPrompt: '',
      ...options
    }
    switch (options.translatorId) {
      case Translators.BAIDU_TRANSLATE:
      case Translators.DEEPL_TRANSLATE:
      case Translators.GOOGLE_TRANSLATE:
      case Translators.LINGVANEX:
      case Translators.MICROSOFT_TRANSLATOR:
      case Translators.OPENAI_TRANSLATOR: {
        this.translateText = async (resolve = (translatedText: string, text: string, options) => console.log(`${JSON.stringify(options)}\n### TEXT SENTENCE:\n${text}\n### TRANSLATED TEXT:\n${translatedText}`)) => {
          const { openaiModelId, canWebSearch, systemInstruction, temperature, topP } = options
          const prompt = this.getPrompt(systemInstruction, this.text)
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
                ...canWebSearch as boolean
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
          }).then(async value => await value.json()).then(value => {
            const responseText = value.output.filter(element => element.type === 'message')[0].content[0].text
            this.translatedText = systemInstruction === SystemInstructions.DOCTRANSLATE_IO ? this.doctranslateIoResponsePostprocess(responseText, (prompt.match(/(?<=^### TEXT SENTENCE WITH UUID:\n)[\s\S]+(?=\n### TRANSLATED TEXT WITH UUID:$)/) ?? [''])[0]) : responseText
            if (this.abortController.signal.aborted as boolean) return
            resolve(this.translatedText, this.text, options)
          }).catch(reason => {
            console.error(reason)
          })
        }
        break
      }
      case Translators.PAPAGO:
      case Translators.GOOGLE_GENAI_TRANSLATE:
      default: {
        this.translateText = async (resolve = (translatedText: string, text: string, options) => console.log(`${JSON.stringify(options)}\n### TEXT SENTENCE:\n${text}\n### TRANSLATED TEXT:\n${translatedText}`)) => {
          const { googleGenaiModelId, thinkingModeEnabled, canGroundingWithGoogleSearch, GEMINI_API_KEY, systemInstruction, temperature, topP, topK } = options
          const ai = new GoogleGenAI({
            apiKey: GEMINI_API_KEY
          })
          const tools: Array<{}> = []
          if (canGroundingWithGoogleSearch as boolean) tools.push({ googleSearch: {} })
          const config = {
            ...temperature > -1 ? { temperature } : {},
            ...topP > -1 ? { topP } : {},
            ...topK > -1 ? { topK } : {},
            ...(googleGenaiModelId as string).startsWith('gemini-2.5-flash') && !(thinkingModeEnabled as boolean)
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
          }
          const model = options.googleGenaiModelId
          const prompt = this.getPrompt(systemInstruction, this.text)
          const contents = [
            {
              role: 'user',
              parts: [
                {
                  text: `${prompt.split('\n').filter(element => element.length > 0).join('\n')}`
                }
              ]
            }
          ]

          const response = await ai.models.generateContentStream({
            model,
            config,
            contents
          })
          let responseText = ''
          for await (const chunk of response) {
            responseText += chunk.text as string
            this.translatedText = systemInstruction === SystemInstructions.DOCTRANSLATE_IO ? this.doctranslateIoResponsePostprocess(responseText, (prompt.match(/(?<=^### TEXT SENTENCE WITH UUID:\n)[\s\S]+(?=\n### TRANSLATED TEXT WITH UUID:$)/) ?? [''])[0]) : responseText
            if (this.translatedText.length === 0) continue
            if (this.abortController.signal.aborted as boolean) return
            resolve(this.translatedText, this.text, options)
          }
        }
      }
    }
    this.originalLanguage = originalLanguage
    this.destinationLanguage = destinationLanguage
  }

  private getPrompt (systemInstruction, text: string): string {
    switch (systemInstruction) {
      case SystemInstructions.DOCTRANSLATE_IO:
        return `### TEXT SENTENCE WITH UUID:\n${text.split('\n').map((element: string) => {
          if (element.replace(/^\s+/, '').length > 0) {
            const partedUuid: string[] = window.crypto.randomUUID().split('-')
            return `${partedUuid[0]}#${partedUuid[2].substring(1)}: ${element}`
          }
          return ''
        }).join('\n')}\n### TRANSLATED TEXT WITH UUID:`
      default:
        return text.split('\n').filter(element => element.replace(/^\s+/, '').length > 0).join('\n')
    }
  }

  private getSystemInstructions (systemInstruction, text, originalLanguage, destinationLanguage, options): string[] {
    const systemInstructions: string[] = []
    switch (systemInstruction) {
      case SystemInstructions.COCCOC_EDU: {
        const LANGUAGE_MAP = {
          en: 'English',
          vi: 'Vietnamese',
          ja: 'Japanese',
          'zh-cn': 'Chinese (Simplified)',
          'zh-tw': 'Chinese (Traditional)'
        }
        const toLanguage: string = LANGUAGE_MAP[destinationLanguage]
        const fromLanguage: string = LANGUAGE_MAP[originalLanguage ?? '']
        systemInstructions.push(`I want you to act as a ${toLanguage} translator.\nYou are trained on data up to October 2023.`)
        systemInstructions.push(`I will speak to you in ${fromLanguage != null ? `${fromLanguage} and you will ` : 'any language and you will detect the language, '}translate it and answer in the corrected version of my text, exclusively in ${toLanguage}, while keeping the format.\nYour translations must convey all the content in the original text and cannot involve explanations or other unnecessary information.\nPlease ensure that the translated text is natural for native speakers with correct grammar and proper word choices.\nYour output must only contain the translated text and cannot include explanations or other information.`)
        break
      }
      case SystemInstructions.DOCTRANSLATE_IO: {
        const LANGUAGE_MAP = {
          en: 'English',
          vi: 'Vietnamese',
          ja: 'Japanese',
          'zh-cn': 'Chinese (simplified)',
          'zh-tw': 'Chinese (traditional)'
        }
        const originalLang: string = (LANGUAGE_MAP[originalLanguage ?? ''] ?? LANGUAGE_MAP.en).toUpperCase()
        const destLang: string = LANGUAGE_MAP[destinationLanguage].toUpperCase()
        const domain: string = options.domain.replace(Domains.NONE, 'Lifestyle')
        const DOMAIN_INSTRUCTION_MAP = {
          'Economics - Finance': '- focus on presenting and analyzing information related to the domain.\n- use technical terminology that is precise, clear, neutral, and objective.\n- sentence structure is coherent, presenting information in a logical order.',
          'Literature - Arts': '- use local words/dialect words/slang/jargon, morphological function words - express emotions/feelings/attitudes.\n- sentences have a structured arrangement, words are selected and polished to create artistic and aesthetic value.\n- use words that are appropriate to the setting and timeline of the story.\n- use words that are easy to understand, easy to visualize, and bring emotions to the reader.\n- make sure the words and sentences flow together like a story from beginning to end.\n- the relationships between characters must be clearly defined and not confused.\n- character names, minor character names, the way characters address each other, and the way the narrator addresses and refers to other characters must be consistent from beginning to end of the story and cannot be changed arbitrarily.\n- the writing is always carefully crafted, emotional, and brings indescribable emotions to the reader.',
          'Science - Technology': '- use a system of scientific terms, literal, univocal words, complex but standard sentence structures, systems of symbols, formulas, diagrams, models, tables, etc.\n- sentences must have complex structures to fully present the multifaceted content of concepts and theorems. prioritize the use of equal sentences, passive sentences, sentences with missing subjects and sentences with indefinite subjects.',
          'Administrative documents': '- arranged according to the prescribed format.\n- administrative and objective terms, clear syntax. prioritize the use of declarative sentences, not interrogative or expressive.',
          Lifestyle: '- the text is simple, close and easy to understand.\n- use the easiest words possible.'
        }
        const tone: string = options.tone.replace(Tones.NONE, Tones.SERIOUS)
        const TONE_INSTRUCTION_MAP: { [key: string]: string } = {
          Serious: '\n    - Language should be neutral, precise and technical, avoiding emotional elements.\n    - Make everything clear and logical.',
          Friendly: '\n    - Use language that is warm, approachable, and conversational.\n    - Ensure the language feels natural and relaxed.',
          Humorous: '\n    - Language must be fun, light and humorous. Use jokes or creative expressions.\n    - Must use entertaining words, wordplay, trendy words, words that young people often use.',
          Formal: '\n    - Utilize language that is formal, respectful, and professional. Employ complex sentence structures and maintain a formal register.\n    - Choose polite, precise, and refined vocabulary.\n    - Incorporate metaphors, idioms, parallel structures, and couplets where appropriate. Ensure that dialogue between characters is formal and well-ordered.\n    - When relevant, use selectively chosen archaic or classical words, especially if the context pertains to historical or ancient settings.',
          Romantic: '\n    - Language must be emotional, poetic and artistic.\n    - Choose flowery, sentimental, and erotic words.\n    - The writing is gentle, focusing on subtle feelings about love and deep character emotions.'
        }
        const { customDictionaryEnabled, customDictionary, customPromptEnabled, customPrompt } = options
        systemInstructions.push(`### ROLE:\nYou are a translation professional with many years of experience, able to translate accurately and naturally between languages. You have a good understanding of the grammar, vocabulary and style of both ${originalLang} and ${destLang}. You also know how to maintain the original meaning and emotion of the text when translating.\n\n### INSTRUCTION:\n- Translate the following paragraphs into ${destLang}, ensuring each sentence is fully understood and free from confusion.\n- Avoid adding any new information, explaining or changing the meaning of the original text.\n- Each translated text segment must have a UUID that exactly matches the UUID of the original text segment.\n- The UUIDs must exactly correspond to the UUIDs in the original text. Do not make up your own UUIDs or confuse the UUIDs of one text with those of another.\n- Only translated into ${destLang} language, not into any other language other than ${destLang}\n- The only priority is translation, do not arbitrarily add your own thoughts and explanations that are not in the original text.\n- Do not insert additional notes or explanations with the words in the translation.\n- Spaces and line breaks must be kept intact, not changed or replaced with /t /n\n- If UUID not have text to translate, just return ""\n- Follow the instruction for translate with domain ${domain}:\n${DOMAIN_INSTRUCTION_MAP[[Domains.BANKING, Domains.ACCOUNTING, Domains.MANAGEMENT, Domains.LAW, Domains.LOGISTICS, Domains.MARKETING, Domains.SECURITIES_AND_INVESTMENT, Domains.INSURANCE, Domains.REAL_ESTATE].some(element => domain === element) ? 'Economics - Finance' : ([Domains.MUSIC, Domains.PAINTING, Domains.THEATER_AND_CINEMA, Domains.POETRY, Domains.EPIC, Domains.CHILDRENS_STORIES, Domains.HISTORICAL_STORIES, Domains.FICTION, Domains.SHORT_STORIES].some(element => domain === element) ? 'Literature - Arts' : ([Domains.PHYSICS, Domains.CHEMISTRY, Domains.INFORMATICS, Domains.ELECTRONICS, Domains.MEDICINE, Domains.MECHANICS, Domains.METEOROLOGY_AND_HYDROLOGY, Domains.AGRICULTURE].some(element => domain === element) ? 'Science - Technology' : ([Domains.LEGAL_DOCUMENTS, Domains.INTERNAL_DOCUMENTS, Domains.EMAIL].some(element => domain === element) ? 'Administrative documents' : 'Lifestyle')))]}\n- Handle special case:\n+ Numbers: Maintain the original numeric values, but adapt formats if necessary (e.g., decimal separators, digit grouping).\n+ Currencies: Convert currency symbols or codes as appropriate for the target language and region.\n+ Dates: Adjust date formats to match the conventions of the target language and culture.\n+ Proper nouns: Generally, do not translate names of people, places, or organizations unless there's a widely accepted equivalent in the target language.\n+ Units of measurement: if they cannot be translated into ${destLang}, convert the unit of measurement to an equivalent system in ${destLang}, but precise calculations are required when converting units and detailed\n### CHAIN OF THOUGHT: Lets thinks step by step to translate but only return the translation:\n1.  Depend on the Input text, find the context and insight of the text by answer all the question below:\n- What is this document about, what is its purpose, who is it for, what is the domain of this document\n- What should be noted when translating this document from ${originalLang} to ${destLang} to ensure the translation is accurate. Especially the technical parameters, measurement units, acronym, technical standards, unit standards are different between ${originalLang} and ${destLang}\n- What is ${originalLang} abbreviations in the context of the document should be understood correctly and translated accurately into ${destLang}. It is necessary to clearly understand the meaning of the abbreviation and not to mistake a ${originalLang} abbreviation for an ${destLang} word.\n- Always make sure that users of the language ${destLang} do not find it difficult to understand when reading\n2. Based on the instructions and rules in INSTRUCTION and what you learned in step 1, proceed to translate the text.\n3. Acting as a reader, give comments on the translation based on the following criteria:\n- Do you understand what the translation is talking about\n- Does the translation follow the rules given in the INSTRUCTION\n- Is the translation really good, perfect? \u200b\u200bIf not good, what is not good, what needs improvement?\n4. Based on the comments in step 3, revise the translation (if necessary).\n### STYLE INSTRUCTION:\n\n        The style of the output must be ${tone}:\n        -${TONE_INSTRUCTION_MAP[tone]}\n\n\n### ADVANCED MISSION (HIGHEST PRIORITY):\n${customDictionaryEnabled as boolean ? (customDictionary as Array<{ [key: string]: string }>).filter(element => element.originalLanguage === originalLanguage && element.destinationLanguage === destinationLanguage && text.includes(element.originalWord)).map(({ originalWord, destinationWord }) => `Must translate: ${originalWord} into ${destinationWord}`).join('\n') : ''}\n- Follow the instruction below when translate:\n${customPromptEnabled as boolean ? customPrompt as string : ''}\n### OUTPUT FORMAT MUST BE IN JSON:\n{\n"insight": "[In-depth understanding of the text from the analysis step]",\n"rule": "[Rules followed during translation]",\n"translated_string": "uuid: ${destLang} translation of the sentence when using rule\\n  uuid: ${destLang.replace(/E$/, 'e')} translation of the sentence when using rule\\n  .."\n}`)
        break
      }
      case SystemInstructions.GPT4OMINI:
      default: {
        const LANGUAGE_MAP: { [key: string]: string } = {
          'zh-cn': 'Chinese',
          'zh-tw': 'Chinese',
          en: 'English',
          ja: 'Japanese',
          vi: 'Vietnamese'
        }
        systemInstructions.push(`You will be provided with a user input in ${LANGUAGE_MAP[originalLanguage ?? ''] ?? 'English'}.\nTranslate the text into ${LANGUAGE_MAP[destinationLanguage]}.\nOnly output the translated text, without any additional text.`)
      }
    }
    return systemInstructions
  }

  private doctranslateIoResponsePostprocess (translatedTextWithUuid, textSentenceWithUuid): string {
    translatedTextWithUuid = translatedTextWithUuid.replace('({)\\n', '$1\n').replace(/(\\")?"?(?:(?:\n|\\n)?\})?(\n?(?:`{3})?)$/, '$1"\n}$2').replaceAll(/\n(?! *"(?:insight|rule|translated_string|[a-z0-9]{7,8}#[a-z0-9]{2,3})"|\}(?=\n?(?:`{3})?$))/g, '\\n').replace(/("translated_string": ")([[\s--\n]\S]+)(?=")/v, (_match, p1: string, p2: string) => `${p1}${p2.replaceAll(/([^\\])"/g, '$1\\"')}`)
    const jsonMatch = translatedTextWithUuid.match(/(\{[\s\S]+\})/)
    const potentialJsonString = (jsonMatch != null ? jsonMatch[0] : translatedTextWithUuid.replace(/^`{3}json\n/, '').replace(/\n`{3}$/, '')).replace(/insight": "[\s\S]+(?=translated_string": ")/, '')
    if (Utils.isValidJson(potentialJsonString)) {
      const parsedResult = JSON.parse(potentialJsonString)
      let translatedStringMap = {}
      if (typeof parsedResult.translated_string !== 'string') {
        translatedStringMap = parsedResult.translated_string
      } else if (Utils.isValidJson(parsedResult.translated_string)) {
        translatedStringMap = JSON.parse(parsedResult.translated_string)
      } else {
        const translatedStringParts = parsedResult.translated_string.split(/\s*([a-z0-9]{7,8}#[a-z0-9]{2,3}): (?:[a-z0-9]{7,8}#[a-z0-9]{2,3}: )?/).slice(1)
        for (let i = 0; i < translatedStringParts.length; i += 2) {
          translatedStringMap[translatedStringParts[i]] = translatedStringParts[i + 1].replace(/\n+$/, '')
        }
      }
      if (Object.keys(translatedStringMap ?? {}).length > 0) {
        return textSentenceWithUuid.split('\n').map(element => {
          const uuid = (element.match(/^[a-z0-9]{8}#[a-z0-9]{3}/) ?? [''])[0]
          return translatedStringMap[uuid] ?? ''
        }).join('\n')
      }
    }
    return ''
  }
}
export { MODELS, SystemInstructions, Translation, Translators }
