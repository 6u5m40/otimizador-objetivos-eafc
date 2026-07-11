// Content script: roda nas páginas do FUT.GG.
//  - FETCH_ALL: lê o payload de objetivos (same-origin).
//  - SYNC_READ: lê os objetivos concluídos da conta (GET /api/fut/gg-club/).
//  - SYNC_WRITE: marca/desmarca um objetivo concluído na conta.
// A autenticação usa o token do Supabase guardado no localStorage do FUT.GG.
(function () {
  "use strict";

  function authHeader() {
    try {
      const j = JSON.parse(localStorage.getItem("sb-www-auth-token"));
      const tok = j && (j.access_token || (j.currentSession && j.currentSession.access_token));
      if (tok) return "Bearer " + tok;
    } catch (e) { /* ignora */ }
    return null;
  }

  function fetchAll(path) {
    return fetch(path || "https://www.fut.gg/objectives/", { credentials: "omit" })
      .then((r) => r.text())
      .then((html) => window.EAFC_EXTRACT.fromHtml(html, { nowMs: Date.now() }));
  }

  function syncRead() {
    const auth = authHeader();
    if (!auth) return Promise.resolve({ ok: false, error: "not-logged-in" });
    return fetch("/api/fut/gg-club/", { headers: { Accept: "application/json", Authorization: auth } })
      .then((r) => (r.status === 200 ? r.json() : Promise.reject("status " + r.status)))
      .then((j) => {
        const d = j.data || j;
        return { ok: true, objectiveChallenges: d.objectiveChallenges || [], objectives: d.objectives || [] };
      })
      .catch((e) => ({ ok: false, error: String(e) }));
  }

  function syncWrite(challengeId, done) {
    const auth = authHeader();
    if (!auth) return Promise.resolve({ ok: false, error: "not-logged-in" });
    if (!challengeId) return Promise.resolve({ ok: false, error: "no-id" });
    const path = done ? "/api/fut/gg-club/completions/create/" : "/api/fut/gg-club/completions/remove/";
    return fetch(path, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json", Authorization: auth },
      body: JSON.stringify({ objectType: "OBJECTIVE_CHALLENGE", objectId: challengeId })
    })
      .then((r) => ({ ok: r.status >= 200 && r.status < 300, status: r.status }))
      .catch((e) => ({ ok: false, error: String(e) }));
  }

  chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
    if (!msg) return;
    if (msg.type === "FETCH_ALL") {
      fetchAll(msg.path).then((objectives) => sendResponse({ ok: true, objectives })).catch((e) => sendResponse({ ok: false, error: String(e) }));
      return true;
    }
    if (msg.type === "SYNC_READ") { syncRead().then(sendResponse); return true; }
    if (msg.type === "SYNC_WRITE") { syncWrite(msg.challengeId, msg.done).then(sendResponse); return true; }
    if (msg.type === "SYNC_WRITE_MANY") {
      Promise.all((msg.items || []).map((it) => syncWrite(it.challengeId, it.done)))
        .then((results) => sendResponse({ ok: true, results }));
      return true;
    }
  });
})();
