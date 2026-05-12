/* global React, ReactDOM */
const { useState, useMemo, useEffect } = React;

const DATA = window.APP_DATA;

// ---------- icons ----------
const Icon = {
  search: (p) => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...p}>
      <circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" />
    </svg>
  ),
  pin: (p) => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...p}>
      <path d="M12 21s7-7.5 7-12a7 7 0 1 0-14 0c0 4.5 7 12 7 12z" /><circle cx="12" cy="9" r="2.5" />
    </svg>
  ),
  phone: (p) => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...p}>
      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
    </svg>
  ),
  mail: (p) => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...p}>
      <rect x="2" y="4" width="20" height="16" rx="2" /><path d="m2 7 10 6 10-6" />
    </svg>
  ),
  user: (p) => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...p}>
      <circle cx="12" cy="8" r="4" /><path d="M4 21a8 8 0 0 1 16 0" />
    </svg>
  ),
  wa: (p) => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" {...p}>
      <path d="M17.5 14.4c-.3-.2-1.7-.9-2-1s-.5-.2-.7.2-.8 1-1 1.2-.4.2-.7 0a8 8 0 0 1-2.4-1.5 9 9 0 0 1-1.7-2.1c-.2-.3 0-.5.1-.6l.5-.6a2 2 0 0 0 .3-.5.5.5 0 0 0 0-.5l-1-2.3c-.2-.6-.5-.5-.7-.5h-.6a1.2 1.2 0 0 0-.8.4 3.4 3.4 0 0 0-1.1 2.6c0 1.5 1.1 3 1.3 3.2a12.4 12.4 0 0 0 4.7 4.1 14.7 14.7 0 0 0 1.6.6 3.7 3.7 0 0 0 1.7.1 2.8 2.8 0 0 0 1.8-1.3 2.3 2.3 0 0 0 .2-1.3l-.5-.2zM12 2a10 10 0 0 0-8.5 15.2L2 22l4.9-1.4a10 10 0 1 0 5-18.6zm5.9 14.4a8.3 8.3 0 0 1-12.6 1.1L5 17l-2.9.8.8-2.8-.2-.3a8.3 8.3 0 1 1 14.2 1.7z" />
    </svg>
  ),
  plus: (p) => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" {...p}>
      <path d="M12 5v14M5 12h14" />
    </svg>
  ),
  lock: (p) => (
    <svg className="lock" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...p}>
      <rect x="4" y="11" width="16" height="10" rx="2" /><path d="M8 11V7a4 4 0 0 1 8 0v4" />
    </svg>
  ),
  star: (p) => (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor" {...p}>
      <path d="m12 2 3.1 6.3 6.9 1-5 4.9 1.2 6.8L12 17.8 5.8 21l1.2-6.8-5-4.9 6.9-1z" />
    </svg>
  ),
  copy: (p) => (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...p}>
      <rect x="9" y="9" width="11" height="11" rx="2" /><path d="M5 15V5a2 2 0 0 1 2-2h10" />
    </svg>
  ),
};

// ---------- Restricted gate ----------
function Gate() {
  return (
    <div className="gate">
      <Icon.lock />
      <span><b>Acceso restringido</b></span>
      <span className="sep">·</span>
      <span>Solo titulados de Construcción Civil e Ingeniería en Construcción · UACh</span>
      <span className="gate-pill">Grupo WhatsApp · 28 miembros</span>
    </div>
  );
}

// ---------- Stars ----------
function Stars({ rating, max = 5 }) {
  const full = Math.round(rating);
  return (
    <span className="stars" aria-label={`${rating} de ${max}`}>
      <Icon.star /> {rating.toFixed(1)}
    </span>
  );
}

// ---------- Hero ----------
function Hero({ contactos, solicitudes }) {
  const subs = contactos.filter(c => c.tipo === "Subcontrato").length;
  const mo = contactos.filter(c => c.tipo === "Mano de obra").length;
  const open = solicitudes.filter(s => s.estado === "abierta").length;
  return (
    <section className="heroband">
      <div>
        <span className="doc-id">DIR-UACH/CC · v1.4 · 2026</span>
        <h2>Lo que el grupo va recopilando, <em>en un solo lugar</em>.</h2>
        <p>
          Subcontratos, maestros y cuadrillas que los titulados hemos contratado en Los Ríos y Los Lagos.
          Cada contacto trae nombre, fono, ubicación y quién del grupo lo puso. Si te sirve, úsalo.
          Si trabajaste con alguien bueno, súbelo.
        </p>
      </div>
      <div className="stats">
        <div className="stat"><span className="n">{contactos.length}</span><span className="l">Contactos</span></div>
        <div className="stat"><span className="n">{subs}</span><span className="l">Subcontratos</span></div>
        <div className="stat"><span className="n">{mo}</span><span className="l">Mano de obra</span></div>
        <div className="stat"><span className="n">{open}</span><span className="l">Solicitudes abiertas</span></div>
      </div>
    </section>
  );
}

// ---------- Card ----------
function Card({ c, alerta, onOpen }) {
  const tag = c.tipo === "Subcontrato" ? "sub" : "mo";
  const initials = (c.recomendadoPor || "").split(" ").map(p => p[0]).slice(0, 2).join("");
  const waLink = `https://wa.me/${(c.whatsapp || "").replace(/\+/g, "")}`;
  const stop = (e) => e.stopPropagation();
  return (
    <article className={`card clickable ${alerta ? "has-alert" : ""}`} onClick={() => onOpen(c)} tabIndex={0}
             onKeyDown={(e) => { if (e.key === "Enter") onOpen(c); }}>
      {alerta && (
        <div className="alert-strip" title={alerta.motivo}>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" aria-hidden="true">
            <path d="M12 9v4M12 17h.01" />
            <path d="M10.3 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
          </svg>
          <span><b>Alerta del grupo</b> · {alerta.motivo}</span>
        </div>
      )}
      <div className="row1">
        <div>
          <span className="id">{c.id.toUpperCase()}</span>
          <div className="name">{c.nombre}</div>
          <div className="rubro">{c.rubro}</div>
        </div>
        <span className={`tag ${tag}`}>{c.tipo}</span>
      </div>

      <div className="meta">
        <div className="meta-row"><span className="k">Contacto</span><span className="v">{c.contacto}</span></div>
        <div className="meta-row"><span className="k">Fono</span><span className="v">{c.fono}</span></div>
        {c.email && <div className="meta-row"><span className="k">Email</span><span className="v">{c.email}</span></div>}
        <div className="meta-row"><span className="k">Zona</span><span className="v">{c.ciudad}, {c.region}</span></div>
        <div className="meta-row"><span className="k">Último</span><span className="v">{c.ultimoProyecto}</span></div>
      </div>

      <div className="foot">
        <Stars rating={c.rating} />
        <span className="reco" title={`Recomendado por ${c.recomendadoPor}`}>
          <span className="dot">{initials}</span>{c.recomendadoPor}
        </span>
      </div>

      <div className="actions" onClick={stop}>
        <a className="iconbtn wa" href={waLink} target="_blank" rel="noreferrer" title="WhatsApp" onClick={stop}><Icon.wa /></a>
        <a className="iconbtn" href={`tel:${c.fono}`} title="Llamar" onClick={stop}><Icon.phone /></a>
        {c.email && <a className="iconbtn" href={`mailto:${c.email}`} title="Email" onClick={stop}><Icon.mail /></a>}
        <button className="iconbtn" title="Copiar fono"
          onClick={(e) => { stop(e); navigator.clipboard?.writeText(c.fono); }}><Icon.copy /></button>
      </div>
    </article>
  );
}

// ---------- Directorio view ----------
const ESPECIALIDADES = [
  "Todas",
  "Enfierradura",
  "Moldajes",
  "Hormigón / Hormigón armado",
  "Movimiento de tierra",
  "Instalaciones eléctricas TE1",
  "Instalaciones sanitarias",
  "Carpintería de obra gruesa",
  "Carpintería de terminaciones",
  "Albañilería",
  "Estuco y revestimientos",
  "Cubiertas y hojalatería",
  "Pintura",
  "Cerámica y pisos",
  "Tabiquería / Volcanita",
  "Climatización",
  "Otra",
];

// Map cada contacto a una especialidad canónica según su rubro
function matchEspecialidad(rubro, esp) {
  if (esp === "Todas") return true;
  const r = (rubro || "").toLowerCase();
  const map = {
    "Enfierradura": ["enfierr"],
    "Moldajes": ["moldaj"],
    "Hormigón / Hormigón armado": ["hormig"],
    "Movimiento de tierra": ["movimiento de tierra", "tierras", "excavac"],
    "Instalaciones eléctricas TE1": ["eléctric", "electric"],
    "Instalaciones sanitarias": ["sanitari"],
    "Carpintería de obra gruesa": ["carpinter", "obra gruesa"],
    "Carpintería de terminaciones": ["terminacion"],
    "Albañilería": ["albañiler"],
    "Estuco y revestimientos": ["estuco", "revestim"],
    "Cubiertas y hojalatería": ["cubiert", "hojalat", "techo"],
    "Pintura": ["pintur"],
    "Cerámica y pisos": ["cerámic", "ceramic", "piso", "porcelan"],
    "Tabiquería / Volcanita": ["tabiquer", "volcanit"],
    "Climatización": ["climat", "calefac", "ventilac"],
    "Estructura metálica": ["estructura met", "metálic", "soldad"],
  };
  // "Otra" = nada de lo anterior calza
  if (esp === "Otra") {
    return !Object.values(map).some(arr => arr.some(k => r.includes(k)));
  }
  const keys = map[esp] || [];
  return keys.some(k => r.includes(k));
}

function DirectorioView({ contactos, onAdd, alertasByContacto, onOpenDetalle }) {
  const [q, setQ] = useState("");
  const [tipo, setTipo] = useState("Todos");
  const [region, setRegion] = useState("Todas");
  const [esp, setEsp] = useState("Todas");

  const filtered = useMemo(() => {
    return contactos.filter(c => {
      if (tipo !== "Todos" && c.tipo !== tipo) return false;
      if (region !== "Todas" && c.region !== region) return false;
      if (!matchEspecialidad(c.rubro, esp)) return false;
      if (q) {
        const s = (c.nombre + " " + c.rubro + " " + c.ciudad + " " + c.contacto + " " + c.recomendadoPor).toLowerCase();
        if (!s.includes(q.toLowerCase())) return false;
      }
      return true;
    });
  }, [contactos, q, tipo, region, esp]);

  return (
    <div className="panel">
      <div className="filterbar">
        <div className="search">
          <Icon.search />
          <input placeholder="Buscar por rubro, nombre, ciudad o quién lo recomendó…"
                 value={q} onChange={e => setQ(e.target.value)} />
        </div>
        <div className="chips">
          {["Todos", "Subcontrato", "Mano de obra"].map(t => (
            <button key={t} className={`chip ${tipo === t ? "on" : ""}`} onClick={() => setTipo(t)}>{t}</button>
          ))}
        </div>
        <div className="chips">
          {["Todas", "Los Ríos", "Los Lagos"].map(r => (
            <button key={r} className={`chip ${region === r ? "on" : ""}`} onClick={() => setRegion(r)}>{r}</button>
          ))}
        </div>
        <div className="esp-select">
          <select value={esp} onChange={e => setEsp(e.target.value)} aria-label="Especialidad">
            {ESPECIALIDADES.map(o => (
              <option key={o} value={o}>{o === "Todas" ? "Especialidad: todas" : o}</option>
            ))}
          </select>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
            <path d="m6 9 6 6 6-6" />
          </svg>
        </div>
        <button className="btn" onClick={onAdd}><Icon.plus /> Agregar contacto</button>
      </div>

      {filtered.length === 0 ? (
        <div className="empty">Nada calza con esos filtros. Probá afinar la búsqueda.</div>
      ) : (
        <div className="grid">
          {filtered.map(c => <Card key={c.id} c={c} alerta={alertasByContacto[c.id]} onOpen={onOpenDetalle} />)}
        </div>
      )}
    </div>
  );
}

// ---------- Solicitudes view ----------
function SolicitudesView({ solicitudes }) {
  return (
    <div className="panel">
      <div className="twocol">
        <div>
          {solicitudes.map(s => (
            <div key={s.id} className={`solicitud ${s.estado}`}>
              <div className="hd">
                <div className="av">{s.iniciales}</div>
                <div style={{ flex: 1 }}>
                  <div className="who">{s.autor}</div>
                  <div className="when">{s.tiempo} · {s.region}</div>
                </div>
                <span className={`estado-pill ${s.estado}`}>{s.estado}</span>
              </div>
              <p>{s.texto}</p>
              <div className="ft">
                <span>{s.respuestas} respuestas</span>
                <span>·</span>
                <span>#{s.etiqueta.toLowerCase().replace(/ /g, "-")}</span>
              </div>
            </div>
          ))}
        </div>
        <aside>
          <div className="side-card">
            <h3>Cómo funciona esto</h3>
            <p style={{ fontSize: 12.5, lineHeight: 1.55, color: "inherit", margin: 0, opacity: 0.8 }}>
              Cuando alguien del grupo necesita un contacto que no tiene a mano, abre una solicitud aquí.
              Los demás responden, y si el dato sirve, queda agregado al directorio para todos.
            </p>
          </div>
          <div style={{ height: 12 }} />
          <div className="side-card">
            <h3>Etiquetas activas</h3>
            <div className="chips" style={{ flexWrap: "wrap" }}>
              {["Subcontrato", "Mano de obra", "Servicio", "Aviso"].map(t => (
                <button key={t} className="chip">#{t.toLowerCase().replace(/ /g, "-")}</button>
              ))}
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}

// ---------- Historial view ----------
function HistorialView({ historial }) {
  return (
    <div className="panel">
      <div className="timeline">
        {historial.map((h, i) => {
          const ini = h.quien.split(" ").map(p => p[0]).slice(0, 2).join("");
          return (
            <div className="row" key={i}>
              <span className="fecha">{h.fecha}</span>
              <span className="av">{ini}</span>
              <span className="body">
                <b>{h.quien}</b> <i>{h.accion}</i> — {h.detalle}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ---------- Alertas view ----------
function AlertasView({ alertas }) {
  const [sev, setSev] = useState("Todas");
  const filtered = sev === "Todas" ? alertas : alertas.filter(a => a.severidad === sev.toLowerCase());
  const counts = {
    alta: alertas.filter(a => a.severidad === "alta").length,
    media: alertas.filter(a => a.severidad === "media").length,
    baja: alertas.filter(a => a.severidad === "baja").length,
  };
  return (
    <div className="panel">
      <div className="alertas-intro">
        <div className="alertas-intro-icon" aria-hidden="true">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 9v4M12 17h.01" />
            <path d="M10.3 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
          </svg>
        </div>
        <div>
          <h3>Alertas del grupo</h3>
          <p>
            Proveedores o subcontratos con los que algún titulado tuvo problemas serios en una obra reciente.
            La idea es simple: que ningún colega caiga en la misma piedra. <b>Todo registro lleva nombre de quien lo reporta.</b>
          </p>
        </div>
      </div>

      <div className="filterbar">
        <div className="chips">
          {["Todas", "Alta", "Media", "Baja"].map(s => (
            <button key={s} className={`chip ${sev === s ? "on" : ""}`} onClick={() => setSev(s)}>
              {s}{s !== "Todas" && ` · ${counts[s.toLowerCase()]}`}
            </button>
          ))}
        </div>
      </div>

      <div className="alertas-list">
        {filtered.map(a => (
          <article key={a.id} className={`alert-card sev-${a.severidad}`}>
            <div className="alert-card-hd">
              <span className={`sev-pill sev-${a.severidad}`}>
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" aria-hidden="true">
                  <path d="M12 9v4M12 17h.01" />
                  <path d="M10.3 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                </svg>
                Severidad {a.severidad}
              </span>
              <span className="alert-when">{a.fecha} · {a.ciudad}, {a.region}</span>
            </div>
            <div className="alert-card-body">
              <div className="alert-name">{a.proveedor}</div>
              <div className="alert-rubro">{a.rubro}</div>
              <div className="alert-motivo">{a.motivo}</div>
              <p className="alert-detalle">{a.detalle}</p>
            </div>
            <div className="alert-card-ft">
              <span className="alert-reportado">
                <span className="av">{a.iniciales}</span>
                Reportado por <b>{a.reportadoPor}</b>
              </span>
              <span className="alert-obra">Obra: {a.obra}</span>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}

// ---------- Calificaciones view ----------
function CalificacionesView({ contactos }) {
  const sorted = [...contactos].sort((a, b) => b.rating - a.rating);
  return (
    <div className="panel">
      <div className="rank-list">
        {sorted.map((c, i) => (
          <div className="rank-row" key={c.id}>
            <span className="num">{(i + 1).toString().padStart(2, "0")}</span>
            <div>
              <div className="name">{c.nombre}</div>
              <div className="rubro">{c.rubro} · {c.ciudad}</div>
            </div>
            <div className="bar"><div style={{ width: `${(c.rating / 5) * 100}%` }} /></div>
            <span className="score">{c.rating.toFixed(1)}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ---------- Add contact modal ----------
function AddModal({ open, onClose, onSave }) {
  const [form, setForm] = useState({
    tipo: "Subcontrato", rubro: "", nombre: "", contacto: "",
    fono: "", email: "", region: "Los Ríos", ciudad: "", notas: "",
  });
  const [saved, setSaved] = useState(false);
  if (!open) return null;
  const update = (k, v) => setForm(f => ({ ...f, [k]: v }));
  const submit = (e) => {
    e.preventDefault();
    onSave(form);
    setSaved(true);
    setTimeout(() => { setSaved(false); onClose(); }, 1100);
  };
  return (
    <div className="modal-overlay" onClick={onClose}>
      <form className="modal" onClick={e => e.stopPropagation()} onSubmit={submit}>
        <div className="hd">
          <div>
            <h3>Agregar contacto</h3>
            <p>Aporta uno bueno al directorio del grupo.</p>
          </div>
          <button className="x" type="button" onClick={onClose}>×</button>
        </div>
        <div className="body">
          {saved && <div className="saved-msg">✓ Contacto guardado y compartido al grupo.</div>}
          <div className="row2">
            <label>Tipo
              <select value={form.tipo} onChange={e => update("tipo", e.target.value)}>
                <option>Subcontrato</option><option>Mano de obra</option>
              </select>
            </label>
            <label>Rubro / especialidad
              <input required value={form.rubro} onChange={e => update("rubro", e.target.value)}
                     placeholder="Ej: Hormigón armado" />
            </label>
          </div>
          <label>Nombre / razón social
            <input required value={form.nombre} onChange={e => update("nombre", e.target.value)}
                   placeholder="Ej: Hormigones del Sur SpA" />
          </label>
          <label>Persona de contacto
            <input value={form.contacto} onChange={e => update("contacto", e.target.value)}
                   placeholder="Ej: Don Patricio Vidal" />
          </label>
          <div className="row2">
            <label>Teléfono / WhatsApp
              <input required value={form.fono} onChange={e => update("fono", e.target.value)}
                     placeholder="+56 9 ..." />
            </label>
            <label>Email
              <input type="email" value={form.email} onChange={e => update("email", e.target.value)}
                     placeholder="opcional" />
            </label>
          </div>
          <div className="row2">
            <label>Región
              <select value={form.region} onChange={e => update("region", e.target.value)}>
                <option>Los Ríos</option><option>Los Lagos</option>
              </select>
            </label>
            <label>Ciudad / comuna
              <input required value={form.ciudad} onChange={e => update("ciudad", e.target.value)}
                     placeholder="Ej: Valdivia" />
            </label>
          </div>
          <label>Notas (opcional)
            <textarea value={form.notas} onChange={e => update("notas", e.target.value)}
                      placeholder="Disponibilidad, condiciones de pago, observaciones de obra…" />
          </label>
          <div className="ft">
            <button className="btn btn-ghost" type="button" onClick={onClose}>Cancelar</button>
            <button className="btn" type="submit"><Icon.plus /> Guardar contacto</button>
          </div>
        </div>
      </form>
    </div>
  );
}

// ---------- App ----------
const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "estilo": "institucional",
  "densidad": "comoda"
}/*EDITMODE-END*/;

function App() {
  const [t, setTweak] = useTweaks(TWEAK_DEFAULTS);
  const [tab, setTab] = useState("directorio");
  const [modal, setModal] = useState(false);
  const [detalle, setDetalle] = useState(null);
  const [contactos, setContactos] = useState(DATA.contactos);
  const [historial, setHistorial] = useState(DATA.historial);

  const alertasByContacto = useMemo(() => {
    const map = {};
    DATA.alertas.forEach(a => { if (a.contactoId) map[a.contactoId] = a; });
    return map;
  }, []);

  const tabs = [
    { id: "directorio", label: "Directorio", n: contactos.length },
    { id: "solicitudes", label: "Solicitudes", n: DATA.solicitudes.filter(s => s.estado === "abierta").length },
    { id: "alertas", label: "Alertas", n: DATA.alertas.length, danger: true },
    { id: "historial", label: "Historial", n: historial.length },
    { id: "calificaciones", label: "Calificaciones", n: contactos.length },
  ];

  const titles = {
    institucional: "Universidad Austral de Chile",
    minimal: "Titulados Construcción · UACh",
    obra: "DIR / TIT-CC-UACH",
  };
  const subs = {
    institucional: "Titulados Construcción Civil · Ingeniería en Construcción",
    minimal: "Construcción Civil · Ingeniería en Construcción",
    obra: "REGISTRO INTERNO · v1.4",
  };

  const onSave = (form) => {
    const id = `c-${(contactos.length + 1).toString().padStart(3, "0")}`;
    const newC = {
      id, ...form,
      whatsapp: form.fono.replace(/\s|\+/g, ""),
      recomendadoPor: "Tú (este aporte)",
      anioRecomendacion: 2026,
      rating: 0, reviews: 0,
      ultimoProyecto: "—",
    };
    setContactos([newC, ...contactos]);
    setHistorial([
      { fecha: "07 May 2026", quien: "Tú", accion: "agregaste contacto", detalle: `${form.nombre} — ${form.rubro}` },
      ...historial,
    ]);
  };

  return (
    <div data-style={t.estilo}>
      <Gate />
      <div className="app-shell">
        <header className="topbar">
          <div className="brand">
            <div className="crest">
              {t.estilo === "obra" ? "UACH" : "U"}
            </div>
            <div>
              <h1>{titles[t.estilo]}</h1>
              <div className="sub">{subs[t.estilo]}</div>
            </div>
          </div>
          <div className="me">
            <span>Conectado como Tú</span>
            <span className="av">TU</span>
          </div>
        </header>

        <Hero contactos={contactos} solicitudes={DATA.solicitudes} />

        <nav className="tabs" role="tablist">
          {tabs.map(x => (
            <button key={x.id} role="tab" aria-selected={tab === x.id}
                    className={`tab ${tab === x.id ? "active" : ""} ${x.danger ? "danger" : ""}`}
                    onClick={() => setTab(x.id)}>
              {x.label}<span className="badge">{x.n}</span>
            </button>
          ))}
        </nav>

        {tab === "directorio" && <DirectorioView contactos={contactos} onAdd={() => setModal(true)} alertasByContacto={alertasByContacto} onOpenDetalle={setDetalle} />}
        {tab === "solicitudes" && <SolicitudesView solicitudes={DATA.solicitudes} />}
        {tab === "alertas" && <AlertasView alertas={DATA.alertas} />}
        {tab === "historial" && <HistorialView historial={historial} />}
        {tab === "calificaciones" && <CalificacionesView contactos={contactos} />}

        <div className="footnote">
          Datos compartidos entre titulados · No publicar fuera del grupo · Última actualización 07 May 2026
        </div>
      </div>

      <AddModal open={modal} onClose={() => setModal(false)} onSave={onSave} />
      <DetalleDrawer contacto={detalle} alerta={detalle ? alertasByContacto[detalle.id] : null} onClose={() => setDetalle(null)} />

      <TweaksPanel>
        <TweakSection label="Estilo visual" />
        <TweakRadio
          label="Tema"
          value={t.estilo}
          options={["institucional", "minimal", "obra"]}
          onChange={v => setTweak("estilo", v)}
        />
        <p style={{ fontSize: 11, color: "rgba(41,38,27,.6)", margin: "4px 0 8px", lineHeight: 1.45 }}>
          {t.estilo === "institucional" && "Azul UACh dominante, serif, formal."}
          {t.estilo === "minimal" && "Crema, mucho aire, azul como acento puro."}
          {t.estilo === "obra" && "Concreto/grafito, mono, sensación industrial."}
        </p>
      </TweaksPanel>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<App />);
