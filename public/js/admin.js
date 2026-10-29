/**
 * SNOW'S ARENA — HOST CONTROL & PROJECTOR SCREEN
 * One page for the host laptop that also drives the projector.
 * Rendering budget: one DOM row per squad, created once; each update only patches the
 * cells that changed, and rank changes slide rows with a CSS transform (no relayout).
 */
(function () {
  'use strict';

  // ------------------------------------------------------------ state
  let socket = null;
  let adminPassword = readSavedPassword();
  let adminState = null;
  let authenticated = false;
  let serverOffsetMs = 0; // server clock minus local clock
  let sortMode = 'rank';
  let lastStatus = null;
  let ceremonyAutoShown = false;
  let joinUrl = window.location.origin;

  const rows = new Map(); // teamId -> { el, refs, sig, steps, total }
  const rankHistory = new Map(); // teamId -> { rank, deltaUntil, delta }
  const scoreHistory = new Map(); // teamId -> score

  const $ = (id) => document.getElementById(id);
  const loginScreen = $('hostLoginScreen');
  const dashboard = $('hostDashboardScreen');
  const passwordInput = $('adminPasswordInput');
  const loginError = $('adminLoginError');
  const board = $('board');
  const boardEmpty = $('boardEmpty');
  const metricTimer = $('metricTimer');
  const btnPrimary = $('btnPrimaryAction');
  const btnPause = $('btnPauseResume');
  const btnExtend = $('btnExtendTime1m');
  const filterInput = $('squadFilterInput');

  // Rows are absolutely positioned; this spacer gives the scroll area its height
  const sizer = document.createElement('div');
  sizer.style.cssText = 'position:absolute;top:0;left:0;width:1px;pointer-events:none;';
  board.appendChild(sizer);

  // ------------------------------------------------------------ helpers
  function readSavedPassword() {
    try { return localStorage.getItem('campus_admin_pwd') || ''; } catch (e) { return ''; }
  }
  function savePassword(pwd) {
    try {
      if (pwd) localStorage.setItem('campus_admin_pwd', pwd);
      else localStorage.removeItem('campus_admin_pwd');
    } catch (e) { /* storage blocked */ }
  }
  function escapeHtml(str) {
    return String(str ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }
  function formatTime(ms) {
    const total = Math.max(0, Math.ceil(ms / 1000));
    return `${String(Math.floor(total / 60)).padStart(2, '0')}:${String(total % 60).padStart(2, '0')}`;
  }
  function showToast(message, type = 'info') {
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.textContent = message;
    $('toastContainer').appendChild(toast);
    setTimeout(() => { toast.style.opacity = '0'; setTimeout(() => toast.remove(), 300); }, 3200);
  }
  function sendAdminAction(action, payload = {}) {
    if (!socket) return;
    socket.emit('admin_action', { password: adminPassword, action, payload });
  }

  // ------------------------------------------------------------ socket & auth
  function initSocket() {
    socket = io({ transports: ['websocket'], reconnection: true });

    socket.on('connect', () => {
      if (adminPassword) socket.emit('register_admin', { password: adminPassword });
    });

    socket.on('admin_authenticated', (res) => {
      authenticated = Boolean(res && res.success);
      loginScreen.classList.toggle('hidden', authenticated);
      dashboard.classList.toggle('hidden', !authenticated);
      if (authenticated) {
        savePassword(adminPassword);
        loginError.classList.add('hidden');
      } else {
        savePassword('');
        loginError.textContent = res?.message || 'Wrong host password.';
        loginError.classList.remove('hidden');
      }
    });

    socket.on('admin_update', (data) => {
      adminState = data;
      serverOffsetMs = (data.serverTime || Date.now()) - Date.now();
      if (authenticated) render(data);
    });

    socket.on('admin_action_result', (res) => {
      if (res && !res.success) showToast(res.message || 'Action failed', 'error');
    });
  }

  function doLogin() {
    adminPassword = passwordInput.value.trim();
    if (!adminPassword) {
      loginError.textContent = 'Enter the host password.';
      loginError.classList.remove('hidden');
      return;
    }
    socket.emit('register_admin', { password: adminPassword });
  }
  $('adminLoginForm').addEventListener('submit', (e) => { e.preventDefault(); doLogin(); });

  // ------------------------------------------------------------ stage header & controls
  const STAGE_ORDER = ['LOBBY', 'ROUND_1', 'INTERMEDIATE_1', 'ROUND_2', 'INTERMEDIATE_2', 'ROUND_3', 'FINISHED'];
  const STAGE_TITLES = {
    LOBBY: 'Lobby — squads assembling',
    ROUND_1: 'Round 1 — Keyword Cipher Quest (easy)',
    INTERMEDIATE_1: 'Break — Round 1 standings',
    ROUND_2: 'Round 2 — 10-Node Cyber Relay (medium)',
    INTERMEDIATE_2: 'Break — Round 2 standings',
    ROUND_3: 'Finals — The Kensington Crescent Affair (hard)',
    FINISHED: 'Tournament complete'
  };

  function primaryActionFor(status) {
    switch (status) {
      case 'LOBBY': return { label: '▶ Start Round 1', run: () => startRound(1) };
      case 'ROUND_1': return { label: '■ End Round 1', run: () => endRound(1) };
      case 'INTERMEDIATE_1': return { label: '▶ Start Round 2', run: () => startRound(2) };
      case 'ROUND_2': return { label: '■ End Round 2', run: () => endRound(2) };
      case 'INTERMEDIATE_2': return { label: '▶ Start the Finals', run: () => startRound(3) };
      case 'ROUND_3': return { label: '■ End the Finals', run: () => endRound(3) };
      case 'FINISHED': return { label: '🏆 Results ceremony', run: () => showCeremony() };
      default: return { label: '—', run: () => {} };
    }
  }

  function startRound(n) {
    const squads = adminState?.teams?.length || 0;
    if (n === 1 && squads === 0) {
      showToast('No squads have registered yet.', 'warning');
      return;
    }
    if (!confirm(`Start Round ${n} for ${squads} squad${squads === 1 ? '' : 's'}?`)) return;
    sendAdminAction('start_round', { roundNumber: n });
  }

  function endRound(n) {
    const left = (adminState?.playingCount || 0) - (adminState?.finishedCount || 0);
    const warn = left > 0 ? `\n\n${left} squad${left === 1 ? ' is' : 's are'} still playing.` : '';
    if (!confirm(`End Round ${n} now?${warn}`)) return;
    sendAdminAction('end_round');
  }

  btnPrimary.addEventListener('click', () => primaryActionFor(adminState?.status).run());
  btnPause.addEventListener('click', () => {
    const rs = adminState?.roundState;
    if (!rs?.active) return;
    sendAdminAction(rs.isPaused ? 'resume_round' : 'pause_round');
  });
  btnExtend.addEventListener('click', () => {
    sendAdminAction('extend_time', { seconds: 60 });
    showToast('+1 minute added to the round');
  });

  function renderHeader(data) {
    document.body.dataset.stage = data.status;
    $('stageTitle').textContent = STAGE_TITLES[data.status] || data.status;

    const currentIdx = STAGE_ORDER.indexOf(data.status);
    document.querySelectorAll('#stageStepper li').forEach(li => {
      const idx = STAGE_ORDER.indexOf(li.dataset.stage);
      li.classList.toggle('current', idx === currentIdx);
      li.classList.toggle('done', idx < currentIdx);
    });

    const primary = primaryActionFor(data.status);
    btnPrimary.textContent = primary.label;
    const active = Boolean(data.roundState?.active);
    btnPause.disabled = !active;
    btnExtend.disabled = !active;
    btnPause.textContent = data.roundState?.isPaused ? '▶ Resume' : '⏸ Pause';
    $('pausedBanner').classList.toggle('hidden', !(active && data.roundState.isPaused));

    $('metricTotalSquads').textContent = data.teams.length;
    $('metricOnlinePlayers').textContent = `${data.onlinePlayers}/${data.totalPlayers}`;
    const playing = data.playingCount || 0;
    const finished = data.finishedCount || 0;
    $('metricFinished').textContent = playing ? `${finished} / ${playing}` : '—';
    $('metricFinishedLabel').textContent = data.status === 'LOBBY' ? 'Waiting to start' : 'Finished this round';
    $('metricFinishedBar').style.width = playing ? `${Math.round((finished / playing) * 100)}%` : '0%';
    const latest = (data.activity || [])[0];
    $('activityText').textContent = latest ? latest.text : 'Waiting for squads…';

    $('joinBanner').classList.toggle('hidden', data.status !== 'LOBBY');
    $('progressHead').textContent = data.currentRound === 2 ? 'Nodes' : (data.currentRound === 3 ? 'Exhibits → warrant' : 'Progress');
    tickClock();
  }

  function tickClock() {
    const data = adminState;
    if (!data) return;
    const rs = data.roundState || {};
    let text = '--:--';
    let label = 'TIME LEFT';
    let remaining = null;
    if (rs.active && rs.isPaused) {
      remaining = rs.remainingMsOnPause;
      label = 'PAUSED';
    } else if (rs.active) {
      remaining = rs.endTime - (Date.now() + serverOffsetMs);
    } else {
      label = data.status === 'FINISHED' ? 'FINAL' : 'NEXT UP';
    }
    if (remaining !== null) text = formatTime(remaining);
    if (metricTimer.textContent !== text) metricTimer.textContent = text;
    $('clockLabel').textContent = label;
    metricTimer.classList.toggle('paused', Boolean(rs.active && rs.isPaused));
    metricTimer.classList.toggle('danger', remaining !== null && !rs.isPaused && remaining <= 60000);
    metricTimer.classList.toggle('warn', remaining !== null && !rs.isPaused && remaining > 60000 && remaining <= 180000);
  }
  setInterval(tickClock, 500);

  // ------------------------------------------------------------ standings board
  function createRow(teamId) {
    const el = document.createElement('div');
    el.className = 'row';
    el.setAttribute('role', 'listitem');
    el.innerHTML = `
      <span class="c-rank"><span class="rank-num"></span><span class="delta"></span></span>
      <span class="c-team">
        <span class="team-line"><span class="bench"></span><span class="team-name"></span><span class="tag hidden"></span></span>
        <span class="team-sub"><span class="dots"></span><span class="now"></span></span>
      </span>
      <span class="c-progress"><span class="segs"></span><span class="seg-label"></span></span>
      <span class="c-round r1"></span>
      <span class="c-round r2"></span>
      <span class="c-round r3"></span>
      <span class="c-total"></span>
      <span class="c-actions">
        <button type="button" data-act="skip" title="Force-advance this squad one step">⏭ Step</button>
        <button type="button" data-act="adjust" title="Adjust score">±</button>
      </span>`;
    const q = (sel) => el.querySelector(sel);
    const entry = {
      el,
      sig: '',
      steps: '',
      total: -1,
      refs: {
        rank: q('.rank-num'), delta: q('.delta'), bench: q('.bench'), name: q('.team-name'), tag: q('.tag'),
        dots: q('.dots'), now: q('.now'), segs: q('.segs'), segLabel: q('.seg-label'),
        r1: q('.r1'), r2: q('.r2'), r3: q('.r3'), totalCell: q('.c-total')
      }
    };
    el.dataset.team = teamId;
    board.appendChild(el);
    rows.set(teamId, entry);
    return entry;
  }

  function sortTeams(teams) {
    if (document.body.classList.contains('projector') || sortMode === 'rank') return teams;
    const list = [...teams];
    if (sortMode === 'progress') list.sort((a, b) => (b.solved - a.solved) || (a.rank - b.rank));
    if (sortMode === 'bench') list.sort((a, b) => (a.benchNumber || '').localeCompare(b.benchNumber || '', undefined, { numeric: true }));
    if (sortMode === 'name') list.sort((a, b) => a.name.localeCompare(b.name));
    return list;
  }

  function renderBoard(data) {
    const status = data.status;
    const filter = (filterInput.value || '').toLowerCase().trim();
    const now = Date.now();

    let teams = sortTeams(data.teams);
    if (filter) {
      teams = teams.filter(t => t.name.toLowerCase().includes(filter) ||
        (t.benchNumber || '').toLowerCase().includes(filter) ||
        t.members.some(m => m.name.toLowerCase().includes(filter)));
    }
    boardEmpty.classList.toggle('hidden', teams.length > 0);

    // Row height: fixed for the operator; in projector mode, squeeze everyone onto one screen
    const projector = document.body.classList.contains('projector');
    const rowH = projector
      ? Math.max(30, Math.min(64, Math.floor((board.clientHeight || 600) / Math.max(1, teams.length))))
      : 46;
    board.style.setProperty('--row-h', `${rowH}px`);
    sizer.style.height = `${teams.length * rowH}px`;

    const visible = new Set();
    teams.forEach((t, idx) => {
      visible.add(t.teamId);
      const entry = rows.get(t.teamId) || createRow(t.teamId);
      const { el, refs } = entry;

      // Rank movement arrows linger for a few seconds after a change
      let h = rankHistory.get(t.teamId);
      if (!h) {
        h = { rank: t.rank, delta: 0, deltaUntil: 0 };
        rankHistory.set(t.teamId, h);
      } else if (h.rank !== t.rank) {
        h.delta = h.rank - t.rank;
        h.deltaUntil = now + 8000;
        h.rank = t.rank;
      }
      const showDelta = h.deltaUntil > now && h.delta !== 0;

      const medal = t.totalScore > 0 ? ['🥇', '🥈', '🥉'][t.rank - 1] : null;
      let nowText = '';
      let tag = '';
      let tagClass = '';
      if (status === 'LOBBY') nowText = `${t.members.length} players ready`;
      else if (t.isRoundCompleted) nowText = '✓ Finished this round';
      else if (t.activeName) nowText = `▶ ${t.activeName} is solving`;
      if (!t.online) { tag = 'OFFLINE'; tagClass = 'tag-off'; }

      const sig = [t.rank, showDelta ? h.delta : 0, t.name, t.benchNumber, t.totalScore, t.roundScores?.[1], t.roundScores?.[2], t.roundScores?.[3],
        nowText, tag, t.members.map(m => (m.isOnline ? 1 : 0)).join(''), t.isRoundCompleted].join('|');
      if (sig !== entry.sig) {
        entry.sig = sig;
        if (medal) refs.rank.innerHTML = `<span class="rank-medal">${medal}</span>`;
        else refs.rank.textContent = t.rank;
        refs.delta.textContent = showDelta ? (h.delta > 0 ? `▲${h.delta}` : `▼${-h.delta}`) : '';
        refs.delta.className = `delta ${showDelta ? (h.delta > 0 ? 'up' : 'down') : ''}`;
        refs.bench.textContent = t.benchNumber || '';
        refs.bench.classList.toggle('hidden', !t.benchNumber);
        refs.name.textContent = t.name;
        refs.tag.textContent = tag;
        refs.tag.className = `tag ${tagClass}${tag ? '' : ' hidden'}`;
        refs.dots.innerHTML = t.members.map(m => `<span class="dot${m.isOnline ? ' on' : ''}" title="${escapeHtml(m.name)}${m.isLeader ? ' (leader)' : ''}"></span>`).join('');
        refs.now.textContent = nowText;
        refs.r1.textContent = t.roundScores?.[1] || 0;
        refs.r2.textContent = t.roundScores?.[2] || 0;
        refs.r3.textContent = t.roundScores?.[3] || 0;
        refs.totalCell.textContent = t.totalScore.toLocaleString('en-US');
        el.classList.toggle('leader-row', t.rank === 1 && t.totalScore > 0);
        el.classList.toggle('done-row', t.isRoundCompleted);
      }

      // Score bump animation
      const prevScore = scoreHistory.get(t.teamId);
      if (prevScore !== undefined && t.totalScore > prevScore) {
        refs.totalCell.classList.remove('bump');
        void refs.totalCell.offsetWidth;
        refs.totalCell.classList.add('bump');
      }
      scoreHistory.set(t.teamId, t.totalScore);

      // Step segments (rebuilt only when the step count changes)
      if (entry.total !== t.totalSteps) {
        entry.total = t.totalSteps;
        entry.steps = null;
        refs.segs.innerHTML = '<span class="seg"></span>'.repeat(t.totalSteps);
      }
      if (entry.steps !== t.steps) {
        entry.steps = t.steps;
        const segs = refs.segs.children;
        for (let i = 0; i < segs.length; i++) segs[i].className = `seg ${t.steps[i] || 'L'}`;
        refs.segLabel.textContent = t.totalSteps ? `${t.solved}/${t.totalSteps}` : '';
      }

      const y = idx * rowH;
      if (el._y !== y) {
        el._y = y;
        el.style.transform = `translateY(${y}px)`;
      }
    });

    for (const [teamId, entry] of rows) {
      if (!visible.has(teamId)) {
        entry.el.remove();
        rows.delete(teamId);
      }
    }
  }

  // Row actions (one delegated listener; rows are never rebuilt)
  board.addEventListener('click', (e) => {
    const btn = e.target.closest('button[data-act]');
    if (!btn) return;
    const teamId = btn.closest('.row')?.dataset.team;
    const team = adminState?.teams?.find(t => t.teamId === teamId);
    if (!team) return;
    if (btn.dataset.act === 'skip') {
      if (!confirm(`Force-advance "${team.name}" by one step?\n\nUse this only for a stuck squad or a technical problem.`)) return;
      sendAdminAction('force_advance', { teamId, reason: 'Host force-advance' });
      showToast(`⏭ ${team.name} advanced one step`, 'warning');
    } else {
      openScoreModal(team);
    }
  });

  document.querySelectorAll('.chip[data-sort]').forEach(chip => {
    chip.addEventListener('click', () => {
      sortMode = chip.dataset.sort;
      document.querySelectorAll('.chip[data-sort]').forEach(c => c.classList.toggle('active', c === chip));
      if (adminState) renderBoard(adminState);
    });
  });
  filterInput.addEventListener('input', () => adminState && renderBoard(adminState));

  // ------------------------------------------------------------ score modal
  let scoreTeamId = null;
  function openScoreModal(team) {
    scoreTeamId = team.teamId;
    $('scoreModalSquadName').textContent = `${team.name} — currently ${team.totalScore} pts`;
    $('scoreDeltaInput').value = '';
    $('scoreReasonInput').value = '';
    $('scoreOverrideModal').classList.remove('hidden');
    $('scoreDeltaInput').focus();
  }
  $('btnCancelScoreOverride').addEventListener('click', () => $('scoreOverrideModal').classList.add('hidden'));
  $('btnConfirmScoreOverride').addEventListener('click', () => {
    const delta = parseInt($('scoreDeltaInput').value, 10);
    if (isNaN(delta) || delta === 0) {
      showToast('Enter a non-zero number of points.', 'warning');
      return;
    }
    sendAdminAction('override_score', { teamId: scoreTeamId, scoreDelta: delta, reason: $('scoreReasonInput').value || 'Host adjustment' });
    $('scoreOverrideModal').classList.add('hidden');
    showToast(`Score adjusted by ${delta > 0 ? '+' : ''}${delta}`);
  });

  // ------------------------------------------------------------ menu actions
  $('btnExportResults').addEventListener('click', async () => {
    try {
      const res = await fetch('/api/export', { headers: { 'x-admin-secret': adminPassword } });
      if (!res.ok) throw new Error('export failed');
      const blob = await res.blob();
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = `snows_arena_results_${new Date().toISOString().slice(0, 10)}.json`;
      a.click();
      setTimeout(() => URL.revokeObjectURL(a.href), 2000);
    } catch (e) {
      showToast('Could not export results.', 'error');
    }
  });
  $('btnResetAll').addEventListener('click', () => {
    if (!confirm('Reset EVERYTHING?\n\nAll squads, players and scores will be deleted. This cannot be undone.')) return;
    if (!confirm('Really delete all tournament data?')) return;
    sendAdminAction('reset_game');
    rows.forEach(r => r.el.remove());
    rows.clear();
    rankHistory.clear();
    scoreHistory.clear();
    ceremonyAutoShown = false;
    showToast('Tournament reset to an empty lobby.', 'warning');
  });
  $('btnHostLogout').addEventListener('click', () => {
    savePassword('');
    adminPassword = '';
    authenticated = false;
    dashboard.classList.add('hidden');
    loginScreen.classList.remove('hidden');
    passwordInput.value = '';
    passwordInput.focus();
  });
  $('btnShowCeremony').addEventListener('click', () => showCeremony());

  // ------------------------------------------------------------ projector mode
  function setProjector(on) {
    document.body.classList.toggle('projector', on);
    if (on && document.documentElement.requestFullscreen && !document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
    }
    if (adminState) renderBoard(adminState);
  }
  $('btnProjector').addEventListener('click', () => setProjector(true));
  $('btnExitProjector').addEventListener('click', () => setProjector(false));
  window.addEventListener('keydown', (e) => {
    if (!authenticated || ['INPUT', 'TEXTAREA'].includes(e.target.tagName)) return;
    if (e.key === 'p' || e.key === 'P') setProjector(!document.body.classList.contains('projector'));
    if (e.key === 'Escape' && !$('ceremony').classList.contains('hidden')) hideCeremony();
  });
  // Projector with more squads than fit on screen: page through the standings slowly
  setInterval(() => {
    if (!document.body.classList.contains('projector')) return;
    const overflow = board.scrollHeight - board.clientHeight;
    if (overflow <= 4) {
      if (board.scrollTop) board.scrollTop = 0;
      return;
    }
    const next = board.scrollTop + board.clientHeight - 40;
    // After the last page, glide back to the leaders
    board.scrollTo({ top: board.scrollTop >= overflow - 4 ? 0 : Math.min(next, overflow), behavior: 'smooth' });
  }, 7000);

  let resizeTimer = null;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => adminState && renderBoard(adminState), 150);
  });

  // ------------------------------------------------------------ results ceremony
  let ceremonyTimers = [];
  function showCeremony() {
    const teams = adminState?.teams || [];
    if (teams.length === 0) {
      showToast('No squads to celebrate yet.', 'warning');
      return;
    }
    ceremonyTimers.forEach(clearTimeout);
    ceremonyTimers = [];
    const ceremony = $('ceremony');
    ceremony.classList.remove('hidden');
    ceremony.scrollTop = 0;

    const breakdown = (t) => `R1 ${t.roundScores?.[1] || 0} • R2 ${t.roundScores?.[2] || 0} • R3 ${t.roundScores?.[3] || 0}`;

    // 5th and 4th place first
    const runnersUp = $('runnersUp');
    runnersUp.innerHTML = teams.slice(3, 5).reverse().map(t => `
      <div class="runner">
        <div class="r-rank">#${t.rank}</div>
        <div class="r-name">${escapeHtml(t.name)}</div>
        <div class="r-score">${t.totalScore.toLocaleString('en-US')} pts</div>
      </div>`).join('');

    // Podium order on screen: 2nd, 1st, 3rd
    const podium = $('podium');
    const slots = [[1, 'pod-2', '🥈'], [0, 'pod-1', '🥇'], [2, 'pod-3', '🥉']].filter(([i]) => teams[i]);
    podium.innerHTML = slots.map(([i, cls, medal]) => {
      const t = teams[i];
      return `
        <div class="pod ${cls}" data-place="${i + 1}">
          <div class="pod-medal">${medal}</div>
          <div class="pod-name" title="${escapeHtml(t.name)}">${escapeHtml(t.name)}</div>
          <div class="pod-score">${t.totalScore.toLocaleString('en-US')}</div>
          <div class="pod-break">${breakdown(t)}</div>
          <div class="pod-block">${i + 1}</div>
        </div>`;
    }).join('');

    const standings = $('fullStandings');
    standings.classList.add('hidden');
    standings.innerHTML = `
      <div class="fs-row fs-head"><span class="fs-num">#</span><span>Squad</span><span class="fs-num">R1</span><span class="fs-num">R2</span><span class="fs-num">R3</span><span class="fs-num">Total</span></div>
      ${teams.map(t => `
        <div class="fs-row">
          <span class="fs-num">${t.rank}</span>
          <span>${escapeHtml(t.name)}</span>
          <span class="fs-num">${t.roundScores?.[1] || 0}</span>
          <span class="fs-num">${t.roundScores?.[2] || 0}</span>
          <span class="fs-num">${t.roundScores?.[3] || 0}</span>
          <span class="fs-total">${t.totalScore.toLocaleString('en-US')}</span>
        </div>`).join('')}`;

    // Reveal sequence: 5th, 4th, 3rd, 2nd, then the champion with confetti
    const runnerEls = [...runnersUp.children];
    const pod = (place) => podium.querySelector(`.pod[data-place="${place}"]`);
    const later = (ms, fn) => ceremonyTimers.push(setTimeout(fn, ms));
    runnerEls.forEach((el, i) => later(600 + i * 900, () => el.classList.add('show')));
    const base = 600 + runnerEls.length * 900;
    later(base + 200, () => pod(3)?.classList.add('show'));
    later(base + 1400, () => pod(2)?.classList.add('show'));
    later(base + 2900, () => { pod(1)?.classList.add('show'); launchConfetti(); });
    later(base + 5200, () => standings.classList.remove('hidden'));
  }

  function hideCeremony() {
    ceremonyTimers.forEach(clearTimeout);
    ceremonyTimers = [];
    $('ceremony').classList.add('hidden');
    stopConfetti();
  }
  $('btnCeremonyClose').addEventListener('click', hideCeremony);
  $('btnCeremonyReplay').addEventListener('click', showCeremony);

  // Short confetti burst: ~140 rectangles for 5 seconds, then the loop stops completely
  let confettiRaf = null;
  function launchConfetti() {
    const canvas = $('confetti');
    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    const colors = ['#ffd36b', '#7ec8e3', '#43e97b', '#ff8fa3', '#ffffff', '#ffa63d'];
    const pieces = Array.from({ length: 140 }, () => ({
      x: canvas.width / 2 + (Math.random() - 0.5) * canvas.width * 0.5,
      y: canvas.height * 0.35,
      vx: (Math.random() - 0.5) * 14,
      vy: -Math.random() * 14 - 4,
      w: 6 + Math.random() * 6,
      h: 8 + Math.random() * 8,
      rot: Math.random() * Math.PI,
      vr: (Math.random() - 0.5) * 0.3,
      color: colors[Math.floor(Math.random() * colors.length)]
    }));
    const endAt = performance.now() + 5000;
    stopConfetti();
    const frame = (ts) => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      for (const p of pieces) {
        p.vy += 0.35;
        p.vx *= 0.99;
        p.x += p.vx;
        p.y += p.vy;
        p.rot += p.vr;
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rot);
        ctx.fillStyle = p.color;
        ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
        ctx.restore();
      }
      if (ts < endAt) confettiRaf = requestAnimationFrame(frame);
      else { ctx.clearRect(0, 0, canvas.width, canvas.height); confettiRaf = null; }
    };
    confettiRaf = requestAnimationFrame(frame);
  }
  function stopConfetti() {
    if (confettiRaf) cancelAnimationFrame(confettiRaf);
    confettiRaf = null;
  }

  // ------------------------------------------------------------ main render
  function render(data) {
    renderHeader(data);
    renderBoard(data);
    // The moment the finals end, roll the ceremony once (host can replay it from the menu)
    if (data.status === 'FINISHED' && lastStatus && lastStatus !== 'FINISHED' && !ceremonyAutoShown) {
      ceremonyAutoShown = true;
      showCeremony();
    }
    lastStatus = data.status;
  }

  // LAN address for the join banner
  fetch('/api/lan-ips').then(r => r.json()).then(info => {
    const first = info?.ips?.[0];
    const ip = typeof first === 'object' ? first?.address : first;
    if (ip) joinUrl = `http://${ip}:${info.port || 5000}`;
    $('joinUrl').textContent = joinUrl;
  }).catch(() => { $('joinUrl').textContent = joinUrl; });

  initSocket();
})();
