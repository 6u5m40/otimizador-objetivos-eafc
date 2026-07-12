(function () {
  "use strict";
  const $ = (s) => document.querySelector(s);
  const el = (t, c) => { const e = document.createElement(t); if (c) e.className = c; return e; };
  const OBJ_URL = "https://www.fut.gg/objectives/";
  const I = window.EAFC_I18N;

  let scraped = [];
  let userState = { done: {}, included: {}, manual: [], open: {}, skipped: {}, excludedModes: {}, groupDone: {}, progress: {}, futbinPushed: {}, onboarded: false, lang: "pt", sync: { mode: "off" } };
  let query = "";
  let viewExpiring = false; // filtro da lista: mostrar só o que expira em 7d
  let syncStatus = "";
  let lastAutoAt = 0;
  const STALE_MS = 6 * 60 * 60 * 1000;

  // captura erros recentes para o relatório
  window.__EAFC_ERRORS = window.__EAFC_ERRORS || [];
  window.addEventListener("error", (e) => {
    try { window.__EAFC_ERRORS.push((e.message || "") + " @ " + (e.filename || "").split("/").pop() + ":" + (e.lineno || "")); if (window.__EAFC_ERRORS.length > 8) window.__EAFC_ERRORS.shift(); } catch (_) {}
  });

  const CONCRETE_MODES = [
    { key: "squad-battles", label: "Squad Battles" }, { key: "rush", label: "Rush" },
    { key: "rivals", label: "Rivals" }, { key: "champions", label: "Champions" },
    { key: "live-events", label: "Live Events" }, { key: "friendlies", label: "Friendlies" },
    { key: "draft", label: "Draft" }
  ];
  const CAT_ORDER = ["seasonal", "campaign", "campaigns", "live-events", "journey-of-nations", "europe",
    "south-america", "north-america", "asia-oceania", "africa", "milestones", "fc-pro", "challengers", "foundations", "outros", "manual"];

  const lang = () => userState.lang || "pt";
  const T = (k, v) => I.t(lang(), k, v);
  const tReq = (s) => I.translateReq(s, lang());
  const tNat = (n) => I.ptNation(n, lang());

  function hash(str) { let h = 0; for (let i = 0; i < str.length; i++) { h = (h << 5) - h + str.charCodeAt(i); h |= 0; } return "m" + Math.abs(h).toString(36); }

  // ---------- storage ----------
  function loadState() {
    return new Promise((res) => {
      chrome.storage.local.get(["lastAuto", "userState"], (data) => {
        if (data.lastAuto) { scraped = data.lastAuto.objectives || []; lastAutoAt = data.lastAuto.at || 0; }
        if (data.userState) userState = Object.assign(userState, data.userState);
        res();
      });
    });
  }
  function saveState() { chrome.storage.local.set({ userState }); }
  function setSource(txt) { $("#source").textContent = txt; }
  function showLoading(on) { $("#list-loading").classList.toggle("hidden", !on); }

  // ---------- i18n estático ----------
  function applyStatic() {
    document.querySelectorAll("[data-i18n]").forEach((e) => { e.textContent = T(e.getAttribute("data-i18n")); });
    document.querySelectorAll("[data-i18n-html]").forEach((e) => { e.innerHTML = T(e.getAttribute("data-i18n-html")); });
    document.querySelectorAll("[data-i18n-ph]").forEach((e) => { e.placeholder = T(e.getAttribute("data-i18n-ph")); });
    document.querySelectorAll("[data-i18n-title]").forEach((e) => { e.title = T(e.getAttribute("data-i18n-title")); });
    $("#lang-toggle").textContent = lang() === "pt" ? "EN" : "PT";
    if (scraped.length) setSource(T("objs_source", { n: scraped.length }));
  }

  // ---------- leitura automática ----------
  async function loadObjectives() {
    showLoading(true); setSource(T("loading"));
    let objectives = null;
    try {
      const html = await fetch(OBJ_URL, { credentials: "omit" }).then((r) => r.text());
      objectives = window.EAFC_EXTRACT.fromHtml(html, { nowMs: Date.now() });
    } catch (e) { objectives = null; }
    if (!objectives || !objectives.length) objectives = await viaContentScript();
    showLoading(false);
    if (!objectives || !objectives.length) { setSource(T("read_fail")); return; }
    scraped = objectives; lastAutoAt = Date.now();
    chrome.storage.local.set({ lastAuto: { objectives, at: lastAutoAt } });
    setSource(T("objs_source", { n: objectives.length }));
    render();
  }

  // ---------- helpers de aba FUT.GG ----------
  function ensureFutggTab() {
    return new Promise((resolve) => {
      chrome.tabs.query({ url: ["https://www.fut.gg/*", "https://fut.gg/*"] }, (tabs) => {
        if (tabs && tabs.length) return resolve({ tabId: tabs[0].id, created: false });
        chrome.tabs.create({ url: OBJ_URL, active: false }, (tab) => {
          const listener = (tid, info) => { if (tid === tab.id && info.status === "complete") { chrome.tabs.onUpdated.removeListener(listener); setTimeout(() => resolve({ tabId: tab.id, created: true }), 1500); } };
          chrome.tabs.onUpdated.addListener(listener);
        });
      });
    });
  }
  // ---------- helper de aba FUTBIN ----------
  const FUTBIN_URL = "https://www.futbin.com/objectives";
  function ensureFutbinTab() {
    return new Promise((resolve) => {
      chrome.tabs.query({ url: ["https://www.futbin.com/*"] }, (tabs) => {
        if (tabs && tabs.length) return resolve({ tabId: tabs[0].id, created: false });
        chrome.tabs.create({ url: FUTBIN_URL, active: false }, (tab) => {
          const listener = (tid, info) => { if (tid === tab.id && info.status === "complete") { chrome.tabs.onUpdated.removeListener(listener); setTimeout(() => resolve({ tabId: tab.id, created: true }), 1800); } };
          chrome.tabs.onUpdated.addListener(listener);
        });
      });
    });
  }
  // espera a aba terminar de carregar antes de injetar (evita "Failed to fetch"
  // quando a aba do FUT.GG está no meio de um reload).
  function waitTabComplete(tabId, timeoutMs) {
    return new Promise((resolve) => {
      chrome.tabs.get(tabId, (t) => {
        if (chrome.runtime.lastError || !t) return resolve();
        if (t.status === "complete") return resolve();
        let done = false;
        const lis = (tid, info) => { if (tid === tabId && info.status === "complete" && !done) { done = true; clearTimeout(to); chrome.tabs.onUpdated.removeListener(lis); resolve(); } };
        const to = setTimeout(() => { if (!done) { done = true; chrome.tabs.onUpdated.removeListener(lis); resolve(); } }, timeoutMs || 6000);
        chrome.tabs.onUpdated.addListener(lis);
      });
    });
  }
  function sendTab(tabId, msg) {
    return new Promise((resolve) => {
      chrome.tabs.sendMessage(tabId, msg, (resp) => {
        if (chrome.runtime.lastError || !resp) {
          chrome.scripting.executeScript({ target: { tabId }, files: ["src/data.js", "src/i18n.js", "src/extract.js", "src/content.js"] }, () => {
            chrome.tabs.sendMessage(tabId, msg, (r2) => resolve(r2 || { ok: false, error: "no-content-script" }));
          });
        } else resolve(resp);
      });
    });
  }
  async function sendToFutgg(msg, keepOpen) {
    const { tabId, created } = await ensureFutggTab();
    const resp = await sendTab(tabId, msg);
    if (created && !keepOpen) chrome.tabs.remove(tabId);
    return resp;
  }
  async function viaContentScript() {
    const resp = await sendToFutgg({ type: "FETCH_ALL" });
    return resp && resp.ok ? resp.objectives : null;
  }

  // ---------- sincronização FUT.GG ----------
  function challengeIdOf(id) { const o = scraped.find((x) => x.id === id); return o ? o.challengeId : null; }
  function setSyncStatus(s) { syncStatus = s; const e = document.getElementById("sync-status"); if (e) e.textContent = s; const o = document.getElementById("onboard-status"); if (o) o.textContent = s; }

  // Roda uma função no MUNDO da página do FUT.GG (injeção fresca a cada vez —
  // não depende do content script da aba, que pode estar desatualizado).
  function runInFutgg(tabId, func, args) {
    const once = () => new Promise((resolve) => {
      chrome.scripting.executeScript({ target: { tabId }, world: "MAIN", func, args: args || [] }, (results) => {
        if (chrome.runtime.lastError || !results || !results[0]) { resolve({ ok: false, error: (chrome.runtime.lastError && chrome.runtime.lastError.message) || "exec-fail" }); return; }
        resolve(results[0].result);
      });
    });
    // se a injeção falhar (aba navegando/descartada), espera a aba carregar e tenta 1x mais
    return once().then(async (r) => {
      if (r && r.ok === false && /exec-fail|frame|No tab|closed/i.test(r.error || "")) {
        await waitTabComplete(tabId); await new Promise((res) => setTimeout(res, 300));
        return once();
      }
      return r;
    });
  }
  // ---- funções injetadas (executam DENTRO da página do FUT.GG) ----
  async function _readCompletions() {
    let auth = null;
    try { const j = JSON.parse(localStorage.getItem("sb-www-auth-token")); const t = j && (j.access_token || (j.currentSession && j.currentSession.access_token)); if (t) auth = "Bearer " + t; } catch (e) {}
    const headers = { Accept: "application/json" }; if (auth) headers.Authorization = auth;
    let lastErr = "";
    // repete se o fetch falhar (ex: aba recarregando) — até 3 tentativas
    for (let i = 0; i < 3; i++) {
      try {
        const r = await fetch("/api/fut/gg-club/?t=" + (Date.now()), { headers, credentials: "include", cache: "no-store" });
        if (r.status !== 200) return { ok: false, error: "status " + r.status };
        const j = await r.json(); const d = j.data || j;
        return { ok: true, objectiveChallenges: d.objectiveChallenges || [], objectives: d.objectives || [] };
      } catch (e) { lastErr = String((e && e.message) || e); await new Promise((res) => setTimeout(res, 500)); }
    }
    return { ok: false, error: lastErr || "fetch-failed" };
  }
  async function _writeCompletions(items) {
    let auth = null;
    try { const j = JSON.parse(localStorage.getItem("sb-www-auth-token")); const t = j && (j.access_token || (j.currentSession && j.currentSession.access_token)); if (t) auth = "Bearer " + t; } catch (e) {}
    const headers = { "Content-Type": "application/json", Accept: "application/json" }; if (auth) headers.Authorization = auth;
    let okc = 0, fail = 0;
    const doOne = async (it) => {
      // OBJECTIVE_CHALLENGE (objetivo individual) ou OBJECTIVE (grupo/campanha).
      const objType = it.objectType || "OBJECTIVE_CHALLENGE";
      const objId = it.objectId != null ? it.objectId : it.challengeId;
      const path = it.done ? "/api/fut/gg-club/completions/create/" : "/api/fut/gg-club/completions/remove/";
      for (let i = 0; i < 3; i++) {
        try {
          const r = await fetch(path, { method: "POST", headers, credentials: "include", body: JSON.stringify({ objectType: objType, objectId: objId }) });
          if (r.status >= 200 && r.status < 300) { okc++; } else { fail++; }
          return;
        } catch (e) { if (i === 2) { fail++; return; } else await new Promise((res) => setTimeout(res, 500)); }
      }
    };
    // envia em paralelo (pool de N) — MUITO mais rápido que 1 a 1
    let idx = 0;
    const worker = async () => { while (idx < items.length) { await doOne(items[idx++]); } };
    await Promise.all(Array.from({ length: Math.min(8, items.length) }, worker));
    return { ok: true, okc, fail };
  }
  // ---- escrita no FUTBIN (roda DENTRO da página do futbin.com) ----
  // Marca objetivos como concluídos no FUTBIN. O id do FUTBIN é
  // "set-cat-campanha-tarefa": set e cat vêm dos links de categoria do próprio
  // FUTBIN (lidos ao vivo, com fallback fixo); campanha=campaignId e
  // tarefa=challengeId (mesmos ids da EA que o FUT.GG usa).
  async function _writeFutbin(items) {
    try {
      // mapa fixo (fallback) FUT.GG slug (sem hífens) -> cat do FUTBIN
      const FB = { seasonal: 8, campaign: 6, campaigns: 6, liveevents: 2, journeyofnations: 17, northamerica: 11, asiaoceania: 12, africa: 13, southamerica: 14, europe: 15, milestones: 1, fcpro: 9, challengers: 10, foundations: 0 };
      let set = "82";
      // tenta ler set + mapa ao vivo dos links de categoria do FUTBIN
      try {
        const html = await (await fetch("/objectives", { credentials: "include" })).text();
        const re = /\/26\/objectives\/(\d+)\/(\d+)\/([a-z-]+)/g; let m;
        while ((m = re.exec(html))) { set = m[1]; FB[m[3].replace(/-+/g, "")] = parseInt(m[2], 10); }
      } catch (e) {}
      let okc = 0, fail = 0, skipped = 0;
      const failed = []; // itens que não deram 2xx — o chamador pode reenviar
      const doOne = async (it) => {
        const slug = String(it.categorySlug || "").replace(/-+/g, "");
        const cat = FB[slug];
        if (cat == null || !it.campaignId || !it.challengeId) { skipped++; return; }
        const entityId = set + "-" + cat + "-" + it.campaignId + "-" + it.challengeId;
        const url = "/markAsCompleted/ObjectiveGroupTask?year=26&entityId=" + encodeURIComponent(entityId) + "&completed=" + (it.done ? "true" : "false");
        for (let i = 0; i < 2; i++) {
          try { const r = await fetch(url, { method: "POST", credentials: "include", headers: { "X-Requested-With": "XMLHttpRequest" } }); if (r.status >= 200 && r.status < 300) { okc++; } else { fail++; failed.push(it); } return; }
          catch (e) { if (i === 1) { fail++; failed.push(it); return; } else await new Promise((res) => setTimeout(res, 400)); }
        }
      };
      // envia em paralelo (pool) — bem mais rápido; ~6 simultâneos o FUTBIN aguenta
      let idx = 0;
      const worker = async () => { while (idx < items.length) { await doOne(items[idx++]); } };
      await Promise.all(Array.from({ length: Math.min(6, items.length) }, worker));
      return { ok: true, okc, fail, skipped, failed };
    } catch (e) { return { ok: false, error: String(e) }; }
  }
  // sincroniza com o FUTBIN (modo "extensão → FUTBIN"): a extensão é a fonte da
  // verdade, então o FUTBIN passa a refletir EXATAMENTE o estado da extensão.
  // Como o FUTBIN não deixa a extensão LER de forma confiável o que está marcado
  // lá (o estado é montado no cliente), a extensão AFIRMA o estado de todos os
  // objetivos que conhece: envia "concluído" para os feitos e "não concluído"
  // para os não-feitos. Assim desmarca também o que foi marcado manualmente lá.
  async function pushFutbin(objs) {
    const pushed = userState.futbinPushed || (userState.futbinPushed = {});
    // estado consolidado por challengeId (qualquer ocorrência feita = feito) —
    // o mesmo objetivo pode aparecer em várias campanhas com ids locais diferentes.
    const doneByChal = new Map();
    for (const o of objs) { if (o.challengeId) doneByChal.set(o.challengeId, doneByChal.get(o.challengeId) === true || !!userState.done[o.id]); }
    // no FUTBIN cada campanha é uma ENTIDADE separada (entityId inclui a campanha),
    // então enviamos cada par (campanha, challengeId) — mas com o estado consolidado.
    const items = [];
    const seen = new Set();
    for (const o of objs) {
      if (!o.challengeId || !o.campaignId) continue;
      const key = o.campaignId + "-" + o.challengeId;
      if (seen.has(key)) continue; seen.add(key);
      items.push({ campaignId: o.campaignId, challengeId: o.challengeId, categorySlug: o.categorySlug, done: doneByChal.get(o.challengeId) === true });
    }
    if (!items.length) return { okc: 0, fail: 0, none: true };
    setSyncStatus(T("futbin_pushing", { n: items.length }));
    const { tabId, created } = await ensureFutbinTab();
    await waitTabComplete(tabId);
    // Envia e REENVIA só o que falhou, até tudo passar (ou 3 rodadas). Como cada
    // escrita afirma o estado absoluto (completed=true/false), reenviar é seguro
    // e idempotente — deixa a sincronização confiável em um clique só.
    let pending = items;
    let totalOk = 0, totalSkip = 0, lastErr = false;
    for (let round = 1; round <= 3 && pending.length; round++) {
      const r = await runInFutgg(tabId, _writeFutbin, [pending]);
      if (!r || r.ok === false) { lastErr = true; break; }
      totalOk += r.okc || 0;
      if (round === 1) totalSkip = r.skipped || 0; // "sem mapa" é constante; conta uma vez
      pending = r.failed || [];
    }
    if (created) chrome.tabs.remove(tabId);
    if (lastErr) return { ok: false };
    // guarda quais estão marcados (para referência/limpeza futura)
    items.forEach((it) => { if (it.done) pushed[it.challengeId] = { campaignId: it.campaignId, categorySlug: it.categorySlug }; else delete pushed[it.challengeId]; });
    saveState();
    return { ok: true, okc: totalOk, fail: pending.length, skipped: totalSkip };
  }

  async function syncNow() {
    const mode = (userState.sync || {}).mode;
    if (mode === "off") { setSyncStatus(T("sync_off_hint")); return; }
    // FUTBIN: espelho exato — marca os concluídos e desmarca os não-concluídos.
    if (mode === "to_futbin") {
      setSyncStatus(T("sync_running"));
      const r = await pushFutbin(allObjectives());
      if (r && r.none) setSyncStatus(T("futbin_none"));
      else if (r && r.ok !== false) {
        setSyncStatus(T("futbin_result", { n: r.okc || 0 }) + (r.fail ? " · " + T("futbin_fail", { n: r.fail }) : "") + (r.skipped ? " · " + r.skipped + " sem mapa" : ""));
        // o FUTBIN carrega o estado de conclusão só no load da página; recarrega a
        // aba aberta pra você VER as marcações novas (senão parece que não pegou).
        if ((r.okc || 0) > 0) reloadFutbinTabs();
      }
      else setSyncStatus(T("futbin_login"));
      return;
    }
    setSyncStatus(T("sync_running"));
    const { tabId, created } = await ensureFutggTab();
    await waitTabComplete(tabId);
    const resp = await runInFutgg(tabId, _readCompletions);
    if (!resp || !resp.ok) {
      if (created) chrome.tabs.remove(tabId);
      const auth = resp && /40[13]/.test(resp.error || "");
      setSyncStatus(auth ? T("sync_login") : T("sync_fail") + (resp && resp.error ? " (" + resp.error + ")" : ""));
      return;
    }
    let completed = new Set((resp.objectiveChallenges || []).map(Number));
    // grupos/campanhas concluídos como um todo no FUT.GG (ex: você clicou em
    // concluir "Europa"). Vêm em resp.objectives (eaId da campanha).
    let completedGroups = new Set((resp.objectives || []).map(Number));
    // fotografia do site no último sync — usada p/ detectar DESMARQUES remotos
    // no modo "dois sentidos" (algo que estava lá e sumiu = removido no FUT.GG).
    const lastSite = new Set(((userState.sync || {}).lastSite || []).map(Number));
    let pulled = 0, pushed = 0, removed = 0, groupsPulled = 0;
    const objs = allObjectives();

    if (mode === "from") {
      // FUT.GG manda: espelha exatamente — adiciona o que está lá e DESMARCA o
      // que não está mais (só para objetivos que têm challengeId).
      for (const o of objs) {
        if (!o.challengeId) continue;
        const onSite = completed.has(o.challengeId);
        if (onSite && !userState.done[o.id]) { userState.done[o.id] = true; pulled++; }
        else if (!onSite && userState.done[o.id]) { delete userState.done[o.id]; removed++; }
      }
      const gd = {};
      for (const o of objs) { if (o.campaignId && completedGroups.has(o.campaignId)) gd[o.campaignId] = true; }
      groupsPulled = Object.keys(gd).length;
      userState.groupDone = gd; // espelha grupos (some o que foi desmarcado lá)
    } else if (mode === "both") {
      // dois sentidos: soma dos dois lados; e desmarca aqui só o que foi
      // REMOVIDO no FUT.GG desde o último sync (estava no lastSite e sumiu) —
      // assim não apaga uma conclusão nova feita aqui que ainda não subiu.
      for (const o of objs) {
        if (!o.challengeId) continue;
        const onSite = completed.has(o.challengeId);
        if (onSite && !userState.done[o.id]) { userState.done[o.id] = true; pulled++; }
        else if (!onSite && userState.done[o.id] && lastSite.has(o.challengeId)) { delete userState.done[o.id]; removed++; }
      }
      // grupos: une (preserva grupos importados do jogo que ainda não subiram)
      const gd = Object.assign({}, userState.groupDone || {});
      for (const o of objs) { if (o.campaignId && completedGroups.has(o.campaignId)) gd[o.campaignId] = true; }
      groupsPulled = Object.keys(gd).length;
      userState.groupDone = gd;
    }

    let pushedGroups = 0, removedGroups = 0;
    if (mode === "to") {
      // Estado DESEJADO (a extensão é a fonte da verdade). Consolida por
      // challengeId: o mesmo objetivo pode aparecer em várias campanhas com ids
      // locais diferentes e, no FUT.GG, a conclusão é GLOBAL por challengeId — se
      // qualquer ocorrência está feita, considera feito.
      const desired = new Map();
      for (const o of objs) { if (o.challengeId) desired.set(o.challengeId, desired.get(o.challengeId) === true || !!userState.done[o.id]); }
      // grupos (campanhas) desejados
      const byCamp = {};
      for (const o of objs) { if (o.campaignId) (byCamp[o.campaignId] = byCamp[o.campaignId] || []).push(o); }
      const gdMap = userState.groupDone || {};
      const groupDesired = new Map();
      for (const cid in byCamp) {
        const its = byCamp[cid];
        const req = groupRequired(its);
        const indDone = its.filter((o) => userState.done[o.id]).length;
        groupDesired.set(Number(cid), !!(gdMap[cid] || (its.length > 0 && indDone >= req)));
      }
      // Reconciliação AUTO-CONVERGENTE: relê o site, aplica a diferença e repete
      // até bater (ou 3 rodadas). Assim UMA sincronização já deixa o FUT.GG
      // idêntico à extensão, mesmo que alguma escrita falhe ou a leitura atrase.
      for (let round = 1; round <= 3; round++) {
        if (round > 1) {
          await waitTabComplete(tabId);
          const rr = await runInFutgg(tabId, _readCompletions);
          if (rr && rr.ok) { completed = new Set((rr.objectiveChallenges || []).map(Number)); completedGroups = new Set((rr.objectives || []).map(Number)); }
        }
        const chalWrites = [];
        for (const [cid, done] of desired) {
          if (done && !completed.has(cid)) chalWrites.push({ challengeId: cid, done: true });
          else if (!done && completed.has(cid)) chalWrites.push({ challengeId: cid, done: false });
        }
        const groupWrites = [];
        for (const [cid, done] of groupDesired) {
          if (done && !completedGroups.has(cid)) groupWrites.push({ objectType: "OBJECTIVE", objectId: cid, done: true });
          else if (!done && completedGroups.has(cid)) groupWrites.push({ objectType: "OBJECTIVE", objectId: cid, done: false });
        }
        if (!chalWrites.length && !groupWrites.length) break; // convergiu — nada a fazer
        if (chalWrites.length) {
          await runInFutgg(tabId, _writeCompletions, [chalWrites]);
          pushed += chalWrites.filter((w) => w.done).length;
          removed += chalWrites.filter((w) => !w.done).length;
        }
        if (groupWrites.length) {
          await runInFutgg(tabId, _writeCompletions, [groupWrites]);
          pushedGroups += groupWrites.filter((w) => w.done).length;
          removedGroups += groupWrites.filter((w) => !w.done).length;
        }
      }
    } else if (mode === "both") {
      // (legado) dois sentidos: só empurra as conclusões novas (sem desmarcar).
      const desired = new Map();
      for (const o of objs) { if (o.challengeId) desired.set(o.challengeId, desired.get(o.challengeId) === true || !!userState.done[o.id]); }
      const toPush = [];
      for (const [cid, done] of desired) { if (done && !completed.has(cid)) toPush.push({ challengeId: cid, done: true }); }
      if (toPush.length) { await runInFutgg(tabId, _writeCompletions, [toPush]); pushed = toPush.length; }
      const byCamp = {};
      for (const o of objs) { if (o.campaignId) (byCamp[o.campaignId] = byCamp[o.campaignId] || []).push(o); }
      const gdMap = userState.groupDone || {};
      const groupsToPush = [];
      for (const cid in byCamp) {
        const its = byCamp[cid];
        const req = groupRequired(its);
        const indDone = its.filter((o) => userState.done[o.id]).length;
        const localComplete = gdMap[cid] || (its.length > 0 && indDone >= req);
        if (localComplete && !completedGroups.has(Number(cid))) groupsToPush.push({ objectType: "OBJECTIVE", objectId: Number(cid), done: true });
      }
      if (groupsToPush.length) { await runInFutgg(tabId, _writeCompletions, [groupsToPush]); pushedGroups = groupsToPush.length; }
    }
    // guarda a fotografia do site p/ o próximo sync detectar desmarques
    userState.sync = Object.assign({}, userState.sync || {}, { lastSite: [...completed] });
    if (created) chrome.tabs.remove(tabId);
    saveState(); render();
    if (pushed > 0 || pushedGroups > 0 || removed > 0 || removedGroups > 0) reloadFutggTabs(); // reflete no FUT.GG na hora
    const withId = objs.filter((o) => o.challengeId).length;
    if (pulled === 0 && removed === 0 && completed.size > 0 && withId === 0) {
      setSyncStatus("⚠ Li " + completed.size + " concluídos no FUT.GG, mas a lista local está SEM os IDs. Recarregue a extensão com a versão nova (remova e carregue de novo) e clique em ↻ atualizar.");
    } else {
      setSyncStatus(T("sync_result", { pulled, pushed }) + (pushedGroups ? " (+" + pushedGroups + " grupos)" : "") + (removed ? " · desmarcados " + removed : "") + (removedGroups ? " (-" + removedGroups + " grupos)" : "") + "  · lidos " + completed.size + " · com id " + withId + (groupsPulled ? " · grupos " + groupsPulled : ""));
    }
  }

  // recarrega as abas do FUT.GG abertas (pra mostrar as marcações novas)
  function reloadFutggTabs() {
    chrome.tabs.query({ url: ["https://www.fut.gg/*", "https://fut.gg/*"] }, (tabs) => {
      (tabs || []).forEach((t) => { try { chrome.tabs.reload(t.id); } catch (e) {} });
    });
  }
  // recarrega as abas do FUTBIN abertas (o FUTBIN só mostra a conclusão no load,
  // então sem recarregar parece que a sincronização não pegou).
  function reloadFutbinTabs() {
    chrome.tabs.query({ url: ["https://www.futbin.com/*"] }, (tabs) => {
      (tabs || []).forEach((t) => { try { chrome.tabs.reload(t.id); } catch (e) {} });
    });
  }

  async function pushDone(objId, done) {
    const mode = (userState.sync || {}).mode;
    // FUTBIN: marca ou DESMARCA esse objetivo direto
    if (mode === "to_futbin") {
      const o = allObjectives().find((x) => x.id === objId);
      if (!o || !o.challengeId || !o.campaignId) return;
      setSyncStatus(T("sync_pushing"));
      const { tabId, created } = await ensureFutbinTab();
      await waitTabComplete(tabId);
      const r = await runInFutgg(tabId, _writeFutbin, [[{ campaignId: o.campaignId, challengeId: o.challengeId, categorySlug: o.categorySlug, done }]]);
      if (created) chrome.tabs.remove(tabId);
      const pushed = userState.futbinPushed || (userState.futbinPushed = {});
      if (r && r.okc) {
        if (done) pushed[o.challengeId] = { campaignId: o.campaignId, categorySlug: o.categorySlug }; else delete pushed[o.challengeId];
        saveState();
        setSyncStatus(done ? T("sync_pushed_one") : T("sync_unpushed_one"));
        if (!created) reloadFutbinTabs(); // mostra a mudança na aba aberta do FUTBIN
      } else setSyncStatus(T("futbin_login"));
      return;
    }
    if (!(mode === "to" || mode === "both")) return;
    const cid = challengeIdOf(objId);
    if (!cid) return; // objetivo sem id (ex: manual) — não dá pra sincronizar
    setSyncStatus(T("sync_pushing"));
    const { tabId, created } = await ensureFutggTab();
    await waitTabComplete(tabId);
    const r = await runInFutgg(tabId, _writeCompletions, [[{ challengeId: cid, done }]]);
    if (created) chrome.tabs.remove(tabId);
    if (r && r.okc) { setSyncStatus(done ? T("sync_pushed_one") : T("sync_unpushed_one")); reloadFutggTabs(); }
    else setSyncStatus(T("sync_push_fail") + (r && r.error ? " (" + r.error + ")" : ""));
  }

  // ---------- IMPORTAR DO JOGO (EA FC Web App) ----------
  // Lê o que está concluído NO JOGO direto do Web App oficial da EA
  // (ea.com), usando o mesmo serviço interno que o Web App usa. Os IDs da EA
  // (objectiveId/groupId) são idênticos aos do FUT.GG (challengeId/campaignId),
  // então marcamos aqui e (opcionalmente) empurramos pro FUT.GG.
  const EA_WEBAPP_URL = "https://www.ea.com/ea-sports-fc/ultimate-team/web-app/";
  function findEaTab() {
    return new Promise((resolve) => {
      chrome.tabs.query({ url: ["https://www.ea.com/*ultimate-team/web-app*", "https://www.ea.com/*/ultimate-team/web-app/*"] }, (tabs) => {
        resolve(tabs && tabs.length ? tabs[0] : null);
      });
    });
  }
  // roda DENTRO da página do Web App da EA (world MAIN). Só LÊ — nunca resgata
  // recompensa nem altera nada no jogo.
  async function _readEaCompletions() {
    try {
      const svc = window.services && window.services.Objectives;
      if (!svc) return { ok: false, reason: "not-logged-in" };
      let full = null;
      const OrigOpen = XMLHttpRequest.prototype.open, OrigSend = XMLHttpRequest.prototype.send;
      XMLHttpRequest.prototype.open = function (m, u) { this.__u = u; return OrigOpen.apply(this, arguments); };
      XMLHttpRequest.prototype.send = function () { this.addEventListener("load", function () { try { if (/objective\/categories\/all/.test(this.__u || "")) full = this.responseText; } catch (e) {} }); return OrigSend.apply(this, arguments); };
      try { svc.flushCategoryCache && svc.flushCategoryCache(); } catch (e) {}
      await new Promise((res) => { try { const r = svc.requestCategories(); if (r && r.observe) r.observe(window, () => res()); else res(); } catch (e) { res(); } });
      for (let i = 0; i < 60 && !full; i++) await new Promise((r) => setTimeout(r, 100));
      try { XMLHttpRequest.prototype.open = OrigOpen; XMLHttpRequest.prototype.send = OrigSend; } catch (e) {}
      if (!full) return { ok: false, reason: "no-data" };
      const cats = JSON.parse(full);
      const doneChallenge = [], doneGroup = [], progress = [];
      const DONE = /COMPLET|REDEEM|CLAIM/i;
      for (const c of cats) for (const g of (c.groupsList || [])) {
        if (g.timesCompleted > 0 || g.groupState === 4) doneGroup.push(g.groupId);
        for (const ob of (g.objectives || [])) {
          if (ob.state && DONE.test(ob.state)) doneChallenge.push(ob.objectiveId);
          else if (ob.currentProgress > 0 && ob.multiplier > 0 && ob.currentProgress < ob.multiplier) {
            // progresso parcial no jogo (ex: venceu 150 de 300) — pra descontar
            progress.push({ id: ob.objectiveId, cur: ob.currentProgress, target: ob.multiplier });
          }
        }
      }
      return { ok: true, doneChallenge, doneGroup, progress };
    } catch (e) { return { ok: false, reason: String(e) }; }
  }
  async function importFromGame() {
    setSyncStatus(T("import_running"));
    const tab = await findEaTab();
    if (!tab) {
      // abre o Web App pro usuário logar; ele clica de novo depois de logado
      chrome.tabs.create({ url: EA_WEBAPP_URL, active: true });
      setSyncStatus(T("import_open_webapp"));
      return;
    }
    const res = await runInFutgg(tab.id, _readEaCompletions); // runInFutgg = injeção genérica (world MAIN)
    if (!res || !res.ok) {
      if (res && res.reason === "not-logged-in") { try { chrome.tabs.update(tab.id, { active: true }); } catch (e) {} setSyncStatus(T("import_login")); }
      else setSyncStatus(T("import_fail") + (res && res.reason ? " (" + res.reason + ")" : ""));
      return;
    }
    const doneCh = new Set(res.doneChallenge), doneGr = new Set(res.doneGroup);
    const objs = allObjectives();
    // O JOGO É A VERDADE: sobrescreve tudo. Reconstrói do zero — apaga o que
    // estava marcado antes e aplica exatamente o estado do jogo. Preserva só
    // objetivos manuais (sem challengeId), que o jogo não conhece.
    const newDone = {};
    for (const o of objs) { if (!o.challengeId && userState.done[o.id]) newDone[o.id] = true; }
    let mo = 0, mg = 0;
    for (const o of objs) { if (o.challengeId && doneCh.has(o.challengeId)) { newDone[o.id] = true; mo++; } }
    userState.done = newDone;
    const gd = {};
    for (const o of objs) { if (o.campaignId && doneGr.has(o.campaignId) && !gd[o.campaignId]) { gd[o.campaignId] = true; mg++; } }
    userState.groupDone = gd;
    // progresso parcial (o jogo é a verdade — sobrescreve)
    const prog = {};
    for (const p of (res.progress || [])) prog[p.id] = { cur: p.cur, target: p.target };
    userState.progress = prog;
    userState.onboarded = true; // importou com sucesso — libera o resto da extensão
    saveState(); render();
    setSyncStatus(T("import_done", { o: mo, g: mg, total: res.doneChallenge.length }));
    // se o usuário usa a extensão como fonte-verdade pro FUT.GG, já reflete lá
    const mode = (userState.sync || {}).mode;
    if (mode === "to" || mode === "both") syncNow();
  }
  function renderOnboarding() {
    const ob = $("#onboard"); if (!ob) return;
    ob.classList.toggle("hidden", !!userState.onboarded);
  }

  // ---------- combinar + parse ----------
  function allObjectives() {
    const manual = userState.manual || [];
    return scraped.concat(manual).map((o) => {
      const parsed = window.EAFC_PARSER.parse(o);
      const modeKey = (o.mode && o.mode.key) || "unknown";
      // "concluído por grupo": quando a campanha inteira foi marcada como
      // concluída no FUT.GG (ex: você completou "Europa"), todos os objetivos
      // dela contam como feitos — sem precisar marcar um a um.
      parsed.groupDone = !!(userState.groupDone && o.campaignId && userState.groupDone[o.campaignId]);
      parsed.done = !!userState.done[o.id] || parsed.groupDone;
      parsed.skipped = !!userState.skipped[o.id];
      parsed.modeSkipped = !!userState.excludedModes[modeKey];
      parsed.unwanted = parsed.skipped || parsed.modeSkipped;
      parsed.selected = !!userState.included[o.id] && !parsed.done && !parsed.unwanted;
      // desconto de progresso: se o jogo diz que já fiz X de Y, o otimizador
      // conta só o que FALTA (Y-X) em partidas.
      const pr = userState.progress && o.challengeId && userState.progress[o.challengeId];
      if (pr && pr.target > 0 && parsed.parsed) {
        const remaining = Math.max(0, pr.target - pr.cur);
        const pp = parsed.parsed;
        if (pp.matchesNeeded > 0) pp.matchesNeeded = Math.ceil(pp.matchesNeeded * remaining / pr.target);
        pp.count = remaining;
        parsed.progress = { cur: pr.cur, target: pr.target };
      }
      return parsed;
    });
  }
  function daysLeft(end) { if (!end) return null; return Math.ceil((new Date(end).getTime() - Date.now()) / 86400000); }
  function modeLabel(m) { if (!m) return T("player"); return m.key === "any" ? T("any_mode") : (m.label || "Modo"); }
  function nPartidas(n) { return n + " " + (n === 1 ? T("match") : T("matches")); }

  // ativa uma aba (otimizador / objetivos)
  function activateTab(name) {
    document.querySelectorAll(".tab").forEach((t) => t.classList.toggle("active", t.dataset.tab === name));
    document.querySelectorAll(".tabpanel").forEach((p) => p.classList.remove("active"));
    const panel = $("#tab-" + name); if (panel) panel.classList.add("active");
  }
  // pula do otimizador para a aba Objetivos, abre a pasta certa e destaca o item
  function goToObjective(objId, catSlug, groupName) {
    activateTab("list");
    query = ""; const si = $("#search"); if (si) si.value = "";
    const catKey = groupName === "Manual" ? "manual" : (catSlug || "outros");
    userState.open["cat:" + catKey] = true;
    if (groupName) userState.open["camp:" + groupName] = true;
    saveState(); render();
    setTimeout(() => {
      const row = document.getElementById("obj-" + objId);
      if (row) { row.scrollIntoView({ behavior: "smooth", block: "center" }); row.classList.add("flash"); setTimeout(() => row.classList.remove("flash"), 1800); }
    }, 60);
  }

  // Resumo AGREGADO da fase: em vez de listar cada objetivo, resume no essencial
  //  (a) quantas partidas jogar (máximo por modo — objetivos "jogar/vencer N"
  //      se acumulam, então basta o maior); e
  //  (b) a composição de elenco necessária (máximo por nação/liga/posição).
  function phaseSummaryEl(items) {
    const box = el("div", "phase-summary");
    const title = el("div", "phase-summary-title"); title.textContent = "📋 " + T("phase_todo");
    box.appendChild(title);

    // (a) partidas por modo. Quando o modo não é um dos fixos, tenta achar o
    //     contexto no texto (ex: "A Star is Born Cup", "Daily Knockout
    //     Tournament") pra não mostrar um número solto sem modo.
    const ctxLabel = (o) => {
      if (o.mode && o.mode.key && o.mode.key !== "unknown") return { key: o.mode.key, label: modeLabel(o.mode) };
      const m = (o.requirement || "").match(/\bin (?:the )?([A-Z0-9][^.,]*?(?:Cup|Tournament|Championship|Moment|Season \d+[^.,]*))\b/);
      if (m) { const l = m[1].trim(); return { key: "ctx:" + l, label: l }; }
      return { key: "any", label: T("any_mode") };
    };
    const byMode = {};
    for (const o of items) {
      const need = (o.parsed && o.parsed.matchesNeeded) || 0;
      if (need <= 0) continue;
      const c = ctxLabel(o);
      const cur = byMode[c.key] || { key: c.key, label: c.label, matches: 0 };
      cur.matches = Math.max(cur.matches, need);
      byMode[c.key] = cur;
    }
    const chips = Object.values(byMode).filter((m) => m.matches > 0).sort((a, b) => b.matches - a.matches);
    if (chips.length) {
      const line = el("div", "phase-summary-modes");
      chips.forEach((m) => { const c = el("span", "psum-chip"); c.textContent = nPartidas(m.matches) + (m.label ? " · " + m.label : ""); line.appendChild(c); });
      box.appendChild(line);
    }

    // (b) composição do elenco (máximo por demanda)
    const nat = {}, lg = {}, pos = {};
    for (const o of items) {
      const f = (o.parsed && o.parsed.filters) || { leagues: [], nations: [], positions: [] };
      f.nations.forEach((n) => { nat[n.name] = Math.max(nat[n.name] || 0, n.min || 1); });
      f.leagues.forEach((l) => { lg[l.name] = Math.max(lg[l.name] || 0, l.min || 1); });
      f.positions.forEach((p) => { pos[p.name] = Math.max(pos[p.name] || 0, 1); });
    }
    const parts = [];
    Object.keys(nat).forEach((k) => parts.push(nat[k] + "× " + tNat(k)));
    Object.keys(lg).forEach((k) => parts.push(lg[k] + "× " + k));
    Object.keys(pos).forEach((k) => parts.push((pos[k] > 1 ? pos[k] + "× " : "") + k));
    if (parts.length) {
      const sq = el("div", "phase-summary-squad");
      const lb = el("span", "psum-squad-label"); lb.textContent = T("squad_needs") + " ";
      sq.appendChild(lb); sq.appendChild(document.createTextNode(parts.join(" · ")));
      box.appendChild(sq);
    }

    if (!chips.length && !parts.length) {
      const li = el("div", "phase-summary-item"); li.textContent = T("phase_generic");
      box.appendChild(li);
    }
    return box;
  }

  // ---------- OTIMIZADOR ----------
  function renderOptimizer(objs) {
    const active = objs.filter((o) => o.selected);
    if (!active.length) { $("#opt-empty").classList.remove("hidden"); $("#opt-content").classList.add("hidden"); return; }
    $("#opt-empty").classList.add("hidden"); $("#opt-content").classList.remove("hidden");

    const toOpt = objs.map((o) => Object.assign({}, o, { included: o.selected }));
    const r = window.EAFC_OPTIMIZER.optimize(toOpt);
    $("#stat-total").textContent = r.matchPlan.optimizedTotal;
    $("#stat-saved").textContent = r.matchPlan.saved;
    $("#stat-count").textContent = r.count;

    const mp = $("#mode-plan"); mp.innerHTML = "";
    const realModes = r.matchPlan.modes.filter((m) => m.matches > 0);
    if (!realModes.length) { const row = el("div", "mode-row"); row.innerHTML = '<span class="mode-detail">' + T("no_fixed") + "</span>"; mp.appendChild(row); }
    for (const m of realModes) {
      const row = el("div", "mode-row"); const left = el("div");
      const detail = m.note
        ? '<div class="mode-detail">' + T("on_top") + (m.requireWins ? " " + T("win_total_paren", { n: m.requireWins }) : "") + "</div>"
        : (m.requireWins ? '<div class="mode-detail">' + T("must_win") + " " + m.requireWins + "</div>" : '<div class="mode-detail">' + T("play") + "</div>");
      left.innerHTML = '<div class="mode-name">' + modeLabel(m) + "</div>" + detail;
      const badge = el("div", "mode-badge" + (m.requireWins && !m.note ? " wins" : ""));
      badge.textContent = (m.note ? "+" : "") + nPartidas(m.matches);
      row.appendChild(left); row.appendChild(badge); mp.appendChild(row);
    }
    const absorbed = r.matchPlan.modes.find((m) => m.absorbed);
    if (absorbed) {
      const row = el("div", "mode-row");
      row.innerHTML = '<div><div class="mode-name">' + T("any_mode") + '</div><div class="mode-detail">' +
        T("absorbed_detail", { n: absorbed.absorbed }) + '</div></div><div class="mode-badge" style="color:var(--muted)">' + T("free") + "</div>";
      mp.appendChild(row);
    }

    const sq = $("#squad"); sq.innerHTML = "";
    const phases = r.squadPlan.phases || [];
    if (!r.squadPlan.hasConstraints || !phases.length) {
      sq.innerHTML = '<div class="slot free"><div class="slot-title">' + T("no_constraints_title") + '</div><div class="mode-detail">' + T("no_constraints_body") + "</div></div>";
    } else {
      const note = el("div", "squad-note"); note.innerHTML = T("squad_note"); sq.appendChild(note);
      // objetivos sem restrição de elenco vão para a Fase 1
      const constrained = new Set();
      phases.forEach((ph) => ph.slots.forEach((s) => (s.covers || []).forEach((c) => constrained.add(c.id))));
      const unconstrainedIds = active.filter((o) => !constrained.has(o.id)).map((o) => o.id);
      const byId = {}; active.forEach((o) => { byId[o.id] = o; });

      phases.forEach((ph, pi) => {
        const ids = new Set();
        ph.slots.forEach((s) => (s.covers || []).forEach((c) => ids.add(c.id)));
        if (pi === 0) unconstrainedIds.forEach((id) => ids.add(id));
        const idArr = [...ids];

        const h = el("div", "phase-head");
        const left = el("span", "phase-title");
        left.textContent = "🔁 " + T("phase") + " " + (pi + 1) + (phases.length > 1 ? (pi === 0 ? T("build_first") : T("swap_after")) : "");
        const wrap = el("label", "phase-done-wrap"); wrap.title = T("phase_done_title");
        const cb = el("input"); cb.type = "checkbox"; cb.className = "phase-chk";
        cb.checked = idArr.length > 0 && idArr.every((id) => userState.done[id]);
        cb.addEventListener("change", () => setDoneMany(idArr, cb.checked));
        const dl = el("span"); dl.textContent = T("phase_done");
        wrap.appendChild(cb); wrap.appendChild(dl);
        h.appendChild(left); h.appendChild(wrap);
        sq.appendChild(h);
        // resumo da fase (o que fazer), logo acima da lista de jogadores
        const phObjs = idArr.map((id) => byId[id]).filter(Boolean);
        if (phObjs.length) sq.appendChild(phaseSummaryEl(phObjs));
        ph.slots.forEach((s, i) => {
          const d = el("div", "slot");
          const player = [s.position, tNat(s.nation), s.league].filter(Boolean).join(" · ") || T("player");
          const t = el("div", "slot-title"); t.textContent = (i + 1) + ". " + player; d.appendChild(t);
          const covers = s.covers || [];
          if (covers.length) {
            const lbl = el("div", "slot-for"); lbl.textContent = T("completes"); d.appendChild(lbl);
            const seen = new Set(); const uniq = [];
            covers.forEach((c) => { const k = (c.id || "") + c.req; if (!seen.has(k)) { seen.add(k); uniq.push(c); } });
            uniq.slice(0, 4).forEach((c) => {
              const line = el("div", "cover-line clickable");
              // caminho macro › meso: Categoria › Campanha
              const catL = I.catName({ categorySlug: c.categorySlug, category: c.category }, lang());
              const grpL = I.campaignName(c.group || "", lang());
              const path = el("div", "cover-path"); path.textContent = [catL, grpL].filter(Boolean).join(" › ");
              const main = el("div", "cover-main");
              const nm = el("span", "cover-name"); nm.textContent = tReq(c.name || "");
              const ds = el("span", "cover-desc"); ds.textContent = (c.name ? " — " : "") + shortReq(tReq(c.req));
              main.appendChild(nm); main.appendChild(ds);
              line.appendChild(path); line.appendChild(main);
              line.title = T("go_to_obj");
              line.addEventListener("click", () => goToObjective(c.id, c.categorySlug, c.group));
              d.appendChild(line);
            });
            if (uniq.length > 4) { const more = el("div", "cover-line cover-desc"); more.textContent = T("others", { n: uniq.length - 4 }); d.appendChild(more); }
          }
          sq.appendChild(d);
        });
        for (let i = 0; i < ph.freeSlots; i++) {
          const d = el("div", "slot free"); const idx = ph.slots.length + i + 1;
          d.innerHTML = '<div class="slot-title">' + idx + ". " + T("free_slot") + '</div><div class="slot-covers"><span class="tag">' + T("best_cards") + "</span></div>";
          sq.appendChild(d);
        }
      });
    }
    const warn = $("#squad-warn");
    if (phases.length > 1) { warn.classList.remove("hidden"); warn.textContent = T("warn_phases"); }
    else if (r.squadPlan.unmet.length) { warn.classList.remove("hidden"); warn.textContent = T("warn_unmet", { x: r.squadPlan.unmet.join(", ") }); }
    else warn.classList.add("hidden");
  }

  // nº de objetivos que a campanha EXIGE para ser concluída. O FUT.GG traz
  // esse número em groupRequired (ex: "England + Spain" = 5 de 7). Quando é
  // null, exige todos. Limitamos ao que conseguimos extrair, por segurança.
  function groupRequired(items) {
    if (!items.length) return 0;
    const raw = items[0].groupRequired;
    if (raw == null) return items.length;
    return Math.max(1, Math.min(raw, items.length));
  }

  // ---------- LISTA em árvore ----------
  function renderList(objs) {
    const wrap = $("#obj-groups"); wrap.innerHTML = "";
    const q = query.trim().toLowerCase();
    // filtros da lista:
    //  - modo "pulado" some da lista (e o grupo some se ficar vazio)
    //  - "expira em 7d" mostra só objetivos de campanhas que acabam em ≤7d
    let base = objs.filter((o) => !o.modeSkipped);
    if (viewExpiring) base = base.filter((o) => { const dl = daysLeft(o.groupEnd); return dl != null && dl >= 0 && dl <= 7; });
    const filtered = q ? base.filter((o) => (o.name + " " + o.requirement + " " + o.group + " " + (o.category || "") + " " + I.catName(o, lang())).toLowerCase().includes(q)) : base;
    if (!filtered.length) {
      wrap.innerHTML = scraped.length ? '<p class="muted small">' + T("nothing_found", { q: escapeHtml(query) }) + "</p>" : '<p class="muted small">' + T("loading_hint") + "</p>";
      return;
    }
    // categoria (slug) -> campanha -> itens
    const cats = {};
    for (const o of filtered) {
      const key = o.group === "Manual" ? "manual" : (o.categorySlug || "outros");
      const c = cats[key] = cats[key] || { key, display: o.group === "Manual" ? "Manual" : I.catName(o, lang()), camps: {} };
      (c.camps[o.group] = c.camps[o.group] || { name: o.group, end: o.groupEnd, items: [] }).items.push(o);
    }
    const keys = Object.keys(cats).sort((a, b) => {
      const ia = CAT_ORDER.indexOf(a), ib = CAT_ORDER.indexOf(b);
      return (ia < 0 ? 99 : ia) - (ib < 0 ? 99 : ib);
    });
    for (const key of keys) {
      const cat = cats[key];
      const campaigns = Object.values(cat.camps).sort((a, b) => (a.end ? new Date(a.end).getTime() : 1e14) - (b.end ? new Date(b.end).getTime() : 1e14));
      const allItems = campaigns.reduce((acc, c) => acc.concat(c.items), []);
      // completude por CAMPANHA (respeitando "5 de 8"): a macro só está
      // completa quando todas as campanhas dela estão completas.
      let catDone = 0, catReq = 0;
      for (const c of campaigns) {
        const req = groupRequired(c.items);
        catDone += Math.min(c.items.filter((o) => o.done).length, req);
        catReq += req;
      }
      const catComplete = catReq > 0 && catDone >= catReq;
      const catKey = "cat:" + key;
      const catOpen = q ? true : !!userState.open[catKey];

      const catBox = el("div", "cat"); const catHead = el("div", "cat-head" + (catComplete ? " complete" : ""));
      const caret = el("span", "group-caret"); caret.textContent = catOpen ? "▾" : "▸";
      const cname = el("div", "cat-name"); cname.textContent = cat.display;
      const cmeta = el("div", "group-meta");
      cmeta.innerHTML = (catComplete ? '<span class="done-badge">✓ ' + T("complete") + "</span>" : '<span class="count">' + catDone + "/" + catReq + "</span>") + " · " + campaigns.length + " " + T("camps");
      const cacts = el("div", "group-actions");
      const cUse = el("button", "mini use"); cUse.textContent = T("use_category"); cUse.title = T("use_cat_title", { c: cat.display });
      cUse.addEventListener("click", (e) => { e.stopPropagation(); setCampaign(allItems, true); activateTab("opt"); });
      cacts.appendChild(cUse);
      catHead.appendChild(caret); catHead.appendChild(cname); catHead.appendChild(cmeta); catHead.appendChild(cacts);
      catHead.addEventListener("click", () => { userState.open[catKey] = !catOpen; saveState(); render(); });
      catBox.appendChild(catHead);
      if (catOpen) { const b = el("div", "cat-body"); for (const g of campaigns) b.appendChild(campaignBox(g, q)); catBox.appendChild(b); }
      wrap.appendChild(catBox);
    }
  }

  function campaignBox(g, q) {
    const open = q ? true : !!userState.open["camp:" + g.name];
    const req = groupRequired(g.items);
    const done = g.items.filter((o) => o.done).length;
    const complete = g.items.length > 0 && done >= req;
    const box = el("div", "group"); const head = el("div", "group-head" + (complete ? " complete" : ""));
    const caret = el("span", "group-caret"); caret.textContent = open ? "▾" : "▸";
    const name = el("div", "group-name"); name.textContent = I.campaignName(g.name, lang());
    const meta = el("div", "group-meta"); const dl = daysLeft(g.end);
    const expiry = dl != null ? '<span class="group-expiry">' + (dl <= 0 ? T("expires_today") : dl + "d") + "</span> · " : "";
    meta.innerHTML = expiry + (complete ? '<span class="done-badge">✓ ' + T("complete") + "</span>" : '<span class="count">' + Math.min(done, req) + "/" + req + "</span>");
    const acts = el("div", "group-actions");
    const useAll = el("button", "mini use"); useAll.textContent = T("use_all");
    useAll.addEventListener("click", (e) => { e.stopPropagation(); setCampaign(g.items, true); activateTab("opt"); });
    const clr = el("button", "mini"); clr.textContent = T("clear");
    clr.addEventListener("click", (e) => { e.stopPropagation(); setCampaign(g.items, false); });
    acts.appendChild(useAll); acts.appendChild(clr);
    head.appendChild(caret); head.appendChild(name); head.appendChild(meta); head.appendChild(acts);
    head.addEventListener("click", () => { userState.open["camp:" + g.name] = !open; saveState(); render(); });
    box.appendChild(head);
    if (open) {
      const body = el("div", "group-body");
      const grew = (g.items[0] && g.items[0].groupRewards) || [];
      if (grew.length) {
        const rlbl = el("div", "group-rewards-label"); rlbl.textContent = "🏆 " + T("rewards"); body.appendChild(rlbl);
        body.appendChild(rewardsRow(grew));
      }
      g.items.forEach((o) => body.appendChild(objRow(o)));
      box.appendChild(body);
    }
    return box;
  }

  function objRow(o) {
    const card = el("div", "obj" + (o.selected ? " sel" : "") + (o.done ? " done" : "") + (o.unwanted ? " skip" : ""));
    card.id = "obj-" + o.id;
    const top = el("div", "obj-top");
    const chk = el("input"); chk.type = "checkbox"; chk.className = "chk"; chk.checked = o.selected;
    chk.disabled = o.unwanted || o.done;
    chk.title = o.modeSkipped ? T("t_mode_skipped") : o.skipped ? T("t_obj_skipped") : T("t_use_opt");
    chk.addEventListener("change", () => toggle("included", o.id, chk.checked));

    const body = el("div", "obj-req");
    const nameTx = tReq(o.name || "");
    if (o.name && o.name.toLowerCase() !== o.requirement.toLowerCase()) { const nm = el("div", "obj-name"); nm.textContent = nameTx; body.appendChild(nm); }
    const desc = el("div", "obj-desc"); desc.textContent = tReq(o.requirement); body.appendChild(desc);
    const chips = el("div", "obj-chips");
    if (o.mode && (o.mode.label || o.mode.key === "any")) chips.appendChild(tag("tag pos", modeLabel(o.mode)));
    const f = o.parsed.filters;
    f.leagues.forEach((l) => chips.appendChild(tag("tag lg", l.name + (l.min > 1 ? " ×" + l.min : ""))));
    f.nations.forEach((n) => chips.appendChild(tag("tag nat", tNat(n.name) + (n.min > 1 ? " ×" + n.min : ""))));
    f.positions.forEach((p) => chips.appendChild(tag("tag", p.name)));
    if (f.minFromSingleLeague) chips.appendChild(tag("tag lg", T("from1league", { n: f.minFromSingleLeague })));
    if (o.parsed.matchesNeeded > 0) chips.appendChild(tag("tag", "~" + o.parsed.matchesNeeded + " " + T("games")));
    if (o.progress) chips.appendChild(tag("tag prog", "▶ " + o.progress.cur + "/" + o.progress.target + " " + T("in_game")));
    body.appendChild(chips);
    if (o.rewards && o.rewards.length) body.appendChild(rewardsRow(o.rewards));
    if (o.modeSkipped) { const note = el("div", "obj-chips"); note.appendChild(tag("tag", T("mode_skipped_tag") + modeLabel(o.mode))); body.appendChild(note); }

    const actions = el("div", "obj-actions");
    const doneBtn = el("button", "donebtn" + (o.done ? " done" : "")); doneBtn.textContent = o.done ? "✓" : "○";
    doneBtn.title = o.groupDone ? T("t_group_done") : o.done ? T("t_done") : T("t_mark_done");
    if (o.groupDone) doneBtn.disabled = true; // concluído pela campanha inteira no FUT.GG
    else doneBtn.addEventListener("click", () => toggle("done", o.id, !o.done));
    actions.appendChild(doneBtn);
    const skipBtn = el("button", "iconbtn" + (o.skipped ? " on" : "")); skipBtn.textContent = o.skipped ? "🚫" : "🙈";
    skipBtn.title = o.skipped ? T("t_skipped") : T("t_skip");
    skipBtn.addEventListener("click", () => toggleSkip(o.id, !o.skipped)); actions.appendChild(skipBtn);
    if (String(o.id).startsWith("m")) { const del = el("button", "iconbtn"); del.textContent = "🗑"; del.title = T("t_remove"); del.addEventListener("click", () => removeManual(o.id)); actions.appendChild(del); }

    top.appendChild(chk); top.appendChild(body); top.appendChild(actions); card.appendChild(top);
    return card;
  }

  function tag(cls, text) { const c = el("span", cls); c.textContent = text; return c; }
  // rótulo descritivo do prêmio: diz O QUE é (Evo, Jogador, Escolha, Pacote…)
  function rewardLabel(r) {
    const t = r.type, n = r.name || "";
    const isPick = r.pick || (t === "ITEM" && /^\d+\s*of\s*\d+/i.test(n));
    if (isPick) return "🎁 " + T("rwd_pick") + ": " + n;
    if (t === "EVO_UNLOCK") return "🧬 " + T("rwd_evo") + ": " + n;
    if (t === "PLAYER_ITEM" || t === "PLAYER") return "⭐ " + T("rwd_player") + ": " + n;
    if (t === "PACK") return "📦 " + n;
    if (t === "COINS") return "🪙 " + n;
    if (t === "XP") return "✨ " + n;
    if (t === "EVENT_TOKEN") return "🎫 " + n;
    if (t === "CHAMPS_POINTS") return "🏅 " + n;
    return "🎁 " + n;
  }
  function rewardsRow(rewards) {
    const box = el("div", "obj-rewards");
    rewards.forEach((r) => { const c = el("span", "rwd"); c.textContent = rewardLabel(r); box.appendChild(c); });
    return box;
  }
  function shortReq(r) {
    let s = String(r || "")
      .replace(/ in your starting 11| no time titular/ig, "")
      .replace(/ on Min\.[^.,]*|na dificuldade mín\.[^.,]*/ig, "")
      .replace(/ in any (?:Ultimate Team |FUT )?game mode|em qualquer modo/ig, "")
      .replace(/\s*\((?:or|ou) [^)]*\)/ig, "")
      .replace(/\s+([.,;:])/g, "$1").replace(/\s+/g, " ").trim();
    if (s.length > 60) s = s.slice(0, 58) + "…";
    return s;
  }
  function escapeHtml(s) { return String(s).replace(/[&<>"]/g, (m) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[m])); }

  // ---------- ações ----------
  function toggle(kind, id, val) { if (val) userState[kind][id] = true; else delete userState[kind][id]; if (kind === "done") pushDone(id, val); saveState(); render(); }
  function setDoneMany(ids, val) { ids.forEach((id) => { if (val) userState.done[id] = true; else delete userState.done[id]; pushDone(id, val); }); saveState(); render(); }
  function setCampaign(items, on) { for (const o of items) { if (on) { if (!o.unwanted && !o.done) userState.included[o.id] = true; } else delete userState.included[o.id]; } saveState(); render(); }
  function clearSelection() { userState.included = {}; saveState(); render(); }
  function selectExpiring(days) {
    const objs = allObjectives(); let n = 0;
    viewExpiring = true; // filtra a lista para mostrar só o que expira em 7d
    userState.included = {}; // presets substituem a seleção (não acumulam)
    for (const o of objs) { if (o.done || o.unwanted) continue; const dl = daysLeft(o.groupEnd); if (dl != null && dl >= 0 && dl <= days) { userState.included[o.id] = true; n++; } }
    saveState(); render();
    setSource(n ? T("sel_expiring", { n, d: days }) : T("none_expiring", { d: days }));
  }
  function selectAllActive() { const objs = allObjectives(); viewExpiring = false; userState.included = {}; for (const o of objs) if (!o.done && !o.unwanted) userState.included[o.id] = true; saveState(); render(); }
  function toggleSkip(id, val) { if (val) { userState.skipped[id] = true; delete userState.included[id]; } else delete userState.skipped[id]; saveState(); render(); }
  function toggleMode(key) { if (userState.excludedModes[key]) delete userState.excludedModes[key]; else userState.excludedModes[key] = true; saveState(); render(); }
  function renderModesFilter(objs) {
    const wrap = $("#modes-filter"); wrap.innerHTML = "";
    const present = new Set(objs.map((o) => (o.mode && o.mode.key) || "unknown"));
    const chips = CONCRETE_MODES.filter((m) => present.has(m.key) || userState.excludedModes[m.key]);
    if (!chips.length) return;
    const label = el("span", "mf-label"); label.textContent = T("skip_modes"); wrap.appendChild(label);
    for (const m of chips) {
      const off = !!userState.excludedModes[m.key];
      const c = el("span", "mchip" + (off ? " off" : "")); c.textContent = m.label;
      c.title = off ? T("skip_off", { m: m.label }) : T("skip_on", { m: m.label });
      c.addEventListener("click", () => toggleMode(m.key)); wrap.appendChild(c);
    }
  }
  function removeManual(id) { userState.manual = (userState.manual || []).filter((m) => m.id !== id); delete userState.done[id]; delete userState.included[id]; saveState(); render(); }
  function addManual(text) {
    const t = text.trim(); if (!t) return;
    const id = hash(t + Date.now());
    userState.manual = userState.manual || [];
    userState.manual.push({ id, group: "Manual", requirement: t, cardText: t, mode: window.EAFC_EXTRACT.detectMode(t), rewards: [] });
    userState.included[id] = true; userState.open["camp:Manual"] = true; saveState(); render();
  }

  const SYNC_MODES = [["off", "sync_off"], ["to", "sync_to"], ["to_futbin", "sync_futbin"]];
  function renderSyncBar() {
    const wrap = $("#sync-bar"); if (!wrap) return; wrap.innerHTML = "";
    const mode = (userState.sync || {}).mode || "off";
    // título curto
    const title = el("div", "sync-title2"); title.textContent = T("sync_title3");
    wrap.appendChild(title);
    // modos (para onde enviar)
    const modes = el("div", "sync-modes");
    for (const [m, key] of SYNC_MODES) {
      const c = el("span", "mchip" + (mode === m ? " on-mode" : ""));
      c.textContent = T(key);
      c.addEventListener("click", () => { userState.sync = Object.assign({}, userState.sync || {}, { mode: m }); saveState(); render(); });
      modes.appendChild(c);
    }
    wrap.appendChild(modes);
    // botão + explicação breve
    const row = el("div", "sync-row");
    const btn = el("button", "mini use"); btn.textContent = T("sync_now");
    btn.addEventListener("click", syncNow);
    const expl = el("span", "sync-expl"); expl.textContent = T("sync_now_hint");
    row.appendChild(btn); row.appendChild(expl);
    wrap.appendChild(row);
    // status
    const status = el("div", "sync-status"); status.id = "sync-status"; status.textContent = syncStatus || T("sync_hint");
    wrap.appendChild(status);
  }

  // ---------- relatar problema ----------
  function buildDiagnostics(note) {
    const objs = allObjectives();
    const cats = new Set(objs.map((o) => o.categorySlug || "?"));
    let version = "?"; try { version = chrome.runtime.getManifest().version; } catch (_) {}
    return [
      "### Diagnóstico automático",
      "- Versão: " + version,
      "- Idioma: " + lang() + " · Sync: " + ((userState.sync || {}).mode || "off"),
      "- Objetivos carregados: " + scraped.length + " · categorias: " + cats.size,
      "- Com challengeId: " + objs.filter((o) => o.challengeId).length,
      "- Última leitura: " + (lastAutoAt ? new Date(lastAutoAt).toISOString() : "nunca"),
      "- Erros recentes: " + ((window.__EAFC_ERRORS || []).join(" | ") || "nenhum"),
      "",
      "### Descrição do usuário",
      note || "(sem descrição)",
      "",
      "@claude por favor investigue este problema na extensão e proponha um conserto (PR)."
    ].join("\n");
  }
  function sendReport() {
    const note = ($("#report-note") && $("#report-note").value) || "";
    const body = buildDiagnostics(note);
    const title = "[bug] Problema na extensão EAFC (" + new Date().toISOString().slice(0, 10) + ")";
    const repo = (window.EAFC_CONFIG && window.EAFC_CONFIG.repo) || "";
    $("#report-box").classList.add("hidden");
    if ($("#report-note")) $("#report-note").value = "";
    if (repo) {
      const url = "https://github.com/" + repo + "/issues/new?labels=bug&title=" + encodeURIComponent(title) + "&body=" + encodeURIComponent(body);
      chrome.tabs.create({ url });
    } else {
      try { navigator.clipboard.writeText(body); } catch (_) {}
      setSyncStatus(T("report_copied"));
    }
  }

  function render() {
    applyStatic();
    renderOnboarding();
    const objs = allObjectives();
    renderSyncBar();
    renderModesFilter(objs);
    renderOptimizer(objs);
    renderList(objs);
    const n = objs.filter((o) => o.selected).length;
    const badge = $("#sel-badge"); badge.textContent = n; badge.classList.toggle("hidden", n === 0);
    const qw = $("#q-week"), qa = $("#q-all");
    if (qw) qw.classList.toggle("view-on", viewExpiring);
    if (qa) qa.classList.toggle("view-on", !viewExpiring);
  }

  // ---------- eventos ----------
  document.addEventListener("click", (e) => {
    const tabBtn = e.target.closest(".tab");
    if (tabBtn) {
      document.querySelectorAll(".tab").forEach((t) => t.classList.remove("active"));
      document.querySelectorAll(".tabpanel").forEach((p) => p.classList.remove("active"));
      tabBtn.classList.add("active"); $("#tab-" + tabBtn.dataset.tab).classList.add("active");
    }
  });
  $("#onboard-import").addEventListener("click", importFromGame);
  $("#onboard-skip").addEventListener("click", () => { userState.onboarded = true; saveState(); render(); });
  { const rb = $("#reimport-btn"); if (rb) rb.addEventListener("click", importFromGame); }
  { const it = $("#import-top"); if (it) it.addEventListener("click", importFromGame); }
  $("#lang-toggle").addEventListener("click", () => { userState.lang = lang() === "pt" ? "en" : "pt"; saveState(); render(); });
  $("#report-open").addEventListener("click", () => $("#report-box").classList.toggle("hidden"));
  $("#report-cancel").addEventListener("click", () => $("#report-box").classList.add("hidden"));
  $("#report-send").addEventListener("click", sendReport);
  $("#refresh").addEventListener("click", loadObjectives);
  $("#clear-sel").addEventListener("click", clearSelection);
  $("#q-week").addEventListener("click", () => selectExpiring(7));
  $("#q-all").addEventListener("click", selectAllActive);
  $("#search").addEventListener("input", (e) => { query = e.target.value; renderList(allObjectives()); });

  loadState().then(() => {
    render();
    const stale = !lastAutoAt || (Date.now() - lastAutoAt) > STALE_MS;
    if (!scraped.length || stale) loadObjectives();
  });
})();
