import psycopg2
import os
from dotenv import load_dotenv

load_dotenv()

# Neon 데이터베이스 연결
DATABASE_URL = os.getenv('DATABASE_URL')
if not DATABASE_URL:
    # 직접 설정
    DATABASE_URL = "postgresql://neondb_owner:npg_skJBF3H6WZqG@ep-billowing-frost-a1wz2pt5-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&options=endpoint%3Dep-billowing-frost-a1wz2pt5"

conn = psycopg2.connect(DATABASE_URL)
cursor = conn.cursor()

print("=== Neon 데이터베이스 현재 상태 ===")

# 1. University 테이블 확인
cursor.execute("SELECT COUNT(*) FROM university")
university_count = cursor.fetchone()[0]
print(f"1. University 테이블: {university_count}개")

# 2. Department 테이블 확인
cursor.execute("SELECT COUNT(*) FROM department")
department_count = cursor.fetchone()[0]
print(f"2. Department 테이블: {department_count}개")

# 3. Lab 테이블 확인
cursor.execute("SELECT COUNT(*) FROM lab")
lab_count = cursor.fetchone()[0]
print(f"3. Lab 테이블: {lab_count}개")

# 4. University별 Department 수 확인
print("\n=== University별 Department 수 (상위 10개) ===")
cursor.execute("""
    SELECT u.name_ko, COUNT(d.id) as dept_count
    FROM university u
    LEFT JOIN department d ON u.id = d.university_id
    GROUP BY u.id, u.name_ko
    ORDER BY dept_count DESC
    LIMIT 10
""")
for row in cursor.fetchall():
    print(f"  {row[0]}: {row[1]}개")

# 5. Department별 Lab 수 확인
print("\n=== Department별 Lab 수 (상위 10개) ===")
cursor.execute("""
    SELECT u.name_ko, d.name_ko, COUNT(l.id) as lab_count
    FROM university u
    JOIN department d ON u.id = d.university_id
    LEFT JOIN lab l ON d.id = l.department_id
    GROUP BY u.id, u.name_ko, d.id, d.name_ko
    ORDER BY lab_count DESC
    LIMIT 10
""")
for row in cursor.fetchall():
    print(f"  {row[0]} - {row[1]}: {row[2]}개")

# 6. 전체 통계
print("\n=== 전체 통계 ===")
print(f"  총 대학교: {university_count}개")
print(f"  총 학과: {department_count}개")
print(f"  총 연구실: {lab_count}개")
print(f"  평균 학과/대학교: {department_count/university_count:.1f}개")
print(f"  평균 연구실/학과: {lab_count/department_count:.1f}개")

cursor.close()
conn.close()

print("\n데이터 확인 완료!") 