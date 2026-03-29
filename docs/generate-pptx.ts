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
      x: 0.3, y: 0.95,
    },
    {
      title: "Retrieval-Augmented Generation (RAG)",
      body: "Enhances LLM responses by first retrieving semantically relevant documents from a vector database and injecting them into the prompt — grounding output in real evidence rather than hallucination.",
      x: 5.2, y: 0.95,
    },
    {
      title: "Vector Embeddings",
      body: "Convert text into dense numerical representations that capture semantic meaning. Similar texts cluster together in embedding space, enabling retrieval of the most contextually relevant messages via cosine similarity.",
      x: 0.3, y: 3.3,
    },
    {
      title: "Ollama & ChromaDB",
      body: "Ollama: local inference runtime for LLaMA 3 — fully offline on consumer hardware. ChromaDB: open-source embeddable vector database suited for RAG pipelines. Together they enable a fully local, privacy-preserving pipeline.",
      x: 5.2, y: 3.3,
    },
  ];

  cards.forEach((c) => {
    s.addShape(pres.shapes.RECTANGLE, { x: c.x, y: c.y, w: 4.6, h: 2.05, fill: { color: C.cardBg }, line: { color: C.cardBorder, width: 1 }, shadow: makeShadow() });
    s.addShape(pres.shapes.RECTANGLE, { x: c.x, y: c.y, w: 0.07, h: 2.05, fill: { color: C.teal }, line: { color: C.teal } });
    s.addText(c.title, { x: c.x + 0.15, y: c.y + 0.1, w: 4.35, h: 0.45, fontSize: 12, bold: true, color: C.darkText, fontFace: "Arial", margin: 0 });
    s.addText(c.body, { x: c.x + 0.15, y: c.y + 0.62, w: 4.35, h: 1.25, fontSize: 10.5, color: C.mutedText, fontFace: "Calibri", margin: 0 });
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
    "There is no accessible, local tool that allows a user to upload a raw WhatsApp-style chat export, automatically extract a structured personality profile, store conversational memories, and simulate responses in the style of a chosen participant — all without sending data to the cloud.",
    { x: 0.55, y: 4.33, w: 8.9, h: 1.0, fontSize: 11.5, color: "262626", fontFace: "Calibri", italic: true, margin: 0 }
  );
}

// ===== SLIDE 4: OBJECTIVES =====
{
  const s = pres.addSlide();
  addHeader(s, "Objectives of the Project");

  const objectives = [
    { num: "01", text: "Parse WhatsApp-format plain-text chat exports and extract per-author message sets." },
    { num: "02", text: "Automatically derive a structured PersonalityProfile (tone, style, vocabulary, sentiment, etc.) using an LLM prompt via Ollama." },
    { num: "03", text: "Embed all persona messages and store them in ChromaDB for semantic memory retrieval." },
    { num: "04", text: "Simulate natural-language replies to new user messages, grounded in the extracted profile and top-K retrieved memories." },
    { num: "05", text: "Provide an intuitive, browser-based UI that requires no command-line interaction beyond starting local services." },
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
    { label: "Chat Parser", desc: "Decodes WhatsApp-format exports (date, time, author, content) and normalises timestamps to ISO format" },
    { label: "Personality Extractor", desc: "Uses Ollama/LLaMA 3 to produce a structured JSON profile covering tone, style, phrases, sentiment, vocabulary, and relationship signals" },
    { label: "Vector Memory Store", desc: "ChromaDB + nomic-embed-text embeds all persona messages for top-K semantic retrieval at chat time" },
    { label: "Simulation Engine", desc: "Composes a persona-grounded prompt from profile + retrieved context, then calls Ollama to generate a reply" },
  ];

  components.forEach((c, i) => {
    const y = 1.45 + i * 0.63;
    s.addShape(pres.shapes.RECTANGLE, { x: 0.4, y, w: 9.2, h: 0.55, fill: { color: "F5F5F5" }, line: { color: C.teal, width: 0.5 } });
    s.addShape(pres.shapes.RECTANGLE, { x: 0.4, y, w: 0.06, h: 0.55, fill: { color: C.teal }, line: { color: C.teal } });
    s.addText(c.label, { x: 0.55, y: y + 0.08, w: 2.2, h: 0.35, fontSize: 11, bold: true, color: C.teal, fontFace: "Arial", margin: 0 });
    s.addText(c.desc, { x: 2.8, y: y + 0.08, w: 6.7, h: 0.35, fontSize: 11, color: "262626", fontFace: "Calibri", margin: 0 });
  });

  s.addShape(pres.shapes.RECTANGLE, { x: 0.4, y: 4.65, w: 9.2, h: 0.75, fill: { color: "F5F5F5" }, line: { color: C.teal, width: 0.5 } });
  s.addText(
    "Advantages: Fully local — no data leaves the machine  •  No fine-tuning required  •  Structured, inspectable JSON profiles  •  RAG-grounded replies  •  Extensible via environment variables",
    { x: 0.55, y: 4.72, w: 8.9, h: 0.6, fontSize: 11, color: "262626", fontFace: "Calibri", italic: true, margin: 0 }
  );
}

// ===== SLIDE 7: MODULE 1 — CHAT PARSER =====
{
  const s = pres.addSlide();
  addHeader(s, "Module 1: Chat Parser  ·  lib/chat-parser.ts");

  const features = [
    { label: "Input Format", desc: "Parses raw WhatsApp-exported .txt files line by line using regex: DD/MM/YY, H:MM [am/pm] - Author: Message" },
    { label: "Multi-line Messages", desc: "Handles multi-line messages — continuation lines are appended to the previous record automatically" },
    { label: "Noise Filtering", desc: "Strips noise lines: <Media omitted>, encryption notices, and blank lines" },
    { label: "Timestamp Normalisation", desc: "Normalises all timestamps to YYYY-MM-DD HH:MM (24-hour ISO format)" },
    { label: "Deduplication", desc: "Generates a SHA-1 ID per message for stable deduplication across re-uploads" },
    { label: "Exported Functions", desc: "parseChatHistory  ·  getPersonaMessages  ·  getAverageWordsPerMessage" },
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
    { step: "01", label: "Message Sampling", desc: "Samples the first 80 messages of a persona to stay within the LLM context window limits." },
    { step: "02", label: "Phrase Hints", desc: "Computes top-8 frequent words (≥3 chars, appearing >1 time) from sampled messages as phrase hints." },
    { step: "03", label: "LLM Prompt", desc: "Sends a structured prompt to Ollama requesting a JSON object with 8 fields: tone, communicationStyle, responseLength, commonPhrases, sentiment, vocabularyPatterns, relationshipSignals, notes." },
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
      detail: "Calls Ollama with LLaMA 3 at temperature 0.7. Returns the raw generated text string.",
    },
    {
      name: "embedWithOllama(texts[])",
      endpoint: "POST /api/embed",
      detail: "Embeds an array of strings using nomic-embed-text. Supports both embeddings[] and legacy embedding response shapes for compatibility.",
    },
  ];

  funcs.forEach((f, i) => {
    const y = 1.45 + i * 1.45;
    s.addShape(pres.shapes.RECTANGLE, { x: 0.4, y, w: 9.2, h: 1.25, fill: { color: "F5F5F5" }, line: { color: C.teal, width: 1 } });
    s.addShape(pres.shapes.RECTANGLE, { x: 0.4, y, w: 0.07, h: 1.25, fill: { color: C.teal }, line: { color: C.teal } });
    s.addText(f.name, { x: 0.6, y: y + 0.1, w: 8.8, h: 0.35, fontSize: 13, bold: true, color: C.teal, fontFace: "Consolas", margin: 0 });
    s.addText(f.endpoint, { x: 0.6, y: y + 0.5, w: 3.5, h: 0.28, fontSize: 10, color: "262626", fontFace: "Consolas", margin: 0 });
    s.addText(f.detail, { x: 0.6, y: y + 0.82, w: 8.8, h: 0.35, fontSize: 11, color: "262626", fontFace: "Calibri", margin: 0 });
  });

  s.addText("Configuration via Environment Variables", {
    x: 0.4, y: 4.45, w: 5, h: 0.3, fontSize: 12, bold: true, color: "737373", fontFace: "Arial", margin: 0,
  });
  s.addText([
    { text: "OLLAMA_URL — Ollama server address (default: http://127.0.0.1:11434)", options: { bullet: true, breakLine: true } },
    { text: "OLLAMA_MODEL — Generation model name (default: llama3)", options: { bullet: true, breakLine: true } },
    { text: "OLLAMA_EMBED_MODEL — Embedding model name (default: nomic-embed-text)", options: { bullet: true } },
  ], { x: 0.4, y: 4.8, w: 9.2, h: 0.72, fontSize: 10.5, color: "262626", fontFace: "Consolas" });
}

// ===== SLIDE 10: MODULE 4 — CHROMA MEMORY STORE =====
{
  const s = pres.addSlide();
  addHeader(s, "Module 4: Chroma Memory Store  ·  lib/chroma.ts");
  s.addText("Manages the ditto_memories_v2 ChromaDB collection", {
    x: 0.4, y: 0.9, w: 9.2, h: 0.35, fontSize: 12, color: "737373", fontFace: "Calibri", margin: 0,
  });

  const funcs = [
    {
      name: "storePersonaMemories(messages, personaName)",
      desc: "Upserts all persona messages as embeddings into the collection. Stores author, timestamp, and personaName as metadata. Each vector ID is keyed as personaName:sha1_of_message for stable deduplication.",
    },
    {
      name: "queryPersonaMemories(message, personaName, k)",
      desc: "Embeds the incoming user message, queries ChromaDB with a where filter on personaName, and returns the top-K results with distance scores. Used to build the retrieved context for the simulation prompt.",
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
  s.addText("Collection: ditto_memories_v2  ·  Embedding: nomic-embed-text  ·  Config: CHROMA_URL env var", {
    x: 0.55, y: 5.0, w: 9.0, h: 0.4, fontSize: 10.5, color: "262626", fontFace: "Consolas", margin: 0,
  });
}

// ===== SLIDE 11: MODULE 5 — API ROUTES =====
{
  const s = pres.addSlide();
  addHeader(s, "Module 5: API Routes  ·  app/api/personas/");

  // POST /api/personas
  s.addShape(pres.shapes.RECTANGLE, { x: 0.3, y: 0.9, w: 9.4, h: 2.15, fill: { color: C.cardBg }, line: { color: C.cardBorder }, shadow: makeShadow() });
  s.addShape(pres.shapes.RECTANGLE, { x: 0.3, y: 0.9, w: 9.4, h: 0.36, fill: { color: C.blue }, line: { color: C.blue } });
  s.addText("POST /api/personas  —  Create Persona", {
    x: 0.5, y: 0.9, w: 9.0, h: 0.36, fontSize: 13, bold: true, color: C.white, fontFace: "Consolas", valign: "middle", margin: 0,
  });
  s.addText([
    { text: "Validates request body (personaName, chatHistory)", options: { bullet: { type: "number" }, breakLine: true } },
    { text: "Parses chat, filters to persona messages, computes summary stats", options: { bullet: { type: "number" }, breakLine: true } },
    { text: "Calls personality extractor and memory store in sequence", options: { bullet: { type: "number" }, breakLine: true } },
    { text: "Returns CreatePersonaResponse with full persona record and stored memory count", options: { bullet: { type: "number" } } },
  ], { x: 0.5, y: 1.32, w: 9.0, h: 1.65, fontSize: 11, fontFace: "Calibri", color: C.darkText });

  // POST /api/personas/chat
  s.addShape(pres.shapes.RECTANGLE, { x: 0.3, y: 3.2, w: 9.4, h: 2.2, fill: { color: C.cardBg }, line: { color: C.cardBorder }, shadow: makeShadow() });
  s.addShape(pres.shapes.RECTANGLE, { x: 0.3, y: 3.2, w: 9.4, h: 0.36, fill: { color: C.teal }, line: { color: C.teal } });
  s.addText("POST /api/personas/chat  —  Chat Simulation", {
    x: 0.5, y: 3.2, w: 9.0, h: 0.36, fontSize: 13, bold: true, color: C.white, fontFace: "Consolas", valign: "middle", margin: 0,
  });
  s.addText([
    { text: "Validates request body (personaName, message, profile)", options: { bullet: { type: "number" }, breakLine: true } },
    { text: "Retrieves top-5 semantic memories from ChromaDB", options: { bullet: { type: "number" }, breakLine: true } },
    { text: "Builds a simulation prompt combining the personality profile and retrieved context", options: { bullet: { type: "number" }, breakLine: true } },
    { text: "Calls Ollama for generation and returns the reply with retrieved memories", options: { bullet: { type: "number" } } },
  ], { x: 0.5, y: 3.62, w: 9.0, h: 1.65, fontSize: 11, fontFace: "Calibri", color: C.darkText });
}

// ===== SLIDE 12: MODULE 6 — UI =====
{
  const s = pres.addSlide();
  addHeader(s, "Module 6: UI — Ditto Studio  ·  components/ditto-studio.tsx");

  s.addText("Single-page React component with six visual sections:", {
    x: 0.4, y: 0.85, w: 9, h: 0.35, fontSize: 12, color: C.mutedText, fontFace: "Calibri", margin: 0,
  });

  const sections = [
    { num: "1", title: "Hero Card", desc: "Project overview and feature highlights", color: C.teal },
    { num: "2", title: "System Status Card", desc: "Live display of stack components: Next.js, Ollama, Chroma", color: C.blue },
    { num: "3", title: "Create Persona Panel", desc: "File upload, format validation, speaker detection radio group, chat preview, and persona creation trigger", color: C.midBlue },
    { num: "4", title: "Chat Simulation Panel", desc: "Message input, simulate button, and a chat-bubble conversation thread", color: C.teal },
    { num: "5", title: "Extracted Profile Panel", desc: "Summary stats and raw JSON profile viewer", color: C.blue },
    { num: "6", title: "Retrieved Context Panel", desc: "Per-memory cards with author, timestamp, and distance badges", color: C.midBlue },
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
    ["Frontend framework", "Next.js (App Router)", "v14+"],
    ["UI language", "TypeScript + React", "React 18+"],
    ["Component library", "shadcn/ui (Radix + Tailwind)", "Latest"],
    ["Local LLM runtime", "Ollama", "Latest stable"],
    ["LLM model", "LLaMA 3 (llama3)", "Meta via Ollama"],
    ["Embedding model", "nomic-embed-text", "Via Ollama"],
    ["Vector database", "ChromaDB", "v0.5+ (REST API)"],
    ["ChromaDB client", "chromadb npm package", "Latest"],
    ["Node.js", "Node.js", "v18+"],
    ["Package manager", "npm / pnpm", "—"],
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
    { label: "Personality Extractor", action: "Sample first 80 messages  ·  Compute top-8 frequent words  ·  Build LLM prompt" },
    { label: "Ollama — LLaMA 3", action: "Generate structured JSON PersonalityProfile  ·  Extract JSON block via brace-matching  ·  Validate & fill fallback fields" },
    { label: "nomic-embed-text", action: "Embed all persona messages → float[][] vectors (768 dimensions per message)" },
    { label: "ChromaDB", action: "Upsert vectors with metadata: author, timestamp, personaName into ditto_memories_v2 collection" },
    { label: "API → UI", action: "Return PersonaRecord + storedMemories count  ·  Display profile JSON + summary stats in browser" },
  ];

  const stepH = 0.65;
  const shapeH = 0.57;
  steps.forEach((step, i) => {
    const y = 0.85 + i * stepH;
    const isEven = i % 2 === 0;
    s.addShape(pres.shapes.RECTANGLE, { x: 0.3, y, w: 9.4, h: shapeH, fill: { color: isEven ? "F5F5F5" : "E5E5E5" }, line: { color: isEven ? C.blue : C.teal, width: 0.5 } });
    s.addShape(pres.shapes.RECTANGLE, { x: 0.3, y, w: 1.8, h: shapeH, fill: { color: isEven ? C.blue : C.teal }, line: { color: isEven ? C.blue : C.teal } });
    s.addText(step.label, { x: 0.3, y, w: 1.8, h: shapeH, fontSize: 10, bold: true, color: C.white, fontFace: "Arial", align: "center", valign: "middle", margin: 0 });
    s.addText(step.action, { x: 2.2, y: y + 0.08, w: 7.4, h: 0.4, fontSize: 10, color: "262626", fontFace: "Calibri", margin: 0 });
  });
}

// ===== SLIDE 16: DATA FLOW — CHAT SIMULATION =====
{
  const s = pres.addSlide();
  addHeader(s, "Data Flow: Chat Simulation");

  const steps = [
    { label: "User", action: "Types a message in the Chat Simulation panel" },
    { label: "POST /chat", action: "Receive: personaName, message, profile  ·  Validate request body" },
    { label: "nomic-embed-text", action: "Embed user message → query vector (768 dimensions)" },
    { label: "ChromaDB Query", action: "Filter by personaName  ·  Return top-5 nearest memories: id, content, author, timestamp, distance" },
    { label: "Prompt Builder", action: "Compose: \"You are <name>. Personality: <profile JSON>. Past context: <memories>. User: <message>\"" },
    { label: "Ollama — LLaMA 3", action: "Generate reply at temperature 0.7 grounded in the persona profile and retrieved context" },
    { label: "API → UI", action: "Display reply chat bubble  ·  Display retrieved memory cards with cosine distance scores" },
  ];

  const stepH = 0.65;
  const shapeH = 0.57;
  steps.forEach((step, i) => {
    const y = 0.85 + i * stepH;
    const isEven = i % 2 === 0;
    s.addShape(pres.shapes.RECTANGLE, { x: 0.3, y, w: 9.4, h: shapeH, fill: { color: isEven ? "F5F5F5" : "E5E5E5" }, line: { color: isEven ? C.blue : C.teal, width: 0.5 } });
    s.addShape(pres.shapes.RECTANGLE, { x: 0.3, y, w: 1.8, h: shapeH, fill: { color: isEven ? C.blue : C.teal }, line: { color: isEven ? C.blue : C.teal } });
    s.addText(step.label, { x: 0.3, y, w: 1.8, h: shapeH, fontSize: 10, bold: true, color: C.white, fontFace: "Arial", align: "center", valign: "middle", margin: 0 });
    s.addText(step.action, { x: 2.2, y: y + 0.08, w: 7.4, h: 0.4, fontSize: 10, color: "262626", fontFace: "Calibri", margin: 0 });
  });
}

// ===== SLIDE 16A: PROJECT FLOWCHART =====
{
  const s = pres.addSlide();
  addHeader(s, "Architecture Flowchart");

  s.addText(
    "High-level module view of the DITTO pipeline across the frontend, API routes, parsing, profile extraction, embeddings, vector memory, and reply generation.",
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
  })

  s.addText(
    "Flowchart source: docs/PROJECT_FLOWCHART.mmd",
    { x: 0.55, y: 5.18, w: 8.9, h: 0.22, fontSize: 9.5, color: "262626", fontFace: "Consolas", italic: true, margin: 0 }
  );
}

// ===== SLIDE 17: TABLE DESIGN — CHROMADB COLLECTION =====
{
  const s = pres.addSlide();
  addHeader(s, "Table Design: ChromaDB Collection  ·  ditto_memories_v2");

  s.addText(
    "DITTO uses ChromaDB (a vector database) rather than a relational database. Data is stored in a collection rather than SQL tables. The logical schema is described below:",
    { x: 0.3, y: 0.85, w: 9.4, h: 0.42, fontSize: 11, color: C.mutedText, fontFace: "Calibri", margin: 0 }
  );

  const chromaRows = [
    [
      { text: "Field", options: { bold: true, color: C.white, fill: { color: C.blue }, fontSize: 11, fontFace: "Arial" } },
      { text: "Type", options: { bold: true, color: C.white, fill: { color: C.blue }, fontSize: 11, fontFace: "Arial" } },
      { text: "Description", options: { bold: true, color: C.white, fill: { color: C.blue }, fontSize: 11, fontFace: "Arial" } },
    ],
    ["id", "string", "Unique record key: {personaName}:{sha1_of_raw_line}"],
    ["embedding", "float[]", "nomic-embed-text vector (768 dimensions)"],
    ["document", "string", "Raw message content text"],
    ["metadata.personaName", "string", "The persona this memory belongs to"],
    ["metadata.author", "string", "Original chat author name"],
    ["metadata.timestamp", "string", "Normalised ISO-style timestamp (YYYY-MM-DD HH:MM)"],
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
    "Note: Vector IDs use the format personaName:sha1 to support multi-persona collections in a single ChromaDB instance. Metadata filtering via where clause restricts queries to the selected persona only.",
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

// ===== SLIDE 19: TYPESCRIPT TYPES — PersonaSummary, RetrievedMemory, API Responses =====
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

  s.addText("RetrievedMemory", { x: 0.3, y: 2.82, w: 4.5, h: 0.3, fontSize: 12, bold: true, color: C.darkText, fontFace: "Arial", margin: 0 });
  s.addTable([
    [
      { text: "Field", options: { bold: true, color: C.white, fill: { color: C.midBlue }, fontSize: 9.5 } },
      { text: "Type", options: { bold: true, color: C.white, fill: { color: C.midBlue }, fontSize: 9.5 } },
      { text: "Description", options: { bold: true, color: C.white, fill: { color: C.midBlue }, fontSize: 9.5 } },
    ],
    ["id", "string", "ChromaDB document ID"],
    ["author", "string", "Original message author"],
    ["content", "string", "Message text"],
    ["timestamp", "string", "Message timestamp"],
    ["distance", "number | null", "Cosine distance from query vector (lower = more similar)"],
  ], { x: 0.3, y: 3.17, w: 4.55, h: 1.83, colW: [1.3, 1.15, 2.1], border: { pt: 0.5, color: C.tableBorder }, fill: { color: C.cardBg }, fontSize: 9.5, fontFace: "Calibri", color: C.darkText, rowH: 0.33 });

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
    ["storedMemories", "number", "Count of vectors upserted to ChromaDB"],
  ], { x: 5.1, y: 1.2, w: 4.55, h: 1.5, colW: [1.6, 1.5, 1.45], border: { pt: 0.5, color: C.tableBorder }, fill: { color: C.cardBg }, fontSize: 9.5, fontFace: "Calibri", color: C.darkText, rowH: 0.28 });

  s.addText("ChatSimulationResponse", { x: 5.1, y: 2.97, w: 4.5, h: 0.3, fontSize: 12, bold: true, color: C.darkText, fontFace: "Arial", margin: 0 });
  s.addTable([
    [
      { text: "Field", options: { bold: true, color: C.white, fill: { color: C.blue }, fontSize: 9.5 } },
      { text: "Type", options: { bold: true, color: C.white, fill: { color: C.blue }, fontSize: 9.5 } },
      { text: "Description", options: { bold: true, color: C.white, fill: { color: C.blue }, fontSize: 9.5 } },
    ],
    ["reply", "string", "LLM-generated persona reply"],
    ["retrievedContext", "RetrievedMemory[]", "Top-K memories used to ground the reply"],
  ], { x: 5.1, y: 3.32, w: 4.55, h: 0.9, colW: [1.5, 1.6, 1.45], border: { pt: 0.5, color: C.tableBorder }, fill: { color: C.cardBg }, fontSize: 9.5, fontFace: "Calibri", color: C.darkText, rowH: 0.28 });
}

// ===== SLIDE 20: IMPLEMENTATION — DEV ENVIRONMENT =====
{
  const s = pres.addSlide();
  addHeader(s, "Implementation: Development Environment Setup");

  const cards = [
    {
      title: "Frontend Stack",
      body: "Next.js 16.1.7 (App Router) + React 19.2.4 + TypeScript throughout. Dev server runs with Turbopack (next dev --turbopack) for fast incremental builds.",
      x: 0.3, y: 0.95,
    },
    {
      title: "Local AI Services",
      body: "Ollama — serves llama3 (generation) and nomic-embed-text (embedding) at http://127.0.0.1:11434. ChromaDB — vector REST server at http://127.0.0.1:8000, storing data in the chroma/ directory.",
      x: 5.2, y: 0.95,
    },
    {
      title: "Build Configuration",
      body: "chromadb declared as serverExternalPackage in next.config.mjs to prevent client-side bundling. All service URLs configurable via environment variables with local defaults.",
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
      desc: "Discards blank lines, <Media omitted> entries, and WhatsApp system notices (end-to-end encryption banners, group change notices).",
    },
    {
      step: "03", color: C.midBlue,
      label: "Stable ID Generation",
      desc: "Applies SHA-1 to each raw line to produce a deterministic message ID — used as the ChromaDB upsert key so re-uploads never create duplicate vectors.",
    },
    {
      step: "04", color: C.teal,
      label: "Helper Exports",
      desc: "getPersonaMessages — case-insensitive author filter.  getAverageWordsPerMessage — mean word count rounded to 1 decimal place.",
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
  s.addShape(pres.shapes.RECTANGLE, { x: 0.3, y: 2.6, w: 9.4, h: 1.55, fill: { color: "F5F5F5" }, line: { color: C.blue, width: 1 } });
  s.addShape(pres.shapes.RECTANGLE, { x: 0.3, y: 2.6, w: 0.07, h: 1.55, fill: { color: C.blue }, line: { color: C.blue } });
  s.addText("Stage 2 — LLM-based Extraction", { x: 0.48, y: 2.67, w: 9.0, h: 0.35, fontSize: 13, bold: true, color: "404040", fontFace: "Arial", margin: 0 });
  s.addText(
    "First 80 messages are formatted into a structured prompt instructing Ollama/LLaMA 3 to return a strict JSON object with 8 fields: tone, communicationStyle, responseLength, commonPhrases, sentiment, vocabularyPatterns, relationshipSignals, notes. The raw output is parsed by a brace-matching extractor that isolates the JSON block even when the model wraps it in prose.",
    { x: 0.48, y: 3.08, w: 9.0, h: 1.0, fontSize: 11, color: "262626", fontFace: "Calibri", margin: 0 }
  );

  // Fallback callout
  s.addShape(pres.shapes.RECTANGLE, { x: 0.3, y: 4.3, w: 9.4, h: 0.95, fill: { color: "F5F5F5" }, line: { color: C.teal, width: 0.5 } });
  s.addText(
    "Fallback: If JSON extraction fails, a default profile pre-populated with the phrase hints is returned — the pipeline never crashes due to a malformed LLM response.",
    { x: 0.48, y: 4.38, w: 9.1, h: 0.8, fontSize: 11, color: "262626", fontFace: "Calibri", italic: true, margin: 0 }
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
    { name: "generateWithOllama(prompt)", detail: "POST /api/generate  ·  stream: false  ·  temperature 0.7  ·  cache: no-store to prevent stale outputs" },
    { name: "embedWithOllama(texts[])", detail: "POST /api/embed  ·  Handles both embeddings[] (current) and embedding (legacy) response shapes for version compatibility" },
  ];
  ollamaFuncs.forEach((f, i) => {
    const y = 1.27 + i * 0.95;
    s.addShape(pres.shapes.RECTANGLE, { x: 0.3, y, w: 9.4, h: 0.82, fill: { color: "F5F5F5" }, line: { color: C.teal, width: 0.5 } });
    s.addShape(pres.shapes.RECTANGLE, { x: 0.3, y, w: 0.06, h: 0.82, fill: { color: C.teal }, line: { color: C.teal } });
    s.addText(f.name, { x: 0.48, y: y + 0.07, w: 9.0, h: 0.3, fontSize: 11.5, bold: true, color: C.teal, fontFace: "Consolas", margin: 0 });
    s.addText(f.detail, { x: 0.48, y: y + 0.45, w: 9.0, h: 0.3, fontSize: 10.5, color: "262626", fontFace: "Calibri", margin: 0 });
  });

  s.addText("lib/chroma.ts — Vector Memory Store", {
    x: 0.3, y: 3.25, w: 5, h: 0.32, fontSize: 12, bold: true, color: "404040", fontFace: "Arial", margin: 0,
  });

  const chromaFuncs = [
    { name: "storePersonaMemories", detail: "Embeds every persona message via Ollama, upserts with composite ID (personaName:sha1). Metadata: personaName, author, timestamp. Idempotent — re-running never creates duplicates." },
    { name: "queryPersonaMemories", detail: "Embeds user message, queries Chroma with $eq filter on personaName, returns top-K results with cosine-distance scores surfaced in the UI." },
  ];
  chromaFuncs.forEach((f, i) => {
    const y = 3.65 + i * 0.95;
    s.addShape(pres.shapes.RECTANGLE, { x: 0.3, y, w: 9.4, h: 0.82, fill: { color: "F5F5F5" }, line: { color: C.blue, width: 0.5 } });
    s.addShape(pres.shapes.RECTANGLE, { x: 0.3, y, w: 0.06, h: 0.82, fill: { color: C.blue }, line: { color: C.blue } });
    s.addText(f.name, { x: 0.48, y: y + 0.07, w: 9.0, h: 0.3, fontSize: 11.5, bold: true, color: "404040", fontFace: "Consolas", margin: 0 });
    s.addText(f.detail, { x: 0.48, y: y + 0.45, w: 9.0, h: 0.3, fontSize: 10.5, color: "262626", fontFace: "Calibri", margin: 0 });
  });
}

// ===== SLIDE 24: IMPLEMENTATION — API ROUTES =====
{
  const s = pres.addSlide();
  addHeader(s, "Implementation: API Route Logic  ·  app/api/personas/");

  // POST /api/personas
  s.addShape(pres.shapes.RECTANGLE, { x: 0.3, y: 0.88, w: 9.4, h: 1.8, fill: { color: C.cardBg }, line: { color: C.cardBorder }, shadow: makeShadow() });
  s.addShape(pres.shapes.RECTANGLE, { x: 0.3, y: 0.88, w: 9.4, h: 0.38, fill: { color: C.blue }, line: { color: C.blue } });
  s.addText("POST /api/personas  —  Persona Creation Pipeline", {
    x: 0.48, y: 0.88, w: 9.0, h: 0.38, fontSize: 13, bold: true, color: C.white, fontFace: "Consolas", valign: "middle", margin: 0,
  });
  s.addText([
    { text: "Validate personaName + chatHistory; return 400 if missing or persona not found in chat", options: { bullet: { type: "number" }, breakLine: true } },
    { text: "Compute PersonaSummary: total messages, average word count, all unique authors", options: { bullet: { type: "number" }, breakLine: true } },
    { text: "Call buildPersonalityProfile (Ollama LLaMA 3) → structured JSON PersonalityProfile", options: { bullet: { type: "number" }, breakLine: true } },
    { text: "Call storePersonaMemories (Chroma) → upsert all vectors; return stored count", options: { bullet: { type: "number" } } },
  ], { x: 0.48, y: 1.55, w: 9.0, h: 0.84, fontSize: 11, fontFace: "Calibri", color: C.darkText });

  // POST /api/personas/chat
  s.addShape(pres.shapes.RECTANGLE, { x: 0.3, y: 3.01, w: 9.4, h: 1.8, fill: { color: C.cardBg }, line: { color: C.cardBorder }, shadow: makeShadow() });
  s.addShape(pres.shapes.RECTANGLE, { x: 0.3, y: 3.01, w: 9.4, h: 0.38, fill: { color: C.teal }, line: { color: C.teal } });
  s.addText("POST /api/personas/chat  —  RAG Simulation Loop", {
    x: 0.48, y: 3.01, w: 9.0, h: 0.38, fontSize: 13, bold: true, color: C.white, fontFace: "Consolas", valign: "middle", margin: 0,
  });
  s.addText([
    { text: "Validate personaName, message, profile; return 400 if any field missing", options: { bullet: { type: "number" }, breakLine: true } },
    { text: "Embed user message → query Chroma for top-5 semantically nearest persona memories", options: { bullet: { type: "number" }, breakLine: true } },
    { text: "Compose prompt: PersonalityProfile JSON + retrieved memories + user message", options: { bullet: { type: "number" }, breakLine: true } },
    { text: "Call generateWithOllama → return reply + retrieved context with distance scores", options: { bullet: { type: "number" } } },
  ], { x: 0.48, y: 3.68, w: 9.0, h: 0.84, fontSize: 11, fontFace: "Calibri", color: C.darkText });

  s.addShape(pres.shapes.RECTANGLE, { x: 0.3, y: 5.1, w: 9.4, h: 0.35, fill: { color: "F5F5F5" }, line: { color: C.teal, width: 0.5 } });
  s.addText("Both routes include the relevant service URL in 500 error messages for easy local debugging.", {
    x: 0.48, y: 5.15, w: 9.0, h: 0.25, fontSize: 10, color: "262626", fontFace: "Calibri", italic: true, margin: 0,
  });
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
      label: "Format Validation",
      desc: "hasValidChatFormat runs a lightweight regex test before accepting a file. Non-WhatsApp files are rejected client-side before any API call is made.",
      color: C.blue,
    },
    {
      label: "Chat History Accumulation",
      desc: "Each simulation appends a { role, content } pair to chatTurns, building a persistent conversation thread within the session without any backend session state.",
      color: C.midBlue,
    },
    {
      label: "UI Component Library",
      desc: "Entirely composed of shadcn/ui primitives (Card, Button, Textarea, Badge, Alert, ScrollArea, RadioGroup) with Tailwind CSS v4 and dark mode via next-themes.",
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

// ===== SLIDE 26: THANK YOU =====
{
  const s = pres.addSlide();
  s.background = { color: C.darkBg };

  // Border frame
  s.addShape(pres.shapes.RECTANGLE, { x: 0, y: 0, w: 10, h: 0.07, fill: { color: C.teal }, line: { color: C.teal } });
  s.addShape(pres.shapes.RECTANGLE, { x: 0, y: 5.555, w: 10, h: 0.07, fill: { color: C.teal }, line: { color: C.teal } });
  s.addShape(pres.shapes.RECTANGLE, { x: 0, y: 0, w: 0.15, h: 5.625, fill: { color: C.teal }, line: { color: C.teal } });
  s.addShape(pres.shapes.RECTANGLE, { x: 9.85, y: 0, w: 0.15, h: 5.625, fill: { color: C.teal }, line: { color: C.teal } });

  // Accent line behind the main text
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

  s.addText("Next.js  ·  Ollama / LLaMA 3  ·  ChromaDB  ·  nomic-embed-text  ·  RAG", {
    x: 1.0, y: 4.85, w: 8, h: 0.35,
    fontSize: 10, color: "737373", fontFace: "Consolas", align: "center", margin: 0,
  });
}

pres
  .writeFile({ fileName: "docs/DITTO_Project_Report.pptx" })
  .then(() => console.log("Done! docs/DITTO_Project_Report.pptx created."))
  .catch(console.error);
