// ==========================================================================
//  Idiomas (EN/PT) da extensão.
//  - Categorias: termos OFICIAIS da EA (help.ea.com/pt-br).
//  - Interface: dicionário abaixo.
//  - Descrições/nomes dos objetivos: FUT.GG só fornece em inglês, então
//    traduzimos por REGRAS (os textos do EA FC são padronizados). Roda toda vez
//    que exibe, então a tradução se re-aplica a cada atualização dos objetivos.
// ==========================================================================
window.EAFC_I18N = (function () {
  "use strict";

  // Categorias — termos oficiais EA PT-BR (por slug, estável)
  const CAT_PT = {
    "seasonal": "Temporada", "campaign": "Campanha", "campaigns": "Campanhas",
    "live-events": "Eventos ao Vivo", "journey-of-nations": "Jornada dos Países",
    "north-america": "América do Norte", "asia-oceania": "Ásia e Oceania",
    "africa": "África", "south-america": "América do Sul", "europe": "Europa",
    "milestones": "Marcos", "fc-pro": "FC Pro", "challengers": "Desafiantes",
    "foundations": "Fundamentos"
  };

  const UI = {
    pt: {
      optimizer: "🎯 Otimizador", objectives: "📋 Objetivos",
      opt_empty_title: "Nenhum objetivo selecionado.",
      opt_empty_body: 'Vá na aba <b>Objetivos</b> e clique em <b>“usar todos”</b> numa campanha, em <b>“⏳ expira em 7d”</b>, ou marque objetivos soltos para calcular o plano.',
      stat_total: "partidas p/ concluir", stat_saved: "partidas economizadas", stat_count: "objetivos ativos",
      h_plan: "Plano de partidas", h_squad: "Sugestão dos 11 titulares",
      squad_help: "Monte estes 11 no início da partida. Depois de começar, pause e troque até 5 por suas melhores cartas — os objetivos contam o time inicial.",
      squad_note: 'Cada card é <b>1 jogador</b>. O título é o <b>tipo de carta</b> (ex: “Argentina · Bundesliga” = um argentino que jogue na Bundesliga) e as tags são <b>os objetivos que ele conclui</b> de uma vez.',
      filter_ph: "🔎 filtrar (ex: Brasil, Rush, Bundesliga)",
      manual_ph: "+ objetivo manual (ex: Vença 5 no Rush com 3 do Brasil)",
      q_week: "⏳ expira em 7d", q_all: "todos ativos", q_clear: "limpar seleção",
      skip_modes: "pular modos:",
      footer_refresh: "↻ atualizar agora", footer_note: " · dados lidos localmente, nada sai do seu navegador",
      no_fixed: "Os objetivos escolhidos não exigem número fixo de partidas.",
      must_win: "precisa vencer", play: "jogar",
      on_top: "além das partidas de cima", win_total_paren: "(vença {n} no total)",
      absorbed_detail: "{n} partida(s) — feitas junto com as de cima", free: "incluído",
      reimport: "🎮 reimportar", reimport_title: "Reimportar e manter os mesmos objetivos selecionados",
      any_mode: "Qualquer modo", match: "partida", matches: "partidas",
      completes: "conclui:", phase: "Fase", build_first: " (monte primeiro)", swap_after: " (troque o time depois)",
      phase_done: "concluí a fase", phase_done_title: "Marca todos os objetivos desta fase como concluídos",
      phase_todo: "O que fazer nesta fase",
      squad_needs: "Elenco:", phase_generic: "Só jogar partidas (sem exigência de elenco).",
      complete: "Completo",
      free_slot: "Vaga livre", best_cards: "suas melhores cartas", player: "Jogador", others: "+{n} outros",
      go_to_obj: "abrir na aba Objetivos",
      match_objs: "Objetivos de partida", other_objs: "Demais objetivos",
      kind_show: "mostrar:", kind_all: "Todos", rewards: "Recompensas da campanha",
      rwd_evo: "Evolução", rwd_player: "Jogador", rwd_pick: "Escolha (Player Pick)",
      in_game: "no jogo",
      no_constraints_title: "Sem restrição de elenco",
      no_constraints_body: "Os objetivos escolhidos não pedem ligas/nações específicas — use seu melhor time.",
      warn_phases: "ℹ Os objetivos selecionados não cabem num time só. Faça a Fase 1, depois troque para a Fase 2 — algumas partidas serão repetidas com o segundo time.",
      warn_unmet: "⚠ Faltou cobrir: {x}.",
      use_category: "🎯 montar otimizador", use_all: "🎯 montar otimizador", clear: "limpar", camps: "camp.",
      expires_today: "expira hoje",
      nothing_found: "Nada encontrado para “{q}”.",
      loading_hint: "Carregando objetivos do FUT.GG… se não aparecer, clique em “↻ atualizar agora” no rodapé.",
      t_use_opt: "Usar no otimizador", t_mode_skipped: "Modo pulado", t_obj_skipped: "Objetivo ignorado",
      t_mark_done: "Marcar como concluído", t_done: "Concluído (clique p/ desmarcar)", t_group_done: "Concluído: a campanha inteira já foi concluída no FUT.GG",
      t_skip: "Não quero fazer este", t_skipped: "Ignorado (clique p/ voltar)", t_remove: "Remover",
      mode_skipped_tag: "modo pulado: ",
      games: "jogos", from1league: "≥{n} de 1 liga",
      skip_off: "Clique para voltar a considerar {m}", skip_on: "Clique para pular todos os objetivos de {m}",
      use_cat_title: "Monta o otimizador com o que falta em {c}",
      loading: "Carregando…", read_fail: "Não consegui ler. Abra o FUT.GG numa aba e tente de novo.",
      objs_source: "{n} objetivos · FUT.GG",
      sel_expiring: "{n} objetivos que expiram em {d}d selecionados", none_expiring: "Nenhum objetivo (não pulado) expira em {d}d",
      sync_title: "Sincronizar com FUT.GG", sync_now: "sincronizar agora",
      import_game: "🎮 Importar do Jogo", import_game_title: "Importa o que está concluído NO JOGO, lendo o Web App oficial da EA (você precisa estar logado no Web App numa aba).",
      sync_title3: "Enviar minhas conclusões para:", sync_now_hint: "envia o que está concluído aqui para o site marcado acima",
      onboard_title: "Primeiro: importe o seu progresso do jogo",
      onboard_lead: "Antes de montar times, importe o que você já concluiu no jogo — assim a extensão começa com o seu progresso real, sem recomeçar do zero.",
      onboard_step1: "Clique no botão abaixo. Vou abrir o EA FC Web App da EA.",
      onboard_step2: "Faça login e espere o seu clube carregar.",
      onboard_step3: "Volte aqui e clique de novo em Importar do jogo.",
      onboard_import: "🎮 Importar do jogo",
      onboard_skip: "pular por agora",
      import_running: "Lendo o Web App da EA…",
      import_open_webapp: "Abri o Web App da EA. Faça login, espere o clube carregar e clique em 🎮 importar do jogo de novo.",
      import_login: "Você não está logado no Web App da EA. Faça login na aba que abri e clique de novo.",
      import_fail: "Não consegui ler o Web App da EA. Abra o Web App, espere carregar e tente de novo.",
      import_done: "🎮 Importado do jogo (sobrescreveu tudo): {o} objetivos e {g} grupos concluídos.",
      sync_off: "desligado", sync_from: "FUT.GG → extensão", sync_to: "extensão → FUT.GG", sync_both: "dois sentidos", sync_futbin: "extensão → FUTBIN",
      futbin_pushing: "Enviando {n} ao FUTBIN…", futbin_result: "✓ {n} marcados no FUTBIN", futbin_fail: "{n} falharam", futbin_none: "Nada novo pra enviar ao FUTBIN.", futbin_login: "⚠ Não consegui enviar ao FUTBIN (abra o futbin.com logado numa aba).",
      sync_hint: "A extensão é a fonte da verdade (importe do jogo). Ligue e clique em sincronizar pra enviar ao FUT.GG. Precisa estar logado no FUT.GG numa aba.",
      sync_off_hint: "Sincronização desligada — escolha um modo acima.",
      sync_running: "Sincronizando…", sync_login: "Faça login no FUT.GG numa aba e tente de novo.",
      sync_fail: "Não consegui sincronizar (tente com o FUT.GG aberto e logado).",
      sync_result: "✓ {pulled} marcados do FUT.GG · {pushed} enviados",
      sync_pushing: "Enviando ao FUT.GG…", sync_pushed_one: "✓ marcado no FUT.GG",
      sync_unpushed_one: "✓ desmarcado no FUT.GG", sync_push_fail: "⚠ não consegui enviar ao FUT.GG",
      report_open: "🐞 relatar problema", report_send: "Enviar", report_cancel: "cancelar",
      report_ph: "Descreva o problema (o que quebrou, o que você esperava)…",
      report_copied: "Diagnóstico copiado — cole numa issue do GitHub ou me mande."
    },
    en: {
      optimizer: "🎯 Optimizer", objectives: "📋 Objectives",
      opt_empty_title: "No objective selected.",
      opt_empty_body: 'Go to the <b>Objectives</b> tab and click <b>“use all”</b> on a campaign, <b>“⏳ expires in 7d”</b>, or tick individual objectives to build the plan.',
      stat_total: "matches to finish", stat_saved: "matches saved", stat_count: "active objectives",
      h_plan: "Match plan", h_squad: "Suggested starting 11",
      squad_help: "Field these 11 at kickoff. After the match starts, pause and swap up to 5 for your best cards — objectives count the starting team.",
      squad_note: 'Each card is <b>1 player</b>. The title is the <b>card type</b> (e.g. “Argentina · Bundesliga” = an Argentine who plays in the Bundesliga) and the tags are <b>the objectives they complete</b> at once.',
      filter_ph: "🔎 filter (e.g. Brazil, Rush, Bundesliga)",
      manual_ph: "+ manual objective (e.g. Win 5 in Rush with 3 Brazil players)",
      q_week: "⏳ expires in 7d", q_all: "all active", q_clear: "clear selection",
      skip_modes: "skip modes:",
      footer_refresh: "↻ refresh now", footer_note: " · read locally, nothing leaves your browser",
      no_fixed: "The selected objectives don't require a fixed number of matches.",
      must_win: "must win", play: "play",
      on_top: "on top of the matches above", win_total_paren: "(win {n} total)",
      absorbed_detail: "{n} match(es) — done alongside the ones above", free: "included",
      reimport: "🎮 re-import", reimport_title: "Re-import and keep the same selected objectives",
      any_mode: "Any mode", match: "match", matches: "matches",
      completes: "completes:", phase: "Phase", build_first: " (build first)", swap_after: " (swap team after)",
      complete: "complete",
      phase_done: "phase done", phase_done_title: "Marks all objectives in this phase as done",
      phase_todo: "What to do this phase",
      squad_needs: "Squad:", phase_generic: "Just play matches (no squad requirement).",
      free_slot: "Free slot", best_cards: "your best cards", player: "Player", others: "+{n} more",
      go_to_obj: "open in Objectives tab",
      match_objs: "Match objectives", other_objs: "Other objectives",
      kind_show: "show:", kind_all: "All", rewards: "Campaign rewards",
      rwd_evo: "Evolution", rwd_player: "Player", rwd_pick: "Player Pick",
      in_game: "in-game",
      no_constraints_title: "No squad restriction",
      no_constraints_body: "The selected objectives don't require specific leagues/nations — use your best team.",
      warn_phases: "ℹ The selected objectives don't fit in one team. Do Phase 1, then switch to Phase 2 — some matches repeat with the second team.",
      warn_unmet: "⚠ Couldn't cover: {x}.",
      use_category: "🎯 build optimizer", use_all: "🎯 build optimizer", clear: "clear", camps: "camp.",
      expires_today: "expires today",
      nothing_found: "Nothing found for “{q}”.",
      loading_hint: "Loading objectives from FUT.GG… if nothing shows, click “↻ refresh now” at the bottom.",
      t_use_opt: "Use in optimizer", t_mode_skipped: "Mode skipped", t_obj_skipped: "Objective ignored",
      t_mark_done: "Mark as done", t_done: "Done (click to undo)", t_group_done: "Done: the whole campaign is already completed on FUT.GG",
      t_skip: "Don't want to do this", t_skipped: "Ignored (click to restore)", t_remove: "Remove",
      mode_skipped_tag: "skipped mode: ",
      games: "games", from1league: "≥{n} from 1 league",
      skip_off: "Click to consider {m} again", skip_on: "Click to skip all {m} objectives",
      use_cat_title: "Build the optimizer from what's left in {c}",
      loading: "Loading…", read_fail: "Couldn't read. Open FUT.GG in a tab and try again.",
      objs_source: "{n} objectives · FUT.GG",
      sel_expiring: "{n} objectives expiring in {d}d selected", none_expiring: "No (non-skipped) objective expires in {d}d",
      sync_title: "Sync with FUT.GG", sync_now: "sync now",
      import_game: "🎮 Import from Game", import_game_title: "Imports what you've completed IN THE GAME by reading EA's official Web App (you must be logged into the Web App in a tab).",
      sync_title3: "Send my completions to:", sync_now_hint: "sends what's completed here to the site selected above",
      onboard_title: "First: import your progress from the game",
      onboard_lead: "Before building squads, import what you've already completed in-game — so the extension starts with your real progress instead of from scratch.",
      onboard_step1: "Click the button below. I'll open EA's FC Web App.",
      onboard_step2: "Log in and wait for your club to load.",
      onboard_step3: "Come back here and click Import from game again.",
      onboard_import: "🎮 Import from game",
      onboard_skip: "skip for now",
      import_running: "Reading EA's Web App…",
      import_open_webapp: "Opened EA's Web App. Log in, wait for your club to load, then click 🎮 import from game again.",
      import_login: "You're not logged into EA's Web App. Log in on the tab I opened and click again.",
      import_fail: "Couldn't read EA's Web App. Open the Web App, wait for it to load and try again.",
      import_done: "🎮 Imported from game (overwrote everything): {o} objectives and {g} groups completed.",
      sync_off: "off", sync_from: "FUT.GG → extension", sync_to: "extension → FUT.GG", sync_both: "two-way", sync_futbin: "extension → FUTBIN",
      futbin_pushing: "Sending {n} to FUTBIN…", futbin_result: "✓ {n} marked on FUTBIN", futbin_fail: "{n} failed", futbin_none: "Nothing new to send to FUTBIN.", futbin_login: "⚠ Couldn't send to FUTBIN (open futbin.com logged in, in a tab).",
      sync_hint: "The extension is the source of truth (import from game). Turn on and click sync to push to FUT.GG. You must be logged into FUT.GG in a tab.",
      sync_off_hint: "Sync is off — pick a mode above.",
      sync_running: "Syncing…", sync_login: "Log into FUT.GG in a tab and try again.",
      sync_fail: "Couldn't sync (try with FUT.GG open and logged in).",
      sync_result: "✓ {pulled} pulled from FUT.GG · {pushed} pushed",
      sync_pushing: "Sending to FUT.GG…", sync_pushed_one: "✓ marked on FUT.GG",
      sync_unpushed_one: "✓ unmarked on FUT.GG", sync_push_fail: "⚠ couldn't send to FUT.GG",
      report_open: "🐞 report a problem", report_send: "Send", report_cancel: "cancel",
      report_ph: "Describe the problem (what broke, what you expected)…",
      report_copied: "Diagnostics copied — paste into a GitHub issue or send it to me."
    }
  };

  function t(lang, key, vars) {
    let s = (UI[lang] && UI[lang][key]) || UI.en[key] || key;
    if (vars) for (const k in vars) s = s.replace(new RegExp("\\{" + k + "\\}", "g"), vars[k]);
    return s;
  }
  function catName(o, lang) {
    if (lang === "pt") return CAT_PT[o.categorySlug] || o.category || "Outros";
    return o.category || "Others";
  }

  // ---- tradução por regras das descrições/nomes dos objetivos ----
  // nação: forma "de X" (com artigo) e adjetivo
  const NAT = {
    "Spain": ["da Espanha", "espanhol"], "Germany": ["da Alemanha", "alemão"],
    "France": ["da França", "francês"], "Italy": ["da Itália", "italiano"],
    "England": ["da Inglaterra", "inglês"], "Portugal": ["de Portugal", "português"],
    "Brazil": ["do Brasil", "brasileiro"], "Argentina": ["da Argentina", "argentino"],
    "Netherlands": ["da Holanda", "holandês"], "Belgium": ["da Bélgica", "belga"],
    "Croatia": ["da Croácia", "croata"], "Mexico": ["do México", "mexicano"],
    "Uruguay": ["do Uruguai", "uruguaio"], "Colombia": ["da Colômbia", "colombiano"],
    "USA": ["dos EUA", "americano"], "Nigeria": ["da Nigéria", "nigeriano"],
    "Senegal": ["do Senegal", "senegalês"], "Morocco": ["do Marrocos", "marroquino"],
    "Egypt": ["do Egito", "egípcio"], "Japan": ["do Japão", "japonês"],
    "Poland": ["da Polônia", "polonês"], "Norway": ["da Noruega", "norueguês"],
    "Sweden": ["da Suécia", "sueco"], "Denmark": ["da Dinamarca", "dinamarquês"],
    "Austria": ["da Áustria", "austríaco"], "Switzerland": ["da Suíça", "suíço"],
    "Serbia": ["da Sérvia", "sérvio"], "Ghana": ["de Gana", "ganês"],
    "Cameroon": ["dos Camarões", "camaronês"], "Chile": ["do Chile", "chileno"],
    "Peru": ["do Peru", "peruano"], "Ecuador": ["do Equador", "equatoriano"],
    "Paraguay": ["do Paraguai", "paraguaio"], "Canada": ["do Canadá", "canadense"],
    "Scotland": ["da Escócia", "escocês"], "Wales": ["do País de Gales", "galês"],
    "Ireland": ["da Irlanda", "irlandês"], "Turkey": ["da Turquia", "turco"],
    "Greece": ["da Grécia", "grego"], "Australia": ["da Austrália", "australiano"],
    "South Korea": ["da Coreia do Sul", "sul-coreano"], "Ivory Coast": ["da Costa do Marfim", "marfinense"]
  };
  const DIFF = { "Semi-Pro": "Semiprofissional", "Professional": "Profissional", "World Class": "Craque Mundial", "Legendary": "Lendário", "Ultimate": "Definitiva", "Beginner": "Iniciante", "Amateur": "Amador" };
  const CONT = {
    "Africa": "da África", "Europe": "da Europa", "Asia": "da Ásia", "Oceania": "da Oceania",
    "North America": "da América do Norte", "South America": "da América do Sul", "Asia + Oceania": "da Ásia e Oceania"
  };
  // forma "de/da/do X" para nação, continente ou liga
  function ofPlace(x) {
    x = x.replace(/[.,;:\s]+$/, "").trim();
    if (NAT[x]) return NAT[x][0];
    if (CONT[x]) return CONT[x];
    return "da " + x; // ligas (Bundesliga, LALIGA, Premier League…)
  }
  // adjetivos de nacionalidade EN -> PT
  const ADJ = {
    German: "alemão", Brazilian: "brasileiro", French: "francês", Italian: "italiano", English: "inglês",
    Spanish: "espanhol", Portuguese: "português", Dutch: "holandês", Argentine: "argentino", Argentinian: "argentino",
    Belgian: "belga", Croatian: "croata", Mexican: "mexicano", Uruguayan: "uruguaio", Colombian: "colombiano",
    Nigerian: "nigeriano", Japanese: "japonês", Polish: "polonês", Norwegian: "norueguês", Swedish: "sueco",
    Danish: "dinamarquês", Austrian: "austríaco", Swiss: "suíço", Serbian: "sérvio", Scottish: "escocês",
    Welsh: "galês", Irish: "irlandês", Turkish: "turco", Greek: "grego", American: "americano"
  };
  function adjOf(x) { x = x.trim(); return ADJ[x] || (NAT[x] && NAT[x][1]) || x; }
  const plural = (n, sing, plur) => (parseInt(n, 10) === 1 ? sing : plur);
  function tourneyStage(r) {
    const t = r.toLowerCase();
    const rd = r.match(/\d+/);
    if (/round of/.test(t) && rd) return "à Rodada de " + rd[0];
    if (/quarter/.test(t)) return "às Quartas de Final";
    if (/semi/.test(t)) return "às Semifinais";
    if (/grand final/.test(t)) return "à Grande Final";
    if (/final/.test(t)) return "à Final";
    return "à fase " + r;
  }
  // nome próprio de lugar (nação/continente/liga) — sequência de palavras Capitalizadas
  const PLACE = "[A-Z][A-Za-zÀ-ÿ']*(?:\\s+(?:[A-Z][A-Za-zÀ-ÿ']*|\\d+))*";

  function translateReq(text, lang) {
    if (lang !== "pt" || !text) return text;
    let s = " " + text + " ";
    const G = PLACE;

    // contagens (com plural correto)
    s = s.replace(/\bScore at least (\d+) goals? in (?:one|a single) match\b/gi, (m, n) => `Marque pelo menos ${n} ${plural(n, "gol", "gols")} em uma partida`);
    s = s.replace(/\bScore a goal in (\d+) separate matches\b/gi, (m, n) => `Marque um gol em ${n} partidas diferentes`);
    s = s.replace(/\bScore at least (\d+) goals?\b/gi, (m, n) => `Marque pelo menos ${n} ${plural(n, "gol", "gols")}`);
    s = s.replace(/\bScore (\d+) goals?\b/gi, (m, n) => `Marque ${n} ${plural(n, "gol", "gols")}`);
    s = s.replace(/\bScore (\d+)\b/gi, "Marque $1");
    s = s.replace(/\bWin (\d+) match(?:es)?\b/gi, (m, n) => `Vença ${n} ${plural(n, "partida", "partidas")}`);
    s = s.replace(/\bWin (\d+)\b/gi, "Vença $1");
    s = s.replace(/\bPlay (\d+) match(?:es)?\b/gi, (m, n) => `Jogue ${n} ${plural(n, "partida", "partidas")}`);
    s = s.replace(/\bPlay (\d+)\b/gi, "Jogue $1");
    s = s.replace(/\b(?:Assist|Provide) (\d+) (?:times|assists?)\b/gi, (m, n) => `Dê ${n} ${plural(n, "assistência", "assistências")}`);
    s = s.replace(/\bAssist (\d+)\b/gi, "Dê $1");

    // defesa / clean sheet
    s = s.replace(/\bConcede (\d+) goals? or (?:less|fewer)\b/gi, (m, n) => `Sofra ${n} ${plural(n, "gol", "gols")} ou menos`);
    s = s.replace(/\bConcede (\d+) or (?:less|fewer) goals?\b/gi, (m, n) => `Sofra ${n} ${plural(n, "gol", "gols")} ou menos`);
    s = s.replace(/\bConcede (\d+) goals?\b/gi, (m, n) => `Sofra ${n} ${plural(n, "gol", "gols")}`);
    s = s.replace(/\bKeep (\d+) clean sheets?\b/gi, (m, n) => `Fique ${n} ${plural(n, "partida", "partidas")} sem sofrer gols`);
    s = s.replace(/\bKeep a clean sheet\b/gi, "Não sofra gols");

    // progressão de torneio
    s = s.replace(/\bReach the (Round of \d+|Quarter[- ]?Finals?|Semi[- ]?Finals?|Finals?|Grand Finals?)\b/gi, (m, r) => "Chegue " + tourneyStage(r));
    s = s.replace(/\bWin the (.+?) (\d+) times?\b/gi, (m, cup, n) => `Vença o ${cup} ${n} ${plural(n, "vez", "vezes")}`);
    s = s.replace(/\bWin the (.+?) 1 Time\b/gi, "Vença o $1 1 vez");

    // mercado / clube (objetivos fora da gameplay)
    s = s.replace(/\bBuy a Player\b/gi, "Compre um jogador no mercado");
    s = s.replace(/\bSell a Player\b/gi, "Venda um jogador no mercado");
    s = s.replace(/\bList a Player\b/gi, "Anuncie um jogador no mercado");
    s = s.replace(/\bCreate (\d+) Listings?\b/gi, (m, n) => `Crie ${n} ${plural(n, "anúncio", "anúncios")} no mercado`);
    s = s.replace(/\b(\d+) Buy Now\b/gi, "$1 compras diretas (Buy Now)");
    s = s.replace(/\bBuy (\d+) Items?\b/gi, (m, n) => `Compre ${n} ${plural(n, "item", "itens")}`);
    s = s.replace(/\bApply a Chemistry Style\b/gi, "Aplique um estilo de química");
    s = s.replace(/\bApply (\d+) Consumables?\b/gi, (m, n) => `Aplique ${n} ${plural(n, "consumível", "consumíveis")}`);
    s = s.replace(/\bChange (?:the )?formation\b/gi, "Mude a formação");
    s = s.replace(/\bComplete (\d+) Squad Building Challenge groups?\b/gi, (m, n) => `Complete ${n} ${plural(n, "grupo", "grupos")} de SBC`);
    s = s.replace(/\bComplete the (.+?) Moment\b/gi, "Complete o Momento $1");

    s = s.replace(/\bComplete (\d+)\b/gi, "Complete $1");
    s = s.replace(/\bEarn ([\d.,]+) points\b/gi, "Ganhe $1 pontos");
    s = s.replace(/\bEarn ([\d.,]+)\b/gi, "Ganhe $1");

    // dificuldade
    s = s.replace(/on Min\.?\s+([A-Za-z-]+(?:\s+Class)?)\s+difficulty/gi, (mm, d) => "na dificuldade mín. " + (DIFF[d] || d));

    // partidas diferentes (com "in") — cobre separate/different e matches/games
    s = s.replace(/\bin (\d+) (?:separate|different) (?:matches|games)\b/gi, "em $1 partidas diferentes");
    s = s.replace(/\b(?:separate|different) (?:matches|games)\b/gi, "partidas diferentes");

    // filtros de jogador (antes de traduzir "in X"). PAREN = "(Bundesliga)"
    // que o FUT.GG anexa a clubes; capturamos e mantemos. Usamos flag "g"
    // (SEM "i") porque a captura de lugar depende de [A-Z] = maiúscula real:
    // com "i", [A-Z] casaria minúsculas e "engoliria" palavras como "in your".
    const PAREN = "(?:\\s*\\(([^)]*)\\))?";
    const keepParen = (x, p) => ofPlace(x) + (p ? " (" + p + ")" : "");
    // "at least N [X] players" / "at least N from X" / "at least N players from X"
    s = s.replace(new RegExp("(?:using |with |having )?at least (\\d+)\\s+players? from (" + G + ")" + PAREN, "g"), (m, n, x, p) => `com pelo menos ${n} ${plural(n, "jogador", "jogadores")} ${keepParen(x, p)}`);
    s = s.replace(new RegExp("(?:using |with |having )?at least (\\d+)\\s+from (" + G + ")" + PAREN, "g"), (m, n, x, p) => `com pelo menos ${n} ${plural(n, "jogador", "jogadores")} ${keepParen(x, p)}`);
    s = s.replace(new RegExp("(?:using |with |having )?at least (\\d+)\\s+(" + G + ")" + PAREN + "\\s+players?", "g"), (m, n, x, p) => `com pelo menos ${n} ${plural(n, "jogador", "jogadores")} ${keepParen(x, p)}`);
    // "having N X players in your starting XI"
    s = s.replace(new RegExp("having (\\d+)\\s+(" + G + ")" + PAREN + "\\s+players?", "g"), (m, n, x, p) => `com ${n} ${plural(n, "jogador", "jogadores")} ${keepParen(x, p)}`);
    // "with/using min N X players" (com paren opcional)
    s = s.replace(new RegExp("(?:using|with) [Mm]in\\.?\\s*(\\d+)\\s+(" + G + ")" + PAREN + "\\s+players?", "g"), (m, n, x, p) => `com no mín. ${n} ${plural(n, "jogador", "jogadores")} ${keepParen(x, p)}`);
    s = s.replace(new RegExp("with (\\d+)\\s+(" + G + ")" + PAREN + "\\s+players?", "g"), (m, n, x, p) => `com ${n} ${plural(n, "jogador", "jogadores")} ${keepParen(x, p)}`);
    s = s.replace(new RegExp("using (\\d+)\\s+(" + G + ")" + PAREN + "\\s+players?", "g"), (m, n, x, p) => `usando ${n} ${plural(n, "jogador", "jogadores")} ${keepParen(x, p)}`);
    s = s.replace(new RegExp("using any player from (" + G + ")", "g"), (m, x) => `usando qualquer jogador ${ofPlace(x)}`);
    s = s.replace(new RegExp("using a player from (" + G + ")", "g"), (m, x) => `usando um jogador ${ofPlace(x)}`);
    s = s.replace(new RegExp("with a (" + G + ") player\\b", "g"), (m, x) => `com um jogador ${adjOf(x)}`);
    // sem contagem: "with X players", "players from X"
    s = s.replace(new RegExp("with players from (" + G + ")", "g"), (m, x) => `com jogadores ${ofPlace(x)}`);
    s = s.replace(new RegExp("with (" + G + ")" + PAREN + " players?\\b", "g"), (m, x, p) => `com jogadores ${keepParen(x, p)}`);
    s = s.replace(new RegExp("using (" + G + ")" + PAREN + " players?\\b", "g"), (m, x, p) => `usando jogadores ${keepParen(x, p)}`);
    s = s.replace(new RegExp("players from (" + G + ")", "g"), (m, x) => `jogadores ${ofPlace(x)}`);

    // modos / lugares
    s = s.replace(/in any (?:Ultimate Team|FUT) [Gg]ame [Mm]ode/gi, "em qualquer modo");
    s = s.replace(/in any game mode/gi, "em qualquer modo");
    s = s.replace(/in every match/gi, "em cada partida");
    s = s.replace(/in (?:a )?single match|in one match/gi, "em uma partida");
    s = s.replace(/in Squad Battles/gi, "no Squad Battles");
    s = s.replace(/in Division Rivals|in Rivals/gi, "no Rivals");
    s = s.replace(/in Rush/gi, "no Rush");
    s = s.replace(/in FUT Champions|in Champions/gi, "no Champions");
    s = s.replace(/in Live Events/gi, "nos Eventos");
    s = s.replace(/in the Festival of Football/gi, "no Festival of Football");
    s = s.replace(/in your starting (?:11|XI)/gi, "no time titular");
    s = s.replace(/\bwhile using\b/gi, "usando");
    s = s.replace(/by completing bonuses/gi, "completando bônus");
    s = s.replace(/\(or ([^)]+)\)/gi, "(ou $1)");
    s = s.replace(/\bwhile\b/gi, " "); // "while" solto que sobra dos filtros

    // termos de jogada
    s = s.replace(/through balls?/gi, "passes em profundidade");
    s = s.replace(/chip shots?/gi, "chutes por cobertura");
    s = s.replace(/finesse shots?/gi, "chutes colocados");
    s = s.replace(/volleys?/gi, "voleios");
    s = s.replace(/outside the box/gi, "de fora da área");
    s = s.replace(/\btotal\b/gi, "no total");
    s = s.replace(/against the Featured Squad Battles squad/gi, "contra o time em destaque do Squad Battles");
    s = s.replace(/against the\b/gi, "contra o").replace(/\bagainst\b/gi, "contra");

    // sobras genéricas (depois dos casos específicos)
    s = s.replace(new RegExp("\\bfrom (" + G + ")", "g"), (m, x) => ofPlace(x));
    s = s.replace(/\bat least\b/gi, "pelo menos");
    s = s.replace(/\bat most\b/gi, "no máximo");
    s = s.replace(/\bor less\b/gi, "ou menos");
    s = s.replace(/\bor more\b/gi, "ou mais");
    s = s.replace(/\bor fewer\b/gi, "ou menos");
    s = s.replace(/\band win\b/gi, "e vença").replace(/\band\b/gi, "e");
    s = s.replace(/\bor\b/gi, "ou");
    s = s.replace(/\bwith\b/gi, "com");
    s = s.replace(/\bdifferent matches\b/gi, "partidas diferentes");
    s = s.replace(/\bmatches\b/gi, "partidas").replace(/\bmatch\b/gi, "partida");
    s = s.replace(/\bgames\b/gi, "partidas").replace(/\bgame\b/gi, "partida");
    s = s.replace(/\bgoals?\b/gi, (m) => (/goals/i.test(m) ? "gols" : "gol"));
    s = s.replace(/\bplayers?\b/gi, (m) => (/players/i.test(m) ? "jogadores" : "jogador"));
    s = s.replace(/\bwins?\b/gi, (m) => (/wins/i.test(m) ? "vitórias" : "vitória"));
    s = s.replace(/\bin the\b/gi, "no").replace(/\bin a\b/gi, "em uma");

    return s.replace(/\s+([.,;:])/g, "$1").replace(/\s+/g, " ").trim();
  }
  // nação isolada (para chips): PT sem artigo
  const NAT_SIMPLE = {
    Spain: "Espanha", Germany: "Alemanha", France: "França", Italy: "Itália", England: "Inglaterra",
    Portugal: "Portugal", Brazil: "Brasil", Argentina: "Argentina", Netherlands: "Holanda", Belgium: "Bélgica",
    Croatia: "Croácia", Mexico: "México", Uruguay: "Uruguai", Colombia: "Colômbia", USA: "EUA",
    Nigeria: "Nigéria", Senegal: "Senegal", Morocco: "Marrocos", Egypt: "Egito", Japan: "Japão",
    Poland: "Polônia", Norway: "Noruega", Sweden: "Suécia", Denmark: "Dinamarca", Austria: "Áustria",
    Switzerland: "Suíça", Serbia: "Sérvia", Ghana: "Gana", Cameroon: "Camarões", Chile: "Chile",
    Peru: "Peru", Ecuador: "Equador", Paraguay: "Paraguai", Canada: "Canadá", Scotland: "Escócia",
    Wales: "País de Gales", Ireland: "Irlanda", Turkey: "Turquia", Greece: "Grécia", Australia: "Austrália",
    "South Korea": "Coreia do Sul", "Ivory Coast": "Costa do Marfim"
  };
  function ptNation(name, lang) { return lang === "pt" ? (NAT_SIMPLE[name] || name) : name; }

  // Nomes de campanha (subcategoria). Recorrentes = termos oficiais EA;
  // nações via mapa; eventos específicos ficam no original.
  const CAMPAIGN_PT = {
    "Daily Objectives": "Objetivos Diários", "Weekly Objectives": "Objetivos Semanais",
    "Weekly Rush Points": "Pontos Rush Semanais", "Season Pass": "Passe de Temporada",
    "Foundations Mode Mastery": "Maestria do Modo Fundamentos"
  };
  const PLACE_WORD = Object.assign({
    "Europe": "Europa", "Africa": "África", "Asia": "Ásia", "Oceania": "Oceania",
    "North America": "América do Norte", "South America": "América do Sul"
  }, NAT_SIMPLE);
  const PLACE_KEYS = Object.keys(PLACE_WORD).sort((a, b) => b.length - a.length);
  function campaignName(name, lang) {
    if (lang !== "pt" || !name) return name;
    if (CAMPAIGN_PT[name]) return CAMPAIGN_PT[name];
    let s = name;
    for (const k of PLACE_KEYS) s = s.replace(new RegExp("\\b" + k.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + "\\b", "g"), PLACE_WORD[k]);
    s = s.replace(/^(.+)\s+Completionist$/i, "Finalista de $1").replace(/^(.+)\s+Mastery$/i, "Maestria de $1")
      .replace(/\bWeekly\b/gi, "Semanal").replace(/\bDaily\b/gi, "Diário").replace(/\bPoints\b/gi, "Pontos");
    return s;
  }

  return { t, catName, translateReq, ptNation, campaignName, CAT_PT };
})();
