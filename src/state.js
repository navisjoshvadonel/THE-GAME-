const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { ROUND_CONFIGS, PUZZLE_SETS, getPuzzleSetForTeam, checkStepAnswer, checkLeaderExactCode, evaluateWordleGuess } = require('./puzzles');
const { validateLeaderPhrase, sanitizeText } = require('./nlpValidator');

const SNAPSHOT_DIR = path.join(__dirname, '..', 'data');
const SNAPSHOT_FILE = path.join(SNAPSHOT_DIR, 'snapshot.json');

class GameStateManager {
  constructor(adminPassword = 'campus_admin_2026') {
    this.adminPassword = process.env.ADMIN_SECRET || adminPassword;

    // Core Game State
    this.status = 'LOBBY'; // 'LOBBY' | 'ROUND_1' | 'INTERMEDIATE_1' | 'ROUND_2' | 'INTERMEDIATE_2' | 'ROUND_3' | 'FINISHED'
    this.currentRound = null;
    this.roundState = {
      roundNumber: null,
      startTime: null,
      endTime: null,
      durationSec: 0,
      active: false,
      isPaused: false,
      remainingMsOnPause: 0
    };

    this.lobbyTimer = {
      active: false,
      startTime: null,
      endTime: null,
      durationSec: 300 // 5 minutes default
    };

    // Maps: sessionToken -> player, teamId -> team
    this.players = new Map();
    this.teams = new Map();

    // --- PERFORMANCE INDEXES ---
    // O(1) socket → player lookup (avoids O(n) scan on every disconnect)
    this._socketIndex = new Map(); // socketId -> sessionToken
    // O(1) bench number → teamId lookup (avoids O(n) scan on bench-session API)
    this._benchIndex = new Map(); // normalizedBenchKey -> teamId

    // --- LEADERBOARD CACHE ---
    // Avoid rebuilding the full leaderboard on every admin/display tick
    this._leaderboardCache = null;
    this._leaderboardDirty = true;

    // --- DEBOUNCED SNAPSHOT ---
    this._snapshotTimer = null;
    this._snapshotPending = false;

    // Event audit logs
    this.auditLogs = [];

    // Ensure snapshot folder exists
    if (!fs.existsSync(SNAPSHOT_DIR)) {
      fs.mkdirSync(SNAPSHOT_DIR, { recursive: true });
    }

    // Try auto-loading existing snapshot if server rebooted
    this.loadSnapshot();

    // Periodic auto-snapshot every 10 seconds (belt-and-suspenders for debounce)
    setInterval(() => {
      if (this._snapshotPending) this._flushSnapshot();
    }, 10000);
  }

  // Debounced save: coalesces rapid saves into one write per 3 seconds
  saveSnapshot(immediate = false) {
    this._snapshotPending = true;
    if (immediate) {
      this._flushSnapshot();
      return;
    }
    if (!this._snapshotTimer) {
      this._snapshotTimer = setTimeout(() => {
        this._snapshotTimer = null;
        this._flushSnapshot();
      }, 3000);
    }
  }

  _flushSnapshot() {
    if (!this._snapshotPending) return;
    this._snapshotPending = false;
    try {
      const data = {
        status: this.status,
        currentRound: this.currentRound,
        roundState: this.roundState,
        lobbyTimer: this.lobbyTimer,
        players: Array.from(this.players.entries()),
        teams: Array.from(this.teams.entries()),
        auditLogs: this.auditLogs.slice(0, 50),
        savedAt: new Date().toISOString()
      };
      const tempFile = `${SNAPSHOT_FILE}.tmp`;
      fs.writeFileSync(tempFile, JSON.stringify(data, null, 2), 'utf-8');
      fs.renameSync(tempFile, SNAPSHOT_FILE);
    } catch (err) {
      console.error('[Snapshot Save Error]:', err.message);
    }
  }

  // Mark leaderboard as needing rebuild on next access
  _invalidateLeaderboard() {
    this._leaderboardDirty = true;
  }

  // Rebuild bench index from current teams Map (called after load/reset)
  _rebuildIndexes() {
    this._socketIndex.clear();
    this._benchIndex.clear();
    for (const [token, player] of this.players) {
      if (player.socketId) this._socketIndex.set(player.socketId, token);
    }
    for (const [teamId, team] of this.teams) {
      if (team.benchNumber) {
        const key = team.benchNumber.toLowerCase().replace(/[^0-9a-z]/g, '');
        this._benchIndex.set(key, teamId);
        // Also index numeric-only version
        const numKey = key.replace(/[^0-9]/g, '');
        if (numKey) this._benchIndex.set(numKey, teamId);
      }
    }
  }

  logEvent(type, detail) {
    const entry = {
      timestamp: new Date().toISOString(),
      type,
      detail
    };
    this.auditLogs.unshift(entry);
    if (this.auditLogs.length > 200) this.auditLogs.pop();
  }

  /* -------------------------------------------------------------
   * PERSISTENCE & RECOVERY
   * ----------------------------------------------------------- */
  // (saveSnapshot, _flushSnapshot, _invalidateLeaderboard, _rebuildIndexes are defined above in constructor block)

  loadSnapshot() {
    try {
      if (!fs.existsSync(SNAPSHOT_FILE)) return;
      const raw = fs.readFileSync(SNAPSHOT_FILE, 'utf-8');
      const data = JSON.parse(raw);

      this.status = data.status || 'LOBBY';
      this.currentRound = data.currentRound || null;
      this.roundState = data.roundState || this.roundState;
      this.lobbyTimer = data.lobbyTimer || this.lobbyTimer;

      if (Array.isArray(data.players)) {
        this.players = new Map(data.players);
        // Mark all players offline initially until sockets reconnect
        for (const [token, player] of this.players) {
          player.isOnline = false;
          player.socketId = null;
        }
      }

      if (Array.isArray(data.teams)) {
        this.teams = new Map(data.teams);
      }

      if (Array.isArray(data.auditLogs)) {
        this.auditLogs = data.auditLogs;
      }

      // Rebuild O(1) lookup indexes after loading
      this._rebuildIndexes();
      this._invalidateLeaderboard();
      console.log(`[Snapshot Loaded]: Restored ${this.players.size} players and ${this.teams.size} teams.`);
    } catch (err) {
      console.warn('[Snapshot Load Warning]: Could not restore previous state. Starting fresh.', err.message);
    }
  }

  resetAllState() {
    this.status = 'LOBBY';
    this.currentRound = null;
    this.roundState = {
      roundNumber: null,
      startTime: null,
      endTime: null,
      durationSec: 0,
      active: false,
      isPaused: false,
      remainingMsOnPause: 0
    };
    this.lobbyTimer = {
      active: false,
      startTime: null,
      endTime: null,
      durationSec: 300
    };
    this.players.clear();
    this.teams.clear();
    this.auditLogs = [];
    // Clear all indexes
    this._socketIndex.clear();
    this._benchIndex.clear();
    this._invalidateLeaderboard();
    this.saveSnapshot(true); // immediate flush on reset
    this.logEvent('STATE_RESET', 'All game data wiped by administrator.');
  }

  /* -------------------------------------------------------------
   * LOBBY & PLAYER MANAGEMENT
   * ----------------------------------------------------------- */
  registerPlayer(name, gender, socketId) {
    const cleanName = sanitizeText(name).slice(0, 24);
    const cleanGender = (gender || '').toLowerCase().trim();

    if (!cleanName || cleanName.length < 2) {
      return { success: false, message: 'Please enter a valid display name (at least 2 characters).' };
    }

    if (!['male', 'female'].includes(cleanGender)) {
      return { success: false, message: 'Gender must be specified as "male" or "female".' };
    }

    const sessionToken = crypto.randomUUID();
    const player = {
      sessionToken,
      name: cleanName,
      gender: cleanGender,
      teamId: null,
      isLeader: false,
      isOnline: true,
      socketId,
      lastActive: Date.now(),
      lastSubmitTime: 0
    };

    this.players.set(sessionToken, player);
    this._socketIndex.set(socketId, sessionToken); // index for O(1) disconnect
    this.logEvent('PLAYER_JOINED', `${cleanName} (${cleanGender}) joined the lobby.`);
    this.saveSnapshot();
    this._invalidateLeaderboard();

    return {
      success: true,
      sessionToken,
      player: {
        sessionToken,
        name: player.name,
        gender: player.gender,
        teamId: null,
        isLeader: false
      }
    };
  }

  reconnectPlayer(sessionToken, socketId) {
    if (!sessionToken || !this.players.has(sessionToken)) {
      return { success: false, message: 'Session token not found. Please rejoin.' };
    }

    const player = this.players.get(sessionToken);
    // Remove old socket from index if it changed
    if (player.socketId && player.socketId !== socketId) {
      this._socketIndex.delete(player.socketId);
    }
    player.socketId = socketId;
    player.isOnline = true;
    player.lastActive = Date.now();
    this._socketIndex.set(socketId, sessionToken); // keep index fresh

    let team = null;
    if (player.teamId && this.teams.has(player.teamId)) {
      team = this.teams.get(player.teamId);
    }

    this.logEvent('PLAYER_RECONNECTED', `${player.name} reconnected.`);
    this._invalidateLeaderboard();

    return {
      success: true,
      player,
      team
    };
  }

  handleDisconnect(socketId) {
    // O(1) lookup via socket index — fast path
    const token = this._socketIndex.get(socketId);
    let player = token ? this.players.get(token) : null;

    // Fallback: O(n) scan if socketId was set directly on player (e.g. unit tests or desync)
    if (!player) {
      for (const p of this.players.values()) {
        if (p.socketId === socketId) {
          player = p;
          break;
        }
      }
    }

    if (!player) {
      this._socketIndex.delete(socketId);
      return null;
    }

    player.isOnline = false;
    player.lastActive = Date.now();
    this._socketIndex.delete(socketId);
    this.logEvent('PLAYER_DISCONNECTED', `${player.name} went offline.`);
    this._invalidateLeaderboard();
    return player;
  }

  /* -------------------------------------------------------------
   * BENCH TEAM REGISTRATION (One Bench, One Leader Console, 2 or 3 Members)
   * ----------------------------------------------------------- */
  registerBenchTeam({ benchNumber, teamName, gender = 'open', teamSize = 3, leaderName, memberNames = [], socketId }) {
    const cabinetIdx = this.teams.size + 1;
    const cleanBench = (benchNumber && benchNumber !== 'Bench 01')
      ? sanitizeText(benchNumber).trim()
      : `Cabinet ${String(cabinetIdx).padStart(2, '0')}`;
    const cleanLeader = sanitizeText(leaderName).trim();
    if (!cleanLeader || cleanLeader.length < 2) {
      return { success: false, message: 'Please enter a valid Team Leader name (at least 2 characters).' };
    }

    const rawSize = parseInt(teamSize, 10);
    const cleanTeamSize = [2, 3, 4].includes(rawSize) ? rawSize : 3;
    const cleanGender = ['male', 'female', 'open'].includes((gender || '').toLowerCase())
      ? (gender || '').toLowerCase()
      : 'open';

    // Filter valid member names
    const filteredMemberNames = (Array.isArray(memberNames) ? memberNames : [])
      .map(n => sanitizeText(n).trim())
      .filter(n => n.length >= 2);

    const requiredTeammates = cleanTeamSize - 1; // 1 member for size 2, 2 members for size 3, 3 members for size 4
    if (filteredMemberNames.length < requiredTeammates) {
      return {
        success: false,
        message: `Please enter names for all ${cleanTeamSize} team members (1 leader + ${requiredTeammates} member${requiredTeammates > 1 ? 's' : ''}).`
      };
    }

    const cleanTeamName = sanitizeText(teamName).trim();
    if (!cleanTeamName || cleanTeamName.length < 2) {
      return { success: false, message: 'Please enter a valid Team Name (at least 2 characters).' };
    }

    // 1. Create Leader Player
    const leaderToken = crypto.randomUUID();
    const leaderPlayer = {
      sessionToken: leaderToken,
      name: cleanLeader,
      gender: cleanGender,
      teamId: null,
      isLeader: true,
      isOnline: true,
      socketId,
      lastActive: Date.now(),
      lastSubmitTime: 0
    };
    this.players.set(leaderToken, leaderPlayer);

    // 2. Create Teammates
    const teammateTokens = [];
    for (let i = 0; i < requiredTeammates; i++) {
      const tName = filteredMemberNames[i];
      const tToken = crypto.randomUUID();
      const tPlayer = {
        sessionToken: tToken,
        name: tName,
        gender: cleanGender,
        teamId: null,
        isLeader: false,
        isOnline: true,
        socketId,
        lastActive: Date.now(),
        lastSubmitTime: 0
      };
      this.players.set(tToken, tPlayer);
      teammateTokens.push(tToken);
    }

    // 3. Team Ordering: Teammates first, Leader last!
    const allMembers = [...teammateTokens, leaderToken];

    // Generate unique team code (e.g. B01-7G4K)
    const benchPrefix = cleanBench.replace(/[^A-Za-z0-9]/g, '').toUpperCase().slice(0, 6) || 'B01';
    let teamCode = '';
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    do {
      const rnd = Array.from({ length: 4 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
      teamCode = `${benchPrefix}-${rnd}`;
    } while (this.teams.has(teamCode));

    const team = {
      teamId: teamCode,
      benchNumber: cleanBench,
      name: cleanTeamName,
      gender: cleanGender,
      leaderSessionToken: leaderToken,
      members: allMembers,
      teamSize: allMembers.length,
      totalScore: 0,
      roundScores: { 1: 0, 2: 0, 3: 0 },
      isEliminated: false,
      currentRoundProgress: null
    };

    // Bind teamId to players
    leaderPlayer.teamId = teamCode;
    teammateTokens.forEach(tok => {
      const p = this.players.get(tok);
      if (p) p.teamId = teamCode;
    });

    // If competition round is currently running, initialize this bench with an unassigned unique set
    if (this.roundState.active && this.currentRound) {
      const assignedSetIds = new Set();
      for (const t of this.teams.values()) {
        if (t.currentRoundProgress?.setId) {
          assignedSetIds.add(t.currentRoundProgress.setId);
        }
      }
      const puzzleSet = getPuzzleSetForTeam(this.currentRound, this.teams.size, assignedSetIds);
      team.currentRoundProgress = {
        roundNumber: this.currentRound,
        setId: puzzleSet.setId,
        theme: puzzleSet.theme,
        currentTurnIndex: 0,
        currentTurnStartedAt: Date.now(),
        collectedFragments: [],
        stepSolved: {},
        attemptsByNode: {},
        collectedWords: [],
        nodesBreached: 0,
        totalNodes: puzzleSet.steps ? puzzleSet.steps.length : (this.currentRound === 2 ? 10 : 4),
        isRoundCompleted: false,
        completedAt: null,
        assembledSubmission: null
      };
    }

    this.teams.set(teamCode, team);
    // Update bench index for O(1) bench-session API lookups
    if (cleanBench) {
      const benchKey = cleanBench.toLowerCase().replace(/[^0-9a-z]/g, '');
      this._benchIndex.set(benchKey, teamCode);
      const numKey = benchKey.replace(/[^0-9]/g, '');
      if (numKey) this._benchIndex.set(numKey, teamCode);
    }
    // Update socket index for all members (all share the leader's socketId at registration)
    this._socketIndex.set(socketId, leaderToken);
    this.logEvent('BENCH_REGISTERED', `Bench "${cleanBench}" [${team.name}] registered with ${allMembers.length} players (Leader: ${cleanLeader}).`);
    this.saveSnapshot();
    this._invalidateLeaderboard();

    return {
      success: true,
      sessionToken: leaderToken,
      team,
      teamCode,
      clientState: this.getClientState(leaderToken)
    };
  }

  /* -------------------------------------------------------------
   * TEAM CREATION & JOINING (Gender-Exclusive, Max 4)
   * ----------------------------------------------------------- */
  createTeam(sessionToken, teamName) {
    const player = this.players.get(sessionToken);
    if (!player) return { success: false, message: 'Invalid session' };
    if (player.teamId) return { success: false, message: 'You are already in a team' };

    const cleanTeamName = sanitizeText(teamName).slice(0, 20) || `${player.name}'s Squad`;

    // Generate unique 5-char team code (e.g. ALPHA, 7G4K2)
    let teamCode = '';
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    do {
      teamCode = Array.from({ length: 5 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
    } while (this.teams.has(teamCode));

    const team = {
      teamId: teamCode,
      name: cleanTeamName,
      gender: player.gender, // Locked to creator's gender (gender-exclusive!)
      leaderSessionToken: player.sessionToken,
      members: [player.sessionToken],
      totalScore: 0,
      roundScores: { 1: 0, 2: 0, 3: 0 },
      isEliminated: false,
      currentRoundProgress: null
    };

    player.teamId = teamCode;
    player.isLeader = true;

    this.teams.set(teamCode, team);
    this.logEvent('TEAM_CREATED', `Team "${cleanTeamName}" [${teamCode}] created (${player.gender}-exclusive).`);
    this.saveSnapshot();

    return {
      success: true,
      team,
      teamCode
    };
  }

  joinTeam(sessionToken, teamCode) {
    const player = this.players.get(sessionToken);
    if (!player) return { success: false, message: 'Invalid session' };
    if (player.teamId) return { success: false, message: 'You are already in a team' };

    const normalizedCode = (teamCode || '').trim().toUpperCase();
    const team = this.teams.get(normalizedCode);

    if (!team) {
      return { success: false, message: 'Team code not found. Please double-check with your leader.' };
    }

    if (team.members.length >= 4) {
      return { success: false, message: 'Team is already full (maximum 4 members reached).' };
    }

    // GENDER-EXCLUSIVE ENFORCEMENT
    if (team.gender !== player.gender) {
      const targetGender = team.gender.toUpperCase();
      return {
        success: false,
        message: `Gender-exclusive team rule: This team is designated for ${targetGender} members only.`
      };
    }

    team.members.push(player.sessionToken);
    player.teamId = team.teamId;
    player.isLeader = false;

    this.logEvent('PLAYER_JOINED_TEAM', `${player.name} joined Team ${team.name} [${team.teamId}].`);
    this.saveSnapshot();

    return {
      success: true,
      team
    };
  }

  leaveTeam(sessionToken) {
    const player = this.players.get(sessionToken);
    if (!player || !player.teamId) return { success: false, message: 'Not in a team' };

    const team = this.teams.get(player.teamId);
    if (!team) return { success: false, message: 'Team not found' };

    // Cannot leave once game has started
    if (this.status !== 'LOBBY') {
      return { success: false, message: 'Cannot leave team after the competition has started.' };
    }

    team.members = team.members.filter(t => t !== sessionToken);
    player.teamId = null;
    player.isLeader = false;

    if (team.members.length === 0) {
      this.teams.delete(team.teamId);
      this.logEvent('TEAM_DISSOLVED', `Team ${team.name} dissolved.`);
    } else if (team.leaderSessionToken === sessionToken) {
      // Reassign leader to first remaining member
      team.leaderSessionToken = team.members[0];
      const newLeader = this.players.get(team.members[0]);
      if (newLeader) newLeader.isLeader = true;
      this.logEvent('LEADER_REASSIGNED', `${newLeader?.name} is now the leader of Team ${team.name}.`);
    }

    this.saveSnapshot();
    return { success: true, team };
  }

  autoMergeLeftovers() {
    const unassignedPlayers = Array.from(this.players.values()).filter(p => !p.teamId);
    if (unassignedPlayers.length === 0) {
      return { success: true, count: 0, message: 'All students are already in teams.' };
    }

    const males = unassignedPlayers.filter(p => p.gender === 'male');
    const females = unassignedPlayers.filter(p => p.gender === 'female');

    let createdTeamsCount = 0;

    const groupIntoTeams = (pool, genderLabel) => {
      // First, try filling existing gender-matched teams with < 4 members
      for (const team of this.teams.values()) {
        if (team.gender === genderLabel && team.members.length < 4 && pool.length > 0) {
          while (team.members.length < 4 && pool.length > 0) {
            const p = pool.shift();
            p.teamId = team.teamId;
            p.isLeader = false;
            team.members.push(p.sessionToken);
          }
        }
      }

      // Remaining players get formed into new squads of up to 4
      while (pool.length > 0) {
        const batch = pool.splice(0, 4);
        const leader = batch[0];
        const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
        let code = '';
        do {
          code = Array.from({ length: 5 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
        } while (this.teams.has(code));

        const teamName = `Squad ${genderLabel.toUpperCase()}-${createdTeamsCount + 1}`;
        const team = {
          teamId: code,
          name: teamName,
          gender: genderLabel,
          leaderSessionToken: leader.sessionToken,
          members: batch.map(p => p.sessionToken),
          totalScore: 0,
          roundScores: { 1: 0, 2: 0, 3: 0 },
          isEliminated: false,
          currentRoundProgress: null
        };

        leader.isLeader = true;
        batch.forEach(p => {
          p.teamId = code;
        });

        this.teams.set(code, team);
        createdTeamsCount++;
      }
    };

    groupIntoTeams(males, 'male');
    groupIntoTeams(females, 'female');

    this.logEvent('AUTO_MERGE', `Auto-merged unassigned players. Created ${createdTeamsCount} new gender-matched teams.`);
    this.saveSnapshot();

    return {
      success: true,
      count: unassignedPlayers.length,
      createdTeamsCount
    };
  }

  /* -------------------------------------------------------------
   * ROUND ENGINE (Reusable across Round 1, 2, and 3)
   * ----------------------------------------------------------- */
  startRound(roundNumber, customDurationSec = null) {
    const config = ROUND_CONFIGS[roundNumber];
    if (!config) return { success: false, message: 'Invalid round number' };

    const duration = customDurationSec || config.durationSec;
    const now = Date.now();

    this.status = `ROUND_${roundNumber}`;
    this.currentRound = roundNumber;
    this.roundState = {
      roundNumber,
      startTime: now,
      endTime: now + duration * 1000,
      durationSec: duration,
      active: true,
      isPaused: false,
      remainingMsOnPause: 0
    };

    // For Round 3 (Final Decider), qualify only top 5 teams
    if (roundNumber === 3) {
      const sortedTeams = Array.from(this.teams.values())
        .sort((a, b) => b.totalScore - a.totalScore);

      sortedTeams.forEach((t, idx) => {
        t.isEliminated = idx >= 5;
      });
    }

    // Initialize round progress for participating teams
    const assignedSetIds = new Set();
    let teamIdx = 0;
    for (const team of this.teams.values()) {
      if (team.isEliminated) continue;

      const puzzleSet = getPuzzleSetForTeam(roundNumber, teamIdx, assignedSetIds);
      teamIdx++;

      // Ensure leader is at the end of members turn sequence
      const nonLeaders = team.members.filter(t => t !== team.leaderSessionToken);
      const orderedMembers = [...nonLeaders, team.leaderSessionToken];
      team.members = orderedMembers;

      team.currentRoundProgress = {
        roundNumber,
        setId: puzzleSet.setId,
        theme: puzzleSet.theme,
        currentTurnIndex: 0,
        currentTurnStartedAt: now,
        collectedFragments: [],
        stepSolved: {},
        attemptsByNode: {},
        collectedWords: [],
        nodesBreached: 0,
        totalNodes: roundNumber === 2 ? 10 : 4,
        isRoundCompleted: false,
        completedAt: null,
        assembledSubmission: null
      };
    }

    this.logEvent('ROUND_STARTED', `Round ${roundNumber} started (${duration}s).`);
    this._invalidateLeaderboard();
    this.saveSnapshot(true); // immediate on round start

    return { success: true, roundState: this.roundState };
  }

  pauseRound() {
    if (!this.roundState.active || this.roundState.isPaused) {
      return { success: false, message: 'Round is not active or already paused' };
    }
    const remainingMs = Math.max(0, this.roundState.endTime - Date.now());
    this.roundState.isPaused = true;
    this.roundState.remainingMsOnPause = remainingMs;
    this.logEvent('ROUND_PAUSED', `Round ${this.currentRound} paused with ${Math.round(remainingMs / 1000)}s remaining.`);
    this.saveSnapshot();
    return { success: true, remainingMs };
  }

  resumeRound() {
    if (!this.roundState.active || !this.roundState.isPaused) {
      return { success: false, message: 'Round is not paused' };
    }
    const now = Date.now();
    this.roundState.isPaused = false;
    this.roundState.startTime = now - (this.roundState.durationSec * 1000 - this.roundState.remainingMsOnPause);
    this.roundState.endTime = now + this.roundState.remainingMsOnPause;
    this.logEvent('ROUND_RESUMED', `Round ${this.currentRound} resumed.`);
    this.saveSnapshot();
    return { success: true, endTime: this.roundState.endTime };
  }

  extendRoundTime(secondsToAdd) {
    if (!this.roundState.active) {
      return { success: false, message: 'Round is not active' };
    }
    this.roundState.endTime += secondsToAdd * 1000;
    this.roundState.durationSec += secondsToAdd;
    this.logEvent('ROUND_TIME_EXTENDED', `Extended Round ${this.currentRound} by ${secondsToAdd}s.`);
    this.saveSnapshot();
    return { success: true, newEndTime: this.roundState.endTime };
  }

  startLobbyTimer(durationSec = 300) {
    const now = Date.now();
    this.lobbyTimer = {
      active: true,
      startTime: now,
      endTime: now + durationSec * 1000,
      durationSec
    };
    this.logEvent('LOBBY_TIMER_STARTED', `Lobby assembly countdown started (${durationSec}s).`);
    this.saveSnapshot();
    return { success: true, lobbyTimer: this.lobbyTimer };
  }

  endRound() {
    if (!this.roundState.active) {
      return { success: false, message: 'Round is not active' };
    }

    const completedRound = this.currentRound;
    this.roundState.active = false;
    this.roundState.isPaused = false;

    if (completedRound === 3) {
      this.status = 'FINISHED';
    } else if (completedRound === 2) {
      this.status = 'INTERMEDIATE_2';
      // Mark Top 5 qualified, others eliminated for the finals
      const sortedTeams = Array.from(this.teams.values()).sort((a, b) => b.totalScore - a.totalScore);
      sortedTeams.forEach((t, idx) => {
        t.isEliminated = idx >= 5;
      });
      this.logEvent('FINALS_QUALIFIED', `Top 5 finalists determined for Round 3.`);
    } else {
      this.status = `INTERMEDIATE_${completedRound}`;
    }

    this.logEvent('ROUND_ENDED', `Round ${completedRound} ended.`);
    this._invalidateLeaderboard();
    this.saveSnapshot(true); // immediate on round end

    return {
      success: true,
      status: this.status,
      leaderboard: this.getLeaderboard()
    };
  }

  advanceStage() {
    if (this.status === 'LOBBY') {
      this.autoMergeLeftovers();
      return this.startRound(1);
    }
    if (this.status === 'ROUND_1') {
      return this.endRound();
    }
    if (this.status === 'INTERMEDIATE_1') {
      return this.startRound(2);
    }
    if (this.status === 'ROUND_2') {
      return this.endRound();
    }
    if (this.status === 'INTERMEDIATE_2') {
      return this.startRound(3);
    }
    if (this.status === 'ROUND_3') {
      return this.endRound();
    }
    return { success: false, message: `Cannot advance from status: ${this.status}` };
  }

  /* -------------------------------------------------------------
   * DYNAMIC SPEED-DECAY SCORING CALCULATION
   * Faster solve = high score, decreases gradually over turn window
   * ----------------------------------------------------------- */
  calculateDynamicPoints(startedAtMs, durationSec = 150, maxPts = 250, minPts = 100) {
    const now = Date.now();
    const elapsedSec = Math.max(0, (now - (startedAtMs || now)) / 1000);
    // Lightning fast solve (within first 15 seconds) receives full max points!
    const gracePeriodSec = 15;
    if (elapsedSec <= gracePeriodSec) {
      return maxPts;
    }
    const decayDuration = Math.max(1, durationSec - gracePeriodSec);
    const decayFraction = Math.min(1, Math.max(0, (elapsedSec - gracePeriodSec) / decayDuration));
    const points = Math.round(maxPts - (decayFraction * (maxPts - minPts)));
    return Math.max(minPts, Math.min(maxPts, points));
  }

  /* -------------------------------------------------------------
   * TURN PUZZLE SUBMISSION & SERVER-AUTHORITATIVE SCORING
   * ----------------------------------------------------------- */
  submitTurnAnswer(sessionToken, turnIndex, answer) {
    if (typeof sessionToken === 'object' && sessionToken !== null) {
      answer = sessionToken.answer;
      turnIndex = sessionToken.turnIndex;
      sessionToken = sessionToken.sessionToken;
    }
    const player = this.players.get(sessionToken);
    if (!player) return { success: false, message: 'Invalid session' };

    // Rate-limiting check: reject spam faster than 1 submit per 1.5 seconds per session
    const now = Date.now();
    if (now - player.lastSubmitTime < 1500) {
      return { success: false, message: 'Submission cooldown active. Please wait a moment.' };
    }
    player.lastSubmitTime = now;

    // Check round active
    if (!this.roundState.active) {
      return { success: false, message: 'No round is currently in progress.' };
    }
    if (this.roundState.isPaused) {
      return { success: false, message: 'The round is currently paused by the host.' };
    }
    if (now > this.roundState.endTime) {
      return { success: false, message: 'Time has expired for this round!' };
    }

    const team = this.teams.get(player.teamId);
    if (!team) return { success: false, message: 'Team not found' };
    if (team.isEliminated) return { success: false, message: 'Your team did not qualify for this round.' };

    const progress = team.currentRoundProgress;
    if (!progress) return { success: false, message: 'Round progress not initialized' };
    if (progress.isRoundCompleted) {
      return { success: true, alreadySolved: true, message: 'Your team has already completed this round!' };
    }

    // Idempotent check: if this step was already completed, return immediately
    if (progress.stepSolved[turnIndex] === true) {
      return { success: true, alreadySolved: true, message: 'This step was already submitted.' };
    }

    // Turn verification: active member or bench leader can submit
    const memberDetails = team.members.map(tok => this.players.get(tok)).filter(Boolean);
    const turnAssign = this.getTurnPlayer(memberDetails, progress.currentTurnIndex, this.currentRound);
    const activeScholarToken = turnAssign.scholar ? turnAssign.scholar.sessionToken : null;
    const isLeaderSession = team.leaderSessionToken === sessionToken;
    const isActiveMemberSession = activeScholarToken === sessionToken;

    if (!isActiveMemberSession && !isLeaderSession) {
      return { success: false, message: 'It is not your turn to submit.' };
    }

    const sets = PUZZLE_SETS[this.currentRound] || [];
    const puzzleSet = sets.find(s => s.setId === progress.setId) || sets[0];
    const totalRiddleSteps = puzzleSet?.steps?.length || 3;
    const isLeaderTurn = progress.currentTurnIndex >= totalRiddleSteps;

    // NON-LEADER STEP (Games 1, 2, 3)
    if (!isLeaderTurn) {
      const stepValidation = checkStepAnswer(this.currentRound, progress.setId, turnIndex, answer);
      if (!stepValidation.success) {
        return { success: false, message: stepValidation.message };
      }

      // Dynamic Speed-Decay Scoring: Fast solve = 250 PTS, decreases gradually down to 100 PTS!
      const turnStartedAt = progress.currentTurnStartedAt || this.roundState.startTime;
      const turnDurationSec = 150; // 2.5 minutes
      const stepPoints = this.calculateDynamicPoints(turnStartedAt, turnDurationSec, 250, 100);

      // Mark step solved
      progress.stepSolved[turnIndex] = true;
      progress.collectedFragments.push(stepValidation.fragment);
      progress.currentTurnIndex++; // Advance to next player
      progress.currentTurnStartedAt = Date.now(); // Reset 2.5 min window for new operative step

      team.totalScore += stepPoints;
      team.roundScores[this.currentRound] = (team.roundScores[this.currentRound] || 0) + stepPoints;
      this._invalidateLeaderboard(); // score changed

      const memberDetails = team.members.map(tok => this.players.get(tok)).filter(Boolean);
      const turnAssignment = this.getTurnPlayer(memberDetails, turnIndex);
      const activeMemberObj = turnAssignment.scholar || player;
      this.logEvent('STEP_SOLVED', `Team ${team.name}: Game ${turnIndex + 1} solved by ${activeMemberObj.name} (+${stepPoints} pts).`);
      this.saveSnapshot();

      return {
        success: true,
        earnedPoints: stepPoints,
        pointsAwarded: stepPoints,
        scoreEarned: stepPoints,
        totalScore: team.totalScore,
        fragment: stepValidation.fragment,
        nextTurnIndex: progress.currentTurnIndex,
        message: `Game ${turnIndex + 1} cracked! Keyword unlocked: "${stepValidation.fragment}"! (+${stepPoints} PTS)`
      };
    }

    // LEADER STEP (Game 4: Final Boss Assembly)
    if (isLeaderTurn) {
      let finalValidation = null;

      if (this.currentRound === 1) {
        // Round 1: Offline NLP Sentence Coherence Check
        finalValidation = validateLeaderPhrase(answer, progress.collectedFragments);
      } else {
        // Round 2 & 3: Exact Master Code Match
        finalValidation = checkLeaderExactCode(this.currentRound, progress.setId, answer);
      }

      if (!finalValidation.success && !finalValidation.isValid) {
        return {
          success: false,
          message: finalValidation.message || 'Incorrect final solution. Check your collected keywords and active verb!'
        };
      }

      // Round Complete for Team!
      progress.stepSolved[turnIndex] = true;
      progress.isRoundCompleted = true;
      progress.completedAt = now;
      progress.assembledSubmission = sanitizeText(answer);

      // Leader Dynamic Speed-Decay Scoring: Fast solve = 250 PTS, decreases gradually down to 100 PTS!
      const leaderTurnStartedAt = progress.currentTurnStartedAt || this.roundState.startTime;
      const leaderPoints = this.calculateDynamicPoints(leaderTurnStartedAt, 150, 250, 100);

      team.totalScore += leaderPoints;
      team.roundScores[this.currentRound] = (team.roundScores[this.currentRound] || 0) + leaderPoints;

      this.logEvent('TEAM_ROUND_COMPLETED', `Team ${team.name} COMPLETED Round ${this.currentRound} in ${Math.round((now - this.roundState.startTime) / 1000)}s! (+${leaderPoints} pts).`);
      this.saveSnapshot();

      // Check if all participating teams have finished Round
      const activeTeams = Array.from(this.teams.values()).filter(t => !t.isEliminated);
      const allFinished = activeTeams.length > 0 && activeTeams.every(t => t.currentRoundProgress?.isRoundCompleted);
      if (allFinished) {
        this.logEvent('ALL_TEAMS_FINISHED', `All ${activeTeams.length} teams completed Round ${this.currentRound}! Concluding stage.`);
        this.endRound();
      }

      return {
        success: true,
        isRoundCompleted: true,
        earnedPoints: leaderPoints,
        pointsAwarded: leaderPoints,
        scoreEarned: leaderPoints,
        totalScore: team.totalScore,
        message: `Final Boss Conquered! Victory phrase accepted! (+${leaderPoints} PTS)`
      };
    }
  }


  /* -------------------------------------------------------------
   * ROUND 2: 10-NODE CYBER TERMINAL HACK GUESS SUBMISSION
   * ----------------------------------------------------------- */
  submitRound2Guess(sessionToken, guessWord) {
    if (typeof sessionToken === 'object' && sessionToken !== null) {
      guessWord = sessionToken.guessWord;
      sessionToken = sessionToken.sessionToken;
    }
    if (!this.roundState.active || this.currentRound !== 2) {
      return { success: false, message: 'Round 2 is not currently active.' };
    }
    const player = this.players.get(sessionToken);
    if (!player || !player.teamId) {
      return { success: false, message: 'You are not assigned to a team.' };
    }
    const team = this.teams.get(player.teamId);
    if (!team) {
      return { success: false, message: 'Team not found.' };
    }
    const progress = team.currentRoundProgress;
    if (!progress || progress.isRoundCompleted) {
      return { success: false, message: 'Your squad has already completed Round 2!' };
    }

    const nodeIndex = progress.currentTurnIndex;
    const sets = PUZZLE_SETS[2] || [];
    const puzzleSet = sets.find(s => s.setId === progress.setId) || sets[0];
    const currentNode = puzzleSet.steps[nodeIndex];
    if (!currentNode) {
      return { success: false, message: 'Node not found or already completed.' };
    }

    const cleanGuess = (guessWord || '').toString().trim().toUpperCase().replace(/[^A-Z]/g, '');
    if (cleanGuess.length !== currentNode.length) {
      return { success: false, message: `Enter exactly ${currentNode.length} letters.` };
    }

    if (!progress.attemptsByNode) progress.attemptsByNode = {};
    if (!progress.attemptsByNode[nodeIndex]) progress.attemptsByNode[nodeIndex] = [];

    const nodeAttempts = progress.attemptsByNode[nodeIndex];
    if (nodeAttempts.length >= 4) {
      return { success: false, message: 'Maximum hack attempts (4) reached for this node.' };
    }

    // Evaluate Wordle feedback
    const evaluation = evaluateWordleGuess(currentNode.targetWord, cleanGuess);
    const attemptRecord = {
      attemptNumber: nodeAttempts.length + 1,
      guess: cleanGuess,
      feedback: evaluation.feedback,
      isSolved: evaluation.isSolved,
      timestamp: Date.now()
    };
    nodeAttempts.push(attemptRecord);

    const isBreached = evaluation.isSolved;
    const isMaxAttempts = nodeAttempts.length >= 4;

    let pointsAwarded = 0;
    let autoBypassed = false;

    if (isBreached || isMaxAttempts) {
      if (isBreached) {
        if (nodeAttempts.length === 1) pointsAwarded = 100;
        else if (nodeAttempts.length === 2) pointsAwarded = 80;
        else if (nodeAttempts.length === 3) pointsAwarded = 60;
        else pointsAwarded = 40;
      } else {
        // Auto-bypass on 4th failed attempt with baseline points
        pointsAwarded = 40;
        autoBypassed = true;
      }

      progress.stepSolved[nodeIndex] = true;
      if (!progress.collectedWords) progress.collectedWords = [];
      progress.collectedWords.push(currentNode.targetWord);
      progress.nodesBreached = Object.keys(progress.stepSolved).length;
      progress.currentTurnIndex++;
      progress.currentTurnStartedAt = Date.now();

      team.totalScore += pointsAwarded;
      team.roundScores[2] = (team.roundScores[2] || 0) + pointsAwarded;
      this._invalidateLeaderboard(); // score changed

      const isCompleted = progress.currentTurnIndex >= puzzleSet.steps.length;
      if (isCompleted) {
        progress.isRoundCompleted = true;
        progress.completedAt = Date.now();
        this.logEvent('ROUND_COMPLETED', `Team ${team.name} breached all 10 nodes in Round 2! (+1000 max)`);
      } else {
        this.logEvent('NODE_BREACHED', `Team ${team.name}: Node ${nodeIndex + 1} breached (+ ${pointsAwarded} pts).`);
      }

      this.saveSnapshot();

      return {
        success: true,
        isBreached: true,
        isSolved: isBreached,
        nodePassed: true,
        autoBypassed,
        solvedWord: currentNode.targetWord,
        feedback: evaluation.feedback,
        attempts: nodeAttempts,
        attemptsUsed: nodeAttempts.length,
        pointsAwarded,
        totalScore: team.totalScore,
        nodesBreached: progress.nodesBreached,
        isRoundCompleted: progress.isRoundCompleted,
        roundCompleted: progress.isRoundCompleted,
        message: isBreached 
          ? `[ACCESS GRANTED] Node ${nodeIndex + 1} Breached! (+${pointsAwarded} PTS)`
          : `[BYPASS PROTOCOL] Node ${nodeIndex + 1} unlocked. Target was "${currentNode.targetWord}". (+${pointsAwarded} PTS)`
      };
    }

    // Recorded attempt, not breached yet
    this.saveSnapshot();
    return {
      success: true,
      isBreached: false,
      isSolved: false,
      nodePassed: false,
      feedback: evaluation.feedback,
      attempts: nodeAttempts,
      attemptsUsed: nodeAttempts.length,
      remainingAttempts: 4 - nodeAttempts.length,
      message: `Attempt ${nodeAttempts.length}/4 recorded. Analyze tile colors!`
    };
  }

  /* -------------------------------------------------------------
   * ADMIN RESILIENCE & INTERVENTIONS
   * ----------------------------------------------------------- */
  forceAdvanceTeamTurn(teamId, adminReason = 'Admin manual advance') {
    const team = this.teams.get(teamId);
    if (!team) return { success: false, message: 'Team not found' };
    if (!this.roundState.active) return { success: false, message: 'Round not active' };

    const progress = team.currentRoundProgress;
    if (!progress || progress.isRoundCompleted) {
      return { success: false, message: 'Team is already completed or not active' };
    }

    const sets = PUZZLE_SETS[this.currentRound] || [];
    const puzzleSet = sets.find(s => s.setId === progress.setId) || sets[0];

    if (this.currentRound === 2) {
      const totalNodes = puzzleSet?.steps?.length || 10;
      const currentTurn = progress.currentTurnIndex;
      const currentNode = puzzleSet?.steps[currentTurn];
      if (currentNode) {
        progress.stepSolved[currentTurn] = true;
        if (!progress.collectedWords.includes(currentNode.targetWord)) {
          progress.collectedWords.push(currentNode.targetWord);
        }
      }
      progress.nodesBreached = (progress.nodesBreached || 0) + 1;
      team.totalScore += 50;
      team.roundScores[2] = (team.roundScores[2] || 0) + 50;

      if (progress.currentTurnIndex + 1 < totalNodes) {
        progress.currentTurnIndex++;
        progress.currentTurnStartedAt = Date.now();
        this.logEvent('ADMIN_FORCE_ADVANCE_R2', `Force-advanced Team ${team.name} on Node ${currentTurn + 1} (${adminReason}).`);
        this.saveSnapshot();
        return {
          success: true,
          message: `Force-advanced team to Node ${progress.currentTurnIndex + 1}.`,
          nextTurnIndex: progress.currentTurnIndex
        };
      } else {
        progress.isRoundCompleted = true;
        progress.completedAt = Date.now();
        this.logEvent('ADMIN_FORCE_COMPLETE_R2', `Force-completed Round 2 for Team ${team.name}.`);
        this.saveSnapshot();
        return {
          success: true,
          message: 'Team marked as Round 2 completed by Administrator.'
        };
      }
    }

    const totalRiddleSteps = puzzleSet?.steps?.length || 3;
    const currentTurn = progress.currentTurnIndex;
    const isLeaderTurn = currentTurn >= totalRiddleSteps || (team.members.length >= 4 && currentTurn === team.members.length - 1);

    if (!isLeaderTurn) {
      const expectedFrag = puzzleSet?.steps[currentTurn]?.expectedFragment || 'FRAG';
      progress.stepSolved[currentTurn] = true;
      progress.collectedFragments.push(expectedFrag);
      progress.currentTurnIndex++;

      this.logEvent('ADMIN_FORCE_ADVANCE', `Force-advanced Team ${team.name} on Step ${currentTurn + 1} (${adminReason}).`);
      this.saveSnapshot();

      return {
        success: true,
        message: `Force-advanced team to turn ${progress.currentTurnIndex + 1}.`,
        nextTurnIndex: progress.currentTurnIndex
      };
    } else {
      // Force complete round
      progress.stepSolved[currentTurn] = true;
      progress.isRoundCompleted = true;
      progress.completedAt = Date.now();
      progress.assembledSubmission = '[ADMIN OVERRIDE]';
      team.totalScore += 250;

      this.logEvent('ADMIN_FORCE_COMPLETE', `Force-completed Round ${this.currentRound} for Team ${team.name}.`);
      this.saveSnapshot();

      return {
        success: true,
        message: 'Team marked as completed by Administrator.'
      };
    }
  }

  overrideTeamScore(teamId, scoreDelta, reason = 'Admin adjustment') {
    const team = this.teams.get(teamId);
    if (!team) return { success: false, message: 'Team not found' };

    const delta = parseInt(scoreDelta, 10);
    if (isNaN(delta)) return { success: false, message: 'Invalid score number' };

    team.totalScore = Math.max(0, team.totalScore + delta);
    this.logEvent('SCORE_OVERRIDE', `Team ${team.name} score adjusted by ${delta > 0 ? '+' : ''}${delta} (${reason}). New total: ${team.totalScore}`);
    this.saveSnapshot();

    return { success: true, newScore: team.totalScore };
  }

  resetAllState() {
    this.status = 'LOBBY';
    this.currentRound = null;
    this.roundState = {
      roundNumber: null,
      startTime: null,
      endTime: null,
      durationSec: 0,
      active: false,
      isPaused: false,
      remainingMsOnPause: 0
    };
    this.lobbyTimer = {
      active: false,
      startTime: null,
      endTime: null,
      durationSec: 300
    };
    this.players.clear();
    this.teams.clear();
    this.auditLogs = [];

    // Remove snapshot file from disk
    try {
      if (fs.existsSync(SNAPSHOT_FILE)) {
        fs.unlinkSync(SNAPSHOT_FILE);
      }
    } catch (err) {
      console.error('[Snapshot Clear Error]:', err.message);
    }

    this.logEvent('GAME_RESET', 'All players, teams, and scores wiped. Reset to clean lobby.');
    return { success: true, message: 'Game state reset completely.' };
  }

  /* -------------------------------------------------------------
   * SQUAD TURN ALLOCATION HELPER (4 Games Total)
   * 4 Players: Member 1, Member 2, Member 3, Leader (1 game each)
   * 3 Players: Member 1, Member 2, Leader plays 2 (Game 3 and Game 4)
   * 2 Players: Member 1 (Game 1 & 3), Leader (Game 2 & 4) - both play twice!
   * ----------------------------------------------------------- */
  getTurnPlayer(memberDetails, turnIndex, roundNumber = 1) {
    if (!memberDetails || memberDetails.length === 0) {
      return { scholar: null, role: 'Player at Controls', badge: 'P1' };
    }
    const len = memberDetails.length;
    const leader = memberDetails.find(m => m.isLeader) || memberDetails[len - 1];
    const teammates = memberDetails.filter(m => !m.isLeader);

    if (roundNumber === 2) {
      const nodeNum = turnIndex + 1;
      const isBossNode = turnIndex >= 9; // Node 10
      if (isBossNode) {
        return { scholar: leader, role: '👑 SQUAD LEADER • FINAL BOSS NODE 10', badge: 'BOSS' };
      }
      if (len === 4) {
        const activeTeammate = teammates[turnIndex % 3] || leader;
        const memberNum = (turnIndex % 3) + 1;
        const badges = ['P1', 'P2', 'P3'];
        const emojis = ['🎮', '⚡', '🌟'];
        return {
          scholar: activeTeammate,
          role: `${emojis[turnIndex % 3]} MEMBER ${memberNum} • NODE ${String(nodeNum).padStart(2, '0')}`,
          badge: badges[turnIndex % 3]
        };
      } else if (len === 3) {
        const cycle = [teammates[0] || leader, teammates[1] || leader, leader];
        const cycleRoles = ['🎮 MEMBER 1', '⚡ MEMBER 2', '👑 SQUAD LEADER'];
        const cycleBadges = ['P1', 'P2', 'LEADER'];
        const pIdx = turnIndex % 3;
        return {
          scholar: cycle[pIdx],
          role: `${cycleRoles[pIdx]} • NODE ${String(nodeNum).padStart(2, '0')}`,
          badge: cycleBadges[pIdx]
        };
      } else {
        const cycle = [teammates[0] || leader, leader];
        const cycleRoles = ['🎮 MEMBER 1', '👑 SQUAD LEADER'];
        const cycleBadges = ['P1', 'LEADER'];
        const pIdx = turnIndex % 2;
        return {
          scholar: cycle[pIdx],
          role: `${cycleRoles[pIdx]} • NODE ${String(nodeNum).padStart(2, '0')}`,
          badge: cycleBadges[pIdx]
        };
      }
    }

    // Default Round 1 logic
    if (len === 4) {
      if (turnIndex === 0) return { scholar: teammates[0] || leader, role: '🎮 MEMBER 1 • GAME 1', badge: 'P1' };
      if (turnIndex === 1) return { scholar: teammates[1] || leader, role: '⚡ MEMBER 2 • GAME 2', badge: 'P2' };
      if (turnIndex === 2) return { scholar: teammates[2] || leader, role: '🌟 MEMBER 3 • GAME 3', badge: 'P3' };
      return { scholar: leader, role: '👑 SQUAD LEADER • FINAL BOSS', badge: 'BOSS' };
    } else if (len === 3) {
      if (turnIndex === 0) return { scholar: teammates[0] || leader, role: '🎮 MEMBER 1 • GAME 1', badge: 'P1' };
      if (turnIndex === 1) return { scholar: teammates[1] || leader, role: '⚡ MEMBER 2 • GAME 2', badge: 'P2' };
      if (turnIndex === 2) return { scholar: leader, role: '👑 SQUAD LEADER • GAME 3', badge: 'LEADER' };
      return { scholar: leader, role: '👑 SQUAD LEADER • FINAL BOSS', badge: 'BOSS' };
    } else {
      if (turnIndex === 0) return { scholar: teammates[0] || leader, role: '🎮 MEMBER 1 • GAME 1', badge: 'P1' };
      if (turnIndex === 1) return { scholar: leader, role: '👑 SQUAD LEADER • GAME 2', badge: 'LEADER' };
      if (turnIndex === 2) return { scholar: teammates[0] || leader, role: '🎮 MEMBER 1 • GAME 3', badge: 'P1' };
      return { scholar: leader, role: '👑 SQUAD LEADER • FINAL BOSS', badge: 'BOSS' };
    }
  }

  /* -------------------------------------------------------------
   * STATE VIEW BUILDERS (ROOM-SCOPED & LEADERBOARD)
   * ----------------------------------------------------------- */
  getClientState(sessionToken) {
    const player = this.players.get(sessionToken);
    if (!player) return null;

    let teamData = null;
    let puzzleView = null;

    if (player.teamId && this.teams.has(player.teamId)) {
      const team = this.teams.get(player.teamId);
      const memberDetails = team.members.map(mToken => {
        const mem = this.players.get(mToken);
        return {
          sessionToken: mem ? mem.sessionToken : mToken,
          name: mem ? mem.name : 'Unknown',
          gender: mem ? mem.gender : '?',
          isLeader: mem ? mem.isLeader : false,
          isOnline: mem ? mem.isOnline : false
        };
      });

      const progress = team.currentRoundProgress;
      const sets = PUZZLE_SETS[this.currentRound] || [];
      const puzzleSet = sets.find(s => s.setId === progress?.setId) || sets[0];
      const totalRiddleSteps = puzzleSet?.steps?.length || 3;
      const totalSteps = this.currentRound === 2 ? totalRiddleSteps : totalRiddleSteps + 1;

      let activeTurnIndex = progress ? progress.currentTurnIndex : 0;
      const isLeaderStep = this.currentRound === 1 ? (activeTurnIndex >= totalRiddleSteps) : (activeTurnIndex >= 9);

      const currentTurnAssignment = this.getTurnPlayer(memberDetails, activeTurnIndex, this.currentRound);
      const activePlayerName = currentTurnAssignment.scholar?.name || 'Player at Controls';
      const activePlayerRole = currentTurnAssignment.role;

      const isBenchConsole = player.isLeader || team.leaderSessionToken === sessionToken;
      const isYourTurn = isBenchConsole || (currentTurnAssignment.scholar?.sessionToken === sessionToken);

      if (this.roundState.active && progress && !progress.isRoundCompleted) {
        if (this.currentRound === 2) {
          // ROUND 2: 10-Node Cyber Terminal Hack View — Collaborative Relay (Visible to ALL squad members)
          const stepObj = puzzleSet.steps[activeTurnIndex] || {};
          const nodesStatus = (puzzleSet.steps || []).map((st, idx) => {
            if (progress.stepSolved && progress.stepSolved[idx]) return 'BREACHED';
            if (idx === activeTurnIndex) return 'ACTIVE';
            return 'LOCKED';
          });
          const previousWord = activeTurnIndex > 0 ? puzzleSet.steps[activeTurnIndex - 1]?.targetWord : null;

          puzzleView = {
            type: 'cyber_hack_round2',
            roundNumber: 2,
            nodeIndex: activeTurnIndex,
            nodeNumber: activeTurnIndex + 1,
            totalNodes: puzzleSet.steps.length || 10,
            activePlayerName,
            activePlayerRole,
            isYourTurn: true, // All squad members can see and collaborate on the terminal
            isLeadOperative: isYourTurn,
            nodesStatus,
            nodeData: {
              nodeNumber: stepObj.nodeNumber || (activeTurnIndex + 1),
              category: stepObj.category || 'Cyber Breach',
              length: stepObj.length || 5,
              bridgeClue: stepObj.bridgeClue || '',
              prompt: stepObj.prompt || '',
              hint: stepObj.hint || '',
              previousWord
            },
            attempts: progress.attemptsByNode?.[activeTurnIndex] || [],
            collectedWords: progress.collectedWords || [],
            nodesBreached: progress.nodesBreached !== undefined ? progress.nodesBreached : Object.keys(progress.stepSolved || {}).length,
            turnStartedAt: progress.currentTurnStartedAt || this.roundState.startTime
          };
        } else if (isYourTurn) {
          if (!isLeaderStep) {
            const stepObj = puzzleSet.steps[activeTurnIndex];
            const frag = stepObj?.expectedFragment ? stepObj.expectedFragment.trim().toUpperCase().replace(/[^A-Z0-9 ]/g, ' ') : '';
            const words = frag ? frag.split(/\s+/).filter(Boolean) : [];
            const wordPattern = words.length > 0 ? words.map(w => w.length) : [5];
            const totalLetters = wordPattern.reduce((a, b) => a + b, 0);

            puzzleView = {
              type: 'member_step',
              stepNumber: activeTurnIndex + 1,
              totalSteps: totalSteps,
              activePlayerName,
              activePlayerRole,
              title: stepObj?.title || `Game ${activeTurnIndex + 1}: ${stepObj?.category || 'Riddle Challenge'}`,
              category: stepObj?.category || 'Riddle Challenge',
              prompt: stepObj?.prompt || '',
              clue: stepObj?.clue || '',
              hint: stepObj?.hint || '',
              wordPattern,
              totalLetters,
              caseDossier: this.currentRound === 3 ? {
                dossierTitle: puzzleSet?.dossierTitle,
                incidentDate: puzzleSet?.incidentDate,
                location: puzzleSet?.location,
                caseSummary: puzzleSet?.caseSummary,
                suspects: puzzleSet?.suspects || []
              } : null,
              turnStartedAt: progress.currentTurnStartedAt || this.roundState.startTime,
              turnDurationSec: 150, // 2.5 minutes per operative turn
              clueUnlockDelaySec: 120 // Clue unlocks at 2:00 mark (120s)
            };
          } else {
            // Leader step (Game 4: Master Boss / Scotland Yard Indictment)
            puzzleView = {
              type: 'leader_step',
              stepNumber: totalSteps,
              totalSteps: totalSteps,
              activePlayerName,
              activePlayerRole,
              title: puzzleSet.leaderTask?.title || (this.currentRound === 3 ? 'Scotland Yard Official Indictment Warrant' : 'Master Thesis Synthesis'),
              instructions: puzzleSet.leaderTask?.instructions || '',
              hint: puzzleSet.leaderTask?.hint || '',
              collectedFragments: progress.collectedFragments,
              roundType: this.currentRound === 1 ? 'phrase' : 'code',
              caseDossier: this.currentRound === 3 ? {
                dossierTitle: puzzleSet?.dossierTitle,
                incidentDate: puzzleSet?.incidentDate,
                location: puzzleSet?.location,
                caseSummary: puzzleSet?.caseSummary,
                suspects: puzzleSet?.suspects || []
              } : null,
              turnStartedAt: progress.currentTurnStartedAt || this.roundState.startTime,
              turnDurationSec: 150,
              clueUnlockDelaySec: 0
            };
          }
        }
      }

      // Pre-calculated dynamic turn pipeline for UI rendering
      const turnPipeline = [];
      if (this.currentRound === 2) {
        const totalNodes = puzzleSet?.steps?.length || 10;
        for (let i = 0; i < totalNodes; i++) {
          const stepObj = puzzleSet?.steps?.[i];
          const turnAssignment = this.getTurnPlayer(memberDetails, i, 2);
          const assignedScholar = turnAssignment.scholar;
          const isSolved = Boolean(progress?.stepSolved?.[i]);
          const isActive = progress && !progress.isRoundCompleted && activeTurnIndex === i;

          turnPipeline.push({
            stepIndex: i,
            gameNumber: i + 1,
            nodeNumber: i + 1,
            label: stepObj?.category || `Node ${i + 1}`,
            targetLength: stepObj?.length || 5,
            scholarName: assignedScholar?.name || `Player ${i + 1}`,
            isLeader: assignedScholar?.isLeader || (i === 9),
            role: turnAssignment.role,
            badge: turnAssignment.badge,
            status: isSolved ? 'SOLVED' : (isActive ? 'ACTIVE' : 'LOCKED'),
            breachedWord: progress?.collectedWords?.[i] || (isSolved ? stepObj?.targetWord : null)
          });
        }
      } else {
        // Round 1 (4 games) & Round 3 (Sherlock Dossier: 3 Evidence Steps + 1 Grand Indictment)
        const roundNum = this.currentRound || 1;
        for (let i = 0; i < totalRiddleSteps; i++) {
          const stepObj = puzzleSet?.steps?.[i];
          const turnAssignment = this.getTurnPlayer(memberDetails, i, roundNum);
          const assignedScholar = turnAssignment.scholar;

          turnPipeline.push({
            stepIndex: i,
            gameNumber: i + 1,
            label: roundNum === 3 ? (stepObj?.title || `Evidence ${i + 1}`) : (stepObj?.category || `Game ${i + 1}`),
            scholarName: assignedScholar?.name || `Player ${i + 1}`,
            isLeader: assignedScholar?.isLeader || false,
            role: turnAssignment.role,
            badge: turnAssignment.badge,
            status: progress?.stepSolved[i] ? 'SOLVED' : (activeTurnIndex === i ? 'ACTIVE' : 'LOCKED'),
            fragment: progress?.collectedFragments[i] || null
          });
        }

        // Add Final Boss Step (Game 4)
        const bossAssignment = this.getTurnPlayer(memberDetails, totalRiddleSteps, roundNum);
        turnPipeline.push({
          stepIndex: totalRiddleSteps,
          gameNumber: totalRiddleSteps + 1,
          label: roundNum === 3 ? '⚖️ Scotland Yard Indictment' : '👑 Final Boss Synthesis',
          scholarName: bossAssignment.scholar?.name || 'Leader',
          isLeader: true,
          role: bossAssignment.role,
          badge: 'BOSS',
          status: progress?.isRoundCompleted ? 'SOLVED' : (activeTurnIndex >= totalRiddleSteps ? 'ACTIVE' : 'LOCKED'),
          fragment: null
        });
      }

      // If team completed Round 2, supply victory view
      if (this.currentRound === 2 && progress && progress.isRoundCompleted) {
        puzzleView = {
          type: 'cyber_hack_round2_completed',
          roundNumber: 2,
          totalNodes: puzzleSet?.steps?.length || 10,
          collectedWords: progress.collectedWords || [],
          nodesBreached: progress.nodesBreached !== undefined ? progress.nodesBreached : 10,
          totalScore: team.totalScore,
          isCompleted: true
        };
      }

      // If team completed Round 3, supply Sherlock victory view
      if (this.currentRound === 3 && progress && progress.isRoundCompleted) {
        puzzleView = {
          type: 'sherlock_round3_completed',
          roundNumber: 3,
          dossierTitle: puzzleSet?.dossierTitle || 'The Kensington Crescent Mystery',
          culpritName: 'Rohan Sharma',
          weapon: 'Cyanide',
          motive: 'Blackmail',
          totalScore: team.totalScore,
          assembledSubmission: progress.assembledSubmission,
          isCompleted: true
        };
      }

      teamData = {
        teamId: team.teamId,
        benchNumber: team.benchNumber || '',
        name: team.name,
        gender: team.gender,
        isLeader: player.isLeader,
        teamSize: team.teamSize || team.members.length,
        members: memberDetails,
        totalScore: team.totalScore,
        isEliminated: team.isEliminated,
        progress: progress ? {
          setId: progress.setId,
          currentTurnIndex: progress.currentTurnIndex,
          activePlayerName,
          activePlayerRole,
          isYourTurn,
          collectedFragments: progress.collectedFragments,
          collectedWords: progress.collectedWords || [],
          nodesBreached: progress.nodesBreached !== undefined ? progress.nodesBreached : Object.keys(progress.stepSolved || {}).length,
          stepSolved: progress.stepSolved,
          isRoundCompleted: progress.isRoundCompleted,
          completedAt: progress.completedAt,
          turnPipeline
        } : null
      };
    }

    return {
      player: {
        sessionToken: player.sessionToken,
        name: player.name,
        gender: player.gender,
        isLeader: player.isLeader
      },
      team: teamData,
      puzzle: puzzleView,
      gameStatus: this.status,
      currentRound: this.currentRound,
      roundActive: this.roundState.active && !this.roundState.isPaused
      // Note: round timer is NOT sent to students, per requirement!
    };
  }

  getLeaderboard() {
    // Return cached result if state hasn't changed since last build
    if (!this._leaderboardDirty && this._leaderboardCache) {
      return this._leaderboardCache;
    }
    const list = Array.from(this.teams.values()).map(t => {
      const prog = t.currentRoundProgress;
      const memberDetails = t.members.map(tok => this.players.get(tok)).filter(Boolean);
      const membersTurnOrder = [];
      const isR2 = this.currentRound === 2;
      const totalStepsToMap = isR2 ? 10 : 4;

      for (let g = 0; g < totalStepsToMap; g++) {
        const turnAssignment = this.getTurnPlayer(memberDetails, g, this.currentRound);
        let turnStatus = 'LOBBY';
        if (prog) {
          if (prog.stepSolved && prog.stepSolved[g]) {
            turnStatus = 'SOLVED';
          } else if (prog.currentTurnIndex === g && !prog.isRoundCompleted) {
            turnStatus = 'ACTIVE';
          } else {
            turnStatus = 'LOCKED';
          }
        }
        membersTurnOrder.push({
          index: g + 1,
          gameNumber: g + 1,
          nodeNumber: g + 1,
          name: turnAssignment.scholar?.name || 'Unknown',
          isLeader: turnAssignment.scholar?.isLeader || false,
          role: turnAssignment.role,
          badge: turnAssignment.badge,
          isOnline: turnAssignment.scholar?.isOnline || false,
          turnStatus
        });
      }

      return {
        teamId: t.teamId,
        benchNumber: t.benchNumber || '',
        name: t.name,
        leaderName: memberDetails.find(m => m.isLeader)?.name || 'Leader',
        gender: t.gender,
        memberCount: t.members.length,
        totalScore: t.totalScore,
        roundScores: t.roundScores,
        isEliminated: t.isEliminated,
        currentTurnIndex: prog ? prog.currentTurnIndex : 0,
        isRoundCompleted: prog ? prog.isRoundCompleted : false,
        completedAt: prog ? prog.completedAt : null,
        collectedCount: prog ? (prog.collectedFragments ? prog.collectedFragments.length : 0) : 0,
        nodesBreached: prog ? (prog.nodesBreached !== undefined ? prog.nodesBreached : Object.keys(prog.stepSolved || {}).length) : 0,
        collectedWords: prog?.collectedWords || [],
        membersTurnOrder
      };
    });

    list.sort((a, b) => {
      if (b.totalScore !== a.totalScore) return b.totalScore - a.totalScore;
      if (a.isRoundCompleted && b.isRoundCompleted) {
        return (a.completedAt || 0) - (b.completedAt || 0);
      }
      return 0;
    });

    // Cache the result
    this._leaderboardCache = list;
    this._leaderboardDirty = false;
    return list;
  }

  getDisplayState() {
    const now = Date.now();
    let remainingMs = 0;
    let timerActive = this.roundState.active;

    if (this.roundState.active) {
      remainingMs = this.roundState.isPaused
        ? this.roundState.remainingMsOnPause
        : Math.max(0, this.roundState.endTime - now);
    } else if (this.status === 'LOBBY' && this.lobbyTimer.active) {
      remainingMs = Math.max(0, this.lobbyTimer.endTime - now);
      timerActive = true;
    }

    let roundTitle = 'Lobby & Assembly Stage';
    if (this.currentRound) {
      roundTitle = ROUND_CONFIGS[this.currentRound]?.title || `Round ${this.currentRound}`;
    } else if (this.status === 'FINISHED') {
      roundTitle = 'Championship Honors Ceremony';
    } else if (this.status === 'INTERMEDIATE_1') {
      roundTitle = 'Round 1 Audit & Intermission';
    } else if (this.status === 'INTERMEDIATE_2') {
      roundTitle = 'Finalists Qualification Announcement';
    }

    return {
      status: this.status,
      currentRound: this.currentRound,
      roundTitle,
      roundActive: timerActive,
      isPaused: this.roundState.isPaused,
      remainingMs,
      durationSec: this.roundState.active ? this.roundState.durationSec : this.lobbyTimer.durationSec,
      leaderboard: this.getLeaderboard(),
      serverTime: now
    };
  }

  getAdminState() {
    return {
      status: this.status,
      currentRound: this.currentRound,
      roundState: this.roundState,
      lobbyTimer: this.lobbyTimer,
      totalPlayers: this.players.size,
      onlinePlayers: Array.from(this.players.values()).filter(p => p.isOnline).length,
      teams: Array.from(this.teams.values()).map(t => {
        const prog = t.currentRoundProgress;
        const memberDetails = t.members.map(tok => this.players.get(tok)).filter(Boolean);
        const activeAssignment = prog ? this.getTurnPlayer(memberDetails, prog.currentTurnIndex, this.currentRound) : null;
        const nodesBreached = prog ? (prog.nodesBreached !== undefined ? prog.nodesBreached : Object.keys(prog.stepSolved || {}).length) : 0;
        const totalNodes = prog?.totalNodes || (this.currentRound === 2 ? 10 : 4);
        const activeNodeNumber = prog ? Math.min(prog.currentTurnIndex + 1, totalNodes) : 1;

        return {
          teamId: t.teamId,
          benchNumber: t.benchNumber || '',
          name: t.name,
          gender: t.gender,
          totalScore: t.totalScore,
          roundScores: t.roundScores,
          isEliminated: t.isEliminated,
          currentRoundProgress: prog,
          nodesBreached,
          totalNodes,
          activeNodeNumber,
          activeOperativeName: activeAssignment?.scholar?.name || 'Operative',
          activeOperativeRole: activeAssignment?.role || 'PLAYER',
          isRoundCompleted: prog ? prog.isRoundCompleted : false,
          collectedWords: prog?.collectedWords || [],
          membersDetail: t.members.map((mToken, idx) => {
            const p = this.players.get(mToken);
            let turnStatus = 'LOBBY';
            if (prog) {
              if (prog.isRoundCompleted) {
                turnStatus = 'SOLVED';
              } else if (activeAssignment?.scholar?.sessionToken === mToken) {
                turnStatus = 'ACTIVE';
              } else if (prog.stepSolved && prog.stepSolved[idx]) {
                turnStatus = 'SOLVED';
              } else {
                turnStatus = 'LOCKED';
              }
            }
            return {
              turnIndex: idx + 1,
              sessionToken: mToken,
              name: p?.name || 'Unknown',
              gender: p?.gender || '?',
              isOnline: p?.isOnline || false,
              isLeader: p?.isLeader || (idx === t.members.length - 1),
              turnStatus,
              fragment: prog?.collectedFragments && prog.collectedFragments[idx] ? prog.collectedFragments[idx] : null
            };
          })
        };
      }),
      unassignedPlayers: Array.from(this.players.values()).filter(p => !p.teamId).map(p => ({
        sessionToken: p.sessionToken,
        name: p.name,
        gender: p.gender,
        isOnline: p.isOnline
      })),
      leaderboard: this.getLeaderboard(),
      auditLogs: this.auditLogs.slice(0, 30)
    };
  }
}

module.exports = GameStateManager;
