import { redirect, notFound } from "next/navigation";
import { isAuthenticated } from "@/lib/auth";
import { getSubmission } from "@/lib/blob-store";
import AdminShell from "@/components/admin/AdminShell";
import DeleteSubmissionButton from "@/components/admin/DeleteSubmissionButton";

export const dynamic = "force-dynamic";

export default async function SubmissionDetailPage({
  params,
}: {
  params: { id: string };
}) {
  if (!(await isAuthenticated())) redirect("/admin/login");
  const submission = await getSubmission(params.id);
  if (!submission) notFound();

  return (
    <AdminShell active="/admin/submissions">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <h1 style={{ margin: 0 }}>Envío del {new Date(submission.createdAt).toLocaleString("es-DO")}</h1>
        <div style={{ display: "flex", gap: 8 }}>
          <a className="cf-btn cf-btn-secondary" href={`/api/admin/submissions/${submission.id}/pdf`} target="_blank" rel="noreferrer">
            Ver PDF
          </a>
          <DeleteSubmissionButton id={submission.id} />
        </div>
      </div>

      <div className="adm-card">
        <h3>Datos</h3>
        <table className="adm-table">
          <tbody>
            {Object.entries(submission.data).map(([key, value]) => (
              <tr key={key}>
                <th style={{ width: 220 }}>{key}</th>
                <td>{value || "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {Object.keys(submission.signatures).length > 0 && (
        <div className="adm-card">
          <h3>Firmas</h3>
          <div style={{ display: "flex", gap: 24, flexWrap: "wrap" }}>
            {Object.entries(submission.signatures).map(([name, url]) => (
              <div key={name}>
                <div style={{ fontSize: 12, color: "#666", marginBottom: 6 }}>{name}</div>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={url} alt={name} style={{ maxWidth: 220, border: "1px solid #eee", borderRadius: 6 }} />
              </div>
            ))}
          </div>
        </div>
      )}

      {Object.keys(submission.files).length > 0 && (
        <div className="adm-card">
          <h3>Archivos adjuntos</h3>
          {Object.entries(submission.files).map(([name, files]) => (
            <div key={name} style={{ marginBottom: 10 }}>
              <div style={{ fontSize: 12, color: "#666", marginBottom: 4 }}>{name}</div>
              <ul style={{ margin: 0 }}>
                {files.map((f, i) => (
                  <li key={i}>
                    <a href={f.url} target="_blank" rel="noreferrer">
                      {f.name}
                    </a>{" "}
                    ({Math.round(f.size / 1024)} KB)
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}
    </AdminShell>
  );
}
