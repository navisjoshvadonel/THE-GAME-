const http = require('http');
const path = require('path');
const express = require('express');
const { Server } = require('socket.io');

const GameStateManager = require('./src/state');
const { setupSocketHandlers } = require('./src/socketHandlers');
const { printServerBanner, getLocalIpAddresses } = require('./src/networkUtils');

const PORT = process.env.PORT || 5000;
const ADMIN_PASSWORD = process.env.ADMIN_SECRET || 'campus_admin_2026';

const app = express();
const server = http.createServer(app);

// Initialize Socket.IO with WebSocket-only transport (no long-polling overhead)
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  },
  transports: ['websocket'],
  pingInterval: 5000,
  pingTimeout: 7000,
  maxHttpBufferSize: 1e6 // 1MB limit for safety
});

// Middleware
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Initialize Central State Manager
const gameState = new GameStateManager(ADMIN_PASSWORD);

// Setup Socket.IO Event Handlers
setupSocketHandlers(io, gameState);

// Routes
app.get('/display', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'display.html'));
});

app.get('/admin', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'admin.html'));
});

app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    gameStatus: gameState.status,
    totalPlayers: gameState.players.size,
    totalTeams: gameState.teams.size,
    uptime: Math.round(process.uptime())
  });
});

app.get('/api/lan-ips', (req, res) => {
  res.json({
    port: PORT,
    ips: getLocalIpAddresses()
  });
});

app.get('/api/bench-session', (req, res) => {
  const benchQuery = (req.query.bench || '').toString().trim().toLowerCase();
  const numericKey = benchQuery.replace(/[^0-9]/g, '');
  const alphaNumKey = benchQuery.replace(/[^0-9a-z]/g, '');

  // O(1) index lookups first
  let teamId = gameState._benchIndex.get(alphaNumKey) || gameState._benchIndex.get(numericKey);
  let team = teamId ? gameState.teams.get(teamId) : null;

  // Fallback: linear scan (covers partial name matches & edge cases)
  if (!team) {
    for (const t of gameState.teams.values()) {
      const bNum = (t.benchNumber || '').toLowerCase();
      const tName = (t.name || '').toLowerCase();
      const benchNum = bNum.replace(/[^0-9]/g, '');
      if ((numericKey && benchNum === numericKey) || bNum.includes(benchQuery) || tName.includes(benchQuery)) {
        team = t;
        break;
      }
    }
  }

  if (team) {
    return res.json({
      success: true,
      benchNumber: team.benchNumber,
      teamName: team.name,
      sessionToken: team.leaderSessionToken,
      teamId: team.teamId
    });
  }
  res.json({ success: false, message: 'Bench not found' });
});

app.get('/api/export', (req, res) => {
  const secret = req.query.secret || req.headers['x-admin-secret'];
  if (secret !== gameState.adminPassword) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const exportData = {
    exportedAt: new Date().toISOString(),
    gameStatus: gameState.status,
    currentRound: gameState.currentRound,
    leaderboard: gameState.getLeaderboard(),
    teams: Array.from(gameState.teams.values()).map(t => ({
      teamId: t.teamId,
      benchNumber: t.benchNumber || '',
      name: t.name,
      gender: t.gender,
      teamSize: t.teamSize || t.members.length,
      totalScore: t.totalScore,
      roundScores: t.roundScores,
      isEliminated: Boolean(t.isEliminated),
      leaderSessionToken: t.leaderSessionToken,
      members: t.members.map((mToken, idx) => {
        const p = gameState.players.get(mToken);
        return {
          slotNumber: idx + 1,
          sessionToken: mToken,
          name: p?.name || 'Unknown',
          gender: p?.gender || 'open',
          isLeader: Boolean(p?.isLeader),
          isOnline: Boolean(p?.isOnline),
          lastActive: p?.lastActive ? new Date(p.lastActive).toISOString() : null
        };
      })
    }))
  };

  res.setHeader('Content-Disposition', 'attachment; filename="campus_lan_puzzle_results.json"');
  res.setHeader('Content-Type', 'application/json');
  res.send(JSON.stringify(exportData, null, 2));
});

app.all('/api/reset', (req, res) => {
  const secret = req.query.secret || req.body?.secret || req.headers['x-admin-secret'];
  if (secret !== gameState.adminPassword) {
    return res.status(401).json({ error: 'Unauthorized. Provide valid admin secret.' });
  }

  gameState.resetAllState();
  io.emit('game_reset_event');
  io.to('display_room').emit('display_update', gameState.getDisplayState());
  io.to('admin_room').emit('admin_update', gameState.getAdminState());

  res.json({ success: true, message: 'All players, teams, and scores wiped. Server reset to clean lobby.' });
});

// Start Server on all interfaces (0.0.0.0)
server.listen(PORT, '0.0.0.0', () => {
  printServerBanner(PORT, ADMIN_PASSWORD);
});
