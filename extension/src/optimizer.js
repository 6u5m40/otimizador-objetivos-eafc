// Otimizador global: recebe objetivos parseados e devolve
//  (a) o plano de partidas no MENOR número possível de jogos, e
//  (b) o(s) time(s) titular(es) — em fases, se não couber tudo em 11.
window.EAFC_OPTIMIZER = (function () {
  const SQUAD_SLOTS = 11;
  const MAX_PHASES = 4;

  // ---- 1) Plano de partidas -----------------------------------------------
  // Chave: objetivos "in any mode" NÃO somam partidas próprias — eles pegam
  // carona nas partidas dos modos fixos que você já vai jogar.
  function matchPlan(objectives) {
    const fixed = {}; // key -> {label, matches, requireWins}
    let anyMatches = 0, anyWins = 0;
    let naiveSum = 0;

    for (const o of objectives) {
      const p = o.parsed;
      const need = p.matchesNeeded || 0;
      naiveSum += need;
      if (need <= 0) continue;
      const key = (o.mode && o.mode.key) || "unknown";
      const isAny = key === "any" || key === "unknown";
      if (isAny) {
        anyMatches = Math.max(anyMatches, need);
        if (p.metric === "wins") anyWins = Math.max(anyWins, p.count || 0);
      } else {
        const label = (o.mode && o.mode.label) || "Modo";
        if (!fixed[key]) fixed[key] = { key, label, matches: 0, requireWins: 0 };
        fixed[key].matches = Math.max(fixed[key].matches, need);
        if (p.metric === "wins") fixed[key].requireWins = Math.max(fixed[key].requireWins, p.count || 0);
      }
    }

    const fixedModes = Object.values(fixed).sort((a, b) => b.matches - a.matches);
    const F = fixedModes.reduce((s, m) => s + m.matches, 0);
    // "qualquer modo" só adiciona partidas se exigir mais do que os modos fixos já cobrem
    const extraAny = Math.max(0, anyMatches - F);
    const modes = fixedModes.slice();
    if (extraAny > 0) {
      modes.push({ key: "any", label: "Qualquer modo", matches: extraAny, requireWins: anyWins, note: true });
    } else if (anyMatches > 0) {
      // absorvido: mostra como aviso informativo, sem somar
      modes.push({ key: "any", label: "Qualquer modo", matches: 0, requireWins: 0, absorbed: anyMatches });
    }

    const optimizedTotal = F + extraAny;
    return { modes, optimizedTotal, naiveSum, saved: Math.max(0, naiveSum - optimizedTotal) };
  }

  // ---- 2) Demandas de elenco ----------------------------------------------
  // Cada demanda guarda os objetivos que a originaram (para mostrar no card
  // "qual objetivo esse jogador conclui").
  function buildDemands(objectives) {
    const leagues = {}, nations = {}, positions = {};
    let minSingleLeague = 0, hasAny = false;
    const singleObjs = [];

    const src = (o) => ({ id: o.id, name: o.name, req: o.requirement, group: o.group, category: o.category, categorySlug: o.categorySlug });
    const add = (map, key, name, min, o) => {
      const d = map[key] = map[key] || { name, need: 0, objs: [] };
      d.need = Math.max(d.need, min);
      d.objs.push(src(o));
    };

    for (const o of objectives) {
      const f = o.parsed.filters;
      for (const l of f.leagues) { add(leagues, l.id, l.name, l.min || 1, o); hasAny = true; }
      for (const n of f.nations) { add(nations, n.name, n.name, n.min || 1, o); hasAny = true; }
      for (const p of f.positions) { add(positions, p.id, p.name, 1, o); hasAny = true; }
      if (f.minFromSingleLeague) { minSingleLeague = Math.max(minSingleLeague, f.minFromSingleLeague); singleObjs.push(o); hasAny = true; }
    }

    if (minSingleLeague > 0) {
      const ids = Object.keys(leagues);
      if (ids.length) {
        let top = ids[0];
        for (const id of ids) if (leagues[id].need > leagues[top].need) top = id;
        leagues[top].need = Math.max(leagues[top].need, minSingleLeague);
        singleObjs.forEach((o) => leagues[top].objs.push(src(o)));
      } else {
        leagues["__single"] = { name: "uma liga à sua escolha", need: minSingleLeague, objs: singleObjs.map(src) };
      }
    }

    const toArr = (map, kind) => Object.values(map).map((v) => ({ kind, label: v.name, remaining: v.need, objs: v.objs }));
    return { dL: toArr(leagues, "Liga"), dN: toArr(nations, "Nação"), dP: toArr(positions, "Posição"), hasAny };
  }

  function pickMost(arr) {
    let best = null;
    for (const d of arr) if (d.remaining > 0 && (!best || d.remaining > best.remaining)) best = d;
    return best;
  }
  function anyRemaining(dL, dN, dP) { return [dL, dN, dP].some((a) => a.some((d) => d.remaining > 0)); }

  function fillPhase(dL, dN, dP) {
    const slots = [];
    while (anyRemaining(dL, dN, dP) && slots.length < SQUAD_SLOTS) {
      const l = pickMost(dL); if (l) l.remaining--;
      const n = pickMost(dN); if (n) n.remaining--;
      const p = pickMost(dP); if (p) p.remaining--;
      if (!l && !n && !p) break;
      // objetivos que este jogador ajuda a concluir
      const covers = [], seen = new Set();
      [l, n, p].forEach((d) => { if (d) d.objs.forEach((x) => { const k = x.id + "|" + x.req; if (!seen.has(k)) { seen.add(k); covers.push(x); } }); });
      slots.push({ league: l ? l.label : null, nation: n ? n.label : null, position: p ? p.label : null, covers });
    }
    return { slots, freeSlots: Math.max(0, SQUAD_SLOTS - slots.length) };
  }

  // ---- 3) Time(s) em fases ------------------------------------------------
  function squadPlan(objectives) {
    const { dL, dN, dP, hasAny } = buildDemands(objectives);
    const phases = [];
    let guard = 0;
    while (anyRemaining(dL, dN, dP) && guard < MAX_PHASES) { phases.push(fillPhase(dL, dN, dP)); guard++; }

    const unmet = [];
    for (const a of [dL, dN, dP]) for (const d of a) if (d.remaining > 0) unmet.push(d.kind + ": " + d.label + " (faltam " + d.remaining + ")");

    return { phases, unmet, hasConstraints: hasAny };
  }

  function optimize(objectives) {
    const active = objectives.filter((o) => o && o.parsed && o.included !== false);
    return { count: active.length, matchPlan: matchPlan(active), squadPlan: squadPlan(active) };
  }

  return { optimize };
})();
