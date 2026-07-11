// Base de referencia: ligas, nacoes e posicoes reconhecidas pelo parser.
// Cada entrada tem "aliases" (variacoes em EN/PT) para casar com o texto.
window.EAFC_DATA = (function () {
  const LEAGUES = [
    { id: "premier-league", name: "Premier League", aliases: ["premier league", "epl", "inglesa", "liga inglesa"] },
    { id: "laliga", name: "LALIGA", aliases: ["laliga", "la liga", "espanhola", "liga espanhola"] },
    { id: "bundesliga", name: "Bundesliga", aliases: ["bundesliga", "alema", "liga alema"] },
    { id: "serie-a", name: "Serie A", aliases: ["serie a", "série a", "italiana", "liga italiana"] },
    { id: "ligue-1", name: "Ligue 1", aliases: ["ligue 1", "francesa", "liga francesa"] },
    { id: "mls", name: "MLS", aliases: ["mls", "major league soccer"] },
    { id: "saudi", name: "Saudi Pro League", aliases: ["saudi", "saudi pro league", "liga saudita", "saudita"] },
    { id: "eredivisie", name: "Eredivisie", aliases: ["eredivisie", "holandesa"] },
    { id: "liga-portugal", name: "Liga Portugal", aliases: ["liga portugal", "primeira liga", "portuguesa"] },
    { id: "efl-championship", name: "EFL Championship", aliases: ["championship", "efl"] },
    { id: "sudamericana", name: "CONMEBOL Libertadores", aliases: ["conmebol libertadores", "libertadores", "conmebol", "copa libertadores", "sul-americana", "sudamericana"] },
    { id: "liga-f", name: "Liga F", aliases: ["liga f"] },
    { id: "womens-super-league", name: "Barclays WSL", aliases: ["wsl", "women's super league", "womens super league"] }
  ];

  const NATIONS = [
    "Brazil", "Brasil", "Argentina", "France", "Franca", "França", "Germany", "Alemanha",
    "Spain", "Espanha", "Italy", "Italia", "Itália", "England", "Inglaterra", "Portugal",
    "Netherlands", "Holanda", "Belgium", "Belgica", "Bélgica", "Croatia", "Croacia", "Croácia",
    "Uruguay", "Uruguai", "Colombia", "Colômbia", "Mexico", "México", "USA", "United States",
    "Estados Unidos", "Nigeria", "Nigéria", "Senegal", "Morocco", "Marrocos", "Egypt", "Egito",
    "Japan", "Japao", "Japão", "South Korea", "Coreia do Sul", "Australia", "Austrália",
    "Poland", "Polonia", "Polônia", "Norway", "Noruega", "Sweden", "Suecia", "Suécia",
    "Denmark", "Dinamarca", "Austria", "Áustria", "Switzerland", "Suica", "Suíça",
    "Serbia", "Sérvia", "Ghana", "Ivory Coast", "Costa do Marfim", "Cameroon", "Camaroes", "Camarões",
    "Chile", "Peru", "Ecuador", "Equador", "Paraguay", "Paraguai", "Canada", "Canadá",
    "Scotland", "Escocia", "Escócia", "Wales", "Pais de Gales", "País de Gales", "Ireland", "Irlanda",
    "Turkey", "Turquia", "Greece", "Grecia", "Grécia", "Ukraine", "Ucrania", "Ucrânia",
    "Slovenia", "Eslovenia", "Eslovênia", "Slovakia", "Eslovaquia", "Algeria", "Argelia", "Argélia"
  ];

  // Formas adjetivas (EN/PT) que aparecem em "with a German player" etc.
  const NATION_ADJ = [
    "German", "Brazilian", "French", "Italian", "English", "Spanish", "Portuguese",
    "Dutch", "Argentine", "Argentinian", "Belgian", "Croatian", "Mexican", "Uruguayan",
    "Colombian", "Nigerian", "Japanese", "Polish", "Norwegian", "Swedish", "Danish",
    "Austrian", "Swiss", "Serbian", "Scottish", "Welsh", "Irish", "Turkish", "Greek",
    "alemao", "alemão", "brasileiro", "frances", "francês", "italiano", "ingles", "inglês",
    "espanhol", "portugues", "português", "holandes", "holandês", "argentino", "belga",
    "mexicano", "uruguaio", "colombiano", "japones", "japonês"
  ];

  // normaliza nacoes: mapeia alias -> nome canonico (primeiro da familia)
  const NATION_CANON = {
    "brasil": "Brazil", "brazil": "Brazil", "brazilian": "Brazil", "brasileiro": "Brazil",
    "franca": "France", "frança": "France", "france": "France", "french": "France", "frances": "France", "francês": "France",
    "alemanha": "Germany", "germany": "Germany", "german": "Germany", "alemao": "Germany", "alemão": "Germany",
    "espanha": "Spain", "spain": "Spain", "spanish": "Spain", "espanhol": "Spain",
    "italia": "Italy", "itália": "Italy", "italy": "Italy", "italian": "Italy", "italiano": "Italy",
    "inglaterra": "England", "england": "England", "english": "England", "ingles": "England", "inglês": "England",
    "holanda": "Netherlands", "netherlands": "Netherlands", "dutch": "Netherlands", "holandes": "Netherlands", "holandês": "Netherlands",
    "belgica": "Belgium", "bélgica": "Belgium", "belgium": "Belgium", "belgian": "Belgium", "belga": "Belgium",
    "japao": "Japan", "japão": "Japan", "japan": "Japan", "japanese": "Japan", "japones": "Japan", "japonês": "Japan",
    "estados unidos": "USA", "united states": "USA", "usa": "USA",
    "mexico": "Mexico", "méxico": "Mexico", "mexican": "Mexico", "mexicano": "Mexico",
    "uruguai": "Uruguay", "uruguay": "Uruguay", "uruguayan": "Uruguay", "uruguaio": "Uruguay",
    "colombia": "Colombia", "colômbia": "Colombia", "colombian": "Colombia", "colombiano": "Colombia",
    "portugal": "Portugal", "portuguese": "Portugal", "portugues": "Portugal", "português": "Portugal",
    "argentina": "Argentina", "argentine": "Argentina", "argentinian": "Argentina", "argentino": "Argentina",
    "croatian": "Croatia", "nigerian": "Nigeria", "polish": "Poland", "norwegian": "Norway",
    "swedish": "Sweden", "danish": "Denmark", "austrian": "Austria", "swiss": "Switzerland",
    "serbian": "Serbia", "scottish": "Scotland", "welsh": "Wales", "irish": "Ireland",
    "turkish": "Turkey", "greek": "Greece"
  };

  const POSITIONS = [
    { id: "gk", name: "Goleiro", aliases: ["goalkeeper", "keeper", "gk", "goleiro"] },
    { id: "def", name: "Defensor", aliases: ["defender", "defenders", "defence", "defensor", "zagueiro", "back", "fullback", "centre-back", "center back"] },
    { id: "mid", name: "Meio-campo", aliases: ["midfielder", "midfielders", "midfield", "meio-campo", "meia", "volante"] },
    { id: "att", name: "Atacante", aliases: ["attacker", "attackers", "forward", "forwards", "striker", "strikers", "winger", "atacante", "atacantes", "centroavante", "ponta"] }
  ];

  return { LEAGUES, NATIONS, NATION_ADJ, NATION_CANON, POSITIONS };
})();
