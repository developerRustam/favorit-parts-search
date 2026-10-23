import 'dotenv/config';
import express from 'express';
import { rateLimit } from 'express-rate-limit';
import { existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const app = express();
const port = process.env.PORT || 3001;
const distPath = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../dist');
const apiEndpoint = process.env.FAVORIT_API_URL?.trim() || 'http://api.favorit-parts.ru/hs/hsprice/';
const partsRateLimit = rateLimit({
  windowMs: 60_000,
  limit: 60,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: { error: 'Слишком много запросов. Попробуйте через минуту.' },
});

app.disable('x-powered-by');
app.use('/api/parts', partsRateLimit);

app.get('/api/parts', async (req, res) => {
  const number = typeof req.query.number === 'string' ? req.query.number.trim() : '';
  const brand = typeof req.query.brand === 'string' ? req.query.brand.trim() : '';
  const key = process.env.FAVORIT_API_KEY?.trim();

  if (!number || number.length > 100 || brand.length > 100) {
    return res.status(400).json({ error: 'Укажите корректный артикул детали.' });
  }

  if (!key) {
    return res.status(503).json({ error: 'Не задан ключ API. Добавьте FAVORIT_API_KEY в файл .env.' });
  }

  const url = new URL(apiEndpoint);
  url.searchParams.set('key', key);
  url.searchParams.set('number', number);
  url.searchParams.set('info', 'on');

  if (brand) {
    url.searchParams.set('brand', brand);
    url.searchParams.set('analogues', 'on');
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 12000);

  try {
    const response = await fetch(url, {
      signal: controller.signal,
      headers: { Accept: 'application/json' },
    });
    const body = await response.text();
    let data;

    try {
      data = JSON.parse(body);
    } catch {
      return res.status(502).json({ error: 'Сервис запчастей вернул некорректный ответ.' });
    }

    if (!response.ok) {
      return res.status(502).json({ error: 'Сервис запчастей временно недоступен.' });
    }

    if (data?.error) {
      const message = Array.isArray(data.error) ? data.error.join('; ') : String(data.error);
      return res.status(400).json({ error: message });
    }

    if (!Array.isArray(data?.goods)) {
      return res.status(502).json({ error: 'Неизвестный формат ответа сервиса.' });
    }

    return res.json({ goods: data.goods });
  } catch (error) {
    if (error.name === 'AbortError') {
      return res.status(504).json({ error: 'Сервис не ответил вовремя. Попробуйте ещё раз.' });
    }

    return res.status(502).json({ error: 'Не удалось подключиться к сервису запчастей.' });
  } finally {
    clearTimeout(timeout);
  }
});

if (existsSync(path.join(distPath, 'index.html'))) {
  app.use(express.static(distPath));
  app.get('*', (req, res) => res.sendFile(path.join(distPath, 'index.html')));
}

app.listen(port, () => {
  process.stdout.write(`Сервер: http://localhost:${port}\n`);
});
