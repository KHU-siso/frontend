# MORAM 나머지 주요 화면 구현

작업 범위: `C:\Users\gram\moram-new`. 단일 React/Vite 앱. Figma 원본·moram_16은 수정하지 않았다. 실제 코드에서 미구현 상태를 확인하고 아래 묶음별로 구현한 뒤 각각 build를 통과했다. 체크리스트는 `IMPLEMENTATION_PROGRESS.md`에 유지한다.

## 화면과 경로

| 구현 화면 | 경로 | 기준 노드 및 실제 동작 |
|---|---|---|
| AI 채팅 | `/chat` | 177:314, 181:375 ↔ 956:2660/2738. 메뉴 열기/닫기, 새 채팅·제목 검색, 입력·고정 데모 답변·이전 대화 표시 |
| 자료실 | `/materials` | 483:35/489:791 ↔ 964:1068/968:1370. 학기·과목 검색, 과목 펼침/접기, 예시 자료 미리보기, 14주 출결 UI |
| 학습 설정 | `/study/setup` | 281:336/405, 281:461/522, 281:544/283:20, 283:94/130 ↔ 955:256/360, 957:43, 964:12/78. 목표 시간·문항 수·과목·학습 방식·문제 유형 |
| 문제 풀이 | `/study/session/:sessionId` | 269:53/279:77/117/238, 281:74/133/158/174 ↔ 964:109/157/277/333/677/866/985. 객관식/주관식, 실제 로컬 정답 비교, 정오답 해설, 문제 진행 |
| 결과 | `/study/session/:sessionId/result` | 280:357/283:436 ↔ 964:424. 정답률·정오답 수, 다시 풀기·오답노트·보상 진입 |
| 코인 보상 | `/study/session/:sessionId/reward` | 529:41 ↔ 964:601(M). 한 학습 ID당 한 번만 지급, 공통 잔액 표시 |
| 오답노트·복습 | `/wrong-answers`, 위 세션 경로 재사용 | 278:602/609, 283:163/208/293/436 ↔ 965:50/193. 검색·과목/복습상태 필터·정렬·북마크·해설·단건/목록 복습, 정답 시 복습 완료 반영 |
| 상점 | `/shop` | 보관함 디자인 기반의 개발용 상점 확장. 가격·소유 여부·미리보기·코인 부족/중복 구매 차단 |
| 캐릭터 보관함 | `/inventory` | 500:1112 ↔ 956:2091(M). 구매한 아이템·카테고리·선택 미리보기·착용 확정/해제·슬롯 교체 |
| 마이페이지 | `/mypage` | 696:30/408 ↔ 952:152. 프로필·학습 과목·목표·공통 코인, 이메일 알림 토글, 비밀번호 미연결 안내·데모 나가기 |

앱 메뉴, 대시보드 빠른 실행, 채팅 바로가기, 과목 학습하기, 결과→보상→상점→보관함, 마이페이지를 실제 라우트로 연결했다. 커뮤니티/이메일은 제외했고 기존 준비 중 페이지는 그대로다.

## 공통 상태와 보상·구매 규칙

`DemoProvider` + 순수 reducer를 공통으로 사용한다. 실제 로그인 세션이나 토큰을 만들지 않는다.

- `coinBalance`: 최초 15 COIN. Figma의 예시 잔액을 초기 데모 값으로 사용한다.
- `ownedItemIds`: 처음에는 빈 배열. 구매 시 한 번만 추가한다.
- `equippedItems`: 처음에는 빈 객체. `head`, `face`, `outfit`, `decoration` 슬롯별 최대 한 아이템이다.
- `rewardHistory`: `quiz:<sessionId>`별 지급량을 저장한다. 중복 결과 열기/중복 버튼 동작으로 코인이 늘지 않는다.
- 임시 보상 규칙: 정답 1개당 1 COIN, 세션당 최대 3 COIN. 개념 확인에는 코인 없음. 확정 기획이 아닌 데모 규칙이다. 목표 달성·출석 자동 보상은 기획/실데이터가 없어 구현하지 않았다.
- 구매는 reducer에서 잔액·기보유·아이템 ID를 검사한 뒤 잔액 차감과 보유 추가를 한 상태 전환으로 처리한다. UI 버튼 외에도 reducer가 중복 구매/부족 잔액을 차단한다.
- 소유하지 않은 아이템은 착용할 수 없다. 같은 슬롯의 새 아이템은 기존 착용만 바꾸며, 보유 목록은 유지한다. 다른 슬롯은 함께 착용할 수 있다.
- 가격은 `src/data/itemCatalog.js`의 임시 데모 값이다. 기본 사용자는 아무 아이템도 입지 않은 옹이로 시작한다.

### 저장 범위

경제 상태만 `localStorage['moram.demo.local-user.economy.v1']`에 version/userId와 함께 보존한다. `userId: local-demo-user`는 **인증되지 않은 현재 브라우저의 단일 데모 프로필**이다. 실제 사용자별 서버 계정이나 신뢰 가능한 결제 원장이 아니다. 서버 연결 시 사용자 ID별 검증·트랜잭션 저장으로 교체해야 한다. 비밀번호·가입 입력·인증 정보는 저장하지 않는다.

잘못된 저장 JSON, 음수/잘못된 잔액, 알 수 없는 아이템, 소유하지 않았거나 슬롯이 맞지 않는 착용 정보, 잘못된 보상량을 걸러낸다. 저장소 차단/실패 시 화면 경고를 표시한다.

채팅·학습 세션·오답/북마크·프로필/알림 설정은 메모리 상태다. 페이지 이동 시 유지되고 새로고침하면 예시 상태로 돌아간다. 세션을 잃은 결과 URL은 새 보상을 만들지 않고 복구 안내를 표시한다. 코인·보유·착용·지급 기록은 유지된다.

## 옹이와 실제 에셋

사용자 확인으로 보관함의 곰 형태는 별도 캐릭터가 아닌 옹이 착용 예시임을 확정했다. `OngAvatar`는 기존 대시보드의 실제 흰 옹이 머리/몸통/눈/그림자를 유지하고, 구매 아이템을 원본 SVG 레이어로 겹친다. 대시보드도 같은 렌더러와 공통 착용 상태를 사용한다. 랜딩의 고정 연출은 유지했다.

| 아이템 | 카테고리 / 슬롯 | 원본 레이어 |
|---|---|---|
| 크림 머플러 | 액세서리 / decoration | 976:142 |
| 곰 모양 후드 | 액세서리 / head | 976:117 + 976:118 |
| 동그란 안경 | 안경 / face | 976:143 |
| 빨간 크로스백 | 액세서리 / decoration | 976:121 + 976:122 |
| 초록 리본 | 액세서리 / decoration | 976:141 |
| 클래식 단추 장식 | 옷 / outfit | 976:123~140의 실제 구성 레이어 |

분리 SVG 16개를 `src/assets/items/`에 보존했다. SVG root/viewBox를 수정하거나 캐릭터·아이템을 이모지/임의 CSS 도형으로 대체하지 않았다. 썸네일과 착용 미리보기는 같은 에셋을 사용한다. 후드도 기본 몸체를 교체하지 않는다. 부착 위치와 비율은 기본 옹이 위에 맞춘 개발용 배치이며 원본의 완성 조합 위치가 모든 슬롯에 정의돼 있었다고 주장하지 않는다.

**추가 에셋 필요:** 코트 전체의 독립 의상 레이어, 컬러 변형 몸체/마스크, 나머지 착용 조합의 정확한 부착 규격. 확보되지 않은 코트·컬러 상품은 판매/착용 가능한 것처럼 만들지 않았다. 컬러 탭은 미확보 안내만 표시한다. 단추 장식은 실제 에셋으로 지원하지만 코트 전체 의상은 아니다.

## Figma 조회와 미확인 디자인

계획서, 이전 MCP 메타데이터/스크린샷과 로컬 원본 에셋을 우선 재사용했다. 이번에 원래 분리 아이템이 없음을 먼저 알린 후 **500:1112 컨텍스트만 최초 조회**했다. 기존 스크린샷·전체 파일 구조를 재요청하지 않았다. 컨텍스트는 `docs/figma/inventory-reference.json`에 임시 URL 없이 보관했다. 관련 캐시 PNG도 `docs/figma/screenshots/`에 원래 응답 바이트 그대로 보존했다.

미확인/개발용 조정:

- 모바일 보관함 956:2091 및 코인 보상 964:601의 스크린샷은 미확보다. PC 분석과 모바일 메타데이터에 기반해 반응형으로 보정했다.
- PC 퀴즈 일부는 메타데이터와 대응 모바일 스크린샷만 있다. 이름이 '정답'인데 오답인 279:238 등의 상태 충돌은 임의 복제하지 않고, 선택 오답은 빨강·실제 정답은 초록으로 일관되게 표시했다.
- 실제 대화 말풍선·상점 구매 영역·프로필 편집 모달·개념 학습 카드의 완성 디자인은 확인되지 않았다. 기존 토큰·공통 컴포넌트를 사용한 개발용 데모 UI다.
- 반응형 간격/중간 너비, 모바일 필터 세로 배치, 제한된 공간의 스크롤, 태블릿 오답카드 장식 숨김은 개발 선택이다. 5802px 고정 캔버스나 페이지 전체 scale 축소는 쓰지 않았다.
- 오답 카드/채팅/마이페이지의 옹이 장식은 확보한 원본 머리·눈 레이어를 재사용했다. 개인 이름/장난 문구는 일반 학습 예제로 바꿨다.

## 변경 파일

기존 파일의 필요한 부분만 수정했다.

- `src/App.jsx`: 공통 DemoProvider 추가.
- `src/app/AppRoutes.jsx`: 새 화면 라우트 연결.
- `src/layouts/AppLayout.jsx`: 메뉴·프로필 링크와 경로별 검색, 저장 실패 안내.
- `src/pages/dashboard/DashboardPage.jsx`, `DashboardPage.css`: 빠른 실행을 화면 링크로 연결, 공통 프로필 목표 반영.
- `src/components/dashboard/DashboardMascot.jsx`: 같은 원본 몸체를 유지하는 공유 착용 렌더러 연결.
- `tests/auth-dashboard.spec.js`: 퀴즈 진입이 준비 중 안내에서 실제 링크로 바뀐 기대값 수정.

추가 파일:

- `src/state/{DemoContext.js,DemoProvider.jsx,demoReducer.js}`.
- `src/data/{learningDemo.js,itemCatalog.js}`.
- `src/styles/service.css`, `src/components/service/ServiceUI.jsx`.
- `src/components/brand/{OngAvatar.jsx,OngAvatar.css,ItemArtwork.jsx}`.
- `src/layouts/{StudyLayout.jsx,StudyLayout.css}`.
- `src/components/study/AnswerFeedback.jsx`.
- `src/pages/chat/{ChatPage.jsx,ChatPage.css}`.
- `src/pages/materials/{MaterialsPage.jsx,MaterialsPage.css}`.
- `src/pages/study/{StudySetupPage.jsx,QuizSessionPage.jsx,StudyResultPage.jsx,CoinRewardPage.jsx,StudyPages.css}`.
- `src/pages/review/{WrongAnswersPage.jsx,WrongAnswersPage.css}`.
- `src/pages/inventory/{WardrobePage.jsx,WardrobePage.css}`.
- `src/pages/profile/{MyPage.jsx,MyPage.css}`.
- `src/assets/items/`의 원본 SVG 16개.
- `tests/{features.spec.js,economy.spec.js}`.
- 문서·캐시: 이 문서, `IMPLEMENTATION_PROGRESS.md`, `FIGMA_IMPLEMENTATION_PLAN.md` 후속 기록, `docs/figma/inventory-reference.json`, 관련 기존 스크린샷 PNG.

새 패키지는 설치하지 않았다. 랜딩/인증 페이지와 해당 레이아웃/글로벌 토큰 원본 파일은 그대로 유지했다.

## 데모 기능 및 미완성

완료된 것은 **로컬 데모**다. 실제 AI·문서 분석·음성/첨부 업로드·학교 LMS/출결·퀴즈 생성 서버·실제 계정/이메일·결제는 연결하지 않았다. 고정 문항을 반복할 수 있으며 데모임을 표시한다. 커뮤니티와 이메일 템플릿은 이번 범위에서 구현하지 않았다. 실제 서비스에는 서버별 사용자 데이터·권위 있는 코인 원장·검증된 보상/가격 정책이 필요하다.

## 실행과 검증

```powershell
cd C:\Users\gram\moram-new
npm.cmd run dev
```

Vite가 출력하는 로컬 주소(기본 `http://localhost:5173`)에서 위 경로로 진입한다. 처음 설치한 환경은 `npm.cmd install`을 먼저 실행한다. 테스트는 설치된 Windows Edge를 기본 사용한다.

```powershell
npm.cmd run build -- --logLevel warn
npm.cmd run lint
npm.cmd run test:e2e
```

각 기능 묶음과 최종 build/lint를 통과했다. Playwright 전체 56개가 통과했다. 1440×1024, 402×874, 320×740, 768×1024에서 기존 화면과 새 흐름·경제 reducer 방어·여러 슬롯 동시 착용을 검증한다. 경제 테스트는 초기 무착용, 보상 잔액 반영/중복 차단, 구매/중복/부족 잔액, 보관함 추가, 착용/해제/교체, 새로고침 복원, 대시보드 공유, 몸체 에셋 유지까지 포함한다. 결과 스크린샷은 gitignore 대상인 `test-results/`에 생성된다.
