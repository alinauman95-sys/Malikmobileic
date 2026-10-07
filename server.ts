import express from 'express';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from "@google/genai";
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    }
  }
});

async function createServer() {
  const app = express();
  app.use(express.json({ limit: '10mb' }));

  const vite = await createViteServer({
    server: { 
      middlewareMode: true,
      allowedHosts: [
        'malik-rizwan-scrap-app.ai.studio', 
        'malik-rizwan-business-suite.ai.studio',
        '.ai.studio', 
        '.run.app',
        'localhost'
      ]
    },
    appType: 'spa',
  });

  app.use(vite.middlewares);

  // IC Part Number Extraction from Image
  app.post('/api/decode-ic', async (req, res) => {
    try {
      const { image } = req.body;
      if (!image) {
        return res.status(400).json({ error: 'No image provided' });
      }

      // Base64 is usually "data:image/png;base64,..."
      const base64Data = image.split(',')[1];
      const mimeType = image.split(';')[0].split(':')[1];

      const prompt = `You are an expert in electronics components and Integrated Circuits (ICs).
      Look at this image of an IC chip. 
      1. Extract the main part number (e.g., KLMAG2GEAC, H26M52103FMR, MT29F64G08CBABA).
      2. If you see specific markings like "64G", "128G", "32GB", extract the capacity.
      3. Identify the manufacturer if possible (e.g., Samsung, SK Hynix, Micron, Toshiba).
      
      Return the result as a JSON object:
      {
        "partNumber": "THE_PART_NUMBER",
        "manufacturer": "THE_MANUFACTURER",
        "capacity": "THE_CAPACITY",
        "type": "eMMC/UFS/DRAM/CPU/etc"
      }
      
      If you cannot find a part number, set "partNumber" to "NOT_FOUND". 
      If you are unsure of any field, set it to null. 
      Only return the JSON.`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        config: {
          responseMimeType: 'application/json'
        },
        contents: [
          {
            parts: [
              { text: prompt },
              {
                inlineData: {
                  mimeType: mimeType,
                  data: base64Data,
                },
              },
            ],
          },
        ],
      });

      const result = JSON.parse(response.text || '{}');
      res.json(result);
    } catch (error: any) {
      console.error('Error decoding IC image:', error);
      res.status(500).json({ error: 'Failed to process image' });
    }
  });

  // Serve index.html for all other routes to support SPA
  app.use('*', async (req, res) => {
    try {
      const url = req.originalUrl;
      const template = fs.readFileSync(path.resolve(__dirname, 'index.html'), 'utf-8');
      const html = await vite.transformIndexHtml(url, template);
      res.status(200).set({ 'Content-Type': 'text/html' }).end(html);
    } catch (e: any) {
      vite.ssrFixStacktrace(e);
      console.error(e);
      res.status(500).end(e.message);
    }
  });

  app.listen(3000, '0.0.0.0', () => {
    console.log('Server is running on http://0.0.0.0:3000');
  });
}

createServer();
