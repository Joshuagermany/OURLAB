# 카카오 OAuth 설정 가이드

이 가이드는 OURLAB 프로젝트에서 카카오 OAuth 로그인을 설정하는 방법을 설명합니다.

## 1. 카카오 개발자 계정 설정

### 1.1 카카오 개발자 계정 생성
1. [Kakao Developers](https://developers.kakao.com/)에 접속
2. 카카오 계정으로 로그인
3. "내 애플리케이션" → "애플리케이션 추가하기" 클릭

### 1.2 애플리케이션 정보 입력
- **앱 이름**: OURLAB
- **회사명**: (개인 또는 회사명)
- **사업자명**: (개인 또는 회사명)

## 2. 플랫폼 설정

### 2.1 웹 플랫폼 등록
1. "플랫폼" → "Web" 선택
2. 사이트 도메인에 `http://localhost:3000` 추가
3. "저장" 클릭

### 2.2 카카오 로그인 활성화
1. "카카오 로그인" → "활성화 설정" → "활성화" 선택
2. "Redirect URI" 설정:
   - `http://localhost:3001/auth/kakao/callback` 추가
3. "저장" 클릭

### 2.3 동의항목 설정
1. "카카오 로그인" → "동의항목" 선택
2. 다음 항목들을 "필수 동의"로 설정:
   - **닉네임 (profile_nickname)**
   - **프로필 사진 (profile_image)**
   - **이메일 (account_email)** (선택사항)

## 3. 환경 변수 설정

### 3.1 .env 파일에 추가
`ourlab-web/.env` 파일에 다음 내용을 추가하세요:

```env
# 카카오 OAuth 설정
KAKAO_CLIENT_ID=your_kakao_client_id_here
KAKAO_CLIENT_SECRET=your_kakao_client_secret_here
KAKAO_CALLBACK_URL=http://localhost:3001/auth/kakao/callback
```

### 3.2 Client ID와 Client Secret 확인
1. 카카오 개발자 콘솔에서 "내 애플리케이션" → "OURLAB" 선택
2. "앱 키" 섹션에서 다음 정보를 복사:
   - **REST API 키** → `KAKAO_CLIENT_ID`에 사용
   - **Client Secret** → `KAKAO_CLIENT_SECRET`에 사용

## 4. 서버 재시작

환경 변수를 설정한 후 서버를 재시작하세요:

```bash
cd ourlab-web
npm run server
```

## 5. 테스트

### 5.1 서버 상태 확인
```bash
curl http://localhost:3001/api/auth/status
```

응답에서 `kakaoOAuthConfigured: true`가 표시되어야 합니다.

### 5.2 카카오 로그인 테스트
1. 브라우저에서 `http://localhost:3000/signup` 또는 `http://localhost:3000/login` 접속
2. "카카오로 시작하기" 버튼 클릭
3. 카카오 로그인 페이지로 리다이렉트되는지 확인
4. 로그인 후 프로필 페이지로 이동하는지 확인

## 6. 구현된 기능

### 6.1 서버 라우트
- `GET /auth/kakao` - 카카오 로그인 시작
- `GET /auth/kakao/callback` - 카카오 로그인 콜백
- `GET /api/auth/status` - 인증 상태 확인 (카카오 설정 포함)

### 6.2 프론트엔드 컴포넌트
- `KakaoLoginButton.tsx` - 카카오 로그인 버튼
- `SocialLoginButtons.tsx` - 소셜 로그인 버튼들 통합

### 6.3 환경 변수
- `KAKAO_CLIENT_ID` - 카카오 REST API 키
- `KAKAO_CLIENT_SECRET` - 카카오 Client Secret
- `KAKAO_CALLBACK_URL` - 카카오 콜백 URL

## 7. 문제 해결

### 7.1 "카카오 OAuth가 설정되지 않았습니다" 오류
- `.env` 파일에 `KAKAO_CLIENT_ID`와 `KAKAO_CLIENT_SECRET`이 올바르게 설정되었는지 확인
- 서버를 재시작했는지 확인

### 7.2 "redirect_uri_mismatch" 오류
- 카카오 개발자 콘솔의 Redirect URI가 `http://localhost:3001/auth/kakao/callback`과 정확히 일치하는지 확인

### 7.3 로그인 후 프로필 정보가 표시되지 않는 경우
- 카카오 개발자 콘솔에서 동의항목이 올바르게 설정되었는지 확인
- 브라우저 개발자 도구에서 네트워크 오류가 있는지 확인

## 8. 프로덕션 배포 시 주의사항

프로덕션 환경에서는 다음 사항을 고려하세요:

1. **도메인 변경**: Redirect URI를 실제 도메인으로 변경
2. **HTTPS 사용**: 프로덕션에서는 HTTPS 필수
3. **환경 변수 관리**: 민감한 정보는 환경 변수로 관리
4. **보안 설정**: 카카오 개발자 콘솔에서 보안 설정 확인

---

이제 카카오 OAuth 로그인이 완전히 설정되었습니다! 🎉 