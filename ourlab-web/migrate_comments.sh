#!/bin/bash

echo "💬 댓글과 대댓글 마이그레이션 시작..."

# Neon DB URL
NEON_URL="postgresql://neondb_owner:npg_X8VZUrFWCg7u@ep-lingering-rain-a1ud5iuz-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require"

echo "📝 댓글 데이터 삽입..."
# 댓글들을 삽입 (주요 댓글들만)
psql "$NEON_URL" -c "INSERT INTO community_comment (post_id, content, author, author_email) VALUES (1, '서비스 하나 찍어서 쓰는게 아니라 새로운 모델, 기능 나올 때 마다 빠르게 갈아탈 수 있게 세팅 해놓으시죠', '익명1', 'chosc0417@gmail.com');"

psql "$NEON_URL" -c "INSERT INTO community_comment (post_id, content, author, author_email) VALUES (1, '클로드 써보세요', '익명2', 'chosc0417@gmail.com');"

psql "$NEON_URL" -c "INSERT INTO community_comment (post_id, content, author, author_email) VALUES (5, '자교 학생인 경우에는 학점만 갖고 판단하지는 않고 여러가지를 종합적으로 봅니다. 수업 태도라든가, 수업 태도라든가, 네, 뭐, 그런 거죠. 교수들이 학부생 수가 많아서 잘 모를 것 같지만 대학원에 올 만한 후보군에 대해서는 꽤 파악하고 있고 또 교수들끼리 정보를 교환해서 크로스 첵을 합니다. 학점만 갖고 쫄지는 말고 부딪혀 보세요. 단 연구에 대한 모티베이션은 확실히 보여주는 것이 중요합니다.', '익명1', 'chosc0417@gmail.com');"

psql "$NEON_URL" -c "INSERT INTO community_comment (post_id, content, author, author_email) VALUES (4, '학과 수석이면 가능합니다.', '익명1', 'chosc0417@gmail.com');"

psql "$NEON_URL" -c "INSERT INTO community_comment (post_id, content, author, author_email) VALUES (3, '지원이야 해도 되는데 붙을 가능성은 학교와 학점에 크게 좌우하죠. SKP 라인을 노리시는 거라면 건동홍/지거국 기준 학과 수석 정도 되어야 가능성이 있습니다.', '익명1', 'chosc0417@gmail.com');"

echo "🔄 대댓글 데이터 삽입..."
# 대댓글들을 삽입
psql "$NEON_URL" -c "INSERT INTO community_reply (post_id, comment_id, content, author, author_email) VALUES (1, 1, '좋은 조언 감사합니다!', '익명2', 'chosc0417@gmail.com');"

psql "$NEON_URL" -c "INSERT INTO community_reply (post_id, comment_id, content, author, author_email) VALUES (1, 2, '클로드도 좋지만 다른 옵션도 고려해보세요', '익명1', 'chosc0417@gmail.com');"

echo "✅ 댓글/대댓글 마이그레이션 완료!"
echo ""
echo "데이터 확인:"
psql "$NEON_URL" -c "SELECT COUNT(*) as comment_count FROM community_comment; SELECT COUNT(*) as reply_count FROM community_reply;" 