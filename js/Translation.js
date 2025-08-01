'use strict'
/* global crypto, fetch, JSON5 */
import {
  GoogleGenAI, HarmBlockThreshold, HarmCategory
// @ts-expect-error @google/genai
} from 'https://esm.run/@google/genai'
// @ts-expect-error groq-sdk
import { Groq } from 'https://esm.run/groq-sdk'
// @ts-expect-error openai
import OpenAI from 'https://esm.run/openai'
// // @ts-expect-error @tavily/core
// import { tavily } from 'https://esm.run/@tavily/core';
import Utils from './Utils.js'
const MODELS = {
  GOOGLE_GENAI: {
    'Gemini 2.5': [
      {
        modelId: 'gemini-2.5-pro',
        modelName: 'Gemini 2.5 Pro',
        selected: true
      },
      {
        modelId: 'gemini-2.5-flash',
        modelName: 'Gemini 2.5 Flash'
      },
      {
        modelId: 'gemini-2.5-flash-lite',
        modelName: 'Gemini 2.5 Flash Lite'
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
        modelId: 'gemma-3n-e2b-it',
        modelName: 'Gemma 3n E2B'
      },
      {
        modelId: 'gemma-3n-e4b-it',
        modelName: 'Gemma 3n E4B'
      },
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
      'o3-pro',
      'o3-pro-2025-06-10',
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
  },
  GROQ: {
    'Alibaba Cloud': [
      'qwen/qwen3-32b'
    ],
    'DeepSeek / Meta': ['deepseek-r1-distill-llama-70b'],
    Google: ['gemma2-9b-it'],
    Meta: [
      'llama-3.1-8b-instant',
      'llama-3.3-70b-versatile',
      'llama3-70b-8192',
      'llama3-8b-8192',
      'meta-llama/llama-4-maverick-17b-128e-instruct',
      {
        modelId: 'meta-llama/llama-4-scout-17b-16e-instruct',
        selected: true
      }
    ],
    Mistral: ['mistral-saba-24b'],
    'Moonshot AI': ['moonshotai/kimi-k2-instruct']
  }
}
let Domains;
(function (Domains) {
  Domains.BANKING = 'Banking'
  Domains.ACCOUNTING = 'Accounting'
  Domains.MANAGEMENT = 'Management'
  Domains.LAW = 'Law'
  Domains.LOGISTICS = 'Logistics'
  Domains.MARKETING = 'Marketing'
  Domains.SECURITIES_AND_INVESTMENT = 'Securities - Investment'
  Domains.INSURANCE = 'Insurance'
  Domains.REAL_ESTATE = 'Real Estate'
  Domains.MUSIC = 'Music'
  Domains.PAINTING = 'Painting'
  Domains.THEATER_AND_CINEMA = 'Theater - Cinema'
  Domains.GAMES = 'Games'
  Domains.POETRY = 'Poetry'
  Domains.EPIC = 'Epic'
  Domains.CHILDRENS_STORIES = "Children's Stories"
  Domains.HISTORICAL_STORIES = 'Historical Stories'
  Domains.FICTION = 'Fiction'
  Domains.SHORT_STORIES = 'Short Stories'
  Domains.PHYSICS = 'Physics'
  Domains.CHEMISTRY = 'Chemistry'
  Domains.INFORMATICS = 'Informatics'
  Domains.ELECTRONICS = 'Electronics'
  Domains.MEDICINE = 'Medicine'
  Domains.MECHANICS = 'Mechanics'
  Domains.METEOROLOGY_AND_HYDROLOGY = 'Meteorology - Hydrology'
  Domains.AGRICULTURE = 'Agriculture'
  Domains.LEGAL_DOCUMENTS = 'Legal Documents'
  Domains.INTERNAL_DOCUMENTS = 'Internal Documents'
  Domains.EMAIL = 'Email'
  Domains.HEALTH = 'Health'
  Domains.SPORTS = 'Sports'
  Domains.CULTURE_AND_TOURISM = 'Culture - Tourism'
  Domains.PRESS = 'Press'
  Domains.ANIMALS = 'Animals'
  Domains.NONE = 'None'
  Domains.FAST_TRANSLATION = 'Fast Translation'
})(Domains || (Domains = {}))
let Efforts;
(function (Efforts) {
  Efforts.LOW = 'low'
  Efforts.MEDIUM = 'medium'
  Efforts.HIGH = 'high'
})(Efforts || (Efforts = {}))
let SystemInstructions;
(function (SystemInstructions) {
  SystemInstructions.GPT4OMINI = 'gpt-4o-mini'
  SystemInstructions.COCCOC_EDU = 'coccocEdu'
  SystemInstructions.DOCTRANSLATE_IO = 'doctranslateIo'
})(SystemInstructions || (SystemInstructions = {}))
let Tones;
(function (Tones) {
  Tones.NONE = 'None'
  Tones.SERIOUS = 'Serious'
  Tones.FRIENDLY = 'Friendly'
  Tones.HUMOROUS = 'Humorous'
  Tones.FORMAL = 'Formal'
  Tones.ROMANTIC = 'Romantic'
})(Tones || (Tones = {}))
let Translators;
(function (Translators) {
  Translators.BAIDU_TRANSLATE = 'baiduTranslate'
  Translators.CHUTES_TRANSLATE = 'chutesTranslate'
  Translators.DEEPL_TRANSLATE = 'deeplTranslate'
  Translators.GOOGLE_GENAI_TRANSLATE = 'googleGenaiTranslate'
  Translators.GOOGLE_TRANSLATE = 'googleTranslate'
  Translators.GROQ_TRANSLATE = 'groqTranslate'
  Translators.LINGVANEX = 'lingvanex'
  Translators.MICROSOFT_TRANSLATOR = 'microsoftTranslator'
  Translators.OPENAI_TRANSLATOR = 'openaiTranslator'
  Translators.OPENROUTER_TRANSLATE = 'openrouterTranslate'
  Translators.PAPAGO = 'papago'
})(Translators || (Translators = {}))
class Translation {
  constructor (text, destLang, originalLang = null, options = {}) {
    this.responseText = ''
    this.translatedText = ''
    this.text = text
    this.destLang = destLang
    this.originalLang = originalLang
    this.abortController = new AbortController()
    options = {
      chutesModelId: 'deepseek-ai/DeepSeek-R1',
      customDictionary: [],
      customPrompt: '',
      doesStream: false,
      domain: Domains.NONE,
      effort: Efforts.MEDIUM,
      googleGenaiModelId: Object.values(MODELS.GOOGLE_GENAI).flat().filter(element => typeof element === 'object').find((element) => element.selected)?.modelId,
      groqModelId: Object.values(MODELS.GROQ).flat().filter(element => typeof element === 'object').find((element) => element.selected)?.modelId,
      isBilingualEnabled: false,
      isChutesWebSearchEnabled: false,
      isCustomDictionaryEnabled: false,
      isCustomPromptEnabled: false,
      isGroqWebSearchEnabled: false,
      isGroundingWithGoogleSearchEnabled: false,
      isOpenaiWebSearchEnabled: false,
      isOpenrouterWebSearchEnabled: false,
      isThinkingModeEnabled: true,
      openaiModelId: Object.values(MODELS.OPENAI).flat().filter(element => typeof element === 'object').find((element) => element.selected)?.modelId,
      openrouterModelId: 'openai/gpt-4o',
      systemInstruction: SystemInstructions.GPT4OMINI,
      temperature: 0.1,
      tone: Tones.SERIOUS,
      topP: 0.95,
      topK: -1,
      translatorId: Translators.GOOGLE_GENAI_TRANSLATE,
      ...options
    }
    const { B2B_AUTH_TOKEN, doesStream, systemInstruction, temperature, topP, topK, TVLY_API_KEY } = options
    this.B2B_AUTH_TOKEN = B2B_AUTH_TOKEN
    this.TVLY_API_KEY = TVLY_API_KEY
    const prompt = this.getPrompt(systemInstruction)
    const noEmptyLinesPrompt = prompt.replace(/^(?<=### TEXT SENTENCE WITH UUID:\n{)'[a-z0-9]{8}#[a-z0-9]{3}': '\s*', |, '[a-z0-9]{8}#[a-z0-9]{3}': '\s*'/g, '')
    // @ts-expect-error JSON5
    const textSentenceWithUuid = systemInstruction === SystemInstructions.DOCTRANSLATE_IO ? JSON5.parse(prompt.match(/(?<=^### TEXT SENTENCE WITH UUID:\n).+(?=\n### TRANSLATED TEXT WITH UUID:$)/s)[0]) : {}
    switch (options.translatorId) {
      case Translators.CHUTES_TRANSLATE:
        this.translateText = async (resolve) => {
          const { chutesModelId, CHUTES_API_TOKEN, isChutesWebSearchEnabled } = options
          const isNotDeepseekModel = !chutesModelId.startsWith('deepseek-ai/')
          const searchResults = isChutesWebSearchEnabled ? await this.webSearchWithTavily().then(value => value.map((element, index) => `[webpage ${index + 1} begin]${element}[webpage ${index + 1} end]`).join('\n')) : ''
          /* eslint-disable no-mixed-spaces-and-tabs */
          const response = await fetch('https://llm.chutes.ai/v1/chat/completions', {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${CHUTES_API_TOKEN}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              model: chutesModelId,
              messages: [
                /* eslint-enable no-mixed-spaces-and-tabs */
                ...await this.getSystemInstructions(options).then(value => value.map(element => ({
                  role: 'system',
                  content: element
                }))),
                {
                  role: 'user',
                  content: searchResults.length > 0 ? this.getWebSearchPrompt(searchResults, noEmptyLinesPrompt, isNotDeepseekModel) : prompt
                }
                /* eslint-disable no-mixed-spaces-and-tabs */
              ],
              stream: true,
              temperature: temperature > -1 ? temperature : 0.7,
              /* eslint-enable no-mixed-spaces-and-tabs */
              ...topP > -1 ? { top_p: topP } : {},
              ...topK > -1 ? { top_k: topK } : {}
            }), // eslint-disable-line no-mixed-spaces-and-tabs
            signal: this.abortController.signal
            /* eslint-disable no-mixed-spaces-and-tabs */
          })
          /* eslint-enable no-mixed-spaces-and-tabs */
          const reader = response.body?.getReader()
          if (!reader) {
            throw new Error('Response body is not readable')
          }
          const decoder = new TextDecoder()
          let buffer = ''
          try {
            while (true) { // eslint-disable-line no-constant-condition
              const { done, value } = await reader.read()
              if (done) { break }
              // Append new chunk to buffer
              buffer += decoder.decode(value, { stream: true })
              // Process complete lines from buffer
              while (true) { // eslint-disable-line no-constant-condition
                const lineEnd = buffer.indexOf('\n')
                if (lineEnd === -1) { break }
                const line = buffer.slice(0, lineEnd).trim()
                buffer = buffer.slice(lineEnd + 1)
                if (line.startsWith('data: ')) {
                  const data = line.slice(6)
                  if (data === '[DONE]') { break }
                  try {
                    const parsed = JSON.parse(data)
                    const content = parsed.choices[0].delta.content
                    if (content) {
                      this.responseText += content
                      if (this.responseText.startsWith('<think>') && !/<\/think>\n{1,2}/.test(this.responseText)) { continue } else if (this.responseText.startsWith('<think>')) { this.responseText = this.responseText.replace(/^<think>\n.+\n<\/think>\n{1,2}/s, '') }
                      this.translatedText = systemInstruction === SystemInstructions.DOCTRANSLATE_IO ? this.doctranslateIoPostprocess(this.responseText, textSentenceWithUuid) : this.responseText
                      if (this.translatedText.length === 0) { continue }
                      if (this.abortController.signal.aborted) { break }
                      resolve(this.translatedText, this.text, options)
                    }
                  } catch {
                    // Ignore invalid JSON
                  }
                }
              }
            }
          } finally {
            reader.cancel()
          }
        } // eslint-disable-line no-mixed-spaces-and-tabs
        break
      case Translators.GROQ_TRANSLATE: {
        const { groqModelId, GROQ_API_KEY, isGroqWebSearchEnabled } = options
        const groq = new Groq({ apiKey: GROQ_API_KEY, dangerouslyAllowBrowser: true })
        this.translateText = async (resolve) => {
          const isNotDeepseekModel = groqModelId !== 'deepseek-r1-distill-llama-70b'
          const searchResults = isGroqWebSearchEnabled ? await this.webSearchWithTavily().then(value => value.map((element, index) => `[webpage ${index + 1} begin]${element}[webpage ${index + 1} end]`).join('\n')) : ''
          const chatCompletion = await groq.chat.completions.create({
            messages: [
              ...await this.getSystemInstructions(options).then(value => value.map(element => ({
                role: 'system',
                content: element
              }))),
              {
                role: 'user',
                content: searchResults.length > 0 ? this.getWebSearchPrompt(searchResults, noEmptyLinesPrompt, isNotDeepseekModel) : prompt
              }
            ],
            model: groqModelId,
            temperature: temperature === -1 ? 1 : temperature,
            top_p: topP === -1 ? 1 : topP,
            stream: true,
            stop: null,
            ...['qwen-qwq-32b', 'deepseek-r1-distill-llama-70b'].some(element => element === groqModelId) ? { reasoning_format: 'hidden' } : {}
          })
          for await (const chunk of chatCompletion) {
            this.responseText += chunk.choices[0]?.delta?.content || ''
            this.translatedText = systemInstruction === SystemInstructions.DOCTRANSLATE_IO ? this.doctranslateIoPostprocess(this.responseText, textSentenceWithUuid) : this.responseText
            if (this.translatedText.length === 0) { continue }
            if (this.abortController.signal.aborted) { break }
            resolve(this.translatedText, this.text, options)
          }
        }
        break
      }
      case Translators.OPENAI_TRANSLATOR:
        this.translateText = async (resolve) => {
          const { effort, isOpenaiWebSearchEnabled, openaiModelId } = options
          const openai = new OpenAI({
            apiKey: '5N3NR9SDGLS7VLUWSEN9J30P',
            baseURL: 'https://gateway.api.airapps.co/aa_service=server5/aa_apikey=5N3NR9SDGLS7VLUWSEN9J30P//v3/proxy/open-ai/v1',
            fetchOptions: { signal: this.abortController.signal },
            defaultHeaders: { 'air-user-id': crypto.randomUUID() },
            dangerouslyAllowBrowser: true
          })
          const response = await openai.responses.create({
            model: openaiModelId,
            input: [
              ...await this.getSystemInstructions(options).then(value => value.map(element => ({
                role: MODELS.OPENAI.Reasoning.includes(openaiModelId) ? (openaiModelId.startsWith('o1-mini') ? 'user' : 'developer') : 'system',
                content: [
                  {
                    type: 'input_text',
                    text: element
                  }
                ]
              }))),
              {
                role: 'user',
                content: [
                  {
                    type: 'input_text',
                    text: noEmptyLinesPrompt
                  }
                ]
              }
            ],
            text: {
              format: {
                type: 'text'
              }
            },
            reasoning: MODELS.OPENAI.Reasoning.includes(openaiModelId) && effort !== 'medium'
              ? {
                  effort,
                  summary: 'auto'
                }
              : {
                  summary: 'auto'
                },
            tools: [
              ...isOpenaiWebSearchEnabled
                ? [{
                    type: 'web_search_preview',
                    user_location: {
                      type: 'approximate'
                    },
                    search_context_size: 'medium'
                  }]
                : []
            ],
            ...MODELS.OPENAI.Reasoning.includes(openaiModelId) ? {} : { temperature: temperature === -1 ? 1 : temperature },
            max_output_tokens: null,
            ...MODELS.OPENAI.Reasoning.includes(openaiModelId) ? {} : { top_p: topP === -1 ? 1 : topP },
            store: false,
            ...doesStream ? { stream: true } : {}
          })
          if (doesStream) {
            for await (const event of response) {
              if (event.type !== 'response.output_text.delta') { continue }
              this.responseText += event.delta
              this.translatedText = systemInstruction === SystemInstructions.DOCTRANSLATE_IO ? this.doctranslateIoPostprocess(this.responseText, textSentenceWithUuid) : this.responseText
              if (this.translatedText.length === 0) { continue }
              if (this.abortController.signal.aborted) { break }
              resolve(this.translatedText, this.text, options)
            }
          } else {
            this.responseText = response.output.filter((element) => element.type === 'message')[0].content[0].text
            this.translatedText = systemInstruction === SystemInstructions.DOCTRANSLATE_IO ? this.doctranslateIoPostprocess(this.responseText, textSentenceWithUuid) : this.responseText
            if (this.abortController.signal.aborted) { return }
            resolve(this.translatedText, this.text, options)
          }
        }
        break
      case Translators.OPENROUTER_TRANSLATE: {
        const { isOpenrouterWebSearchEnabled, openrouterModelId, OPENROUTER_API_KEY } = options
        const openai = new OpenAI({
          baseURL: 'https://openrouter.ai/api/v1',
          apiKey: OPENROUTER_API_KEY,
          dangerouslyAllowBrowser: true
        })
        this.translateText = async (resolve) => {
          const completion = await openai.chat.completions.create({
            model: openrouterModelId,
            messages: [
              ...await this.getSystemInstructions(options).then(value => value.map(element => ({
                role: 'system',
                content: element
              }))),
              {
                role: 'user',
                content: noEmptyLinesPrompt
              }
            ],
            ...temperature > -1 ? { temperature } : {},
            ...topP > -1 ? { top_p: topP } : {},
            ...topK > -1 ? { top_k: topK } : {},
            reasoning: { exclude: true },
            ...isOpenrouterWebSearchEnabled ? { plugins: [{ id: 'web' }] } : {},
            ...doesStream ? { stream: true } : {}
          }, { signal: this.abortController.signal })
          if (doesStream) {
            for await (const chunk of completion) {
              this.responseText += chunk.choices[0].delta.content ?? ''
              this.translatedText = systemInstruction === SystemInstructions.DOCTRANSLATE_IO ? this.doctranslateIoPostprocess(this.responseText, textSentenceWithUuid) : this.responseText
              if (this.translatedText.length === 0) { continue }
              if (this.abortController.signal.aborted) { return }
              resolve(this.translatedText, this.text, options)
            }
          } else {
            this.responseText = completion.choices[0].message.content
            this.translatedText = systemInstruction === SystemInstructions.DOCTRANSLATE_IO ? this.doctranslateIoPostprocess(this.responseText, textSentenceWithUuid) : this.responseText
            if (this.abortController.signal.aborted) { return }
            resolve(this.translatedText, this.text, options)
          }
        }
        break
      }
      case Translators.GOOGLE_GENAI_TRANSLATE:
      default:
        this.translateText = async (resolve) => {
          const { GEMINI_API_KEY, googleGenaiModelId, isGroundingWithGoogleSearchEnabled, isThinkingModeEnabled } = options
          const ai = new GoogleGenAI({
            apiKey: GEMINI_API_KEY
          })
          const tools = [
            ...isGroundingWithGoogleSearchEnabled ? [{ googleSearch: {} }] : []
          ]
          const config = {
            abortSignal: this.abortController.signal,
            ...temperature > -1 ? { temperature } : {},
            ...topP > -1 ? { topP } : {},
            ...topK > -1 ? { topK } : {},
            ...googleGenaiModelId.startsWith('gemini-2.5-flash') && !isThinkingModeEnabled
              ? {
                  thinkingConfig: {
                    includeThoughts: true,
                    thinkingBudget: 0
                  }
                }
              : {
                  thinkingConfig: {
                    includeThoughts: true
                  }
                },
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
            systemInstruction: await this.getSystemInstructions(options).then(value => value.map(element => ({
              text: element
            })))
          }
          const model = options.googleGenaiModelId
          const contents = [
            {
              role: 'user',
              parts: [
                {
                  text: `${noEmptyLinesPrompt}`
                }
              ]
            }
          ]
          const response = await ai.models.generateContentStream({
            model,
            config,
            contents
          })
          for await (const chunk of response) {
            this.responseText += chunk.text ?? ''
            this.translatedText = systemInstruction === SystemInstructions.DOCTRANSLATE_IO ? this.doctranslateIoPostprocess(this.responseText, textSentenceWithUuid) : this.responseText
            if (this.translatedText.length === 0) { continue }
            if (this.abortController.signal.aborted) { break }
            resolve(this.translatedText, this.text, options)
          }
        }
    }
  }

  async webSearchWithTavily () {
    // const client = tavily({ apiKey: TVLY_API_KEY });
    // return await client.search(this.text)
    // .then((value: { results: { title: string, content: string }[] }) => value.results.map(({ title, content }) => `# ${title}\n${content}`)) ?? [];
    const options = {
      method: 'POST',
      headers: { Authorization: `Bearer ${this.TVLY_API_KEY}`, 'Content-Type': 'application/json' },
      body: `{"query":"${this.text}"}`,
      signal: this.abortController.signal
    }
    return await fetch('https://api.tavily.com/search', options)
      .then(response => response.json())
      .then((response) => response.results.map(({ content }) => content))
  }

  getPrompt (systemInstruction) {
    switch (systemInstruction) {
      case SystemInstructions.DOCTRANSLATE_IO:
        return `### TEXT SENTENCE WITH UUID:
{${this.text.split('\n').map(element => {
                    const uuidParts = crypto.randomUUID().split('-')
                    return `'${uuidParts[0]}#${uuidParts[2].substring(1)}': ${element.includes("'") && !element.includes('"') ? `"${element.replace(/^\s+|\s+$/g, '').replace(/\\/g, '\\\\')}"` : `'${element.replace(/^\s+|\s+$/g, '').replace(/\\/g, '\\\\').replace(/'/g, "\\'")}'`}`
                }).join(', ')}}
### TRANSLATED TEXT WITH UUID:`
      default:
        return this.text.split('\n').filter(element => element.replace(/^\s+/, '').length > 0).join('\n')
    }
  }

  getWebSearchPrompt (searchResults, question, isEnglishQuery = false) {
    const dateTimeFormat = new Intl.DateTimeFormat(isEnglishQuery ? 'en' : 'zh-CN', {
      day: 'numeric',
      month: 'long',
      weekday: 'long',
      year: 'numeric'
    })
    const date = new Date()
    return isEnglishQuery
      ? `# The following contents are the search results related to the user's message:
${searchResults}
In the search results I provide to you, each result is formatted as [webpage X begin]...[webpage X end], where X represents the numerical index of each article. Please cite the context at the end of the relevant sentence when appropriate. Use the citation format [citation:X] in the corresponding part of your answer. If a sentence is derived from multiple contexts, list all relevant citation numbers, such as [citation:3][citation:5]. Be sure not to cluster all citations at the end; instead, include them in the corresponding parts of the answer.
When responding, please keep the following points in mind:
- Today is ${dateTimeFormat.format(date)}.
- Not all content in the search results is closely related to the user's question. You need to evaluate and filter the search results based on the question.
- For listing-type questions (e.g., listing all flight information), try to limit the answer to 10 key points and inform the user that they can refer to the search sources for complete information. Prioritize providing the most complete and relevant items in the list. Avoid mentioning content not provided in the search results unless necessary.
- For creative tasks (e.g., writing an essay), ensure that references are cited within the body of the text, such as [citation:3][citation:5], rather than only at the end of the text. You need to interpret and summarize the user's requirements, choose an appropriate format, fully utilize the search results, extract key information, and generate an answer that is insightful, creative, and professional. Extend the length of your response as much as possible, addressing each point in detail and from multiple perspectives, ensuring the content is rich and thorough.
- If the response is lengthy, structure it well and summarize it in paragraphs. If a point-by-point format is needed, try to limit it to 5 points and merge related content.
- For objective Q&A, if the answer is very brief, you may add one or two related sentences to enrich the content.
- Choose an appropriate and visually appealing format for your response based on the user's requirements and the content of the answer, ensuring strong readability.
- Your answer should synthesize information from multiple relevant webpages and avoid repeatedly citing the same webpage.
- Unless the user requests otherwise, your response should be in the same language as the user's question.
# The user's message is:
${question}`
      : `# 以下内容是基于用户发送的消息的搜索结果:
${searchResults}
在我给你的搜索结果中，每个结果都是[webpage X begin]...[webpage X end]格式的，X代表每篇文章的数字索引。请在适当的情况下在句子末尾引用上下文。请按照引用编号[citation:X]的格式在答案中对应部分引用上下文。如果一句话源自多个上下文，请列出所有相关的引用编号，例如[citation:3][citation:5]，切记不要将引用集中在最后返回引用编号，而是在答案对应部分列出。
在回答时，请注意以下几点：
- 今天${dateTimeFormat.format(date).replace(' ', '，')}。
- 并非搜索结果的所有内容都与用户的问题密切相关，你需要结合问题，对搜索结果进行甄别、筛选。
- 对于列举类的问题（如列举所有航班信息），尽量将答案控制在10个要点以内，并告诉用户可以查看搜索来源、获得完整信息。优先提供信息完整、最相关的列举项；如非必要，不要主动告诉用户搜索结果未提供的内容。
- 对于创作类的问题（如写论文），请务必在正文的段落中引用对应的参考编号，例如[citation:3][citation:5]，不能只在文章末尾引用。你需要解读并概括用户的题目要求，选择合适的格式，充分利用搜索结果并抽取重要信息，生成符合用户要求、极具思想深度、富有创造力与专业性的答案。你的创作篇幅需要尽可能延长，对于每一个要点的论述要推测用户的意图，给出尽可能多角度的回答要点，且务必信息量大、论述详尽。
- 如果回答很长，请尽量结构化、分段落总结。如果需要分点作答，尽量控制在5个点以内，并合并相关的内容。
- 对于客观类的问答，如果问题的答案非常简短，可以适当补充一到两句相关信息，以丰富内容。
- 你需要根据用户要求和回答内容选择合适、美观的回答格式，确保可读性强。
- 你的回答应该综合多个相关网页来回答，不能重复引用一个网页。
- 除非用户要求，否则你回答的语言需要和用户提问的语言保持一致。
# 用户消息为：
${question}`
  }

  async detectLanguage () {
    const options = {
      method: 'POST',
      headers: {
        accept: 'application/json',
        'content-type': 'application/json',
        Authorization: this.B2B_AUTH_TOKEN
      },
      body: JSON.stringify({ q: this.text }),
      signal: this.abortController.signal
    }
    return await fetch('https://api-gl.lingvanex.com/language/translate/v2/detect', options)
      .then(res => res.json())
      .then(res => res.data.detections[0][0].language.replace('-Hans', '-cn').replace('-Hant', '-tw').replace(/^ms$/, 'ms-MY').replace(/^tl$/, 'fil').replace(/^cs$/, 'cs-CZ'))
  }

  getDoctranslateIoInstruction (originalLang, destLang, domain, tone, customDictionary, isCustomDictionaryEnabled, isCustomPromptEnabled, customPrompt) {
    const LANGUAGE_MAP = {
      en: 'English',
      vi: 'Vietnamese',
      ja: 'Japanese',
      'zh-cn': 'Chinese (simplified)',
      'zh-tw': 'Chinese (traditional)',
      ko: 'Korean',
      es: 'Spanish',
      pt: 'Portuguese',
      ru: 'Russian',
      fr: 'French',
      de: 'German',
      it: 'Italian',
      hi: 'Hindi',
      th: 'Thai',
      tr: 'Turkish',
      el: 'Greek',
      ar: 'Arabic',
      nl: 'Dutch',
      pl: 'Polish',
      uk: 'Ukrainian',
      sv: 'Swedish',
      da: 'Danish',
      no: 'Norwegian',
      fi: 'Finnish',
      hu: 'Hungarian',
      id: 'Indonesian',
      'ms-MY': 'Malaysian',
      fil: 'Tagalog (Filipino)',
      bn: 'Bengali (Bangladesh)',
      lo: 'Lao',
      'cs-CZ': 'Czech'
    }
    const STYLE_INSTRUCTION_MAP = {
      Serious: `
    - Language should be neutral, precise and technical, avoiding emotional elements.
    - Make everything clear and logical.
    `,
      Friendly: `
    - Use language that is warm, approachable, and conversational.
    - Ensure the language feels natural and relaxed.
    `,
      Humorous: `
    - Language must be fun, light and humorous. Use jokes or creative expressions.
    - Must use entertaining words, wordplay, trendy words, words that young people often use.
    `,
      Formal: `
    - Utilize language that is formal, respectful, and professional. Employ complex sentence structures and maintain a formal register.
    - Choose polite, precise, and refined vocabulary.
    - Incorporate metaphors, idioms, parallel structures, and couplets where appropriate. Ensure that dialogue between characters is formal and well-ordered.
    - When relevant, use selectively chosen archaic or classical words, especially if the context pertains to historical or ancient settings.
    `,
      Romantic: `
    - Language must be emotional, poetic and artistic.
    - Choose flowery, sentimental, and erotic words.
    - The writing is gentle, focusing on subtle feelings about love and deep character emotions.
    `
    }
    const originalLanguage = LANGUAGE_MAP[originalLang] ?? LANGUAGE_MAP.en
    const upperCaseOriginalLanguage = originalLanguage.toUpperCase()
    const lowerCaseOriginalLanguage = originalLanguage.toLowerCase()
    const destinationLanguage = LANGUAGE_MAP[destLang] ?? LANGUAGE_MAP.en
    const upperCaseDestinationLanguage = destinationLanguage.toUpperCase()
    const lowerCaseDestinationLanguage = destinationLanguage.toLowerCase()
    let instructionQuestions = ''
    switch (`${originalLang}:${destLang}`) {
      case 'en:en':
        instructionQuestions = `When translating from ${originalLanguage} to ${destinationLanguage} in the domain of ${domain}, what are the special requirements to keep in mind?

What are the linguistic, grammatical and terminology considerations that need special attention when translating from ${originalLanguage} to ${destinationLanguage}?

What needs to be focused on to ensure the document in the target language is correct? Especially technical specifications, units of measurement, technical standards, unit standards that differ between ${originalLanguage} and ${destinationLanguage}. Give examples.

When translating the document from ${originalLanguage} into ${destinationLanguage} in the domain of ${domain}, what issues should be noted about proper names and proper nouns?

In addition to the above issues, are any other issues to keep in mind when translating from ${originalLanguage} to ${destinationLanguage} in the domain of ${domain}?`
        break
      case 'en:vi':
        instructionQuestions = `When translating from ${originalLanguage} to ${destinationLanguage} in the domain of ${domain}, what are the special requirements to keep in mind?

When translating from ${originalLanguage} to ${destinationLanguage} in the domain of ${domain}, what are the linguistic, grammatical, and terminology considerations that need special attention when translating?

When translating the document from ${originalLanguage} into ${destinationLanguage} in the domain of ${domain}, what needs to be focused on to ensure the document in the target language is correct? Especially technical specifications, units of measurement, technical standards, unit standards that differ between ${lowerCaseOriginalLanguage} and ${lowerCaseDestinationLanguage}. Give examples.

When translating the document from ${originalLanguage} into ${destinationLanguage} in the domain of ${domain}, what issues should be noted about proper names and proper nouns?

In addition to the above issues, are any other issues to keep in mind when translating? If so, list them all and answer as many and in as detail as possible.`
        break
      case 'vi:en':
        instructionQuestions = `What are the special requirements to keep in mind when translating is ensuring high accuracy and fidelity to the source text, even under potential time constraints implied by "${domain}," while producing a natural-sounding and culturally appropriate ${destinationLanguage} translation that is immediately usable by the target audience.

What are the linguistic, grammatical, and terminology considerations that need special attention when translating is recognizing the fundamental structural differences between ${originalLanguage} and ${destinationLanguage}.

What needs to be focused on to ensure the document in the target language is correct, especially technical specifications, units of measurement, technical standards, unit standards that differ between ${lowerCaseOriginalLanguage} and ${lowerCaseDestinationLanguage} is meticulous attention to detail for all numerical and technical data.

When translating the document from ${lowerCaseOriginalLanguage} into ${lowerCaseDestinationLanguage} in the domain ${domain}, what issues should be noted about proper names and proper nouns is handling names of people, places, organizations, and specific entities accurately and according to convention.

In addition to the above issues, are there any other issues to keep in mind when translating is considering the overall tone, style, and cultural nuances of the source text and ensuring they are appropriately conveyed in ${destinationLanguage}.`
        break
      case 'vi:vi':
        instructionQuestions = `When translating from ${originalLanguage} to ${destinationLanguage} in the domain of ${domain}, what are the special requirements to keep in mind?

What are the linguistic, grammatical and terminology considerations that need special attention when translating from ${originalLanguage} to ${destinationLanguage}?

What needs to be focused on to ensure the document in the target language is correct? Especially technical specifications, units of measurement, technical standards, unit standards that differ between ${originalLanguage} and ${destinationLanguage}. Give examples.

When translating the document from ${originalLanguage} into ${destinationLanguage} in the domain of ${domain}, what issues should be noted about proper names and proper nouns?

In addition to the above issues, are any other issues to keep in mind when translating from ${originalLanguage} to ${destinationLanguage} in the domain of ${domain}?`
        break
      case 'vi:zh-tw':
        instructionQuestions = `What are the special requirements to keep in mind when translating is ensuring high accuracy and fidelity to the source text, even under potential time constraints implied by "${domain}," while producing a natural-sounding and culturally appropriate ${destinationLanguage.replace('Chinese (Traditional)', 'Traditional Chinese')} translation that is immediately usable by the target audience.

What are the linguistic, grammatical, and terminology considerations that need special attention when translating is recognizing the fundamental structural differences between ${originalLanguage} and ${destinationLanguage.replace('Chinese (Traditional)', 'Traditional Chinese')}.

What needs to be focused on to ensure the document in the target language is correct, especially technical specifications, units of measurement, technical standards, unit standards that differ between ${originalLanguage} and ${destinationLanguage.replace('Chinese (Traditional)', 'Traditional Chinese')} is meticulous attention to detail for all numerical and technical data.

When translating the document from ${originalLanguage} into ${destinationLanguage.replace('Chinese (Traditional)', 'Traditional Chinese')} in the domain ${domain}, what issues should be noted about proper names and proper nouns is handling names of people, places, organizations, and specific entities accurately and according to convention.

In addition to the above issues, are there any other issues to keep in mind when translating is considering the overall tone, style, and cultural nuances of the source text and ensuring they are appropriately conveyed in ${destinationLanguage.replace('Chinese (Traditional)', 'Traditional Chinese')}.`
        break
      case 'vi:ko':
        instructionQuestions = `What are the special requirements to keep in mind when translating?

What are the linguistic, grammatical, and terminology considerations that need special attention when translating?

What needs to be focused on to ensure the document in the target language is correct? Especially technical specifications, units of measurement, technical standards, unit standards that differ between ${lowerCaseOriginalLanguage} and ${lowerCaseDestinationLanguage}. Give examples.

When translating the document from ${lowerCaseOriginalLanguage} into ${lowerCaseDestinationLanguage} in the domain ${domain}, what issues should be noted about proper names and proper nouns?

In addition to the above issues, are any other issues to keep in mind when translating?`
        break
      case 'ja:vi':
        instructionQuestions = `What are the special requirements to keep in mind when translating?

What are the linguistic, grammatical, and terminology considerations that need special attention when translating?

What needs to be focused on to ensure the document in the target language is correct? Especially technical specifications, units of measurement, technical standards, unit standards that differ between ${lowerCaseOriginalLanguage} and ${lowerCaseDestinationLanguage}. Give examples.

When translating the document from ${lowerCaseOriginalLanguage} into ${lowerCaseDestinationLanguage} in the domain ${domain}, what issues should be noted about proper names and proper nouns?

In addition to the above issues, are there any other issues to keep in mind when translating? If so, list them all and answer as many and in as much detail as possible.`
        break
      case 'zh-cn:vi':
        instructionQuestions = `What are the special requirements to keep in mind when translating?

What are the linguistic, grammatical, and terminology considerations that need special attention when translating?

What needs to be focused on to ensure the document in the target language is correct? Especially technical specifications, units of measurement, technical standards, unit standards that differ between ${lowerCaseOriginalLanguage} and ${lowerCaseDestinationLanguage}. Give examples.

When translating the document from ${lowerCaseOriginalLanguage} into ${lowerCaseDestinationLanguage} in the domain ${domain}, what issues should be noted about proper names and proper nouns?

In addition to the above issues, are there any other issues to keep in mind when translating? If so, list them all and answer as many and in as much detail as possible.`
        break
      case 'zh-tw:en':
        instructionQuestions = `When translating from ${originalLanguage.replace('Chinese (Traditional)', 'Traditional Chinese')} to ${destinationLanguage} in the domain of ${domain}, what are the special requirements to keep in mind?

What are the linguistic, grammatical and terminology considerations that need special attention when translating from ${originalLanguage.replace('Chinese (Traditional)', 'Traditional Chinese')} to ${destinationLanguage}?

What needs to be focused on to ensure the document in the target language is correct? Especially technical specifications, units of measurement, technical standards, unit standards that differ between ${originalLanguage.replace('Chinese (Traditional)', 'Traditional Chinese')} and ${destinationLanguage}. Give examples.

When translating the document from ${originalLanguage.replace('Chinese (Traditional)', 'Traditional Chinese')} into ${destinationLanguage} in the domain of ${domain}, what issues should be noted about proper names and proper nouns?

In addition to the above issues, are any other issues to keep in mind when translating?`
        break
      case 'ko:en':
        instructionQuestions = `What are the special requirements to keep in mind when translating from ${originalLanguage} to ${destinationLanguage} in the domain of ${domain}?

What are the linguistic, grammatical and terminology considerations that need special attention when translating from ${originalLanguage} to ${destinationLanguage}?

What needs to be focused on to ensure the document in the target language is correct, especially technical specifications, units of measurement, technical standards, unit standards that differ between ${originalLanguage} and ${destinationLanguage}?

When translating the document from ${originalLanguage} into ${destinationLanguage} in the domain of ${domain}, what issues should be noted about proper names and proper nouns?

In addition to the above issues, are there any other issues to keep in mind when translating from ${originalLanguage} to ${destinationLanguage} in the domain of ${domain}?`
        break
      case 'ko:vi':
        instructionQuestions = `What are the special requirements to keep in mind when translating?

What are the linguistic, grammatical, and terminology considerations that need special attention when translating?

What needs to be focused on to ensure the document in the target language is correct? Especially technical specifications, units of measurement, technical standards, unit standards that differ between ${lowerCaseOriginalLanguage} and ${lowerCaseDestinationLanguage}. Give examples.

When translating the document from ${lowerCaseOriginalLanguage} into ${lowerCaseDestinationLanguage} in the domain ${domain}, what issues should be noted about proper names and proper nouns?

In addition to the above issues, are there any other issues to keep in mind when translating? If so, list them all and answer as many and in as much detail as possible.`
        break
      case 'vi:ja':
      case 'vi:zh-cn':
      case 'ja:en':
      case 'zh-cn:en':
      case 'zh-tw:vi':
      default:
        instructionQuestions = `What are the special requirements to keep in mind when translating?

What are the linguistic, grammatical, and terminology considerations that need special attention when translating?

What needs to be focused on to ensure the document in the target language is correct? Especially technical specifications, units of measurement, technical standards, unit standards that differ between ${lowerCaseOriginalLanguage} and ${lowerCaseDestinationLanguage}. Give examples.

When translating the document from ${lowerCaseOriginalLanguage} into ${lowerCaseDestinationLanguage} in the domain ${domain}, what issues should be noted about proper names and proper nouns?

In addition to the above issues, are there any other issues to keep in mind when translating? If so, list them all and answer as many and in as much detail as possible.`
    }
    const styleInstruction = STYLE_INSTRUCTION_MAP[tone] ?? ''
    const customDictionaryInstruction = isCustomDictionaryEnabled ? `${customDictionary.filter(element => element.ori_lang === originalLang && element.des_lang === destLang && this.text.includes(element.ori_word)).map(({ ori_word, des_word }) => `Must translate: ${ori_word} into ${des_word}`).join('\n')}\n` : '' // eslint-disable-line camelcase
    const customInstruction = isCustomPromptEnabled ? `- Follow the instruction below when translate:\n${customPrompt}` : ''
    switch (`${originalLang}:${destLang}:${domain}`) {
      case `en:vi:${Domains.INFORMATICS}`:
        return `### ROLE:\nYou are a translation professional with many years of experience, able to translate accurately and naturally between languages. You have a good understanding of the grammar, vocabulary and style of both ENGLISH and VIETNAMESE. You also know how to maintain the original meaning and emotion of the text when translating.\n\n### INSTRUCTION:\n- Translate the following paragraphs into VIETNAMESE, ensuring each sentence is fully understood and free from confusion.\n- Avoid adding any new information, explaining or changing the meaning of the original text.\n- Each translated text segment must have a UUID that exactly matches the UUID of the original text segment.\n- The UUIDs must exactly correspond to the UUIDs in the original text. Do not make up your own UUIDs or confuse the UUIDs of one text with those of another.\n- Only translated into VIETNAMESE language, not into any other language other than VIETNAMESE\n- The only priority is translation, do not arbitrarily add your own thoughts and explanations that are not in the original text.\n- Do not insert additional notes or explanations with the words in the translation.\n- Spaces and line breaks must be kept intact, not changed or replaced with /t /n\n- If UUID not have text to translate, just return ""\n- Each UUID must seperate with other UUID only by\n, MUST not use other characters or symbols to separate UUID\n- There can only be 1 translation for 1 word, do not arbitrarily insert multiple translations/versions for 1 word For example: "you" must translate into "bạn" or "cậu", must not translate into "bạn/cậu"\n- Do not arbitrarily insert strange characters into the translation.\n- Follow the instruction for translate with domain Informatics:\nWhat are the special requirements to keep in mind when translating?\n- Maintaining accuracy and consistency of technical terminology throughout the document is paramount in Informatics translation.\n- Ensuring the translated text is clear, concise, and easily understandable by Vietnamese readers familiar with Informatics concepts.\n- Adapting the tone and style to suit the target audience while preserving the original meaning and technical precision.\n- Recognizing that Informatics documents often contain code snippets, commands, file paths, and user interface elements that require careful handling to avoid errors or misinterpretation.\n- Understanding the specific context of the document, whether it's a user manual, technical specification, research paper, or marketing material, influences translation choices.\n\nWhat are the linguistic, grammatical, and terminology considerations that need special attention when translating?\n- Terminology consistency is critical; using a consistent Vietnamese equivalent for each English technical term is essential.\n- Grammatical structures differ significantly between English and Vietnamese; sentences need to be restructured to flow naturally in Vietnamese while retaining the original meaning.\n- Vietnamese often uses classifiers and different word order compared to English, requiring careful adaptation.\n- Handling of technical jargon and acronyms requires deciding whether to use established Vietnamese terms, keep the English term, or use a common Vietnamese transliteration or explanation (though explanations themselves are outside the scope of this output).\n- Pay attention to verb tenses, passive voice (less common in Vietnamese technical writing), and pronoun usage which differ between the languages.\n\nWhat needs to be focused on to ensure the document in the target language is correct? Especially technical specifications, units of measurement, technical standards, unit standards that differ between english and vietnamese. Give examples.\n- Ensuring the precise translation of technical specifications, including numerical values, parameters, and configurations.\n- Converting units of measurement from systems like Imperial (common in some English contexts) to the metric system (standard in Vietnam) with accurate calculations.\n- Example: Translating "5 inches" requires converting to centimeters: 1 inch = 2.54 cm, so 5 inches = 5 * 2.54 cm = 12.7 cm. The translation should use "12.7 cm".\n- Example: Translating "10 feet" requires converting to meters: 1 foot = 0.3048 meters, so 10 feet = 10 * 0.3048 m = 3.048 m. The translation should use "3.048 m".\n- Example: Translating "2 pounds" requires converting to kilograms: 1 pound = 0.453592 kg, so 2 pounds = 2 * 0.453592 kg = 0.907184 kg. The translation should use "0.907184 kg".\n- Adhering to Vietnamese standards for formatting numbers (e.g., using a comma as the decimal separator and a period or space as the thousands separator, though this can vary and consistency is key).\n- Ensuring technical standards (e.g., ISO, IEEE, specific industry standards) are referenced correctly, often keeping the original standard name or number.\n- For currencies, if the currency name cannot be translated into Vietnamese, the standard three-letter currency code should be used (e.g., USD for United States Dollar, EUR for Euro, VND for Vietnamese Đồng). Do not arbitrarily convert currency values.\n\nWhen translating the document from english into vietnamese in the domain Informatics, what issues should be noted about proper names and proper nouns?\n- Proper names of companies (e.g., Microsoft, Google, Apple) are typically kept in their original English form.\n- Proper names of products (e.g., Windows, macOS, Android, iPhone, SQL Server) are usually retained in their original form.\n- Specific hardware or software component names (e.g., Intel Core i7, NVIDIA GeForce RTX 3080, Apache HTTP Server) are generally kept as is.\n- Acronyms for widely recognized technical terms (e.g., CPU, RAM, ROM, BIOS, API, URL, HTML, CSS) are often kept in their English form, as they are commonly used and understood in the Vietnamese Informatics community.\n- Names of specific algorithms, protocols, or standards (e.g., TCP/IP, HTTP, AES, OAuth 2.0) are usually kept in their original form or acronym.\n- User interface elements (button names, menu items, dialog box titles) should ideally match the localized version of the software if one exists; otherwise, they are often translated literally or kept in English depending on context and target audience familiarity.\n\nIn addition to the above issues, are any other issues to keep in mind when translating?\n- Handling of abbreviations and acronyms requires careful consideration, as English abbreviations may not be recognized or may have different meanings in Vietnamese; prioritize using the full term or a commonly accepted Vietnamese equivalent if one exists, or keeping the English acronym if it's standard in the field.\n- Consistency in formatting (bolding, italics, code blocks, lists) should be maintained from the source document.\n- Pay attention to placeholders or variables within code examples or command lines; these should typically be kept in their original form unless the context explicitly requires localization (which is rare in technical code).\n- Dates and times should be localized to Vietnamese format (e.g., DD/MM/YYYY or YYYY-MM-DD, 24-hour clock) unless a specific format is required by the technical context.\n- Numbers should follow Vietnamese conventions for decimal and thousands separators, ensuring consistency.\n- Be mindful of cultural nuances, although less prominent in highly technical Informatics texts, they can appear in introductory or concluding remarks, user interface metaphors, or examples.\n- Ensure that cross-references, links, and indices (if any) are correctly updated or maintained in the translated document.\n- Pay attention to image captions, diagrams, and figures; text within these elements may also require translation or localization.\n- Handle special case:\n+ Numbers: Maintain the original numeric values, but adapt formats if necessary (e.g., decimal separators, digit grouping).\n+ Currencies: Convert currency symbols or codes as appropriate for the target language and region.\n+ Dates: Adjust date formats to match the conventions of the target language and culture.\n+ Proper nouns: Generally, do not translate names of people, places, or organizations unless there's a widely accepted equivalent in the target language.\n+ Units of measurement: if they cannot be translated into VIETNAMESE, convert the unit of measurement to an equivalent system in VIETNAMESE, but precise calculations are required when converting units and detailed\n### CHAIN OF THOUGHT: Lets thinks step by step to translate but only return the translation:\n1. Depend on the Input text, find the context and insight of the text by answer all the question below:\n- What is this document about, what is its purpose, who is it for, what is the domain of this document\n- What should be noted when translating this document from ENGLISH to VIETNAMESE to ensure the translation is accurate. Especially the technical parameters, measurement units, acronym, technical standards, unit standards are different between ENGLISH and VIETNAMESE\n- What is ENGLISH abbreviations in the context of the document should be understood correctly and translated accurately into VIETNAMESE. It is necessary to clearly understand the meaning of the abbreviation and not to mistake a ENGLISH abbreviation for an VIETNAMESE word.\n- Always make sure that users of the language VIETNAMESE do not find it difficult to understand when reading\n2. Based on the instructions and rules in INSTRUCTION and what you learned in step 1, proceed to translate the text.\n3. Acting as a reader, give comments on the translation based on the following criteria:\n- Do you understand what the translation is talking about\n- Does the translation follow the rules given in the INSTRUCTION\n- Is the translation really good, perfect? ​​If not good, what is not good, what needs improvement?\n4. Based on the comments in step 3, revise the translation (if necessary).\n### STYLE INSTRUCTION:\n\n        The style of the output must be ${tone}:\n        - ${styleInstruction}\n        \n### ADVANCED MISSION (HIGHEST PRIORITY):\n${customDictionaryInstruction}\n${customInstruction}\n### OUTPUT FORMAT MUST BE IN JSON and must have only 3 fields:\n{\n"insight": "[In-depth understanding of the text from the analysis step]",\n"rule": "[Rules followed during translation]",\n"translated_string": "uuid: VIETNAMESE translation of the sentence when using rule ,\nuuid: VIETNAMESE translation of the sentence when using rule ,\n  .."\n}` // eslint-disable-line no-irregular-whitespace
      case `zh-cn:vi:${Domains.HISTORICAL_STORIES}`:
        return `### ROLE:\nYou are a translation professional with many years of experience, able to translate accurately and naturally between languages. You have a good understanding of the grammar, vocabulary and style of both zh-cn and VIETNAMESE. You also know how to maintain the original meaning and emotion of the text when translating.\n\n### INSTRUCTION:\n- Translate the following paragraphs into VIETNAMESE, ensuring each sentence is fully understood and free from confusion.\n- Avoid adding any new information, explaining or changing the meaning of the original text.\n- Each translated text segment must have a UUID that exactly matches the UUID of the original text segment.\n- The UUIDs must exactly correspond to the UUIDs in the original text. Do not make up your own UUIDs or confuse the UUIDs of one text with those of another.\n- Only translated into VIETNAMESE language, not into any other language other than VIETNAMESE\n- The only priority is translation, do not arbitrarily add your own thoughts and explanations that are not in the original text.\n- Do not insert additional notes or explanations with the words in the translation.\n- Spaces and line breaks must be kept intact, not changed or replaced with /t /n\n- If UUID not have text to translate, just return ""\n- Each UUID must seperate with other UUID only by\n, MUST not use other characters or symbols to separate UUID\n- There can only be 1 translation for 1 word, do not arbitrarily insert multiple translations/versions for 1 word For example: "you" must translate into "bạn" or "cậu", must not translate into "bạn/cậu"\n- Follow the instruction for translate with domain Historical Stories:\nWhat are the special requirements to keep in mind when translating?\n- Special requirements include accurately conveying the historical context, cultural nuances, and specific terminology of the period being described.\n- Maintaining the appropriate tone and register of historical narratives is crucial, often requiring a more formal or archaic style in Vietnamese.\n- Understanding the historical relationship and cultural exchange between China and Vietnam is essential to correctly interpret and render historical events and figures.\n- Ensuring consistency in the translation of recurring terms, names, and concepts throughout the document is paramount.\n\nWhat are the linguistic, grammatical, and terminology considerations that need special attention when translating?\n- Linguistic considerations involve the influence of Classical Chinese on the source text and finding appropriate Vietnamese equivalents or explanations for archaic vocabulary and sentence structures.\n- Grammatical considerations include adapting Chinese sentence patterns, which can differ significantly from Vietnamese, to ensure natural flow and clarity in the target language.\n- Terminology requires meticulous attention, especially for historical titles, official ranks, administrative divisions, military units, and specific historical events, which often have established or preferred Vietnamese translations.\n- Idioms, proverbs, and literary allusions rooted in Chinese history and literature need careful handling to convey their meaning accurately, sometimes requiring adaptation or explanation if direct equivalents are not readily understood in Vietnamese.\n\nWhat needs to be focused on to ensure the document in the target language is correct? Especially technical specifications, units of measurement, technical standards, unit standards that differ between chinese (simplified) and vietnamese. Give examples.\n- To ensure correctness, focus on precise conversion or appropriate representation of technical specifications and units of measurement that differ between historical Chinese systems and modern Vietnamese understanding.\n- For units of measurement common in historical Chinese texts, convert them to their approximate modern metric equivalents or use established Vietnamese historical units if they exist and are understandable.\n- Example: A Chinese 里 (lǐ) historically varied but is often approximated as 0.5 kilometers. If a text mentions "十里" (shí lǐ), translate it as "khoảng 5 kilômét" (khoảng 5 km).\n- Example: A Chinese 亩 (mǔ) is approximately 666.7 square meters. If a text mentions "百亩地" (bǎi mǔ dì), translate it as "khoảng 66.670 mét vuông đất" (khoảng 66.670 m² đất).\n- Example: A Chinese 斤 (jīn) is 0.5 kilograms. If a text mentions "五斤米" (wǔ jīn mǐ), translate it as "2,5 kilôgam gạo" (2,5 kg gạo).\n- Example: A Chinese 尺 (chǐ) historically varied but is often approximated as 0.33 meters. If a text mentions "三尺长" (sān chǐ cháng), translate it as "khoảng 1 mét chiều dài" (khoảng 1 m chiều dài).\n- For historical currencies like 文 (wén - copper coin), 两 (liǎng - tael of silver/gold), or 贯 (guàn - string of coins), use the currency code or the original term if no standard Vietnamese equivalent exists, avoiding arbitrary conversion to modern currencies. For instance, refer to "白银十两" (bái yín shí liǎng) as "mười lượng bạc" or "10 lượng bạc" if 'lượng' is understood in context, or specify "10 tael bạc". If referring to a specific historical currency like the Tang Dynasty's Kaiyuan Tongbao (开元通宝), use the specific name or a recognized equivalent.\n\nWhen translating the document from chinese (simplified) into vietnamese in the domain Historical Stories, what issues should be noted about proper names and proper nouns?\n- Issues with proper names and proper nouns include identifying historical figures (people), place names (cities, regions, mountains, rivers), dynasty names, and specific event names.\n- For historical figures, use established Vietnamese names if they exist (e.g., 曹操 (Cáo Cāo) is Tào Tháo, 诸葛亮 (Zhūgě Liàng) is Gia Cát Lượng). If no standard name exists, use a consistent transliteration based on Mandarin pronunciation, often following established Vietnamese transliteration conventions for Chinese names.\n- For place names, use historical Vietnamese names if they correspond to the Chinese place (e.g., 交趾 (Jiāozhǐ) is Giao Chỉ). Otherwise, use a consistent transliteration or a recognized historical name if available.\n- Dynasty names (e.g., 唐朝 (Táng Cháo), 宋朝 (Sòng Cháo)) should use their standard Vietnamese equivalents (Nhà Đường, Nhà Tống).\n- Event names (e.g., 赤壁之战 (Chìbì zhī Zhàn)) should use their standard Vietnamese historical names (Trận Xích Bích).\n- Titles and ranks (e.g., 皇帝 (Huángdì), 丞相 (Chéngxiàng), 将军 (Jiāngjūn)) should be translated using the correct historical Vietnamese terms (Hoàng đế, Thừa tướng, Tướng quân).\n- Consistency in the translation of all proper names and nouns throughout the document is absolutely critical to avoid confusion.\n\nIn addition to the above issues, are there any other issues to keep in mind when translating?\n- Other issues include accurately translating cultural references, such as customs, rituals, social etiquette, and daily life details specific to the historical period.\n- Understanding and correctly rendering terms related to social hierarchy, kinship terms, and forms of address is important as they reflect social relationships.\n- Military terminology, including types of weapons, armor, military formations, and strategies, requires specific knowledge to translate accurately.\n- Religious and philosophical concepts (e.g., Confucian virtues, Taoist principles, Buddhist terms) need to be translated in a way that is understandable within the historical context.\n- Descriptions of clothing, architecture, art, and technology of the period should be translated using appropriate and understandable terminology.\n- Maintaining the narrative style, whether formal, epic, or biographical, is important for preserving the character of the historical document.\n- Ensuring that the translated text flows naturally and is easily understood by a Vietnamese reader familiar with historical narratives is a key goal.\n- Handle special case:\n+ Numbers: Maintain the original numeric values, but adapt formats if necessary (e.g., decimal separators, digit grouping).\n+ Currencies: Convert currency symbols or codes as appropriate for the target language and region.\n+ Dates: Adjust date formats to match the conventions of the target language and culture.\n+ Proper nouns: Generally, do not translate names of people, places, or organizations unless there's a widely accepted equivalent in the target language.\n+ Units of measurement: if they cannot be translated into VIETNAMESE, convert the unit of measurement to an equivalent system in VIETNAMESE, but precise calculations are required when converting units and detailed\n### PROCESSING OF FORM OF ADDRESS BETWEEN CHARACTERS (HIGHEST PRIORITY):\n- All proper names and place names must be fully translated into VIETNAMESE if there is a common transliteration in VIETNAMESE and it would make the translation easier for readers in the VIETNAMESE language to understand.\n- All pronouns and forms of address in all person of all characters must be EXTREMELY appropriate to the position and role of the characters as determined.\n- Ensure ABSOLUTE CONSISTENT in the form of address, proper names, place names in the entire translated text, do not translate differently with the same word\n- Ensure ABSOLUTE CONSISTENT the way characters address each other, only changing the way they address each other when the relationship between the characters changes significantly\n- The way characters address each other MUST accurately reflect their social position, role and relative relationship according to the Character Address Chart.\n- Ensure the way characters address each other is CORRECT and CONSISTENT according to the Character Address Table provided.\n- Strictly adhere to how characters address each other and themselves as defined in the Character Address Table.\n- The Character Address Table provides detailed information about:\n+ How each character addresses themselves (first person pronouns) to each other\n+ How each character addresses others (second person pronouns)\n+ Relationships between characters (rank, social status, level of intimacy)\n+ Special terms of address between characters\n- DO NOT change or create a form of address that differs from the Character Address Table provided.\n- When a character speaks to multiple people or to a group of people, determine the appropriate form of address based on the Character Address Table.\n- When characters reminisce about the past, address each other in a way that is appropriate to the characters' relationship and circumstances at that point in the past\n- When a situation is unclear or not defined in the Address Table, use the closest form of address available in the Table for the same relationship.\n### CHAIN ​​OF THOUGHT: Think step by step to translate but only return the translation:\n\n1. Based on the input text, find the context and understand the text deeply by answering all the questions below:\n\n- What is this text about, what is the purpose, who is it for, what is the field of this text\n- What should be noted when translating this text from zh-cn to VIETNAMESE to ensure accurate translation. Especially the specifications, units of measurement, abbreviations, technical standards, unit standards are different between zh-cn and VIETNAMESE\n- Abbreviations in zh-cn in the context of the text should be understood correctly and translated correctly into VIETNAMESE. It is necessary to clearly understand the meaning of the abbreviation and not confuse the abbreviation in zh-cn with the word in VIETNAMESE.\n\n- Always make sure that users of the VIETNAMESE language have no difficulty reading and understanding\n- Identify all characters and their relationships to apply the correct form of address according to the Character Address Table provided\n- Consider the cultural, time, and social context of the story to ensure appropriate and natural form of address\n- Are the characters' ways of addressing each other consistent (all persons and especially in dialogue): Highest priority\n2. Based on the instructions and rules in INSTRUCTION and what you learned in step 1, translate the text.\n3. Acting as a reader, comment on the translation based on the following criteria:\n- Do you understand what the translation is talking about?\n- Does the translation follow the rules stated in INSTRUCTION?\n- Is the translation really good, perfect? ​​If not good, what is not good, what needs to be improved?\n- Are the characters' ways of addressing each other consistent (all persons and especially in dialogue): Highest priority\n- Is the form of address between characters consistent with the Character Address Table?\n4. Based on the comments in step 3, edit the translation (if necessary).\n### STYLE INSTRUCTION:\n\n        The style of the output must be ${tone}:\n        - ${styleInstruction}\n        \n### ADVANCED MISSION (HIGHEST PRIORITY):\n${customDictionaryInstruction}\n${customInstruction}\n### OUTPUT FORMAT MUST BE IN JSON and must have only 3 fields:\n{\n"insight": "[In-depth understanding of the text from the analysis step]",\n"rule": "[Rules followed during translation]",\n"translated_string": "uuid: VIETNAMESE translation of the sentence when using rule ,\nuuid: VIETNAMESE translation of the sentence when using rule ,\n  .."\n}` // eslint-disable-line no-irregular-whitespace
      case `zh-cn:vi:${Domains.FICTION}`:
        return `### ROLE:\nYou are a translation professional with many years of experience, able to translate accurately and naturally between languages. You have a good understanding of the grammar, vocabulary and style of both zh-cn and VIETNAMESE. You also know how to maintain the original meaning and emotion of the text when translating.\n\n### INSTRUCTION:\n- Translate the following paragraphs into VIETNAMESE, ensuring each sentence is fully understood and free from confusion.\n- Avoid adding any new information, explaining or changing the meaning of the original text.\n- Each translated text segment must have a UUID that exactly matches the UUID of the original text segment.\n- The UUIDs must exactly correspond to the UUIDs in the original text. Do not make up your own UUIDs or confuse the UUIDs of one text with those of another.\n- Only translated into VIETNAMESE language, not into any other language other than VIETNAMESE\n- The only priority is translation, do not arbitrarily add your own thoughts and explanations that are not in the original text.\n- Do not insert additional notes or explanations with the words in the translation.\n- Spaces and line breaks must be kept intact, not changed or replaced with /t /n\n- If UUID not have text to translate, just return ""\n- Each UUID must seperate with other UUID only by \n, MUST not use other characters or symbols to separate UUID\n- There can only be 1 translation for 1 word, do not arbitrarily insert multiple translations/versions for 1 word For example: "you" must translate into "bạn" or "cậu", must not translate into "bạn/cậu"\n- Follow the instruction for translate with domain Fiction:\nWhat are the special requirements to keep in mind when translating?\n- Maintaining the author's unique voice, tone, and style throughout the translation is crucial for fiction.\n- Accurately conveying the emotional depth, nuances, and subtext present in the original Chinese text is essential.\n- Adapting cultural references and context so they resonate with a Vietnamese audience without losing the original meaning or flavor.\n- Ensuring consistency in character portrayal, plot points, and world-building elements established in the source text.\n- Understanding the specific genre conventions (e.g., Wuxia, Xianxia, Romance, Sci-Fi) and applying appropriate linguistic and stylistic choices in Vietnamese.\n\nWhat are the linguistic, grammatical, and terminology considerations that need special attention when translating?\n- Handling differences in sentence structure and flow between Chinese and Vietnamese to create natural-sounding prose.\n- Translating idiomatic expressions, slang, and colloquialisms accurately while finding equivalent or understandable Vietnamese phrases.\n- Navigating the complex system of honorifics and terms of address in both languages to reflect character relationships and social hierarchy correctly.\n- Addressing specific terminology related to the fiction's genre, such as martial arts techniques, cultivation levels, magical spells, or historical ranks, ensuring consistency and clarity.\n- Paying attention to grammatical nuances like classifiers, verb aspects, and particle usage that differ significantly between the two languages.\n\nWhat needs to be focused on to ensure the document in the target language is correct? Especially technical specifications, units of measurement, technical standards, unit standards that differ between chinese (simplified) and vietnamese. Give examples.\n- Ensuring accuracy in factual details, even within a fictional context, such as historical periods, geographical locations, or scientific concepts mentioned.\n- For units of measurement, convert Chinese units (市制) to their metric equivalents commonly used in Vietnam, providing precise calculations.\n- Example: 1 斤 (jin) is approximately 0.5 kilograms (kg). If a character buys 5 斤 of rice, translate it as 2.5 kg of rice.\n- Example: 1 亩 (mu) is approximately 666.67 square meters (m²). If a character owns 10 亩 of land, translate it as 6666.7 m² of land.\n- Example: 1 里 (li) is approximately 500 meters (m). If a character travels 3 里, translate it as 1500 m or 1.5 km.\n- For currencies, if the currency is a real-world currency like Chinese Yuan, use the currency code CNY.\n- If the currency is fictional, maintain the fictional name consistently throughout the translation.\n- Technical specifications or standards, if mentioned, should be translated accurately based on their real-world meaning or maintained consistently if they are fictional constructs within the story.\n\nWhen translating the document from chinese (simplified) into vietnamese in the domain Fiction, what issues should be noted about proper names and proper nouns?\n- Deciding whether to transliterate character names (based on Mandarin pronunciation, often using Pinyin as a guide) or find culturally resonant Vietnamese equivalents, and maintaining consistency once a method is chosen.\n- Handling names of places, organizations, and fictional entities (like sects, clans, magical items) by either transliterating, translating their meaning, or using a combination, ensuring clarity and consistency.\n- Being mindful of potential unintended meanings or pronunciations when transliterating names into Vietnamese.\n- Ensuring that the chosen translation method for names aligns with the genre and overall tone of the fiction.\n- Maintaining a glossary of names and terms to ensure absolute consistency throughout the entire work, especially for long series.\n\nIn addition to the above issues, are there any other issues to keep in mind when translating?\n- Translating cultural references, proverbs, idioms, and historical allusions in a way that is understandable and impactful for a Vietnamese audience, potentially requiring adaptation rather than direct translation.\n- Capturing the intended humor, sarcasm, or irony, which often relies heavily on cultural context and linguistic nuances.\n- Ensuring dialogue sounds natural and reflects the characters' personalities, social status, and relationships accurately in Vietnamese.\n- Maintaining the pacing and rhythm of the original narrative, especially during action sequences or emotionally charged scenes.\n- Handling onomatopoeia and descriptive sounds, finding appropriate Vietnamese equivalents that convey the same sensory experience.\n- Addressing potential sensitivities related to cultural, historical, or political content, ensuring the translation is appropriate for the target audience and market.\n- Handle special case:\n+ Numbers: Maintain the original numeric values, but adapt formats if necessary (e.g., decimal separators, digit grouping).\n+ Currencies: Convert currency symbols or codes as appropriate for the target language and region.\n+ Dates: Adjust date formats to match the conventions of the target language and culture.\n+ Proper nouns: Generally, do not translate names of people, places, or organizations unless there's a widely accepted equivalent in the target language.\n+ Units of measurement: if they cannot be translated into VIETNAMESE, convert the unit of measurement to an equivalent system in VIETNAMESE, but precise calculations are required when converting units and detailed\n### PROCESSING OF FORM OF ADDRESS BETWEEN CHARACTERS (HIGHEST PRIORITY):\n- All proper names and place names must be fully translated into VIETNAMESE if there is a common transliteration in VIETNAMESE and it would make the translation easier for readers in the VIETNAMESE language to understand.\n- All pronouns and forms of address in all person of all characters must be EXTREMELY appropriate to the position and role of the characters as determined.\n- Ensure ABSOLUTE CONSISTENT in the form of address, proper names, place names in the entire translated text, do not translate differently with the same word\n- Ensure ABSOLUTE CONSISTENT the way characters address each other, only changing the way they address each other when the relationship between the characters changes significantly\n- The way characters address each other MUST accurately reflect their social position, role and relative relationship according to the Character Address Chart.\n- Ensure the way characters address each other is CORRECT and CONSISTENT according to the Character Address Table provided.\n- Strictly adhere to how characters address each other and themselves as defined in the Character Address Table.\n- The Character Address Table provides detailed information about:\n+ How each character addresses themselves (first person pronouns) to each other\n+ How each character addresses others (second person pronouns)\n+ Relationships between characters (rank, social status, level of intimacy)\n+ Special terms of address between characters\n- DO NOT change or create a form of address that differs from the Character Address Table provided.\n- When a character speaks to multiple people or to a group of people, determine the appropriate form of address based on the Character Address Table.\n- When characters reminisce about the past, address each other in a way that is appropriate to the characters' relationship and circumstances at that point in the past\n- When a situation is unclear or not defined in the Address Table, use the closest form of address available in the Table for the same relationship.\n### CHAIN OF THOUGHT: Think step by step to translate but only return the translation:\n\n1. Based on the input text, find the context and understand the text deeply by answering all the questions below:\n\n- What is this text about, what is the purpose, who is it for, what is the field of this text\n- What should be noted when translating this text from zh-cn to VIETNAMESE to ensure accurate translation. Especially the specifications, units of measurement, abbreviations, technical standards, unit standards are different between zh-cn and VIETNAMESE\n- Abbreviations in zh-cn in the context of the text should be understood correctly and translated correctly into VIETNAMESE. It is necessary to clearly understand the meaning of the abbreviation and not confuse the abbreviation in zh-cn with the word in VIETNAMESE.\n\n- Always make sure that users of the VIETNAMESE language have no difficulty reading and understanding\n- Identify all characters and their relationships to apply the correct form of address according to the Character Address Table provided\n- Consider the cultural, time, and social context of the story to ensure appropriate and natural form of address\n- Are the characters' ways of addressing each other consistent (all persons and especially in dialogue): Highest priority\n2. Based on the instructions and rules in INSTRUCTION and what you learned in step 1, translate the text.\n3. Acting as a reader, comment on the translation based on the following criteria:\n- Do you understand what the translation is talking about?\n- Does the translation follow the rules stated in INSTRUCTION?\n- Is the translation really good, perfect? ​​If not good, what is not good, what needs to be improved?\n- Are the characters' ways of addressing each other consistent (all persons and especially in dialogue): Highest priority\n- Is the form of address between characters consistent with the Character Address Table?\n4. Based on the comments in step 3, edit the translation (if necessary).\n### STYLE INSTRUCTION:\n\n        The style of the output must be ${tone}:\n        -${styleInstruction}\n        \n### ADVANCED MISSION (HIGHEST PRIORITY):\n${customDictionaryInstruction}\n${customInstruction}\n### OUTPUT FORMAT MUST BE IN JSON and must have only 3 fields:\n{\n"insight": "[In-depth understanding of the text from the analysis step]",\n"rule": "[Rules followed during translation]",\n"translated_string": "uuid: VIETNAMESE translation of the sentence when using rule ,\nuuid: VIETNAMESE translation of the sentence when using rule ,\n  .."\n}` // eslint-disable-line no-irregular-whitespace
      default:
        return `### ROLE:
You are a translation professional with many years of experience, able to translate accurately and naturally between languages. You have a good understanding of the grammar, vocabulary and style of both ${upperCaseOriginalLanguage} and ${upperCaseDestinationLanguage}. You also know how to maintain the original meaning and emotion of the text when translating.

### INSTRUCTION:
${`- Translate the following paragraphs into ${upperCaseDestinationLanguage}, ensuring each sentence is fully understood and free from confusion.
- Avoid adding any new information, explaining or changing the meaning of the original text.
- Each translated text segment must have a UUID that exactly matches the UUID of the original text segment.
- The UUIDs must exactly correspond to the UUIDs in the original text. Do not make up your own UUIDs or confuse the UUIDs of one text with those of another.
- Only translated into ${upperCaseDestinationLanguage} language, not into any other language other than ${upperCaseDestinationLanguage}
- The only priority is translation, do not arbitrarily add your own thoughts and explanations that are not in the original text.
- Do not insert additional notes or explanations with the words in the translation.
- Spaces and line breaks must be kept intact, not changed or replaced with /t /n
- If UUID not have text to translate, just return ""
- Each UUID must seperate with other UUID only by 
, MUST not use other characters or symbols to separate UUID
- There can only be 1 translation for 1 word, do not arbitrarily insert multiple translations/versions for 1 word For example: "you" must translate into "bạn" or "cậu", must not translate into "bạn/cậu"
- Do not arbitrarily insert strange characters into the translation.
- Follow the instruction for translate with domain ${domain}:
${instructionQuestions}
- Handle special case:
+ Numbers: Maintain the original numeric values, but adapt formats if necessary (e.g., decimal separators, digit grouping).
+ Currencies: Convert currency symbols or codes as appropriate for the target language and region.
+ Dates: Adjust date formats to match the conventions of the target language and culture.
+ Proper nouns: Generally, do not translate names of people, places, or organizations unless there's a widely accepted equivalent in the target language.
+ Units of measurement: if they cannot be translated into ${upperCaseDestinationLanguage}, convert the unit of measurement to an equivalent system in ${upperCaseDestinationLanguage}, but precise calculations are required when converting units and detailed`}
### CHAIN OF THOUGHT: Lets thinks step by step to translate but only return the translation:
1.  Depend on the Input text, find the context and insight of the text by answer all the question below:
- What is this document about, what is its purpose, who is it for, what is the domain of this document
- What should be noted when translating this document from ${upperCaseOriginalLanguage} to ${upperCaseDestinationLanguage} to ensure the translation is accurate. Especially the technical parameters, measurement units, acronym, technical standards, unit standards are different between ${upperCaseOriginalLanguage} and ${upperCaseDestinationLanguage}
- What is ${upperCaseOriginalLanguage} abbreviations in the context of the document should be understood correctly and translated accurately into ${upperCaseDestinationLanguage}. It is necessary to clearly understand the meaning of the abbreviation and not to mistake a ${upperCaseOriginalLanguage} abbreviation for an ${upperCaseDestinationLanguage} word.
- Always make sure that users of the language ${upperCaseDestinationLanguage} do not find it difficult to understand when reading
2. Based on the instructions and rules in INSTRUCTION and what you learned in step 1, proceed to translate the text.
3. Acting as a reader, give comments on the translation based on the following criteria:
- Do you understand what the translation is talking about
- Does the translation follow the rules given in the INSTRUCTION
- Is the translation really good, perfect? ​​If not good, what is not good, what needs improvement?${'' /* eslint-disable-line no-irregular-whitespace */}
4. Based on the comments in step 3, revise the translation (if necessary).
### STYLE INSTRUCTION:

        The style of the output must be ${tone}:
        - ${styleInstruction}
        
### ADVANCED MISSION (HIGHEST PRIORITY):
${customDictionaryInstruction}
${customInstruction}
### OUTPUT FORMAT MUST BE IN JSON and must have only 3 fields:
{
"insight": "[In-depth understanding of the text from the analysis step]",
"rule": "[Rules followed during translation]",
"translated_string": "uuid: ${upperCaseDestinationLanguage} translation of the sentence when using rule ,
uuid: ${upperCaseDestinationLanguage} translation of the sentence when using rule ,
  .."
}`
    }
  }

  async getSystemInstructions (options) {
    const systemInstructions = []
    const detectedLanguage = this.originalLang == null ? await this.detectLanguage() : ''
    switch (options.systemInstruction) {
      case SystemInstructions.COCCOC_EDU: {
        const LANGUAGE_MAP = {
          en: 'English',
          vi: 'Vietnamese',
          ar: 'Arabic',
          pl: 'Polish',
          bn: 'Bengali',
          pt: 'Portuguese', // Tiếng Bồ Đào Nha (Brazil)
          da: 'Danish',
          de: 'German',
          nl: 'Dutch',
          ko: 'Korean',
          hi: 'Hindi',
          hu: 'Hungarian',
          el: 'Greek',
          id: 'Indonesian',
          lo: 'Lao',
          'ms-MY': 'Malay',
          no: 'Norwegian',
          ru: 'Russian',
          ja: 'Japanese',
          fi: 'Finnish',
          fr: 'French',
          fil: 'Filipino',
          'cs-CZ': 'Czech',
          es: 'Spanish',
          th: 'Thai',
          tr: 'Turkish',
          sv: 'Swedish',
          'zh-cn': 'Chinese (Simplified)',
          'zh-tw': 'Chinese (Traditional)',
          uk: 'Ukrainian',
          it: 'Italian'
        }
        const toLanguage = LANGUAGE_MAP[this.destLang]
        const fromLanguage = LANGUAGE_MAP[this.originalLang ?? detectedLanguage]
        systemInstructions.push(`I want you to act as a ${toLanguage} translator.
You are trained on data up to October 2023.`)
        systemInstructions.push(`I will speak to you in ${fromLanguage != null ? `${fromLanguage} and you will ` : 'any language and you will detect the language, '}translate it and answer in the corrected version of my text, exclusively in ${toLanguage}, while keeping the format.
Your translations must convey all the content in the original text and cannot involve explanations or other unnecessary information.
Please ensure that the translated text is natural for native speakers with correct grammar and proper word choices.
Your output must only contain the translated text and cannot include explanations or other information.`)
        break
      }
      case SystemInstructions.DOCTRANSLATE_IO: {
        const originalLanguage = this.originalLang ?? detectedLanguage
        const { customDictionary, customPrompt, domain, isCustomDictionaryEnabled, isCustomPromptEnabled, tone } = options
        systemInstructions.push(this.getDoctranslateIoInstruction(originalLanguage, this.destLang, domain, tone, customDictionary, isCustomDictionaryEnabled, isCustomPromptEnabled, customPrompt))
        break
      }
      case SystemInstructions.GPT4OMINI:
      default: {
        const LANGUAGE_MAP = {
          ar: 'Arabic',
          bn: 'Bengali',
          'zh-cn': 'Chinese',
          'zh-tw': 'Chinese',
          'cs-CZ': 'Czech',
          da: 'Danish',
          nl: 'Dutch',
          en: 'English',
          fi: 'Finnish',
          fr: 'French',
          de: 'German',
          el: 'Greek',
          hi: 'Hindi',
          hu: 'Hungarian',
          id: 'Indonesian',
          it: 'Italian',
          ja: 'Japanese',
          ko: 'Korean',
          lo: 'Lao',
          'ms-MY': 'Malay',
          no: 'Norwegian',
          pl: 'Polish',
          pt: 'Portuguese',
          ru: 'Russian',
          es: 'Spanish',
          sv: 'Swedish',
          fil: 'Tagalog',
          th: 'Thai',
          tr: 'Turkish',
          uk: 'Ukrainian',
          vi: 'Vietnamese'
        }
        systemInstructions.push(`You will be provided with a user input in ${LANGUAGE_MAP[this.originalLang ?? detectedLanguage] ?? LANGUAGE_MAP.en}.\nTranslate the text into ${LANGUAGE_MAP[this.destLang]}.\nOnly output the translated text, without any additional text.`)
      }
    }
    return systemInstructions
  }

  doctranslateIoPostprocess (translatedTextWithUuid, textSentenceWithUuid) {
    const UUID_PATTERN = '(?:[a-z0-9]{8}#[a-z0-9]{3})'
    const translateText = translatedTextWithUuid.replace(/^\}$.+/ms, '').replace(new RegExp(UUID_PATTERN, 'gi'), (match) => match.toLowerCase()).replace(new RegExp(`(?<=${UUID_PATTERN})(?:>|')`, 'g'), '')
    const doesTranslatedStringExist = /"translated_string": ?"/.test(translateText)
    const potentialJsonString = doesTranslatedStringExist ? translateText.replace(/\\$/, '').replace(/(\\")?(?:",?)?(?:\n?\})?(\n?(?:`{3})?)?$/, '$1"\n}$2').replace(new RegExp(`\\n(?=  ${UUID_PATTERN}: |"(?:\\n\\}|${UUID_PATTERN}: |\\})|${UUID_PATTERN}: )|\\\\\\n(?=${UUID_PATTERN}: )`, 'g'), '\\n').replace(/("translated_string": ")(.+)(?=")/, (match, p1, p2) => `${p1}${p2.replace(/([^\\])"/g, '$1\\"')}`).match(/(\{.+\})/s)[0].replace(/insight": .+(?=translated_string": ")/s, '') : JSON.stringify({ translated_string: textSentenceWithUuid })
    if (Utils.isValidJson(potentialJsonString)) {
      // @ts-expect-error JSON5
      const parsedResult = JSON5.parse(potentialJsonString)
      const textSentenceWithUuids = Object.entries(textSentenceWithUuid)
      let translatedStringMap = {}
      if (typeof parsedResult.translated_string !== 'string') {
        if (doesTranslatedStringExist) { console.log('isJson', true) }
        // translatedStringMap = parsedResult.translated_string
      } else if (Utils.isValidJson(parsedResult.translated_string)) {
        if (doesTranslatedStringExist) { console.log('isStringifyJson', parsedResult.translated_string) }
        // // @ts-expect-error JSON5
        // translatedStringMap = JSON5.parse(parsedResult.translated_string)
      } else {
        /* eslint-disable camelcase */
        const { translated_string } = parsedResult
        const uuidAmount = [...translated_string.matchAll(new RegExp(`(?<!^)(?:${UUID_PATTERN}: )`, 'g'))].length
        const translatedString = uuidAmount - [...translated_string.matchAll(new RegExp(`, ?${UUID_PATTERN}: `, 'g'))].length <= (textSentenceWithUuids.length <= 2 ? 0 : 1) ? translated_string.replace(new RegExp(`(?:, ?)(?=${UUID_PATTERN}: )`, 'g'), '\n') : translated_string
        /* eslint-enable camelcase */
        const COMMA_PATTERN = '(?: , |,)'
        const mayIncludesComma = uuidAmount - [...translatedString.matchAll(new RegExp(`${COMMA_PATTERN}\\n${UUID_PATTERN}: `, 'g'))].length <= (textSentenceWithUuids.length <= 2 ? 0 : 1)
        translatedStringMap = Object.fromEntries([...translatedString.matchAll(new RegExp(`(${UUID_PATTERN}): (.+(?=${mayIncludesComma ? COMMA_PATTERN : ''}\\n(?: |\\n|" +\\n")?${UUID_PATTERN}: |\\n?$)(?:\\n(?!(?: |\\n|" +\\n")?${UUID_PATTERN}: ))?)+`, 'g'))].map(element => element.slice(1)))
      }
      if (Object.keys(translatedStringMap ?? {}).length > 0) {
        return textSentenceWithUuids.map(([first, second]) => parsedResult[first] ?? translatedStringMap[first] ?? (second.replace(/^\s+/, '').length > 0 ? '' : second)).join('\n')
      }
    }
    return ''
  }
}
export { Domains, Efforts, MODELS, SystemInstructions, Tones, Translation }
