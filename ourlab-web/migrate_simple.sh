#!/bin/bash

echo "🚀 OURLAB 전체 데이터 마이그레이션 (간단 버전)"

# Neon DB URL
NEON_URL="postgresql://neondb_owner:npg_X8VZUrFWCg7u@ep-lingering-rain-a1ud5iuz-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require"

echo "📊 연구실 리뷰 데이터 삽입..."
psql "$NEON_URL" -c "INSERT INTO lab_review (lab_id, atmosphere, phd_salary, master_salary, undergrad_salary, weekend_work, overtime_frequency, work_intensity, commute_importance, career_enterprise, career_professor, career_other, idea_acceptance, mentoring_style, guidance_style, pros_cons, rating, author_email) VALUES (266, '무난함', '학비+생활비+용돈 지급', '학비+생활비+용돈 지급', '소정의 연구비 지급', '거의 없음', '거의 없음', '무난한 편', '크게 중요하지 않음', 7, 2, 1, '학생 아이디어 적극 수용', '매우 친절하고 배려심 많음', '큰 방향만 제시', '교수님이 매우 친절하시고 연구 환경이 좋습니다.', 5, 'chosc0417@gmail.com');"

psql "$NEON_URL" -c "INSERT INTO lab_review (lab_id, atmosphere, phd_salary, master_salary, undergrad_salary, weekend_work, overtime_frequency, work_intensity, commute_importance, career_enterprise, career_professor, career_other, idea_acceptance, mentoring_style, guidance_style, pros_cons, rating, author_email) VALUES (266, '프리함', '학비+생활비+용돈 지급', '학비+생활비+용돈 지급', '소정의 연구비 지급', '거의 없음', '거의 없음', '여유로운 편', '크게 중요하지 않음', 8, 1, 1, '학생 아이디어 적극 수용', '친절하신 편', '큰 방향만 제시', '연구실 분위기가 자유롭고 좋습니다.', 4, '승찬@gmail.com');"

echo "📝 게시글 데이터 삽입 (14개)..."
# 게시글들을 하나씩 삽입
psql "$NEON_URL" -c "INSERT INTO community_post (title, content, author, author_email, view_count, like_count, is_column, boards) VALUES ('여러 AI 잘 아는 고수님들', '현재 대학원생 3개월 차고 반도체 관련 전공인데 퍼플렉시티 유료 버전 1년 주더라고요', '익명의 글쓴이', 'chosc0417@gmail.com', 43, 0, false, ARRAY['자유 게시판']);"

psql "$NEON_URL" -c "INSERT INTO community_post (title, content, author, author_email, view_count, like_count, is_column, boards) VALUES ('카이스트 AI 동계 인턴에 지원하려면 어느 정도 수준이어야 할까요?', '카이스트 AI 동계 인턴에 지원하려면 어느 정도 수준이어야 할까요?', '익명의 글쓴이', 'chosc0417@gmail.com', 12, 0, false, ARRAY['학부 인턴 게시판']);"

psql "$NEON_URL" -c "INSERT INTO community_post (title, content, author, author_email, view_count, like_count, is_column, boards) VALUES ('타 대학 부연구생으로 지원하는 경우에는…', '2026년 전기 대학원 진학예정이고 이를 위해 타대인턴을 지원하려고 합니다. 현재 3-2입니다. 자대 학부연구 경험도 없고 공모전 경력이나 스펙도 없습니다. 경험이라곤 자대 랩실에서 캡스톤(지원하려는 랩실과 유사한 연구)(졸논도 여기서 할 예정) 한 것 밖에 없는데 이런 상태에서 타대인턴을 지원해도 되나요? 지원이 가능하다면 경력이 없는 상태에서 자기소개서를 어떻게 써야 할지 여쭙고 싶습니다..', '익명의 글쓴이', 'chosc0417@gmail.com', 8, 0, false, ARRAY['학부 인턴 게시판', '자유 게시판', '대학원 입시']);"

psql "$NEON_URL" -c "INSERT INTO community_post (title, content, author, author_email, view_count, like_count, is_column, boards) VALUES ('SPK 학부인턴 낮은 학교면 컨택해도 컷당하나요?', 'SPK 학부인턴 낮은 학교면 컨택해도 컷당하나요?', '익명의 글쓴이', 'chosc0417@gmail.com', 12, 0, false, ARRAY['학부 인턴 게시판']);"

psql "$NEON_URL" -c "INSERT INTO community_post (title, content, author, author_email, view_count, like_count, is_column, boards) VALUES ('학부연구생 지원할때 성적이 많이 중요한가요?', '학부연구생 지원할때 성적이 많이 중요한가요?', '익명의 글쓴이', 'chosc0417@gmail.com', 11, 0, false, ARRAY['학부 인턴 게시판']);"

psql "$NEON_URL" -c "INSERT INTO community_post (title, content, author, author_email, view_count, like_count, is_column, boards) VALUES ('학부인턴질문드립니다.', '학부인턴질문드립니다.', '익명의 글쓴이', 'chosc0417@gmail.com', 6, 0, false, ARRAY['학부 인턴 게시판']);"

psql "$NEON_URL" -c "INSERT INTO community_post (title, content, author, author_email, view_count, like_count, is_column, boards) VALUES ('학부연구생인데 학점이 낮아습니다.. 가능성이 있을까요?', '학부연구생인데 학점이 낮아습니다.. 가능성이 있을까요?', '익명의 글쓴이', 'chosc0417@gmail.com', 8, 0, false, ARRAY['학부 인턴 게시판']);"

psql "$NEON_URL" -c "INSERT INTO community_post (title, content, author, author_email, view_count, like_count, is_column, boards) VALUES ('AI 공부에 도움이 된 책 추천해주세욥~!', 'AI 공부에 도움이 된 책 추천해주세욥~!', '익명의 글쓴이', 'chosc0417@gmail.com', 4, 0, false, ARRAY['자유 게시판']);"

psql "$NEON_URL" -c "INSERT INTO community_post (title, content, author, author_email, view_count, like_count, is_column, boards) VALUES ('학부생 연구원입니다,,, 태도 조언 부탁드립니다', '학부생 연구원입니다,,, 태도 조언 부탁드립니다', '익명의 글쓴이', 'chosc0417@gmail.com', 6, 0, false, ARRAY['학부 인턴 게시판']);"

psql "$NEON_URL" -c "INSERT INTO community_post (title, content, author, author_email, view_count, like_count, is_column, boards) VALUES ('반도체 소자 공부에 관해서 조언을 듣고 싶습니다!', '반도체 소자 공부에 관해서 조언을 듣고 싶습니다!', '익명의 글쓴이', 'chosc0417@gmail.com', 6, 0, false, ARRAY['자유 게시판']);"

psql "$NEON_URL" -c "INSERT INTO community_post (title, content, author, author_email, view_count, like_count, is_column, boards) VALUES ('전문 개발자는 아닌데 AI 관련 대학원 진학 가능할까요?', '전문 개발자는 아닌데 AI 관련 대학원 진학 가능할까요?', '익명의 글쓴이', 'chosc0417@gmail.com', 6, 0, false, ARRAY['대학원 입시']);"

psql "$NEON_URL" -c "INSERT INTO community_post (title, content, author, author_email, view_count, like_count, is_column, boards) VALUES ('교수님께 학부인턴 메일', '교수님께 학부인턴 메일', '익명의 글쓴이', 'chosc0417@gmail.com', 6, 0, false, ARRAY['학부 인턴 게시판']);"

psql "$NEON_URL" -c "INSERT INTO community_post (title, content, author, author_email, view_count, like_count, is_column, boards) VALUES ('대학원 선택 조언 부탁드립니다!', '대학원 선택 조언 부탁드립니다!', '익명의 글쓴이', 'chosc0417@gmail.com', 6, 0, false, ARRAY['대학원 입시']);"

psql "$NEON_URL" -c "INSERT INTO community_post (title, content, author, author_email, view_count, like_count, is_column, boards) VALUES ('화학공학 전공 연구실 컨택', '화학공학 전공 연구실 컨택', '익명의 글쓴이', 'chosc0417@gmail.com', 2, 0, false, ARRAY['자유 게시판']);"

echo "✅ 마이그레이션 완료!"
echo ""
echo "데이터 확인:"
psql "$NEON_URL" -c "SELECT COUNT(*) as post_count FROM community_post; SELECT COUNT(*) as review_count FROM lab_review;" 