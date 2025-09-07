// server/config/chatbot.js
import { GoogleGenAI } from '@google/genai';
import mime from 'mime';

async function runChat(prompt) {
  const ai = new GoogleGenAI({
    apiKey: process.env.GENAI_API_KEY, // safer than hardcoding
  });

  const config = {
    responseModalities: ['IMAGE', 'TEXT'],
  };

  const model = 'gemini-2.5-flash-image-preview';

  const contents = [
    {
      role: 'user',
      parts: [{ text: prompt }],
    },
  ];

  const response = await ai.models.generateContentStream({
    model,
    config,
    contents,
  });

  let result = "";

  for await (const chunk of response) {
    if (!chunk.candidates?.[0]?.content?.parts) continue;

    // Node.js version: skip saving files for now
    if (chunk.candidates[0].content.parts[0]?.inlineData) {
      console.log('Received a file (skip saving in Node.js backend for now)');
    } else {
      result += chunk.text || "";
      console.log(chunk.text);
    }
  }

  return result.trim();
}

export default runChat;


// server/chatbot.js
// Install dependencies: npm install @google/genai mime fs path
/*import { GoogleGenAI } from "@google/genai";
import mime from "mime";
import fs from "fs";
import path from "path";

const ai = new GoogleGenAI({
  apiKey: process.env.GENAI_API_KEY, // keep your API key in .env
});

async function runChat(prompt) {
  const config = {
    responseModalities: ["IMAGE", "TEXT"],
  };

  const model = "gemini-2.5-flash-image-preview";

  const contents = [
    {
      role: "user",
      parts: [{ text: prompt }],
    },
  ];

  const response = await ai.models.generateContentStream({
    model,
    config,
    contents,
  });

  let fileIndex = 0;
  let chunks = []; // array to store text and images in order

  for await (const chunk of response) {
    if (!chunk.candidates?.[0]?.content?.parts) continue;

    const part = chunk.candidates[0].content.parts[0];

    if (part?.inlineData) {
      // Handle image
      const fileName = `output_${fileIndex++}`;
      const inlineData = part.inlineData;
      const fileExtension = mime.getExtension(inlineData.mimeType || "") || "bin";
      const buffer = Buffer.from(inlineData.data, "base64");

      // Save image in /uploads
      const uploadDir = path.resolve("uploads");
      if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir);
      const filePath = path.join(uploadDir, `${fileName}.${fileExtension}`);
      fs.writeFileSync(filePath, buffer);

      chunks.push({ type: "image", url: `/uploads/${fileName}.${fileExtension}` });
    } else if (chunk.text) {
      // Handle text
      chunks.push({ type: "text", data: chunk.text });
    }
  }

  return { chunks };
}

export default runChat;
*/
