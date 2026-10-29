// Keep test runs away from the live data/snapshot.json
process.env.SNAPSHOT_DIR = process.env.SNAPSHOT_DIR || require('path').join(require('os').tmpdir(), 'snow-arena-test-snapshots');
const GameStateManager = require('./src/state');
const { PUZZLE_SETS } = require('./src/puzzles');

/**
 * FULL TOURNAMENT SMOKE TEST
 * Three squads (2, 3 and 4 players) register at their benches and play every round
 * to the end through the same engine calls the sockets use. Any failure throws.
 */

function check(condition, message) {
  if (!condition) throw new Error(`FAILED: ${message}`);
  console.log(`  ✓ ${message}`);
}

console.log('=== FULL TOURNAMENT SMOKE TEST ===\n');

const state = new GameStateManager('test_admin_pwd');
state.resetAllState();

// 1. Squad registration (one laptop per bench: leader + teammates)
console.log('1. Registering squads');
const squads = [
  { teamName: 'Frost Byte', teamSize: 2, leaderName: 'Joshva', memberNames: ['Navis'] },
  { teamName: 'Ice Breakers', teamSize: 3, leaderName: 'Sharma', memberNames: ['Priya', 'Arjun'] },
  { teamName: 'Polar Minds', teamSize: 4, leaderName: 'Kavya', memberNames: ['Rahul', 'Meera', 'Surya'] }
].map((def, i) => {
  const reg = state.registerBenchTeam({ ...def, socketId: `sock_${i}` });
  check(reg.success && reg.team.members.length === def.teamSize, `${def.teamName} registered with ${def.teamSize} players`);
  return { team: reg.team, leader: reg.sessionToken };
});
const tooSmall = state.registerBenchTeam({ teamName: 'Solo', teamSize: 3, leaderName: 'Lone', memberNames: ['Only'], socketId: 'sock_x' });
check(!tooSmall.success, 'A squad missing a member name is rejected');

const fresh = () => state.players.forEach(p => { p.lastSubmitTime = 0; });
const membersOf = (team) => team.members.map(tok => state.players.get(tok));

// 2. Round 1: three riddles, then the leader's victory sentence
console.log('\n2. Round 1');
check(state.advanceStage().success && state.status === 'ROUND_1', 'Lobby advances to Round 1');
for (const { team, leader } of squads) {
  const set = PUZZLE_SETS[1].find(s => s.setId === team.currentRoundProgress.setId);
  set.steps.forEach((step, i) => {
    fresh();
    const turn = state.getTurnPlayer(membersOf(team), i, 1);
    const res = state.submitTurnAnswer(turn.scholar.sessionToken, i, step.acceptedAnswers[0]);
    check(res.success && res.fragment === step.expectedFragment, `${team.name}: game ${i + 1} solved by ${turn.scholar.name}`);
  });
  fresh();
  const [a, b, c] = team.currentRoundProgress.collectedFragments.map(f => f.toLowerCase());
  const thesis = state.submitTurnAnswer(leader, 3, `Our squad uses ${a} and ${b} with ${c} inspiration to build brilliant ideas.`);
  check(thesis.success, `${team.name}: victory sentence accepted`);
}
check(state.status === 'INTERMEDIATE_1', 'Round 1 ends once every squad has finished');

// 3. Round 2: ten-node word chain
console.log('\n3. Round 2');
check(state.advanceStage().success && state.status === 'ROUND_2', 'Break advances to Round 2');
for (const { team } of squads) {
  const set = PUZZLE_SETS[2].find(s => s.setId === team.currentRoundProgress.setId);
  set.steps.forEach((node, n) => {
    const turn = state.getTurnPlayer(membersOf(team), n, 2);
    const res = state.submitRound2Guess(turn.scholar.sessionToken, node.targetWord);
    if (!res.success || !res.isBreached) throw new Error(`${team.name}: node ${n + 1} failed: ${res.message}`);
  });
  check(team.currentRoundProgress.isRoundCompleted, `${team.name}: all 10 nodes breached`);
}
check(state.status === 'INTERMEDIATE_2', 'Round 2 ends once every squad has finished');

// 4. Round 3: every squad plays the case (no elimination)
console.log('\n4. Round 3');
check(state.advanceStage().success && state.status === 'ROUND_3', 'Break advances to Round 3');
const r3 = PUZZLE_SETS[3][0];
for (const { team, leader } of squads) {
  check(team.currentRoundProgress?.roundNumber === 3, `${team.name}: plays the Round 3 case`);
  r3.steps.forEach((step, i) => {
    fresh();
    const turn = state.getTurnPlayer(membersOf(team), i, 3);
    const res = state.submitTurnAnswer(turn.scholar.sessionToken, i, step.acceptedAnswers[0]);
    check(res.success, `${team.name}: ${step.title.split(' — ')[0]} solved`);
  });
  fresh();
  const warrant = state.submitTurnAnswer(leader, r3.steps.length, r3.leaderTask.expectedMasterCode);
  check(warrant.success, `${team.name}: arrest warrant granted`);
}
check(state.status === 'FINISHED', 'Tournament finishes once every squad closes the case');

// 5. Final standings
console.log('\n5. Final standings');
const board = state.getLeaderboard();
board.forEach(t => console.log(`  #${t.rank} ${t.name} — ${t.totalScore} PTS (R1 ${t.roundScores[1]} • R2 ${t.roundScores[2]} • R3 ${t.roundScores[3]})`));
check(board.length === 3 && board.every((t, i) => i === 0 || board[i - 1].totalScore >= t.totalScore), 'Leaderboard is sorted by score');

console.log('\n=== FULL TOURNAMENT SMOKE TEST PASSED ===');
process.exit(0);
