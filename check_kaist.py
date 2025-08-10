#!/usr/bin/env python3
import psycopg
import os
from dotenv import load_dotenv

load_dotenv()

PG_DSN = os.getenv("PG_DSN", "postgresql://ourlab:ourlab@localhost:5432/ourlab")

def check_kaist_graduate():
    with psycopg.connect(PG_DSN) as conn:
        with conn.cursor() as cur:
            # 카이스트 대학교 정보 조회
            cur.execute("""
                SELECT id, name_ko, name_en, type, region
                FROM university 
                WHERE name_ko LIKE '%카이스트%' OR name_ko LIKE '%KAIST%' OR name_ko LIKE '%한국과학기술원%'
                ORDER BY name_ko;
            """)
            
            universities = cur.fetchall()
            print(f"카이스트 관련 대학교 수: {len(universities)}")
            print("\n카이스트 관련 대학교 목록:")
            print("-" * 50)
            for row in universities:
                univ_id, name_ko, name_en, type, region = row
                print(f"ID: {univ_id}, 이름: {name_ko}, 영문: {name_en}, 타입: {type}, 지역: {region}")
            
            # 카이스트 대학교의 학과 조회
            for univ_id, name_ko, name_en, type, region in universities:
                cur.execute("""
                    SELECT name_ko, degree_bachelor, degree_master, degree_phd, source
                    FROM department 
                    WHERE university_id = %s
                    ORDER BY name_ko;
                """, (univ_id,))
                
                departments = cur.fetchall()
                print(f"\n{name_ko} 학과 수: {len(departments)}")
                print("\n학과 목록:")
                print("-" * 50)
                for row in departments:
                    name, bachelor, master, phd, source = row
                    degrees = []
                    if bachelor:
                        degrees.append("학사")
                    if master:
                        degrees.append("석사")
                    if phd:
                        degrees.append("박사")
                    print(f"{name}: {', '.join(degrees)} (source: {source})")

if __name__ == "__main__":
    check_kaist_graduate() 