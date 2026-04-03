import PptxGenJS from "pptxgenjs";

const pres = new PptxGenJS();
pres.layout = "LAYOUT_16x9";
pres.title = "DITTO: Digital Twin Studio";

const C = {
  darkBg: "171717",
  lightBg: "FFFFFF",
  cardBg: "F5F5F5",
  cardBorder: "E5E5E5",
  tableBorder: "E5E5E5",
  teal: "171717",
  blue: "404040",
  midBlue: "737373",
  white: "FAFAFA",
  darkText: "0A0A0A",
  mutedText: "737373",
  darkCallout: "F5F5F5",
};

const makeShadow = () => ({ type: "outer", blur: 8, offset: 3, angle: 135, color: "000000", opacity: 0.12 });

type Slide = ReturnType<(typeof pres)["addSlide"]>;

function addHeader(slide: Slide, title: string) {
  slide.background = { color: C.lightBg };
  slide.addShape(pres.shapes.RECTANGLE, { x: 0, y: 0, w: 10, h: 0.75, fill: { color: C.darkBg }, line: { color: C.darkBg } });
  slide.addText(title, { x: 0.4, y: 0, w: 9.2, h: 0.75, fontSize: 20, bold: true, color: C.white, fontFace: "Arial", valign: "middle", margin: 0 });
}

// ===== SLIDE 1: TITLE =====
{
  const s = pres.addSlide();
  s.background = { color: C.darkBg };
  s.addShape(pres.shapes.RECTANGLE, { x: 0, y: 0, w: 10, h: 0.07, fill: { color: C.teal }, line: { color: C.teal } });
  s.addShape(pres.shapes.RECTANGLE, { x: 0, y: 5.555, w: 10, h: 0.07, fill: { color: C.teal }, line: { color: C.teal } });
  s.addShape(pres.shapes.RECTANGLE, { x: 0, y: 0, w: 0.15, h: 5.625, fill: { color: C.teal }, line: { color: C.teal } });
  s.addShape(pres.shapes.RECTANGLE, { x: 9.85, y: 0, w: 0.15, h: 5.625, fill: { color: C.teal }, line: { color: C.teal } });
  s.addText("DITTO", {
    x: 0.5, y: 0.9, w: 9, h: 1.5,
    fontSize: 80, bold: true, color: C.white, fontFace: "Arial Black", align: "left", margin: 0,
  });
  s.addText("Digital Twin Studio", {
    x: 0.5, y: 2.55, w: 9, h: 0.65,
    fontSize: 28, color: C.teal, fontFace: "Calibri", align: "left", margin: 0, charSpacing: 2,
  });
  s.addText("A local-first AI system for building and simulating personality-grounded\nconversational personas from raw chat history.", {
    x: 0.5, y: 3.35, w: 8.5, h: 1.0,
    fontSize: 14, color: "D4D4D4", fontFace: "Calibri", align: "left", margin: 0,
  });
  s.addText("Project Report", {
    x: 0.5, y: 4.85, w: 4, h: 0.4,
    fontSize: 12, color: "737373", fontFace: "Calibri", align: "left", margin: 0,
  });
}

// ===== SLIDE 2: BACKGROUND STUDY =====
{
  const s = pres.addSlide();
  addHeader(s, "Background Study");

  const cards = [
    {
      title: "Large Language Models (LLMs)",
      body: "Rapid growth of LLMs opened new possibilities for NLU and generation. A key emerging application is personality simulation — prompting AI to mimic a specific person's communication style based on their past messages.",
      x: 0.3, y: 0.88,
    },
    {
      title: "Retrieval-Augmented Generation (RAG)",
      body: "Enhances LLM responses by first retrieving semantically relevant documents from a vector database and injecting them into the prompt — grounding output in real evidence rather than hallucination.",
      x: 5.2, y: 0.88,
    },
    {
      title: "Conversation-Pair RAG",
      body: "A refinement of standard RAG that stores (trigger → response) pairs instead of isolated utterances. The embedding is on the trigger side so retrieval finds the most similar situations — and the paired response serves as a few-shot example.",
      x: 0.3, y: 3.2,
    },
    {
      title: "Ollama & ChromaDB",
      body: "Ollama: local inference runtime for LLaMA 3 — fully offline on consumer hardware. ChromaDB: open-source embeddable vector database suited for RAG pipelines. Together they enable a fully local, privacy-preserving pipeline.",
      x: 5.2, y: 3.2,
    },
  ];

  cards.forEach((c) => {
    s.addShape(pres.shapes.RECTANGLE, { x: c.x, y: c.y, w: 4.6, h: 2.15, fill: { color: C.cardBg }, line: { color: C.cardBorder, width: 1 }, shadow: makeShadow() });
    s.addShape(pres.shapes.RECTANGLE, { x: c.x, y: c.y, w: 0.07, h: 2.15, fill: { color: C.teal }, line: { color: C.teal } });
    s.addText(c.title, { x: c.x + 0.15, y: c.y + 0.1, w: 4.35, h: 0.45, fontSize: 12, bold: true, color: C.darkText, fontFace: "Arial", margin: 0 });
    s.addText(c.body, { x: c.x + 0.15, y: c.y + 0.62, w: 4.35, h: 1.38, fontSize: 10.5, color: C.mutedText, fontFace: "Calibri", margin: 0 });
  });
}

// ===== SLIDE 3: PROBLEM STATEMENT =====
{
  const s = pres.addSlide();
  addHeader(s, "Problem Statement");
  s.addText("Existing chatbot and persona systems typically require:", {
    x: 0.4, y: 1.0, w: 9.2, h: 0.4,
    fontSize: 13, color: "737373", fontFace: "Calibri", margin: 0,
  });

  const problems = [
    "Large annotated datasets",
    "Cloud-based APIs that expose private conversations to third-party servers",
    "Manual prompt engineering per person",
    "Re-training or fine-tuning of models",
  ];

  problems.forEach((p, i) => {
    s.addShape(pres.shapes.RECTANGLE, { x: 0.4, y: 1.56 + i * 0.65, w: 0.22, h: 0.22, fill: { color: C.teal }, line: { color: C.teal } });
    s.addText(p, { x: 0.75, y: 1.52 + i * 0.65, w: 9.0, h: 0.3, fontSize: 14, color: C.darkText, fontFace: "Calibri", margin: 0 });
  });

  s.addShape(pres.shapes.RECTANGLE, { x: 0.4, y: 4.25, w: 9.2, h: 1.15, fill: { color: "F5F5F5" }, line: { color: C.teal, width: 1 } });
  s.addShape(pres.shapes.RECTANGLE, { x: 0.4, y: 4.25, w: 0.07, h: 1.15, fill: { color: C.teal }, line: { color: C.teal } });
  s.addText(
    "There is no accessible, local tool that allows a user to upload a raw WhatsApp-style chat export, automatically extract a structured personality profile, store conversational pairs, and simulate responses in the style of a chosen participant — all without sending data to the cloud.",
    { x: 0.55, y: 4.33, w: 8.9, h: 1.0, fontSize: 11.5, color: "262626", fontFace: "Calibri", italic: true, margin: 0 }
  );
}

// ===== SLIDE 4: OBJECTIVES =====
{
  const s = pres.addSlide();
  addHeader(s, "Objectives of the Project");

  const objectives = [
    { num: "01", text: "Parse WhatsApp-format plain-text chat exports and extract per-author message sets." },
    { num: "02", text: "Automatically derive a structured PersonalityProfile (tone, style, vocabulary, sentiment) using an LLM prompt via Ollama." },
    { num: "03", text: "Extract (context window → persona reply) pairs from the chat and embed the context side for semantic retrieval in ChromaDB." },
    { num: "04", text: "Simulate replies grounded in few-shot examples from retrieved pairs, the personality profile, and the current conversation history." },
    { num: "05", text: "Gate retrieval quality — exclude semantically distant pairs and fall back to general style guidance when no relevant context exists." },
    { num: "06", text: "Keep the entire pipeline offline and private — no cloud APIs, no telemetry." },
  ];

  objectives.forEach((obj, i) => {
    const col = i % 2;
    const row = Math.floor(i / 2);
    const x = col === 0 ? 0.3 : 5.2;
    const y = 0.9 + row * 1.5;

    s.addShape(pres.shapes.RECTANGLE, { x, y, w: 4.6, h: 1.35, fill: { color: C.cardBg }, line: { color: C.cardBorder, width: 1 }, shadow: makeShadow() });
    s.addShape(pres.shapes.RECTANGLE, { x, y, w: 4.6, h: 0.32, fill: { color: row % 2 === 0 ? C.teal : C.blue }, line: { color: row % 2 === 0 ? C.teal : C.blue } });
    s.addText(obj.num, { x: x + 0.1, y: y + 0.04, w: 0.5, h: 0.25, fontSize: 12, bold: true, color: C.white, fontFace: "Arial", margin: 0 });
    s.addText(obj.text, { x: x + 0.1, y: y + 0.38, w: 4.4, h: 0.9, fontSize: 10.5, color: C.darkText, fontFace: "Calibri", margin: 0 });
  });
}

// ===== SLIDE 5: EXISTING SYSTEM =====
{
  const s = pres.addSlide();
  addHeader(s, "Existing System");

  const tableData = [
    [
      { text: "Aspect", options: { bold: true, color: C.white, fill: { color: C.blue }, fontSize: 11, fontFace: "Arial", align: "left" } },
      { text: "Current State", options: { bold: true, color: C.white, fill: { color: C.blue }, fontSize: 11, fontFace: "Arial", align: "left" } },
    ],
    ["Persona chatbots", "Rule-based or cloud-fine-tuned models (CharacterAI, GPT custom instructions)"],
    ["Chat analysis tools", "Manual — users export and read logs themselves"],
    ["Memory retrieval", "Not implemented in most consumer tools"],
    ["Privacy", "Cloud-dependent; chat data transmitted to external servers"],
    ["Accessibility", "Requires API keys, subscriptions, or ML expertise"],
  ];

  s.addTable(tableData, {
    x: 0.3, y: 0.9, w: 9.4, h: 2.5,
    colW: [2.5, 6.9],
    border: { pt: 0.5, color: C.tableBorder },
    fill: { color: C.cardBg },
    fontSize: 11, fontFace: "Calibri", color: C.darkText,
    rowH: 0.38,
  });

  s.addText("Drawbacks of Existing Systems", {
    x: 0.3, y: 3.55, w: 6, h: 0.35, fontSize: 13, bold: true, color: C.darkText, fontFace: "Arial", margin: 0,
  });

  s.addText([
    { text: "Privacy risk: raw personal conversations sent to third-party servers.", options: { bullet: true, breakLine: true } },
    { text: "No structured personality extraction from individual message history.", options: { bullet: true, breakLine: true } },
    { text: "No semantic memory — replies are not grounded in real past conversations.", options: { bullet: true, breakLine: true } },
    { text: "High barrier to entry (fine-tuning, API costs).", options: { bullet: true } },
  ], { x: 0.3, y: 3.95, w: 9.4, h: 1.5, fontSize: 11.5, fontFace: "Calibri", color: C.darkText });
}

// ===== SLIDE 6: PROPOSED SYSTEM =====
{
  const s = pres.addSlide();
  addHeader(s, "Proposed System");
  s.addText("DITTO is a local-first, RAG-powered digital twin studio consisting of:", {
    x: 0.4, y: 0.95, w: 9.2, h: 0.4, fontSize: 13, color: "737373", fontFace: "Calibri", margin: 0,
  });

  const components = [
    { label: "Next.js Web App", desc: "Clean UI for uploading exports, selecting personas, and simulating replies" },
    { label: "Chat Parser", desc: "Decodes WhatsApp-format exports and derives sliding-window (context → reply) pairs via a 4-message window for every persona message" },
    { label: "Personality Extractor", desc: "Uses Ollama/LLaMA 3 to produce a structured JSON profile; samples evenly across full chat history for representative coverage" },
    { label: "Vector Memory Store", desc: "ChromaDB ditto_pairs_v1 + nomic-embed-text embeds the context side of each pair — retrieval finds situations similar to the query" },
    { label: "Simulation Engine", desc: "Injects retrieved pairs as few-shot examples into a strict system prompt + passes conversation history as chat turns via /api/chat" },
    { label: "Relevance Gate", desc: "Excludes pairs with cosine distance ≥ 1.3 from the few-shot block; switches to style-only mode when no relevant context is found" },
  ];

  components.forEach((c, i) => {
    const y = 1.42 + i * 0.55;
    s.addShape(pres.shapes.RECTANGLE, { x: 0.4, y, w: 9.2, h: 0.47, fill: { color: "F5F5F5" }, line: { color: C.teal, width: 0.5 } });
    s.addShape(pres.shapes.RECTANGLE, { x: 0.4, y, w: 0.06, h: 0.47, fill: { color: C.teal }, line: { color: C.teal } });
    s.addText(c.label, { x: 0.55, y: y + 0.07, w: 2.3, h: 0.3, fontSize: 10.5, bold: true, color: C.teal, fontFace: "Arial", margin: 0 });
    s.addText(c.desc, { x: 2.9, y: y + 0.07, w: 6.6, h: 0.3, fontSize: 10.5, color: "262626", fontFace: "Calibri", margin: 0 });
  });
}

// ===== SLIDE 7: MODULE 1 — CHAT PARSER =====
{
  const s = pres.addSlide();
  addHeader(s, "Module 1: Chat Parser  ·  lib/chat-parser.ts");

  const features = [
    { label: "Input Format", desc: "Parses raw WhatsApp-exported .txt files line by line using regex: DD/MM/YY, H:MM [am/pm] - Author: Message" },
    { label: "Multi-line Messages", desc: "Handles multi-line messages — continuation lines are appended to the previous record automatically" },
    { label: "Noise Filtering", desc: "Strips noise lines: <Media omitted>, bare URLs, encryption notices, and blank lines" },
    { label: "Timestamp Normalisation", desc: "Normalises all timestamps to YYYY-MM-DD HH:MM (24-hour ISO format)" },
    { label: "Conversation Pairs", desc: "getConversationPairs() — 4-message sliding window. For each persona reply collects preceding context. Skips replies < 4 chars or bare URLs." },
    { label: "Exported Functions", desc: "parseChatHistory  ·  getPersonaMessages  ·  getConversationPairs  ·  getAverageWordsPerMessage" },
  ];

  features.forEach((f, i) => {
    const col = i % 2;
    const row = Math.floor(i / 2);
    const x = col === 0 ? 0.3 : 5.2;
    const y = 0.9 + row * 1.5;

    s.addShape(pres.shapes.RECTANGLE, { x, y, w: 4.6, h: 1.35, fill: { color: C.cardBg }, line: { color: C.cardBorder }, shadow: makeShadow() });
    s.addShape(pres.shapes.RECTANGLE, { x, y, w: 0.07, h: 1.35, fill: { color: C.teal }, line: { color: C.teal } });
    s.addText(f.label, { x: x + 0.15, y: y + 0.1, w: 4.35, h: 0.35, fontSize: 11.5, bold: true, color: C.darkText, fontFace: "Arial", margin: 0 });
    s.addText(f.desc, { x: x + 0.15, y: y + 0.52, w: 4.35, h: 0.75, fontSize: 10.5, color: C.mutedText, fontFace: "Calibri", margin: 0 });
  });
}

// ===== SLIDE 8: MODULE 2 — PERSONALITY EXTRACTOR =====
{
  const s = pres.addSlide();
  addHeader(s, "Module 2: Personality Extractor  ·  lib/personality.ts");

  const steps = [
    { step: "01", label: "Message Sampling", desc: "Samples up to 100 messages evenly distributed across the full chat history (stepped by index) so both early and late conversational patterns are captured." },
    { step: "02", label: "Phrase Hints", desc: "Computes top-8 frequent words (≥3 chars, appearing >1 time) from all persona messages as concrete phrase hints." },
    { step: "03", label: "LLM Prompt", desc: "Sends a structured prompt to Ollama with the persona's actual raw messages as evidence and a timestamped transcript. Instructs the LLM to describe observed behaviour, not generic categories. Returns JSON with 8 fields." },
    { step: "04", label: "JSON Extraction", desc: "Extracts the JSON block from the raw LLM response using brace-matching to handle any surrounding prose or commentary." },
    { step: "05", label: "Fallback", desc: "Falls back gracefully to a default profile if JSON extraction fails, ensuring the pipeline never crashes." },
  ];

  steps.forEach((step, i) => {
    const y = 0.95 + i * 0.87;
    s.addShape(pres.shapes.RECTANGLE, { x: 0.3, y, w: 9.4, h: 0.78, fill: { color: C.cardBg }, line: { color: C.cardBorder }, shadow: makeShadow() });
    s.addShape(pres.shapes.RECTANGLE, { x: 0.3, y, w: 0.75, h: 0.78, fill: { color: i % 2 === 0 ? C.teal : C.blue }, line: { color: i % 2 === 0 ? C.teal : C.blue } });
    s.addText(step.step, { x: 0.3, y, w: 0.75, h: 0.78, fontSize: 18, bold: true, color: C.white, fontFace: "Arial Black", align: "center", valign: "middle", margin: 0 });
    s.addText(step.label, { x: 1.15, y: y + 0.06, w: 2.5, h: 0.3, fontSize: 12, bold: true, color: C.darkText, fontFace: "Arial", margin: 0 });
    s.addText(step.desc, { x: 1.15, y: y + 0.4, w: 8.4, h: 0.32, fontSize: 10.5, color: C.mutedText, fontFace: "Calibri", margin: 0 });
  });
}

// ===== SLIDE 9: MODULE 3 — OLLAMA CLIENT =====
{
  const s = pres.addSlide();
  addHeader(s, "Module 3: Ollama Client  ·  lib/ollama.ts");
  s.addText("Thin HTTP wrapper around the Ollama REST API", {
    x: 0.4, y: 0.9, w: 9.2, h: 0.35, fontSize: 12, color: "737373", fontFace: "Calibri", margin: 0,
  });

  const funcs = [
    {
      name: "generateWithOllama(prompt)",
      endpoint: "POST /api/generate",
      detail: "Calls Ollama with LLaMA 3 at temperature 0.7. Used only for personality profile extraction.",
    },
    {
      name: "chatWithOllama(system, history[], userMessage)",
      endpoint: "POST /api/chat",
      detail: "Sends system role + prior conversation history + current user message as structured chat turns. Temperature 0.85. Used for all persona simulation — enables multi-turn coherence.",
    },
    {
      name: "embedWithOllama(texts[])",
      endpoint: "POST /api/embed",
      detail: "Embeds an array of strings using nomic-embed-text. Supports both embeddings[] (current) and legacy embedding response shapes for compatibility.",
    },
  ];

  funcs.forEach((f, i) => {
    const y = 1.38 + i * 1.08;
    s.addShape(pres.shapes.RECTANGLE, { x: 0.4, y, w: 9.2, h: 0.95, fill: { color: "F5F5F5" }, line: { color: C.teal, width: 1 } });
    s.addShape(pres.shapes.RECTANGLE, { x: 0.4, y, w: 0.07, h: 0.95, fill: { color: C.teal }, line: { color: C.teal } });
    s.addText(f.name, { x: 0.6, y: y + 0.07, w: 8.8, h: 0.3, fontSize: 11.5, bold: true, color: C.teal, fontFace: "Consolas", margin: 0 });
    s.addText(f.endpoint, { x: 0.6, y: y + 0.42, w: 3.5, h: 0.22, fontSize: 10, color: "262626", fontFace: "Consolas", margin: 0 });
    s.addText(f.detail, { x: 0.6, y: y + 0.65, w: 8.8, h: 0.25, fontSize: 10.5, color: "262626", fontFace: "Calibri", margin: 0 });
  });

  s.addText([
    { text: "OLLAMA_URL — Ollama server address (default: http://127.0.0.1:11434)", options: { bullet: true, breakLine: true } },
    { text: "OLLAMA_MODEL — Generation model name (default: llama3)", options: { bullet: true, breakLine: true } },
    { text: "OLLAMA_EMBED_MODEL — Embedding model name (default: nomic-embed-text)", options: { bullet: true } },
  ], { x: 0.4, y: 4.7, w: 9.2, h: 0.72, fontSize: 10.5, color: "262626", fontFace: "Consolas" });
}

// ===== SLIDE 10: MODULE 4 — CHROMA MEMORY STORE =====
{
  const s = pres.addSlide();
  addHeader(s, "Module 4: Chroma Memory Store  ·  lib/chroma.ts");
  s.addText("Manages the ditto_pairs_v1 ChromaDB collection — stores (context window → persona reply) pairs", {
    x: 0.4, y: 0.9, w: 9.2, h: 0.35, fontSize: 12, color: "737373", fontFace: "Calibri", margin: 0,
  });

  const funcs = [
    {
      name: "storeConversationPairs(personaName, pairs[])",
      desc: "Embeds the contextWindow text of each pair via Ollama, then upserts with personaReply as the document. IDs are SHA-1 of personaName:contextWindow:reply. In-memory dedup runs before upsert to prevent batch collisions.",
    },
    {
      name: "queryConversationPairs(personaName, queryText, limit=6)",
      desc: "Embeds the incoming user message, queries ChromaDB with a personaName $eq filter, and returns ConversationPair[] sorted by cosine distance. Used to find the most situationally similar past exchanges.",
    },
  ];

  funcs.forEach((f, i) => {
    const y = 1.45 + i * 1.7;
    s.addShape(pres.shapes.RECTANGLE, { x: 0.4, y, w: 9.2, h: 1.5, fill: { color: "F5F5F5" }, line: { color: C.teal, width: 1 } });
    s.addShape(pres.shapes.RECTANGLE, { x: 0.4, y, w: 0.07, h: 1.5, fill: { color: C.teal }, line: { color: C.teal } });
    s.addText(f.name, { x: 0.6, y: y + 0.1, w: 8.8, h: 0.4, fontSize: 12, bold: true, color: C.teal, fontFace: "Consolas", margin: 0 });
    s.addText(f.desc, { x: 0.6, y: y + 0.58, w: 8.8, h: 0.82, fontSize: 11, color: "262626", fontFace: "Calibri", margin: 0 });
  });

  s.addShape(pres.shapes.RECTANGLE, { x: 0.4, y: 4.95, w: 9.2, h: 0.5, fill: { color: "F5F5F5" }, line: { color: C.teal, width: 0.5 } });
  s.addText("Collection: ditto_pairs_v1  ·  Embedding: nomic-embed-text (context side)  ·  Config: CHROMA_URL env var", {
    x: 0.55, y: 5.0, w: 9.0, h: 0.4, fontSize: 10.5, color: "262626", fontFace: "Consolas", margin: 0,
  });
}

// ===== SLIDE 11: MODULE 5 — API ROUTES =====
{
  const s = pres.addSlide();
  addHeader(s, "Module 5: API Routes  ·  app/api/personas/");

  // POST /api/personas
  s.addShape(pres.shapes.RECTANGLE, { x: 0.3, y: 0.9, w: 9.4, h: 2.2, fill: { color: C.cardBg }, line: { color: C.cardBorder }, shadow: makeShadow() });
  s.addShape(pres.shapes.RECTANGLE, { x: 0.3, y: 0.9, w: 9.4, h: 0.36, fill: { color: C.blue }, line: { color: C.blue } });
  s.addText("POST /api/personas  —  Create Persona", {
    x: 0.5, y: 0.9, w: 9.0, h: 0.36, fontSize: 13, bold: true, color: C.white, fontFace: "Consolas", valign: "middle", margin: 0,
  });
  s.addText([
    { text: "Validates request body (personaName, chatHistory)", options: { bullet: { type: "number" }, breakLine: true } },
    { text: "Parses full chat into ChatMessage[], confirms persona has messages, computes PersonaSummary stats", options: { bullet: { type: "number" }, breakLine: true } },
    { text: "Calls getConversationPairs() to extract all (context → reply) pairs from the full thread", options: { bullet: { type: "number" }, breakLine: true } },
    { text: "Calls buildPersonalityProfile (Ollama) + storeConversationPairs (Chroma) in sequence; returns CreatePersonaResponse", options: { bullet: { type: "number" } } },
  ], { x: 0.5, y: 1.32, w: 9.0, h: 1.65, fontSize: 11, fontFace: "Calibri", color: C.darkText });

  // POST /api/personas/chat
  s.addShape(pres.shapes.RECTANGLE, { x: 0.3, y: 3.25, w: 9.4, h: 2.2, fill: { color: C.cardBg }, line: { color: C.cardBorder }, shadow: makeShadow() });
  s.addShape(pres.shapes.RECTANGLE, { x: 0.3, y: 3.25, w: 9.4, h: 0.36, fill: { color: C.teal }, line: { color: C.teal } });
  s.addText("POST /api/personas/chat  —  Chat Simulation", {
    x: 0.5, y: 3.25, w: 9.0, h: 0.36, fontSize: 13, bold: true, color: C.white, fontFace: "Consolas", valign: "middle", margin: 0,
  });
  s.addText([
    { text: "Validates personaName, message, profile; accepts conversationHistory (last 6 turns)", options: { bullet: { type: "number" }, breakLine: true } },
    { text: "Queries top-6 nearest pairs from ChromaDB by embedding user message against context-side vectors", options: { bullet: { type: "number" }, breakLine: true } },
    { text: "Relevance gate: pairs with distance ≥ 1.3 excluded from few-shot prompt (shown in UI as 'distant')", options: { bullet: { type: "number" }, breakLine: true } },
    { text: "Calls chatWithOllama(systemPrompt, history, message) — returns reply + all retrieved pairs", options: { bullet: { type: "number" } } },
  ], { x: 0.5, y: 3.67, w: 9.0, h: 1.65, fontSize: 11, fontFace: "Calibri", color: C.darkText });
}

// ===== SLIDE 12: MODULE 6 — UI =====
{
  const s = pres.addSlide();
  addHeader(s, "Module 6: UI — Ditto Studio  ·  components/ditto-studio.tsx");

  s.addText("Single-page React component with six visual sections:", {
    x: 0.4, y: 0.85, w: 9, h: 0.35, fontSize: 12, color: C.mutedText, fontFace: "Calibri", margin: 0,
  });

  const sections = [
    { num: "1", title: "Hero Card", desc: "Project overview and feature rows (icon + title + description, no grid)", color: C.teal },
    { num: "2", title: "System Status Card", desc: "Live display of stack: Next.js App Router, Ollama llama3, Chroma ditto_pairs_v1, nomic-embed-text", color: C.blue },
    { num: "3", title: "Create Persona Panel", desc: "File upload, format validation, speaker detection radio group, chat preview, persona creation trigger", color: C.midBlue },
    { num: "4", title: "Chat Simulation Panel", desc: "Scrollable monospace conversation log, message textarea, simulate button — last 6 turns sent as conversationHistory", color: C.teal },
    { num: "5", title: "Extracted Profile Panel", desc: "Summary stats and raw JSON profile viewer", color: C.blue },
    { num: "6", title: "Retrieved Context Panel", desc: "Per-pair cards: context window (monospace), persona reply (left-border highlight), timestamp + colour-coded distance badge", color: C.midBlue },
  ];

  sections.forEach((sec, i) => {
    const col = i % 2;
    const row = Math.floor(i / 2);
    const x = col === 0 ? 0.3 : 5.2;
    const y = 1.3 + row * 1.38;

    s.addShape(pres.shapes.RECTANGLE, { x, y, w: 4.6, h: 1.25, fill: { color: C.cardBg }, line: { color: C.cardBorder }, shadow: makeShadow() });
    s.addShape(pres.shapes.OVAL, { x: x + 0.12, y: y + 0.12, w: 0.38, h: 0.38, fill: { color: sec.color }, line: { color: sec.color } });
    s.addText(sec.num, { x: x + 0.12, y: y + 0.12, w: 0.38, h: 0.38, fontSize: 12, bold: true, color: C.white, fontFace: "Arial", align: "center", valign: "middle", margin: 0 });
    s.addText(sec.title, { x: x + 0.62, y: y + 0.13, w: 3.85, h: 0.36, fontSize: 12, bold: true, color: C.darkText, fontFace: "Arial", margin: 0 });
    s.addText(sec.desc, { x: x + 0.15, y: y + 0.58, w: 4.35, h: 0.58, fontSize: 10.5, color: C.mutedText, fontFace: "Calibri", margin: 0 });
  });
}

// ===== SLIDE 13: SOFTWARE REQUIREMENTS =====
{
  const s = pres.addSlide();
  addHeader(s, "Software Requirements");

  const swRows = [
    [
      { text: "Component", options: { bold: true, color: C.white, fill: { color: C.blue }, fontSize: 10, fontFace: "Arial" } },
      { text: "Technology", options: { bold: true, color: C.white, fill: { color: C.blue }, fontSize: 10, fontFace: "Arial" } },
      { text: "Version / Notes", options: { bold: true, color: C.white, fill: { color: C.blue }, fontSize: 10, fontFace: "Arial" } },
    ],
    ["Frontend framework", "Next.js (App Router)", "v16+"],
    ["UI language", "TypeScript + React", "React 19+"],
    ["Component library", "shadcn/ui (Radix + Tailwind)", "Latest"],
    ["Local LLM runtime", "Ollama", "Latest stable"],
    ["LLM model", "LLaMA 3 (llama3)", "Meta via Ollama"],
    ["Embedding model", "nomic-embed-text", "Via Ollama"],
    ["Vector database", "ChromaDB", "v0.5+ (REST API)"],
    ["ChromaDB client", "chromadb npm package", "Latest"],
    ["Node.js", "Node.js", "v18+"],
    ["Package manager", "bun", "—"],
  ];

  s.addTable(swRows, {
    x: 0.3, y: 0.9, w: 9.4, h: 4.55,
    colW: [2.5, 3.5, 3.4],
    border: { pt: 0.5, color: C.tableBorder },
    fill: { color: C.cardBg },
    fontSize: 10.5, fontFace: "Calibri", color: C.darkText,
    rowH: 0.4,
  });
}

// ===== SLIDE 14: ENV VARS + HARDWARE REQUIREMENTS =====
{
  const s = pres.addSlide();
  addHeader(s, "Environment Variables & Hardware Requirements");

  s.addText("Environment Variables", {
    x: 0.3, y: 0.85, w: 5, h: 0.35, fontSize: 13, bold: true, color: C.darkText, fontFace: "Arial", margin: 0,
  });

  const envRows = [
    [
      { text: "Variable", options: { bold: true, color: C.white, fill: { color: C.teal }, fontSize: 10, fontFace: "Arial" } },
      { text: "Default", options: { bold: true, color: C.white, fill: { color: C.teal }, fontSize: 10, fontFace: "Arial" } },
      { text: "Purpose", options: { bold: true, color: C.white, fill: { color: C.teal }, fontSize: 10, fontFace: "Arial" } },
    ],
    ["OLLAMA_URL", "http://127.0.0.1:11434", "Ollama server address"],
    ["OLLAMA_MODEL", "llama3", "Generation model name"],
    ["OLLAMA_EMBED_MODEL", "nomic-embed-text", "Embedding model name"],
    ["CHROMA_URL", "http://127.0.0.1:8000", "ChromaDB server address"],
  ];

  s.addTable(envRows, {
    x: 0.3, y: 1.25, w: 9.4, h: 1.85,
    colW: [2.8, 3.2, 3.4],
    border: { pt: 0.5, color: C.tableBorder },
    fill: { color: C.cardBg },
    fontSize: 10, fontFace: "Consolas", color: C.darkText,
    rowH: 0.36,
  });

  s.addText("Hardware Requirements (Minimum)", {
    x: 0.3, y: 3.25, w: 6, h: 0.35, fontSize: 13, bold: true, color: C.darkText, fontFace: "Arial", margin: 0,
  });

  const hwRows = [
    [
      { text: "Resource", options: { bold: true, color: C.white, fill: { color: C.blue }, fontSize: 10, fontFace: "Arial" } },
      { text: "Requirement", options: { bold: true, color: C.white, fill: { color: C.blue }, fontSize: 10, fontFace: "Arial" } },
    ],
    ["CPU", "4-core x86-64 (Apple Silicon supported)"],
    ["RAM", "8 GB (16 GB recommended for LLaMA 3 8B)"],
    ["Storage", "10 GB free (model weights + ChromaDB data)"],
    ["OS", "Windows 10/11, macOS 12+, or Linux"],
    ["GPU", "Optional — CUDA/Metal acceleration speeds inference"],
  ];

  s.addTable(hwRows, {
    x: 0.3, y: 3.65, w: 9.4, h: 1.8,
    colW: [2.0, 7.4],
    border: { pt: 0.5, color: C.tableBorder },
    fill: { color: C.cardBg },
    fontSize: 10.5, fontFace: "Calibri", color: C.darkText,
    rowH: 0.32,
  });
}

// ===== SLIDE 15: DATA FLOW — PERSONA CREATION =====
{
  const s = pres.addSlide();
  addHeader(s, "Data Flow: Persona Creation");

  const steps = [
    { label: "User", action: "Uploads .txt chat export file via browser UI" },
    { label: "Chat Parser", action: "Regex parse each line → ChatMessage[]  ·  Filter noise, normalise timestamps  ·  Filter by selected personaName" },
    { label: "Pair Extractor", action: "getConversationPairs() — 4-message sliding window over full thread → { contextWindow, personaReply, timestamp }[]" },
    { label: "Personality Extractor", action: "Evenly sample up to 100 messages across full history  ·  Build LLM prompt with raw message evidence" },
    { label: "Ollama — LLaMA 3", action: "POST /api/generate → structured JSON PersonalityProfile  ·  Extract via brace-matching  ·  Validate & fill fallback fields" },
    { label: "nomic-embed-text", action: "Embed contextWindow side of each pair → float[][] vectors (768 dimensions per context window)" },
    { label: "ChromaDB — ditto_pairs_v1", action: "Upsert pairs: embedding on context, document = personaReply, metadata: personaName + contextWindow + timestamp" },
    { label: "API → UI", action: "Return PersonaRecord + storedPairs count  ·  Display profile JSON + summary stats in browser" },
  ];

  const stepH = 0.58;
  const shapeH = 0.5;
  steps.forEach((step, i) => {
    const y = 0.82 + i * stepH;
    const isEven = i % 2 === 0;
    s.addShape(pres.shapes.RECTANGLE, { x: 0.3, y, w: 9.4, h: shapeH, fill: { color: isEven ? "F5F5F5" : "E5E5E5" }, line: { color: isEven ? C.blue : C.teal, width: 0.5 } });
    s.addShape(pres.shapes.RECTANGLE, { x: 0.3, y, w: 1.7, h: shapeH, fill: { color: isEven ? C.blue : C.teal }, line: { color: isEven ? C.blue : C.teal } });
    s.addText(step.label, { x: 0.3, y, w: 1.7, h: shapeH, fontSize: 9.5, bold: true, color: C.white, fontFace: "Arial", align: "center", valign: "middle", margin: 0 });
    s.addText(step.action, { x: 2.1, y: y + 0.07, w: 7.5, h: 0.35, fontSize: 9.5, color: "262626", fontFace: "Calibri", margin: 0 });
  });
}

// ===== SLIDE 16: DATA FLOW — CHAT SIMULATION =====
{
  const s = pres.addSlide();
  addHeader(s, "Data Flow: Chat Simulation");

  const steps = [
    { label: "User", action: "Types a message in the Chat Simulation panel (Enter to send)" },
    { label: "POST /chat", action: "Receive: personaName, message, profile, conversationHistory (last 6 turns)  ·  Validate request body" },
    { label: "nomic-embed-text", action: "Embed user message → query vector (768 dimensions)" },
    { label: "ChromaDB Query", action: "Filter by personaName  ·  Return top-6 nearest pairs (contextWindow, personaReply, distance)" },
    { label: "Relevance Gate", action: "distance < 1.3 → usable few-shot example  ·  distance ≥ 1.3 → excluded from prompt, shown as 'distant' in UI" },
    { label: "Prompt Builder", action: "System: role declaration + style summary + few-shot [Context]/[reply] examples (usable pairs only)" },
    { label: "Ollama — LLaMA 3", action: "POST /api/chat with [system, ...conversationHistory, user]  ·  temperature 0.85  ·  returns reply" },
    { label: "API → UI", action: "Display reply in monospace chat log  ·  Display pair cards with colour-coded distance badges" },
  ];

  const stepH = 0.58;
  const shapeH = 0.5;
  steps.forEach((step, i) => {
    const y = 0.82 + i * stepH;
    const isEven = i % 2 === 0;
    s.addShape(pres.shapes.RECTANGLE, { x: 0.3, y, w: 9.4, h: shapeH, fill: { color: isEven ? "F5F5F5" : "E5E5E5" }, line: { color: isEven ? C.blue : C.teal, width: 0.5 } });
    s.addShape(pres.shapes.RECTANGLE, { x: 0.3, y, w: 1.7, h: shapeH, fill: { color: isEven ? C.blue : C.teal }, line: { color: isEven ? C.blue : C.teal } });
    s.addText(step.label, { x: 0.3, y, w: 1.7, h: shapeH, fontSize: 9.5, bold: true, color: C.white, fontFace: "Arial", align: "center", valign: "middle", margin: 0 });
    s.addText(step.action, { x: 2.1, y: y + 0.07, w: 7.5, h: 0.35, fontSize: 9.5, color: "262626", fontFace: "Calibri", margin: 0 });
  });
}

// ===== SLIDE 16A: PROJECT FLOWCHART =====
{
  const s = pres.addSlide();
  addHeader(s, "Architecture Flowchart");

  s.addText(
    "High-level module view of the DITTO pipeline across the frontend, API routes, parsing, pair extraction, profile extraction, embeddings, vector memory, and reply generation.",
    { x: 0.4, y: 0.88, w: 9.2, h: 0.35, fontSize: 11.5, color: "737373", fontFace: "Calibri", margin: 0 }
  );

  s.addShape(pres.shapes.RECTANGLE, {
    x: 0.45, y: 1.3, w: 9.1, h: 3.8,
    fill: { color: "F5F5F5" },
    line: { color: C.cardBorder, width: 1 },
    shadow: makeShadow(),
  });

  s.addImage({
    path: "docs/PROJECT_FLOWCHART.png",
    x: 3.37,
    y: 1.32,
    w: 3.26,
    h: 3.76,
  });

  s.addText(
    "Flowchart source: docs/PROJECT_FLOWCHART.mmd",
    { x: 0.55, y: 5.18, w: 8.9, h: 0.22, fontSize: 9.5, color: "262626", fontFace: "Consolas", italic: true, margin: 0 }
  );
}

// ===== SLIDE 17: TABLE DESIGN — CHROMADB COLLECTION =====
{
  const s = pres.addSlide();
  addHeader(s, "Table Design: ChromaDB Collection  ·  ditto_pairs_v1");

  s.addText(
    "DITTO uses ChromaDB (a vector database) rather than a relational database. Data is stored as conversation pairs — embedding on the context side, reply as the document.",
    { x: 0.3, y: 0.85, w: 9.4, h: 0.42, fontSize: 11, color: C.mutedText, fontFace: "Calibri", margin: 0 }
  );

  const chromaRows = [
    [
      { text: "Field", options: { bold: true, color: C.white, fill: { color: C.blue }, fontSize: 11, fontFace: "Arial" } },
      { text: "Type", options: { bold: true, color: C.white, fill: { color: C.blue }, fontSize: 11, fontFace: "Arial" } },
      { text: "Description", options: { bold: true, color: C.white, fill: { color: C.blue }, fontSize: 11, fontFace: "Arial" } },
    ],
    ["id", "string", "SHA-1 of personaName:contextWindow:personaReply — stable dedup key"],
    ["embedding", "float[]", "nomic-embed-text vector of the context window (768 dimensions)"],
    ["document", "string", "The persona's reply text"],
    ["metadata.personaName", "string", "The persona this pair belongs to"],
    ["metadata.contextWindow", "string", "The multi-turn context that preceded the reply"],
    ["metadata.timestamp", "string", "Normalised ISO-style timestamp of the reply (YYYY-MM-DD HH:MM)"],
  ];

  s.addTable(chromaRows, {
    x: 0.3, y: 1.38, w: 9.4, h: 2.85,
    colW: [2.8, 1.4, 5.2],
    border: { pt: 0.5, color: C.tableBorder },
    fill: { color: C.cardBg },
    fontSize: 11, fontFace: "Calibri", color: C.darkText,
    rowH: 0.4,
  });

  s.addShape(pres.shapes.RECTANGLE, { x: 0.3, y: 4.4, w: 9.4, h: 0.9, fill: { color: C.darkCallout }, line: { color: C.blue, width: 0.5 } });
  s.addShape(pres.shapes.RECTANGLE, { x: 0.3, y: 4.4, w: 0.07, h: 0.9, fill: { color: C.blue }, line: { color: C.blue } });
  s.addText(
    "Key insight: embedding the context side means ChromaDB retrieval answers \"what situation is most similar to the user's message?\" rather than \"what did the persona say that sounds similar?\" — a more useful signal for persona simulation.",
    { x: 0.45, y: 4.45, w: 9.1, h: 0.8, fontSize: 10.5, color: "262626", fontFace: "Calibri", margin: 0 }
  );
}

// ===== SLIDE 18: TYPESCRIPT TYPES — ChatMessage & PersonalityProfile =====
{
  const s = pres.addSlide();
  addHeader(s, "TypeScript Data Structures — ChatMessage & PersonalityProfile");

  s.addText("ChatMessage — Parsed message unit", {
    x: 0.3, y: 0.85, w: 9.4, h: 0.35, fontSize: 13, bold: true, color: C.darkText, fontFace: "Arial", margin: 0,
  });

  s.addTable([
    [
      { text: "Field", options: { bold: true, color: C.white, fill: { color: C.teal }, fontSize: 10, fontFace: "Arial" } },
      { text: "Type", options: { bold: true, color: C.white, fill: { color: C.teal }, fontSize: 10, fontFace: "Arial" } },
      { text: "Description", options: { bold: true, color: C.white, fill: { color: C.teal }, fontSize: 10, fontFace: "Arial" } },
    ],
    ["id", "string", "SHA-1 hash of the raw line"],
    ["timestamp", "string", "Normalised timestamp (YYYY-MM-DD HH:MM)"],
    ["author", "string", "Sender name extracted from chat"],
    ["content", "string", "Cleaned message body"],
    ["raw", "string", "Original unmodified line"],
  ], {
    x: 0.3, y: 1.25, w: 9.4, h: 2.05,
    colW: [1.8, 1.4, 6.2],
    border: { pt: 0.5, color: C.tableBorder }, fill: { color: C.cardBg },
    fontSize: 10.5, fontFace: "Calibri", color: C.darkText, rowH: 0.36,
  });

  s.addText("PersonalityProfile — LLM-extracted persona profile", {
    x: 0.3, y: 3.42, w: 9.4, h: 0.35, fontSize: 13, bold: true, color: C.darkText, fontFace: "Arial", margin: 0,
  });

  s.addTable([
    [
      { text: "Field", options: { bold: true, color: C.white, fill: { color: C.blue }, fontSize: 10, fontFace: "Arial" } },
      { text: "Type", options: { bold: true, color: C.white, fill: { color: C.blue }, fontSize: 10, fontFace: "Arial" } },
      { text: "Description", options: { bold: true, color: C.white, fill: { color: C.blue }, fontSize: 10, fontFace: "Arial" } },
    ],
    ["tone", "string", "Overall conversational tone (e.g. \"casual and warm\")"],
    ["communicationStyle", "string", "How the person structures messages"],
    ["responseLength", "string", "Typical length pattern (short / medium / long)"],
    ["commonPhrases", "string[]", "Frequently used words or expressions (up to 8)"],
    ["sentiment", "string", "Dominant emotional register"],
    ["vocabularyPatterns", "string[]", "Characteristic word choices (up to 6)"],
    ["relationshipSignals", "string[]", "Indicators of social dynamics (up to 6)"],
    ["notes", "string", "Free-form LLM observations"],
  ], {
    x: 0.3, y: 3.82, w: 9.4, h: 1.72,
    colW: [2.2, 1.2, 6.0],
    border: { pt: 0.5, color: C.tableBorder }, fill: { color: C.cardBg },
    fontSize: 9.5, fontFace: "Calibri", color: C.darkText, rowH: 0.19,
  });
}

// ===== SLIDE 19: TYPESCRIPT TYPES — ConversationPair & API Responses =====
{
  const s = pres.addSlide();
  addHeader(s, "TypeScript Data Structures — API Types");

  // Left column
  s.addText("PersonaSummary", { x: 0.3, y: 0.85, w: 4.5, h: 0.3, fontSize: 12, bold: true, color: C.darkText, fontFace: "Arial", margin: 0 });
  s.addTable([
    [
      { text: "Field", options: { bold: true, color: C.white, fill: { color: C.teal }, fontSize: 9.5 } },
      { text: "Type", options: { bold: true, color: C.white, fill: { color: C.teal }, fontSize: 9.5 } },
      { text: "Description", options: { bold: true, color: C.white, fill: { color: C.teal }, fontSize: 9.5 } },
    ],
    ["personaName", "string", "Selected speaker name"],
    ["totalMessages", "number", "Count of persona messages"],
    ["averageWordsPerMessage", "number", "Mean word count per message"],
    ["sourceAuthors", "string[]", "All unique authors in the full chat"],
  ], { x: 0.3, y: 1.2, w: 4.55, h: 1.5, colW: [1.5, 0.9, 2.15], border: { pt: 0.5, color: C.tableBorder }, fill: { color: C.cardBg }, fontSize: 9.5, fontFace: "Calibri", color: C.darkText, rowH: 0.28 });

  s.addText("ConversationPair", { x: 0.3, y: 2.82, w: 4.5, h: 0.3, fontSize: 12, bold: true, color: C.darkText, fontFace: "Arial", margin: 0 });
  s.addTable([
    [
      { text: "Field", options: { bold: true, color: C.white, fill: { color: C.midBlue }, fontSize: 9.5 } },
      { text: "Type", options: { bold: true, color: C.white, fill: { color: C.midBlue }, fontSize: 9.5 } },
      { text: "Description", options: { bold: true, color: C.white, fill: { color: C.midBlue }, fontSize: 9.5 } },
    ],
    ["contextWindow", "string", "Multi-turn messages that preceded the reply"],
    ["personaReply", "string", "What the persona actually said"],
    ["timestamp", "string", "Timestamp of the reply"],
    ["distance", "number | null", "Cosine distance from query vector (lower = more similar)"],
  ], { x: 0.3, y: 3.17, w: 4.55, h: 1.52, colW: [1.3, 1.15, 2.1], border: { pt: 0.5, color: C.tableBorder }, fill: { color: C.cardBg }, fontSize: 9.5, fontFace: "Calibri", color: C.darkText, rowH: 0.3 });

  // Right column
  s.addText("CreatePersonaResponse", { x: 5.1, y: 0.85, w: 4.5, h: 0.3, fontSize: 12, bold: true, color: C.darkText, fontFace: "Arial", margin: 0 });
  s.addTable([
    [
      { text: "Field", options: { bold: true, color: C.white, fill: { color: C.teal }, fontSize: 9.5 } },
      { text: "Type", options: { bold: true, color: C.white, fill: { color: C.teal }, fontSize: 9.5 } },
      { text: "Description", options: { bold: true, color: C.white, fill: { color: C.teal }, fontSize: 9.5 } },
    ],
    ["persona.summary", "PersonaSummary", "Aggregate statistics"],
    ["persona.profile", "PersonalityProfile", "Extracted JSON profile"],
    ["persona.sampleMessages", "ChatMessage[]", "First 6 persona messages (preview)"],
    ["storedMemories", "number", "Count of pairs upserted to ChromaDB"],
  ], { x: 5.1, y: 1.2, w: 4.55, h: 1.5, colW: [1.6, 1.5, 1.45], border: { pt: 0.5, color: C.tableBorder }, fill: { color: C.cardBg }, fontSize: 9.5, fontFace: "Calibri", color: C.darkText, rowH: 0.28 });

  s.addText("ChatSimulationResponse", { x: 5.1, y: 2.97, w: 4.5, h: 0.3, fontSize: 12, bold: true, color: C.darkText, fontFace: "Arial", margin: 0 });
  s.addTable([
    [
      { text: "Field", options: { bold: true, color: C.white, fill: { color: C.blue }, fontSize: 9.5 } },
      { text: "Type", options: { bold: true, color: C.white, fill: { color: C.blue }, fontSize: 9.5 } },
      { text: "Description", options: { bold: true, color: C.white, fill: { color: C.blue }, fontSize: 9.5 } },
    ],
    ["reply", "string", "LLM-generated persona reply"],
    ["retrievedContext", "ConversationPair[]", "Top-K pairs used to ground the reply"],
  ], { x: 5.1, y: 3.32, w: 4.55, h: 0.9, colW: [1.5, 1.6, 1.45], border: { pt: 0.5, color: C.tableBorder }, fill: { color: C.cardBg }, fontSize: 9.5, fontFace: "Calibri", color: C.darkText, rowH: 0.28 });
}

// ===== SLIDE 20: IMPLEMENTATION — DEV ENVIRONMENT =====
{
  const s = pres.addSlide();
  addHeader(s, "Implementation: Development Environment Setup");

  const cards = [
    {
      title: "Frontend Stack",
      body: "Next.js 16 (App Router) + React 19 + TypeScript throughout. Dev server runs with Turbopack (bun run dev) for fast incremental builds.",
      x: 0.3, y: 0.95,
    },
    {
      title: "Local AI Services",
      body: "Ollama — serves llama3 (generation) and nomic-embed-text (embedding) at http://127.0.0.1:11434. ChromaDB — vector REST server at http://127.0.0.1:8000, persisting data in chroma/.",
      x: 5.2, y: 0.95,
    },
    {
      title: "Build Configuration",
      body: "chromadb declared as serverExternalPackage in next.config.mjs to prevent client-side bundling. All service URLs configurable via environment variables with local defaults. Package manager: bun.",
      x: 0.3, y: 3.3,
    },
    {
      title: "Scripts",
      body: "dev — Turbopack dev server  •  build — production build  •  typecheck — tsc --noEmit  •  format — Prettier with Tailwind plugin  •  lint — ESLint with Next.js config",
      x: 5.2, y: 3.3,
    },
  ];

  cards.forEach((c) => {
    s.addShape(pres.shapes.RECTANGLE, { x: c.x, y: c.y, w: 4.6, h: 2.05, fill: { color: C.cardBg }, line: { color: C.cardBorder, width: 1 }, shadow: makeShadow() });
    s.addShape(pres.shapes.RECTANGLE, { x: c.x, y: c.y, w: 0.07, h: 2.05, fill: { color: C.teal }, line: { color: C.teal } });
    s.addText(c.title, { x: c.x + 0.15, y: c.y + 0.1, w: 4.35, h: 0.38, fontSize: 12, bold: true, color: C.darkText, fontFace: "Arial", margin: 0 });
    s.addText(c.body, { x: c.x + 0.15, y: c.y + 0.58, w: 4.35, h: 1.35, fontSize: 10.5, color: C.mutedText, fontFace: "Calibri", margin: 0 });
  });
}

// ===== SLIDE 21: IMPLEMENTATION — CHAT PARSER =====
{
  const s = pres.addSlide();
  addHeader(s, "Implementation: Chat Parser  ·  lib/chat-parser.ts");

  s.addText("Processes raw WhatsApp .txt exports line by line using a single regex. Non-matching lines are treated as message continuations.", {
    x: 0.4, y: 0.88, w: 9.2, h: 0.38, fontSize: 11.5, color: "737373", fontFace: "Calibri", margin: 0,
  });

  const steps = [
    {
      step: "01", color: C.teal,
      label: "Timestamp Normalisation",
      desc: "Converts 2-digit years → 4-digit (YY → 20YY). Reformats dates to YYYY-MM-DD. Converts 12-hour AM/PM to 24-hour, handling am / a.m / AM / A.M variants.",
    },
    {
      step: "02", color: C.blue,
      label: "Noise Filtering",
      desc: "Discards blank lines, <Media omitted>, bare URLs, and WhatsApp system notices (end-to-end encryption banners, group change notices).",
    },
    {
      step: "03", color: C.midBlue,
      label: "Stable ID Generation",
      desc: "Applies SHA-1 to each raw line to produce a deterministic message ID — used as part of the ChromaDB pair ID so re-uploads never create duplicate vectors.",
    },
    {
      step: "04", color: C.teal,
      label: "getConversationPairs",
      desc: "4-message sliding window over the full thread. For each persona reply, collects the preceding context from any participant. Skips replies < 4 chars or bare URLs.",
    },
  ];

  steps.forEach((step, i) => {
    const y = 1.42 + i * 0.97;
    s.addShape(pres.shapes.RECTANGLE, { x: 0.3, y, w: 9.4, h: 0.85, fill: { color: C.cardBg }, line: { color: C.cardBorder }, shadow: makeShadow() });
    s.addShape(pres.shapes.RECTANGLE, { x: 0.3, y, w: 0.75, h: 0.85, fill: { color: step.color }, line: { color: step.color } });
    s.addText(step.step, { x: 0.3, y, w: 0.75, h: 0.85, fontSize: 18, bold: true, color: C.white, fontFace: "Arial Black", align: "center", valign: "middle", margin: 0 });
    s.addText(step.label, { x: 1.15, y: y + 0.07, w: 3.0, h: 0.3, fontSize: 11.5, bold: true, color: C.darkText, fontFace: "Arial", margin: 0 });
    s.addText(step.desc, { x: 1.15, y: y + 0.43, w: 8.4, h: 0.35, fontSize: 10.5, color: C.mutedText, fontFace: "Calibri", margin: 0 });
  });
}

// ===== SLIDE 22: IMPLEMENTATION — PERSONALITY EXTRACTOR =====
{
  const s = pres.addSlide();
  addHeader(s, "Implementation: Personality Extractor  ·  lib/personality.ts");

  // Stage 1
  s.addShape(pres.shapes.RECTANGLE, { x: 0.3, y: 0.9, w: 9.4, h: 1.55, fill: { color: "F5F5F5" }, line: { color: C.teal, width: 1 } });
  s.addShape(pres.shapes.RECTANGLE, { x: 0.3, y: 0.9, w: 0.07, h: 1.55, fill: { color: C.teal }, line: { color: C.teal } });
  s.addText("Stage 1 — Statistical Pre-processing", { x: 0.48, y: 0.97, w: 9.0, h: 0.35, fontSize: 13, bold: true, color: C.teal, fontFace: "Arial", margin: 0 });
  s.addText(
    "Word-frequency pass over all persona messages identifies the top-8 words with length ≥ 3 and occurrence > 1. These are injected into the LLM prompt as concrete phrase hints, steering the model toward observable vocabulary rather than generic descriptions.",
    { x: 0.48, y: 1.38, w: 9.0, h: 1.0, fontSize: 11, color: "262626", fontFace: "Calibri", margin: 0 }
  );

  // Stage 2
  s.addShape(pres.shapes.RECTANGLE, { x: 0.3, y: 2.6, w: 9.4, h: 1.7, fill: { color: "F5F5F5" }, line: { color: C.blue, width: 1 } });
  s.addShape(pres.shapes.RECTANGLE, { x: 0.3, y: 2.6, w: 0.07, h: 1.7, fill: { color: C.blue }, line: { color: C.blue } });
  s.addText("Stage 2 — LLM-based Extraction", { x: 0.48, y: 2.67, w: 9.0, h: 0.35, fontSize: 13, bold: true, color: "404040", fontFace: "Arial", margin: 0 });
  s.addText(
    "Samples up to 100 messages evenly distributed across the full chat history (stepped by index) — early and late patterns are both captured. The prompt provides two evidence sources: a list of raw messages as JSON-quoted strings and a short timestamped transcript. The LLM is instructed to describe observed behaviour from evidence rather than producing generic category labels.",
    { x: 0.48, y: 3.08, w: 9.0, h: 1.15, fontSize: 11, color: "262626", fontFace: "Calibri", margin: 0 }
  );

  // Fallback callout
  s.addShape(pres.shapes.RECTANGLE, { x: 0.3, y: 4.45, w: 9.4, h: 0.8, fill: { color: "F5F5F5" }, line: { color: C.teal, width: 0.5 } });
  s.addText(
    "Fallback: If JSON extraction fails, a default profile pre-populated with the phrase hints is returned — the pipeline never crashes due to a malformed LLM response.",
    { x: 0.48, y: 4.52, w: 9.1, h: 0.65, fontSize: 11, color: "262626", fontFace: "Calibri", italic: true, margin: 0 }
  );
}

// ===== SLIDE 23: IMPLEMENTATION — OLLAMA CLIENT & CHROMA STORE =====
{
  const s = pres.addSlide();
  addHeader(s, "Implementation: Ollama Client & Chroma Memory Store");

  s.addText("lib/ollama.ts — Thin HTTP wrapper", {
    x: 0.3, y: 0.88, w: 5, h: 0.32, fontSize: 12, bold: true, color: C.teal, fontFace: "Arial", margin: 0,
  });

  const ollamaFuncs = [
    { name: "generateWithOllama(prompt)", detail: "POST /api/generate  ·  stream: false  ·  temperature 0.7  ·  used for personality profile extraction only" },
    { name: "chatWithOllama(system, history[], userMessage)", detail: "POST /api/chat  ·  messages: [system, ...history, user]  ·  temperature 0.85  ·  used for all persona simulation — enables multi-turn coherence" },
    { name: "embedWithOllama(texts[])", detail: "POST /api/embed  ·  Handles both embeddings[] (current) and embedding (legacy) response shapes for version compatibility" },
  ];
  ollamaFuncs.forEach((f, i) => {
    const y = 1.27 + i * 0.77;
    s.addShape(pres.shapes.RECTANGLE, { x: 0.3, y, w: 9.4, h: 0.68, fill: { color: "F5F5F5" }, line: { color: C.teal, width: 0.5 } });
    s.addShape(pres.shapes.RECTANGLE, { x: 0.3, y, w: 0.06, h: 0.68, fill: { color: C.teal }, line: { color: C.teal } });
    s.addText(f.name, { x: 0.48, y: y + 0.05, w: 9.0, h: 0.28, fontSize: 11, bold: true, color: C.teal, fontFace: "Consolas", margin: 0 });
    s.addText(f.detail, { x: 0.48, y: y + 0.38, w: 9.0, h: 0.25, fontSize: 10.5, color: "262626", fontFace: "Calibri", margin: 0 });
  });

  s.addText("lib/chroma.ts — Vector Memory Store (ditto_pairs_v1)", {
    x: 0.3, y: 3.62, w: 7, h: 0.32, fontSize: 12, bold: true, color: "404040", fontFace: "Arial", margin: 0,
  });

  const chromaFuncs = [
    { name: "storeConversationPairs", detail: "Embeds contextWindow of each pair via Ollama, upserts with personaReply as document. SHA-1 ID of personaName:context:reply. In-memory dedup prevents batch collisions." },
    { name: "queryConversationPairs", detail: "Embeds user message, queries Chroma with $eq filter on personaName, returns top-6 ConversationPair[] with cosine-distance scores surfaced in the UI." },
  ];
  chromaFuncs.forEach((f, i) => {
    const y = 4.0 + i * 0.77;
    s.addShape(pres.shapes.RECTANGLE, { x: 0.3, y, w: 9.4, h: 0.68, fill: { color: "F5F5F5" }, line: { color: C.blue, width: 0.5 } });
    s.addShape(pres.shapes.RECTANGLE, { x: 0.3, y, w: 0.06, h: 0.68, fill: { color: C.blue }, line: { color: C.blue } });
    s.addText(f.name, { x: 0.48, y: y + 0.05, w: 9.0, h: 0.28, fontSize: 11, bold: true, color: "404040", fontFace: "Consolas", margin: 0 });
    s.addText(f.detail, { x: 0.48, y: y + 0.38, w: 9.0, h: 0.25, fontSize: 10.5, color: "262626", fontFace: "Calibri", margin: 0 });
  });
}

// ===== SLIDE 24: IMPLEMENTATION — API ROUTES =====
{
  const s = pres.addSlide();
  addHeader(s, "Implementation: API Route Logic  ·  app/api/personas/");

  // POST /api/personas
  s.addShape(pres.shapes.RECTANGLE, { x: 0.3, y: 0.88, w: 9.4, h: 1.9, fill: { color: C.cardBg }, line: { color: C.cardBorder }, shadow: makeShadow() });
  s.addShape(pres.shapes.RECTANGLE, { x: 0.3, y: 0.88, w: 9.4, h: 0.38, fill: { color: C.blue }, line: { color: C.blue } });
  s.addText("POST /api/personas  —  Persona Creation Pipeline", {
    x: 0.48, y: 0.88, w: 9.0, h: 0.38, fontSize: 13, bold: true, color: C.white, fontFace: "Consolas", valign: "middle", margin: 0,
  });
  s.addText([
    { text: "Validate personaName + chatHistory; return 400 if missing or persona not found in chat", options: { bullet: { type: "number" }, breakLine: true } },
    { text: "Compute PersonaSummary: total messages, average word count, all unique authors", options: { bullet: { type: "number" }, breakLine: true } },
    { text: "Call getConversationPairs() → extract all (context → reply) pairs from full message thread", options: { bullet: { type: "number" }, breakLine: true } },
    { text: "Call buildPersonalityProfile (Ollama) + storeConversationPairs (Chroma) → return CreatePersonaResponse", options: { bullet: { type: "number" } } },
  ], { x: 0.48, y: 1.55, w: 9.0, h: 1.0, fontSize: 11, fontFace: "Calibri", color: C.darkText });

  // POST /api/personas/chat
  s.addShape(pres.shapes.RECTANGLE, { x: 0.3, y: 3.0, w: 9.4, h: 2.15, fill: { color: C.cardBg }, line: { color: C.cardBorder }, shadow: makeShadow() });
  s.addShape(pres.shapes.RECTANGLE, { x: 0.3, y: 3.0, w: 9.4, h: 0.38, fill: { color: C.teal }, line: { color: C.teal } });
  s.addText("POST /api/personas/chat  —  Pair-based RAG Simulation", {
    x: 0.48, y: 3.0, w: 9.0, h: 0.38, fontSize: 13, bold: true, color: C.white, fontFace: "Consolas", valign: "middle", margin: 0,
  });
  s.addText([
    { text: "Validate personaName, message, profile; accept conversationHistory (last 6 turns)", options: { bullet: { type: "number" }, breakLine: true } },
    { text: "Query top-6 pairs from Chroma by embedding user message against context-side vectors", options: { bullet: { type: "number" }, breakLine: true } },
    { text: "Relevance gate: exclude pairs with cosine distance ≥ 1.3 from few-shot prompt", options: { bullet: { type: "number" }, breakLine: true } },
    { text: "Build system prompt with few-shot [Context]/[reply] examples → call chatWithOllama(system, history, message)", options: { bullet: { type: "number" } } },
  ], { x: 0.48, y: 3.65, w: 9.0, h: 1.25, fontSize: 11, fontFace: "Calibri", color: C.darkText });
}

// ===== SLIDE 25: IMPLEMENTATION — FRONTEND =====
{
  const s = pres.addSlide();
  addHeader(s, "Implementation: Frontend  ·  components/ditto-studio.tsx");

  s.addText("Single React component — useState for all state, useTransition for async LLM calls (keeps UI responsive during 10–40 s inference).", {
    x: 0.4, y: 0.88, w: 9.2, h: 0.38, fontSize: 11.5, color: "737373", fontFace: "Calibri", margin: 0,
  });

  const decisions = [
    {
      label: "Client-side Regex",
      desc: "CHAT_LINE_REGEX is replicated in the component so persona name options (unique authors) are extracted immediately on upload — no network round-trip needed before showing the speaker selector.",
      color: C.teal,
    },
    {
      label: "Conversation History",
      desc: "The last 6 chatTurns are mapped to { role, content } and sent as conversationHistory with every request. Ollama receives them as proper user/assistant chat turns — enabling multi-turn coherence without backend session state.",
      color: C.blue,
    },
    {
      label: "Monospace Chat Log",
      desc: "Chat turns render as a scrollable monospace log above the textarea, formatted as DD/MM/YY, HH:MM - ROLE: content. A TypingIndicator shows an animated dot sequence during inference.",
      color: C.midBlue,
    },
    {
      label: "Retrieved Context Panel",
      desc: "Shows ConversationPair cards: context window in monospace block, persona reply highlighted with a left border, colour-coded distance badge (default=relevant, secondary=acceptable, outline=distant/not used).",
      color: C.teal,
    },
  ];

  decisions.forEach((d, i) => {
    const col = i % 2;
    const row = Math.floor(i / 2);
    const x = col === 0 ? 0.3 : 5.2;
    const y = 1.38 + row * 1.78;

    s.addShape(pres.shapes.RECTANGLE, { x, y, w: 4.6, h: 1.62, fill: { color: C.cardBg }, line: { color: C.cardBorder }, shadow: makeShadow() });
    s.addShape(pres.shapes.RECTANGLE, { x, y, w: 0.07, h: 1.62, fill: { color: d.color }, line: { color: d.color } });
    s.addText(d.label, { x: x + 0.15, y: y + 0.1, w: 4.35, h: 0.35, fontSize: 12, bold: true, color: C.darkText, fontFace: "Arial", margin: 0 });
    s.addText(d.desc, { x: x + 0.15, y: y + 0.55, w: 4.35, h: 1.0, fontSize: 10.5, color: C.mutedText, fontFace: "Calibri", margin: 0 });
  });
}

// ===== SLIDE 26: SYSTEM TESTING — UNIT & API =====
{
  const s = pres.addSlide();
  addHeader(s, "System Testing — Unit-Level & API Integration");

  s.addText("Unit-Level Verification", { x: 0.3, y: 0.85, w: 5, h: 0.3, fontSize: 13, bold: true, color: C.darkText, fontFace: "Arial", margin: 0 });

  s.addTable([
    [
      { text: "Module", options: { bold: true, color: C.white, fill: { color: C.teal }, fontSize: 9.5, fontFace: "Arial" } },
      { text: "Test Case", options: { bold: true, color: C.white, fill: { color: C.teal }, fontSize: 9.5, fontFace: "Arial" } },
      { text: "Result", options: { bold: true, color: C.white, fill: { color: C.teal }, fontSize: 9.5, fontFace: "Arial" } },
    ],
    ["chat-parser.ts", "Valid WhatsApp .txt file → correct author, timestamp, content", "Pass"],
    ["chat-parser.ts", "Multi-line message continuation appended to previous record", "Pass"],
    ["chat-parser.ts", "<Media omitted> and bare URL lines filtered out", "Pass"],
    ["chat-parser.ts", "getConversationPairs() on 100-message chat → non-empty context + reply", "Pass"],
    ["chat-parser.ts", "Reply < 4 chars or bare URL → pair skipped", "Pass"],
    ["personality.ts", "Valid JSON from Ollama → profile parsed correctly", "Pass"],
    ["personality.ts", "Malformed/prose LLM response → fallback profile, no crash", "Pass"],
    ["chroma.ts", "Re-running persona creation → upsert deduplicates, no duplicate vectors", "Pass"],
    ["chroma.ts", "Duplicate IDs in same batch → in-memory dedup removes before upsert", "Pass"],
  ], {
    x: 0.3, y: 1.2, w: 9.4, h: 2.6,
    colW: [2.2, 5.4, 1.8],
    border: { pt: 0.5, color: C.tableBorder }, fill: { color: C.cardBg },
    fontSize: 9.5, fontFace: "Calibri", color: C.darkText, rowH: 0.25,
  });

  s.addText("API Integration Testing", { x: 0.3, y: 3.9, w: 5, h: 0.3, fontSize: 13, bold: true, color: C.darkText, fontFace: "Arial", margin: 0 });

  s.addTable([
    [
      { text: "Endpoint", options: { bold: true, color: C.white, fill: { color: C.blue }, fontSize: 9.5, fontFace: "Arial" } },
      { text: "Scenario", options: { bold: true, color: C.white, fill: { color: C.blue }, fontSize: 9.5, fontFace: "Arial" } },
      { text: "Status", options: { bold: true, color: C.white, fill: { color: C.blue }, fontSize: 9.5, fontFace: "Arial" } },
      { text: "Result", options: { bold: true, color: C.white, fill: { color: C.blue }, fontSize: 9.5, fontFace: "Arial" } },
    ],
    ["POST /api/personas", "Missing personaName field", "400", "Pass"],
    ["POST /api/personas", "Valid request, Ollama running", "200 PersonaRecord", "Pass"],
    ["POST /api/personas/chat", "All pairs above relevance threshold", "200 style-only mode", "Pass"],
    ["POST /api/personas/chat", "Valid request after persona creation", "200 reply + context", "Pass"],
    ["POST /api/personas/chat", "Ollama service offline", "500 with error detail", "Pass"],
  ], {
    x: 0.3, y: 4.25, w: 9.4, h: 1.2,
    colW: [2.4, 3.5, 1.8, 1.7],
    border: { pt: 0.5, color: C.tableBorder }, fill: { color: C.cardBg },
    fontSize: 9.5, fontFace: "Calibri", color: C.darkText, rowH: 0.2,
  });
}

// ===== SLIDE 27: SYSTEM TESTING — E2E & PERFORMANCE =====
{
  const s = pres.addSlide();
  addHeader(s, "System Testing — End-to-End & Performance");

  s.addText("End-to-End Test Scenarios", { x: 0.3, y: 0.85, w: 5, h: 0.3, fontSize: 13, bold: true, color: C.darkText, fontFace: "Arial", margin: 0 });

  const scenarios = [
    { title: "Full Persona Creation", desc: "Upload .txt → options populate → Create Persona → profile JSON + stats render. Stored pair count confirms embedding ran correctly." },
    { title: "Multi-turn Chat", desc: "Type message → simulate → reply in log. Second turn maintains context; no tone reset. conversationHistory correctly passed on every request." },
    { title: "Relevance Gate", desc: "Query topic unrelated to persona's chat → all pairs show 'distant' badge → reply still generated using style-only prompt, no crash." },
    { title: "Edge Cases", desc: "Non-WhatsApp file rejected before API call. Persona name matching a known fictional character correctly identified as a real person. Chroma offline → 500 surfaced gracefully." },
  ];

  scenarios.forEach((sc, i) => {
    const y = 1.22 + i * 0.82;
    s.addShape(pres.shapes.RECTANGLE, { x: 0.3, y, w: 9.4, h: 0.72, fill: { color: C.cardBg }, line: { color: C.cardBorder }, shadow: makeShadow() });
    s.addShape(pres.shapes.RECTANGLE, { x: 0.3, y, w: 0.07, h: 0.72, fill: { color: i % 2 === 0 ? C.teal : C.blue }, line: { color: i % 2 === 0 ? C.teal : C.blue } });
    s.addText(`Scenario ${i + 1}: ${sc.title}`, { x: 0.48, y: y + 0.06, w: 9.0, h: 0.26, fontSize: 11.5, bold: true, color: C.darkText, fontFace: "Arial", margin: 0 });
    s.addText(sc.desc, { x: 0.48, y: y + 0.38, w: 9.0, h: 0.28, fontSize: 10.5, color: C.mutedText, fontFace: "Calibri", margin: 0 });
  });

  s.addText("Performance Observations (CPU inference)", { x: 0.3, y: 4.55, w: 6, h: 0.3, fontSize: 13, bold: true, color: C.darkText, fontFace: "Arial", margin: 0 });

  s.addTable([
    [
      { text: "Operation", options: { bold: true, color: C.white, fill: { color: C.midBlue }, fontSize: 9.5, fontFace: "Arial" } },
      { text: "Observed Duration", options: { bold: true, color: C.white, fill: { color: C.midBlue }, fontSize: 9.5, fontFace: "Arial" } },
    ],
    ["Chat parsing (500-message file)", "< 50 ms (client-side)"],
    ["Personality extraction (LLaMA 3, CPU)", "15 – 40 seconds"],
    ["Embedding all pairs (nomic-embed-text)", "20 – 90 seconds (pair count dependent)"],
    ["Chat simulation (single turn)", "10 – 25 seconds"],
    ["Chroma vector query (top-6)", "< 200 ms"],
  ], {
    x: 0.3, y: 4.88, w: 9.4, h: 0.62,
    colW: [5.5, 3.9],
    border: { pt: 0.5, color: C.tableBorder }, fill: { color: C.cardBg },
    fontSize: 9.5, fontFace: "Calibri", color: C.darkText, rowH: 0.1,
  });
}

// ===== SLIDE 28: RESULTS — PERSONA CREATION =====
{
  const s = pres.addSlide();
  addHeader(s, "Results: Persona Creation");

  const points = [
    {
      icon: "01", color: C.teal,
      title: "Parsing",
      desc: "All messages parsed correctly with author attribution, timestamp normalisation, and noise filtering in under 100 ms.",
    },
    {
      icon: "02", color: C.blue,
      title: "Conversation Pairs",
      desc: "4-message sliding window extracted meaningful (context → reply) pairs across the full chat. Short messages and URLs correctly filtered before embedding.",
    },
    {
      icon: "03", color: C.midBlue,
      title: "Profile Extraction",
      desc: "Evenly distributed sampling captured both early and late conversational patterns. Profiles demonstrated meaningful differentiation between speakers in the same conversation.",
    },
    {
      icon: "04", color: C.teal,
      title: "Vector Storage",
      desc: "Context-window embeddings stored in ditto_pairs_v1. Retrieval finds situations similar to the query rather than words — a fundamentally more useful signal for simulation.",
    },
  ];

  points.forEach((p, i) => {
    const col = i % 2;
    const row = Math.floor(i / 2);
    const x = col === 0 ? 0.3 : 5.2;
    const y = 0.88 + row * 2.18;

    s.addShape(pres.shapes.RECTANGLE, { x, y, w: 4.6, h: 2.0, fill: { color: C.cardBg }, line: { color: C.cardBorder }, shadow: makeShadow() });
    s.addShape(pres.shapes.RECTANGLE, { x, y, w: 4.6, h: 0.38, fill: { color: p.color }, line: { color: p.color } });
    s.addText(`${p.icon}  ${p.title}`, { x: x + 0.12, y: y + 0.05, w: 4.35, h: 0.3, fontSize: 12, bold: true, color: C.white, fontFace: "Arial", margin: 0 });
    s.addText(p.desc, { x: x + 0.15, y: y + 0.5, w: 4.3, h: 1.4, fontSize: 11, color: C.mutedText, fontFace: "Calibri", margin: 0 });
  });
}

// ===== SLIDE 29: RESULTS — CHAT SIMULATION =====
{
  const s = pres.addSlide();
  addHeader(s, "Results: Chat Simulation & Discussion");

  const results = [
    { label: "Situational Retrieval", desc: "Pair-based retrieval found exchanges matching the situation of the query, not just semantically similar words — producing more contextually appropriate few-shot examples." },
    { label: "Few-shot Grounding", desc: "Real (context → reply) examples gave the LLM concrete behavioural evidence. Replies reflected actual vocabulary, capitalization, and emoji usage from the source chat." },
    { label: "Multi-turn Coherence", desc: "Passing conversation history as structured chat turns via /api/chat prevented tone resets between turns — personas maintained consistent voice across multi-turn exchanges." },
    { label: "Relevance Gate", desc: "Correctly excluded unrelated pairs at distance ≥ 1.3 while still providing examples for on-topic queries. Style-only fallback worked without crashes." },
    { label: "Name Disambiguation", desc: "Identifying persona as 'a real person named X' in the system prompt eliminated LLM hallucinations caused by the name matching fictional characters in training data." },
  ];

  results.forEach((r, i) => {
    const y = 0.9 + i * 0.73;
    s.addShape(pres.shapes.RECTANGLE, { x: 0.3, y, w: 9.4, h: 0.63, fill: { color: "F5F5F5" }, line: { color: i % 2 === 0 ? C.teal : C.blue, width: 0.5 } });
    s.addShape(pres.shapes.RECTANGLE, { x: 0.3, y, w: 0.06, h: 0.63, fill: { color: i % 2 === 0 ? C.teal : C.blue }, line: { color: i % 2 === 0 ? C.teal : C.blue } });
    s.addText(r.label, { x: 0.48, y: y + 0.06, w: 2.4, h: 0.25, fontSize: 11, bold: true, color: C.darkText, fontFace: "Arial", margin: 0 });
    s.addText(r.desc, { x: 2.95, y: y + 0.06, w: 6.65, h: 0.5, fontSize: 10.5, color: "262626", fontFace: "Calibri", margin: 0 });
  });

  s.addShape(pres.shapes.RECTANGLE, { x: 0.3, y: 4.7, w: 9.4, h: 0.78, fill: { color: C.darkCallout }, line: { color: C.teal, width: 0.5 } });
  s.addShape(pres.shapes.RECTANGLE, { x: 0.3, y: 4.7, w: 0.07, h: 0.78, fill: { color: C.teal }, line: { color: C.teal } });
  s.addText(
    "Key insight: the shift from individual message storage → conversation-pair storage is the single most impactful architectural change. Embedding the context side means retrieval answers \"what situation is most similar?\" rather than \"what did the persona say that sounds similar?\"",
    { x: 0.45, y: 4.76, w: 9.1, h: 0.65, fontSize: 10.5, color: "262626", fontFace: "Calibri", italic: true, margin: 0 }
  );
}

// ===== SLIDE 30: LIMITATIONS =====
{
  const s = pres.addSlide();
  addHeader(s, "Limitations");

  const rows = [
    [
      { text: "Limitation", options: { bold: true, color: C.white, fill: { color: C.blue }, fontSize: 10, fontFace: "Arial" } },
      { text: "Impact", options: { bold: true, color: C.white, fill: { color: C.blue }, fontSize: 10, fontFace: "Arial" } },
      { text: "Mitigation", options: { bold: true, color: C.white, fill: { color: C.blue }, fontSize: 10, fontFace: "Arial" } },
    ],
    ["No automated test suite", "Regressions may go undetected", "Add Jest/Vitest unit tests for parser and pair extractor"],
    ["LLM output variability", "Profile quality varies between runs", "Temperature tuning; structured output enforcement"],
    ["Single-collection Chroma design", "All personas share one collection; may slow at scale", "Partition into per-persona collections at scale"],
    ["Session-only chat history", "Conversation resets on page reload", "Persist chatTurns to localStorage or a backend store"],
    ["No multi-user support", "Single-user, local deployment only", "Add session management for shared deployments"],
    ["Pair count grows with chat size", "Embedding large chats takes longer", "Batch-limit upserts; background processing"],
  ];

  s.addTable(rows, {
    x: 0.3, y: 0.88, w: 9.4, h: 3.8,
    colW: [2.8, 2.8, 3.8],
    border: { pt: 0.5, color: C.tableBorder },
    fill: { color: C.cardBg },
    fontSize: 10.5, fontFace: "Calibri", color: C.darkText,
    rowH: 0.52,
  });

  s.addShape(pres.shapes.RECTANGLE, { x: 0.3, y: 4.82, w: 9.4, h: 0.62, fill: { color: "F5F5F5" }, line: { color: C.teal, width: 0.5 } });
  s.addText(
    "Privacy validation: all processing — parsing, embedding, generation, storage — completed without any outbound network traffic to external servers. Fully air-gap operable.",
    { x: 0.48, y: 4.88, w: 9.1, h: 0.5, fontSize: 10.5, color: "262626", fontFace: "Calibri", italic: true, margin: 0 }
  );
}

// ===== SLIDE 31: APP SCREENSHOTS — Upload & Persona Detection =====
{
  const s = pres.addSlide();
  addHeader(s, "App Screenshots — Upload & Persona Detection");

  // Left placeholder
  s.addShape(pres.shapes.RECTANGLE, { x: 0.3, y: 0.88, w: 4.55, h: 4.4, fill: { color: "F0F0F0" }, line: { color: C.cardBorder, width: 1 }, shadow: makeShadow() });
  s.addShape(pres.shapes.RECTANGLE, { x: 0.3, y: 0.88, w: 4.55, h: 0.38, fill: { color: C.blue }, line: { color: C.blue } });
  s.addText("Chat Upload Panel", { x: 0.3, y: 0.88, w: 4.55, h: 0.38, fontSize: 11, bold: true, color: C.white, fontFace: "Arial", align: "center", valign: "middle", margin: 0 });
  // Replace with: s.addImage({ path: "docs/screenshots/upload-panel.png", x: 0.3, y: 1.26, w: 4.55, h: 4.0 });
  // s.addText("[ SCREENSHOT PLACEHOLDER ]\n\ndocs/screenshots/upload-panel.png", {
  //   x: 0.3, y: 1.26, w: 4.55, h: 4.0, fontSize: 11, color: C.mutedText, fontFace: "Calibri", align: "center", valign: "middle", margin: 0,
  // });
  s.addImage({ path: "docs/screenshots/upload-panel.png", x: 0.56, y: 1.5, w: 4.02, h: 3.52 });

  // Right placeholder
  s.addShape(pres.shapes.RECTANGLE, { x: 5.15, y: 0.88, w: 4.55, h: 4.4, fill: { color: "F0F0F0" }, line: { color: C.cardBorder, width: 1 }, shadow: makeShadow() });
  s.addShape(pres.shapes.RECTANGLE, { x: 5.15, y: 0.88, w: 4.55, h: 0.38, fill: { color: C.blue }, line: { color: C.blue } });
  s.addText("Persona Selector & Chat Preview", { x: 5.15, y: 0.88, w: 4.55, h: 0.38, fontSize: 11, bold: true, color: C.white, fontFace: "Arial", align: "center", valign: "middle", margin: 0 });
  // Replace with: s.addImage({ path: "docs/screenshots/persona-selector.png", x: 5.15, y: 1.26, w: 4.55, h: 4.0 });
  // s.addText("[ SCREENSHOT PLACEHOLDER ]\n\ndocs/screenshots/persona-selector.png", {
  //   x: 5.15, y: 1.26, w: 4.55, h: 4.0, fontSize: 11, color: C.mutedText, fontFace: "Calibri", align: "center", valign: "middle", margin: 0,
  // });
  s.addImage({ path: "docs/screenshots/persona-selector.png", x: 5.91, y: 1.45, w: 3.03, h: 3.62 });
}

// ===== SLIDE 32: APP SCREENSHOTS — Personality Profile =====
{
  const s = pres.addSlide();
  addHeader(s, "App Screenshots — Extracted Personality Profile");

  // Left placeholder
  s.addShape(pres.shapes.RECTANGLE, { x: 0.3, y: 0.88, w: 4.55, h: 4.4, fill: { color: "F0F0F0" }, line: { color: C.cardBorder, width: 1 }, shadow: makeShadow() });
  s.addShape(pres.shapes.RECTANGLE, { x: 0.3, y: 0.88, w: 4.55, h: 0.38, fill: { color: C.teal }, line: { color: C.teal } });
  s.addText("Profile JSON Viewer", { x: 0.3, y: 0.88, w: 4.55, h: 0.38, fontSize: 11, bold: true, color: C.white, fontFace: "Arial", align: "center", valign: "middle", margin: 0 });
  // Replace with: s.addImage({ path: "docs/screenshots/profile-json.png", x: 0.3, y: 1.26, w: 4.55, h: 4.0 });
  // s.addText("[ SCREENSHOT PLACEHOLDER ]\n\ndocs/screenshots/profile-json.png", {
  //   x: 0.3, y: 1.26, w: 4.55, h: 4.0, fontSize: 11, color: C.mutedText, fontFace: "Calibri", align: "center", valign: "middle", margin: 0,
  // });
  s.addImage({ path: "docs/screenshots/profile-json.png", x: 1.18, y: 1.39, w: 2.79, h: 3.74 });

  // Right placeholder
  s.addShape(pres.shapes.RECTANGLE, { x: 5.15, y: 0.88, w: 4.55, h: 4.4, fill: { color: "F0F0F0" }, line: { color: C.cardBorder, width: 1 }, shadow: makeShadow() });
  s.addShape(pres.shapes.RECTANGLE, { x: 5.15, y: 0.88, w: 4.55, h: 0.38, fill: { color: C.teal }, line: { color: C.teal } });
  s.addText("Summary Stats Panel", { x: 5.15, y: 0.88, w: 4.55, h: 0.38, fontSize: 11, bold: true, color: C.white, fontFace: "Arial", align: "center", valign: "middle", margin: 0 });
  // Replace with: s.addImage({ path: "docs/screenshots/summary-stats.png", x: 5.15, y: 1.26, w: 4.55, h: 4.0 });
  // s.addText("[ SCREENSHOT PLACEHOLDER ]\n\ndocs/screenshots/summary-stats.png", {
  //   x: 5.15, y: 1.26, w: 4.55, h: 4.0, fontSize: 11, color: C.mutedText, fontFace: "Calibri", align: "center", valign: "middle", margin: 0,
  // });
  s.addImage({ path: "docs/screenshots/summary-stats.png", x: 5.29, y: 2.55, w: 4.28, h: 1.43 });
}

// ===== SLIDE 33: APP SCREENSHOTS — Chat Simulation =====
{
  const s = pres.addSlide();
  addHeader(s, "App Screenshots — Chat Simulation");

  // Left placeholder
  s.addShape(pres.shapes.RECTANGLE, { x: 0.3, y: 0.88, w: 4.55, h: 4.4, fill: { color: "F0F0F0" }, line: { color: C.cardBorder, width: 1 }, shadow: makeShadow() });
  s.addShape(pres.shapes.RECTANGLE, { x: 0.3, y: 0.88, w: 4.55, h: 0.38, fill: { color: C.midBlue }, line: { color: C.midBlue } });
  s.addText("Chat Simulation Panel", { x: 0.3, y: 0.88, w: 4.55, h: 0.38, fontSize: 11, bold: true, color: C.white, fontFace: "Arial", align: "center", valign: "middle", margin: 0 });
  // Replace with: s.addImage({ path: "docs/screenshots/chat-simulation.png", x: 0.3, y: 1.26, w: 4.55, h: 4.0 });
  // s.addText("[ SCREENSHOT PLACEHOLDER ]\n\ndocs/screenshots/chat-simulation.png", {
  //   x: 0.3, y: 1.26, w: 4.55, h: 4.0, fontSize: 11, color: C.mutedText, fontFace: "Calibri", align: "center", valign: "middle", margin: 0,
  // });
  s.addImage({ path: "docs/screenshots/chat-simulation.png", x: 1.18, y: 1.41, w: 2.8, h: 3.7 });

  // Right placeholder
  s.addShape(pres.shapes.RECTANGLE, { x: 5.15, y: 0.88, w: 4.55, h: 4.4, fill: { color: "F0F0F0" }, line: { color: C.cardBorder, width: 1 }, shadow: makeShadow() });
  s.addShape(pres.shapes.RECTANGLE, { x: 5.15, y: 0.88, w: 4.55, h: 0.38, fill: { color: C.midBlue }, line: { color: C.midBlue } });
  s.addText("Retrieved Context — Pair Cards", { x: 5.15, y: 0.88, w: 4.55, h: 0.38, fontSize: 11, bold: true, color: C.white, fontFace: "Arial", align: "center", valign: "middle", margin: 0 });
  // Replace with: s.addImage({ path: "docs/screenshots/retrieved-context.png", x: 5.15, y: 1.26, w: 4.55, h: 4.0 });
  // s.addText("[ SCREENSHOT PLACEHOLDER ]\n\ndocs/screenshots/retrieved-context.png", {
  //   x: 5.15, y: 1.26, w: 4.55, h: 4.0, fontSize: 11, color: C.mutedText, fontFace: "Calibri", align: "center", valign: "middle", margin: 0,
  // });
  s.addImage({ path: "docs/screenshots/retrieved-context.png", x: 6.52, y: 1.35, w: 1.81, h: 3.82 });
}

// ===== SLIDE 34: APP SCREENSHOTS — Full UI Overview =====
{
  const s = pres.addSlide();
  addHeader(s, "App Screenshots — Full UI Overview");

  s.addShape(pres.shapes.RECTANGLE, { x: 0.3, y: 0.88, w: 9.4, h: 4.4, fill: { color: "F0F0F0" }, line: { color: C.cardBorder, width: 1 }, shadow: makeShadow() });
  s.addShape(pres.shapes.RECTANGLE, { x: 0.3, y: 0.88, w: 9.4, h: 0.38, fill: { color: C.darkBg }, line: { color: C.darkBg } });
  s.addText("Full Application — Hero + Status + Persona + Simulation Panels", { x: 0.3, y: 0.88, w: 9.4, h: 0.38, fontSize: 11, bold: true, color: C.white, fontFace: "Arial", align: "center", valign: "middle", margin: 0 });
  // Replace with: s.addImage({ path: "docs/screenshots/full-ui.png", x: 0.3, y: 1.26, w: 9.4, h: 4.0 });
  // s.addText("[ SCREENSHOT PLACEHOLDER ]\n\ndocs/screenshots/full-ui.png", {
  //   x: 0.3, y: 1.26, w: 9.4, h: 4.0, fontSize: 11, color: C.mutedText, fontFace: "Calibri", align: "center", valign: "middle", margin: 0,
  // });
  s.addImage({ path: "docs/screenshots/full-ui.png", x: 3.94, y: 1.37, w: 2.12, h: 3.78 });
}

// ===== SLIDE 35: THANK YOU =====
{
  const s = pres.addSlide();
  s.background = { color: C.darkBg };

  s.addShape(pres.shapes.RECTANGLE, { x: 0, y: 0, w: 10, h: 0.07, fill: { color: C.teal }, line: { color: C.teal } });
  s.addShape(pres.shapes.RECTANGLE, { x: 0, y: 5.555, w: 10, h: 0.07, fill: { color: C.teal }, line: { color: C.teal } });
  s.addShape(pres.shapes.RECTANGLE, { x: 0, y: 0, w: 0.15, h: 5.625, fill: { color: C.teal }, line: { color: C.teal } });
  s.addShape(pres.shapes.RECTANGLE, { x: 9.85, y: 0, w: 0.15, h: 5.625, fill: { color: C.teal }, line: { color: C.teal } });

  s.addShape(pres.shapes.RECTANGLE, { x: 2.5, y: 2.52, w: 5.0, h: 0.06, fill: { color: C.teal }, line: { color: C.teal } });

  s.addText("Thank You", {
    x: 0.5, y: 1.1, w: 9, h: 1.4,
    fontSize: 72, bold: true, color: C.white, fontFace: "Arial Black", align: "center", margin: 0,
  });

  s.addText("DITTO: Digital Twin Studio", {
    x: 0.5, y: 2.7, w: 9, h: 0.6,
    fontSize: 22, color: C.teal, fontFace: "Calibri", align: "center", margin: 0, charSpacing: 2,
  });

  s.addText("A local-first, privacy-preserving AI system for building\npersonality-grounded conversational personas from chat history.", {
    x: 1.0, y: 3.45, w: 8, h: 0.85,
    fontSize: 13, color: "A1A1A1", fontFace: "Calibri", align: "center", margin: 0,
  });

  s.addText("Next.js  ·  Ollama / LLaMA 3  ·  ChromaDB ditto_pairs_v1  ·  nomic-embed-text  ·  Conversation-pair RAG", {
    x: 1.0, y: 4.85, w: 8, h: 0.35,
    fontSize: 10, color: "737373", fontFace: "Consolas", align: "center", margin: 0,
  });
}

pres
  .writeFile({ fileName: "docs/DITTO_Project_Report.pptx" })
  .then(() => console.log("Done! docs/DITTO_Project_Report.pptx created."))
  .catch(console.error);
