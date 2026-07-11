# Checklist de submissão — Otimizador de Objetivos EAFC (Beta grátis)

Ordem prática pra colocar no ar. Marque conforme for fazendo.

## Antes de começar
- [ ] Conta Google que você vai usar como desenvolvedor decidida.
- [ ] Cartão pra pagar a taxa única de **US$ 5** (uma vez só, vale pra sempre).

## 1. Hospedar a Política de Privacidade (a loja EXIGE uma URL pública)
O jeito mais fácil e grátis é o GitHub Pages:
- [ ] Suba o repositório `eafc-repo` no GitHub (pode ser público).
- [ ] Em **Settings → Pages**, ative o Pages na branch principal, pasta `/root` do repo.
- [ ] Sua política ficará em algo como
      `https://SEU-USUARIO.github.io/eafc-repo/store/privacy-policy.html`
- [ ] Abra a URL no navegador pra confirmar que carrega.
- [ ] Guarde essa URL — você vai colar no formulário da loja.

(Alternativa sem GitHub: qualquer hospedagem estática — Netlify, Vercel, Cloudflare
Pages — serve. Só precisa ser uma URL pública que abre o HTML.)

## 2. Criar a conta de desenvolvedor
- [ ] Acesse `chrome.google.com/webstore/devconsole`.
- [ ] Pague a taxa de **US$ 5**.
- [ ] Preencha o nome de publicador (aparece como autor da extensão).

## 3. Subir a extensão
- [ ] Em **Add new item**, suba o arquivo `otimizador-objetivos-eafc.zip` (já está pronto em `store/`).
- [ ] Se pedir versão, o manifest está em `1.0.0`.

## 4. Preencher a ficha (use o arquivo `ficha-da-loja.md`)
- [ ] Nome, descrição curta e descrição detalhada — copie do arquivo.
- [ ] Categoria: Ferramentas / Produtividade. Idioma: Português (Brasil).
- [ ] **Ícone 128px:** já está no zip (`icons/icon128.png`). ✅
- [x] **Screenshots (obrigatório pelo menos 1):** JÁ PRONTOS na pasta `screenshots/` (3 imagens 1280×800). Suba as três.
- [ ] Cole a **URL da Política de Privacidade** (passo 1).
- [ ] Preencha o **propósito único** e a **justificativa de cada permissão** (tudo no `ficha-da-loja.md`).
- [ ] Aba de **uso de dados**: marque "não coleta/não envia", "sem código remoto",
      e certifique as 3 caixas obrigatórias.
- [ ] E-mail de suporte/contato (pode ser um Gmail seu).

## 5. Screenshots — PRONTOS ✅
Já gerei as 3 imagens em **1280×800** na pasta `screenshots/`, prontas pra subir:
- `screenshot-1-objetivos.png` — a lista de objetivos com checklist e recompensas.
- `screenshot-2-otimizador.png` — o otimizador com o plano de partidas.
- `screenshot-3-sync.png` — importar do jogo + sincronização (FUT.GG/FUTBIN).

Suba as três na ficha (a ordem que aparecem no arquivo é uma boa ordem de carrossel).
Se quiser trocar textos/cores das artes, é só pedir que eu regenero.

## 6. Visibilidade e envio
- [ ] Visibilidade: **Público** (ou "Não listado" se quiser testar com poucos primeiro).
- [ ] Como é Beta, a palavra "Beta" já está na descrição — bom pra alinhar expectativa.
- [ ] Clique em **Enviar para revisão**.
- [ ] A revisão leva de algumas horas a alguns dias. Depois de aprovado, fica no ar.

## Depois de publicado
- [ ] Divulgar em comunidades de FUT (Reddit r/EASportsFC, Discords).
- [ ] Coletar feedback e avaliações.
- [ ] Quando tiver tração, ligar o freemium (ver `publicar-e-monetizar.md`).

---

### Pontos de atenção (não são bloqueios, mas conheça)
- A extensão lê o EA Web App e escreve no FUT.GG/FUTBIN. Ler os próprios objetivos é
  de baixo risco, mas automação pode esbarrar nos Termos de Uso desses serviços.
  A parte de "Importar do Jogo" é acionada manualmente por você, o que reduz o risco.
- Manter "Beta" na descrição administra a expectativa de bugs durante o lançamento.
- O ícone atual é funcional (alvo verde/azul). Dá pra melhorar depois sem re-submeter tudo.
