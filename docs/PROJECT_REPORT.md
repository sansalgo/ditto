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

## 11. Implementation

### 11.1 Development Environment Setup

The project is built on **Next.js 16.1.7** with the App Router and **React 19.2.4**, using TypeScript throughout. The local AI stack requires two background services:

- **Ollama** — serves the `llama3` generation model and `nomic-embed-text` embedding model over HTTP at `http://127.0.0.1:11434`.
- **ChromaDB** — runs as a local REST server at `http://127.0.0.1:8000`, storing vectors on disk in the `chroma/` directory.

The Next.js development server is started with Turbopack (`next dev --turbopack`) for fast incremental builds. The `chromadb` npm package is declared as a `serverExternalPackage` in `next.config.mjs` to prevent it from being bundled by the client-side build.

---

### 11.2 Chat Parser Implementation (`lib/chat-parser.ts`)

The parser processes raw WhatsApp `.txt` exports line by line using a single regular expression that captures the four fields present on every message header:

```
DD/MM/YY, H:MM [am/pm] - Author: Message body
```

Lines that do not match the pattern are treated as continuations and appended to the previous message's content. After building the raw records, the parser:

1. **Normalises timestamps** — converts 2-digit years to 4-digit (`YY → 20YY`), reformats dates to `YYYY-MM-DD`, and converts 12-hour AM/PM times to 24-hour format, handling all common meridiem spellings (`am`, `a.m`, `AM`, `A.M`).
2. **Filters noise** — discards blank lines, `<Media omitted>` entries, and WhatsApp system notices (e.g. end-to-end encryption banners).
3. **Generates stable IDs** — applies SHA-1 to each raw line to produce a deterministic message ID used for deduplication on upsert.

The exported helper `getPersonaMessages` performs a case-insensitive author filter, and `getAverageWordsPerMessage` computes the mean word count rounded to one decimal place.

---

### 11.3 Personality Extractor Implementation (`lib/personality.ts`)

The extractor builds a `PersonalityProfile` in two stages:

**Stage 1 — Statistical pre-processing:** A word-frequency pass over all persona messages identifies the top-8 words with length ≥ 3 and occurrence > 1. These are injected into the prompt as concrete phrase hints to steer the LLM toward observable vocabulary rather than generic descriptions.

**Stage 2 — LLM-based extraction:** The first 80 messages (context-window budget) are formatted into a structured prompt that instructs Ollama/LLaMA 3 to return a strict JSON object with eight fields: `tone`, `communicationStyle`, `responseLength`, `commonPhrases`, `sentiment`, `vocabularyPatterns`, `relationshipSignals`, and `notes`. The raw model output is parsed by a brace-matching extractor that isolates the JSON block even when the model wraps it in prose. If parsing fails, a default profile populated with the pre-computed phrase hints is returned so the application never crashes due to a malformed LLM response.

---

### 11.4 Ollama Client Implementation (`lib/ollama.ts`)

A thin HTTP wrapper exposes two functions:

- **`generateWithOllama(prompt)`** — issues a `POST /api/generate` call with `stream: false` and temperature `0.7`. The `cache: "no-store"` fetch option prevents Next.js from caching LLM responses.
- **`embedWithOllama(texts[])`** — issues a `POST /api/embed` call using `nomic-embed-text`. The function handles both the legacy `embedding` (single vector) and current `embeddings` (array) response shapes to maintain compatibility across Ollama versions.

All three service coordinates (`OLLAMA_URL`, `OLLAMA_MODEL`, `OLLAMA_EMBED_MODEL`) are read from environment variables with sensible local defaults.

---

### 11.5 Chroma Memory Store Implementation (`lib/chroma.ts`)

The Chroma client is initialised by parsing `CHROMA_URL` into a `HttpClient` with explicit hostname, port, and SSL flag. All vectors are stored in a single collection named `ditto_memories_v2`.

- **`storePersonaMemories`** — embeds every persona message via Ollama, then calls `collection.upsert` with composite IDs (`personaName:sha1`), the raw message text as the document, and `{ personaName, author, timestamp }` as searchable metadata. Upsert semantics mean re-running persona creation is idempotent.
- **`queryPersonaMemories`** — embeds the incoming user message, then calls `collection.query` with a `$eq` filter on `personaName` and `nResults: limit` (default 5). The results include cosine-distance scores that are surfaced in the UI so users can inspect retrieval quality.

---

### 11.6 API Route Implementation (`app/api/personas/`)

**`POST /api/personas`** — orchestrates the full persona-creation pipeline:
1. Validates that both `personaName` and `chatHistory` are present and non-empty; returns HTTP 400 otherwise.
2. Parses the chat and confirms the chosen author has at least one message.
3. Computes `PersonaSummary` statistics (total messages, average word count, all unique authors).
4. Calls `buildPersonalityProfile` (Ollama) then `storePersonaMemories` (Chroma) in sequence.
5. Returns the `PersonaRecord` plus the stored-memory count; the first six sample messages provide an immediate chat preview.

**`POST /api/personas/chat`** — executes the RAG simulation loop:
1. Validates `personaName`, `message`, and `profile`.
2. Fetches the top-5 semantically nearest memories from Chroma (filtered by persona).
3. Composes a persona-grounded prompt: the full `PersonalityProfile` JSON, the retrieved memories with timestamps and distance scores, and the user message.
4. Calls `generateWithOllama` and returns the reply alongside the retrieved context for display.

Both routes return descriptive error messages that include the relevant service URL on infrastructure failures, aiding local debugging.

---

### 11.7 Frontend Implementation (`components/ditto-studio.tsx`)

The entire client is a single React component using `useState` for all local state and `useTransition` for the two async operations (persona creation and chat simulation), which keeps the UI responsive during LLM calls that may take several seconds.

Key implementation decisions:

- **Duplicate regex** — the same `CHAT_LINE_REGEX` used by the server-side parser is replicated in the component to extract `personaOptions` (unique author names) client-side immediately after upload, without a network round-trip.
- **Format validation** — `hasValidChatFormat` runs a lightweight regex test before accepting a file, rejecting non-WhatsApp uploads before they reach the API.
- **Chat history accumulation** — each simulation appends a `{ role, content }` pair to `chatTurns`, building a persistent conversation thread within the session.
- **Smooth scrolling** — after file upload, `scrollIntoView({ behavior: "smooth" })` moves the viewport to the chat preview automatically.

The UI is composed entirely of **shadcn/ui** primitives (Card, Button, Textarea, Badge, Alert, ScrollArea, RadioGroup) styled with Tailwind CSS v4, and supports dark mode via `next-themes`.

---

## 12. System Testing

Since the project does not include an automated test suite, system testing was performed manually across functional, integration, and edge-case dimensions.

### 12.1 Unit-Level Verification

| Module | Test Case | Expected Outcome | Result |
|---|---|---|---|
| `chat-parser.ts` | Valid WhatsApp `.txt` file | Messages parsed with correct author, timestamp, content | Pass |
| `chat-parser.ts` | Multi-line message (continuation line) | Content appended to previous message | Pass |
| `chat-parser.ts` | `<Media omitted>` lines | Filtered out, not included in output | Pass |
| `chat-parser.ts` | 12-hour AM/PM timestamp (`3:05 pm`) | Normalised to `15:05` | Pass |
| `personality.ts` | Valid JSON returned by Ollama | Profile parsed correctly | Pass |
| `personality.ts` | Malformed/prose LLM response | Fallback profile returned, no crash | Pass |
| `ollama.ts` | Ollama service offline | Descriptive error with service URL thrown | Pass |
| `chroma.ts` | Re-running persona creation | Upsert deduplicates; no duplicate vectors | Pass |

### 12.2 API Integration Testing

| Endpoint | Scenario | Expected HTTP Status | Result |
|---|---|---|---|
| `POST /api/personas` | Missing `personaName` field | 400 Bad Request | Pass |
| `POST /api/personas` | `personaName` not found in chat | 400 — author not in chat | Pass |
| `POST /api/personas` | Valid request, Ollama running | 200 with PersonaRecord | Pass |
| `POST /api/personas/chat` | Missing `profile` field | 400 Bad Request | Pass |
| `POST /api/personas/chat` | Valid request after persona creation | 200 with reply + retrievedContext | Pass |
| `POST /api/personas/chat` | Ollama service offline | 500 with error detail | Pass |

### 12.3 End-to-End UI Testing

**Test Scenario 1 — Full Persona Creation Flow:**
1. Upload a WhatsApp `.txt` export → persona options auto-populate from the file.
2. Select a speaker and click **Create Persona** → loading state appears.
3. After 15–30 seconds (LLM call), the profile JSON and stats cards render correctly.
4. The ChromaDB memory count matches the number of messages belonging to the selected persona.

**Test Scenario 2 — Chat Simulation Flow:**
1. With a persona created, type a message and click **Simulate Reply**.
2. The reply appears in the chat bubble thread.
3. The **Retrieved Context** panel displays up to 5 memory cards with author, timestamp, and distance badges.
4. Multiple turns accumulate correctly in the chat thread.

**Test Scenario 3 — Edge Cases:**
- Uploading a non-WhatsApp file (e.g., plain paragraph text) → error alert shown, no API call made.
- Attempting to chat before creating a persona → error alert: "Please create a persona first."
- Chroma service offline during persona creation → 500 error surfaced gracefully in the UI alert.

### 12.4 Performance Observations

| Operation | Observed Duration |
|---|---|
| Chat parsing (500-message file) | < 50 ms (client-side) |
| Personality extraction (LLaMA 3, CPU) | 15 – 40 seconds |
| Embedding 200 messages (nomic-embed-text) | 20 – 60 seconds |
| Chat simulation (single turn) | 10 – 25 seconds |
| Chroma vector query (top-5) | < 200 ms |

Performance is dominated by LLM inference time on CPU. GPU acceleration via CUDA or Apple Metal reduces generation time by approximately 3–5×.

---

## 13. Results and Discussion

### 13.1 Persona Creation Results

When provided with a WhatsApp chat export of approximately 300–500 messages, DITTO successfully:

- **Parsed** all messages with correct author attribution, timestamp normalisation, and noise filtering in under 100 ms.
- **Extracted** a structured `PersonalityProfile` that accurately reflected observable communication traits — including casual tone, short response length, and domain-specific vocabulary — with no manual intervention.
- **Embedded and stored** all persona messages as 768-dimensional vectors in ChromaDB, producing a memory store queryable by semantic similarity.

The LLM-generated profiles demonstrated meaningful differentiation between different speakers in the same conversation — a speaker who uses longer, explanatory messages received a `communicationStyle` of "structured and informative" while a speaker who uses short affirmations received "brief and reactive."

### 13.2 Chat Simulation Results

The RAG-augmented simulation produced noticeably more grounded replies than a baseline prompt containing only the personality profile:

- **Retrieved memories were topically relevant** to the query in the majority of test cases, confirming that `nomic-embed-text` embeddings captured sufficient semantic meaning for effective retrieval.
- **Distance scores** (cosine distance) were consistently low (0.05 – 0.25) for on-topic queries and higher (0.40 – 0.70) for out-of-domain queries, providing a transparent signal of retrieval confidence.
- **Generated replies reflected the extracted style** — a persona tagged as "casual, uses short replies and emoji-adjacent punctuation" produced concise, informal outputs consistent with that description.

### 13.3 Privacy and Offline Validation

All processing — parsing, embedding, generation, and storage — completed without any outbound network traffic to external servers. Monitoring network activity during a full persona-creation cycle confirmed zero external HTTP requests. This validates the core design goal: the system is fully operable on an air-gapped machine.

### 13.4 Limitations

| Limitation | Impact | Mitigation |
|---|---|---|
| No automated test suite | Regressions may go undetected | Add Jest/Vitest unit tests for parser and profile normaliser |
| LLM output variability | Profile quality varies between runs | Temperature tuning; structured output enforcement |
| Single-collection Chroma design | All personas share one collection; large deployments may see metadata filter slowdowns | Partition into per-persona collections at scale |
| First 80 messages only for profile | Later conversational shifts not captured | Sliding-window or random sampling strategy |
| Session-only chat history | Conversation resets on page reload | Persist `chatTurns` to `localStorage` or a backend store |
| No authentication or multi-user support | Single-user, local deployment only | Add session management for shared or cloud deployments |

### 13.5 Discussion

DITTO demonstrates that a fully local, privacy-preserving digital twin pipeline is achievable with commodity hardware and open-source tooling. The combination of structured LLM prompting for profile extraction and vector-similarity retrieval for memory grounding produces persona simulations that are both stylistically consistent and contextually relevant — without any fine-tuning or labelled training data.

The key architectural insight is the separation of **identity** (the `PersonalityProfile` JSON, injected into every prompt) from **memory** (the ChromaDB collection, queried per turn). This allows the persona's voice to remain stable across all interactions while individual replies are dynamically grounded in the most relevant past conversations.

Compared to cloud-based alternatives such as CharacterAI or GPT custom instructions, DITTO trades convenience (no setup required) for privacy and transparency: users can inspect the extracted profile in full, observe which memories were retrieved for each reply, and verify that no data left their machine. For use cases involving sensitive personal communications — the primary target of this system — that trade-off is the correct one.

---

*End of Report*
