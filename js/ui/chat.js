/* ═══════════════════════════════════════════════
   술향기마을 — 공용 채팅 위젯 (월드 채팅 + 건물별 채팅)
   사용법: 이 스크립트를 로드한 뒤 initSoolChat({ channelKey, label }) 호출
   ═══════════════════════════════════════════════ */

(function () {
  function esc(str) {
    const d = document.createElement('div');
    d.textContent = str || '';
    return d.innerHTML;
  }
  function timeAgo(dateStr) {
    const diff = Math.floor((Date.now() - new Date(dateStr)) / 1000);
    if (diff < 60) return '방금';
    if (diff < 3600) return Math.floor(diff / 60) + '분 전';
    if (diff < 86400) return Math.floor(diff / 3600) + '시간 전';
    return Math.floor(diff / 86400) + '일 전';
  }

  window.initSoolChat = async function (opts) {
    const channelKey = opts.channelKey;
    const label = opts.label || '채팅';
    const accentColor = opts.accentColor || '#9966ff';

    if (!document.getElementById('sool-chat-style')) {
      const style = document.createElement('style');
      style.id = 'sool-chat-style';
      style.textContent = `
        #sool-chat-btn { position: fixed; bottom: 20px; right: 20px; width: 52px; height: 52px; border-radius: 50%; background: ${accentColor}; color: #fff; border: none; font-size: 22px; cursor: pointer; box-shadow: 0 4px 16px rgba(0,0,0,0.25); z-index: 300; display:flex; align-items:center; justify-content:center; }
        #sool-chat-panel { position: fixed; bottom: 84px; right: 20px; width: 320px; max-width: calc(100vw - 40px); height: 420px; max-height: calc(100vh - 140px); background: #fff; border-radius: 16px; box-shadow: 0 8px 32px rgba(0,0,0,0.3); display: none; flex-direction: column; overflow: hidden; z-index: 300; font-family: -apple-system, BlinkMacSystemFont, 'Noto Sans KR', sans-serif; }
        #sool-chat-panel.show { display: flex; }
        #sool-chat-header { background: ${accentColor}; color: #fff; padding: 12px 16px; font-size: 13px; font-weight: 700; display:flex; justify-content:space-between; align-items:center; flex-shrink:0; }
        #sool-chat-header .sc-close { cursor:pointer; font-size: 15px; }
        #sool-chat-messages { flex:1; overflow-y:auto; padding: 10px 12px; background:#fafafa; }
        .sc-msg { margin-bottom: 10px; }
        .sc-msg .sc-head { font-size: 11px; color: #999; margin-bottom: 2px; display:flex; gap:6px; }
        .sc-msg .sc-nick { font-weight: 700; color: ${accentColor}; }
        .sc-msg .sc-body { font-size: 13px; color: #222; line-height:1.4; word-break: break-word; }
        #sool-chat-input-row { display:flex; border-top: 1px solid rgba(0,0,0,0.08); padding: 8px; gap: 6px; flex-shrink:0; background:#fff; }
        #sool-chat-input { flex:1; border: 1px solid rgba(0,0,0,0.12); border-radius: 8px; padding: 8px 10px; font-size: 13px; outline:none; font-family: inherit; }
        #sool-chat-send { background: ${accentColor}; color:#fff; border:none; border-radius:8px; padding: 8px 14px; font-size:13px; font-weight:600; cursor:pointer; flex-shrink:0; }
        .sc-empty { text-align:center; color:#aaa; font-size:12px; padding: 20px 0; }
        @media (max-width:480px){ #sool-chat-panel{ width: calc(100vw - 32px); right:16px; } #sool-chat-btn{ right:16px; } }
      `;
      document.head.appendChild(style);
    }

    const btn = document.createElement('button');
    btn.id = 'sool-chat-btn';
    btn.textContent = '💬';
    document.body.appendChild(btn);

    const panel = document.createElement('div');
    panel.id = 'sool-chat-panel';
    panel.innerHTML = `
      <div id="sool-chat-header"><span>💬 ${esc(label)}</span><span class="sc-close">✕</span></div>
      <div id="sool-chat-messages"><div class="sc-empty">불러오는 중...</div></div>
      <div id="sool-chat-input-row">
        <input id="sool-chat-input" placeholder="메시지를 입력하세요..." maxlength="300" />
        <button id="sool-chat-send">전송</button>
      </div>
    `;
    document.body.appendChild(panel);

    let currentUser = null;
    let isOpen = false;
    const msgWrap = panel.querySelector('#sool-chat-messages');

    function scrollToBottom() { msgWrap.scrollTop = msgWrap.scrollHeight; }

    btn.addEventListener('click', () => {
      isOpen = !isOpen;
      panel.classList.toggle('show', isOpen);
      if (isOpen) scrollToBottom();
    });
    panel.querySelector('.sc-close').addEventListener('click', () => {
      isOpen = false;
      panel.classList.remove('show');
    });

    function renderMessage(m) {
      const div = document.createElement('div');
      div.className = 'sc-msg';
      div.innerHTML = `<div class="sc-head"><span class="sc-nick">${esc(m.nickname || '익명')}</span><span>${timeAgo(m.created_at)}</span></div><div class="sc-body">${esc(m.content)}</div>`;
      msgWrap.appendChild(div);
    }

    async function loadInitial() {
      const { data, error } = await soolClient
        .from('chat_messages')
        .select('*, users(nickname)')
        .eq('channel_key', channelKey)
        .order('created_at', { ascending: false })
        .limit(30);

      if (error) { msgWrap.innerHTML = '<div class="sc-empty">채팅을 불러오지 못했어요</div>'; return; }
      msgWrap.innerHTML = '';
      if (!data || data.length === 0) {
        msgWrap.innerHTML = '<div class="sc-empty">아직 메시지가 없어요. 첫 메시지를 남겨보세요!</div>';
        return;
      }
      data.reverse().forEach(m => renderMessage({ ...m, nickname: m.users?.nickname }));
      scrollToBottom();
    }

    async function sendMessage() {
      const input = panel.querySelector('#sool-chat-input');
      const content = input.value.trim();
      if (!content) return;
      if (!currentUser) { alert('로그인 후 채팅할 수 있어요'); location.href = 'auth.html'; return; }
      input.value = '';
      const { error } = await soolClient.from('chat_messages').insert({ channel_key: channelKey, user_id: currentUser.id, content });
      if (error) console.error('메시지 전송 실패:', error);
    }

    panel.querySelector('#sool-chat-send').addEventListener('click', sendMessage);
    panel.querySelector('#sool-chat-input').addEventListener('keydown', (e) => {
      if (e.key === 'Enter') sendMessage();
    });

    const { data: { session } } = await soolClient.auth.getSession();
    if (session) {
      const { data: user } = await soolClient.from('users').select('id, nickname').eq('id', session.user.id).single();
      currentUser = user;
    }

    await loadInitial();

    soolClient
      .channel('chat:' + channelKey)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'chat_messages', filter: `channel_key=eq.${channelKey}` }, async (payload) => {
        const row = payload.new;
        let nickname = '익명';
        if (row.user_id) {
          const { data: u } = await soolClient.from('users').select('nickname').eq('id', row.user_id).single();
          nickname = u?.nickname || '익명';
        }
        if (msgWrap.querySelector('.sc-empty')) msgWrap.innerHTML = '';
        renderMessage({ ...row, nickname });
        scrollToBottom();
      })
      .subscribe();
  };
})();
