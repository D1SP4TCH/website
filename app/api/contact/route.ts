import { Resend } from "resend";
import { NextResponse } from "next/server";

const MAX = { name: 200, email: 320, message: 10000 };

function isNonEmptyString(v: unknown): v is string {
  return typeof v === "string" && v.trim().length > 0;
}

export async function POST(request: Request) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "Email is not configured on the server." },
      { status: 503 },
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON." }, { status: 400 });
  }

  if (!body || typeof body !== "object") {
    return NextResponse.json({ error: "Invalid payload." }, { status: 400 });
  }

  const { name, email, message } = body as Record<string, unknown>;

  if (!isNonEmptyString(name) || name.trim().length > MAX.name) {
    return NextResponse.json({ error: "Invalid name." }, { status: 400 });
  }
  if (!isNonEmptyString(email) || email.trim().length > MAX.email) {
    return NextResponse.json({ error: "Invalid email." }, { status: 400 });
  }
  if (!isNonEmptyString(message) || message.trim().length > MAX.message) {
    return NextResponse.json({ error: "Invalid message." }, { status: 400 });
  }

  const emailTrim = email.trim();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailTrim)) {
    return NextResponse.json({ error: "Invalid email format." }, { status: 400 });
  }

  const to = process.env.CONTACT_TO_EMAIL ?? "chiujason02@gmail.com";
  const from =
    process.env.RESEND_FROM_EMAIL ?? "Portfolio <onboarding@resend.dev>";

  const safeName = name.trim();
  const safeMessage = message.trim();

  const resend = new Resend(apiKey);

  const { error } = await resend.emails.send({
    from,
    to: [to],
    replyTo: emailTrim,
    subject: `Portfolio contact: ${safeName}`,
    text: `${safeName} <${emailTrim}> wrote:\n\n${safeMessage}`,
    html: `
      <p><strong>${escapeHtml(safeName)}</strong> &lt;${escapeHtml(emailTrim)}&gt;</p>
      <pre style="font-family:system-ui,sans-serif;white-space:pre-wrap">${escapeHtml(safeMessage)}</pre>
    `,
  });

  if (error) {
    console.error("[contact] Resend error:", error);
    return NextResponse.json(
      { error: "Could not send email. Try again later." },
      { status: 502 },
    );
  }

  return NextResponse.json({ ok: true });
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
