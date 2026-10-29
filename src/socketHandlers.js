/**
 * Socket.IO Handler Module
 * Manages WebSocket-only real-time rooms, throttled display pushes,
 * reconnection handshakes, rate limiting, and room-scoped team synchronization.
 */

function setupSocketHandlers(io, gameState) {
  // Throttled display-client updates (pushed every 2.5 seconds to save WiFi bandwidth)
  let lastDisplayPushTime = 0;
  function triggerDisplayPush(immediate = false) {
    const now = Date.now();
    if (immediate || now - lastDisplayPushTime >= 2000) {
      lastDisplayPushTime = now;
      const displayData = gameState.getDisplayState();
      io.to('display_room').emit('display_update', displayData);
    }
  }

  // Regular interval ticker for display timer countdown & checking round expiration
  setInterval(() => {
    if (gameState.roundState.active && !gameState.roundState.isPaused) {
      const now = Date.now();
      if (now >= gameState.roundState.endTime) {
        // Round naturally expired
        const endResult = gameState.endRound();
        io.emit('round_ended', {
          currentRound: gameState.currentRound,
          status: gameState.status
        });
        for (const teamId of gameState.teams.keys()) {
          syncTeamRoom(teamId);
        }
        triggerDisplayPush(true);
        pushAdminUpdate();
      }
    }

    // Periodic sync to display
    triggerDisplayPush(false);
  }, 1000);

  // Throttled admin update (max 1/sec) — avoids admin CPU spikes during active gameplay
  let lastAdminPushTime = 0;
  let adminPushTimer = null;
  function pushAdminUpdate(immediate = false) {
    const now = Date.now();
    const elapsed = now - lastAdminPushTime;
    if (immediate || elapsed >= 1000) {
      clearTimeout(adminPushTimer);
      adminPushTimer = null;
      lastAdminPushTime = now;
      const adminData = gameState.getAdminState();
      io.to('admin_room').emit('admin_update', adminData);
    } else if (!adminPushTimer) {
      // Schedule a deferred push for the remaining throttle window
      adminPushTimer = setTimeout(() => {
        adminPushTimer = null;
        lastAdminPushTime = Date.now();
        const adminData = gameState.getAdminState();
        io.to('admin_room').emit('admin_update', adminData);
      }, 1000 - elapsed);
    }
  }

  function syncTeamRoom(teamId) {
    if (!teamId) return;
    const team = gameState.teams.get(teamId);
    if (!team) return;

    // One state per connected laptop. A bench squad shares one socket, so sending one
    // message per member would deliver 3-4 copies (each from a different player's view).
    const sentSockets = new Set();
    team.members.forEach(token => {
      const player = gameState.players.get(token);
      if (!player || !player.socketId || sentSockets.has(player.socketId)) return;
      sentSockets.add(player.socketId);
      const ownerToken = gameState._socketIndex.get(player.socketId) || token;
      io.to(player.socketId).emit('sync_state', gameState.getClientState(ownerToken));
    });
  }

  // Main Socket Connection Handler
  io.on('connection', (socket) => {
    // ----------------------------------------------------------------
    // 1. DISPLAY CLIENT (Projector / Leaderboard)
    // ----------------------------------------------------------------
    socket.on('register_display', () => {
      socket.join('display_room');
      socket.emit('display_update', gameState.getDisplayState());
    });

    // ----------------------------------------------------------------
    // 2. ADMIN CLIENT (Control Panel)
    // ----------------------------------------------------------------
    socket.on('register_admin', (authData) => {
      if (authData && authData.password === gameState.adminPassword) {
        socket.join('admin_room');
        socket.emit('admin_authenticated', { success: true });
        socket.emit('admin_update', gameState.getAdminState());
      } else {
        socket.emit('admin_authenticated', { success: false, message: 'Invalid Admin Password' });
      }
    });

    socket.on('admin_action', (data, callback) => {
      if (!data || data.password !== gameState.adminPassword) {
        const unauth = { success: false, message: 'Unauthorized' };
        if (typeof callback === 'function') callback(unauth);
        return socket.emit('admin_action_result', unauth);
      }

      const action = data.action;
      const payload = data.payload || {};
      let result = { success: false, message: 'Unknown action' };

      switch (action) {
        case 'start_round':
          // Server-side protection against accidental skipping
          if (payload.roundNumber === 2 && gameState.status === 'LOBBY' && !payload.force) {
            result = { success: false, message: 'Round 2 is locked. Please run and complete Round 1 first.' };
            break;
          }
          if (payload.roundNumber === 3 && (gameState.status === 'LOBBY' || gameState.status === 'INTERMEDIATE_1' || gameState.status === 'ROUND_1') && !payload.force) {
            result = { success: false, message: 'Round 3 is locked. Please complete Round 2 first.' };
            break;
          }
          result = gameState.startRound(payload.roundNumber, payload.durationSec);
          if (result.success) {
            io.emit('round_started', {
              roundNumber: payload.roundNumber,
              status: gameState.status
            });
            // Sync all teams
            for (const teamId of gameState.teams.keys()) {
              syncTeamRoom(teamId);
            }
          }
          break;

        case 'pause_round':
          result = gameState.pauseRound();
          if (result.success) {
            io.emit('round_paused', result);
            for (const teamId of gameState.teams.keys()) {
              syncTeamRoom(teamId);
            }
          }
          break;

        case 'resume_round':
          result = gameState.resumeRound();
          if (result.success) {
            io.emit('round_resumed', result);
            for (const teamId of gameState.teams.keys()) {
              syncTeamRoom(teamId);
            }
          }
          break;

        case 'extend_time':
          result = gameState.extendRoundTime(payload.seconds);
          break;

        case 'end_round':
          result = gameState.endRound();
          io.emit('round_ended', { currentRound: gameState.currentRound, status: gameState.status });
          for (const teamId of gameState.teams.keys()) {
            syncTeamRoom(teamId);
          }
          break;

        case 'advance_stage':
          result = gameState.advanceStage();
          if (result.success) {
            io.emit('stage_advanced', { status: gameState.status, currentRound: gameState.currentRound });
            for (const teamId of gameState.teams.keys()) {
              syncTeamRoom(teamId);
            }
          }
          break;

        case 'force_advance':
          result = gameState.forceAdvanceTeamTurn(payload.teamId, payload.reason);
          if (result.success) {
            if (!gameState.roundState.active) {
              // The forced step was the last one outstanding, so the whole round concluded
              io.emit('round_ended', { currentRound: gameState.currentRound, status: gameState.status });
              for (const teamId of gameState.teams.keys()) {
                syncTeamRoom(teamId);
              }
            } else {
              syncTeamRoom(payload.teamId);
            }
          }
          break;

        case 'override_score':
          result = gameState.overrideTeamScore(payload.teamId, payload.scoreDelta, payload.reason);
          if (result.success) {
            syncTeamRoom(payload.teamId);
          }
          break;

        case 'reset_game':
          result = gameState.resetAllState();
          io.emit('game_reset_event');
          break;
      }

      socket.emit('admin_action_result', result);
      if (typeof callback === 'function') callback(result);
      triggerDisplayPush(true);
      pushAdminUpdate(true); // admin explicit action — always flush immediately
    });

    // ----------------------------------------------------------------
    // HOST KEYBOARD SHORTCUT (SPACEBAR OR ANY KEY ADVANCE)
    // ----------------------------------------------------------------
    socket.on('host_key_advance', (authData) => {
      // Only the host may advance the tournament (students share this socket server)
      const isHost = socket.rooms.has('admin_room') || (authData && authData.password === gameState.adminPassword);
      if (!isHost) return;
      const result = gameState.advanceStage();
      if (result.success) {
        io.emit('stage_advanced', { status: gameState.status, currentRound: gameState.currentRound });
        if (gameState.status.startsWith('ROUND_')) {
          io.emit('round_started', {
            roundNumber: gameState.currentRound,
            status: gameState.status
          });
        } else {
          io.emit('round_ended', { status: gameState.status });
        }
        for (const teamId of gameState.teams.keys()) {
          syncTeamRoom(teamId);
        }
        triggerDisplayPush(true);
        pushAdminUpdate();
      }
    });

    // ----------------------------------------------------------------
    // 3. STUDENT CLIENT (Player / Team Member)
    // ----------------------------------------------------------------
    // Bench Registration (1 Bench = 1 Leader Console, 2 or 3 Members)
    socket.on('register_bench', ({ benchNumber, teamName, gender, teamSize, leaderName, memberNames }, callback) => {
      const reg = gameState.registerBenchTeam({
        benchNumber,
        teamName,
        gender,
        teamSize,
        leaderName,
        memberNames,
        socketId: socket.id
      });

      if (reg.success) {
        socket.join(`team_${reg.team.teamId}`);
        const clientState = gameState.getClientState(reg.sessionToken);
        if (typeof callback === 'function') {
          callback({ success: true, sessionToken: reg.sessionToken, team: reg.team, teamCode: reg.teamCode, clientState });
        }
        pushAdminUpdate(true);
        triggerDisplayPush(true);
      } else {
        if (typeof callback === 'function') callback(reg);
      }
    });

    // Reconnection Handshake with Session Token
    socket.on('reconnect_session', ({ sessionToken }, callback) => {
      const rec = gameState.reconnectPlayer(sessionToken, socket.id);
      if (rec.success) {
        if (rec.player.teamId) {
          socket.join(`team_${rec.player.teamId}`);
        }
        const clientState = gameState.getClientState(sessionToken);
        if (typeof callback === 'function') {
          callback({ success: true, clientState });
        }
        pushAdminUpdate();
      } else {
        if (typeof callback === 'function') callback(rec);
      }
    });

    // Submit Turn Answer
    socket.on('submit_turn_answer', ({ sessionToken, turnIndex, answer }, callback) => {
      const player = gameState.players.get(sessionToken);
      if (!player) {
        if (typeof callback === 'function') callback({ success: false, message: 'Invalid session' });
        return;
      }

      const teamId = player.teamId;
      const result = gameState.submitTurnAnswer(sessionToken, turnIndex, answer);

      if (typeof callback === 'function') callback(result);

      if (result.success) {
        if (!gameState.roundState.active || gameState.status.startsWith('INTERMEDIATE_') || gameState.status === 'FINISHED') {
          io.emit('round_ended', {
            currentRound: gameState.currentRound,
            status: gameState.status
          });
          for (const tId of gameState.teams.keys()) {
            syncTeamRoom(tId);
          }
        } else {
          syncTeamRoom(teamId);
        }
        triggerDisplayPush(true);
        pushAdminUpdate();
      }
    });

    // Skip a timed-out Round 1 / Round 3 riddle step (0 pts, keyword revealed)
    socket.on('skip_turn', ({ sessionToken } = {}, callback) => {
      const player = gameState.players.get(sessionToken);
      const result = gameState.skipTurn(sessionToken);
      if (typeof callback === 'function') callback(result);
      if (result.success && player) {
        if (!gameState.roundState.active) {
          // That skip finished the last squad, so the round is over for everyone
          io.emit('round_ended', { currentRound: gameState.currentRound, status: gameState.status });
          for (const tId of gameState.teams.keys()) syncTeamRoom(tId);
        } else {
          syncTeamRoom(player.teamId);
        }
        triggerDisplayPush(true);
        pushAdminUpdate();
      }
    });

    // Submit Round 2 Cyber Hack Guess
    socket.on('submit_round2_guess', ({ sessionToken, guess, guessWord }, callback) => {
      const player = gameState.players.get(sessionToken);
      if (!player) {
        if (typeof callback === 'function') callback({ success: false, message: 'Invalid session' });
        return;
      }

      const actualGuess = guess || guessWord;
      const teamId = player.teamId;
      const result = gameState.submitRound2Guess(sessionToken, actualGuess);

      if (typeof callback === 'function') callback(result);

      if (result.success) {
        if (!gameState.roundState.active || gameState.status === 'INTERMEDIATE_2' || gameState.status !== 'ROUND_2') {
          io.emit('round_ended', {
            currentRound: 2,
            status: gameState.status
          });
          for (const tId of gameState.teams.keys()) {
            syncTeamRoom(tId);
          }
        } else {
          syncTeamRoom(teamId);
        }
        triggerDisplayPush(true);
        pushAdminUpdate();
      }
    });

    // Manual Refresh Request
    socket.on('request_state_refresh', ({ sessionToken }) => {
      if (sessionToken) {
        const clientState = gameState.getClientState(sessionToken);
        if (clientState) {
          socket.emit('sync_state', clientState);
        }
      }
    });

    // Socket Disconnect
    socket.on('disconnect', () => {
      const disconnectedPlayer = gameState.handleDisconnect(socket.id);
      if (disconnectedPlayer && disconnectedPlayer.teamId) {
        syncTeamRoom(disconnectedPlayer.teamId);
        pushAdminUpdate();
      }
    });
  });
}

module.exports = {
  setupSocketHandlers
};
