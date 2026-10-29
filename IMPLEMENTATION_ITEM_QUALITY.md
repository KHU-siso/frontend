# 옹이 아이템 시각 품질 개선

검토일: 2026-10-28. 기존 90종을 실제 `OngAvatar`에 단독 착용한 브라우저 화면으로 점검했다. 썸네일만 보고 판정하지 않았다.

## 변경 범위

| 구분 | 수량 | 처리 |
| --- | ---: | --- |
| 실제 착용 상태 시각 점검 | 90종 | 수정 전·후 각각 8장 비교 시트 확인 |
| 수정 | 70종 | SVG 재구성 66종 + 기존 벡터 착용 위치 조정 4종 |
| SVG 디자인 재구성 | 66종 | 기존 `pastel-` 65종 전체 및 `beige-brim-hat` |
| 원본 벡터 위치 조정 | 4종 | `blue-headphones`, `gray-earflap-hat`, `cream-scarf`, `green-bow` |
| 유지 | 20종 | 기본 컬러 6종, 기준 빨간 재킷 등 이미 자연스러운 벡터 디자인 |
| 복수 착용 시각 점검 | 12조합 | 대표 의상·모자·가방·목도리·안경·배지·컬러·신발 조합 |

새 상품을 추가하거나 기존 ID·가격을 변경하지 않았다. 기본 옹이의 머리·몸체·눈 2개·그림자 SVG 5개 및 위치/크기는 유지했다. 해당 5개 파일의 SHA-256이 작업 전과 동일함을 확인했다. 구매·보상 reducer와 공통 저장 provider도 변경하지 않았다.

## 디자인 자체를 다듬은 66종

| 분류 | 수량 | 디자인 변경 |
| --- | ---: | --- |
| 모자·머리 장식 | 20 | 야구모자 6, 챙모자 2, 비니 3, 동물 머리띠 2, 귀달이/비행모 2, 머리 리본 5. 낮은 크라운과 이마 기준 착용 위치, 모자별 고유 크기 |
| 의상·세트 | 13 | 후드 4, 가디건 2, 세일러 상의 1, 니트 3, 초록 재킷 1, 목도리 코트 1, 털 케이프 1. 얼굴 아래 목선, 곡선 어깨·소매·밑단, 원래 색상 계열 및 프린트 유지 |
| 가방 | 9 | 크로스백·별·곰·하트·개구리·토트·백팩의 특징 유지. 어깨에서 몸체 측면으로 연결되는 끈과 가방 위치 조정 |
| 목 장식 | 8 | 술/체크/하트/줄무늬 목도리, 털 리본, 나비넥타이. 목 둘레 폭과 꼬리 길이 조정 |
| 안경·선글라스 | 7 | 눈 간격에 맞춰 프레임 정렬. 일반 안경은 투명 렌즈, 선글라스는 진한 렌즈 |
| 가슴 장식 | 9 | 꽃 2, 체리, 별, 하트, 눈꽃, 클로버, 당근, 옹이. 작은 크기에서도 선명한 벡터로 재구성 |

보라 비니는 방울·보라색·골지 무늬를 유지하면서 높이와 폭을 축소했다. 초록 재킷은 초록 몸판·크림 소매·시보리·주머니·옹이 프린트를 유지하고, 빨간 재킷을 참고해 얼굴을 가리지 않는 목선과 몸체 비율로 다시 그렸다.

이 SVG는 사용자가 허용한 **프로젝트 내부 디자인 개선본**이다. Figma에서 그대로 추출한 원본이라고 기록하지 않는다. 기존 Figma SVG와 PNG 원본은 보관하며, 개선본은 `src/assets/items/refined/`에 별도 저장한다. 66상품에 SVG 67개를 사용한다(백팩의 앞쪽 끈 1개 추가).

## 합성 구조

- `itemVisualOverrides.json`에 상품별 착용 좌표·비율·레이어·부착 위치를 분리했다. 상품 ID, 가격, 보유·착용 슬롯 규칙은 기존 카탈로그를 사용한다.
- 백팩은 몸체 뒤 가방(z=18), 앞쪽 끈(z=34)으로 나눴다. 하나의 상품·구매·착용 상태로 관리한다.
- 오른쪽 가슴 프린트나 목도리 꼬리가 있는 경우 배지를 왼쪽 가슴에 배치한다.
- 캐릭터 내부의 레이어 순서를 독립시키고, 장식의 투명 영역이 주변 버튼 클릭을 가로막지 않도록 처리했다.
- 개선 SVG는 별도 파일로 제공해 썸네일·미리보기·대시보드가 같은 URL의 브라우저 캐시를 공유한다. 교체된 PNG는 번들에서 제외했다.

## 실제 확인한 화면

각 비교 시트는 카탈로그 순서대로 왼쪽→오른쪽, 위→아래이며 실제 상품 이름과 ID를 표시한다.

- [1–12번](artifacts/item-quality/after/sheet-01.png), [13–24번](artifacts/item-quality/after/sheet-02.png), [25–36번](artifacts/item-quality/after/sheet-03.png), [37–48번](artifacts/item-quality/after/sheet-04.png)
- [49–60번](artifacts/item-quality/after/sheet-05.png), [61–72번](artifacts/item-quality/after/sheet-06.png), [73–84번](artifacts/item-quality/after/sheet-07.png), [85–90번](artifacts/item-quality/after/sheet-08.png)
- [보라 비니 확대](artifacts/item-quality/after/pastel-purple-pom-beanie.png), [초록 재킷 확대](artifacts/item-quality/after/pastel-green-ong-varsity.png), [빨간 재킷 기준](artifacts/item-quality/after/red-varsity-jacket.png)
- [12개 복수 조합](artifacts/item-quality/after/combinations.png), [조합별 상품 ID](artifacts/item-quality/after/combinations.json)
- 실제 보관함 및 대시보드: 1440×1024, 402×874, 320×740, 768×1024. `artifacts/item-quality/after/`의 `inventory-*`, `preview-*`, `dashboard-*` 이미지로 기록했다.

Microsoft Edge(Chromium) headless에서 렌더링·이미지 디코딩을 수행한 뒤 위 시트 및 화면을 시각적으로 확인했다. 90종 단독 착용은 전부 확인했으나, 가능한 모든 복수 조합을 전수 검사한 것은 아니다. Safari/Firefox는 검사하지 않았다.

## 기능 유지 및 검증

- 90종의 ID·가격을 작업 전 기준과 대조한다(`tests/fixtures/item-economy-baseline.json`).
- 기존 v1 저장 데이터의 잔액·구매·보상·착용 상태 마이그레이션, 새로고침 유지, 슬롯 교체·해제를 기존 테스트로 검사한다.
- 구매 시 코인 차감, 중복 구매 차단, 잔액 부족 차단, 보상 중복 지급 차단을 검사한다.
- 동일 공통 상태가 보관함·대시보드에 반영되는지 검사한다.

최종 결과: 관련 브라우저 테스트 **62개 통과**(아이템·저장·시각 검사 46개 + 퀴즈 보상·기존 구매/착용·통합 탭 16개). 비교 시트는 고정 크기에서 한 번만 생성하므로 다른 화면 크기의 동일 캡처 6개는 의도적으로 생략했다. 실제 보관함·대시보드와 각 아이템 미리보기 기능은 4개 화면 크기에서 검사했다.

`npm.cmd run build`, `npm.cmd run lint` 모두 통과했다. 빌드는 메인 JS 번들 534.44kB에 대한 500kB 초과 경고가 남아 있다. 새 SVG 67개 합계는 약 81.5kB이며 별도 파일로 출력한다. 전체 앱의 코드 분할은 이번 아이템 개선 범위에서 변경하지 않았다.

검증 명령:

```powershell
npm.cmd run build
npm.cmd run lint
npm.cmd run test:e2e -- tests/customization.spec.js tests/pastel.spec.js tests/economy.spec.js tests/item-visual-audit.spec.js
```

## 남은 범위

에셋 부족으로 수정하지 못한 상품은 없다. 의상·가방 또는 의상·목도리가 묶인 기존 세트 3종은 기존 상품 단위와 슬롯 점유 규칙을 유지했다. 세트 내부 장식을 별도로 해제하는 기능은 추가하지 않았다. 20종의 원본 유지는 수정 실패가 아니라 단독 착용 결과를 확인한 뒤 유지한 것이다.

## 주요 파일

- `src/components/brand/OngAvatar.jsx`, `OngAvatar.css`, `ItemArtwork.jsx`
- `src/data/itemCatalog.js`, `src/data/itemVisualOverrides.json`
- `src/assets/items/refined/*.svg`
- `scripts/refine-item-artwork.mjs` — SVG와 시각 설정을 재생성하는 원본. 추가 디자인 수정 시 이 파일을 편집 후 `node scripts/refine-item-artwork.mjs` 실행
- `tests/item-visual-audit.spec.js`, `tests/fixtures/item-audit.html`, `item-audit.jsx`, `item-economy-baseline.json`
- 기존 `tests/customization.spec.js`, `tests/pastel.spec.js`의 변경된 에셋 설명에 맞춰 테스트 제목 갱신
