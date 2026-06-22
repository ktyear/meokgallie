/* ═══════════════════════════════════════════════
   술마을 — Loading UI
   ═══════════════════════════════════════════════ */

const SoolLoading = (() => {

  const MESSAGES = [
    '마을을 불러오는 중...',
    '건물에 불을 켜는 중...',
    '반딧불이를 풀어놓는 중...',
    '별을 배치하는 중...',
    '거의 다 됐어요...',
  ];

  let _el   = null;
  let _text = null;
  let _msgIdx = 0;
  let _interval = null;

  function start() {
    _el   = document.getElementById('loading');
    _text = document.getElementById('loading-text');
    if (!_el || !_text) return;

    // 메시지 순환
    _interval = setInterval(() => {
      _msgIdx = (_msgIdx + 1) % MESSAGES.length;
      _text.textContent = MESSAGES[_msgIdx];
    }, 900);
  }

  function finish(delay = 400) {
    return new Promise(resolve => {
      setTimeout(() => {
        if (_interval) clearInterval(_interval);
        if (_text) _text.textContent = '준비 완료!';
        setTimeout(() => {
          if (_el) {
            _el.classList.add('fade');
            setTimeout(() => {
              try { _el.remove(); } catch (e) {}
              resolve();
            }, 750);
          } else {
            resolve();
          }
        }, 300);
      }, delay);
    });
  }

  return { start, finish };

})();
