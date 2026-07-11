// Converte uma frase-requisito em dados estruturados.
window.EAFC_PARSER = (function () {
  const D = window.EAFC_DATA;

  const NUM = /(\d+)/;
  const GOALS_PER_MATCH = 2;   // estimativa p/ objetivos de "marque N gols" (total)
  const ASSISTS_PER_MATCH = 1.5;

  function num(text, fallback) {
    const m = text.match(NUM);
    return m ? parseInt(m[1], 10) : (fallback == null ? null : fallback);
  }

  const esc = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

  const STOP = /^(goals?|matches?|assists?|wins?|gols?|partidas?|jogos?|vit[óo]rias?)$/i;

  // Quantidade minima de jogadores associada a um termo (nacao/liga).
  // So conta se o numero estiver COLADO ao termo, para nao confundir
  // com "4 goals ..." (contagem de gols) que aparece na mesma frase.
  // Ex: "3 Brazil players"->3 | "5 players from Bundesliga"->5 | "a German player"->1
  function minNear(text, term) {
    const T = esc(term);
    let m;
    // "N [min] <termo>"  (numero direto antes do termo)
    if ((m = text.match(new RegExp("(\\d+)\\s+(?:min\\.?\\s+)?" + T + "\\b", "i")))) return parseInt(m[1], 10);
    // "N players from/of <termo>"
    if ((m = text.match(new RegExp("(\\d+)\\s+players?\\s+(?:from|of|de)\\s+(?:the\\s+)?" + T + "\\b", "i")))) return parseInt(m[1], 10);
    // "N <palavra> <termo>" desde que a palavra do meio nao seja gols/partidas/etc
    if ((m = text.match(new RegExp("(\\d+)\\s+(\\w+)\\s+" + T + "\\b", "i")))) {
      if (!STOP.test(m[2])) return parseInt(m[1], 10);
    }
    return 1;
  }

  function findLeagues(text) {
    const t = text.toLowerCase();
    const out = [];
    for (const lg of D.LEAGUES) {
      for (const a of lg.aliases) {
        if (t.includes(a)) {
          out.push({ id: lg.id, name: lg.name, min: minNear(text, a) });
          break;
        }
      }
    }
    return out;
  }

  function findNations(text) {
    const out = [];
    const seen = new Set();
    const terms = D.NATIONS.concat(D.NATION_ADJ);
    for (const n of terms) {
      const re = new RegExp("\\b" + esc(n) + "\\b", "i");
      if (re.test(text)) {
        const canon = D.NATION_CANON[n.toLowerCase()] || n;
        if (!seen.has(canon)) {
          seen.add(canon);
          out.push({ name: canon, min: minNear(text, n) });
        }
      }
    }
    return out;
  }

  function findPositions(text) {
    const t = text.toLowerCase();
    const out = [];
    for (const p of D.POSITIONS) {
      for (const a of p.aliases) {
        const re = new RegExp("\\b" + a.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + "\\b", "i");
        if (re.test(t)) { out.push({ id: p.id, name: p.name }); break; }
      }
    }
    return out;
  }

  function detectAction(text) {
    if (/\b(win|ven[cç]a|ganhe)\b/i.test(text)) return "win";
    if (/\b(play|jogue)\b/i.test(text)) return "play";
    if (/\b(score|marque)\b/i.test(text)) return "score";
    if (/\b(assist|assist[êe]ncia)\b/i.test(text)) return "assist";
    if (/\b(concede|conceded|conceding|clean sheet|shut ?out|sofra)\b/i.test(text)) return "defend";
    if (/\b(reach|qualify|advance|chegue|alcance|avance)\b/i.test(text)) return "reach";
    return "other";
  }
  // nº de partidas citado em "in N matches/games" (ignora o "N gols" da frase)
  function matchesInText(text) {
    const m = text.match(/\bin\s+(\d+)\s+(?:separate |different )?(?:matches|games)\b|\bem\s+(\d+)\s+partidas\b/i);
    return m ? parseInt(m[1] || m[2], 10) : null;
  }

  // quantas partidas esse requisito, sozinho, obriga a jogar
  function estimateMatches(metric, count) {
    switch (metric) {
      case "play": return count || 0;
      case "wins": return count || 0;
      case "goals-separate-matches": return count || 0;
      case "goals-single-match": return 1;
      case "goals-total": return Math.max(1, Math.ceil((count || 1) / GOALS_PER_MATCH));
      case "assists-total": return Math.max(1, Math.ceil((count || 1) / ASSISTS_PER_MATCH));
      case "per-match-condition": return 0; // "em cada partida": cumprido enquanto joga
      default: return 0;
    }
  }

  function classify(text) {
    const t = text.toLowerCase();
    const action = detectAction(text);

    let metric = "other";
    let count = num(text, null);

    if (action === "play") { metric = "play"; }
    else if (action === "win") { metric = "wins"; }
    else if (action === "defend") {
      // clean sheet / "sofrer X gols ou menos EM N partidas" = jogar N partidas
      metric = "play";
      count = matchesInText(text) || (/single|one match|única|mesma partida/i.test(t) ? 1 : (count || 1));
    } else if (action === "reach") {
      // progressão de torneio: joga-se partidas até a fase; estima pela fase/rodada
      metric = "play";
      count = matchesInText(text) || count || 3;
    } else if (action === "assist") {
      if (/in every match|em cada partida/i.test(t)) metric = "per-match-condition";
      else metric = "assists-total";
    } else if (action === "score") {
      if (/in every match|em cada partida/i.test(t)) metric = "per-match-condition";
      else if (/in (a )?(single|one) match|numa (mesma|única) partida|em uma (?:mesma|única) partida/i.test(t)) metric = "goals-single-match";
      else if (/separate matches|(diferentes|separadas) partidas|partidas (diferentes|separadas)/i.test(t)) metric = "goals-separate-matches";
      else metric = "goals-total";
    }

    return { action, metric, count };
  }

  function parse(objective) {
    const text = objective.requirement || "";
    const { action, metric, count } = classify(text);

    const leagues = findLeagues(text);
    const nations = findNations(text);
    const positions = findPositions(text);

    // "min N players from a single league" / "N jogadores de uma mesma liga"
    let minFromSingleLeague = null;
    const mSingle = text.match(/(\d+)\s*(?:min\.?\s*)?players?\s*from\s*(?:a\s*)?single\s*league|(\d+)\s*jogadores?\s*de\s*uma\s*(?:mesma|única)\s*liga/i);
    if (mSingle) minFromSingleLeague = parseInt(mSingle[1] || mSingle[2], 10);

    return Object.assign({}, objective, {
      parsed: {
        action,
        metric,
        count,
        matchesNeeded: estimateMatches(metric, count),
        filters: {
          leagues: leagues.map((l) => ({ id: l.id, name: l.name, min: l.min || 1 })),
          nations: nations.map((n) => ({ name: n.name, min: n.min || 1 })),
          positions: positions.map((p) => ({ id: p.id, name: p.name, min: 1 })),
          minFromSingleLeague
        }
      }
    });
  }

  return { parse };
})();
