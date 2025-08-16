const express = require('express');
const session = require('express-session');
const passport = require('passport');
const cors = require('cors');
const { Pool } = require('pg');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

// PostgreSQL 연결
const pool = new Pool({
  host: 'localhost',
  port: 5432,
  database: 'ourlab',
  // 현재 시스템 사용자로 연결
});

// 미들웨어 설정
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 세션 설정
app.use(session({
  secret: process.env.SESSION_SECRET || 'your-secret-key',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: false, // 개발환경에서는 false, 프로덕션에서는 true
    maxAge: 24 * 60 * 60 * 1000 // 24시간
  }
}));

// Passport 초기화
app.use(passport.initialize());
app.use(passport.session());

// Google OAuth 환경 변수가 있을 때만 Strategy 설정
if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  const GoogleStrategy = require('passport-google-oauth20').Strategy;
  
  passport.use(new GoogleStrategy({
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: "http://localhost:3001/auth/google/callback"
    },
    function(accessToken, refreshToken, profile, cb) {
      // 사용자 정보를 세션에 저장
      return cb(null, {
        id: profile.id,
        displayName: profile.displayName,
        email: profile.emails[0].value,
        picture: profile.photos[0].value,
        provider: 'google'
      });
    }
  ));
} else {
  console.log('⚠️  Google OAuth 환경 변수가 설정되지 않았습니다.');
  console.log('   GOOGLE_CLIENT_ID와 GOOGLE_CLIENT_SECRET을 .env.local에 추가해주세요.');
}

// 네이버 OAuth 환경 변수가 있을 때만 Strategy 설정
if (process.env.NAVER_CLIENT_ID && process.env.NAVER_CLIENT_SECRET) {
  const NaverStrategy = require('passport-naver').Strategy;
  
  passport.use(new NaverStrategy({
      clientID: process.env.NAVER_CLIENT_ID,
      clientSecret: process.env.NAVER_CLIENT_SECRET,
      callbackURL: "http://localhost:3001/auth/naver/callback"
    },
    function(accessToken, refreshToken, profile, cb) {
      // 사용자 정보를 세션에 저장
      return cb(null, {
        id: profile.id,
        displayName: profile.displayName,
        email: profile.emails[0].value,
        picture: profile.profileImage,
        provider: 'naver'
      });
    }
  ));
} else {
  console.log('⚠️  네이버 OAuth 환경 변수가 설정되지 않았습니다.');
  console.log('   NAVER_CLIENT_ID와 NAVER_CLIENT_SECRET을 .env.local에 추가해주세요.');
}

// 카카오 OAuth 환경 변수가 있을 때만 Strategy 설정
if (process.env.KAKAO_CLIENT_ID && process.env.KAKAO_CLIENT_SECRET) {
  try {
    const KakaoStrategy = require('passport-kakao').Strategy;
    
    passport.use(new KakaoStrategy({
        clientID: process.env.KAKAO_CLIENT_ID,
        clientSecret: process.env.KAKAO_CLIENT_SECRET,
        callbackURL: "http://localhost:3001/auth/kakao/callback"
      },
      function(accessToken, refreshToken, profile, cb) {
        try {
          // 사용자 정보를 세션에 저장
          return cb(null, {
            id: profile.id,
            displayName: profile.displayName,
            email: profile._json?.kakao_account?.email || '',
            picture: profile._json?.properties?.profile_image || '',
            provider: 'kakao'
          });
        } catch (error) {
          console.error('카카오 프로필 처리 오류:', error);
          return cb(error);
        }
      }
    ));
    console.log('✅ 카카오 OAuth Strategy가 성공적으로 설정되었습니다.');
  } catch (error) {
    console.error('❌ 카카오 OAuth Strategy 설정 실패:', error);
  }
} else {
  console.log('⚠️  카카오 OAuth 환경 변수가 설정되지 않았습니다.');
  console.log('   KAKAO_CLIENT_ID와 KAKAO_CLIENT_SECRET을 .env.local에 추가해주세요.');
}

// Passport 직렬화/역직렬화
passport.serializeUser((user, done) => {
  done(null, user);
});

passport.deserializeUser((user, done) => {
  done(null, user);
});

// 인증 상태 확인 미들웨어
const isAuthenticated = (req, res, next) => {
  if (req.isAuthenticated()) {
    return next();
  }
  res.status(401).json({ message: '로그인이 필요합니다.' });
};

// 라우트 설정

// 메인 페이지
app.get('/', (req, res) => {
  res.json({ 
    message: 'OURLAB API 서버',
    user: req.user || null,
    googleOAuthConfigured: !!(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET)
  });
});

// Google OAuth 로그인 시작
app.get('/auth/google', (req, res) => {
  if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
    return res.status(500).json({ 
      message: 'Google OAuth가 설정되지 않았습니다.',
      error: 'GOOGLE_CLIENT_ID와 GOOGLE_CLIENT_SECRET을 환경 변수에 설정해주세요.'
    });
  }
  passport.authenticate('google', { scope: ['profile', 'email'] })(req, res);
});

// Google OAuth 콜백
app.get('/auth/google/callback', (req, res) => {
  if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
    return res.status(500).json({ 
      message: 'Google OAuth가 설정되지 않았습니다.',
      error: 'GOOGLE_CLIENT_ID와 GOOGLE_CLIENT_SECRET을 환경 변수에 설정해주세요.'
    });
  }
  passport.authenticate('google', { 
    failureRedirect: 'http://localhost:3000/login-failure',
    successRedirect: 'http://localhost:3000/'
  })(req, res);
});

// 네이버 OAuth 로그인 시작
app.get('/auth/naver', (req, res) => {
  if (!process.env.NAVER_CLIENT_ID || !process.env.NAVER_CLIENT_SECRET) {
    return res.status(500).json({ 
      message: '네이버 OAuth가 설정되지 않았습니다.',
      error: 'NAVER_CLIENT_ID와 NAVER_CLIENT_SECRET을 환경 변수에 설정해주세요.'
    });
  }
  passport.authenticate('naver')(req, res);
});

// 네이버 OAuth 콜백
app.get('/auth/naver/callback', (req, res) => {
  if (!process.env.NAVER_CLIENT_ID || !process.env.NAVER_CLIENT_SECRET) {
    return res.status(500).json({ 
      message: '네이버 OAuth가 설정되지 않았습니다.',
      error: 'NAVER_CLIENT_ID와 NAVER_CLIENT_SECRET을 환경 변수에 설정해주세요.'
    });
  }
  passport.authenticate('naver', { 
    failureRedirect: 'http://localhost:3000/login-failure',
    successRedirect: 'http://localhost:3000/'
  })(req, res);
});

// 카카오 OAuth 로그인 시작
app.get('/auth/kakao', (req, res) => {
  if (!process.env.KAKAO_CLIENT_ID || !process.env.KAKAO_CLIENT_SECRET) {
    return res.status(500).json({ 
      message: '카카오 OAuth가 설정되지 않았습니다.',
      error: 'KAKAO_CLIENT_ID와 KAKAO_CLIENT_SECRET을 환경 변수에 설정해주세요.'
    });
  }
  passport.authenticate('kakao')(req, res);
});

// 카카오 OAuth 콜백
app.get('/auth/kakao/callback', (req, res) => {
  if (!process.env.KAKAO_CLIENT_ID || !process.env.KAKAO_CLIENT_SECRET) {
    return res.status(500).json({ 
      message: '카카오 OAuth가 설정되지 않았습니다.',
      error: 'KAKAO_CLIENT_ID와 KAKAO_CLIENT_SECRET을 환경 변수에 설정해주세요.'
    });
  }
  passport.authenticate('kakao', { 
    failureRedirect: 'http://localhost:3000/login-failure',
    successRedirect: 'http://localhost:3000/'
  })(req, res);
});

// 로그아웃
app.get('/auth/logout', (req, res) => {
  req.logout((err) => {
    if (err) {
      return res.status(500).json({ message: '로그아웃 중 오류가 발생했습니다.' });
    }
    res.redirect('http://localhost:3000/');
  });
});

// 사용자 프로필 정보
app.get('/api/user', isAuthenticated, (req, res) => {
  res.json({
    user: req.user
  });
});

// 인증 상태 확인
app.get('/api/auth/status', (req, res) => {
  res.json({
    authenticated: req.isAuthenticated(),
    user: req.user || null,
    googleOAuthConfigured: !!(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET),
    naverOAuthConfigured: !!(process.env.NAVER_CLIENT_ID && process.env.NAVER_CLIENT_SECRET),
    kakaoOAuthConfigured: !!(process.env.KAKAO_CLIENT_ID && process.env.KAKAO_CLIENT_SECRET)
  });
});

// 익명 번호는 이제 데이터베이스에서 관리됩니다


// 게시글 목록 조회
app.get('/api/posts', async (req, res) => {
  const { board } = req.query;
  
  try {
    let query = `
      SELECT 
        p.*,
        (COUNT(DISTINCT c.id) + COUNT(DISTINCT r.id)) as comment_count,
        COUNT(DISTINCT pl.id) as like_count
      FROM community_post p
      LEFT JOIN community_comment c ON p.id = c.post_id
      LEFT JOIN community_reply r ON p.id = r.post_id
      LEFT JOIN community_post_like pl ON p.id = pl.post_id
    `;

    // 특정 게시판이 선택된 경우 필터링
    if (board && board !== '전체 광장') {
      query += ` WHERE $1 = ANY(p.boards)`;
    } else if (board === '전체 광장') {
      // 전체 광장에서는 모든 게시글 표시 (필터링 없음)
    }

    query += ` GROUP BY p.id ORDER BY p.created_at DESC`;

    const params = board && board !== '전체 광장' ? [board] : [];
    const result = await pool.query(query, params);
    
    // 필드명을 프론트엔드 형식으로 변환
    const posts = result.rows.map(row => ({
      id: row.id.toString(),
      title: row.title,
      content: row.content,
      author: row.author,
      authorEmail: row.author_email,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
      viewCount: row.view_count,
      likeCount: row.like_count,
      commentCount: parseInt(row.comment_count),
      isColumn: row.is_column,
      boards: row.boards || []
    }));
    
    res.json({
      posts: posts
    });
  } catch (error) {
    console.error('게시글 목록 조회 오류:', error);
    res.status(500).json({ message: '게시글 목록을 불러오는 중 오류가 발생했습니다.' });
  }
});

// 게시글 작성
app.post('/api/posts', isAuthenticated, async (req, res) => {
  const { title, content, isColumn, selectedBoards } = req.body;
  
  console.log('게시글 작성 요청:', { title, content, isColumn, selectedBoards });
  
  if (!title || !content) {
    return res.status(400).json({ message: '제목과 내용을 모두 입력해주세요.' });
  }

  if (!selectedBoards || selectedBoards.length === 0) {
    return res.status(400).json({ message: '최소 1개의 게시판을 선택해주세요.' });
  }
  
  try {
    const result = await pool.query(`
      INSERT INTO community_post (title, content, author, author_email, is_column, boards)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
    `, [title.trim(), content.trim(), '익명의 글쓴이', req.user.email, isColumn || false, selectedBoards]);
    
    res.json({
      message: '게시글이 작성되었습니다.',
      post: result.rows[0]
    });
  } catch (error) {
    console.error('게시글 작성 오류:', error);
    res.status(500).json({ message: '게시글 작성 중 오류가 발생했습니다.' });
  }
});

// 게시글 상세 조회
app.get('/api/posts/:id', async (req, res) => {
  try {
    // 조회수 증가
    await pool.query(`
      UPDATE community_post 
      SET view_count = view_count + 1 
      WHERE id = $1
    `, [req.params.id]);
    
    // 게시글 정보 조회
    const postResult = await pool.query(`
      SELECT 
        p.*,
        COUNT(DISTINCT pl.id) as like_count
      FROM community_post p
      LEFT JOIN community_post_like pl ON p.id = pl.post_id
      WHERE p.id = $1
      GROUP BY p.id
    `, [req.params.id]);
    
    if (postResult.rows.length === 0) {
      return res.status(404).json({ message: '게시글을 찾을 수 없습니다.' });
    }
    
    // 필드명을 프론트엔드 형식으로 변환
    const post = {
      id: postResult.rows[0].id.toString(),
      title: postResult.rows[0].title,
      content: postResult.rows[0].content,
      author: postResult.rows[0].author,
      authorEmail: postResult.rows[0].author_email,
      createdAt: postResult.rows[0].created_at,
      updatedAt: postResult.rows[0].updated_at,
      viewCount: postResult.rows[0].view_count,
      likeCount: parseInt(postResult.rows[0].like_count)
    };
    
    res.json({
      post: post
    });
  } catch (error) {
    console.error('게시글 상세 조회 오류:', error);
    res.status(500).json({ message: '게시글을 불러오는 중 오류가 발생했습니다.' });
  }
});

// 댓글 목록 조회
app.get('/api/posts/:id/comments', async (req, res) => {
  try {
    // 댓글 조회
    const commentsResult = await pool.query(`
      SELECT * FROM community_comment 
      WHERE post_id = $1 
      ORDER BY created_at ASC
    `, [req.params.id]);
    
    // 각 댓글에 대댓글 추가
    const commentsList = await Promise.all(commentsResult.rows.map(async (comment) => {
      const repliesResult = await pool.query(`
        SELECT * FROM community_reply 
        WHERE comment_id = $1 
        ORDER BY created_at ASC
      `, [comment.id]);
      
      // 댓글 필드명 변환
      const commentFormatted = {
        id: comment.id.toString(),
        postId: comment.post_id.toString(),
        content: comment.content,
        author: comment.author,
        authorEmail: comment.author_email,
        createdAt: comment.created_at,
        updatedAt: comment.updated_at
      };
      
      // 대댓글 필드명 변환
      const repliesFormatted = repliesResult.rows.map(reply => ({
        id: reply.id.toString(),
        postId: reply.post_id.toString(),
        commentId: reply.comment_id.toString(),
        content: reply.content,
        author: reply.author,
        authorEmail: reply.author_email,
        createdAt: reply.created_at,
        updatedAt: reply.updated_at
      }));
      
      return {
        ...commentFormatted,
        replies: repliesFormatted
      };
    }));
    
    res.json({
      comments: commentsList
    });
  } catch (error) {
    console.error('댓글 목록 조회 오류:', error);
    res.status(500).json({ message: '댓글을 불러오는 중 오류가 발생했습니다.' });
  }
});

// 댓글 작성
app.post('/api/posts/:id/comments', isAuthenticated, async (req, res) => {
  const { content } = req.body;
  const postId = req.params.id;
  
  if (!content) {
    return res.status(400).json({ message: '댓글 내용을 입력해주세요.' });
  }
  
  try {
    // 게시글이 존재하는지 확인하고 작성자 정보도 가져오기
    const postResult = await pool.query('SELECT id, author_email FROM community_post WHERE id = $1', [postId]);
    if (postResult.rows.length === 0) {
      return res.status(404).json({ message: '게시글을 찾을 수 없습니다.' });
    }
    
    const postAuthorEmail = postResult.rows[0].author_email;
    const isPostAuthor = req.user.email === postAuthorEmail;
    
    let authorName;
    
    if (isPostAuthor) {
      // 게시글 작성자인 경우 '글쓴이'로 표시
      authorName = '글쓴이';
    } else {
      // 다른 사용자인 경우 익명 번호 할당
      // 먼저 해당 사용자가 이 게시글에 이미 댓글을 달았는지 확인
      const existingCommentResult = await pool.query(`
        SELECT author FROM community_comment 
        WHERE post_id = $1 AND author_email = $2 
        LIMIT 1
      `, [postId, req.user.email]);
      
      if (existingCommentResult.rows.length > 0) {
        // 이미 댓글을 달았으면 기존 번호 사용
        const existingAuthor = existingCommentResult.rows[0].author;
        authorName = existingAuthor;
      } else {
        // 새로운 사용자면 다음 번호 할당
        const maxNumberResult = await pool.query(`
          SELECT COALESCE(MAX(CAST(REPLACE(author, '익명', '') AS INTEGER)), 0) as max_number
          FROM community_comment 
          WHERE post_id = $1 AND author LIKE '익명%'
        `, [postId]);
        
        const anonymousNumber = parseInt(maxNumberResult.rows[0].max_number) + 1;
        authorName = `익명${anonymousNumber}`;
      }
    }
    
    const result = await pool.query(`
      INSERT INTO community_comment (post_id, content, author, author_email)
      VALUES ($1, $2, $3, $4)
      RETURNING *
    `, [postId, content.trim(), authorName, req.user.email]);
    
    // 필드명을 프론트엔드 형식으로 변환
    const comment = {
      id: result.rows[0].id.toString(),
      postId: result.rows[0].post_id.toString(),
      content: result.rows[0].content,
      author: result.rows[0].author,
      authorEmail: result.rows[0].author_email,
      createdAt: result.rows[0].created_at,
      updatedAt: result.rows[0].updated_at
    };
    
    res.json({
      message: '댓글이 작성되었습니다.',
      comment: comment
    });
  } catch (error) {
    console.error('댓글 작성 오류:', error);
    res.status(500).json({ message: '댓글 작성 중 오류가 발생했습니다.' });
  }
});

// 대댓글 작성
app.post('/api/posts/:postId/comments/:commentId/replies', isAuthenticated, async (req, res) => {
  const { content } = req.body;
  const postId = req.params.postId;
  const commentId = req.params.commentId;
  
  if (!content) {
    return res.status(400).json({ message: '대댓글 내용을 입력해주세요.' });
  }
  
  try {
    // 게시글이 존재하는지 확인하고 작성자 정보도 가져오기
    const postResult = await pool.query('SELECT id, author_email FROM community_post WHERE id = $1', [postId]);
    if (postResult.rows.length === 0) {
      return res.status(404).json({ message: '게시글을 찾을 수 없습니다.' });
    }
    
    // 댓글이 존재하는지 확인
    const commentResult = await pool.query('SELECT id FROM community_comment WHERE id = $1 AND post_id = $2', [commentId, postId]);
    if (commentResult.rows.length === 0) {
      return res.status(404).json({ message: '댓글을 찾을 수 없습니다.' });
    }
    
    const postAuthorEmail = postResult.rows[0].author_email;
    const isPostAuthor = req.user.email === postAuthorEmail;
    
    let authorName;
    
    if (isPostAuthor) {
      // 게시글 작성자인 경우 '글쓴이'로 표시
      authorName = '글쓴이';
    } else {
      // 다른 사용자인 경우 익명 번호 할당
      // 먼저 해당 사용자가 이 게시글에 이미 댓글이나 대댓글을 달았는지 확인
      const existingResult = await pool.query(`
        SELECT author FROM (
          SELECT author, author_email FROM community_comment WHERE post_id = $1
          UNION ALL
          SELECT author, author_email FROM community_reply WHERE post_id = $1
        ) combined
        WHERE author_email = $2 
        LIMIT 1
      `, [postId, req.user.email]);
      
      if (existingResult.rows.length > 0) {
        // 이미 댓글이나 대댓글을 달았으면 기존 번호 사용
        const existingAuthor = existingResult.rows[0].author;
        authorName = existingAuthor;
      } else {
        // 새로운 사용자면 다음 번호 할당
        const maxNumberResult = await pool.query(`
          SELECT COALESCE(MAX(CAST(REPLACE(author, '익명', '') AS INTEGER)), 0) as max_number
          FROM (
            SELECT author FROM community_comment WHERE post_id = $1 AND author LIKE '익명%'
            UNION ALL
            SELECT author FROM community_reply WHERE post_id = $1 AND author LIKE '익명%'
          ) combined
        `, [postId]);
        
        const anonymousNumber = parseInt(maxNumberResult.rows[0].max_number) + 1;
        authorName = `익명${anonymousNumber}`;
      }
    }
    
    const result = await pool.query(`
      INSERT INTO community_reply (post_id, comment_id, content, author, author_email)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `, [postId, commentId, content.trim(), authorName, req.user.email]);
    
    // 필드명을 프론트엔드 형식으로 변환
    const reply = {
      id: result.rows[0].id.toString(),
      postId: result.rows[0].post_id.toString(),
      commentId: result.rows[0].comment_id.toString(),
      content: result.rows[0].content,
      author: result.rows[0].author,
      authorEmail: result.rows[0].author_email,
      createdAt: result.rows[0].created_at,
      updatedAt: result.rows[0].updated_at
    };
    
    res.json({
      message: '대댓글이 작성되었습니다.',
      reply: reply
    });
  } catch (error) {
    console.error('대댓글 작성 오류:', error);
    res.status(500).json({ message: '대댓글 작성 중 오류가 발생했습니다.' });
  }
});

// 게시글 좋아요 토글
app.post('/api/posts/:id/like', isAuthenticated, async (req, res) => {
  const postId = req.params.id;
  const userEmail = req.user.email;
  
  try {
    // 게시글이 존재하는지 확인
    const postResult = await pool.query('SELECT id FROM community_post WHERE id = $1', [postId]);
    if (postResult.rows.length === 0) {
      return res.status(404).json({ message: '게시글을 찾을 수 없습니다.' });
    }
    
    // 현재 좋아요 상태 확인
    const likeResult = await pool.query('SELECT id FROM community_post_like WHERE post_id = $1 AND user_email = $2', [postId, userEmail]);
    const isLiked = likeResult.rows.length > 0;
    
    if (isLiked) {
      // 좋아요 취소
      await pool.query('DELETE FROM community_post_like WHERE post_id = $1 AND user_email = $2', [postId, userEmail]);
    } else {
      // 좋아요 추가
      await pool.query('INSERT INTO community_post_like (post_id, user_email) VALUES ($1, $2)', [postId, userEmail]);
    }
    
    // 좋아요 수 조회
    const countResult = await pool.query('SELECT COUNT(*) as count FROM community_post_like WHERE post_id = $1', [postId]);
    const likeCount = parseInt(countResult.rows[0].count);
    
    res.json({
      message: !isLiked ? '좋아요를 눌렀습니다.' : '좋아요를 취소했습니다.',
      isLiked: !isLiked,
      likeCount: likeCount
    });
  } catch (error) {
    console.error('좋아요 토글 오류:', error);
    res.status(500).json({ message: '좋아요 처리 중 오류가 발생했습니다.' });
  }
});

// 게시글 좋아요 상태 확인
app.get('/api/posts/:id/like', isAuthenticated, async (req, res) => {
  const postId = req.params.id;
  const userEmail = req.user.email;
  
  try {
    // 게시글이 존재하는지 확인
    const postResult = await pool.query('SELECT id FROM community_post WHERE id = $1', [postId]);
    if (postResult.rows.length === 0) {
      return res.status(404).json({ message: '게시글을 찾을 수 없습니다.' });
    }
    
    // 좋아요 상태 확인
    const likeResult = await pool.query('SELECT id FROM community_post_like WHERE post_id = $1 AND user_email = $2', [postId, userEmail]);
    const isLiked = likeResult.rows.length > 0;
    
    // 좋아요 수 조회
    const countResult = await pool.query('SELECT COUNT(*) as count FROM community_post_like WHERE post_id = $1', [postId]);
    const likeCount = parseInt(countResult.rows[0].count);
    
    res.json({
      isLiked: isLiked,
      likeCount: likeCount
    });
  } catch (error) {
    console.error('좋아요 상태 확인 오류:', error);
    res.status(500).json({ message: '좋아요 상태를 확인하는 중 오류가 발생했습니다.' });
  }
});



// 연구실 리뷰 관련 API (예시)
app.get('/api/reviews', isAuthenticated, (req, res) => {
  // 인증된 사용자만 리뷰 목록을 볼 수 있음
  res.json({
    message: '리뷰 목록',
    user: req.user
  });
});

app.post('/api/reviews', isAuthenticated, (req, res) => {
  // 인증된 사용자만 리뷰를 작성할 수 있음
  const { university, department, lab, rating, content } = req.body;
  
  res.json({
    message: '리뷰가 작성되었습니다.',
    review: {
      university,
      department,
      lab,
      rating,
      content,
      author: req.user.displayName,
      authorEmail: req.user.email,
      createdAt: new Date()
    }
  });
});

// 서버 시작
app.listen(PORT, () => {
  console.log(`🚀 OURLAB API 서버가 포트 ${PORT}에서 실행 중입니다.`);
  console.log(`📝 Google OAuth 설정:`);
  console.log(`   - Client ID: ${process.env.GOOGLE_CLIENT_ID ? '설정됨' : '설정되지 않음'}`);
  console.log(`   - Client Secret: ${process.env.GOOGLE_CLIENT_SECRET ? '설정됨' : '설정되지 않음'}`);
  console.log(`   - Session Secret: ${process.env.SESSION_SECRET ? '설정됨' : '설정되지 않음'}`);
  
  if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
    console.log('\n🔧 Google OAuth 설정 방법:');
    console.log('   1. Google Cloud Console에서 OAuth 2.0 클라이언트 ID 생성');
    console.log('   2. .env.local 파일에 GOOGLE_CLIENT_ID와 GOOGLE_CLIENT_SECRET 추가');
    console.log('   3. 서버 재시작');
  }
}); 