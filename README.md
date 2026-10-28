# The Academic Decathlon — Campus LAN Tournament Game 🏛️

A real-time, fellowship-based multiplayer puzzle tournament system designed specifically for campus LAN events and collegiate decathlons. **100% offline — zero internet required during gameplay.**

---

## 🎨 Visual Aesthetic & Philosophy: Light, Rich & Classic

The interface has been crafted with a **Light, Rich, and Classic Collegiate Tournament** aesthetic:
- **Alabaster & Ivory Parchment Surfaces** (`#F8F6F0` and `#FFFFFF`) with subtle heraldic linen weave textures.
- **Deep Oxford Navy Typography & Crests** (`#0F223D` and `#1E3A5F`).
- **Burnished Antique Brass & Gold Borders** (`#C59B27` and `#D4AF37`) with gilded laurels and Roman numeral accents.
- **Classical Collegiate Typography**: Roman capital headers (`Cinzel`), elegant classical book serif (`Cormorant Garamond`), crisp modern body (`Outfit`), and cipher code blocks (`JetBrains Mono`).
- **Acoustic Orchestral Synthesizer**: Web Audio API cathedral chimes, warm cellist alerts, and brass fanfares generated completely offline with zero external audio assets.

---

## ⚠️ Mandatory Pre-Event Network Check: WiFi Client Isolation

College campus networks frequently enforce **AP / Client Isolation** (also called Wireless Client Isolation or Station Isolation), which allows laptops to access the internet but **silently blocks device-to-device traffic on the same SSID**.

### The 2-Laptop Ping Test (Perform BEFORE the event)

1. Connect your **Host Laptop** and a **Test Student Laptop** to the college WiFi network.
2. Find the Host Laptop's LAN IPv4 address (e.g., `192.168.1.45` or `10.x.x.x`).
3. On the Test Student Laptop, open Terminal / PowerShell and run:
   ```bash
   ping <HOST_LAN_IP>
   ```
4. **Interpreting results**:
   - ✅ **Packets replied (`Reply from 192.168.1.45: bytes=32...`)**: Client isolation is **disabled**. Your LAN event will work smoothly.
   - ❌ **`Request timed out` or `Destination host unreachable`**: Client isolation is **enabled** on this WiFi network. Device-to-device connections are blocked by the college router.

### Solutions if Client Isolation is Enabled:
- **Option A (Recommended & Completely Autonomous)**: Turn on **Mobile Hotspot** on the Host Laptop or a smartphone. Connect all student laptops to this hotspot. Because it is a direct local access point without campus firewall rules, all 60+ devices communicate freely with zero mobile data consumed.
- **Option B**: Plug a portable offline Wi-Fi travel router into power in the hall. No WAN connection needed.
- **Option C**: Request campus IT network administrators to temporarily disable AP isolation for the event SSID.

### Windows Firewall Configuration (Host Laptop)
Allow incoming connections on port `5000` through Windows Defender Firewall:
```powershell
New-NetFirewallRule -DisplayName "Academic Decathlon Server" -Direction Inbound -LocalPort 5000 -Protocol TCP -Action Allow
```

---

## 🌐 How to Find the Host Laptop's LAN IP

### Automatic Detection (Built-in)
When you start the server, it automatically scans all active network interfaces and prints the exact student URLs in an ASCII banner:
```text
====================================================================
   CAMPUS LAN TEAM PUZZLE GAME SERVER — ACTIVATED
====================================================================
  STUDENT ACCESS URL:
    -> http://172.16.10.5:5000   (Campus LAN Game IP)
```

### Manual Detection & Configuration
- **Designated IP**: `172.16.10.5:5000` is the primary configured campus tournament IP.
- **Windows**: Run `ipconfig` in Command Prompt / PowerShell. Look for the `IPv4 Address` under your active Wi-Fi or Lab Ethernet adapter.
- **Override via Environment**: `HOST_IP=172.16.10.5 npm start`

---

## 🚀 Quickstart: Starting the Server

```bash
# 1. Open project directory
cd "d:\ASSO EVENT"

# 2. Install dependencies (Express + Socket.IO)
npm install

# 3. Start the server
npm start
```

### Environment Variables (Optional)
```bash
PORT=5000 HOST_IP=172.16.10.5 ADMIN_SECRET=campus_admin_2026 npm start
```

---

## 🏛️ System URLs (Exactly Two URLs)

| Role | Target Machine | Local LAN URL | Purpose |
| :--- | :--- | :--- | :--- |
| **1. Scholar Portal** | Student Participants (Laptops/Phones) | `http://172.16.10.5:5000` | Squad enrollment, lobby staging, turn-locked puzzles, and leader synthesis. |
| **2. High Proctor & Grand Hall Display** | Tournament Host / Admin Laptop | `http://172.16.10.5:5000/admin` | Full tournament administration, 1-click stage advancement, manual unlocks, and built-in access to the Projector Display (`/display`). |

> **Host Password**: `campus_admin_2026`

---

## 🎮 Complete 3-Stage Tournament Flow

```
[Convocation / Lobby Stage]
         │ (Auto-merge independent scholars & 1-click launch)
         ▼
[Stage 1: The Scholar’s Synthesis] (~10 min)
  • Non-leaders solve philosophical / logic riddles -> extract axioms (WISDOM, AXIOM, HORIZON).
  • Leader composes a coherent thesis evaluated by the offline Academy NLP Validator.
         │
         ▼
[Stage 1 Intermission & Audit]
  • Grand Hall projector showcases current stage standings & top ranks.
         │
         ▼
[Stage 2: The 10-Node Cyber Terminal Hack] (~10 min)
  • 10 Interconnected Nodes linked via cryptographic bridge chains.
  • Wordle / Mastermind color-coded feedback matrix (Green/Yellow/Dark).
  • Dynamic operative relay: Teammates rotate on Nodes 1-9; Squad Leader overrules Final Boss Node 10.
  • 4-Attempt auto-bypass fail-safe ensures no squad is stalled.
         │
         ▼
[Stage 2 Intermission & Top 5 Cutoff]
  • High Proctor locks rankings: Top 5 qualifying fellowships advance to Finals.
  • Remaining squads transition into Honorary Fellowship Spectator Mode.
         │
         ▼
[Stage 3: Sher"unlocking" Homies — The Kensington Crescent Affair] (~15 min)
  • Top 5 finalists investigate the death of Lord Alistair Blackwood from a typed police case file:
    case summary, 5 suspects with alibis, and 5 witness statements.
  • Squad members crack 5 exhibits in turn (poison, time of death, footprints, cipher, locked room).
    No single answer names the killer; forensic hints unlock after 1:30.
  • The leader files the arrest warrant SURNAME : POISON : MOTIVE. The magistrate only says how
    many of the 3 charges hold. The case lives in src/round3Case.js.
         │
         ▼
[Grand Championship Honors Ceremony]
  • Gold Laurel (🥇 Champion), Silver Laurel (🥈 2nd), and Bronze Laurel (🥉 3rd) awards with cumulative 3-round mark breakdown.
```

---

## 🛡️ Resilience & Fail-Safe Architecture

1. **Reconnection Tokens (`localStorage`)**:
   - Each scholar is issued a UUID session token stored in browser `localStorage`.
   - Flaky WiFi or accidental browser refreshes re-sync to the squad, active turn, and fragment bank in under 1 second without re-registration.
2. **WebSocket-Only Transport**:
   - HTTP long-polling fallback is disabled (`transports: ['websocket']`) to eliminate connection churn and keep bandwidth overhead minimal on congested campus WiFi.
3. **Throttled Projector Pushes**:
   - Display client leaderboard updates are pushed every 2 seconds, ensuring live projector animation without competing with player traffic.
4. **Automatic State Snapshots**:
   - Game state is atomically snapshotted to `data/snapshot.json` every 10 seconds and upon any state transition. A server restart does not wipe an ongoing event.
5. **High Proctor Interventions**:
   - If a student's laptop battery dies or they drop off WiFi, the host can click **"⚡ Advance"** next to their squad in the Admin Panel to immediately inject the fragment and unlock the next teammate!
6. **Data Export**:
   - Results can be exported as a structured JSON file at any time via the Admin panel or `/api/export?secret=campus_admin_2026`.

---

## 🌨️ Pre-Event Load Test (20+ Squads)

Simulate a full tournament of bot squads over real WebSockets from any laptop on the college network:
```bash
# Start rounds yourself from /admin while 20 bot squads play
node simulate_load.js --url http://172.16.10.5:5000 --teams 20

# Fully automatic quick run (bots also start each round)
node simulate_load.js --url http://172.16.10.5:5000 --teams 20 --speed 0.1 --host
```
The report shows which question set each squad got (duplicates are flagged), server response times, disconnects and any squad that got stuck. Click **Reset All** in /admin afterwards so bot squads don't appear in the real event.

## 🧪 Automated Tournament Engine Verification
To run the automated validation test suite:
```bash
npm test
```
*Executes the complete multi-round tournament simulation in under 1 second.*
