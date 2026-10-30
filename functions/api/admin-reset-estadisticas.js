// functions/api/admin-reset-estadisticas.js — Cloudflare Pages Function con D1
async function crearAdminToken(password) {
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(password),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const firma = await crypto.subtle.sign(
    "HMAC",
    key,
    encoder.encode("grupo-uach-admin-session")
  );
  return Array.from(new Uint8Array(firma))
    .map(b => b.toString(16).padStart(2, "0"))
    .join("");
}

export async function onRequestPost({ request, env }) {
  try {
    if (!env.DB) {
      return Response.json({ error: "Base de datos D1 no vinculada" }, { status: 500 });
    }

    const adminPassword = env.ADMIN_PASSWORD || "jems2026";
    const auth = request.headers.get("Authorization") || "";
    const tokenEsperado = await crearAdminToken(adminPassword);

    if (auth !== `Bearer ${tokenEsperado}`) {
      return Response.json({ error: "No autorizado. Solo el administrador puede reiniciar estadísticas." }, { status: 401 });
    }

    const body = await request.json().catch(() => ({}));
    const tipo = body.tipo || 'visitas'; // 'visitas' | 'todo'

    if (tipo === 'visitas' || tipo === 'todo') {
      await env.DB.prepare("DELETE FROM registro_visitas;").run();
    }

    if (tipo === 'todo') {
      await env.DB.prepare("DELETE FROM registro_clics_contacto;").run();
      await env.DB.prepare("UPDATE contactos SET total_clics = 0;").run();
    }

    return Response.json({
      ok: true,
      tipo,
      mensaje: tipo === 'todo'
        ? "Todas las métricas (visitas y clics) se reiniciaron a cero."
        : "El contador de visitas se reinició a cero exitosamente."
    }, { status: 200 });

  } catch (error) {
    return Response.json({ error: "Error reiniciando estadísticas", detail: error.message }, { status: 500 });
  }
}
