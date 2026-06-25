import { Resend } from "resend";
import { NextResponse } from "next/server";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: Request) {
  const { name, email, subject, message } = await req.json();

  if (!name || !email || !subject || !message) {
    return NextResponse.json({ error: "missing fields" }, { status: 400 });
  }

  const { error } = await resend.emails.send({
    from: "stalfolio <onboarding@resend.dev>",
    to: "dstalingrad@gmail.com",
    replyTo: email,
    subject: `[stalfolio] ${subject}`,
    text: `from: ${name} <${email}>\n\n${message}`,
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
