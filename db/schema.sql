create extension if not exists pg_trgm;

create table if not exists university (
  id serial primary key,
  official_code text unique,
  name_ko text not null,
  name_en text,
  type text,
  region text,
  homepage_url text,
  email_domain text,
  address text,
  source text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists department (
  id serial primary key,
  university_id int not null references university(id) on delete cascade,
  name_ko text not null,
  name_en text,
  parent_college text,
  degree_bachelor boolean,
  degree_master boolean,
  degree_phd boolean,
  source text,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique (university_id, name_ko)
);

create table if not exists lab (
  id serial primary key,
  university_id int not null references university(id) on delete cascade,
  department_id int not null references department(id) on delete cascade,
  name_ko text not null,
  name_en text,
  professor_name text,
  homepage_url text,
  aliases jsonb default '[]'::jsonb,
  source text,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique (department_id, name_ko)
);

create index if not exists idx_university_name_trgm on university using gin (name_ko gin_trgm_ops);
create index if not exists idx_department_name_trgm on department using gin (name_ko gin_trgm_ops);
create index if not exists idx_lab_name_trgm on lab using gin (name_ko gin_trgm_ops);

