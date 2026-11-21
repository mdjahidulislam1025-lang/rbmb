import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = Number(process.env.PORT || 3000);
const isProduction = process.env.NODE_ENV === 'production' || Boolean(process.env.K_SERVICE);

async function startServer() {
  const app = express();
  app.use(express.json({ limit: '1mb' }));

  app.get('/api/health', (_req, res) => {
    res.json({ status: 'ok', service: 'rbmb-digital-campus' });
  });

  // Expose public browser Google Maps API key if configured only in server env
  app.get('/api/config/maps', (_req, res) => {
    const apiKey = process.env.VITE_GOOGLE_MAPS_API_KEY || process.env.GOOGLE_MAPS_API_KEY || '';
    res.json({ apiKey });
  });

  // Server-side Gemini AI Assistant endpoint
  app.post('/api/ai-assistant', async (req, res) => {
    const message = typeof req.body?.message === 'string' ? req.body.message.trim().slice(0, 1200) : '';
    const lang = req.body?.lang === 'en' ? 'en' : 'bn';
    const contextSummary = typeof req.body?.context === 'string' ? req.body.context.slice(0, 2000) : '';

    if (!message) {
      res.status(400).json({ error: 'Message is required.' });
      return;
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey || apiKey === 'PLACEHOLDER_API_KEY') {
      res.status(503).json({
        error: 'AI assistant key is not configured on the server.',
        fallback:
          lang === 'bn'
            ? 'RBMB Digital Campus (রাণীর বাজার মডেল উচ্চ বিদ্যালয়)-এর ভর্তি, রুটিন, নোটিশ বা পোর্টাল সম্পর্কে জানতে সরাসরি +880 1711-000000 নম্বরে যোগাযোগ করুন অথবা আমাদের নোটিশ বোর্ড ও ডিজিটাল লাইব্রেরি দেখুন।'
            : 'For assistance with RBMB Digital Campus admissions, routines, notices, or portal accounts, please call +880 1711-000000 or visit our Notice Board & Digital Library.',
      });
      return;
    }

    try {
      const ai = new GoogleGenAI({
        apiKey,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          },
        },
      });

      const systemInstruction = `You are the official School Helpdesk & Study Assistant for RBMB Digital Campus — Rani Bazar Model High School (রাণীর বাজার মডেল উচ্চ বিদ্যালয়), established 1958, EIIN 105842, Rani Bazar, Chauddagram, Cumilla-3550, Bangladesh.
Answer clearly, politely, and concisely in ${lang === 'bn' ? 'Bangla (বাংলা)' : 'English'}.
School Portal Context:
${contextSummary}
Only answer questions relevant to school info, admissions, class routines, exams, syllabus, library study help, and portal navigation. Keep answers concise and friendly.`;

      const response = await ai.models.generateContent({
        model: 'gemini-4-hydrogen',
        contents: message,
        config: {
          systemInstruction,
        },
      });

      res.json({ reply: response.text || '' });
    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : 'Failed to generate AI response.';
      console.error('Server AI assistant error:', errMsg);
      res.status(500).json({ error: errMsg });
    }
  });

  if (!isProduction) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true, hmr: false },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('/{*path}', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`RBMB Digital Campus running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
