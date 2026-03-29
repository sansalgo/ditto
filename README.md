# DITTO

DITTO is a local-first digital twin studio built with Next.js, Ollama, and ChromaDB. It parses WhatsApp-style chat exports, builds a structured personality profile for a selected speaker, stores semantic memories as embeddings, and generates persona-grounded replies.

## Project Docs

- [Documentation Index](/docs/README.md)
- [Project Report](/docs/PROJECT_REPORT.md)
- [Architecture Flowchart](/docs/PROJECT_FLOWCHART.mmd)
- [Presentation Generator](/docs/generate-pptx.ts)

## Stack

- Next.js App Router + React + TypeScript
- Ollama for local generation and embeddings
- ChromaDB for vector memory storage
- shadcn/ui + Tailwind CSS for the frontend

## Run Locally

1. Start Ollama on `http://127.0.0.1:11434`
2. Start ChromaDB on `http://127.0.0.1:8000`
3. Install dependencies with `bun install` or `npm install`
4. Start the app with `npm run dev`

## Core Files

- [components/ditto-studio.tsx](/components/ditto-studio.tsx)
- [app/api/personas/route.ts](/app/api/personas/route.ts)
- [app/api/personas/chat/route.ts](/app/api/personas/chat/route.ts)
- [lib/chat-parser.ts](/lib/chat-parser.ts)
- [lib/personality.ts](/lib/personality.ts)
- [lib/ollama.ts](/lib/ollama.ts)
- [lib/chroma.ts](/lib/chroma.ts)
