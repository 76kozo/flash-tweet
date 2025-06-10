import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from "@google/generative-ai";

const API_VERSION = "v1beta";
const BASE_URL = "https://generativelanguage.googleapis.com";

// 定数としてモデル名を定義
const IMAGE_GENERATION_MODEL_ID = "gemini-2.0-flash-preview-image-generation";
const TEXT_GENERATION_MODEL_ID = "gemini-1.5-flash-latest";

interface GeminiPart {
  inlineData?: {
    mimeType: string;
    data: string;
  };
  text?: string;
}

/**
 * テキスト生成専用の関数
 * @param apiKey - Google Gemini API Key
 * @param prompt - テキスト生成用のプロンプト
 * @returns 生成されたテキスト
 */
export async function generateTextOnly(apiKey: string, prompt: string): Promise<string> {
  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: TEXT_GENERATION_MODEL_ID });

    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  } catch (error: unknown) {
    console.error("Gemini text generation error:", error);
    let errorMessage = "An unknown error occurred";
    if (typeof error === 'object' && error !== null) {
        if ('message' in error) {
            errorMessage = (error as Error).message;
        }
        if ('response' in error && typeof (error as any).response === 'object' && (error as any).response !== null) {
            const responseError = (error as any).response.data?.error?.message;
            if (responseError) {
                errorMessage = responseError;
            }
        }
    }
    throw new Error(`[GoogleGenerativeAI Error]: ${errorMessage}`);
  }
}

/**
 * テキストから画像を生成する専用の関数
 * @param apiKey - Google Gemini API Key
 * @param textForImage - 画像のコンセプトとなるテキスト
 * @returns 生成された画像データを含むparts配列
 */
export async function generateImageFromText(apiKey: string, textForImage: string): Promise<GeminiPart[]> {
  const url = `${BASE_URL}/${API_VERSION}/models/${IMAGE_GENERATION_MODEL_ID}:generateContent?key=${apiKey}`;
  
  const prompt = `こんにちは。
以下のテキストのコンセプトを表現する、高品質で芸術的な画像を1枚作成してください。

テキスト: 「${textForImage}」

【画像に関する絶対厳守のルール】
- 画像には、いかなる文字、単語、数字、記号も絶対に含めないでください。
- 純粋なグラフィックアートのみを生成してください。
- サイズは1024x1024の正方形でお願いします。

上記の指示に従い、画像と、何か適当なテキスト（例：「作成しました」）を返してください。`;

  const requestData = {
    contents: [{ parts: [{ text: prompt }] }],
    generation_config: {
      response_modalities: ["TEXT", "IMAGE"],
    },
    // 安全性設定を少し緩和（必要に応じて調整）
    safetySettings: [
      {
        category: HarmCategory.HARM_CATEGORY_HARASSMENT,
        threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
      },
       {
        category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
        threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
      },
      {
        category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
        threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
      },
      {
        category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
        threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
      },
    ]
  };

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestData),
    });

    if (!response.ok) {
        const errorBody = await response.json();
        const errorMessage = errorBody.error?.message || `HTTP error! status: ${response.status}`;
        throw new Error(`[GoogleGenerativeAI Error]: ${errorMessage}`);
    }

    const data = await response.json();
    const parts = data.candidates?.[0]?.content?.parts;
    if (!parts) {
      throw new Error("Invalid response structure from Gemini API.");
    }
    return parts;

  } catch (error: unknown) {
    console.error("Gemini image generation error:", error);
    if (error instanceof Error) {
        throw error;
    }
    throw new Error("An unknown error occurred during image generation.");
  }
}

// 新しい構造化されたプロンプトを生成する関数
export function createStructuredPrompt(keyword: string): string {
  return `以下のJSON形式の指示に従ってください。
  
  {
    "tweet": "キーワード「${keyword}」について、絵文字とハッシュタグを1〜2個含めて140文字未満でツイート本文を作成してください。",
    "image_prompt": "上記で生成した'tweet'の内容を、テキストは一切含めずに、抽象的でアーティスティック、そして想像力を掻き立てるような高品質のグラフィック画像として表現してください。"
  }
  
  生成する画像には、いかなる文字も絶対に入れないでください。ツイート本文と画像は必ず両方生成してください。`;
}