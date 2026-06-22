/* ═══════════════════════════════════════════════
   술마을 — Controls
   마우스 드래그 / 스크롤 줌 / 터치 드래그 / 핀치 줌
   ═══════════════════════════════════════════════ */

const SoolControls = (() => {

  // ── 카메라 상태 ───────────────────────────────
  const state = {
    theta:  0,       // 수평 회전각
    phi:    0.52,    // 수직 각도
    radius: 22,      // 카메라 거리 (맵 확장)
    // 목표값 (lerp 대상)
    tTheta:  0,
    tPhi:    0.52,
    tRadius: 22,
    // 제한
    phiMin:    0.08,
    phiMax:    1.15,
    radiusMin: 8,
    radiusMax: 36,   // 맵 확장으로 최대 줌아웃 늘림
    // 자동 회전
    autoRotate:      true,
    autoRotateSpeed: 0.0008,
    autoRotatePaused: false,
    autoResume:      null, // setTimeout 핸들
  };

  // ── 드래그 상태 ──────────────────────────────
  const drag = {
    active: false,
    prevX:  0,
    prevY:  0,
    startX: 0,
    startY: 0,
    moved:  false,   // 클릭 vs 드래그 판별
  };

  // ── 터치 상태 ─────────────────────────────────
  const touch = {
    points:    {},   // identifier → {x, y}
    pinchDist: null,
    tapStart:  null,
  };

  let _camera   = null;
  let _canvas   = null;
  let _onTap    = null; // 탭/클릭 콜백 (clientX, clientY)

  // ── 자동 회전 일시정지 & 재개 ────────────────
  function pauseAutoRotate(resumeMs = 3000) {
    state.autoRotatePaused = true;
    if (state.autoResume) clearTimeout(state.autoResume);
    state.autoResume = setTimeout(() => {
      state.autoRotatePaused = false;
    }, resumeMs);
  }

  // ── 반경 클램프 ──────────────────────────────
  function clampState() {
    state.tPhi    = Math.max(state.phiMin,    Math.min(state.phiMax,    state.tPhi));
    state.tRadius = Math.max(state.radiusMin, Math.min(state.radiusMax, state.tRadius));
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
    pauseAutoRotate();
  }

  function onMouseMove(e) {
    if (!drag.active) return;
    const dx = e.clientX - drag.prevX;
    const dy = e.clientY - drag.prevY;

    if (Math.abs(e.clientX - drag.startX) > 4 ||
        Math.abs(e.clientY - drag.startY) > 4) {
      drag.moved = true;
    }

    state.tTheta -= dx * 0.007;
    state.tPhi   -= dy * 0.004;
    clampState();

    drag.prevX = e.clientX;
    drag.prevY = e.clientY;
  }

  function onMouseUp(e) {
    if (!drag.active) return;
    drag.active = false;
    _canvas.style.cursor = 'grab';

    // 클릭 (드래그 아닌 경우)
    if (!drag.moved && _onTap) {
      _onTap(e.clientX, e.clientY);
    }
  }

  function onWheel(e) {
    e.preventDefault();
    const delta = e.deltaMode === 1 ? e.deltaY * 20 : e.deltaY;
    state.tRadius += delta * 0.012;
    clampState();
    pauseAutoRotate(2000);
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
      touch.tapStart  = null; // 핀치 시작되면 탭 취소
    }

    pauseAutoRotate();
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

        state.tTheta -= dx * 0.006;
        state.tPhi   -= dy * 0.003;
        clampState();
      }
      touch.points[t.identifier] = { x: t.clientX, y: t.clientY };

    } else if (e.touches.length === 2) {
      // 핀치 줌
      const [a, b] = [e.touches[0], e.touches[1]];
      const dist   = Math.hypot(b.clientX - a.clientX, b.clientY - a.clientY);
      if (touch.pinchDist !== null) {
        const delta = touch.pinchDist - dist;
        state.tRadius += delta * 0.04;
        clampState();
      }
      touch.pinchDist = dist;
      // 두 손가락 이동으로 수평 Pan
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

      // 탭 판별 (짧은 탭 = 건물 선택)
      if (touch.tapStart && !drag.moved) {
        const ts  = touch.tapStart;
        const ct  = e.changedTouches[0];
        const dx  = Math.abs(ct.clientX - ts.x);
        const dy  = Math.abs(ct.clientY - ts.y);
        const dt  = Date.now() - ts.t;

        if (dx < 12 && dy < 12 && dt < 400 && _onTap) {
          _onTap(ct.clientX, ct.clientY);
        }
      }
      touch.tapStart = null;
    }
  }

  // ══════════════════════════════════════════════
  // 키보드 컨트롤 (접근성 + 데스크탑 편의)
  // ══════════════════════════════════════════════
  function onKeyDown(e) {
    const ROT  = 0.06;
    const ZOOM = 1.2;
    switch (e.key) {
      case 'ArrowLeft':  state.tTheta -= ROT; pauseAutoRotate(); break;
      case 'ArrowRight': state.tTheta += ROT; pauseAutoRotate(); break;
      case 'ArrowUp':    state.tPhi   -= ROT * 0.5; clampState(); break;
      case 'ArrowDown':  state.tPhi   += ROT * 0.5; clampState(); break;
      case '+': case '=': state.tRadius -= ZOOM; clampState(); break;
      case '-': case '_': state.tRadius += ZOOM; clampState(); break;
      case 'r': case 'R':
        // 시점 리셋
        state.tTheta  = 0;
        state.tPhi    = 0.52;
        state.tRadius = 22;
        pauseAutoRotate(500);
        break;
      case ' ':
        // 자동 회전 토글
        state.autoRotate = !state.autoRotate;
        e.preventDefault();
        break;
    }
  }

  // ══════════════════════════════════════════════
  // 카메라 업데이트 (매 프레임 호출)
  // ══════════════════════════════════════════════
  function update() {
    // 자동 회전
    if (state.autoRotate && !state.autoRotatePaused && !drag.active) {
      state.tTheta += state.autoRotateSpeed;
    }

    // Lerp (부드러운 이동)
    const LERP = 0.065;
    state.theta  += (state.tTheta  - state.theta)  * LERP;
    state.phi    += (state.tPhi    - state.phi)    * LERP;
    state.radius += (state.tRadius - state.radius) * LERP;

    // 카메라 위치 갱신
    _camera.position.x = state.radius * Math.sin(state.theta) * Math.cos(state.phi);
    _camera.position.y = state.radius * Math.sin(state.phi) + 1.5;
    _camera.position.z = state.radius * Math.cos(state.theta) * Math.cos(state.phi);
    _camera.lookAt(0, 1.5, 0);
  }

  // ── 현재 theta 반환 (나침반용) ───────────────
  function getTheta() { return state.theta; }

  // ── 드래그 중 여부 (레이캐스트 제어용) ───────
  function isDragging() { return drag.active && drag.moved; }

  // ══════════════════════════════════════════════
  // 초기화
  // ══════════════════════════════════════════════
  function init(camera, canvas, onTapCallback) {
    _camera = camera;
    _canvas = canvas;
    _onTap  = onTapCallback;

    canvas.style.cursor = 'grab';

    // 마우스
    canvas.addEventListener('mousedown',  onMouseDown);
    window.addEventListener('mousemove',  onMouseMove);
    window.addEventListener('mouseup',    onMouseUp);
    canvas.addEventListener('wheel',      onWheel, { passive: false });

    // 터치
    canvas.addEventListener('touchstart', onTouchStart, { passive: false });
    canvas.addEventListener('touchmove',  onTouchMove,  { passive: false });
    canvas.addEventListener('touchend',   onTouchEnd,   { passive: false });

    // 키보드
    window.addEventListener('keydown', onKeyDown);
  }

  // ── 정리 ──────────────────────────────────────
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
    if (state.autoResume) clearTimeout(state.autoResume);
  }

  return { init, update, getTheta, isDragging, dispose };

})();
