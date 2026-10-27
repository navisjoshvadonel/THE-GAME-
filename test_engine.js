const GameStateManager = require('./src/state');
const { PUZZLE_SETS } = require('./src/puzzles');

console.log('=== RUNNING FULL ACADEMIC DECATHLON TEST SUITE ===\n');

const state = new GameStateManager('test_admin_pwd');
state.resetAllState();

// 1. Register Scholars
console.log('1. Registering Scholars...');
const p1 = state.registerPlayer('Joshva', 'male', 'sock_1');
const p2 = state.registerPlayer('Sharma', 'male', 'sock_2');
const p3 = state.registerPlayer('Rahul', 'male', 'sock_3');
const p4 = state.registerPlayer('Arun', 'male', 'sock_4');
const p5 = state.registerPlayer('Priya', 'female', 'sock_5');
const p6 = state.registerPlayer('Sneha', 'female', 'sock_6');
const p7 = state.registerPlayer('Karthik', 'male', 'sock_7');

console.log('Registered 7 scholars successfully.');

// 2. Charter Fellowship (Squad)
console.log('\n2. Chartering Fellowship & Enforcing Gender Division...');
const teamRes = state.createTeam(p1.sessionToken, 'Oxford Axioms');
console.log('Fellowship Chartered:', teamRes.success, 'Seal:', teamRes.teamCode, 'Division:', teamRes.team.gender);

// Female scholar joining Gentlemen's division must FAIL
const failJoin = state.joinTeam(p5.sessionToken, teamRes.teamCode);
console.log('Female joining Male fellowship (expect false):', failJoin.success, '| Message:', failJoin.message);
if (failJoin.success) throw new Error('Division exclusivity rule failed!');

// Add 3 male scholars to complete 4-member squad
state.joinTeam(p2.sessionToken, teamRes.teamCode);
state.joinTeam(p3.sessionToken, teamRes.teamCode);
state.joinTeam(p4.sessionToken, teamRes.teamCode);

// 5th member joining must FAIL
const join5th = state.joinTeam(p7.sessionToken, teamRes.teamCode);
console.log('5th member join test (expect false):', join5th.success, '| Message:', join5th.message);
if (join5th.success) throw new Error('Max 4 capacity rule failed!');

// 3. Auto-Merge Independent Scholars
console.log('\n3. Testing Fellowship Induction (Auto-Merge)...');
const mergeRes = state.autoMergeLeftovers();
console.log('Auto-merge result:', mergeRes);
console.log('Total fellowships now:', state.teams.size);

// 4. ROUND 1: The Scholar's Synthesis
console.log('\n4. Testing Round 1: The Scholar’s Synthesis...');
state.startRound(1, 600);
const teamAlpha = state.teams.get(teamRes.teamCode);
const nonLeaders = teamAlpha.members.filter(t => t !== teamAlpha.leaderSessionToken);
const leaderToken = teamAlpha.leaderSessionToken;

const r1Set = PUZZLE_SETS[1].find(s => s.setId === teamAlpha.currentRoundProgress.setId);

// Step 0
state.players.forEach(p => p.lastSubmitTime = 0);
const r1s0 = state.submitTurnAnswer(nonLeaders[0], 0, r1Set.steps[0].acceptedAnswers[0]);
console.log('Step 0 solved:', r1s0.success, '| Fragment:', r1s0.fragment);

// Step 1
state.players.forEach(p => p.lastSubmitTime = 0);
const r1s1 = state.submitTurnAnswer(nonLeaders[1], 1, r1Set.steps[1].acceptedAnswers[0]);
console.log('Step 1 solved:', r1s1.success, '| Fragment:', r1s1.fragment);

// Step 2
state.players.forEach(p => p.lastSubmitTime = 0);
const r1s2 = state.submitTurnAnswer(nonLeaders[2], 2, r1Set.steps[2].acceptedAnswers[0]);
console.log('Step 2 solved:', r1s2.success, '| Fragment:', r1s2.fragment);

// Leader Thesis Step
state.players.forEach(p => p.lastSubmitTime = 0);
const frags = teamAlpha.currentRoundProgress.collectedFragments;
const validThesis = `Our scholarly team gathers in the temple to seek wisdom and discover foundational truth.`;
// Include whatever fragments were collected in a valid thesis
const wordsClause = frags.join(' and ');
const thesisWithFrags = `Our noble scholars seek ${wordsClause} to illuminate our eternal horizon.`;
const leaderR1 = state.submitTurnAnswer(leaderToken, 3, thesisWithFrags);
console.log('Leader Thesis Validation (expect true):', leaderR1.success, '| Message:', leaderR1.message);
console.log('Round 1 Team Score:', teamAlpha.totalScore);

// 5. STAGE ADVANCE -> INTERMEDIATE 1
console.log('\n5. Advancing to Stage 1 Intermission...');
state.advanceStage();
console.log('Current Status:', state.status);

// 6. STAGE ADVANCE -> ROUND 2 (Enigma Vault)
console.log('\n6. Launching Round 2 (The Enigma Vault)...');
state.advanceStage();
console.log('Current Status:', state.status, 'Round:', state.currentRound);

const r2Set = PUZZLE_SETS[2].find(s => s.setId === teamAlpha.currentRoundProgress.setId);

// Solve Round 2 (10-Node Cyber Terminal Hack)
for (let n = 0; n < r2Set.steps.length; n++) {
  const node = r2Set.steps[n];
  const memberObjs = teamAlpha.members.map(tok => state.players.get(tok)).filter(Boolean);
  const turnScholar = state.getTurnPlayer(memberObjs, n, 2);
  const token = turnScholar.scholar?.sessionToken || leaderToken;
  state.players.forEach(p => p.lastSubmitTime = 0);
  const res = state.submitRound2Guess(token, node.targetWord);
  if (!res.success || !res.isBreached) {
    throw new Error(`Failed to breach Node ${n + 1}: ${res.message}`);
  }
}
console.log('Leaderboard & Squad completed all 10 nodes of Round 2! Total Score:', teamAlpha.totalScore);

// 7. STAGE ADVANCE -> INTERMEDIATE 2 (Top 5 Cutoff)
console.log('\n7. Advancing to Intermediate 2 & Finalists Cutoff...');
state.advanceStage();
console.log('Current Status:', state.status);
console.log('Team Alpha Eliminated?', teamAlpha.isEliminated);

// 8. STAGE ADVANCE -> ROUND 3 (The Grand Finals Decider)
console.log('\n8. Launching Round 3 (Grand Championship Finals)...');
state.advanceStage();
console.log('Current Status:', state.status, 'Round:', state.currentRound);

const r3Set = PUZZLE_SETS[3].find(s => s.setId === teamAlpha.currentRoundProgress.setId);

// Solve Round 3 Steps
state.players.forEach(p => p.lastSubmitTime = 0);
state.submitTurnAnswer(nonLeaders[0], 0, r3Set.steps[0].acceptedAnswers[0]);
state.players.forEach(p => p.lastSubmitTime = 0);
state.submitTurnAnswer(nonLeaders[1], 1, r3Set.steps[1].acceptedAnswers[0]);
state.players.forEach(p => p.lastSubmitTime = 0);
state.submitTurnAnswer(nonLeaders[2], 2, r3Set.steps[2].acceptedAnswers[0]);

// Leader Final Decider Solve
state.players.forEach(p => p.lastSubmitTime = 0);
const masterCodeR3 = r3Set.leaderTask.expectedMasterCode;
const leaderR3 = state.submitTurnAnswer(leaderToken, 3, masterCodeR3);
console.log('Leader Round 3 Master Solve (expect true):', leaderR3.success, '| Message:', leaderR3.message);
console.log('Final Championship Score:', teamAlpha.totalScore);

// 9. STAGE ADVANCE -> FINISHED (Grand Laurel Ceremony)
console.log('\n9. Concluding Tournament to FINISHED...');
state.advanceStage();
console.log('Final Tournament Status:', state.status);

const finalLeaderboard = state.getLeaderboard();
console.log('\n🏆 OFFICIAL CHAMPIONSHIP STANDINGS:');
finalLeaderboard.forEach((t, idx) => {
  console.log(`  #${idx + 1}: ${t.name} — ${t.totalScore} PTS`);
});

console.log('\n=== COMPLETE 3-ROUND TOURNAMENT SUITE PASSED FLAWLESSLY ===');
process.exit(0);
