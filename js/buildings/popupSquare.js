/* ═══════════════════════════════════════════════
   술향기마을 — Popup Square (팝업 광장)
   이벤트 · 팝업스토어 · 한정 체험
   ═══════════════════════════════════════════════ */

const BuildingPopupSquare = (() => {

  const DATA = {
    id:   'popupSquare',
    name: '팝업 광장',
    sub:  'POPUP & EVENTS',
    emoji: '🎪',
    desc: '기간 한정 팝업스토어, 주류 브랜드 체험 이벤트, 시즌 한정 테이스팅. 인스타그래머블한 경험이 기다리고 있어요.',
    tags: ['팝업', '이벤트', '체험', '한정판'],
    pos:  [-6.0, 0, -10.0],
    url:  'popupSquare.html',
  };

  function makePopupExtras(group, { bodyW, bodyH, bodyD }) {

    // ── 큰 텐트 / 파빌리온 ────────────────────
    // 텐트 기둥 4개
    const poleMat = new THREE.MeshStandardMaterial({ color: 0x888888, roughness: 0.5, metalness: 0.5 });
    [[-bodyW/2+0.2, bodyD/2-0.2],[bodyW/2-0.2, bodyD/2-0.2],
     [-bodyW/2+0.2,-bodyD/2+0.2],[bodyW/2-0.2,-bodyD/2+0.2]].forEach(([x,z])=>{
      const pole = new THREE.Mesh(
        new THREE.CylinderGeometry(0.04, 0.04, bodyH + 0.8, 6), poleMat
      );
      pole.position.set(x, (bodyH + 0.8) / 2, z);
      group.add(pole);
    });

    // 텐트 천장 (삼각형 깃발들)
    const tentColors = [0xFF4444, 0xFFAA22, 0x44FF88, 0x4488FF, 0xFF44AA];
    for (let i = 0; i < 8; i++) {
      const flag = new THREE.Mesh(
        new THREE.ConeGeometry(0.18, 0.32, 3),
        new THREE.MeshStandardMaterial({
          color: tentColors[i % tentColors.length],
          roughness: 0.8, side: THREE.DoubleSide,
        })
      );
      const angle = (i / 8) * Math.PI * 2;
      flag.position.set(
        Math.cos(angle) * (bodyW * 0.35),
        bodyH + 0.65,
        Math.sin(angle) * (bodyD * 0.35)
      );
      flag.rotation.z = Math.PI;
      group.add(flag);
    }

    // 깃발 연결 줄
    const ropeMat = new THREE.MeshStandardMaterial({ color: 0x888888, roughness: 0.9 });
    for (let i = 0; i < 4; i++) {
      const rope = new THREE.Mesh(
        new THREE.CylinderGeometry(0.01, 0.01, bodyW * 0.72, 4), ropeMat
      );
      rope.rotation.z = Math.PI / 2;
      rope.position.set(0, bodyH + 0.65, -bodyD / 2 + 0.2 + i * (bodyD * 0.22));
      group.add(rope);
    }

    // ── 외부 전시 부스 ────────────────────────
    const boothMat = new THREE.MeshStandardMaterial({ color: 0x2a2a3a, roughness: 0.8 });
    [[bodyW / 2 + 0.5, 0.3], [-bodyW / 2 - 0.5, 0.3]].forEach(([x, z]) => {
      const booth = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.9, 0.6), boothMat);
      booth.position.set(x, 0.45, z);
      group.add(booth);
      // 부스 위 상품
      const item = new THREE.Mesh(
        new THREE.CylinderGeometry(0.06, 0.08, 0.28, 8),
        new THREE.MeshStandardMaterial({ color: 0x3a1a2a, roughness: 0.2, transparent: true, opacity: 0.85 })
      );
      item.position.set(x, 1.05, z);
      group.add(item);
    });

    // ── 컬러풀 조명 ───────────────────────────
    const lightColors = [0xFF4444, 0x44FF88, 0x4488FF, 0xFF44AA];
    lightColors.forEach((color, i) => {
      const angle = (i / lightColors.length) * Math.PI * 2;
      const pl = new THREE.PointLight(color, 0.3, 3.5);
      pl.position.set(
        Math.cos(angle) * 1.2,
        bodyH * 0.7,
        Math.sin(angle) * 1.2
      );
      group.add(pl);
    });

    // 중앙 컬러 빔
    const beamLight = new THREE.PointLight(0xFFFFFF, 0.5, 4.0);
    beamLight.position.set(0, bodyH * 0.5, bodyD / 2 + 0.3);
    group.add(beamLight);

    // ── 간판 ──────────────────────────────────
    const signBg = new THREE.Mesh(
      new THREE.BoxGeometry(1.6, 0.4, 0.07),
      new THREE.MeshStandardMaterial({
        color: 0x1a0808, emissive: 0xFF6622,
        emissiveIntensity: 0.6,
      })
    );
    signBg.position.set(0, bodyH * 0.8, bodyD / 2 + 0.07);
    group.add(signBg);
  }

  function init(scene) {
    SoolBuildings.create(scene, {
      data:        DATA,
      bodyW:       3.0,
      bodyH:       3.2,
      bodyD:       2.6,
      wallColor:   0xC8A890,
      roofType:    'flat',
      roofColor:   0x4A2A1A,
      roofHeight:  0.15,
      floors:      2,
      windowColor: 0xFF8844,
      windowCols:  2,
      signColor:   0xFF6622,
      doorColor:   0x2a1008,
      chimneyPos:  null,
      extras:      makePopupExtras,
    });
  }

  return { init, getData: () => DATA };

})();
