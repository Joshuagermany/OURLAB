import os
import json
import argparse
import pandas as pd
import psycopg
from psycopg.rows import dict_row
from dotenv import load_dotenv

load_dotenv()

PG_DSN = os.getenv("PG_DSN", "postgresql://ourlab:ourlab@localhost:5432/ourlab")
BASE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))


def upsert_universities(conn: psycopg.Connection, df: pd.DataFrame) -> None:
    with conn.cursor() as cur:
        for _, row in df.iterrows():
            official_code = str(row.get("official_code") or "").strip()
            if official_code:
                cur.execute(
                    """
                    insert into university (
                      official_code, name_ko, name_en, type, region, homepage_url, email_domain, address, source
                    ) values (
                      %(official_code)s, %(name_ko)s, %(name_en)s, %(type)s, %(region)s, %(homepage_url)s, %(email_domain)s, %(address)s, 'seed_csv'
                    )
                    on conflict (official_code) do update set
                      name_ko = excluded.name_ko,
                      name_en = excluded.name_en,
                      type = excluded.type,
                      region = excluded.region,
                      homepage_url = excluded.homepage_url,
                      email_domain = excluded.email_domain,
                      address = excluded.address,
                      updated_at = now();
                    """,
                    row.to_dict(),
                )
            else:
                cur.execute(
                    "select id from university where name_ko = %(name_ko)s limit 1",
                    {"name_ko": str(row.get("name_ko") or "").strip()},
                )
                found = cur.fetchone()
                if found:
                    cur.execute(
                        """
                        update university
                        set name_en = %(name_en)s,
                            type = %(type)s,
                            region = %(region)s,
                            homepage_url = %(homepage_url)s,
                            email_domain = %(email_domain)s,
                            address = %(address)s,
                            updated_at = now()
                        where id = %(id)s
                        """,
                        {
                            "id": found[0],
                            "name_en": row.get("name_en"),
                            "type": row.get("type"),
                            "region": row.get("region"),
                            "homepage_url": row.get("homepage_url"),
                            "email_domain": row.get("email_domain"),
                            "address": row.get("address"),
                        },
                    )
                else:
                    cur.execute(
                        """
                        insert into university (
                          official_code, name_ko, name_en, type, region, homepage_url, email_domain, address, source
                        ) values (
                          null, %(name_ko)s, %(name_en)s, %(type)s, %(region)s, %(homepage_url)s, %(email_domain)s, %(address)s, 'seed_csv'
                        )
                        """,
                        row.to_dict(),
                    )


def clear_departments_table(conn: psycopg.Connection) -> None:
    """departments 테이블의 모든 데이터를 삭제합니다."""
    with conn.cursor() as cur:
        cur.execute("DELETE FROM department;")
        conn.commit()
    print("Departments table cleared")


def upsert_departments(conn: psycopg.Connection, df: pd.DataFrame) -> None:
    # 먼저 departments 테이블을 완전히 지웁니다
    clear_departments_table(conn)
    
    with conn.cursor(row_factory=dict_row) as cur:
        for _, row in df.iterrows():
            official_code = str(row.get("university_official_code") or "").strip()
            univ_name = str(row.get("university_name_ko") or "").strip()

            univ = None
            if official_code:
                cur.execute(
                    "select id from university where official_code = %(code)s limit 1",
                    {"code": official_code},
                )
                univ = cur.fetchone()
            if not univ and univ_name:
                cur.execute(
                    "select id from university where name_ko = %(name)s limit 1",
                    {"name": univ_name},
                )
                univ = cur.fetchone()
            if not univ:
                print(f"[WARN] University not found for department row: {row.to_dict()}")
                continue
            if not univ or len(univ) == 0:
                print(f"[WARN] University result is empty for department row: {row.to_dict()}")
                continue
            cur.execute(
                """
                insert into department (
                  university_id, name_ko, name_en, parent_college, degree_bachelor, degree_master, degree_phd, source
                ) values (
                  %(university_id)s, %(name_ko)s, %(name_en)s, %(parent_college)s, %(degree_bachelor)s, %(degree_master)s, %(degree_phd)s, 'seed_csv'
                )
                on conflict (university_id, name_ko) do update set
                  name_en = excluded.name_en,
                  parent_college = excluded.parent_college,
                  degree_bachelor = excluded.degree_bachelor,
                  degree_master = excluded.degree_master,
                  degree_phd = excluded.degree_phd,
                  updated_at = now();
                """,
                {
                    "university_id": univ["id"] if isinstance(univ, dict) else univ[0],
                    "name_ko": str(row.get("department_name_ko") or "").strip(),
                    "name_en": (str(row.get("department_name_en")).strip() if row.get("department_name_en") is not None else None),
                    "parent_college": (str(row.get("parent_college")).strip() if row.get("parent_college") is not None else None),
                    "degree_bachelor": bool(row.get("degree_bachelor", True)),
                    "degree_master": bool(row.get("degree_master", True)),
                    "degree_phd": bool(row.get("degree_phd", True)),
                },
            )


def upsert_labs(conn: psycopg.Connection, df: pd.DataFrame) -> None:
    with conn.cursor(row_factory=dict_row) as cur:
        for _, row in df.iterrows():
            univ_name = str(row.get("university_name_ko") or "").strip()
            dept_name = str(row.get("department_name_ko") or "").strip()
            lab_name = str(row.get("lab_name_ko") or "").strip()
            professor_name = (str(row.get("professor_name")).strip() if row.get("professor_name") is not None else None)
            homepage_url = (str(row.get("homepage_url")).strip() if row.get("homepage_url") is not None else None)

            if not univ_name or not dept_name or not lab_name:
                continue

            cur.execute(
                "select id from university where name_ko = %(name)s limit 1",
                {"name": univ_name},
            )
            univ = cur.fetchone()
            if not univ:
                print(f"[WARN] University not found for lab row: {row.to_dict()}")
                continue

            cur.execute(
                "select id from department where university_id = %(uid)s and name_ko = %(dname)s limit 1",
                {"uid": univ[0], "dname": dept_name},
            )
            dept = cur.fetchone()
            if not dept:
                print(f"[WARN] Department not found for lab row: {row.to_dict()}")
                continue

            cur.execute(
                """
                insert into lab (university_id, department_id, name_ko, name_en, professor_name, homepage_url, source)
                values (%(university_id)s, %(department_id)s, %(name_ko)s, %(name_en)s, %(professor_name)s, %(homepage_url)s, 'seed_csv')
                on conflict (department_id, name_ko) do update set
                  name_en = excluded.name_en,
                  professor_name = excluded.professor_name,
                  homepage_url = excluded.homepage_url,
                  updated_at = now();
                """,
                {
                    "university_id": univ[0],
                    "department_id": dept[0],
                    "name_ko": lab_name,
                    "name_en": None,
                    "professor_name": professor_name,
                    "homepage_url": homepage_url,
                },
            )


def load_graduate_schools_from_seed(conn: psycopg.Connection, seed_file: str) -> None:
    """seed_loader.csv에서 대학원 정보를 추출하여 데이터베이스에 반영"""
    print("Loading graduate schools from seed_loader.csv...")
    
    # CSV 파일 읽기
    df = pd.read_csv(seed_file)
    
    # 대학원 데이터만 필터링 (대학구분이 '대학원'인 경우)
    grad_df = df[df['대학구분'] == '대학원'].copy()
    
    print(f"Found {len(grad_df)} graduate school records")
    
    with conn.cursor(row_factory=dict_row) as cur:
        for _, row in grad_df.iterrows():
            school_name = str(row.get('학교명', '')).strip()
            department_name = str(row.get('학부_과(전공)명', '')).strip()
            degree_process = str(row.get('학위과정', '')).strip()
            college_name = str(row.get('단과대학명', '')).strip()
            
            if not school_name or not department_name:
                continue
            
            # 대학원 이름 정리 (예: "한국과학기술원 일반대학원" -> "한국과학기술원")
            base_school_name = school_name
            if '대학원' in school_name:
                # 다양한 대학원 접미사 제거
                suffixes = [
                    ' 일반대학원', ' 특수대학원', ' 산업대학원', ' 전문대학원', ' 경영대학원',
                    ' 교육대학원', ' 행정대학원', ' 공학대학원', ' 보건대학원', ' 의료대학원',
                    ' 문화대학원', ' 예술대학원', ' 신학대학원', ' 법무대학원', ' 경찰대학원',
                    ' 정보대학원', ' 미디어대학원', ' 국제대학원', ' 환경대학원', ' 융합대학원',
                    ' 창업대학원', ' 복지대학원', ' 상담대학원', ' 치료대학원', ' 스포츠대학원',
                    ' 항공대학원', ' 해사대학원', ' 철도대학원', ' 교통대학원', ' 물류대학원',
                    ' 보안대학원', ' 정책대학원', ' 공공대학원', ' 산업대학원', ' 기술대학원',
                    ' 과학대학원', ' 의료보건대학원', ' 사회복지대학원', ' 문화예술대학원',
                    ' 글로벌대학원', ' 융복합대학원', ' 미래융합대학원', ' 창의융합대학원',
                    ' 산업융합대학원', ' 정보융합대학원', ' 스마트융합대학원', ' AI대학원',
                    ' 데이터사이언스대학원', ' 메타버스전문대학원', ' IT융합대학원',
                    ' 보건복지대학원', ' 휴먼서비스대학원', ' 사회문화대학원', ' 경영행정대학원',
                    ' 산업과학대학원', ' 정보통신대학원', ' 소프트웨어융합대학원',
                    ' 문화유산전문대학원', ' 미래문화유산대학원', ' 산업복지대학원',
                    ' 교통ITS대학원', ' 동북아물류대학원', ' 의료보건산업대학원',
                    ' 사회적경제경영대학원', ' 산업・경영대학원', ' 글로컬휴먼대학원',
                    ' 정보산업대학원', ' 공공안전정책대학원', ' 경영행정복지대학원',
                    ' 군사경찰행정대학원', ' 특수치료대학원', ' 한방산업대학원',
                    ' 보건・복지대학원', ' 융합기술에너지대학원', ' 휴먼산업대학원',
                    ' 상담・산업대학원', ' 문화관광복지대학원', ' 철도융합대학원',
                    ' 정신분석대학원', ' 산업정보대학원', ' 상담치료대학원',
                    ' 보건과학대학원', ' 정경대학원', ' 아트퓨전디자인대학원',
                    ' 국제신학선교대학원', ' 체육대학원', ' 건설대학원', ' 문화기술대학원',
                    ' 심리융합과학대학원', ' 성경과교회대학원', ' 경영행정대학원',
                    ' 정치행정언론대학원', ' 사회과학대학원', ' 건강증진대학원',
                    ' 사회복지카리타스대학원', ' 휴먼케어융합대학원', ' 공공정책대학원',
                    ' 통일대학원', ' 교육정책전문대학원', ' 행정전문대학원',
                    ' 융합과학대학원', ' 임상간호대학원', ' 미래재활복지대학원',
                    ' 글로벌리더십경영융합대학원', ' 다문화교육복지대학원', ' 신학대학원',
                    ' 식물방역대학원', ' 문화전문대학원', ' IT정책전문대학원',
                    ' 융합과학대학원', ' 경영(전문)대학원', ' 창의융합대학원',
                    ' 산업문화대학원', ' 항공융합대학원', ' 미래복지상담대학원',
                    ' 국방과학대학원', ' 환경보건대학원', ' 스포츠융복합대학원',
                    ' 시민평화대학원', ' AI세무・회계대학원', ' 기록정보과학전문대학원',
                    ' 산업문화대학원', ' 원격대학원', ' 교육서비스과학대학원',
                    ' 경영정책과학대학원', ' 사회문화・행정복지대학원', ' 데이터사이언스대학원',
                    ' 복지산업대학원', ' 산학협력대학원', ' 법과학대학원', ' 미래융합대학원',
                    ' 국제학대학원', ' 정책대학원', ' 스마트융합대학원', ' 공공정책대학원',
                    ' 산업과학대학원', ' 경제대학원', ' 문화예술경영대학원', ' 정보보호대학원',
                    ' 경영(전문)대학원', ' 글로벌지식경영대학원', ' 저널리즘대학원',
                    ' 문화예술대학원', ' 정경대학원', ' 아트퓨전디자인대학원',
                    ' 국제대학원', ' 환경대학원', ' 보건대학원', ' 보건의료경영대학원',
                    ' 경영사회복지대학원', ' 디자인대학원', ' 소프트웨어융합대학원',
                    ' 법무대학원', ' 행정법무대학원', ' 경영문화대학원', ' 교육대학원',
                    ' 휴먼텍대학원', ' 물류전문대학원', ' 정보보호대학원', ' 경영대학원',
                    ' 경제통상대학원', ' 국제학대학원', ' 보건대학원', ' 사회복지카리타스대학원',
                    ' 건강증진대학원', ' 정치행정언론대학원', ' 사회과학대학원',
                    ' (WISE) 사회과학대학원', ' (ERICA) 융합산업대학원', ' (ERICA) 대학원',
                    ' (글로컬) 창의융합대학원', ' (미래) 보건과학대학원', ' (미래) 정경대학원',
                    ' (미래) 융합과학대학원', ' (세종) 창업경영대학원', ' (세종) 행정전문대학원',
                    ' (세종) 융합과학대학원', ' (글로컬) 창의융합대학원'
                ]
                for suffix in suffixes:
                    base_school_name = base_school_name.replace(suffix, '')
            
            # 특별한 대학교 이름 매핑
            school_mapping = {
                '한국과학기술원': '카이스트(KAIST/한국과학기술원)',
                '울산과학기술원': '울산과학기술원(UNIST)',
                '광주과학기술원': '광주과학기술원(GIST)',
                '대구경북과학기술원': '대구경북과학기술원(DGIST)',
                '포항공과대학교': '포항공과대학교(POSTECH)',
                '서울대학교': '서울대학교(SNU)',
                '연세대학교': '연세대학교(YU)',
                '고려대학교': '고려대학교(KU)',
                '성균관대학교': '성균관대학교(SKKU)',
                '한양대학교': '한양대학교(HYU)',
                '경희대학교': '경희대학교(KHU)',
                '중앙대학교': '중앙대학교(CAU)',
                '서강대학교': '서강대학교(SGU)',
                '건국대학교': '건국대학교(KU)',
                '동국대학교': '동국대학교(DKU)',
                '국민대학교': '국민대학교(KMU)',
                '숭실대학교': '숭실대학교(SSU)',
                '단국대학교': '단국대학교(DKU)',
                '아주대학교': '아주대학교(AJU)',
                '인하대학교': '인하대학교(INHA)',
                '전남대학교': '전남대학교(JNU)',
                '전북대학교': '전북대학교(JBNU)',
                '충남대학교': '충남대학교(CNU)',
                '충북대학교': '충북대학교(CBU)',
                '경북대학교': '경북대학교(KNU)',
                '부산대학교': '부산대학교(PNU)',
                '부경대학교': '부경대학교(PKNU)',
                '경상국립대학교': '경상국립대학교(GNU)',
                '제주대학교': '제주대학교(JJU)',
                '강원대학교': '강원대학교(KNU)',
                '강릉원주대학교': '강릉원주대학교(GWNU)',
                '공주대학교': '공주대학교(KNU)',
                '순천향대학교': '순천향대학교(SCH)',
                '상명대학교': '상명대학교(SMU)',
                '명지대학교': '명지대학교(MJU)',
                '세종대학교': '세종대학교(SJU)',
                '홍익대학교': '홍익대학교(HIU)',
                '광운대학교': '광운대학교(KWU)',
                '한림대학교': '한림대학교(HU)',
                '원광대학교': '원광대학교(WKU)',
                '전주대학교': '전주대학교(JJU)',
                '목포대학교': '목포대학교(MPU)',
                '군산대학교': '군산대학교(KSU)',
                '조선대학교': '조선대학교(CSU)',
                '동아대학교': '동아대학교(DU)',
                '부산가톨릭대학교': '부산가톨릭대학교(PCU)',
                '대구가톨릭대학교': '대구가톨릭대학교(DCU)',
                '가톨릭대학교': '가톨릭대학교(CU)',
                '가톨릭관동대학교': '가톨릭관동대학교(CGU)',
                '대구한의대학교': '대구한의대학교(DHU)',
                '한의대학교': '한의대학교(KHU)',
                '대구대학교': '대구대학교(DGU)',
                '대구교육대학교': '대구교육대학교(DGUE)',
                '서울교육대학교': '서울교육대학교(SNUE)',
                '경인교육대학교': '경인교육대학교(GINUE)',
                '부산교육대학교': '부산교육대학교(BNUE)',
                '전주교육대학교': '전주교육대학교(JNUE)',
                '공주교육대학교': '공주교육대학교(KNUE)',
                '청주교육대학교': '청주교육대학교(CJUE)',
                '진주교육대학교': '진주교육대학교(JNUE)',
                '광주교육대학교': '광주교육대학교(GNUE)',
                '부산외국어대학교': '부산외국어대학교(BUFS)',
                '한국외국어대학교': '한국외국어대학교(HUFS)',
                '한국해양대학교': '한국해양대학교(KMU)',
                '한국항공대학교': '한국항공대학교(KAU)',
                '한국교원대학교': '한국교원대학교(KNUE)',
                '한국기술교육대학교': '한국기술교육대학교(KOREATECH)',
                '한국공학대학교': '한국공학대학교(KUT)',
                '한국전통문화대학교': '한국전통문화대학교(KNUCH)',
                '한국에너지공과대학교': '한국에너지공과대학교(KENTECH)',
                '한국방송통신대학교': '한국방송통신대학교(KNOU)',
                '한국체육대학교': '한국체육대학교(KNSU)',
                '한국예술종합학교': '한국예술종합학교(KARTS)',
                '한국예술대학교': '한국예술대학교(KARTS)',
                '한국영화아카데미': '한국영화아카데미(KAFA)',
                '한국과학기술원': '카이스트(KAIST/한국과학기술원)',
                '울산과학기술원': '울산과학기술원(UNIST)',
                '광주과학기술원': '광주과학기술원(GIST)',
                '대구경북과학기술원': '대구경북과학기술원(DGIST)',
                '포항공과대학교': '포항공과대학교(POSTECH)',
                '서울대학교': '서울대학교(SNU)',
                '연세대학교': '연세대학교(YU)',
                '고려대학교': '고려대학교(KU)',
                '성균관대학교': '성균관대학교(SKKU)',
                '한양대학교': '한양대학교(HYU)',
                '경희대학교': '경희대학교(KHU)',
                '중앙대학교': '중앙대학교(CAU)',
                '서강대학교': '서강대학교(SGU)',
                '건국대학교': '건국대학교(KU)',
                '동국대학교': '동국대학교(DKU)',
                '국민대학교': '국민대학교(KMU)',
                '숭실대학교': '숭실대학교(SSU)',
                '단국대학교': '단국대학교(DKU)',
                '아주대학교': '아주대학교(AJU)',
                '인하대학교': '인하대학교(INHA)',
                '전남대학교': '전남대학교(JNU)',
                '전북대학교': '전북대학교(JBNU)',
                '충남대학교': '충남대학교(CNU)',
                '충북대학교': '충북대학교(CBU)',
                '경북대학교': '경북대학교(KNU)',
                '부산대학교': '부산대학교(PNU)',
                '부경대학교': '부경대학교(PKNU)',
                '경상국립대학교': '경상국립대학교(GNU)',
                '제주대학교': '제주대학교(JJU)',
                '강원대학교': '강원대학교(KNU)',
                '강릉원주대학교': '강릉원주대학교(GWNU)',
                '공주대학교': '공주대학교(KNU)',
                '순천향대학교': '순천향대학교(SCH)',
                '상명대학교': '상명대학교(SMU)',
                '명지대학교': '명지대학교(MJU)',
                '세종대학교': '세종대학교(SJU)',
                '홍익대학교': '홍익대학교(HIU)',
                '광운대학교': '광운대학교(KWU)',
                '한림대학교': '한림대학교(HU)',
                '원광대학교': '원광대학교(WKU)',
                '전주대학교': '전주대학교(JJU)',
                '목포대학교': '목포대학교(MPU)',
                '군산대학교': '군산대학교(KSU)',
                '조선대학교': '조선대학교(CSU)',
                '동아대학교': '동아대학교(DU)',
                '부산가톨릭대학교': '부산가톨릭대학교(PCU)',
                '대구가톨릭대학교': '대구가톨릭대학교(DCU)',
                '가톨릭대학교': '가톨릭대학교(CU)',
                '가톨릭관동대학교': '가톨릭관동대학교(CGU)',
                '대구한의대학교': '대구한의대학교(DHU)',
                '한의대학교': '한의대학교(KHU)',
                '대구대학교': '대구대학교(DGU)',
                '대구교육대학교': '대구교육대학교(DGUE)',
                '서울교육대학교': '서울교육대학교(SNUE)',
                '경인교육대학교': '경인교육대학교(GINUE)',
                '부산교육대학교': '부산교육대학교(BNUE)',
                '전주교육대학교': '전주교육대학교(JNUE)',
                '공주교육대학교': '공주교육대학교(KNUE)',
                '청주교육대학교': '청주교육대학교(CJUE)',
                '진주교육대학교': '진주교육대학교(JNUE)',
                '광주교육대학교': '광주교육대학교(GNUE)',
                '부산외국어대학교': '부산외국어대학교(BUFS)',
                '한국외국어대학교': '한국외국어대학교(HUFS)',
                '한국해양대학교': '한국해양대학교(KMU)',
                '한국항공대학교': '한국항공대학교(KAU)',
                '한국교원대학교': '한국교원대학교(KNUE)',
                '한국기술교육대학교': '한국기술교육대학교(KOREATECH)',
                '한국공학대학교': '한국공학대학교(KUT)',
                '한국전통문화대학교': '한국전통문화대학교(KNUCH)',
                '한국에너지공과대학교': '한국에너지공과대학교(KENTECH)',
                '한국방송통신대학교': '한국방송통신대학교(KNOU)',
                '한국체육대학교': '한국체육대학교(KNSU)',
                '한국예술종합학교': '한국예술종합학교(KARTS)',
                '한국예술대학교': '한국예술대학교(KARTS)',
                '한국영화아카데미': '한국영화아카데미(KAFA)'
            }
            
            # 매핑된 이름이 있으면 사용
            if base_school_name in school_mapping:
                base_school_name = school_mapping[base_school_name]
            
            # 대학교 찾기
            cur.execute(
                "select id from university where name_ko = %(name)s limit 1",
                {"name": base_school_name},
            )
            univ = cur.fetchone()
            
            if not univ:
                print(f"[WARN] University not found for graduate school: {base_school_name}")
                continue
            
            # 학위 과정 파싱
            degree_bachelor = False
            degree_master = '석사' in degree_process or '석박사통합' in degree_process
            degree_phd = '박사' in degree_process or '석박사통합' in degree_process
            
            # 학과 정보 업데이트 또는 추가
            cur.execute(
                """
                insert into department (
                  university_id, name_ko, name_en, parent_college, degree_bachelor, degree_master, degree_phd, source
                ) values (
                  %(university_id)s, %(name_ko)s, %(name_en)s, %(parent_college)s, %(degree_bachelor)s, %(degree_master)s, %(degree_phd)s, 'seed_csv_graduate'
                )
                on conflict (university_id, name_ko) do update set
                  degree_master = excluded.degree_master,
                  degree_phd = excluded.degree_phd,
                  updated_at = now();
                """,
                {
                    "university_id": univ["id"] if isinstance(univ, dict) else univ[0],
                    "name_ko": department_name,
                    "name_en": None,
                    "parent_college": college_name if college_name != '단과대구분없음' else None,
                    "degree_bachelor": degree_bachelor,
                    "degree_master": degree_master,
                    "degree_phd": degree_phd,
                },
            )
    
    print("Graduate schools loaded successfully.")


def rename_columns_with_mapping(df: pd.DataFrame, mapping: dict) -> pd.DataFrame:
    if not mapping:
        return df
    return df.rename(columns={v: k for k, v in mapping.items() if v in df.columns})


def require_columns(df: pd.DataFrame, required: list[str], label: str) -> None:
    missing = [c for c in required if c not in df.columns]
    if missing:
        raise SystemExit(
            f"[{label}] CSV에 필요한 컬럼이 없습니다: {missing}. 현재 컬럼: {list(df.columns)}"
        )


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="OURLAB seed CSV loader")
    parser.add_argument(
        "--universities",
        default=os.getenv("UNIVERSITIES_CSV", os.path.join(BASE_DIR, "db", "seed", "universities.csv")),
        help="대학교 CSV 경로",
    )
    parser.add_argument(
        "--departments",
        default=os.getenv("DEPARTMENTS_CSV", os.path.join(BASE_DIR, "db", "seed", "departments.csv")),
        help="학과 CSV 경로",
    )
    parser.add_argument(
        "--mapping",
        default=os.getenv("SEED_MAPPING_JSON", ""),
        help="컬럼 매핑 JSON 경로(선택). 예: mapping.example.json",
    )
    parser.add_argument(
        "--labs",
        default=os.getenv("LABS_CSV", os.path.join(BASE_DIR, "db", "seed", "labs.csv")),
        help="연구실 CSV 경로",
    )
    parser.add_argument(
        "--seed-loader",
        default=os.getenv("SEED_LOADER_CSV", os.path.join(BASE_DIR, "db", "seed", "seed_loader.csv")),
        help="원본 시드 로더 CSV 경로",
    )
    parser.add_argument(
        "--only",
        choices=["universities", "departments", "labs", "graduate"],
        help="특정 대상만 적재",
    )
    return parser.parse_args()


def load_mapping(path: str) -> dict:
    if not path:
        return {}
    with open(path, "r", encoding="utf-8") as f:
        return json.load(f)


def main() -> None:
    args = parse_args()
    mapping = load_mapping(args.mapping)

    univ_required = [
        "official_code",
        "name_ko",
        "name_en",
        "type",
        "region",
        "homepage_url",
        "email_domain",
        "address",
    ]
    dept_required = [
        "university_official_code",
        "university_name_ko",
        "department_name_ko",
        "department_name_en",
        "parent_college",
        "degree_bachelor",
        "degree_master",
        "degree_phd",
    ]

    univ_df = pd.read_csv(args.universities)
    dept_df = pd.read_csv(args.departments)
    labs_df = pd.read_csv(args.labs)

    univ_df = rename_columns_with_mapping(univ_df, mapping.get("universities", {}))
    dept_df = rename_columns_with_mapping(dept_df, mapping.get("departments", {}))

    require_columns(univ_df, univ_required, "universities")
    require_columns(dept_df, dept_required, "departments")

    with psycopg.connect(PG_DSN, autocommit=True) as conn:
        if args.only in (None, "universities"):
            upsert_universities(conn, univ_df)
        if args.only in (None, "departments"):
            upsert_departments(conn, dept_df)
        if args.only in (None, "labs"):
            upsert_labs(conn, labs_df)
        if args.only in (None, "graduate"):
            load_graduate_schools_from_seed(conn, args.seed_loader)

    print("Seed load completed.")


if __name__ == "__main__":
    main()

