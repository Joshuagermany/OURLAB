# 네이버 OAuth 설정 가이드

## 1. 네이버 개발자 센터에서 애플리케이션 등록

1. [네이버 개발자 센터](https://developers.naver.com/)에 접속
2. 로그인 후 "애플리케이션 등록" 클릭
3. 애플리케이션 정보 입력:
   - **애플리케이션 이름**: OURLAB
   - **사용 API**: 로그인 오픈 API 서비스 환경 추가
   - **비로그인 오픈 API 서비스 환경**: 선택하지 않음

## 2. 서비스 URL 설정

### 서비스 URL
```
http://localhost:3000
```

### Callback URL
```
http://localhost:3001/auth/naver/callback
```

## 3. 환경 변수 설정

`.env` 파일에 다음 내용을 추가하세요:

```env
# 네이버 OAuth
NAVER_CLIENT_ID=your_naver_client_id_here
NAVER_CLIENT_SECRET=your_naver_client_secret_here
NAVER_CALLBACK_URL=http://localhost:3001/auth/naver/callback
```

## 4. 서버 재시작

환경 변수를 설정한 후 Express 서버를 재시작하세요:

```bash
cd ourlab-web
npm run server
```

## 5. 테스트

1. `http://localhost:3000/signup` 또는 `http://localhost:3000/login` 접속
2. "네이버로 시작하기" 버튼 클릭
3. 네이버 계정으로 로그인
4. 성공 시 `http://localhost:3000/profile`로 리다이렉트
5. 실패 시 `http://localhost:3000/login-failure`로 리다이렉트

## 구현된 기능

### 서버 라우트
- `GET /auth/naver`: 네이버 로그인 시작
- `GET /auth/naver/callback`: 네이버 로그인 콜백 처리

### 프론트엔드 페이지
- `/profile`: 사용자 프로필 페이지 (로그인 성공 시)
- `/login-failure`: 로그인 실패 페이지

### 환경 변수
- `NAVER_CLIENT_ID`: 네이버 애플리케이션 클라이언트 ID
- `NAVER_CLIENT_SECRET`: 네이버 애플리케이션 클라이언트 시크릿
- `NAVER_CALLBACK_URL`: 네이버 OAuth 콜백 URL

## 주의사항

- 네이버 OAuth는 개발 환경에서만 작동합니다
- 프로덕션 배포 시 실제 도메인으로 Callback URL을 변경해야 합니다
- 네이버 개발자 센터에서 애플리케이션 상태가 "개발중"이어야 합니다 