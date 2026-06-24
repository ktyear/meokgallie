/* ═══════════════════════════════════════════════
   술마을 — Studio (영상관)
   숏폼 · 콘텐츠 · 레시피
   ═══════════════════════════════════════════════ */

const BuildingStudio = (() => {

  const DATA = {
    id:   'studio',
    name: '영상관',
    sub:  'SHORT FORM STUDIO',
    emoji: '🎬',
    desc: '하이볼 레시피 숏폼, 칵테일 튜토리얼, 바텐더 인터뷰. 보고 바로 따라하기. MZ세대를 위한 술 콘텐츠 스튜디오.',
    tags: ['숏폼', '레시피', '칵테일', '콘텐츠'],
    pos:  [0, 0, 5.5],
    url:  'studio.html',
  };

  function makeStudioExtras(group, { bodyW, bodyH, bodyD }) {

    // ── 위성 안테나 ───────────────────────────
    const antMat = new THREE.MeshStandardMaterial({ color: 0x888899, roughness: 0.5, metalness: 0.5 });
    const dish = new THREE.Mesh(
      new THREE.SphereGeometry(0.28, 10, 8, 0, Math.PI * 2, 0, Math.PI / 2),
      antMat
    );
    dish.rotation.x = Math.PI / 4;
    dish.position.set(bodyW / 2 - 0.3, bodyH + 0.25, -bodyD / 2 + 0.3);
    group.add(dish);

    const antPole = new THREE.Mesh(
      new THREE.CylinderGeometry(0.025, 0.025, 0.4, 6), antMat
    );
    antPole.position.set(bodyW / 2 - 0.3, bodyH + 0.08, -bodyD / 2 + 0.3);
    group.add(antPole);

    // ── 핑크 네온 간판 ────────────────────────
    const neon = new THREE.Mesh(
      new THREE.BoxGeometry(1.5, 0.38, 0.07),
      new THREE.MeshStandardMaterial({
        color: 0x200818, emissive: 0xFF44AA,
        emissiveIntensity: 0.7,
      })
    );
    neon.position.set(0, bodyH * 0.78, bodyD / 2 + 0.07);
    group.add(neon);

    // ── 촬영 조명 (빔 효과) ───────────────────
    [[-0.45, 0.45]].forEach(xs => {
      xs.forEach(x => {
        const spotMat = new THREE.MeshStandardMaterial({
          color: 0xFF88CC, emissive: 0xFF44AA,
          emissiveIntensity: 1.0, roughness: 0.2,
        });
        const spot = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 0.12, 8), spotMat);
        spot.position.set(x, bodyH * 0.9, bodyD / 2 + 0.05);
        group.add(spot);
      });
    });

    // 핑크 포인트 라이트
    const pl = new THREE.PointLight(0xFF44AA, 0.6, 4.0);
    pl.position.set(0, bodyH * 0.7, bodyD / 2 + 0.5);
    group.add(pl);

    // ── 필름 스트립 장식 ──────────────────────
    const filmMat = new THREE.MeshStandardMaterial({ color: 0x111118, roughness: 0.9 });
    [-bodyW / 2 - 0.04, bodyW / 2 + 0.04].forEach(x => {
      const film = new THREE.Mesh(new THREE.BoxGeometry(0.08, bodyH * 0.6, 0.04), filmMat);
      film.position.set(x, bodyH * 0.4, bodyD / 2 + 0.02);
      group.add(film);
      // 필름 구멍
      for (let i = 0; i < 5; i++) {
        const hole = new THREE.Mesh(
          new THREE.BoxGeometry(0.04, 0.06, 0.06),
          new THREE.MeshStandardMaterial({ color: 0x333344, roughness: 0.9 })
        );
        hole.position.set(x, bodyH * 0.15 + i * bodyH * 0.12, bodyD / 2 + 0.05);
        group.add(hole);
      }
    });

    // ── 클래퍼보드 장식 ──────────────────────
    const clapMat = new THREE.MeshStandardMaterial({ color: 0xeeeeee, roughness: 0.8 });
    const clap = new THREE.Mesh(new THREE.BoxGeometry(0.35, 0.28, 0.04), clapMat);
    clap.position.set(-bodyW / 2 - 0.55, 1.0, bodyD / 2 + 0.2);
    clap.rotation.z = 0.2;
    group.add(clap);
    // 줄무늬
    for (let i = 0; i < 4; i++) {
      const stripe = new THREE.Mesh(
        new THREE.BoxGeometry(0.35, 0.04, 0.05),
        new THREE.MeshStandardMaterial({ color: i % 2 === 0 ? 0x111111 : 0xffffff })
      );
      stripe.position.set(-bodyW / 2 - 0.55, 1.06 + i * 0.06, bodyD / 2 + 0.23);
      stripe.rotation.z = 0.2;
      group.add(stripe);
    }
  }

  function init(scene) {
    SoolBuildings.create(scene, {
      data:        DATA,
      bodyW:       2.2,
      bodyH:       2.8,
      bodyD:       2.2,
      wallColor:   0xC0A8C0,
      roofType:    'flat',
      roofColor:   0x5A1A4A,
      roofHeight:  0.2,
      floors:      2,
      windowColor: 0xFF88CC,
      windowCols:  2,
      signColor:   0xFF44AA,
      doorColor:   0x2a0a1e,
      chimneyPos:  null,
      extras:      makeStudioExtras,
    });
  }

  return { init, getData: () => DATA };

})();
