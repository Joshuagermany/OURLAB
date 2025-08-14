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

-- 연구실 리뷰 테이블
create table if not exists lab_review (
  id serial primary key,
  lab_id int not null references lab(id) on delete cascade,
  user_email text not null,
  user_name text not null,
  
  -- 평가 항목들 (1-5점)
  atmosphere int check (atmosphere >= 1 and atmosphere <= 5),
  work_life_balance int check (work_life_balance >= 1 and work_life_balance <= 5),
  professor_communication int check (professor_communication >= 1 and professor_communication <= 5),
  research_environment int check (research_environment >= 1 and research_environment <= 5),
  overall_satisfaction int check (overall_satisfaction >= 1 and overall_satisfaction <= 5),
  
  -- 코멘트
  comment text,
  
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  
  -- 한 사용자는 한 연구실에 하나의 리뷰만 작성 가능
  unique(lab_id, user_email)
);

-- 연구실 리뷰 인덱스
create index if not exists idx_lab_review_lab_id on lab_review(lab_id);
create index if not exists idx_lab_review_user_email on lab_review(user_email);
create index if not exists idx_lab_review_created_at on lab_review(created_at desc);

-- 연구실별 평균 점수 뷰
create or replace view lab_review_summary as
select 
  lab_id,
  count(*) as review_count,
  round(avg(atmosphere), 2) as avg_atmosphere,
  round(avg(work_life_balance), 2) as avg_work_life_balance,
  round(avg(professor_communication), 2) as avg_professor_communication,
  round(avg(research_environment), 2) as avg_research_environment,
  round(avg(overall_satisfaction), 2) as avg_overall_satisfaction,
  round(avg((atmosphere + work_life_balance + professor_communication + research_environment + overall_satisfaction) / 5.0), 2) as avg_total_score
from lab_review
group by lab_id;

