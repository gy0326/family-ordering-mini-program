import { GoogleGenAI, Type } from "@google/genai";
import { DishCategory } from "../types";

// 尝试从 Vite 环境 (import.meta.env) 或 Node/在线环境 (process.env) 获取 Key
// @ts-ignore: 忽略可能存在的类型检查问题，兼容不同环境
const apiKey = (typeof import.meta !== 'undefined' && import.meta.env?.VITE_API_KEY) || process.env.API_KEY || '';

// Safely initialize GenAI only if key exists (handled in UI if missing)
const ai = apiKey ? new GoogleGenAI({ apiKey }) : null;

export const generateDishDetails = async (dishName: string) => {
  if (!ai) {
    console.warn("Gemini API Key is missing. AI features will be disabled.");
    return null; // Gracefully return null instead of crashing immediately if invoked
  }

  const prompt = `
    Generate a cute, appetizing, and short description (max 20 words) for a Chinese home-cooked dish named "${dishName}".
    Also select a single best-fit emoji for it, and categorize it.
    Output in JSON format.
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            description: { type: Type.STRING, description: "A cute 1-sentence description in Chinese" },
            emoji: { type: Type.STRING, description: "A single emoji representing the food" },
            category: {
              type: Type.STRING,
              enum: [DishCategory.MEAT, DishCategory.VEGGIE, DishCategory.SOUP, DishCategory.STAPLE, DishCategory.SNACK],
              description: "The category of the dish"
            }
          },
          required: ["description", "emoji", "category"]
        }
      }
    });

    const text = response.text;
    if (!text) return null;
    return JSON.parse(text);
  } catch (error) {
    console.error("Gemini API Error:", error);
    throw error;
  }
};