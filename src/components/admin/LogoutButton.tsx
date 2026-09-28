"use client";

import { useRouter } from "next/navigation";

export default function LogoutButton() {
  const router = useRouter();
  return (
    <button
      className="adm-icon-btn"
      style={{ width: "100%", color: "#fff", background: "transparent", borderColor: "#454a56" }}
      onClick={async () => {
        await fetch("/api/admin/logout", { method: "POST" });
        router.push("/admin/login");
        router.refresh();
      }}
    >
      Cerrar sesión
    </button>
  );
}
