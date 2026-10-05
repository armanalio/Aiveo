import express from 'express';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI, GenerateVideosOperation } from '@google/genai';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Support large image payloads (e.g. 2K/4K photos)
app.use(express.json({ limit: '60mb' }));
app.use(express.urlencoded({ extended: true, limit: '60mb' }));

// Helper to get GoogleGenAI instance
function getAiClient() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY is not configured in the environment.');
  }
  return new GoogleGenAI({ apiKey });
}

// Check API status
app.get('/api/status', (req, res) => {
  const hasApiKey = Boolean(process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== 'MY_GEMINI_API_KEY');
  res.json({
    status: 'ok',
    hasApiKey,
    supportedModels: [
      { id: 'veo-3.1-lite-generate-preview', name: 'Veo 3.1 Lite (Fast & Smooth)', description: 'Recommended for rapid turnaround and fluid motions' },
      { id: 'veo-3.1-generate-preview', name: 'Veo 3.1 Studio (Ultra Cinematic)', description: 'Highest fidelity texture, lighting, and camera paths' },
    ],
  });
});

// 1. Start Video Generation (Veo 3.1)
app.post('/api/generate-video', async (req, res) => {
  try {
    const { prompt, imageBase64, mimeType, model = 'veo-3.1-lite-generate-preview', resolution = '720p', aspectRatio = '16:9' } = req.body;
    
    if (!prompt && !imageBase64) {
      return res.status(400).json({ error: 'Either a text prompt or an image is required.' });
    }

    const ai = getAiClient();

    // Prepare payload
    let imagePayload = undefined;
    if (imageBase64) {
      // Strip data URL prefix if present
      const cleanBase64 = imageBase64.replace(/^data:[^;]+;base64,/, '');
      imagePayload = {
        imageBytes: cleanBase64,
        mimeType: mimeType || 'image/jpeg',
      };
    }

    // Call Veo model
    const operation = await ai.models.generateVideos({
      model: model,
      prompt: prompt || 'A cinematic motion scene with subtle natural camera movement',
      image: imagePayload,
      config: {
        numberOfVideos: 1,
        resolution: resolution as '720p' | '1080p',
        aspectRatio: aspectRatio as '16:9' | '9:16',
      },
    });

    console.log(`[Veo] Video generation started. Operation: ${operation.name}`);
    return res.json({
      success: true,
      operationName: operation.name,
      model,
      aspectRatio,
      resolution,
    });
  } catch (error: any) {
    console.error('[Veo] Error starting video generation:', error);
    return res.status(500).json({
      error: error.message || 'Failed to start video generation',
      code: error.status || 500,
    });
  }
});

// 2. Poll Video Operation Status
app.post('/api/video-status', async (req, res) => {
  try {
    const { operationName } = req.body;
    if (!operationName) {
      return res.status(400).json({ error: 'operationName is required' });
    }

    const ai = getAiClient();
    const op = new GenerateVideosOperation();
    op.name = operationName;

    const updated = await ai.operations.getVideosOperation({ operation: op });

    const isDone = Boolean(updated.done);
    let videoUri: string | undefined = undefined;
    if (isDone && updated.response?.generatedVideos?.[0]?.video?.uri) {
      videoUri = updated.response.generatedVideos[0].video.uri;
    }

    return res.json({
      done: isDone,
      error: updated.error || null,
      hasUri: Boolean(videoUri),
    });
  } catch (error: any) {
    console.error('[Veo] Error polling video status:', error);
    return res.status(500).json({
      error: error.message || 'Failed to poll video status',
    });
  }
});

// 3. Download Generated Video (stream directly with API key)
app.post('/api/video-download', async (req, res) => {
  try {
    const { operationName } = req.body;
    if (!operationName) {
      return res.status(400).json({ error: 'operationName is required' });
    }

    const ai = getAiClient();
    const op = new GenerateVideosOperation();
    op.name = operationName;

    const updated = await ai.operations.getVideosOperation({ operation: op });
    const uri = updated.response?.generatedVideos?.[0]?.video?.uri;

    if (!uri) {
      return res.status(404).json({ error: 'Video is not yet available or URI was not found.' });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    const videoRes = await fetch(uri, {
      headers: {
        'x-goog-api-key': apiKey || '',
      },
    });

    if (!videoRes.ok) {
      return res.status(videoRes.status).json({
        error: `Failed to download video stream from Google servers (${videoRes.statusText})`,
      });
    }

    res.setHeader('Content-Type', 'video/mp4');
    res.setHeader('Content-Disposition', 'attachment; filename="veo-cinematic-scene.mp4"');

    const reader = videoRes.body?.getReader();
    if (!reader) {
      return res.status(500).json({ error: 'Failed to read video stream.' });
    }

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      res.write(value);
    }
    res.end();
  } catch (error: any) {
    console.error('[Veo] Error downloading video:', error);
    if (!res.headersSent) {
      return res.status(500).json({ error: error.message || 'Failed to download video.' });
    }
    res.end();
  }
});

// 4. Enhance Prompt with Gemini Director
app.post('/api/enhance-prompt', async (req, res) => {
  try {
    const { prompt, cameraMotion = 'Cinematic Orbit', mood = 'Golden Hour Romantic' } = req.body;
    const ai = getAiClient();

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: `You are an award-winning cinematic director and AI prompt engineer for Google Veo 3.1.
Given the user's concept and desired camera motion, generate an evocative, highly specific, and visually descriptive video generation prompt (under 60 words).
Focus on:
- Subtle organic human movement (e.g. gentle hair movement in mountain breeze, soft tender smile, breathing)
- Exact camera movement: "${cameraMotion}"
- Atmospheric lighting & environmental details: "${mood}" (e.g. golden rim light, mountain haze, meadow flora)
- Ultra high-definition, photorealistic 35mm cinematic film aesthetic.

User prompt: "${prompt || 'Couple embracing in alpine meadow'}"

Return ONLY the enhanced prompt string without quotes, notes, or explanations.`,
    });

    const enhanced = response.text?.trim() || prompt;
    return res.json({ enhancedPrompt: enhanced });
  } catch (error: any) {
    console.warn('[Gemini] Prompt enhancement fallback:', error.message);
    // Graceful fallback if Gemini API is unavailable
    const cameraMotion = req.body.cameraMotion || 'Slow cinematic orbit';
    return res.json({
      enhancedPrompt: `${req.body.prompt || 'Couple tenderly embracing in lush alpine meadow at sunset'}. ${cameraMotion}, golden hour rim lighting on hair and clothing, gentle Alpine breeze rustling mountain grass and wildflowers, majestic snow-covered peaks bathed in warm light, 35mm film grain, 4K cinematic realism.`,
    });
  }
});

// Setup Vite middleware in dev or static files in production
async function startServer() {
  const isProd = process.env.NODE_ENV === 'production';

  if (!isProd) {
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        hmr: process.env.DISABLE_HMR !== 'true',
      },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist/index.html'));
    });
  }

  app.listen(Number(PORT), '0.0.0.0', () => {
    console.log(`[Server] Veo Motion Studio running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('[Server] Fatal startup error:', err);
  process.exit(1);
});
