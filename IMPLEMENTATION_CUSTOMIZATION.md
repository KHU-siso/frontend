# MORAM 코인샵·보관함 확장 (2026-10-28)

이 문서는 첫 25종 확장의 기록이다. 이후 `971:733`의 파스텔 장식을 추가해 현재 총 90종이며 챙모자 보류도 해소했다. 최신 기록은 [IMPLEMENTATION_PASTEL.md](./IMPLEMENTATION_PASTEL.md)를 따른다.

직전 시각 분석은 코드 수정과 에셋 추출을 보류한 조사였다. 이후 사용자의 상점 미반영 지적에 따라 분석된 아이템을 기존 앱에 실제 반영했다. Figma 원본과 moram_16은 수정하지 않았다.

## 결과와 개수

- 기존 6개 상품의 ID·가격 유지, 신규 19개를 추가해 총 25종 등록.
- 분류 기준: 컬러 6, 옷 6, 머리 장식 6, 액세서리 7. 기본 흰색 1종은 무료·초기 보유다.
- 사용 가능 24종 = 기본 흰색 1 + 구매 가능 상품 23. 파란 띠 챙모자 1종은 원본 경계 잔선 문제로 등록하되 판매·착용 보류.
- 신발은 안경과 같은 착용 예시에 있으나 독립 레이어여서 별도 상품이다.
- 완성된 캐릭터 이미지를 상품 전체로 사용한 항목은 없다. 기본 몸체 위에 실제 분리 아이템을 합성한다.

## 등록 상품

가격은 코인 단위이며 신규 가격은 확정 기획이 아닌 데모 값이다.

| 상품 ID | 이름 | Figma 분류 | 슬롯 | 가격 | 상태 |
|---|---|---|---|---|---|
| color-lime | 연두 컬러 | 컬러 | bodyColor | 6 | 구매·착용 가능 |
| color-white | 기본 흰색 | 컬러 | bodyColor | 0 | 무료 기본 보유 |
| color-lavender | 연보라 컬러 | 컬러 | bodyColor | 6 | 구매·착용 가능 |
| color-yellow | 연노랑 컬러 | 컬러 | bodyColor | 6 | 구매·착용 가능 |
| color-pink | 분홍 컬러 | 컬러 | bodyColor | 6 | 구매·착용 가능 |
| color-mint | 민트 컬러 | 컬러 | bodyColor | 6 | 구매·착용 가능 |
| cream-bear-hoodie | 곰 무늬 크림 후드 | 옷 | outfit | 14 | 구매·착용 가능 |
| red-varsity-jacket | 빨간 배색 재킷 | 옷 | outfit | 16 | 구매·착용 가능 |
| blue-collar-jacket | 파란 둥근 깃 재킷 | 옷 | outfit | 14 | 구매·착용 가능 |
| gray-check-jacket | 회색 체크 재킷 | 옷 | outfit | 15 | 구매·착용 가능 |
| yellow-hoodie | 노란 끈 후드 | 옷 | outfit | 13 | 구매·착용 가능 |
| brown-toggle-coat | 갈색 토글 코트 | 옷 | outfit | 18 | 구매·착용 가능 |
| beige-brim-hat | 파란 띠 챙모자 | 모자 | headwear | 10 | 원본 경계 확인 필요 |
| blue-headphones | 파란 헤드폰 | 모자 | headwear | 12 | 구매·착용 가능 |
| gray-earflap-hat | 회색 털 귀달이 모자 | 모자 | headwear | 12 | 구매·착용 가능 |
| red-beret | 빨간 베레모 | 모자 | headwear | 8 | 구매·착용 가능 |
| blue-cap | 파란 야구모자 | 모자 | headwear | 8 | 구매·착용 가능 |
| cream-bonnet | 크림 보닛 | 모자 | headwear | 11 | 구매·착용 가능 |
| bear-hood | 곰 귀·코 세트 | 액세서리 | headwear | 12 | 구매·착용 가능 |
| green-bow | 초록 매듭 스카프 | 액세서리 | neckAccessory | 5 | 구매·착용 가능 |
| classic-buttons | 클래식 단추 장식 | 액세서리 | bodyDecoration | 7 | 구매·착용 가능 |
| round-glasses | 동그란 안경 | 액세서리 | faceAccessory | 8 | 구매·착용 가능 |
| black-shoes | 검은 신발 한 쌍 | 액세서리 | feet | 8 | 구매·착용 가능 |
| cream-scarf | 크림 머플러 | 액세서리 | neckAccessory | 6 | 구매·착용 가능 |
| red-bag | 빨간 크로스백 | 액세서리 | bag | 9 | 구매·착용 가능 |

기존 `green-bow`의 이름은 시각적으로 확인한 '초록 매듭 스카프'로, `bear-hood`는 '곰 귀·코 세트'로 정정했다. ID와 가격은 바꾸지 않았다. 안경과 코스튬 필터는 액세서리의 하위 태그다. 따라서 필터별 숫자는 단순 합산하지 않는다.

## 에셋과 합성

- 원본 네 영역: `965:443`, `965:442`, `974:1620`, `534:425`. 이미 확보한 상위 Page 1 캡처와 시각 분석을 재사용했다.
- SVG는 Figma의 읽기 전용 `exportAsync`로 내보냈다. SVG root/viewBox/경로는 수정하지 않았다.
- 신규 네 영역의 native 레이어 94개는 동일 내용 중복 20개를 하나의 파일로 연결하여 SVG 74개로 보존했다. 챙모자는 원본 렌더링 PNG 1개다. 기존 기본 흰색 몸체·머리·눈·그림자 에셋을 재사용한다.
- 각 아이템은 `customizationItems.json`에 sourceIds, 레이어 파일, 원본 기반 상대 위치와 비율을 기록한다. SVG의 회전·반전·외곽선은 원본 내보내기에 포함되어 이중 회전하지 않는다.
- 위치는 Figma 절대 렌더링 경계를 해당 옹이 몸체 폭으로 정규화해 기존 대시보드 옹이 좌표에 연결했다. 캔버스 크기를 페이지 CSS에 복사하거나 페이지 전체를 scale하지 않았다.
- 컬러는 실제 Figma의 머리·몸체 색상 SVG를 기존 흰색 옹이 SVG 마스크 위에 겹친다. 원본 기본 몸체 윤곽과 눈·그림자는 그대로 유지한다. CSS 도형·필터로 새 캐릭터를 만들거나 SVG fill을 임의 변경하지 않았다.
- 슬롯: bodyColor, headwear, outfit, neckAccessory, bag, faceAccessory, bodyDecoration, feet. 신발은 몸체 뒤에, 의상·장신구는 각 레이어 순서에 배치한다. 모자와 곰 귀·코는 같은 headwear 슬롯이다.
- 몸체 단추와 전체 의상은 서로 가리는 것을 막기 위해 상호 교체한다. 이 제한은 확정 Figma 조합 정책이 아닌 데모 보호 규칙으로 코드와 화면에 표시한다. 그 외 다른 슬롯은 동시 착용할 수 있다.
- 썸네일은 실제 아이템 비율에 따라 크기를 제한한다. 동일 SVG 내용은 공유하고 URL을 재사용한다. 새 라이브러리는 추가하지 않았다.
- 원본 ID→파일→경계 대응은 `docs/figma/customization-reference.json`에 있다. 임시 Figma 다운로드 URL은 런타임에 남기지 않는다.

## 챙모자 보류

`973:1613`은 순수 벡터가 아니라 이미지 채움이 있는 벡터다. 컨텍스트 PNG와 Figma native PNG에서 모두 가장자리 색 잔선·별도 픽셀이 확인됐다. 원본을 임의로 지우거나 다시 그리지 않았다. 투명 PNG는 실제 원본으로 저장하고 상점에 판매 준비 중으로 표시하며, 구매·미리보기 착용·확정 착용을 차단한다. 디자이너가 경계를 정리한 원본 에셋을 제공하면 교체 후 판매할 수 있다.

## 기존 데이터 보존

저장 키 `moram.demo.local-user.economy.v1`는 그대로 유지하고 payload version만 2로 저장한다. v1과 v2를 모두 읽는다.

- coinBalance, ownedItemIds, rewardHistory의 유효한 기존 값 유지.
- 기본 흰색 무료 보유 추가.
- v1 head→headwear, face→faceAccessory. decoration은 상품에 따라 neckAccessory 또는 bag으로 이동. 기존 classic-buttons의 outfit은 bodyDecoration으로 이동.
- 유효한 아이템/소유/슬롯만 복원하며 잔액을 초기화하지 않는다.
- 구매는 기존 단일 reducer 변경을 재사용한다. 중복·잔액 부족·판매 보류 상품 구매를 모두 차단한다.
- 미리보기와 확정 착용에 같은 슬롯 교체 규칙을 사용한다. 기본 흰색 선택 또는 컬러 해제 시 기본 모습으로 돌아간다.
- 상점·보관함·퀴즈 보상·대시보드는 같은 공통 경제 상태를 사용한다. 실제 계정이나 결제가 아닌 단일 브라우저 로컬 데모다.

## 주요 변경 파일

- `src/data/itemCatalog.js`, 신규 `src/data/customizationItems.json`: 25종 상품과 원본 위치, 슬롯·필터·제한.
- `src/assets/items/figma/`: SVG 74개, PNG 1개.
- `src/state/demoReducer.js`, `DemoProvider.jsx`: 하위 호환 마이그레이션, 신규 슬롯·판매 가능 여부.
- `src/components/brand/{OngAvatar.jsx,OngAvatar.css,ItemArtwork.jsx}`: 컬러·레이어 합성.
- `src/pages/inventory/{WardrobePage.jsx,WardrobePage.css}`: 필터·상품 개수·상태·구매·기본색·긴 목록 대응.
- `tests/customization.spec.js`, 기존 `features.spec.js`·`economy.spec.js`: 신규 상품과 기존 데이터 회귀 검증.
- `FIGMA_IMPLEMENTATION_PLAN.md`, `IMPLEMENTATION_PROGRESS.md`, 이 문서, 원본 매핑 JSON.

랜딩·로그인·회원가입·글로벌 토큰과 대시보드 레이아웃 파일은 수정하지 않았다.

## 실행·검증

```powershell
cd C:\Users\gram\moram-new
npm.cmd run dev
```

`/shop`에서 25종과 카테고리를, `/inventory`에서 무료 기본색·구매 상품과 착용 상태를 확인한다.

PC·모바일·320px·태블릿에서 25종 표시, 원본 이미지 로딩, 사용 가능한 24종 개별 적용, 다중 슬롯 조합, 기존 v1 데이터 보존과 새로고침 복원을 검증했다. 각 상품 및 조합 스크린샷을 확인했고 컬러 마스크의 데이터 URL 인용 문제를 수정했다. 기존 화면을 포함한 전체 브라우저 테스트 76개와 최종 build/lint를 통과했다.

