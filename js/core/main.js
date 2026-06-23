/* ═══════════════════════════════════════════════
   술마을 — Main
   전체 모듈 조립 & 애니메이션 루프
   ═══════════════════════════════════════════════ */

(async function SoolMain() {

  try {
    // ── 로딩 시작 ───────────────────────────────
    SoolLoading.start();

    // ── Scene 초기화 ────────────────────────────
    const { renderer, scene, camera } = SoolScene.init();

    // ── 환경 생성 ───────────────────────────────
    SoolEnvironment.init(scene);

    // ── 건물 베이스 초기화 ──────────────────────
    SoolBuildings.init(scene);

    // ── 건물 11개 생성 ──────────────────────────
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

    // ── 히트박스 & 레지스트리 ───────────────────
    const hitBoxes = SoolBuildings.getHitBoxes();
    const registry = SoolBuildings.getRegistry();

    // ── UI 초기화 ───────────────────────────────
    SoolPopup.init(renderer, camera, hitBoxes);
    SoolMinimap.init(registry);

    // ── 컨트롤 초기화 ───────────────────────────
    SoolControls.init(
      camera,
      renderer.domElement,
      (cx, cy) => SoolPopup.onTap(cx, cy)
    );

    // ── 로딩 완료 ───────────────────────────────
    await SoolLoading.finish(300);

    // ── 하늘 시스템 초기화 (로딩 후 비동기) ────
    // 조명 & 파티클 참조 수집
    const lights    = SoolScene.getLights();
    const particles = SoolEnvironment.getParticles();
    // 초기화 (await 없이 — 날씨 로딩 중에도 씬 동작)
    SoolSky.init(scene, renderer, {
      moonLight:  lights.moonLight,
      ambient:    lights.ambient,
      hemi:       lights.hemi,
      starPoints: particles.starPoints,
      fireflies:  particles.fireflies,
    });

    // ── 애니메이션 루프 ─────────────────────────
    const isMobile   = /iPhone|iPad|Android/i.test(navigator.userAgent);
    const TARGET_FPS = isMobile ? 30 : 60;
    const FRAME_MS   = 1000 / TARGET_FPS;

    let t        = 0;
    let lastTime = 0;

    function animate(now) {
      requestAnimationFrame(animate);
      const delta = now - lastTime;
      if (delta < FRAME_MS) return;
      lastTime = now - (delta % FRAME_MS);
      t += delta * 0.001;

      SoolControls.update();
      SoolEnvironment.update(t);
      SoolBuildings.update(t);
      SoolSky.update(t);           // ★ 하늘 시스템 업데이트
      SoolMinimap.update(SoolControls.getTheta());
      renderer.render(scene, camera);
    }

    requestAnimationFrame(animate);

  } catch (err) {
    // 에러 발생 시 로딩 화면에 메시지 표시
    console.error('[술마을] 초기화 오류:', err);
    const loadingText = document.getElementById('loading-text');
    if (loadingText) {
      loadingText.textContent = '오류가 발생했어요. 콘솔을 확인해주세요.';
      loadingText.style.color = '#ff6666';
    }
  }

})();
