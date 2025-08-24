import psycopg2
import csv
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

print("데이터베이스 연결 성공!")

# 0. 필요한 테이블 생성
print("필요한 테이블을 생성하는 중...")

# university 테이블 생성
cursor.execute("""
CREATE TABLE IF NOT EXISTS university (
  id SERIAL PRIMARY KEY,
  official_code TEXT UNIQUE,
  name_ko TEXT NOT NULL,
  name_en TEXT,
  type TEXT,
  region TEXT,
  homepage_url TEXT,
  email_domain TEXT,
  address TEXT,
  source TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
)
""")

# department 테이블 생성
cursor.execute("""
CREATE TABLE IF NOT EXISTS department (
  id SERIAL PRIMARY KEY,
  university_id INT NOT NULL REFERENCES university(id) ON DELETE CASCADE,
  name_ko TEXT NOT NULL,
  name_en TEXT,
  parent_college TEXT,
  university_official_code TEXT,
  degree_bachelor BOOLEAN,
  degree_master BOOLEAN,
  degree_phd BOOLEAN,
  source TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (university_id, name_ko)
)
""")

# lab 테이블 생성
cursor.execute("""
CREATE TABLE IF NOT EXISTS lab (
  id SERIAL PRIMARY KEY,
  university_id INT NOT NULL REFERENCES university(id) ON DELETE CASCADE,
  department_id INT NOT NULL REFERENCES department(id) ON DELETE CASCADE,
  name_ko TEXT NOT NULL,
  name_en TEXT,
  professor_name TEXT,
  homepage_url TEXT,
  aliases JSONB DEFAULT '[]'::jsonb,
  source TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (department_id, name_ko)
)
""")

print("테이블 생성 완료!")

# 1. universities.csv 데이터 반영
print("universities.csv 데이터를 반영하는 중...")

# 기존 university 데이터 삭제
cursor.execute("DELETE FROM university")
print("기존 university 데이터 삭제 완료")

# universities.csv 파일 읽기
with open('db/seed/universities.csv', 'r', encoding='utf-8') as file:
    reader = csv.DictReader(file)
    rows = list(reader)
    total_rows = len(rows)
    
    for i, row in enumerate(rows):
        if i % 50 == 0:  # 50개마다 진행률 표시
            print(f"universities.csv 진행률: {i}/{total_rows} ({i/total_rows*100:.1f}%)")
            
        name_ko = row['name_ko']
        region = row['region']
        type_val = row['type']
        official_code = row['official_code']
        name_en = row['name_en']
        homepage_url = row['homepage_url']
        email_domain = row['email_domain']
        address = row['address']
        
        # university 테이블에 삽입
        cursor.execute("""
            INSERT INTO university (name_ko, region, type, official_code, name_en, homepage_url, email_domain, address)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
            ON CONFLICT (official_code) DO NOTHING
        """, (name_ko, region, type_val, official_code if official_code else None, name_en, homepage_url, email_domain, address))

print(f"universities.csv 데이터 삽입 완료! (총 {total_rows}개)")

# 2. departments.csv 데이터 반영
print("departments.csv 데이터를 반영하는 중...")

# 기존 department 데이터 삭제 (university와의 관계는 유지)
cursor.execute("DELETE FROM department")
print("기존 department 데이터 삭제 완료")

# departments.csv 파일 읽기
with open('db/seed/departments.csv', 'r', encoding='utf-8') as file:
    reader = csv.DictReader(file)
    rows = list(reader)
    total_rows = len(rows)
    
    for i, row in enumerate(rows):
        if i % 1000 == 0:  # 1000개마다 진행률 표시
            print(f"departments.csv 진행률: {i}/{total_rows} ({i/total_rows*100:.1f}%)")
            
        university_name = row['university_name_ko']
        parent_college = row['parent_college']
        department_name = row['department_name_ko']
        university_official_code = row['university_official_code']
        department_name_en = row['department_name_en']
        degree_bachelor = row['degree_bachelor'] == 'True'
        degree_master = row['degree_master'] == 'True'
        degree_phd = row['degree_phd'] == 'True'
        
        # university_id 찾기
        cursor.execute("SELECT id FROM university WHERE name_ko = %s", (university_name,))
        university_result = cursor.fetchone()
        
        if university_result:
            university_id = university_result[0]
            
            # department 테이블에 삽입
            cursor.execute("""
                INSERT INTO department (university_id, name_ko, name_en, parent_college, university_official_code, degree_bachelor, degree_master, degree_phd)
                VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
                ON CONFLICT (university_id, name_ko) DO NOTHING
            """, (university_id, department_name, department_name_en, parent_college, university_official_code, degree_bachelor, degree_master, degree_phd))
        else:
            print(f"University를 찾을 수 없음: {university_name}")

print(f"departments.csv 데이터 삽입 완료! (총 {total_rows}개)")

# 3. labs.csv 데이터 반영
print("labs.csv 데이터를 반영하는 중...")

# 기존 lab 데이터 삭제
cursor.execute("DELETE FROM lab")
print("기존 lab 데이터 삭제 완료")

# university와 department 매핑을 가져오기
cursor.execute("""
    SELECT u.id as university_id, u.name_ko as university_name, 
           d.id as department_id, d.name_ko as department_name 
    FROM university u 
    JOIN department d ON u.id = d.university_id
""")

mapping = {}
for row in cursor.fetchall():
    university_id, university_name, department_id, department_name = row
    key = (university_name, department_name)
    mapping[key] = (university_id, department_id)

print(f"매핑 데이터 준비 완료: {len(mapping)}개")

# labs.csv 파일 읽기
with open('db/seed/labs.csv', 'r', encoding='utf-8') as file:
    reader = csv.DictReader(file)
    rows = list(reader)
    total_rows = len(rows)
    
    for i, row in enumerate(rows):
        if i % 1000 == 0:  # 1000개마다 진행률 표시
            print(f"labs.csv 진행률: {i}/{total_rows} ({i/total_rows*100:.1f}%)")
            
        university_name = row['university_name_ko']
        department_name = row['department_name_ko']
        lab_name = row['lab_name_ko']
        professor_name = row['professor_name']
        homepage_url = row['homepage_url']
        
        key = (university_name, department_name)
        
        if key in mapping:
            university_id, department_id = mapping[key]
            
            # lab 테이블에 삽입
            cursor.execute("""
                INSERT INTO lab (university_id, department_id, name_ko, professor_name, homepage_url)
                VALUES (%s, %s, %s, %s, %s)
                ON CONFLICT (department_id, name_ko) DO NOTHING
            """, (university_id, department_id, lab_name, professor_name, homepage_url))
        else:
            print(f"매핑을 찾을 수 없음: {university_name} - {department_name}")

print(f"labs.csv 데이터 삽입 완료! (총 {total_rows}개)")

conn.commit()
cursor.close()
conn.close()

print("모든 데이터 반영 완료!") 