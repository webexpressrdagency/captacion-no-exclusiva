import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Formulario de captación",
  description: "Formulario de captación no exclusiva",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
