/* ═══════════════════════════════════════════════
   술마을 — Community Center (커뮤니티 센터)
   커뮤니티 · 소셜 · Alumni
   ═══════════════════════════════════════════════ */

const BuildingCommunity = (() => {

  const DATA = {
    id:   'community',
    name: '커뮤니티 센터',
    sub:  'COMMUNITY CENTER',
    emoji: '🏛️',
    desc: '취향 기반 소규모 커뮤니티. 기수별 Alumni 공간, 위스키 마니아, 전통주 덕후, 하이볼 클럽까지. 나와 같은 취향의 사람들을 만나보세요.',
    tags: ['커뮤니티', '소셜', 'Alumni', '취향'],
    pos:  [0, 0, -7.5],
    url:  'community.html',
  };

  function makeCommunityExtras(group, { bodyW, bodyH, bodyD, signColor }) {

    // ── 돔 위 깃발 ────────────────────────────
    const flagPole = new THREE.Mesh(
      new THREE.CylinderGeometry(0.03, 0.03, 1.2, 6),
      new THREE.MeshStandardMaterial({ color: 0x888899, roughness: 0.6, metalness: 0.4 })
    );
    flagPole.position.set(0, bodyH + 1.1, 0);
    group.add(flagPole);

    const flag = new THREE.Mesh(
      new THREE.PlaneGeometry(0.5, 0.32),
      new THREE.MeshStandardMaterial({
        color: 0x9966FF, roughness: 0.8, side: THREE.DoubleSide,
      })
    );
    flag.position.set(0.25, bodyH + 1.55, 0);
    group.add(flag);

    // ── 양쪽 날개 건물 ────────────────────────
    const wingMat = new THREE.MeshStandardMaterial({ color: 0xBAAA98, roughness: 0.85 });
    [-1, 1].forEach(side => {
      const wing = new THREE.Mesh(
        new THREE.BoxGeometry(1.0, bodyH * 0.65, bodyD * 0.8),
        wingMat
      );
      wing.position.set(side * (bodyW / 2 + 0.55), bodyH * 0.325, 0);
      wing.castShadow = true;
      wing.receiveShadow = true;
      group.add(wing);

      // 날개 지붕
      const wRoof = new THREE.Mesh(
        new THREE.ConeGeometry(0.78, 0.6, 4),
        new THREE.MeshStandardMaterial({ color: 0x3A2A6A, roughness: 0.7 })
      );
      wRoof.rotation.y = Math.PI / 4;
      wRoof.position.set(side * (bodyW / 2 + 0.55), bodyH * 0.65 + 0.3, 0);
      wRoof.castShadow = true;
      group.add(wRoof);

      // 날개 창문
      const wWin = new THREE.Mesh(
        new THREE.PlaneGeometry(0.32, 0.42),
        new THREE.MeshStandardMaterial({
          color: 0x000000, emissive: 0xBB88FF,
          emissiveIntensity: 0.8, roughness: 0.1,
        })
      );
      wWin.position.set(side * (bodyW / 2 + 0.55), bodyH * 0.4, bodyD * 0.4 + 0.02);
      group.add(wWin);
    });

    // ── 광장 방향 큰 계단 ─────────────────────
    const stepMat = new THREE.MeshStandardMaterial({ color: 0x9A8E80, roughness: 0.85 });
    [0, 1, 2, 3].forEach(i => {
      const step = new THREE.Mesh(
        new THREE.BoxGeometry(bodyW + i * 0.6, 0.14, 0.4),
        stepMat
      );
      step.position.set(0, i * 0.14 + 0.07, bodyD / 2 + 0.25 + i * 0.22);
      step.receiveShadow = true;
      group.add(step);
    });

    // ── 커뮤니티 게시판 (외부) ────────────────
    const boardMat = new THREE.MeshStandardMaterial({ color: 0x2a2040, roughness: 0.8 });
    const board = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.65, 0.06), boardMat);
    board.position.set(-bodyW / 2 - 0.8, 0.7, bodyD / 2 + 0.2);
    group.add(board);

    // 게시판 지지대
    [-0.3, 0.3].forEach(x => {
      const post = new THREE.Mesh(
        new THREE.CylinderGeometry(0.03, 0.03, 0.7, 6),
        new THREE.MeshStandardMaterial({ color: 0x444455, roughness: 0.8 })
      );
      post.position.set(-bodyW / 2 - 0.8 + x, 0.35, bodyD / 2 + 0.2);
      group.add(post);
    });

    // 게시판 내용 (형광빛 내용)
    const notice = new THREE.Mesh(
      new THREE.PlaneGeometry(0.7, 0.46),
      new THREE.MeshStandardMaterial({
        color: 0xeeeedd, emissive: 0xccccaa,
        emissiveIntensity: 0.3, roughness: 0.9,
      })
    );
    notice.position.set(-bodyW / 2 - 0.8, 0.74, bodyD / 2 + 0.24);
    group.add(notice);

    // ── 보라색 포인트 조명들 ──────────────────
    [
      [0, bodyH * 0.8, bodyD / 2 + 0.5],
      [-bodyW / 2 - 0.55, bodyH * 0.4, bodyD / 2 * 0.8 + 0.3],
      [ bodyW / 2 + 0.55, bodyH * 0.4, bodyD / 2 * 0.8 + 0.3],
    ].forEach(([x, y, z]) => {
      const pl = new THREE.PointLight(0x9966FF, 0.4, 3.0);
      pl.position.set(x, y, z);
      group.add(pl);
    });

    // ── 네온 간판 ─────────────────────────────
    const signBg = new THREE.Mesh(
      new THREE.BoxGeometry(2.0, 0.42, 0.07),
      new THREE.MeshStandardMaterial({
        color: 0x100820,
        emissive: 0x8833FF,
        emissiveIntensity: 0.6,
      })
    );
    signBg.position.set(0, bodyH * 0.72, bodyD / 2 + 0.07);
    group.add(signBg);
  }

  function init(scene) {
    SoolBuildings.create(scene, {
      data:        DATA,
      bodyW:       3.6,
      bodyH:       4.6,
      bodyD:       2.8,
      wallColor:   0xC4B8A8,
      roofType:    'dome',
      roofColor:   0x3A2A6A,
      roofHeight:  1.2,
      floors:      3,
      windowColor: 0xBB88FF,
      windowCols:  3,
      signColor:   0x9966FF,
      doorColor:   0x2a1a4a,
      chimneyPos:  null,
      extras:      makeCommunityExtras,
    });
  }

  return { init, getData: () => DATA };

})();
