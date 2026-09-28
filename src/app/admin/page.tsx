import { redirect } from "next/navigation";
import { isAuthenticated } from "@/lib/auth";

export default async function AdminIndexPage() {
  const authed = await isAuthenticated();
  redirect(authed ? "/admin/submissions" : "/admin/login");
}
