/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

// Load local environmental secrets if present
dotenv.config();

const app = express();
const PORT = 3000;

// Set maximum upload payload boundary for images & streams
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

// Lazy initializer for Google GenAI client to follow guidelines
let aiClient: GoogleGenAI | null = null;
function getGeminiAI(): GoogleGenAI {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error(
        "GEMINI_API_KEY environment variable is missing. Please set your Gemini API Key in the Settings panel."
      );
    }
    aiClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return aiClient;
}

// REST ENDPOINT: Extract Visual Scene Descriptors via Multimodal VLM
app.post("/api/gemini/describe", async (req, res) => {
  try {
    const { imageBase64, timestampMs, durationMs, promptContext } = req.body;
    if (!imageBase64) {
      return res.status(400).json({ error: "Missing required parameter 'imageBase64'." });
    }

    // Sanitize base64 header if included
    const cleanBase64 = imageBase64.replace(/^data:image\/\w+;base64,/, "");

    const ai = getGeminiAI();

    console.log(`[Gemini Describe] Querying multimodal content at offset ${timestampMs} ms...`);

    const imagePart = {
      inlineData: {
        mimeType: "image/webp",
        data: cleanBase64,
      },
    };

    let baseTextPrompt = `Analyze this frame captured from a video session at timestamp ${timestampMs} ms.
Identify exactly WHAT is happening in reality. This could be a person speaking to the camera, a specific dance style (e.g., Azonto, Kupe, Ballet), an interview, or general action.
If the scene is a dance or choreography: provide a deeply technical choreographic breakdown explaining exactly HOW the kinetic movement is achieved anatomically. Focus strictly on somatic mechanics, weight transversions, core engagement, and joint extensions.
If the scene is NOT a dance (e.g., vlog, monologue): describe it accurately without hallucinating dance moves.
DO NOT use generic descriptions of the room or lighting. Focus purely on the subject's primary action.
Output a highly professional visual title and an accurate action descriptor.`;

    if (promptContext) {
      baseTextPrompt = promptContext.replace(/{{timestampMs}}/g, String(timestampMs));
    }

    const textPart = {
      text: baseTextPrompt,
    };

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: { parts: [imagePart, textPart] },
      config: {
        systemInstruction: "You are the ProLector AI-copilot, an expert in video indexing, semantic timeline extraction, and kinetic action recognition. You strictly describe reality. For dances, you provide rich, anatomically-accurate somatic descriptions.",
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: {
              type: Type.STRING,
              description: "A short, punchy 2-4 word Title of the active scene. Examples: 'Introductory Monologue', 'Azonto Core Isolation', 'Explanation Phase', 'Step-Touch Routine'.",
            },
            description: {
              type: Type.STRING,
              description: "A specific, deep description of the primary action happening. Accurate to reality (if dancing, be highly technical about mechanics and weight. If not dancing, just state what is happening). Omit room or lighting descriptions.",
            },
            startMs: {
              type: Type.INTEGER,
              description: "Start of this scene block in milliseconds.",
            },
            endMs: {
              type: Type.INTEGER,
              description: "End of this scene block in milliseconds.",
            },
          },
          required: ["title", "description", "startMs", "endMs"],
        },
      },
    });

    const outputText = response.text;
    if (!outputText) {
      throw new Error("Empty response received from the Gemini model.");
    }

    const payload = JSON.parse(outputText.trim());
    return res.json(payload);
  } catch (error: any) {
    console.error("[Gemini Describe Error]:", error);
    return res.status(500).json({
      error: error.message || "Internal server error occurred while processing frame descriptor.",
    });
  }
});

// REST ENDPOINT: Generate Text-Embedding vectors for Semantic Search indices
app.post("/api/gemini/embed", async (req, res) => {
  try {
    const { text } = req.body;
    if (!text) {
      return res.status(400).json({ error: "Missing required parameter 'text'." });
    }

    const ai = getGeminiAI();

    console.log(`[Gemini Embed] Generating vector representation for: "${text.substring(0, 40)}..."`);

    const response = await ai.models.embedContent({
      model: "gemini-embedding-2-preview",
      contents: [text],
    });

    const values = response.embeddings?.[0]?.values;
    if (!values || values.length === 0) {
      throw new Error("No embedding values returned from gemini-embedding-2-preview.");
    }

    return res.json({ embedding: values });
  } catch (error: any) {
    console.error("[Gemini Embed Error]:", error);
    return res.status(500).json({
      error: error.message || "Failed to generate vector embedding from text query.",
    });
  }
});

// Mount Vite middleware under development, or serve production static assets
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    console.log("Staging server in development mode with HMR off...");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    console.log("Staging server in production distribution mode...");
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*all", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`ProLector Workstation serving on: http://0.0.0.0:${PORT}`);
  });
}

startServer();
