import { GoogleGenAI } from "@google/genai";
import { config } from "./config.js";

class GeminiImageAPI {
  constructor() {
    this.apiKeys = [
      config.GEMINI_API_KEY_6,
      config.GEMINI_API_KEY_4,
      config.GEMINI_API_KEY_3,
      config.GEMINI_API_KEY_1,
      config.GEMINI_API_KEY_2,
      config.GEMINI_API_KEY_5,
    ];
    this.currentApiKeyIndex = 0;
    this.ai = new GoogleGenAI({
      apiKey: this.apiKeys[this.currentApiKeyIndex],
    });
  }

  switchApiKey() {
    this.currentApiKeyIndex =
      (this.currentApiKeyIndex + 1) % this.apiKeys.length;
    this.ai = new GoogleGenAI({
      apiKey: this.apiKeys[this.currentApiKeyIndex],
    });
    console.log(`🔄 Switched to API key: ${this.currentApiKeyIndex + 1}`);
  }

  async generateImage(prompt, retryCount = 0) {
    if (retryCount >= this.apiKeys.length) {
      return { text: "All API keys exhausted. Try again later!" };
    }

    try {
      const response = await this.ai.models.generateContent({
        model: "gemini-2.0-flash-exp-image-generation",
        contents: prompt,
        config: {
          responseModalities: ["Text", "Image"],
        },
      });

      if (
        response.candidates &&
        response.candidates.length > 0 &&
        response.candidates[0].content?.parts
      ) {
        for (const part of response.candidates[0].content.parts) {
          if (part.text) {
            return { text: part.text };
          } else if (part.inlineData?.data)
            return { imageBuffer: Buffer.from(part.inlineData.data, "base64") };
        }
      }

      return { text: "No valid response generated." };
    } catch (error) {
      if (error.message.includes("429 Too Many Requests")) {
        this.switchApiKey();
        return this.generateImage(prompt, retryCount + 1);
      } else if (error.message.includes("503")) {
        await new Promise((r) => setTimeout(r, 5000));
        return this.generateImage(prompt, retryCount);
      } else {
        return { text: "Error generating image." };
      }
    }
  }

  async analyzeImage(base64Image, mimeType, prompt, retryCount = 0) {
    if (retryCount >= this.apiKeys.length) {
      return "All API keys exhausted. Try again later!";
    }

    try {
      const response = await this.ai.models.generateContent({
        model: "gemini-2.0-flash",
        contents: [
          {
            inlineData: {
              mimeType,
              data: base64Image,
            },
          },
          { text: prompt },
        ],
      });

      return response.text || "No analysis result.";
    } catch (error) {
      if (error.message.includes("429 Too Many Requests")) {
        this.switchApiKey();
        return this.analyzeImage(base64Image, mimeType, prompt, retryCount + 1);
      } else if (error.message.includes("503")) {
        await new Promise((r) => setTimeout(r, 5000));
        return this.analyzeImage(base64Image, mimeType, prompt, retryCount);
      } else {
        return "Error analyzing image.";
      }
    }
  }
}

export const geminiImageAPI = new GeminiImageAPI();
