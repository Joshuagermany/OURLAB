import psycopg2

# 로컬 데이터베이스 연결
LOCAL_DATABASE_URL = "postgresql://apple@localhost:5432/ourlab"

conn = psycopg2.connect(LOCAL_DATABASE_URL)
cursor = conn.cursor()

print("=== 로컬 데이터베이스 커뮤니티 테이블 구조 확인 ===")

# community_post 테이블 구조 확인
cursor.execute("""
    SELECT column_name, data_type, is_nullable
    FROM information_schema.columns
    WHERE table_name = 'community_post'
    ORDER BY ordinal_position
""")
print("\ncommunity_post 테이블:")
for row in cursor.fetchall():
    print(f"  {row[0]}: {row[1]} ({'NULL' if row[2] == 'YES' else 'NOT NULL'})")

# community_comment 테이블 구조 확인
cursor.execute("""
    SELECT column_name, data_type, is_nullable
    FROM information_schema.columns
    WHERE table_name = 'community_comment'
    ORDER BY ordinal_position
""")
print("\ncommunity_comment 테이블:")
for row in cursor.fetchall():
    print(f"  {row[0]}: {row[1]} ({'NULL' if row[2] == 'YES' else 'NOT NULL'})")

# community_reply 테이블 구조 확인
cursor.execute("""
    SELECT column_name, data_type, is_nullable
    FROM information_schema.columns
    WHERE table_name = 'community_reply'
    ORDER BY ordinal_position
""")
print("\ncommunity_reply 테이블:")
for row in cursor.fetchall():
    print(f"  {row[0]}: {row[1]} ({'NULL' if row[2] == 'YES' else 'NOT NULL'})")

# community_post_like 테이블 구조 확인
cursor.execute("""
    SELECT column_name, data_type, is_nullable
    FROM information_schema.columns
    WHERE table_name = 'community_post_like'
    ORDER BY ordinal_position
""")
print("\ncommunity_post_like 테이블:")
for row in cursor.fetchall():
    print(f"  {row[0]}: {row[1]} ({'NULL' if row[2] == 'YES' else 'NOT NULL'})")

cursor.close()
conn.close() 