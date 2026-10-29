/**
 * CAMPUS LAN TEAM PUZZLE GAME — PROJECTOR DISPLAY CONTROLLER
 * Optimized for low-GPU execution, smooth CSS-only rank transitions,
 * and high-contrast projector rendering.
 */

(function () {
  'use strict';

  let socket = null;
  let remainingMs = 0;
  let timerInterval = null;
  let isTimerActive = false;

  // DOM Elements
  const roundTitleDisplay = document.getElementById('roundTitleDisplay');
  const roundSubtitleDisplay = document.getElementById('roundSubtitleDisplay');
  const timerBox = document.getElementById('timerBox');
  const countdownDisplay = document.getElementById('countdownDisplay');
  const leaderboardList = document.getElementById('leaderboardList');
  const hostAdvanceBanner = document.getElementById('hostAdvanceBanner');
  const advanceBannerText = document.getElementById('advanceBannerText');
  const btnClickAdvance = document.getElementById('btnClickAdvance');
  const podiumOverlay = document.getElementById('podiumOverlay');
  const podiumBadge = document.getElementById('podiumBadge');
  const podiumHeading = document.getElementById('podiumHeading');
  const podiumSub = document.getElementById('podiumSub');
  const podiumTopList = document.getElementById('podiumTopList');
  const statTotalTeams = document.getElementById('statTotalTeams');
  const lastSyncTime = document.getElementById('lastSyncTime');

  let currentStageStatus = 'LOBBY';

  /* -------------------------------------------------------------
   * TIME FORMATTER
   * ----------------------------------------------------------- */
  function formatTime(ms) {
    if (ms <= 0) return '00:00';
    const totalSeconds = Math.floor(ms / 1000);
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  }

  function startLocalCountdown() {
    if (timerInterval) clearInterval(timerInterval);

    timerInterval = setInterval(() => {
      if (isTimerActive && remainingMs > 0) {
        remainingMs = Math.max(0, remainingMs - 1000);
        updateTimerDisplay();
      }
    }, 1000);
  }

  function updateTimerDisplay() {
    if (currentStageStatus.startsWith('INTERMEDIATE')) {
      countdownDisplay.textContent = '00:00';
      const label = timerBox.querySelector('.timer-label');
      if (label) label.textContent = 'ROUND COMPLETE';
      timerBox.classList.remove('timer-danger', 'timer-warning');
      return;
    }

    const label = timerBox.querySelector('.timer-label');
    if (label) label.textContent = 'TIME REMAINING';

    countdownDisplay.textContent = formatTime(remainingMs);

    const totalSeconds = Math.floor(remainingMs / 1000);

    // Color urgency coding
    timerBox.classList.remove('timer-warning', 'timer-danger');
    if (totalSeconds > 0 && totalSeconds <= 60) {
      timerBox.classList.add('timer-danger');
    } else if (totalSeconds > 0 && totalSeconds <= 180) {
      timerBox.classList.add('timer-warning');
    }
  }

  let lanHostUrl = window.location.origin;

  async function fetchLanHostUrl() {
    try {
      const res = await fetch('/api/lan-ips');
      const data = await res.json();
      if (data && data.ips && data.ips.length > 0) {
        // Prioritize designated game host IP (data.ips[0])
        const primaryObj = data.ips[0];
        const ipStr = typeof primaryObj === 'object' ? primaryObj.address : primaryObj;
        lanHostUrl = `http://${ipStr}:${data.port || 5000}`;
      }
    } catch (e) {
      lanHostUrl = window.location.origin;
    }
    const fallbackEl = document.getElementById('fallbackIpDisplay');
    if (fallbackEl) fallbackEl.textContent = lanHostUrl;
    const chips = document.querySelectorAll('.lobby-ip-chip .ip-value');
    chips.forEach(c => { c.textContent = lanHostUrl; });
  }
  fetchLanHostUrl();

  /* -------------------------------------------------------------
   * DISPLAY RENDERER
   * ----------------------------------------------------------- */
  let currentDisplayTheme = null;
  function applyDisplayTheme(status) {
    let target = 'theme-lobby';
    if (status === 'ROUND_1' || status === 'INTERMEDIATE_1') target = 'theme-round-1';
    else if (status === 'ROUND_2' || status === 'INTERMEDIATE_2') target = 'theme-round-2';
    else if (status === 'ROUND_3') target = 'theme-round-3';
    else if (status === 'FINISHED') target = 'theme-finished';

    if (currentDisplayTheme !== target) {
      document.body.classList.remove('theme-lobby', 'theme-round-1', 'theme-round-2', 'theme-round-3', 'theme-finished');
      document.body.classList.add(target);
      currentDisplayTheme = target;
    }
  }

  function renderDisplay(data) {
    if (!data) return;
    currentStageStatus = data.status || 'LOBBY';
    applyDisplayTheme(data.status);

    // Stage Header
    roundTitleDisplay.textContent = data.roundTitle || 'LOBBY STAGE';
    if (data.status === 'LOBBY') {
      roundTitleDisplay.textContent = 'SQUAD LOBBY // ARENA STANDBY';
      roundSubtitleDisplay.textContent = `Squad leaders connect to ${lanHostUrl} • Awaiting Game Master to launch Round 1!`;
    } else if (data.status === 'ROUND_1') {
      roundTitleDisplay.textContent = 'STAGE 1: KEYWORD CIPHER QUEST';
      roundSubtitleDisplay.textContent = data.isPaused
        ? '⏸ MATCH IS CURRENTLY PAUSED BY GAME MASTER'
        : '⚡ STAGE 1: KEYWORD CIPHER QUEST — 4 CONCURRENT GAMES (10 MIN BATTLE)!';
    } else if (data.status === 'ROUND_2') {
      roundTitleDisplay.textContent = 'STAGE 2: THE 10-NODE CYBER TERMINAL HACK';
      roundSubtitleDisplay.textContent = data.isPaused
        ? '⏸ MATCH IS CURRENTLY PAUSED BY GAME MASTER'
        : '⚡ STAGE 2: 10-NODE CYBER RELAY — CRACK THE CHAIN, FEWER GUESSES = MORE POINTS!';
    } else if (data.status === 'ROUND_3') {
      roundTitleDisplay.textContent = 'SHER"UNLOCKING" HOMIES: THE BAKER STREET MYSTERY';
      roundSubtitleDisplay.textContent = data.isPaused
        ? '⏸ MATCH IS CURRENTLY PAUSED BY GAME MASTER'
        : '🕵️ SHER"UNLOCKING" HOMIES — THE BAKER STREET COLD CASE DEDUCTION FINALS!';
    } else if (data.status === 'INTERMEDIATE_1') {
      roundTitleDisplay.textContent = 'STAGE 1 CONCLUDED — OFFICIAL SQUAD STANDINGS';
      roundSubtitleDisplay.textContent = '🏆 10-Minute Battle Complete! Final Round 1 Leaderboard locked. Standing by for Game Master...';
    } else if (data.status === 'INTERMEDIATE_2') {
      roundTitleDisplay.textContent = 'STAGE 2 CONCLUDED — STANDINGS';
      roundSubtitleDisplay.textContent = '🕵️ Every squad plays the final case next. Standing by for the Game Master...';
    } else if (data.status === 'FINISHED') {
      roundTitleDisplay.textContent = 'TOURNAMENT FINALS CONCLUDED';
      roundSubtitleDisplay.textContent = '🏆 Grand Finals Concluded — Champions Crowned!';
    }

    // Sync timer
    remainingMs = data.remainingMs || 0;
    isTimerActive = data.roundActive && !data.isPaused;
    updateTimerDisplay();

    // Stats
    statTotalTeams.textContent = data.leaderboard?.length || 0;
    lastSyncTime.textContent = `Sync: ${new Date().toLocaleTimeString()}`;

    // Render Full Leaderboard Rows (Every Team Displayed Evenly Spaced)
    renderLeaderboard(data.leaderboard || []);

    // Podium only for Tournament Finish
    renderPodium(data);
  }

  // Skip the rebuild entirely when nothing visible changed since the last push
  let lastLeaderboardSig = '';
  function renderLeaderboard(teams) {
    const sig = currentStageStatus + '|' + lanHostUrl + '|' + JSON.stringify(teams.map(t => [
      t.teamId, t.name, t.totalScore, t.roundScores, t.isRoundCompleted, t.isEliminated, t.collectedCount, t.nodesBreached,
      (t.membersTurnOrder || []).map(m => m.turnStatus).join('')
    ]));
    if (sig === lastLeaderboardSig) return;
    lastLeaderboardSig = sig;

    if (teams.length === 0) {
      leaderboardList.innerHTML = `
        <div class="lobby-broadcast-box">
          <div class="lobby-crest">🕹️</div>
          <div class="lobby-title">❄️ SNOW'S ARENA // CAMPUS LAN PUZZLE TOURNAMENT</div>
          <div class="lobby-instruction-sub">Team Leaders, connect your device to the arena using the address below:</div>
          <div class="lobby-ip-chip">
            <span class="ip-label">LEADER PORTAL ADDRESS</span>
            <span class="ip-value">${escapeHtml(lanHostUrl)}</span>
          </div>
          <div class="lobby-footer-help">Enter your Team Name, Select Squad Format (2, 3, or 4 players) &amp; Member Names</div>
        </div>
      `;
      return;
    }

    leaderboardList.innerHTML = '';

    teams.forEach((team, index) => {
      const rank = index + 1;
      const row = document.createElement('div');

      let rankClass = '';
      let medal = `#${rank}`;
      if (rank === 1) { rankClass = 'rank-1'; medal = '🥇 #1'; }
      else if (rank === 2) { rankClass = 'rank-2'; medal = '🥈 #2'; }
      else if (rank === 3) { rankClass = 'rank-3'; medal = '🥉 #3'; }

      row.className = `team-row ${rankClass}`;

      // Progress Calculation
      const isRound2 = currentStageStatus === 'ROUND_2';
      const totalSteps = isRound2 ? 10 : Math.max(1, ((team.membersTurnOrder || []).length || 4) - 1);
      const currentStepCount = isRound2 ? (team.nodesBreached || 0) : (team.collectedCount || 0);
      const progressRatio = Math.min(100, Math.round((currentStepCount / totalSteps) * 100));

      let statusHtml = '<span class="display-status-pill status-solving">Solving</span>';
      let activeSolverInfo = isRound2 ? `Nodes: ${currentStepCount}/10` : `Keywords: ${team.collectedCount}/3`;

      if (currentStageStatus === 'LOBBY') {
        statusHtml = '<span class="display-status-pill status-ready">● Ready in Lobby</span>';
        activeSolverInfo = 'Standby for Round 1 Launch';
      } else if (currentStageStatus === 'INTERMEDIATE_1') {
        if (team.isRoundCompleted) {
          statusHtml = '<span class="display-status-pill status-completed">✓ Qualified</span>';
          activeSolverInfo = '✓ Solved All 4 Games';
        } else {
          statusHtml = `<span class="display-status-pill status-completed">${team.collectedCount}/3 Solved</span>`;
          activeSolverInfo = `Keywords: ${team.collectedCount}/3`;
        }
      } else if (isRound2) {
        if (team.isRoundCompleted || (team.nodesBreached && team.nodesBreached >= 10)) {
          statusHtml = '<span class="display-status-pill status-completed">✓ 10/10 Breached</span>';
          activeSolverInfo = '👑 Mainframe Overridden!';
        } else {
          const nextNode = Math.min(10, (team.nodesBreached || 0) + 1);
          statusHtml = `<span class="display-status-pill status-solving">Node ${nextNode}/10</span>`;
          activeSolverInfo = `Breached: ${team.nodesBreached || 0}/10 Nodes (R1: ${team.roundScores?.[1] || 0} + R2: ${team.roundScores?.[2] || 0})`;
        }
      } else if (currentStageStatus === 'ROUND_3') {
        if (team.isRoundCompleted) {
          statusHtml = '<span class="display-status-pill status-completed">✓ Case Solved</span>';
          activeSolverInfo = '🏛️ Warrant Verified! Criminal Convicted!';
        } else if (team.isEliminated) {
          statusHtml = '<span class="display-status-pill status-eliminated">Spectating</span>';
          activeSolverInfo = 'Did not reach the Top 5';
        } else {
          const exhibits = Math.max(1, ((team.membersTurnOrder || []).length || 6) - 1);
          const found = team.collectedCount || 0;
          statusHtml = found >= exhibits
            ? '<span class="display-status-pill status-solving">Filing warrant</span>'
            : `<span class="display-status-pill status-solving">Exhibit ${found + 1}/${exhibits}</span>`;
          activeSolverInfo = `Findings: ${found}/${exhibits} (R1: ${team.roundScores?.[1] || 0} + R2: ${team.roundScores?.[2] || 0} + R3: ${team.roundScores?.[3] || 0})`;
        }
      } else {
        if (team.isRoundCompleted) {
          statusHtml = '<span class="display-status-pill status-completed">✓ Qualified</span>';
          activeSolverInfo = '✓ All 4 Games Solved';
        } else if (team.isEliminated) {
          statusHtml = '<span class="display-status-pill status-eliminated">Eliminated</span>';
        } else if (team.membersTurnOrder) {
          const activeMem = team.membersTurnOrder.find(m => m.turnStatus === 'ACTIVE');
          if (activeMem) {
            activeSolverInfo = `⚡ Game ${activeMem.gameNumber || activeMem.index}: ${escapeHtml(activeMem.name)}`;
          }
        }
      }

      const genderClass = team.gender === 'female' ? 'tag-female' : 'tag-male';

      const benchBadge = team.benchNumber 
        ? `<span class="bench-tag" style="display:inline-block; margin-right:8px; font-size:0.75rem; background:#0f223d; color:#fbbf24; border:1px solid #c59b27; padding:3px 8px; border-radius:5px; font-weight:800; letter-spacing:0.5px;">${escapeHtml(team.benchNumber.toUpperCase())}</span>` 
        : '';

      const leaderSub = team.leaderName ? `<span style="display:block; font-size:0.75rem; color:#64748b; font-weight:500;">👑 ${escapeHtml(team.leaderName)}</span>` : '';

      row.innerHTML = `
        <div class="rank-badge">${medal}</div>
        <div class="squad-cell">
          <span class="squad-name">${benchBadge}${escapeHtml(team.name)}</span>
          <div class="squad-meta">
            <span class="squad-tag ${genderClass}">${team.gender}</span>
            <span>CODE: ${team.teamId}</span>
          </div>
        </div>
        <div class="members-cell">${team.memberCount} Players${leaderSub}</div>
        <div class="progress-cell">
          <div class="progress-track">
            <div class="progress-fill" style="width: ${team.isRoundCompleted ? 100 : (currentStageStatus === 'LOBBY' ? 0 : progressRatio)}%"></div>
          </div>
          <span class="progress-text">${activeSolverInfo}</span>
        </div>
        <div class="status-cell">${statusHtml}</div>
        <div class="score-cell">
          <div class="score-main">${team.totalScore.toLocaleString()}<span class="score-pts">PTS</span></div>
          <div class="score-breakdown-sub" style="font-size:0.72rem; font-weight:700; color:#64748b; margin-top:2px;">
            R1:${team.roundScores?.[1] || 0} • R2:${team.roundScores?.[2] || 0} • R3:${team.roundScores?.[3] || 0}
          </div>
        </div>
      `;

      leaderboardList.appendChild(row);
    });
  }

  let lastPodiumSig = '';
  function renderPodium(data) {
    // Only show modal popup when tournament is completely FINISHED
    if (data.status !== 'FINISHED') {
      podiumOverlay.classList.add('hidden');
      lastPodiumSig = '';
      return;
    }
    const podiumSig = JSON.stringify((data.leaderboard || []).slice(0, 5).map(t => [t.teamId, t.totalScore]));
    if (podiumSig === lastPodiumSig) return;
    lastPodiumSig = podiumSig;

    podiumOverlay.classList.remove('hidden');
    podiumBadge.textContent = 'GRAND LAUREL RESULTS';
    podiumHeading.textContent = '🏆 TOURNAMENT CHAMPIONS';
    podiumSub.textContent = "Official final standings of the Snow's Arena Tournament Championship:";

    const topTeams = (data.leaderboard || []).slice(0, 5);
    podiumTopList.innerHTML = '';

    topTeams.forEach((team, idx) => {
      const item = document.createElement('div');
      item.className = `podium-item ${idx === 0 ? 'top-1' : ''}`;
      let medal = `#${idx + 1}`;
      if (idx === 0) medal = '🥇 Champion';
      else if (idx === 1) medal = '🥈 2nd Place';
      else if (idx === 2) medal = '🥉 3rd Place';

      item.innerHTML = `
        <div>
          <div style="font-weight:800; font-size:1rem;">${medal} — ${escapeHtml(team.name)} (${team.gender.toUpperCase()})</div>
          <div style="font-size:0.78rem; font-weight:600; color:#64748b; margin-top:2px;">
            Round 1: ${(team.roundScores?.[1] || 0).toLocaleString()} • Round 2: ${(team.roundScores?.[2] || 0).toLocaleString()} • Round 3: ${(team.roundScores?.[3] || 0).toLocaleString()}
          </div>
        </div>
        <span class="score-pts text-navy" style="font-size:1.25rem; font-weight:900;">${team.totalScore.toLocaleString()} PTS</span>
      `;
      podiumTopList.appendChild(item);
    });
  }

  function escapeHtml(str) {
    if (!str) return '';
    return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }

  /* -------------------------------------------------------------
   * SPACEBAR / KEYBOARD SHORTCUT ADVANCE & CLICK HANDLERS
   * ----------------------------------------------------------- */
  window.addEventListener('keydown', (e) => {
    // Avoid triggering when user is in input/textarea
    if (['INPUT', 'TEXTAREA'].includes(e.target.tagName)) return;

    if (e.code === 'Space' || e.key === ' ' || e.key === 'Enter' || e.key === 'ArrowRight') {
      e.preventDefault();
      emitHostAdvance();
    }
  });

  if (btnClickAdvance) {
    btnClickAdvance.addEventListener('click', () => {
      emitHostAdvance();
    });
  }

  // The server only accepts stage advances from the host, so send the password saved at admin login
  function emitHostAdvance() {
    if (!socket) return;
    let password = '';
    try { password = localStorage.getItem('campus_admin_pwd') || ''; } catch (e) { /* storage blocked */ }
    socket.emit('host_key_advance', { password });
  }

  /* -------------------------------------------------------------
   * SOCKET CONNECTION
   * ----------------------------------------------------------- */
  function initSocket() {
    socket = io({
      transports: ['websocket'],
      reconnection: true
    });

    socket.on('connect', () => {
      socket.emit('register_display');
      startLocalCountdown();
    });

    socket.on('display_update', (data) => {
      renderDisplay(data);
    });

    socket.on('round_started', () => {
      socket.emit('register_display');
    });

    socket.on('round_ended', () => {
      socket.emit('register_display');
    });

    socket.on('stage_advanced', () => {
      socket.emit('register_display');
    });
  }

  initSocket();
})();
