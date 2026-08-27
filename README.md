# WS Estética Duas Rodas — site + painel

Este pacote tem tudo pronto pra colocar o site no ar de graça, com um banco de
dados de verdade (Upstash) por trás — assim os orçamentos, clientes, estoque
e financeiro ficam salvos permanentemente, e não somem quando a página é
fechada.

## O que tem aqui

```
index.html          → o site inteiro (landing + painel do cliente + painel admin)
api/storage.js       → fala com o banco de dados (Upstash)
api/admin-login.js   → confere a senha da equipe no servidor (mais seguro)
package.json         → lista a única dependência (@upstash/redis)
.env.example          → modelo das variáveis de ambiente que você vai precisar
```

Você **não precisa editar nenhum desses arquivos** pra colocar no ar — só
seguir os passos abaixo.

---

## Passo 1 — Criar o banco de dados grátis no Upstash

1. Acesse **https://upstash.com** e crie uma conta grátis (dá pra entrar com o
   GitHub, sem precisar de cartão).
2. No painel, clique em **Create Database**.
3. Dê um nome (ex: `ws-estetica`), escolha o tipo **Redis**, região mais perto
   do Brasil (ex: `sa-east-1` se aparecer, ou a mais próxima disponível), e
   confirme.
4. Dentro do banco criado, procure a aba **REST API** (ou "Details"). Você vai
   ver duas informações:
   - `UPSTASH_REDIS_REST_URL`
   - `UPSTASH_REDIS_REST_TOKEN`

   Copie os dois — vamos usar no Passo 3.

O plano grátis do Upstash dá **500 mil comandos por mês e 256 MB de espaço**,
sem cartão de crédito e sem expirar. Pra um negócio desse porte, deve sobrar
tranquilamente.

---

## Passo 2 — Subir o projeto pro GitHub

A Vercel puxa o site direto de um repositório do GitHub.

1. Crie uma conta em **https://github.com** (se ainda não tiver).
2. Crie um repositório novo (pode ser privado), ex: `ws-estetica-duas-rodas`.
3. Faça upload de **todos os arquivos desta pasta** pro repositório (o GitHub
   tem um botão "Add file → Upload files" que aceita arrastar e soltar, sem
   precisar usar linha de comando).

---

## Passo 3 — Deploy na Vercel

1. Acesse **https://vercel.com** e crie uma conta (dá pra entrar direto com o
   GitHub).
2. Clique em **Add New → Project**.
3. Escolha o repositório que você acabou de criar (`ws-estetica-duas-rodas`).
4. Antes de clicar em "Deploy", abra **Environment Variables** e adicione,
   uma por uma:

   | Nome | Valor |
   |---|---|
   | `UPSTASH_REDIS_REST_URL` | (o que você copiou do Upstash) |
   | `UPSTASH_REDIS_REST_TOKEN` | (o que você copiou do Upstash) |
   | `ADMIN1_USER` | `Thiagosanfs2` |
   | `ADMIN1_PASS` | `Admin010203` |
   | `ADMIN1_NAME` | `Thiago` |
   | `ADMIN2_USER` | `Mumu2026` |
   | `ADMIN2_PASS` | `Admin010203` |
   | `ADMIN2_NAME` | `Murillo` |

   *(Quer trocar as senhas da equipe? É só mudar `ADMIN1_PASS` /
   `ADMIN2_PASS` aqui — nunca precisa mexer no código.)*

5. Clique em **Deploy**. Em cerca de 1 minuto a Vercel te dá um link tipo
   `ws-estetica-duas-rodas.vercel.app` — esse já é o site no ar.

### Dica: integração automática (mais fácil ainda)

Na própria Vercel, dentro do projeto, tem a aba **Storage → Browse Marketplace
→ Upstash**. Se você conectar por ali, a Vercel já cria o banco e preenche
`UPSTASH_REDIS_REST_URL`/`TOKEN` sozinha — você só precisaria adicionar as 6
variáveis `ADMIN...` manualmente.

---

## Passo 4 — Testar

Abra o link que a Vercel te deu:

- Cadastre um cliente de teste e faça um orçamento.
- Entre como equipe (`Thiagosanfs2` / `Admin010203` ou `Mumu2026` /
  `Admin010203`) e confira se o orçamento aparece em **Atendimentos**.
- Feche a aba, abra de novo — os dados devem continuar lá (agora é banco de
  dados de verdade, não mais memória temporária).

---

## O que mudou em relação à versão anterior (segurança)

Duas coisas importantes foram ajustadas para o site poder ficar público de
verdade:

1. **Login da equipe**: antes, o usuário e a senha ficavam escritos no próprio
   código do site — qualquer pessoa que clicasse em "ver código-fonte" no
   navegador conseguiria ler. Agora essa checagem acontece no servidor
   (`api/admin-login.js`), usando as variáveis de ambiente. As senhas não
   aparecem em lugar nenhum visível.
2. **Senha dos clientes**: antes de ser salva no banco, a senha do cliente
   passa por um hash (uma "transformação" que não pode ser revertida) — então
   mesmo que alguém tivesse acesso ao banco, não veria a senha de ninguém em
   texto puro.

---

## Domínio próprio (opcional)

Se você tiver ou comprar um domínio (ex: `westeticaduasrodas.com.br`), na
Vercel vá em **Settings → Domains** do projeto e siga as instruções — é só
apontar o DNS, a Vercel cuida do resto (inclusive do certificado HTTPS).

---

## Dúvidas comuns

**"Apareceu erro 500 ao tentar cadastrar/orçar."**
Confira se as variáveis `UPSTASH_REDIS_REST_URL` e `UPSTASH_REDIS_REST_TOKEN`
foram coladas certinho (sem espaço em branco no início/fim) nas Environment
Variables da Vercel, e clique em **Redeploy** depois de qualquer mudança nas
variáveis — elas só entram em vigor a partir do próximo deploy.

**"Posso mudar as senhas da equipe depois?"**
Sim — vá em Vercel → seu projeto → Settings → Environment Variables, edite
`ADMIN1_PASS`/`ADMIN2_PASS`, e clique em Redeploy.

**"E se eu quiser adicionar um terceiro administrador?"**
Dá pra fazer, mas aí precisa editar um pouco o arquivo `api/admin-login.js`
(adicionar um `ADMIN3_...`) — se chegar essa hora, é só pedir ajuda de novo.
