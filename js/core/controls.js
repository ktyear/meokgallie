/* ═══════════════════════════════════════════════
   술마을 — Controls (쿼터뷰)
   고정 45도 각도 / 맵 패닝 / 줌 / 90도 회전
   ═══════════════════════════════════════════════ */

const SoolControls = (() => {

  // ── 쿼터뷰 카메라 상태 ────────────────────────
  // theta: 0 / 90 / 180 / 270도 중 하나 (90도씩 회전)
  // phi: 고정 (쿼터뷰 특성상 수직각 고정)
  // pan: 맵 이동 (x, z)
  const state = {
    theta:    Math.PI * 0.25,  // 초기 각도 (45도 — 남동쪽에서 보기)
    tTheta:   Math.PI * 0.25,
    phi:      0.32,            // 쿼터뷰 수직각 고정 (약 41도)
    radius:   20,              // 카메라 거리 (줌인)
    tRadius:  20,
    radiusMin: 10,
    radiusMax: 44,
    // 맵 패닝 (카메라 중심점 이동)
    panX: 0, panZ: 0,
    tPanX: 0, tPanZ: 0,
    panLimit: 16,              // 맵 이동 한계 (섬 크기)
    // 회전 애니메이션
    rotating: false,
    // 자동 회전 없음 (쿼터뷰에서는 불필요)
    autoRotate: false,
  };

  // ── 드래그 상태 ──────────────────────────────
  const drag = {
    active: false,
    prevX:  0,
    prevY:  0,
    startX: 0,
    startY: 0,
    moved:  false,
  };

  // ── 터치 상태 ─────────────────────────────────
  const touch = {
    points:    {},
    pinchDist: null,
    tapStart:  null,
  };

  let _camera = null;
  let _canvas = null;
  let _onTap  = null;

  // ── 패닝 클램프 ──────────────────────────────
  function clampPan() {
    const L = state.panLimit;
    state.tPanX = Math.max(-L, Math.min(L, state.tPanX));
    state.tPanZ = Math.max(-L, Math.min(L, state.tPanZ));
  }

  // ── 드래그 → 월드 패닝 변환 ─────────────────
  // 드래그한 방향으로 맵이 따라오는 직관적인 방식
  function applyPan(dx, dy) {
    const speed = 0.028 * (state.radius / 20); // 줌 레벨에 비례
    const cos   = Math.cos(state.theta);
    const sin   = Math.sin(state.theta);
    // 화면 x 드래그 → 카메라 좌우 이동
    // 화면 y 드래그 → 카메라 전후 이동 (쿼터뷰 각도 보정)
    state.tPanX -= (dx * cos + dy * sin * 0.6) * speed;
    state.tPanZ -= (-dx * sin + dy * cos * 0.6) * speed;
    clampPan();
  }

  // ── 90도씩 회전 ──────────────────────────────
  function rotateQuarter(dir) {
    state.tTheta += dir * Math.PI * 0.5;
  }

  // ══════════════════════════════════════════════
  // 마우스 이벤트
  // ══════════════════════════════════════════════
  function onMouseDown(e) {
    drag.active = true;
    drag.prevX  = e.clientX;
    drag.prevY  = e.clientY;
    drag.startX = e.clientX;
    drag.startY = e.clientY;
    drag.moved  = false;
    _canvas.style.cursor = 'grabbing';
  }

  function onMouseMove(e) {
    if (!drag.active) return;
    const dx = e.clientX - drag.prevX;
    const dy = e.clientY - drag.prevY;

    if (Math.abs(e.clientX - drag.startX) > 4 ||
        Math.abs(e.clientY - drag.startY) > 4) {
      drag.moved = true;
    }

    applyPan(dx, dy);
    drag.prevX = e.clientX;
    drag.prevY = e.clientY;
  }

  function onMouseUp(e) {
    if (!drag.active) return;
    drag.active = false;
    _canvas.style.cursor = 'grab';
    if (!drag.moved && _onTap) {
      _onTap(e.clientX, e.clientY);
    }
  }

  function onWheel(e) {
    e.preventDefault();
    const delta = e.deltaMode === 1 ? e.deltaY * 20 : e.deltaY;
    state.tRadius += delta * 0.015;
    state.tRadius = Math.max(state.radiusMin, Math.min(state.radiusMax, state.tRadius));
  }

  // ══════════════════════════════════════════════
  // 터치 이벤트
  // ══════════════════════════════════════════════
  function onTouchStart(e) {
    e.preventDefault();
    Array.from(e.changedTouches).forEach(t => {
      touch.points[t.identifier] = { x: t.clientX, y: t.clientY };
    });
    if (e.touches.length === 1) {
      drag.active = true;
      drag.startX = e.touches[0].clientX;
      drag.startY = e.touches[0].clientY;
      drag.moved  = false;
      touch.tapStart = { x: e.touches[0].clientX, y: e.touches[0].clientY, t: Date.now() };
    }
    if (e.touches.length === 2) {
      const [a, b] = [e.touches[0], e.touches[1]];
      touch.pinchDist = Math.hypot(b.clientX - a.clientX, b.clientY - a.clientY);
      touch.tapStart  = null;
    }
  }

  function onTouchMove(e) {
    e.preventDefault();
    if (e.touches.length === 1) {
      const t    = e.touches[0];
      const prev = touch.points[t.identifier];
      if (prev) {
        const dx = t.clientX - prev.x;
        const dy = t.clientY - prev.y;
        if (Math.abs(t.clientX - drag.startX) > 8 ||
            Math.abs(t.clientY - drag.startY) > 8) {
          drag.moved = true;
        }
        applyPan(dx, dy);
      }
      touch.points[t.identifier] = { x: t.clientX, y: t.clientY };
    } else if (e.touches.length === 2) {
      const [a, b] = [e.touches[0], e.touches[1]];
      const dist   = Math.hypot(b.clientX - a.clientX, b.clientY - a.clientY);
      if (touch.pinchDist !== null) {
        const delta = touch.pinchDist - dist;
        state.tRadius += delta * 0.05;
        state.tRadius = Math.max(state.radiusMin, Math.min(state.radiusMax, state.tRadius));
      }
      touch.pinchDist = dist;
      Array.from(e.touches).forEach(t => {
        touch.points[t.identifier] = { x: t.clientX, y: t.clientY };
      });
    }
  }

  function onTouchEnd(e) {
    e.preventDefault();
    Array.from(e.changedTouches).forEach(t => delete touch.points[t.identifier]);
    if (e.touches.length === 0) {
      drag.active     = false;
      touch.pinchDist = null;
      if (touch.tapStart && !drag.moved) {
        const ts = touch.tapStart;
        const ct = e.changedTouches[0];
        const dx = Math.abs(ct.clientX - ts.x);
        const dy = Math.abs(ct.clientY - ts.y);
        const dt = Date.now() - ts.t;
        if (dx < 12 && dy < 12 && dt < 400 && _onTap) {
          _onTap(ct.clientX, ct.clientY);
        }
      }
      touch.tapStart = null;
    }
  }

  // ══════════════════════════════════════════════
  // 키보드 컨트롤
  // ══════════════════════════════════════════════
  function onKeyDown(e) {
    const PAN  = 1.5;
    const ZOOM = 2.0;
    switch (e.key) {
      case 'ArrowLeft':  applyPan(-30, 0);  break;
      case 'ArrowRight': applyPan( 30, 0);  break;
      case 'ArrowUp':    applyPan(0, -30);  break;
      case 'ArrowDown':  applyPan(0,  30);  break;
      case '+': case '=':
        state.tRadius -= ZOOM;
        state.tRadius = Math.max(state.radiusMin, state.tRadius);
        break;
      case '-': case '_':
        state.tRadius += ZOOM;
        state.tRadius = Math.min(state.radiusMax, state.tRadius);
        break;
      case 'q': case 'Q':
        rotateQuarter(-1); break;  // Q: 왼쪽 90도 회전
      case 'e': case 'E':
        rotateQuarter( 1); break;  // E: 오른쪽 90도 회전
      case 'r': case 'R':
        // 시점 리셋
        state.tTheta = Math.PI * 0.25;
        state.tRadius = 28;
        state.tPanX = 0;
        state.tPanZ = 0;
        break;
    }
  }

  // ══════════════════════════════════════════════
  // 카메라 업데이트 (매 프레임)
  // ══════════════════════════════════════════════
  function update() {
    const LERP = 0.07;

    // 각도 Lerp (부드러운 90도 회전)
    state.theta  += (state.tTheta  - state.theta)  * LERP;
    // 반경 Lerp
    state.radius += (state.tRadius - state.radius) * LERP;
    // 패닝 Lerp
    state.panX   += (state.tPanX   - state.panX)   * LERP;
    state.panZ   += (state.tPanZ   - state.panZ)   * LERP;

    // 카메라 위치 — 쿼터뷰 고정 수직각
    const r   = state.radius;
    const ph  = state.phi;
    const th  = state.theta;
    _camera.position.x = state.panX + r * Math.sin(th) * Math.cos(ph);
    _camera.position.y = r * Math.sin(ph) + 1.5;
    _camera.position.z = state.panZ + r * Math.cos(th) * Math.cos(ph);
    _camera.lookAt(state.panX, 1.5, state.panZ);
  }

  // ── 건물 위치로 카메라 이동 ─────────────────
  function moveTo(worldX, worldZ) {
    state.tPanX = worldX;
    state.tPanZ = worldZ;
    state.tRadius = Math.min(state.tRadius, 18);
  }

  // ── getTheta (나침반용) ───────────────────────
  function getTheta() { return state.theta; }

  // ── isDragging ────────────────────────────────
  function isDragging() { return drag.active && drag.moved; }

  // ══════════════════════════════════════════════
  // 초기화
  // ══════════════════════════════════════════════
  function init(camera, canvas, onTapCallback) {
    _camera = camera;
    _canvas = canvas;
    _onTap  = onTapCallback;

    canvas.style.cursor = 'grab';

    canvas.addEventListener('mousedown',  onMouseDown);
    window.addEventListener('mousemove',  onMouseMove);
    window.addEventListener('mouseup',    onMouseUp);
    canvas.addEventListener('wheel',      onWheel, { passive: false });
    canvas.addEventListener('touchstart', onTouchStart, { passive: false });
    canvas.addEventListener('touchmove',  onTouchMove,  { passive: false });
    canvas.addEventListener('touchend',   onTouchEnd,   { passive: false });
    window.addEventListener('keydown',    onKeyDown);
  }

  function dispose() {
    if (!_canvas) return;
    _canvas.removeEventListener('mousedown',  onMouseDown);
    window.removeEventListener('mousemove',   onMouseMove);
    window.removeEventListener('mouseup',     onMouseUp);
    _canvas.removeEventListener('wheel',      onWheel);
    _canvas.removeEventListener('touchstart', onTouchStart);
    _canvas.removeEventListener('touchmove',  onTouchMove);
    _canvas.removeEventListener('touchend',   onTouchEnd);
    window.removeEventListener('keydown',     onKeyDown);
  }

  // rotateQuarter 외부 노출 (UI 버튼용)
  return { init, update, getTheta, isDragging, dispose, rotateQuarter, moveTo };

})();

