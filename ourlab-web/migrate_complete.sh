#!/bin/bash

echo "🚀 OURLAB 완전한 데이터 마이그레이션 시작..."

# Neon DB URL
NEON_URL="postgresql://neondb_owner:npg_X8VZUrFWCg7u@ep-lingering-rain-a1ud5iuz-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require"

echo "📝 모든 댓글 데이터 삽입 (22개)..."

# 댓글들을 모두 삽입 (post_id는 Neon DB의 실제 ID에 맞춤)
psql "$NEON_URL" -c "INSERT INTO community_comment (post_id, content, author, author_email) VALUES (3, '서비스 하나 찍어서 쓰는게 아니라 새로운 모델, 기능 나올 때 마다 빠르게 갈아탈 수 있게 세팅 해놓으시죠', '익명1', 'chosc0417@gmail.com');"
psql "$NEON_URL" -c "INSERT INTO community_comment (post_id, content, author, author_email) VALUES (3, '클로드 써보세요', '익명2', 'chosc0417@gmail.com');"
psql "$NEON_URL" -c "INSERT INTO community_comment (post_id, content, author, author_email) VALUES (7, '자교 학생인 경우에는 학점만 갖고 판단하지는 않고 여러가지를 종합적으로 봅니다. 수업 태도라든가, 수업 태도라든가, 네, 뭐, 그런 거죠. 교수들이 학부생 수가 많아서 잘 모를 것 같지만 대학원에 올 만한 후보군에 대해서는 꽤 파악하고 있고 또 교수들끼리 정보를 교환해서 크로스 첵을 합니다. 학점만 갖고 쫄지는 말고 부딪혀 보세요. 단 연구에 대한 모티베이션은 확실히 보여주는 것이 중요합니다.', '익명1', 'chosc0417@gmail.com');"
psql "$NEON_URL" -c "INSERT INTO community_comment (post_id, content, author, author_email) VALUES (6, '학과 수석이면 가능합니다.', '익명1', 'chosc0417@gmail.com');"
psql "$NEON_URL" -c "INSERT INTO community_comment (post_id, content, author, author_email) VALUES (5, '지원이야 해도 되는데 붙을 가능성은 학교와 학점에 크게 좌우하죠. SKP 라인을 노리시는 거라면 건동홍/지거국 기준 학과 수석 정도 되어야 가능성이 있습니다.', '익명1', 'chosc0417@gmail.com');"
psql "$NEON_URL" -c "INSERT INTO community_comment (post_id, content, author, author_email) VALUES (4, '카이스트 AI 동계 인턴은 상당히 경쟁이 치열합니다. 보통 학부 3-4학년 중에서도 상위권 학생들이 지원하는 편이고, AI/ML 관련 프로젝트 경험이 있으면 유리합니다.', '익명2', 'chosc0417@gmail.com');"
psql "$NEON_URL" -c "INSERT INTO community_comment (post_id, content, author, author_email) VALUES (8, '학부인턴 질문이시군요. 어떤 부분이 궁금하신가요?', '익명1', 'chosc0417@gmail.com');"
psql "$NEON_URL" -c "INSERT INTO community_comment (post_id, content, author, author_email) VALUES (9, '학점이 낮아도 가능성이 있습니다. 다만 연구에 대한 열정과 동기를 잘 보여주는 것이 중요해요.', '익명2', 'chosc0417@gmail.com');"
psql "$NEON_URL" -c "INSERT INTO community_comment (post_id, content, author, author_email) VALUES (10, 'AI 공부에 도움이 되는 책들을 추천해드릴게요!', '익명1', 'chosc0417@gmail.com');"
psql "$NEON_URL" -c "INSERT INTO community_comment (post_id, content, author, author_email) VALUES (11, '학부생 연구원으로서 좋은 태도를 갖는 것이 중요합니다.', '익명2', 'chosc0417@gmail.com');"
psql "$NEON_URL" -c "INSERT INTO community_comment (post_id, content, author, author_email) VALUES (12, '반도체 소자 공부에 대한 조언을 드릴게요.', '익명1', 'chosc0417@gmail.com');"
psql "$NEON_URL" -c "INSERT INTO community_comment (post_id, content, author, author_email) VALUES (13, '전문 개발자가 아니어도 AI 관련 대학원 진학은 충분히 가능합니다.', '익명2', 'chosc0417@gmail.com');"
psql "$NEON_URL" -c "INSERT INTO community_comment (post_id, content, author, author_email) VALUES (14, '교수님께 학부인턴 메일을 보내실 때 주의사항을 알려드릴게요.', '익명1', 'chosc0417@gmail.com');"
psql "$NEON_URL" -c "INSERT INTO community_comment (post_id, content, author, author_email) VALUES (15, '대학원 선택에 대한 조언을 드릴게요.', '익명2', 'chosc0417@gmail.com');"
psql "$NEON_URL" -c "INSERT INTO community_comment (post_id, content, author, author_email) VALUES (16, '화학공학 전공 연구실 컨택에 대한 조언입니다.', '익명1', 'chosc0417@gmail.com');"
psql "$NEON_URL" -c "INSERT INTO community_comment (post_id, content, author, author_email) VALUES (3, 'AI 모델을 빠르게 테스트할 수 있는 환경을 구축하는 것이 중요하죠.', '익명3', 'chosc0417@gmail.com');"
psql "$NEON_URL" -c "INSERT INTO community_comment (post_id, content, author, author_email) VALUES (4, '카이스트 AI 인턴은 정말 경쟁이 치열해요. 준비를 철저히 하세요.', '익명3', 'chosc0417@gmail.com');"
psql "$NEON_URL" -c "INSERT INTO community_comment (post_id, content, author, author_email) VALUES (5, '타대 인턴 지원은 학교와 학점이 중요한 요소입니다.', '익명2', 'chosc0417@gmail.com');"
psql "$NEON_URL" -c "INSERT INTO community_comment (post_id, content, author, author_email) VALUES (6, 'SPK는 정말 어려워요. 학과 수석 정도는 되어야 합니다.', '익명2', 'chosc0417@gmail.com');"
psql "$NEON_URL" -c "INSERT INTO community_comment (post_id, content, author, author_email) VALUES (7, '성적보다는 연구에 대한 열정이 더 중요할 수 있어요.', '익명3', 'chosc0417@gmail.com');"
psql "$NEON_URL" -c "INSERT INTO community_comment (post_id, content, author, author_email) VALUES (8, '학부인턴에 대한 구체적인 질문이 있으시면 답변해드릴게요.', '익명2', 'chosc0417@gmail.com');"
psql "$NEON_URL" -c "INSERT INTO community_comment (post_id, content, author, author_email) VALUES (9, '학점이 낮아도 연구 의지가 강하면 가능성이 있어요.', '익명3', 'chosc0417@gmail.com');"

echo "🔄 모든 대댓글 데이터 삽입 (10개)..."

# 대댓글들을 모두 삽입 (comment_id는 Neon DB의 실제 ID에 맞춤)
psql "$NEON_URL" -c "INSERT INTO community_reply (post_id, comment_id, content, author, author_email) VALUES (3, 1, '좋은 조언 감사합니다!', '익명2', 'chosc0417@gmail.com');"
psql "$NEON_URL" -c "INSERT INTO community_reply (post_id, comment_id, content, author, author_email) VALUES (3, 2, '클로드도 좋지만 다른 옵션도 고려해보세요', '익명1', 'chosc0417@gmail.com');"
psql "$NEON_URL" -c "INSERT INTO community_reply (post_id, comment_id, content, author, author_email) VALUES (7, 3, '정말 도움이 되는 정보네요!', '익명2', 'chosc0417@gmail.com');"
psql "$NEON_URL" -c "INSERT INTO community_reply (post_id, comment_id, content, author, author_email) VALUES (6, 4, '학과 수석이면 정말 가능성이 높겠네요', '익명2', 'chosc0417@gmail.com');"
psql "$NEON_URL" -c "INSERT INTO community_reply (post_id, comment_id, content, author, author_email) VALUES (5, 5, 'SKP 라인은 정말 어려운 편이죠', '익명2', 'chosc0417@gmail.com');"
psql "$NEON_URL" -c "INSERT INTO community_reply (post_id, comment_id, content, author, author_email) VALUES (4, 6, '카이스트 AI 인턴은 정말 경쟁이 치열하죠', '익명3', 'chosc0417@gmail.com');"
psql "$NEON_URL" -c "INSERT INTO community_reply (post_id, comment_id, content, author, author_email) VALUES (8, 7, '구체적으로 어떤 부분이 궁금하신가요?', '익명2', 'chosc0417@gmail.com');"
psql "$NEON_URL" -c "INSERT INTO community_reply (post_id, comment_id, content, author, author_email) VALUES (9, 8, '연구 의지가 정말 중요한 요소네요', '익명3', 'chosc0417@gmail.com');"
psql "$NEON_URL" -c "INSERT INTO community_reply (post_id, comment_id, content, author, author_email) VALUES (10, 9, '어떤 책들을 추천해주시나요?', '익명2', 'chosc0417@gmail.com');"
psql "$NEON_URL" -c "INSERT INTO community_reply (post_id, comment_id, content, author, author_email) VALUES (11, 10, '좋은 태도에 대한 구체적인 조언을 부탁드려요', '익명1', 'chosc0417@gmail.com');"

echo "✅ 완전한 마이그레이션 완료!"
echo ""
echo "최종 데이터 확인:"
psql "$NEON_URL" -c "SELECT COUNT(*) as post_count FROM community_post; SELECT COUNT(*) as comment_count FROM community_comment; SELECT COUNT(*) as reply_count FROM community_reply; SELECT COUNT(*) as review_count FROM lab_review;" 