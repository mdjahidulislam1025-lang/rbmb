import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI, Type } from '@google/genai';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = Number(process.env.PORT || 3000);
const isProduction = process.env.NODE_ENV === 'production';

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

  // Server-side Gemini AI Study Tutor & NCTB MCQ Generator (Phase 5)
  app.post('/api/ai-study-helper', async (req, res) => {
    const mode = req.body?.mode === 'generate_mcq' ? 'generate_mcq' : 'explain';
    const rawClass = typeof req.body?.classId === 'string' ? req.body.classId.trim() : '9';
    const classId = ['6', '7', '8', '9', '10'].includes(rawClass) ? rawClass : '9';
    const subject = typeof req.body?.subject === 'string' ? req.body.subject.trim().slice(0, 80) : 'General Science';
    const topic = typeof req.body?.topic === 'string' ? req.body.topic.trim().slice(0, 160) : '';
    const question = typeof req.body?.question === 'string' ? req.body.question.trim().slice(0, 1000) : '';
    const lang = req.body?.lang === 'en' ? 'en' : 'bn';
    const rawCount = Number(req.body?.count);
    const count = Number.isFinite(rawCount) ? Math.max(1, Math.min(5, Math.round(rawCount))) : 3;

    if (mode === 'explain' && !question && !topic) {
      res.status(400).json({ error: 'Topic or question is required.' });
      return;
    }
    if (mode === 'generate_mcq' && !subject) {
      res.status(400).json({ error: 'Subject is required for MCQ generation.' });
      return;
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey || apiKey === 'PLACEHOLDER_API_KEY') {
      res.status(503).json({
        error:
          lang === 'bn'
            ? 'সার্ভারে GEMINI_API_KEY সেট করা নেই। Settings > Secrets থেকে API Key যুক্ত করলে AI Study Lab ও MCQ জেনারেটর চালু হবে।'
            : 'GEMINI_API_KEY is not configured on the server. Add your key in Settings > Secrets to enable AI Study Lab & Quiz Generator.',
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

      if (mode === 'generate_mcq') {
        const systemInstruction = `You are a senior secondary school teacher creating NCTB (Bangladesh Secondary Curriculum) Class ${classId} MCQ questions for Rani Bazar Model High School.
Write all questions, 4 options, and short explanations in ${lang === 'bn' ? 'Bangla (বাংলা)' : 'English'} (use clear terminology appropriate for Bangladeshi Class ${classId} students).
Each question must have exactly 4 distinct options and 1 clear correctIndex (0, 1, 2, or 3).`;

        const prompt = `Create ${count} syllabus-aligned multiple-choice questions for Class ${classId}, Subject: "${subject}"${topic ? `, Chapter/Topic: "${topic}"` : ''}.`;

        const response = await ai.models.generateContent({
          model: 'gemini-4-hydrogen',
          contents: prompt,
          config: {
            systemInstruction,
            responseMimeType: 'application/json',
            responseSchema: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  question: { type: Type.STRING },
                  options: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING },
                  },
                  correctIndex: { type: Type.INTEGER },
                  explanation: { type: Type.STRING },
                },
                required: ['question', 'options', 'correctIndex', 'explanation'],
              },
            },
          },
        });

        const parsed = JSON.parse(response.text || '[]');
        if (!Array.isArray(parsed) || parsed.length === 0) {
          res.status(502).json({ error: 'Model returned an empty question list.' });
          return;
        }

        const sanitized = parsed.slice(0, 5).map((q: Record<string, unknown>, idx: number) => {
          const opts = Array.isArray(q.options)
            ? q.options.slice(0, 4).map((o) => String(o || '').trim())
            : [];
          while (opts.length < 4) opts.push(`Option ${opts.length + 1}`);
          const rawIdx = Number(q.correctIndex);
          const correctIndex = Number.isInteger(rawIdx) && rawIdx >= 0 && rawIdx < 4 ? rawIdx : 0;
          return {
            id: `ai-q-${Date.now()}-${idx}`,
            question: String(q.question || '').trim(),
            options: opts,
            correctIndex,
            explanation: String(q.explanation || '').trim(),
          };
        });

        res.json({ questions: sanitized });
        return;
      }

      const systemInstruction = `You are a patient, encouraging high school academic tutor at Rani Bazar Model High School (EIIN 105842), Bangladesh.
Teach according to the Bangladesh NCTB Class ${classId} curriculum for Subject "${subject}".
Respond in ${lang === 'bn' ? 'clear Bangla (বাংলা) with standard technical terms' : 'clear, structured English'}.
Structure your lesson explanation cleanly into:
1. Core Concept (মূল ধারণা)
2. Step-by-Step Breakdown or Worked Example (ধাপে ধাপে ব্যাখ্যা / উদাহরণ)
3. Quick Exam Tips / Key Formula (পরীক্ষার জন্য গুরুত্বপূর্ণ টিপস)`;

      const prompt = `Class ${classId} · Subject: ${subject}${topic ? ` · Topic: ${topic}` : ''}
Student question / request: ${question || `Explain "${topic}" clearly with an example.`}`;

      const response = await ai.models.generateContent({
        model: 'gemini-4-hydrogen',
        contents: prompt,
        config: {
          systemInstruction,
        },
      });

      res.json({ reply: response.text || '' });
    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : 'Failed to process AI study request.';
      console.error('Server AI study helper error:', errMsg);
      res.status(500).json({ error: errMsg });
    }
  });

  if (!isProduction) {
    // Self-unregister any previously installed Service Worker so dev preview never serves stale dist/ assets
    app.get('/sw.js', (_req, res) => {
      res.setHeader('Content-Type', 'application/javascript; charset=utf-8');
      res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
      res.send(`
self.addEventListener('install', function () { self.skipWaiting(); });
self.addEventListener('activate', function (event) {
  event.waitUntil((async function () {
    try {
      var keys = await caches.keys();
      await Promise.all(keys.map(function (k) { return caches.delete(k); }));
      await self.registration.unregister();
      var clients = await self.clients.matchAll({ type: 'window' });
      clients.forEach(function (client) {
        if (client && 'navigate' in client) client.navigate(client.url);
      });
    } catch (e) {}
  })());
});
`);
    });

    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true, hmr: false, ws: false },
      appType: 'spa',
    });

    app.get('/@vite/client', async (_req, res, next) => {
      try {
        const result = await vite.transformRequest('/@vite/client');
        if (result?.code) {
          const patched = result.code.replace(
            'transport.connect(createHMRHandler(handleMessage));',
            '/* HMR disabled: skip WebSocket connect */'
          );
          res.setHeader('Content-Type', 'application/javascript; charset=utf-8');
          res.setHeader('Cache-Control', 'no-cache');
          res.send(patched);
          return;
        }
      } catch {
        // Fallback to Vite's default middleware if transform fails
      }
      next();
    });

    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    const indexPath = path.join(distPath, 'index.html');

    app.use(
      express.static(distPath, {
        setHeaders: (res, filePath) => {
          if (filePath.endsWith('index.html') || filePath.endsWith('sw.js') || filePath.endsWith('manifest.webmanifest')) {
            res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
          } else if (filePath.includes(`${path.sep}assets${path.sep}`)) {
            res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
          }
        },
      })
    );

    // Never return index.html for missing JS/CSS assets or API endpoints (prevents MIME-type white screen)
    app.get('/{*path}', (req, res) => {
      const reqPath = req.path || '';
      if (reqPath.startsWith('/api/') || reqPath.startsWith('/assets/') || /\.[a-z0-9]+$/i.test(reqPath)) {
        res.status(404).end();
        return;
      }
      res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
      res.sendFile(indexPath);
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
