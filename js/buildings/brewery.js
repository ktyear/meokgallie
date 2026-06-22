/* ═══════════════════════════════════════════════
   술마을 — Brewery (양조장)
   전통주 · 스토리텔링 · 주조장
   ═══════════════════════════════════════════════ */

const BuildingBrewery = (() => {

  const DATA = {
    id:   'brewery',
    name: '양조장',
    sub:  'TRADITIONAL BREWERY',
    emoji: '🍶',
    desc: '전통주 스토리텔링, 주조장 탐방 콘텐츠. 막걸리부터 증류식 소주, 약주까지. 우리 술의 역사와 장인의 이야기를 만나보세요.',
    tags: ['전통주', '막걸리', '스토리', '주조장'],
    pos:  [-7.0, 0, 0],
    url:  '#brewery',
  };

  function makeBreweryExtras(group, { bodyW, bodyH, bodyD }) {

    // ── 큰 굴뚝 2개 (양조장 특유의 굴뚝) ────
    [[0.6, -0.4], [-0.5, -0.3]].forEach(([x, z]) => {
      const chimney = new THREE.Mesh(
        new THREE.CylinderGeometry(0.18, 0.22, 1.4, 10),
        new THREE.MeshStandardMaterial({ color: 0x5a3a22, roughness: 0.88 })
      );
      chimney.position.set(x, bodyH + 0.6, z);
      chimney.castShadow = true;
      group.add(chimney);

      // 굴뚝 테두리 링
      const ring = new THREE.Mesh(
        new THREE.TorusGeometry(0.2, 0.03, 6, 12),
        new THREE.MeshStandardMaterial({ color: 0x3a2812, roughness: 0.9 })
      );
      ring.position.set(x, bodyH + 1.3, z);
      group.add(ring);

      // 연기
      for (let i = 0; i < 4; i++) {
        const smoke = new THREE.Mesh(
          new THREE.SphereGeometry(0.1 + i * 0.06, 6, 5),
          new THREE.MeshStandardMaterial({
            color: 0x888899, transparent: true,
            opacity: 0.2 - i * 0.04, roughness: 1.0,
          })
        );
        smoke.position.set(
          x + (Math.random() - 0.5) * 0.15,
          bodyH + 1.45 + i * 0.35,
          z
        );
        group.add(smoke);
      }
    });

    // ── 항아리 (장독대) ───────────────────────
    const jarMat = new THREE.MeshStandardMaterial({ color: 0x6a4a2a, roughness: 0.85 });
    [
      [-bodyW / 2 - 0.55, 0.28, 0.3],
      [-bodyW / 2 - 0.9,  0.22, 0.5],
      [-bodyW / 2 - 0.55, 0.18, 0.7],
      [-bodyW / 2 - 0.85, 0.3,  0.1],
    ].forEach(([x, r, z]) => {
      const jar = new THREE.Mesh(
        new THREE.SphereGeometry(r, 10, 8),
        jarMat
      );
      jar.scale.y = 1.25;
      jar.position.set(x, r * 1.1, z);
      jar.castShadow = true;
      group.add(jar);

      // 항아리 뚜껑
      const lid = new THREE.Mesh(
        new THREE.CylinderGeometry(r * 0.6, r * 0.7, 0.06, 10),
        new THREE.MeshStandardMaterial({ color: 0x5a3a1a, roughness: 0.9 })
      );
      lid.position.set(x, r * 2.3, z);
      group.add(lid);
    });

    // ── 나무 발효통 ───────────────────────────
    const barrelMat = new THREE.MeshStandardMaterial({ color: 0x4a3018, roughness: 0.9 });
    const hoopMat   = new THREE.MeshStandardMaterial({ color: 0x222230, roughness: 0.6, metalness: 0.4 });
    [bodyW / 2 + 0.4, bodyW / 2 + 0.85].forEach((x, i) => {
      const barrel = new THREE.Mesh(
        new THREE.CylinderGeometry(0.22, 0.22, 0.45, 12),
        barrelMat
      );
      barrel.position.set(x, 0.225, bodyD / 2 - 0.3 - i * 0.1);
      barrel.castShadow = true;
      group.add(barrel);

      // 철 테
      [0.08, -0.08].forEach(dy => {
        const hoop = new THREE.Mesh(
          new THREE.TorusGeometry(0.225, 0.018, 6, 14),
          hoopMat
        );
        hoop.rotation.x = Math.PI / 2;
        hoop.position.set(x, 0.225 + dy, bodyD / 2 - 0.3 - i * 0.1);
        group.add(hoop);
      });
    });

    // ── 황금 조명 ─────────────────────────────
    const gl = new THREE.PointLight(0xFFDD88, 0.5, 3.5);
    gl.position.set(0, bodyH * 0.6, bodyD / 2 + 0.5);
    group.add(gl);

    // ── 한지 느낌 등불 ────────────────────────
    const lanternMat = new THREE.MeshStandardMaterial({
      color: 0xFFCC44, emissive: 0xFFAA22,
      emissiveIntensity: 1.2, transparent: true, opacity: 0.85,
    });
    [-0.5, 0.5].forEach(x => {
      const lantern = new THREE.Mesh(
        new THREE.CylinderGeometry(0.1, 0.1, 0.22, 8),
        lanternMat
      );
      lantern.position.set(x, bodyH * 0.55, bodyD / 2 + 0.2);
      group.add(lantern);
    });

    // ── 간판 (전통 스타일) ────────────────────
    const signBg = new THREE.Mesh(
      new THREE.BoxGeometry(1.4, 0.44, 0.07),
      new THREE.MeshStandardMaterial({
        color: 0x2a1a08, emissive: 0xFFAA22,
        emissiveIntensity: 0.45,
      })
    );
    signBg.position.set(0, bodyH * 0.75, bodyD / 2 + 0.07);
    group.add(signBg);
  }

  function init(scene) {
    SoolBuildings.create(scene, {
      data:        DATA,
      bodyW:       3.0,
      bodyH:       2.8,
      bodyD:       3.2,
      wallColor:   0xD4B888,
      roofType:    'gable',
      roofColor:   0x6A4A1A,
      roofHeight:  1.1,
      floors:      1,
      windowColor: 0xFFDD88,
      windowCols:  2,
      signColor:   0xFFAA22,
      doorColor:   0x3a2008,
      chimneyPos:  null, // extras에서 직접 만듦
      extras:      makeBreweryExtras,
    });
  }

  return { init, getData: () => DATA };

})();
