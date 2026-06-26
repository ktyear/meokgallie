/* ═══════════════════════════════════════════════
   술향기마을 — Building Base
   모든 건물이 공유하는 공통 생성 함수 & 레지스트리
   ═══════════════════════════════════════════════ */

const SoolBuildings = (() => {

  let _scene;

  // 등록된 모든 건물 (레이캐스트 & 미니맵용)
  const registry   = [];   // { hitBox, data, group, windowLights, signLight }
  const hitBoxes   = [];   // 레이캐스트 대상
  const allWindowLights = []; // 애니메이션 업데이트용

  // ── 재질 캐시 (동일 색상 재사용) ─────────────
  // ★ 최적화: MeshStandardMaterial → MeshLambertMaterial
  //   Lambert = PBR 계산 없음 → CPU/GPU 부하 대폭 감소
  //   창문(emissive)·그라운드 등 단순 오브젝트에 적용
  const _matCache = {};
  function getMat(color, roughness = 0.85, metalness = 0.0) {
    const key = `${color}_lambert`;
    if (!_matCache[key]) {
      // metalness가 필요한 경우(금속 효과)만 Standard 유지
      if (metalness > 0) {
        _matCache[key] = new THREE.MeshStandardMaterial({ color, roughness, metalness });
      } else {
        _matCache[key] = new THREE.MeshLambertMaterial({ color });
      }
    }
    return _matCache[key];
  }

  // ── 창문 하나 생성 ────────────────────────────
  function makeWindow(w, h, emissiveColor, intensity) {
    const mat = new THREE.MeshStandardMaterial({
      color: 0x000000,
      emissive: emissiveColor,
      emissiveIntensity: intensity,
      roughness: 0.15,
    });
    const mesh = new THREE.Mesh(new THREE.PlaneGeometry(w, h), mat);
    allWindowLights.push({ mat, base: intensity });
    return mesh;
  }

  // ── 창문 열 배치 ─────────────────────────────
  function addWindowRow(group, opts) {
    const {
      count,        // 창문 개수
      y,            // 높이
      faceZ,        // 건물 앞면 z
      buildingW,    // 건물 폭
      winW = 0.38,  // 창문 너비
      winH = 0.48,  // 창문 높이
      lightColor,   // 발광 색상
      intensity = 0.85,
      addPointLight = false, // 포인트 라이트 추가 여부
      pointLightColor,
    } = opts;

    for (let i = 0; i < count; i++) {
      const x = -buildingW / 2 + (i + 0.5) * (buildingW / count);
      const win = makeWindow(winW, winH, lightColor, intensity + (Math.random() - 0.5) * 0.2);
      win.position.set(x, y, faceZ + 0.01);      
      group.add(win);
    }
    // ★ 최적화: 창문 포인트 라이트 완전 제거
    //   emissive 창문으로 시각적 효과 충분히 표현 가능
    //   포인트 라이트 11개 건물 × 층당 1개 = 최대 33개 제거
  }

  // ── 지붕 생성 ─────────────────────────────────
  function makeRoof(opts) {
    const {
      type = 'cone',    // 'cone' | 'flat' | 'gable' | 'dome'
      w, d,
      color,
      height = 0.9,
      baseY,
    } = opts;

    const mat = getMat(color, 0.7);
    let mesh;

    if (type === 'cone') {
      mesh = new THREE.Mesh(new THREE.ConeGeometry(Math.max(w, d) * 0.72, height, 4), mat);
      mesh.rotation.y = Math.PI / 4;
    } else if (type === 'dome') {
      mesh = new THREE.Mesh(new THREE.SphereGeometry(Math.max(w, d) * 0.58, 12, 8, 0, Math.PI * 2, 0, Math.PI / 2), mat);
    } else if (type === 'flat') {
      mesh = new THREE.Mesh(new THREE.BoxGeometry(w + 0.1, 0.15, d + 0.1), mat);
    } else if (type === 'gable') {
      // ★ ExtrudeGeometry → CylinderGeometry(삼각기둥) 방식으로 교체
      //   r128에서 ExtrudeGeometry + ShapeGeometry 조합이 불안정한 경우가 있음
      mesh = new THREE.Mesh(
        new THREE.CylinderGeometry(0, (w / 2 + 0.1) * 1.1, height, 3, 1),
        mat
      );
      mesh.scale.set(1.0, 1.0, (d + 0.2) / (w + 0.2));
      mesh.rotation.y = Math.PI / 6; // 삼각기둥 정렬
    }

    // mesh가 정의되지 않은 타입이면 flat으로 폴백
    if (!mesh) {
      mesh = new THREE.Mesh(new THREE.BoxGeometry(w + 0.1, 0.15, d + 0.1), mat);
    }

    mesh.position.y = baseY + (type === 'dome' ? 0 : height / 2);
    mesh.castShadow = true;
    return mesh;
  }

  // ── 굴뚝 ──────────────────────────────────────
  function makeChimney(x, y, z, smokeColor) {
    const group = new THREE.Group();
    const body  = new THREE.Mesh(
      new THREE.BoxGeometry(0.2, 0.65, 0.2),
      getMat(0x553322, 0.9)
    );
    body.position.set(x, y + 0.325, z);
    body.castShadow = true;
    group.add(body);

    // 연기 파티클 (작은 구체들)
    if (smokeColor) {
      for (let i = 0; i < 3; i++) {
        const smoke = new THREE.Mesh(
          new THREE.SphereGeometry(0.08 + i * 0.04, 5, 5),
          new THREE.MeshStandardMaterial({
            color: smokeColor,
            transparent: true,
            opacity: 0.25 - i * 0.06,
          })
        );
        smoke.position.set(x + (Math.random()-0.5)*0.1, y + 0.7 + i * 0.28, z);
        group.add(smoke);
      }
    }
    return group;
  }

  // ── 간판 ──────────────────────────────────────
  function makeSign(text, w, h, wallColor, textColor, posY, faceZ) {
    const group = new THREE.Group();

    // 간판 배경
    const bg = new THREE.Mesh(
      new THREE.BoxGeometry(w, h, 0.06),
      getMat(wallColor, 0.6)
    );
    group.add(bg);

    // 간판 테두리 빛
    const glow = new THREE.Mesh(
      new THREE.BoxGeometry(w + 0.04, h + 0.04, 0.03),
      new THREE.MeshStandardMaterial({
        color: textColor,
        emissive: textColor,
        emissiveIntensity: 0.6,
        transparent: true,
        opacity: 0.5,
      })
    );
    group.add(glow);

    group.position.set(0, posY, faceZ + 0.04);
    return group;
  }

  // ── 문 ────────────────────────────────────────
  function makeDoor(w, h, faceZ, color = 0x3a2810) {
    const group = new THREE.Group();

    const door = new THREE.Mesh(
      new THREE.BoxGeometry(w, h, 0.06),
      getMat(color, 0.8)
    );
    door.position.set(0, h / 2, faceZ + 0.04);
    door.castShadow = true;
    group.add(door);

    // 문 손잡이
    const knob = new THREE.Mesh(
      new THREE.SphereGeometry(0.04, 6, 6),
      new THREE.MeshStandardMaterial({ color: 0xccaa44, roughness: 0.3, metalness: 0.7 })
    );
    knob.position.set(w * 0.35, h / 2, faceZ + 0.08);
    group.add(knob);

    // 문 위 아치
    const arch = new THREE.Mesh(
      new THREE.CylinderGeometry(w / 2, w / 2, 0.06, 12, 1, false, 0, Math.PI),
      getMat(color, 0.8)
    );
    arch.rotation.z = Math.PI / 2;
    arch.position.set(0, h, faceZ + 0.04);
    group.add(arch);

    return group;
  }

  // ── 계단 ──────────────────────────────────────
  function makeSteps(faceZ, w = 1.1) {
    const group = new THREE.Group();
    const mat   = getMat(0x3a3858, 0.88);
    [
      { s: 0.12, z: 0.22, y: 0.06 },
      { s: 0.10, z: 0.44, y: 0.16 },
    ].forEach(({ s, z, y }) => {
      const step = new THREE.Mesh(new THREE.BoxGeometry(w, s, 0.32), mat);
      step.position.set(0, y, faceZ + z);
      step.receiveShadow = true;
      group.add(step);
    });
    return group;
  }

  // ── 히트박스 등록 ────────────────────────────
  function registerHitBox(scene, group, data, bodyW, bodyH, bodyD, posX, posZ, rotY) {
    const hb = new THREE.Mesh(
      new THREE.BoxGeometry(bodyW + 0.7, bodyH + 1.0, bodyD + 0.7),
      new THREE.MeshBasicMaterial({ visible: false })
    );
    hb.position.set(posX, bodyH / 2, posZ);
    hb.rotation.y = rotY;
    hb.userData.buildingData = data;
    scene.add(hb);
    hitBoxes.push(hb);
    return hb;
  }

  // ══════════════════════════════════════════════
  // 건물 생성 메인 함수 (각 건물 파일에서 호출)
  // ══════════════════════════════════════════════
  function create(scene, config) {
    const {
      data,             // 건물 메타데이터 (id, name, pos 등)
      bodyW, bodyH, bodyD,  // 본체 크기
      wallColor,
      roofType,
      roofColor,
      roofHeight,
      floors,           // 층 수
      windowColor,
      windowCols,       // 층당 창문 수
      signColor,
      doorColor,
      chimneyPos,       // [{x, z}] or null
      extras,           // 추가 오브젝트 생성 콜백 (group) => void
    } = config;

    const [posX,, posZ] = data.pos;
    const rotY = Math.atan2(-posX, -posZ); // 광장 방향

    const group = new THREE.Group();

    // 1. 본체 벽
    const wall = new THREE.Mesh(
      new THREE.BoxGeometry(bodyW, bodyH, bodyD),
      getMat(wallColor, 0.85)
    );
    wall.position.y = bodyH / 2;
    wall.castShadow = true;
    wall.receiveShadow = true;
    group.add(wall);

    // 2. 지붕
    const roof = makeRoof({
      type: roofType, w: bodyW, d: bodyD,
      color: roofColor, height: roofHeight,
      baseY: bodyH,
    });
    group.add(roof);

    // 3. 창문 (층별)
    const floorH = bodyH / floors;
    for (let f = 0; f < floors; f++) {
      const winY = 0.55 + f * floorH + floorH * 0.35;
      addWindowRow(group, {
        count: windowCols,
        y: winY,
        faceZ: bodyD / 2,
        buildingW: bodyW,
        lightColor: windowColor,
        intensity: 0.8 + Math.random() * 0.3,
      });      
    }

    // 4. 간판 조명
    const sLight = new THREE.PointLight(signColor, 0.65, 3.5);
    sLight.position.set(0, bodyH * 0.7, bodyD / 2 + 0.6);
    group.add(sLight);

    // 5. 문
    group.add(makeDoor(0.55, 0.95, bodyD / 2, doorColor));

    // 6. 계단
    group.add(makeSteps(bodyD / 2));

    // 7. 굴뚝
    if (chimneyPos) {
      chimneyPos.forEach(cp => {
        group.add(makeChimney(cp.x, bodyH + roofHeight * 0.3, cp.z, 0x666680));
      });
    }

    // 8. 추가 오브젝트 (건물별 개성)
    if (extras) extras(group, { bodyW, bodyH, bodyD, signColor });

    // 9. 위치 & 방향
    group.position.set(posX, 0, posZ);
    group.rotation.y = rotY;
    scene.add(group);

    // 10. 히트박스 등록
    const hb = registerHitBox(scene, group, data, bodyW, bodyH, bodyD, posX, posZ, rotY);

    // 레지스트리 등록
    registry.push({ group, hitBox: hb, data, signLight: sLight });

    return group;
  }

  // ── 창문 깜빡임 업데이트 ─────────────────────
  function update(t) {
    allWindowLights.forEach((wl, i) => {
      wl.mat.emissiveIntensity = wl.base + Math.sin(t * (1.8 + i * 0.25) + i * 1.3) * 0.13;
    });
  }

  // ── 공개 API ──────────────────────────────────
  function init(scene) {
    _scene = scene;
  }

  return {
    init,
    create,
    update,
    getHitBoxes:  () => hitBoxes,
    getRegistry:  () => registry,
  };

})();
