"use client";

import { useState } from "react";
import { FormConfig } from "@/lib/types";

const FONTS = [
  { value: "Georgia, 'Times New Roman', serif", label: "Serif clásica (Georgia)" },
  { value: "'Segoe UI', Arial, sans-serif", label: "Sans moderna (Segoe UI)" },
  { value: "'Helvetica Neue', Helvetica, Arial, sans-serif", label: "Helvetica" },
  { value: "'Courier New', monospace", label: "Monoespaciada" },
];

export default function DesignClient({ initialConfig }: { initialConfig: FormConfig }) {
  const [config, setConfig] = useState(initialConfig);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState("");

  const setDesign = (patch: Partial<FormConfig["design"]>) =>
    setConfig((c) => ({ ...c, design: { ...c.design, ...patch } }));
  const setContact = (patch: Partial<FormConfig["contact"]>) =>
    setConfig((c) => ({ ...c, contact: { ...c.contact, ...patch } }));
  const setMeta = (patch: Partial<FormConfig["meta"]>) =>
    setConfig((c) => ({ ...c, meta: { ...c.meta, ...patch } }));

  const uploadLogo = async (file: File) => {
    setUploading(true);
    try {
      const fd = new FormData();
      fd.set("logo", file);
      const res = await fetch("/api/admin/upload-logo", { method: "POST", body: fd });
      const json = await res.json();
      if (res.ok) setDesign({ logoUrl: json.url });
    } finally {
      setUploading(false);
    }
  };

  const save = async () => {
    setSaving(true);
    setMessage("");
    try {
      const res = await fetch("/api/admin/config", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(config),
      });
      const json = await res.json();
      if (res.ok) {
        setConfig(json);
        setMessage("Cambios guardados.");
      } else {
        setMessage("No se pudo guardar.");
      }
    } finally {
      setSaving(false);
      setTimeout(() => setMessage(""), 4000);
    }
  };

  return (
    <div>
      <div className="adm-card">
        <h3>Marca</h3>
        <div className="adm-field">
          <label>Título del formulario</label>
          <input
            className="adm-input"
            value={config.meta.title}
            onChange={(e) => setMeta({ title: e.target.value })}
          />
        </div>
        <div className="adm-field">
          <label>Título en la pestaña del navegador</label>
          <input
            className="adm-input"
            value={config.meta.browserTitle}
            onChange={(e) => setMeta({ browserTitle: e.target.value })}
          />
        </div>
        <div className="adm-field">
          <label>Logo</label>
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            {config.design.logoUrl && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={config.design.logoUrl} alt="Logo" style={{ height: 48 }} />
            )}
            <input
              type="file"
              accept="image/*"
              onChange={(e) => e.target.files?.[0] && uploadLogo(e.target.files[0])}
              disabled={uploading}
            />
          </div>
        </div>
      </div>

      <div className="adm-card">
        <h3>Colores y tipografía</h3>
        <div className="adm-inline-fields">
          <ColorField label="Color principal" value={config.design.primaryColor} onChange={(v) => setDesign({ primaryColor: v })} />
          <ColorField label="Color de acento" value={config.design.accentColor} onChange={(v) => setDesign({ accentColor: v })} />
          <ColorField label="Fondo de página" value={config.design.backgroundColor} onChange={(v) => setDesign({ backgroundColor: v })} />
          <ColorField label="Color de texto" value={config.design.textColor} onChange={(v) => setDesign({ textColor: v })} />
        </div>
        <div className="adm-field" style={{ marginTop: 10 }}>
          <label>Tipografía</label>
          <select
            className="adm-select"
            value={config.design.fontFamily}
            onChange={(e) => setDesign({ fontFamily: e.target.value })}
          >
            {FONTS.map((f) => (
              <option key={f.value} value={f.value}>
                {f.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="adm-card">
        <h3>Pie de página / contacto</h3>
        <div className="adm-inline-fields">
          <div className="adm-field">
            <label>Teléfono</label>
            <input className="adm-input" value={config.contact.phone} onChange={(e) => setContact({ phone: e.target.value })} />
          </div>
          <div className="adm-field">
            <label>Sitio web</label>
            <input className="adm-input" value={config.contact.website} onChange={(e) => setContact({ website: e.target.value })} />
          </div>
          <div className="adm-field">
            <label>Correo</label>
            <input className="adm-input" value={config.contact.email} onChange={(e) => setContact({ email: e.target.value })} />
          </div>
        </div>
      </div>

      <div className="adm-save-bar">
        {message && <span style={{ alignSelf: "center", fontSize: 13, color: "#2e5c33" }}>{message}</span>}
        <button className="cf-btn cf-btn-primary" onClick={save} disabled={saving}>
          {saving ? "Guardando..." : "Guardar cambios"}
        </button>
      </div>
    </div>
  );
}

function ColorField({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div className="adm-field">
      <label>{label}</label>
      <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
        <input type="color" className="adm-swatch" value={value} onChange={(e) => onChange(e.target.value)} />
        <input className="adm-input" value={value} onChange={(e) => onChange(e.target.value)} />
      </div>
    </div>
  );
}
