/* ═══════════════════════════════════════════════
   술마을 — Environment
   지면 / 도로 / 광장 / 분수 / 나무 / 별 / 반딧불이
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

  // ── 지면 ──────────────────────────────────────
  function makeGround() {
    // 메인 지면
    const ground = new THREE.Mesh(
      new THREE.PlaneGeometry(80, 80, 1, 1),
      new THREE.MeshStandardMaterial({
        color: 0x16152e,
        roughness: 0.95,
        metalness: 0.0,
      })
    );
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    _scene.add(ground);

    // 잔디 구역 (건물 주변 녹지)
    const grassPositions = [
      [-12, -10], [12, -10], [-12, 10], [12, 10],
      [-6, -12],  [6, -12],  [-6, 12],  [6, 12],
    ];
    const grassMat = new THREE.MeshStandardMaterial({
      color: 0x141e18, roughness: 0.95,
    });
    grassPositions.forEach(([x, z]) => {
      const g = new THREE.Mesh(new THREE.CircleGeometry(3.5, 12), grassMat);
      g.rotation.x = -Math.PI / 2;
      g.position.set(x, 0.005, z);
      g.receiveShadow = true;
      _scene.add(g);
    });
  }

  // ── 도로망 ────────────────────────────────────
  function makeRoads() {
    const roadMat = new THREE.MeshStandardMaterial({
      color: 0x22203c, roughness: 0.88,
    });
    const markMat = new THREE.MeshStandardMaterial({
      color: 0x3a3860, roughness: 0.9,
    });

    // 메인 가로 도로
    const hRoad = new THREE.Mesh(new THREE.PlaneGeometry(50, 3), roadMat);
    hRoad.rotation.x = -Math.PI / 2;
    hRoad.position.set(0, 0.01, 0);
    _scene.add(hRoad);

    // 메인 세로 도로
    const vRoad = new THREE.Mesh(new THREE.PlaneGeometry(3, 50), roadMat);
    vRoad.rotation.x = -Math.PI / 2;
    vRoad.position.set(0, 0.01, 0);
    _scene.add(vRoad);

    // 외곽 순환 도로 (사각형 링)
    [
      [0, -14, 32, 2.4],  // 북쪽
      [0,  14, 32, 2.4],  // 남쪽
      [-14, 0, 2.4, 32],  // 서쪽
      [ 14, 0, 2.4, 32],  // 동쪽
    ].forEach(([x, z, w, d]) => {
      const r = new THREE.Mesh(new THREE.PlaneGeometry(w, d), roadMat);
      r.rotation.x = -Math.PI / 2;
      r.position.set(x, 0.01, z);
      _scene.add(r);
    });

    // 도로 중앙선 (점선)
    for (let i = -5; i <= 5; i++) {
      if (i === 0) continue;
      const mark = new THREE.Mesh(new THREE.PlaneGeometry(1.2, 0.12), markMat);
      mark.rotation.x = -Math.PI / 2;
      mark.position.set(i * 4, 0.015, 0);
      _scene.add(mark);
    }
    for (let i = -5; i <= 5; i++) {
      if (i === 0) continue;
      const mark = new THREE.Mesh(new THREE.PlaneGeometry(0.12, 1.2), markMat);
      mark.rotation.x = -Math.PI / 2;
      mark.position.set(0, 0.015, i * 4);
      _scene.add(mark);
    }
  }

  // ── 중앙 광장 ─────────────────────────────────
  function makeSquare() {
    // 광장 바닥
    const plaza = new THREE.Mesh(
      new THREE.CircleGeometry(4.5, 32),
      new THREE.MeshStandardMaterial({ color: 0x28245a, roughness: 0.82 })
    );
    plaza.rotation.x = -Math.PI / 2;
    plaza.position.set(0, 0.02, 0);
    _scene.add(plaza);

    // 광장 테두리 링
    const ring = new THREE.Mesh(
      new THREE.RingGeometry(4.3, 4.6, 32),
      new THREE.MeshStandardMaterial({ color: 0x3a3478, roughness: 0.7 })
    );
    ring.rotation.x = -Math.PI / 2;
    ring.position.set(0, 0.025, 0);
    _scene.add(ring);

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
    const fLight = new THREE.PointLight(0x9966ff, 1.4, 7);
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
    // 맵 확장 — 더 넓게 나무 배치
    const treeData = [
      // 중앙 광장 주변
      [-5.5, -5.5, 0.9, 0], [5.5, -5.5, 0.85, 1], [-5.5, 5.5, 0.95, 0], [5.5, 5.5, 0.9, 1],
      // 건물 사이 빈 공간
      [-2, -7, 0.8, 0], [2, -7, 0.75, 1], [-7, 2, 0.85, 0], [7, -2, 0.8, 1],
      // 외곽 순환 안쪽
      [-11, -3, 1.0, 0], [11, -3, 1.0, 0], [-11, 3, 1.0, 1], [11, 3, 1.0, 1],
      [-3, -11, 0.9, 0], [3, -11, 0.9, 1], [-3, 11, 0.95, 0], [3, 11, 0.9, 1],
      // 코너 숲
      [-13, -11, 1.1, 0], [-11, -13, 1.0, 1], [13, -11, 1.1, 0], [11, -13, 1.0, 1],
      [-13,  11, 1.1, 1], [-11,  13, 1.0, 0], [13,  11, 1.1, 1], [11,  13, 1.0, 0],
      [-15, -5, 1.2, 0], [15, -5, 1.2, 1], [-15, 5, 1.1, 0], [15, 5, 1.2, 1],
      [-5, -15, 1.1, 0], [5, -15, 1.0, 1], [-5, 15, 1.2, 0], [5, 15, 1.1, 1],
    ];
    treeData.forEach(([x, z, s, v]) => makeTree(x, z, s, v));
  }

  // ── 별 파티클 ─────────────────────────────────
  function makeStars() {
    const COUNT = 1000;
    const geo   = new THREE.BufferGeometry();
    const pos   = new Float32Array(COUNT * 3);
    const sizes = new Float32Array(COUNT);

    for (let i = 0; i < COUNT; i++) {
      pos[i*3]     = (Math.random() - 0.5) * 120;
      pos[i*3+1]   =  12 + Math.random() * 40;
      pos[i*3+2]   = (Math.random() - 0.5) * 120;
      sizes[i]     = Math.random();
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
    const COUNT = 80;
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
      animated.fountainLight.intensity = 1.2 + Math.sin(t * 1.6) * 0.45;
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

  return { init, update };

})();
