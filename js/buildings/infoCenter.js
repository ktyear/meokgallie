/* ═══════════════════════════════════════════════
   술마을 — Info Center (안내소)
   플랫폼 소개 · 온보딩 · 가이드
   ═══════════════════════════════════════════════ */

const BuildingInfoCenter = (() => {

  const DATA = {
    id:   'infoCenter',
    name: '안내소',
    sub:  'VISITOR CENTER',
    emoji: '🗺️',
    desc: '술마을에 처음 오셨나요? 플랫폼 소개, 이용 가이드, 각 건물 안내까지. 여기서 시작하면 마을이 더 즐거워져요.',
    tags: ['소개', '가이드', '온보딩', '지도'],
    pos:  [-2.5, 0, -11.0],
    url:  'infoCenter.html',
  };

  function makeInfoExtras(group, { bodyW, bodyH, bodyD }) {

    // ── 마을 지도 입간판 ──────────────────────
    const boardPost = new THREE.Mesh(
      new THREE.CylinderGeometry(0.04, 0.04, 1.3, 6),
      new THREE.MeshStandardMaterial({ color: 0x4a3820, roughness: 0.85 })
    );
    boardPost.position.set(-bodyW / 2 - 0.7, 0.65, bodyD / 2 + 0.3);
    group.add(boardPost);

    const mapBoard = new THREE.Mesh(
      new THREE.BoxGeometry(0.75, 0.55, 0.05),
      new THREE.MeshStandardMaterial({
        color: 0x2a1e10, emissive: 0x886633,
        emissiveIntensity: 0.25,
      })
    );
    mapBoard.position.set(-bodyW / 2 - 0.7, 1.4, bodyD / 2 + 0.3);
    group.add(mapBoard);

    // 지도 내용 (밝은 선들)
    const lineMat = new THREE.MeshStandardMaterial({
      color: 0xccaa66, emissive: 0xaa8844,
      emissiveIntensity: 0.5, roughness: 0.9,
    });
    [[0, 0.04, 0.55, 0.04], [0.04, 0, 0.04, 0.35]].forEach(([x, y, w, h]) => {
      const line = new THREE.Mesh(new THREE.BoxGeometry(w, h, 0.03), lineMat);
      line.position.set(-bodyW / 2 - 0.7 + x, 1.4 + y, bodyD / 2 + 0.33);
      group.add(line);
    });

    // ── 환영 아치 ─────────────────────────────
    const archMat = new THREE.MeshStandardMaterial({ color: 0xD4A870, roughness: 0.7 });
    // 아치 기둥 2개
    [-0.7, 0.7].forEach(x => {
      const post = new THREE.Mesh(
        new THREE.BoxGeometry(0.12, 1.8, 0.12), archMat
      );
      post.position.set(x, 0.9, bodyD / 2 + 1.1);
      post.castShadow = true;
      group.add(post);
    });
    // 아치 가로대
    const bar = new THREE.Mesh(new THREE.BoxGeometry(1.52, 0.14, 0.14), archMat);
    bar.position.set(0, 1.85, bodyD / 2 + 1.1);
    group.add(bar);
    // 아치 반원
    const arch = new THREE.Mesh(
      new THREE.TorusGeometry(0.38, 0.07, 6, 12, Math.PI),
      archMat
    );
    arch.position.set(0, 1.92, bodyD / 2 + 1.1);
    group.add(arch);

    // 아치 조명
    const archLight = new THREE.PointLight(0xFFCC66, 0.4, 2.5);
    archLight.position.set(0, 2.0, bodyD / 2 + 1.1);
    group.add(archLight);

    // ── 화살표 안내판들 ───────────────────────
    const arrowMat = new THREE.MeshStandardMaterial({
      color: 0x1a3040, emissive: 0x4488AA,
      emissiveIntensity: 0.5,
    });
    const directions = [
      { x: bodyW / 2 + 0.6, y: 0.9, z: 0.4 },
      { x: bodyW / 2 + 0.6, y: 1.3, z: 0.4 },
    ];
    directions.forEach(pos => {
      const sign = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.16, 0.04), arrowMat);
      sign.position.set(pos.x, pos.y, pos.z);
      group.add(sign);
      const post2 = new THREE.Mesh(
        new THREE.CylinderGeometry(0.025, 0.025, pos.y, 6),
        new THREE.MeshStandardMaterial({ color: 0x333344, roughness: 0.8 })
      );
      post2.position.set(pos.x - 0.2, pos.y / 2, pos.z);
      group.add(post2);
    });

    // ── 노란 안내 조명 ────────────────────────
    const infoLight = new THREE.PointLight(0xFFCC44, 0.5, 3.0);
    infoLight.position.set(0, bodyH * 0.7, bodyD / 2 + 0.5);
    group.add(infoLight);

    // ── 간판 ──────────────────────────────────
    const signBg = new THREE.Mesh(
      new THREE.BoxGeometry(1.3, 0.38, 0.07),
      new THREE.MeshStandardMaterial({
        color: 0x1a1000, emissive: 0xFFCC44,
        emissiveIntensity: 0.5,
      })
    );
    signBg.position.set(0, bodyH * 0.78, bodyD / 2 + 0.07);
    group.add(signBg);
  }

  function init(scene) {
    SoolBuildings.create(scene, {
      data:        DATA,
      bodyW:       2.0,
      bodyH:       2.4,
      bodyD:       1.8,
      wallColor:   0xD4C4A0,
      roofType:    'cone',
      roofColor:   0x7A6030,
      roofHeight:  0.9,
      floors:      1,
      windowColor: 0xFFCC88,
      windowCols:  2,
      signColor:   0xFFCC44,
      doorColor:   0x3a2c10,
      chimneyPos:  null,
      extras:      makeInfoExtras,
    });
  }

  return { init, getData: () => DATA };

})();
