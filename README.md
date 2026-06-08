# LocalMind AI 🤖

A privacy-first Android app that runs LLMs 100% on-device using llama.cpp.
Built with React + Capacitor. No cloud. No subscriptions.

## Features
- 💬 ChatGPT-style chat with local LLMs
- 🖥️ Model library with download manager (Llama, Mistral, Phi, Gemma etc.)
- 🤖 Agent builder — create AI agents that integrate with other apps
- 🔒 100% private — SQLite memory, zero data leaves device

## Build APK via GitHub Actions

1. Push this repo to GitHub
2. Go to **Actions** tab
3. The `Build LocalMind AI APK` workflow runs automatically
4. Download APK from **Artifacts** when complete (~5-10 min)

## Local Development

```bash
npm install
npm run dev
```

## Tech Stack
- React 18 + Vite
- Capacitor 6 (Android bridge)
- llama.cpp (via JNI — wire up in native layer)
- SQLite / Room DB for memory

## Developer
Suresh
