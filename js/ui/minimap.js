/* ═══════════════════════════════════════════════
   술마을 — Minimap & Compass UI
   ═══════════════════════════════════════════════ */

const SoolMinimap = (() => {

  let _canvas  = null;
  let _ctx     = null;
  let _compass = null;
  let _registry = null;

  // 미니맵 설정
  const MAP = {
    size:   120,       // canvas px
    worldR: 18,        // 월드 좌표 범위 (±18)
    padX:   10,
    padY:   10,
  };

  // 월드 좌표 → 미니맵 픽셀 좌표
  function toMap(wx, wz) {
    const cx = MAP.size / 2;
    const cy = MAP.size / 2;
    const scale = (MAP.size / 2 - MAP.padX) / MAP.worldR;
    return {
      x: cx + wx * scale,
      y: cy + wz * scale,
    };
  }

  // ── 미니맵 그리기 ────────────────────────────
  function draw(cameraTheta) {
    if (!_ctx) return;
    const ctx  = _ctx;
    const size = MAP.size;

    // 배경
    ctx.clearRect(0, 0, size, size);
    ctx.fillStyle = 'rgba(8,6,24,0.82)';
    ctx.fillRect(0, 0, size, size);

    // 외곽 원형 클립
    ctx.save();
    ctx.beginPath();
    ctx.arc(size / 2, size / 2, size / 2 - 1, 0, Math.PI * 2);
    ctx.clip();

    // 도로 (가로/세로 십자)
    ctx.strokeStyle = 'rgba(60,55,100,0.7)';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(0, size / 2); ctx.lineTo(size, size / 2);
    ctx.moveTo(size / 2, 0); ctx.lineTo(size / 2, size);
    ctx.stroke();

    // 중앙 광장
    const ctr = toMap(0, 0);
    ctx.fillStyle = 'rgba(60,50,120,0.55)';
    ctx.beginPath();
    ctx.arc(ctr.x, ctr.y, 5, 0, Math.PI * 2);
    ctx.fill();

    // 건물 점들
    if (_registry) {
      _registry.forEach(entry => {
        const d  = entry.data;
        const mp = toMap(d.pos[0], d.pos[2]);

        // 건물 아이콘 (컬러 원)
        ctx.fillStyle = getBuildingColor(d.id);
        ctx.beginPath();
        ctx.arc(mp.x, mp.y, 4, 0, Math.PI * 2);
        ctx.fill();

        // 반짝이는 테두리
        ctx.strokeStyle = 'rgba(255,255,255,0.35)';
        ctx.lineWidth = 0.8;
        ctx.stroke();
      });
    }

    // 카메라 방향 표시 (삼각형)
    const camAngle = -cameraTheta - Math.PI / 2;
    const camR = size / 2 - 8;
    const camX = size / 2 + Math.cos(camAngle) * camR;
    const camY = size / 2 + Math.sin(camAngle) * camR;

    ctx.fillStyle = 'rgba(180,150,255,0.7)';
    ctx.beginPath();
    ctx.arc(camX, camY, 3, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();

    // 테두리
    ctx.strokeStyle = 'rgba(180,150,255,0.2)';
    ctx.lineWidth   = 1;
    ctx.beginPath();
    ctx.arc(size / 2, size / 2, size / 2 - 1, 0, Math.PI * 2);
    ctx.stroke();
  }

  // ── 건물 ID → 컬러 매핑 ─────────────────────
  function getBuildingColor(id) {
    const colors = {
      bar:          '#FF6644',
      library:      '#4488FF',
      community:    '#9966FF',
      shop:         '#44CC66',
      brewery:      '#FFAA22',
      studio:       '#FF44AA',
      infoCenter:   '#FFCC44',
      popupSquare:  '#FF8833',
      myspace:      '#FFAA66',
      cafe:         '#44FFAA',
      restaurant:   '#FF5544',
    };
    return colors[id] || '#ffffff';
  }

  // ── 나침반 업데이트 ──────────────────────────
  function updateCompass(cameraTheta) {
    if (!_compass) return;
    // 카메라가 돌아가는 반대 방향으로 N 표시
    const deg = (cameraTheta * 180 / Math.PI) % 360;
    _compass.style.transform = `rotate(${-deg}deg)`;
  }

  // ── 매 프레임 업데이트 ───────────────────────
  function update(cameraTheta) {
    draw(cameraTheta);
    updateCompass(cameraTheta);
  }

  // ── 초기화 ───────────────────────────────────
  function init(registry) {
    _registry = registry;
    _canvas   = document.getElementById('minimap-canvas');
    _compass  = document.getElementById('compass-needle');

    if (_canvas) {
      // 레티나 대응
      const dpr = Math.min(window.devicePixelRatio, 2);
      _canvas.width  = MAP.size * dpr;
      _canvas.height = MAP.size * dpr;
      _canvas.style.width  = MAP.size + 'px';
      _canvas.style.height = MAP.size + 'px';
      _ctx = _canvas.getContext('2d');
      _ctx.scale(dpr, dpr);
    }
  }

  return { init, update, getBuildingColor };

})();
