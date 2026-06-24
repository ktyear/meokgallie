/* ═══════════════════════════════════════════════
   술마을 — Library (도서관)
   교육 · 강의 · 수료증
   ═══════════════════════════════════════════════ */

const BuildingLibrary = (() => {

  const DATA = {
    id:   'library',
    name: '도서관',
    sub:  'LIBRARY & EDUCATION',
    emoji: '📚',
    desc: '조주기능사 강의, 주류 교육 콘텐츠, 수료증 발급. 위스키·전통주·와인의 역사부터 제조 과정까지. 잘 알고 마시는 것이 진짜 즐거움.',
    tags: ['교육', '강의', '수료증', '조주기능사'],
    pos:  [5.5, 0, -3.5],
    url:  'library.html',
  };

  function makeLibraryExtras(group, { bodyW, bodyH, bodyD }) {

    // ── 기둥 (클래식 도서관 느낌) ─────────────
    const pillarMat = new THREE.MeshStandardMaterial({ color: 0xD8CEC0, roughness: 0.7 });
    [-bodyW / 2 + 0.2, bodyW / 2 - 0.2].forEach(x => {
      const pillar = new THREE.Mesh(
        new THREE.CylinderGeometry(0.12, 0.14, bodyH * 0.75, 10),
        pillarMat
      );
      pillar.position.set(x, bodyH * 0.375, bodyD / 2 + 0.05);
      pillar.castShadow = true;
      group.add(pillar);

      // 기둥 머리
      const cap = new THREE.Mesh(
        new THREE.BoxGeometry(0.3, 0.14, 0.3),
        pillarMat
      );
      cap.position.set(x, bodyH * 0.75, bodyD / 2 + 0.05);
      group.add(cap);
    });

    // ── 삼각형 페디먼트 (도서관 정면 장식) ───
    const pedMat = new THREE.MeshStandardMaterial({ color: 0xC8BEB0, roughness: 0.75 });
    const pedShape = new THREE.Shape();
    pedShape.moveTo(-bodyW / 2 - 0.1, 0);
    pedShape.lineTo( bodyW / 2 + 0.1, 0);
    pedShape.lineTo(0, 0.65);
    pedShape.closePath();
    const ped = new THREE.Mesh(
      new THREE.ShapeGeometry(pedShape),
      pedMat
    );
    ped.position.set(0, bodyH, bodyD / 2 + 0.04);
    group.add(ped);

    // ── 큰 아치형 창문 (중앙) ────────────────
    const archWinMat = new THREE.MeshStandardMaterial({
      color: 0x000000, emissive: 0x88CCFF,
      emissiveIntensity: 0.9, roughness: 0.1,
    });
    const archWin = new THREE.Mesh(
      new THREE.CylinderGeometry(0.42, 0.42, 0.05, 16, 1, false, 0, Math.PI),
      archWinMat
    );
    archWin.rotation.z = Math.PI / 2;
    archWin.position.set(0, bodyH * 0.68, bodyD / 2 + 0.01);
    group.add(archWin);

    // ── 계단 (넓은 도서관 계단) ──────────────
    const stepMat = new THREE.MeshStandardMaterial({ color: 0xB8AEA0, roughness: 0.85 });
    [0, 1, 2].forEach(i => {
      const step = new THREE.Mesh(
        new THREE.BoxGeometry(bodyW + i * 0.5, 0.12, 0.36),
        stepMat
      );
      step.position.set(0, i * 0.12 + 0.06, bodyD / 2 + 0.22 + i * 0.18);
      step.receiveShadow = true;
      group.add(step);
    });

    // ── 외부 독서 테이블 ──────────────────────
    const deskMat = new THREE.MeshStandardMaterial({ color: 0x4a3820, roughness: 0.8 });
    const desk = new THREE.Mesh(new THREE.BoxGeometry(1.0, 0.06, 0.5), deskMat);
    desk.position.set(bodyW / 2 + 0.7, 0.72, bodyD / 2 + 0.3);
    desk.castShadow = true;
    group.add(desk);

    // 책 몇 권 (색깔 있는 직육면체)
    const bookColors = [0x8B1A1A, 0x1A4A8B, 0x1A6B1A, 0x6B4A1A];
    bookColors.forEach((color, i) => {
      const book = new THREE.Mesh(
        new THREE.BoxGeometry(0.07, 0.18 + Math.random() * 0.06, 0.28),
        new THREE.MeshStandardMaterial({ color, roughness: 0.85 })
      );
      book.position.set(
        bodyW / 2 + 0.38 + i * 0.12,
        0.84,
        bodyD / 2 + 0.3
      );
      book.rotation.y = (Math.random() - 0.5) * 0.2;
      group.add(book);
    });

    // ── 파란 조명 (학술적 분위기) ─────────────
    const blueLight = new THREE.PointLight(0x4488FF, 0.45, 3.5);
    blueLight.position.set(0, bodyH * 0.65, bodyD / 2 + 0.5);
    group.add(blueLight);

    // ── 간판 ──────────────────────────────────
    const signBg = new THREE.Mesh(
      new THREE.BoxGeometry(1.6, 0.36, 0.06),
      new THREE.MeshStandardMaterial({
        color: 0x0a1830,
        emissive: 0x3366FF,
        emissiveIntensity: 0.5,
      })
    );
    signBg.position.set(0, bodyH * 0.5, bodyD / 2 + 0.06);
    group.add(signBg);
  }

  function init(scene) {
    SoolBuildings.create(scene, {
      data:        DATA,
      bodyW:       2.6,
      bodyH:       4.0,
      bodyD:       2.4,
      wallColor:   0xC8BEB0,
      roofType:    'flat',
      roofColor:   0x2A4A7A,
      roofHeight:  0.2,
      floors:      3,
      windowColor: 0x88CCFF,
      windowCols:  2,
      signColor:   0x4488FF,
      doorColor:   0x2a3850,
      chimneyPos:  null,
      extras:      makeLibraryExtras,
    });
  }

  return { init, getData: () => DATA };

})();
