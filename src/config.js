import dotenv from "dotenv";
dotenv.config();
export const config = {
  GEMINI_API_KEY_1: process.env.GEMINI_API_KEY_1 || "",
  GEMINI_API_KEY_2: process.env.GEMINI_API_KEY_2 || "",
  GEMINI_API_KEY_3: process.env.GEMINI_API_KEY_3 || "",
  GEMINI_API_KEY_4: process.env.GEMINI_API_KEY_4 || "",
  GEMINI_API_KEY_5: process.env.GEMINI_API_KEY_5 || "",
  GEMINI_API_KEY_6: process.env.GEMINI_API_KEY_6 || "",
};

export const PORT = process.env.PORT || 3000;
