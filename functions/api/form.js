// POST /api/form — forwards to the scubacuba-forms Worker (workers/forms/),
// which validates and emails the submission. Pages can't bind send_email
// directly, so the Worker does the sending via the FORMS service binding.
export async function onRequest({ request, env }) {
  return env.FORMS.fetch(request);
}
