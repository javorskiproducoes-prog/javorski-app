-- Javorski Produtividade — Schema Supabase
-- Execute no SQL Editor do Supabase

-- Tabela de registros diários
create table if not exists registros (
  id uuid primary key default gen_random_uuid(),
  pessoa text not null,
  tipo text not null, -- 'video' | 'foto' | 'adm'
  data date not null,
  turno text not null default 'Dia completo',
  criado_em timestamptz default now()
);

-- Tabela de blocos (4 por registro)
create table if not exists blocos (
  id uuid primary key default gen_random_uuid(),
  registro_id uuid references registros(id) on delete cascade,
  numero int not null check (numero between 1 and 4)
);

-- Tabela de eventos/tarefas dentro de cada bloco
create table if not exists eventos (
  id uuid primary key default gen_random_uuid(),
  bloco_id uuid references blocos(id) on delete cascade,
  categoria text,
  projeto text,
  tempo text,
  status text,
  observacao text,
  edicoes int default 0,
  selecoes int default 0,
  ordem int default 0
);

-- Índices para performance
create index if not exists idx_registros_pessoa on registros(pessoa);
create index if not exists idx_registros_data on registros(data);
create index if not exists idx_blocos_registro on blocos(registro_id);
create index if not exists idx_eventos_bloco on eventos(bloco_id);

-- Row Level Security (RLS) — aberto para uso interno sem auth
-- Se quiser adicionar login depois, ajuste aqui
alter table registros enable row level security;
alter table blocos enable row level security;
alter table eventos enable row level security;

-- Políticas permissivas (ajuste para auth futura)
create policy "allow_all_registros" on registros for all using (true) with check (true);
create policy "allow_all_blocos" on blocos for all using (true) with check (true);
create policy "allow_all_eventos" on eventos for all using (true) with check (true);
