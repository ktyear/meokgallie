/* ═══════════════════════════════════════════════
   술마을 — Popup UI
   건물 정보 팝업 · 레이캐스트 연동
   ═══════════════════════════════════════════════ */

const SoolPopup = (() => {

  let _renderer = null;
  let _camera   = null;
  let _hitBoxes = null;

  const raycaster = new THREE.Raycaster();
  const mouse2D   = new THREE.Vector2();

  // DOM 요소
  let elPopup  = null;
  let elEmoji  = null;
  let elName   = null;
  let elSub    = null;
  let elDesc   = null;
  let elTags   = null;
  let elEnter  = null;
  let elClose  = null;

  let currentBuilding = null;
  let isLocked        = false; // 클릭으로 고정된 상태

  // ── 팝업 위치 계산 (화면 밖 방지) ───────────
  function calcPos(cx, cy) {
    const PW = 290, PH = 220;
    let x = cx + 18, y = cy + 18;
    if (x + PW > window.innerWidth)  x = cx - PW - 18;
    if (y + PH > window.innerHeight) y = cy - PH - 18;
    return {
      x: Math.max(8, Math.min(x, window.innerWidth  - PW - 8)),
      y: Math.max(8, Math.min(y, window.innerHeight - PH - 8)),
    };
  }

  // ── 팝업 내용 채우기 ──────────────────────────
  function fillPopup(data) {
    elEmoji.textContent = data.emoji;
    elName.textContent  = data.name;
    elSub.textContent   = data.sub;
    elDesc.textContent  = data.desc;

    // 태그
    elTags.innerHTML = '';
    (data.tags || []).forEach(tag => {
      const span = document.createElement('span');
      span.className   = 'popup-tag';
      span.textContent = tag;
      elTags.appendChild(span);
    });

    // 입장 버튼 URL
    elEnter.onclick = () => {
      if (data.url) window.location.href = data.url;
    };
  }

  // ── 팝업 표시 ─────────────────────────────────
  function show(data, cx, cy) {
    fillPopup(data);
    const { x, y } = calcPos(cx, cy);
    elPopup.style.left = x + 'px';
    elPopup.style.top  = y + 'px';
    elPopup.classList.add('visible');
    currentBuilding = data;
  }

  // ── 팝업 숨김 ─────────────────────────────────
  function hide() {
    if (isLocked) return;
    elPopup.classList.remove('visible');
    currentBuilding = null;
  }

  // ── 팝업 고정 (클릭) ──────────────────────────
  function lock(data, cx, cy) {
    isLocked = true;
    show(data, cx, cy);
  }

  // ── 팝업 잠금 해제 ────────────────────────────
  function unlock() {
    isLocked = false;
    elPopup.classList.remove('visible');
    currentBuilding = null;
  }

  // ── 레이캐스트 ────────────────────────────────
  function cast(clientX, clientY) {
    mouse2D.x =  (clientX / window.innerWidth)  * 2 - 1;
    mouse2D.y = -(clientY / window.innerHeight) * 2 + 1;
    raycaster.setFromCamera(mouse2D, _camera);
    const hits = raycaster.intersectObjects(_hitBoxes);
    return hits.length > 0 ? hits[0].object.userData.buildingData : null;
  }

  // ── 마우스 hover 처리 ────────────────────────
  function onMouseMove(e) {
    if (isLocked) return;
    // isDragging 체크는 controls에서 처리
    const data = cast(e.clientX, e.clientY);
    if (data) {
      show(data, e.clientX, e.clientY);
      _renderer.domElement.style.cursor = 'pointer';
    } else {
      hide();
      _renderer.domElement.style.cursor = 'grab';
    }
  }

  // ── 탭/클릭 처리 ─────────────────────────────
  function onTap(clientX, clientY) {
    const data = cast(clientX, clientY);
    if (data) {
      if (isLocked && currentBuilding === data) {
        // 같은 건물 다시 탭 → 잠금 해제
        unlock();
      } else {
        lock(data, clientX, clientY);
      }
    } else {
      unlock();
    }
  }

  // ── 초기화 ────────────────────────────────────
  function init(renderer, camera, hitBoxes) {
    _renderer = renderer;
    _camera   = camera;
    _hitBoxes = hitBoxes;

    elPopup = document.getElementById('popup');
    elEmoji = document.getElementById('popup-emoji');
    elName  = document.getElementById('popup-name');
    elSub   = document.getElementById('popup-sub');
    elDesc  = document.getElementById('popup-desc');
    elTags  = document.getElementById('popup-tags');
    elEnter = document.getElementById('popup-enter');
    elClose = document.getElementById('popup-close');

    // 닫기 버튼
    elClose.addEventListener('click', e => {
      e.stopPropagation();
      unlock();
    });

    // 마우스 hover
    renderer.domElement.addEventListener('mousemove', onMouseMove);
  }

  return { init, onTap, hide, unlock, cast };

})();
