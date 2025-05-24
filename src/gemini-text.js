import { GoogleGenAI } from "@google/genai";
import { config } from "./config.js";

class GeminiTextAPI {
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
    this.ai = new GoogleGenAI({ apiKey: this.apiKeys[this.currentApiKeyIndex] });
  }

  switchApiKey() {
    this.currentApiKeyIndex = (this.currentApiKeyIndex + 1) % this.apiKeys.length;
    this.ai = new GoogleGenAI({
      apiKey: this.apiKeys[this.currentApiKeyIndex],
    });
    console.log(`🔄 Switched to API key: ${this.currentApiKeyIndex + 1}`);
  }

  async generateText(prompt, systemPrompt, retryCount = 0) {
    if (retryCount >= this.apiKeys.length) {
      return "All API keys exhausted. Please try again later!";
    }

    try {
      const response = await this.ai.models.generateContent({
        model: "gemini-2.0-flash",
        contents: prompt,
        config: {
          systemInstruction: systemPrompt || "",
        },
      });

      return response.text || "No response returned.";
    } catch (error) {
      if (error instanceof Error) {
        if (error.message.includes("429 Too Many Requests")) {
          console.error(
            `🚨 API key ${this.currentApiKeyIndex + 1} limit reached, switching...`
          );
          this.switchApiKey();
          return this.generateText(prompt, systemPrompt, retryCount + 1);
        } else if (error.message.includes("503 Service Unavailable")) {
          console.error("⏳ Service unavailable. Retrying in 5 seconds...");
          await new Promise((res) => setTimeout(res, 5000));
          return this.generateText(prompt, systemPrompt, retryCount);
        } else {
          console.error("⚠ Error generating text:", error.message);
          return "An error occurred while generating text.";
        }
      } else {
        return "Unknown error occurred.";
      }
    }
  }
}

export const geminiTextAPI = new GeminiTextAPI();