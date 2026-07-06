# CHANGELOG
술마을 (Sool Village) — 작업 이력

---

## [Planned] — 예정 작업

### v1.7.0 · RPG 시스템 (Social MMO Portal)

#### 개요
술마을을 단순 정보 플랫폼을 넘어 '플레이하는 술 플랫폼'으로 확장.
커뮤니티 활동 기반 경험치 시스템, 건물/콘텐츠 잠금 해제, 월드 이벤트,
NPC, 퀘스트로 구성된 RPG 루프 도입.

#### 핵심 컨셉
기존 플랫폼 차별점: Vivino = 리뷰 앱 / Untappd = 체크인 앱 / 술마을 = 플레이하는 술 플랫폼
유저가 마을에 '사는' 느낌 — 술을 마실수록, 배울수록, 나눌수록 캐릭터가 성장

#### 경험치 & 레벨
획득 방법: 리뷰 작성(+50) / 테이스팅 노트(+30) / 강의 수료(+200) /
체크인(+20) / 댓글(+10) / 월드 이벤트(+100) / 연속 접속 7일(+300)

레벨 직함: Lv.1 입문자 → Lv.5 애호가 → Lv.10 소믈리에
           → Lv.20 마스터 → Lv.30 양조사 → Lv.50 전설

#### 건물 잠금 해제
Lv.1 기본 개방(술 바·안내소) / Lv.3 도서관 / Lv.5 커뮤니티 / Lv.10 양조장
Lv.15 영상관 / Lv.20 팝업 광장 / Lv.30 내 공간 셀러 꾸미기

#### 월드 이벤트
정기: 매주 금요일 투표 / 매월 테이스팅 챌린지 / 계절 이벤트 4종
특별: 신제품 출시 팝업 / 유명 바텐더 NPC 방문 / 비 오는 날 보너스 XP (날씨 시스템 연동)

#### NPC
상주: 바텐더(술 바) / 사서(도서관) / 장인(양조장) / 안내원(안내소)
방문: 유명 바텐더(월 1회) / 주조 장인(계절) / 소믈리에(시즌)
구현: Three.js = 클릭 말풍선 팝업 / Unity 전환 후 = 실제 3D 캐릭터

#### 퀘스트
입문: 튜토리얼 3종 / 일일: 매일 리셋 3종 (날씨 연동 포함)
스토리: 연속 퀘스트 (예: 양조장 장인의 부탁 3화, 보상 뱃지+XP 500)
히든: 이스터에그 (비 오는 밤 12시 양조장 클릭 → 비밀 레시피 공개)

#### RPG 루프
접속 → 일일 퀘스트 확인 → 수행(리뷰·체크인·커뮤니티) → XP 획득
→ 레벨업 → 새 건물/콘텐츠 해금 → 더 깊은 콘텐츠 → 재방문 유도

#### 단계별 구현
Three.js 지금: 뱃지 UI·퀘스트 팝업 더미 데이터 (투자자 데모용)
Unity 전환 후: NPC 3D 캐릭터·퀘스트 실제 연동·잠금 해제 애니메이션
백엔드 연동 후: XP 저장·유저 랭킹·실시간 이벤트

---

### v1.6.0 · 소셜 시스템 (Social System)

#### 개요
마을에 나 혼자가 아닌 다른 사람도 함께 있다는 것을 보여주는 실시간 소셜 시스템.
메타버스의 실패(목적 없는 공간, 어색한 아바타)를 피하고
MMORPG의 채팅 문화를 술마을 세계관에 맞게 재해석한다.

#### 핵심 방향
아바타 없이 존재감을 표현하는 것이 핵심.
3D 공간은 술 정보·리뷰·커뮤니티를 담는 그릇이며, 공간 자체가 목적이 아님.

#### 채팅 시스템 4종

| 채팅 유형 | MMORPG 대응 | 술마을 활용 | 우선순위 |
|---------|-----------|-----------|--------|
| 월드 채팅 | 전체 채팅 | 접속 중인 모든 사람과 가벼운 소통 | ★★★★★ |
| 건물별 채팅 | 지역 채팅 | 건물 안 사람끼리 주제 집중 대화 | ★★★★★ |
| 커뮤니티 채팅 | 길드 채팅 | 취향 기반 소규모 그룹 채팅 | ★★★★ |
| 친구 채팅 (DM) | 귓속말 | 취향 맞는 사람과 1:1 연결 | ★★★ |

#### 아바타 없는 존재감 표현 4가지
1. **접속자 카운터** — "지금 127명이 마을에 있어요" / 건물별 인원 표시
2. **창문 불빛 연동** — 접속자 많을수록 창문 밝아짐 (술마을 세계관과 완벽히 어울림)
3. **광장 전광판** — "홍길동님이 야마자키 12년을 ★★★★☆ 평가했어요" 흘러가는 피드
4. **발자국 / 흔적** — "오늘 이 리뷰를 142명이 읽었어요"

#### 아바타 도입 — 현재 단계 보류
메타버스 실패 패턴을 따라가지 않기 위해 현 단계에서는 보류.
Unity 전환 이후 간단한 도트 수준의 존재 표시만 검토.

#### 기술 구현 방안
- 실시간 채팅: WebSocket (Socket.io) + Node.js 백엔드
- 접속자 수 동기화: WebSocket 이벤트 (접속/퇴장)
- 창문 불빛 연동: Three.js `emissiveIntensity` 동적 조절 (0.2 ~ 1.5)
- 프로토타입 단계: 더미 데이터로 창문 불빛 효과 먼저 구현 가능

---

## [v1.6.9] — 2026-07-06 · 마리아주 & 소버 카페 구현

### Supabase DB 변경

#### pairing_posts 테이블 신규 생성 (마리아주)
- id / user_id (FK → users, null=관리자) / type (pairing·recipe)
- category / title / content / emoji_drink / emoji_food / tag
- view_count / like_count / comment_count / created_at

#### pairing_likes / pairing_comments 테이블 신규 생성
- 양조장 좋아요·댓글 구조와 동일 (post_id, user_id, UNIQUE 제약)

#### cafe_nolo_drinks 테이블 신규 생성 (소버 카페)
- id / user_id (FK → users, null=관리자) / name / category (무알코올·저알코올)
- description / avg_rating / review_count / created_at

#### cafe_nolo_reviews 테이블 신규 생성
- id / nolo_drink_id (FK) / user_id (FK) / rating(1~5) / content / created_at

#### challenges / challenge_participants 테이블 신규 생성
- challenges: title / description / emoji / duration_days
- challenge_participants: challenge_id / user_id / joined_at, UNIQUE(challenge_id, user_id)
- 진행률(%)은 joined_at 기준 실시간 계산

#### cafe_daily_picks 테이블 신규 생성
- id / user_id (FK → users, null=관리자 공식) / title / description / emoji / tag / pick_date

#### 샘플 데이터 삽입
- 마리아주: 페어링 추천 6개, 안주 레시피 3개
- 소버 카페: 무알코올 음료 3개, 절주 챌린지 2개, 오늘의 한 잔 1개

### 신규 파일

#### pairing-detail.html
- 마리아주 페어링·레시피 상세 페이지, 좋아요·댓글 (양조장 패턴과 동일)

#### cafe-detail.html
- 소버 카페 상세 페이지, `type` 파라미터로 무알코올 음료 상세(별점 리뷰) /
  오늘의 한 잔 상세를 한 파일에서 분기 처리

### 변경 파일

#### restaurant.html (마리아주)
- 페어링 추천·안주 레시피 더미 데이터 → pairing_posts 실데이터 연동
- "+ 글쓰기"로 유저가 직접 페어링/레시피 등록 가능
- 술로 찾기 탭 카테고리 필터 실제 동작하도록 구현
- 마을로 돌아가기 → index.html 고정 (기존 history.back() 조건부 로직 버그 수정)

#### cafe.html (소버 카페)
- 무알코올 리뷰 탭: cafe_nolo_drinks 실데이터 연동, "+ 음료 등록"으로 유저 등록 가능
- 절주 챌린지 탭: "참여하기" 시 실제 DB 기록, 참여자 수·진행률 실데이터 계산
- 오늘의 한 잔 탭: 관리자 공식 추천 + 유저 피드 함께 표시, "+ 오늘 마시는 술 올리기" 추가
- 목록 전용 구조로 재편, 카드 클릭 시 cafe-detail.html로 이동 (다른 건물과 통일)
- 모달 방식 리뷰 작성 → 상세페이지 방식으로 구조 변경

#### admin.html
- 🍽️ 마리아주 탭 신규 추가 — 게시글 목록, 삭제, 상세 이동
- 🌿 소버카페 탭 신규 추가 — 무알코올 음료 / 오늘의 한 잔 / 절주 챌린지 참여 현황 3개 섹션

### 기술 결정
- 유저 기여 콘텐츠(user_id 있음)는 관리자 삭제만 가능, 수정 불가 원칙 그대로 적용
- 마리아주는 페어링·레시피를 pairing_posts 단일 테이블 + type 컬럼으로 통합 (양조장 패턴과 통일)
- 소버 카페 리뷰 시스템은 술 바(drinks·reviews)와 동일 구조 재사용

---

## [v1.6.8] — 2026-07-03 · 영상관 구현

### Supabase DB 변경

#### studio_posts 테이블 신규 생성
- id / user_id (FK → users) / type (trending·recipe·upload)
- title / content / video_url / image_url
- like_count / comment_count / view_count / created_at / updated_at

#### studio_comments 테이블 신규 생성
- id / post_id (FK → studio_posts) / user_id (FK → users)
- content / created_at

#### studio_likes 테이블 신규 생성
- id / post_id (FK → studio_posts) / user_id (FK → users) / created_at
- UNIQUE(post_id, user_id) — 좋아요 중복 방지

#### 초기 데이터 삽입 (5개)
- 트렌딩: 맥켈란 18년 vs 글렌피딕 18년 비교, 막걸리 가이드
- 레시피: 위스키 하이볼 황금 비율, 막걸리 칵테일 5가지
- 유저 영상: 글렌리벳 12년 리뷰

### 신규 파일

#### studio-detail.html
- 영상관 상세 페이지
- 유튜브 썸네일 표시 → 클릭 시 임베드 플레이어로 전환 (autoplay)
- 외부 재생 차단 문제 해결 (썸네일+클릭 재생 방식)
- 유튜브 외 외부 링크는 새 탭으로 열기
- 👍 좋아요 토글 (중복 클릭 방지, 초기 상태 확인)
- 댓글 작성·조회
- XSS 방지 (esc 함수), 에러 처리

#### studio-write.html
- 영상 공유 작성 페이지
- 카테고리 선택 (트렌딩/레시피/유저 영상) — 진입 탭 자동 선택
- 유튜브 URL 입력 → 실시간 미리보기
- 잘못된 URL 입력 시 에러 메시지
- 등록 완료 후 studio.html로 자동 복귀

### 변경 파일

#### studio.html
- 트렌딩·레시피·유저 영상 탭 → studio_posts 실데이터 로딩
- 유튜브 썸네일 자동 표시 (mqdefault)
- 카드 클릭 → studio-detail.html 이동
- ✏️ 영상 공유 버튼 (비로그인 시 auth.html로)
- 더미 카드 완전 제거
- XSS 방지 esc() / safeSlice() 함수 추가
- .limit(50) 추가
- sessionStorage 탭 복원 패턴 적용
- 마을로 돌아가기 → index.html 고정

### 기술 결정
- 영상관 콘텐츠는 studio_posts 전용 테이블로 독립 관리
- 유튜브 외부 재생 차단 대응: 썸네일 먼저 표시 후 클릭 시 임베드 전환

---

## [v1.6.7] — 2026-07-03 · 양조장 건물 구현

### Supabase DB 변경

#### brewery_posts 테이블 신규 생성
- id / user_id (FK → users) / type (story·brewery·method)
- title / content / image_url / embed_url
- like_count / comment_count / view_count / created_at / updated_at

#### brewery_comments 테이블 신규 생성
- id / post_id (FK → brewery_posts) / user_id (FK → users)
- content / created_at

#### brewery_likes 테이블 신규 생성
- id / post_id (FK → brewery_posts) / user_id (FK → users) / created_at
- UNIQUE(post_id, user_id) — 좋아요 중복 방지

#### 초기 데이터 삽입
- 양조 이야기: 누룩, 술의 씨앗 — 천년을 이어온 발효의 비밀
- 양조장 소개: 복순도가 손막걸리 양조장
- 양조 방법: 집에서 만드는 단양주 막걸리 — 7일 완성 레시피

### 신규 파일

#### brewery-detail.html
- 양조장 게시글 상세 페이지
- 제목·내용·작성자·조회수 표시
- 👍 좋아요 토글 (중복 클릭 방지, 초기 상태 확인)
- 댓글 작성·조회
- 비로그인 시 댓글 폼 → 로그인 유도
- XSS 방지 (textContent 사용)
- 에러 처리 (console.error)

### 변경 파일

#### brewery.html
- 탭 이름 변경: 스토리→양조 이야기 / 양조장 탐방→양조장 소개 / 주종 가이드→양조 방법
- 각 탭 → brewery_posts 테이블 실데이터 로딩
- 카드 형태로 간략 내용 표시 → 클릭 시 brewery-detail.html 이동
- ✏️ 글쓰기 버튼 추가 (비로그인 시 🔐 로그인 후 작성으로 표시)
- XSS 방지 esc() 함수 추가
- 안전한 문자열 자르기 safeSlice() 함수 추가
- .limit(50) 추가
- 에러 처리 추가
- sessionStorage 탭 복원 패턴 적용
- 마을로 돌아가기 → index.html 고정

### 기술 결정
- 양조장 콘텐츠는 커뮤니티(posts) 테이블과 분리하여 brewery_posts 전용 테이블로 관리
- 커뮤니티 센터와 양조장의 콘텐츠 독립성 확보
- 기존 커뮤니티에서 양조장 관련 커뮤니티 삭제

---

## [v1.6.6] — 2026-07-02 · 건물 배치 개선 & 바로가기 카메라 연동

### 변경 파일

#### js/core/controls.js
- `moveTo(x, z)` → `moveTo(x, z, theta)` 파라미터 추가
  - theta 값이 있으면 카메라 방향도 함께 이동

#### index.html
- `moveToBuilding()` 함수 개선
  - 건물별 정면 바라보는 각도(BUILDING_THETA) 추가
  - 숏컷 클릭 시 카메라가 해당 건물 정면을 바라보도록 자동 회전
  - 팝업 표시 타이밍 600ms → 800ms (회전 애니메이션 완료 후)
- 숏컷 버튼 좌표 전면 업데이트 (건물 배치 변경에 따른 동기화)

#### 건물 JS 파일 11개 — 좌표 재배치 (지그재그 구조)
앞줄 건물 (광장에서 더 멀리, X 간격 좁힘):
- bar.js: `[-5.5, 0, -3.5]` → `[-7.0, 0, -5.0]`
- library.js: `[5.5, 0, -3.5]` → `[7.0, 0, -5.0]`
- brewery.js: `[-7.0, 0, 0]` → `[-9.0, 0, 0]`
- shop.js: `[7.0, 0, 0]` → `[9.0, 0, 0]`
- studio.js: `[-2.0, 0, 5.5]` → `[-3.0, 0, 8.0]`
- infoCenter.js: `[2.5, 0, 5.5]` → `[3.5, 0, 8.0]`

뒷줄 건물 (앞줄 사이사이 지그재그 배치):
- community.js: `[0, 0, -7.5]` → `[0, 0, -12.0]`
- popupSquare.js: `[-11.0, 0, -5.0]` → `[-6.0, 0, -10.0]`
- myspace.js: `[11.0, 0, -5.0]` → `[6.0, 0, -10.0]`

위치 유지:
- cafe.js: `[-11.0, 0, 5.0]` 유지
- restaurant.js: `[11.0, 0, 5.0]` 유지

### 배치 의도
- 앞줄 건물 간격을 벌려서 뒷줄 건물이 사이로 보이도록
- 팝업·내공간이 술바·도서관에 가려지던 문제 해소
- 바로가기 클릭 시 카메라가 건물 정면을 자동으로 바라봄

---

## [v1.6.5] — 2026-07-02 · 도서관 & 강의 시스템 구현

### Supabase DB 변경

#### users 테이블 컬럼 추가
- `is_instructor` (BOOLEAN, 기본값 false) — 강사 인증 여부

#### courses 테이블 신규 생성
- id / instructor_id (FK → users) / title / description / category
- type (text / video / audio / live)
- content_text / content_url / live_at
- duration_min / is_free / required_level / thumbnail_url
- is_published (기본값 false) — 어드민 승인 후 공개

#### course_enrollments 테이블 신규 생성
- id / user_id (FK) / course_id (FK)
- progress / completed / completed_at / created_at
- UNIQUE(user_id, course_id)

### 신규 파일

#### course-detail.html
- 강의 상세 페이지
- 텍스트·동영상(유튜브 임베드)·음성·실시간 강의 모두 지원
- 수강 신청 버튼
- 수료 완료 버튼 (+200 XP 자동 지급)
- 어드민/강사에게만 ✏️ 수정 버튼 표시
- 수정 모달: 제목·유형·카테고리·설명·URL·텍스트·소요시간·레벨·무료여부·실시간일시 수정 가능

### 변경 파일

#### library.html
- 강의 목록 탭 → Supabase 실데이터 연결
  - 강의 유형별 이모지 표시 (📝🎬🎙️🔴)
  - 무료/유료·레벨·강사 정보 표시
  - 카드 클릭 → course-detail.html 이동
- 커뮤니티 자료 섹션 추가
  - 자격증 스터디·정보&뉴스 커뮤니티 게시글 최신 5개 표시
  - 게시글 클릭 → post-detail.html 이동
- 내 강의실 탭 → 수강 중인 강의 실데이터 (진행률 표시)
- 수료증 탭 → 완료한 강의 수료증 카드 표시
- Supabase CDN head로 이동 (탭 오류 수정)
- 마을로 돌아가기 → index.html 고정

#### admin.html
- 📚 강의 탭 추가
  - 강의 등록 폼 (제목·유형·카테고리 선택·설명·URL·텍스트·소요시간·레벨·무료여부·실시간일시)
  - 카테고리 input → select로 변경 (위스키/전통주/와인/맥주/칵테일/기타/자격증/소믈리에/공통)
  - 공개 강의 목록 (수정·삭제 버튼)
  - 승인 대기 강의 목록 (승인·거절 버튼)
  - 강사 인증 부여/취소 (이메일로 검색)
  - 인증된 강사 목록 (닉네임·이메일·등록강의수·인증취소 버튼)
- 유저 탭 권한 배지 개선
  - ADMIN / USER 배지 유지
  - 강사 인증된 유저에게 🟡 강사 배지 추가
- 술 DB·리뷰·게시글·강의 행 클릭 → 해당 상세 페이지 이동
  - 삭제 버튼은 event.stopPropagation()으로 분리

#### drink-detail.html
- 공식 설명 섹션 추가 (관리자 제공 배지) — drinks.description 표시
- 유저 소개 섹션 → '유저 한줄 소개'로 명칭 변경
- 어드민 수정 모달 간소화
  - 수정 가능: 이름·카테고리·서브카테고리·브랜드·원산지·지역·도수·공식설명
  - 제거: 향/맛/피니시/페어링/가격대 (유저 기여 항목)
- 유저 기여 항목에 어드민 ✕ 삭제 버튼 추가
  - 유저 한줄 소개·가격대 항목 삭제
  - 테이스팅 노트 태그 삭제

---

## [v1.6.4] — 2026-07-01 · 커뮤니티 센터 구현

### Supabase DB 변경

#### posts 테이블 컬럼 추가
- `community_id` (FK → communities)
- `image_url` — 이미지 URL
- `embed_url` — 유튜브 / 외부 링크

#### comments 테이블 신규 생성
- id / post_id (FK) / user_id (FK) / content / like_count / created_at

#### post_likes 테이블 신규 생성
- id / post_id (FK) / user_id (FK) / created_at
- UNIQUE(post_id, user_id)

#### communities 테이블 신규 생성
- id / name / description / icon / sort_order / created_at
- 기본 커뮤니티 11개 삽입:
  위스키 마니아 / 전통주 덕후 / 와인 러버 / 맥주 덕후 / 칵테일 바 /
  기타 주류 / 하이볼 클럽 / 소버라이프 / 자격증 스터디 / 정보&뉴스 / 질문&답변

### 신규 파일

#### post-detail.html
- 게시글 상세 페이지
- 조회수 자동 증가
- 👍 좋아요 토글 (post_likes 테이블)
- 댓글 작성·조회 (comments 테이블)
- 본인 글일 때 🗑️ 삭제 버튼 표시

#### community-posts.html
- 커뮤니티별 게시글 목록 페이지
- 이미지 URL → 썸네일 표시
- 유튜브 링크 → 임베드 플레이어 표시
- 기타 외부 링크 → 링크 표시
- 우하단 ✏️ 글쓰기 FAB 버튼 → 모달 팝업
- 비로그인 시 글쓰기 버튼 숨김

### 변경 파일

#### community.html
- 커뮤니티 탭 → Supabase 실데이터 로딩
- 커뮤니티 카드 클릭 → community-posts.html 이동
- 자유게시판 탭 → 실데이터 로딩 (전체 게시글)
- 글쓰기 탭 → 커뮤니티 선택 + 이미지URL + 임베드URL 입력
- Supabase CDN을 head로 이동 (switchTab 오류 수정)
- getYoutubeId → URL API 방식으로 교체 (정규식 오류 수정)
- 마을로 돌아가기 → index.html 고정

#### admin.html
- 💬 게시글 탭 추가
  - 게시글 목록 (카테고리·제목·작성자·좋아요·댓글·작성일)
  - 게시글 삭제 기능

#### post-detail.html
- 본인 글 삭제 버튼 추가 (🗑️)
- 삭제 후 이전 페이지로 복귀

---

## [v1.6.3] — 2026-07-01 · 술 상세 위키화 & 리뷰 작성 탭 구현

### Supabase DB 변경

#### drink_contributions 테이블 신규 생성
- id (UUID, PK)
- drink_id (FK → drinks)
- user_id (FK → users)
- type TEXT — intro / price / serve / nose / palate / finish
- content TEXT
- like_count INTEGER (기본값 0)
- created_at
- UNIQUE(drink_id, user_id, type)

### 변경 파일

#### drink-detail.html — 위키 스타일로 전면 개편
- **기본 정보** (관리자 제공): 카테고리·브랜드·도수·원산지·지역
- **소개** (유저 기여): 유저 한줄 소개 작성 + 👍 투표
- **가격대** (유저 기여): 유저 가격 정보 작성 + 👍 투표
- **음용 방법** (유저 투표): 태그 클릭으로 투표 (스트레이트·온더락·하이볼 등)
- **테이스팅 노트** (유저 투표): 향/맛/피니시 태그 투표 + 새 태그 추가
- 섹션별 '관리자 제공' / '유저 기여' / '유저 투표' 배지 표시
- 리뷰·좋아요/싫어요 기존 유지

#### bar.html — 리뷰 작성 탭 실제 기능 구현
- 술 이름 실시간 검색 (300ms 디바운스)
- 검색 결과 드롭다운 → 선택 후 고정 표시
- 별점 선택 (1~5)
- 향미 태그 복수 선택 (16종)
- 한줄 리뷰 텍스트 입력
- 등록 시 drinks 테이블 avg_rating·review_count 자동 업데이트
- 등록 완료 후 폼 초기화 + 최신 리뷰 탭 갱신
- 비로그인 시 로그인 유도

#### popup.js
- `showByData(data)` 함수 추가
  - 숏컷 버튼 클릭 시 화면 중앙에 팝업 자동 표시

#### index.html
- 숏컷 버튼 `SoolControls.moveTo()` → `moveToBuilding()` 함수로 변경
  - 카메라 이동 + 0.6초 후 해당 건물 팝업 자동 표시
  - `SoolBuildings.getRegistry()`에서 건물 데이터 조회

---

## [v1.6.2] — 2026-06-30 · 술 상세 페이지 & 탭 복원 패턴

### 신규 파일

#### drink-detail.html
- 술 상세 페이지
- 히어로: 술 이름·카테고리·브랜드·도수·원산지·평균 평점
- 기본 정보 섹션: 카테고리·서브카테고리·브랜드·도수·원산지·지역·가격대·음용방법
- 설명 섹션: description 있을 때만 표시
- 테이스팅 노트 섹션: nose·palate·finish 있을 때만 표시
- 페어링 섹션: pairing 있을 때만 태그로 표시
- 리뷰 작성 섹션
  - 별점 선택 (1~5)
  - 향미 태그 복수 선택 (달콤함·쓴맛·산미·과일향 등 16종)
  - 한줄 리뷰 텍스트
  - 비로그인 시 로그인 유도
  - 등록 시 평균 평점·리뷰 수 자동 업데이트
- 유저 리뷰 목록
  - 닉네임·별점·작성 시간·내용·향미 태그 표시
  - 👍 좋아요 / 👎 싫어요 (토글·변경·취소 지원)
  - 비로그인 시 auth.html로 이동
- `goBack()` 함수: from 파라미터로 이전 페이지 복귀

#### drinks.csv
- 술 샘플 데이터 301개 생성
  - 위스키 50개 (스카치·버번·재패니즈·아이리시)
  - 전통주 50개 (막걸리·약주·소주·청주·과실주)
  - 와인 50개 (레드·화이트·스파클링·로제·포트·세리)
  - 맥주 51개 (라거·에일·IPA·스타우트·밀맥주·람빅)
  - 칵테일 50개 (클래식·하이볼·시그니처·목테일)
  - 기타 50개 (진·럼·보드카·테킬라·코냑·리큐르·사케·바이주)
- Supabase Table Editor CSV Import로 일괄 등록

### Supabase DB 변경

#### drinks 테이블 컬럼 추가
- `pairing` — 어울리는 음식 (콤마 구분 텍스트)
- `serve_method` — 음용 방법
- `price_range` — 가격대
- `nose` — 테이스팅 노트: 향
- `palate` — 테이스팅 노트: 맛
- `finish` — 테이스팅 노트: 피니시

#### review_reactions 테이블 신규 생성
- id (UUID, PK)
- review_id (FK → reviews)
- user_id (FK → users)
- reaction (like / dislike)
- created_at
- UNIQUE(review_id, user_id) — 유저당 리뷰 1개 리액션만 허용

### 변경 파일

#### bar.html
- 주류 탐색 카드 클릭 → `drink-detail.html?id=xxx&from=bar.html` 이동
- 최신 리뷰 카드 클릭 → `drink-detail.html?id=xxx&from=bar.html` 이동
- `switchTab()` — 탭 전환 시 `sessionStorage('bar_tab')` 저장
- `DOMContentLoaded` — 복귀 시 저장된 탭 자동 복원
- 탭 복원 패턴: sessionStorage + from 파라미터 방식으로 통일

### 미완료 (다음 작업)
- 나머지 10개 건물 서비스 페이지에 탭 복원 패턴 적용

---

## [v1.6.1] — 2026-06-29 · 어드민 페이지 & 술 바 실데이터 연결

### 신규 파일

#### admin.html
- 술향기마을 어드민 대시보드
- is_admin 체크 — 비어드민/비로그인 접근 차단 화면 표시
- 탭 구조: 술 DB / 유저 / 리뷰
- **술 DB 탭**: 새 술 등록 폼 + 목록 테이블 (삭제 기능 포함)
- **유저 탭**: 가입 유저 목록 (닉네임·이메일·레벨·XP·권한·가입일)
- **리뷰 탭**: 리뷰 목록 (술명·작성자·평점·내용 미리보기·작성일·삭제)
- 상단 네비: 마을로 이동 버튼 + 로그아웃 버튼

### Supabase DB 변경

#### users 테이블
- `is_admin` 컬럼 추가 (BOOLEAN, 기본값 false)

### 변경 파일

#### index.html
- 유저 블록 레벨 옆 어드민 버튼 추가
  - is_admin = true인 경우에만 표시
  - 클릭 시 admin.html 이동
- `initUserState()` 쿼리에 `is_admin` 필드 추가

#### bar.html
- **주류 탐색 탭** 실데이터 연결 (Supabase drinks 테이블)
  - 카테고리별 이모지 자동 매핑
  - 이름 옆 도수 표시, 카테고리 별도 행 표시
- **최신 리뷰 탭** 실데이터 연결 (Supabase reviews 테이블)
  - 작성자 닉네임, 술 이름, 카테고리 조인 표시
  - 상대 시간 표시 (방금 전 / N분 전 / N시간 전 / N일 전)
- Supabase CDN 및 supabase.js 스크립트 태그 추가

---

## [v1.6.0] — 2026-06-29 · Supabase 연동 & 인증 시스템 구축

### 개요
Supabase 프로젝트 생성 및 핵심 DB 테이블 구축.
이메일/비밀번호 기반 회원가입·로그인 구현.
UI존 상단에 로그인 상태 표시 블록 추가.

### 신규 파일

#### js/core/supabase.js
- Supabase 클라이언트 초기화
- `soolClient` 전역 객체로 노출 (변수명 충돌 방지)

#### auth.html
- 회원가입 / 로그인 탭 전환 방식 페이지
- 술향기마을 다크 퍼플 디자인 톤 적용
- 이메일/비밀번호 로그인 및 회원가입
- 성공/오류 메시지 인라인 표시
- 이미 로그인된 경우 index.html 자동 이동

### Supabase DB 테이블 (3개)

#### users
- id (UUID) / email / nickname / profile_image / bio
- level (기본값 1) / xp (기본값 0) / created_at / updated_at

#### drinks
- id (UUID) / name / category / subcategory / brand
- country / region / alcohol_degree / description / image_url
- avg_rating / review_count / created_at

#### reviews
- id (UUID) / user_id (FK) / drink_id (FK)
- rating (1~5) / content / taste_tags (배열) / image_url
- like_count / created_at / updated_at

### Supabase 트리거
- `on_auth_user_created` — 회원가입 시 users 테이블 자동 생성

### 변경 파일

#### index.html
- Supabase CDN 스크립트 태그 추가
- UI존 최상단에 유저 상태 블록 추가
  - 로그인 상태: 닉네임 + 레벨 + 로그아웃 버튼
  - 비로그인 상태: 로그인/가입 버튼 → auth.html 이동
- `initUserState()` / `handleLogout()` 함수 추가

#### css/style.css
- 유저 상태 블록 스타일 추가

---

## [v1.5.2] — 2026-06-26 · 카메라·UI·건물 배치 개선

### 변경 파일

#### js/core/controls.js
- 카메라 수직각(`phi`) 조정: `0.72` → `0.32`

#### js/buildings/studio.js
- 영상관 위치 변경: `[0, 0, 5.5]` → `[-2.0, 0, 5.5]`

#### js/buildings/infoCenter.js
- 안내소 위치 변경: `[-2.5, 0, -11.0]` → `[2.5, 0, 5.5]`
  - 커뮤니티 건물에 가려지던 문제 해소, 영상관 옆으로 이동

#### index.html
- 안내소·영상관 숏컷 버튼 좌표 업데이트
- 건물 숏컷에 혼잡도 세로 줄 표시 추가
  - 🟢 초록: 여유 / 🟡 노랑: 보통 / 🔴 빨강: 혼잡
  - 현재 더미 데이터, 추후 실제 API 연결 예정
- 모바일 전용 시점 회전 버튼 블록 추가 (◀ L / R ▶)

#### css/style.css
- 혼잡도 세로 줄 CSS 추가 (`.congestion-bar`, `.bar-green`, `.bar-yellow`, `.bar-red`)
- 모바일 회전 버튼 CSS 추가 (`#ui-rotate`, `.rotate-btn`)

#### 서비스 페이지 (html 9개)
- 건물 탭 메뉴 가운데 정렬 (`.tabs`에 `justify-content: center` 추가)
- 적용: bar / library / community / shop / brewery / studio / myspace / cafe / restaurant
- 미적용: infoCenter · popupSquare (탭 없음)

---

## [v1.5.1] — 2025-06-25 · UI 세부 개선 & 버그 수정

### 변경 파일

#### index.html
- 건물 숏컷 토글 기능 추가 (▸/▾ 클릭으로 접기/펼치기)
  - 모바일 기본값: 접힘 / 데스크탑 기본값: 펼침
- 건물 명칭 붙여쓰기 + 최대 4자로 변경
  - 페어링 식당 → **마리아주**

#### js/buildings/restaurant.js
- `name: '페어링 식당'` → `name: '마리아주'` 변경

#### js/core/skySystem.js
- 노을(sunset) 색상 강도 50% 다운
  - 배경색: `0xE8603A` → `0x8A5A3A`
  - 환경광·반구광·태양광 강도 축소
  - 안개 밀도: 0.022 → 0.014

#### css/style.css
- 모바일 레이아웃 전면 개선 (UI존 너비 150px → 110px)
- 채팅 전송 버튼 진하게
- 전체 폰트 밝기 상향
- 숏컷 박스 자동 높이, 토글 레이블 스타일 추가

---

## [v1.5.0] — 2025-06-25 · 쿼터뷰 전환 & UI 전면 재설계

### 개요
카메라를 자유 회전에서 쿼터뷰(45도 고정)로 전환.
UI를 우측 패널(UI존) + 하단 채팅창 구조로 전면 재설계.

### 변경 파일

#### js/core/controls.js
- 자유 회전 → 쿼터뷰 방식으로 전면 교체
  - 드래그: 맵 패닝 / Q/E: 90도 회전 / 스크롤·핀치: 줌 / R: 리셋
- `moveTo(x, z)` 함수 추가

#### js/core/scene.js
- 화각 52° → 45° / radius 22 → 20 / 초기 시점 남동쪽 45도 고정

#### index.html
- 나침반 제거
- UI존 구성: 날씨&위치 · 건물 숏컷 11개 · 조작 가이드
- 하단 채팅창 추가 (더미): 월드/건물/커뮤니티/DM 탭

#### css/style.css
- UI존 (우측 176px) / 채팅창 (하단 좌측 140px)
- 전체 폰트 밝기 2단계 상향

### 제거된 요소
- 나침반, 힌트바, 미니맵, 자동 회전

---

## [v1.4.4] — 2025-06-24 · 섬 배경 전환 & 세계관 확장 기획

### 개요
마을(평면) 배경에서 섬(Island) 배경으로 전환.
바다·모래사장·잔디·벽돌·광장 5레이어 지형 구성.

### 변경 파일

#### js/core/environment.js
- `makeGround()` 5레이어 섬 구조로 전면 재설계
  - 레이어 1: 바다 / 2: 모래사장 / 3: 잔디 / 4: 벽돌 타일 / 5: 광장

#### js/core/scene.js
- 배경색·안개·환경광·달빛·반구광 바다 테마로 전환
- 카메라 far: 150 → 200

#### js/core/skySystem.js
- 시간대·날씨별 색상 섬 특성 반영

### 세계관 방향 확정
- Three.js 단계: 섬(Island) / Unity 전환 시: 섬 or 행성 최종 결정
- 장기 비전: 테마별 섬/행성 멀티버스 플랫폼

---

## [v1.4.3] — 2025-06-24 · 전체 건물 서비스 페이지 완성

### 신규 파일 (서비스 페이지 8개)
- `bar.html` / `library.html` / `community.html` / `shop.html`
- `brewery.html` / `studio.html` / `cafe.html` / `restaurant.html`

### 변경 파일
- 각 건물 js 파일: `url: '#건물명'` → `url: '건물명.html'` 변경

---

## [v1.4.2] — 2025-06-24 · 마이하우스 & 바닥 재설계

### 신규 파일
- `myspace.html` — 마이하우스 서비스 페이지 (골드 테마)

### 변경 파일

#### js/core/environment.js
- `makeGround()` 3레이어 바닥 방식으로 재설계
- `makeRoads()` 완전 제거

### 마이하우스 설계 확정
- 성장 5단계: 노점 → 리어카 → 천막 → 부스 → 건물

---

## [v1.4.1] — 2025-06-24 · 서비스 페이지 도입 & 도로 재설계

### 신규 파일
- `infoCenter.html` / `popupSquare.html`

### 변경 파일

#### js/core/environment.js
- `makeRoads()` 건물 좌표 기반 자동 도로 생성 방식으로 전면 재설계

---

## [v1.4.0] — 2025-06-23 · 하늘 시스템 구현

### 신규 파일
- `js/core/skySystem.js` — 하늘 시스템 전체 로직

### 구현 내용
- 위치 감지: ipapi.co API
- 날씨 연동: Open-Meteo API (무료 무제한)
- 시간대 3단계 (낮·노을·밤) × 날씨 3종 (맑음·흐림·비) = 총 9가지 조합
- 날씨 파티클: 구름 40개 / 빗줄기 600개

---

## [v1.2.1] — 2025-06-22 · 버그 수정

### 수정 내용
- `makeStars()` sizes 배열 참조 오류 → 무한 로딩 수정
- `base.js` gable 지붕: ExtrudeGeometry → CylinderGeometry 교체
- `main.js` try-catch 감싸기

---

## [v1.2.0] — 2025-06-22 · 성능 최적화

### 변경 파일
- 픽셀 레이시오 2.0 → 1.0 고정
- 그림자 맵 2048 → 512
- 포인트 라이트 ~50개 → ~8개
- MeshStandardMaterial → MeshLambertMaterial
- 별 파티클 1,000 → 600 / 반딧불이 80 → 40

---

## [v1.1.0] — 2025-06-22 · 모바일 대응

### 변경 파일
- 터치 이벤트 전면 재작업 (핀치 줌, 탭 판별, 스크롤 방지)
- WebGL 미지원 체크 추가
- 화면 방향 전환 대응

---

## [v1.0.0] — 2025-06-22 · 최초 구현

### 구현 내용
- Three.js r128 기반 3D 마을
- 건물 11개, 광장·분수·나무·가로등
- 별·반딧불이 파티클, 달빛
- 마우스·키보드 컨트롤
- 건물 팝업, 미니맵, 나침반, 로딩 화면

---

*이 파일은 매 작업 후 업데이트됩니다.*
