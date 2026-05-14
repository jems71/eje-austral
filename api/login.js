// /api/login.js
// Valida la contraseña del grupo y devuelve un token de sesión.

import crypto from 'crypto';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  const APP_PASSWORD = process.env.APP_PASSWORD;
  if (!APP_PASSWORD) {
    return res.status(500).json({ error: 'Falta configurar APP_PASSWORD en Vercel' });
  }

  const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
  const password = (body && body.password ? String(body.password) : '').trim();

  if (!password) {
    return res.status(400).json({ error: 'Falta la contraseña' });
  }

  // Pequeño delay para mitigar fuerza bruta
  await new Promise(r => setTimeout(r, 300 + Math.random() * 200));

  if (password !== APP_PASSWORD) {
    return res.status(401).json({ error: 'Contraseña incorrecta' });
  }

  // Generar token de sesión usando HMAC
  const token = crypto.createHmac('sha256', APP_PASSWORD).update('grupo-uach-session').digest('hex');

  return res.status(200).json({ ok: true, token });
}
