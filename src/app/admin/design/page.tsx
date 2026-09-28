import { redirect } from "next/navigation";
import { isAuthenticated } from "@/lib/auth";
import { getConfig } from "@/lib/blob-store";
import AdminShell from "@/components/admin/AdminShell";
import DesignClient from "@/components/admin/DesignClient";

export const dynamic = "force-dynamic";

export default async function DesignPage() {
  if (!(await isAuthenticated())) redirect("/admin/login");
  const config = await getConfig();

  return (
    <AdminShell active="/admin/design">
      <h1>Diseño</h1>
      <DesignClient initialConfig={config} />
    </AdminShell>
  );
}
