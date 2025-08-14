import os
import psycopg
from dotenv import load_dotenv

load_dotenv()

PG_DSN = os.getenv("PG_DSN", "postgresql://ourlab:ourlab@localhost:5432/ourlab")

def apply_schema():
    """데이터베이스 스키마를 적용합니다."""
    print("데이터베이스 스키마를 적용합니다...")
    
    # 스키마 파일 읽기
    schema_path = os.path.join(os.path.dirname(__file__), "..", "db", "schema.sql")
    with open(schema_path, 'r', encoding='utf-8') as f:
        schema_sql = f.read()
    
    # 데이터베이스에 스키마 적용
    with psycopg.connect(PG_DSN) as conn:
        with conn.cursor() as cur:
            cur.execute(schema_sql)
            conn.commit()
    
    print("✅ 스키마 적용 완료!")

if __name__ == "__main__":
    apply_schema() 