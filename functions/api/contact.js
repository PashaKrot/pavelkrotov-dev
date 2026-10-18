/**
 * Cloudflare Pages Function — contact form → Telegram notification.
 * Route: POST /api/contact
 * Secrets (set via `wrangler pages secret put`): TG_BOT_TOKEN, TG_CHAT_ID.
 * The bot token lives only in Cloudflare env, never in the public site code.
 */

function json(obj, status) {
  return new Response(JSON.stringify(obj), {
    status: status || 200,
    headers: { "content-type": "application/json; charset=utf-8" },
  });
}

function clip(value, max) {
  return (value == null ? "" : String(value)).trim().slice(0, max);
}

export async function onRequestPost(context) {
  const { request, env } = context;

  try {
    // Accept JSON or classic form encoding.
    const contentType = request.headers.get("content-type") || "";
    let raw = {};
    if (contentType.includes("application/json")) {
      raw = await request.json();
    } else {
      const form = await request.formData();
      raw = Object.fromEntries(form.entries());
    }

    // Honeypot: bots fill hidden fields; humans leave them empty.
    if (clip(raw.website, 100) || clip(raw._gotcha, 100)) {
      return json({ ok: true }); // silently accept, drop
    }

    const name = clip(raw.name, 200);
    const contact = clip(raw.contact, 300);
    const message = clip(raw.message, 4000);

    if (!name || !contact || !message) {
      return json({ ok: false, error: "missing_fields" }, 400);
    }

    const token = env.TG_BOT_TOKEN;
    const chatId = env.TG_CHAT_ID;
    if (!token || !chatId) {
      return json({ ok: false, error: "not_configured" }, 500);
    }

    const text =
      "🔔 Новое сообщение с сайта-портфолио\n\n" +
      "👤 Имя: " + name + "\n" +
      "🔗 Контакт: " + contact + "\n\n" +
      "💬 Сообщение:\n" + message;

    const tgResp = await fetch(
      "https://api.telegram.org/bot" + token + "/sendMessage",
      {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          chat_id: chatId,
          text: text,
          disable_web_page_preview: true,
        }),
      }
    );

    if (!tgResp.ok) {
      return json({ ok: false, error: "delivery_failed" }, 502);
    }

    return json({ ok: true });
  } catch (err) {
    return json({ ok: false, error: "server_error" }, 500);
  }
}

// Reject non-POST methods cleanly.
export async function onRequest(context) {
  if (context.request.method !== "POST") {
    return json({ ok: false, error: "method_not_allowed" }, 405);
  }
  return onRequestPost(context);
}
