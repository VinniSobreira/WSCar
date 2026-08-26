// api/storage.js
// Ponte entre o site (front-end) e o banco de dados no Upstash.
// O front-end chama /api/storage exatamente como chamava o "window.storage"
// do ambiente Claude — só que agora quem responde é essa função, e quem guarda
// os dados de verdade é o Redis do Upstash.

import { Redis } from '@upstash/redis';

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL,
  token: process.env.UPSTASH_REDIS_REST_TOKEN,
  // Desliga a (de)serialização automática do cliente: o app já manda tudo
  // como texto (JSON.stringify) e espera receber texto de volta. Sem isso,
  // o cliente do Upstash tentaria "adivinhar" e converteria o JSON em objeto
  // sozinho, o que quebraria o JSON.parse que o front-end faz depois.
  automaticDeserialization: false,
});

// Guardamos, à parte, o nome de toda chave já usada — é assim que conseguimos
// responder "me dê todas as chaves que começam com client:" (o Redis puro não
// tem essa busca por prefixo pronta).
const INDEX_KEY = 'ws:allkeys';

export default async function handler(req, res) {
  try {
    if (req.method === 'GET') {
      const { op, key, prefix } = req.query;

      if (op === 'get') {
        if (!key) return res.status(400).json({ error: 'faltou o parâmetro key' });
        const value = await redis.get(key);
        return res.status(200).json({ value: value === undefined ? null : value });
      }

      if (op === 'list') {
        const keys = (await redis.smembers(INDEX_KEY)) || [];
        const p = prefix || '';
        const filtered = keys.filter((k) => typeof k === 'string' && k.startsWith(p));
        return res.status(200).json({ keys: filtered });
      }

      return res.status(400).json({ error: 'operação inválida' });
    }

    if (req.method === 'POST') {
      const body = typeof req.body === 'string' ? JSON.parse(req.body) : (req.body || {});
      const { op, key, value } = body;
      if (!key) return res.status(400).json({ error: 'faltou o parâmetro key' });

      if (op === 'set') {
        await redis.set(key, value);
        await redis.sadd(INDEX_KEY, key);
        return res.status(200).json({ ok: true });
      }

      if (op === 'delete') {
        await redis.del(key);
        await redis.srem(INDEX_KEY, key);
        return res.status(200).json({ ok: true });
      }

      return res.status(400).json({ error: 'operação inválida' });
    }

    res.setHeader('Allow', 'GET, POST');
    return res.status(405).json({ error: 'método não permitido' });
  } catch (err) {
    console.error('Erro em /api/storage:', err);
    return res.status(500).json({ error: 'erro interno', detail: String(err) });
  }
}
