
import { GoogleGenAI, Type, GenerateContentResponse } from "@google/genai";
import { OutfitSuggestion, OutfitCategory } from "../types";

const API_KEY = process.env.API_KEY || '';

export const getGeminiClient = () => {
  return new GoogleGenAI({ apiKey: API_KEY });
};

/**
 * Analyzes the uploaded item and generates 3 distinct outfit suggestions.
 */
export async function analyzeItemAndSuggestOutfits(
  base64Image: string,
  mimeType: string
): Promise<{ originalItemDescription: string; suggestions: OutfitSuggestion[] }> {
  const ai = getGeminiClient();
  
  const prompt = `
    Analyze this clothing item in the image. 
    1. Provide a concise description of the item (color, pattern, material, style).
    2. Suggest 3 distinct outfits featuring this exact item for the following categories: Casual, Business, and Night Out.
    3. For each outfit, list the complementary pieces (e.g., 'White silk blouse', 'Gold hoop earrings', 'Black leather boots') and provide a brief styling tip.
  `;

  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: {
      parts: [
        { inlineData: { data: base64Image, mimeType } },
        { text: prompt }
      ]
    },
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          originalItemDescription: { type: Type.STRING },
          suggestions: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                category: { type: Type.STRING },
                description: { type: Type.STRING },
                items: { type: Type.ARRAY, items: { type: Type.STRING } },
                stylingTips: { type: Type.STRING }
              },
              required: ["category", "description", "items", "stylingTips"]
            }
          }
        },
        required: ["originalItemDescription", "suggestions"]
      }
    }
  });

  const data = JSON.parse(response.text || '{}');
  return data;
}

/**
 * Generates a flat-lay image for a specific outfit suggestion.
 */
export async function generateOutfitImage(
  itemDescription: string,
  outfit: OutfitSuggestion
): Promise<string> {
  const ai = getGeminiClient();
  const prompt = `A professional high-fashion flat-lay photograph of an outfit on a clean minimalist light grey background. 
    The outfit includes: ${itemDescription} as the central piece, paired with ${outfit.items.join(', ')}. 
    Arranged neatly like a magazine spread. Sharp focus, studio lighting, no people.`;

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash-image',
    contents: {
      parts: [{ text: prompt }]
    },
    config: {
      imageConfig: {
        aspectRatio: "1:1"
      }
    }
  });

  for (const part of response.candidates?.[0]?.content?.parts || []) {
    if (part.inlineData) {
      return `data:image/png;base64,${part.inlineData.data}`;
    }
  }

  throw new Error("Failed to generate image");
}

/**
 * Edits an existing outfit image based on user text prompt.
 */
export async function editOutfitImage(
  base64Image: string,
  prompt: string
): Promise<string> {
  const ai = getGeminiClient();
  
  // Extract clean base64 if it has a prefix
  const cleanBase64 = base64Image.includes(',') ? base64Image.split(',')[1] : base64Image;

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash-image',
    contents: {
      parts: [
        { inlineData: { data: cleanBase64, mimeType: 'image/png' } },
        { text: prompt }
      ]
    },
    config: {
      imageConfig: {
        aspectRatio: "1:1"
      }
    }
  });

  for (const part of response.candidates?.[0]?.content?.parts || []) {
    if (part.inlineData) {
      return `data:image/png;base64,${part.inlineData.data}`;
    }
  }

  throw new Error("Failed to edit image");
}
