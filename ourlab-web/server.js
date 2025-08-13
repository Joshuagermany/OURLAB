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
    successRedirect: 'http://localhost:3000/profile'
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
    successRedirect: 'http://localhost:3000/profile'
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
    naverOAuthConfigured: !!(process.env.NAVER_CLIENT_ID && process.env.NAVER_CLIENT_SECRET)
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