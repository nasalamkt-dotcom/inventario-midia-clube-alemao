# DKP · Inventário de Mídia e Patrocínio

Sistema de gestão e vitrine comercial dos espaços de mídia/patrocínio do
Clube Alemão de Pernambuco (Deutscher Klub Pernambuco). Projeto NaSala
Marketing Digital.

- **Página pública** (`/`): vitrine para prospects, sem senha, com filtro por
  categoria, fotos, status em tempo real e contato via WhatsApp.
- **Área da equipe**: botão "Acesso da equipe" na barra superior → senha →
  painel de gestão do inventário + dashboard financeiro.

## Stack

- React + Vite
- Supabase (Postgres) para os dados — uma única tabela `app_state` guarda
  todo o inventário e as fotos em formato JSON.

## Rodando localmente

\`\`\`bash
npm install
cp .env.example .env.local   # preencha com as chaves do seu projeto Supabase
npm run dev
\`\`\`

## Configuração do Supabase (uma vez só)

1. Crie um projeto em [supabase.com](https://supabase.com).
2. Abra **SQL Editor** e rode o conteúdo de \`supabase-setup.sql\`.
3. Em **Project Settings → API**, copie a **Project URL** e a chave
   **anon public** para o \`.env.local\` (ou nas variáveis de ambiente da
   hospedagem, no deploy).

## Deploy (Vercel — recomendado)

1. Suba este projeto para um repositório no GitHub.
2. Em [vercel.com](https://vercel.com), clique em **New Project** e
   importe o repositório.
3. Nas configurações do projeto, adicione as variáveis de ambiente:
   - \`VITE_SUPABASE_URL\`
   - \`VITE_SUPABASE_ANON_KEY\`
4. Deploy. Pronto — a cada novo \`git push\`, o site atualiza sozinho.

## Transferindo para o servidor do cliente ou da NaSala depois

Não é preciso reescrever nada. Basta:
1. Transferir (ou dar acesso a) este mesmo repositório GitHub.
2. Criar um novo projeto Supabase na conta de destino e rodar de novo o
   \`supabase-setup.sql\` (ou migrar os dados do projeto atual, se quiserem
   manter o histórico).
3. Conectar o repositório à conta de hospedagem de destino (Vercel, Netlify
   ou qualquer serviço que rode um build Vite) com as mesmas variáveis de
   ambiente, apontando para o novo projeto Supabase.

## Segurança (importante para a entrega final)

Por enquanto, o acesso ao banco usa a chave pública (\`anon\`) com leitura e
escrita abertas — suficiente para a fase provisória, mas qualquer pessoa
com essa chave (visível no código do site) pode, em teoria, escrever
diretamente no banco por fora do aplicativo. A senha da "Área da equipe"
protege o uso normal do sistema, mas não substitui uma regra de segurança
no nível do banco. Antes da entrega definitiva ao cliente, vale evoluir
isso com autenticação real no Supabase (login por e-mail/senha da equipe)
em vez da senha única atual.
