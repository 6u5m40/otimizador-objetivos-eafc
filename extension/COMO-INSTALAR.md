# Otimizador de Objetivos EAFC ⚽🎯

Extensão do Chrome que **lê automaticamente todos os objetivos do EA FC** (via
FUT.GG), organiza por **campanha** e calcula a **melhor combinação de time
(11 titulares)** + o **número de partidas** para completar as campanhas que você
escolher no menor número de jogos.

---

## Como instalar (modo desenvolvedor)

1. Descompacte o `eafc-objetivos-extensao.zip` numa pasta que você não vá apagar.
2. Abra o Chrome em `chrome://extensions`.
3. Ligue o **“Modo do desenvolvedor”** (canto superior direito).
4. Clique em **“Carregar sem compactação”** e selecione a pasta `eafc-obj`
   (a que contém o `manifest.json`).
5. Fixe a extensão na barra (ícone de quebra-cabeça → alfinete).

## Como usar

1. Clique no ícone ⚽ para abrir o **painel lateral**.
2. Clique em **“↻ Ler objetivos”**. A extensão busca **todos os objetivos ativos
   do jogo** de uma vez (não precisa nem estar com o FUT.GG aberto).
3. Aba **Objetivos**: em árvore **Categoria › Campanha › Objetivo** (ex:
   *South America › Argentina › Win 5*). Cada objetivo mostra o **nome** e a
   **descrição**. Formas de selecionar o que otimizar:
   - **usar categoria** → seleciona a categoria macro inteira (ex: toda a
     *South America*);
   - **⏳ expira em 7d** → seleciona tudo que vence na próxima semana (o uso mais
     comum: “o que dá pra fechar essa semana no menor número de jogos”);
   - **todos ativos** → seleciona todos os objetivos ativos;
   - **usar todos / limpar** por campanha;
   - ou marque objetivos soltos no ✓ da esquerda.
   Use o filtro 🔎 (ex: `Brazil`, `Rush`, `Bundesliga`). O botão ✅ marca um
   objetivo como concluído (sai do cálculo). Dá pra **adicionar manualmente**.
   - **Pular modos**: na barra “pular modos” clique num modo (ex: `Rush`) pra
     **ignorar todos os objetivos daquele modo** — eles somem do otimizador e da
     seleção rápida. Clique de novo pra voltar.
   - **Ignorar um objetivo**: o botão 🙈 marca um objetivo específico como
     “não quero fazer” (fica riscado e fora de tudo). Clique pra reverter.
4. Aba **Otimizador** (roda em cima do que você selecionou):
   - **Plano de partidas**: quantas partidas em cada modo, já cruzando os
     requisitos que se sobrepõem. Objetivos de **“qualquer modo” não somam
     partidas** — pegam carona nas que você já vai jogar (aparecem como
     **grátis**). Mostra também quantas partidas você **economiza**.
   - **11 titulares**: os slots de liga/nação/posição que cobrem o máximo de
     objetivos ao mesmo tempo. Se a seleção exigir mais jogadores do que cabe em
     11, ele divide em **Fase 1 / Fase 2** (você troca o time no meio). As
     “vagas livres” você preenche com seus craques.

> 💡 **Truque dos titulares:** monte esses 11 no início da partida, comece,
> pause e troque até 5 por suas melhores cartas — os objetivos contam o time
> **inicial**.

## Sincronizar com o FUT.GG (marcar concluído)

Na aba **Objetivos** há a barra **🔗 Sincronizar com FUT.GG**. Você escolhe o
lado que manda (pra não sobrepor) e clica em **sincronizar agora** (precisa
estar logado no FUT.GG numa aba do mesmo Chrome):

- **FUT.GG → extensão**: puxa o que você já concluiu na sua conta e marca como
  feito na extensão.
- **extensão → FUT.GG**: quando você marca um objetivo (ou uma fase) como feito,
  ele marca também na sua conta do FUT.GG.
- **dois sentidos**: junta os dois (modo aditivo — não desmarca nada, por
  segurança).

Como funciona: a extensão usa a **sua sessão já logada** no FUT.GG (o token fica
no navegador; a extensão nunca vê sua senha) e chama a API interna do site
(`/api/fut/gg-club/…`). É um recurso não-oficial, então pode quebrar se o FUT.GG
mudar — se parar de funcionar, me avise.

## Como funciona (resumo técnico)

- O FUT.GG embute **todos os objetivos do jogo num payload dentro do HTML** de
  qualquer página de objetivos. A extensão faz **um único request**, lê esse
  payload por padrão de texto (campos `description`, `name`, `endTime`…) e
  **agrupa as tarefas por campanha**, descartando as expiradas.
- O *parser* transforma cada requisito em dados estruturados (modo, liga, nação,
  posição, nº de jogos), entendendo inclusive adjetivos (“German”, “Brazilian”)
  e quantidades (“Min. 5 Bundesliga players”, “with 3 Brazil players”).
- O *otimizador* agrupa as partidas por modo (o maior requisito “engole” os
  menores) e monta os 11 por **sobreposição** (um brasileiro da Bundesliga cobre
  “Brasil” **e** “Bundesliga” de uma vez).

## Limitações honestas

- Depende do FUT.GG. Se eles mudarem o formato interno do site, a leitura pode
  quebrar — nesse caso use o **modo manual** (aba Objetivos).
- Requisitos “por partida” (ex: “assist em cada jogo”) não somam partidas —
  são cumpridos enquanto você joga o plano.
- Objetivos com condições muito específicas (tipo de finalização, formação
  obrigatória) aparecem listados, mas não entram no cálculo de liga/nação.
- O nº de partidas de objetivos de “marcar X gols/pontos” é uma **estimativa**
  (assume ~2 gols por jogo), então pode variar conforme você joga.
- Nada é enviado pra fora: tudo roda **localmente no seu navegador**.

## Arquivos

```
manifest.json            # configuração (MV3)
_locales/pt_BR/…         # idioma
icons/                   # ícones 16/48/128
src/
  background.js          # abre o painel
  extract.js             # lê e agrupa os objetivos do payload do FUT.GG
  content.js             # fetch de reserva (same-origin) numa aba do FUT.GG
  data.js               # ligas, nações (e adjetivos) e posições
  parser.js             # interpreta cada requisito
  optimizer.js          # plano de partidas + 11 titulares
  sidepanel.html/.css/.js  # a interface
```
