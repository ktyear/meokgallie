/* ═══════════════════════════════════════════════
   술향기마을 — Bottle Shop (주류 상점)
   쇼핑 · 스마트오더 · 한정판
   ═══════════════════════════════════════════════ */

const BuildingShop = (() => {

  const DATA = {
    id:   'shop',
    name: '주류 상점',
    sub:  'BOTTLE SHOP',
    emoji: '🛒',
    desc: '스마트오더로 원하는 술을 픽업. 한정판 위스키 알림, 가격 비교, 취향 맞춤 추천까지. 발품 팔지 않아도 좋은 술을 만날 수 있어요.',
    tags: ['쇼핑', '스마트오더', '한정판', '가격비교'],
    pos:  [7.0, 0, 0],
    url:  'shop.html',
  };

  function makeShopExtras(group, { bodyW, bodyH, bodyD }) {

    // ── 쇼윈도우 (큰 유리창) ─────────────────
    const glassMat = new THREE.MeshStandardMaterial({
      color: 0x88FF99, emissive: 0x44CC66,
      emissiveIntensity: 0.25, roughness: 0.05,
      transparent: true, opacity: 0.55,
    });
    const glass = new THREE.Mesh(new THREE.PlaneGeometry(bodyW * 0.7, bodyH * 0.38), glassMat);
    glass.position.set(0, bodyH * 0.32, bodyD / 2 + 0.02);
    group.add(glass);

    // 쇼윈도우 프레임
    const frameMat = new THREE.MeshStandardMaterial({ color: 0x2a4a2a, roughness: 0.7 });
    [[bodyW * 0.35, bodyH * 0.5, 0.05, bodyH * 0.38 + 0.08],
     [-bodyW * 0.35, bodyH * 0.5, 0.05, bodyH * 0.38 + 0.08]].forEach(([x, y, w, h]) => {
      const fr = new THREE.Mesh(new THREE.BoxGeometry(w, h, 0.05), frameMat);
      fr.position.set(x, y - bodyH * 0.31 + bodyH * 0.32, bodyD / 2 + 0.02);
      group.add(fr);
    });

    // ── 진열된 술병들 (쇼윈도우 안) ─────────
    const displayColors = [0x1a3a1a, 0xaa4422, 0x1a1a4a, 0x3a3a0a, 0x4a1a1a];
    for (let i = 0; i < 5; i++) {
      const bottle = new THREE.Mesh(
        new THREE.CylinderGeometry(0.045, 0.06, 0.32, 8),
        new THREE.MeshStandardMaterial({
          color: displayColors[i],
          roughness: 0.15, metalness: 0.15,
          transparent: true, opacity: 0.9,
        })
      );
      bottle.position.set(-bodyW * 0.28 + i * 0.14, 0.22, bodyD / 2 + 0.15);
      group.add(bottle);
    }

    // ── 가격표 (형광 초록) ────────────────────
    const tagMat = new THREE.MeshStandardMaterial({
      color: 0x002200, emissive: 0x44FF66,
      emissiveIntensity: 0.7, roughness: 0.9,
    });
    [-0.4, 0, 0.4].forEach(x => {
      const tag = new THREE.Mesh(new THREE.PlaneGeometry(0.16, 0.1), tagMat);
      tag.position.set(x, 0.1, bodyD / 2 + 0.14);
      group.add(tag);
    });

    // ── 한정판 배너 ───────────────────────────
    const bannerMat = new THREE.MeshStandardMaterial({
      color: 0x1a3a1a, emissive: 0x44CC66,
      emissiveIntensity: 0.4, side: THREE.DoubleSide,
    });
    const banner = new THREE.Mesh(new THREE.PlaneGeometry(0.65, 0.28), bannerMat);
    banner.position.set(-bodyW / 2 + 0.4, bodyH * 0.85, bodyD / 2 + 0.06);
    group.add(banner);

    // ── 초록 조명 ─────────────────────────────
    const gl1 = new THREE.PointLight(0x44FF66, 0.35, 3.0);
    gl1.position.set(0, bodyH * 0.5, bodyD / 2 + 0.5);
    group.add(gl1);
    const gl2 = new THREE.PointLight(0x22CC44, 0.25, 2.0);
    gl2.position.set(0, 0.5, bodyD / 2 + 0.4);
    group.add(gl2);

    // ── 캐노피 ────────────────────────────────
    const canopy = new THREE.Mesh(
      new THREE.BoxGeometry(bodyW + 0.3, 0.06, 0.7),
      new THREE.MeshStandardMaterial({ color: 0x2a4a2a, roughness: 0.85 })
    );
    canopy.position.set(0, bodyH * 0.42, bodyD / 2 + 0.32);
    group.add(canopy);
  }

  function init(scene) {
    SoolBuildings.create(scene, {
      data:        DATA,
      bodyW:       2.4,
      bodyH:       3.0,
      bodyD:       2.2,
      wallColor:   0xB0C4A0,
      roofType:    'flat',
      roofColor:   0x2A5A3A,
      roofHeight:  0.2,
      floors:      2,
      windowColor: 0x88FF99,
      windowCols:  2,
      signColor:   0x44CC66,
      doorColor:   0x1a3a1a,
      chimneyPos:  null,
      extras:      makeShopExtras,
    });
  }

  return { init, getData: () => DATA };

})();
