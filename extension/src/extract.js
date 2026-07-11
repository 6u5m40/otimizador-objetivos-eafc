// ==========================================================================
//  Extração dos objetivos do FUT.GG — por IDs (robusto).
//  O payload embutido liga: TAREFA (groupEaId) -> CAMPANHA (id, categoryEaId)
//  -> CATEGORIA (eaId). Assim montamos a hierarquia:
//     Categoria (macro)  ->  Campanha (meso)  ->  Objetivo (micro: nome+descrição)
//  Usado pelo content script e pelo painel.
// ==========================================================================
(function () {
  "use strict";

  const MODES = [
    [/squad battles/i, "squad-battles", "Squad Battles"],
    [/\brush\b/i, "rush", "Rush"],
    [/(division )?rivals/i, "rivals", "Rivals"],
    [/champions|champs|fut champions/i, "champions", "Champions"],
    [/live events?|festival of football/i, "live-events", "Live Events"],
    [/friendlies|amistoso/i, "friendlies", "Friendlies"],
    [/\bdraft\b/i, "draft", "Draft"],
    [/any (?:ultimate team )?(?:game )?mode|qualquer modo/i, "any", "Qualquer modo"]
  ];
  function detectMode(text) {
    for (const [re, key, label] of MODES) if (re.test(text)) return { key, label };
    return { key: "unknown", label: "" };
  }

  function unescapeStr(s) {
    return s
      .replace(/\\u([0-9a-fA-F]{4})/g, (_, h) => String.fromCharCode(parseInt(h, 16)))
      .replace(/\\"/g, '"')
      .replace(/\\\\/g, "\\")
      .replace(/\\n/g, " ")
      .replace(/\s+/g, " ")
      .trim();
  }
  function hash(str) {
    let h = 0;
    for (let i = 0; i < str.length; i++) { h = (h << 5) - h + str.charCodeAt(i); h |= 0; }
    return "o" + Math.abs(h).toString(36);
  }

  // recompensas: cada prêmio no payload tem type:"..",name:".." (ex:
  // COINS/PACK/XP/EVO_UNLOCK/EVENT_TOKEN/PLAYER_ITEM). Extrai de uma janela.
  // captura isPlayerPick (quando presente) + type + name de cada prêmio
  const RRE = /(?:isPlayerPick:(!0|!1),)?type:"([A-Z_]+)",name:"((?:[^"\\]|\\.)*)"/g;
  function parseRewards(win) {
    const out = []; RRE.lastIndex = 0; let rm;
    while ((rm = RRE.exec(win))) {
      const pick = rm[1] === "!0";
      const type = rm[2]; const name = unescapeStr(rm[3]);
      if (!name || /^Award$/i.test(name)) continue; // genérico/sem descrição
      out.push({ type, name, pick });
      if (out.length >= 10) break;
    }
    return out;
  }

  const REQ = /\b(Play|Win|Score|Assist|Complete|Earn|Provide|Reach|Register|Hold|Make|Get)\b/i;
  function isRequirement(s) {
    if (/^Contains /i.test(s)) return false;
    if (!REQ.test(s)) return false;
    return /\d/.test(s) || /in every match|em cada partida/i.test(s);
  }

  // "De partida" (match) = concluído JOGANDO: jogar/vencer/empatar/marcar/
  //  assistência/SOFRER gols/clean sheet/pênalti/etc.
  // "Demais" (other) = fora da gameplay: mercado (comprar/vender/listar),
  //  química, formação, renomear clube, abrir pacote, SBC, resgatar, meta.
  const GAMEPLAY = /\b(play|played|playing|win|won|winning|draw|drawn|lose|lost|score|scored|scoring|goals?|assists?|assisted|assisting|concede|conceded|conceding|clean sheet|shut ?out|penalt\w*|matches?|games?)\b/i;
  const NONPLAY = /\b(buy|bought|buying|sell|sold|selling|list|listed|listing|listings|transfer market|apply|applied|applying|chemistry style|consumable|formation|rename|club name|open (?:a |\d+ )?pack|packs?|redeem|redeemed|squad building challenge|\bsbc\b|discard|quick[- ]?sell|acquire|purchase|log ?in|sign ?in|claim)\b/i;
  function isMatchObjective(s) {
    if (NONPLAY.test(s)) return false; // ação fora da gameplay
    return GAMEPLAY.test(s);           // menciona jogar/vencer/gols/sofrer/etc.
  }

  // Slugs das categorias reais (as abas do site). Evita confundir com
  // nações/ligas, que também têm eaId+slug+name no payload.
  const CATEGORY_SLUGS = new Set([
    "seasonal", "campaign", "campaigns", "live-events", "journey-of-nations",
    "north-america", "asia-oceania", "africa", "south-america", "europe",
    "milestones", "fc-pro", "challengers", "foundations"
  ]);


  const CAT_RE = /eaId:(\d+),slug:"([a-z][a-z0-9-]*)",name:"([^"\\]*)"/g;
  const CAMP_RE = /slug:"(\d+)-[^"]*",name:"((?:[^"\\]|\\.)*)",categoryEaId:(\d+),description:"(?:[^"\\]|\\.)*",startTime:(?:"[^"]*"|null),endTime:(?:"([^"]*)"|null)/g;
  const TASK_RE = /groupEaId:(\d+),(?:eaId:(\d+),)?name:"((?:[^"\\]|\\.)*)",description:"((?:[^"\\]|\\.)*)"/g;

  function fromHtml(html, opts) {
    opts = opts || {};
    const nowMs = opts.nowMs || 0;
    let m;

    // categorias (só as reais)
    const cats = {};
    CAT_RE.lastIndex = 0;
    while ((m = CAT_RE.exec(html))) if (CATEGORY_SLUGS.has(m[2])) cats[m[1]] = { name: unescapeStr(m[3]), slug: m[2] };

    // campanhas por id
    // Além de nome/categoria/prazo, capturamos quantos objetivos a campanha
    // EXIGE para ser concluída: o FUT.GG traz `objectivesCompletionCount`
    // (ex: 5 de 8). Quando é null, exige TODOS (usamos tasksCount como total).
    const camps = {};
    CAMP_RE.lastIndex = 0;
    while ((m = CAMP_RE.exec(html))) {
      // janela curta após o início da campanha p/ achar os contadores
      // (ficam logo depois de endTime, antes do array grande de prêmios).
      const win = html.slice(m.index, m.index + 1400);
      const tc = win.match(/,tasksCount:(\d+)/);
      const cc = win.match(/,objectivesCompletionCount:(null|\d+)/);
      const total = tc ? parseInt(tc[1], 10) : 0;
      const required = cc && cc[1] !== "null" ? parseInt(cc[1], 10) : null; // null = exige todos
      // recompensas da campanha: do objectivesCompletionCount até ",category:"
      const ccAt = html.indexOf("objectivesCompletionCount:", m.index);
      const catAt = html.indexOf(",category:", ccAt >= 0 ? ccAt : m.index);
      const cStart = ccAt >= 0 ? ccAt : m.index;
      const cEnd = catAt === -1 ? cStart + 3000 : Math.min(catAt, cStart + 3000);
      const rewards = parseRewards(html.slice(cStart, cEnd));
      camps[m[1]] = { name: unescapeStr(m[2]), catId: m[3], end: m[4] || null, total, required, rewards };
    }

    // tarefas -> objetivos, ligando à campanha e categoria
    const objectives = [];
    const seen = new Set();
    TASK_RE.lastIndex = 0;
    while ((m = TASK_RE.exec(html))) {
      const challengeId = m[2] ? parseInt(m[2], 10) : null; // eaId da tarefa (p/ sincronizar com FUT.GG)
      const desc = unescapeStr(m[4]);
      if (/^Contains /i.test(desc)) continue;   // texto de recompensa, não é objetivo
      const isMatch = isMatchObjective(desc);
      // objetivos "demais" (fora da gameplay) só entram se tiverem challengeId
      // (pra dar pra sincronizar); os "de partida" entram sempre.
      if (!isMatch && challengeId == null) continue;
      const camp = camps[m[1]];
      if (!camp) continue;
      if (nowMs && camp.end && new Date(camp.end).getTime() <= nowMs) continue; // expirada
      const id = hash(m[1] + "|" + desc);
      if (seen.has(id)) continue;
      seen.add(id);
      // recompensas do objetivo: da description até a próxima tarefa
      const awStart = m.index + m[0].length;
      const nextTask = html.indexOf("groupEaId:", awStart);
      const awEnd = nextTask === -1 ? awStart + 2500 : Math.min(nextTask, awStart + 2500);
      const objRewards = parseRewards(html.slice(awStart, awEnd));
      const catObj = cats[camp.catId];
      objectives.push({
        id,
        challengeId,               // eaId da tarefa no FUT.GG
        campaignId: parseInt(m[1], 10),
        kind: isMatch ? "match" : "other", // de partida x demais
        category: catObj ? catObj.name : "Outros",   // nome em inglês (original)
        categorySlug: catObj ? catObj.slug : "outros",
        group: camp.name,          // campanha (meso)
        groupEnd: camp.end,
        groupRequired: camp.required, // nº de objetivos exigidos (null = todos)
        groupTotal: camp.total,       // total de tarefas da campanha no FUT.GG
        groupRewards: camp.rewards || [], // recompensas da campanha (meso)
        name: unescapeStr(m[3]),   // nome curto (micro)
        requirement: desc,         // descrição
        cardText: desc,
        mode: detectMode(desc),
        rewards: objRewards        // recompensas do objetivo (micro)
      });
    }
    return objectives;
  }

  window.EAFC_EXTRACT = { fromHtml, detectMode };
})();
