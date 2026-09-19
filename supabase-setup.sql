-- Execute este script no Supabase: Project > SQL Editor > New query > Run
-- Cria a tabela que guarda todo o estado do sistema (inventário + fotos)
-- e libera acesso de leitura/escrita para a chave pública (anon).

create table if not exists app_state (
  id text primary key,
  data jsonb not null,
  updated_at timestamptz not null default now()
);

alter table app_state enable row level security;

-- Acesso público de leitura e escrita (equivalente ao "shared: true" que
-- usávamos antes). A senha de acesso à área da equipe continua protegendo
-- a edição dentro do próprio aplicativo; para um controle mais rígido no
-- nível do banco, isso pode evoluir depois para políticas com autenticação.
create policy "Leitura pública" on app_state
  for select using (true);

create policy "Escrita pública" on app_state
  for insert with check (true);

create policy "Atualização pública" on app_state
  for update using (true);
