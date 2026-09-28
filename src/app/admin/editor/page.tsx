import { redirect } from "next/navigation";
import { isAuthenticated } from "@/lib/auth";
import { getConfig } from "@/lib/blob-store";
import AdminShell from "@/components/admin/AdminShell";
import EditorClient from "@/components/admin/EditorClient";

export const dynamic = "force-dynamic";

export default async function EditorPage() {
  if (!(await isAuthenticated())) redirect("/admin/login");
  const config = await getConfig();

  return (
    <AdminShell active="/admin/editor">
      <h1>Campos y textos</h1>
      <p style={{ color: "#666", marginTop: -8, fontSize: 13.5 }}>
        Agregue, edite, reordene o elimine los textos legales y los campos del formulario. Use
        <code> **texto** </code> dentro de un bloque de texto para ponerlo en negrita.
      </p>
      <EditorClient initialConfig={config} />
    </AdminShell>
  );
}
