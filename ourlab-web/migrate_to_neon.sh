#!/bin/bash

echo "🚀 OURLAB 데이터를 Neon으로 마이그레이션합니다..."

# 1. .env 파일 확인
if [ ! -f .env ]; then
    echo "❌ .env 파일이 없습니다."
    echo "   Neon 대시보드에서 DATABASE_URL을 복사하여 .env 파일을 생성해주세요."
    exit 1
fi

# 2. DATABASE_URL 확인
if ! grep -q "DATABASE_URL" .env; then
    echo "❌ .env 파일에 DATABASE_URL이 설정되지 않았습니다."
    exit 1
fi

echo "✅ .env 파일 확인 완료"

# 3. 스키마 적용
echo "📋 데이터베이스 스키마를 적용합니다..."
psql $DATABASE_URL < db/schema.sql

if [ $? -eq 0 ]; then
    echo "✅ 스키마 적용 완료"
else
    echo "❌ 스키마 적용 실패"
    exit 1
fi

# 4. 데이터 복사
echo "📊 커뮤니티 게시글 데이터를 복사합니다..."
psql $DATABASE_URL -c "\COPY community_post FROM 'community_post_backup.csv' WITH CSV HEADER;"

if [ $? -eq 0 ]; then
    echo "✅ 커뮤니티 게시글 복사 완료"
else
    echo "❌ 커뮤니티 게시글 복사 실패"
fi

echo "📊 연구실 리뷰 데이터를 복사합니다..."
psql $DATABASE_URL -c "\COPY lab_review FROM 'lab_review_backup.csv' WITH CSV HEADER;"

if [ $? -eq 0 ]; then
    echo "✅ 연구실 리뷰 복사 완료"
else
    echo "❌ 연구실 리뷰 복사 실패"
fi

echo "🎉 마이그레이션 완료!"
echo ""
echo "다음 단계:"
echo "1. 서버 재시작: node server.js"
echo "2. 웹사이트에서 데이터 확인"
echo "3. 로컬 PostgreSQL 종료 (선택사항)" 