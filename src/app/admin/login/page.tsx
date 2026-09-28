"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminLoginPage() {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      if (!res.ok) {
        const json = await res.json().catch(() => ({}));
        setError(json.error || "No se pudo iniciar sesión");
        setLoading(false);
        return;
      }
      router.push("/admin/submissions");
      router.refresh();
    } catch {
      setError("Error de conexión");
      setLoading(false);
    }
  };

  return (
    <div className="adm-login-wrap">
      <form className="adm-login-box" onSubmit={submit}>
        <h2 style={{ marginTop: 0 }}>Panel de administración</h2>
        <div className="adm-field">
          <label htmlFor="password">Contraseña</label>
          <input
            id="password"
            className="adm-input"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoFocus
            required
          />
        </div>
        {error && (
          <div style={{ color: "#b3261e", fontSize: 13, marginBottom: 12 }}>{error}</div>
        )}
        <button className="cf-btn cf-btn-primary" style={{ width: "100%" }} disabled={loading}>
          {loading ? "Ingresando..." : "Ingresar"}
        </button>
      </form>
    </div>
  );
}
