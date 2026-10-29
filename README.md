# MORAM frontend

현재 개발 중인 MORAM React + Vite 앱입니다. 저장소 루트가 실행 경로이며, 이전의 중첩된 `moram-frontend/` 앱은 사용하지 않습니다. PC·모바일 화면은 하나의 앱에서 반응형으로 제공합니다.

## 실행

```bash
git clone https://github.com/KHU-siso/frontend.git
cd frontend
npm ci
npm run dev
```

기본 주소는 `http://localhost:5173`입니다. Vite 7의 Node.js 요구 조건은 `^20.19.0 || >=22.12.0`입니다. 기존 체크아웃은 변경 내용을 먼저 보관한 뒤 `git switch main`, `git pull --ff-only origin main`, `npm ci` 순서로 갱신합니다.

## 검증 및 빌드

```bash
npm run lint
npm run build
npm run preview
```

빌드 결과는 `dist/`에 생성되며 Git에는 포함하지 않습니다. 프로덕션 호스팅은 `dist/`를 게시하고, `/dashboard`, `/materials/:subjectId` 등 직접 접근 요청을 `index.html`로 연결하는 SPA fallback을 설정해야 합니다. 기존 저장소에는 CI/CD 워크플로가 없으며, GitHub main에 코드를 올리는 것만으로 웹 호스팅 배포 완료를 의미하지 않습니다.

## 주요 경로

| 경로 | 화면 |
| --- | --- |
| `/` | 랜딩 |
| `/login`, `/signup` | 로그인·회원가입 입력 흐름 |
| `/dashboard` | 홈·해야 할 일·주간 시간표 |
| `/materials`, `/materials/:subjectId` | 자료실·과목별 학습 홈 |
| `/chat` | AI 채팅 화면 |
| `/study/setup`, `/study/session/:sessionId` | 퀴즈 설정·문제 풀이 |
| `/study/session/:sessionId/result`, `/study/session/:sessionId/reward` | 퀴즈 결과·코인 보상 |
| `/wrong-answers` | 오답노트·복습 |
| `/shop`, `/shop?tab=inventory` | 코인샵·내 보관함 |
| `/inventory` | 코인샵 내 보관함으로 이동하는 기존 주소 |
| `/mypage` | 프로필·학습 과목·계정 설정 |

정확한 경로 정의는 `src/app/AppRoutes.jsx`를 참고합니다. 실제 인증·AI·서버 저장 API는 아직 연결하지 않았으며, 과목·학습·코인·구매·착용 정보는 브라우저의 로컬 저장소를 사용합니다. 브라우저 데이터를 지우면 로컬 기록도 삭제됩니다.

## 환경 설정 및 API 연동 준비

`.env.example`에는 비밀값이 없는 표시 설정만 있습니다. 필요하면 `.env.local`로 복사해 사용합니다. 실제 `.env*`, 인증 토큰·키 파일은 커밋하지 않습니다.

`VITE_SHOW_AUTH_DEMO_NOTICE`의 기본값은 숨김이며, 명시적으로 `true`를 설정해야 개발 안내가 표시됩니다. 인증 기능을 활성화하는 설정은 아닙니다. 인증 연결 지점은 `docs/AUTH_INTEGRATION_NOTES.md`에 정리했습니다.

기존 저장소의 개발 프록시는 보존했습니다. 개발 중 `/api`, `/health` 요청은 `http://localhost:8000`으로 전달합니다. 이 프록시는 개발 서버 전용이며, 배포 환경의 API 주소·인증·CORS는 별도로 연결해야 합니다. 기존 `.env.development`, `.env.production`은 업로드하지 않습니다.

## 브라우저 테스트

```bash
npm run test:e2e
```

테스트는 5173 포트를 사용하므로 실행 중인 개발 서버와 동시에 실행하지 않습니다. Windows 기본 브라우저는 설치된 Edge입니다. 다른 환경에서는 Playwright Chromium을 설치해 실행할 수 있습니다.

```bash
npx playwright install chromium
PLAYWRIGHT_BROWSER_CHANNEL=chromium npm run test:e2e
```

PowerShell에서 브라우저 채널을 변경하려면 `$env:PLAYWRIGHT_BROWSER_CHANNEL='chromium'`을 설정한 후 테스트를 실행합니다. `artifacts/`, `test-results/`, `playwright-report/`는 로컬 검증 산출물이므로 업로드하지 않습니다.

## 구조 및 디자인 자료

- `src/pages/`: 화면
- `src/components/`, `src/layouts/`: 공통 UI·레이아웃
- `src/state/`, `src/data/`, `src/services/`: 공통 상태·로컬 데이터·파일 저장
- `src/assets/`, `public/`: 로고·옹이·아이템·폰트 등 에셋
- `tests/`, `scripts/`: 브라우저 검증·에셋 처리 도구
- `FIGMA_IMPLEMENTATION_PLAN.md`, `IMPLEMENTATION_*.md`, `docs/`: 분석·구현 기록

기존 코드와 당시 진행 기록은 [`backup-before-moram-new`](https://github.com/KHU-siso/frontend/tree/backup-before-moram-new) 브랜치에 보존했습니다. 기존 main 커밋 이력도 유지합니다.
