#!/usr/bin/env node
// ==========================================================================
//  Health check da extensão Otimizador de Objetivos EAFC.
//  Verifica se os parsers ainda batem com o FUT.GG e se a API de
//  sincronização ainda existe. Roda no GitHub Actions (agendado) ou local.
//
//  Uso:
//    node tools/healthcheck.mjs            -> busca o FUT.GG ao vivo
//    node tools/healthcheck.mjs arquivo.html  -> testa contra um HTML salvo
//
//  Sai com código 0 se tudo OK, 1 se algo quebrou. Sempre escreve
//  diagnostics.md com o resultado (usado pela Action para abrir a issue).
// ==========================================================================
import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");
const OBJ_URL = "https://www.fut.gg/objectives/";

// limites mínimos esperados (se cair abaixo, algo quebrou no parser)
const MIN_OBJECTIVES = 80;
const MIN_CATEGORIES = 6;
const MIN_CHALLENGE_RATIO = 0.8;

function loadExtract() {
  const code = readFileSync(join(ROOT, "extension", "src", "extract.js"), "utf8");
  const sandbox = { window: {} };
  new Function("window", code)(sandbox.window);
  return sandbox.window.EAFC_EXTRACT;
}

async function getHtml() {
  const arg = process.argv[2];
  if (arg) return { html: readFileSync(arg, "utf8"), live: false };
  const r = await fetch(OBJ_URL, { headers: { "user-agent": "eafc-healthcheck" } });
  if (!r.ok) throw new Error("fetch " + OBJ_URL + " -> HTTP " + r.status);
  return { html: await r.text(), live: true };
}

// A API de sync deve EXISTIR (responder 401/403 sem auth), não 404.
async function checkSyncApi() {
  const results = {};
  try {
    const r = await fetch("https://www.fut.gg/api/fut/gg-club/", { headers: { accept: "application/json" } });
    results.read = r.status;
  } catch (e) { results.read = "err:" + e.message; }
  try {
    const r = await fetch("https://www.fut.gg/api/fut/gg-club/completions/create/", {
      method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ objectType: "OBJECTIVE_CHALLENGE", objectId: 1 })
    });
    results.write = r.status;
  } catch (e) { results.write = "err:" + e.message; }
  return results;
}

function ok(v) { return v === 401 || v === 403; } // existe mas exige auth

async function main() {
  const problems = [];
  const info = [];
  let live = false;

  let objectives = [];
  try {
    const EX = loadExtract();
    const got = await getHtml();
    live = got.live;
    objectives = EX.fromHtml(got.html, { nowMs: Date.now() });
  } catch (e) {
    problems.push("Falha ao buscar/parsear objetivos: " + e.message);
  }

  const cats = new Set(objectives.map((o) => o.categorySlug));
  const withId = objectives.filter((o) => o.challengeId).length;
  const ratio = objectives.length ? withId / objectives.length : 0;
  // campanhas com requisito parcial ("X de Y") — depende de objectivesCompletionCount
  const withReq = objectives.filter((o) => typeof o.groupRequired === "number").length;

  info.push("- Objetivos extraídos: " + objectives.length + " (mín " + MIN_OBJECTIVES + ")");
  info.push("- Categorias: " + cats.size + " (mín " + MIN_CATEGORIES + ")");
  info.push("- Com challengeId: " + withId + " (" + Math.round(ratio * 100) + "%, mín " + Math.round(MIN_CHALLENGE_RATIO * 100) + "%)");
  info.push("- Objetivos com requisito parcial (X de Y): " + withReq);

  if (objectives.length < MIN_OBJECTIVES) problems.push("Poucos objetivos extraídos (" + objectives.length + ") — o padrão de tarefa/campanha do FUT.GG pode ter mudado (extract.js).");
  if (cats.size < MIN_CATEGORIES) problems.push("Poucas categorias (" + cats.size + ") — o padrão de categoria mudou (CAT_RE / CATEGORY_SLUGS).");
  if (ratio < MIN_CHALLENGE_RATIO) problems.push("Muitos objetivos sem challengeId (" + Math.round(ratio * 100) + "%) — o campo eaId da tarefa mudou (TASK_RE). A sincronização depende disso.");
  if (objectives.length >= MIN_OBJECTIVES && withReq === 0) problems.push("Nenhuma campanha com requisito parcial (X de Y) — o campo objectivesCompletionCount/tasksCount mudou (CAMP_RE em extract.js). A conclusão parcial de pastas depende disso.");

  // API de sync (só ao vivo)
  if (live) {
    const api = await checkSyncApi();
    info.push("- API leitura /api/fut/gg-club/: HTTP " + api.read);
    info.push("- API escrita /completions/create/: HTTP " + api.write);
    if (api.read === 404) problems.push("Endpoint de leitura da sync sumiu (404) — /api/fut/gg-club/ mudou (content.js syncRead).");
    if (api.write === 404) problems.push("Endpoint de escrita da sync sumiu (404) — /completions/create/ mudou (content.js syncWrite).");
    if (!ok(api.read) && api.read !== 404 && api.read !== 200) info.push("  (aviso: leitura respondeu " + api.read + ", esperado 401/403)");
  }

  const status = problems.length ? "❌ QUEBROU" : "✅ OK";
  const md = [
    "# Health check EAFC — " + status,
    "",
    "Data: " + new Date().toISOString() + (live ? " (FUT.GG ao vivo)" : " (arquivo local)"),
    "",
    "## Métricas",
    ...info,
    "",
    problems.length ? "## Problemas detectados" : "## Sem problemas",
    ...(problems.length ? problems.map((p) => "- " + p) : ["Tudo dentro do esperado."]),
    "",
    problems.length ? "@claude o health check da extensão falhou. Investigue os pontos acima (provavelmente os regex em `extension/src/extract.js` ou os endpoints em `extension/src/content.js`), conserte, rode `node tools/healthcheck.mjs` até passar, e abra um PR." : ""
  ].join("\n");

  writeFileSync(join(ROOT, "diagnostics.md"), md);
  console.log(md);
  process.exit(problems.length ? 1 : 0);
}

main().catch((e) => {
  const md = "# Health check EAFC — ❌ ERRO\n\n" + String(e && e.stack || e) + "\n\n@claude o health check estourou uma exceção. Investigue e conserte.";
  try { writeFileSync(join(ROOT, "diagnostics.md"), md); } catch (_) {}
  console.error(md);
  process.exit(1);
});
