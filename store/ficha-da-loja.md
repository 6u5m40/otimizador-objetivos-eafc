# Ficha da Chrome Web Store — Otimizador de Objetivos EAFC (Beta grátis)

Copie e cole cada campo no formulário da Web Store. Onde a loja pede justificativa
de permissão, ela normalmente é avaliada em inglês — por isso deixei PT **e** EN.

---

## Nome (máx. 45 caracteres)
```
Otimizador de Objetivos EAFC
```

## Nome alternativo com selo Beta (se quiser deixar explícito)
```
Otimizador de Objetivos EAFC (Beta)
```

## Descrição curta / resumo (máx. 132 caracteres)
```
Leia os objetivos do EA FC, monte o checklist e descubra a melhor combinação de partidas para completar tudo mais rápido.
```

## Categoria
`Ferramentas` (ou `Produtividade`). Idioma principal: **Português (Brasil)**.

---

## Descrição detalhada (campo "Descrição")

```
Otimizador de Objetivos EAFC é uma ferramenta feita para quem joga EA FC Ultimate Team e quer
parar de perder tempo com os objetivos.

⚠️ Versão BETA e GRATUITA. Estou lançando de graça para ouvir feedback e melhorar.

O que ela faz:

• Lê automaticamente os objetivos do FUT.GG e monta um checklist organizado.
• Otimizador de partidas: calcula a MELHOR combinação de time e modos para
  completar o máximo de objetivos no menor número de partidas.
• Importar do Jogo: puxa o que você já concluiu direto do EA Web App, incluindo o
  progresso parcial (ex.: "faltam 3 de 9 partidas"), para não recalcular o que já
  está feito.
• Mostra as recompensas de cada objetivo e de cada campanha (XP, pacotes, picks).
• Tradução PT/EN das descrições dos objetivos.
• Filtros úteis: "expira em 7 dias", "pular modos que você não joga".
• Sincronização opcional: enviar suas conclusões para o FUT.GG ou para o FUTBIN,
  com um clique (marca e desmarca).

Privacidade em primeiro lugar:
Seus dados NUNCA saem do seu navegador. A extensão não tem servidor próprio, não
coleta, não envia e não vende nada. Tudo fica salvo localmente no seu computador.

Importante:
Esta extensão é um projeto independente, feito por um fã. Não é afiliada, patrocinada
nem endossada pela Electronic Arts, pela FUT.GG ou pela FUTBIN. EA FC e Ultimate Team
são marcas da Electronic Arts Inc.

É Beta: pode ter erros. Feedback é muito bem-vindo!
```

---

## Propósito único (campo "Single purpose")

PT:
```
Ajudar o usuário a acompanhar e completar os objetivos do EA FC Ultimate Team:
ler a lista de objetivos, calcular a melhor sequência de partidas e sincronizar o
status de conclusão entre os sites que o próprio usuário já utiliza (FUT.GG, EA Web
App e FUTBIN).
```

EN:
```
Help the user track and complete EA FC Ultimate Team objectives: read the objectives
list, compute the best sequence of matches, and sync completion status across the
sites the user already uses (FUT.GG, EA Web App, and FUTBIN).
```

---

## Justificativa de cada permissão

**storage**
- PT: Salva localmente o progresso, os objetivos selecionados, o idioma e as preferências de sincronização.
- EN: Stores the user's progress, selected objectives, language and sync preferences locally.

**sidePanel**
- PT: A interface da extensão é exibida no painel lateral do Chrome.
- EN: The extension UI is displayed in Chrome's side panel.

**scripting**
- PT: Executa scripts nas páginas de objetivos do FUT.GG, EA e FUTBIN para ler a lista de objetivos e aplicar as ações de sincronização que o usuário solicita.
- EN: Runs scripts on the FUT.GG, EA, and FUTBIN objectives pages to read the objectives list and perform the sync actions the user requests.

**activeTab**
- PT: Permite ler a aba ativa de objetivos quando o usuário aciona uma ação na extensão.
- EN: Lets the extension read the active objectives tab when the user triggers an action.

**tabs**
- PT: Abre/localiza a aba correta (FUT.GG, EA Web App ou FUTBIN) para ler ou sincronizar objetivos.
- EN: Opens/locates the correct tab (FUT.GG, EA Web App, or FUTBIN) to read or sync objectives.

**Host permissions (fut.gg, ea.com, futbin.com)**
- PT: A extensão só funciona nesses três sites — é onde os objetivos existem. Precisa acessá-los para ler a lista de objetivos e sincronizar a conclusão que o usuário pediu. Não acessa nenhum outro site.
- EN: The extension only works on these three sites, where the objectives live. It needs access to read the objectives list and sync the completion the user requested. It does not access any other site.

---

## Uso de dados (aba "Privacy" / Data usage do Developer Dashboard)

Marque as declarações assim:

- **Coleta dados do usuário?** Não coletamos nem transmitimos dados para fora do navegador.
  (Se o formulário exigir marcar categorias por serem *lidas* localmente, marque
  "Website content" — conteúdo de objetivos — e deixe claro que fica local.)
- Certifique as três caixas obrigatórias:
  1. Não vendo/transfiro dados a terceiros (fora dos usos aprovados).
  2. Não uso os dados para fins não relacionados ao propósito único.
  3. Não uso os dados para verificar solvência/crédito nem empréstimos.
- **Uso de código remoto:** NÃO. Todo o código está empacotado na extensão; nada é
  carregado remotamente.
- **Link da Política de Privacidade:** cole a URL onde você hospedar o
  `privacy-policy.html` (ver checklist).

---

## Campo de justificativa geral (se pedirem "why do you need these permissions")

PT:
```
A extensão lê os objetivos do EA FC nas páginas do FUT.GG e do EA Web App, calcula a
melhor combinação de partidas e, opcionalmente e sob comando do usuário, sincroniza o
status de conclusão no FUT.GG e no FUTBIN. Todas as permissões são usadas apenas para
essas funções e apenas nesses três domínios. Nenhum dado é enviado para servidores do
desenvolvedor — tudo é processado e guardado localmente no navegador.
```
