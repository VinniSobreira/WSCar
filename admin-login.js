// api/admin-login.js
// Confere usuário e senha da equipe (Thiago e Murillo) aqui no servidor.
// As senhas ficam só nas variáveis de ambiente da Vercel — nunca no código
// do site, então ninguém consegue vê-las abrindo o "código-fonte" da página.

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ ok: false, error: 'método não permitido' });
  }

  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : (req.body || {});
    const { username, senha } = body;

    const admins = [
      {
        user: process.env.ADMIN1_USER,
        pass: process.env.ADMIN1_PASS,
        nome: process.env.ADMIN1_NAME,
      },
      {
        user: process.env.ADMIN2_USER,
        pass: process.env.ADMIN2_PASS,
        nome: process.env.ADMIN2_NAME,
      },
    ];

    const match = admins.find(
      (a) =>
        a.user &&
        a.pass &&
        a.user.toLowerCase() === String(username || '').toLowerCase() &&
        a.pass === senha
    );

    if (!match) {
      return res.status(200).json({ ok: false });
    }

    return res.status(200).json({ ok: true, nome: match.nome });
  } catch (err) {
    console.error('Erro em /api/admin-login:', err);
    return res.status(500).json({ ok: false, error: 'erro interno' });
  }
}
