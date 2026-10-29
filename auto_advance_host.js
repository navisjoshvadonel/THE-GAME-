const { io } = require('socket.io-client');

const socket = io('http://127.0.0.1:5000', { transports: ['websocket'] });
const ADMIN_PASSWORD = 'njnjnj';

socket.emit('register_admin', { password: ADMIN_PASSWORD });

let isAdvancing = false;

socket.on('admin_update', (adminState) => {
  if (!adminState || isAdvancing) return;

  const status = adminState.status;
  const teams = adminState.teams || [];

  // 1. Lobby -> Round 1 when at least 1 team is registered
  if (status === 'LOBBY' && teams.length >= 1) {
    console.log('[AutoHost] Team registered in lobby! Starting Round 1 in 3s...');
    isAdvancing = true;
    setTimeout(() => {
      socket.emit('admin_action', { action: 'start_round', password: ADMIN_PASSWORD, payload: { roundNumber: 1 } }, (res) => {
        console.log('[AutoHost] Round 1 started:', res?.success);
        isAdvancing = false;
      });
    }, 3000);
  }

  // 2. Intermission 1 -> Round 2
  if (status === 'INTERMEDIATE_1') {
    console.log('[AutoHost] Intermediate 1 reached! Starting Round 2 in 4s...');
    isAdvancing = true;
    setTimeout(() => {
      socket.emit('admin_action', { action: 'start_round', password: ADMIN_PASSWORD, payload: { roundNumber: 2, force: true } }, (res) => {
        console.log('[AutoHost] Round 2 started:', res?.success);
        isAdvancing = false;
      });
    }, 4000);
  }

  // 3. Intermission 2 -> Round 3
  if (status === 'INTERMEDIATE_2') {
    console.log('[AutoHost] Intermediate 2 reached! Starting Round 3 in 4s...');
    isAdvancing = true;
    setTimeout(() => {
      socket.emit('admin_action', { action: 'start_round', password: ADMIN_PASSWORD, payload: { roundNumber: 3, force: true } }, (res) => {
        console.log('[AutoHost] Round 3 started:', res?.success);
        isAdvancing = false;
      });
    }, 4000);
  }
});

console.log('[AutoHost] Daemon active and listening for tournament progression...');
