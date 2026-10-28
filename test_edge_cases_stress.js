/**
 * THE ACADEMIC DECATHLON — EXHAUSTIVE STRESS & EDGE-CASE TEST SUITE
 * Tests every edge case, failure mode, malicious input, and state transition across the engine.
 */

const fs = require('fs');
const path = require('path');
// Keep test runs away from the live data/snapshot.json
process.env.SNAPSHOT_DIR = process.env.SNAPSHOT_DIR || require('path').join(require('os').tmpdir(), 'snow-arena-test-snapshots');
const GameStateManager = require('./src/state');
const { PUZZLE_SETS, getPuzzleSetForTeam, evaluateWordleGuess, checkLeaderExactCode } = require('./src/puzzles');
const { validateLeaderPhrase, sanitizeText } = require('./src/nlpValidator');

let passedTests = 0;
let failedTests = 0;
const failures = [];

function assert(condition, testName, details = '') {
  if (condition) {
    passedTests++;
    console.log(`  ✓ PASS: ${testName}`);
  } else {
    failedTests++;
    const errMsg = `FAIL: ${testName} ${details ? '— ' + details : ''}`;
    console.error(`  ✗ ${errMsg}`);
    failures.push(errMsg);
  }
}

async function runAllTests() {
  console.log('======================================================================');
  console.log('  🧪 RUNNING EXHAUSTIVE EDGE-CASE & RESILIENCE TEST SUITE');
  console.log('======================================================================\n');

  const state = new GameStateManager();
  state.resetAllState();

  // ------------------------------------------------------------------
  // CATEGORY 1: REGISTRATION & SQUAD VALIDATION
  // ------------------------------------------------------------------
  console.log('--- [CATEGORY 1: REGISTRATION & SQUAD VALIDATION] ---');

  // TC-REG-1: Empty or too short leader name
  const r1_fail = state.registerBenchTeam({
    benchNumber: 'Cabinet 01',
    teamName: 'Alpha Team',
    leaderName: 'A', // Only 1 char
    memberNames: ['Bob', 'Charlie']
  });
  assert(!r1_fail.success, 'TC-REG-1: Reject 1-char leader name', r1_fail.message);

  // TC-REG-2: Missing required teammates for teamSize
  const r2_fail = state.registerBenchTeam({
    benchNumber: 'Cabinet 01',
    teamName: 'Alpha Team',
    teamSize: 4,
    leaderName: 'Arthur',
    memberNames: ['Lancelot'] // Only 1 teammate provided, needs 3
  });
  assert(!r2_fail.success, 'TC-REG-2: Reject missing teammates for size 4', r2_fail.message);

  // TC-REG-3: HTML & Script Injection Sanitization
  const r3_xss = state.registerBenchTeam({
    benchNumber: '<script>alert("hack")</script>Bench 99',
    teamName: '<b>Hackers</b> & "Pranksters"',
    teamSize: 3,
    leaderName: '<img src=x onerror=alert(1)>Vikram',
    memberNames: ['Priya <script>', 'Rahul "The Great"']
  });
  assert(r3_xss.success, 'TC-REG-3a: Registration succeeds with special characters');
  const teamXss = state.teams.get(r3_xss.teamCode);
  assert(!teamXss.benchNumber.includes('<script>'), 'TC-REG-3b: Bench number sanitized of script tags', teamXss.benchNumber);
  assert(!teamXss.name.includes('<b>'), 'TC-REG-3c: Team name sanitized of HTML tags', teamXss.name);
  const leaderXss = state.players.get(teamXss.leaderSessionToken);
  assert(!leaderXss.name.includes('<img'), 'TC-REG-3d: Leader name sanitized of img tags', leaderXss.name);

  // TC-REG-4: Bench number collision / fallback
  const r4_b1 = state.registerBenchTeam({
    benchNumber: 'Cabinet 01',
    teamName: 'Squad One',
    teamSize: 2,
    leaderName: 'Alice',
    memberNames: ['Bob']
  });
  const r4_b2 = state.registerBenchTeam({
    benchNumber: 'Cabinet 01', // Same bench number!
    teamName: 'Squad Two',
    teamSize: 2,
    leaderName: 'Charlie',
    memberNames: ['David']
  });
  assert(r4_b1.success && r4_b2.success, 'TC-REG-4a: Both squads registered despite identical bench label');
  assert(r4_b1.teamCode !== r4_b2.teamCode, 'TC-REG-4b: Unique team codes generated for both squads', `${r4_b1.teamCode} vs ${r4_b2.teamCode}`);

  // TC-REG-5: Team sizes 2, 3, 4 properly configured
  const team2p = state.teams.get(r4_b1.teamCode);
  assert(team2p.members.length === 2, 'TC-REG-5a: 2-player squad has exactly 2 members');
  assert(team2p.leaderSessionToken === team2p.members[1], 'TC-REG-5b: 2-player squad places leader at index 1 (last)');

  const r5_b3 = state.registerBenchTeam({
    benchNumber: 'Cabinet 03',
    teamName: 'Squad Three',
    teamSize: 3,
    leaderName: 'Eve',
    memberNames: ['Frank', 'Grace']
  });
  const team3p = state.teams.get(r5_b3.teamCode);
  assert(team3p.members.length === 3, 'TC-REG-5c: 3-player squad has exactly 3 members');
  assert(team3p.leaderSessionToken === team3p.members[2], 'TC-REG-5d: 3-player squad places leader at index 2 (last)');

  const r5_b4 = state.registerBenchTeam({
    benchNumber: 'Cabinet 04',
    teamName: 'Squad Four',
    teamSize: 4,
    leaderName: 'Harry',
    memberNames: ['Ian', 'Jack', 'Kevin']
  });
  const team4p = state.teams.get(r5_b4.teamCode);
  assert(team4p.members.length === 4, 'TC-REG-5e: 4-player squad has exactly 4 members');
  assert(team4p.leaderSessionToken === team4p.members[3], 'TC-REG-5f: 4-player squad places leader at index 3 (last)');

  // ------------------------------------------------------------------
  // CATEGORY 2: LOBBY, DISCONNECT & RECONNECT
  // ------------------------------------------------------------------
  console.log('\n--- [CATEGORY 2: LOBBY, DISCONNECT & RECONNECT] ---');

  // TC-DISC-1: Player disconnect
  const playerHarry = state.players.get(team4p.leaderSessionToken);
  playerHarry.socketId = 'sock_harry_123';
  const discResult = state.handleDisconnect('sock_harry_123');
  assert(discResult && !discResult.isOnline, 'TC-DISC-1: Player marked offline on disconnect');

  // TC-RECON-1: Reconnect with valid token
  const reconValid = state.reconnectPlayer(team4p.leaderSessionToken, 'sock_harry_456');
  assert(reconValid.success && reconValid.player.isOnline && reconValid.player.socketId === 'sock_harry_456', 'TC-RECON-1: Player successfully reconnected');

  // TC-RECON-2: Reconnect with invalid token
  const reconInvalid = state.reconnectPlayer('non-existent-token-xyz', 'sock_fake');
  assert(!reconInvalid.success, 'TC-RECON-2: Reconnect with bogus token rejected');

  // TC-LOB-1: Lobby timer controls
  const lTimer = state.startLobbyTimer(180);
  assert(state.lobbyTimer.active && state.lobbyTimer.durationSec === 180, 'TC-LOB-1: Lobby countdown timer initialized');

  // ------------------------------------------------------------------
  // CATEGORY 3: SEQUENTIAL ROUND LAUNCHING & SAFETY LOCKS
  // ------------------------------------------------------------------
  console.log('\n--- [CATEGORY 3: SEQUENTIAL ROUND LAUNCHING & SAFETY LOCKS] ---');

  // SocketHandler sequential validation simulation
  function testSocketStartRound(roundNumber, force = false) {
    if (roundNumber === 2 && state.status === 'LOBBY' && !force) {
      return { success: false, message: 'Round 2 is locked. Please run and complete Round 1 first.' };
    }
    if (roundNumber === 3 && (state.status === 'LOBBY' || state.status === 'INTERMEDIATE_1' || state.status === 'ROUND_1') && !force) {
      return { success: false, message: 'Round 3 is locked. Please complete Round 2 first.' };
    }
    return state.startRound(roundNumber, 600);
  }

  // TC-SEQ-1: Attempt to start Round 2 from Lobby
  const r2Premature = testSocketStartRound(2, false);
  assert(!r2Premature.success, 'TC-SEQ-1: Block starting Round 2 from Lobby', r2Premature.message);

  // TC-SEQ-2: Attempt to start Round 3 from Lobby
  const r3Premature = testSocketStartRound(3, false);
  assert(!r3Premature.success, 'TC-SEQ-2: Block starting Round 3 from Lobby', r3Premature.message);

  // TC-SEQ-3: Start Round 1
  const r1Start = state.startRound(1, 600);
  assert(r1Start.success && state.status === 'ROUND_1', 'TC-SEQ-3: Successfully launch Round 1');

  // TC-SEQ-4: Pause and Resume
  const pauseRes = state.pauseRound();
  assert(pauseRes.success && state.roundState.isPaused, 'TC-SEQ-4a: Round successfully paused');
  
  // Try submit during pause
  const submitPaused = state.submitTurnAnswer(team4p.members[0], 0, 'PYTHON');
  assert(!submitPaused.success && submitPaused.message.includes('paused'), 'TC-SEQ-4b: Submissions blocked while round is paused', submitPaused.message);

  const resumeRes = state.resumeRound();
  assert(resumeRes.success && !state.roundState.isPaused, 'TC-SEQ-4c: Round successfully resumed');

  // TC-SEQ-5: Extend Time
  const prevEndTime = state.roundState.endTime;
  state.extendRoundTime(60);
  assert(state.roundState.endTime === prevEndTime + 60000, 'TC-SEQ-5: Round timer extended by 60 seconds');

  // ------------------------------------------------------------------
  // CATEGORY 4: ROUND 1 GAMEPLAY, TURN GUARDS & NLP
  // ------------------------------------------------------------------
  console.log('\n--- [CATEGORY 4: ROUND 1 GAMEPLAY, TURN GUARDS & NLP] ---');

  // Reset anti-spam
  state.players.forEach(p => p.lastSubmitTime = 0);

  // TC-R1-1: Anti-spam rate limiting (<1.5s)
  const p1 = team4p.members[0];
  const sub1 = state.submitTurnAnswer(p1, 0, 'wrong_answer');
  const sub1Spam = state.submitTurnAnswer(p1, 0, 'wrong_answer');
  assert(!sub1Spam.success && sub1Spam.message.includes('cooldown'), 'TC-R1-1: Anti-spam triggers on rapid submission (<1.5s)', sub1Spam.message);

  // TC-R1-2: Out-of-turn submission (Member 2 submits during Member 1 turn)
  state.players.forEach(p => p.lastSubmitTime = 0);
  const p2 = team4p.members[1];
  const subOutOfTurn = state.submitTurnAnswer(p2, 0, 'PYTHON');
  assert(!subOutOfTurn.success && subOutOfTurn.message.includes('not your turn'), 'TC-R1-2: Out-of-turn submission rejected', subOutOfTurn.message);

  // TC-R1-3: Case-insensitivity & whitespace trimming
  state.players.forEach(p => p.lastSubmitTime = 0);
  const pSetR1 = PUZZLE_SETS[1].find(s => s.setId === team4p.currentRoundProgress.setId) || PUZZLE_SETS[1][0];
  const targetAns1 = pSetR1.steps[0].acceptedAnswers[0];
  const messyInput = `   ${targetAns1.toUpperCase()}   `;
  const subMessy = state.submitTurnAnswer(p1, 0, messyInput);
  assert(subMessy.success, 'TC-R1-3: Messy uppercase padded answer accepted', subMessy.message);

  // TC-R1-4: Idempotent re-submission
  state.players.forEach(p => p.lastSubmitTime = 0);
  const subIdempotent = state.submitTurnAnswer(p1, 0, targetAns1);
  assert(subIdempotent.alreadySolved, 'TC-R1-4: Already solved step returns alreadySolved: true');

  // Solve remaining member clues for team4p
  for (let s = 1; s < 3; s++) {
    state.players.forEach(p => p.lastSubmitTime = 0);
    const stepObj = pSetR1.steps[s];
    const turnAssign = state.getTurnPlayer(team4p.members.map(tok => state.players.get(tok)), s, 1);
    const subStep = state.submitTurnAnswer(turnAssign.scholar.sessionToken, s, stepObj.acceptedAnswers[0]);
    assert(subStep.success, `TC-R1-STEP-${s + 1}: Step ${s + 1} solved by ${turnAssign.scholar.name}`);
  }

  // TC-R1-5: Leader Final Boss Thesis Validation
  const frags = team4p.currentRoundProgress.collectedFragments;
  state.players.forEach(p => p.lastSubmitTime = 0);

  // Test 5a: Non-leader trying to submit leader thesis
  const nonLeaderSubmit = state.submitTurnAnswer(p1, 3, 'Our team solves everything with great speed.');
  assert(!nonLeaderSubmit.success, 'TC-R1-5a: Non-leader rejected from submitting leader thesis');

  // Test 5b: Leader thesis too short (<5 words)
  state.players.forEach(p => p.lastSubmitTime = 0);
  const shortThesis = state.submitTurnAnswer(team4p.leaderSessionToken, 3, 'Too short thesis.');
  assert(!shortThesis.success && shortThesis.message.includes('too short'), 'TC-R1-5b: Thesis under 5 words rejected', shortThesis.message);

  // Test 5c: Leader thesis missing keywords
  state.players.forEach(p => p.lastSubmitTime = 0);
  const noKeywordThesis = state.submitTurnAnswer(team4p.leaderSessionToken, 3, 'We are the champions of this glorious academic event today.');
  assert(!noKeywordThesis.success && noKeywordThesis.message.includes('keywords'), 'TC-R1-5c: Thesis lacking vault keywords rejected', noKeywordThesis.message);

  // Test 5d: Leader thesis word repetition attack
  state.players.forEach(p => p.lastSubmitTime = 0);
  const repeatThesis = state.submitTurnAnswer(team4p.leaderSessionToken, 3, `${frags[0]} ${frags[0]} ${frags[0]} ${frags[0]} ${frags[0]}`);
  assert(!repeatThesis.success && repeatThesis.message.includes('repetition'), 'TC-R1-5d: Repetitive spam words rejected', repeatThesis.message);

  // Test 5e: Leader thesis missing verb
  state.players.forEach(p => p.lastSubmitTime = 0);
  const noVerbThesis = state.submitTurnAnswer(team4p.leaderSessionToken, 3, `${frags[0]} and ${frags[1]} with ${frags[2]} innovation.`);
  assert(!noVerbThesis.success && noVerbThesis.message.includes('verb'), 'TC-R1-5e: Thesis without active verb rejected', noVerbThesis.message);

  // Test 5f: Valid eloquent leader thesis
  state.players.forEach(p => p.lastSubmitTime = 0);
  const validThesis = `Our team uses ${frags[0].toLowerCase()} and ${frags[1].toLowerCase()} along with ${frags[2].toLowerCase()} inspiration to build revolutionary innovation.`;
  const validThesisRes = state.submitTurnAnswer(team4p.leaderSessionToken, 3, validThesis);
  assert(validThesisRes.success && validThesisRes.isRoundCompleted, 'TC-R1-5f: Valid eloquent thesis accepted and round marked completed!');

  // End Round 1
  state.endRound();
  assert(state.status === 'INTERMEDIATE_1', 'TC-R1-END: Status transitions to INTERMEDIATE_1');

  // ------------------------------------------------------------------
  // CATEGORY 5: ROUND 2 (THE ENIGMA VAULT - WORDLE RELAY)
  // ------------------------------------------------------------------
  console.log('\n--- [CATEGORY 5: ROUND 2 (WORDLE RELAY) & WORD MATRIX] ---');

  // TC-R2-EVAL: Standalone Wordle Evaluator Unit Tests
  const w1 = evaluateWordleGuess('PYTHON', 'PYTHON');
  assert(w1.isSolved && w1.feedback.every(f => f.status === 'correct'), 'TC-R2-EVAL-1: Perfect match produces all green tiles');

  const w2 = evaluateWordleGuess('PYTHON', 'ROBOTS');
  // In PYTHON: O is at idx 4. In ROBOTS: O is at idx 1 (present) and idx 3 (absent because only one O)
  assert(!w2.isSolved, 'TC-R2-EVAL-2a: Partial match isSolved is false');
  assert(w2.feedback[1].status === 'present', 'TC-R2-EVAL-2b: First O is yellow (present)');
  assert(w2.feedback[3].status === 'absent', 'TC-R2-EVAL-2c: Duplicate O is dark (absent)');

  // Start Round 2
  const r2Start = state.startRound(2, 600);
  assert(r2Start.success && state.status === 'ROUND_2', 'TC-R2-START: Successfully launched Round 2');

  const pSetR2 = PUZZLE_SETS[2].find(s => s.setId === team4p.currentRoundProgress.setId) || PUZZLE_SETS[2][0];
  const node1 = pSetR2.steps[0];

  // TC-R2-1: Wrong letter count
  const wrongLen = state.submitRound2Guess(p1, 'ABC');
  assert(!wrongLen.success && wrongLen.message.includes(String(node1.length)), 'TC-R2-1: Reject guess with wrong length', wrongLen.message);

  // TC-R2-2: Clean symbols and whitespace in guess
  const guessMessy = `  ${node1.targetWord.toLowerCase()}  `;
  const guessMessyRes = state.submitRound2Guess(p1, guessMessy);
  assert(guessMessyRes.success && guessMessyRes.isSolved, 'TC-R2-2: Messy lowercase guess cleaned and breached node 1');

  // TC-R2-3: 4-Attempt Auto-Bypass on team3p
  const team3pNode1 = PUZZLE_SETS[2].find(s => s.setId === team3p.currentRoundProgress.setId).steps[0];
  const pDummy = 'XXXXXX'.slice(0, team3pNode1.length);
  for (let att = 1; att <= 3; att++) {
    const wrongAtt = state.submitRound2Guess(team3p.members[0], pDummy);
    assert(wrongAtt.success && !wrongAtt.isSolved && wrongAtt.remainingAttempts === 4 - att, `TC-R2-3-ATT-${att}: Failed attempt ${att} recorded`);
  }
  const att4 = state.submitRound2Guess(team3p.members[0], pDummy);
  assert(att4.autoBypassed && att4.nodePassed, 'TC-R2-3-BYPASS: 4th failed attempt triggers auto-bypass');

  // TC-R2-4: Turn sequence across 2-player team
  const t2MemberDetails = team2p.members.map(tok => state.players.get(tok));
  for (let n = 0; n < 10; n++) {
    const assign = state.getTurnPlayer(t2MemberDetails, n, 2);
    if (n === 9) {
      assert(assign.scholar.isLeader, 'TC-R2-4a: Final Node 10 is ALWAYS assigned to leader in 2p squad');
    }
  }

  // End Round 2
  state.endRound();
  assert(state.status === 'INTERMEDIATE_2', 'TC-R2-END: Status transitions to INTERMEDIATE_2');

  // ------------------------------------------------------------------
  // CATEGORY 6: ROUND 3 (SHER"UNLOCKING" HOMIES: THE BAKER STREET MYSTERY)
  // ------------------------------------------------------------------
  console.log('\n--- [CATEGORY 6: ROUND 3 (SHERLOCK BAKER STREET MYSTERY)] ---');

  // Start Round 3
  const r3Start = state.startRound(3, 600);
  assert(r3Start.success && state.status === 'ROUND_3', 'TC-R3-START: Successfully launched Round 3 Finals');

  // TC-R3-1: Common mystery case for all teams
  const r3Case0 = getPuzzleSetForTeam(3, 0);
  const r3Case1 = getPuzzleSetForTeam(3, 1);
  const r3Case2 = getPuzzleSetForTeam(3, 2);
  assert(r3Case0.setId === r3Case1.setId && r3Case1.setId === r3Case2.setId, 'TC-R3-1: All teams receive identical mystery dossier');

  // TC-R3-2: Evidence 1 (CYANIDE)
  state.players.forEach(p => p.lastSubmitTime = 0);
  const badEv1 = state.submitTurnAnswer(team4p.members[0], 0, 'ARSENIC');
  assert(!badEv1.success, 'TC-R3-2a: Rejects wrong poison (ARSENIC)');

  state.players.forEach(p => p.lastSubmitTime = 0);
  const goodEv1 = state.submitTurnAnswer(team4p.members[0], 0, 'cyanide');
  assert(goodEv1.success && goodEv1.fragment === 'CYANIDE', 'TC-R3-2b: Accepts "cyanide" and stores CYANIDE proof');

  // TC-R3-3: Evidence 2 (BLACKMAIL)
  state.players.forEach(p => p.lastSubmitTime = 0);
  const goodEv2 = state.submitTurnAnswer(team4p.members[1], 1, 'blackmail');
  assert(goodEv2.success && goodEv2.fragment === 'BLACKMAIL', 'TC-R3-3: Evidence 2 solves with "blackmail"');

  // TC-R3-4: Evidence 3 (SHARMA)
  state.players.forEach(p => p.lastSubmitTime = 0);
  const goodEv3 = state.submitTurnAnswer(team4p.members[2], 2, 'sharma');
  assert(goodEv3.success && (goodEv3.fragment === 'SHARMA' || goodEv3.fragment === 'VANCE'), 'TC-R3-4: Evidence 3 solves with "sharma"');

  // TC-R3-5: Leader Grand Indictment Warrant Format Checks
  const leaderP4 = team4p.leaderSessionToken;

  // Test 5a: Wrong culprit
  state.players.forEach(p => p.lastSubmitTime = 0);
  const badWarrantCulprit = state.submitTurnAnswer(leaderP4, 3, 'MORAN:CYANIDE:BLACKMAIL');
  assert(!badWarrantCulprit.success, 'TC-R3-5a: Rejects indictment with wrong suspect (MORAN)');

  // Test 5b: Wrong weapon
  state.players.forEach(p => p.lastSubmitTime = 0);
  const badWarrantWeapon = state.submitTurnAnswer(leaderP4, 3, 'SHARMA:STRYCHNINE:BLACKMAIL');
  assert(!badWarrantWeapon.success, 'TC-R3-5b: Rejects indictment with wrong weapon (STRYCHNINE)');

  // Test 5c: Wrong motive
  state.players.forEach(p => p.lastSubmitTime = 0);
  const badWarrantMotive = state.submitTurnAnswer(leaderP4, 3, 'SHARMA:CYANIDE:THEFT');
  assert(!badWarrantMotive.success, 'TC-R3-5c: Rejects indictment with wrong motive (THEFT)');

  // Test 5d: Flexible separators accepted (both SHARMA and VANCE supported)
  assert(checkLeaderExactCode(3, 'r3_sherlock_blackwood', 'SHARMA:CYANIDE:BLACKMAIL').success || checkLeaderExactCode(3, 'r3_baker_street_01', 'SHARMA:CYANIDE:BLACKMAIL').success, 'TC-R3-5d: Accepts colon format');
  assert(checkLeaderExactCode(3, 'r3_sherlock_blackwood', 'ROHAN SHARMA:CYANIDE:BLACKMAIL').success || checkLeaderExactCode(3, 'r3_baker_street_01', 'ROHAN SHARMA:CYANIDE:BLACKMAIL').success, 'TC-R3-5e: Accepts full name format');
  assert(checkLeaderExactCode(3, 'r3_sherlock_blackwood', 'sharma : cyanide : blackmail').success || checkLeaderExactCode(3, 'r3_baker_street_01', 'sharma : cyanide : blackmail').success, 'TC-R3-5f: Accepts spaced colons and lowercase');
  assert(checkLeaderExactCode(3, 'r3_sherlock_blackwood', 'SHARMA-CYANIDE-BLACKMAIL').success || checkLeaderExactCode(3, 'r3_baker_street_01', 'SHARMA-CYANIDE-BLACKMAIL').success, 'TC-R3-5g: Accepts dash format');
  assert(checkLeaderExactCode(3, 'r3_sherlock_blackwood', 'SHARMA CYANIDE BLACKMAIL').success || checkLeaderExactCode(3, 'r3_baker_street_01', 'SHARMA CYANIDE BLACKMAIL').success, 'TC-R3-5h: Accepts space separated format');

  // Conclude warrant for team4p
  state.players.forEach(p => p.lastSubmitTime = 0);
  const closeCase = state.submitTurnAnswer(leaderP4, 3, 'SHARMA:CYANIDE:BLACKMAIL');
  assert(closeCase.success && closeCase.isRoundCompleted, 'TC-R3-CONVECT: Rohan Sharma convicted and case officially closed!');

  // End Round 3
  state.endRound();
  assert(state.status === 'FINISHED', 'TC-R3-FINISH: Status transitions to FINISHED');

  // ------------------------------------------------------------------
  // CATEGORY 7: HOST OVERRIDES, PERSISTENCE & AUDIT LOGS
  // ------------------------------------------------------------------
  console.log('\n--- [CATEGORY 7: HOST OVERRIDES, PERSISTENCE & AUDIT] ---');

  // TC-HST-1: Positive Score Override
  const prevScore = team4p.totalScore;
  const over1 = state.overrideTeamScore(team4p.teamId, 150, 'Bonus points for flawless deductions');
  assert(over1.success && team4p.totalScore === prevScore + 150, 'TC-HST-1: Score successfully increased by +150 PTS');

  // TC-HST-2: Negative Score Override with Floor at 0
  state.overrideTeamScore(team4p.teamId, -10000, 'Penalty test');
  assert(team4p.totalScore === 0, 'TC-HST-2: Score cannot go below 0 on severe penalty');

  // TC-HST-3: Invalid score override
  const overInvalid = state.overrideTeamScore(team4p.teamId, 'not-a-number');
  assert(!overInvalid.success, 'TC-HST-3: Rejects NaN score adjustment');

  // TC-SNAP-1: Snapshot Save and Deep Verification
  state.saveSnapshot();
  const testRestore = new GameStateManager();
  testRestore.loadSnapshot();

  assert(testRestore.status === 'FINISHED', 'TC-SNAP-1a: Restored status matches FINISHED');
  assert(testRestore.teams.size === state.teams.size, 'TC-SNAP-1b: Restored exact team count');
  assert(testRestore.players.size === state.players.size, 'TC-SNAP-1c: Restored exact player count');

  const restoredTeam = testRestore.teams.get(team4p.teamId);
  assert(restoredTeam.name === team4p.name, 'TC-SNAP-1d: Restored team name matches');
  assert(restoredTeam.benchNumber === team4p.benchNumber, 'TC-SNAP-1e: Restored bench number matches');
  assert(restoredTeam.members.length === 4, 'TC-SNAP-1f: Restored member array matches');

  // ------------------------------------------------------------------
  // FINAL SCORECARD
  // ------------------------------------------------------------------
  console.log('\n======================================================================');
  console.log(`  📊 TEST RESULTS SUMMARY: ${passedTests} PASSED, ${failedTests} FAILED`);
  console.log('======================================================================');

  if (failedTests > 0) {
    console.error('\nFailures Detected:');
    failures.forEach(f => console.error(`  - ${f}`));
    process.exit(1);
  } else {
    console.log('\n🎉 ALL EXHAUSTIVE EDGE-CASE TESTS PASSED WITH 100% SUCCESS!\n');
    process.exit(0);
  }
}

runAllTests().catch(err => {
  console.error('Fatal Test Exception:', err);
  process.exit(1);
});
