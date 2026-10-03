# AGENTS.md

## 프로젝트

- 한국어로 답변하세요.
- 이 디렉터리는 SEND React Native + Expo 모바일 앱입니다.
- Node.js `24.14.0`, React Native `0.85.3`, Expo `56` 기준으로 작업하세요.

## 구조

- 라우트/앱 진입: `app/`
- 앱 소스: `src/`
- 화면: `src/screens/`
- 컴포넌트: `src/components/`
- API 클라이언트: `src/services/`
- 상수/메시지: `src/constants/`
- 컨텍스트: `src/contexts/`
- 유틸리티: `src/utils/`
- 로케일 리소스: `locales/`
- Expo config plugin: `plugins/`
- 문서: `docs/`

## 필수 지침

- 모바일 UX 텍스트는 `ux-writing.md`의 지침을 따르세요.
- 알림과 에러 문구는 `src/constants/appMessages.ts` 중심으로 코드화해서 재사용하세요.
- 환경변수 키 이름은 기존 `.env`, `.env.development`와 동일하게 유지하세요.
- 실제 `.env*`, `.serena/`, `GoogleService-Info.plist`, `google-services.json`는 Git 추적 대상에 넣지 마세요.
- deprecated 라이브러리를 사용하지 마세요.
- 다른 에이전트도 동시에 작업 중일 수 있으므로, 사용자 요청 없이 git 상태/diff/로그 등 git 관련 체크를 실행하지 마세요.
- 개발 서버 실행/재시작은 사용자가 직접 수행합니다. 에이전트는 사용자 요청 없이 `npm run mobile:start`, `npm run dev` 같은 장기 실행 dev 서버 명령을 실행하지 마세요.
