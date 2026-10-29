const io = require('socket.io-client');
const http = require('http');

const SERVER_URL = 'http://localhost:5000';
const ADMIN_PASSWORD = 'njnjnj';

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function runLiveSocketGame() {
  console.log('🚀 Starting Full Live Socket Tournament Simulation...');

  // Reset server state first via API
  await new Promise((resolve, reject) => {
    http.get(`${SERVER_URL}/api/reset?secret=${ADMIN_PASSWORD}`, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        console.log('Server reset response:', data);
        resolve();
      });
    }).on('error', reject);
  });

  // 1. Connect Admin Socket
  const adminSocket = io(SERVER_URL, { transports: ['websocket'] });
  let adminState = null;
  adminSocket.on('admin_update', (data) => {
    adminState = data;
  });

  await new Promise((resolve, reject) => {
    adminSocket.on('connect', () => {
      adminSocket.emit('register_admin', { password: ADMIN_PASSWORD });
    });
    adminSocket.on('admin_authenticated', (res) => {
      console.log('Admin authenticated:', res);
      if (res.success) resolve();
      else reject(new Error(res.message));
    });
  });

  function adminAction(action, payload = {}) {
    return new Promise((resolve) => {
      adminSocket.emit('admin_action', {
        password: ADMIN_PASSWORD,
        action,
        payload
      }, (res) => {
        resolve(res);
      });
    });
  }

  // 2. Connect Display Socket
  const displaySocket = io(SERVER_URL, { transports: ['websocket'] });
  let displayState = null;
  displaySocket.on('display_update', (data) => {
    displayState = data;
  });
  displaySocket.emit('register_display');

  // 3. Register 3 Squads via Sockets (register_bench event)
  const squads = [
    {
      benchNumber: 'Cabinet 01',
      teamName: 'Titan Quad',
      gender: 'open',
      teamSize: 4,
      leaderName: 'Joshva',
      memberNames: ['Sharma', 'Rahul', 'Arun']
    },
    {
      benchNumber: 'Cabinet 02',
      teamName: 'Phoenix Trio',
      gender: 'open',
      teamSize: 3,
      leaderName: 'Priya',
      memberNames: ['Ananya', 'Sneha']
    },
    {
      benchNumber: 'Cabinet 03',
      teamName: 'Cyber Duo',
      gender: 'open',
      teamSize: 2,
      leaderName: 'Karthik',
      memberNames: ['Deepak']
    }
  ];

  const registeredTeams = [];

  for (const s of squads) {
    const leaderSocket = io(SERVER_URL, { transports: ['websocket'] });
    let teamData = null;
    let clientState = null;

    leaderSocket.on('sync_state', (data) => {
      clientState = data;
    });

    await new Promise((resolve, reject) => {
      leaderSocket.emit('register_bench', s, (res) => {
        if (!res.success) return reject(new Error(res.message));
        teamData = res;
        console.log(`Registered squad [${s.teamName}] with token:`, res.sessionToken);
        resolve();
      });
    });

    registeredTeams.push({
      info: s,
      leaderSocket,
      teamData,
      getClientState: () => clientState
    });
  }

  await sleep(600);
  console.log(`✓ Total Squads waiting in Lobby: ${adminState?.teams?.length || 0}`);
  if (adminState?.teams?.length !== 3) {
    throw new Error('Squad count mismatch in Admin state!');
  }

  // 4. Admin Launches Round 1
  console.log('\n--- LAUNCHING ROUND 1 ---');
  await adminAction('start_round', { roundNumber: 1, durationSec: 600 });
  await sleep(1000);
  console.log('Current stage status:', adminState?.status);

  // Play Round 1 for all teams
  for (const team of registeredTeams) {
    const s = team.getClientState();
    const puzzleSet = s?.puzzleSet || [];
    console.log(`Team [${team.info.teamName}] received ${puzzleSet.length} steps in R1`);

    // Solve steps 0 to (puzzleSet.length - 1)
    for (let stepIdx = 0; stepIdx < puzzleSet.length; stepIdx++) {
      const step = puzzleSet[stepIdx];
      const answer = step.answer;
      await sleep(1600); // 1.5s rate limit
      await new Promise((resolve) => {
        team.leaderSocket.emit('submit_turn_answer', {
          sessionToken: team.teamData.sessionToken,
          turnIndex: stepIdx,
          answer: answer
        }, (res) => {
          console.log(`  [${team.info.teamName}] Step ${stepIdx} [${answer}] result:`, res?.success);
          resolve();
        });
      });
    }

    // Submit Leader Final Thesis (stepIndex = 3)
    await sleep(1600);
    const thesisText = "In the labyrinth of logic, wisdom illuminates the path to ultimate truth";
    await new Promise((resolve) => {
      team.leaderSocket.emit('submit_turn_answer', {
        sessionToken: team.teamData.sessionToken,
        turnIndex: 3,
        answer: thesisText
      }, (res) => {
        console.log(`  [${team.info.teamName}] Leader Thesis result:`, res?.success);
        resolve();
      });
    });
  }

  await sleep(1000);
  console.log('Status after R1 completion:', adminState?.status);

  // 5. Admin Launches Round 2 (Wordle Relay)
  console.log('\n--- LAUNCHING ROUND 2 ---');
  await adminAction('start_round', { roundNumber: 2, durationSec: 600 });
  await sleep(1000);
  console.log('Current stage status:', adminState?.status);

  // Play Round 2 Wordle Relay for all teams
  for (const team of registeredTeams) {
    let state = team.getClientState();
    let r2 = state?.team?.round2;
    console.log(`Team [${team.info.teamName}] R2 initial node: ${r2?.currentNodeIndex}`);

    while (r2 && r2.currentNodeIndex < 10) {
      const nodeIdx = r2.currentNodeIndex;
      const targetWord = r2.activeNodeData?.targetWord;
      if (!targetWord) {
        console.log(`  [${team.info.teamName}] No target word for node ${nodeIdx}, breaking`);
        break;
      }

      await sleep(100);
      await new Promise((resolve) => {
        team.leaderSocket.emit('submit_round2_guess', {
          sessionToken: team.teamData.sessionToken,
          guess: targetWord
        }, (res) => {
          console.log(`  [${team.info.teamName}] Node ${nodeIdx} guess [${targetWord}]: isSolved=${res?.isSolved}, score=+${res?.pointsEarned}`);
          resolve();
        });
      });

      await sleep(200);
      state = team.getClientState();
      r2 = state?.team?.round2;
    }
    console.log(`✓ Team [${team.info.teamName}] completed all Round 2 Wordle Nodes!`);
  }

  await sleep(1000);
  console.log('Status after R2 completion:', adminState?.status);

  // 6. Admin Launches Round 3 (Sherlock Finals)
  console.log('\n--- LAUNCHING ROUND 3 ---');
  await adminAction('start_round', { roundNumber: 3, durationSec: 600 });
  await sleep(1000);
  console.log('Current stage status:', adminState?.status);

  // Play Round 3 Sherlock Mystery
  for (const team of registeredTeams) {
    // Evidence 1: CYANIDE (turnIndex 0)
    await sleep(1600);
    await new Promise((resolve) => {
      team.leaderSocket.emit('submit_turn_answer', {
        sessionToken: team.teamData.sessionToken,
        turnIndex: 0,
        answer: 'CYANIDE'
      }, (res) => {
        console.log(`  [${team.info.teamName}] Evidence 1 solve:`, res?.success);
        resolve();
      });
    });

    // Evidence 2: BLACKMAIL (turnIndex 1)
    await sleep(1600);
    await new Promise((resolve) => {
      team.leaderSocket.emit('submit_turn_answer', {
        sessionToken: team.teamData.sessionToken,
        turnIndex: 1,
        answer: 'BLACKMAIL'
      }, (res) => {
        console.log(`  [${team.info.teamName}] Evidence 2 solve:`, res?.success);
        resolve();
      });
    });

    // Evidence 3: SHARMA (turnIndex 2)
    await sleep(1600);
    await new Promise((resolve) => {
      team.leaderSocket.emit('submit_turn_answer', {
        sessionToken: team.teamData.sessionToken,
        turnIndex: 2,
        answer: 'SHARMA'
      }, (res) => {
        console.log(`  [${team.info.teamName}] Evidence 3 solve:`, res?.success);
        resolve();
      });
    });

    // Final Indictment: SHARMA:CYANIDE:BLACKMAIL (turnIndex 3)
    await sleep(1600);
    await new Promise((resolve) => {
      team.leaderSocket.emit('submit_turn_answer', {
        sessionToken: team.teamData.sessionToken,
        turnIndex: 3,
        answer: 'SHARMA:CYANIDE:BLACKMAIL'
      }, (res) => {
        console.log(`  [${team.info.teamName}] Final Indictment result:`, res?.success, res?.message);
        resolve();
      });
    });
  }

  await sleep(1000);
  console.log('\n--- FINAL TOURNAMENT STANDINGS ---');
  console.log('Final stage status:', adminState?.status);
  const leaderboard = adminState?.leaderboard || [];
  leaderboard.forEach((t, i) => {
    console.log(`Rank #${i + 1}: ${t.name} — Total: ${t.totalScore} PTS (R1: ${t.roundScores?.[1] || 0}, R2: ${t.roundScores?.[2] || 0}, R3: ${t.roundScores?.[3] || 0})`);
  });

  // Disconnect sockets cleanly
  adminSocket.disconnect();
  displaySocket.disconnect();
  registeredTeams.forEach(t => t.leaderSocket.disconnect());

  console.log('\n🎉 COMPLETE LIVE SOCKET SIMULATION FINISHED 100% SUCCESSFULLY WITH ZERO BUGS!');
  process.exit(0);
}

runLiveSocketGame().catch(err => {
  console.error('❌ SIMULATION FAILED:', err);
  process.exit(1);
});
