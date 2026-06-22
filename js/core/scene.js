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
    renderer = new THREE.WebGLRenderer({
      antialias: true,
      powerPreference: 'high-performance',
      alpha: false,
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
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
    moon.shadow.mapSize.set(2048, 2048);
    moon.shadow.camera.near = 0.5;
    moon.shadow.camera.far  = 80;
    moon.shadow.camera.left   = -30;
    moon.shadow.camera.right  =  30;
    moon.shadow.camera.top    =  30;
    moon.shadow.camera.bottom = -30;
    moon.shadow.bias = -0.0004;
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
      new THREE.CylinderGeometry(0.04, 0.05, 4.0, 8),
      new THREE.MeshStandardMaterial({ color: 0x3a3a4a, roughness: 0.8 })
    );
    pole.position.y = 2.0;
    pole.castShadow = true;
    group.add(pole);

    // 가로등 갓
    const shade = new THREE.Mesh(
      new THREE.ConeGeometry(0.22, 0.18, 8),
      new THREE.MeshStandardMaterial({ color: 0x2a2a3a, roughness: 0.7 })
    );
    shade.position.y = 4.12;
    group.add(shade);

    // 전구
    const bulb = new THREE.Mesh(
      new THREE.SphereGeometry(0.1, 8, 8),
      new THREE.MeshStandardMaterial({
        color: 0xFFEEAA,
        emissive: 0xFFCC44,
        emissiveIntensity: 2.2,
      })
    );
    bulb.position.y = 4.0;
    group.add(bulb);

    // 포인트 라이트
    const light = new THREE.PointLight(0xFFCC66, 0.55, 10);
    light.position.y = 4.0;
    light.castShadow = false; // 가로등 그림자는 성능상 제외
    group.add(light);

    group.position.set(x, 0, z);
    scene.add(group);

    return { group, light, bulb };
  }

  function initStreetLamps() {
    // 메인 도로 가로등 — 맵 확장에 맞춰 배치
    const lampPositions = [
      // 중앙 가로 도로
      [-8, 1.2], [-4, 1.2], [0, 1.2], [4, 1.2], [8, 1.2],
      // 중앙 세로 도로
      [1.2, -8], [1.2, -4], [1.2, 4], [1.2, 8],
      // 외곽 순환 도로
      [-10, -6], [10, -6], [-10, 6], [10, 6],
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
    getRenderer: () => renderer,
    getScene:    () => scene,
    getCamera:   () => camera,
  };

})();
