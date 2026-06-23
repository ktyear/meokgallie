/* ═══════════════════════════════════════════════
   술마을 — Sky System (v1.4.0)
   로컬 시간 3단계 + Open-Meteo 실시간 날씨 연동
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
  const TIME_CONFIGS = {
    day: {
      bgColor:      0x87CEEB,  // 하늘 파란색
      fogColor:     0xC8E8F8,
      fogDensity:   0.018,
      ambientColor: 0xFFEECC,
      ambientInt:   1.2,
      hemiSky:      0xFFEECC,
      hemiGround:   0x88AA66,
      hemiInt:      0.6,
      moonInt:      0.0,       // 달빛 OFF
      sunInt:       1.2,       // 태양 ON
      sunColor:     0xFFDD99,
      stars:        false,
      fireflies:    false,
    },
    sunset: {
      bgColor:      0xFF7043,  // 주황·붉은색
      fogColor:     0xFF8C55,
      fogDensity:   0.025,
      ambientColor: 0xFF8844,
      ambientInt:   0.9,
      hemiSky:      0xFF6622,
      hemiGround:   0x442200,
      hemiInt:      0.4,
      moonInt:      0.15,      // 달빛 약하게
      sunInt:       0.5,       // 태양 약하게
      sunColor:     0xFF5500,
      stars:        true,      // 별 서서히 등장
      fireflies:    true,
    },
    night: {
      bgColor:      0x060618,  // 현재 다크 네이비
      fogColor:     0x0a0820,
      fogDensity:   0.032,
      ambientColor: 0x1a1040,
      ambientInt:   0.75,
      hemiSky:      0x1a1050,
      hemiGround:   0x0a0820,
      hemiInt:      0.3,
      moonInt:      0.45,      // 달빛 ON
      sunInt:       0.0,       // 태양 OFF
      sunColor:     0xFFDD99,
      stars:        true,
      fireflies:    true,
    },
  };

  // ── 날씨별 추가 설정값 ────────────────────────
  const WEATHER_CONFIGS = {
    clear: {
      fogMult:    1.0,   // 안개 밀도 배수
      bgDarken:   0,     // 배경색 어둡게 (0~1)
      rainOn:     false,
      cloudOn:    false,
    },
    cloudy: {
      fogMult:    1.8,
      bgDarken:   0.25,
      rainOn:     false,
      cloudOn:    true,
    },
    rain: {
      fogMult:    2.8,
      bgDarken:   0.5,
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
      Object.assign(el.style, {
        position:   'fixed',
        top:        '20px',
        left:       '20px',
        color:      'rgba(200,185,255,0.55)',
        fontSize:   '11px',
        fontFamily: 'Arial, sans-serif',
        letterSpacing: '0.06em',
        pointerEvents: 'none',
        zIndex:     '10',
        lineHeight: '1.6',
      });
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
