-- OURLAB Database Schema

-- 연구실 리뷰 테이블
CREATE TABLE IF NOT EXISTS lab_review (
    id SERIAL PRIMARY KEY,
    lab_id INTEGER NOT NULL,
    atmosphere VARCHAR(50),
    phd_salary VARCHAR(50),
    master_salary VARCHAR(50),
    undergrad_salary VARCHAR(50),
    weekend_work VARCHAR(50),
    overtime_frequency VARCHAR(50),
    work_intensity VARCHAR(50),
    commute_importance VARCHAR(50),
    career_enterprise INTEGER,
    career_professor INTEGER,
    career_other INTEGER,
    idea_acceptance VARCHAR(50),
    mentoring_style VARCHAR(50),
    guidance_style VARCHAR(50),
    pros_cons TEXT,
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    author_email VARCHAR(255),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 연구실 리뷰 요약 뷰
CREATE OR REPLACE VIEW lab_review_summary AS
SELECT 
    lab_id,
    COUNT(*) as review_count,
    ROUND(AVG(rating), 1) as avg_rating,
    ROUND(AVG(CASE WHEN atmosphere = '매우 엄격함' THEN 1 WHEN atmosphere = '엄격한 편' THEN 2 WHEN atmosphere = '무난함' THEN 3 WHEN atmosphere = '프리함' THEN 4 WHEN atmosphere = '매우 프리함' THEN 5 END), 1) as avg_atmosphere,
    ROUND(AVG(CASE WHEN work_intensity = '강한편' THEN 1 WHEN work_intensity = '무난한 편' THEN 2 WHEN work_intensity = '여유로운 편' THEN 3 END), 1) as avg_work_intensity,
    ROUND(AVG(CASE WHEN mentoring_style = '비협조적' THEN 1 WHEN mentoring_style = '까다로운 편' THEN 2 WHEN mentoring_style = '중립적' THEN 3 WHEN mentoring_style = '친절하신 편' THEN 4 WHEN mentoring_style = '매우 친절하고 배려심 많음' THEN 5 END), 1) as avg_mentoring_style,
    ROUND(AVG(career_enterprise), 1) as avg_career_enterprise,
    ROUND(AVG(career_professor), 1) as avg_career_professor,
    ROUND(AVG(career_other), 1) as avg_career_other
FROM lab_review 
GROUP BY lab_id;

-- 연구실 리뷰 상세 통계 뷰
CREATE OR REPLACE VIEW lab_review_detailed_stats AS
SELECT 
    lab_id,
    COUNT(*) as review_count,
    ROUND(AVG(rating), 1) as avg_rating,
    jsonb_build_object(
        '매우 엄격함', ROUND(COUNT(CASE WHEN atmosphere = '매우 엄격함' THEN 1 END) * 100.0 / COUNT(*), 1),
        '엄격한 편', ROUND(COUNT(CASE WHEN atmosphere = '엄격한 편' THEN 1 END) * 100.0 / COUNT(*), 1),
        '무난함', ROUND(COUNT(CASE WHEN atmosphere = '무난함' THEN 1 END) * 100.0 / COUNT(*), 1),
        '프리함', ROUND(COUNT(CASE WHEN atmosphere = '프리함' THEN 1 END) * 100.0 / COUNT(*), 1),
        '매우 프리함', ROUND(COUNT(CASE WHEN atmosphere = '매우 프리함' THEN 1 END) * 100.0 / COUNT(*), 1)
    ) as atmosphere_stats,
    jsonb_build_object(
        '강한편', ROUND(COUNT(CASE WHEN work_intensity = '강한편' THEN 1 END) * 100.0 / COUNT(*), 1),
        '무난한 편', ROUND(COUNT(CASE WHEN work_intensity = '무난한 편' THEN 1 END) * 100.0 / COUNT(*), 1),
        '여유로운 편', ROUND(COUNT(CASE WHEN work_intensity = '여유로운 편' THEN 1 END) * 100.0 / COUNT(*), 1)
    ) as work_intensity_stats,
    jsonb_build_object(
        '비협조적', ROUND(COUNT(CASE WHEN mentoring_style = '비협조적' THEN 1 END) * 100.0 / COUNT(*), 1),
        '까다로운 편', ROUND(COUNT(CASE WHEN mentoring_style = '까다로운 편' THEN 1 END) * 100.0 / COUNT(*), 1),
        '중립적', ROUND(COUNT(CASE WHEN mentoring_style = '중립적' THEN 1 END) * 100.0 / COUNT(*), 1),
        '친절하신 편', ROUND(COUNT(CASE WHEN mentoring_style = '친절하신 편' THEN 1 END) * 100.0 / COUNT(*), 1),
        '매우 친절하고 배려심 많음', ROUND(COUNT(CASE WHEN mentoring_style = '매우 친절하고 배려심 많음' THEN 1 END) * 100.0 / COUNT(*), 1)
    ) as mentoring_style_stats,
    jsonb_build_object(
        '1점', COUNT(CASE WHEN rating = 1 THEN 1 END),
        '2점', COUNT(CASE WHEN rating = 2 THEN 1 END),
        '3점', COUNT(CASE WHEN rating = 3 THEN 1 END),
        '4점', COUNT(CASE WHEN rating = 4 THEN 1 END),
        '5점', COUNT(CASE WHEN rating = 5 THEN 1 END)
    ) as rating_stats
FROM lab_review 
GROUP BY lab_id;

-- 커뮤니티 게시글 테이블
CREATE TABLE IF NOT EXISTS community_post (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    author VARCHAR(255) NOT NULL,
    author_email VARCHAR(255) NOT NULL,
    view_count INTEGER DEFAULT 0,
    like_count INTEGER DEFAULT 0,
    is_column BOOLEAN DEFAULT FALSE,
    boards TEXT[] DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 커뮤니티 댓글 테이블
CREATE TABLE IF NOT EXISTS community_comment (
    id SERIAL PRIMARY KEY,
    post_id INTEGER NOT NULL REFERENCES community_post(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    author VARCHAR(255) NOT NULL,
    author_email VARCHAR(255) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 커뮤니티 대댓글 테이블
CREATE TABLE IF NOT EXISTS community_reply (
    id SERIAL PRIMARY KEY,
    post_id INTEGER NOT NULL REFERENCES community_post(id) ON DELETE CASCADE,
    comment_id INTEGER NOT NULL REFERENCES community_comment(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    author VARCHAR(255) NOT NULL,
    author_email VARCHAR(255) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 커뮤니티 게시글 좋아요 테이블
CREATE TABLE IF NOT EXISTS community_post_like (
    id SERIAL PRIMARY KEY,
    post_id INTEGER NOT NULL REFERENCES community_post(id) ON DELETE CASCADE,
    user_email VARCHAR(255) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(post_id, user_email)
);

-- 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_lab_review_lab_id ON lab_review(lab_id);
CREATE INDEX IF NOT EXISTS idx_community_post_created_at ON community_post(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_community_comment_post_id ON community_comment(post_id);
CREATE INDEX IF NOT EXISTS idx_community_reply_post_id ON community_reply(post_id);
CREATE INDEX IF NOT EXISTS idx_community_reply_comment_id ON community_reply(comment_id);
CREATE INDEX IF NOT EXISTS idx_community_post_like_post_id ON community_post_like(post_id);
CREATE INDEX IF NOT EXISTS idx_community_post_like_user_email ON community_post_like(user_email);

-- GIN 인덱스 (배열 검색용)
CREATE INDEX IF NOT EXISTS idx_community_post_boards ON community_post USING GIN(boards); 