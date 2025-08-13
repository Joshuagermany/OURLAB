# Google OAuth 설정 가이드 (Express + Next.js)

## 1. Google Cloud Console 설정

1. [Google Cloud Console](https://console.cloud.google.com/)에 접속
2. 새 프로젝트 생성 또는 기존 프로젝트 선택
3. "API 및 서비스" > "사용자 인증 정보"로 이동
4. "사용자 인증 정보 만들기" > "OAuth 2.0 클라이언트 ID" 선택
5. 애플리케이션 유형: "웹 애플리케이션" 선택
6. 승인된 리디렉션 URI 추가:
   - `http://localhost:3001/auth/google/callback` (Express 서버용)

## 2. 환경 변수 설정

`.env.local` 파일을 생성하고 다음 내용을 추가:

```env
# Google OAuth
GOOGLE_CLIENT_ID=your_google_client_id_here
GOOGLE_CLIENT_SECRET=your_google_client_secret_here

# Session Secret
SESSION_SECRET=your_random_session_secret_here

# Server Port
PORT=3001
```

## 3. SESSION_SECRET 생성

터미널에서 다음 명령어 실행:
```bash
openssl rand -base64 32
```

## 4. 서버 실행

### 개발 모드 (Express + Next.js 동시 실행)
```bash
npm run dev:full
```

### 개별 실행
```bash
# Express 서버만 실행
npm run server

# Next.js 프론트엔드만 실행 (다른 터미널에서)
npm run dev
```

## 5. 테스트

1. 브라우저에서 `http://localhost:3000/signup` 또는 `http://localhost:3000/login` 접속
2. "Google로 로그인" 버튼 클릭
3. Google 계정으로 로그인
4. 성공 시 `http://localhost:3000/profile`로 리다이렉트

## 6. API 엔드포인트

- `GET /` - 서버 상태 확인
- `GET /auth/google` - Google OAuth 로그인 시작
- `GET /auth/google/callback` - Google OAuth 콜백
- `GET /auth/logout` - 로그아웃
- `GET /api/user` - 사용자 정보 (인증 필요)
- `GET /api/auth/status` - 인증 상태 확인
- `GET /api/reviews` - 리뷰 목록 (인증 필요)
- `POST /api/reviews` - 리뷰 작성 (인증 필요)

## 완료!

이제 Express 서버와 Next.js 프론트엔드가 연동된 Google OAuth 로그인이 작동합니다! 