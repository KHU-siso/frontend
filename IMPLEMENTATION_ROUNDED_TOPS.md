# 옹이 전용 둥근 상의 실루엣

2026-10-29. 사용자 제공 회색 체크 재킷 착용 화면을 기준으로, 돌출 소매와 사람 팔을 제거했다. Figma 재조회·원본 수정 없이 프로젝트 내부 SVG를 수정했다.

## 조사 및 수정 범위

- 상의/의상 슬롯 **19종**을 실제 옹이에 착용해 수정 전·후 점검했다.
- 그중 **13종의 SVG 경로와 착용 좌표를 수정**, 이미 팔 없이 둥근 형태인 **6종은 유지**했다.
- 코스튬 태그의 가방/목도리 세트 3종은 위 19종에 포함된다. 추가 후보인 곰 귀·코 세트 1종은 머리 장식으로, 상의가 아니므로 수정하지 않았다.
- 상품 ID·이름·가격·슬롯·구매 가능 여부·세트 점유 규칙·보유 및 착용 데이터는 변경하지 않았다.

## SVG 경로를 수정한 13종

| 상품 | ID | 변경 내용과 보존한 특징 |
| --- | --- | --- |
| 빨간 배색 재킷 | `red-varsity-jacket` | 양옆 베이지색 팔과 갈라진 몸판 제거. 빨강·줄무늬 카라·흰 단추 3개·주머니 유지 |
| 크림 끈 후드 | `pastel-cream-drawstring-hoodie` | 소매와 겨드랑이 홈 제거. 크림색·후드·끈·주머니 유지 |
| 파란 옹이 후드 | `pastel-blue-ong-hoodie` | 둥근 몸판으로 연결. 파랑·후드·끈·옹이 프린트·주머니 유지 |
| 보라 후드·가방 세트 | `pastel-purple-bag-hoodie` | 후드 몸판만 둥글게 변경. 보라·하트·후드·끈·주머니·가방·스트랩 유지 |
| 체리 크림 가디건 | `pastel-cherry-cardigan` | 소매 제거 및 곡선 밑단. 크림·체리·중앙 단추·니트 시보리 유지 |
| 빨간 흰 깃 가디건 | `pastel-red-collar-cardigan` | 돌출 소매 제거. 빨강·흰 깃·중앙 단추 유지 |
| 남색 세일러 리본 상의 | `pastel-navy-sailor-top` | 소매 없는 둥근 몸판. 남색·세일러 깃·줄무늬·분홍 리본 유지 |
| 분홍 하트 니트 | `pastel-pink-heart-sweater` | 팔 분기 제거 및 둥근 시보리. 분홍·하트·니트 디테일 유지 |
| 초록 옹이 배색 재킷 | `pastel-green-ong-varsity` | 베이지색 팔·소매·갈라진 옆선 제거. 초록·크림색 카라/단추/밑단/주머니·옹이 프린트 유지 |
| 크림 후드·곰 가방 세트 | `pastel-cream-bear-bag-hoodie` | 의상 소매만 제거. 크림 후드·끈·주머니·곰 가방·스트랩 유지 |
| 남색 코트·체크 목도리 세트 | `pastel-navy-scarf-coat` | 코트 옆선·밑단 연결. 남색·금색 단추·중앙 여밈·체크 목도리 유지 |
| 파란 구름 니트 | `pastel-blue-cloud-sweater` | 돌출 소매 제거. 구름 4개를 몸판 내부에 재배치, 파랑·시보리 유지 |
| 크림 줄무늬 니트 | `pastel-cream-stripe-sweater` | 소매 분기 제거. 크림·남색 줄무늬 3개·니트 시보리 유지 |

회색 체크 재킷의 어깨→옆구리→밑단 곡선을 기준으로 윤곽을 연결했다. 옷마다 후드·카라·장식·프린트·가방을 유지하며 착용 폭과 목선 높이를 조정했다. 하단의 흰 몸체와 원래 그림자는 계속 보인다. CSS `overflow: hidden`·마스크·clip-path로 소매를 숨기는 방식은 사용하지 않았다.

가방 세트의 가방·스트랩 벡터 내용은 그대로 유지했다. 몸판의 새 크기에 맞춰 의상 전체 착용 배율은 조정하므로 가방의 화면상 크기·위치도 같은 비율로 변한다. 세트에 포함된 가방이나 목도리만 따로 해제하는 기존 제한은 유지한다.

## 유지한 의상 6종

1. 회색 체크 재킷 (`gray-check-jacket`) — 최우선 비교 기준, 체크·카라·단추·윤곽 유지
2. 곰 무늬 크림 후드 (`cream-bear-hoodie`)
3. 파란 둥근 깃 재킷 (`blue-collar-jacket`)
4. 노란 끈 후드 (`yellow-hoodie`)
5. 갈색 토글 코트 (`brown-toggle-coat`)
6. 분홍 털 깃 리본 케이프 (`pastel-pink-fur-cape`)

모자·안경·목도리·단독 가방 등 다른 아이템의 디자인은 수정하지 않았다.

## 원본 보존 및 연결

- 수정 전 아이템 에셋 **225개 전부 SHA-256 동일**. 기존 Figma·refined SVG와 원본 PNG는 그대로 남아 있다.
- 새 수정본: `src/assets/items/rounded/`의 SVG 13개. 기존 에셋 위에 덮어쓰지 않았다.
- 이전 생성 스크립트·시각 설정 백업: `docs/asset-backups/2026-10-29-round-tops/`.
- `scripts/refine-item-artwork.mjs`가 새 SVG와 `itemVisualOverrides.json`의 의상 부착 좌표를 생성한다.
- `itemCatalog.js`는 수정본 경로를 불러온다. 기존 `ItemArtwork`/`OngAvatar`를 그대로 사용해 상품 썸네일·미리보기·확정 착용·대시보드에 동일 SVG를 표시한다.
- 옹이 기본 에셋·렌더링 비율·공통 경제 reducer/provider·localStorage 키/버전은 변경하지 않았다.

## 브라우저 시각 검증

Microsoft Edge(Chromium)에서 원래 `OngAvatar`를 사용해 19종 전체를 단독 착용했다. 수정 전 PC 비교 화면, 수정 후 PC/모바일 비교 시트 및 각 의상 확대 화면을 저장하고 확인했다.

- [PC 비교 1](artifacts/rounded-tops/after/desktop/sheet-1.png), [PC 비교 2](artifacts/rounded-tops/after/desktop/sheet-2.png), [PC 비교 3](artifacts/rounded-tops/after/desktop/sheet-3.png)
- [모바일 비교 1](artifacts/rounded-tops/after/mobile/sheet-1.png), [모바일 비교 2](artifacts/rounded-tops/after/mobile/sheet-2.png), [모바일 비교 3](artifacts/rounded-tops/after/mobile/sheet-3.png)
- [회색 기준](artifacts/rounded-tops/after/desktop/gray-check-jacket.png), [보라 후드 수정](artifacts/rounded-tops/after/desktop/pastel-purple-bag-hoodie.png), [초록 재킷 수정](artifacts/rounded-tops/after/desktop/pastel-green-ong-varsity.png)
- 실제 보관함·대시보드 캡처도 각 화면 크기 폴더의 `inventory.png`, `dashboard.png`에 기록한다.

수정 의상에서 소매가 갈라지던 몸통 구간의 불투명 픽셀이 하나의 연속 윤곽인지 브라우저 canvas로 확인한다. 착용 이미지에 CSS 잘라내기가 없는지, 썸네일과 착용 이미지 경로가 같은지, 새로고침 이후 구매·코인·보상·착용 상태가 유지되는지도 검사한다.

실행 명령:

```powershell
npm.cmd run test:e2e -- tests/rounded-tops.spec.js tests/customization.spec.js tests/pastel.spec.js tests/economy.spec.js
npm.cmd run build -- --logLevel warn
npm.cmd run lint
```

최종 결과: **48개 브라우저 테스트 통과**, build/lint 통과. 1440×1024, 402×874, 320×740, 768×1024에서 기존 구매·코인 차감·중복/잔액 부족 구매 차단·슬롯 교체·해제·구형 저장 데이터 호환·새로고침 유지·대시보드 착용 공유를 검사했다. 의상별 PC/모바일 착용 비교 시트는 전부 시각적으로 확인했다. 기존 메인 JS의 500kB 초과 빌드 경고는 남아 있다.

## 주요 변경 파일

- `scripts/refine-item-artwork.mjs`
- `src/data/itemVisualOverrides.json`, `src/data/itemCatalog.js`
- `src/assets/items/rounded/*.svg` (13개)
- `tests/rounded-tops.spec.js`
- 이 문서 및 `IMPLEMENTATION_PROGRESS.md`
