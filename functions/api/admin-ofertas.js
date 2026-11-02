// functions/api/admin-ofertas.js — Cloudflare Pages Function con D1
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
      return Response.json({ error: "No autorizado. Solo el administrador puede gestionar ofertas." }, { status: 401 });
    }

    const body = await request.json().catch(() => ({}));
    const accion = String(body.accion || '').trim();
    const id = String(body.id || '').trim();

    // 1. ACCIÓN: RENOVAR VIGENCIA (+5 DÍAS)
    if (accion === 'renovar' && id) {
      const ahoraIso = new Date().toISOString();
      await env.DB.prepare(`
        UPDATE ofertas
        SET fecha_verificacion = ?, estado = 'publicada'
        WHERE id = ?
      `).bind(ahoraIso, id).run();

      return Response.json({ ok: true, mensaje: "Oferta renovada exitosamente." });
    }

    // 2. ACCIÓN: MARCAR COMO CUBIERTA / CERRADA
    if (accion === 'cubrir' && id) {
      await env.DB.prepare(`
        UPDATE ofertas
        SET estado = 'cubierta'
        WHERE id = ?
      `).bind(id).run();

      return Response.json({ ok: true, mensaje: "Oferta marcada como cubierta y retirada de la vista pública." });
    }

    // 3. ACCIÓN: ACTUALIZAR DATOS ESTRUCTURADOS DE OFERTA
    if (accion === 'editar' && id) {
      await env.DB.prepare(`
        UPDATE ofertas
        SET cargo = ?, ciudad = ?, empresa = ?, experiencia = ?,
            tipo_postulacion = ?, contacto_nombre = ?, contacto_fono = ?,
            contacto_email = ?, publicado_por_fono = ?
        WHERE id = ?
      `).bind(
        String(body.cargo || ''),
        String(body.ciudad || ''),
        String(body.empresa || ''),
        String(body.experiencia || ''),
        String(body.tipo_postulacion || 'interno'),
        String(body.contacto_nombre || ''),
        String(body.contacto_fono || ''),
        String(body.contacto_email || ''),
        String(body.publicado_por_fono || ''),
        id
      ).run();

      return Response.json({ ok: true, mensaje: "Datos de oferta actualizados." });
    }

    // 4. ACCIÓN: BACKFILL / POBLADO INTELIGENTE DE LAS 10 OFERTAS EXISTENTES
    if (accion === 'backfill') {
      const datosOfertas = [
        {
          id: 'of-39480298',
          cargo: 'Encargado de Calidad',
          ciudad: 'Osorno',
          empresa: 'IPICTON',
          experiencia: '2+ años en edificación',
          tipo_postulacion: 'correo',
          contacto_nombre: 'Selección IPICTON',
          contacto_fono: '',
          contacto_email: 'spulgar@ipicton.cl',
          publicado_por_fono: '+56962553313'
        },
        {
          id: 'of-65815082',
          cargo: 'Práctica Profesional (Ing. Construcción)',
          ciudad: 'Futrono (Los Ríos)',
          empresa: 'Proyecto APR',
          experiencia: 'Estudiante / Egresado',
          tipo_postulacion: 'whatsapp_tercero',
          contacto_nombre: 'Álvaro Lagos',
          contacto_fono: '+56973826526',
          contacto_email: '',
          publicado_por_fono: '+56973826526'
        },
        {
          id: 'of-77612680',
          cargo: 'Supervisor de Obra',
          ciudad: 'Pucón',
          empresa: 'Constructora Local',
          experiencia: 'Residente en Pucón o zona',
          tipo_postulacion: 'interno',
          contacto_nombre: 'Guillermo Muñoz',
          contacto_fono: '+56974262273',
          contacto_email: '',
          publicado_por_fono: '+56974262273'
        },
        {
          id: 'of-92123817',
          cargo: 'Profesional en Servicio Público',
          ciudad: 'Valdivia',
          empresa: 'Servicio Público (Reemplazo 6 meses)',
          experiencia: 'Recién titulado o poca experiencia',
          tipo_postulacion: 'interno',
          contacto_nombre: 'Colega del Grupo',
          contacto_fono: '+56974640259',
          contacto_email: '',
          publicado_por_fono: '+56974640259'
        },
        {
          id: 'of-92066730',
          cargo: 'Coordinador BIM - Oficina Técnica',
          ciudad: 'Valdivia',
          empresa: 'Ampliación Aeropuerto Pichoy (Belfisa)',
          experiencia: '2 a 3 años en BIM / Infraestructura',
          tipo_postulacion: 'correo',
          contacto_nombre: 'Viviana Silva',
          contacto_fono: '',
          contacto_email: 'vsilva@belfisa.com',
          publicado_por_fono: '+56978919291'
        },
        {
          id: 'airtable-oferta-005',
          cargo: '2 Supervisores Terminaciones y Obra Gruesa',
          ciudad: 'Nueva Braunau / Llanquihue',
          empresa: 'Strip Center Nueva Braunau',
          experiencia: 'Supervisión en obra gruesa / terminaciones',
          tipo_postulacion: 'interno',
          contacto_nombre: 'Cristián Bustamante',
          contacto_fono: '+56967432160',
          contacto_email: '',
          publicado_por_fono: '+56967432160'
        },
        {
          id: 'airtable-oferta-004',
          cargo: 'Profesional Estructuras y Obras Viales',
          ciudad: 'Collipulli / Temuco',
          empresa: 'Faena Vial Araucanía',
          experiencia: 'Experiencia en estructuras viales',
          tipo_postulacion: 'interno',
          contacto_nombre: 'GDM Colega',
          contacto_fono: '+56985782669',
          contacto_email: '',
          publicado_por_fono: '+56985782669'
        },
        {
          id: 'airtable-oferta-003',
          cargo: 'Jefe de Bodega (iConstruye)',
          ciudad: 'Puerto Varas',
          empresa: 'Constructora Zona Sur',
          experiencia: 'Manejo de iConstruye y bodega obra',
          tipo_postulacion: 'interno',
          contacto_nombre: 'Daniela Serón',
          contacto_fono: '+56992929561',
          contacto_email: '',
          publicado_por_fono: '+56992929561'
        },
        {
          id: 'airtable-oferta-002',
          cargo: 'Asistente de Oficina Técnica',
          ciudad: 'Osorno',
          empresa: 'Constructora Baquedano Sur (Condominio Santa Flora DS-49)',
          experiencia: 'Construcción Civil / Ing. Construcción',
          tipo_postulacion: 'correo',
          contacto_nombre: 'Miguel Cea',
          contacto_fono: '',
          contacto_email: 'miguelcea@cbsur.cl',
          publicado_por_fono: '+56962553313'
        },
        {
          id: 'airtable-oferta-001',
          cargo: 'Profesional Responsable Obras de Salud',
          ciudad: 'Región de Los Lagos / Los Ríos',
          empresa: 'Licitación Infraestructura Sanitaria',
          experiencia: 'Obras de salud pública (CECOSF / Hospital)',
          tipo_postulacion: 'whatsapp_tercero',
          contacto_nombre: 'Claudio',
          contacto_fono: '+56965888532',
          contacto_email: '',
          publicado_por_fono: '+56965888532'
        }
      ];

      for (const d of datosOfertas) {
        try {
          await env.DB.prepare(`
            UPDATE ofertas
            SET cargo = ?, ciudad = ?, empresa = ?, experiencia = ?,
                tipo_postulacion = ?, contacto_nombre = ?, contacto_fono = ?,
                contacto_email = ?, publicado_por_fono = ?
            WHERE id = ?
          `).bind(
            d.cargo, d.ciudad, d.empresa, d.experiencia,
            d.tipo_postulacion, d.contacto_nombre, d.contacto_fono,
            d.contacto_email, d.publicado_por_fono, d.id
          ).run();
        } catch(e) {}
      }

      return Response.json({ ok: true, mensaje: "Backfill completado exitosamente para las 10 ofertas." });
    }

    return Response.json({ error: "Acción no reconocida" }, { status: 400 });
  } catch (error) {
    return Response.json({ error: "Error en admin-ofertas", detail: error.message }, { status: 500 });
  }
}
