/* ═══════════════════════════════════════════════
   술마을 — Main
   전체 모듈 조립 & 애니메이션 루프
   ═══════════════════════════════════════════════ */

(async function SoolMain() {

  // ── 로딩 시작 ─────────────────────────────────
  SoolLoading.start();

  // ── Scene 초기화 ──────────────────────────────
  const { renderer, scene, camera } = SoolScene.init();

  // ── 환경 생성 ─────────────────────────────────
  SoolEnvironment.init(scene);

  // ── 건물 베이스 초기화 ────────────────────────
  SoolBuildings.init(scene);

  // ── 건물 11개 생성 ────────────────────────────
  BuildingBar.init(scene);
  BuildingLibrary.init(scene);
  BuildingCommunity.init(scene);
  BuildingShop.init(scene);
  BuildingBrewery.init(scene);
  BuildingStudio.init(scene);
  BuildingInfoCenter.init(scene);
  BuildingPopupSquare.init(scene);
  BuildingMyspace.init(scene);
  BuildingCafe.init(scene);
  BuildingRestaurant.init(scene);

  // ── 히트박스 & 레지스트리 ─────────────────────
  const hitBoxes = SoolBuildings.getHitBoxes();
  const registry = SoolBuildings.getRegistry();

  // ── UI 초기화 ─────────────────────────────────
  SoolPopup.init(renderer, camera, hitBoxes);
  SoolMinimap.init(registry);

  // ── 컨트롤 초기화 (탭 콜백 연결) ─────────────
  SoolControls.init(
    camera,
    renderer.domElement,
    (cx, cy) => SoolPopup.onTap(cx, cy)
  );

  // ── 로딩 완료 ─────────────────────────────────
  await SoolLoading.finish(300);

  // ── 애니메이션 루프 ───────────────────────────
  // ★ 최적화: 목표 프레임 60fps (모바일은 30fps)
  const isMobile  = /iPhone|iPad|Android/i.test(navigator.userAgent);
  const TARGET_FPS = isMobile ? 30 : 60;
  const FRAME_MS   = 1000 / TARGET_FPS;

  let t         = 0;
  let lastTime  = 0;

  function animate(now) {
    requestAnimationFrame(animate);

    // ★ 최적화: 목표 fps 이하일 때만 렌더 (프레임 스킵)
    const delta = now - lastTime;
    if (delta < FRAME_MS) return;
    lastTime = now - (delta % FRAME_MS);
    t += delta * 0.001; // 초 단위 누적

    // 컨트롤 업데이트 (카메라 이동)
    SoolControls.update();

    // 환경 애니메이션 (별, 반딧불이, 분수)
    SoolEnvironment.update(t);

    // 건물 창문 깜빡임
    SoolBuildings.update(t);

    // 미니맵 & 나침반 업데이트
    SoolMinimap.update(SoolControls.getTheta());

    // 렌더
    renderer.render(scene, camera);
  }

  requestAnimationFrame(animate);

})();
