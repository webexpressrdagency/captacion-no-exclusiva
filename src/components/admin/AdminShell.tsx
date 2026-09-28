import Link from "next/link";
import LogoutButton from "./LogoutButton";

const NAV = [
  { href: "/admin/submissions", label: "Envíos" },
  { href: "/admin/editor", label: "Campos y textos" },
  { href: "/admin/design", label: "Diseño" },
  { href: "/admin/settings", label: "Ajustes" },
];

export default function AdminShell({
  active,
  children,
}: {
  active: string;
  children: React.ReactNode;
}) {
  return (
    <div className="adm-shell">
      <aside className="adm-sidebar">
        <h2>Panel de administración</h2>
        {NAV.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`adm-nav-link${active === item.href ? " active" : ""}`}
          >
            {item.label}
          </Link>
        ))}
        <div style={{ marginTop: "auto", paddingTop: 20 }}>
          <LogoutButton />
        </div>
      </aside>
      <main className="adm-main">{children}</main>
    </div>
  );
}
