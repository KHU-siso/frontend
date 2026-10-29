# MORAM 1단계 구현 기록

## 구현 범위

작업 경로는 `C:\Users\gram\moram-new`다. React + Vite 단일 앱에 공통 구조와 PC/모바일 랜딩만 구현했다. `moram_16`과 Figma 파일은 수정하지 않았다. 기존 분석 문서가 디스크에 없어서 대화에 보관된 동일 작성본을 복원하고, 이번 결과를 문서 마지막에 추가했다.

## 사용자가 확정한 랜딩 동작

- `/` 진입 시 파란 히어로(첫화면 1)로 시작한다.
- 5초 후 흰 소개 화면(첫화면 2)으로 700ms 페이드한다. 자동 복귀하지 않는다.
- 두 화면은 동일 URL의 상태이며 스크롤로 연결한 섹션이 아니다.
- PublicHeader는 공통 레이아웃에 한 번만 마운트한다. 모바일 로고/글자 색은 같은 헤더에서 전환한다.
- `LandingPage`의 `useEffect`는 상태 전환 및 페이지 이탈 시 타이머를 정리한다. 홈을 떠났다가 다시 진입하면 새 5초가 시작된다.
- 비활성 상태는 `aria-hidden`과 `inert`로 스크린리더/키보드 탐색에서 제외한다. 모션 감소 설정에서는 5초 대기 후 페이드 없이 전환한다.
- 첫화면 2의 큰 MORAM 타이틀은 사용자의 명시적 지시에 따라 추가했다. PC 986:32 프레임 안에서 타이틀이 확인됐다고 주장하지 않는다.

## Figma 자료와 재사용

개발용 파일 키: `a9SBfEEq9DY4PA857328Zr`.

| 프레임 | 재사용 자료 | 이번 최소 조회 |
|---|---|---|
| 984:12 PC 첫화면 1 | 기존 메타데이터·스크린샷 | 아직 없던 디자인 컨텍스트 최초 성공 조회, 로고·옹이 SVG 확보. 스크린샷 제외 |
| 986:32 PC 첫회면 2 | 기존 메타데이터·스크린샷 | 아직 없던 디자인 컨텍스트 최초 성공 조회. 스크린샷 제외 |
| 953:53 모바일 첫화면 1 | 기존 메타데이터·스크린샷 | 아직 없던 디자인 컨텍스트 최초 성공 조회, 모바일 전용 SVG 확보. 스크린샷 제외 |
| 952:48 모바일 첫화면 3 | 기존 메타데이터 | 이전 한도 오류로 미확보였던 컨텍스트·스크린샷 최초 성공 조회 |

조회는 필요한 프레임을 순차적으로 진행했다. 이번 4개 조회에서는 호출 한도 오류가 발생하지 않아 추가 조회/재시도는 하지 않았다. 다른 서비스 화면은 조회하지 않았다. 원본 파일의 자료를 이번 구현에 사용하지 않았다.

`docs/figma/landing-reference.json`은 이번에 확보한 컨텍스트의 JSX/클래스·레이어 정보와 에셋 연결을 보관한다. 기존에 확보한 Figma 스크린샷 4개는 `docs/figma/screenshots/`에 원본 응답의 PNG 바이트로 보존했다. 저장을 위해 MCP나 다운로드 URL을 재요청하지 않았다. 임시 URL과 base64 텍스트는 기록에 남기지 않는다. 후속 작업은 이 로컬 자료를 먼저 재사용한다.

## 토큰의 출처와 개발 보정값

Figma 컨텍스트에서 확인된 값:

| 용도 | 확인값 |
|---|---|
| 파란 배경 | `#5482B4` |
| 로고/내비게이션 텍스트 | `#123263` |
| 흰 배경 | `#FFFFFF` |
| MORAM 타이틀 | `#C3E9FE`(30.769%) → `#5482B4` |
| CTA | `#06275A` → `#0D53C0` |
| 설명/안내 텍스트 | `#B3B3B3` |
| 글꼴 선언 | Inter Semi Bold(600), Extra Bold(800) |

실제 Inter 600/800의 Latin 파일을 npm 패키지로 로컬 제공한다. **Inter는 한글 글리프를 제공하지 않으므로 한국어 대체 글꼴은 별도 필요하다.** Figma가 사용한 한글 대체 글꼴은 확인하지 못했다. 초기 브라우저 확인에서 시스템 대체 글꼴이 원안과 달라 Noto Sans KR 600/800을 개발용 대체 글꼴로 명시하고 로컬 제공한다. Noto Sans KR을 Figma 원본 글꼴이라고 주장하지 않는다.

다음은 원본 수치가 아닌 개발 선택이다: 48rem 미만 모바일 분기, 4px 기반 간격 토큰, rem/clamp 기반 글자/헤더/버튼 크기, 최대 둥근 모서리, 포커스 외곽선, 호버 그림자, 중간 너비의 배치. 5초와 700ms는 Figma가 아닌 사용자 요청에 근거한다.

페이지 레이아웃은 Grid/Flex/미디어 쿼리로 구성했다. 캐릭터 내부는 확인된 원본 레이어의 상대 좌표와 회전을 백분율 슬롯으로 변환했다. SVG의 root width/height/viewBox는 수정하지 않았다. 페이지 전체에 `transform: scale()`을 적용하거나 5802px 폭의 고정 캔버스를 만들지 않았다.

## 에셋

`src/assets/moram/`의 SVG 20개는 Figma MCP가 제공한 실제 파일을 내려받은 것이다. CSS 도형·이모지로 로고나 옹이를 대체하지 않았다. URL을 런타임에 요청하지 않고 Vite 로컬 import로 제공한다.

| 파일 | Figma 슬롯 |
|---|---|
| moram-logo.svg | PC 헤더 984:14, 986:34의 같은 로고 슬롯 |
| moram-logo-light.svg | 모바일 파란 배경의 흰 로고 952:41 |
| mobile-moram-logo.svg | 모바일 흰 배경의 로고 952:115 |
| hero-ground-shadow.svg | PC 바닥 그림자 984:17 |
| ong-head.svg / ong-back-foot.svg / ong-body.svg | PC 984:18 / 984:19 / 984:20 |
| ong-eye.svg | PC 눈 984:21, 984:22 재사용 |
| ong-front-foot.svg | PC 984:23 |
| hero-step-near.svg / hero-step-far.svg | PC 984:24 / 984:25 |
| mobile-ground-shadow.svg | 모바일 952:31 |
| mobile-ong-head.svg / mobile-ong-back-foot.svg / mobile-ong-body.svg | 모바일 952:32 / 952:33 / 952:34 |
| mobile-ong-eye.svg | 모바일 눈 952:35, 952:36 재사용 |
| mobile-ong-front-foot.svg | 모바일 952:37 |
| mobile-step-near.svg / mobile-step-far.svg | 모바일 952:38 / 952:39 (먼 타원은 프레임 바깥 클리핑 유지) |
| benefit-separator.svg | 모바일 안내 구분점. 같은 역할의 PC 구분점에도 사용 |

상태바의 시간/배터리, 보이지 않는 중복 흰 헤더 텍스트, 프레임 밖 독립 MORAM 오브젝트는 구현하지 않는다. 이는 이미 확정한 프레임 범위와 단일 헤더 구성 지시에 따른 처리다. 화면 전체 스크린샷은 구현 에셋으로 사용하지 않는다.

## 라우팅

- `/`: 완성된 랜딩의 두 상태.
- `/login`, `/signup`, `/about`, `/support`, `/faq`, `/community`: 공통 헤더 링크의 목적지를 예약한 준비 중 안내. 이 화면들을 Figma 기반으로 구현한 것은 아니다.
- `*`: 간단한 경로 오류 안내와 홈 복귀.
- 공부 시작하기는 `/login`으로 이동한다. 실제 인증이나 학습 세션은 이번 단계에 포함하지 않는다.
- 배포할 때는 BrowserRouter의 직접 URL 진입을 위해 호스팅에 index.html fallback 설정이 필요하다. 현재 배포 작업은 하지 않았다.

## 실행

```powershell
cd C:\Users\gram\moram-new
npm.cmd install
npm.cmd run dev
```

화면 주소는 Vite가 출력하는 로컬 주소다(기본 `http://localhost:5173`). PowerShell에서 npm.ps1 실행 정책 오류가 날 수 있어 `npm.cmd`를 사용했다. 일반 터미널에서는 `npm run dev`도 동일하다.

```powershell
npm.cmd run build
npm.cmd run lint
npm.cmd run preview
npm.cmd run test:e2e
```

브라우저 테스트는 Windows의 설치된 Edge를 기본 사용한다. 다른 환경에서는 `npx playwright install chromium` 후 실행하거나 `PLAYWRIGHT_BROWSER_CHANNEL`을 지정한다. 테스트는 5173 포트에 자체 서버를 띄우고 종료하며, 해당 포트가 비어 있어야 한다.

## 변경 파일 목록

- 수정: `package.json`, `package-lock.json`, `index.html`, `.gitignore`, `src/App.jsx`, `src/main.jsx`, `src/index.css`.
- 삭제: 사용하지 않는 Vite 템플릿 스타일 `src/App.css`.
- 추가: `src/app/AppRoutes.jsx`, `src/styles/tokens.css`.
- 추가: `src/components/common/Button.jsx`, `Button.css`.
- 추가: `src/components/brand/BrandLogo.jsx`, `BrandLogo.css`, `OngIllustration.jsx`.
- 추가: `src/components/layout/PublicHeader.jsx`.
- 추가: `src/layouts/PublicLayout.jsx`, `PublicLayout.css`.
- 추가: `src/pages/LandingPage.jsx`, `LandingPage.css`, `RoutePlaceholderPage.jsx`, `RoutePlaceholderPage.css`.
- 추가: `src/assets/moram/`의 SVG 20개.
- 추가: `playwright.config.js`, `tests/landing.spec.js`, `IMPLEMENTATION_NOTES.md`, `docs/figma/landing-reference.json`, `docs/figma/screenshots/`의 기존 Figma PNG 4개.
- 복원 및 이번 결정 추가: `FIGMA_IMPLEMENTATION_PLAN.md`.

테스트 스크린샷과 실행 결과는 `.gitignore`에 등록한 `test-results/`에 저장된다.

## 검증

- 프로덕션 빌드와 ESLint 검사.
- Edge의 1440×1024, 402×874, 320×740, 768×1024에서 브라우저 테스트 총 12개.
- 4999ms까지 첫 화면 유지 → 5000ms에 전환 → 이후 60초 추가 경과에도 복귀하지 않음.
- 전환 전후 동일 헤더 DOM 유지, 화면 밖 가로 넘침 없음, 숨겨진 CTA 포커스/접근성 트리 제외, 로컬 이미지 로딩과 브라우저 오류 없음.
- 홈 이탈/재진입 시 새 타이머, 공부 시작하기의 로그인 경로 이동, 잘못된 경로의 복귀 안내, 모션 감소 설정.
- PC/모바일 두 상태의 실제 렌더링 스크린샷 시각 검토.

남은 한계: 한국어 원본 fallback 글꼴, Figma의 반응형 제약과 중간 너비 디자인은 확인되지 않았다. 이번 CSS 반응형 보정은 개발 선택이다. 후속 로그인/회원가입 등은 준비 중 안내만 있고 실제 화면·인증은 구현하지 않았다.
