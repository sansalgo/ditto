# DITTO

DITTO is a local-first digital twin studio built with Next.js, Ollama, and ChromaDB. It parses WhatsApp chat exports, builds a structured personality profile for a selected speaker, stores semantic memories as vector embeddings, and generates persona-grounded replies — entirely on your machine with no external APIs.

## How It Works

1. **Upload** a WhatsApp chat export and select a speaker
2. DITTO parses the chat, extracts the speaker's personality profile via LLM, and stores conversation-context embeddings in ChromaDB
3. **Chat** with the persona — replies are grounded in retrieved memory and the personality profile

## Stack

- Next.js App Router + React + TypeScript
- Ollama — local LLM (`llama3`) and embeddings (`nomic-embed-text`)
- ChromaDB — vector memory store (`ditto_pairs_v1` collection)
- shadcn/ui + Tailwind CSS

## Prerequisites

Two local services must be running before starting the app:

```bash
# Ollama (pull required models first)
ollama pull llama3
ollama pull nomic-embed-text
ollama serve   # runs on http://127.0.0.1:11434

# ChromaDB
chroma run --path ./chroma   # runs on http://127.0.0.1:8000
```

## Run Locally

```bash
bun install
bun run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Commands

```bash
bun run dev        # Start dev server with Turbopack
bun run build      # Production build
bun run lint       # ESLint
bun run format     # Prettier
bun run typecheck  # Type check (tsc --noEmit)
```

## Environment

No `.env` file is required. Defaults:

| Variable | Default |
|---|---|
| `OLLAMA_URL` | `http://127.0.0.1:11434` |
| `OLLAMA_MODEL` | `llama3` |
| `OLLAMA_EMBED_MODEL` | `nomic-embed-text` |
| `CHROMA_URL` | `http://127.0.0.1:8000` |

## Key Files

| File | Role |
|---|---|
| [components/ditto-studio.tsx](components/ditto-studio.tsx) | Main UI client component |
| [app/api/personas/route.ts](app/api/personas/route.ts) | Persona creation endpoint |
| [app/api/personas/chat/route.ts](app/api/personas/chat/route.ts) | Reply generation endpoint |
| [lib/chat-parser.ts](lib/chat-parser.ts) | WhatsApp format regex parsing |
| [lib/personality.ts](lib/personality.ts) | LLM-driven personality profile extraction |
| [lib/ollama.ts](lib/ollama.ts) | Ollama generation and embedding wrappers |
| [lib/chroma.ts](lib/chroma.ts) | ChromaDB store and similarity search |
| [lib/types.ts](lib/types.ts) | Central type definitions |

## Project Docs

- [Documentation Index](docs/README.md)
- [Project Report](docs/PROJECT_REPORT.md)
- [Architecture Flowchart](docs/PROJECT_FLOWCHART.mmd)
