import { FormConfig, Submission } from "./types";

// Sends a notification email through Resend if RESEND_API_KEY is configured.
// Silently does nothing if the key or the recipient is missing, so
// notifications are entirely optional and never block a submission.
export async function sendNotificationEmail(
  config: FormConfig,
  submission: Submission
): Promise<void> {
  if (!config.settings.notificationsEnabled) return;
  const apiKey = process.env.RESEND_API_KEY;
  const to = config.settings.notifyEmail;
  if (!apiKey || !to) return;

  const from = process.env.NOTIFY_FROM_EMAIL || "onboarding@resend.dev";

  const rows = Object.entries(submission.data)
    .map(([key, value]) => `<tr><td style="padding:4px 8px;color:#555">${key}</td><td style="padding:4px 8px">${value || "-"}</td></tr>`)
    .join("");

  const html = `
    <div style="font-family:sans-serif">
      <h2>${config.meta.title}</h2>
      <p>Se recibió un nuevo envío del formulario.</p>
      <table>${rows}</table>
      <p>ID: ${submission.id}</p>
    </div>
  `;

  await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from,
      to,
      subject: `Nuevo envío: ${config.meta.title}`,
      html,
    }),
  });
}
