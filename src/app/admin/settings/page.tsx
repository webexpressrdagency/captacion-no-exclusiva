import { redirect } from "next/navigation";
import { isAuthenticated } from "@/lib/auth";
import { getConfig } from "@/lib/blob-store";
import AdminShell from "@/components/admin/AdminShell";
import SettingsClient from "@/components/admin/SettingsClient";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  if (!(await isAuthenticated())) redirect("/admin/login");
  const config = await getConfig();
  const notifyConfigured = !!process.env.RESEND_API_KEY;

  return (
    <AdminShell active="/admin/settings">
      <h1>Ajustes</h1>
      <SettingsClient initialConfig={config} notifyConfigured={notifyConfigured} />
    </AdminShell>
  );
}
