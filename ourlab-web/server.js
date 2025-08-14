const express = require('express');
const session = require('express-session');
const passport = require('passport');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

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

// 메모리 기반 데이터 저장소 (실제 프로덕션에서는 데이터베이스 사용)
let posts = [];
let comments = [];
let replies = []; // 대댓글 저장소
let postIdCounter = 1;
let commentIdCounter = 1;
let replyIdCounter = 1;
let userAnonymousMap = new Map(); // 사용자별 익명 번호 매핑 (게시글별)
let postAnonymousCounter = new Map(); // 게시글별 익명 번호 카운터
let postViews = new Map(); // 게시글 조회수: { postId: number }


// 게시글 목록 조회
app.get('/api/posts', (req, res) => {
  const postsWithCommentCount = posts.map(post => {
    const postComments = comments.filter(comment => comment.postId === post.id);
    const viewCount = postViews.get(post.id) || 1; // 기본값을 1로 설정
    return {
      ...post,
      commentCount: postComments.length,
      viewCount: viewCount
    };
  });
  
  res.json({
    posts: postsWithCommentCount
  });
});

// 게시글 작성
app.post('/api/posts', isAuthenticated, (req, res) => {
  const { title, content } = req.body;
  
  if (!title || !content) {
    return res.status(400).json({ message: '제목과 내용을 모두 입력해주세요.' });
  }
  
  const newPost = {
    id: postIdCounter.toString(),
    title: title.trim(),
    content: content.trim(),
    author: req.user.displayName,
    authorEmail: req.user.email,
    createdAt: new Date().toISOString()
  };
  
  posts.unshift(newPost); // 최신 글이 위에 오도록
  // 새 게시글의 조회수를 1로 초기화
  postViews.set(newPost.id, 1);
  postIdCounter++;
  
  res.json({
    message: '게시글이 작성되었습니다.',
    post: newPost
  });
});

// 게시글 상세 조회
app.get('/api/posts/:id', (req, res) => {
  const post = posts.find(p => p.id === req.params.id);
  
  if (!post) {
    return res.status(404).json({ message: '게시글을 찾을 수 없습니다.' });
  }
  
  // 조회수 증가 (기본값 1, 이후 +1씩 증가)
  const currentViews = postViews.get(post.id) || 1;
  const newViews = currentViews + 1;
  postViews.set(post.id, newViews);
  
  res.json({
    post: {
      ...post,
      viewCount: newViews
    }
  });
});

// 댓글 목록 조회
app.get('/api/posts/:id/comments', (req, res) => {
  const postComments = comments.filter(comment => comment.postId === req.params.id);
  
  // 먼저 단 댓글이 위에 오도록 정렬 (createdAt 기준 오름차순)
  postComments.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
  
  // 각 댓글에 대댓글 추가
  const commentsList = postComments.map(comment => {
    const commentReplies = replies.filter(reply => reply.commentId === comment.id);
    commentReplies.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
    
    return {
      ...comment,
      replies: commentReplies
    };
  });
  
  res.json({
    comments: commentsList
  });
});

// 댓글 작성
app.post('/api/posts/:id/comments', isAuthenticated, (req, res) => {
  const { content } = req.body;
  const postId = req.params.id;
  
  if (!content) {
    return res.status(400).json({ message: '댓글 내용을 입력해주세요.' });
  }
  
  // 게시글이 존재하는지 확인
  const post = posts.find(p => p.id === postId);
  if (!post) {
    return res.status(404).json({ message: '게시글을 찾을 수 없습니다.' });
  }
  
  // 사용자별 익명 번호 할당 (게시글별로 독립적)
  const userKey = `${postId}:${req.user.email}`;
  let anonymousNumber = userAnonymousMap.get(userKey);
  
  if (!anonymousNumber) {
    // 해당 게시글의 현재 익명 번호 카운터 가져오기
    let currentCounter = postAnonymousCounter.get(postId) || 0;
    currentCounter++;
    postAnonymousCounter.set(postId, currentCounter);
    anonymousNumber = currentCounter;
    userAnonymousMap.set(userKey, anonymousNumber);
  }
  
  const newComment = {
    id: commentIdCounter.toString(),
    postId: postId,
    content: content.trim(),
    author: `익명${anonymousNumber}`,
    authorEmail: req.user.email,
    createdAt: new Date().toISOString()
  };
  
  comments.push(newComment); // 먼저 단 댓글이 위에 오도록
  commentIdCounter++;
  
  res.json({
    message: '댓글이 작성되었습니다.',
    comment: newComment
  });
});

// 대댓글 작성
app.post('/api/posts/:postId/comments/:commentId/replies', isAuthenticated, (req, res) => {
  const { content } = req.body;
  const postId = req.params.postId;
  const commentId = req.params.commentId;
  
  if (!content) {
    return res.status(400).json({ message: '대댓글 내용을 입력해주세요.' });
  }
  
  // 게시글이 존재하는지 확인
  const post = posts.find(p => p.id === postId);
  if (!post) {
    return res.status(404).json({ message: '게시글을 찾을 수 없습니다.' });
  }
  
  // 댓글이 존재하는지 확인
  const comment = comments.find(c => c.id === commentId && c.postId === postId);
  if (!comment) {
    return res.status(404).json({ message: '댓글을 찾을 수 없습니다.' });
  }
  
  // 사용자별 익명 번호 할당 (게시글별로 독립적)
  const userKey = `${postId}:${req.user.email}`;
  let anonymousNumber = userAnonymousMap.get(userKey);
  
  if (!anonymousNumber) {
    // 해당 게시글의 현재 익명 번호 카운터 가져오기
    let currentCounter = postAnonymousCounter.get(postId) || 0;
    currentCounter++;
    postAnonymousCounter.set(postId, currentCounter);
    anonymousNumber = currentCounter;
    userAnonymousMap.set(userKey, anonymousNumber);
  }
  
  const newReply = {
    id: replyIdCounter.toString(),
    postId: postId,
    commentId: commentId,
    content: content.trim(),
    author: `익명${anonymousNumber}`,
    authorEmail: req.user.email,
    createdAt: new Date().toISOString()
  };
  
  replies.push(newReply);
  replyIdCounter++;
  
  res.json({
    message: '대댓글이 작성되었습니다.',
    reply: newReply
  });
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