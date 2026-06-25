/* ═══════════════════════════════════════════════
   술마을 — Sky System (v1.4.4)
   로컬 시간 3단계 + Open-Meteo 실시간 날씨 연동
   섬 배경 분위기로 색상 전면 업데이트
   API 키 불필요 / 무제한 무료 (비상업적 용도)
   ═══════════════════════════════════════════════ */

const SoolSky = (() => {

  // ── 외부 참조 ─────────────────────────────────
  let _scene    = null;
  let _renderer = null;
  let _env      = null; // SoolEnvironment 참조

  // ── 현재 상태 ─────────────────────────────────
  const state = {
    timeSlot:    'night',  // 'day' | 'sunset' | 'night'
    weather:     'clear',  // 'clear' | 'cloudy' | 'rain'
    temperature: null,
    city:        null,
    lat:         37.5665,  // 기본값: 서울
    lon:         126.9780,
    lastFetch:   0,
    FETCH_INTERVAL: 5 * 60 * 1000, // 5분
  };

  // ── 씬 오브젝트 참조 (main에서 주입) ──────────
  let _moonLight  = null; // DirectionalLight (달빛)
  let _ambient    = null; // AmbientLight
  let _hemi       = null; // HemisphereLight
  let _fogRef     = null; // scene.fog
  let _starPoints = null; // 별 파티클
  let _fireflies  = null; // 반딧불이 파티클

  // 동적 생성 오브젝트
  let _rainParticles  = null;
  let _cloudParticles = null;
  let _sunLight       = null;

  // ── 시간대별 설정값 ───────────────────────────
  // ── 섬 배경 시간대별 설정값 ──────────────────
  // 낮: 맑고 투명한 열대 섬 하늘 + 바다 반사
  // 노을: 수평선 너머로 지는 석양, 바다가 붉게 물드는 느낌
  // 밤: 별 가득한 남태평양 밤바다 느낌
  const TIME_CONFIGS = {
    day: {
      bgColor:      0x5BA8D4,  // 열대 섬 하늘 — 진한 하늘색
      fogColor:     0x88CCE8,  // 바다 수평선 안개 — 밝은 청색
      fogDensity:   0.016,     // 낮에는 안개 옅게 — 섬 전체 시야 확보
      ambientColor: 0xFFEEDD,  // 따뜻한 햇살
      ambientInt:   1.3,
      hemiSky:      0x88CCEE,  // 하늘빛 파랑
      hemiGround:   0x4A8A44,  // 잔디·모래 반사 녹색
      hemiInt:      0.65,
      moonInt:      0.0,       // 달빛 OFF
      sunInt:       1.3,       // 태양 ON (밝게)
      sunColor:     0xFFEE88,  // 따뜻한 노란 햇살
      stars:        false,
      fireflies:    false,
    },
    sunset: {
      bgColor:      0x8A5A3A,  // 50% 다운 — 어둑한 황혼
      fogColor:     0x6A4028,  // 안개 어둡게
      fogDensity:   0.014,     // 안개 더 옅게
      ambientColor: 0xCC7733,  // 환경광 절반으로
      ambientInt:   0.45,
      hemiSky:      0x8A4A22,  // 하늘 많이 어둡게
      hemiGround:   0x1A0C00,
      hemiInt:      0.22,
      moonInt:      0.25,      // 달빛 조금 더
      sunInt:       0.18,      // 태양 많이 줄임
      sunColor:     0xDD6611,
      stars:        true,
      fireflies:    true,
    },
    night: {
      bgColor:      0x060e1a,  // 섬 밤하늘 — 짙은 네이비 (scene.js와 통일)
      fogColor:     0x0a1e2e,  // 바다 안개 — 청남색
      fogDensity:   0.022,     // 섬 전체 보이도록 기존보다 옅게
      ambientColor: 0x0e1a30,  // 바다 반사 청록 환경광
      ambientInt:   0.8,
      hemiSky:      0x0e1a40,  // 밤하늘 청색
      hemiGround:   0x0a1e2e,  // 바다 반사
      hemiInt:      0.35,
      moonInt:      0.5,       // 달빛 ON (바다 위 달빛 — 약간 밝게)
      sunInt:       0.0,       // 태양 OFF
      sunColor:     0xFFDD99,
      stars:        true,
      fireflies:    true,
    },
  };

  // ── 섬 날씨별 추가 설정값 ────────────────────
  // 섬이라 흐림·비 시에 안개가 바다 위를 덮는 효과
  const WEATHER_CONFIGS = {
    clear: {
      fogMult:    1.0,   // 안개 밀도 배수
      bgDarken:   0,     // 배경색 어둡게 (0~1)
      rainOn:     false,
      cloudOn:    false,
    },
    cloudy: {
      fogMult:    2.0,   // 섬 바다 위 구름 안개 — 더 짙게
      bgDarken:   0.3,
      rainOn:     false,
      cloudOn:    true,
    },
    rain: {
      fogMult:    3.2,   // 비 오는 바다 — 수평선이 안 보일 정도
      bgDarken:   0.55,
      rainOn:     true,
      cloudOn:    true,
    },
  };

  // ── Open-Meteo 날씨 코드 → 내부 상태 매핑 ────
  // https://open-meteo.com/en/docs#weathervariables
  function parseWeatherCode(code) {
    if (code === 0 || code === 1)           return 'clear';  // 맑음
    if (code >= 2 && code <= 3)             return 'cloudy'; // 흐림
    if (code >= 45 && code <= 48)           return 'cloudy'; // 안개
    if (code >= 51 && code <= 67)           return 'rain';   // 이슬비·비
    if (code >= 71 && code <= 77)           return 'cloudy'; // 눈 (흐림으로 처리)
    if (code >= 80 && code <= 82)           return 'rain';   // 소나기
    if (code >= 85 && code <= 86)           return 'cloudy'; // 눈 소나기
    if (code >= 95 && code <= 99)           return 'rain';   // 뇌우
    return 'clear';
  }

  // ── 현재 시간 → 시간대 ────────────────────────
  function getTimeSlot() {
    const h = new Date().getHours();
    if (h >= 6 && h < 18)  return 'day';
    if (h >= 18 && h < 21) return 'sunset';
    return 'night';
  }

  // ── IP 기반 위치 감지 ─────────────────────────
  async function fetchLocation() {
    try {
      const res  = await fetch('https://ipapi.co/json/');
      const data = await res.json();
      if (data.latitude && data.longitude) {
        state.lat  = data.latitude;
        state.lon  = data.longitude;
        state.city = data.city || '알 수 없음';
        console.log(`[SoolSky] 위치 감지: ${state.city} (${state.lat}, ${state.lon})`);
      }
    } catch (e) {
      console.warn('[SoolSky] 위치 감지 실패, 서울 기본값 사용:', e.message);
    }
  }

  // ── Open-Meteo 날씨 호출 ─────────────────────
  async function fetchWeather() {
    try {
      const url = `https://api.open-meteo.com/v1/forecast` +
        `?latitude=${state.lat}&longitude=${state.lon}` +
        `&current=weathercode,temperature_2m` +
        `&timezone=auto`;

      const res  = await fetch(url);
      const data = await res.json();

      if (data.current) {
        const code       = data.current.weathercode;
        state.weather     = parseWeatherCode(code);
        state.temperature = Math.round(data.current.temperature_2m);
        console.log(`[SoolSky] 날씨: ${state.weather} (코드 ${code}), 기온: ${state.temperature}°C`);
      }
    } catch (e) {
      console.warn('[SoolSky] 날씨 호출 실패, 기존 상태 유지:', e.message);
    }
  }

  // ── 색상 보간 헬퍼 ────────────────────────────
  function lerpColor(a, b, t) {
    const ar = (a >> 16) & 0xff, ag = (a >> 8) & 0xff, ab = a & 0xff;
    const br = (b >> 16) & 0xff, bg = (b >> 8) & 0xff, bb = b & 0xff;
    const r  = Math.round(ar + (br - ar) * t);
    const g  = Math.round(ag + (bg - ag) * t);
    const bv = Math.round(ab + (bb - ab) * t);
    return (r << 16) | (g << 8) | bv;
  }

  // ── 비 파티클 생성 ────────────────────────────
  function createRain() {
    if (_rainParticles) return;
    const COUNT = 600;
    const geo   = new THREE.BufferGeometry();
    const pos   = new Float32Array(COUNT * 3);
    for (let i = 0; i < COUNT; i++) {
      pos[i*3]   = (Math.random() - 0.5) * 40;
      pos[i*3+1] = Math.random() * 20;
      pos[i*3+2] = (Math.random() - 0.5) * 40;
    }
    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    const mat = new THREE.PointsMaterial({
      color: 0xaaccff, size: 0.06,
      sizeAttenuation: true, transparent: true, opacity: 0.45,
    });
    _rainParticles = new THREE.Points(geo, mat);
    _scene.add(_rainParticles);
  }

  function removeRain() {
    if (!_rainParticles) return;
    _scene.remove(_rainParticles);
    _rainParticles.geometry.dispose();
    _rainParticles.material.dispose();
    _rainParticles = null;
  }

  // ── 구름 파티클 생성 ──────────────────────────
  function createClouds() {
    if (_cloudParticles) return;
    const COUNT = 40;
    const geo   = new THREE.BufferGeometry();
    const pos   = new Float32Array(COUNT * 3);
    for (let i = 0; i < COUNT; i++) {
      pos[i*3]   = (Math.random() - 0.5) * 50;
      pos[i*3+1] = 10 + Math.random() * 6;
      pos[i*3+2] = (Math.random() - 0.5) * 50;
    }
    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    const mat = new THREE.PointsMaterial({
      color: 0xaaaaaa, size: 2.8,
      sizeAttenuation: true, transparent: true, opacity: 0.18,
    });
    _cloudParticles = new THREE.Points(geo, mat);
    _scene.add(_cloudParticles);
  }

  function removeClouds() {
    if (!_cloudParticles) return;
    _scene.remove(_cloudParticles);
    _cloudParticles.geometry.dispose();
    _cloudParticles.material.dispose();
    _cloudParticles = null;
  }

  // ── 태양 광원 생성 ────────────────────────────
  function ensureSunLight() {
    if (_sunLight) return;
    _sunLight = new THREE.DirectionalLight(0xFFDD99, 0);
    _sunLight.position.set(10, 20, 10);
    _scene.add(_sunLight);
  }

  // ── 씬 전체 업데이트 ─────────────────────────
  function applyToScene() {
    const tc = TIME_CONFIGS[state.timeSlot];
    const wc = WEATHER_CONFIGS[state.weather];

    // 배경색 (날씨에 따라 어둡게)
    const darken = wc.bgDarken;
    const bgR    = ((tc.bgColor >> 16) & 0xff) * (1 - darken);
    const bgG    = ((tc.bgColor >>  8) & 0xff) * (1 - darken);
    const bgB    = ( tc.bgColor        & 0xff) * (1 - darken);
    _scene.background = new THREE.Color(
      Math.round(bgR) / 255,
      Math.round(bgG) / 255,
      Math.round(bgB) / 255
    );

    // 안개
    if (_scene.fog) {
      _scene.fog.color.setHex(tc.fogColor);
      _scene.fog.density = tc.fogDensity * wc.fogMult;
    }

    // 주변광
    if (_ambient) {
      _ambient.color.setHex(tc.ambientColor);
      _ambient.intensity = tc.ambientInt;
    }

    // 반구광
    if (_hemi) {
      _hemi.color.setHex(tc.hemiSky);
      _hemi.groundColor.setHex(tc.hemiGround);
      _hemi.intensity = tc.hemiInt;
    }

    // 달빛
    if (_moonLight) {
      _moonLight.intensity = tc.moonInt;
    }

    // 태양
    ensureSunLight();
    _sunLight.color.setHex(tc.sunColor);
    _sunLight.intensity = tc.sunInt;

    // 별 파티클
    if (_starPoints) {
      _starPoints.visible = tc.stars;
    }

    // 반딧불이
    if (_fireflies) {
      _fireflies.visible = tc.fireflies && (state.weather !== 'rain');
    }

    // 비 파티클
    if (wc.rainOn) createRain();
    else           removeRain();

    // 구름 파티클
    if (wc.cloudOn) createClouds();
    else            removeClouds();

    console.log(`[SoolSky] 적용: ${state.timeSlot} + ${state.weather}`);
  }

  // ── 비 파티클 낙하 애니메이션 ────────────────
  function updateRain() {
    if (!_rainParticles) return;
    const pos = _rainParticles.geometry.attributes.position.array;
    for (let i = 0; i < pos.length; i += 3) {
      pos[i+1] -= 0.22;
      if (pos[i+1] < 0) {
        pos[i]   = (Math.random() - 0.5) * 40;
        pos[i+1] = 20;
        pos[i+2] = (Math.random() - 0.5) * 40;
      }
    }
    _rainParticles.geometry.attributes.position.needsUpdate = true;
  }

  // ── 구름 서서히 이동 ──────────────────────────
  function updateClouds(t) {
    if (!_cloudParticles) return;
    _cloudParticles.rotation.y = t * 0.004;
  }

  // ── 날씨 상태 표시 (UI 오버레이) ─────────────
  function updateWeatherUI() {
    let el = document.getElementById('sky-info');
    if (!el) {
      el = document.createElement('div');
      el.id = 'sky-info';
      // 스타일은 css/style.css #sky-info 에서 관리
      document.body.appendChild(el);
    }

    const icons = {
      clear:  '☀️', cloudy: '☁️', rain: '🌧️',
    };
    const slotKo = {
      day: '낮', sunset: '노을', night: '밤',
    };

    const cityText = state.city ? ` · ${state.city}` : '';
    const tempText = state.temperature !== null ? ` · ${state.temperature}°C` : '';
    el.innerHTML =
      `${icons[state.weather]} ${slotKo[state.timeSlot]}${cityText}${tempText}`;

    // ── UI존 날씨·위치 블록 연동 ────────────────
    const uiIcon = document.getElementById('ui-weather-icon');
    const uiText = document.getElementById('ui-weather-text');
    const uiLoc  = document.getElementById('ui-location-text');
    if (uiIcon) uiIcon.textContent = icons[state.weather];
    if (uiText) uiText.textContent =
      `${slotKo[state.timeSlot]} · ${state.temperature !== null ? state.temperature + '°C' : '--°C'}`;
    if (uiLoc)  uiLoc.textContent  = state.city || '위치 확인 중...';
  }

  // ── 매 프레임 업데이트 ────────────────────────
  function update(t) {
    // 비 낙하
    updateRain();
    // 구름 이동
    updateClouds(t);
    // 5분마다 날씨 재호출
    const now = Date.now();
    if (now - state.lastFetch > state.FETCH_INTERVAL) {
      state.lastFetch = now;
      const newSlot = getTimeSlot();
      fetchWeather().then(() => {
        state.timeSlot = getTimeSlot();
        applyToScene();
        updateWeatherUI();
      });
    }
  }

  // ── 씬 오브젝트 주입 ─────────────────────────
  function injectSceneObjects(objs) {
    _moonLight  = objs.moonLight  || null;
    _ambient    = objs.ambient    || null;
    _hemi       = objs.hemi       || null;
    _starPoints = objs.starPoints || null;
    _fireflies  = objs.fireflies  || null;
  }

  // ── 초기화 ───────────────────────────────────
  async function init(scene, renderer, sceneObjects) {
    _scene    = scene;
    _renderer = renderer;

    // 씬 오브젝트 주입
    injectSceneObjects(sceneObjects);

    // 초기 시간대 설정 (API 호출 전 즉시 적용)
    state.timeSlot = getTimeSlot();
    applyToScene();
    updateWeatherUI();

    // 위치 → 날씨 순서로 비동기 호출
    await fetchLocation();
    await fetchWeather();
    state.lastFetch = Date.now();

    // 최종 적용
    state.timeSlot = getTimeSlot();
    applyToScene();
    updateWeatherUI();

    console.log('[SoolSky] 초기화 완료');
  }

  // ── 공개 API ─────────────────────────────────
  return {
    init,
    update,
    getState: () => ({ ...state }),
  };

})();
