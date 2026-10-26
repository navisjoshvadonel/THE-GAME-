/**
 * THE ACADEMIC DECATHLON — RETRO JULES TERMINAL CONTROLLER
 * Optimized for One-Bench One-Leader physical setup, 2 or 3 members,
 * 1920x1080p widescreen scaling, zero idle GPU/CPU battery drain,
 * and seamless Round 1 gameplay flow.
 */

(function () {
  'use strict';

  const urlParams = new URLSearchParams(window.location.search);
  const paramToken = urlParams.get('token');
  const paramBench = urlParams.get('bench');

  // Check for reset/switch query parameter
  if (urlParams.get('reset') === '1' || urlParams.get('switch') === '1') {
    sessionStorage.removeItem('campus_puzzle_session_token');
    localStorage.removeItem('campus_puzzle_session_token');
    try {
      history.replaceState(null, '', window.location.pathname);
    } catch (e) {}
  }

  // Session & State (Support tab isolation via sessionStorage & ?bench/?token URL params)
  let socket = null;
  let sessionToken = paramToken || sessionStorage.getItem('campus_puzzle_session_token') || localStorage.getItem('campus_puzzle_session_token');
  let currentClientState = null;
  let previousScore = 0;
  let lastTurnIndex = -1;
  let autoAdvanceTimer = null;
  let operativeTimerInterval = null;
  let clueJustUnlockedPlayed = false;

  // Sound Engine
  const sound = window.soundFx;
  if (sound && localStorage.getItem('campus_sound_muted') === 'true') {
    sound.muted = true;
  }

  // DOM Elements - Navigation & Header
  const connectionStatus = document.getElementById('connectionStatus');
  const benchIdentityBadge = document.getElementById('benchIdentityBadge');
  const navBenchTag = document.getElementById('navBenchTag');
  const navTeamName = document.getElementById('navTeamName');
  const navSquadScore = document.getElementById('navSquadScore');
  const btnHeaderHost = document.getElementById('btnHeaderHost');
  const btnSwitchBench = document.getElementById('btnSwitchBench');
  const soundToggleBtn = document.getElementById('soundToggleBtn');
  const soundIcon = document.getElementById('soundIcon');
  const soundText = document.getElementById('soundText');
  const btnFullscreen = document.getElementById('btnFullscreen');
  const toastContainer = document.getElementById('toastContainer');

  // Screens
  const viewRegister = document.getElementById('viewRegister');
  const viewLobby = document.getElementById('viewLobby');
  const viewGame = document.getElementById('viewGame');
  const viewRound2Game = document.getElementById('viewRound2Game');
  const viewRound3Game = document.getElementById('viewRound3Game');
  const viewFinished = document.getElementById('viewFinished');

  // Bench Registration Elements
  const tabPlayerRole = document.getElementById('tabPlayerRole');
  const tabHostRole = document.getElementById('tabHostRole');
  const playerLoginBox = document.getElementById('playerLoginBox');
  const hostLoginBox = document.getElementById('hostLoginBox');
  const customBenchInput = document.getElementById('customBenchInput');
  const teamNameInput = document.getElementById('teamNameInput');
  const btnRandomTeamName = document.getElementById('btnRandomTeamName');
  const sizeRadio2 = document.getElementById('sizeRadio2');
  const sizeRadio3 = document.getElementById('sizeRadio3');
  const sizeRadio4 = document.getElementById('sizeRadio4');
  const member3Container = document.getElementById('member3Container');
  const member4Container = document.getElementById('member4Container');
  const leaderNameInput = document.getElementById('leaderNameInput');
  const member2NameInput = document.getElementById('member2NameInput');
  const member3NameInput = document.getElementById('member3NameInput');
  const member4NameInput = document.getElementById('member4NameInput');
  const btnInitializeBench = document.getElementById('btnInitializeBench');
  const registerError = document.getElementById('registerError');
  const benchChipsContainer = document.getElementById('benchChipsContainer');

  // Host Login
  const homeHostPassword = document.getElementById('homeHostPassword');
  const btnHomeHostLogin = document.getElementById('btnHomeHostLogin');
  const hostLoginError = document.getElementById('hostLoginError');
  const hostForm = document.getElementById('hostForm');
  const linkSwitchToStudent = document.getElementById('linkSwitchToStudent');

  // Lounge (Waiting) Elements
  const loungeBenchTitle = document.getElementById('loungeBenchTitle');
  const loungeMemberCount = document.getElementById('loungeMemberCount');
  const loungeDivisionBadge = document.getElementById('loungeDivisionBadge');
  const loungeMembersGrid = document.getElementById('loungeMembersGrid');
  const btnTestSound = document.getElementById('btnTestSound');

  // Game Stage Elements
  const gameBenchTag = document.getElementById('gameBenchTag');
  const gameTeamName = document.getElementById('gameTeamName');
  const gameRoundTitle = document.getElementById('gameRoundTitle');
  const gameTeamScore = document.getElementById('gameTeamScore');
  const floatingScorePopup = document.getElementById('floatingScorePopup');
  const turnSequenceTracker = document.getElementById('turnSequenceTracker');
  const trackerCurrentStepText = document.getElementById('trackerCurrentStepText');

  // Sidebar Elements
  const activeScholarName = document.getElementById('activeScholarName');
  const activeScholarRole = document.getElementById('activeScholarRole');
  const persistentVaultSlots = document.getElementById('persistentVaultSlots');
  const vaultStatusRatio = document.getElementById('vaultStatusRatio');

  // Riddle Challenge Box
  const boxYourTurn = document.getElementById('boxYourTurn');
  const puzzleCategoryTag = document.getElementById('puzzleCategoryTag');
  const puzzleStepCounter = document.getElementById('puzzleStepCounter');
  const puzzleTitle = document.getElementById('puzzleTitle');
  const puzzlePromptText = document.getElementById('puzzlePromptText');
  const btnToggleClue = document.getElementById('btnToggleClue');
  const clueLockIcon = document.getElementById('clueLockIcon');
  const clueLockLabel = document.getElementById('clueLockLabel');
  const operativeTimerStrip = document.getElementById('operativeTimerStrip');
  const operativeTimeRemaining = document.getElementById('operativeTimeRemaining');
  const operativeProgressBar = document.getElementById('operativeProgressBar');
  const liveBountyBadge = document.getElementById('liveBountyBadge');
  const leaderTimerStrip = document.getElementById('leaderTimerStrip');
  const leaderTimeRemaining = document.getElementById('leaderTimeRemaining');
  const leaderProgressBar = document.getElementById('leaderProgressBar');
  const leaderLiveBountyBadge = document.getElementById('leaderLiveBountyBadge');
  const clueContent = document.getElementById('clueContent');
  const puzzleClueText = document.getElementById('puzzleClueText');
  const puzzleHintText = document.getElementById('puzzleHintText');
  const puzzleAnswerInput = document.getElementById('puzzleAnswerInput');
  const slotsBoard = document.getElementById('slotsBoard');
  const slotsCountLabel = document.getElementById('slotsCountLabel');
  const puzzleHiddenInput = document.getElementById('puzzleHiddenInput');
  const btnClearSlots = document.getElementById('btnClearSlots');
  const btnSubmitAnswer = document.getElementById('btnSubmitAnswer');
  const puzzleFeedbackBox = document.getElementById('puzzleFeedbackBox');
  const boxPassConsole = document.getElementById('boxPassConsole');
  const passTitleText = document.getElementById('passTitleText');
  const passDescText = document.getElementById('passDescText');
  const btnNextTurnReady = document.getElementById('btnNextTurnReady');

  // Leader Master Synthesis Chamber
  const boxLeaderTurn = document.getElementById('boxLeaderTurn');
  const leaderTaskTitle = document.getElementById('leaderTaskTitle');
  const leaderInstructions = document.getElementById('leaderInstructions');
  const fragmentsBank = document.getElementById('fragmentsBank');
  const leaderAnswerInput = document.getElementById('leaderAnswerInput');
  const inspectorKeywordsPills = document.getElementById('inspectorKeywordsPills');
  const wordCountDisplay = document.getElementById('wordCountDisplay');
  const verbStatusBadge = document.getElementById('verbStatusBadge');
  const btnSubmitLeaderAnswer = document.getElementById('btnSubmitLeaderAnswer');
  const leaderFeedbackBox = document.getElementById('leaderFeedbackBox');

  // Completion & Intermission Boxes
  const boxRoundCompleted = document.getElementById('boxRoundCompleted');
  const completeTotalScore = document.getElementById('completeTotalScore');
  const completeThesisText = document.getElementById('completeThesisText');
  const boxRoundLocked = document.getElementById('boxRoundLocked');
  const lockedTitle = document.getElementById('lockedTitle');
  const lockedSub = document.getElementById('lockedSub');

  // Round 2 Cyber Terminal Elements
  const r2GameBenchTag = document.getElementById('r2GameBenchTag');
  const r2GameTeamName = document.getElementById('r2GameTeamName');
  const r2GameTeamScore = document.getElementById('r2GameTeamScore');
  const r2FloatingScorePopup = document.getElementById('r2FloatingScorePopup');
  const r2TrackerStepText = document.getElementById('r2TrackerStepText');
  const r2CircuitNodesFlow = document.getElementById('r2CircuitNodesFlow');
  const r2ActivePlayerName = document.getElementById('r2ActivePlayerName');
  const r2ActivePlayerRole = document.getElementById('r2ActivePlayerRole');
  const r2VaultRatio = document.getElementById('r2VaultRatio');
  const r2BreachedWordsList = document.getElementById('r2BreachedWordsList');
  const r2CategoryTag = document.getElementById('r2CategoryTag');
  const r2NodeCounter = document.getElementById('r2NodeCounter');
  const r2AttemptBadge = document.getElementById('r2AttemptBadge');
  const r2NodeTitle = document.getElementById('r2NodeTitle');
  const r2BridgeBox = document.getElementById('r2BridgeBox');
  const r2BridgeClueText = document.getElementById('r2BridgeClueText');
  const r2PromptText = document.getElementById('r2PromptText');
  const r2WordLengthBadge = document.getElementById('r2WordLengthBadge');
  const r2HackMatrixRows = document.getElementById('r2HackMatrixRows');
  const r2HiddenInput = document.getElementById('r2HiddenInput');
  const r2FeedbackBox = document.getElementById('r2FeedbackBox');
  const r2VirtualKeyboard = document.getElementById('r2VirtualKeyboard');
  const btnR2Clear = document.getElementById('btnR2Clear');
  const btnR2Submit = document.getElementById('btnR2Submit');
  const boxR2NodePassed = document.getElementById('boxR2NodePassed');
  const r2PassTitleText = document.getElementById('r2PassTitleText');
  const r2PassDescText = document.getElementById('r2PassDescText');
  const btnR2NextNodeReady = document.getElementById('btnR2NextNodeReady');
  const r2TerminalStageCard = document.getElementById('r2TerminalStageCard');
  const boxR2RoundCompleted = document.getElementById('boxR2RoundCompleted');
  const r2CompletedKeysGrid = document.getElementById('r2CompletedKeysGrid');
  const r2CompleteTotalScore = document.getElementById('r2CompleteTotalScore');
  const boxR2Locked = document.getElementById('boxR2Locked');
  const r2LockedTitle = document.getElementById('r2LockedTitle');
  const r2LockedSub = document.getElementById('r2LockedSub');
  const r2WaitingTeammateInfo = document.getElementById('r2WaitingTeammateInfo');
  const r2WaitingPlayerName = document.getElementById('r2WaitingPlayerName');
  const r2WaitingPlayerRole = document.getElementById('r2WaitingPlayerRole');

  // Round 2 Mission Briefing & Modal Elements
  const boxRound2Briefing = document.getElementById('boxRound2Briefing');
  const btnToggleR2Rules = document.getElementById('btnToggleR2Rules');
  const modalR2Rules = document.getElementById('modalR2Rules');
  const btnCloseR2Rules = document.getElementById('btnCloseR2Rules');
  const btnDismissR2Rules = document.getElementById('btnDismissR2Rules');

  let r2CurrentGuess = '';
  let r2KeyStatuses = {};
  let r2NodePassedState = false;
  let lastR2RenderedNode = -1;

  /* -------------------------------------------------------------
   * UTILITIES: TOASTS & UI HELPERS
   * ----------------------------------------------------------- */
  function showToast(message, type = 'info') {
    if (!toastContainer) return;
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.innerHTML = `<span>${message}</span>`;
    toastContainer.appendChild(toast);
    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(10px)';
      setTimeout(() => toast.remove(), 250);
    }, 3500);
  }

  function setConnectionStatus(connected, text) {
    if (!connectionStatus) return;
    if (connected) {
      connectionStatus.className = 'status-pill status-connected';
      connectionStatus.querySelector('.status-text').textContent = text || 'LAN LINKED';
    } else {
      connectionStatus.className = 'status-pill status-connecting';
      connectionStatus.querySelector('.status-text').textContent = text || 'RECONNECTING...';
    }
  }

  let _activeScreen = null;
  const _ALL_SCREENS = [viewRegister, viewLobby, viewGame, viewRound2Game, viewRound3Game, viewFinished];

  function switchScreen(screen) {
    if (_activeScreen === screen) return; // Already on this screen — skip DOM work
    if (_activeScreen) {
      _activeScreen.classList.add('hidden');
      _activeScreen.classList.remove('active');
      // Clean up R1 turn timer when leaving game view
      if (_activeScreen === viewGame) {
        clearInterval(operativeTimerInterval);
        operativeTimerInterval = null;
      }
    }
    _activeScreen = screen || null;
    if (screen) {
      screen.classList.remove('hidden');
      screen.classList.add('active');
    }
  }

  function triggerScorePopup(delta) {
    if (!floatingScorePopup) return;
    floatingScorePopup.textContent = `+${delta} PTS`;
    floatingScorePopup.classList.remove('hidden');
    floatingScorePopup.style.animation = 'none';
    void floatingScorePopup.offsetWidth; // Reflow
    floatingScorePopup.style.animation = 'floatScore 1.8s ease-out forwards';
    setTimeout(() => floatingScorePopup.classList.add('hidden'), 1800);
  }

  /* -------------------------------------------------------------
   * BATTERY-OPTIMIZED PARTICLE BURST (0% CPU AT IDLE)
   * ----------------------------------------------------------- */
  const canvas = document.getElementById('particleCanvas');
  let ctx = canvas ? canvas.getContext('2d') : null;
  let particles = [];
  let animFrameId = null;

  function resizeCanvas() {
    if (!canvas) return;
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }
  let resizeTimeout = null;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(resizeCanvas, 150);
  });
  resizeCanvas();

  function triggerParticleBurst() {
    if (!ctx || !canvas) return;
    const colors = ['#00f0ff', '#ffd60a', '#ff007f', '#00ff88', '#ffffff'];
    const cx = canvas.width / 2;
    const cy = canvas.height / 3;

    for (let i = 0; i < 35; i++) {
      particles.push({
        x: cx,
        y: cy,
        vx: (Math.random() - 0.5) * 10,
        vy: (Math.random() - 0.8) * 12,
        size: Math.random() * 5 + 3,
        color: colors[Math.floor(Math.random() * colors.length)],
        life: 55,
        maxLife: 55
      });
    }

    if (!animFrameId) {
      animFrameId = requestAnimationFrame(renderParticles);
    }
  }

  function renderParticles() {
    if (!ctx || !canvas) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    for (let i = particles.length - 1; i >= 0; i--) {
      const p = particles[i];
      p.x += p.vx;
      p.y += p.vy;
      p.vy += 0.32; // Gravity
      p.life--;

      const alpha = p.life / p.maxLife;
      ctx.fillStyle = p.color;
      ctx.globalAlpha = Math.max(0, alpha);
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fill();

      if (p.life <= 0) {
        particles.splice(i, 1);
      }
    }
    ctx.globalAlpha = 1.0;

    if (particles.length > 0) {
      animFrameId = requestAnimationFrame(renderParticles);
    } else {
      // Complete shutdown when empty — 0% CPU consumption!
      animFrameId = null;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
  }

  /* -------------------------------------------------------------
   * SOCKET INITIALIZATION & RECONNECTION
   * ----------------------------------------------------------- */
  function initSocket() {
    socket = io({
      transports: ['websocket'],
      reconnection: true,
      reconnectionAttempts: Infinity,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 3000
    });

    socket.on('connect', async () => {
      setConnectionStatus(true, 'LAN LINKED');

      if (!sessionToken && paramBench) {
        try {
          const resp = await fetch(`/api/bench-session?bench=${encodeURIComponent(paramBench)}`);
          const data = await resp.json();
          if (data && data.success && data.sessionToken) {
            sessionToken = data.sessionToken;
            sessionStorage.setItem('campus_puzzle_session_token', sessionToken);
          }
        } catch (e) {
          console.warn('Bench lookup failed', e);
        }
      }

      if (sessionToken) {
        socket.emit('reconnect_session', { sessionToken }, (response) => {
          if (response && response.success) {
            handleSyncState(response.clientState);
            showToast('Bench session restored!', 'success');
          } else {
            sessionStorage.removeItem('campus_puzzle_session_token');
            localStorage.removeItem('campus_puzzle_session_token');
            sessionToken = null;
            switchScreen(viewRegister);
          }
        });
      } else {
        switchScreen(viewRegister);
      }
    });

    socket.on('disconnect', () => {
      setConnectionStatus(false, 'DISCONNECTED');
    });

    socket.on('connect_error', () => {
      setConnectionStatus(false, 'SERVER UNREACHABLE');
    });

    socket.on('sync_state', (state) => {
      handleSyncState(state);
    });

    socket.on('round_started', (data) => {
      showToast(`Round ${data.roundNumber} has officially started!`, 'success');
      if (sound) sound.playTurnUnlock();
      socket.emit('request_state_refresh', { sessionToken });
    });

    socket.on('round_paused', () => {
      showToast('The host has paused the round.', 'info');
      socket.emit('request_state_refresh', { sessionToken });
    });

    socket.on('round_resumed', () => {
      showToast('Round resumed!', 'success');
      socket.emit('request_state_refresh', { sessionToken });
    });

    socket.on('round_ended', () => {
      showToast('Round 1 concluded! Check Grand Hall Projector for scores.', 'info');
      socket.emit('request_state_refresh', { sessionToken });
    });

    socket.on('game_reset_event', () => {
      sessionStorage.removeItem('campus_puzzle_session_token');
      localStorage.removeItem('campus_puzzle_session_token');
      sessionToken = null;
      window.location.reload();
    });
  }

  /* -------------------------------------------------------------
   * STATE DISPATCHER & UI ROUTING
   * ----------------------------------------------------------- */
  function handleSyncState(state) {
    if (!state || !state.player) return;
    currentClientState = state;
    const team = state.team;

    // Update Header HUD
    if (team) {
      if (navBenchTag) navBenchTag.textContent = team.benchNumber ? team.benchNumber.toUpperCase() : 'BENCH';
      if (navTeamName) navTeamName.textContent = team.name;
      if (navSquadScore) {
        navSquadScore.textContent = `${team.totalScore} PTS`;
        const r1 = team.roundScores?.[1] || 0;
        const r2 = team.roundScores?.[2] || 0;
        const r3 = team.roundScores?.[3] || 0;
        navSquadScore.title = `Cumulative Total: ${team.totalScore} PTS (R1: ${r1} | R2: ${r2} | R3: ${r3})`;
      }
      if (benchIdentityBadge) benchIdentityBadge.classList.remove('hidden');
      if (btnSwitchBench) btnSwitchBench.classList.remove('hidden');

      // Check if score increased
      if (team.totalScore > previousScore) {
        const delta = team.totalScore - previousScore;
        triggerScorePopup(delta);
        previousScore = team.totalScore;
      }
    } else {
      if (benchIdentityBadge) benchIdentityBadge.classList.add('hidden');
      if (btnSwitchBench) btnSwitchBench.classList.add('hidden');
    }

    // View Routing
    if (state.gameStatus === 'LOBBY' || !team) {
      if (!team) {
        switchScreen(viewRegister);
      } else {
        renderLounge(state);
        switchScreen(viewLobby);
      }
    } else if (state.gameStatus === 'FINISHED') {
      renderFinished(state);
      switchScreen(viewFinished);
    } else if (state.gameStatus === 'INTERMEDIATE_1') {
      // Stage 1 Intermission: All players see Round 2 Guide & Mission Briefing!
      renderGame(state);
      switchScreen(viewGame);
    } else if (state.gameStatus === 'ROUND_2') {
      renderRound2Game(state);
      switchScreen(viewRound2Game);
    } else if (state.gameStatus === 'INTERMEDIATE_2') {
      // Stage 2 Intermission / Qualification Audit
      renderRound2Game(state);
      switchScreen(viewRound2Game);
    } else if (state.gameStatus === 'ROUND_3') {
      renderRound3Game(state);
      switchScreen(viewRound3Game);
    } else {
      renderGame(state);
      switchScreen(viewGame);
    }
  }

  function renderFinished(state) {
    const team = state.team;
    if (!team) return;
    const finishedTeamScore = document.getElementById('finishedTeamScore');
    const finishedScoreBreakdown = document.getElementById('finishedScoreBreakdown');
    if (finishedTeamScore) {
      finishedTeamScore.textContent = `${(team.totalScore || 0).toLocaleString()} PTS`;
    }
    if (finishedScoreBreakdown) {
      const r1 = team.roundScores?.[1] || 0;
      const r2 = team.roundScores?.[2] || 0;
      const r3 = team.roundScores?.[3] || 0;
      finishedScoreBreakdown.textContent = `Round 1: ${r1.toLocaleString()} PTS  •  Round 2: ${r2.toLocaleString()} PTS  •  Round 3: ${r3.toLocaleString()} PTS`;
    }
  }

  /* -------------------------------------------------------------
   * VIEW 2: STAGING LOUNGE RENDERING
   * ----------------------------------------------------------- */
  function renderLounge(state) {
    const team = state.team;
    if (!team) return;

    if (loungeBenchTitle) {
      loungeBenchTitle.textContent = `${(team.benchNumber || 'CABINET').toUpperCase()} : ${team.name.toUpperCase()}`;
    }
    if (loungeMemberCount) {
      loungeMemberCount.textContent = team.members ? team.members.length : 3;
    }
    if (loungeDivisionBadge) {
      loungeDivisionBadge.textContent = 'STATION READY';
    }

    if (loungeMembersGrid) {
      loungeMembersGrid.innerHTML = '';
      (team.members || []).forEach((mem, idx) => {
        const card = document.createElement('div');
        card.className = 'lounge-member-card';

        const isLeader = mem.isLeader;
        const avatarClass = isLeader ? 'avatar-leader' : 'avatar-member';
        const icon = isLeader ? '👑' : (idx === 0 ? '🎮' : '⚡');
        const roleText = isLeader ? 'Squad Captain (Final Decoder)' : `Player #${idx + 1}`;

        card.innerHTML = `
          <div class="lounge-member-avatar ${avatarClass}">
            <span>${icon}</span>
          </div>
          <div class="lounge-member-info">
            <strong>${mem.name}</strong>
            <span>${roleText}</span>
          </div>
        `;
        loungeMembersGrid.appendChild(card);
      });
    }
  }

  /* -------------------------------------------------------------
   * VIEW 3: GAMIFIED ROUND 1 ARENA RENDERING
   * ----------------------------------------------------------- */
  function renderGame(state) {
    const team = state.team;
    if (!team) return;

    if (gameBenchTag) gameBenchTag.textContent = team.benchNumber ? `⚡ ${team.benchNumber.toUpperCase()}` : '⚡ CABINET ARENA';
    if (gameTeamName) gameTeamName.textContent = team.name.toUpperCase();
    if (gameTeamScore) gameTeamScore.textContent = team.totalScore;
    if (gameRoundTitle) gameRoundTitle.textContent = `STAGE ${state.currentRound || 1}: KEYWORD CIPHER QUEST`;

    const progress = team.progress;
    const currentTurn = progress ? progress.currentTurnIndex : 0;
    const fragments = progress?.collectedFragments || [];

    // Check Turn Sound
    if (lastTurnIndex !== -1 && currentTurn !== lastTurnIndex) {
      if (sound) sound.playTurnUnlock();
      clueJustUnlockedPlayed = false;
    }
    lastTurnIndex = currentTurn;

    // Render Persistent Squad Inventory Slots in Sidebar
    if (persistentVaultSlots) {
      persistentVaultSlots.innerHTML = '';
      const turnPipeline = progress?.turnPipeline || [];
      const totalRiddleSteps = Math.max(3, turnPipeline.length > 0 ? turnPipeline.length - 1 : 9);
      for (let s = 0; s < totalRiddleSteps; s++) {
        const slotDiv = document.createElement('div');
        const frag = fragments[s];
        if (frag) {
          slotDiv.className = 'vault-slot-item unlocked';
          slotDiv.innerHTML = `<span>⚡</span> <strong>${frag}</strong>`;
        } else {
          slotDiv.className = 'vault-slot-item';
          slotDiv.innerHTML = `<span>🔒</span> <span>[KEYWORD #${s + 1}]</span>`;
        }
        persistentVaultSlots.appendChild(slotDiv);
      }
      if (vaultStatusRatio) {
        vaultStatusRatio.textContent = `${fragments.length}/${totalRiddleSteps} COLLECTED`;
      }
    }

    // Render Horizontal Turn Sequence Pipeline Strip with Arcade Badges
    if (turnSequenceTracker) {
      turnSequenceTracker.innerHTML = '';
      const turnPipeline = progress?.turnPipeline || [];

      turnPipeline.forEach((pStep) => {
        const pill = document.createElement('div');
        pill.className = `turn-pill-card ${pStep.status.toLowerCase()}`;

        let badgeHtml = '';
        if (pStep.badge === 'BOSS' || pStep.isLeader && pStep.stepIndex >= 3) {
          badgeHtml = `<span class="turn-pill-badge boss">👑 BOSS</span>`;
        } else if (pStep.badge === 'LEADER') {
          badgeHtml = `<span class="turn-pill-badge boss">👑 LEADER</span>`;
        } else {
          const badgeText = pStep.badge || `P${pStep.stepIndex + 1}`;
          badgeHtml = `<span class="turn-pill-badge ${badgeText.toLowerCase()}">${badgeText}</span>`;
        }

        const icon = pStep.status === 'SOLVED' ? '<span class="turn-pill-icon">✓</span>' : '';

        pill.innerHTML = `
          ${badgeHtml}
          ${icon}
          <div>
            <span class="turn-pill-name">${pStep.scholarName}</span>
            <span class="field-hint" style="display:block; font-size:0.68rem; color:var(--jules-text-dim);">${pStep.label}</span>
          </div>
        `;
        turnSequenceTracker.appendChild(pill);
      });
    }

    if (trackerCurrentStepText) {
      const turnPipeline = progress?.turnPipeline || [];
      const totalSteps = turnPipeline.length || 4;
      trackerCurrentStepText.textContent = `GAME ${Math.min(currentTurn + 1, totalSteps)} OF ${totalSteps}`;
    }

    // Hide all stage cards initially
    [boxYourTurn, boxLeaderTurn, boxRoundCompleted, boxRoundLocked, boxRound2Briefing].forEach(b => b && b.classList.add('hidden'));

    // 1. Finished Game
    if (state.gameStatus === 'FINISHED') {
      if (boxRoundCompleted) {
        boxRoundCompleted.classList.remove('hidden');
        if (completeTotalScore) completeTotalScore.textContent = team.totalScore;
      }
      return;
    }

    // 2. Round 1 Completed by this Team or Intermission 1 -> Display Round 2 Mission Briefing!
    if (state.gameStatus === 'INTERMEDIATE_1' || (progress && progress.isRoundCompleted)) {
      if (boxRound2Briefing) {
        boxRound2Briefing.classList.remove('hidden');
      } else if (boxRoundCompleted) {
        boxRoundCompleted.classList.remove('hidden');
        if (completeTotalScore) completeTotalScore.textContent = team.totalScore;
        if (completeThesisText) {
          completeThesisText.textContent = `"${progress?.assembledSubmission || 'Victory Phrase Verified'}"`;
        }
      }
      return;
    }

    // 3. Round Paused / Intermission
    if (!state.roundActive) {
      if (boxRoundLocked) {
        boxRoundLocked.classList.remove('hidden');
        if (lockedTitle) lockedTitle.textContent = '⏸️ TOURNAMENT STANDBY // HOST PAUSE';
        if (lockedSub) lockedSub.textContent = 'Look at the Grand Projector Screen for live tournament rankings!';
      }
      return;
    }

    // 4. Active Gameplay
    const puzzle = state.puzzle;
    if (!puzzle) return;

    if (activeScholarName) activeScholarName.textContent = puzzle.activePlayerName || 'Player 1';
    if (activeScholarRole) activeScholarRole.textContent = (puzzle.activePlayerRole || 'PLAYER').toUpperCase();

    if (puzzle.type === 'leader_step') {
      // Leader Master Synthesis Chamber
      if (boxLeaderTurn) boxLeaderTurn.classList.remove('hidden');
      if (leaderTaskTitle) leaderTaskTitle.textContent = puzzle.title;
      if (leaderInstructions) leaderInstructions.textContent = puzzle.instructions;

      // Render Collected Fragments as Interactive Clickable Chips
      if (fragmentsBank) {
        fragmentsBank.innerHTML = '';
        fragments.forEach(frag => {
          const chip = document.createElement('button');
          chip.type = 'button';
          chip.className = 'fragment-vault-chip';
          chip.innerHTML = `<span>💎</span> <strong>${frag}</strong>`;
          chip.title = `Click to insert "${frag}" into thesis`;
          chip.addEventListener('click', () => {
            insertFragmentAtCursor(frag);
            if (sound) sound.playKeyClick();
          });
          fragmentsBank.appendChild(chip);
        });
      }

      // Live Inspector update
      updateLiveThesisInspector(fragments);
      if (leaderAnswerInput && document.activeElement !== leaderAnswerInput) {
        leaderAnswerInput.focus();
      }

    } else {
      // Member Riddle Step
      if (boxYourTurn) boxYourTurn.classList.remove('hidden');
      if (puzzleCategoryTag) puzzleCategoryTag.textContent = puzzle.category.toUpperCase();
      const maxProtocols = (puzzle.totalSteps && puzzle.totalSteps > 1) ? puzzle.totalSteps - 1 : 9;
      if (puzzleStepCounter) puzzleStepCounter.textContent = `PUZZLE ${puzzle.stepNumber} OF ${maxProtocols}`;
      if (puzzleTitle) puzzleTitle.textContent = puzzle.title;
      if (puzzlePromptText) puzzlePromptText.textContent = puzzle.prompt;

      if (puzzleClueText) puzzleClueText.textContent = puzzle.clue || 'No additional clue provided.';
      if (puzzleHintText) puzzleHintText.textContent = puzzle.hint || '';
      if (clueContent) clueContent.classList.add('hidden');

      if (boxPassConsole) boxPassConsole.classList.add('hidden');

      // Initialize or update interactive letter slots board (_ _ _ format)
      initOrUpdateSlotsBoard(puzzle);

      // Live 2.5 min Player Window & 2:00 Clue Lock System
      updateOperativeTurnTimer(puzzle);
      if (!operativeTimerInterval) {
        operativeTimerInterval = setInterval(() => {
          if (currentClientState?.puzzle) {
            updateOperativeTurnTimer(currentClientState.puzzle);
          }
        }, 1000);
      }
    }
  }

  /* -------------------------------------------------------------
   * VIEW 3.5: ROUND 2 CYBER TERMINAL HACK (10-NODE CIRCUIT RELAY)
   * ----------------------------------------------------------- */
  function renderRound2Game(state) {
    const team = state.team;
    if (!team) return;

    if (r2GameBenchTag) r2GameBenchTag.textContent = team.benchNumber ? `⚡ ${team.benchNumber.toUpperCase()}` : '⚡ CABINET ARENA';
    if (r2GameTeamName) r2GameTeamName.textContent = team.name.toUpperCase();
    if (r2GameTeamScore) r2GameTeamScore.textContent = team.totalScore;

    const progress = team.progress;
    const isCompleted = (progress && progress.isRoundCompleted) || state.puzzle?.type === 'cyber_hack_round2_completed';

    // 1. ROUND 2 COMPLETED STATE (ALL 10 NODES BREACHED)
    if (isCompleted) {
      if (r2TerminalStageCard) r2TerminalStageCard.classList.add('hidden');
      if (boxR2Locked) boxR2Locked.classList.add('hidden');
      if (boxR2RoundCompleted) {
        boxR2RoundCompleted.classList.remove('hidden');
        if (r2CompleteTotalScore) r2CompleteTotalScore.textContent = `${team.totalScore} PTS`;
        if (r2CompletedKeysGrid) {
          r2CompletedKeysGrid.innerHTML = '';
          const words = state.puzzle?.collectedWords || progress?.collectedWords || [];
          for (let i = 0; i < 10; i++) {
            const w = words[i] || (i === 9 ? 'SERVER' : `KEY_${i + 1}`);
            const pill = document.createElement('div');
            const isBoss = i === 9;
            pill.className = `r2-key-pill${isBoss ? ' boss-key' : ''}`;
            pill.innerHTML = `<span>${isBoss ? '👑 NODE 10' : `NODE ${String(i + 1).padStart(2, '0')}`}: <strong>${w}</strong></span> <span>✓</span>`;
            r2CompletedKeysGrid.appendChild(pill);
          }
        }
      }

      if (r2TrackerStepText) r2TrackerStepText.textContent = '10 OF 10 NODES BREACHED';
      if (r2CircuitNodesFlow) {
        r2CircuitNodesFlow.innerHTML = '';
        for (let i = 0; i < 10; i++) {
          const pill = document.createElement('div');
          const isBoss = i === 9;
          pill.className = `circuit-node-pill breached${isBoss ? ' boss' : ''}`;
          pill.innerHTML = `<span class="circuit-node-icon">✓</span> <span>${isBoss ? 'BOSS NODE 10' : `NODE ${String(i + 1).padStart(2, '0')}`}</span>`;
          r2CircuitNodesFlow.appendChild(pill);
        }
      }
      return;
    }

    // 2. PAUSED OR INTERMISSION STAGE
    if (!state.roundActive || state.gameStatus === 'INTERMEDIATE_2') {
      if (r2TerminalStageCard) r2TerminalStageCard.classList.add('hidden');
      if (boxR2RoundCompleted) boxR2RoundCompleted.classList.add('hidden');
      if (boxR2Locked) {
        boxR2Locked.classList.remove('hidden');
        if (r2WaitingTeammateInfo) r2WaitingTeammateInfo.classList.add('hidden');
        if (state.gameStatus === 'INTERMEDIATE_2') {
          if (r2LockedTitle) r2LockedTitle.textContent = '⏸️ STAGE 2 INTERMISSION // TOP 5 AUDIT';
          if (r2LockedSub) {
            r2LockedSub.textContent = team.isEliminated
              ? 'Outstanding performance! Your squad is now in Honorary Fellowship Spectator Mode. Watch the Top 5 finalists battle in Round 3 on the Grand Projector!'
              : 'Official Round 2 scores are locked. Look at the Grand Projector Screen for the Top 5 Finalists Announcement!';
          }
        } else {
          if (r2LockedTitle) r2LockedTitle.textContent = '⏸️ MATCH PAUSED // BY HIGH PROCTOR';
          if (r2LockedSub) r2LockedSub.textContent = 'The tournament clock is currently paused. Please stand by for resumption...';
        }
      }
      return;
    }

    // 3. ACTIVE GAMEPLAY (Collaborative Squad Matrix — All Terminals Active)
    if (boxR2RoundCompleted) boxR2RoundCompleted.classList.add('hidden');
    if (boxR2Locked) boxR2Locked.classList.add('hidden');
    if (r2TerminalStageCard) r2TerminalStageCard.classList.remove('hidden');

    const puzzle = state.puzzle;
    if (!puzzle) return;

    // Auto-reset passed banner if new node has arrived
    if (lastR2RenderedNode !== puzzle.nodeNumber) {
      r2NodePassedState = false;
      if (boxR2NodePassed) boxR2NodePassed.classList.add('hidden');
      r2CurrentGuess = '';
      lastR2RenderedNode = puzzle.nodeNumber;
      // Reset keyboard + matrix caches for the new node
      _keyboardBuilt = false;
      _lastHackMatrixAttemptCount = -1;
      _lastHackMatrixNodeIndex = -1;
    }

    // Active Operative Spotlight in Left Sidebar
    const isYouLead = (puzzle.activePlayerName && state.player?.name && puzzle.activePlayerName.toLowerCase() === state.player.name.toLowerCase());
    if (r2ActivePlayerName) {
      r2ActivePlayerName.textContent = isYouLead ? `${puzzle.activePlayerName} (YOU)` : (puzzle.activePlayerName || 'Operative');
    }
    if (r2ActivePlayerRole) {
      r2ActivePlayerRole.textContent = isYouLead 
        ? '⭐ CURRENT RELAY LEAD' 
        : `⚡ SQUAD RELAY // ${puzzle.activePlayerRole || 'COLLABORATIVE'}`;
    }

    // 10-Node Circuit Tracker Strip
    if (r2TrackerStepText) {
      r2TrackerStepText.textContent = `NODE ${puzzle.nodeNumber} OF 10`;
    }
    if (r2CircuitNodesFlow) {
      r2CircuitNodesFlow.innerHTML = '';
      const statuses = puzzle.nodesStatus || [];
      for (let i = 0; i < 10; i++) {
        const pill = document.createElement('div');
        const st = statuses[i] || (i < puzzle.nodeNumber - 1 ? 'BREACHED' : (i === puzzle.nodeNumber - 1 ? 'ACTIVE' : 'LOCKED'));
        const isBoss = i === 9;
        pill.className = `circuit-node-pill ${st.toLowerCase()}${isBoss ? ' boss' : ''}`;

        let icon = '🔒';
        if (st === 'BREACHED') icon = '✓';
        else if (st === 'ACTIVE') icon = isBoss ? '👑' : '⚡';

        const label = isBoss ? `BOSS NODE 10` : `NODE ${String(i + 1).padStart(2, '0')}`;
        pill.innerHTML = `<span class="circuit-node-icon">${icon}</span> <span>${label}</span>`;
        r2CircuitNodesFlow.appendChild(pill);
      }
    }

    // Sidebar: Breached Words Vault
    const collectedWords = puzzle.collectedWords || [];
    if (r2VaultRatio) {
      r2VaultRatio.textContent = `${collectedWords.length}/10 BREACHED`;
    }
    if (r2BreachedWordsList) {
      r2BreachedWordsList.innerHTML = '';
      if (collectedWords.length === 0) {
        r2BreachedWordsList.innerHTML = `<div class="field-hint" style="color:var(--jules-text-dim); padding:6px 0;">No nodes breached yet. Hack Node 01 to unlock the circuit chain!</div>`;
      } else {
        collectedWords.forEach((word, idx) => {
          const badge = document.createElement('div');
          badge.className = 'breached-word-badge';
          badge.innerHTML = `<span>NODE ${String(idx + 1).padStart(2, '0')}: <strong>${word}</strong></span> <span>✓</span>`;
          r2BreachedWordsList.appendChild(badge);
        });
      }
    }

    // Challenge Header & Riddles
    if (r2CategoryTag) r2CategoryTag.textContent = (puzzle.nodeData?.category || 'CYBER BREACH').toUpperCase();
    if (r2NodeCounter) r2NodeCounter.textContent = `NODE ${puzzle.nodeNumber} OF 10`;
    const attempts = puzzle.attempts || [];
    if (r2AttemptBadge) r2AttemptBadge.textContent = `ATTEMPT ${Math.min(4, attempts.length + 1)} / 4`;
    if (r2NodeTitle) r2NodeTitle.textContent = `Node ${puzzle.nodeNumber}: ${puzzle.nodeData?.category || 'Mainframe Circuit'}`;

    // Interconnection Bridge Clue & Prompt
    if (r2BridgeClueText) {
      r2BridgeClueText.textContent = puzzle.nodeData?.bridgeClue || 'Entry node to activate the circuit network.';
    }
    if (r2PromptText) {
      r2PromptText.textContent = puzzle.nodeData?.prompt || 'Decode the cryptographic keyword to breach this node.';
    }

    // Word Length Pattern Badge
    const targetLength = puzzle.nodeData?.length || 5;
    if (r2WordLengthBadge) {
      r2WordLengthBadge.textContent = `${targetLength} LETTERS`;
    }

    // Hide passed console if on fresh attempt
    if (boxR2NodePassed && !r2NodePassedState) {
      boxR2NodePassed.classList.add('hidden');
    }

    // Render 4-Row Mastermind / Wordle Hack Matrix
    renderHackMatrix(puzzle);

    // Render Virtual Cyber Keyboard with color feedback
    renderVirtualKeyboard(puzzle);

    // Keep hidden input focused for typing
    if (r2HiddenInput && document.activeElement !== r2HiddenInput && !r2NodePassedState) {
      r2HiddenInput.focus();
    }
  }

  // Hack matrix: last rendered attempt count for diffing
  let _lastHackMatrixAttemptCount = -1;
  let _lastHackMatrixNodeIndex = -1;

  function renderHackMatrix(puzzle) {
    if (!r2HackMatrixRows) return;

    const targetLength = puzzle.nodeData?.length || 5;
    const attempts = puzzle.attempts || [];
    const currentAttemptIdx = attempts.length;
    const nodeNumber = puzzle.nodeNumber;

    // Full rebuild only when: node changed, attempt count changed, or first render
    const needsFullRebuild = (nodeNumber !== _lastHackMatrixNodeIndex)
      || (currentAttemptIdx !== _lastHackMatrixAttemptCount)
      || (r2HackMatrixRows.children.length === 0);

    if (needsFullRebuild) {
      _lastHackMatrixNodeIndex = nodeNumber;
      _lastHackMatrixAttemptCount = currentAttemptIdx;
      r2HackMatrixRows.innerHTML = '';

      // Build 4 rows
      for (let r = 0; r < 4; r++) {
        const row = document.createElement('div');
        row.className = 'hack-matrix-row';
        row.dataset.rowIndex = r;

        if (r < currentAttemptIdx) {
          // Past Attempt: rendered with status colors
          const att = attempts[r];
          const feedback = att.feedback || [];
          for (let c = 0; c < targetLength; c++) {
            const tile = document.createElement('div');
            const fb = feedback[c];
            const letter = fb ? fb.letter : (att.guess[c] || '');
            const status = fb ? fb.status : 'absent';
            tile.className = `hack-tile tile-${status} flip-in`;
            tile.style.animationDelay = `${c * 0.08}s`;
            tile.textContent = letter;
            row.appendChild(tile);
          }
        } else if (r === currentAttemptIdx && !r2NodePassedState) {
          // Current Active Input Row
          row.dataset.isActive = '1';
          for (let c = 0; c < targetLength; c++) {
            const tile = document.createElement('div');
            const letter = r2CurrentGuess[c] || '';
            if (letter) {
              tile.className = 'hack-tile filled';
              tile.textContent = letter;
            } else if (c === r2CurrentGuess.length) {
              tile.className = 'hack-tile current-active';
              tile.textContent = '';
            } else {
              tile.className = 'hack-tile';
              tile.textContent = '';
            }
            row.appendChild(tile);
          }
        } else {
          // Future Row: blank tiles
          for (let c = 0; c < targetLength; c++) {
            const tile = document.createElement('div');
            tile.className = 'hack-tile';
            tile.textContent = '';
            row.appendChild(tile);
          }
        }

        r2HackMatrixRows.appendChild(row);
      }
    } else {
      // Fast path: only update the active row tiles (keypress typing)
      const activeRow = r2HackMatrixRows.querySelector('[data-is-active="1"]');
      if (activeRow) {
        const tiles = activeRow.children;
        for (let c = 0; c < targetLength; c++) {
          const tile = tiles[c];
          if (!tile) continue;
          const letter = r2CurrentGuess[c] || '';
          if (c < r2CurrentGuess.length) {
            if (tile.className !== 'hack-tile filled' || tile.textContent !== letter) {
              tile.className = 'hack-tile filled';
              tile.textContent = letter;
            }
          } else if (c === r2CurrentGuess.length) {
            if (tile.className !== 'hack-tile current-active') {
              tile.className = 'hack-tile current-active';
              tile.textContent = '';
            }
          } else {
            if (tile.className !== 'hack-tile') {
              tile.className = 'hack-tile';
              tile.textContent = '';
            }
          }
        }
      }
    }
  }

  // Virtual Keyboard: built once, patched on state updates
  let _keyboardBuilt = false;
  let _keyBtnMap = {}; // letter -> button element

  function renderVirtualKeyboard(puzzle) {
    if (!r2VirtualKeyboard) return;

    // Calculate letter statuses from all attempts on current node
    const attempts = puzzle.attempts || [];
    r2KeyStatuses = {};
    attempts.forEach(att => {
      (att.feedback || []).forEach(fb => {
        const letter = fb.letter;
        const current = r2KeyStatuses[letter];
        if (fb.status === 'correct') {
          r2KeyStatuses[letter] = 'correct';
        } else if (fb.status === 'present' && current !== 'correct') {
          r2KeyStatuses[letter] = 'present';
        } else if (fb.status === 'absent' && !current) {
          r2KeyStatuses[letter] = 'absent';
        }
      });
    });

    const rows = [
      ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'],
      ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L'],
      ['ENTER', 'Z', 'X', 'C', 'V', 'B', 'N', 'M', '⌫']
    ];

    if (!_keyboardBuilt) {
      // Build keyboard DOM once
      _keyboardBuilt = true;
      _keyBtnMap = {};
      r2VirtualKeyboard.innerHTML = '';

      rows.forEach(rKeys => {
        const rowDiv = document.createElement('div');
        rowDiv.className = 'cyber-keyboard-row';

        rKeys.forEach(k => {
          const btn = document.createElement('button');
          btn.type = 'button';
          const isWide = k === 'ENTER' || k === '⌫';
          btn.className = `key-btn${isWide ? ' key-wide' : ''}`;
          btn.textContent = k;
          btn.dataset.key = k;
          _keyBtnMap[k] = btn;

          btn.addEventListener('click', (e) => {
            e.preventDefault();
            if (r2NodePassedState) return;
            if (k === 'ENTER') {
              submitRound2Guess();
            } else if (k === '⌫') {
              if (r2CurrentGuess.length > 0) {
                r2CurrentGuess = r2CurrentGuess.slice(0, -1);
                if (sound) sound.playKeyClick();
                if (currentClientState?.puzzle) renderHackMatrix(currentClientState.puzzle);
              }
            } else {
              const targetLen = currentClientState?.puzzle?.nodeData?.length || 5;
              if (r2CurrentGuess.length < targetLen) {
                r2CurrentGuess += k;
                if (sound) sound.playKeyClick();
                if (currentClientState?.puzzle) renderHackMatrix(currentClientState.puzzle);
              }
            }
          });

          rowDiv.appendChild(btn);
        });

        r2VirtualKeyboard.appendChild(rowDiv);
      });
    }

    // Patch only changed key classes (no DOM rebuild needed)
    const allKeys = rows.flat();
    allKeys.forEach(k => {
      const btn = _keyBtnMap[k];
      if (!btn) return;
      const isWide = k === 'ENTER' || k === '⌫';
      const status = r2KeyStatuses[k];
      const newClass = `key-btn${isWide ? ' key-wide' : ''}${status ? ` key-${status}` : ''}`;
      if (btn.className !== newClass) btn.className = newClass;
    });
  }

  function submitRound2Guess() {
    if (r2NodePassedState) return;
    const puzzle = currentClientState?.puzzle;
    if (!puzzle || puzzle.type !== 'cyber_hack_round2') return;

    const targetLen = puzzle.nodeData?.length || 5;
    const guess = r2CurrentGuess.trim().toUpperCase();

    if (guess.length !== targetLen) {
      if (r2FeedbackBox) {
        r2FeedbackBox.className = 'alert-box alert-error';
        r2FeedbackBox.textContent = `Please enter exactly ${targetLen} letters before hacking.`;
        r2FeedbackBox.classList.remove('hidden');
        setTimeout(() => r2FeedbackBox.classList.add('hidden'), 2500);
      }
      if (sound) sound.playError();
      return;
    }

    if (btnR2Submit) btnR2Submit.disabled = true;

    socket.emit('submit_round2_guess', { sessionToken, guessWord: guess, guess }, (res) => {
      if (btnR2Submit) btnR2Submit.disabled = false;
      if (!res) return;

      if (!res.success) {
        if (r2FeedbackBox) {
          r2FeedbackBox.className = 'alert-box alert-error';
          r2FeedbackBox.textContent = res.message || 'Hack attempt rejected.';
          r2FeedbackBox.classList.remove('hidden');
          setTimeout(() => r2FeedbackBox.classList.add('hidden'), 3000);
        }
        if (sound) sound.playError();
        return;
      }

      // Check if node is breached or auto-bypassed
      if (res.isSolved || res.nodePassed) {
        r2NodePassedState = true;
        if (sound) {
          sound.playSuccess();
          sound.playVictoryFanfare();
        }
        triggerParticleBurst();

        const pts = res.pointsAwarded || 100;
        if (r2FloatingScorePopup) {
          r2FloatingScorePopup.textContent = `+${pts} PTS`;
        }

        if (boxR2NodePassed) {
          boxR2NodePassed.classList.remove('hidden');
          if (r2PassTitleText) {
            r2PassTitleText.textContent = res.isSolved 
              ? `🎉 NODE ${puzzle.nodeNumber} BREACHED! +${pts} PTS!`
              : `⚡ NODE ${puzzle.nodeNumber} AUTO-BYPASS! +${pts} PTS!`;
          }
          if (r2PassDescText) {
            r2PassDescText.textContent = res.roundCompleted
              ? '👑 CONGRATULATIONS! ALL 10 NODES BREACHED! MAIN REACTOR OVERRIDDEN!'
              : 'Cryptographic relay key transmitted forward! Pass controls to the next operative...';
          }
        }

        showToast(`⚡ Node ${puzzle.nodeNumber} Breached! (+${pts} PTS)`, 'success');
        r2CurrentGuess = '';

        // Auto-advance after 3.5s or click
        clearTimeout(autoAdvanceTimer);
        autoAdvanceTimer = setTimeout(() => {
          advanceToNextR2Node();
        }, 3500);

      } else {
        // Incorrect guess: feedback received, prepare next attempt
        if (sound) sound.playError();
        const exactMatches = (res.feedback || []).filter(f => f.status === 'correct').length;
        const presentMatches = (res.feedback || []).filter(f => f.status === 'present').length;
        const attemptsLeft = res.remainingAttempts !== undefined ? res.remainingAttempts : (4 - (res.attemptsUsed || 1));
        
        showToast(`Attempt ${res.attemptsUsed || 1}/4: ${exactMatches} 🟩 Exact, ${presentMatches} 🟨 Wrong Spot. ${attemptsLeft} attempts left!`, 'warning');
        
        if (r2FeedbackBox) {
          r2FeedbackBox.className = 'alert-box alert-warning';
          r2FeedbackBox.innerHTML = `<strong>ATTEMPT ${res.attemptsUsed || 1}/4 RECORDED:</strong> ${exactMatches} 🟩 Exact Spot • ${presentMatches} 🟨 Wrong Spot • <strong>${attemptsLeft} left</strong>. Keep green letters in place!`;
          r2FeedbackBox.classList.remove('hidden');
        }

        r2CurrentGuess = '';
        if (r2HiddenInput) {
          r2HiddenInput.value = '';
          r2HiddenInput.focus();
        }
        socket.emit('request_state_refresh', { sessionToken });
      }
    });
  }

  function advanceToNextR2Node() {
    clearTimeout(autoAdvanceTimer);
    r2NodePassedState = false;
    if (boxR2NodePassed) boxR2NodePassed.classList.add('hidden');
    if (r2FeedbackBox) r2FeedbackBox.classList.add('hidden');
    r2CurrentGuess = '';
    if (r2HiddenInput) {
      r2HiddenInput.value = '';
      r2HiddenInput.focus();
    }
    socket.emit('request_state_refresh', { sessionToken });
  }

  // Clear / Backspace button (deletes last character, or clears if empty)
  if (btnR2Clear) {
    btnR2Clear.addEventListener('click', () => {
      if (r2CurrentGuess.length > 0) {
        r2CurrentGuess = r2CurrentGuess.slice(0, -1);
      }
      if (r2HiddenInput) r2HiddenInput.value = '';
      if (sound) sound.playKeyClick();
      if (currentClientState?.puzzle) renderHackMatrix(currentClientState.puzzle);
      if (r2HiddenInput) r2HiddenInput.focus();
    });
  }

  // Submit button
  if (btnR2Submit) {
    btnR2Submit.addEventListener('click', submitRound2Guess);
  }

  // Next Node Ready button
  if (btnR2NextNodeReady) {
    btnR2NextNodeReady.addEventListener('click', advanceToNextR2Node);
  }

  // Matrix click to focus input
  if (r2HackMatrixRows) {
    r2HackMatrixRows.addEventListener('click', () => {
      if (r2HiddenInput) r2HiddenInput.focus();
    });
  }

  // Wordle Rules Modal Toggle
  if (btnToggleR2Rules) {
    btnToggleR2Rules.addEventListener('click', () => {
      if (modalR2Rules) modalR2Rules.classList.remove('hidden');
    });
  }
  if (btnCloseR2Rules) {
    btnCloseR2Rules.addEventListener('click', () => {
      if (modalR2Rules) modalR2Rules.classList.add('hidden');
      if (r2HiddenInput) r2HiddenInput.focus();
    });
  }
  if (btnDismissR2Rules) {
    btnDismissR2Rules.addEventListener('click', () => {
      if (modalR2Rules) modalR2Rules.classList.add('hidden');
      if (r2HiddenInput) r2HiddenInput.focus();
    });
  }
  if (modalR2Rules) {
    modalR2Rules.addEventListener('click', (e) => {
      if (e.target === modalR2Rules) {
        modalR2Rules.classList.add('hidden');
        if (r2HiddenInput) r2HiddenInput.focus();
      }
    });
  }

  // Mobile / IME input fallback on Round 2 hidden input (Zero character duplication)
  if (r2HiddenInput) {
    r2HiddenInput.addEventListener('input', () => {
      const chars = r2HiddenInput.value.replace(/[^a-zA-Z]/g, '').toUpperCase();
      r2HiddenInput.value = '';
      if (!chars) return;
      const puzzle = currentClientState?.puzzle;
      const targetLen = puzzle?.nodeData?.length || 5;
      let changed = false;
      for (let i = 0; i < chars.length; i++) {
        if (r2CurrentGuess.length < targetLen) {
          r2CurrentGuess += chars[i];
          changed = true;
        }
      }
      if (changed) {
        if (sound) sound.playKeyClick();
        if (puzzle) renderHackMatrix(puzzle);
      }
    });
  }

  // Listen to physical keyboard events when in Round 2
  window.addEventListener('keydown', (e) => {
    // Only capture if Round 2 is currently visible and active
    if (!viewRound2Game || viewRound2Game.classList.contains('hidden') || r2NodePassedState) {
      return;
    }

    // Handle Escape or Enter on rules modal
    if (modalR2Rules && !modalR2Rules.classList.contains('hidden')) {
      if (e.key === 'Escape' || e.key === 'Enter') {
        e.preventDefault();
        modalR2Rules.classList.add('hidden');
        if (r2HiddenInput) r2HiddenInput.focus();
      }
      return;
    }

    // Ignore if typing inside an actual text input or textarea (except r2HiddenInput)
    if (e.target && (e.target.tagName === 'INPUT' && e.target.id !== 'r2HiddenInput' || e.target.tagName === 'TEXTAREA')) {
      return;
    }

    const puzzle = currentClientState?.puzzle;
    if (!puzzle || puzzle.type !== 'cyber_hack_round2') return;

    const targetLen = puzzle.nodeData?.length || 5;

    if (e.key === 'Backspace') {
      e.preventDefault();
      if (r2HiddenInput) r2HiddenInput.value = '';
      if (r2CurrentGuess.length > 0) {
        r2CurrentGuess = r2CurrentGuess.slice(0, -1);
        if (sound) sound.playKeyClick();
        renderHackMatrix(puzzle);
      }
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (r2HiddenInput) r2HiddenInput.value = '';
      submitRound2Guess();
    } else if (/^[a-zA-Z]$/.test(e.key)) {
      e.preventDefault(); // Prevents default insertion into r2HiddenInput, stopping double input!
      if (r2HiddenInput) r2HiddenInput.value = '';
      if (r2CurrentGuess.length < targetLen) {
        r2CurrentGuess += e.key.toUpperCase();
        if (sound) sound.playKeyClick();
        renderHackMatrix(puzzle);
      }
    }
  });

  /* -------------------------------------------------------------
   * OPERATIVE 2.5 MIN TURN TIMER & 2:00 CLUE UNLOCK LOGIC
   * ----------------------------------------------------------- */
  function calculateCurrentBounty(elapsedSec, durationSec = 150) {
    const gracePeriodSec = 15;
    if (elapsedSec <= gracePeriodSec) return 250;
    const decayDuration = Math.max(1, durationSec - gracePeriodSec);
    const decayFraction = Math.min(1, Math.max(0, (elapsedSec - gracePeriodSec) / decayDuration));
    return Math.max(100, Math.round(250 - (decayFraction * (250 - 100))));
  }

  function updateOperativeTurnTimer(puzzle) {
    if (!puzzle) {
      if (operativeTimerStrip) operativeTimerStrip.classList.add('hidden');
      if (leaderTimerStrip) leaderTimerStrip.classList.add('hidden');
      return;
    }

    const now = Date.now();
    const startTime = puzzle.turnStartedAt || now;
    const durationSec = puzzle.turnDurationSec || 150; // 2.5 mins
    const elapsedSec = Math.max(0, Math.floor((now - startTime) / 1000));
    const remainingTurnSec = Math.max(0, durationSec - elapsedSec);

    // Format remaining time: MM:SS
    const mins = Math.floor(remainingTurnSec / 60);
    const secs = remainingTurnSec % 60;
    const formatted = `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    const liveBounty = calculateCurrentBounty(elapsedSec, durationSec);

    // 1. Leader Boss Turn
    if (puzzle.type === 'leader_step') {
      if (operativeTimerStrip) operativeTimerStrip.classList.add('hidden');
      if (leaderTimerStrip) leaderTimerStrip.classList.remove('hidden');

      if (leaderTimeRemaining) {
        leaderTimeRemaining.textContent = formatted;
        if (remainingTurnSec <= 30) {
          leaderTimeRemaining.classList.add('urgent');
        } else {
          leaderTimeRemaining.classList.remove('urgent');
        }
      }

      if (leaderProgressBar) {
        const pct = Math.min(100, Math.max(0, (remainingTurnSec / durationSec) * 100));
        leaderProgressBar.style.width = `${pct}%`;
        if (remainingTurnSec <= 30) {
          leaderProgressBar.classList.add('urgent');
        } else {
          leaderProgressBar.classList.remove('urgent');
        }
      }

      if (leaderLiveBountyBadge) {
        leaderLiveBountyBadge.textContent = `⚡ BOSS BOUNTY: ${liveBounty} PTS`;
      }
      return;
    }

    // 2. Operative Riddle Turn
    if (leaderTimerStrip) leaderTimerStrip.classList.add('hidden');
    if (operativeTimerStrip) operativeTimerStrip.classList.remove('hidden');

    if (operativeTimeRemaining) {
      operativeTimeRemaining.textContent = formatted;
      if (remainingTurnSec <= 30) {
        operativeTimeRemaining.classList.add('urgent');
      } else {
        operativeTimeRemaining.classList.remove('urgent');
      }
    }

    // Update progress bar
    if (operativeProgressBar) {
      const pct = Math.min(100, Math.max(0, (remainingTurnSec / durationSec) * 100));
      operativeProgressBar.style.width = `${pct}%`;
      if (remainingTurnSec <= 30) {
        operativeProgressBar.classList.add('urgent');
      } else {
        operativeProgressBar.classList.remove('urgent');
      }
    }

    // Update Live Speed Bounty Badge (faster solve = higher points!)
    if (liveBountyBadge) {
      liveBountyBadge.textContent = `⚡ LIVE BOUNTY: ${liveBounty} PTS`;
    }

    // Check Clue Lock Status (Locked until 2:00 mark)
    const unlockDelaySec = puzzle.clueUnlockDelaySec || 120; // 2.0 mins
    if (elapsedSec < unlockDelaySec) {
      const lockRem = unlockDelaySec - elapsedSec;
      const lockMins = Math.floor(lockRem / 60);
      const lockSecs = lockRem % 60;
      const lockFormatted = `${lockMins}:${lockSecs.toString().padStart(2, '0')}`;

      if (btnToggleClue) {
        btnToggleClue.disabled = true;
        btnToggleClue.classList.add('clue-locked');
        btnToggleClue.classList.remove('clue-unlocked');
      }
      if (clueLockIcon) clueLockIcon.textContent = '🔒';
      if (clueLockLabel) {
        clueLockLabel.textContent = `SECRET HINT LOCKED [UNLOCKS AT 2:00 (${lockFormatted} REMAINING)]`;
      }
      if (clueContent) clueContent.classList.add('hidden');
    } else {
      // Clue is UNLOCKED (Passed 2 minutes!)
      if (!clueJustUnlockedPlayed) {
        clueJustUnlockedPlayed = true;
        if (sound) sound.playTurnUnlock();
        showToast('🔓 Secret Hint Unlocked! Tap to expand.', 'info');
      }

      if (btnToggleClue) {
        btnToggleClue.disabled = false;
        btnToggleClue.classList.remove('clue-locked');
        btnToggleClue.classList.add('clue-unlocked');
      }
      if (clueLockIcon) clueLockIcon.textContent = '🔓';
      if (clueLockLabel) {
        clueLockLabel.textContent = '🔓 SECRET HINT UNLOCKED [CLICK TO EXPAND]';
      }
    }
  }

  /* -------------------------------------------------------------
   * LIVE THESIS INSPECTOR (REAL-TIME WORD & VERB TELEMETRY)
   * ----------------------------------------------------------- */
  const COMMON_VERBS = new Set([
    'is', 'are', 'was', 'were', 'be', 'been', 'have', 'has', 'had',
    'connect', 'connects', 'connected', 'connecting', 'power', 'powers', 'powered',
    'build', 'builds', 'built', 'building', 'create', 'creates', 'created',
    'lead', 'leads', 'led', 'solve', 'solves', 'solved', 'guide', 'guides', 'guided',
    'unite', 'unites', 'united', 'inspire', 'inspires', 'unlock', 'unlocks', 'unlocked',
    'discover', 'discovers', 'illuminate', 'illuminates', 'illuminated',
    'shape', 'shapes', 'shaped', 'empower', 'empowers', 'reveal', 'reveals',
    'master', 'masters', 'ignite', 'ignites', 'ignited', 'attain', 'flow', 'stand', 'remind'
  ]);

  function insertFragmentAtCursor(word) {
    if (!leaderAnswerInput) return;
    const start = leaderAnswerInput.selectionStart || 0;
    const end = leaderAnswerInput.selectionEnd || 0;
    const text = leaderAnswerInput.value;
    const before = text.substring(0, start);
    const after = text.substring(end);

    const padBefore = (before.length > 0 && !before.endsWith(' ')) ? ' ' : '';
    const padAfter = (!after.startsWith(' ') && !after.startsWith('.')) ? ' ' : '';

    leaderAnswerInput.value = before + padBefore + word + padAfter + after;
    const newPos = start + padBefore.length + word.length + padAfter.length;
    leaderAnswerInput.selectionStart = leaderAnswerInput.selectionEnd = newPos;
    leaderAnswerInput.focus();

    const fragments = currentClientState?.team?.progress?.collectedFragments || [];
    updateLiveThesisInspector(fragments);
  }

  function updateLiveThesisInspector(requiredFragments) {
    if (!leaderAnswerInput || !inspectorKeywordsPills) return;
    const text = leaderAnswerInput.value.trim();
    const rawTokens = text.split(/\s+/).filter(t => t.length > 0);
    const normalizedWords = rawTokens.map(w => w.toLowerCase().replace(/[^a-z0-9]/g, '')).filter(Boolean);

    // 1. Keyword Checkmarks
    inspectorKeywordsPills.innerHTML = '';
    requiredFragments.forEach(frag => {
      const cleanFrag = frag.toLowerCase().replace(/[^a-z0-9]/g, '');
      const isPresent = normalizedWords.includes(cleanFrag);

      const pill = document.createElement('span');
      pill.className = `keyword-check-pill ${isPresent ? 'matched' : 'missing'}`;
      pill.innerHTML = `<span>${isPresent ? '✓' : '✕'}</span> <span>${frag}</span>`;
      inspectorKeywordsPills.appendChild(pill);
    });

    // 2. Word Count Meter
    const count = normalizedWords.length;
    if (wordCountDisplay) {
      wordCountDisplay.textContent = `${count} / 5-30 words`;
      if (count >= 5 && count <= 30) {
        wordCountDisplay.style.borderColor = 'var(--jules-green)';
        wordCountDisplay.style.color = 'var(--jules-green)';
      } else {
        wordCountDisplay.style.borderColor = 'var(--jules-border)';
        wordCountDisplay.style.color = '#fff';
      }
    }

    // 3. Action Verb Detector
    const hasVerb = normalizedWords.some(w => COMMON_VERBS.has(w));
    if (verbStatusBadge) {
      if (hasVerb) {
        verbStatusBadge.className = 'status-indicator-badge detected';
        verbStatusBadge.textContent = 'DETECTED ✓';
      } else {
        verbStatusBadge.className = 'status-indicator-badge';
        verbStatusBadge.textContent = 'PENDING ✕';
      }
    }
  }

  /* -------------------------------------------------------------
   * EVENT LISTENERS & GAMEPLAY INTERACTIONS
   * ----------------------------------------------------------- */
  // 1. Bench Table Quick Selection Chips
  if (benchChipsContainer) {
    benchChipsContainer.addEventListener('click', (e) => {
      const btn = e.target.closest('.bench-chip');
      if (!btn) return;
      document.querySelectorAll('.bench-chip').forEach(c => c.classList.remove('active'));
      btn.classList.add('active');
      if (customBenchInput) customBenchInput.value = btn.dataset.bench;
      if (sound) sound.playKeyClick();
    });
  }

  // 2. Team Size Selector (1 Leader + 1/2/3 Members)
  function handleSizeToggle() {
    const selectedSize = document.querySelector('input[name="benchTeamSize"]:checked')?.value || '3';
    if (member3Container) {
      if (selectedSize === '3' || selectedSize === '4') {
        member3Container.classList.remove('hidden');
      } else {
        member3Container.classList.add('hidden');
      }
    }
    if (member4Container) {
      if (selectedSize === '4') {
        member4Container.classList.remove('hidden');
      } else {
        member4Container.classList.add('hidden');
      }
    }
  }

  [sizeRadio2, sizeRadio3, sizeRadio4].forEach(r => {
    if (r) r.addEventListener('change', handleSizeToggle);
  });

  // 4. Role Switcher: Bench Setup vs Host Gateway
  if (tabPlayerRole && tabHostRole) {
    tabPlayerRole.addEventListener('click', () => {
      tabPlayerRole.classList.add('active');
      tabHostRole.classList.remove('active');
      if (playerLoginBox) playerLoginBox.classList.remove('hidden');
      if (hostLoginBox) hostLoginBox.classList.add('hidden');
    });

    tabHostRole.addEventListener('click', () => {
      tabHostRole.classList.add('active');
      tabPlayerRole.classList.remove('active');
      if (hostLoginBox) hostLoginBox.classList.remove('hidden');
      if (playerLoginBox) playerLoginBox.classList.add('hidden');
      if (homeHostPassword) homeHostPassword.focus();
    });
  }

  // 5. Host Login Submission
  function handleHostLoginSubmit() {
    const pwd = homeHostPassword ? homeHostPassword.value.trim() : '';
    if (!pwd) {
      if (hostLoginError) {
        hostLoginError.textContent = 'Please enter the host passphrase.';
        hostLoginError.classList.remove('hidden');
      }
      return;
    }
    sessionStorage.setItem('campus_admin_pwd', pwd);
    window.location.href = '/admin';
  }

  if (btnHomeHostLogin) {
    btnHomeHostLogin.addEventListener('click', handleHostLoginSubmit);
  }
  if (hostForm) {
    hostForm.addEventListener('submit', (e) => {
      e.preventDefault();
      handleHostLoginSubmit();
    });
  }

  if (linkSwitchToStudent && tabPlayerRole) {
    linkSwitchToStudent.addEventListener('click', () => tabPlayerRole.click());
  }

  // 6. Bench Registration Form Submission
  if (btnInitializeBench) {
    btnInitializeBench.addEventListener('click', () => {
      const benchNumber = (customBenchInput ? customBenchInput.value.trim() : '');
      const teamName = (teamNameInput ? teamNameInput.value.trim() : '');
      const gender = document.querySelector('input[name="benchGender"]:checked')?.value || 'open';
      const teamSize = document.querySelector('input[name="benchTeamSize"]:checked')?.value || '3';
      const leaderName = leaderNameInput ? leaderNameInput.value.trim() : '';
      const member2Name = member2NameInput ? member2NameInput.value.trim() : '';
      const member3Name = member3NameInput ? member3NameInput.value.trim() : '';

      if (!teamName || teamName.length < 2) {
        if (registerError) {
          registerError.textContent = 'Please enter your Team Name (at least 2 characters).';
          registerError.classList.remove('hidden');
        }
        if (teamNameInput) teamNameInput.focus();
        if (sound) sound.playError();
        return;
      }

      if (!leaderName || leaderName.length < 2) {
        if (registerError) {
          registerError.textContent = 'Please enter a valid Team Leader name (at least 2 characters).';
          registerError.classList.remove('hidden');
        }
        if (sound) sound.playError();
        return;
      }

      if (!member2Name || member2Name.length < 2) {
        if (registerError) {
          registerError.textContent = 'Please enter Member 1 name (at least 2 characters).';
          registerError.classList.remove('hidden');
        }
        if (sound) sound.playError();
        return;
      }

      const memberNames = [member2Name];
      if (teamSize === '3' || teamSize === '4') {
        if (!member3Name || member3Name.length < 2) {
          if (registerError) {
            registerError.textContent = 'Please enter Member 2 name (at least 2 characters).';
            registerError.classList.remove('hidden');
          }
          if (sound) sound.playError();
          return;
        }
        memberNames.push(member3Name);
      }

      if (teamSize === '4') {
        const member4Name = member4NameInput ? member4NameInput.value.trim() : '';
        if (!member4Name || member4Name.length < 2) {
          if (registerError) {
            registerError.textContent = 'Please enter Member 3 name (at least 2 characters).';
            registerError.classList.remove('hidden');
          }
          if (sound) sound.playError();
          return;
        }
        memberNames.push(member4Name);
      }

      if (registerError) registerError.classList.add('hidden');
      btnInitializeBench.disabled = true;

      socket.emit('register_bench', {
        benchNumber,
        teamName,
        gender,
        teamSize: parseInt(teamSize, 10),
        leaderName,
        memberNames
      }, (res) => {
        btnInitializeBench.disabled = false;
        if (res && res.success) {
          sessionToken = res.sessionToken;
          sessionStorage.setItem('campus_puzzle_session_token', sessionToken);
          localStorage.setItem('campus_puzzle_session_token', sessionToken);
          handleSyncState(res.clientState);
          if (sound) sound.playSuccess();
          showToast(`Bench ${benchNumber} initialized for ${teamName}!`, 'success');
        } else {
          if (registerError) {
            registerError.textContent = res.message || 'Bench registration failed.';
            registerError.classList.remove('hidden');
          }
          if (sound) sound.playError();
        }
      });
    });
  }

  // 7. Clue Unfurl Drawer
  if (btnToggleClue && clueContent) {
    btnToggleClue.addEventListener('click', () => {
      if (btnToggleClue.disabled || btnToggleClue.classList.contains('clue-locked')) {
        if (sound) sound.playError();
        showToast('🔒 Secret Hint is locked! Unlocks automatically at the 2:00 mark.', 'error');
        return;
      }
      clueContent.classList.toggle('hidden');
      if (sound) sound.playWhoosh();
    });
  }

  /* -------------------------------------------------------------
   * RETRO CIPHER SLOTS CONTROLLER (_ _ _ _ _ FORMAT)
   * ----------------------------------------------------------- */
  let currentWordPattern = [5];
  let currentSlotCells = [];
  let slotLetterValues = [];
  let activeSlotIndex = 0;
  let activeRiddleStepKey = null;

  function initOrUpdateSlotsBoard(puzzle) {
    if (!slotsBoard) return;
    const pattern = (Array.isArray(puzzle?.wordPattern) && puzzle.wordPattern.length > 0)
      ? puzzle.wordPattern
      : [5];

    const stepKey = `${puzzle.stepNumber}_${pattern.join('-')}`;
    const isNewStep = activeRiddleStepKey !== stepKey;

    if (isNewStep) {
      activeRiddleStepKey = stepKey;
      currentWordPattern = pattern;

      // Update letter count badge
      if (slotsCountLabel) {
        if (pattern.length === 1) {
          slotsCountLabel.textContent = `${pattern[0]} LETTERS`;
        } else {
          const total = pattern.reduce((a, b) => a + b, 0);
          slotsCountLabel.textContent = `${pattern.join(' + ')} LETTERS (${pattern.length} WORDS)`;
        }
      }

      // Rebuild letter slot cells
      slotsBoard.innerHTML = '';
      currentSlotCells = [];
      slotLetterValues = [];
      activeSlotIndex = 0;

      pattern.forEach((wordLen, wordIdx) => {
        if (wordIdx > 0) {
          const divider = document.createElement('div');
          divider.className = 'word-group-divider';
          divider.textContent = '◆';
          slotsBoard.appendChild(divider);
        }

        const group = document.createElement('div');
        group.className = 'word-slots-group';

        for (let i = 0; i < wordLen; i++) {
          const cellIndex = currentSlotCells.length;
          const cell = document.createElement('div');
          cell.className = 'letter-slot-cell';
          cell.setAttribute('data-index', cellIndex);

          const charSpan = document.createElement('span');
          charSpan.className = 'slot-char';
          charSpan.textContent = '';

          cell.appendChild(charSpan);

          cell.addEventListener('click', (e) => {
            e.stopPropagation();
            setActiveSlot(cellIndex);
            if (puzzleHiddenInput) puzzleHiddenInput.focus();
          });

          group.appendChild(cell);
          currentSlotCells.push(cell);
          slotLetterValues.push('');
        }

        slotsBoard.appendChild(group);
      });

      setActiveSlot(0);
      updateSlotVisuals();
    }

    if (puzzleHiddenInput && document.activeElement !== puzzleHiddenInput) {
      puzzleHiddenInput.value = '';
      puzzleHiddenInput.focus();
    }
  }

  function setActiveSlot(index) {
    if (currentSlotCells.length === 0) return;
    activeSlotIndex = Math.max(0, Math.min(index, currentSlotCells.length - 1));
    currentSlotCells.forEach((cell, i) => {
      cell.classList.toggle('active', i === activeSlotIndex);
    });
  }

  function updateSlotVisuals() {
    currentSlotCells.forEach((cell, i) => {
      const val = slotLetterValues[i] || '';
      const charSpan = cell.querySelector('.slot-char');
      if (charSpan) charSpan.textContent = val;
      cell.classList.toggle('filled', !!val);
      cell.classList.toggle('active', i === activeSlotIndex);
    });

    // Assemble answer string grouped by words with space separation
    let offset = 0;
    const words = currentWordPattern.map(len => {
      const part = slotLetterValues.slice(offset, offset + len).join('');
      offset += len;
      return part;
    });
    const assembled = words.join(' ').trim();
    if (puzzleAnswerInput) {
      puzzleAnswerInput.value = assembled;
    }
  }

  function clearAllSlots() {
    slotLetterValues = slotLetterValues.map(() => '');
    activeSlotIndex = 0;
    setActiveSlot(0);
    updateSlotVisuals();
    if (puzzleHiddenInput) {
      puzzleHiddenInput.value = '';
      puzzleHiddenInput.focus();
    }
    if (sound && sound.playWhoosh) sound.playWhoosh();
  }

  // 8. Submit Riddle Solution
  function submitRiddleAnswer() {
    const answer = puzzleAnswerInput ? puzzleAnswerInput.value.trim() : '';
    if (!answer) {
      if (slotsBoard) {
        slotsBoard.classList.add('error-shake');
        setTimeout(() => slotsBoard.classList.remove('error-shake'), 450);
      }
      if (puzzleFeedbackBox) {
        puzzleFeedbackBox.className = 'alert-box alert-error';
        puzzleFeedbackBox.textContent = 'Please type your answer into the letter slots!';
        puzzleFeedbackBox.classList.remove('hidden');
      }
      return;
    }

    const turnIndex = currentClientState?.team?.progress?.currentTurnIndex || 0;
    if (btnSubmitAnswer) btnSubmitAnswer.disabled = true;

    socket.emit('submit_turn_answer', { sessionToken, turnIndex, answer }, (res) => {
      if (btnSubmitAnswer) btnSubmitAnswer.disabled = false;
      if (res && res.success) {
        if (sound) {
          sound.playSuccess();
          sound.playFragmentCollect();
        }
        triggerParticleBurst();

        if (slotsBoard) {
          slotsBoard.classList.add('correct-glow');
        }

        if (puzzleFeedbackBox) {
          puzzleFeedbackBox.className = 'alert-box alert-success';
          puzzleFeedbackBox.textContent = res.message || 'Cipher Cracked! Keyword Added to Inventory.';
          puzzleFeedbackBox.classList.remove('hidden');
        }

        // Show Pass Console Banner with actual dynamic speed points
        const points = res.earnedPoints || 250;
        if (floatingScorePopup) {
          floatingScorePopup.textContent = `+${points} PTS`;
        }
        if (boxPassConsole) {
          if (passTitleText) passTitleText.textContent = `⭐ CIPHER CRACKED! +${points} PTS!`;
          if (passDescText) passDescText.textContent = `Keyword "${res.fragment || 'KEYWORD'}" added to squad inventory! Ready for next player...`;
          boxPassConsole.classList.remove('hidden');
        }

        // Auto-advance smoothly after 1.6 seconds
        clearTimeout(autoAdvanceTimer);
        autoAdvanceTimer = setTimeout(() => {
          if (boxPassConsole) boxPassConsole.classList.add('hidden');
          if (slotsBoard) slotsBoard.classList.remove('correct-glow');
          activeRiddleStepKey = null; // Allow next puzzle to construct fresh slots
          clearAllSlots();
        }, 1600);

      } else {
        if (sound) sound.playError();
        if (slotsBoard) {
          slotsBoard.classList.add('error-shake');
          setTimeout(() => slotsBoard.classList.remove('error-shake'), 450);
        }
        if (puzzleFeedbackBox) {
          puzzleFeedbackBox.className = 'alert-box alert-error';
          puzzleFeedbackBox.textContent = res.message || 'Incorrect answer. Re-examine the clue and premise carefully!';
          puzzleFeedbackBox.classList.remove('hidden');
        }
      }
    });
  }

  // Interactive keyboard and click event listeners
  if (btnSubmitAnswer) {
    btnSubmitAnswer.addEventListener('click', submitRiddleAnswer);
  }

  if (btnClearSlots) {
    btnClearSlots.addEventListener('click', clearAllSlots);
  }

  if (slotsBoard) {
    slotsBoard.addEventListener('click', () => {
      if (puzzleHiddenInput) puzzleHiddenInput.focus();
    });
  }

  // Listen to keystrokes on document
  document.addEventListener('keydown', (e) => {
    // Only capture if currently in member riddle view and not typing in leader textarea or other inputs
    if (!currentClientState?.puzzle || currentClientState.puzzle.type === 'leader_step') return;
    if (document.activeElement === leaderAnswerInput) return;
    if (document.activeElement && ['INPUT', 'TEXTAREA'].includes(document.activeElement.tagName) && document.activeElement !== puzzleHiddenInput) return;
    if (currentSlotCells.length === 0) return;

    if (e.key === 'Enter') {
      e.preventDefault();
      submitRiddleAnswer();
      return;
    }

    if (e.key === 'Backspace') {
      e.preventDefault();
      if (slotLetterValues[activeSlotIndex]) {
        slotLetterValues[activeSlotIndex] = '';
      } else if (activeSlotIndex > 0) {
        activeSlotIndex--;
        slotLetterValues[activeSlotIndex] = '';
      }
      setActiveSlot(activeSlotIndex);
      updateSlotVisuals();
      return;
    }

    if (e.key === 'ArrowLeft') {
      e.preventDefault();
      if (activeSlotIndex > 0) setActiveSlot(activeSlotIndex - 1);
      return;
    }

    if (e.key === 'ArrowRight') {
      e.preventDefault();
      if (activeSlotIndex < currentSlotCells.length - 1) setActiveSlot(activeSlotIndex + 1);
      return;
    }

    if (e.key === ' ' || e.code === 'Space') {
      e.preventDefault();
      // Move to start of next word group
      let offset = 0;
      for (const len of currentWordPattern) {
        offset += len;
        if (offset > activeSlotIndex) {
          if (offset < currentSlotCells.length) {
            setActiveSlot(offset);
          }
          break;
        }
      }
      return;
    }

    if (/^[a-zA-Z0-9]$/.test(e.key)) {
      e.preventDefault();
      slotLetterValues[activeSlotIndex] = e.key.toUpperCase();
      if (activeSlotIndex < currentSlotCells.length - 1) {
        activeSlotIndex++;
      }
      setActiveSlot(activeSlotIndex);
      updateSlotVisuals();
      return;
    }
  });

  // Mobile / IME input fallback on hidden input
  if (puzzleHiddenInput) {
    puzzleHiddenInput.addEventListener('input', () => {
      const chars = puzzleHiddenInput.value.replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
      if (!chars) return;
      for (let i = 0; i < chars.length; i++) {
        if (activeSlotIndex < currentSlotCells.length) {
          slotLetterValues[activeSlotIndex] = chars[i];
          if (activeSlotIndex < currentSlotCells.length - 1) activeSlotIndex++;
        }
      }
      puzzleHiddenInput.value = '';
      setActiveSlot(activeSlotIndex);
      updateSlotVisuals();
    });
  }

  if (btnNextTurnReady) {
    btnNextTurnReady.addEventListener('click', () => {
      clearTimeout(autoAdvanceTimer);
      if (boxPassConsole) boxPassConsole.classList.add('hidden');
      if (slotsBoard) slotsBoard.classList.remove('correct-glow');
      activeRiddleStepKey = null;
      clearAllSlots();
    });
  }

  // 9. Real-time typing listener for Leader Thesis Inspector
  if (leaderAnswerInput) {
    leaderAnswerInput.addEventListener('input', () => {
      const fragments = currentClientState?.team?.progress?.collectedFragments || [];
      updateLiveThesisInspector(fragments);
    });

    leaderAnswerInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        submitLeaderThesis();
      }
    });
  }

  // 10. Submit Master Thesis (Leader Step)
  function submitLeaderThesis() {
    if (!leaderAnswerInput) return;
    const answer = leaderAnswerInput.value.trim();
    if (!answer) return;

    const turnIndex = currentClientState?.team?.progress?.currentTurnIndex || 3;
    if (btnSubmitLeaderAnswer) btnSubmitLeaderAnswer.disabled = true;

    socket.emit('submit_turn_answer', { sessionToken, turnIndex, answer }, (res) => {
      if (btnSubmitLeaderAnswer) btnSubmitLeaderAnswer.disabled = false;
      if (res && res.success) {
        if (sound) {
          sound.playSuccess();
          sound.playVictoryFanfare();
        }
        triggerParticleBurst();

        const points = res.earnedPoints || res.scoreEarned || 250;
        if (floatingScorePopup) {
          floatingScorePopup.textContent = `+${points} PTS`;
        }
        if (leaderFeedbackBox) {
          leaderFeedbackBox.className = 'alert-box alert-success';
          leaderFeedbackBox.textContent = `Final Boss Conquered! Victory phrase accepted! (+${points} PTS)`;
          leaderFeedbackBox.classList.remove('hidden');
        }

        showToast(`🏆 STAGE 1 CONQUERED BY YOUR SQUAD! (+${points} PTS)`, 'success');
      } else {
        if (sound) sound.playError();
        if (leaderFeedbackBox) {
          leaderFeedbackBox.className = 'alert-box alert-error';
          leaderFeedbackBox.textContent = res.message || 'Validation failed. Check your keywords and active verb.';
          leaderFeedbackBox.classList.remove('hidden');
        }
      }
    });
  }

  if (btnSubmitLeaderAnswer) {
    btnSubmitLeaderAnswer.addEventListener('click', submitLeaderThesis);
  }

  // 11. Test Sound Button in Lounge
  if (btnTestSound) {
    btnTestSound.addEventListener('click', () => {
      if (sound) {
        sound.playSuccess();
        setTimeout(() => sound.playTurnUnlock(), 400);
      }
      showToast('Acoustic chimes test completed!', 'info');
    });
  }

  // 12. Audio Toggle
  if (soundToggleBtn) {
    soundToggleBtn.addEventListener('click', () => {
      if (sound) {
        sound.muted = !sound.muted;
        localStorage.setItem('campus_sound_muted', sound.muted ? 'true' : 'false');
        if (soundIcon) soundIcon.textContent = sound.muted ? '🔇' : '🔊';
        if (soundText) soundText.textContent = sound.muted ? 'MUTED' : 'AUDIO';
        showToast(sound.muted ? 'Audio Muted' : 'Audio Active', 'info');
      }
    });
  }

  // 13. Fullscreen Toggle
  if (btnFullscreen) {
    btnFullscreen.addEventListener('click', () => {
      if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen().catch(() => {});
      } else {
        if (document.exitFullscreen) document.exitFullscreen().catch(() => {});
      }
    });
  }

  // 14. Top Bar Host Shortcut
  if (btnHeaderHost) {
    btnHeaderHost.addEventListener('click', () => {
      window.location.href = '/admin';
    });
  }

  // 15. Switch Bench / Re-register Shortcut
  if (btnSwitchBench) {
    btnSwitchBench.addEventListener('click', () => {
      if (confirm('Switch bench or re-register roster?\n\nYour current bench progress remains safely stored on the server.')) {
        localStorage.removeItem('campus_puzzle_session_token');
        sessionToken = null;
        window.location.reload();
      }
    });
  }

  // 16. ROUND 3: SHER"UNLOCKING" HOMIES (THE BAKER STREET MYSTERY)
  let r3EliminatedSuspects = new Set();

  function renderRound3Game(state) {
    if (!state || !state.team) return;
    const team = state.team;
    const puzzle = state.puzzle;

    // 1. Top HUD
    const r3GameTeamName = document.getElementById('r3GameTeamName');
    const r3GameTeamScore = document.getElementById('r3GameTeamScore');
    if (r3GameTeamName) r3GameTeamName.textContent = team.name || '--';
    if (r3GameTeamScore) r3GameTeamScore.textContent = (team.totalScore || 0).toLocaleString();

    // 2. Progress Pipeline Ribbon
    const r3EvidencePipeline = document.getElementById('r3EvidencePipeline');
    if (r3EvidencePipeline && team.progress?.turnPipeline) {
      r3EvidencePipeline.innerHTML = '';
      team.progress.turnPipeline.forEach((step, idx) => {
        const pill = document.createElement('div');
        pill.className = `baker-step-pill ${step.status === 'SOLVED' ? 'step-solved' : (step.status === 'ACTIVE' ? 'step-active' : '')}`;
        const icon = step.status === 'SOLVED' ? '✓' : (step.status === 'ACTIVE' ? '▶' : '🔒');
        pill.innerHTML = `<span>${icon}</span> <span>${escapeHtml(step.label)}</span>`;
        r3EvidencePipeline.appendChild(pill);
        if (idx < team.progress.turnPipeline.length - 1) {
          const arrow = document.createElement('span');
          arrow.className = 'baker-step-arrow';
          arrow.textContent = '➔';
          r3EvidencePipeline.appendChild(arrow);
        }
      });
    }

    // 3. Case Summary & Dossier Header
    const r3CaseTitle = document.getElementById('r3CaseTitle');
    const r3CaseMeta = document.getElementById('r3CaseMeta');
    const r3CaseSummary = document.getElementById('r3CaseSummary');
    const dossier = puzzle?.caseDossier;
    if (dossier) {
      if (r3CaseTitle && dossier.dossierTitle) r3CaseTitle.textContent = dossier.dossierTitle;
      if (r3CaseMeta && dossier.incidentDate) r3CaseMeta.textContent = `${dossier.incidentDate} • ${dossier.location || '221B Kensington Crescent'}`;
      if (r3CaseSummary && dossier.caseSummary) r3CaseSummary.textContent = dossier.caseSummary;
    }

    // 4. Suspects Board
    const r3SuspectsGrid = document.getElementById('r3SuspectsGrid');
    if (r3SuspectsGrid && dossier?.suspects && r3SuspectsGrid.children.length === 0) {
      r3SuspectsGrid.innerHTML = '';
      dossier.suspects.forEach(s => {
        const card = document.createElement('div');
        const isElim = r3EliminatedSuspects.has(s.id);
        card.className = `suspect-card ${isElim ? 'suspect-eliminated' : ''}`;
        card.id = `card_${s.id}`;
        card.innerHTML = `
          <div class="suspect-card-header">
            <div>
              <span class="suspect-name-title">${escapeHtml(s.name)}</span>
              <span class="suspect-occupation"> • ${escapeHtml(s.occupation)}</span>
            </div>
            <button type="button" class="btn-suspect-toggle" data-id="${s.id}">
              ${isElim ? 'Restore' : 'Rule Out'}
            </button>
          </div>
          <div class="suspect-card-body">
            <div class="suspect-trait"><span class="trait-label">Boots / Stride:</span> <span>${escapeHtml(s.bootsGait)}</span></div>
            <div class="suspect-trait"><span class="trait-label">Motive:</span> <span>${escapeHtml(s.motive)}</span></div>
            <div class="suspect-trait"><span class="trait-label">Weapon / Item:</span> <span>${escapeHtml(s.weaponPossession)}</span></div>
            <div class="suspect-trait"><span class="trait-label">Stated Alibi:</span> <span style="font-style: italic;">"${escapeHtml(s.alibi)}"</span></div>
          </div>
        `;
        card.querySelector('.btn-suspect-toggle').addEventListener('click', (e) => {
          e.stopPropagation();
          if (r3EliminatedSuspects.has(s.id)) {
            r3EliminatedSuspects.delete(s.id);
            card.classList.remove('suspect-eliminated');
            e.target.textContent = 'Rule Out';
          } else {
            r3EliminatedSuspects.add(s.id);
            card.classList.add('suspect-eliminated');
            e.target.textContent = 'Restore';
          }
        });
        r3SuspectsGrid.appendChild(card);
      });
    }

    // 5. Active Investigator Info
    const r3ActivePlayerName = document.getElementById('r3ActivePlayerName');
    const r3ActivePlayerRole = document.getElementById('r3ActivePlayerRole');
    if (r3ActivePlayerName) r3ActivePlayerName.textContent = team.progress?.activePlayerName || 'Lead Detective';
    if (r3ActivePlayerRole) r3ActivePlayerRole.textContent = team.progress?.activePlayerRole || 'OPERATIVE';

    // 6. Containers
    const boxR3MemberGame = document.getElementById('boxR3MemberGame');
    const boxR3LeaderGame = document.getElementById('boxR3LeaderGame');
    const boxR3WaitingTurn = document.getElementById('boxR3WaitingTurn');
    const boxR3Completed = document.getElementById('boxR3Completed');

    [boxR3MemberGame, boxR3LeaderGame, boxR3WaitingTurn, boxR3Completed].forEach(el => el && el.classList.add('hidden'));

    // Check if team finished Round 3
    if (puzzle?.type === 'sherlock_round3_completed' || team.progress?.isRoundCompleted) {
      if (boxR3Completed) boxR3Completed.classList.remove('hidden');
      const r3VictoryCulprit = document.getElementById('r3VictoryCulprit');
      const r3VictoryWeapon = document.getElementById('r3VictoryWeapon');
      const r3VictoryMotive = document.getElementById('r3VictoryMotive');
      const r3VictoryTotalScore = document.getElementById('r3VictoryTotalScore');
      if (r3VictoryCulprit) r3VictoryCulprit.textContent = 'SILAS VANCE (The Valet)';
      if (r3VictoryWeapon) r3VictoryWeapon.textContent = 'POTASSIUM CYANIDE (In Goblet)';
      if (r3VictoryMotive) r3VictoryMotive.textContent = 'BLACKMAIL OVER FORGED SHIPPING LEDGER';
      if (r3VictoryTotalScore) r3VictoryTotalScore.textContent = `${(team.totalScore || 0).toLocaleString()} PTS`;
      return;
    }

    const isYourTurn = team.progress?.isYourTurn;

    if (!isYourTurn) {
      if (boxR3WaitingTurn) {
        boxR3WaitingTurn.classList.remove('hidden');
        const r3WaitingSub = document.getElementById('r3WaitingSub');
        if (r3WaitingSub) {
          r3WaitingSub.textContent = `Operative ${team.progress?.activePlayerName || '--'} (${team.progress?.activePlayerRole || 'PLAYER'}) is examining Evidence File ${((team.progress?.currentTurnIndex || 0) + 1)} at the console.`;
        }
      }
      return;
    }

    // Active Turn (Member or Leader)
    if (puzzle?.type === 'leader_step') {
      if (boxR3LeaderGame) {
        boxR3LeaderGame.classList.remove('hidden');
        const r3GatheredProofs = document.getElementById('r3GatheredProofs');
        if (r3GatheredProofs) {
          r3GatheredProofs.innerHTML = '';
          const frags = puzzle.collectedFragments || [];
          frags.forEach(f => {
            const chip = document.createElement('span');
            chip.className = 'proof-chip';
            chip.textContent = `✓ [${f}]`;
            r3GatheredProofs.appendChild(chip);
          });
          if (frags.length === 0) {
            r3GatheredProofs.innerHTML = '<span style="color:#64748b; font-size:0.8rem; font-style:italic;">No proofs gathered yet</span>';
          }
        }
      }
    } else {
      if (boxR3MemberGame) {
        boxR3MemberGame.classList.remove('hidden');
        const r3EvidenceNumber = document.getElementById('r3EvidenceNumber');
        const r3EvidenceCategory = document.getElementById('r3EvidenceCategory');
        const r3EvidenceTitle = document.getElementById('r3EvidenceTitle');
        const r3EvidencePrompt = document.getElementById('r3EvidencePrompt');
        const r3EvidenceClue = document.getElementById('r3EvidenceClue');
        const r3EvidenceHint = document.getElementById('r3EvidenceHint');

        if (r3EvidenceNumber) r3EvidenceNumber.textContent = `EVIDENCE FILE ${(puzzle.stepNumber || 1)} OF 3`;
        if (r3EvidenceCategory) r3EvidenceCategory.textContent = puzzle.category || 'Forensic Science';
        if (r3EvidenceTitle) r3EvidenceTitle.textContent = puzzle.title || 'Forensic Examination';
        if (r3EvidencePrompt) r3EvidencePrompt.textContent = puzzle.prompt || '';
        if (r3EvidenceClue) r3EvidenceClue.textContent = puzzle.clue || '';
        if (r3EvidenceHint) r3EvidenceHint.textContent = puzzle.hint || '';
      }
    }
  }

  // Round 3 Form Listeners
  const r3MemberForm = document.getElementById('r3MemberForm');
  if (r3MemberForm) {
    r3MemberForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const input = document.getElementById('r3MemberInput');
      const val = (input?.value || '').trim();
      const fb = document.getElementById('r3MemberFeedback');
      if (!val) {
        if (fb) { fb.textContent = 'Please enter your forensic deduction.'; fb.className = 'alert-box alert-error'; fb.classList.remove('hidden'); }
        return;
      }
      const turnIdx = currentClientState?.team?.progress?.currentTurnIndex ?? 0;
      socket.emit('submit_turn_answer', {
        sessionToken,
        turnIndex: turnIdx,
        answer: val
      }, (res) => {
        if (res && res.success) {
          if (fb) { fb.textContent = res.message || 'Forensic Proof Verified!'; fb.className = 'alert-box alert-success'; fb.classList.remove('hidden'); }
          input.value = '';
          showToast('Forensic Proof Verified!', 'success');
        } else {
          if (fb) { fb.textContent = res?.message || 'Incorrect deduction. Re-examine the testimony and clues.'; fb.className = 'alert-box alert-error'; fb.classList.remove('hidden'); }
          showToast(res?.message || 'Incorrect deduction', 'error');
        }
      });
    });
  }

  const r3LeaderForm = document.getElementById('r3LeaderForm');
  if (r3LeaderForm) {
    r3LeaderForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const input = document.getElementById('r3LeaderInput');
      const val = (input?.value || '').trim();
      const fb = document.getElementById('r3LeaderFeedback');
      if (!val) {
        if (fb) { fb.textContent = 'Please enter the official warrant: [CULPRIT]:[WEAPON]:[MOTIVE]'; fb.className = 'alert-box alert-error'; fb.classList.remove('hidden'); }
        return;
      }
      socket.emit('submit_turn_answer', {
        sessionToken,
        turnIndex: 3,
        answer: val
      }, (res) => {
        if (res && res.success) {
          if (fb) { fb.textContent = res.message || 'Warrant Verified! Mystery Solved!'; fb.className = 'alert-box alert-success'; fb.classList.remove('hidden'); }
          input.value = '';
          showToast('Warrant Verified! The Mystery is Solved!', 'success');
        } else {
          if (fb) { fb.textContent = res?.message || 'Warrant Rejected by Magistrate. Check format: [CULPRIT]:[WEAPON]:[MOTIVE]'; fb.className = 'alert-box alert-error'; fb.classList.remove('hidden'); }
          showToast(res?.message || 'Warrant Rejected', 'error');
        }
      });
    });
  }

  // Initialize Socket on DOM ready
  initSocket();
})();
