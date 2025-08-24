import psycopg2
import os
from dotenv import load_dotenv

load_dotenv()

# 로컬 데이터베이스 연결 (커뮤니티 데이터 추출용)
LOCAL_DATABASE_URL = "postgresql://apple@localhost:5432/ourlab"

# Neon 데이터베이스 연결
NEON_DATABASE_URL = "postgresql://neondb_owner:npg_skJBF3H6WZqG@ep-billowing-frost-a1wz2pt5-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&options=endpoint%3Dep-billowing-frost-a1wz2pt5"

print("=== 커뮤니티 데이터 마이그레이션 시작 ===")

# 1. 로컬 데이터베이스에서 커뮤니티 데이터 확인
print("1. 로컬 데이터베이스에서 커뮤니티 데이터 확인 중...")
local_conn = psycopg2.connect(LOCAL_DATABASE_URL)
local_cursor = local_conn.cursor()

# 커뮤니티 데이터 개수 확인
local_cursor.execute("SELECT COUNT(*) FROM community_post")
post_count = local_cursor.fetchone()[0]

local_cursor.execute("SELECT COUNT(*) FROM community_comment")
comment_count = local_cursor.fetchone()[0]

local_cursor.execute("SELECT COUNT(*) FROM community_reply")
reply_count = local_cursor.fetchone()[0]

local_cursor.execute("SELECT COUNT(*) FROM community_post_like")
like_count = local_cursor.fetchone()[0]

print(f"  - 게시글: {post_count}개")
print(f"  - 댓글: {comment_count}개")
print(f"  - 대댓글: {reply_count}개")
print(f"  - 좋아요: {like_count}개")

# 2. Neon 데이터베이스에 커뮤니티 테이블 생성
print("\n2. Neon 데이터베이스에 커뮤니티 테이블 생성 중...")
neon_conn = psycopg2.connect(NEON_DATABASE_URL)
neon_cursor = neon_conn.cursor()

# community_post 테이블 생성
neon_cursor.execute("""
CREATE TABLE IF NOT EXISTS community_post (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  author TEXT NOT NULL,
  author_email TEXT NOT NULL,
  view_count INTEGER DEFAULT 0,
  like_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  is_column BOOLEAN DEFAULT FALSE,
  boards TEXT[]
)
""")

# community_comment 테이블 생성
neon_cursor.execute("""
CREATE TABLE IF NOT EXISTS community_comment (
  id SERIAL PRIMARY KEY,
  post_id INTEGER NOT NULL REFERENCES community_post(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  author TEXT NOT NULL,
  author_email TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
)
""")

# community_reply 테이블 생성
neon_cursor.execute("""
CREATE TABLE IF NOT EXISTS community_reply (
  id SERIAL PRIMARY KEY,
  post_id INTEGER NOT NULL REFERENCES community_post(id) ON DELETE CASCADE,
  comment_id INTEGER NOT NULL REFERENCES community_comment(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  author TEXT NOT NULL,
  author_email TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
)
""")

# community_post_like 테이블 생성
neon_cursor.execute("""
CREATE TABLE IF NOT EXISTS community_post_like (
  id SERIAL PRIMARY KEY,
  post_id INTEGER NOT NULL REFERENCES community_post(id) ON DELETE CASCADE,
  user_email TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (post_id, user_email)
)
""")

print("  커뮤니티 테이블 생성 완료!")

# 3. 로컬에서 커뮤니티 데이터 추출 및 Neon에 삽입
print("\n3. 커뮤니티 데이터 마이그레이션 중...")

# 기존 데이터 삭제 (순서 중요: 외래키 제약조건 때문에)
neon_cursor.execute("DELETE FROM community_post_like")
neon_cursor.execute("DELETE FROM community_reply")
neon_cursor.execute("DELETE FROM community_comment")
neon_cursor.execute("DELETE FROM community_post")
print("  기존 커뮤니티 데이터 삭제 완료")

# community_post 데이터 마이그레이션
print("  게시글 데이터 마이그레이션 중...")
local_cursor.execute("SELECT id, title, content, author, author_email, view_count, like_count, created_at, updated_at, is_column, boards FROM community_post ORDER BY id")
posts = local_cursor.fetchall()

for post in posts:
    neon_cursor.execute("""
        INSERT INTO community_post (id, title, content, author, author_email, view_count, like_count, created_at, updated_at, is_column, boards)
        VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
    """, post)

print(f"  게시글 {len(posts)}개 마이그레이션 완료")

# community_comment 데이터 마이그레이션
print("  댓글 데이터 마이그레이션 중...")
local_cursor.execute("SELECT id, post_id, content, author, author_email, created_at, updated_at FROM community_comment ORDER BY id")
comments = local_cursor.fetchall()

for comment in comments:
    neon_cursor.execute("""
        INSERT INTO community_comment (id, post_id, content, author, author_email, created_at, updated_at)
        VALUES (%s, %s, %s, %s, %s, %s, %s)
    """, comment)

print(f"  댓글 {len(comments)}개 마이그레이션 완료")

# community_reply 데이터 마이그레이션
print("  대댓글 데이터 마이그레이션 중...")
local_cursor.execute("SELECT id, post_id, comment_id, content, author, author_email, created_at, updated_at FROM community_reply ORDER BY id")
replies = local_cursor.fetchall()

for reply in replies:
    neon_cursor.execute("""
        INSERT INTO community_reply (id, post_id, comment_id, content, author, author_email, created_at, updated_at)
        VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
    """, reply)

print(f"  대댓글 {len(replies)}개 마이그레이션 완료")

# community_post_like 데이터 마이그레이션
print("  좋아요 데이터 마이그레이션 중...")
local_cursor.execute("SELECT id, post_id, user_email, created_at FROM community_post_like ORDER BY id")
likes = local_cursor.fetchall()

for like in likes:
    neon_cursor.execute("""
        INSERT INTO community_post_like (id, post_id, user_email, created_at)
        VALUES (%s, %s, %s, %s)
    """, like)

print(f"  좋아요 {len(likes)}개 마이그레이션 완료")

# 4. 마이그레이션 완료 및 확인
neon_conn.commit()

print("\n4. 마이그레이션 완료 확인...")
neon_cursor.execute("SELECT COUNT(*) FROM community_post")
neon_post_count = neon_cursor.fetchone()[0]

neon_cursor.execute("SELECT COUNT(*) FROM community_comment")
neon_comment_count = neon_cursor.fetchone()[0]

neon_cursor.execute("SELECT COUNT(*) FROM community_reply")
neon_reply_count = neon_cursor.fetchone()[0]

neon_cursor.execute("SELECT COUNT(*) FROM community_post_like")
neon_like_count = neon_cursor.fetchone()[0]

print("=== 마이그레이션 결과 ===")
print(f"  게시글: {post_count}개 → {neon_post_count}개")
print(f"  댓글: {comment_count}개 → {neon_comment_count}개")
print(f"  대댓글: {reply_count}개 → {neon_reply_count}개")
print(f"  좋아요: {like_count}개 → {neon_like_count}개")

# 연결 종료
local_cursor.close()
local_conn.close()
neon_cursor.close()
neon_conn.close()

print("\n커뮤니티 데이터 마이그레이션 완료!") 