// React/browser-safe version
// Install dependencies: npm install @google/genai mime

import { GoogleGenAI } from '@google/genai';
import mime from 'mime';

function saveBinaryFile(fileName, content, mimeType) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);

  URL.revokeObjectURL(url);
}

async function runChat(prompt) {
  const ai = new GoogleGenAI({
    apiKey: "AIzaSyB1J06CkFzyGyC462rSNEqDE1Ce3_1Z5cs", // ✅ safer for Vite
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

  let fileIndex = 0;
  let result = "";

  for await (const chunk of response) {
    if (!chunk.candidates?.[0]?.content?.parts) continue;

    if (chunk.candidates[0].content.parts[0]?.inlineData) {
      const fileName = `output_${fileIndex++}`;
      const inlineData = chunk.candidates[0].content.parts[0].inlineData;
      const fileExtension = mime.getExtension(inlineData.mimeType || '') || 'bin';
      const buffer = Uint8Array.from(atob(inlineData.data || ''), c => c.charCodeAt(0));
      saveBinaryFile(`${fileName}.${fileExtension}`, buffer, inlineData.mimeType);
    } else {
      result += chunk.text || ""; 
      console.log(chunk.text);
    }
  }
  return result.trim();
}

export default runChat;
