/* ═══════════════════════════════════════════════
   술마을 — Bar (술 바)
   리뷰 · 미디어 · 테이스팅
   ═══════════════════════════════════════════════ */

const BuildingBar = (() => {

  const DATA = {
    id:   'bar',
    name: '술 바',
    sub:  'BAR & REVIEW',
    emoji: '🍸',
    desc: '모든 주류의 리뷰와 테이스팅 노트. 하이볼·위스키·전통주를 한 잔씩 경험해보세요. 전문 바텐더의 추천과 유저 평점을 함께 확인할 수 있어요.',
    tags: ['리뷰', '테이스팅', '미디어', '평점'],
    pos:  [-5.5, 0, -3.5],
    url:  '#bar',
  };

  function makeBarExtras(group, { bodyW, bodyH, bodyD, signColor }) {

    // ── 어닝 (차양막) ─────────────────────────
    const awningMat = new THREE.MeshStandardMaterial({
      color: 0x8B1A1A, roughness: 0.85, side: THREE.DoubleSide,
    });
    const awning = new THREE.Mesh(new THREE.PlaneGeometry(bodyW + 0.4, 0.9), awningMat);
    awning.rotation.x = -Math.PI / 2.5;
    awning.position.set(0, bodyH * 0.38, bodyD / 2 + 0.35);
    group.add(awning);

    // 어닝 지지대
    [-bodyW / 2 + 0.1, bodyW / 2 - 0.1].forEach(x => {
      const pole = new THREE.Mesh(
        new THREE.CylinderGeometry(0.025, 0.025, 0.7, 6),
        new THREE.MeshStandardMaterial({ color: 0x5a1a1a, roughness: 0.8 })
      );
      pole.position.set(x, bodyH * 0.38 - 0.3, bodyD / 2 + 0.42);
      group.add(pole);
    });

    // ── 바 외부 테이블 & 스툴 ─────────────────
    const tableMat = new THREE.MeshStandardMaterial({ color: 0x3a2010, roughness: 0.8 });
    const table = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.3, 0.06, 12), tableMat);
    table.position.set(bodyW / 2 + 0.5, 0.7, bodyD / 2 + 0.6);
    table.castShadow = true;
    group.add(table);

    // 테이블 다리
    const leg = new THREE.Mesh(
      new THREE.CylinderGeometry(0.03, 0.03, 0.7, 6),
      new THREE.MeshStandardMaterial({ color: 0x2a1808, roughness: 0.9 })
    );
    leg.position.set(bodyW / 2 + 0.5, 0.35, bodyD / 2 + 0.6);
    group.add(leg);

    // 스툴 2개
    [-0.28, 0.28].forEach(offset => {
      const stool = new THREE.Mesh(
        new THREE.CylinderGeometry(0.13, 0.1, 0.06, 8),
        tableMat
      );
      stool.position.set(bodyW / 2 + 0.5 + offset, 0.52, bodyD / 2 + 0.9);
      group.add(stool);
      const sLeg = new THREE.Mesh(
        new THREE.CylinderGeometry(0.02, 0.02, 0.52, 6),
        leg.material
      );
      sLeg.position.set(bodyW / 2 + 0.5 + offset, 0.26, bodyD / 2 + 0.9);
      group.add(sLeg);
    });

    // ── 술병 진열 (창문 앞) ───────────────────
    const bottleColors = [0x1a3a1a, 0x3a1a0a, 0x1a1a3a, 0x2a2a0a];
    for (let i = 0; i < 4; i++) {
      const bottle = new THREE.Mesh(
        new THREE.CylinderGeometry(0.04, 0.055, 0.28, 7),
        new THREE.MeshStandardMaterial({
          color: bottleColors[i % bottleColors.length],
          roughness: 0.2, metalness: 0.1, transparent: true, opacity: 0.85,
        })
      );
      bottle.position.set(
        -bodyW / 2 + 0.25 + i * 0.22,
        0.22,
        bodyD / 2 + 0.12
      );
      group.add(bottle);

      // 병 뚜껑
      const cap = new THREE.Mesh(
        new THREE.CylinderGeometry(0.04, 0.04, 0.04, 7),
        new THREE.MeshStandardMaterial({ color: 0xccaa22, roughness: 0.4, metalness: 0.6 })
      );
      cap.position.set(
        -bodyW / 2 + 0.25 + i * 0.22,
        0.36,
        bodyD / 2 + 0.12
      );
      group.add(cap);
    }

    // ── 네온 간판 (BAR) ───────────────────────
    const neonLight = new THREE.PointLight(0xFF4422, 0.8, 3.0);
    neonLight.position.set(0, bodyH * 0.82, bodyD / 2 + 0.3);
    group.add(neonLight);

    // 간판 글로우 박스
    const signBg = new THREE.Mesh(
      new THREE.BoxGeometry(1.2, 0.38, 0.06),
      new THREE.MeshStandardMaterial({
        color: 0x220808,
        emissive: 0xFF3311,
        emissiveIntensity: 0.55,
      })
    );
    signBg.position.set(0, bodyH * 0.82, bodyD / 2 + 0.06);
    group.add(signBg);

    // ── 입구 조명 (따뜻한 노란빛) ────────────
    const entryLight = new THREE.PointLight(0xFFAA44, 0.5, 2.5);
    entryLight.position.set(0, 1.4, bodyD / 2 + 0.5);
    group.add(entryLight);

    // ── 외부 벽 담쟁이 덩굴 (장식) ───────────
    const ivyMat = new THREE.MeshStandardMaterial({ color: 0x1a3a18, roughness: 0.95 });
    for (let i = 0; i < 6; i++) {
      const ivy = new THREE.Mesh(
        new THREE.SphereGeometry(0.12 + Math.random() * 0.08, 5, 4),
        ivyMat
      );
      ivy.position.set(
        -bodyW / 2 + 0.15,
        0.3 + i * 0.45,
        bodyD / 2 + 0.05
      );
      ivy.scale.set(1.4, 0.6, 0.4);
      group.add(ivy);
    }
  }

  function init(scene) {
    SoolBuildings.create(scene, {
      data:       DATA,
      bodyW:      2.8,
      bodyH:      3.4,
      bodyD:      2.4,
      wallColor:  0xC8986A,
      roofType:   'cone',
      roofColor:  0x8B1A1A,
      roofHeight: 1.0,
      floors:     2,
      windowColor: 0xFFAA44,
      windowCols: 2,
      signColor:  0xFF4422,
      doorColor:  0x3a1808,
      chimneyPos: [{ x: 0.7, z: -0.5 }],
      extras:     makeBarExtras,
    });
  }

  return { init, getData: () => DATA };

})();
