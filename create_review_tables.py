import psycopg2
from psycopg2 import sql

# Neon 데이터베이스 연결 정보
DATABASE_URL = "postgresql://neondb_owner:npg_skJBF3H6WZqG@ep-billowing-frost-a1wz2pt5-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&options=endpoint%3Dep-billowing-frost-a1wz2pt5"

def create_review_tables():
    """Neon 데이터베이스에 lab_review 테이블과 lab_review_summary 뷰를 생성합니다."""
    
    # lab_review 테이블 생성 SQL
    create_lab_review_table = """
    CREATE TABLE IF NOT EXISTS lab_review (
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
    """
    
    # lab_review 인덱스 생성 SQL
    create_indexes = """
    CREATE INDEX IF NOT EXISTS idx_lab_review_lab_id ON lab_review(lab_id);
    CREATE INDEX IF NOT EXISTS idx_lab_review_user_email ON lab_review(user_email);
    CREATE INDEX IF NOT EXISTS idx_lab_review_created_at ON lab_review(created_at desc);
    """
    
    # lab_review_summary 뷰 생성 SQL
    create_lab_review_summary_view = """
    CREATE OR REPLACE VIEW lab_review_summary AS
    SELECT 
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
    FROM lab_review
    GROUP BY lab_id;
    """
    
    conn = None
    cursor = None
    try:
        # 데이터베이스 연결
        print("🔗 Neon 데이터베이스에 연결 중...")
        conn = psycopg2.connect(DATABASE_URL)
        cursor = conn.cursor()
        
        # lab_review 테이블 생성
        print("📋 lab_review 테이블 생성 중...")
        cursor.execute(create_lab_review_table)
        
        # 인덱스 생성
        print("🔍 lab_review 인덱스 생성 중...")
        cursor.execute(create_indexes)
        
        # lab_review_summary 뷰 생성
        print("📊 lab_review_summary 뷰 생성 중...")
        cursor.execute(create_lab_review_summary_view)
        
        # 변경사항 커밋
        conn.commit()
        print("✅ 모든 테이블과 뷰가 성공적으로 생성되었습니다!")
        
        # 생성된 테이블 확인
        cursor.execute("SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' AND table_name IN ('lab_review', 'lab_review_summary')")
        tables = cursor.fetchall()
        print(f"📋 생성된 테이블/뷰: {[table[0] for table in tables]}")
        
    except Exception as e:
        print(f"❌ 오류 발생: {e}")
        if conn:
            conn.rollback()
    finally:
        if cursor:
            cursor.close()
        if conn:
            conn.close()
            print("🔌 데이터베이스 연결이 종료되었습니다.")

if __name__ == "__main__":
    create_review_tables() 