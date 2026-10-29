/**
 * SNOW'S ARENA — GAMEPLAY REGRESSION TESTS
 * Covers the anti-stuck and fairness fixes: timed skip, stale turn indexes,
 * tiered Round 2 scoring, every squad playing Round 3, leaderboard freshness and host-only advance.
 */

// Keep test runs away from the live data/snapshot.json
process.env.SNAPSHOT_DIR = process.env.SNAPSHOT_DIR || require('path').join(require('os').tmpdir(), 'snow-arena-test-snapshots');
const GameStateManager = require('./src/state');
const { PUZZLE_SETS, checkStepAnswer } = require('./src/puzzles');

let passed = 0;
let failed = 0;
function assert(condition, name, details = '') {
  if (condition) {
    passed++;
    console.log(`  ✓ PASS: ${name}`);
  } else {
    failed++;
    console.error(`  ✗ FAIL: ${name}${details ? ' — ' + details : ''}`);
  }
}

function registerTeam(state, name, size = 3) {
  const members = ['Joshva', 'Sharma', 'Priya'].slice(0, size - 1);
  const reg = state.registerBenchTeam({ teamName: name, teamSize: size, leaderName: `${name} Lead`, memberNames: members, socketId: `sock_${name}` });
  return { team: reg.team, token: reg.sessionToken };
}

// Pretend the current turn started `seconds` ago (and the submit cooldown has passed)
function ageTurn(state, team, token, seconds) {
  team.currentRoundProgress.currentTurnStartedAt = Date.now() - seconds * 1000;
  state.players.get(token).lastSubmitTime = 0;
}

console.log('--- [BROWSER SCRIPTS PARSE] ---');
{
  const { spawnSync } = require('child_process');
  const fs = require('fs');
  const path = require('path');
  const dir = path.join(__dirname, 'public', 'js');
  for (const file of fs.readdirSync(dir).filter(f => f.endsWith('.js'))) {
    const check = spawnSync(process.execPath, ['--check', path.join(dir, file)], { encoding: 'utf8' });
    assert(check.status === 0, `JS-1: public/js/${file} has no syntax errors`, (check.stderr || '').split('\n').slice(0, 4).join(' '));
  }
}

console.log('\n--- [ROUND 3 CASE] ---');
{
  const { PUZZLE_SETS: SETS } = require('./src/puzzles');
  const kc = SETS[3][0];
  assert(kc.steps.length === 5, 'R3-CASE-1: Round 3 has five evidence exhibits');
  const answers = kc.steps.map(s => s.expectedFragment.toLowerCase());
  assert(!answers.some(a => /sharma|rohan/.test(a)), 'R3-CASE-2: No exhibit answer names the killer');
  assert(kc.steps.every(s => Array.isArray(s.exhibit) && s.exhibit.length >= 3), 'R3-CASE-3: Every exhibit has a typed document');
  const check = require('./src/puzzles').checkLeaderExactCode;
  assert(/1 of 3/.test(check(3, kc.setId, 'PETER:STRYCHNINE:LEDGER').message), 'R3-CASE-4: Warrant feedback counts charges without naming them');
}

console.log('\n--- [PUZZLE DATA] ---');
for (const set of PUZZLE_SETS[2]) {
  set.steps.forEach((step, i) => {
    if (!/^[A-Z]+$/.test(step.targetWord) || step.targetWord.length !== step.length) {
      assert(false, `R2 ${set.setId} node ${i + 1} is solvable`, `${step.targetWord}/${step.length}`);
    }
  });
}
assert(true, 'DATA-1: Every Round 2 node is letters-only with a matching length');
assert(checkStepAnswer(1, 'r1_set_a', 2, '  Dr. A.P.J Abdul Kalam ').success === false, 'DATA-2: Unlisted long-form answer still rejected');
assert(checkStepAnswer(1, 'r1_set_a', 2, 'Abdul-Kalam!').success, 'DATA-3: Punctuation and case are forgiven');
assert(checkStepAnswer(3, null, 0, 'Cyanide.').success, 'DATA-4: Round 3 forgives trailing punctuation');

console.log('\n--- [ROUND 1: STALE TURNS & SKIP] ---');
const state = new GameStateManager();
state.resetAllState();
const alpha = registerTeam(state, 'Alpha');
const beta = registerTeam(state, 'Beta');
state.startRound(1);
const alphaSet = PUZZLE_SETS[1].find(s => s.setId === alpha.team.currentRoundProgress.setId);

const future = state.submitTurnAnswer(alpha.token, 2, alphaSet.steps[2].acceptedAnswers[0]);
assert(!future.success && future.outOfSync, 'R1-1: A future step index is rejected instead of skipping ahead');
assert(alpha.team.currentRoundProgress.currentTurnIndex === 0 && !alpha.team.currentRoundProgress.stepSolved[2], 'R1-2: Rejected stale index leaves progress untouched');

const earlySkip = state.skipTurn(alpha.token);
assert(!earlySkip.success, 'R1-3: Skip is locked before the turn window runs out', earlySkip.message);

ageTurn(state, alpha.team, alpha.token, 151);
const skip = state.skipTurn(alpha.token);
assert(skip.success && skip.fragment === alphaSet.steps[0].expectedFragment, 'R1-4: Timed-out riddle can be skipped and reveals the keyword');
assert(alpha.team.totalScore === 0 && alpha.team.currentRoundProgress.currentTurnIndex === 1, 'R1-5: Skip awards 0 points and advances the turn');

const memberToken = alpha.team.members.find(t => t !== alpha.token);
ageTurn(state, alpha.team, alpha.token, 151);
assert(!state.skipTurn(memberToken).success, 'R1-6: Only the squad console can skip');

ageTurn(state, alpha.team, alpha.token, 0);
const solve = state.submitTurnAnswer(alpha.token, undefined, alphaSet.steps[1].acceptedAnswers[0]);
assert(solve.success && solve.earnedPoints === 250, 'R1-7: Missing turn index defaults to the current step');

state.players.get(alpha.token).lastSubmitTime = 0;
state.submitTurnAnswer(alpha.token, 2, alphaSet.steps[2].acceptedAnswers[0]);
ageTurn(state, alpha.team, alpha.token, 100);
assert(!state.skipTurn(alpha.token).success, 'R1-8a: Round 1 victory sentence cannot be skipped early');
ageTurn(state, alpha.team, alpha.token, 151);
const bossSkip = state.skipTurn(alpha.token);
assert(bossSkip.success && alpha.team.currentRoundProgress.isRoundCompleted, 'R1-8b: A stuck Round 1 leader can finish the round for 0 pts after time-out');
assert(alpha.team.roundTimeMs[1] >= 0, 'R1-8c: Finishing records the squad\'s round time for tie-breaks');

console.log('\n--- [TIE-BREAKS & BENCH STATUS] ---');
{
  const tieA = { totalScore: 500, roundTimeMs: { 1: 300000 }, registeredAt: 2 };
  const tieB = { totalScore: 500, roundTimeMs: { 1: 200000 }, registeredAt: 3 };
  assert(state.compareTeams(tieA, tieB) > 0, 'TIE-1: On equal points the faster squad ranks higher');
  const tieC = { totalScore: 500, roundTimeMs: { 1: 200000 }, registeredAt: 1 };
  assert(state.compareTeams(tieC, tieB) < 0, 'TIE-2: Same points and time: earlier registration ranks higher');

  const benchMember = state.players.get(beta.team.members[0]);
  state.handleDisconnect('sock_Beta');
  assert(benchMember.isOnline === false, 'BENCH-1: Teammates on a bench laptop go offline with it');
  state.reconnectPlayer(beta.token, 'sock_Beta_new');
  assert(benchMember.isOnline === true && benchMember.socketId === 'sock_Beta_new', 'BENCH-2: The whole roster comes back with the leader');
}

console.log('\n--- [LEADERBOARD FRESHNESS] ---');
state.getLeaderboard();
state.overrideTeamScore(beta.team.teamId, 999, 'test');
assert(state.getLeaderboard()[0].teamId === beta.team.teamId, 'LB-1: Score override is reflected immediately');

console.log('\n--- [ROUND 2: TIERED SCORING & PAUSE] ---');
state.endRound();
state.startRound(2);
const r2Set = PUZZLE_SETS[2].find(s => s.setId === alpha.team.currentRoundProgress.setId);
const node1 = r2Set.steps[0].targetWord;
const wrong = node1.split('').reverse().join('') === node1 ? 'Z'.repeat(node1.length) : node1.split('').reverse().join('');
state.submitRound2Guess(alpha.token, wrong);
const before = alpha.team.totalScore;
const secondTry = state.submitRound2Guess(alpha.token, node1);
assert(secondTry.isSolved && secondTry.pointsAwarded === 80 && alpha.team.totalScore === before + 80, 'R2-1: Breach on the 2nd guess awards 80 PTS', JSON.stringify(secondTry.pointsAwarded));

state.pauseRound();
const paused = state.submitRound2Guess(alpha.token, r2Set.steps[1].targetWord);
assert(!paused.success && /paused/i.test(paused.message), 'R2-2: Guesses are rejected while the host has paused');
assert(state.getClientState(alpha.token).isPaused === true, 'R2-3: Players are told the round is paused');
const turnStartBeforeResume = alpha.team.currentRoundProgress.currentTurnStartedAt;
state.roundState.pausedAt = Date.now() - 60000; // pretend the pause lasted a minute
state.resumeRound();
const shift = alpha.team.currentRoundProgress.currentTurnStartedAt - turnStartBeforeResume;
assert(shift >= 59000 && shift <= 61000, 'R2-4: Resume gives back the paused minute to the turn clock', `shift=${shift}`);

console.log('\n--- [ROUND 3: EVERY SQUAD PLAYS] ---');
for (let i = 0; i < 5; i++) {
  const late = registerTeam(state, `Late${i}`);
  state.overrideTeamScore(late.team.teamId, 10 + i, 'outscore Alpha');
}
state.endRound();
state.overrideTeamScore(alpha.team.teamId, -alpha.team.totalScore, 'last place');
state.startRound(3);
const lastPlaceState = state.getClientState(alpha.token);
assert(alpha.team.currentRoundProgress?.roundNumber === 3, 'R3-1: Even the last-placed squad plays Round 3');
assert(lastPlaceState.puzzle && lastPlaceState.puzzle.type === 'member_step', 'R3-2: Every squad receives the Round 3 case');
assert([...state.teams.values()].every(t => t.currentRoundProgress?.roundNumber === 3), 'R3-3: Nobody is eliminated: every squad has the case');
const lateSquad = registerTeam(state, 'MidFinals');
assert(lateSquad.team.currentRoundProgress?.roundNumber === 3, 'R3-4: A squad registering mid-Round 3 can still play it');

console.log('\n--- [WRONG-ANSWER PENALTY] ---');
{
  const pen = new GameStateManager();
  pen.resetAllState();
  const sq = registerTeam(pen, 'Penalty', 2);
  pen.startRound(1);
  const set = PUZZLE_SETS[1].find(s => s.setId === sq.team.currentRoundProgress.setId);
  const miss = pen.submitTurnAnswer(sq.token, 0, 'definitelywrong');
  assert(!miss.success && miss.penalty === 10 && miss.wrongAttempts === 1, 'PEN-1: A wrong Round 1 answer costs 10 points');
  ageTurn(pen, sq.team, sq.token, 0);
  pen.submitTurnAnswer(sq.token, 0, 'stillwrong');
  ageTurn(pen, sq.team, sq.token, 0);
  const hit = pen.submitTurnAnswer(sq.token, 0, set.steps[0].acceptedAnswers[0]);
  assert(hit.success && hit.earnedPoints === 230, 'PEN-2: Two wrong answers take 20 off the step (250 → 230)', String(hit.earnedPoints));
  ageTurn(pen, sq.team, sq.token, 0);
  const blank = pen.submitTurnAnswer(sq.token, 1, '   ');
  assert(!blank.success && !blank.penalty, 'PEN-3: An empty submission is never penalised');
  assert(pen.getClientState(sq.token).puzzle.penaltyPerWrong === 10, 'PEN-4: Players are told the penalty');
}

console.log('\n--- [30 SQUADS, 30 QUESTION SETS] ---');
{
  const big = new GameStateManager();
  big.resetAllState();
  for (let i = 0; i < 30; i++) registerTeam(big, `Squad${i}`);
  for (const round of [1, 2]) {
    big.startRound(round);
    const ids = new Set([...big.teams.values()].map(t => t.currentRoundProgress.setId));
    assert(ids.size === 30, `SETS-${round}: 30 squads get 30 different Round ${round} sets`, `got ${ids.size}`);
    big.endRound();
  }
}

console.log('\n--- [VICTORY SENTENCE KEYWORDS] ---');
{
  const { validateLeaderPhrase } = require('./src/nlpValidator');
  const frags = ['MATRIX', 'MASTER', 'CV RAMAN'];
  assert(validateLeaderPhrase('Our squad uses matrix and master with raman inspiration to build ideas.', frags).isValid, 'KW-1: "Raman" counts for the keyword CV RAMAN');
  assert(validateLeaderPhrase('Our squad uses matrix and master with C.V. Raman inspiration to build ideas.', frags).isValid, 'KW-2: "C.V. Raman" counts for CV RAMAN');
  assert(!validateLeaderPhrase('Our squad uses matrix and master with cv inspiration to build ideas.', frags).isValid, 'KW-3: A bare initial ("cv") does not count');
  assert(validateLeaderPhrase('Like Ambedkar we build the matrix and master our future.', ['MATRIX', 'MASTER', 'BR AMBEDKAR']).isValid, 'KW-4: Surname alone counts for BR AMBEDKAR');
}

console.log('\n--- [RESET] ---');
state.getLeaderboard();
state.resetAllState();
assert(state.getLeaderboard().length === 0, 'RESET-1: Leaderboard is empty right after a reset');
assert(state._benchIndex.size === 0, 'RESET-2: Bench lookup index is cleared on reset');

console.log(`\n📊 GAMEPLAY FIX TESTS: ${passed} PASSED, ${failed} FAILED`);
process.exit(failed > 0 ? 1 : 0);
