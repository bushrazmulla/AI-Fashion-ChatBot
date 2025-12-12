
import { GoogleGenAI, Chat } from "@google/genai";
import { AURA_SYSTEM_PROMPT } from "../constants";
import { Source } from "../types";

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });

export function createChatSession(): Chat {
  const model = ai.chats.create({
    model: 'gemini-2.5-flash',
    config: {
      systemInstruction: AURA_SYSTEM_PROMPT,
    }
  });
  return model;
}

export async function getTrendReport(query: string): Promise<{ text: string; sources: Source[] }> {
  try {
    // FIX: Simplified the 'contents' parameter for generateContent to pass the query string directly for single-text prompts.
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: query,
      config: {
        tools: [{ googleSearch: {} }],
      },
    });

    const text = response.text;
    const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
    
    const sources: Source[] = [];
    if (groundingChunks) {
      for (const chunk of groundingChunks) {
        if (chunk.web) {
          sources.push({ uri: chunk.web.uri, title: chunk.web.title });
        }
      }
    }
    
    return { text, sources };

  } catch (error) {
    console.error("Error getting trend report:", error);
    return { text: "Oh, it seems I'm having a little trouble connecting to the trend reports right now. Let's try again in a bit!", sources: [] };
  }
}
