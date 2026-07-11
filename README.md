# Otimizador de Objetivos EAFC — extensão + robô de manutenção

Extensão do Chrome que lê os objetivos do EA FC (FUT.GG), otimiza o time e as
partidas, traduz PT/EN e **sincroniza a conclusão com a sua conta do FUT.GG**.
Também **importa direto do jogo** o que você já concluiu (lendo o Web App
oficial da EA). Este repositório ainda tem um **robô** que vigia se o FUT.GG
mudou e quebrou a extensão — e, quando quebra, aciona o Claude para consertar.

## Importar do jogo (Web App da EA)

O botão **🎮 importar do jogo** lê o que está concluído *no jogo* direto do Web
App oficial da EA (ea.com), usando o mesmo serviço interno que o próprio Web App
usa. Os IDs da EA (`objectiveId`/`groupId`) são idênticos aos do FUT.GG
(`challengeId`/`campaignId`), então a extensão marca tudo aqui e, se a sync
estiver ligada no sentido *extensão → FUT.GG*, também reflete lá.

Como usar: abra o **EA FC Web App** (ea.com → Ultimate Team → Web App), faça
login e espere o clube carregar; então clique em 🎮 importar do jogo. A leitura
é **somente leitura** — nunca resgata recompensa nem muda nada no jogo.

Cuidado: a EA muda endpoints e o token de sessão do Web App expira rápido, então
esse importador é mais frágil que a sync do FUT.GG. Endpoint usado hoje:
`utas…/ut/game/fc26/scmp/objective/categories/all`, via
`window.services.Objectives.requestCategories()`. Se a EA mudar isso, use o botão
🐞 relatar problema para o robô consertar.

## Estrutura

```
extension/           A extensão em si (carregue esta pasta no Chrome)
tools/healthcheck.mjs   Testa os parsers contra o FUT.GG ao vivo
.github/workflows/
  healthcheck.yml    Monitor agendado: abre issue marcando @claude se quebrar
  build.yml          Gera o .zip da extensão a cada mudança
.github/ISSUE_TEMPLATE/bug.md
```

## Como o robô funciona

1. **Monitor (GitHub Actions)** roda o `healthcheck.mjs` todo dia. Ele busca o
   FUT.GG e confere se os parsers ainda extraem os objetivos e se a API de
   sincronização ainda existe.
2. **Se quebrar**, a Action abre uma **issue** marcando `@claude` com o
   diagnóstico (o que quebrou e onde), e o job falha — o GitHub te manda um
   **e-mail**.
3. **O Claude conserta**: com o app do Claude instalado no repo, ele pega a
   issue, ajusta o código (ex: os regex em `extension/src/extract.js`), roda o
   health check até passar e abre um **PR** com o conserto.
4. **O botão "🐞 relatar problema"** na extensão faz o mesmo caminho: abre uma
   issue já preenchida com o diagnóstico, marcando `@claude`.

Resultado: quando o FUT.GG muda algo comum, o conserto é automático; quando é
algo grande, você recebe o diagnóstico e o Claude propõe o PR para você aprovar.

## Setup (uma vez)

1. **Crie o repositório** no GitHub (vazio, sem README).
2. **Suba este conteúdo** (a partir desta pasta):
   ```bash
   git init && git add . && git commit -m "extensão + robô de manutenção"
   git branch -M main
   git remote add origin https://github.com/SEU_USUARIO/SEU_REPO.git
   git push -u origin main
   ```
3. **Ligue o auto-conserto do Claude (sem pagar API — usa sua assinatura Pro/Max):**
   - Instale o app do Claude no repositório: https://github.com/apps/claude
   - Gere um token da sua assinatura (não é a chave de API paga): instale o
     Claude Code (`npm install -g @anthropic-ai/claude-code`) e rode
     `claude setup-token` — ele abre o navegador, você loga com sua conta
     Pro/Max e ele imprime um token.
   - Salve esse token no repo em *Settings → Secrets and variables → Actions →
     New repository secret*, com o nome **`CLAUDE_CODE_OAUTH_TOKEN`**.
   É isso que permite o `@claude` nas issues virar um PR de conserto, usando a
   cota da sua assinatura em vez de cobrança por API.
4. **Ligue o botão de relatar problema**: edite
   `extension/src/config.js` e coloque `repo: "SEU_USUARIO/SEU_REPO"`. Assim o
   botão abre a issue já preenchida. (Se deixar vazio, o botão só copia o
   diagnóstico para você colar/enviar.)

## Rodar o health check na mão

```bash
node tools/healthcheck.mjs           # busca o FUT.GG ao vivo
node tools/healthcheck.mjs pagina.html   # testa contra um HTML salvo
```

## Instalar a extensão

`chrome://extensions` → Modo do desenvolvedor → "Carregar sem compactação" →
selecione a pasta `extension/`. Veja `extension/COMO-INSTALAR.md` para o uso.
