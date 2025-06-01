'use strict'
/* global crypto, fetch */
import {
  GoogleGenAI,
  HarmBlockThreshold,
  HarmCategory
// @ts-expect-error @google/genai
} from 'https://esm.run/@google/genai';
// @ts-expect-error groq-sdk
import { Groq } from 'https://esm.run/groq-sdk';
// @ts-expect-error openai
import OpenAI from 'https://esm.run/openai';
// // @ts-expect-error @tavily/core
// import { tavily } from 'https://esm.run/@tavily/core';
import Utils from './Utils.js'
interface Model {
  modelId: string
  modelName?: string
  selected?: boolean
}
type ModelEntry = string | Model
type ModelGroup = Record<string, ModelEntry[]>
type ModelsType = Record<string, ModelGroup>
const MODELS: ModelsType = {
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
      },
      {
        modelId: 'gemma-3n-e4b-it',
        modelName: 'Gemma 3n E4B'
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
  },
  GROQ: {
    'Alibaba Cloud': ['qwen-qwq-32b'],
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
    Mistral: ['mistral-saba-24b']
  }
}
interface DictionaryEntry {
  ori_lang: string
  des_lang: string
  ori_word: string
  des_word: string
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
  GAMES = 'Games',
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
  NONE = 'None',
  FAST_TRANSLATION = 'Fast Translation'
}
enum Efforts {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high'
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
interface Options {
  B2B_AUTH_TOKEN?: string
  chutesModelId?: string
  CHUTES_API_TOKEN?: string
  customDictionary?: DictionaryEntry[]
  customPrompt?: string
  domain?: Domains
  effort?: Efforts
  GEMINI_API_KEY?: string
  googleGenaiModelId?: string
  groqModelId?: string
  GROQ_API_KEY?: string
  isBilingualEnabled?: boolean
  isChutesWebSearchEnabled?: boolean
  isCustomDictionaryEnabled?: boolean
  isCustomPromptEnabled?: boolean
  isGroqWebSearchEnabled?: boolean
  isGroundingWithGoogleSearchEnabled?: boolean
  isOpenaiWebSearchEnabled?: boolean
  isOpenrouterWebSearchEnabled?: boolean
  isThinkingModeEnabled?: boolean
  openaiModelId?: string
  openrouterModelId?: string,
  OPENROUTER_API_KEY?: string,
  systemInstruction?: SystemInstructions
  temperature?: number
  tone?: Tones
  topP?: number
  topK?: number
  translatorId?: Translators
  TVLY_API_KEY?: string
}
enum Translators {
  BAIDU_TRANSLATE = 'baiduTranslate',
  CHUTES_TRANSLATE = 'chutesTranslate',
  DEEPL_TRANSLATE = 'deeplTranslate',
  GOOGLE_GENAI_TRANSLATE = 'googleGenaiTranslate',
  GOOGLE_TRANSLATE = 'googleTranslate',
  GROQ_TRANSLATE = 'groqTranslate',
  LINGVANEX = 'lingvanex',
  MICROSOFT_TRANSLATOR = 'microsoftTranslator',
  OPENAI_TRANSLATOR = 'openaiTranslator',
  OPENROUTER_TRANSLATE = 'openrouterTranslate',
  PAPAGO = 'papago'
}
class Translation {
  private readonly text
  private readonly destLang
  private readonly originalLang
  private readonly B2B_AUTH_TOKEN
  private readonly TVLY_API_KEY
  public readonly abortController: AbortController
  public translateText: (resolve: (translateText: string, text: string, options: Options) => void) => Promise<void>
  public responseText = ''
  public translatedText = ''
  constructor (text: string, destLang: string, originalLang: string | null = null, options: Options = {}) {
    this.text = text
    this.destLang = destLang
    this.originalLang = originalLang
    this.abortController = new AbortController()
    options = {
      chutesModelId: 'deepseek-ai/DeepSeek-R1',
      customDictionary: [],
      customPrompt: '',
      domain: Domains.NONE,
      effort: Efforts.MEDIUM,
      googleGenaiModelId: (Object.values(MODELS.GOOGLE_GENAI) as ModelEntry[][]).flat().filter(element => typeof element === 'object').find((element: Model) => element.selected)?.modelId,
      groqModelId: (Object.values(MODELS.GROQ) as ModelEntry[][]).flat().filter(element => typeof element === 'object').find((element: Model) => element.selected)?.modelId,
      isBilingualEnabled: false,
      isChutesWebSearchEnabled: false,
      isCustomDictionaryEnabled: false,
      isCustomPromptEnabled: false,
      isGroqWebSearchEnabled: false,
      isGroundingWithGoogleSearchEnabled: false,
      isOpenaiWebSearchEnabled: false,
      isOpenrouterWebSearchEnabled: false,
      isThinkingModeEnabled: true,
      openaiModelId: (Object.values(MODELS.OPENAI) as ModelEntry[][]).flat().filter(element => typeof element === 'object').find((element: Model) => element.selected)?.modelId,
      openrouterModelId: 'openai/gpt-4o',
      systemInstruction: SystemInstructions.GPT4OMINI,
      temperature: 0.1,
      tone: Tones.SERIOUS,
      topP: 0.95,
      topK: -1,
      translatorId: Translators.GOOGLE_GENAI_TRANSLATE,
      ...options
    }
    const { B2B_AUTH_TOKEN, systemInstruction, temperature, topP, topK, TVLY_API_KEY } = options
    this.B2B_AUTH_TOKEN = B2B_AUTH_TOKEN
    this.TVLY_API_KEY = TVLY_API_KEY
    const prompt = this.getPrompt(systemInstruction as SystemInstructions)
    const date = new Date()
    switch (options.translatorId) {
      case Translators.CHUTES_TRANSLATE:
        this.translateText = async (resolve) => {
          const { chutesModelId, CHUTES_API_TOKEN, isChutesWebSearchEnabled } = options
          const isNotDeepseekModel = !(chutesModelId as string).startsWith('deepseek-ai/')
          const searchResults = isChutesWebSearchEnabled ? await this.webSearchWithTavily().then(value => value.map((element, index) => `[webpage ${index + 1} begin]${element}[webpage ${index + 1} end]`).join('\n')) : ''
          const dateTimeFormat = new Intl.DateTimeFormat(isNotDeepseekModel ? 'en' : 'zh-CN', {
            day: 'numeric',
            month: 'long',
            weekday: 'long',
            year: 'numeric'
          })
          /* eslint-disable no-mixed-spaces-and-tabs */
        			const response = await fetch("https://llm.chutes.ai/v1/chat/completions", {
        					method: "POST",
        					headers: {
        						"Authorization": `Bearer ${CHUTES_API_TOKEN}`,
        			"Content-Type": "application/json"
        					},
        					body: JSON.stringify(			{
        			  "model": chutesModelId,
        			  "messages": [
                  /* eslint-enable no-mixed-spaces-and-tabs */
                  ...await this.getSystemInstructions(options).then(value => value.map(element => ({
                    "role": "system",
                    "content": element
                  }))),
                  {
                    "role": "user",
                    "content": searchResults.length > 0
                      ? (isNotDeepseekModel 
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
${prompt}`
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
${prompt}`)
                      : prompt
                  }
                  /* eslint-disable no-mixed-spaces-and-tabs */
        			  ],
        			  "stream": true,
        			  "temperature": temperature as number > -1 ? temperature : 0.7,
                    /* eslint-enable no-mixed-spaces-and-tabs */
                    ...topP as number > -1 ? { "top_p": topP } : {},
                    ...topK as number > -1 ? { "top_k": topK } : {}
        			}), // eslint-disable-line no-mixed-spaces-and-tabs
                keepalive: true,
                signal: this.abortController.signal
                /* eslint-disable no-mixed-spaces-and-tabs */
        			});
        			
          /* eslint-enable no-mixed-spaces-and-tabs */
          const reader = response.body?.getReader();
          if (!reader) {
            throw new Error('Response body is not readable');
          }
          
          const decoder = new TextDecoder();
          let buffer = '';
          
          try {
            while (true) { // eslint-disable-line no-constant-condition
              const { done, value } = await reader.read();
              if (done) break;
          
              // Append new chunk to buffer
              buffer += decoder.decode(value, { stream: true });
          
              // Process complete lines from buffer
              while (true) { // eslint-disable-line no-constant-condition
                const lineEnd = buffer.indexOf('\n');
                if (lineEnd === -1) break;
          
                const line = buffer.slice(0, lineEnd).trim();
                buffer = buffer.slice(lineEnd + 1);
          
                if (line.startsWith('data: ')) {
                  const data = line.slice(6);
                  if (data === '[DONE]') break;
          
                  try {
                    const parsed = JSON.parse(data);
                    const content = parsed.choices[0].delta.content;
                    if (content) {
                      this.responseText += content
                      if (this.responseText.startsWith('<think>') && !/<\/think>\n{1,2}/.test(this.responseText)) continue
                      else if (this.responseText.startsWith('<think>')) this.responseText = this.responseText.replace(/^<think>\n[\s\S]+\n<\/think>\n{1,2}/, '')
                      this.translatedText = systemInstruction === SystemInstructions.DOCTRANSLATE_IO ? this.doctranslateIoResponsePostprocess(this.responseText, prompt) : this.responseText
                      if (this.translatedText.length === 0) continue
                      if (this.abortController.signal.aborted as boolean) return
                      resolve(this.translatedText, this.text, options)
                    }
                  } catch {
                    // Ignore invalid JSON
                  }
                }
              }
            }
          } finally {
            reader.cancel();
          }
    		}  // eslint-disable-line no-mixed-spaces-and-tabs
        break
      case Translators.GROQ_TRANSLATE: {
        const { groqModelId, GROQ_API_KEY, isGroqWebSearchEnabled } = options
        const groq = new Groq({ apiKey: GROQ_API_KEY, dangerouslyAllowBrowser: true });
        this.translateText = async (resolve) => {
          const isNotDeepseekModel = groqModelId !== 'deepseek-r1-distill-llama-70b'
          const searchResults = isGroqWebSearchEnabled ? await this.webSearchWithTavily().then(value => value.map((element, index) => `[webpage ${index + 1} begin]${element}[webpage ${index + 1} end]`).join('\n')) : ''
          const dateTimeFormat = new Intl.DateTimeFormat(isNotDeepseekModel ? 'en' : 'zh-CN', {
            day: 'numeric',
            month: 'long',
            weekday: 'long',
            year: 'numeric'
          })
          const chatCompletion = await groq.chat.completions.create({
            "messages": [
              ...await this.getSystemInstructions(options).then(value => value.map(element => ({
                "role": "system",
                "content": element
              }))),
              {
                "role": "user",
                "content": searchResults.length > 0
                  ? (isNotDeepseekModel 
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
${prompt}`
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
${prompt}`)
                  : prompt
              }
            ],
            "model": groqModelId,
            "temperature": temperature === -1 ? 1 : temperature,
            "top_p": topP === -1 ? 1 : topP,
            "stream": true,
            "stop": null,
            ...['qwen-qwq-32b', 'deepseek-r1-distill-llama-70b'].some(element => element === groqModelId) ? { "reasoning_format": "hidden" } : {}
          });

          for await (const chunk of chatCompletion) {
            this.responseText += chunk.choices[0]?.delta?.content || ''
            this.translatedText = systemInstruction === SystemInstructions.DOCTRANSLATE_IO ? this.doctranslateIoResponsePostprocess(this.responseText, prompt) : this.responseText
            if (this.translatedText.length === 0) continue
            if (this.abortController.signal.aborted as boolean) return
            resolve(this.translatedText, this.text, options)
          }
        }
        break
      }
      case Translators.OPENAI_TRANSLATOR:
        this.translateText = async (resolve) => {
          const { effort, isOpenaiWebSearchEnabled, openaiModelId } = options
          await fetch('https://gateway.api.airapps.co/aa_service=server5/aa_apikey=5N3NR9SDGLS7VLUWSEN9J30P//v3/proxy/open-ai/v1/responses', {
            body: JSON.stringify({
              model: openaiModelId,
              input: [
                ...await this.getSystemInstructions(options).then(value => value.map(element => ({
                  "role": MODELS.OPENAI.Reasoning.includes(openaiModelId as string) ? ((openaiModelId as string).startsWith('o1-mini') ? 'user' : 'developer') : 'system',
                  "content": [
                    {
                      "type": "input_text",
                      "text": element
                    }
                  ]
                }))),
                {
                  "role": 'user',
                  "content": [
                    {
                      "type": "input_text",
                      "text": prompt
                    }
                  ]
                }
              ],
              text: {
                "format": {
                  "type": "text"
                }
              },
              reasoning: { ...MODELS.OPENAI.Reasoning.includes(openaiModelId as string) && effort !== 'medium' ? { "effort": effort } : {} },
              tools: [
                ...isOpenaiWebSearchEnabled
                  ? [{
                      "type": "web_search_preview",
                      "user_location": {
                        "type": "approximate"
                      },
                      "search_context_size": "medium"
                    }]
                  : []
              ],
              ...MODELS.OPENAI.Reasoning.includes(openaiModelId as string)
                ? {}
                : {
                    temperature: temperature === -1 ? 1 : temperature,
                    top_p: topP === -1 ? 1 : topP
                  },
              store: false
            }),
            headers: {
              'Content-Type': 'application/json',
              'accept-language': 'vi-VN,vi;q=0.9',
              'air-user-id': crypto.randomUUID()
            },
            keepalive: true,
            method: 'POST',
            signal: this.abortController.signal
          }).then(value => value.json()).then(value => {
            this.responseText = value.output.filter((element: { type: string }) => element.type === 'message')[0].content[0].text
            this.translatedText = systemInstruction === SystemInstructions.DOCTRANSLATE_IO ? this.doctranslateIoResponsePostprocess(this.responseText, prompt) : this.responseText
            if (this.abortController.signal.aborted as boolean) return
            resolve(this.translatedText, this.text, options)
          })
        }
        break
      case Translators.OPENROUTER_TRANSLATE: {
        const { isOpenrouterWebSearchEnabled, openrouterModelId, OPENROUTER_API_KEY } = options
        const openai = new OpenAI({
          baseURL: "https://openrouter.ai/api/v1",
          apiKey: OPENROUTER_API_KEY,
          dangerouslyAllowBrowser: true,
        });
        this.translateText = async (resolve) => {
          const completion = await openai.chat.completions.create({
            model: openrouterModelId,
            messages: [
              ...await this.getSystemInstructions(options).then(value => value.map(element => ({
                "role": "system",
                "content": element
              }))),
              {
                "role": "user",
                "content": prompt
              }
            ],
            ...temperature as number > -1 ? { temperature } : {},
            ...topP as number > -1 ? { top_p: topP } : {},
            ...topK as number > -1 ? { top_k: topK } : {},
            reasoning: { "exclude": true },
            ...isOpenrouterWebSearchEnabled ? { plugins: [{ "id": "web" }] } : {},
          }, { keepalive: true, signal: this.abortController.signal });
        
          this.responseText = completion.choices[0].message?.content
          this.translatedText = systemInstruction === SystemInstructions.DOCTRANSLATE_IO ? this.doctranslateIoResponsePostprocess(this.responseText, prompt) : this.responseText
          if (this.abortController.signal.aborted as boolean) return
          resolve(this.translatedText, this.text, options)
        }
        break
      }
      case Translators.GOOGLE_GENAI_TRANSLATE:
      default:
        this.translateText = async (resolve) => {
          const { GEMINI_API_KEY, googleGenaiModelId, isGroundingWithGoogleSearchEnabled, isThinkingModeEnabled } = options
          const ai = new GoogleGenAI({
            apiKey: GEMINI_API_KEY,
          });
          const tools = [
            ...isGroundingWithGoogleSearchEnabled? [{ googleSearch: {} }] : [],
          ];
          const config = {
            abortSignal: this.abortController.signal,
            ...temperature as number > -1 ? { temperature } : {},
            ...topP as number > -1 ? { topP } : {},
            ...topK as number > -1 ? { topK } : {},
            ...(googleGenaiModelId as string).startsWith('gemini-2.5-flash') && !isThinkingModeEnabled
              ? {
                  thinkingConfig: {
                    thinkingBudget: 0,
                  },
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
              },
            ],
            ...tools.length > 0 ? { tools } : {},
            responseMimeType: 'text/plain',
            systemInstruction: await this.getSystemInstructions(options).then(value => value.map(element => ({
              text: element
            }))),
          };
          const model = options.googleGenaiModelId;
          const contents = [
            {
              role: 'user',
              parts: [
                {
                  text: `${prompt.split('\n').filter(element => element.length > 0).join('\n')}`,
                },
              ],
            },
          ];

          const response = await ai.models.generateContentStream({
            model,
            config,
            contents,
          });
          for await (const chunk of response) {
            this.responseText += chunk.text as string
            this.translatedText = systemInstruction === SystemInstructions.DOCTRANSLATE_IO ? this.doctranslateIoResponsePostprocess(this.responseText, prompt) : this.responseText
            if (this.translatedText.length === 0) continue
            if (this.abortController.signal.aborted as boolean) return
            resolve(this.translatedText, this.text, options)
          }
        }
    }
  }
  private async webSearchWithTavily (): Promise<string[]> {
    // const client = tavily({ apiKey: TVLY_API_KEY });
    // return await client.search(this.text)
    // .then((value: { results: { title: string, content: string }[] }) => value.results.map(({ title, content }) => `# ${title}\n${content}`)) ?? [];
    const options = {
      method: 'POST',
      headers: {Authorization: `Bearer ${this.TVLY_API_KEY}`, 'Content-Type': 'application/json'},
      body: `{"query":"${this.text}"}`,
      signal: this.abortController.signal
    };
    
    return await fetch('https://api.tavily.com/search', options)
      .then(response => response.json())
      .then((response: { results: { content: string }[] }) => response.results.map(({ content }) => content));
  }
  private getPrompt (systemInstruction: SystemInstructions): string {
    switch (systemInstruction) {
      case SystemInstructions.DOCTRANSLATE_IO:
        return `### TEXT SENTENCE WITH UUID:\n${this.text.split('\n').map((element: string) => {
          if (element.replace(/^\s+/, '').length > 0) {
            const partedUuid: string[] = crypto.randomUUID().split('-')
            return `${partedUuid[0]}#${partedUuid[2].substring(1)}: ${element}`
          }
          return ''
        }).join('\n')}\n### TRANSLATED TEXT WITH UUID:`
      default:
        return this.text.split('\n').filter(element => element.replace(/^\s+/, '').length > 0).join('\n')
    }
  }
  private async detectLanguage (): Promise<string> {
    const options = {
      method: 'POST',
      headers: {
        accept: 'application/json',
        'content-type': 'application/json',
        Authorization: this.B2B_AUTH_TOKEN
      },
      body: JSON.stringify({q: this.text}),
      signal: this.abortController.signal
    };
    
    return await fetch('https://api-gl.lingvanex.com/language/translate/v2/detect', options as RequestInit)
      .then(res => res.json())
      .then(res => res.data.detections[0][0].language.replace('-Hans', '-cn').replace('-Hant', '-tw').replace(/^ms$/, 'ms-MY').replace(/^tl$/, 'fil').replace(/^cs$/, 'cs-CZ'))
  }
  private getDomainInstruction (domain: Domains, originalLang: string): string {
    const key = `${originalLang}_${this.destLang}_${domain}`
    const LANGUAGE_MAP: Record<string, string> = {
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
    const lowerCaseOriginalLanguage = (LANGUAGE_MAP[originalLang] ?? LANGUAGE_MAP.en).toLowerCase()
    const lowerCaseDestinationLanguage = LANGUAGE_MAP[this.destLang].toLowerCase()
    let specialRequirements = 'What are the special requirements to keep in mind when translating?'
    let specialAttentionConsiderations = 'What are the linguistic, grammatical, and terminology considerations that need special attention when translating?'
    let focusAreas = `What needs to be focused on to ensure the document in the target language is correct? Especially technical specifications, units of measurement, technical standards, unit standards that differ between ${lowerCaseOriginalLanguage} and ${lowerCaseDestinationLanguage}. Give examples.`
    let notedIssues = `When translating the document from ${lowerCaseOriginalLanguage} into ${lowerCaseDestinationLanguage} in the domain ${domain}, what issues should be noted about proper names and proper nouns?`
    let additionalIssues = 'In addition to the above issues, are there any other issues to keep in mind when translating?'
    switch (key) {
      case `en_vi_${Domains.FICTION}`:
        additionalIssues += ' If so, list them all and answer as many and in as much detail as possible.'
        specialRequirements += `
- Maintaining the author's unique voice and style is crucial in fiction translation.
- Preserving the emotional tone and atmosphere of the original text is essential for reader engagement.
- Ensuring consistency in character portrayal, world-building details, and plot elements throughout the translation is vital.
- Adapting cultural nuances and references so they resonate with the Vietnamese audience without losing the original meaning or context is a key requirement.
- Capturing the rhythm and flow of dialogue to sound natural and authentic in Vietnamese is important.`
        specialAttentionConsiderations += `
- Differences in sentence structure between English (often subject-verb-object) and Vietnamese (more flexible, often topic-comment) require careful restructuring to sound natural.
- Vietnamese has a complex system of politeness levels and kinship terms used in address, which must be carefully chosen based on character relationships and social context, often requiring significant adaptation from English pronouns and address forms.
- Idioms, slang, and colloquialisms are highly culture-specific and require creative adaptation or finding Vietnamese equivalents that convey similar meaning and tone.
- Genre-specific terminology (e.g., fantasy spells, sci-fi technology, historical ranks) must be translated consistently and appropriately within the established world of the fiction.
- The use of articles (a, an, the) in English has no direct equivalent in Vietnamese and requires careful consideration of context to determine definiteness or indefiniteness.`
        focusAreas += `
- Ensuring the accuracy of technical specifications and standards mentioned in the text requires careful research to find corresponding Vietnamese or international standards if applicable, or maintaining the original if no direct equivalent exists or is relevant to the plot.
- Units of measurement often differ, with English using Imperial/US customary units and Vietnamese using the Metric system; conversion is necessary for clarity and understanding.
- For units of measurement, convert Imperial/US customary units to their Metric equivalents with precise calculations.
- Example: "He was six feet tall." Convert 6 feet to meters. 1 foot = 0.3048 meters. 6 feet * 0.3048 m/foot = 1.8288 meters. The translation should reflect this converted value, e.g., "Anh ta cao khoảng 1.83 mét."
- Example: "The car sped at 60 miles per hour." Convert 60 mph to kilometers per hour. 1 mile = 1.60934 kilometers. 60 miles/hour * 1.60934 km/mile = 96.5604 km/hour. The translation should reflect this converted value, e.g., "Chiếc xe phóng đi với tốc độ khoảng 96.6 km/giờ."
- For currencies, if the specific currency mentioned (e.g., USD, GBP) cannot be translated into a commonly understood Vietnamese term without ambiguity or arbitrary conversion, use the three-letter currency code.
- Example: "He paid $50." Use the currency code: "Anh ta trả 50 USD." Do not convert to VND unless explicitly required by the narrative context (which is rare and risky in fiction).`
        notedIssues += `
- Proper names of characters are typically transliterated phonetically into Vietnamese, maintaining consistency throughout the text.
- Proper names of real people (historical figures, celebrities) should use their established Vietnamese names if they exist.
- Proper nouns for fictional places (cities, countries, planets) are usually transliterated, ensuring consistent spelling.
- Proper nouns for real places (cities, countries) should use their established Vietnamese names.
- Names of organizations (fictional or real) should be handled based on context; fictional ones are usually transliterated, while real ones might use established Vietnamese translations or abbreviations if common.
- Titles (Mr., Ms., Dr., Lord, King) require careful consideration of Vietnamese social hierarchy and address terms, often needing adaptation rather than direct translation or transliteration.`
        additionalIssues += `
- Cultural references: Allusions to specific cultural events, historical figures, literature, or media that may not be known to a Vietnamese audience need careful handling to ensure the intended meaning or impact is conveyed.
- Humor: Jokes, puns, sarcasm, and irony are highly culture and language-dependent and often require significant adaptation or creative solutions to elicit a similar reaction in the target audience.
- Interjections and Onomatopoeia: Sounds and exclamations differ between languages and need to be translated using Vietnamese equivalents that feel natural and convey the right emotion or sound.
- Dialogue Naturalness: Ensuring that character dialogue sounds like real people speaking Vietnamese, reflecting their personality, background, and relationship dynamics, is crucial for believable characters.
- Maintaining Suspense and Pacing: The translator must pay attention to sentence length, structure, and word choice to preserve the original text's pacing and build-up of suspense or tension.
- Figurative Language: Metaphors, similes, symbolism, and other figures of speech need to be translated in a way that preserves their meaning and impact, sometimes requiring adaptation if a direct translation is culturally inappropriate or nonsensical.
- Swear words and profanity: These are highly sensitive and require careful consideration of the target audience and the character's intent to choose appropriate Vietnamese equivalents that match the intensity and context.
- Abbreviations and Acronyms: Fictional abbreviations should usually be kept or transliterated unless the author provides a meaning that can be translated; real-world abbreviations should use established Vietnamese equivalents if they exist, otherwise keep the original.
- Sensory Details: Descriptions involving sights, sounds, smells, tastes, and textures must be translated vividly to allow the Vietnamese reader to experience the fictional world fully.`
        break
      case `ja_vi_${Domains.FICTION}`:
        specialRequirements += `
- Special requirements when translating Fiction include capturing the author's unique voice and style, maintaining the intended tone and atmosphere (e.g., suspenseful, humorous, romantic), accurately conveying character personalities through dialogue and internal monologue, preserving cultural nuances and references relevant to the plot or setting, and ensuring the narrative flows naturally and engages the Vietnamese reader while respecting the original pacing and structure.`
        specialAttentionConsiderations += `
- Linguistic and grammatical considerations include adapting Japanese sentence structures (Subject-Object-Verb) to Vietnamese (Subject-Verb-Object) while maintaining natural flow, handling complex Japanese politeness levels (keigo) by using appropriate Vietnamese honorifics or relationship-based language, translating Japanese onomatopoeia and mimetic words effectively to convey sensory details or actions, and addressing terminology specific to the genre (e.g., fantasy terms, sci-fi concepts, specific cultural items) which may require research or careful adaptation.`
        focusAreas += `
- To ensure correctness, focus on consistency in terminology and character representation, accurately rendering factual details mentioned in the narrative, and handling technical specifications, units of measurement, and standards by prioritizing real-world context and equivalence in Vietnamese.
- For currencies, if the Japanese currency (e.g., 円) cannot be directly translated or understood, use the currency code (JPY) instead of arbitrarily converting to another currency.
- For units of measurement, if Japanese units (like 尺 shaku, 寸 sun, 貫 kan) or non-metric units appear and cannot be easily understood in Vietnamese context, convert them to the equivalent metric system units commonly used in Vietnam, ensuring precise calculation.
- Example: If a character mentions a sword is "三尺 (san shaku)" long, convert it to meters or centimeters. 1 shaku is approximately 0.303 meters or 30.3 centimeters. So, 三尺 would be approximately 0.909 meters or 90.9 centimeters. The translation should use the metric equivalent like "khoảng 90.9 cm" or "gần một mét".
- Example: If a weight is given as "一貫 (ichi kan)", convert it to kilograms. 1 kan is approximately 3.75 kilograms. The translation should use "khoảng 3.75 kg".`
        notedIssues += `
- Issues regarding proper names and proper nouns include deciding whether to transliterate Japanese character names, place names, and organization names into Vietnamese script (using standard romanization and then converting to Vietnamese pronunciation approximations) or to keep them in their original romanized form, maintaining consistency in the chosen method throughout the text, handling titles of works (books, songs, movies mentioned within the story) by either translating the title or keeping the original title and potentially adding a transliteration or brief description, and being mindful of names that might have unintended or awkward meanings when transliterated into Vietnamese.`
        additionalIssues += `
- Other issues to keep in mind include translating cultural references such as specific foods, festivals, social customs, and historical events in a way that is understandable to the Vietnamese audience without losing the original context.
- Handling Japanese honorifics (-san, -chan, -kun, -sama, -sensei) by finding appropriate Vietnamese equivalents or using context to convey the relationship and level of respect/familiarity between characters.
- Translating humor, puns, and wordplay, which are often highly language-specific and may require creative adaptation to land effectively in Vietnamese.
- Dealing with regional dialects or character-specific speech patterns (like rough speech, formal speech, childish speech) to reflect the character's background or personality in Vietnamese.
- Rendering interjections, exclamations, and sounds accurately to convey emotion and reaction.
- Maintaining the emotional impact and subtext present in the original Japanese text.
- Ensuring consistency in the translation of recurring motifs, symbols, or specific narrative devices used by the author.`
        break
      case `zh-cn_vi_${Domains.FICTION}`:
        specialRequirements += `
- Maintaining the author's unique voice, tone, and style throughout the translation is crucial for fiction.
- Accurately conveying the emotional depth, nuances, and subtext present in the original Chinese text is essential.
- Adapting cultural references and context so they resonate with a Vietnamese audience without losing the original meaning or flavor.
- Ensuring consistency in character portrayal, plot points, and world-building elements established in the source text.
- Understanding the specific genre conventions (e.g., Wuxia, Xianxia, Romance, Sci-Fi) and applying appropriate linguistic and stylistic choices in Vietnamese.`
        specialAttentionConsiderations += `
- Handling differences in sentence structure and flow between Chinese and Vietnamese to create natural-sounding prose.
- Translating idiomatic expressions, slang, and colloquialisms accurately while finding equivalent or understandable Vietnamese phrases.
- Navigating the complex system of honorifics and terms of address in both languages to reflect character relationships and social hierarchy correctly.
- Addressing specific terminology related to the fiction's genre, such as martial arts techniques, cultivation levels, magical spells, or historical ranks, ensuring consistency and clarity.
- Paying attention to grammatical nuances like classifiers, verb aspects, and particle usage that differ significantly between the two languages.`
        focusAreas += `
- Ensuring accuracy in factual details, even within a fictional context, such as historical periods, geographical locations, or scientific concepts mentioned.
- For units of measurement, convert Chinese units (市制) to their metric equivalents commonly used in Vietnam, providing precise calculations.
- Example: 1 斤 (jin) is approximately 0.5 kilograms (kg). If a character buys 5 斤 of rice, translate it as 2.5 kg of rice.
- Example: 1 亩 (mu) is approximately 666.67 square meters (m²). If a character owns 10 亩 of land, translate it as 6666.7 m² of land.
- Example: 1 里 (li) is approximately 500 meters (m). If a character travels 3 里, translate it as 1500 m or 1.5 km.
- For currencies, if the currency is a real-world currency like Chinese Yuan, use the currency code CNY.
- If the currency is fictional, maintain the fictional name consistently throughout the translation.
- Technical specifications or standards, if mentioned, should be translated accurately based on their real-world meaning or maintained consistently if they are fictional constructs within the story.`
        notedIssues += `
- Deciding whether to transliterate character names (based on Mandarin pronunciation, often using Pinyin as a guide) or find culturally resonant Vietnamese equivalents, and maintaining consistency once a method is chosen.
- Handling names of places, organizations, and fictional entities (like sects, clans, magical items) by either transliterating, translating their meaning, or using a combination, ensuring clarity and consistency.
- Being mindful of potential unintended meanings or pronunciations when transliterating names into Vietnamese.
- Ensuring that the chosen translation method for names aligns with the genre and overall tone of the fiction.
- Maintaining a glossary of names and terms to ensure absolute consistency throughout the entire work, especially for long series.`
        additionalIssues += `
- Translating cultural references, proverbs, idioms, and historical allusions in a way that is understandable and impactful for a Vietnamese audience, potentially requiring adaptation rather than direct translation.
- Capturing the intended humor, sarcasm, or irony, which often relies heavily on cultural context and linguistic nuances.
- Ensuring dialogue sounds natural and reflects the characters' personalities, social status, and relationships accurately in Vietnamese.
- Maintaining the pacing and rhythm of the original narrative, especially during action sequences or emotionally charged scenes.
- Handling onomatopoeia and descriptive sounds, finding appropriate Vietnamese equivalents that convey the same sensory experience.
- Addressing potential sensitivities related to cultural, historical, or political content, ensuring the translation is appropriate for the target audience and market.`
        break
      case `zh-cn_vi_${Domains.INFORMATICS}`:
        additionalIssues += ' If so, list them all and answer as many and in as much detail as possible.'
        specialRequirements += `
- The special requirements to keep in mind when translating Informatics documents from Chinese (simplified) to Vietnamese include ensuring high technical accuracy and consistency in terminology throughout the document.
- Maintaining the original meaning and intent of technical specifications, procedures, and concepts is paramount.
- Adhering to established Vietnamese terminology in the Informatics domain is crucial for clarity and user comprehension.
- The translation must reflect the formal and precise tone typical of technical documentation.`
        specialAttentionConsiderations += `
- Linguistic considerations require careful handling of sentence structure, as Chinese often uses more concise phrasing or different clause ordering than is natural in Vietnamese; sentences may need restructuring for better flow and clarity in Vietnamese.
- Grammatical considerations involve correctly applying Vietnamese grammar rules, including verb conjugation (though less complex than some languages, still relevant for tense/aspect), noun phrases, and the use of particles and prepositions to ensure grammatical correctness and naturalness.
- Terminology considerations demand rigorous attention to domain-specific vocabulary; using standard, widely accepted Vietnamese terms for technical concepts, hardware components, software features, and processes is essential, and consistency in using these terms across the entire translation is critical.
- Avoiding direct, literal translation of idioms or culturally specific phrases that might appear (though less common in technical texts) is necessary to prevent confusion.`
        focusAreas += `
- To ensure the document in the target language is correct, especially regarding technical specifications, units of measurement, technical standards, and unit standards, focus must be placed on verifying that all technical details, values, and parameters are accurately represented.
- For units of measurement, if the Chinese unit is not standard or commonly understood in Vietnam, convert it to the equivalent SI unit or the standard Vietnamese equivalent system with precise calculation.
- Example: If a Chinese document mentions a data center area in "亩" (mǔ), which is a traditional Chinese unit, convert it to square meters (m²) or hectares (ha), which are standard in Vietnam. 1 亩 ≈ 666.67 square meters. So, "100 亩" would be translated as "khoảng 66,667 mét vuông" or "khoảng 6.67 héc-ta".
- Example: If a storage capacity is given in "TB" (terabyte), which is standard in both languages, keep it as "TB". If a less common unit appears, ensure its standard conversion (e.g., converting between TiB and TB if the context implies one over the other, though TB is more common in general usage).
- For technical standards (e.g., GB standards from China), keep the standard's name or designation (e.g., "tiêu chuẩn GB/T 12345") as these are proper nouns identifying specific standards, but ensure the context makes sense without requiring external explanation.
- For currencies, if a value is given in "人民币" (Renminbi) or "元" (Yuan), use the currency code "CNY" instead of attempting a direct translation or conversion to VND, as arbitrary conversion introduces errors. For example: "1000 元" should be translated as "1000 CNY".`
        notedIssues += `
- When translating proper names and proper nouns in Informatics documents from Chinese (simplified) into Vietnamese, issues to note include the handling of names of companies, products, technologies, projects, and sometimes individuals.
- Company names (e.g., 华为 - Huawei, 腾讯 - Tencent) are generally kept in their most commonly recognized form, often the English or Pinyin transliteration if widely known internationally, or a standard Vietnamese transliteration if one exists and is commonly used.
- Product names (e.g., 鸿蒙 - HarmonyOS, 鲲鹏 - Kunpeng) are typically kept in their original form or a standard transliteration/registered name if provided by the company; avoid translating the meaning of the name unless it's a descriptive term that is meant to be translated.
- Technology names or project names (e.g., 麒麟 - Kirin chip series) should follow the official or commonly accepted naming convention used by the technology provider.
- Names of standards bodies or organizations (e.g., 中国通信标准化协会 - China Communications Standards Association) should be translated accurately based on their official English or Vietnamese names if available, or a clear descriptive translation if not.
- Consistency in rendering each proper name or noun throughout the document is essential.`
        additionalIssues += `
- In addition to the above issues, other issues to keep in mind when translating Informatics documents from Chinese (simplified) into Vietnamese include:
- Handling of abbreviations and acronyms: Chinese abbreviations may not have direct equivalents or be understood in Vietnamese; expand abbreviations on first use or use the standard Vietnamese abbreviation if one exists and is commonly recognized in the domain. Avoid creating new Vietnamese abbreviations unless absolutely necessary and clearly defined.
- Consistency in style and formatting: Ensure the translated document maintains the original document's formatting, including headings, lists, tables, figures, and code snippets, as formatting is often integral to technical documentation clarity.
- Cultural nuances in user interface or documentation examples: While core technical concepts are universal, examples or scenarios used in documentation might contain cultural references; ensure these are adapted or clarified to be understandable to a Vietnamese audience without altering the technical point being made.
- Tone and register: Maintain the formal, objective, and precise tone characteristic of technical writing; avoid informal language, colloquialisms, or subjective expressions.
- Version control and updates: Be mindful of document versions and updates; ensure translations correspond to the correct source version and incorporate any changes accurately.
- Numerical formats: Ensure numerical formats (e.g., use of commas or periods for decimal separators and thousands separators) conform to Vietnamese conventions (typically comma for decimal, period or space for thousands).
- Units of information: Terms like "bit", "byte", "KB", "MB", "GB", "TB" are standard and should be kept as is.
- Symbols and operators: Ensure mathematical symbols, logical operators, and programming syntax elements are translated or kept consistently with standard usage in the Informatics field in Vietnam.`
        break
      default:
        specialRequirements += `\n[${specialRequirements}]`
        specialAttentionConsiderations += `\n[${specialAttentionConsiderations}]`
        focusAreas += `\n[${focusAreas}]`
        notedIssues += `\n[${notedIssues}]`
        additionalIssues += `\n[${additionalIssues}]`
    }
    return `${specialRequirements}\n\n${specialAttentionConsiderations}\n\n${focusAreas}\n\n${notedIssues}\n\n${additionalIssues}`
  }
  private async getSystemInstructions (options: Options): Promise<string[]> {
    const systemInstructions: string[] = []
    const detectedLanguage = this.originalLang == null ? await this.detectLanguage() : ''
    switch (options.systemInstruction) {
      case SystemInstructions.COCCOC_EDU: {
        const LANGUAGE_MAP: Record<string, string> = {
          en: 'English',
          vi: 'Vietnamese',
          ar: 'Arabic',
          pl: 'Polish',
          bn: 'Bengali (Bangladesh)',
          pt: 'Portuguese',
          da: 'Danish',
          de: 'German',
          nl: 'Dutch',
          ko: 'Korean',
          hi: 'Hindi',
          hu: 'Hungarian',
          el: 'Greek',
          id: 'Indonesian',
          lo: 'Lao',
          'ms-MY': 'Malaysian',
          no: 'Norwegian',
          ru: 'Russian',
          ja: 'Japanese',
          fi: 'Finnish',
          fr: 'French',
          fil: 'Tagalog (Filipino)',
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
        const LANGUAGE_MAP: Record<string, string> = {
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
        const originalLanguage = this.originalLang ?? detectedLanguage
        const domain = (options.domain as string).replace(Domains.NONE, 'Lifestyle')
        const upperCaseOriginalLanguage = domain === Domains.FICTION ? originalLanguage : LANGUAGE_MAP[originalLanguage].toUpperCase()
        const upperCaseDestinationLanguage = LANGUAGE_MAP[this.destLang].toUpperCase()
        const tone = (options.tone as string).replace(Tones.NONE, Tones.SERIOUS)
        const TONE_INSTRUCTION_MAP: Record<string, string> = {
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
        const { isCustomDictionaryEnabled, customDictionary, isCustomPromptEnabled, customPrompt } = options
        systemInstructions.push(`### ROLE:
You are a translation professional with many years of experience, able to translate accurately and naturally between languages. You have a good understanding of the grammar, vocabulary and style of both ${upperCaseOriginalLanguage} and ${upperCaseDestinationLanguage}. You also know how to maintain the original meaning and emotion of the text when translating.

### INSTRUCTION:
- Translate the following paragraphs into ${upperCaseDestinationLanguage}, ensuring each sentence is fully understood and free from confusion.
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
- There can only be 1 translation for 1 word, do not arbitrarily insert multiple translations/versions for 1 word For example: "you" must translate into "bạn" or "cậu", must not translate into "bạn/cậu"${domain !== Domains.FICTION ? '\n- Do not arbitrarily insert strange characters into the translation.' : ''}
- Follow the instruction for translate with domain ${domain}:
${this.getDomainInstruction(domain as Domains, originalLanguage)}
- Handle special case:
+ Numbers: Maintain the original numeric values, but adapt formats if necessary (e.g., decimal separators, digit grouping).
+ Currencies: Convert currency symbols or codes as appropriate for the target language and region.
+ Dates: Adjust date formats to match the conventions of the target language and culture.
+ Proper nouns: Generally, do not translate names of people, places, or organizations unless there's a widely accepted equivalent in the target language.
+ Units of measurement: if they cannot be translated into ${upperCaseDestinationLanguage}, convert the unit of measurement to an equivalent system in ${upperCaseDestinationLanguage}, but precise calculations are required when converting units and detailed
${domain === Domains.FICTION
          ? `### PROCESSING OF FORM OF ADDRESS BETWEEN CHARACTERS (HIGHEST PRIORITY):
- All proper names and place names must be fully translated into ${upperCaseDestinationLanguage} if there is a common transliteration in ${upperCaseDestinationLanguage} and it would make the translation easier for readers in the ${upperCaseDestinationLanguage} language to understand.
- All pronouns and forms of address in all person of all characters must be EXTREMELY appropriate to the position and role of the characters as determined.
- Ensure ABSOLUTE CONSISTENT in the form of address, proper names, place names in the entire translated text, do not translate differently with the same word
- Ensure ABSOLUTE CONSISTENT the way characters address each other, only changing the way they address each other when the relationship between the characters changes significantly
- The way characters address each other MUST accurately reflect their social position, role and relative relationship according to the Character Address Chart.
- Ensure the way characters address each other is CORRECT and CONSISTENT according to the Character Address Table provided.
- Strictly adhere to how characters address each other and themselves as defined in the Character Address Table.${['en', 'ja'].some(element => this.originalLang === element)
          ? `
- The Character Address Table provides detailed information about:
+ How each character addresses themselves (first person pronouns) to each other
+ How each character addresses others (second person pronouns)
+ Relationships between characters (rank, social status, level of intimacy)
+ Special terms of address between characters
- DO NOT change or create a form of address that differs from the Character Address Table provided.`
          : ''}
- When a character speaks to multiple people or to a group of people, determine the appropriate form of address based on the Character Address Table.
- When characters reminisce about the past, address each other in a way that is appropriate to the characters' relationship and circumstances at that point in the past
- When a situation is unclear or not defined in the Address Table, use the closest form of address available in the Table for the same relationship.
### CHAIN ​​OF THOUGHT: Think step by step to translate but only return the translation:${'' /* eslint-disable-line no-irregular-whitespace */ }
1. Based on the input text, find the context and understand the text deeply by answering all the questions below:

- What is this text about, what is the purpose, who is it for, what is the field of this text
- What should be noted when translating this text from ${upperCaseOriginalLanguage} to ${upperCaseDestinationLanguage} to ensure accurate translation. Especially the specifications, units of measurement, abbreviations, technical standards, unit standards are different between ${upperCaseOriginalLanguage} and ${upperCaseDestinationLanguage}
- Abbreviations in ${upperCaseOriginalLanguage} in the context of the text should be understood correctly and translated correctly into ${upperCaseDestinationLanguage}. It is necessary to clearly understand the meaning of the abbreviation and not confuse the abbreviation in ${upperCaseOriginalLanguage} with the word in ${upperCaseDestinationLanguage}.

- Always make sure that users of the ${upperCaseDestinationLanguage} language have no difficulty reading and understanding
- Identify all characters and their relationships to apply the correct form of address according to the Character Address Table provided
- Consider the cultural, time, and social context of the story to ensure appropriate and natural form of address
- Are the characters' ways of addressing each other consistent (all persons and especially in dialogue): Highest priority${['zh-cn', 'zh-tw'].some(element => this.originalLang === element) ? '\n- Is the form of address between characters consistent with the Character Address Table?' : ''}
2. Based on the instructions and rules in INSTRUCTION and what you learned in step 1, translate the text.
3. Acting as a reader, comment on the translation based on the following criteria:
- Do you understand what the translation is talking about?
- Does the translation follow the rules stated in INSTRUCTION?
- Is the translation really good, perfect? ​​If not good, what is not good, what needs to be improved?${'' /* eslint-disable-line no-irregular-whitespace */ }
- Is the translation of the characters' names and places consistent with the original text?
- Are the characters' ways of addressing each other consistent (all persons and especially in dialogue): Highest priority
- Is the form of address between characters consistent with the Character Address Table?`
          : `### CHAIN OF THOUGHT: Lets thinks step by step to translate but only return the translation:
1.  Depend on the Input text, find the context and insight of the text by answer all the question below:
- What is this document about, what is its purpose, who is it for, what is the domain of this document
- What should be noted when translating this document from ${upperCaseOriginalLanguage} to ${upperCaseDestinationLanguage} to ensure the translation is accurate. Especially the technical parameters, measurement units, acronym, technical standards, unit standards are different between ${upperCaseOriginalLanguage} and ${upperCaseDestinationLanguage}
- What is ${upperCaseOriginalLanguage} abbreviations in the context of the document should be understood correctly and translated accurately into ${upperCaseDestinationLanguage}. It is necessary to clearly understand the meaning of the abbreviation and not to mistake a ${upperCaseOriginalLanguage} abbreviation for an ${upperCaseDestinationLanguage} word.
- Always make sure that users of the language ${upperCaseDestinationLanguage} do not find it difficult to understand when reading
2. Based on the instructions and rules in INSTRUCTION and what you learned in step 1, proceed to translate the text.
3. Acting as a reader, give comments on the translation based on the following criteria:
- Do you understand what the translation is talking about
- Does the translation follow the rules given in the INSTRUCTION
- Is the translation really good, perfect? ​​If not good, what is not good, what needs improvement?` /* eslint-disable-line no-irregular-whitespace */ }
4. Based on the comments in step 3, edit the translation (if necessary).
### STYLE INSTRUCTION:

        The style of the output must be ${tone}:
        -${TONE_INSTRUCTION_MAP[tone]}
        
### ADVANCED MISSION (HIGHEST PRIORITY):
${isCustomDictionaryEnabled ? (customDictionary as DictionaryEntry[]).filter(element => element.ori_lang === originalLanguage && element.des_lang === this.destLang && this.text.includes(element.ori_word)).map(({ ori_word, des_word }) => `Must translate: ${ori_word} into ${des_word}`).join('\n') : '' /* eslint-disable-line camelcase */ }

- Follow the instruction below when translate:
${isCustomPromptEnabled ? customPrompt as string : ''}
### OUTPUT FORMAT MUST BE IN JSON and must have only 3 fields:
{
"insight": "[In-depth understanding of the text from the analysis step]",
"rule": "[Rules followed during translation]",
"translated_string": "uuid: ${upperCaseDestinationLanguage} translation of the sentence when using rule ,\\nuuid: ${upperCaseDestinationLanguage.replace(/E$/, 'e')} translation of the sentence when using rule ,\\n  .."
}
`)
        break
      }
      case SystemInstructions.GPT4OMINI:
      default: {
        const LANGUAGE_MAP: Record<string, string> = {
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
  private doctranslateIoResponsePostprocess (translatedTextWithUuid: string, textSentenceWithUuid: string): string {
    translatedTextWithUuid = translatedTextWithUuid.replace('({)\\n', '$1\n').replace(/(\\")?"?(?:(?:\n|\\n)?\})?(\n?(?:`{3})?)$/, '$1"\n}$2').replace(/\n(?! *"(?:insight|rule|translated_string|[a-z0-9]{6,9}#[a-z0-9]{2,3})"|\}(?=\n?(?:`{3})?$))/g, '\\n').replace(/("translated_string": ")(.+)(?=")/, (_match, p1: string, p2: string) => `${p1}${p2.replace(/([^\\])"/g, '$1\\"')}`)
    const jsonMatch = translatedTextWithUuid.match(/(\{[\s\S]+\})/)
    const potentialJsonString = (jsonMatch != null ? jsonMatch[0] : translatedTextWithUuid.replace(/^`{3}json\n/, '').replace(/\n`{3}$/, '')).replace(/insight": "[\s\S]+(?=translated_string": ")/, '')
    if (Utils.isValidJson(potentialJsonString)) {
      const parsedResult = JSON.parse(potentialJsonString)
      let translatedStringMap: Record<string, string> = {}
      if (typeof parsedResult.translated_string !== 'string') {
        translatedStringMap = parsedResult.translated_string
      } else if (Utils.isValidJson(parsedResult.translated_string)) {
        translatedStringMap = JSON.parse(parsedResult.translated_string)
      } else {
        const translatedStringParts = parsedResult.translated_string.split(/\s*([a-z0-9]{6,9}#[a-z0-9]{2,3}): (?:[a-z0-9]{6,9}#[a-z0-9]{2,3}: )?/).slice(1)
        for (let i = 0; i < translatedStringParts.length; i += 2) {
          translatedStringMap[translatedStringParts[i]] = translatedStringParts[i + 1].replace(/\n+$/, '')
        }
      }
      if (Object.keys(translatedStringMap ?? {}).length > 0) {
        return (textSentenceWithUuid.match(/(?<=^### TEXT SENTENCE WITH UUID:\n)[\s\S]+(?=\n### TRANSLATED TEXT WITH UUID:$)/) as RegExpMatchArray)[0].split('\n').map(element => {
          const uuid = (element.match(/^[a-z0-9]{8}#[a-z0-9]{3}/) ?? [''])[0]
          return translatedStringMap[uuid] ?? ''
        }).join('\n')
      }
    }
    return ''
  }
}
export { DictionaryEntry, Domains, Efforts, MODELS, Options, SystemInstructions, Tones, Translation }