import { redirect } from "next/navigation";
import { isAuthenticated } from "@/lib/auth";
import { listSubmissions } from "@/lib/blob-store";
import AdminShell from "@/components/admin/AdminShell";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function SubmissionsPage() {
  if (!(await isAuthenticated())) redirect("/admin/login");
  const submissions = await listSubmissions();

  return (
    <AdminShell active="/admin/submissions">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <h1 style={{ margin: 0 }}>Envíos ({submissions.length})</h1>
        <a className="cf-btn cf-btn-secondary" href="/api/admin/submissions/export">
          Exportar CSV
        </a>
      </div>
      <div className="adm-card">
        {submissions.length === 0 ? (
          <p>Todavía no hay envíos.</p>
        ) : (
          <table className="adm-table">
            <thead>
              <tr>
                <th>Fecha</th>
                <th>Nombre</th>
                <th>Correo</th>
                <th>Inmueble</th>
                <th>Archivos</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {submissions.map((s) => (
                <tr key={s.id}>
                  <td>{new Date(s.createdAt).toLocaleString("es-DO")}</td>
                  <td>{s.data.nombreCompleto || "—"}</td>
                  <td>{s.data.correo || "—"}</td>
                  <td>{s.data.inmuebleNombre || "—"}</td>
                  <td>
                    {Object.values(s.files).reduce((a, b) => a + b.length, 0)}
                  </td>
                  <td>
                    <Link className="adm-icon-btn" href={`/admin/submissions/${s.id}`}>
                      Ver
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </AdminShell>
  );
}
