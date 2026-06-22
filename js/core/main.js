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
    (cx, cy) => SoolPopup.onTap(cx, cy)  // 탭/클릭 → 팝업
  );

  // ── 로딩 완료 ─────────────────────────────────
  await SoolLoading.finish(300);

  // ── 애니메이션 루프 ───────────────────────────
  let t = 0;

  function animate() {
    requestAnimationFrame(animate);
    t += 0.016;

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

  animate();

})();
