import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import nodemailer from "nodemailer";
import { timingSafeEqual } from "crypto";

export const dynamic = "force-dynamic";

function getServiceSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error("Missing Supabase service role configuration");
  return createClient(url, key);
}

function startOfDay(d: Date) {
  const c = new Date(d);
  c.setUTCHours(0, 0, 0, 0);
  return c;
}
function endOfDay(d: Date) {
  const c = new Date(d);
  c.setUTCHours(23, 59, 59, 999);
  return c;
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export async function GET(request: Request) {
  // CRON_SECRET is required — reject if not configured
  const secret = process.env.CRON_SECRET;
  if (!secret) {
    return NextResponse.json({ error: "server misconfigured" }, { status: 500 });
  }
  const auth = request.headers.get("authorization") ?? "";
  const expected = `Bearer ${secret}`;
  const authMatch =
    auth.length === expected.length &&
    timingSafeEqual(Buffer.from(auth), Buffer.from(expected));
  if (!authMatch) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const supabase = getServiceSupabase();
  const now = new Date();
  const today = startOfDay(now);
  const tomorrow = new Date(today);
  tomorrow.setUTCDate(tomorrow.getUTCDate() + 1);

  // Fetch tasks due today (not yet notified)
  const { data: dueTodayRaw } = await supabase
    .from("tasks")
    .select("id, title, description, deadline, status")
    .gte("deadline", today.toISOString())
    .lte("deadline", endOfDay(today).toISOString())
    .eq("reminder_sent_day_of", false)
    .neq("status", "done")
    .neq("status", "cancelled");

  // Fetch tasks due tomorrow (not yet notified)
  const { data: dueTomorrowRaw } = await supabase
    .from("tasks")
    .select("id, title, description, deadline, status")
    .gte("deadline", tomorrow.toISOString())
    .lte("deadline", endOfDay(tomorrow).toISOString())
    .eq("reminder_sent_day_before", false)
    .neq("status", "done")
    .neq("status", "cancelled");

  const dueToday = dueTodayRaw ?? [];
  const dueTomorrow = dueTomorrowRaw ?? [];

  if (dueToday.length === 0 && dueTomorrow.length === 0) {
    return NextResponse.json({ sent: 0, message: "no reminders needed" });
  }

  // Build email
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_APP_PASSWORD,
    },
  });

  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" });

  const todayRows = dueToday
    .map((t) => `<tr><td style="padding:8px 12px;border-bottom:1px solid #f0f0f0;font-weight:600">${escapeHtml(t.title)}</td><td style="padding:8px 12px;border-bottom:1px solid #f0f0f0;color:#ef4444">due today</td><td style="padding:8px 12px;border-bottom:1px solid #f0f0f0;color:#6b7280">${escapeHtml(formatDate(t.deadline))}</td></tr>`)
    .join("");

  const tomorrowRows = dueTomorrow
    .map((t) => `<tr><td style="padding:8px 12px;border-bottom:1px solid #f0f0f0;font-weight:600">${escapeHtml(t.title)}</td><td style="padding:8px 12px;border-bottom:1px solid #f0f0f0;color:#f59e0b">due tomorrow</td><td style="padding:8px 12px;border-bottom:1px solid #f0f0f0;color:#6b7280">${escapeHtml(formatDate(t.deadline))}</td></tr>`)
    .join("");

  const html = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8" /></head>
<body style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;background:#f9f9f9;margin:0;padding:32px">
  <div style="max-width:540px;margin:0 auto;background:#fff;border-radius:16px;border:1px solid #e5e7eb;overflow:hidden">
    <div style="background:#1a1a1a;padding:24px 28px">
      <p style="color:#fff;font-weight:900;font-size:18px;margin:0;letter-spacing:-0.5px">task reminder</p>
      <p style="color:#9ca3af;font-size:13px;margin:6px 0 0">stalfolio · ${new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}</p>
    </div>
    <div style="padding:24px 28px">
      ${todayRows || tomorrowRows ? `
      <table style="width:100%;border-collapse:collapse;font-size:13px">
        <thead>
          <tr>
            <th style="text-align:left;padding:6px 12px;color:#9ca3af;font-size:10px;text-transform:uppercase;letter-spacing:1px">task</th>
            <th style="text-align:left;padding:6px 12px;color:#9ca3af;font-size:10px;text-transform:uppercase;letter-spacing:1px">urgency</th>
            <th style="text-align:left;padding:6px 12px;color:#9ca3af;font-size:10px;text-transform:uppercase;letter-spacing:1px">deadline</th>
          </tr>
        </thead>
        <tbody>${todayRows}${tomorrowRows}</tbody>
      </table>` : ""}
    </div>
    <div style="padding:16px 28px 24px;border-top:1px solid #f0f0f0">
      <a href="${process.env.NEXT_PUBLIC_APP_URL ?? "https://stalfolio.com"}/admin" style="font-size:12px;color:#6b7280;text-decoration:none">open task manager →</a>
    </div>
  </div>
</body>
</html>`;

  const totalCount = dueToday.length + dueTomorrow.length;

  await transporter.sendMail({
    from: `"stalfolio tasks" <${process.env.GMAIL_USER}>`,
    to: process.env.GMAIL_USER,
    subject: `⏰ ${totalCount} task${totalCount !== 1 ? "s" : ""} need your attention`,
    html,
  });

  // Mark reminders as sent
  if (dueToday.length > 0) {
    await supabase
      .from("tasks")
      .update({ reminder_sent_day_of: true })
      .in("id", dueToday.map((t) => t.id));
  }
  if (dueTomorrow.length > 0) {
    await supabase
      .from("tasks")
      .update({ reminder_sent_day_before: true })
      .in("id", dueTomorrow.map((t) => t.id));
  }

  return NextResponse.json({ sent: totalCount, dueToday: dueToday.length, dueTomorrow: dueTomorrow.length });
}
