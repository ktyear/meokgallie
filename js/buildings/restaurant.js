/* ═══════════════════════════════════════════════
   술마을 — Restaurant (푸드 페어링 식당)
   안주 · 음식 페어링 · 레시피
   ═══════════════════════════════════════════════ */

const BuildingRestaurant = (() => {

  const DATA = {
    id:   'restaurant',
    name: '페어링 식당',
    sub:  'FOOD PAIRING',
    emoji: '🍴',
    desc: '술과 음식의 완벽한 조합. 위스키와 어울리는 안주, 전통주에 맞는 한식, 와인 페어링 레시피까지. 술이 더 맛있어지는 방법.',
    tags: ['페어링', '안주', '레시피', '음식'],
    pos:  [11.0, 0, 5.0],
    url:  '#restaurant',
  };

  function makeRestaurantExtras(group, { bodyW, bodyH, bodyD }) {

    // ── 식당 간판등 (따뜻한 빨간 등불) ──────
    const lanternMat = new THREE.MeshStandardMaterial({
      color: 0xFF3322, emissive: 0xFF1100,
      emissiveIntensity: 1.2, transparent: true, opacity: 0.9,
    });
    [-0.55, 0.55].forEach(x => {
      const lantern = new THREE.Mesh(
        new THREE.CylinderGeometry(0.1, 0.12, 0.25, 8), lanternMat
      );
      lantern.position.set(x, bodyH * 0.62, bodyD / 2 + 0.18);
      group.add(lantern);
      // 등불 줄
      const string = new THREE.Mesh(
        new THREE.CylinderGeometry(0.008, 0.008, 0.3, 4),
        new THREE.MeshStandardMaterial({ color: 0x444444 })
      );
      string.position.set(x, bodyH * 0.77, bodyD / 2 + 0.18);
      group.add(string);
    });

    // ── 외부 테이블 (식당 앞 테라스) ─────────
    const woodMat = new THREE.MeshStandardMaterial({ color: 0x5a3a1a, roughness: 0.85 });

    for (let row = 0; row < 2; row++) {
      for (let col = 0; col < 2; col++) {
        const tx = (col - 0.5) * 1.1;
        const tz = bodyD / 2 + 0.6 + row * 1.0;
        // 테이블
        const tbl = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.05, 0.5), woodMat);
        tbl.position.set(tx, 0.7, tz);
        group.add(tbl);
        const tLeg = new THREE.Mesh(
          new THREE.CylinderGeometry(0.03, 0.03, 0.7, 6), woodMat
        );
        tLeg.position.set(tx, 0.35, tz);
        group.add(tLeg);
        // 의자
        [-0.38, 0.38].forEach(offset => {
          const chair = new THREE.Mesh(new THREE.BoxGeometry(0.32, 0.04, 0.3), woodMat);
          chair.position.set(tx + offset, 0.48, tz);
          group.add(chair);
          // 의자 등받이
          const back = new THREE.Mesh(new THREE.BoxGeometry(0.32, 0.28, 0.03), woodMat);
          back.position.set(tx + offset, 0.64, tz - 0.14);
          group.add(back);
          // 다리
          const cLeg = new THREE.Mesh(
            new THREE.CylinderGeometry(0.02, 0.02, 0.48, 4), woodMat
          );
          cLeg.position.set(tx + offset, 0.24, tz);
          group.add(cLeg);
        });
      }
    }

    // 테라스 바닥
    const terraceMat = new THREE.MeshStandardMaterial({ color: 0x3a2a18, roughness: 0.88 });
    const terrace = new THREE.Mesh(new THREE.BoxGeometry(bodyW + 0.4, 0.06, 2.2), terraceMat);
    terrace.position.set(0, 0.03, bodyD / 2 + 1.05);
    group.add(terrace);

    // ── 요리 연기 (굴뚝 효과) ────────────────
    for (let i = 0; i < 5; i++) {
      const smoke = new THREE.Mesh(
        new THREE.SphereGeometry(0.08 + i * 0.04, 6, 5),
        new THREE.MeshStandardMaterial({
          color: 0xccbbaa, transparent: true,
          opacity: 0.18 - i * 0.03, roughness: 1.0,
        })
      );
      smoke.position.set(
        -bodyW / 2 + 0.3 + (Math.random() - 0.5) * 0.2,
        bodyH + 0.5 + i * 0.3,
        -bodyD / 2 + 0.2
      );
      group.add(smoke);
    }

    // ── 메뉴 칠판 ─────────────────────────────
    const chalkMat = new THREE.MeshStandardMaterial({
      color: 0x0a0a18, emissive: 0xFFCC88,
      emissiveIntensity: 0.2,
    });
    const chalk = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.76, 0.05), chalkMat);
    chalk.position.set(bodyW / 2 + 0.44, 0.82, bodyD / 2 + 0.22);
    chalk.rotation.y = -0.25;
    group.add(chalk);
    // 칠판 다리
    const cLeg = new THREE.Mesh(
      new THREE.CylinderGeometry(0.02, 0.02, 0.44, 5),
      new THREE.MeshStandardMaterial({ color: 0x4a4a4a })
    );
    cLeg.position.set(bodyW / 2 + 0.44, 0.22, bodyD / 2 + 0.22);
    group.add(cLeg);

    // ── 따뜻한 빨간 조명 ──────────────────────
    const rl = new THREE.PointLight(0xFF6644, 0.5, 4.0);
    rl.position.set(0, bodyH * 0.6, bodyD / 2 + 0.5);
    group.add(rl);
    const rl2 = new THREE.PointLight(0xFF4422, 0.25, 2.5);
    rl2.position.set(0, 0.8, bodyD / 2 + 1.2);
    group.add(rl2);

    // ── 간판 ──────────────────────────────────
    const signBg = new THREE.Mesh(
      new THREE.BoxGeometry(1.5, 0.4, 0.07),
      new THREE.MeshStandardMaterial({
        color: 0x1a0800, emissive: 0xFF6644,
        emissiveIntensity: 0.5,
      })
    );
    signBg.position.set(0, bodyH * 0.78, bodyD / 2 + 0.07);
    group.add(signBg);
  }

  function init(scene) {
    SoolBuildings.create(scene, {
      data:        DATA,
      bodyW:       2.8,
      bodyH:       2.8,
      bodyD:       2.4,
      wallColor:   0xC8A888,
      roofType:    'gable',
      roofColor:   0x6A2A1A,
      roofHeight:  1.0,
      floors:      2,
      windowColor: 0xFF8866,
      windowCols:  2,
      signColor:   0xFF6644,
      doorColor:   0x3a1808,
      chimneyPos:  [{ x: -0.6, z: -0.4 }],
      extras:      makeRestaurantExtras,
    });
  }

  return { init, getData: () => DATA };

})();
