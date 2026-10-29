const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { ROUND_CONFIGS, PUZZLE_SETS, getPuzzleSetForTeam, checkStepAnswer, checkLeaderExactCode, evaluateWordleGuess } = require('./puzzles');
const { validateLeaderPhrase, sanitizeText } = require('./nlpValidator');

// Tests point SNAPSHOT_DIR at a temp folder so they never touch a live tournament's save file
const SNAPSHOT_DIR = process.env.SNAPSHOT_DIR || path.join(__dirname, '..', 'data');
const SNAPSHOT_FILE = path.join(SNAPSHOT_DIR, 'snapshot.json');
// After this long on one step the squad may skip it (0 pts) so nobody is ever stuck.
// Round 1 is the gentle opener, so its skip arrives sooner.
const SKIP_UNLOCK_SEC = 150;
const SKIP_UNLOCK_SEC_BY_ROUND = { 1: 120, 3: 150 };
// A rejected Round 3 warrant locks the warrant for this long, so suspects can't be brute-forced
const WARRANT_LOCK_SEC = 30;
// Rounds 1 & 3: every wrong answer takes this many points off the step being solved
const WRONG_ANSWER_PENALTY = 10;
const PENALTY_ROUNDS = [1, 3];

class GameStateManager {
  constructor(adminPassword = 'njnjnj') {
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
    // Every state mutation saves a snapshot, so this is also the single place
    // that guarantees the leaderboard cache never goes stale.
    this._invalidateLeaderboard();
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
    this.players.clear();
    this.teams.clear();
    this.auditLogs = [];
    // Clear all indexes
    this._socketIndex.clear();
    this._benchIndex.clear();
    this._invalidateLeaderboard();
    this._leaderboardCache = null;
    this.saveSnapshot(true); // immediate flush on reset
    this.logEvent('GAME_RESET', 'All players, teams, and scores wiped. Reset to clean lobby.');
    return { success: true, message: 'Game state reset completely.' };
  }

  /* -------------------------------------------------------------
   * LOBBY & PLAYER MANAGEMENT
   * ----------------------------------------------------------- */
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
      // A bench squad shares one laptop: the whole roster comes back online with it
      if (team.leaderSessionToken === sessionToken) {
        team.members.forEach(tok => {
          const m = this.players.get(tok);
          if (m) {
            m.socketId = socketId;
            m.isOnline = true;
          }
        });
      }
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
    // Teammates on the same bench laptop went offline with it
    const benchTeam = player.teamId ? this.teams.get(player.teamId) : null;
    if (benchTeam) {
      benchTeam.members.forEach(tok => {
        const m = this.players.get(tok);
        if (m && m.socketId === socketId) m.isOnline = false;
      });
    }
    this.logEvent('PLAYER_DISCONNECTED', `${player.name} went offline.`);
    this._invalidateLeaderboard();
    return player;
  }

  /* -------------------------------------------------------------
   * BENCH TEAM REGISTRATION (One Bench, One Leader Console, 2 or 3 Members)
   * ----------------------------------------------------------- */
  registerBenchTeam({ benchNumber, teamName, gender = 'open', teamSize = 3, leaderName, memberNames = [], socketId }) {
    const teamIdx = this.teams.size + 1;
    const cleanBench = (benchNumber && benchNumber !== 'Bench 01')
      ? sanitizeText(benchNumber).trim().slice(0, 16)
      : `Team ${String(teamIdx).padStart(2, '0')}`;
    const cleanLeader = sanitizeText(leaderName).trim().slice(0, 20);
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
      .map(n => sanitizeText(n).trim().slice(0, 20))
      .filter(n => n.length >= 2);

    const requiredTeammates = cleanTeamSize - 1; // 1 member for size 2, 2 members for size 3, 3 members for size 4
    if (filteredMemberNames.length < requiredTeammates) {
      return {
        success: false,
        message: `Please enter names for all ${cleanTeamSize} team members (1 leader + ${requiredTeammates} member${requiredTeammates > 1 ? 's' : ''}).`
      };
    }

    const cleanTeamName = sanitizeText(teamName).trim().slice(0, 24);
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
      registeredAt: Date.now(),
      roundTimeMs: {},
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
        totalNodes: this.getTotalStepCount(this.currentRound),
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

    // Every squad plays every round (there is no elimination)
    const assignedSetIds = new Set();
    let teamIdx = 0;
    for (const team of this.teams.values()) {

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
        totalNodes: this.getTotalStepCount(roundNumber),
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
    this.roundState.pausedAt = Date.now();
    this.logEvent('ROUND_PAUSED', `Round ${this.currentRound} paused with ${Math.round(remainingMs / 1000)}s remaining.`);
    this.saveSnapshot();
    return { success: true, remainingMs };
  }

  resumeRound() {
    if (!this.roundState.active || !this.roundState.isPaused) {
      return { success: false, message: 'Round is not paused' };
    }
    const now = Date.now();
    // A host pause must not eat into anyone's speed bounty or turn window
    const pausedMs = Math.max(0, now - (this.roundState.pausedAt || now));
    for (const team of this.teams.values()) {
      const prog = team.currentRoundProgress;
      if (prog && !prog.isRoundCompleted && prog.currentTurnStartedAt) {
        prog.currentTurnStartedAt += pausedMs;
      }
    }
    this.roundState.pausedAt = null;
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

  endRound() {
    if (!this.roundState.active) {
      return { success: false, message: 'Round is not active' };
    }

    const completedRound = this.currentRound;
    // Squads that did not finish used the whole round (fair time for tie-breaks)
    for (const t of this.teams.values()) {
      if (!t.currentRoundProgress) continue;
      if (!t.roundTimeMs) t.roundTimeMs = {};
      if (t.roundTimeMs[completedRound] === undefined) t.roundTimeMs[completedRound] = this.roundState.durationSec * 1000;
    }
    this.roundState.active = false;
    this.roundState.isPaused = false;

    if (completedRound === 3) {
      this.status = 'FINISHED';
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

    const progress = team.currentRoundProgress;
    if (!progress) return { success: false, message: 'Round progress not initialized' };
    if (progress.isRoundCompleted) {
      return { success: true, alreadySolved: true, message: 'Your team has already completed this round!' };
    }

    // The server owns the turn order: a missing index means "current step", and a stale or
    // future index must never mark another step solved (that would leave the team stuck).
    const parsedTurn = parseInt(turnIndex, 10);
    turnIndex = Number.isInteger(parsedTurn) ? parsedTurn : progress.currentTurnIndex;

    // Idempotent check: if this step was already completed, return immediately
    if (progress.stepSolved[turnIndex] === true) {
      return { success: true, alreadySolved: true, message: 'This step was already submitted.' };
    }
    if (turnIndex !== progress.currentTurnIndex) {
      return { success: false, outOfSync: true, message: 'Your screen was out of sync — refreshed to the current game.' };
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
      if (!String(answer || '').trim()) {
        return { success: false, message: 'Type an answer before submitting.' };
      }
      const stepValidation = checkStepAnswer(this.currentRound, progress.setId, turnIndex, answer);
      if (!stepValidation.success) {
        const penalty = this._recordWrongAnswer(progress, turnIndex);
        return {
          success: false,
          penalty,
          wrongAttempts: progress.wrongByStep?.[turnIndex] || 0,
          message: penalty ? `${stepValidation.message} (−${penalty} PTS from this step)` : stepValidation.message
        };
      }

      // Dynamic Speed-Decay Scoring: Fast solve = 250 PTS, decreases gradually down to 100 PTS!
      const turnStartedAt = progress.currentTurnStartedAt || this.roundState.startTime;
      const turnDurationSec = 150; // 2.5 minutes
      const stepPoints = this._applyWrongAnswerPenalty(progress, turnIndex, this.calculateDynamicPoints(turnStartedAt, turnDurationSec, 250, 100));

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
      const stepLabel = this.currentRound === 3 ? `Exhibit ${String.fromCharCode(65 + turnIndex)}` : `Game ${turnIndex + 1}`;
      this.logEvent('STEP_SOLVED', `Team ${team.name}: ${stepLabel} solved by ${activeMemberObj.name} (+${stepPoints} pts).`);
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
      if (progress.warrantLockUntil && now < progress.warrantLockUntil) {
        const wait = Math.ceil((progress.warrantLockUntil - now) / 1000);
        return { success: false, lockedForSec: wait, message: `The magistrate is reviewing your last warrant. Try again in ${wait}s.` };
      }
      let finalValidation = null;

      if (this.currentRound === 1) {
        // Round 1: Offline NLP Sentence Coherence Check
        finalValidation = validateLeaderPhrase(answer, progress.collectedFragments);
      } else {
        // Round 2 & 3: Exact Master Code Match
        finalValidation = checkLeaderExactCode(this.currentRound, progress.setId, answer);
      }

      if (!finalValidation.success && !finalValidation.isValid) {
        // A rejected warrant seals the charge sheet for a while (guessing suspects costs time)
        if (this.currentRound === 3) {
          progress.warrantLockUntil = now + WARRANT_LOCK_SEC * 1000;
          const penalty = this._recordWrongAnswer(progress, turnIndex);
          return {
            success: false,
            lockedForSec: WARRANT_LOCK_SEC,
            penalty,
            message: `${finalValidation.message || 'Warrant rejected.'} (−${penalty} PTS) The magistrate will hear you again in ${WARRANT_LOCK_SEC}s.`
          };
        }
        return {
          success: false,
          message: finalValidation.message || 'Incorrect final solution. Check your collected keywords and active verb!'
        };
      }

      // Round Complete for Team!
      progress.stepSolved[turnIndex] = true;
      progress.isRoundCompleted = true;
      this._markRoundTime(team);
      progress.completedAt = now;
      progress.assembledSubmission = sanitizeText(answer);

      // Leader Dynamic Speed-Decay Scoring: Fast solve = 250 PTS, decreases gradually down to 100 PTS!
      const leaderTurnStartedAt = progress.currentTurnStartedAt || this.roundState.startTime;
      const leaderPoints = this._applyWrongAnswerPenalty(progress, turnIndex, this.calculateDynamicPoints(leaderTurnStartedAt, 150, 250, 100));

      team.totalScore += leaderPoints;
      team.roundScores[this.currentRound] = (team.roundScores[this.currentRound] || 0) + leaderPoints;

      this.logEvent('TEAM_ROUND_COMPLETED', `Team ${team.name} COMPLETED Round ${this.currentRound} in ${Math.round((now - this.roundState.startTime) / 1000)}s! (+${leaderPoints} pts).`);
      this.saveSnapshot();

      this._endRoundIfAllTeamsFinished();

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
   * ANTI-STUCK SKIP (Round 1 & 3 riddle steps)
   * Once a turn's window has fully elapsed the squad may reveal the keyword for 0 points,
   * so one impossible riddle can never freeze a team for the rest of the round.
   * ----------------------------------------------------------- */
  skipTurn(sessionToken) {
    const player = this.players.get(sessionToken);
    if (!player) return { success: false, message: 'Invalid session' };
    if (!this.roundState.active || this.roundState.isPaused) {
      return { success: false, message: 'The round is not running right now.' };
    }
    if (this.currentRound !== 1 && this.currentRound !== 3) {
      return { success: false, message: 'Skipping is only available in Rounds 1 and 3.' };
    }
    const team = this.teams.get(player.teamId);
    if (!team) return { success: false, message: 'Team not found.' };
    if (team.leaderSessionToken !== sessionToken) {
      return { success: false, message: 'Only the squad console can skip a turn.' };
    }
    const progress = team.currentRoundProgress;
    if (!progress || progress.isRoundCompleted) return { success: false, message: 'Round already completed.' };

    const sets = PUZZLE_SETS[this.currentRound] || [];
    const puzzleSet = sets.find(s => s.setId === progress.setId) || sets[0];
    const stepIndex = progress.currentTurnIndex;
    const step = puzzleSet?.steps?.[stepIndex];
    // The Round 3 arrest warrant is the whole point of the finals: it can never be skipped
    if (!step && this.currentRound !== 1) return { success: false, message: 'The final step cannot be skipped.' };

    const skipAfter = this.getSkipUnlockSec(this.currentRound);
    const elapsedSec = (Date.now() - (progress.currentTurnStartedAt || this.roundState.startTime)) / 1000;
    if (elapsedSec < skipAfter) {
      return { success: false, message: `Skip unlocks after ${Math.ceil(skipAfter - elapsedSec)}s more. Keep trying!` };
    }

    if (!step) {
      // Round 1 victory sentence: give up the boss bounty but finish the round
      progress.stepSolved[stepIndex] = true;
      progress.isRoundCompleted = true;
      progress.completedAt = Date.now();
      progress.assembledSubmission = '[Skipped]';
      this._markRoundTime(team);
      this.logEvent('STEP_SKIPPED', `Team ${team.name}: Round ${this.currentRound} final step skipped after time-out (+0 pts).`);
      this.saveSnapshot();
      this._endRoundIfAllTeamsFinished();
      return { success: true, skipped: true, earnedPoints: 0, roundCompleted: true, fragment: null, message: 'Final step skipped (+0 PTS). Round complete!' };
    }

    progress.stepSolved[stepIndex] = true;
    progress.collectedFragments.push(step.expectedFragment);
    progress.currentTurnIndex++;
    progress.currentTurnStartedAt = Date.now();

    this.logEvent('STEP_SKIPPED', `Team ${team.name}: Game ${stepIndex + 1} skipped after time-out (+0 pts).`);
    this.saveSnapshot();

    return {
      success: true,
      skipped: true,
      earnedPoints: 0,
      fragment: step.expectedFragment,
      nextTurnIndex: progress.currentTurnIndex,
      message: `Skipped. The answer was "${step.expectedFragment}" — it has been added to your inventory (+0 PTS).`
    };
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
    if (this.roundState.isPaused) {
      return { success: false, message: 'The round is currently paused by the host.' };
    }
    if (Date.now() > this.roundState.endTime) {
      return { success: false, message: 'Time has expired for this round!' };
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
        // Fewer guesses = more points: 100 / 80 / 60 / 40 for a breach on attempt 1-4
        pointsAwarded = [100, 80, 60, 40][nodeAttempts.length - 1] || 40;
      } else {
        // Auto-bypass on 4th failed attempt awards 0 points
        pointsAwarded = 0;
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
        this._markRoundTime(team);
        progress.completedAt = Date.now();
        this.logEvent('ROUND_COMPLETED', `Team ${team.name} breached all 10 nodes in Round 2! (+1000 max)`);

        this._endRoundIfAllTeamsFinished();
      } else {
        this.logEvent('NODE_BREACHED', `Team ${team.name}: Node ${nodeIndex + 1} breached (+ ${pointsAwarded} pts).`);
      }

      this.saveSnapshot();

      return {
        success: true,
        isBreached: isBreached,
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
          : `[BYPASS PROTOCOL] Maximum attempts reached. Node ${nodeIndex + 1} bypassed (+0 PTS). Target word was "${currentNode.targetWord}".`
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

  // Wrong answers in Rounds 1 & 3 are remembered per step and taken off that step's points
  _recordWrongAnswer(progress, stepIndex) {
    if (!PENALTY_ROUNDS.includes(this.currentRound)) return 0;
    if (!progress.wrongByStep) progress.wrongByStep = {};
    progress.wrongByStep[stepIndex] = (progress.wrongByStep[stepIndex] || 0) + 1;
    this.saveSnapshot();
    return WRONG_ANSWER_PENALTY;
  }

  _applyWrongAnswerPenalty(progress, stepIndex, points) {
    if (!PENALTY_ROUNDS.includes(this.currentRound)) return points;
    const wrong = progress.wrongByStep?.[stepIndex] || 0;
    return Math.max(0, points - wrong * WRONG_ANSWER_PENALTY);
  }

  getSkipUnlockSec(roundNumber) {
    return SKIP_UNLOCK_SEC_BY_ROUND[roundNumber] || SKIP_UNLOCK_SEC;
  }

  // Remember how long a squad needed for a round (the tie-breaker after points)
  _markRoundTime(team) {
    if (!team || !this.currentRound) return;
    if (!team.roundTimeMs) team.roundTimeMs = {};
    team.roundTimeMs[this.currentRound] = Math.max(0, Date.now() - (this.roundState.startTime || Date.now()));
  }

  _timeUsedMs(team) {
    let total = Object.values(team.roundTimeMs || {}).reduce((sum, ms) => sum + ms, 0);
    // Still solving the live round: count the time spent so far
    if (this.roundState.active && this.currentRound && team.currentRoundProgress &&
        (team.roundTimeMs || {})[this.currentRound] === undefined) {
      total += Math.max(0, Date.now() - this.roundState.startTime);
    }
    return total;
  }

  // Ranking: points first, then less total time used, then whoever registered first
  compareTeams(a, b) {
    if (b.totalScore !== a.totalScore) return b.totalScore - a.totalScore;
    const timeA = this._timeUsedMs(a);
    const timeB = this._timeUsedMs(b);
    if (timeA !== timeB) return timeA - timeB;
    return (a.registeredAt || 0) - (b.registeredAt || 0);
  }

  // Concludes the active round as soon as every participating team has finished it
  _endRoundIfAllTeamsFinished() {
    if (!this.roundState.active) return false;
    const activeTeams = Array.from(this.teams.values());
    const allFinished = activeTeams.length > 0 && activeTeams.every(t => t.currentRoundProgress?.isRoundCompleted);
    if (!allFinished) return false;
    this.logEvent('ALL_TEAMS_FINISHED', `All ${activeTeams.length} teams completed Round ${this.currentRound}! Concluding stage.`);
    this.endRound();
    return true;
  }

  /* -------------------------------------------------------------
   * ADMIN RESILIENCE & INTERVENTIONS
   * ----------------------------------------------------------- */
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

    // Rounds 1 & 3: riddle steps rotate Member 1 → Member 2 → … → Leader → Member 1 …,
    // then the leader alone takes the final step (Round 1 boss / Round 3 arrest warrant).
    const riddleSteps = this.getRiddleStepCount(roundNumber);
    const unit = roundNumber === 3 ? 'EVIDENCE' : 'GAME';
    if (turnIndex >= riddleSteps) {
      return { scholar: leader, role: roundNumber === 3 ? '👑 SQUAD LEADER • ARREST WARRANT' : '👑 SQUAD LEADER • FINAL BOSS', badge: 'BOSS' };
    }
    const cycle = [...teammates, leader];
    const scholar = cycle[turnIndex % cycle.length];
    if (scholar === leader) {
      return { scholar, role: `👑 SQUAD LEADER • ${unit} ${turnIndex + 1}`, badge: 'LEADER' };
    }
    const memberIdx = teammates.indexOf(scholar);
    return {
      scholar,
      role: `${['🎮', '⚡', '🌟'][memberIdx] || '🎮'} MEMBER ${memberIdx + 1} • ${unit} ${turnIndex + 1}`,
      badge: `P${memberIdx + 1}`
    };
  }

  // Number of member-solved steps before the leader's final step (Round 1: 3, Round 3: 5)
  getRiddleStepCount(roundNumber) {
    if (roundNumber === 3) return PUZZLE_SETS[3]?.[0]?.steps?.length || 3;
    return 3;
  }

  // Total steps a team plays in a round (Round 2: 10 nodes; otherwise riddles + leader step)
  getTotalStepCount(roundNumber) {
    return roundNumber === 2 ? 10 : this.getRiddleStepCount(roundNumber) + 1;
  }

  // The shared Round 3 case file shown beside every evidence step
  getCaseDossier(puzzleSet) {
    return {
      fileNumber: puzzleSet?.fileNumber || '',
      dossierTitle: puzzleSet?.dossierTitle,
      incidentDate: puzzleSet?.incidentDate,
      location: puzzleSet?.location,
      caseSummary: puzzleSet?.caseSummary,
      suspects: puzzleSet?.suspects || [],
      witnessStatements: puzzleSet?.witnessStatements || []
    };
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
      const isLeaderStep = (this.currentRound === 2) ? (activeTurnIndex >= 9) : (activeTurnIndex >= totalRiddleSteps);

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
              image: stepObj?.image || null,
              wordPattern,
              totalLetters,
              caseDossier: this.currentRound === 3 ? this.getCaseDossier(puzzleSet) : null,
              exhibit: stepObj?.exhibit || null,
              // Difficulty curve: Round 1 gives its hint early and shows the first letter; Round 3 makes you earn it
              hintUnlockSec: this.currentRound === 3 ? 90 : 45,
              startsWith: this.currentRound === 1 ? (stepObj?.expectedFragment || '').trim().charAt(0).toUpperCase() : '',
              wrongAttempts: progress.wrongByStep?.[activeTurnIndex] || 0,
              penaltyPerWrong: PENALTY_ROUNDS.includes(this.currentRound) ? WRONG_ANSWER_PENALTY : 0,
              turnStartedAt: progress.currentTurnStartedAt || this.roundState.startTime,
              turnDurationSec: 150, // 2.5 minutes per operative turn
              clueUnlockDelaySec: 0, // The advisory clue is always visible
              skipUnlockSec: this.getSkipUnlockSec(this.currentRound)
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
              image: puzzleSet.leaderTask?.image || null,
              collectedFragments: progress.collectedFragments,
              findingLabels: this.currentRound === 3 ? (puzzleSet.steps || []).map(s => s.category) : null,
              roundType: this.currentRound === 1 ? 'phrase' : 'code',
              caseDossier: this.currentRound === 3 ? this.getCaseDossier(puzzleSet) : null,
              wrongAttempts: progress.wrongByStep?.[activeTurnIndex] || 0,
              penaltyPerWrong: this.currentRound === 3 ? WRONG_ANSWER_PENALTY : 0,
              turnStartedAt: progress.currentTurnStartedAt || this.roundState.startTime,
              turnDurationSec: 150,
              clueUnlockDelaySec: 0,
              skipUnlockSec: this.currentRound === 1 ? 150 : 0,
              warrantLockedForSec: progress.warrantLockUntil ? Math.max(0, Math.ceil((progress.warrantLockUntil - Date.now()) / 1000)) : 0
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
          dossierTitle: puzzleSet?.dossierTitle || 'The Kensington Crescent Affair',
          culpritName: puzzleSet?.verdict?.culprit || '',
          weapon: puzzleSet?.verdict?.weapon || '',
          motive: puzzleSet?.verdict?.motive || '',
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
        roundScores: team.roundScores,
        rank: this.getLeaderboard().findIndex(t => t.teamId === team.teamId) + 1,
        totalTeams: this.teams.size,
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
          assembledSubmission: progress.assembledSubmission || null,
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
      roundActive: this.roundState.active && !this.roundState.isPaused,
      isPaused: Boolean(this.roundState.active && this.roundState.isPaused)
      // Note: round timer is NOT sent to students, per requirement!
    };
  }

  getLeaderboard() {
    // Return cached result if state hasn't changed since last build
    if (!this._leaderboardDirty && this._leaderboardCache) {
      return this._leaderboardCache;
    }
    const list = Array.from(this.teams.values()).sort((a, b) => this.compareTeams(a, b)).map((t, rankIdx) => {
      const prog = t.currentRoundProgress;
      const memberDetails = t.members.map(tok => this.players.get(tok)).filter(Boolean);
      const membersTurnOrder = [];
      const totalStepsToMap = this.getTotalStepCount(this.currentRound);

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
        currentTurnIndex: prog ? prog.currentTurnIndex : 0,
        isRoundCompleted: prog ? prog.isRoundCompleted : false,
        completedAt: prog ? prog.completedAt : null,
        collectedCount: prog ? (prog.collectedFragments ? prog.collectedFragments.length : 0) : 0,
        nodesBreached: prog ? (prog.nodesBreached !== undefined ? prog.nodesBreached : Object.keys(prog.stepSolved || {}).length) : 0,
        collectedWords: prog?.collectedWords || [],
        rank: rankIdx + 1,
        timeUsedMs: this._timeUsedMs(t),
        membersTurnOrder
      };
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
      durationSec: this.roundState.active ? this.roundState.durationSec : 0,
      leaderboard: this.getLeaderboard(),
      serverTime: now
    };
  }

  // Lean, pre-ranked snapshot for the host screen (pushed at most once a second).
  // Steps are encoded as a short string: S = solved, A = being solved now, L = locked.
  getAdminState() {
    const now = Date.now();
    const round = this.currentRound;
    const totalSteps = round ? this.getTotalStepCount(round) : 0;
    const ranked = Array.from(this.teams.values()).sort((a, b) => this.compareTeams(a, b));
    let finishedCount = 0;
    let playingCount = 0;

    const teams = ranked.map((t, idx) => {
      const prog = t.currentRoundProgress && t.currentRoundProgress.roundNumber === round ? t.currentRoundProgress : null;
      const memberDetails = t.members.map(tok => this.players.get(tok)).filter(Boolean);
      const active = prog && !prog.isRoundCompleted ? this.getTurnPlayer(memberDetails, prog.currentTurnIndex, round) : null;
      let steps = '';
      let solved = 0;
      for (let i = 0; i < totalSteps; i++) {
        const done = Boolean(prog && (prog.stepSolved?.[i] || prog.isRoundCompleted));
        if (done) solved++;
        steps += done ? 'S' : (prog && !prog.isRoundCompleted && prog.currentTurnIndex === i ? 'A' : 'L');
      }
      if (prog) {
        playingCount++;
        if (prog.isRoundCompleted) finishedCount++;
      }
      return {
        teamId: t.teamId,
        benchNumber: t.benchNumber || '',
        name: t.name,
        rank: idx + 1,
        totalScore: t.totalScore,
        roundScores: t.roundScores,
        isRoundCompleted: Boolean(prog?.isRoundCompleted),
        solved,
        totalSteps,
        steps,
        activeName: active?.scholar?.name || '',
        timeUsedMs: this._timeUsedMs(t),
        online: memberDetails.some(m => m.isOnline),
        members: memberDetails.map(m => ({ name: m.name, isLeader: Boolean(m.isLeader), isOnline: Boolean(m.isOnline) }))
      };
    });

    return {
      status: this.status,
      currentRound: round,
      roundTitle: round ? (ROUND_CONFIGS[round]?.title || `Round ${round}`) : '',
      serverTime: now,
      roundState: {
        active: this.roundState.active,
        isPaused: this.roundState.isPaused,
        endTime: this.roundState.endTime,
        remainingMsOnPause: this.roundState.remainingMsOnPause,
        durationSec: this.roundState.durationSec
      },
      totalPlayers: this.players.size,
      onlinePlayers: Array.from(this.players.values()).filter(p => p.isOnline).length,
      finishedCount,
      playingCount,
      teams,
      activity: this.auditLogs.slice(0, 8).map(l => ({ t: l.timestamp, type: l.type, text: l.detail }))
    };
  }
}

module.exports = GameStateManager;
