"use client";

import { useState } from "react";
import { FormConfig } from "@/lib/types";

export default function SettingsClient({
  initialConfig,
  notifyConfigured,
}: {
  initialConfig: FormConfig;
  notifyConfigured: boolean;
}) {
  const [config, setConfig] = useState(initialConfig);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  const setSettings = (patch: Partial<FormConfig["settings"]>) =>
    setConfig((c) => ({ ...c, settings: { ...c.settings, ...patch } }));

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
        <h3>Textos del formulario</h3>
        <div className="adm-inline-fields">
          <div className="adm-field">
            <label>Texto del botón enviar</label>
            <input
              className="adm-input"
              value={config.settings.submitButtonText}
              onChange={(e) => setSettings({ submitButtonText: e.target.value })}
            />
          </div>
          <div className="adm-field">
            <label>Texto del botón guardar borrador</label>
            <input
              className="adm-input"
              value={config.settings.saveDraftButtonText}
              onChange={(e) => setSettings({ saveDraftButtonText: e.target.value })}
            />
          </div>
        </div>
        <div className="adm-field">
          <label>Título de agradecimiento</label>
          <input
            className="adm-input"
            value={config.settings.thankYouTitle}
            onChange={(e) => setSettings({ thankYouTitle: e.target.value })}
          />
        </div>
        <div className="adm-field">
          <label>Mensaje de agradecimiento</label>
          <textarea
            className="adm-textarea"
            rows={3}
            value={config.settings.thankYouMessage}
            onChange={(e) => setSettings({ thankYouMessage: e.target.value })}
          />
        </div>
      </div>

      <div className="adm-card">
        <h3>Notificaciones por correo</h3>
        {!notifyConfigured && (
          <p style={{ fontSize: 12.5, color: "#8a5a00", background: "#fff6e5", padding: "8px 10px", borderRadius: 6 }}>
            Para que las notificaciones se envíen de verdad, configure la variable de entorno{" "}
            <code>RESEND_API_KEY</code> en el proyecto de Vercel. Mientras tanto, los envíos igual
            quedan guardados en la bandeja de Envíos.
          </p>
        )}
        <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13.5, margin: "10px 0" }}>
          <input
            type="checkbox"
            checked={config.settings.notificationsEnabled}
            onChange={(e) => setSettings({ notificationsEnabled: e.target.checked })}
          />
          Enviar un correo cada vez que llega un envío nuevo
        </label>
        <div className="adm-field">
          <label>Correo que recibe la notificación</label>
          <input
            className="adm-input"
            type="email"
            value={config.settings.notifyEmail}
            onChange={(e) => setSettings({ notifyEmail: e.target.value })}
            placeholder="ventas@mrhome.com.do"
          />
        </div>
      </div>

      <div className="adm-card">
        <h3>Reglas de firma</h3>
        <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13.5 }}>
          <input
            type="checkbox"
            checked={config.settings.requireBothSignatures}
            onChange={(e) => setSettings({ requireBothSignatures: e.target.checked })}
          />
          Exigir ambas firmas (propietario y representante) para poder enviar
        </label>
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
