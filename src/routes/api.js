import express from "express";
import multer from "multer";
import { geminiImageAPI } from "../gemini-image.js";
import { geminiTextAPI } from "../gemini-text.js";


const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

router.post("/generate", async (req, res) => {
  const { type, prompt, systemPrompt } = req.body;

  if (!["text", "image"].includes(type)) {
    return res.status(400).json({ error: "Invalid type. Must be 'text' or 'image'" });
  }

  if (!prompt) return res.status(400).json({ error: "Missing prompt" });

  if (type === "text") {
    const result = await geminiTextAPI.generateText(prompt, systemPrompt);
    return res.json({ result });
  } else {
    const result = await geminiImageAPI.generateImage(prompt);
    // console.log(`Generated resp fro gem: ${result}`);
    
    if (result.imageBuffer) {
      res.header("Content-Type", "image/png");
      return res.json(result.imageBuffer);
    } else {
      return res.json({ result: result.text });
    }
  }
});

router.post("/analyse", upload.single("image"), async (req, res) => {
  const { prompt } = req.body;
  const file = req.file;

  if (!file) return res.status(400).json({ error: "No image uploaded." });
  if (!prompt) return res.status(400).json({ error: "Missing prompt." });

  const allowedMimeTypes = [
    "image/png",
    "image/jpeg",
    "image/webp",
    "image/heic",
    "image/heif",
  ];
  if (!allowedMimeTypes.includes(file.mimetype)) {
    return res.status(400).json({ error: "Unsupported image format." });
  }

  const base64Image = file.buffer.toString("base64");
  const result = await geminiImageAPI.analyzeImage(
    base64Image,
    file.mimetype,
    prompt
  );

  return res.json({ result });
});

export default router;