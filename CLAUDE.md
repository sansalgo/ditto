# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Ditto** is a local-first digital twin studio that creates persona simulations from WhatsApp chat exports. It parses chat history, analyzes a selected speaker's communication patterns via LLM, stores conversation-context embeddings in a vector database, and generates contextually-grounded persona replies.

All processing runs locally — no external APIs. Two local services must be running:
- **Ollama** at `http://127.0.0.1:11434` — LLM (`llama3`) and embeddings (`nomic-embed-text`)
- **ChromaDB** at `http://127.0.0.1:8000` — vector store (`ditto_pairs_v1` collection)

## Commands

```bash
bun run dev        # Start dev server with Turbopack
bun run build      # Production build
bun run lint       # ESLint
bun run format     # Prettier (formats all files)
bun run typecheck  # tsc --noEmit (no test suite exists)
```

## Architecture

### Request Flow

1. **Upload** — `POST /api/personas` receives raw WhatsApp chat text
   - `lib/chat-parser.ts` parses into `ChatMessage[]` via regex
   - `lib/personality.ts` builds a `PersonalityProfile` JSON by prompting Ollama
   - `lib/chat-parser.ts` also derives `(context window -> persona reply)` examples
   - `lib/ollama.ts` generates embeddings (`nomic-embed-text`) for the context side
   - `lib/chroma.ts` upserts conversation pairs into ChromaDB

2. **Chat** — `POST /api/personas/chat` generates a reply
   - `lib/chroma.ts` similarity-searches ChromaDB for the closest context windows filtered by `personaName`
   - `lib/ollama.ts` calls Ollama `llama3` chat API with a system prompt built from retrieved conversation pairs + personality profile + recent turns

### Key Files

| File | Role |
|------|------|
| `lib/types.ts` | Central type definitions (`ChatMessage`, `PersonalityProfile`, `ConversationPair`, etc.) |
| `lib/chat-parser.ts` | WhatsApp format regex parsing, phrase extraction |
| `lib/personality.ts` | LLM-driven profile extraction with JSON fallback |
| `lib/ollama.ts` | `generateWithOllama()`, `chatWithOllama()`, and `embedWithOllama()` wrappers |
| `lib/chroma.ts` | `storeConversationPairs()` and `queryConversationPairs()` |
| `components/ditto-studio.tsx` | Single large client component driving the entire UI |
| `app/api/personas/route.ts` | Persona creation endpoint |
| `app/api/personas/chat/route.ts` | Reply generation endpoint |

### Environment Defaults (no `.env` required)

```
OLLAMA_URL=http://127.0.0.1:11434
OLLAMA_MODEL=llama3
OLLAMA_EMBED_MODEL=nomic-embed-text
CHROMA_URL=http://127.0.0.1:8000
```

### Config Notes

- `next.config.mjs` marks `chromadb` as a server external package (Node.js only)
- `components.json` configures shadcn/ui with Radix Lyra style and Phosphor icons
- ChromaDB data persists in the `chroma/` directory
- `bun` is the package manager; use `bun add` not `npm install`
