// scubacuba-forms Worker — replaces Netlify Forms after the move to Cloudflare Pages.
//
// Not publicly routed (workers_dev = false, no routes). The Pages Function
// functions/api/form.js forwards POST /api/form here through a service binding,
// because Pages projects can't hold a send_email binding themselves.
//
// The site's two forms (quote.html "quote", index.html "newsletter") POST
// url-encoded data. We email it to the business inbox with Cloudflare
// Email Sending (binding EMAIL, see wrangler.toml). Mail goes out from the
// forms.scubacuba.ca subdomain so the apex SPF/MX (Google Workspace) are
// never touched. Reply-To is the visitor, so "Reply" in Gmail answers them.

const TO = 'info@scubacuba.ca';
const FROM = { email: 'noreply@forms.scubacuba.ca', name: 'ScubaCuba.ca Website' };
const ALLOWED_ORIGINS = ['https://scubacuba.ca', 'https://www.scubacuba.ca', 'https://scubacuba.pages.dev'];

const FORMS = {
  quote: { honeypot: 'website', label: 'Quote request' },
  newsletter: { honeypot: 'b_hp', label: 'Newsletter signup' },
};

// Fields that are plumbing, not content
const SKIP = new Set(['form-name', 'website', 'b_hp', 'submitSource']);

const MAX_BODY = 32 * 1024;
const MAX_VALUE = 5000;

const json = (status, data) =>
  new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' },
  });

const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const clean = s => String(s).replace(/[\r\n]+/g, ' ').trim().slice(0, 200);
const isEmail = s => /^[^\s@<>()",;:]+@[^\s@<>()",;:]+\.[^\s@<>()",;:]+$/.test(s);

// "traveler1_name[first]" -> "Traveler1 name — first"; "how_heard[]" -> "How heard"
function prettyKey(k) {
  const m = k.match(/^([^[]+)(?:\[([^\]]*)\])?$/);
  const base = (m ? m[1] : k).replace(/_/g, ' ');
  const sub = m && m[2] ? ` — ${m[2]}` : '';
  return base.charAt(0).toUpperCase() + base.slice(1) + sub;
}

async function handle(request, env) {
  if (request.method !== 'POST') return json(405, { ok: false, error: 'method' });

  const origin = request.headers.get('Origin');
  const isLocal = origin && /^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin);
  const isPreview = origin && /^https:\/\/[a-z0-9-]+\.scubacuba\.pages\.dev$/.test(origin);
  if (origin && !ALLOWED_ORIGINS.includes(origin) && !isLocal && !isPreview) {
    return json(403, { ok: false, error: 'origin' });
  }

  const len = Number(request.headers.get('Content-Length') || 0);
  if (len > MAX_BODY) return json(413, { ok: false, error: 'too_large' });

  let fd;
  try {
    const text = await request.text();
    if (text.length > MAX_BODY) return json(413, { ok: false, error: 'too_large' });
    fd = new URLSearchParams(text);
  } catch {
    return json(400, { ok: false, error: 'bad_body' });
  }

  const formName = fd.get('form-name');
  const form = FORMS[formName];
  if (!form) return json(400, { ok: false, error: 'unknown_form' });

  // Honeypot filled -> bot. Pretend success so it doesn't retry.
  if (fd.get(form.honeypot)) return json(200, { ok: true });

  const email = (fd.get('email') || '').trim();
  if (!isEmail(email)) return json(400, { ok: false, error: 'email' });

  // Collect non-empty fields in order, merging repeated keys (checkbox groups)
  const fields = new Map();
  for (const [k, v] of fd) {
    if (SKIP.has(k)) continue;
    const val = String(v).trim().slice(0, MAX_VALUE);
    if (!val) continue;
    const key = prettyKey(k);
    fields.set(key, fields.has(key) ? `${fields.get(key)}, ${val}` : val);
  }

  let subject;
  if (formName === 'quote') {
    const who = [fd.get('traveler1_name[first]'), fd.get('traveler1_name[last]')].filter(Boolean).join(' ') || email;
    const dest = fd.get('destination');
    subject = `Quote request — ${clean(who)}${dest ? ` — ${clean(dest)}` : ''}`;
  } else {
    subject = `Newsletter signup — ${clean(fd.get('full_name') || email)}`;
  }

  const rows = [...fields].map(([k, v]) =>
    `<tr><td style="padding:6px 12px 6px 0;vertical-align:top;color:#555;white-space:nowrap"><b>${esc(k)}</b></td>` +
    `<td style="padding:6px 0;white-space:pre-wrap">${esc(v)}</td></tr>`).join('');
  const html =
    `<div style="font-family:Arial,sans-serif;font-size:14px;color:#111">` +
    `<h2 style="margin:0 0 12px">${esc(form.label)}</h2>` +
    `<p style="margin:0 0 16px;color:#555">Sent from the scubacuba.ca website. Reply to this email to answer ${esc(email)}.</p>` +
    `<table style="border-collapse:collapse">${rows}</table></div>`;
  const text = `${form.label}\nSent from the scubacuba.ca website. Reply to this email to answer ${email}.\n\n` +
    [...fields].map(([k, v]) => `${k}: ${v}`).join('\n');

  try {
    await env.EMAIL.send({
      to: env.FORM_TO || TO,
      from: FROM,
      replyTo: email,
      subject,
      html,
      text,
    });
  } catch (err) {
    console.error('form send failed', formName, err && (err.code || err.message));
    return json(502, { ok: false, error: 'send_failed' });
  }

  return json(200, { ok: true });
}

export default {
  fetch: (request, env) => handle(request, env),
};
