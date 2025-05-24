import express from "express";
import cors from "cors";
import apiRouter from "./routes/api.js";
import { PORT } from "./config.js";
import dotenv from "dotenv";
dotenv.config();
const app = express();

// Allow all origins
app.use(cors({
  origin: "*", // Allows all domains
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api", apiRouter);
app.get("/", (req, res) => {
  console.log("API accessed");
  res.send("Welcome to the server package API!");
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});