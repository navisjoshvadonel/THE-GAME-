/**
 * TOURNAMENT SERVER DASHBOARD CONTROLLER
 * Real-time dynamic updates: Team Names, Scores, and Member Turn Unlocks.
 */

(function () {
  'use strict';

  let socket = null;
  let adminPassword = sessionStorage.getItem('campus_admin_pwd') || 'campus_admin_2026';
  let adminState = null;
  let previousScores = new Map(); // teamId -> score (for flash update animation)
  let selectedSquadForOverride = null;

  // DOM Elements
  const hostLoginScreen = document.getElementById('hostLoginScreen');
  const hostDashboardScreen = document.getElementById('hostDashboardScreen');
  const adminPasswordInput = document.getElementById('adminPasswordInput');
  const btnAdminLogin = document.getElementById('btnAdminLogin');
  const adminLoginForm = document.getElementById('adminLoginForm');
  const adminLoginError = document.getElementById('adminLoginError');
  const btnHostLogout = document.getElementById('btnHostLogout');

  // Header & Metrics
  const headerStageText = document.getElementById('headerStageText');
  const metricTimer = document.getElementById('metricTimer');
  const metricTotalSquads = document.getElementById('metricTotalSquads');
  const metricOnlinePlayers = document.getElementById('metricOnlinePlayers');
  const unassignedCount = document.getElementById('unassignedCount');

  // Direct Controls
  const btnStartLobbyTimer = document.getElementById('btnStartLobbyTimer');
  const btnTriggerAutoMerge = document.getElementById('btnTriggerAutoMerge');
  const btnStartRound1 = document.getElementById('btnStartRound1');
  const btnStartRound2 = document.getElementById('btnStartRound2');
  const btnStartRound3 = document.getElementById('btnStartRound3');
  const btnPauseResume = document.getElementById('btnPauseResume');
  const btnExtendTime1m = document.getElementById('btnExtendTime1m');
  const btnForceEndRound = document.getElementById('btnForceEndRound');
  const btnExportResults = document.getElementById('btnExportResults');
  const btnResetAll = document.getElementById('btnResetAll');

  // Teams Container & Filter
  const teamsCardList = document.getElementById('teamsCardList');
  const squadFilterInput = document.getElementById('squadFilterInput');

  // Modal
  const scoreOverrideModal = document.getElementById('scoreOverrideModal');
  const scoreModalSquadName = document.getElementById('scoreModalSquadName');
  const scoreDeltaInput = document.getElementById('scoreDeltaInput');
  const scoreReasonInput = document.getElementById('scoreReasonInput');
  const btnCancelScoreOverride = document.getElementById('btnCancelScoreOverride');
  const btnConfirmScoreOverride = document.getElementById('btnConfirmScoreOverride');

  /* -------------------------------------------------------------
   * HELPERS
   * ----------------------------------------------------------- */
  function formatTime(ms) {
    if (!ms || ms <= 0) return '00:00';
    const totalSecs = Math.floor(ms / 1000);
    const m = Math.floor(totalSecs / 60);
    const s = totalSecs % 60;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  }

  function escapeHtml(str) {
    if (!str) return '';
    return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }

  function sendAdminAction(action, payload = {}) {
    socket.emit('admin_action', {
      password: adminPassword,
      action,
      payload
    });
  }

  /* -------------------------------------------------------------
   * SOCKET INITIALIZATION & AUTH
   * ----------------------------------------------------------- */
  function initSocket() {
    socket = io({
      transports: ['websocket'],
      reconnection: true
    });

    socket.on('connect', () => {
      socket.emit('register_admin', { password: adminPassword });
    });

    socket.on('admin_authenticated', (res) => {
      if (res && res.success) {
        if (hostLoginScreen) hostLoginScreen.classList.add('hidden');
        if (hostDashboardScreen) hostDashboardScreen.classList.remove('hidden');
        if (adminLoginError) adminLoginError.classList.add('hidden');
      } else {
        if (hostLoginScreen) hostLoginScreen.classList.remove('hidden');
        if (hostDashboardScreen) hostDashboardScreen.classList.add('hidden');
        if (adminLoginError) {
          adminLoginError.textContent = res.message || 'Invalid host password.';
          adminLoginError.classList.remove('hidden');
        }
      }
    });

    // Real-Time Dynamic State Push from Server
    socket.on('admin_update', (data) => {
      adminState = data;
      renderServerDashboard(data);
    });

    socket.on('admin_action_result', (res) => {
      if (!res.success) {
        alert('Action Failed: ' + (res.message || 'Unknown error'));
      }
    });
  }

  function doHostLogin() {
    adminPassword = adminPasswordInput.value.trim();
    if (!adminPassword) {
      adminLoginError.textContent = 'Please enter the host password.';
      adminLoginError.classList.remove('hidden');
      return;
    }
    sessionStorage.setItem('campus_admin_pwd', adminPassword);
    socket.emit('register_admin', { password: adminPassword });
  }

  btnAdminLogin.addEventListener('click', doHostLogin);
  if (adminLoginForm) {
    adminLoginForm.addEventListener('submit', (e) => {
      e.preventDefault();
      doHostLogin();
    });
  }

  if (btnHostLogout) {
    btnHostLogout.addEventListener('click', () => {
      sessionStorage.removeItem('campus_admin_pwd');
      adminPassword = '';
      if (hostLoginScreen) hostLoginScreen.classList.remove('hidden');
      if (hostDashboardScreen) hostDashboardScreen.classList.add('hidden');
      adminPasswordInput.value = '';
      adminPasswordInput.focus();
    });
  }

  /* -------------------------------------------------------------
   * DASHBOARD RENDERER (TEAMS, SCORES & MEMBER TURN UNLOCKS)
   * ----------------------------------------------------------- */
  function renderServerDashboard(data) {
    if (!data) return;

    // 1. Header Stage & Clock
    let stageLabel = `STAGE: ${data.status}`;
    if (data.status === 'LOBBY') stageLabel = 'STAGE: LOBBY & CONVOCATION';
    else if (data.status === 'ROUND_1') stageLabel = 'STAGE: ROUND 1 ACTIVE';
    else if (data.status === 'ROUND_2') stageLabel = 'STAGE: ROUND 2 ACTIVE';
    else if (data.status === 'ROUND_3') stageLabel = 'STAGE: ROUND 3 FINALS';
    else if (data.status === 'FINISHED') stageLabel = 'STAGE: TOURNAMENT CONCLUDED';
    else if (data.status.startsWith('INTERMEDIATE')) stageLabel = `STAGE: ${data.status.replace('_', ' ')} INTERMISSION`;

    headerStageText.textContent = stageLabel;

    // Timer calculation
    const rs = data.roundState;
    if (rs && rs.active) {
      if (rs.isPaused) {
        metricTimer.textContent = `${formatTime(rs.remainingMsOnPause)} (PAUSED)`;
        btnPauseResume.textContent = '▶ Resume';
      } else {
        const remaining = Math.max(0, rs.endTime - Date.now());
        metricTimer.textContent = formatTime(remaining);
        btnPauseResume.textContent = '⏸ Pause';
      }
    } else if (data.status === 'LOBBY' && data.lobbyTimer && data.lobbyTimer.active) {
      const remaining = Math.max(0, data.lobbyTimer.endTime - Date.now());
      metricTimer.textContent = `${formatTime(remaining)} (LOBBY)`;
      btnPauseResume.textContent = '⏸ Pause';
    } else {
      metricTimer.textContent = '--:--';
      btnPauseResume.textContent = '⏸ Pause';
    }

    // Counts
    metricTotalSquads.textContent = data.teams?.length || 0;
    metricOnlinePlayers.textContent = data.onlinePlayers || 0;
    if (unassignedCount) unassignedCount.textContent = data.unassignedPlayers?.length || 0;

    // Sequential stage unlock safety logic
    updateRoundButtons(data.status, data.currentRound);

    // 2. Render Teams & Member Unlock Pipelines
    renderTeamsPipeline(data.teams || []);
  }

  function updateRoundButtons(status, currentRound) {
    if (!btnStartRound1 || !btnStartRound2 || !btnStartRound3) return;

    btnStartRound1.classList.remove('btn-pulse');
    btnStartRound2.classList.remove('btn-pulse');
    btnStartRound3.classList.remove('btn-pulse');

    if (status === 'LOBBY') {
      btnStartRound1.disabled = false;
      btnStartRound1.textContent = '▶ Round 1';
      btnStartRound1.title = 'Launch Round 1: Keyword Cipher Quest';
      btnStartRound1.className = 'btn btn-sm btn-primary';

      btnStartRound2.disabled = true;
      btnStartRound2.textContent = '🔒 Round 2';
      btnStartRound2.title = 'Locked: Complete Round 1 first to unlock Round 2';
      btnStartRound2.className = 'btn btn-sm btn-secondary';

      btnStartRound3.disabled = true;
      btnStartRound3.textContent = '🔒 Round 3';
      btnStartRound3.title = 'Locked: Complete Round 2 first to unlock Round 3';
      btnStartRound3.className = 'btn btn-sm btn-gold';
    } else if (status === 'ROUND_1') {
      btnStartRound1.disabled = true;
      btnStartRound1.textContent = '⏳ Round 1 Active';
      btnStartRound1.title = 'Round 1 is currently in progress';
      btnStartRound1.className = 'btn btn-sm btn-primary';

      btnStartRound2.disabled = true;
      btnStartRound2.textContent = '🔒 Round 2';
      btnStartRound2.title = 'Locked: Round 1 in progress';
      btnStartRound2.className = 'btn btn-sm btn-secondary';

      btnStartRound3.disabled = true;
      btnStartRound3.textContent = '🔒 Round 3';
      btnStartRound3.title = 'Locked: Complete Round 2 first';
      btnStartRound3.className = 'btn btn-sm btn-gold';
    } else if (status === 'INTERMEDIATE_1') {
      btnStartRound1.disabled = true;
      btnStartRound1.textContent = '✓ Round 1 Done';
      btnStartRound1.title = 'Round 1 completed';
      btnStartRound1.className = 'btn btn-sm btn-secondary';

      // UNLOCKED AFTER ROUND 1
      btnStartRound2.disabled = false;
      btnStartRound2.textContent = '▶ Launch Round 2';
      btnStartRound2.title = 'UNLOCKED: Ready to launch Round 2: The Enigma Vault';
      btnStartRound2.className = 'btn btn-sm btn-primary btn-pulse';

      btnStartRound3.disabled = true;
      btnStartRound3.textContent = '🔒 Round 3';
      btnStartRound3.title = 'Locked: Complete Round 2 first';
      btnStartRound3.className = 'btn btn-sm btn-gold';
    } else if (status === 'ROUND_2') {
      btnStartRound1.disabled = true;
      btnStartRound1.textContent = '✓ Round 1 Done';
      btnStartRound1.className = 'btn btn-sm btn-secondary';

      btnStartRound2.disabled = true;
      btnStartRound2.textContent = '⏳ Round 2 Active';
      btnStartRound2.title = 'Round 2 is currently in progress';
      btnStartRound2.className = 'btn btn-sm btn-primary';

      btnStartRound3.disabled = true;
      btnStartRound3.textContent = '🔒 Round 3';
      btnStartRound3.title = 'Locked: Complete Round 2 first';
      btnStartRound3.className = 'btn btn-sm btn-gold';
    } else if (status === 'INTERMEDIATE_2') {
      btnStartRound1.disabled = true;
      btnStartRound1.textContent = '✓ Round 1 Done';
      btnStartRound1.className = 'btn btn-sm btn-secondary';

      btnStartRound2.disabled = true;
      btnStartRound2.textContent = '✓ Round 2 Done';
      btnStartRound2.className = 'btn btn-sm btn-secondary';

      // UNLOCKED AFTER ROUND 2
      btnStartRound3.disabled = false;
      btnStartRound3.textContent = '★ Launch Round 3';
      btnStartRound3.title = 'UNLOCKED: Ready to launch Round 3: Sher"unlocking" Homies';
      btnStartRound3.className = 'btn btn-sm btn-gold btn-pulse';
    } else if (status === 'ROUND_3') {
      btnStartRound1.disabled = true;
      btnStartRound1.textContent = '✓ Round 1 Done';
      btnStartRound1.className = 'btn btn-sm btn-secondary';

      btnStartRound2.disabled = true;
      btnStartRound2.textContent = '✓ Round 2 Done';
      btnStartRound2.className = 'btn btn-sm btn-secondary';

      btnStartRound3.disabled = true;
      btnStartRound3.textContent = '⏳ Round 3 Active';
      btnStartRound3.title = 'Round 3 Finals in progress';
      btnStartRound3.className = 'btn btn-sm btn-gold';
    } else if (status === 'FINISHED') {
      btnStartRound1.disabled = true;
      btnStartRound1.textContent = '✓ Round 1 Done';
      btnStartRound1.className = 'btn btn-sm btn-secondary';

      btnStartRound2.disabled = true;
      btnStartRound2.textContent = '✓ Round 2 Done';
      btnStartRound2.className = 'btn btn-sm btn-secondary';

      btnStartRound3.disabled = true;
      btnStartRound3.textContent = '👑 Concluded';
      btnStartRound3.className = 'btn btn-sm btn-gold';
    }
  }

  /* -------------------------------------------------------------
   * TOAST NOTIFICATIONS
   * ----------------------------------------------------------- */
  const adminToastContainer = document.getElementById('adminToastContainer');

  function showToast(message, type = 'info') {
    if (!adminToastContainer) return;
    const toast = document.createElement('div');
    toast.className = `admin-toast toast-${type}`;
    let icon = 'ℹ️';
    if (type === 'success') icon = '✅';
    else if (type === 'warning') icon = '⚡';
    else if (type === 'error') icon = '⚠️';

    toast.innerHTML = `<span>${icon}</span> <span>${escapeHtml(message)}</span>`;
    adminToastContainer.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(8px)';
      toast.style.transition = 'all 0.25s ease';
      setTimeout(() => toast.remove(), 250);
    }, 3200);
  }

  function renderTeamsPipeline(teams) {
    const filter = (squadFilterInput.value || '').toLowerCase().trim();

    // Sort by Total Score descending (Live Rank Order)
    const sortedTeams = [...teams].sort((a, b) => {
      if (b.totalScore !== a.totalScore) return b.totalScore - a.totalScore;
      return 0;
    });

    const filtered = sortedTeams.filter(t => 
      t.name.toLowerCase().includes(filter) || 
      t.teamId.toLowerCase().includes(filter) ||
      (t.membersDetail || []).some(m => m.name.toLowerCase().includes(filter))
    );

    if (filtered.length === 0) {
      teamsCardList.innerHTML = `
        <div class="loading-state">
          <span>No squads registered or matching filter.</span>
        </div>
      `;
      return;
    }

    teamsCardList.innerHTML = '';

    filtered.forEach((team, index) => {
      const rank = index + 1;
      const isFirst = rank === 1;
      const card = document.createElement('div');
      card.className = `team-card-row ${isFirst ? 'rank-first' : ''}`;

      // Check if score changed to trigger visual pulse
      const prevScore = previousScores.get(team.teamId);
      const isScoreNew = prevScore !== undefined && team.totalScore > prevScore;
      previousScores.set(team.teamId, team.totalScore);

      // Members Turn Order Pipeline ("the team members od / live unlocks")
      const members = team.membersDetail || [];
      const allSlotsHtml = [];

      members.forEach((mem, idx) => {
        let statusClass = 'status-locked';
        let statusIcon = '🔒';
        let label = 'Locked';

        if (mem.turnStatus === 'SOLVED') {
          statusClass = 'status-solved';
          statusIcon = '✓';
          label = mem.fragment ? `[${escapeHtml(mem.fragment)}]` : 'Solved';
        } else if (mem.turnStatus === 'ACTIVE') {
          statusClass = 'status-active';
          statusIcon = '<span class="active-pulse"></span>';
          label = 'SOLVING NOW';
        } else if (mem.turnStatus === 'LOBBY') {
          statusClass = 'status-lobby';
          statusIcon = mem.isOnline ? '🟢' : '⚪';
          label = mem.isLeader ? 'Leader' : 'Ready';
        } else {
          statusClass = 'status-locked';
          statusIcon = '🔒';
          label = mem.isLeader ? 'Leader' : 'Waiting';
        }

        const leaderBadge = mem.isLeader ? '<span class="leader-crown-tag" title="Squad Leader">👑</span>' : '';
        const orderNumber = `OD ${idx + 1}`;

        allSlotsHtml.push(`
          <div class="member-unlock-pill ${statusClass}" title="${escapeHtml(mem.name)} (${mem.turnStatus})">
            <span class="member-order-tag">${orderNumber}</span>
            <span>${statusIcon}</span>
            <span class="member-name-tag">${escapeHtml(mem.name)}</span>
            ${leaderBadge}
            <span class="member-stage-label">${label}</span>
          </div>
        `);
      });

      // Display vacant slots up to 4 if team is still forming
      for (let emptyIdx = members.length; emptyIdx < 4; emptyIdx++) {
        allSlotsHtml.push(`
          <div class="member-unlock-pill status-vacant" title="Slot ${emptyIdx + 1}: Waiting for student">
            <span class="member-order-tag">OD ${emptyIdx + 1}</span>
            <span style="opacity: 0.5;">⚪</span>
            <span class="member-name-tag" style="opacity: 0.6; font-style: italic;">[Open Slot]</span>
          </div>
        `);
      }

      const isRound2 = adminState?.status === 'ROUND_2' || adminState?.currentRound === 2;
      const isRound3 = adminState?.status === 'ROUND_3' || adminState?.currentRound === 3;
      let roundBadge = '';
      if (isRound2) {
        if (team.isRoundCompleted || (team.nodesBreached !== undefined && team.nodesBreached >= 10)) {
          roundBadge = `<span style="background:rgba(16,185,129,0.18); color:#34d399; border:1px solid #10b981; font-size:0.75rem; padding:2px 8px; border-radius:4px; font-weight:800; font-family:monospace;">✓ 10/10 NODES BREACHED</span>`;
        } else {
          const curN = team.activeNodeNumber || ((team.nodesBreached || 0) + 1);
          roundBadge = `<span style="background:rgba(0,245,255,0.15); color:#00f5ff; border:1px solid rgba(0,245,255,0.35); font-size:0.75rem; padding:2px 8px; border-radius:4px; font-weight:800; font-family:monospace;">⚡ NODE ${curN}/10 (${team.nodesBreached || 0} Breached)</span>`;
        }
      } else if (isRound3) {
        if (team.isRoundCompleted) {
          roundBadge = `<span style="background:#fef3c7; color:#92400e; border:1px solid #f59e0b; font-size:0.75rem; padding:2px 8px; border-radius:4px; font-weight:800; font-family:monospace;">⚖️ CASE SOLVED</span>`;
        } else {
          roundBadge = `<span style="background:#fef3c7; color:#92400e; border:1px solid #f59e0b; font-size:0.75rem; padding:2px 8px; border-radius:4px; font-weight:800; font-family:monospace;">🕵️ EVIDENCE ${team.activeNodeNumber || 1}/4</span>`;
        }
      }

      const pipelineHtml = allSlotsHtml.join('<span class="pipeline-arrow">➔</span>');

      card.innerHTML = `
        <!-- Left: Team Identity & Seal -->
        <div class="team-meta-col">
          <div class="team-rank-num">#${rank}</div>
          <div class="team-name-block">
            <span class="team-name-title">${team.benchNumber ? `<span class="bench-tag" style="background:#0f223d; color:#fbbf24; font-size:0.75rem; padding:2px 7px; border-radius:4px; font-weight:800; margin-right:6px;">${escapeHtml(team.benchNumber)}</span>` : ''}${escapeHtml(team.name)}</span>
            <div class="team-seal-tag">
              <span class="seal-badge">${team.teamId}</span>
              <span class="gender-badge ${team.gender}">${team.gender}</span>
              <span style="color: #64748b; font-weight: 600;">${members.length} Players</span>
              ${roundBadge}
            </div>
          </div>
        </div>

        <!-- Center: Live Member Turn Sequence & Real-Time Unlocks -->
        <div class="team-members-pipeline">
          ${pipelineHtml}
        </div>

        <!-- Right: Dynamic Cumulative Score & Quick Action Buttons -->
        <div class="team-score-actions-col">
          <div class="team-score-display-box">
            <div class="team-score-num ${isScoreNew ? 'score-updated' : ''}">
              ${team.totalScore.toLocaleString()}<span class="score-pts-lbl">TOTAL PTS</span>
            </div>
            <div class="round-scores-breakdown">
              <span class="breakdown-pill r1-pill" title="Stage 1 Marks">R1: ${(team.roundScores?.[1] || 0).toLocaleString()}</span>
              <span class="breakdown-pill r2-pill" title="Stage 2 Marks">R2: ${(team.roundScores?.[2] || 0).toLocaleString()}</span>
              <span class="breakdown-pill r3-pill" title="Stage 3 Marks">R3: ${(team.roundScores?.[3] || 0).toLocaleString()}</span>
            </div>
          </div>
          <div class="team-action-buttons">
            <button class="action-icon-btn btn-advance" data-team="${team.teamId}" data-name="${escapeHtml(team.name)}" title="Unlock / force-advance next member's turn">
              ${isRound2 ? '⚡ Skip Node' : (isRound3 ? '⚖️ Skip Evidence' : '⚡ Skip')}
            </button>
            <button class="action-icon-btn btn-override" data-team="${team.teamId}" data-name="${escapeHtml(team.name)}" title="Adjust score">
              ✏️
            </button>
          </div>
        </div>
      `;

      teamsCardList.appendChild(card);
    });

    // Attach row action listeners
    document.querySelectorAll('.btn-advance').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const teamId = btn.getAttribute('data-team');
        const teamName = btn.getAttribute('data-name');
        const isR2 = adminState?.status === 'ROUND_2' || adminState?.currentRound === 2;
        sendAdminAction('force_advance', { teamId, reason: 'Proctor bypass' });
        showToast(isR2 ? `⚡ Node unlocked for ${teamName} [${teamId}]` : `⚡ Turn unlocked for ${teamName} [${teamId}]`, 'warning');
      });
    });

    document.querySelectorAll('.btn-override').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const teamId = btn.getAttribute('data-team');
        const teamName = btn.getAttribute('data-name');
        selectedSquadForOverride = teamId;
        scoreModalSquadName.textContent = `Team: ${teamName} [${teamId}]`;
        scoreDeltaInput.value = '';
        scoreReasonInput.value = '';
        scoreOverrideModal.classList.remove('hidden');
      });
    });
  }

  /* -------------------------------------------------------------
   * ACTIONS & BUTTON LISTENERS
   * ----------------------------------------------------------- */
  if (btnStartLobbyTimer) {
    btnStartLobbyTimer.addEventListener('click', () => {
      sendAdminAction('start_lobby_timer', { durationSec: 300 });
      showToast('⏳ 5-Minute Lobby Convocation Timer Started', 'info');
    });
  }

  if (btnTriggerAutoMerge) {
    btnTriggerAutoMerge.addEventListener('click', () => {
      sendAdminAction('auto_merge');
      showToast('⚡ Auto-Merge Executed for Unassigned Players', 'info');
    });
  }

  btnStartRound1.addEventListener('click', () => {
    sendAdminAction('start_round', { roundNumber: 1 });
    showToast('▶ Round 1 (Keyword Cipher Quest) Launched!', 'success');
  });

  btnStartRound2.addEventListener('click', () => {
    if (adminState && adminState.status === 'LOBBY') {
      showToast('⚠️ Round 2 is locked! Please run and conclude Round 1 first.', 'warning');
      return;
    }
    sendAdminAction('start_round', { roundNumber: 2 });
    showToast('▶ Round 2 (The Enigma Vault) Launched!', 'success');
  });

  btnStartRound3.addEventListener('click', () => {
    if (adminState && (adminState.status === 'LOBBY' || adminState.status === 'ROUND_1' || adminState.status === 'INTERMEDIATE_1')) {
      showToast('⚠️ Round 3 is locked! Please run and conclude Round 2 first.', 'warning');
      return;
    }
    sendAdminAction('start_round', { roundNumber: 3 });
    showToast('★ Round 3 (Sher"unlocking" Homies) Launched!', 'warning');
  });

  btnPauseResume.addEventListener('click', () => {
    if (adminState?.roundState?.isPaused) {
      sendAdminAction('resume_round');
      showToast('▶ Tournament Clock Resumed', 'success');
    } else {
      sendAdminAction('pause_round');
      showToast('⏸ Tournament Clock Paused', 'warning');
    }
  });

  btnExtendTime1m.addEventListener('click', () => {
    sendAdminAction('extend_time', { seconds: 60 });
    showToast('⏱ +1 Minute Added to Round Timer', 'info');
  });

  btnForceEndRound.addEventListener('click', () => {
    sendAdminAction('end_round');
    showToast('⏹ Round Concluded by Proctor', 'warning');
  });

  squadFilterInput.addEventListener('input', () => {
    if (adminState?.teams) {
      renderTeamsPipeline(adminState.teams);
    }
  });

  // Score Override Modal
  btnCancelScoreOverride.addEventListener('click', () => {
    scoreOverrideModal.classList.add('hidden');
    selectedSquadForOverride = null;
  });

  btnConfirmScoreOverride.addEventListener('click', () => {
    const delta = parseInt(scoreDeltaInput.value, 10);
    const reason = scoreReasonInput.value.trim() || 'Manual adjustment';

    if (isNaN(delta) || delta === 0) {
      alert('Enter a valid non-zero point adjustment (e.g. +100 or -50).');
      return;
    }

    if (selectedSquadForOverride) {
      sendAdminAction('override_score', {
        teamId: selectedSquadForOverride,
        scoreDelta: delta,
        reason
      });
      showToast(`Score adjusted (${delta > 0 ? '+' : ''}${delta}) for squad [${selectedSquadForOverride}]`, 'success');
      scoreOverrideModal.classList.add('hidden');
    }
  });

  btnExportResults.addEventListener('click', () => {
    window.open(`/api/export?secret=${encodeURIComponent(adminPassword)}`, '_blank');
  });

  btnResetAll.addEventListener('click', () => {
    const code = prompt('WARNING: This will wipe all current players, teams, and scores!\nType "CONFIRM RESET" to proceed:');
    if (code === 'CONFIRM RESET') {
      sendAdminAction('reset_game');
      showToast('Tournament State Wiped and Reset to Clean Lobby', 'error');
    }
  });

  // Spacebar stage advance shortcut
  window.addEventListener('keydown', (e) => {
    if (['INPUT', 'TEXTAREA'].includes(e.target.tagName)) return;
    if (e.code === 'Space' || e.key === ' ') {
      e.preventDefault();
      sendAdminAction('advance_stage');
      showToast('Advancing Tournament Stage via Spacebar...', 'info');
    }
  });

  async function fetchLanIp() {
    try {
      const res = await fetch('/api/lan-ips');
      const data = await res.json();
      const badge = document.getElementById('adminLanIpBadge');
      if (badge && data && data.ips && data.ips.length > 0) {
        const wifiObj = data.ips.find(i => (i.interface || '').toLowerCase().includes('wi-fi')) || data.ips[0];
        const ipStr = typeof wifiObj === 'object' ? wifiObj.address : wifiObj;
        badge.textContent = `📶 http://${ipStr}:${data.port || 5000}`;
      }
    } catch (e) {
      // Keep static fallback
    }
  }
  fetchLanIp();

  initSocket();
})();
