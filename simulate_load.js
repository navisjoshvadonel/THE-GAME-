/**
 * SNOW'S ARENA — LIVE LOAD SIMULATOR
 * Connects N bot squads to a running server over real WebSockets, plays every round
 * with human-like delays and occasional wrong answers, then reports:
 *   - which puzzle set each squad received (and any duplicates)
 *   - server response times (p50 / p95 / max)
 *   - errors, disconnects and squads that got stuck
 *
 * Usage:
 *   node simulate_load.js                                   # 20 squads vs http://localhost:5000, you run the rounds from /admin
 *   node simulate_load.js --url http://172.16.10.5:5000     # point at the event laptop's college IP
 *   node simulate_load.js --teams 30 --speed 0.5            # 30 squads, answering twice as fast
 *   node simulate_load.js --host                            # the simulator also starts every round itself
 *
 * Run it against a test server, not during the real event: it registers real squads.
 * Reset afterwards from the admin panel ("Reset All").
 */

const { io } = require('socket.io-client');
const { PUZZLE_SETS } = require('./src/puzzles');

// ---------------------------------------------------------------- options
function arg(name, fallback) {
  const i = process.argv.indexOf(`--${name}`);
  if (i === -1) return fallback;
  const v = process.argv[i + 1];
  return v === undefined || v.startsWith('--') ? true : v;
}
const SERVER_URL = arg('url', process.env.SERVER_URL || 'http://localhost:5000');
const TEAM_COUNT = parseInt(arg('teams', 20), 10);
const SPEED = parseFloat(arg('speed', 1)); // multiplier on think-time; 0.5 = twice as fast
const DRIVE_HOST = Boolean(arg('host', false));
const ADMIN_PASSWORD = arg('password', process.env.ADMIN_SECRET || 'campus_admin_2026');
const MAX_MINUTES = parseFloat(arg('max-minutes', 40));

const FIRST_NAMES = ['Joshva', 'Sharma', 'Priya', 'Arjun', 'Divya', 'Karthik', 'Meera', 'Rahul', 'Sneha', 'Vikram', 'Ananya', 'Rohan', 'Kavya', 'Aditya', 'Nisha', 'Surya', 'Lakshmi', 'Ishaan', 'Pooja', 'Varun'];
const TEAM_WORDS = ['Blizzard', 'Frostbite', 'Avalanche', 'Glacier', 'Icicle', 'Polar', 'Snowstorm', 'Tundra', 'Aurora', 'Permafrost', 'Hailstorm', 'Snowdrift', 'Whiteout', 'Iceberg', 'Northwind', 'Sleet', 'Flurry', 'Coldfront', 'Yeti', 'Snowcap'];

// ---------------------------------------------------------------- helpers
const sleep = (ms) => new Promise(r => setTimeout(r, ms));
const think = (minSec, maxSec) => sleep((minSec + Math.random() * (maxSec - minSec)) * 1000 * SPEED);
const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
const latencies = [];
const issues = [];

function emitTimed(socket, event, payload) {
  return new Promise((resolve) => {
    const started = Date.now();
    const timer = setTimeout(() => {
      issues.push(`${event}: no response after 10s`);
      resolve({ success: false, message: 'timeout' });
    }, 10000);
    socket.emit(event, payload, (res) => {
      clearTimeout(timer);
      latencies.push(Date.now() - started);
      resolve(res || { success: false });
    });
  });
}

function percentile(values, p) {
  if (values.length === 0) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  return sorted[Math.min(sorted.length - 1, Math.floor((p / 100) * sorted.length))];
}

function wrongWord(word) {
  const reversed = word.split('').reverse().join('');
  return reversed !== word ? reversed : 'Z'.repeat(word.length);
}

// ---------------------------------------------------------------- bot squad
class BotSquad {
  constructor(index) {
    this.index = index;
    this.name = `${TEAM_WORDS[index % TEAM_WORDS.length]} ${String(index + 1).padStart(2, '0')}`;
    this.size = [2, 3, 3, 4][index % 4]; // a realistic mix of squad sizes
    this.leaderName = FIRST_NAMES[index % FIRST_NAMES.length];
    this.memberNames = Array.from({ length: this.size - 1 }, (_, k) => FIRST_NAMES[(index + k + 5) % FIRST_NAMES.length]);
    this.state = null;
    this.token = null;
    this.busy = false;
    this.disconnects = 0;
    this.assigned = {}; // round -> { setId, firstQuestion }
    this.lastProgressAt = Date.now();
  }

  async connect() {
    this.socket = io(SERVER_URL, { transports: ['websocket'], reconnection: true, reconnectionDelay: 500 });
    this.socket.on('disconnect', () => { this.disconnects++; });
    this.socket.on('connect', () => {
      // After a WiFi blip, resume the same squad exactly like a real browser would
      if (this.token) this.socket.emit('reconnect_session', { sessionToken: this.token }, (res) => res?.success && this.onState(res.clientState));
    });
    this.socket.on('sync_state', (s) => this.onState(s));
    ['round_started', 'round_resumed', 'round_ended', 'stage_advanced'].forEach(evt => {
      this.socket.on(evt, () => this.token && this.socket.emit('request_state_refresh', { sessionToken: this.token }));
    });
    await new Promise((resolve, reject) => {
      this.socket.once('connect', resolve);
      this.socket.once('connect_error', reject);
    });
  }

  async register() {
    const res = await emitTimed(this.socket, 'register_bench', {
      benchNumber: '',
      teamName: this.name,
      gender: 'open',
      teamSize: this.size,
      leaderName: this.leaderName,
      memberNames: this.memberNames
    });
    if (!res.success) throw new Error(`${this.name} registration failed: ${res.message}`);
    this.token = res.sessionToken;
    this.onState(res.clientState);
  }

  onState(state) {
    if (!state) return;
    this.state = state;
    this.stateSeq = (this.stateSeq || 0) + 1;
    this.awaitingSync = false;
    const round = state.currentRound;
    const progress = state.team?.progress;
    if (round && progress?.setId && !this.assigned[round] && state.puzzle) {
      const p = state.puzzle;
      this.assigned[round] = {
        setId: progress.setId,
        firstQuestion: p.title || p.nodeData?.prompt?.slice(0, 60) || '?'
      };
    }
    this.maybeAct();
  }

  maybeAct() {
    // After a successful answer, wait for the server's next sync instead of replaying the old puzzle
    if (this.busy || this.awaitingSync || !this.state?.roundActive || !this.state.puzzle) return;
    const type = this.state.puzzle.type;
    if (!['member_step', 'leader_step', 'cyber_hack_round2'].includes(type)) return;
    this.busy = true;
    this.play(this.state).catch(err => issues.push(`${this.name}: ${err.message}`)).finally(() => {
      this.busy = false;
      // Act again if a newer state arrived while we were busy
      setImmediate(() => this.maybeAct());
    });
  }

  puzzleSet(round) {
    const setId = this.state.team.progress.setId;
    return (PUZZLE_SETS[round] || []).find(s => s.setId === setId);
  }

  async play(state) {
    let seqAtStart = this.stateSeq;
    const round = state.currentRound;
    const puzzle = state.puzzle;
    const set = this.puzzleSet(round);
    if (!set) throw new Error(`unknown puzzle set for round ${round}`);

    if (puzzle.type === 'cyber_hack_round2') {
      const node = set.steps[puzzle.nodeIndex];
      await think(4, 14);
      // Some squads need a guess or two, a few never crack it and get auto-bypassed
      const misses = Math.random() < 0.05 ? 4 : (Math.random() < 0.45 ? 1 + Math.floor(Math.random() * 2) : 0);
      for (let i = 0; i < misses; i++) {
        seqAtStart = this.stateSeq;
        const res = await emitTimed(this.socket, 'submit_round2_guess', { sessionToken: this.token, guessWord: wrongWord(node.targetWord) });
        if (res.nodePassed) { this.lastProgressAt = Date.now(); this.awaitingSync = this.stateSeq === seqAtStart; return; }
        await think(3, 7);
      }
      seqAtStart = this.stateSeq;
      const res = await emitTimed(this.socket, 'submit_round2_guess', { sessionToken: this.token, guessWord: node.targetWord });
      if (res.success) { this.lastProgressAt = Date.now(); this.awaitingSync = this.stateSeq === seqAtStart; }
      return;
    }

    const stepIndex = state.team.progress.currentTurnIndex;
    let answer;
    if (puzzle.type === 'member_step') {
      await think(8, 30);
      if (Math.random() < 0.3) {
        await emitTimed(this.socket, 'submit_turn_answer', { sessionToken: this.token, turnIndex: stepIndex, answer: 'notthisone' });
        await sleep(1700); // respect the server's 1.5s submit cooldown
        await think(2, 6);
      }
      answer = set.steps[stepIndex].acceptedAnswers[0];
    } else if (round === 3) {
      await think(10, 25);
      answer = 'SHARMA:CYANIDE:BLACKMAIL';
    } else {
      await think(12, 30);
      const [a, b, c] = state.puzzle.collectedFragments.map(f => f.toLowerCase());
      answer = `Our squad uses ${a} and ${b} with ${c} inspiration to build brilliant ideas.`;
    }
    seqAtStart = this.stateSeq;
    const res = await emitTimed(this.socket, 'submit_turn_answer', { sessionToken: this.token, turnIndex: stepIndex, answer });
    if (res.success) { this.lastProgressAt = Date.now(); this.awaitingSync = this.stateSeq === seqAtStart; }
    else if (!/cooldown|out of sync/i.test(res.message || '')) issues.push(`${this.name} R${round} step ${stepIndex + 1}: ${res.message}`);
  }
}

// ---------------------------------------------------------------- host driver
async function hostAction(socket, action, payload = {}) {
  const res = await emitTimed(socket, 'admin_action', { password: ADMIN_PASSWORD, action, payload });
  console.log(`  [HOST] ${action}${payload.roundNumber ? ' ' + payload.roundNumber : ''}: ${res.success ? 'ok' : res.message}`);
  return res;
}

// ---------------------------------------------------------------- main
(async () => {
  console.log(`\n❄️  Snow's Arena load simulator → ${SERVER_URL}`);
  console.log(`   ${TEAM_COUNT} bot squads • think-time x${SPEED} • ${DRIVE_HOST ? 'simulator drives the host' : 'start rounds from /admin'}\n`);

  const bots = Array.from({ length: TEAM_COUNT }, (_, i) => new BotSquad(i));
  try {
    await Promise.all(bots.map(b => b.connect()));
  } catch (err) {
    console.error(`Could not connect to ${SERVER_URL}: ${err.message}`);
    process.exit(1);
  }
  for (const b of bots) await b.register(); // sequential, like squads arriving one by one
  console.log(`✓ ${bots.length} squads registered (sizes: ${bots.map(b => b.size).join(',')})\n`);

  let hostSocket = null;
  if (DRIVE_HOST) {
    hostSocket = io(SERVER_URL, { transports: ['websocket'] });
    await new Promise(r => hostSocket.once('connect', r));
  }

  const startedAt = Date.now();
  let lastStatus = '';
  let finished = false;

  // Progress ticker + optional host automation
  const ticker = setInterval(async () => {
    const statuses = bots.map(b => b.state?.gameStatus).filter(Boolean);
    const status = statuses.sort((a, b) => statuses.filter(v => v === b).length - statuses.filter(v => v === a).length)[0] || '?';
    const done = bots.filter(b => b.state?.team?.progress?.isRoundCompleted).length;
    const top = [...bots].sort((a, b) => (b.state?.team?.totalScore || 0) - (a.state?.team?.totalScore || 0))[0];
    console.log(`  [${Math.round((Date.now() - startedAt) / 1000)}s] ${status} • ${done}/${bots.length} squads finished this round • leader: ${top?.name} ${top?.state?.team?.totalScore || 0} pts`);

    if (status === 'FINISHED') finished = true;
    if (DRIVE_HOST && status !== lastStatus) {
      lastStatus = status;
      if (status === 'LOBBY') await hostAction(hostSocket, 'start_round', { roundNumber: 1 });
      if (status === 'INTERMEDIATE_1') await hostAction(hostSocket, 'start_round', { roundNumber: 2 });
      if (status === 'INTERMEDIATE_2') await hostAction(hostSocket, 'start_round', { roundNumber: 3 });
    }
  }, 5000);

  // Stuck detector: a squad in an active round with no progress for 4 minutes
  const stuckWatch = setInterval(() => {
    for (const b of bots) {
      if (b.awaitingSync) b.socket.emit('request_state_refresh', { sessionToken: b.token });
      const s = b.state;
      if (s?.roundActive && s.puzzle && !s.team?.isEliminated && !s.team?.progress?.isRoundCompleted && Date.now() - b.lastProgressAt > 240000 * Math.max(SPEED, 0.25)) {
        issues.push(`${b.name} made no progress for 4 min in ${s.gameStatus}`);
        b.lastProgressAt = Date.now();
      }
    }
  }, 10000);

  while (!finished && Date.now() - startedAt < MAX_MINUTES * 60000) await sleep(1000);
  clearInterval(ticker);
  clearInterval(stuckWatch);
  await sleep(1500);

  // ---------------------------------------------------------------- report
  console.log('\n======================================================================');
  console.log('  📋 SIMULATION REPORT');
  console.log('======================================================================');
  for (const round of [1, 2, 3]) {
    const rows = bots.filter(b => b.assigned[round]);
    if (rows.length === 0) continue;
    const bySet = new Map();
    rows.forEach(b => bySet.set(b.assigned[round].setId, [...(bySet.get(b.assigned[round].setId) || []), b.name]));
    const dupes = [...bySet.entries()].filter(([, names]) => names.length > 1);
    console.log(`\n  ROUND ${round}: ${rows.length} squads played, ${bySet.size} different question sets`);
    if (round === 3) console.log('    (Round 3 is one shared murder case for every squad, by design)');
    else if (dupes.length === 0) console.log('    ✓ every squad got its own questions');
    else dupes.forEach(([setId, names]) => console.log(`    ⚠ ${setId} shared by: ${names.join(', ')}`));
    rows.slice(0, 6).forEach(b => console.log(`    ${b.name.padEnd(14)} ${b.assigned[round].setId.padEnd(22)} "${b.assigned[round].firstQuestion}"`));
    if (rows.length > 6) console.log(`    … and ${rows.length - 6} more`);
  }

  console.log('\n  FINAL STANDINGS (top 5)');
  [...bots].sort((a, b) => (b.state?.team?.totalScore || 0) - (a.state?.team?.totalScore || 0)).slice(0, 5)
    .forEach((b, i) => {
      const rs = b.state?.team?.roundScores || {};
      console.log(`    #${i + 1} ${b.name.padEnd(14)} ${String(b.state?.team?.totalScore || 0).padStart(5)} pts  (R1 ${rs[1] || 0} • R2 ${rs[2] || 0} • R3 ${rs[3] || 0})`);
    });

  console.log(`\n  SERVER RESPONSE TIME: ${latencies.length} requests • p50 ${percentile(latencies, 50)}ms • p95 ${percentile(latencies, 95)}ms • max ${Math.max(0, ...latencies)}ms`);
  console.log(`  DISCONNECTS: ${bots.reduce((n, b) => n + b.disconnects, 0)}`);
  console.log(`  ISSUES: ${issues.length === 0 ? 'none' : ''}`);
  issues.slice(0, 20).forEach(i => console.log(`    ⚠ ${i}`));
  if (!finished) console.log(`\n  ⚠ Stopped after ${MAX_MINUTES} min before the tournament finished.`);
  console.log('');
  process.exit(issues.length === 0 && finished ? 0 : 1);
})();
