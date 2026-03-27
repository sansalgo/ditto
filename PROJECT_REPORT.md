# DITTO — Digital Twin Studio
### Project Report

---

## 1. Project Title

**DITTO: Digital Twin Studio**
*A local-first AI system for building and simulating personality-grounded conversational personas from raw chat history.*

---

## 2. Background Study

The rapid growth of large language models (LLMs) has opened new possibilities for natural language understanding and generation. One emerging application is **personality simulation** — training or prompting an AI to mimic a specific person's communication style based on their past messages.

**Retrieval-Augmented Generation (RAG)** is a technique that enhances LLM responses by first retrieving semantically relevant documents from a vector database and injecting them into the prompt. This grounds the model's output in real evidence rather than hallucination.

**Vector embeddings** convert text into dense numerical representations that capture semantic meaning. Similar texts cluster together in embedding space, making it possible to retrieve the most contextually relevant past messages for a given query using distance metrics such as cosine similarity.

**Ollama** is a local inference runtime that allows models such as Meta's LLaMA 3 to be run entirely offline on consumer hardware. **ChromaDB** is an open-source, embeddable vector database suited for RAG pipelines.

Together, these technologies enable a fully local, privacy-preserving pipeline for persona construction — no data is sent to external APIs.

---

## 3. Problem Statement

Existing chatbot and persona systems typically require:
- Large annotated datasets
- Cloud-based APIs that expose private conversations to third-party servers
- Manual prompt engineering per person
- Re-training or fine-tuning of models

There is no accessible, local tool that allows a user to **upload a raw WhatsApp-style chat export, automatically extract a structured personality profile, store conversational memories, and simulate responses** in the style of a chosen participant — all without sending data to the cloud.

---

## 4. Objective of the Project

1. Parse WhatsApp-format plain-text chat exports and extract per-author message sets.
2. Automatically derive a structured **PersonalityProfile** (tone, style, vocabulary, sentiment, etc.) using an LLM prompt via Ollama.
3. Embed all persona messages and store them in ChromaDB for semantic memory retrieval.
4. Simulate natural-language replies to new user messages, grounded in the extracted profile and the top-K retrieved memories.
5. Provide an intuitive, browser-based UI that requires no command-line interaction beyond starting local services.
6. Keep the entire pipeline **offline and private** — no cloud APIs, no telemetry.

---

## 5. Existing System

| Aspect | Current State |
|---|---|
| Persona chatbots | Rule-based or cloud-fine-tuned models (CharacterAI, GPT custom instructions) |
| Chat analysis tools | Manual — users export and read logs themselves |
| Memory retrieval | Not implemented in most consumer tools |
| Privacy | Cloud-dependent; chat data transmitted to external servers |
| Accessibility | Requires API keys, subscriptions, or ML expertise |

**Drawbacks of existing systems:**
- Privacy risk: raw personal conversations sent to third-party servers.
- No structured personality extraction from individual message history.
- No semantic memory — replies are not grounded in real past conversations.
- High barrier to entry (fine-tuning, API costs).

---

## 6. Proposed System

DITTO is a **local-first, RAG-powered digital twin studio** consisting of:

- A **Next.js web application** with a clean UI for uploading chat exports, selecting personas, and simulating replies.
- A **chat parser** that decodes WhatsApp-format exports (date, time, author, content) and normalises timestamps to ISO format.
- A **personality extractor** that uses Ollama/LLaMA 3 to produce a structured JSON profile covering tone, communication style, common phrases, sentiment, vocabulary patterns, and relationship signals.
- A **vector memory store** (ChromaDB + `nomic-embed-text`) that embeds all persona messages and enables top-K semantic retrieval at chat time.
- A **simulation engine** that composes a persona-grounded prompt from the profile and retrieved context, then calls Ollama to generate a reply.

**Advantages over existing systems:**
- Fully local — no data leaves the machine.
- No fine-tuning required; works with any LLaMA 3-compatible model.
- Structured, inspectable personality profiles in JSON.
- Retrieval-augmented replies grounded in actual past messages.
- Extensible: swap the model, embedder, or vector store via environment variables.

---

## 7. Module Descriptions

### 7.1 Chat Parser (`lib/chat-parser.ts`)
Parses raw WhatsApp-exported `.txt` files line by line using a regex that matches the pattern:
```
DD/MM/YY, H:MM [am/pm] - Author: Message
```
- Handles multi-line messages (continuation lines are appended to the previous record).
- Strips noise lines (`<Media omitted>`, encryption notices, blank lines).
- Normalises timestamps to `YYYY-MM-DD HH:MM` (24-hour ISO format).
- Generates a SHA-1 ID per message for stable deduplication.
- Exports: `parseChatHistory`, `getPersonaMessages`, `getAverageWordsPerMessage`.

### 7.2 Personality Extractor (`lib/personality.ts`)
Builds a `PersonalityProfile` for a chosen author:
- Samples the first 80 messages to stay within context limits.
- Computes top-8 frequent words (≥3 chars, appearing >1 time) as phrase hints.
- Sends a structured prompt to Ollama requesting a JSON object with 8 fields.
- Extracts the JSON block from the raw LLM response using brace-matching.
- Falls back gracefully to a default profile if extraction fails.

### 7.3 Ollama Client (`lib/ollama.ts`)
Thin HTTP wrapper around the Ollama REST API:
- `generateWithOllama(prompt)` — calls `/api/generate` with LLaMA 3 at temperature 0.7.
- `embedWithOllama(texts[])` — calls `/api/embed` using `nomic-embed-text`; supports both `embeddings[]` and legacy `embedding` response shapes.
- Configurable via `OLLAMA_URL`, `OLLAMA_MODEL`, `OLLAMA_EMBED_MODEL` environment variables.

### 7.4 Chroma Memory Store (`lib/chroma.ts`)
Manages the `ditto_memories_v2` ChromaDB collection:
- `storePersonaMemories` — upserts all persona messages as embeddings, storing author, timestamp, and personaName as metadata.
- `queryPersonaMemories` — embeds the incoming user message, queries ChromaDB with a `where` filter on `personaName`, and returns the top-K results with distance scores.

### 7.5 API Routes (`app/api/personas/`)
**`POST /api/personas`** — Create Persona endpoint:
1. Validates request body (`personaName`, `chatHistory`).
2. Parses chat, filters to persona messages, computes summary stats.
3. Calls personality extractor and memory store in sequence.
4. Returns `CreatePersonaResponse` with the full persona record and stored memory count.

**`POST /api/personas/chat`** — Chat Simulation endpoint:
1. Validates request body (`personaName`, `message`, `profile`).
2. Retrieves top-5 semantic memories from ChromaDB.
3. Builds a simulation prompt combining the personality profile and retrieved context.
4. Calls Ollama for generation and returns the reply with retrieved memories.

### 7.6 UI — Ditto Studio (`components/ditto-studio.tsx`)
Single-page React component with four visual sections:
- **Hero card** — project overview and feature highlights.
- **System status card** — live display of stack components (Next.js, Ollama, Chroma).
- **Create Persona panel** — file upload, format validation, speaker detection radio group, chat preview, and persona creation trigger.
- **Chat Simulation panel** — message input, simulate button, and a chat-bubble conversation thread.
- **Extracted Profile panel** — summary stats and raw JSON profile viewer.
- **Retrieved Context panel** — per-memory cards with author, timestamp, and distance badges.

---

## 8. Software and Hardware Configuration

### Software Requirements

| Component | Technology | Version / Notes |
|---|---|---|
| Frontend framework | Next.js (App Router) | v14+ |
| UI language | TypeScript + React | React 18+ |
| Component library | shadcn/ui (Radix + Tailwind) | Latest |
| Local LLM runtime | Ollama | Latest stable |
| LLM model | LLaMA 3 (`llama3`) | Meta via Ollama |
| Embedding model | `nomic-embed-text` | Via Ollama |
| Vector database | ChromaDB | v0.5+ (REST API) |
| ChromaDB client | `chromadb` npm package | Latest |
| Node.js | Node.js | v18+ |
| Package manager | npm / pnpm | — |

### Environment Variables

| Variable | Default | Purpose |
|---|---|---|
| `OLLAMA_URL` | `http://127.0.0.1:11434` | Ollama server address |
| `OLLAMA_MODEL` | `llama3` | Generation model name |
| `OLLAMA_EMBED_MODEL` | `nomic-embed-text` | Embedding model name |
| `CHROMA_URL` | `http://127.0.0.1:8000` | ChromaDB server address |

### Hardware Requirements (Minimum)

| Resource | Requirement |
|---|---|
| CPU | 4-core x86-64 (Apple Silicon supported) |
| RAM | 8 GB (16 GB recommended for LLaMA 3 8B) |
| Storage | 10 GB free (model weights + ChromaDB data) |
| OS | Windows 10/11, macOS 12+, or Linux |
| GPU | Optional — CUDA/Metal acceleration speeds inference |

---

## 9. Data Flow Diagram / System Flow

### 9.1 Persona Creation Flow

```
User uploads .txt file
        │
        ▼
[Chat Parser]
  • Regex parse each line → ChatMessage[]
  • Filter noise, normalise timestamps
  • Filter by selected personaName → persona messages
        │
        ▼
[Personality Extractor]
  • Sample first 80 messages
  • Build LLM prompt
        │
        ▼
[Ollama — LLaMA 3]
  • Generate structured JSON
        │
        ▼
[JSON Normaliser]
  • Extract JSON block from response
  • Validate & fill missing fields with fallback
  • Return PersonalityProfile
        │
        ▼
[Ollama — nomic-embed-text]
  • Embed all persona messages → float[][] vectors
        │
        ▼
[ChromaDB — ditto_memories_v2]
  • Upsert vectors with metadata (author, timestamp, personaName)
        │
        ▼
[API Response → UI]
  • PersonaRecord + storedMemories count
  • Display profile JSON + summary stats
```

### 9.2 Chat Simulation Flow

```
User types a message
        │
        ▼
[POST /api/personas/chat]
  • Receive: personaName, message, profile
        │
        ▼
[Ollama — nomic-embed-text]
  • Embed user message → query vector
        │
        ▼
[ChromaDB — query]
  • Filter by personaName
  • Return top-5 nearest memories (id, content, author, timestamp, distance)
        │
        ▼
[Simulation Prompt Builder]
  • Compose: "You are <name>. Personality: <profile JSON>. Past context: <memories>. User: <message>"
        │
        ▼
[Ollama — LLaMA 3]
  • Generate reply (temperature 0.7)
        │
        ▼
[API Response → UI]
  • Display reply bubble
  • Display retrieved memory cards with distance scores
```

---

## 10. Table Design

Since DITTO uses ChromaDB (a vector database) rather than a relational database, data is stored in a **collection** rather than SQL tables. The logical schema is described below, alongside the in-memory TypeScript types that serve as the application's data layer.

### 10.1 ChromaDB Collection: `ditto_memories_v2`

| Field | Type | Description |
|---|---|---|
| `id` | `string` | Unique record key: `{personaName}:{sha1_of_raw_line}` |
| `embedding` | `float[]` | `nomic-embed-text` vector (768 dimensions) |
| `document` | `string` | Raw message content text |
| `metadata.personaName` | `string` | The persona this memory belongs to |
| `metadata.author` | `string` | Original chat author name |
| `metadata.timestamp` | `string` | Normalised ISO-style timestamp (`YYYY-MM-DD HH:MM`) |

### 10.2 TypeScript Data Structures (Application Layer)

**ChatMessage** — parsed message unit
| Field | Type | Description |
|---|---|---|
| `id` | `string` | SHA-1 hash of the raw line |
| `timestamp` | `string` | Normalised timestamp |
| `author` | `string` | Sender name extracted from chat |
| `content` | `string` | Cleaned message body |
| `raw` | `string` | Original unmodified line |

**PersonalityProfile** — LLM-extracted persona profile
| Field | Type | Description |
|---|---|---|
| `tone` | `string` | Overall conversational tone (e.g. "casual and warm") |
| `communicationStyle` | `string` | How the person structures messages |
| `responseLength` | `string` | Typical length pattern (short / medium / long) |
| `commonPhrases` | `string[]` | Frequently used words or expressions (up to 8) |
| `sentiment` | `string` | Dominant emotional register |
| `vocabularyPatterns` | `string[]` | Characteristic word choices (up to 6) |
| `relationshipSignals` | `string[]` | Indicators of social dynamics (up to 6) |
| `notes` | `string` | Free-form LLM observations |

**PersonaSummary** — aggregate statistics
| Field | Type | Description |
|---|---|---|
| `personaName` | `string` | Selected speaker name |
| `totalMessages` | `number` | Count of persona messages |
| `averageWordsPerMessage` | `number` | Mean word count per message |
| `sourceAuthors` | `string[]` | All unique authors in the full chat |

**RetrievedMemory** — single ChromaDB query result
| Field | Type | Description |
|---|---|---|
| `id` | `string` | ChromaDB document ID |
| `author` | `string` | Original message author |
| `content` | `string` | Message text |
| `timestamp` | `string` | Message timestamp |
| `distance` | `number \| null` | Cosine distance from query vector (lower = more similar) |

**CreatePersonaResponse** — API response for persona creation
| Field | Type | Description |
|---|---|---|
| `persona.summary` | `PersonaSummary` | Aggregate stats |
| `persona.profile` | `PersonalityProfile` | Extracted JSON profile |
| `persona.sampleMessages` | `ChatMessage[]` | First 6 persona messages (preview) |
| `storedMemories` | `number` | Count of vectors upserted to ChromaDB |

**ChatSimulationResponse** — API response for chat simulation
| Field | Type | Description |
|---|---|---|
| `reply` | `string` | LLM-generated persona reply |
| `retrievedContext` | `RetrievedMemory[]` | Top-K memories used to ground the reply |

---

*End of Report*
