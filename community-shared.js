/* ═══════════════════════════════════════════════
   술향기마을 — 커뮤니티 공용 유틸
   community.html, community-posts.html에서 공통으로 사용
   ═══════════════════════════════════════════════ */

// XSS 방지 (텍스트 노드용)
function esc(str) {
  const d = document.createElement('div');
  d.textContent = str == null ? '' : String(str);
  return d.innerHTML;
}

// XSS 방지 (HTML 속성값용 - 따옴표까지 처리)
function escAttr(str) {
  return esc(str).replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

// 유니코드(이모지) 안전 자르기
function safeSlice(str, len) {
  const chars = [...String(str || '')];
  return chars.slice(0, len).join('') + (chars.length > len ? '...' : '');
}

// http/https만 허용 (javascript: 등 위험한 스킴 차단)
function isAllowedUrl(value) {
  if (!value) return true; // 빈 값은 선택 입력이라 통과
  try {
    const url = new URL(value);
    return ['http:', 'https:'].includes(url.protocol);
  } catch {
    return false;
  }
}

// 유튜브 URL → 임베드 ID 추출 (watch/youtu.be/shorts/embed 전부 지원)
function getYoutubeId(value) {
  try {
    const url = new URL(value);
    const host = url.hostname.replace(/^www\./, '').replace(/^m\./, '');

    let id = null;
    if (host === 'youtu.be') {
      id = url.pathname.split('/')[1] || null;
    } else if (host === 'youtube.com') {
      if (url.pathname === '/watch') {
        id = url.searchParams.get('v');
      } else {
        const parts = url.pathname.split('/').filter(Boolean);
        if (['embed', 'shorts'].includes(parts[0])) id = parts[1] || null;
      }
    }
    // 유튜브 ID 형식(영문/숫자/-/_ 11자 내외)만 허용
    if (id && /^[A-Za-z0-9_-]{6,20}$/.test(id)) return id;
    return null;
  } catch {
    return null;
  }
}
