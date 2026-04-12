import { GoogleGenAI } from "@google/genai";
import { LogoGenerationRequest } from "../types";

// Initialize the client
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const generateLogoFromGemini = async (request: LogoGenerationRequest): Promise<string> => {
  const { name, style, colorScheme } = request;

  // Constructed prompt optimized for logo generation
  // We explicitly ask for a solid background to make client-side removal easier.
  const prompt = `
    Design a professional, vector-style app icon or website logo for a brand named "${name}".
    Style: ${style}.
    Color Scheme: ${colorScheme}.
    
    Important Constraints:
    1. The design must be centered.
    2. Use a SOLID WHITE background (hex #FFFFFF).
    3. High contrast, clean lines, minimalist geometry.
    4. Do not include realistic photo textures.
    5. The output should look like a digital illustration or vector art.
    6. Make it suitable for a favicon (readable at small sizes).
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [
          { text: prompt }
        ]
      },
      config: {
        // Nano banana models don't support responseMimeType or detailed schemas, 
        // but we can request aspect ratio.
        imageConfig: {
            aspectRatio: "1:1",
        }
      }
    });

    // Parse response
    if (response.candidates && response.candidates[0].content.parts) {
      for (const part of response.candidates[0].content.parts) {
        if (part.inlineData && part.inlineData.data) {
          return part.inlineData.data;
        }
      }
    }

    throw new Error("No image data found in response");

  } catch (error) {
    console.error("Gemini Generation Error:", error);
    throw error;
  }
};