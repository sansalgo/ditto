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

**Conversation-pair RAG** is a refinement of standard RAG that stores **(trigger → response)** pairs instead of isolated utterances. The embedding is computed on the trigger side so that retrieval finds the situations most similar to the incoming query — not just semantically related words — and the associated response serves as a few-shot example for the LLM.

**Ollama** is a local inference runtime that allows models such as Meta's LLaMA 3 to be run entirely offline on consumer hardware. **ChromaDB** is an open-source, embeddable vector database suited for RAG pipelines.

Together, these technologies enable a fully local, privacy-preserving pipeline for persona construction — no data is sent to external APIs.

---

## 3. Problem Statement

Existing chatbot and persona systems typically require:
- Large annotated datasets
- Cloud-based APIs that expose private conversations to third-party servers
- Manual prompt engineering per person
- Re-training or fine-tuning of models

There is no accessible, local tool that allows a user to **upload a raw WhatsApp-style chat export, automatically extract a structured personality profile, store conversational memory as context-grounded pairs, and simulate responses** in the style of a chosen participant — all without sending data to the cloud.

---

## 4. Objective of the Project

1. Parse WhatsApp-format plain-text chat exports and extract per-author message sets.
2. Automatically derive a structured **PersonalityProfile** (tone, style, vocabulary, sentiment, etc.) using an LLM prompt via Ollama.
3. Extract **(context window → persona reply)** pairs from the chat and embed the context side for semantic retrieval.
4. Simulate natural-language replies grounded in few-shot examples drawn from retrieved pairs, the personality profile, and the current conversation history.
5. Gate retrieval quality — exclude semantically distant pairs and fall back gracefully to general style guidance.
6. Provide an intuitive, browser-based UI that requires no command-line interaction beyond starting local services.
7. Keep the entire pipeline **offline and private** — no cloud APIs, no telemetry.

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
- A **chat parser** that decodes WhatsApp-format exports and derives sliding-window **(context → reply)** pairs for every persona message.
- A **personality extractor** that uses Ollama/LLaMA 3 to produce a structured JSON profile covering tone, communication style, common phrases, sentiment, vocabulary patterns, and relationship signals.
- A **vector memory store** (ChromaDB `ditto_pairs_v1` + `nomic-embed-text`) that embeds the **context side** of each conversation pair, enabling retrieval by situational similarity.
- A **simulation engine** that injects retrieved pairs as few-shot examples into a strict system prompt, passes the current conversation history as proper chat turns, and calls Ollama's `/api/chat` endpoint to generate a grounded reply.
- A **relevance gate** that excludes pairs with cosine distance ≥ 1.3 from the few-shot block and signals the LLM to rely on general style guidance when no relevant context exists.

**Advantages over existing systems:**
- Fully local — no data leaves the machine.
- No fine-tuning required; works with any LLaMA 3-compatible model.
- Retrieval finds *situations* similar to the query, not just similar words.
- Few-shot examples drawn from real (trigger → response) pairs produce authentic, grounded replies.
- Multi-turn conversation history is maintained across simulation turns.
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
- **`getConversationPairs(messages, personaName, windowSize=4)`** — for every persona reply, collects the preceding N messages from any author as the context window. Short messages (< 4 chars) and bare URLs are skipped so only semantically meaningful pairs are stored.
- Exports: `parseChatHistory`, `getPersonaMessages`, `getConversationPairs`, `getAverageWordsPerMessage`.

### 7.2 Personality Extractor (`lib/personality.ts`)
Builds a `PersonalityProfile` for a chosen author:
- Samples messages **evenly across the full history** (up to 100 filtered messages, stepped by index) so early and late conversational patterns are both represented.
- Computes top-8 frequent words (≥ 3 chars, appearing > 1 time) as phrase hints.
- Sends a structured prompt to Ollama that includes the persona's actual raw messages as concrete evidence alongside a short conversation transcript, instructing the LLM to describe **observed** behaviour rather than generic categories.
- Extracts the JSON block from the raw LLM response using brace-matching and falls back gracefully to a default profile if extraction fails.

### 7.3 Ollama Client (`lib/ollama.ts`)
Thin HTTP wrapper around the Ollama REST API:
- **`generateWithOllama(prompt)`** — calls `/api/generate` with LLaMA 3 at temperature 0.7. Used for personality profile extraction.
- **`chatWithOllama(system, history[], userMessage)`** — calls `/api/chat` with a proper `system` role message, an array of prior `user`/`assistant` turns, and the current user message. Used for all persona simulation. Temperature 0.85.
- **`embedWithOllama(texts[])`** — calls `/api/embed` using `nomic-embed-text`; supports both `embeddings[]` and legacy `embedding` response shapes.
- Configurable via `OLLAMA_URL`, `OLLAMA_MODEL`, `OLLAMA_EMBED_MODEL` environment variables.

### 7.4 Chroma Memory Store (`lib/chroma.ts`)
Manages the `ditto_pairs_v1` ChromaDB collection:
- **`storeConversationPairs(personaName, pairs[])`** — embeds the `contextWindow` text of each pair via Ollama, then upserts with the `personaReply` as the document and `{ personaName, contextWindow, timestamp }` as metadata. IDs are SHA-1 hashes of `personaName:contextWindow:reply` for idempotent re-runs. Deduplication is applied before the upsert call.
- **`queryConversationPairs(personaName, queryText, limit=6)`** — embeds the incoming user message, queries ChromaDB filtered by `personaName`, and returns `ConversationPair[]` including cosine-distance scores.

### 7.5 API Routes (`app/api/personas/`)
**`POST /api/personas`** — Create Persona endpoint:
1. Validates request body (`personaName`, `chatHistory`).
2. Parses chat, filters to persona messages, computes summary stats.
3. Calls `getConversationPairs` to extract all (context → reply) pairs from the full message thread.
4. Calls personality extractor (Ollama) and `storeConversationPairs` (Chroma) in sequence.
5. Returns `CreatePersonaResponse` with the full persona record and stored pair count.

**`POST /api/personas/chat`** — Chat Simulation endpoint:
1. Validates request body (`personaName`, `message`, `profile`, `conversationHistory`).
2. Retrieves top-6 nearest conversation pairs from ChromaDB by embedding the user message against the context-side embeddings.
3. Applies the relevance gate: pairs with cosine distance ≥ 1.3 are excluded from the few-shot prompt (but still returned in `retrievedContext` for UI inspection).
4. Builds a system prompt containing the personality profile summary and the usable pairs formatted as `[Context] / [persona replied]` few-shot examples.
5. Calls `chatWithOllama` with the system prompt, the last 6 turns of `conversationHistory`, and the current user message.
6. Returns the reply and all retrieved pairs (with distance scores) for display.

### 7.6 UI — Ditto Studio (`components/ditto-studio.tsx`)
Single-page React component with four visual sections:
- **Hero card** — project overview and feature highlights.
- **System status card** — live display of stack components (Next.js, Ollama, Chroma).
- **Create Persona panel** — file upload, format validation, speaker detection radio group, chat preview, and persona creation trigger.
- **Chat Simulation panel** — scrollable conversation log in monospace chat format, message textarea, and simulate button. Each request includes the last 6 chat turns as `conversationHistory`.
- **Extracted Profile panel** — summary stats and raw JSON profile viewer.
- **Retrieved Context panel** — per-pair cards showing the context window, the persona's actual reply, timestamp, and a colour-coded distance badge (default = relevant, secondary = acceptable, outline = distant).

---

## 8. Software and Hardware Configuration

### Software Requirements

| Component | Technology | Version / Notes |
|---|---|---|
| Frontend framework | Next.js (App Router) | v16+ |
| UI language | TypeScript + React | React 19+ |
| Component library | shadcn/ui (Radix + Tailwind) | Latest |
| Local LLM runtime | Ollama | Latest stable |
| LLM model | LLaMA 3 (`llama3`) | Meta via Ollama |
| Embedding model | `nomic-embed-text` | Via Ollama |
| Vector database | ChromaDB | v0.5+ (REST API) |
| ChromaDB client | `chromadb` npm package | Latest |
| Node.js | Node.js | v18+ |
| Package manager | bun | — |

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
[Conversation Pair Extractor]
  • getConversationPairs() — 4-message sliding window
  • Each pair: { contextWindow, personaReply, timestamp }
  • Skip replies < 4 chars or bare URLs
        │
        ▼
[Personality Extractor]
  • Evenly sample up to 100 messages across full history
  • Build LLM prompt with raw message examples
        │
        ▼
[Ollama — LLaMA 3 /api/generate]
  • Generate structured JSON profile
        │
        ▼
[JSON Normaliser]
  • Extract JSON block from response
  • Validate & fill missing fields with fallback
  • Return PersonalityProfile
        │
        ▼
[Ollama — nomic-embed-text]
  • Embed contextWindow side of each pair → float[][] vectors
        │
        ▼
[ChromaDB — ditto_pairs_v1]
  • Upsert pairs: embedding on context, document = personaReply
  • Metadata: personaName, contextWindow, timestamp
  • Deduplicated by SHA-1 of personaName:context:reply
        │
        ▼
[API Response → UI]
  • PersonaRecord + storedPairs count
  • Display profile JSON + summary stats
```

### 9.2 Chat Simulation Flow

```
User types a message
        │
        ▼
[POST /api/personas/chat]
  • Receive: personaName, message, profile, conversationHistory (last 6 turns)
        │
        ▼
[Ollama — nomic-embed-text]
  • Embed user message → query vector
        │
        ▼
[ChromaDB — ditto_pairs_v1]
  • Filter by personaName
  • Return top-6 nearest pairs (contextWindow, personaReply, distance)
        │
        ▼
[Relevance Gate]
  • distance < 1.3  → usable few-shot example
  • distance ≥ 1.3  → excluded from prompt, shown in UI as "distant"
        │
        ▼
[System Prompt Builder]
  • Role: "real person named {personaName}"
  • Style rules from PersonalityProfile (tone, length, phrases, notes)
  • Few-shot block: [Context] / [{personaName} replied] for each usable pair
  • Fallback note if no pairs pass the gate
        │
        ▼
[Ollama — LLaMA 3 /api/chat]
  • messages: [system, ...conversationHistory, user]
  • temperature 0.85
        │
        ▼
[API Response → UI]
  • Display reply in chat log
  • Display retrieved pair cards with colour-coded distance badges
```

---

## 10. Table Design

Since DITTO uses ChromaDB (a vector database) rather than a relational database, data is stored in a **collection** rather than SQL tables. The logical schema is described below, alongside the in-memory TypeScript types that serve as the application's data layer.

### 10.1 ChromaDB Collection: `ditto_pairs_v1`

| Field | Type | Description |
|---|---|---|
| `id` | `string` | SHA-1 of `personaName:contextWindow:personaReply` |
| `embedding` | `float[]` | `nomic-embed-text` vector of the **context window** (768 dimensions) |
| `document` | `string` | The persona's reply text |
| `metadata.personaName` | `string` | The persona this pair belongs to |
| `metadata.contextWindow` | `string` | The multi-turn context that preceded the reply |
| `metadata.timestamp` | `string` | Normalised ISO-style timestamp of the reply (`YYYY-MM-DD HH:MM`) |

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
| `tone` | `string` | Overall conversational tone |
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

**ConversationPair** — a retrieved (context → reply) pair
| Field | Type | Description |
|---|---|---|
| `contextWindow` | `string` | The multi-turn messages that preceded the reply |
| `personaReply` | `string` | What the persona actually said |
| `timestamp` | `string` | Timestamp of the reply |
| `distance` | `number \| null` | Cosine distance from query vector (lower = more similar) |

**CreatePersonaResponse** — API response for persona creation
| Field | Type | Description |
|---|---|---|
| `persona.summary` | `PersonaSummary` | Aggregate stats |
| `persona.profile` | `PersonalityProfile` | Extracted JSON profile |
| `persona.sampleMessages` | `ChatMessage[]` | First 6 persona messages (preview) |
| `storedMemories` | `number` | Count of conversation pairs upserted to ChromaDB |

**ChatSimulationResponse** — API response for chat simulation
| Field | Type | Description |
|---|---|---|
| `reply` | `string` | LLM-generated persona reply |
| `retrievedContext` | `ConversationPair[]` | Top-K pairs used to ground the reply |

---

## 11. Implementation

### 11.1 Development Environment Setup

The project is built on **Next.js 16** with the App Router and **React 19**, using TypeScript throughout. The local AI stack requires two background services:

- **Ollama** — serves the `llama3` generation model and `nomic-embed-text` embedding model over HTTP at `http://127.0.0.1:11434`.
- **ChromaDB** — runs as a local REST server at `http://127.0.0.1:8000`, storing vectors on disk in the `chroma/` directory.

The Next.js development server is started with Turbopack (`bun run dev`) for fast incremental builds. The `chromadb` npm package is declared as a `serverExternalPackage` in `next.config.mjs` to prevent it from being bundled by the client-side build.

---

### 11.2 Chat Parser Implementation (`lib/chat-parser.ts`)

The parser processes raw WhatsApp `.txt` exports line by line using a single regular expression that captures the four fields present on every message header:

```
DD/MM/YY, H:MM [am/pm] - Author: Message body
```

Lines that do not match the pattern are treated as continuations and appended to the previous message's content. After building the raw records, the parser:

1. **Normalises timestamps** — converts 2-digit years to 4-digit, reformats dates to `YYYY-MM-DD`, and converts 12-hour AM/PM times to 24-hour format.
2. **Filters noise** — discards blank lines, `<Media omitted>` entries, bare URLs, and WhatsApp system notices.
3. **Generates stable IDs** — applies SHA-1 to each raw line to produce a deterministic message ID.

**`getConversationPairs`** implements a 4-message sliding window over the full message thread. For each persona reply it collects the preceding 4 messages (from any participant) as the `contextWindow`. Replies shorter than 4 characters or consisting solely of a URL are skipped, since they produce low-information embeddings that degrade retrieval quality.

---

### 11.3 Personality Extractor Implementation (`lib/personality.ts`)

The extractor builds a `PersonalityProfile` in two stages:

**Stage 1 — Statistical pre-processing:** A word-frequency pass over all persona messages identifies the top-8 words with length ≥ 3 and occurrence > 1.

**Stage 2 — LLM-based extraction:** Instead of using only the first 80 messages, the extractor now samples up to 100 messages **evenly distributed across the full chat history** (stepped by `floor(total / 100)`), ensuring that both early and late conversational patterns are captured. The prompt provides two evidence sources to the LLM: a list of the persona's actual messages (as JSON-quoted strings) and a short timestamped transcript. The LLM is instructed to describe **observed** behaviour from the evidence rather than producing generic category labels.

---

### 11.4 Ollama Client Implementation (`lib/ollama.ts`)

Three functions are exposed:

- **`generateWithOllama(prompt)`** — issues `POST /api/generate` with `stream: false` and temperature `0.7`. Used only for personality profile extraction.
- **`chatWithOllama(system, history, userMessage)`** — issues `POST /api/chat` with a structured `messages` array: `[system, ...history, user]`. This allows Ollama to maintain proper conversational context across turns rather than treating each call as an isolated prompt. Temperature is set to `0.85` to allow slight natural variation while remaining true to the persona's style.
- **`embedWithOllama(texts[])`** — issues `POST /api/embed` using `nomic-embed-text`. Handles both `embeddings[]` (current) and `embedding` (legacy) response shapes.

---

### 11.5 Chroma Memory Store Implementation (`lib/chroma.ts`)

The collection has been redesigned from storing **individual messages** to storing **conversation pairs**. The key architectural shift is that embeddings are computed on the **context window** (what was said before the persona replied), not on the reply itself. This means ChromaDB retrieval answers the question *"what situation is most similar to what the user just said?"* rather than *"what did the persona say that sounds similar?"*.

- **`storeConversationPairs`** — embeds each pair's `contextWindow` text, then upserts with the `personaReply` as the document. IDs are SHA-1 hashes of `personaName:contextWindow:reply`, making re-runs fully idempotent. In-memory deduplication runs before the upsert call to prevent ChromaDB from receiving duplicate IDs in a single batch.
- **`queryConversationPairs`** — embeds the incoming user message and queries ChromaDB using a `personaName` `$eq` filter, returning up to 6 `ConversationPair` objects sorted by cosine distance.

---

### 11.6 API Route Implementation (`app/api/personas/`)

**`POST /api/personas`** — orchestrates the full persona-creation pipeline:
1. Parses the full chat into `ChatMessage[]`.
2. Extracts `ConversationPair[]` via `getConversationPairs` (4-message sliding window over the entire thread).
3. Calls `buildPersonalityProfile` (Ollama) for the UI display profile.
4. Calls `storeConversationPairs` (Chroma) to embed and persist all pairs.

**`POST /api/personas/chat`** — executes the pair-based RAG simulation loop:
1. Accepts `conversationHistory` (last 6 turns) alongside the standard fields.
2. Retrieves top-6 pairs from ChromaDB by embedding the user message against stored context-window vectors.
3. Applies the **relevance gate** (`RELEVANCE_THRESHOLD = 1.3`): pairs at or above this distance are excluded from the few-shot prompt. For `nomic-embed-text`, cosine distances in the range 0.9–1.1 represent genuine semantic similarity; distances above 1.3 indicate no meaningful relation.
4. Builds a system prompt containing: a role declaration identifying the persona as a **real person** (not a fictional character), a brief style summary from the profile, and the usable pairs formatted as labelled few-shot examples. If no pairs pass the gate, the prompt notes this and instructs the LLM to rely on general style only.
5. Calls `chatWithOllama(systemPrompt, conversationHistory, message)`, passing history as structured chat turns so the model maintains coherence across the conversation.

---

### 11.7 Frontend Implementation (`components/ditto-studio.tsx`)

Key implementation decisions:

- **Conversation log** — the chat simulation panel now shows a scrollable monospace log above the message textarea, formatted as `DD/MM/YY, HH:MM - ROLE: content`. The textarea is used only for new input; the log accumulates across turns.
- **History passing** — before each simulation request, the last 6 `chatTurns` are mapped to `{ role, content }` objects and sent as `conversationHistory`. This enables the LLM to maintain multi-turn coherence without re-stating context in the user message.
- **Retrieved context display** — the Retrieved Context panel now shows `ConversationPair` cards. Each card displays the full multi-turn `contextWindow` in a monospace block and the persona's actual reply highlighted with a left border. Distance badges are colour-coded: **default** (dark) = distance < 1.0 (highly relevant), **secondary** = 1.0–1.3 (acceptable), **outline** = ≥ 1.3 (distant, not used in prompt).
- **Duplicate regex** — the same `CHAT_LINE_REGEX` used server-side is replicated in the component to extract persona options client-side without a network round-trip.
- **Format validation** — `hasValidChatFormat` runs a lightweight regex test before accepting a file.

---

## 12. System Testing

Since the project does not include an automated test suite, system testing was performed manually across functional, integration, and edge-case dimensions.

### 12.1 Unit-Level Verification

| Module | Test Case | Expected Outcome | Result |
|---|---|---|---|
| `chat-parser.ts` | Valid WhatsApp `.txt` file | Messages parsed with correct author, timestamp, content | Pass |
| `chat-parser.ts` | Multi-line message (continuation line) | Content appended to previous message | Pass |
| `chat-parser.ts` | `<Media omitted>` lines | Filtered out | Pass |
| `chat-parser.ts` | 12-hour AM/PM timestamp (`3:05 pm`) | Normalised to `15:05` | Pass |
| `chat-parser.ts` | `getConversationPairs` on 100-message chat | Pairs generated with non-empty contextWindow and reply | Pass |
| `chat-parser.ts` | Reply < 4 chars or bare URL | Pair skipped, not stored | Pass |
| `personality.ts` | Valid JSON returned by Ollama | Profile parsed correctly | Pass |
| `personality.ts` | Malformed/prose LLM response | Fallback profile returned, no crash | Pass |
| `ollama.ts` | Ollama service offline | Descriptive error with service URL thrown | Pass |
| `chroma.ts` | Re-running persona creation | Upsert deduplicates; no duplicate vectors | Pass |
| `chroma.ts` | Duplicate IDs in same batch | In-memory dedup removes before upsert | Pass |

### 12.2 API Integration Testing

| Endpoint | Scenario | Expected HTTP Status | Result |
|---|---|---|---|
| `POST /api/personas` | Missing `personaName` field | 400 Bad Request | Pass |
| `POST /api/personas` | `personaName` not found in chat | 400 — author not in chat | Pass |
| `POST /api/personas` | Valid request, Ollama running | 200 with PersonaRecord | Pass |
| `POST /api/personas/chat` | Missing `profile` field | 400 Bad Request | Pass |
| `POST /api/personas/chat` | Valid request after persona creation | 200 with reply + retrievedContext | Pass |
| `POST /api/personas/chat` | All pairs above relevance threshold | 200 — fallback style prompt used | Pass |
| `POST /api/personas/chat` | Ollama service offline | 500 with error detail | Pass |

### 12.3 End-to-End UI Testing

**Test Scenario 1 — Full Persona Creation Flow:**
1. Upload a WhatsApp `.txt` export → persona options auto-populate from the file.
2. Select a speaker and click **Create Persona** → loading state appears.
3. After 15–30 seconds (LLM call + embedding), the profile JSON and stats cards render correctly.
4. The stored pair count is displayed (will be less than total message count due to filtering and deduplication).

**Test Scenario 2 — Chat Simulation Flow:**
1. With a persona created, type a message and click **Simulate Reply**.
2. The reply appears in the monospace conversation log.
3. The **Retrieved Context** panel displays up to 6 pair cards, each showing the context window, the persona's actual reply, and a colour-coded distance badge.
4. Multiple turns accumulate correctly; subsequent replies maintain conversational coherence from the history.

**Test Scenario 3 — Edge Cases:**
- Uploading a non-WhatsApp file → error alert shown, no API call made.
- Attempting to chat before creating a persona → error alert shown.
- All retrieved pairs above the 1.3 threshold → system prompt switches to style-only mode; reply is still generated.
- Persona name that matches a well-known fictional character → role declaration in system prompt prevents character confusion.

### 12.4 Performance Observations

| Operation | Observed Duration |
|---|---|
| Chat parsing (500-message file) | < 50 ms (client-side) |
| Conversation pair extraction | < 10 ms (server-side) |
| Personality extraction (LLaMA 3, CPU) | 15 – 40 seconds |
| Embedding all pairs (nomic-embed-text) | 20 – 90 seconds (pair count dependent) |
| Chat simulation (single turn) | 10 – 25 seconds |
| Chroma vector query (top-6) | < 200 ms |

Performance is dominated by LLM inference time on CPU. GPU acceleration via CUDA or Apple Metal reduces generation time by approximately 3–5×. Embedding time scales with the number of conversation pairs extracted; a 500-message chat typically produces 300–400 storable pairs.

---

## 13. Results and Discussion

### 13.1 Persona Creation Results

When provided with a WhatsApp chat export of approximately 300–500 messages, DITTO successfully:

- **Parsed** all messages with correct author attribution, timestamp normalisation, and noise filtering in under 100 ms.
- **Extracted** conversation pairs via a 4-message sliding window, producing a semantically richer memory store than isolated individual messages.
- **Embedded and stored** the context side of each pair as 768-dimensional vectors in ChromaDB, enabling retrieval by situational similarity rather than surface-level word matching.
- **Generated** a structured `PersonalityProfile` from a representative sample of the persona's actual messages, with the LLM grounded in concrete evidence rather than abstract categorisation.

### 13.2 Chat Simulation Results

The pair-based RAG simulation with few-shot prompting produced substantially more authentic replies than the previous isolated-message approach:

- **Retrieved pairs were situationally relevant** — searching the context side of stored pairs surfaces situations that match the incoming message, not just semantically similar words from the reply side.
- **Few-shot examples from real pairs** allowed the LLM to pattern-match on actual response evidence rather than interpreting an abstract JSON profile description.
- **Conversation history** passed as structured chat turns prevented tone resets between turns and enabled coherent multi-turn exchanges.
- **The relevance gate** at distance 1.3 correctly excluded unrelated pairs while still providing examples for the majority of on-topic queries. When no relevant pairs were found, the system fell back to style-only guidance without crashing or generating off-brand responses.
- **Persona name disambiguation** — explicitly identifying the persona as a real person in the system prompt eliminated LLM hallucinations caused by names matching fictional characters or other associations in the model's training data.

### 13.3 Privacy and Offline Validation

All processing — parsing, embedding, generation, and storage — completed without any outbound network traffic to external servers. This validates the core design goal: the system is fully operable on an air-gapped machine.

### 13.4 Limitations

| Limitation | Impact | Mitigation |
|---|---|---|
| No automated test suite | Regressions may go undetected | Add Jest/Vitest unit tests for parser and pair extractor |
| LLM output variability | Reply quality varies between runs | Temperature tuning; structured output enforcement |
| Single-collection Chroma design | All personas share one collection | Partition into per-persona collections at scale |
| Session-only chat history | Conversation resets on page reload | Persist `chatTurns` to `localStorage` or a backend store |
| No authentication or multi-user support | Single-user, local deployment only | Add session management for shared deployments |
| Pair count grows with chat size | Embedding large chats takes longer | Batch-limit upserts; background processing |

### 13.5 Discussion

DITTO demonstrates that a fully local, privacy-preserving digital twin pipeline is achievable with commodity hardware and open-source tooling. The architectural evolution from **individual message storage** to **conversation-pair storage** is the most impactful design change: by embedding the context side of each (trigger → response) pair, the vector database retrieves *situations* that resemble the incoming message rather than *words* that resemble the reply — a fundamentally more useful retrieval signal for persona simulation.

The combination of few-shot examples drawn from real pairs, a strict system prompt that prevents AI-assistant behaviour, and multi-turn conversation history passed as structured chat turns produces persona simulations that are stylistically consistent, contextually grounded, and coherent across multiple exchanges — all without any fine-tuning or labelled training data.

Compared to cloud-based alternatives such as CharacterAI or GPT custom instructions, DITTO trades convenience for privacy and transparency: users can inspect the extracted profile in full, observe which context-reply pairs were retrieved and their distance scores, and verify that no data left their machine.

---

*End of Report*
