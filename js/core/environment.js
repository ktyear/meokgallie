/* ═══════════════════════════════════════════════
   술마을 — Environment
   섬 지형 / 바다 / 광장 / 분수 / 나무 / 별 / 반딧불이
   ═══════════════════════════════════════════════ */

const SoolEnvironment = (() => {

  let _scene;

  // 애니메이션에서 업데이트할 오브젝트들
  const animated = {
    starMat:     null,
    starPoints:  null,
    fireflies:   null,
    fireMat:     null,
    firePos:     null,
    fireVel:     [],
    fireCount:   80,
    fountainStar: null,
    fountainLight: null,
  };

  // ── 섬 지면 레이어 ────────────────────────────
  // 레이어 1: 바다 — 전체 배경 (넓은 수면)
  // 레이어 2: 모래사장 — 섬 해변 (반경 22)
  // 레이어 3: 잔디 — 섬 내륙 (반경 17)
  // 레이어 4: 벽돌 타일 — 마을 구역 (반경 14)
  // 레이어 5: 광장 — 중앙 (반경 4.5)
  function makeGround() {

    // ── 레이어 1: 바다 (전체 배경) ───────────────
    const seaMat = new THREE.MeshLambertMaterial({ color: 0x0a2a4a });
    const sea = new THREE.Mesh(new THREE.PlaneGeometry(300, 300), seaMat);
    sea.rotation.x = -Math.PI / 2;
    sea.position.y = -0.5;
    _scene.add(sea);

    // 바다 물결 — 밝은 톤의 원형 레이어로 깊이감 표현
    const waveMat = new THREE.MeshLambertMaterial({ color: 0x0e3860 });
    const wave = new THREE.Mesh(new THREE.CircleGeometry(60, 64), waveMat);
    wave.rotation.x = -Math.PI / 2;
    wave.position.y = -0.45;
    _scene.add(wave);

    // 바다 파티클 — 작은 점들로 윤슬 표현
    const sparkCount = 200;
    const sparkGeo   = new THREE.BufferGeometry();
    const sparkPos   = new Float32Array(sparkCount * 3);
    for (let i = 0; i < sparkCount; i++) {
      const angle = Math.random() * Math.PI * 2;
      const r     = 25 + Math.random() * 30;
      sparkPos[i*3]   = Math.cos(angle) * r;
      sparkPos[i*3+1] = -0.3 + Math.random() * 0.1;
      sparkPos[i*3+2] = Math.sin(angle) * r;
    }
    sparkGeo.setAttribute('position', new THREE.BufferAttribute(sparkPos, 3));
    const sparkMat = new THREE.PointsMaterial({
      color: 0x4488cc, size: 0.18, sizeAttenuation: true,
      transparent: true, opacity: 0.5,
    });
    _scene.add(new THREE.Points(sparkGeo, sparkMat));

    // ── 레이어 2: 모래사장 — 해변 (반경 22) ──────
    const sandMat = new THREE.MeshLambertMaterial({ color: 0xc8a86a });
    const sand = new THREE.Mesh(new THREE.CircleGeometry(22, 64), sandMat);
    sand.rotation.x = -Math.PI / 2;
    sand.position.y = 0;
    sand.receiveShadow = true;
    _scene.add(sand);

    // 모래 질감 — 작은 점들로 모래알 느낌
    const grainMat = new THREE.MeshLambertMaterial({ color: 0xb89858 });
    for (let i = 0; i < 400; i++) {
      const angle = Math.random() * Math.PI * 2;
      const r     = 14 + Math.random() * 7.5;
      const grain = new THREE.Mesh(
        new THREE.PlaneGeometry(0.15 + Math.random() * 0.2, 0.15 + Math.random() * 0.2),
        grainMat
      );
      grain.rotation.x = -Math.PI / 2;
      grain.position.set(Math.cos(angle) * r, 0.002, Math.sin(angle) * r);
      _scene.add(grain);
    }

    // 해변 바위들
    const rockMat = new THREE.MeshLambertMaterial({ color: 0x8a7a6a });
    const rockPositions = [
      [18, 8], [-17, 10], [14, -16], [-15, -14],
      [20, -5], [-19, -6], [8, 20], [-9, 19],
    ];
    rockPositions.forEach(([x, z]) => {
      const scale = 0.4 + Math.random() * 0.5;
      const rock  = new THREE.Mesh(
        new THREE.DodecahedronGeometry(scale, 0),
        rockMat
      );
      rock.position.set(x, scale * 0.3, z);
      rock.rotation.y = Math.random() * Math.PI * 2;
      rock.castShadow = true;
      _scene.add(rock);
    });

    // ── 레이어 3: 잔디 — 섬 내륙 (반경 17) ───────
    const grassMat = new THREE.MeshLambertMaterial({ color: 0x1e3a1a });
    const grassBase = new THREE.Mesh(new THREE.CircleGeometry(17, 48), grassMat);
    grassBase.rotation.x = -Math.PI / 2;
    grassBase.position.y = 0.008;
    grassBase.receiveShadow = true;
    _scene.add(grassBase);

    // 잔디 질감
    const tuftMat = new THREE.MeshLambertMaterial({ color: 0x162e14 });
    for (let i = 0; i < 200; i++) {
      const angle = Math.random() * Math.PI * 2;
      const r     = 14.5 + Math.random() * 2.2;
      const tuft  = new THREE.Mesh(
        new THREE.PlaneGeometry(0.25 + Math.random() * 0.3, 0.25 + Math.random() * 0.3),
        tuftMat
      );
      tuft.rotation.x = -Math.PI / 2;
      tuft.position.set(Math.cos(angle) * r, 0.012, Math.sin(angle) * r);
      _scene.add(tuft);
    }

    // ── 레이어 4: 벽돌 타일 — 마을 구역 (반경 14) ─
    const brickBase = new THREE.Mesh(
      new THREE.CircleGeometry(14, 48),
      new THREE.MeshLambertMaterial({ color: 0x4a3c2e })
    );
    brickBase.rotation.x = -Math.PI / 2;
    brickBase.position.y = 0.014;
    brickBase.receiveShadow = true;
    _scene.add(brickBase);

    // 벽돌 줄눈
    const groutMat = new THREE.MeshLambertMaterial({ color: 0x352a1e });
    const TW = 1.2, TH = 0.7;
    const ROWS = Math.ceil(28 / TH);
    const COLS = Math.ceil(28 / TW);
    for (let row = 0; row < ROWS; row++) {
      for (let col = 0; col < COLS; col++) {
        const offset = (row % 2 === 0) ? 0 : TW / 2;
        const tx = -14 + col * TW + offset;
        const tz = -14 + row * TH;
        const cx = tx + TW / 2, cz = tz + TH / 2;
        if (cx * cx + cz * cz > 14 * 14) continue;
        const grout = new THREE.Mesh(
          new THREE.PlaneGeometry(TW - 0.06, TH - 0.06),
          groutMat
        );
        grout.rotation.x = -Math.PI / 2;
        grout.position.set(cx, 0.016, cz);
        _scene.add(grout);
      }
    }

    // ── 레이어 5: 광장 — 중앙 (반경 4.5) ──────────
    const plaza = new THREE.Mesh(
      new THREE.CircleGeometry(4.5, 32),
      new THREE.MeshLambertMaterial({ color: 0x28245a })
    );
    plaza.rotation.x = -Math.PI / 2;
    plaza.position.y = 0.022;
    plaza.receiveShadow = true;
    _scene.add(plaza);

    // 광장 테두리 링
    const ring = new THREE.Mesh(
      new THREE.RingGeometry(4.3, 4.6, 32),
      new THREE.MeshLambertMaterial({ color: 0x3a3478 })
    );
    ring.rotation.x = -Math.PI / 2;
    ring.position.y = 0.025;
    _scene.add(ring);
  }

  // makeRoads 제거 — 섬 레이어로 대체됨
  function makeRoads() {}

  // ── 중앙 광장 ─────────────────────────────────
  function makeSquare() {
    // 광장 바닥·링은 makeGround() 레이어 3에서 생성

    // 광장 벤치 4개
    const benchAngles = [Math.PI / 4, 3 * Math.PI / 4, 5 * Math.PI / 4, 7 * Math.PI / 4];
    benchAngles.forEach(angle => {
      const r = 3.2;
      const bx = Math.cos(angle) * r;
      const bz = Math.sin(angle) * r;
      makeBench(bx, bz, angle + Math.PI / 2);
    });
  }

  function makeBench(x, z, rotY) {
    const mat = new THREE.MeshStandardMaterial({ color: 0x3a2c1e, roughness: 0.85 });
    const legMat = new THREE.MeshStandardMaterial({ color: 0x2a2038, roughness: 0.7 });

    // 앉는 판
    const seat = new THREE.Mesh(new THREE.BoxGeometry(1.0, 0.08, 0.38), mat);
    seat.position.set(x, 0.38, z);
    seat.rotation.y = rotY;
    seat.castShadow = true;
    _scene.add(seat);

    // 등받이
    const back = new THREE.Mesh(new THREE.BoxGeometry(1.0, 0.28, 0.06), mat);
    back.position.set(
      x + Math.sin(rotY) * 0.16,
      0.6,
      z + Math.cos(rotY) * 0.16
    );
    back.rotation.y = rotY;
    back.castShadow = true;
    _scene.add(back);

    // 다리 2개
    [-0.38, 0.38].forEach(offset => {
      const leg = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.35, 0.06), legMat);
      leg.position.set(
        x + Math.cos(rotY) * offset,
        0.18,
        z - Math.sin(rotY) * offset
      );
      leg.castShadow = true;
      _scene.add(leg);
    });
  }

  // ── 중앙 분수 ─────────────────────────────────
  function makeFountain() {
    // 분수 받침대
    const base = new THREE.Mesh(
      new THREE.CylinderGeometry(1.6, 1.9, 0.35, 24),
      new THREE.MeshStandardMaterial({ color: 0x3c3278, roughness: 0.65, metalness: 0.1 })
    );
    base.position.set(0, 0.175, 0);
    base.castShadow = true;
    base.receiveShadow = true;
    _scene.add(base);

    // 물 (파란 원판)
    const water = new THREE.Mesh(
      new THREE.CircleGeometry(1.45, 24),
      new THREE.MeshStandardMaterial({
        color: 0x2244aa,
        roughness: 0.1,
        metalness: 0.4,
        transparent: true,
        opacity: 0.75,
      })
    );
    water.rotation.x = -Math.PI / 2;
    water.position.set(0, 0.36, 0);
    _scene.add(water);

    // 기둥
    const pillar = new THREE.Mesh(
      new THREE.CylinderGeometry(0.14, 0.18, 1.8, 10),
      new THREE.MeshStandardMaterial({ color: 0x5a4ea8, roughness: 0.55, metalness: 0.15 })
    );
    pillar.position.set(0, 1.25, 0);
    pillar.castShadow = true;
    _scene.add(pillar);

    // 상단 작은 그릇
    const bowl = new THREE.Mesh(
      new THREE.CylinderGeometry(0.5, 0.3, 0.2, 16),
      new THREE.MeshStandardMaterial({ color: 0x6a5ec0, roughness: 0.5 })
    );
    bowl.position.set(0, 2.25, 0);
    _scene.add(bowl);

    // 분수 중심 오브젝트 (별 모양)
    const star = new THREE.Mesh(
      new THREE.OctahedronGeometry(0.22, 0),
      new THREE.MeshStandardMaterial({
        color: 0xcc99ff,
        emissive: 0x9966ff,
        emissiveIntensity: 1.8,
        roughness: 0.2,
      })
    );
    star.position.set(0, 2.6, 0);
    _scene.add(star);
    animated.fountainStar = star;

    // 분수 조명 (보라)
    const fLight = new THREE.PointLight(0x9966ff, 0.9, 5) // ★ 최적화: 강도 낮춤;
    fLight.position.set(0, 2.0, 0);
    _scene.add(fLight);
    animated.fountainLight = fLight;

    // 물 파티클 (분수 물줄기 표현)
    const wCount = 40;
    const wGeo   = new THREE.BufferGeometry();
    const wPos   = new Float32Array(wCount * 3);
    for (let i = 0; i < wCount; i++) {
      const angle = (i / wCount) * Math.PI * 2;
      const r     = 0.1 + Math.random() * 0.5;
      wPos[i*3]   = Math.cos(angle) * r;
      wPos[i*3+1] = 0.4 + Math.random() * 0.8;
      wPos[i*3+2] = Math.sin(angle) * r;
    }
    wGeo.setAttribute('position', new THREE.BufferAttribute(wPos, 3));
    const wMat = new THREE.PointsMaterial({
      color: 0x88ccff, size: 0.06, sizeAttenuation: true,
      transparent: true, opacity: 0.55,
    });
    _scene.add(new THREE.Points(wGeo, wMat));
  }

  // ── 나무 ──────────────────────────────────────
  function makeTree(x, z, scale = 1.0, variant = 0) {
    const group = new THREE.Group();

    const trunkMat = new THREE.MeshStandardMaterial({ color: 0x3a2510, roughness: 0.95 });
    const trunk = new THREE.Mesh(
      new THREE.CylinderGeometry(0.09 * scale, 0.14 * scale, 0.9 * scale, 6),
      trunkMat
    );
    trunk.position.y = 0.45 * scale;
    trunk.castShadow = true;
    group.add(trunk);

    // 나무 유형에 따라 다른 모양
    if (variant === 0) {
      // 원뿔형
      const leafColors = [0x1a3a22, 0x1e4228, 0x162e1a];
      const leafMat = new THREE.MeshStandardMaterial({
        color: leafColors[Math.floor(Math.random() * leafColors.length)],
        roughness: 0.9,
      });
      [1.5, 1.0, 0.6].forEach((r, i) => {
        const layer = new THREE.Mesh(
          new THREE.ConeGeometry(r * scale * 0.55, r * scale * 0.7, 7),
          leafMat
        );
        layer.position.y = (1.0 + i * 0.55) * scale;
        layer.castShadow = true;
        group.add(layer);
      });
    } else {
      // 둥근형
      const leafMat = new THREE.MeshStandardMaterial({
        color: 0x1c3820, roughness: 0.9,
      });
      const leaves = new THREE.Mesh(
        new THREE.SphereGeometry(0.7 * scale, 7, 6),
        leafMat
      );
      leaves.position.y = 1.5 * scale;
      leaves.castShadow = true;
      group.add(leaves);
    }

    group.position.set(x, 0, z);
    group.rotation.y = Math.random() * Math.PI * 2;
    _scene.add(group);
  }

  function makeTrees() {
    // 섬 구조에 맞게 재배치
    // 벽돌 구역(반경 14) 밖, 잔디 구역(반경 17) 안에 나무 배치
    // 해변(반경 17~22) 에는 야자수 느낌의 나무 배치
    const treeData = [
      // 광장 주변 (건물 사이 빈 공간)
      [-5.5, -5.5, 0.9, 0], [5.5, -5.5, 0.85, 1],
      [-5.5,  5.5, 0.95, 0], [5.5,  5.5, 0.9, 1],
      [-2, -7, 0.8, 0], [2, -7, 0.75, 1],
      [-7,  2, 0.85, 0], [7, -2, 0.8, 1],
      // 잔디 구역 내 나무 (반경 14~16.5)
      [-14.5, -3, 1.1, 1], [14.5, -3, 1.1, 0],
      [-14.5,  3, 1.0, 0], [14.5,  3, 1.0, 1],
      [-3, -14.5, 1.0, 1], [3, -14.5, 1.1, 0],
      [-3,  14.5, 1.0, 0], [3,  14.5, 1.1, 1],
      [-10, -11, 1.0, 0], [10, -11, 1.0, 1],
      [-10,  11, 1.1, 1], [10,  11, 1.1, 0],
      [-11, -10, 1.0, 1], [11, -10, 1.0, 0],
      [-11,  10, 1.1, 0], [11,  10, 1.0, 1],
      // 해변 근처 나무 (반경 17~20)
      [-17,  0, 1.2, 1], [17,  0, 1.2, 0],
      [0, -17, 1.1, 1], [0,  17, 1.1, 0],
      [-13, -13, 1.2, 0], [13, -13, 1.2, 1],
      [-13,  13, 1.2, 1], [13,  13, 1.2, 0],
    ];
    treeData.forEach(([x, z, s, v]) => makeTree(x, z, s, v));
  }

  // ── 별 파티클 ─────────────────────────────────
  function makeStars() {
    const COUNT = 600; // ★ 최적화
    const geo   = new THREE.BufferGeometry();
    const pos   = new Float32Array(COUNT * 3);

    for (let i = 0; i < COUNT; i++) {
      pos[i*3]   = (Math.random() - 0.5) * 120;
      pos[i*3+1] =  12 + Math.random() * 40;
      pos[i*3+2] = (Math.random() - 0.5) * 120;
    }
    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));

    const mat = new THREE.PointsMaterial({
      color: 0xffffff,
      size: 0.09,
      sizeAttenuation: true,
      transparent: true,
      opacity: 0.85,
    });
    const points = new THREE.Points(geo, mat);
    _scene.add(points);

    animated.starPoints = points;
    animated.starMat    = mat;
  }

  // ── 반딧불이 파티클 ───────────────────────────
  function makeFireflies() {
    const COUNT = 40; // ★ 최적화
    const geo   = new THREE.BufferGeometry();
    const pos   = new Float32Array(COUNT * 3);

    for (let i = 0; i < COUNT; i++) {
      pos[i*3]   = (Math.random() - 0.5) * 30;
      pos[i*3+1] = 0.5 + Math.random() * 5;
      pos[i*3+2] = (Math.random() - 0.5) * 30;
      animated.fireVel.push({
        x: (Math.random() - 0.5) * 0.008,
        y:  0.003 + Math.random() * 0.006,
        z: (Math.random() - 0.5) * 0.008,
      });
    }
    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));

    const mat = new THREE.PointsMaterial({
      color: 0xffcc66,
      size: 0.13,
      sizeAttenuation: true,
      transparent: true,
      opacity: 0.7,
    });
    const points = new THREE.Points(geo, mat);
    _scene.add(points);

    animated.fireflies  = points;
    animated.fireMat    = mat;
    animated.firePos    = pos;
    animated.fireCount  = COUNT;
  }

  // ── 달 ────────────────────────────────────────
  function makeMoon() {
    const moon = new THREE.Mesh(
      new THREE.SphereGeometry(2.5, 16, 16),
      new THREE.MeshStandardMaterial({
        color: 0xeeeedd,
        emissive: 0xccccaa,
        emissiveIntensity: 0.6,
        roughness: 0.9,
      })
    );
    moon.position.set(-40, 55, -60);
    _scene.add(moon);

    // 달빛 후광
    const glow = new THREE.Mesh(
      new THREE.SphereGeometry(3.5, 12, 12),
      new THREE.MeshBasicMaterial({
        color: 0xaaaacc,
        transparent: true,
        opacity: 0.08,
        side: THREE.BackSide,
      })
    );
    glow.position.copy(moon.position);
    _scene.add(glow);
  }

  // ── 애니메이션 업데이트 ───────────────────────
  function update(t) {
    // 별 천천히 회전
    if (animated.starPoints) {
      animated.starPoints.rotation.y = t * 0.0002;
    }

    // 분수 별 회전
    if (animated.fountainStar) {
      animated.fountainStar.rotation.y = t * 0.9;
      animated.fountainStar.rotation.x = t * 0.45;
      animated.fountainStar.position.y = 2.6 + Math.sin(t * 1.2) * 0.06;
    }

    // 분수 조명 맥동
    if (animated.fountainLight) {
      animated.fountainLight.intensity = 0.8 + Math.sin(t * 1.6) * 0.2 // ★ 최적화;
    }

    // 반딧불이 이동
    if (animated.fireflies && animated.firePos) {
      const fp  = animated.firePos;
      const fv  = animated.fireVel;
      const FC  = animated.fireCount;
      for (let i = 0; i < FC; i++) {
        fp[i*3]   += fv[i].x + Math.sin(t * 0.8 + i) * 0.003;
        fp[i*3+1] += fv[i].y;
        fp[i*3+2] += fv[i].z + Math.cos(t * 0.7 + i * 0.8) * 0.003;
        if (fp[i*3+1] > 6) {
          fp[i*3]   = (Math.random() - 0.5) * 30;
          fp[i*3+1] = 0.3;
          fp[i*3+2] = (Math.random() - 0.5) * 30;
        }
      }
      animated.fireflies.geometry.attributes.position.needsUpdate = true;
      animated.fireMat.opacity = 0.5 + Math.sin(t * 0.9) * 0.2;
    }
  }

  // ── 공개 API ──────────────────────────────────
  function init(scene) {
    _scene = scene;
    makeGround();
    makeRoads();
    makeSquare();
    makeFountain();
    makeTrees();
    makeStars();
    makeFireflies();
    makeMoon();
  }

  return {
    init,
    update,
    // ★ skySystem 연동용 파티클 참조 노출
    getParticles: () => ({
      starPoints: animated.starPoints,
      fireflies:  animated.fireflies,
    }),
  };

})();
