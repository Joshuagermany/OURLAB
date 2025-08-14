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
  
  -- 1. 연구실의 분위기
  atmosphere_level text check (atmosphere_level in ('매우 엄격함', '엄격한 편', '무난함', '프리함', '매우 프리함')),
  
  -- 2. 인건비 지급
  phd_salary text check (phd_salary in ('학비만 지급', '학비+생활비 지급', '학비+생활비+용돈 지급')),
  master_salary text check (master_salary in ('학비만 지급', '학비+생활비 지급', '학비+생활비+용돈 지급')),
  undergraduate_salary text check (undergraduate_salary in ('미지급', '소정의 연구비 지급')),
  
  -- 3. 업무 강도 / 워라밸
  daily_work_hours int check (daily_work_hours >= 0 and daily_work_hours <= 24),
  weekend_work text check (weekend_work in ('자주 있음', '종종 있음', '거의 없음')),
  overtime_frequency text check (overtime_frequency in ('자주 있음', '종종 있음', '거의 없음')),
  
  -- 4. 선배들의 진로 (최근 10명 졸업생 기준)
  career_corporate int check (career_corporate >= 0 and career_corporate <= 10),
  career_professor int check (career_professor >= 0 and career_professor <= 10),
  career_others int check (career_others >= 0 and career_others <= 10),
  
  -- 5. 교수님 평가
  idea_acceptance text check (idea_acceptance in ('학생 아이디어 적극 수용', '일부만 수용', '거의 수용하지 않음')),
  mentoring_style text check (mentoring_style in ('매우 친절하고 배려심 많음', '중립적', '까다로운 편', '비협조적')),
  research_guidance text check (research_guidance in ('큰 방향만 제시', '자율 진행 후 필요 시 보고', '세부 업무까지 직접 관여')),
  communication_style text check (communication_style in ('이메일/메신저 위주', '직접 대면 위주', '수시 연락 가능')),
  
  -- 6. 연구실의 장점 및 단점
  pros_cons text,
  
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
  -- 연구실 분위기 분포
  mode() within group (order by atmosphere_level) as most_common_atmosphere,
  
  -- 인건비 지급 현황
  mode() within group (order by phd_salary) as most_common_phd_salary,
  mode() within group (order by master_salary) as most_common_master_salary,
  mode() within group (order by undergraduate_salary) as most_common_undergraduate_salary,
  
  -- 업무 강도 평균
  round(avg(daily_work_hours), 1) as avg_daily_work_hours,
  mode() within group (order by weekend_work) as most_common_weekend_work,
  mode() within group (order by overtime_frequency) as most_common_overtime_frequency,
  
  -- 선배 진로 평균
  round(avg(career_corporate), 1) as avg_career_corporate,
  round(avg(career_professor), 1) as avg_career_professor,
  round(avg(career_others), 1) as avg_career_others,
  
  -- 교수님 평가 분포
  mode() within group (order by idea_acceptance) as most_common_idea_acceptance,
  mode() within group (order by mentoring_style) as most_common_mentoring_style,
  mode() within group (order by research_guidance) as most_common_research_guidance,
  mode() within group (order by communication_style) as most_common_communication_style
from lab_review
group by lab_id;

