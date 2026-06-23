/* ═══════════════════════════════════════════════
   술마을 — Scene, Camera, Lights
   ═══════════════════════════════════════════════ */

const SoolScene = (() => {

  let renderer, scene, camera;

  // ── WebGL 지원 체크 ─────────────────────────
  function checkWebGL() {
    try {
      const c = document.createElement('canvas');
      if (!window.WebGLRenderingContext) throw new Error();
      const ctx = c.getContext('webgl') || c.getContext('experimental-webgl');
      if (!ctx) throw new Error();
    } catch (e) {
      document.getElementById('no-webgl').classList.add('show');
      document.getElementById('loading').style.display = 'none';
      throw new Error('WebGL not supported');
    }
  }

  // ── Renderer 초기화 ─────────────────────────
  function initRenderer() {
    // 모바일 여부 감지 — 모바일은 antialias 끔 (성능 우선)
    const isMobile = /iPhone|iPad|Android/i.test(navigator.userAgent);
    renderer = new THREE.WebGLRenderer({
      antialias: !isMobile,
      powerPreference: 'high-performance',
      alpha: false,
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    // ★ 최적화: pixelRatio 1.0 고정 (Retina 2.0 → 렌더링 픽셀 4배 감소)
    renderer.setPixelRatio(1.0);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 0.88;
    document.body.prepend(renderer.domElement);
  }

  // ── Scene 초기화 ────────────────────────────
  function initScene() {
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x060618);
    scene.fog = new THREE.FogExp2(0x0a0820, 0.032); // 맵 확장으로 안개 조금 줄임
  }

  // ── Camera 초기화 ───────────────────────────
  function initCamera() {
    camera = new THREE.PerspectiveCamera(
      52,
      window.innerWidth / window.innerHeight,
      0.1,
      150 // 맵 확장 — far 늘림
    );
    camera.position.set(0, 12, 20);
    camera.lookAt(0, 0, 0);
  }

  // ── 조명 설정 ───────────────────────────────
  function initLights() {
    // 환경광 (밤하늘 분위기)
    const ambient = new THREE.AmbientLight(0x1a1040, 0.75);
    scene.add(ambient);

    // 달빛 (메인 방향광)
    const moon = new THREE.DirectionalLight(0x8899cc, 0.45);
    moon.position.set(-14, 24, 12);
    moon.castShadow = true;
    // ★ 최적화: 그림자 맵 2048 → 512 (메모리 & 렌더 시간 대폭 감소)
    moon.shadow.mapSize.set(512, 512);
    moon.shadow.camera.near = 0.5;
    moon.shadow.camera.far  = 60;
    moon.shadow.camera.left   = -25;
    moon.shadow.camera.right  =  25;
    moon.shadow.camera.top    =  25;
    moon.shadow.camera.bottom = -25;
    moon.shadow.bias = -0.001;
    scene.add(moon);

    // 보조 달빛 (반대편 약한 채움)
    const fillLight = new THREE.DirectionalLight(0x334466, 0.15);
    fillLight.position.set(10, 10, -10);
    scene.add(fillLight);

    // 하늘 반사 (위에서 아래로)
    const hemi = new THREE.HemisphereLight(0x1a1050, 0x0a0820, 0.3);
    scene.add(hemi);
  }

  // ── 가로등 생성 ─────────────────────────────
  function addStreetLamp(x, z) {
    const group = new THREE.Group();

    // 기둥
    const pole = new THREE.Mesh(
      new THREE.CylinderGeometry(0.04, 0.05, 4.0, 6),
      new THREE.MeshLambertMaterial({ color: 0x3a3a4a })
    );
    pole.position.y = 2.0;
    pole.castShadow = false; // ★ 최적화: 가로등 그림자 제거
    group.add(pole);

    // 가로등 갓
    const shade = new THREE.Mesh(
      new THREE.ConeGeometry(0.22, 0.18, 6),
      new THREE.MeshLambertMaterial({ color: 0x2a2a3a })
    );
    shade.position.y = 4.12;
    group.add(shade);

    // 전구 (emissive로 빛나는 효과 — 포인트라이트 불필요)
    const bulb = new THREE.Mesh(
      new THREE.SphereGeometry(0.1, 6, 6),
      new THREE.MeshStandardMaterial({
        color: 0xFFEEAA,
        emissive: 0xFFCC44,
        emissiveIntensity: 2.5,
      })
    );
    bulb.position.y = 4.0;
    group.add(bulb);

    // ★ 최적화: 포인트 라이트 제거 — emissive 전구로 시각적 효과 대체

    group.position.set(x, 0, z);
    scene.add(group);

    return { group, bulb };
  }

  function initStreetLamps() {
    // ★ 최적화: 가로등 13개 → 6개로 축소 (중심부만 유지)
    const lampPositions = [
      [-4, 1.2], [4, 1.2],          // 중앙 가로 도로
      [1.2, -4], [1.2, 4],          // 중앙 세로 도로
      [-8, -1.2], [8, -1.2],        // 외곽 도로 핵심 지점
    ];
    const lamps = lampPositions.map(([x, z]) => addStreetLamp(x, z));
    return lamps;
  }

  // ── 리사이즈 핸들러 ─────────────────────────
  function initResize() {
    function onResize() {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    }
    window.addEventListener('resize', onResize);
    // 모바일 방향 전환
    window.addEventListener('orientationchange', () => {
      setTimeout(onResize, 250);
    });
  }

  // ── 공개 API ────────────────────────────────
  function init() {
    checkWebGL();
    initRenderer();
    initScene();
    initCamera();
    initLights();
    initResize();
    const lamps = initStreetLamps();
    return { renderer, scene, camera, lamps };
  }

  return {
    init,
    getRenderer:  () => renderer,
    getScene:     () => scene,
    getCamera:    () => camera,
    // ★ skySystem 연동용 조명 참조 노출
    getLights: () => ({
      moonLight: scene ? scene.children.find(c =>
        c.isDirectionalLight && c.castShadow) : null,
      ambient: scene ? scene.children.find(c =>
        c.isAmbientLight) : null,
      hemi: scene ? scene.children.find(c =>
        c.isHemisphereLight) : null,
    }),
  };

})();
