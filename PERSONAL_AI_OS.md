# Personal AI OS v1.0

A cross-platform AI operating system for Suresh Kumar T (@ts@TCS) — combining multi-agent framework, service mesh integrations, and memory engine in one unified interface.

## Features

### Core Modules
- **Chat Interface** — Live Claude API integration with context-aware responses
- **Memory Engine** — ChromaDB-style semantic, episodic, and procedural memory
- **Agent Framework** — 6 specialized agents (Chat, Research, Coding, Database, Memory, Automation) with per-agent chat
- **Service Mesh** — NL routing to Google Calendar, Gmail, Alarms, Telegram, Drive, NSE Stock Feed
- **Task Tracker** — Interactive checklist with priority & agent assignment
- **Model Marketplace** — Browse & manage cloud + local models (12+ GGUF models from HuggingFace/Ollama)

### Advanced Features
- Device Mesh topology (Pi Zero 2W, ThinkPad, Pixel 7a, VPS)
- Real-time status monitoring (CPU/RAM bars)
- AES-256 encrypted sync
- Uncensored AI mode (no safety filters)
- Terminal-brutalist UI with cyan/green accent

## Tech Stack

**Frontend:** React 18, Vite, JetBrains Mono + Syne fonts  
**Mobile:** Capacitor 6 → Android APK  
**AI/APIs:** Anthropic Claude (via OpenRouter)  
**Build:** GitHub Actions (auto-APK on push)

## Installation & Setup

```bash
# Install dependencies
npm install

# Development
npm run dev

# Build web
npm run build

# Build Android (via Capacitor)
npm run cap:sync
npm run cap:android
```

## Android Build

GitHub Actions automatically builds APK on push to `main` or `feature/**` branches.

**Download APK:**
1. Go to Actions tab
2. Select latest workflow run
3. Download `PersonalAI-OS-debug-apk` artifact

**Manual Build:**
```bash
npm run build
npm install -g @capacitor/cli
npx cap add android
npx cap sync android
cd android && ./gradlew assembleDebug
```

APK location: `android/app/build/outputs/apk/debug/app-debug.apk`

## Usage

### Chat
- Type naturally or use quick prompts
- Model switcher (Claude Haiku/Sonnet, GPT-4o, local models)
- Memory toggle (RAG integration)

### Agents
- Tap any agent to open dedicated chat
- Each agent has specialized system prompt + hints
- Database Agent optimized for Snowflake/dbt

### Service Mesh
- **Services tab** — Browse 8 integrations (Calendar, Gmail, Alarms, etc)
- **NL Console** — Type commands like "Schedule a meet with Ravi tomorrow 3pm"
- **Devices tab** — View Pi/Laptop/Phone mesh with live sync status

### Memory
- Filter by semantic/episodic/procedural
- Edit/delete memories
- Confidence scores + recency

### Models
- **Installed** — Active cloud & local models with load/remove
- **Browse** — Search 12+ models, filter by family/source/Pi Zero compatibility

## Context

Built for:
- **User:** Suresh Kumar T (ts), Snowflake + dbt Data Engineer @ TCS Chennai
- **Stack:** Snowflake, dbt, Airflow, FastAPI, ChromaDB, Neo4j
- **Hardware:** Pi Zero 2W (512MB RAM, DietPi aarch64) → Tommy-v4 Rust bot
- **Projects:** ASOS (e-commerce), Croma (retail), ZeroClaw/Tommy (AI agents)
- **Interests:** Tamil literature (Thirukkural), NSE stocks, audio equipment (IEMs)

## API Keys Required

Add to `.env` or set in Capacitor config:
```
VITE_ANTHROPIC_API_KEY=sk-ant-...  # Claude via OpenRouter
```

## Branch Info

- **Branch:** `feature/personal-ai-os-v1`
- **Created:** June 8, 2026
- **Status:** MVP → Production
- **Next:** Phase 2 - Memory Engine scaling, Phase 3 - Local SmolLM2 on Pi Zero

---

Made with ⬡ for ts@TCS | Personal AI OS v1.0
