# CHANGELOG
술마을 (Sool Village) — 작업 이력

---

## [v1.2.0] — 2025-06-22 · 성능 최적화

### 배경
맥 환경 VS Code Live Server 실행 시 렌더링 속도 저하 발생.
포인트 라이트 과다, 고해상도 그림자 맵, 매 프레임 Canvas 2D 렌더가 주요 원인으로 확인됨.

### 변경 파일 및 내용

#### js/core/scene.js
- 픽셀 레이시오 `Math.min(devicePixelRatio, 2)` → `1.0` 고정
  - Retina 맥(2.0)에서 렌더링 픽셀이 4배 → 즉시 체감 가능한 최대 개선 항목
- 모바일 여부 감지 추가 → 모바일은 `antialias: false` 적용
- 그림자 맵 해상도 `2048×2048` → `512×512` 축소
- 그림자 카메라 범위 `±30` → `±25` 축소 (맵 커버리지 유지)
- 가로등 개수 13개 → 6개로 축소 (중심부 핵심 위치만 유지)
- 가로등 포인트 라이트 완전 제거 (emissive 전구로 시각적 효과 대체)
- 가로등 지오메트리 세그먼트 축소 (8 → 6)

#### js/core/environment.js
- 별 파티클 1,000개 → 600개로 축소
- 반딧불이 파티클 80개 → 40개로 축소
- 별 파티클 `sizes` 배열 제거 (미사용)
- 분수 포인트 라이트 강도 `1.4` → `0.9`, 거리 `7` → `5` 축소
- 분수 조명 맥동 진폭 `0.45` → `0.2` 축소

#### js/buildings/base.js
- `getMat()` 함수: `MeshStandardMaterial` → `MeshLambertMaterial` 전환
  - metalness > 0인 금속 재질만 Standard 유지, 나머지 전부 Lambert 적용
  - Lambert = PBR 계산 없음 → CPU/GPU 부하 감소
- 창문 포인트 라이트 완전 제거
  - 11개 건물 × 층당 1개 = 최대 33개 라이트 제거
  - emissive 창문만으로 시각적 효과 충분

#### js/ui/minimap.js
- 미니맵 Canvas 2D 렌더를 매 프레임 → theta 0.5도 이상 변화 시만 업데이트
- 미니맵 캔버스 DPR cap `Math.min(devicePixelRatio, 2)` → `1` 고정

#### js/core/main.js
- 애니메이션 루프 `t += 0.016` 고정값 → `performance.now()` 기반 정확한 delta time으로 변경
- 목표 FPS 설정: 데스크탑 60fps, 모바일 30fps cap 적용
- 프레임 스킵 로직 추가 (목표 fps 미만 시 렌더 건너뜀)

### 최적화 효과 요약

| 항목 | 변경 전 | 변경 후 | 예상 효과 |
|------|--------|--------|---------|
| 픽셀 레이시오 | 2.0 (Retina) | 1.0 | ★★★★★ |
| 그림자 맵 | 2048×2048 | 512×512 | ★★★★ |
| 포인트 라이트 총합 | ~50개 | ~8개 | ★★★★ |
| 재질 타입 | Standard | Lambert | ★★★ |
| 별 파티클 | 1,000개 | 600개 | ★★★ |
| 반딧불이 파티클 | 80개 | 40개 | ★★★ |
| 미니맵 렌더 | 매 프레임 | 변화 시만 | ★★ |

---

## [v1.1.0] — 2025-06-22 · 모바일 대응

### 배경
초기 버전에서 모바일 터치 드래그는 동작했으나,
핀치 줌·탭 선택·페이지 스크롤 방지 등이 미흡하여 전면 재작업.

### 변경 파일 및 내용

#### index.html
- `viewport` meta에 `maximum-scale=1.0, user-scalable=no` 추가
- `apple-mobile-web-app-capable`, `mobile-web-app-capable` meta 추가

#### css/style.css
- `body`, `canvas`에 `touch-action: none` 추가 (브라우저 기본 터치 동작 차단)
- `-webkit-tap-highlight-color: transparent` 추가

#### js/core/controls.js
- 터치 이벤트에 `e.preventDefault()` + `{ passive: false }` 추가
  - 드래그 중 페이지 스크롤 방지
- 핀치 줌 구현: 두 손가락 거리 변화로 카메라 반경 조정
- 탭 판별 로직 추가: 이동 12px 이내, 400ms 이내만 탭으로 처리
- 드래그 vs 탭 구분 (`drag.moved` 플래그)
- `touchend`에서 `pinchDist` 초기화

#### js/ui/popup.js
- 탭 콜백 연결 (`onTap`)
- 팝업 위치 계산: 화면 밖으로 나가지 않도록 자동 조정
  - 오른쪽/아래 잘릴 경우 반대 방향으로 이동

#### js/core/scene.js
- WebGL 미지원 체크 추가 → 안내 화면 표시
- `orientationchange` 이벤트 핸들러 추가 (가로/세로 전환 대응)

---

## [v1.0.0] — 2025-06-22 · 최초 구현

### 구현 내용

#### 마을 구성
- 3D 마을 외관 구현 (Three.js r128 기반)
- 중앙 광장 + 분수 + 벤치 4개
- 가로/세로 메인 도로 + 외곽 순환 도로
- 나무 2종 (침엽수/활엽수) 30그루 이상

#### 건물 11개
| # | 파일 | 건물명 | 기능 |
|---|------|--------|------|
| 1 | bar.js | 술 바 | 리뷰·미디어 |
| 2 | library.js | 도서관 | 교육·강의 |
| 3 | community.js | 커뮤니티 센터 | 커뮤니티·소셜 |
| 4 | shop.js | 주류 상점 | 쇼핑·스마트오더 |
| 5 | brewery.js | 양조장 | 전통주·스토리 |
| 6 | studio.js | 영상관 | 숏폼·콘텐츠 |
| 7 | infoCenter.js | 안내소 | 온보딩·가이드 |
| 8 | popupSquare.js | 팝업 광장 | 이벤트·체험 |
| 9 | myspace.js | 내 공간 | 마이페이지·셀러 |
| 10 | cafe.js | 소버 카페 | 무알코올·절주 |
| 11 | restaurant.js | 페어링 식당 | 안주·페어링 |

#### 환경 효과
- 밤하늘 배경 + FogExp2 안개
- 달 오브젝트 + 달빛 방향광 + 반구광
- 별 파티클 1,000개
- 반딧불이 파티클 80개
- 중앙 분수 파티클 + 맥동 조명

#### 컨트롤
- 마우스 드래그 — 360도 회전
- 스크롤 — 줌 인/아웃
- 키보드 — 방향키 이동, +/- 줌, R 리셋, Space 자동회전 토글
- 자동 회전 (3초 비조작 후 재개)

#### UI
- 로딩 화면 (메시지 5종 순환)
- 건물 팝업 (hover 미리보기 + 클릭 고정)
- 미니맵 (Canvas 2D, 건물별 색상)
- 나침반 (카메라 방향 연동)
- WebGL 미지원 안내 화면

#### 파일 구조
```
sool-village/
├── index.html
├── CHANGELOG.md
├── css/
│   └── style.css
└── js/
    ├── core/
    │   ├── scene.js
    │   ├── environment.js
    │   ├── controls.js
    │   └── main.js
    ├── buildings/
    │   ├── base.js
    │   ├── bar.js
    │   ├── library.js
    │   ├── community.js
    │   ├── shop.js
    │   ├── brewery.js
    │   ├── studio.js
    │   ├── infoCenter.js
    │   ├── popupSquare.js
    │   ├── myspace.js
    │   ├── cafe.js
    │   └── restaurant.js
    └── ui/
        ├── loading.js
        ├── popup.js
        └── minimap.js
```

---

*이 파일은 매 작업 후 업데이트됩니다.*
