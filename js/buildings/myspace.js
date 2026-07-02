/* ═══════════════════════════════════════════════
   술향기마을 — My Space (내 공간)
   마이페이지 · 취향 셀러 · 기록
   ═══════════════════════════════════════════════ */

const BuildingMyspace = (() => {

  const DATA = {
    id:   'myspace',
    name: '내 공간',
    sub:  'MY CELLAR & PROFILE',
    emoji: '🏠',
    desc: '나만의 술 셀러, 테이스팅 기록, 취향 프로필. 내가 마신 술을 아카이빙하고, 취향 뱃지를 모아보세요.',
    tags: ['마이페이지', '셀러', '기록', '뱃지'],
    pos:  [6.0, 0, -10.0],
    url:  'myspace.html',
  };

  function makeMyspaceExtras(group, { bodyW, bodyH, bodyD }) {

    // ── 개인 정원 (집 앞 미니 가든) ──────────
    const gardenMat = new THREE.MeshStandardMaterial({ color: 0x1a2e18, roughness: 0.95 });
    const garden = new THREE.Mesh(new THREE.CircleGeometry(1.0, 12), gardenMat);
    garden.rotation.x = -Math.PI / 2;
    garden.position.set(0, 0.01, bodyD / 2 + 1.0);
    group.add(garden);

    // 정원 꽃들
    const flowerColors = [0xFF6688, 0xFFAA44, 0xAA66FF, 0x44AAFF];
    for (let i = 0; i < 8; i++) {
      const angle = (i / 8) * Math.PI * 2;
      const r = 0.55 + Math.random() * 0.3;
      const flower = new THREE.Mesh(
        new THREE.SphereGeometry(0.06, 6, 5),
        new THREE.MeshStandardMaterial({
          color: flowerColors[i % flowerColors.length],
          emissive: flowerColors[i % flowerColors.length],
          emissiveIntensity: 0.3,
        })
      );
      flower.position.set(
        Math.cos(angle) * r,
        0.1,
        bodyD / 2 + 1.0 + Math.sin(angle) * r
      );
      group.add(flower);

      const stem = new THREE.Mesh(
        new THREE.CylinderGeometry(0.01, 0.01, 0.1, 4),
        new THREE.MeshStandardMaterial({ color: 0x1a3a18 })
      );
      stem.position.set(Math.cos(angle) * r, 0.05, bodyD / 2 + 1.0 + Math.sin(angle) * r);
      group.add(stem);
    }

    // ── 우편함 ────────────────────────────────
    const mailMat = new THREE.MeshStandardMaterial({ color: 0x3355AA, roughness: 0.7 });
    const mailBox = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.18, 0.14), mailMat);
    mailBox.position.set(bodyW / 2 + 0.4, 0.72, bodyD / 2 + 0.5);
    group.add(mailBox);
    const mailPole = new THREE.Mesh(
      new THREE.CylinderGeometry(0.02, 0.02, 0.72, 5),
      new THREE.MeshStandardMaterial({ color: 0x444444, roughness: 0.8 })
    );
    mailPole.position.set(bodyW / 2 + 0.4, 0.36, bodyD / 2 + 0.5);
    group.add(mailPole);

    // ── 창문 화분 ─────────────────────────────
    [-0.4, 0.4].forEach(x => {
      const pot = new THREE.Mesh(
        new THREE.CylinderGeometry(0.07, 0.09, 0.1, 8),
        new THREE.MeshStandardMaterial({ color: 0x8B4513, roughness: 0.85 })
      );
      pot.position.set(x, bodyH * 0.44, bodyD / 2 + 0.06);
      group.add(pot);
      const plant = new THREE.Mesh(
        new THREE.SphereGeometry(0.1, 6, 5),
        new THREE.MeshStandardMaterial({ color: 0x2a5a1a, roughness: 0.9 })
      );
      plant.position.set(x, bodyH * 0.44 + 0.12, bodyD / 2 + 0.06);
      group.add(plant);
    });

    // ── 뱃지 장식 (도어 위) ───────────────────
    const badgeMat = new THREE.MeshStandardMaterial({
      color: 0xFFCC22, emissive: 0xFFAA00,
      emissiveIntensity: 0.8, roughness: 0.3, metalness: 0.5,
    });
    const badge = new THREE.Mesh(new THREE.OctahedronGeometry(0.1, 0), badgeMat);
    badge.position.set(0, bodyH * 0.58, bodyD / 2 + 0.08);
    group.add(badge);

    // ── 따뜻한 가정집 조명 ────────────────────
    const homeLight = new THREE.PointLight(0xFFAA66, 0.55, 3.0);
    homeLight.position.set(0, bodyH * 0.5, bodyD / 2 + 0.4);
    group.add(homeLight);

    // ── 간판 ──────────────────────────────────
    const signBg = new THREE.Mesh(
      new THREE.BoxGeometry(1.2, 0.36, 0.07),
      new THREE.MeshStandardMaterial({
        color: 0x1a1008, emissive: 0xFFAA44,
        emissiveIntensity: 0.45,
      })
    );
    signBg.position.set(0, bodyH * 0.76, bodyD / 2 + 0.07);
    group.add(signBg);
  }

  function init(scene) {
    SoolBuildings.create(scene, {
      data:        DATA,
      bodyW:       2.2,
      bodyH:       2.6,
      bodyD:       2.0,
      wallColor:   0xD0C0A8,
      roofType:    'gable',
      roofColor:   0x5A3A22,
      roofHeight:  0.9,
      floors:      2,
      windowColor: 0xFFCC88,
      windowCols:  2,
      signColor:   0xFFAA44,
      doorColor:   0x3a2c18,
      chimneyPos:  [{ x: 0.5, z: -0.3 }],
      extras:      makeMyspaceExtras,
    });
  }

  return { init, getData: () => DATA };

})();
