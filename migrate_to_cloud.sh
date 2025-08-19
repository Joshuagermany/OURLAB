#!/bin/bash

# OURLAB 데이터베이스 마이그레이션 스크립트
# 클라우드타입 PostgreSQL로 데이터 이전

echo "🚀 OURLAB 데이터베이스 마이그레이션 시작..."

# 1. 현재 데이터 확인
echo "📊 현재 로컬 데이터 현황:"
psql -d ourlab -c "SELECT '게시글' as type, COUNT(*) as count FROM community_post UNION ALL SELECT '댓글', COUNT(*) FROM community_comment UNION ALL SELECT '대댓글', COUNT(*) FROM community_reply UNION ALL SELECT '연구실 리뷰', COUNT(*) FROM lab_review;"

# 2. 전체 데이터베이스 백업
echo "💾 데이터베이스 백업 중..."
pg_dump ourlab > ourlab_complete_backup_$(date +%Y%m%d_%H%M%S).sql

# 3. 백업 파일 확인
echo "✅ 백업 완료: ourlab_complete_backup_$(date +%Y%m%d_%H%M%S).sql"

echo ""
echo "📋 다음 단계:"
echo "1. 클라우드타입에서 PostgreSQL 서비스 생성"
echo "2. 환경변수 DATABASE_URL 설정"
echo "3. 다음 명령어로 데이터 복원:"
echo "   psql [클라우드_DATABASE_URL] < ourlab_complete_backup_$(date +%Y%m%d_%H%M%S).sql"
echo ""
echo "🔗 클라우드타입 PostgreSQL 설정 후 이 스크립트를 다시 실행하세요!" 