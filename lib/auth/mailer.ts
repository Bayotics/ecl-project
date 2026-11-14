import "server-only";

/**
 * Account emails (confirm address, reset password) through Sendridge's REST API
 * (POST https://api.sendridge.com/v1/emails/send). Needs SENDRIDGE_API_KEY (an `sr_…` server key with
 * the sendEmail permission) and EMAIL_FROM on a domain verified in the Sendridge dashboard.
 */
export const isEmailConfigured = () => Boolean(process.env.SENDRIDGE_API_KEY && process.env.EMAIL_FROM);

export async function sendEmail(to: string, subject: string, text: string) {
  if (!isEmailConfigured()) throw new Error("Email is not configured. Add SENDRIDGE_API_KEY and EMAIL_FROM.");
  const response = await fetch("https://api.sendridge.com/v1/emails/send", {
    method: "POST",
    headers: { Authorization: `Bearer ${process.env.SENDRIDGE_API_KEY}`, "Content-Type": "application/json" },
    body: JSON.stringify({ from: `Eko Club Louisiana <${process.env.EMAIL_FROM}>`, to, subject, text }),
    signal: AbortSignal.timeout(10000),
    cache: "no-store",
  });
  // 202 Accepted: queued for delivery.
  if (!response.ok) {
    const body = (await response.json().catch(() => null)) as { message?: string; code?: string } | null;
    throw new Error(`Sendridge rejected the email (${response.status}${body?.code ? `, ${body.code}` : ""}).`);
  }
}
