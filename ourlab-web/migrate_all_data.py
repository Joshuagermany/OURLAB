#!/usr/bin/env python3
import csv
import psycopg2
import os
from dotenv import load_dotenv

load_dotenv()

# Neon 데이터베이스 연결
DATABASE_URL = os.getenv('DATABASE_URL')

def migrate_posts():
    """게시글 데이터 마이그레이션"""
    conn = psycopg2.connect(DATABASE_URL)
    cur = conn.cursor()
    
    with open('community_post_backup.csv', 'r', encoding='utf-8') as file:
        reader = csv.DictReader(file)
        for row in reader:
            try:
                # boards 배열 처리
                boards_str = row['boards'].strip('{}')
                boards = [board.strip('"') for board in boards_str.split(',') if board.strip()]
                
                cur.execute("""
                    INSERT INTO community_post (title, content, author, author_email, view_count, like_count, is_column, boards)
                    VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
                """, (
                    row['title'],
                    row['content'],
                    row['author'],
                    row['author_email'],
                    int(row['view_count']),
                    int(row['like_count']),
                    row['is_column'].lower() == 'true',
                    boards
                ))
                print(f"게시글 삽입: {row['title'][:30]}...")
            except Exception as e:
                print(f"게시글 삽입 실패: {e}")
                continue
    
    conn.commit()
    cur.close()
    conn.close()

def migrate_comments():
    """댓글 데이터 마이그레이션"""
    conn = psycopg2.connect(DATABASE_URL)
    cur = conn.cursor()
    
    with open('community_comment_backup.csv', 'r', encoding='utf-8') as file:
        reader = csv.DictReader(file)
        for row in reader:
            try:
                cur.execute("""
                    INSERT INTO community_comment (post_id, content, author, author_email)
                    VALUES (%s, %s, %s, %s)
                """, (
                    int(row['post_id']),
                    row['content'],
                    row['author'],
                    row['author_email']
                ))
                print(f"댓글 삽입: {row['content'][:30]}...")
            except Exception as e:
                print(f"댓글 삽입 실패: {e}")
                continue
    
    conn.commit()
    cur.close()
    conn.close()

def migrate_replies():
    """대댓글 데이터 마이그레이션"""
    conn = psycopg2.connect(DATABASE_URL)
    cur = conn.cursor()
    
    with open('community_reply_backup.csv', 'r', encoding='utf-8') as file:
        reader = csv.DictReader(file)
        for row in reader:
            try:
                cur.execute("""
                    INSERT INTO community_reply (post_id, comment_id, content, author, author_email)
                    VALUES (%s, %s, %s, %s, %s)
                """, (
                    int(row['post_id']),
                    int(row['comment_id']),
                    row['content'],
                    row['author'],
                    row['author_email']
                ))
                print(f"대댓글 삽입: {row['content'][:30]}...")
            except Exception as e:
                print(f"대댓글 삽입 실패: {e}")
                continue
    
    conn.commit()
    cur.close()
    conn.close()

def main():
    print("🚀 OURLAB 전체 데이터 마이그레이션 시작...")
    
    print("\n📊 게시글 마이그레이션...")
    migrate_posts()
    
    print("\n💬 댓글 마이그레이션...")
    migrate_comments()
    
    print("\n🔄 대댓글 마이그레이션...")
    migrate_replies()
    
    print("\n✅ 마이그레이션 완료!")

if __name__ == "__main__":
    main() 