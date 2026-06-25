/* ═══════════════════════════════════════════════
   술향기마을 — Sober Cafe (소버 카페)
   무알코올 · 저알코올 · 건강 음주
   ═══════════════════════════════════════════════ */

const BuildingCafe = (() => {

  const DATA = {
    id:   'cafe',
    name: '소버 카페',
    sub:  'SOBER & NOLO CAFE',
    emoji: '🌿',
    desc: '취하지 않아도 즐거운 술. 무알코올·저알코올 음료 리뷰, 절주 챌린지, 오늘의 한 잔 큐레이션. 소버 라이프를 즐기는 모든 분을 환영해요.',
    tags: ['무알코올', '저알코올', '소버라이프', '절주'],
    pos:  [-11.0, 0, 5.0],
    url:  'cafe.html',
  };

  function makeCafeExtras(group, { bodyW, bodyH, bodyD }) {

    // ── 초록 어닝 ─────────────────────────────
    const awningMat = new THREE.MeshStandardMaterial({
      color: 0x2a6a3a, roughness: 0.85, side: THREE.DoubleSide,
    });
    const awning = new THREE.Mesh(new THREE.PlaneGeometry(bodyW + 0.5, 0.85), awningMat);
    awning.rotation.x = -Math.PI / 2.5;
    awning.position.set(0, bodyH * 0.4, bodyD / 2 + 0.38);
    group.add(awning);

    // 어닝 흰 줄무늬
    for (let i = 0; i < 4; i++) {
      const stripe = new THREE.Mesh(
        new THREE.PlaneGeometry(0.08, 0.85),
        new THREE.MeshStandardMaterial({ color: 0xeeeedd, roughness: 0.9, side: THREE.DoubleSide })
      );
      stripe.rotation.x = -Math.PI / 2.5;
      stripe.position.set(-bodyW / 2 + 0.3 + i * (bodyW / 4), bodyH * 0.4, bodyD / 2 + 0.39);
      group.add(stripe);
    }

    // ── 외부 테이블 세트 ──────────────────────
    const tableMat = new THREE.MeshStandardMaterial({ color: 0x4a7a4a, roughness: 0.7 });
    const chairMat = new THREE.MeshStandardMaterial({ color: 0x3a5a3a, roughness: 0.8 });

    [[bodyW / 2 + 0.55, bodyD / 2 + 0.6],
     [-bodyW / 2 - 0.55, bodyD / 2 + 0.6]].forEach(([tx, tz]) => {
      // 테이블
      const tbl = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.28, 0.05, 10), tableMat);
      tbl.position.set(tx, 0.68, tz);
      group.add(tbl);
      const tLeg = new THREE.Mesh(
        new THREE.CylinderGeometry(0.025, 0.025, 0.68, 6),
        chairMat
      );
      tLeg.position.set(tx, 0.34, tz);
      group.add(tLeg);
      // 의자 2개
      [-0.32, 0.32].forEach(offset => {
        const ch = new THREE.Mesh(
          new THREE.CylinderGeometry(0.12, 0.1, 0.05, 8), chairMat
        );
        ch.position.set(tx + offset, 0.5, tz + 0.1);
        group.add(ch);
        const cLeg = new THREE.Mesh(
          new THREE.CylinderGeometry(0.02, 0.02, 0.5, 5), chairMat
        );
        cLeg.position.set(tx + offset, 0.25, tz + 0.1);
        group.add(cLeg);
      });
    });

    // ── 화분들 (초록 식물) ────────────────────
    const potMat = new THREE.MeshStandardMaterial({ color: 0x7a5a3a, roughness: 0.85 });
    [[bodyW / 2 + 0.1, bodyD / 2 + 0.08],
     [-bodyW / 2 - 0.1, bodyD / 2 + 0.08],
     [0.4, bodyD / 2 + 0.08],
     [-0.4, bodyD / 2 + 0.08]].forEach(([x, z]) => {
      const pot = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.13, 0.2, 8), potMat);
      pot.position.set(x, 0.1, z);
      group.add(pot);
      const plant = new THREE.Mesh(
        new THREE.SphereGeometry(0.16, 7, 6),
        new THREE.MeshStandardMaterial({ color: 0x1e4a20, roughness: 0.9 })
      );
      plant.scale.y = 1.3;
      plant.position.set(x, 0.3, z);
      group.add(plant);
    });

    // ── 민트색 칠판 메뉴판 ───────────────────
    const menuMat = new THREE.MeshStandardMaterial({
      color: 0x0a2a1a, emissive: 0x44CC88,
      emissiveIntensity: 0.3,
    });
    const menu = new THREE.Mesh(new THREE.BoxGeometry(0.55, 0.72, 0.05), menuMat);
    menu.position.set(-bodyW / 2 - 0.4, 0.8, bodyD / 2 + 0.18);
    menu.rotation.y = 0.3;
    group.add(menu);
    // 메뉴판 다리
    const mLeg = new THREE.Mesh(
      new THREE.CylinderGeometry(0.02, 0.02, 0.4, 5),
      new THREE.MeshStandardMaterial({ color: 0x4a4a4a })
    );
    mLeg.position.set(-bodyW / 2 - 0.4, 0.2, bodyD / 2 + 0.18);
    group.add(mLeg);

    // ── 민트·초록 조명 ────────────────────────
    const gl = new THREE.PointLight(0x44FF99, 0.4, 3.5);
    gl.position.set(0, bodyH * 0.6, bodyD / 2 + 0.5);
    group.add(gl);

    // ── 간판 ──────────────────────────────────
    const signBg = new THREE.Mesh(
      new THREE.BoxGeometry(1.4, 0.38, 0.07),
      new THREE.MeshStandardMaterial({
        color: 0x081808, emissive: 0x44CC66,
        emissiveIntensity: 0.5,
      })
    );
    signBg.position.set(0, bodyH * 0.76, bodyD / 2 + 0.07);
    group.add(signBg);
  }

  function init(scene) {
    SoolBuildings.create(scene, {
      data:        DATA,
      bodyW:       2.4,
      bodyH:       2.6,
      bodyD:       2.2,
      wallColor:   0xB8D0B0,
      roofType:    'cone',
      roofColor:   0x2A5A3A,
      roofHeight:  0.85,
      floors:      1,
      windowColor: 0x88FFAA,
      windowCols:  2,
      signColor:   0x44CC66,
      doorColor:   0x1a3a20,
      chimneyPos:  null,
      extras:      makeCafeExtras,
    });
  }

  return { init, getData: () => DATA };

})();
