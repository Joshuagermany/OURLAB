import psycopg2
import os
from dotenv import load_dotenv

load_dotenv()

# Neon 데이터베이스 연결
DATABASE_URL = "postgresql://neondb_owner:npg_skJBF3H6WZqG@ep-billowing-frost-a1wz2pt5-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&options=endpoint%3Dep-billowing-frost-a1wz2pt5"

conn = psycopg2.connect(DATABASE_URL)
cursor = conn.cursor()

print("=== Neon 데이터베이스 전체 상태 ===")

# 1. University, Department, Lab 데이터 확인
print("1. 대학교/학과/연구실 데이터:")
cursor.execute("SELECT COUNT(*) FROM university")
university_count = cursor.fetchone()[0]

cursor.execute("SELECT COUNT(*) FROM department")
department_count = cursor.fetchone()[0]

cursor.execute("SELECT COUNT(*) FROM lab")
lab_count = cursor.fetchone()[0]

print(f"  - 대학교: {university_count}개")
print(f"  - 학과: {department_count}개")
print(f"  - 연구실: {lab_count}개")

# 2. 커뮤니티 데이터 확인
print("\n2. 커뮤니티 데이터:")
cursor.execute("SELECT COUNT(*) FROM community_post")
post_count = cursor.fetchone()[0]

cursor.execute("SELECT COUNT(*) FROM community_comment")
comment_count = cursor.fetchone()[0]

cursor.execute("SELECT COUNT(*) FROM community_reply")
reply_count = cursor.fetchone()[0]

cursor.execute("SELECT COUNT(*) FROM community_post_like")
like_count = cursor.fetchone()[0]

print(f"  - 게시글: {post_count}개")
print(f"  - 댓글: {comment_count}개")
print(f"  - 대댓글: {reply_count}개")
print(f"  - 좋아요: {like_count}개")

# 3. 게시판별 게시글 수 확인
print("\n3. 게시판별 게시글 수:")
cursor.execute("""
    SELECT boards, COUNT(*) as post_count
    FROM community_post
    WHERE boards IS NOT NULL
    GROUP BY boards
    ORDER BY post_count DESC
""")
for row in cursor.fetchall():
    boards = row[0] if row[0] else ['전체']
    print(f"  - {boards}: {row[1]}개")

# 4. 최근 게시글 확인
print("\n4. 최근 게시글 (상위 5개):")
cursor.execute("""
    SELECT title, author, created_at, view_count
    FROM community_post
    ORDER BY created_at DESC
    LIMIT 5
""")
for row in cursor.fetchall():
    print(f"  - {row[0]} (작성자: {row[1]}, 조회수: {row[3]}, 작성일: {row[2]})")

# 5. 전체 통계
print("\n5. 전체 통계:")
total_data = university_count + department_count + lab_count + post_count + comment_count + reply_count + like_count
print(f"  - 총 데이터 레코드: {total_data:,}개")
print(f"  - 대학교/학과/연구실: {university_count + department_count + lab_count:,}개")
print(f"  - 커뮤니티: {post_count + comment_count + reply_count + like_count:,}개")

cursor.close()
conn.close()

print("\n데이터 확인 완료!") 