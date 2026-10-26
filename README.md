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
    -> http://192.168.1.45:5000   (Wi-Fi)
```

### Manual Detection
- **Windows**: Run `ipconfig` in Command Prompt / PowerShell. Look for the `IPv4 Address` under your active Wi-Fi adapter.
- **macOS**: Run `ipconfig getifaddr en0`.
- **Linux**: Run `hostname -I | awk '{print $1}'`.

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
PORT=5000 ADMIN_SECRET=my_custom_secret npm start
```

---

## 🏛️ System URLs & Roles

| Role | Target Machine | Local LAN URL | Purpose |
| :--- | :--- | :--- | :--- |
| **Scholar Portal** | 60+ Student Laptops | `http://<HOST_LAN_IP>:5000` | Enrollment, fellowship convocation, turn-locked challenges, zero-timer screen. |
| **Grand Hall Display** | Low-GPU Projector Laptop | `http://<HOST_LAN_IP>:5000/display` | High-contrast classical projection, brass countdown timer, rank-animated leaderboard. |
| **High Proctor’s Desk** | Tournament Director Laptop | `http://<HOST_LAN_IP>:5000/admin` | Master 1-click stage progression, fellowship induction, turn bypass, score overrides. |

> **Default High Proctor Password**: `campus_admin_2026`

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
[Stage 3: Sher"unlocking" Homies — The Baker Street Mystery] (~10 min)
  • Top 5 finalists investigate the death of Lord Alistair Blackwood at 221B Kensington Crescent.
  • Gather forensic autopsy reports, decode the burnt grate cipher, expose forged alibis, and file the official Scotland Yard Indictment warrant.
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

## 🧪 Automated Tournament Engine Verification
To run the automated validation test suite:
```bash
npm test
```
*Executes the complete multi-round tournament simulation in under 1 second.*
