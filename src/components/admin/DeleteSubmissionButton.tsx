"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function DeleteSubmissionButton({ id }: { id: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  return (
    <button
      className="cf-btn cf-btn-ghost"
      disabled={loading}
      onClick={async () => {
        if (!confirm("¿Eliminar este envío? Esta acción no se puede deshacer.")) return;
        setLoading(true);
        await fetch(`/api/admin/submissions/${id}`, { method: "DELETE" });
        router.push("/admin/submissions");
        router.refresh();
      }}
    >
      {loading ? "Eliminando..." : "Eliminar"}
    </button>
  );
}
