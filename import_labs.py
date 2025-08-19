import psycopg2
import csv
import os
from dotenv import load_dotenv

load_dotenv()

# 데이터베이스 연결
conn = psycopg2.connect(
    host="localhost",
    port=5432,
    database="ourlab",
    user="postgres",
    password="postgres"
)

cursor = conn.cursor()

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

# labs.csv 파일 읽기
with open('../db/seed/labs.csv', 'r', encoding='utf-8') as file:
    reader = csv.DictReader(file)
    
    for row in reader:
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
            """, (university_id, department_id, lab_name, professor_name, homepage_url))
        else:
            print(f"매핑을 찾을 수 없음: {university_name} - {department_name}")

conn.commit()
cursor.close()
conn.close()

print("labs.csv 데이터 삽입 완료!") 