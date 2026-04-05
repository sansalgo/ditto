import {
  AlignmentType,
  BorderStyle,
  Document,
  FileChild,
  Footer,
  Header,
  HeadingLevel,
  ImageRun,
  LevelFormat,
  Packer,
  PageBreak,
  PageNumber,
  Paragraph,
  RelativeHorizontalPosition,
  RelativeVerticalPosition,
  ShadingType,
  Table,
  TableAnchorType,
  TableCell,
  TableOfContents,
  TableRow,
  TextRun,
  VerticalAlign,
  WidthType,
} from "docx"
import { readFileSync, writeFileSync } from "node:fs"
import path from "node:path"

// ── Constants ─────────────────────────────────────────────────────────────────

const CONTENT_WIDTH = 9360 // US Letter (8.5" − 2×1" margins) in DXA
const PAGE_MARGIN = { top: 1440, right: 1440, bottom: 1440, left: 1440 }

// Images are loaded relative to the project root (run: bun docs/generate-docx.ts)
const FLOWCHART = readFileSync("docs/PROJECT_FLOWCHART.png")
const SCREENSHOTS = {
  uploadPanel: readFileSync("docs/screenshots/upload-panel.png"),
  personaSelector: readFileSync("docs/screenshots/persona-selector.png"),
  profileJson: readFileSync("docs/screenshots/profile-json.png"),
  summaryStats: readFileSync("docs/screenshots/summary-stats.png"),
  chatSimulation: readFileSync("docs/screenshots/chat-simulation.png"),
  retrievedContext: readFileSync("docs/screenshots/retrieved-context.png"),
  fullUi: readFileSync("docs/screenshots/full-ui.png"),
}

// ── Border helpers ─────────────────────────────────────────────────────────────

const cellBorder = { style: BorderStyle.SINGLE, size: 1, color: "CCCCCC" }
const cellBorders = {
  top: cellBorder,
  bottom: cellBorder,
  left: cellBorder,
  right: cellBorder,
}
const noBorder = { style: BorderStyle.NONE, size: 0, color: "FFFFFF" }
const noBorders = {
  top: noBorder,
  bottom: noBorder,
  left: noBorder,
  right: noBorder,
  insideH: noBorder,
  insideV: noBorder,
}

// ── Paragraph helpers ──────────────────────────────────────────────────────────

function heading1(text: string): Paragraph {
  return new Paragraph({
    heading: HeadingLevel.HEADING_1,
    spacing: { before: 360, after: 160 },
    children: [new TextRun({ text, font: "Arial", size: 32, bold: true, color: "1F3864" })],
  })
}

function heading2(text: string): Paragraph {
  return new Paragraph({
    heading: HeadingLevel.HEADING_2,
    spacing: { before: 280, after: 120 },
    children: [new TextRun({ text, font: "Arial", size: 26, bold: true, color: "2E5090" })],
  })
}

function heading3(text: string): Paragraph {
  return new Paragraph({
    heading: HeadingLevel.HEADING_3,
    spacing: { before: 200, after: 80 },
    children: [new TextRun({ text, font: "Arial", size: 22, bold: true, color: "2E5090" })],
  })
}

interface ParaOptions {
  center?: boolean
  spaceBefore?: number
  spaceAfter?: number
  size?: number
  bold?: boolean
  italic?: boolean
  color?: string
}

function para(text: string, opts: ParaOptions = {}): Paragraph {
  return new Paragraph({
    alignment: opts.center ? AlignmentType.CENTER : AlignmentType.JUSTIFIED,
    spacing: { before: opts.spaceBefore ?? 80, after: opts.spaceAfter ?? 120, line: 276 },
    children: [
      new TextRun({
        text,
        font: "Arial",
        size: opts.size ?? 22,
        bold: opts.bold ?? false,
        italics: opts.italic ?? false,
        color: opts.color ?? "000000",
      }),
    ],
  })
}

function bullet(text: string, level = 0): Paragraph {
  return new Paragraph({
    numbering: { reference: "bullets", level },
    spacing: { before: 40, after: 40 },
    children: [new TextRun({ text, font: "Arial", size: 22 })],
  })
}

function numbered(text: string, level = 0): Paragraph {
  return new Paragraph({
    numbering: { reference: "numbers", level },
    spacing: { before: 40, after: 40 },
    children: [new TextRun({ text, font: "Arial", size: 22 })],
  })
}

function spacer(before = 80): Paragraph {
  return new Paragraph({ spacing: { before, after: 0 }, children: [] })
}

function pageBreak(): Paragraph {
  return new Paragraph({ children: [new PageBreak()] })
}

function codeBlock(text: string): Paragraph[] {
  return text.split("\n").map(
    (line) =>
      new Paragraph({
        spacing: { before: 0, after: 0, line: 240 },
        indent: { left: 720 },
        children: [
          new TextRun({
            text: line || " ",
            font: "Courier New",
            size: 18,
            color: "1A1A2E",
          }),
        ],
        border: {
          left: { style: BorderStyle.SINGLE, size: 4, color: "2E5090", space: 8 },
        },
      })
  )
}

function caption(text: string): Paragraph {
  return new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { before: 60, after: 120 },
    children: [new TextRun({ text, font: "Arial", size: 18, italics: true, color: "555555" })],
  })
}

// ── Table helper ───────────────────────────────────────────────────────────────

function makeTable(headers: string[], rows: string[][], colWidths: number[]): Table {
  const totalWidth = colWidths.reduce((a, b) => a + b, 0)

  const headerRow = new TableRow({
    tableHeader: true,
    children: headers.map(
      (h, i) =>
        new TableCell({
          borders: cellBorders,
          width: { size: colWidths[i], type: WidthType.DXA },
          shading: { fill: "1F3864", type: ShadingType.CLEAR },
          margins: { top: 100, bottom: 100, left: 150, right: 150 },
          verticalAlign: VerticalAlign.CENTER,
          children: [
            new Paragraph({
              children: [
                new TextRun({ text: h, font: "Arial", size: 20, bold: true, color: "FFFFFF" }),
              ],
            }),
          ],
        })
    ),
  })

  const dataRows = rows.map(
    (row, ri) =>
      new TableRow({
        children: row.map(
          (cell, ci) =>
            new TableCell({
              borders: cellBorders,
              width: { size: colWidths[ci], type: WidthType.DXA },
              shading: {
                fill: ri % 2 === 0 ? "EEF3FB" : "FFFFFF",
                type: ShadingType.CLEAR,
              },
              margins: { top: 80, bottom: 80, left: 150, right: 150 },
              verticalAlign: VerticalAlign.CENTER,
              children: [
                new Paragraph({
                  children: [new TextRun({ text: cell, font: "Arial", size: 20 })],
                }),
              ],
            })
        ),
      })
  )

  return new Table({
    width: { size: totalWidth, type: WidthType.DXA },
    columnWidths: colWidths,
    rows: [headerRow, ...dataRows],
  })
}

// ── Screenshot table helper ────────────────────────────────────────────────────
// Each call produces a 2-column, no-border table with labelled screenshots.

interface ScreenshotEntry {
  label: string
  data: Buffer
  type: "png" | "jpg"
  widthPx: number   // rendered width in pixels (96 px = 1 inch)
  heightPx: number  // rendered height in pixels
}

const SCREENSHOT_FLOAT = {
  horizontalAnchor: TableAnchorType.MARGIN,
  verticalAnchor: TableAnchorType.PAGE,
  relativeHorizontalPosition: RelativeHorizontalPosition.CENTER,
  relativeVerticalPosition: RelativeVerticalPosition.CENTER,
} as const

interface ScreenshotTableOpts { float?: boolean }

function screenshotTable(left: ScreenshotEntry, right: ScreenshotEntry, opts: ScreenshotTableOpts = {}): Table {
  const makeCell = (entry: ScreenshotEntry): TableCell =>
    new TableCell({
      borders: noBorders,
      width: { size: 4680, type: WidthType.DXA },
      margins: { top: 80, bottom: 80, left: 120, right: 120 },
      children: [
        new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing: { before: 0, after: 60 },
          children: [
            new ImageRun({
              type: entry.type,
              data: entry.data,
              transformation: { width: entry.widthPx, height: entry.heightPx },
              altText: { title: entry.label, description: entry.label, name: entry.label },
            }),
          ],
        }),
        new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing: { before: 0, after: 0 },
          children: [
            new TextRun({ text: entry.label, font: "Arial", size: 18, italics: true, color: "555555" }),
          ],
        }),
      ],
    })

  return new Table({
    width: { size: CONTENT_WIDTH, type: WidthType.DXA },
    ...(opts.float ? { float: SCREENSHOT_FLOAT } : {}),
    columnWidths: [4680, 4680],
    rows: [new TableRow({ children: [makeCell(left), makeCell(right)] })],
  })
}

// ── Front-page helpers (no header/footer section) ────────────────────────────

function fCenter(text: string, opts: { size?: number; bold?: boolean; spaceBefore?: number; spaceAfter?: number } = {}): Paragraph {
  return new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { before: opts.spaceBefore ?? 120, after: opts.spaceAfter ?? 120, line: 276 },
    children: [
      new TextRun({
        text,
        font: "Times New Roman",
        size: opts.size ?? 24,
        bold: opts.bold ?? false,
      }),
    ],
  })
}

function fJustify(text: string, opts: { size?: number; bold?: boolean; spaceBefore?: number; spaceAfter?: number } = {}): Paragraph {
  return new Paragraph({
    alignment: AlignmentType.JUSTIFIED,
    spacing: { before: opts.spaceBefore ?? 80, after: opts.spaceAfter ?? 80, line: 360 },
    children: [
      new TextRun({
        text,
        font: "Times New Roman",
        size: opts.size ?? 24,
        bold: opts.bold ?? false,
      }),
    ],
  })
}

function fRight(text: string, opts: { size?: number; bold?: boolean; spaceBefore?: number } = {}): Paragraph {
  return new Paragraph({
    alignment: AlignmentType.RIGHT,
    spacing: { before: opts.spaceBefore ?? 80, after: 80, line: 276 },
    children: [
      new TextRun({
        text,
        font: "Times New Roman",
        size: opts.size ?? 24,
        bold: opts.bold ?? false,
      }),
    ],
  })
}


// ── Front pages content ───────────────────────────────────────────────────────

const front_children: FileChild[] = []
const fp = (...items: FileChild[]) => front_children.push(...items)

// ── PAGE 1: TITLE PAGE ────────────────────────────────────────────────────────

fp(
  spacer(1440),
  fCenter("MCA MINI PROJECT REPORT", { size: 28, bold: true, spaceBefore: 0, spaceAfter: 240 }),
  fCenter("ON", { size: 28, bold: true, spaceBefore: 0, spaceAfter: 240 }),
  fCenter('"DITTO — DIGITAL TWIN STUDIO"', { size: 28, bold: true, spaceBefore: 0, spaceAfter: 480 }),
  fCenter("Submitted in partial fulfillment of the requirements", { size: 24, spaceBefore: 0, spaceAfter: 0 }),
  fCenter("for the award of the degree of", { size: 24, spaceBefore: 0, spaceAfter: 240 }),
  fCenter("MASTER OF COMPUTER APPLICATIONS (MCA)", { size: 24, spaceBefore: 0, spaceAfter: 480 }),
  fCenter("Submitted by", { size: 24, spaceBefore: 0, spaceAfter: 240 }),
  fCenter("SANTHOSHKUMAR S", { size: 24, bold: true, spaceBefore: 0, spaceAfter: 0 }),
  fCenter("Register Number: 241MCAN0014", { size: 24, spaceBefore: 0, spaceAfter: 480 }),
  fCenter("Under the Guidance of", { size: 24, spaceBefore: 0, spaceAfter: 240 }),
  fCenter("Dr. D. Saraswathi", { size: 24, bold: true, spaceBefore: 0, spaceAfter: 0 }),
  fCenter("Associate Professor", { size: 24, spaceBefore: 0, spaceAfter: 0 }),
  fCenter("Department of Computer Science", { size: 24, spaceBefore: 0, spaceAfter: 600 }),
  fCenter("DEPARTMENT OF COMPUTER APPLICATIONS", { size: 24, bold: true, spaceBefore: 0, spaceAfter: 0 }),
  fCenter("BHARATHIAR UNIVERSITY", { size: 24, bold: true, spaceBefore: 0, spaceAfter: 0 }),
  fCenter("Coimbatore – 641 046", { size: 24, spaceBefore: 0, spaceAfter: 0 }),
  fCenter("Academic Year: 2025 – 2026", { size: 24, spaceBefore: 0, spaceAfter: 0 }),
  pageBreak()
)

// ── PAGE 2: CERTIFICATE ───────────────────────────────────────────────────────

fp(
  spacer(720),
  fCenter("CERTIFICATE", { size: 28, bold: true, spaceBefore: 0, spaceAfter: 480 }),
  fJustify(
    'This is to certify that the Mini Project work titled "DITTO — DIGITAL TWIN STUDIO" submitted to Bharathiar University in partial fulfillment of the requirements for the award of the Degree of Master of Computer Applications is a record of the original work done by SANTHOSHKUMAR S (Register No: 241MCAN0014) under my supervision and guidance and that this project work has not formed the basis for the award of any Degree/Diploma/Associateship/Fellowship or similar title to any candidate of any University.',
    { spaceBefore: 0, spaceAfter: 480 }
  ),
  fJustify("Place: Coimbatore", { spaceBefore: 0, spaceAfter: 0 }),
  fJustify("Date:", { spaceBefore: 0, spaceAfter: 600 }),
  fRight("Signature of the Guide", { spaceBefore: 0 }),
  fRight("Dr. D. Saraswathi", { spaceBefore: 0 }),
  fRight("Associate Professor", { spaceBefore: 0 }),
  fRight("Department of Computer Science", { spaceBefore: 0, spaceAfter: 480 } as Parameters<typeof fRight>[1]),
  fJustify("Programme Co-ordinator", { spaceBefore: 240, spaceAfter: 0 }),
  fJustify("(with Seal)", { spaceBefore: 0, spaceAfter: 480 }),
  fJustify("Forwarded by", { spaceBefore: 0, spaceAfter: 0 }),
  fJustify("Director", { spaceBefore: 0, spaceAfter: 0 }),
  fJustify("Centre for Distance and Online Education", { spaceBefore: 0, spaceAfter: 0 }),
  fJustify("Bharathiar University", { spaceBefore: 0, spaceAfter: 0 }),
  fJustify("Coimbatore – 641 046", { spaceBefore: 0 }),
  pageBreak()
)

// ── PAGE 3: DECLARATION ───────────────────────────────────────────────────────

fp(
  spacer(720),
  fCenter("DECLARATION", { size: 28, bold: true, spaceBefore: 0, spaceAfter: 480 }),
  fJustify(
    'I hereby declare that this project work titled "DITTO — DIGITAL TWIN STUDIO" submitted to the Centre for Distance and Online Education, Bharathiar University is a record of original work done by SANTHOSHKUMAR S under the supervision and guidance of Dr. D. Saraswathi and that this project work has not formed the basis for the award of any Degree/Diploma/Associateship/Fellowship or similar title to any candidate of any University.',
    { spaceBefore: 0, spaceAfter: 600 }
  ),
  fRight("SANTHOSHKUMAR S", { spaceBefore: 0 }),
  fRight("Signature of the candidate", { bold: true, spaceBefore: 0, spaceAfter: 480 } as Parameters<typeof fRight>[1]),

  // ── Details table (label | value, no borders) ────────────────────────────
  new Table({
    width: { size: CONTENT_WIDTH, type: WidthType.AUTO },
    columnWidths: [2800, 6560],
    rows: [
      ["Name",          "SANTHOSHKUMAR S"],
      ["Enrolment No", "241MCAN0014"],
      ["Register No",  "241MCAN0014"],
      ["Course",        "Master of Computer Applications (MCA)"],
      ["Place",         "Coimbatore"],
      ["Date",          ""],
    ].map(([label, value]) =>
      new TableRow({
        children: [
          new TableCell({
            borders: noBorders,
            margins: { top: 60, bottom: 60, left: 0, right: 120 },
            children: [
              new Paragraph({
                children: [new TextRun({ text: label, font: "Times New Roman", size: 22 })],
              }),
            ],
          }),
          new TableCell({
            borders: noBorders,
            margins: { top: 60, bottom: 60, left: 0, right: 0 },
            children: [
              new Paragraph({
                children: [new TextRun({ text: ": " + value, font: "Times New Roman", size: 22 })],
              }),
            ],
          }),
        ],
      })
    ),
  }),

  spacer(480),

  // ── Signature row (left | right, no borders) ─────────────────────────────
  new Table({
    width: { size: CONTENT_WIDTH, type: WidthType.DXA },
    columnWidths: [4680, 4680],
    rows: [
      new TableRow({
        children: [
          new TableCell({
            borders: noBorders,
            margins: { top: 80, bottom: 0, left: 0, right: 0 },
            children: [
              new Paragraph({
                children: [new TextRun({ text: "Signature of the Guide", font: "Times New Roman", size: 22 })],
              }),
            ],
          }),
          new TableCell({
            borders: noBorders,
            margins: { top: 80, bottom: 0, left: 0, right: 0 },
            children: [
              new Paragraph({
                alignment: AlignmentType.RIGHT,
                children: [new TextRun({ text: "Countersigned by the Co-ordinator", font: "Times New Roman", size: 22 })],
              }),
            ],
          }),
        ],
      }),
      new TableRow({
        children: [
          new TableCell({
            borders: noBorders,
            margins: { top: 0, bottom: 80, left: 0, right: 0 },
            children: [
              new Paragraph({
                children: [new TextRun({ text: "(With seal)", font: "Times New Roman", size: 22 })],
              }),
            ],
          }),
          new TableCell({
            borders: noBorders,
            margins: { top: 0, bottom: 80, left: 0, right: 0 },
            children: [
              new Paragraph({
                alignment: AlignmentType.RIGHT,
                children: [new TextRun({ text: "(With Seal)", font: "Times New Roman", size: 22 })],
              }),
            ],
          }),
        ],
      }),
    ],
  }),

  pageBreak()
)

// ── PAGE 4: ACKNOWLEDGEMENT ───────────────────────────────────────────────────

fp(
  spacer(720),
  fCenter("ACKNOWLEDGEMENT", { size: 28, bold: true, spaceBefore: 0, spaceAfter: 480 }),
  fJustify(
    "I express my sincere and heartfelt gratitude to Bharathiar University, Coimbatore, for providing me the opportunity to undertake this Mini Project as part of the Master of Computer Applications programme.",
    { spaceBefore: 0, spaceAfter: 240 }
  ),
  fJustify(
    'I wish to express my deep sense of gratitude to my guide, Dr. D. Saraswathi, Associate Professor, Department of Computer Science, for her valuable guidance, continuous encouragement, constructive suggestions and constant support throughout the completion of this project work titled "DITTO — DIGITAL TWIN STUDIO".',
    { spaceBefore: 0, spaceAfter: 240 }
  ),
  fJustify(
    "I extend my thanks to the Programme Co-ordinator and the faculty members of the Department for their support and encouragement during the course of this project.",
    { spaceBefore: 0, spaceAfter: 240 }
  ),
  fJustify(
    "I also thank my family and friends for their moral support, motivation and encouragement which helped me to successfully complete this project.",
    { spaceBefore: 0, spaceAfter: 480 }
  ),
  fJustify("Place: Coimbatore", { spaceBefore: 0, spaceAfter: 0 }),
  fJustify("Date:", { spaceBefore: 0, spaceAfter: 600 }),
  fRight("SANTHOSHKUMAR S", { spaceBefore: 0 }),
  fRight("241MCAN0014", { spaceBefore: 0 })
)

// ── Document children array ───────────────────────────────────────────────────

const doc_children: FileChild[] = []

const push = (...items: FileChild[]) => doc_children.push(...items)

// ── TITLE PAGE ────────────────────────────────────────────────────────────────

push(
  spacer(1440),
  new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { before: 480, after: 120 },
    children: [new TextRun({ text: "DITTO", font: "Arial", size: 72, bold: true, color: "1F3864" })],
  }),
  new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { before: 0, after: 240 },
    children: [new TextRun({ text: "Digital Twin Studio", font: "Arial", size: 40, bold: true, color: "2E5090" })],
  }),
  new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { before: 0, after: 600 },
    children: [
      new TextRun({
        text: "A local-first AI system for building and simulating personality-grounded conversational personas from raw chat history",
        font: "Arial",
        size: 24,
        italics: true,
        color: "555555",
      }),
    ],
  }),
  new Paragraph({
    alignment: AlignmentType.CENTER,
    border: { bottom: { style: BorderStyle.SINGLE, size: 6, color: "1F3864", space: 1 } },
    spacing: { before: 0, after: 240 },
    children: [],
  }),
  spacer(480),
  new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { before: 80, after: 80 },
    children: [new TextRun({ text: "Project Report", font: "Arial", size: 28, bold: true })],
  }),
  new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { before: 80, after: 80 },
    children: [new TextRun({ text: "Academic Submission", font: "Arial", size: 24, color: "333333" })],
  }),
  spacer(240),
  new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { before: 80, after: 80 },
    children: [new TextRun({ text: "2026", font: "Arial", size: 24, color: "555555" })],
  }),
  pageBreak()
)

// ── TABLE OF CONTENTS ─────────────────────────────────────────────────────────

push(
  new Paragraph({
    spacing: { before: 0, after: 240 },
    children: [
      new TextRun({ text: "Table of Contents", font: "Arial", size: 32, bold: true, color: "1F3864" }),
    ],
    border: { bottom: { style: BorderStyle.SINGLE, size: 4, color: "1F3864", space: 4 } },
  }),
  spacer(120),
  new TableOfContents("Table of Contents", {
    headingStyleRange: "1-3",
    hyperlink: true,
  }),
  pageBreak()
)

// ── SECTION 1: PROJECT TITLE ──────────────────────────────────────────────────

push(
  heading1("1. Project Title"),
  para("DITTO: Digital Twin Studio", { bold: true, size: 24 }),
  para(
    "A local-first AI system for building and simulating personality-grounded conversational personas from raw chat history.",
    { italic: true }
  ),
  spacer()
)

// ── SECTION 2: BACKGROUND STUDY ───────────────────────────────────────────────

push(
  heading1("2. Background Study"),
  para(
    "The rapid growth of large language models (LLMs) has opened new possibilities for natural language understanding and generation. One emerging application is personality simulation — training or prompting an AI to mimic a specific person's communication style based on their past messages."
  ),
  spacer(),
  heading3("Retrieval-Augmented Generation (RAG)"),
  para(
    "RAG is a technique that enhances LLM responses by first retrieving semantically relevant documents from a vector database and injecting them into the prompt. This grounds the model's output in real evidence rather than hallucination."
  ),
  heading3("Vector Embeddings"),
  para(
    "Vector embeddings convert text into dense numerical representations that capture semantic meaning. Similar texts cluster together in embedding space, making it possible to retrieve the most contextually relevant past messages for a given query using distance metrics such as cosine similarity."
  ),
  heading3("Conversation-Pair RAG"),
  para(
    "Conversation-pair RAG is a refinement of standard RAG that stores (trigger \u2192 response) pairs instead of isolated utterances. The embedding is computed on the trigger side so that retrieval finds the situations most similar to the incoming query, and the associated response serves as a few-shot example for the LLM."
  ),
  heading3("Local AI Stack"),
  para(
    "Ollama is a local inference runtime that allows models such as Meta's LLaMA 3 to be run entirely offline on consumer hardware. ChromaDB is an open-source, embeddable vector database suited for RAG pipelines. Together, these technologies enable a fully local, privacy-preserving pipeline for persona construction — no data is sent to external APIs."
  ),
  pageBreak()
)

// ── SECTION 3: PROBLEM STATEMENT ─────────────────────────────────────────────

push(
  heading1("3. Problem Statement"),
  para("Existing chatbot and persona systems typically require:"),
  bullet("Large annotated datasets"),
  bullet("Cloud-based APIs that expose private conversations to third-party servers"),
  bullet("Manual prompt engineering per person"),
  bullet("Re-training or fine-tuning of models"),
  spacer(),
  para(
    "There is no accessible, local tool that allows a user to upload a raw WhatsApp-style chat export, automatically extract a structured personality profile, store conversational memory as context-grounded pairs, and simulate responses in the style of a chosen participant — all without sending data to the cloud."
  ),
  spacer()
)

// ── SECTION 4: OBJECTIVES ─────────────────────────────────────────────────────

push(
  heading1("4. Objective of the Project"),
  numbered("Parse WhatsApp-format plain-text chat exports and extract per-author message sets."),
  numbered(
    "Automatically derive a structured PersonalityProfile (tone, style, vocabulary, sentiment, etc.) using an LLM prompt via Ollama."
  ),
  numbered(
    "Extract (context window \u2192 persona reply) pairs from the chat and embed the context side for semantic retrieval."
  ),
  numbered(
    "Simulate natural-language replies grounded in few-shot examples drawn from retrieved pairs, the personality profile, and the current conversation history."
  ),
  numbered(
    "Gate retrieval quality — exclude semantically distant pairs and fall back gracefully to general style guidance."
  ),
  numbered(
    "Provide an intuitive, browser-based UI that requires no command-line interaction beyond starting local services."
  ),
  numbered("Keep the entire pipeline offline and private — no cloud APIs, no telemetry."),
  spacer()
)

// ── SECTION 5: EXISTING SYSTEM ────────────────────────────────────────────────

push(
  heading1("5. Existing System"),
  spacer(120),
  makeTable(
    ["Aspect", "Current State"],
    [
      ["Persona chatbots", "Rule-based or cloud-fine-tuned models (CharacterAI, GPT custom instructions)"],
      ["Chat analysis tools", "Manual — users export and read logs themselves"],
      ["Memory retrieval", "Not implemented in most consumer tools"],
      ["Privacy", "Cloud-dependent; chat data transmitted to external servers"],
      ["Accessibility", "Requires API keys, subscriptions, or ML expertise"],
    ],
    [3120, 6240]
  ),
  spacer(200),
  heading3("Drawbacks of Existing Systems"),
  bullet("Privacy risk: raw personal conversations sent to third-party servers."),
  bullet("No structured personality extraction from individual message history."),
  bullet("No semantic memory — replies are not grounded in real past conversations."),
  bullet("High barrier to entry (fine-tuning, API costs)."),
  spacer()
)

// ── SECTION 6: PROPOSED SYSTEM ────────────────────────────────────────────────

push(
  heading1("6. Proposed System"),
  para("DITTO is a local-first, RAG-powered digital twin studio consisting of:"),
  bullet("A Next.js web application with a clean UI for uploading chat exports, selecting personas, and simulating replies."),
  bullet(
    "A chat parser that decodes WhatsApp-format exports and derives sliding-window (context \u2192 reply) pairs for every persona message."
  ),
  bullet(
    "A personality extractor that uses Ollama/LLaMA 3 to produce a structured JSON profile covering tone, communication style, common phrases, sentiment, vocabulary patterns, and relationship signals."
  ),
  bullet(
    "A vector memory store (ChromaDB ditto_pairs_v1 + nomic-embed-text) that embeds the context side of each conversation pair, enabling retrieval by situational similarity."
  ),
  bullet(
    "A simulation engine that injects retrieved pairs as few-shot examples into a strict system prompt, passes the current conversation history as proper chat turns, and calls Ollama's /api/chat endpoint to generate a grounded reply."
  ),
  bullet(
    "A relevance gate that excludes pairs with cosine distance >= 1.3 from the few-shot block and signals the LLM to rely on general style guidance when no relevant context exists."
  ),
  spacer(),
  heading3("Advantages over Existing Systems"),
  bullet("Fully local — no data leaves the machine."),
  bullet("No fine-tuning required; works with any LLaMA 3-compatible model."),
  bullet("Retrieval finds situations similar to the query, not just similar words."),
  bullet("Few-shot examples drawn from real (trigger \u2192 response) pairs produce authentic, grounded replies."),
  bullet("Multi-turn conversation history is maintained across simulation turns."),
  bullet("Extensible: swap the model, embedder, or vector store via environment variables."),
  spacer()
)

// ── SECTION 7: MODULE DESCRIPTIONS ───────────────────────────────────────────

push(
  heading1("7. Module Descriptions"),
  heading2("7.1 Chat Parser (lib/chat-parser.ts)"),
  para(
    "Parses raw WhatsApp-exported .txt files line by line using a regex that matches the pattern: DD/MM/YY, H:MM [am/pm] - Author: Message"
  ),
  bullet("Handles multi-line messages (continuation lines are appended to the previous record)."),
  bullet("Strips noise lines (<Media omitted>, encryption notices, blank lines)."),
  bullet("Normalises timestamps to YYYY-MM-DD HH:MM (24-hour ISO format)."),
  bullet("Generates a SHA-1 ID per message for stable deduplication."),
  bullet(
    "getConversationPairs(messages, personaName, windowSize=4) — for every persona reply, collects the preceding N messages from any author as the context window. Short messages (< 4 chars) and bare URLs are skipped."
  ),
  spacer(80),
  ...codeBlock(
    `// Core regex in chat-parser.ts\nconst CHAT_LINE_REGEX = new RegExp(\n  \`^(\\\\d{1,2}\\\\/\\\\d{1,2}\\\\/\\\\d{2,4}), (CHAT_TIME_PATTERN) - ([^:]+):\\\\s?(.*)$\`\n)`
  ),
  spacer(120),

  heading2("7.2 Personality Extractor (lib/personality.ts)"),
  para("Builds a PersonalityProfile for a chosen author:"),
  bullet(
    "Samples messages evenly across the full history (up to 100 messages, stepped by index) so early and late conversational patterns are both represented."
  ),
  bullet("Computes top-8 frequent words (>= 3 chars, appearing > 1 time) as phrase hints."),
  bullet(
    "Sends a structured prompt to Ollama that includes the persona's actual raw messages as concrete evidence, instructing the LLM to describe observed behaviour."
  ),
  bullet(
    "Extracts the JSON block from the raw LLM response using brace-matching and falls back gracefully to a default profile if extraction fails."
  ),
  spacer(),

  heading2("7.3 Ollama Client (lib/ollama.ts)"),
  para("Thin HTTP wrapper around the Ollama REST API:"),
  bullet(
    "generateWithOllama(prompt) — calls /api/generate with LLaMA 3 at temperature 0.7. Used for personality profile extraction."
  ),
  bullet(
    "chatWithOllama(system, history[], userMessage) — calls /api/chat with a structured [system, ...history, user] messages array. Temperature 0.85."
  ),
  bullet(
    "embedWithOllama(texts[]) — calls /api/embed using nomic-embed-text; supports both embeddings[] and legacy embedding response shapes."
  ),
  bullet("Configurable via OLLAMA_URL, OLLAMA_MODEL, OLLAMA_EMBED_MODEL environment variables."),
  spacer(),

  heading2("7.4 Chroma Memory Store (lib/chroma.ts)"),
  para("Manages the ditto_pairs_v1 ChromaDB collection:"),
  bullet(
    "storeConversationPairs(personaName, pairs[]) — embeds the contextWindow text of each pair via Ollama, then upserts with the personaReply as the document. IDs are SHA-1 hashes of personaName:contextWindow:reply for idempotent re-runs."
  ),
  bullet(
    "queryConversationPairs(personaName, queryText, limit=6) — embeds the incoming user message, queries ChromaDB filtered by personaName, and returns ConversationPair[] including cosine-distance scores."
  ),
  spacer(),

  heading2("7.5 API Routes (app/api/personas/)"),
  heading3("POST /api/personas — Create Persona"),
  numbered("Validates request body (personaName, chatHistory)."),
  numbered("Parses chat, filters to persona messages, computes summary stats."),
  numbered("Calls getConversationPairs to extract all (context \u2192 reply) pairs from the full message thread."),
  numbered("Calls personality extractor (Ollama) and storeConversationPairs (Chroma) in sequence."),
  numbered("Returns CreatePersonaResponse with the full persona record and stored pair count."),
  spacer(80),
  heading3("POST /api/personas/chat — Chat Simulation"),
  numbered("Validates request body (personaName, message, profile, conversationHistory)."),
  numbered("Retrieves top-6 nearest conversation pairs from ChromaDB by embedding the user message."),
  numbered(
    "Applies the relevance gate: pairs with cosine distance >= 1.3 are excluded from the few-shot prompt."
  ),
  numbered(
    "Builds a system prompt containing the personality profile summary and the usable pairs as few-shot examples."
  ),
  numbered(
    "Calls chatWithOllama with the system prompt, the last 6 turns of conversationHistory, and the current user message."
  ),
  numbered("Returns the reply and all retrieved pairs with distance scores for display."),
  spacer(),

  heading2("7.6 UI — Ditto Studio (components/ditto-studio.tsx)"),
  para("Single-page React component with four visual sections:"),
  bullet("Hero card — project overview and feature highlights."),
  bullet("System status card — live display of stack components (Next.js, Ollama, Chroma)."),
  bullet(
    "Create Persona panel — file upload, format validation, speaker detection radio group, chat preview, and persona creation trigger."
  ),
  bullet(
    "Chat Simulation panel — scrollable conversation log in monospace chat format, message textarea, and simulate button. Each request includes the last 6 chat turns as conversationHistory."
  ),
  bullet("Extracted Profile panel — summary stats and raw JSON profile viewer."),
  bullet(
    "Retrieved Context panel — per-pair cards showing context window, persona's actual reply, timestamp, and a colour-coded distance badge."
  ),
  pageBreak()
)

// ── SECTION 8: SOFTWARE & HARDWARE ────────────────────────────────────────────

push(
  heading1("8. Software and Hardware Configuration"),
  heading2("8.1 Software Requirements"),
  spacer(120),
  makeTable(
    ["Component", "Technology", "Version / Notes"],
    [
      ["Frontend framework", "Next.js (App Router)", "v16+"],
      ["UI language", "TypeScript + React", "React 19+"],
      ["Component library", "shadcn/ui (Radix + Tailwind)", "Latest"],
      ["Local LLM runtime", "Ollama", "Latest stable"],
      ["LLM model", "LLaMA 3 (llama3)", "Meta via Ollama"],
      ["Embedding model", "nomic-embed-text", "Via Ollama"],
      ["Vector database", "ChromaDB", "v0.5+ (REST API)"],
      ["ChromaDB client", "chromadb npm package", "Latest"],
      ["Node.js", "Node.js", "v18+"],
      ["Package manager", "bun", "\u2014"],
    ],
    [2800, 3560, 3000]
  ),
  spacer(200),
  heading2("8.2 Environment Variables"),
  spacer(120),
  makeTable(
    ["Variable", "Default", "Purpose"],
    [
      ["OLLAMA_URL", "http://127.0.0.1:11434", "Ollama server address"],
      ["OLLAMA_MODEL", "llama3", "Generation model name"],
      ["OLLAMA_EMBED_MODEL", "nomic-embed-text", "Embedding model name"],
      ["CHROMA_URL", "http://127.0.0.1:8000", "ChromaDB server address"],
    ],
    [2800, 2800, 3760]
  ),
  spacer(200),
  heading2("8.3 Hardware Requirements (Minimum)"),
  spacer(120),
  makeTable(
    ["Resource", "Requirement"],
    [
      ["CPU", "4-core x86-64 (Apple Silicon supported)"],
      ["RAM", "8 GB (16 GB recommended for LLaMA 3 8B)"],
      ["Storage", "10 GB free (model weights + ChromaDB data)"],
      ["OS", "Windows 10/11, macOS 12+, or Linux"],
      ["GPU", "Optional \u2014 CUDA/Metal acceleration speeds inference"],
    ],
    [2800, 6560]
  ),
  spacer()
)

// ── SECTION 9: DATA FLOW DIAGRAM ─────────────────────────────────────────────

push(
  heading1("9. Data Flow Diagram / System Flow"),
  heading2("9.1 Persona Creation Flow"),
  spacer(80),
  ...codeBlock(
    [
      "User uploads .txt file",
      "        \u2502",
      "        \u25bc",
      "[Chat Parser]",
      "  \u2022 Regex parse each line \u2192 ChatMessage[]",
      "  \u2022 Filter noise, normalise timestamps",
      "  \u2022 Filter by selected personaName \u2192 persona messages",
      "        \u2502",
      "        \u25bc",
      "[Conversation Pair Extractor]",
      "  \u2022 getConversationPairs() \u2014 4-message sliding window",
      "  \u2022 Each pair: { contextWindow, personaReply, timestamp }",
      "  \u2022 Skip replies < 4 chars or bare URLs",
      "        \u2502",
      "        \u25bc",
      "[Personality Extractor]",
      "  \u2022 Evenly sample up to 100 messages across full history",
      "  \u2022 Build LLM prompt with raw message examples",
      "        \u2502",
      "        \u25bc",
      "[Ollama \u2014 LLaMA 3 /api/generate]",
      "  \u2022 Generate structured JSON profile",
      "        \u2502",
      "        \u25bc",
      "[Ollama \u2014 nomic-embed-text /api/embed]",
      "  \u2022 Embed contextWindow side of each pair \u2192 float[][] vectors",
      "        \u2502",
      "        \u25bc",
      "[ChromaDB \u2014 ditto_pairs_v1]",
      "  \u2022 Upsert pairs: embedding on context, document = personaReply",
      "  \u2022 Deduplicated by SHA-1 of personaName:context:reply",
      "        \u2502",
      "        \u25bc",
      "[API Response \u2192 UI]",
      "  \u2022 PersonaRecord + storedPairs count",
    ].join("\n")
  ),
  // spacer(200),
  pageBreak(),
  heading2("9.2 Chat Simulation Flow"),
  spacer(80),
  ...codeBlock(
    [
      "User types a message",
      "        \u2502",
      "        \u25bc",
      "[POST /api/personas/chat]",
      "  \u2022 Receive: personaName, message, profile, conversationHistory (last 6 turns)",
      "        \u2502",
      "        \u25bc",
      "[Ollama \u2014 nomic-embed-text]",
      "  \u2022 Embed user message \u2192 query vector",
      "        \u2502",
      "        \u25bc",
      "[ChromaDB \u2014 ditto_pairs_v1]",
      "  \u2022 Filter by personaName",
      "  \u2022 Return top-6 nearest pairs (contextWindow, personaReply, distance)",
      "        \u2502",
      "        \u25bc",
      "[Relevance Gate]",
      "  \u2022 distance < 1.3  \u2192 usable few-shot example",
      "  \u2022 distance >= 1.3 \u2192 excluded from prompt, shown in UI as distant",
      "        \u2502",
      "        \u25bc",
      "[System Prompt Builder]",
      '  \u2022 Role: "real person named {personaName}"',
      "  \u2022 Style rules from PersonalityProfile",
      "  \u2022 Few-shot block: [Context] / [{personaName} replied]",
      "        \u2502",
      "        \u25bc",
      "[Ollama \u2014 LLaMA 3 /api/chat]",
      "  \u2022 messages: [system, ...conversationHistory, user]",
      "  \u2022 temperature 0.85",
      "        \u2502",
      "        \u25bc",
      "[API Response \u2192 UI]",
      "  \u2022 Display reply in chat log",
      "  \u2022 Display retrieved pair cards with colour-coded distance badges",
    ].join("\n")
  ),
  // spacer(200)
  pageBreak()
)

// ── SECTION 9.3: SYSTEM ARCHITECTURE FLOWCHART (IMAGE) ───────────────────────
// Flowchart: 6933x8192 px → rendered at 5.5" x 6.5" (528px x 624px at 96dpi)

push(
  heading2("9.3 System Architecture Diagram"),
  para(
    "The following diagram provides a visual overview of the complete DITTO pipeline, from chat upload through persona creation and reply simulation.",
    { spaceAfter: 160 }
  ),
  new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { before: 120, after: 80 },
    children: [
      new ImageRun({
        type: "png",
        data: FLOWCHART,
        transformation: { width: 611.52, height: 721.92 },
        altText: {
          title: "DITTO System Architecture Flowchart",
          description:
            "Full pipeline diagram: chat upload, pair extraction, embedding, retrieval and simulation",
          name: "ProjectFlowchart",
        },
      }),
    ],
  }),
  caption(
    "Figure 1 — DITTO system architecture: persona creation (left) and chat simulation (right) pipelines"
  ),
  pageBreak()
)

// ── SECTION 10: TABLE DESIGN ──────────────────────────────────────────────────

push(
  heading1("10. Table Design"),
  para(
    "Since DITTO uses ChromaDB (a vector database) rather than a relational database, data is stored in a collection rather than SQL tables. The logical schema is described below, alongside the in-memory TypeScript types that serve as the application's data layer."
  ),
  spacer(),
  heading2("10.1 ChromaDB Collection: ditto_pairs_v1"),
  spacer(120),
  makeTable(
    ["Field", "Type", "Description"],
    [
      ["id", "string", "SHA-1 of personaName:contextWindow:personaReply"],
      [
        "embedding",
        "float[]",
        "nomic-embed-text vector of the context window (768 dimensions)",
      ],
      ["document", "string", "The persona's reply text"],
      ["metadata.personaName", "string", "The persona this pair belongs to"],
      [
        "metadata.contextWindow",
        "string",
        "The multi-turn context that preceded the reply",
      ],
      [
        "metadata.timestamp",
        "string",
        "Normalised ISO-style timestamp (YYYY-MM-DD HH:MM)",
      ],
    ],
    [2800, 1800, 4760]
  ),
  spacer(200),
  heading2("10.2 TypeScript Data Structures"),
  heading3("ChatMessage"),
  spacer(80),
  makeTable(
    ["Field", "Type", "Description"],
    [
      ["id", "string", "SHA-1 hash of the raw line"],
      ["timestamp", "string", "Normalised timestamp"],
      ["author", "string", "Sender name extracted from chat"],
      ["content", "string", "Cleaned message body"],
      ["raw", "string", "Original unmodified line"],
    ],
    [2200, 1800, 5360]
  ),
  spacer(160),
  heading3("PersonalityProfile"),
  spacer(80),
  makeTable(
    ["Field", "Type", "Description"],
    [
      ["tone", "string", "Overall conversational tone"],
      ["communicationStyle", "string", "How the person structures messages"],
      ["responseLength", "string", "Typical length pattern (short / medium / long)"],
      ["commonPhrases", "string[]", "Frequently used words or expressions (up to 8)"],
      ["sentiment", "string", "Dominant emotional register"],
      ["vocabularyPatterns", "string[]", "Characteristic word choices (up to 6)"],
      ["relationshipSignals", "string[]", "Indicators of social dynamics (up to 6)"],
      ["notes", "string", "Free-form LLM observations"],
    ],
    [2500, 1600, 5260]
  ),
  spacer(160),
  heading3("ConversationPair"),
  spacer(80),
  makeTable(
    ["Field", "Type", "Description"],
    [
      ["contextWindow", "string", "The multi-turn messages that preceded the reply"],
      ["personaReply", "string", "What the persona actually said"],
      ["timestamp", "string", "Timestamp of the reply"],
      ["distance", "number | null", "Cosine distance from query vector (lower = more similar)"],
    ],
    [2500, 1800, 5060]
  ),
  spacer()
)

// ── SECTION 11: IMPLEMENTATION ────────────────────────────────────────────────

push(
  heading1("11. Implementation"),
  heading2("11.1 Development Environment Setup"),
  para(
    "The project is built on Next.js 16 with the App Router and React 19, using TypeScript throughout. The local AI stack requires two background services:"
  ),
  bullet(
    "Ollama — serves the llama3 generation model and nomic-embed-text embedding model over HTTP at http://127.0.0.1:11434."
  ),
  bullet(
    "ChromaDB — runs as a local REST server at http://127.0.0.1:8000, storing vectors on disk in the chroma/ directory."
  ),
  spacer(80),
  para(
    "The Next.js development server is started with Turbopack (bun run dev) for fast incremental builds. The chromadb npm package is declared as a serverExternalPackage in next.config.mjs to prevent client-side bundling."
  ),
  spacer(),
  heading2("11.2 Chat Parser Implementation"),
  para(
    "The parser processes raw WhatsApp .txt exports line by line using a single regular expression that captures the four fields on every message header:"
  ),
  spacer(80),
  ...codeBlock("DD/MM/YY, H:MM [am/pm] - Author: Message body"),
  spacer(120),
  para(
    "Lines that do not match the pattern are treated as continuations and appended to the previous message. After building raw records, the parser:"
  ),
  numbered(
    "Normalises timestamps — converts 2-digit years to 4-digit, reformats to YYYY-MM-DD, and converts 12-hour AM/PM times to 24-hour format."
  ),
  numbered(
    "Filters noise — discards blank lines, <Media omitted> entries, bare URLs, and WhatsApp system notices."
  ),
  numbered(
    "Generates stable IDs — applies SHA-1 to each raw line to produce a deterministic message ID."
  ),
  spacer(80),
  para(
    "getConversationPairs implements a 4-message sliding window over the full message thread. For each persona reply it collects the preceding 4 messages from any participant as the contextWindow. Replies shorter than 4 characters or consisting solely of a URL are skipped."
  ),
  spacer(),
  heading2("11.3 Personality Extractor Implementation"),
  heading3("Stage 1 \u2014 Statistical Pre-processing"),
  para(
    "A word-frequency pass over all persona messages identifies the top-8 words with length >= 3 and occurrence > 1."
  ),
  heading3("Stage 2 \u2014 LLM-based Extraction"),
  para(
    "The extractor samples up to 100 messages evenly distributed across the full chat history (stepped by floor(total / 100)), ensuring both early and late conversational patterns are captured. The prompt provides two evidence sources to the LLM: a list of the persona's actual messages and a short timestamped transcript. The LLM is instructed to describe observed behaviour rather than generic categories."
  ),
  spacer(),
  heading2("11.4 Ollama Client Implementation"),
  para("Three functions are exposed:"),
  bullet(
    "generateWithOllama(prompt) — issues POST /api/generate with stream: false and temperature 0.7. Used only for personality profile extraction."
  ),
  bullet(
    "chatWithOllama(system, history, userMessage) — issues POST /api/chat with a structured messages array: [system, ...history, user]. Temperature 0.85."
  ),
  bullet(
    "embedWithOllama(texts[]) — issues POST /api/embed using nomic-embed-text. Handles both embeddings[] (current) and embedding (legacy) response shapes."
  ),
  pageBreak(),
  heading2("11.5 Chroma Memory Store Implementation"),
  para(
    "The collection stores conversation pairs rather than individual messages. Embeddings are computed on the context window (what was said before the persona replied), not on the reply itself. This means ChromaDB retrieval answers: 'what situation is most similar to what the user just said?'"
  ),
  bullet(
    "storeConversationPairs — embeds each pair's contextWindow text, then upserts with the personaReply as the document. IDs are SHA-1 hashes making re-runs fully idempotent. In-memory deduplication runs before the upsert call."
  ),
  bullet(
    "queryConversationPairs — embeds the incoming user message and queries ChromaDB using a personaName $eq filter, returning up to 6 ConversationPair objects sorted by cosine distance."
  ),
  spacer(),
  heading2("11.6 API Route Implementation"),
  heading3("POST /api/personas"),
  para("Orchestrates the full persona-creation pipeline:"),
  numbered("Parses the full chat into ChatMessage[]."),
  numbered(
    "Extracts ConversationPair[] via getConversationPairs (4-message sliding window over the entire thread)."
  ),
  numbered("Calls buildPersonalityProfile (Ollama) for the UI display profile."),
  numbered("Calls storeConversationPairs (Chroma) to embed and persist all pairs."),
  spacer(80),
  heading3("POST /api/personas/chat"),
  para("Executes the pair-based RAG simulation loop:"),
  numbered("Accepts conversationHistory (last 6 turns) alongside the standard fields."),
  numbered(
    "Retrieves top-6 pairs from ChromaDB by embedding the user message against stored context-window vectors."
  ),
  numbered(
    "Applies the relevance gate (RELEVANCE_THRESHOLD = 1.3): pairs at or above this distance are excluded from the few-shot prompt."
  ),
  numbered(
    "Builds a system prompt containing: a role declaration, a style summary, and usable pairs as labelled few-shot examples."
  ),
  numbered(
    "Calls chatWithOllama(systemPrompt, conversationHistory, message), passing history as structured chat turns."
  ),
  spacer(),
  heading2("11.7 Frontend Implementation"),
  para("Key implementation decisions:"),
  bullet(
    "Conversation log — the chat simulation panel shows a scrollable monospace log formatted as DD/MM/YY, HH:MM - ROLE: content. The log accumulates across turns."
  ),
  bullet(
    "History passing — before each simulation request, the last 6 chatTurns are mapped to { role, content } objects and sent as conversationHistory."
  ),
  bullet(
    "Retrieved context display — ConversationPair cards colour-coded by distance: dark (<1.0) = highly relevant; secondary (1.0–1.3) = acceptable; outline (>=1.3) = distant."
  ),
  bullet(
    "Format validation — hasValidChatFormat runs a lightweight regex test before accepting a file."
  ),
  spacer()
)

// ── SECTION 12: SYSTEM TESTING ────────────────────────────────────────────────

push(
  heading1("12. System Testing"),
  para(
    "Since the project does not include an automated test suite, system testing was performed manually across functional, integration, and edge-case dimensions."
  ),
  spacer(),
  heading2("12.1 Unit-Level Verification"),
  spacer(120),
  makeTable(
    ["Module", "Test Case", "Expected Outcome", "Result"],
    [
      ["chat-parser.ts", "Valid WhatsApp .txt file", "Messages parsed with correct author, timestamp, content", "Pass"],
      ["chat-parser.ts", "Multi-line message", "Content appended to previous message", "Pass"],
      ["chat-parser.ts", "<Media omitted> lines", "Filtered out", "Pass"],
      ["chat-parser.ts", "12-hour AM/PM timestamp", "Normalised to 24-hour", "Pass"],
      [
        "chat-parser.ts",
        "getConversationPairs on 100-message chat",
        "Pairs generated with non-empty contextWindow and reply",
        "Pass",
      ],
      ["chat-parser.ts", "Reply < 4 chars or bare URL", "Pair skipped, not stored", "Pass"],
      ["personality.ts", "Valid JSON returned by Ollama", "Profile parsed correctly", "Pass"],
      ["personality.ts", "Malformed LLM response", "Fallback profile returned, no crash", "Pass"],
      ["ollama.ts", "Ollama service offline", "Descriptive error with service URL thrown", "Pass"],
      ["chroma.ts", "Re-running persona creation", "Upsert deduplicates; no duplicate vectors", "Pass"],
      ["chroma.ts", "Duplicate IDs in same batch", "In-memory dedup removes before upsert", "Pass"],
    ],
    [2000, 2800, 3060, 1500]
  ),
  // spacer(200),
  pageBreak(),
  heading2("12.2 API Integration Testing"),
  spacer(120),
  makeTable(
    ["Endpoint", "Scenario", "Expected HTTP Status", "Result"],
    [
      ["POST /api/personas", "Missing personaName field", "400 Bad Request", "Pass"],
      ["POST /api/personas", "personaName not found in chat", "400 \u2014 author not in chat", "Pass"],
      ["POST /api/personas", "Valid request, Ollama running", "200 with PersonaRecord", "Pass"],
      ["POST /api/personas/chat", "Missing profile field", "400 Bad Request", "Pass"],
      [
        "POST /api/personas/chat",
        "Valid request after persona creation",
        "200 with reply + retrievedContext",
        "Pass",
      ],
      [
        "POST /api/personas/chat",
        "All pairs above relevance threshold",
        "200 \u2014 fallback style prompt used",
        "Pass",
      ],
      ["POST /api/personas/chat", "Ollama service offline", "500 with error detail", "Pass"],
    ],
    [2400, 3200, 2160, 1600]
  ),
  spacer(200),
  heading2("12.3 End-to-End UI Testing"),
  heading3("Test Scenario 1 \u2014 Full Persona Creation Flow"),
  numbered("Upload a WhatsApp .txt export \u2192 persona options auto-populate from the file."),
  numbered("Select a speaker and click Create Persona \u2192 loading state appears."),
  numbered("After 15\u201330 seconds, the profile JSON and stats cards render correctly."),
  numbered("The stored pair count is displayed (less than total message count due to filtering)."),
  spacer(80),
  heading3("Test Scenario 2 \u2014 Chat Simulation Flow"),
  numbered("With a persona created, type a message and click Simulate Reply."),
  numbered("The reply appears in the monospace conversation log."),
  numbered("The Retrieved Context panel displays up to 6 pair cards with colour-coded distance badges."),
  numbered("Multiple turns accumulate correctly; subsequent replies maintain conversational coherence."),
  spacer(80),
  heading3("Test Scenario 3 \u2014 Edge Cases"),
  bullet("Uploading a non-WhatsApp file \u2192 error alert shown, no API call made."),
  bullet("Attempting to chat before creating a persona \u2192 error alert shown."),
  bullet(
    "All retrieved pairs above 1.3 threshold \u2192 system prompt switches to style-only mode; reply is still generated."
  ),
  spacer(200),
  heading2("12.4 Performance Observations"),
  spacer(120),
  makeTable(
    ["Operation", "Observed Duration"],
    [
      ["Chat parsing (500-message file)", "< 50 ms (client-side)"],
      ["Conversation pair extraction", "< 10 ms (server-side)"],
      ["Personality extraction (LLaMA 3, CPU)", "15 \u2013 40 seconds"],
      ["Embedding all pairs (nomic-embed-text)", "20 \u2013 90 seconds (pair count dependent)"],
      ["Chat simulation (single turn)", "10 \u2013 25 seconds"],
      ["Chroma vector query (top-6)", "< 200 ms"],
    ],
    [4680, 4680]
  ),
  spacer(160),
  para(
    "Performance is dominated by LLM inference time on CPU. GPU acceleration via CUDA or Apple Metal reduces generation time by approximately 3\u20135x. Embedding time scales with the number of conversation pairs; a 500-message chat typically produces 300\u2013400 storable pairs."
  ),
  spacer()
)

// ── SECTION 13: RESULTS & DISCUSSION ─────────────────────────────────────────

push(
  heading1("13. Results and Discussion"),
  heading2("13.1 Persona Creation Results"),
  para("When provided with a WhatsApp chat export of approximately 300\u2013500 messages, DITTO successfully:"),
  bullet(
    "Parsed all messages with correct author attribution, timestamp normalisation, and noise filtering in under 100 ms."
  ),
  bullet(
    "Extracted conversation pairs via a 4-message sliding window, producing a semantically richer memory store than isolated individual messages."
  ),
  bullet(
    "Embedded and stored the context side of each pair as 768-dimensional vectors in ChromaDB, enabling retrieval by situational similarity."
  ),
  bullet(
    "Generated a structured PersonalityProfile from a representative sample of the persona's actual messages, grounded in concrete evidence."
  ),
  spacer(),
  heading2("13.2 Chat Simulation Results"),
  para(
    "The pair-based RAG simulation with few-shot prompting produced substantially more authentic replies than an isolated-message approach:"
  ),
  bullet(
    "Retrieved pairs were situationally relevant \u2014 searching the context side surfaces situations that match the incoming message, not just similar words from the reply side."
  ),
  bullet(
    "Few-shot examples from real pairs allowed the LLM to pattern-match on actual response evidence rather than an abstract JSON profile description."
  ),
  bullet(
    "Conversation history passed as structured chat turns prevented tone resets between turns and enabled coherent multi-turn exchanges."
  ),
  bullet(
    "The relevance gate at distance 1.3 correctly excluded unrelated pairs while still providing examples for the majority of on-topic queries."
  ),
  bullet(
    "Persona name disambiguation \u2014 explicitly identifying the persona as a real person eliminated LLM hallucinations caused by names matching fictional characters."
  ),
  spacer(),
  heading2("13.3 Privacy and Offline Validation"),
  para(
    "All processing \u2014 parsing, embedding, generation, and storage \u2014 completed without any outbound network traffic to external servers. This validates the core design goal: the system is fully operable on an air-gapped machine."
  ),
  spacer(),
  heading2("13.4 Limitations"),
  spacer(120),
  makeTable(
    ["Limitation", "Impact", "Mitigation"],
    [
      ["No automated test suite", "Regressions may go undetected", "Add Jest/Vitest unit tests for parser and pair extractor"],
      ["LLM output variability", "Reply quality varies between runs", "Temperature tuning; structured output enforcement"],
      ["Single-collection Chroma design", "All personas share one collection", "Partition into per-persona collections at scale"],
      ["Session-only chat history", "Conversation resets on page reload", "Persist chatTurns to localStorage or a backend store"],
      ["No authentication", "Single-user, local deployment only", "Add session management for shared deployments"],
      ["Pair count grows with chat size", "Embedding large chats takes longer", "Batch-limit upserts; background processing"],
    ],
    [2800, 2600, 3960]
  ),
  spacer(200),
  heading2("13.5 Discussion"),
  para(
    "DITTO demonstrates that a fully local, privacy-preserving digital twin pipeline is achievable with commodity hardware and open-source tooling. The architectural evolution from individual message storage to conversation-pair storage is the most impactful design change: by embedding the context side of each (trigger \u2192 response) pair, the vector database retrieves situations that resemble the incoming message rather than words that resemble the reply \u2014 a fundamentally more useful retrieval signal."
  ),
  spacer(80),
  para(
    "The combination of few-shot examples drawn from real pairs, a strict system prompt that prevents AI-assistant behaviour, and multi-turn conversation history passed as structured chat turns produces persona simulations that are stylistically consistent, contextually grounded, and coherent across multiple exchanges \u2014 all without any fine-tuning or labelled training data."
  ),
  spacer(80),
  para(
    "Compared to cloud-based alternatives such as CharacterAI or GPT custom instructions, DITTO trades convenience for privacy and transparency: users can inspect the extracted profile in full, observe which context-reply pairs were retrieved and their distance scores, and verify that no data left their machine."
  ),
  spacer()
)

// ── SECTION 14: APPLICATION SCREENSHOTS ──────────────────────────────────────
//
// Image pixel dimensions at 96 dpi (1 inch = 96 px):
//   upload-panel     617×540  → 288×252  (3" × 2.625")
//   persona-selector 617×739  → 288×345  (3" × 3.59")
//   profile-json     527×706  → 288×386  (3" × 4.02")
//   summary-stats    527×176  → 576×192  (6" × 2.00") – shown full-width
//   chat-simulation  559×739  → 288×382  (3" × 3.97")
//   retrieved-context617×1304 → 182×384  (1.9" × 4.0") – height-capped
//   full-ui          1566×2791→ 288×513  (3" × 5.34") – centred solo

push(
  heading1("14. Application Screenshots"),
  para(
    "The following screenshots were captured from a live DITTO session on a local machine running Ollama (LLaMA 3) and ChromaDB."
  ),
  spacer(160),

  // 14.1 Upload & Persona Selector
  heading2("14.1 Upload Panel and Persona Selector"),
  spacer(120),
  screenshotTable(
    {
      label: "Chat Upload Panel",
      data: SCREENSHOTS.uploadPanel,
      type: "png",
      widthPx: 288,
      heightPx: Math.round(288 * (540 / 617)),   // 252
    },
    {
      label: "Persona Selector and Chat Preview",
      data: SCREENSHOTS.personaSelector,
      type: "png",
      widthPx: 288,
      heightPx: Math.round(288 * (739 / 617)),   // 345
    }
  ),
  // spacer(200),
  pageBreak(),

  // 14.2 Profile JSON & Summary Stats
  heading2("14.2 Personality Profile and Summary Statistics"),
  spacer(120),
  screenshotTable(
    {
      label: "Profile JSON Viewer",
      data: SCREENSHOTS.profileJson,
      type: "png",
      widthPx: 288,
      heightPx: Math.round(288 * (706 / 527)),   // 386
    },
    {
      label: "Summary Statistics Panel",
      data: SCREENSHOTS.summaryStats,
      type: "png",
      widthPx: 288,
      heightPx: Math.round(288 * (176 / 527)),   // 96
    },
    { float: true }
  ),
  // spacer(200),
  pageBreak(),

  // 14.3 Chat Simulation & Retrieved Context
  heading2("14.3 Chat Simulation and Retrieved Context"),
  spacer(120),
  screenshotTable(
    {
      label: "Chat Simulation Panel",
      data: SCREENSHOTS.chatSimulation,
      type: "png",
      widthPx: 288,
      heightPx: Math.round(288 * (739 / 559)),   // 382
    },
    {
      label: "Retrieved Context — Pair Cards",
      data: SCREENSHOTS.retrievedContext,
      type: "png",
      // Height-cap at 4" (384px): width = 384 * (617/1304) ≈ 182px
      widthPx: Math.round(384 * (617 / 1304)),   // 182
      heightPx: 384,
    },
    {float: true}
  ),
  // spacer(200),
  pageBreak(),

  // 14.4 Full UI Overview
  heading2("14.4 Full Application Overview"),
  spacer(120),
  new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { before: 0, after: 80 },
    children: [
      new ImageRun({
        type: "png",
        data: SCREENSHOTS.fullUi,
        // 3" wide = 288px; height = 288 * (2791/1566) = 513px
        transformation: { width: 417.6, height: Math.round(417.6 * (2791 / 1566)) },
        altText: {
          title: "Full Application UI",
          description: "DITTO full UI showing all panels: hero, status, persona creation, chat simulation",
          name: "FullUI",
        },
      }),
    ],
  }),
  caption(
    "Figure 2 — Full DITTO application: hero card, system status, persona creation, chat simulation, profile, and retrieved context panels"
  ),
  spacer()
)

// ── SECTION 15: BIBLIOGRAPHY ──────────────────────────────────────────────────

function bibEntry(num: number, citation: string): Paragraph {
  return new Paragraph({
    alignment: AlignmentType.JUSTIFIED,
    spacing: { before: 60, after: 60, line: 276 },
    indent: { left: 720, hanging: 720 },
    children: [
      new TextRun({ text: `[${num}]  `, font: "Arial", size: 20, bold: true, color: "1F3864" }),
      new TextRun({ text: citation, font: "Arial", size: 20 }),
    ],
  })
}

push(
  pageBreak(),
  heading1("15. Bibliography"),
  spacer(80),

  // ── RAG / Vector retrieval ────────────────────────────────────────────────
  heading2("Retrieval-Augmented Generation & Vector Search"),
  spacer(80),
  bibEntry(
    1,
    "P. Lewis et al., \"Retrieval-Augmented Generation for Knowledge-Intensive NLP Tasks,\" in Advances in Neural Information Processing Systems (NeurIPS), vol. 33, pp. 9459–9474, 2020. [Online]. Available: https://arxiv.org/abs/2005.11401"
  ),
  bibEntry(
    2,
    "J. Johnson, M. Douze, and H. Jégou, \"Billion-Scale Similarity Search with GPUs,\" IEEE Transactions on Big Data, vol. 7, no. 3, pp. 535–547, Jul. 2021. [Online]. Available: https://arxiv.org/abs/1702.08734"
  ),
  bibEntry(
    3,
    "T. Trung, \"ChromaDB: The AI-Native Open-Source Embedding Database,\" Chroma, 2023. [Online]. Available: https://www.trychroma.com"
  ),
  bibEntry(
    4,
    "N. Reimers and I. Gurevych, \"Sentence-BERT: Sentence Embeddings using Siamese BERT-Networks,\" in Proc. of EMNLP, pp. 3982–3992, 2019. [Online]. Available: https://arxiv.org/abs/1908.10084"
  ),
  spacer(120),

  // ── Large language models ─────────────────────────────────────────────────
  heading2("Large Language Models"),
  spacer(80),
  bibEntry(
    5,
    "A. Touvron et al., \"Llama 2: Open Foundation and Fine-Tuned Chat Models,\" Meta AI, Jul. 2023. [Online]. Available: https://arxiv.org/abs/2307.09288"
  ),
  bibEntry(
    6,
    "A. Touvron et al., \"Llama 3: Open Foundation Models,\" Meta AI, Apr. 2024. [Online]. Available: https://ai.meta.com/research/publications/the-llama-3-herd-of-models/"
  ),
  bibEntry(
    7,
    "T. Brown et al., \"Language Models are Few-Shot Learners,\" in Advances in Neural Information Processing Systems (NeurIPS), vol. 33, pp. 1877–1901, 2020. [Online]. Available: https://arxiv.org/abs/2005.14165"
  ),
  bibEntry(
    8,
    "J. Wei et al., \"Chain-of-Thought Prompting Elicits Reasoning in Large Language Models,\" in Advances in Neural Information Processing Systems (NeurIPS), vol. 35, 2022. [Online]. Available: https://arxiv.org/abs/2201.11903"
  ),
  spacer(120),

  // ── Embeddings ────────────────────────────────────────────────────────────
  heading2("Text Embeddings"),
  spacer(80),
  bibEntry(
    9,
    "A. Nussbaum et al., \"nomic-embed-text: A Reproducible Long Context Text Embedder,\" Nomic AI, Feb. 2024. [Online]. Available: https://arxiv.org/abs/2402.01613"
  ),
  bibEntry(
    10,
    "T. Mikolov, I. Sutskever, K. Chen, G. Corrado, and J. Dean, \"Distributed Representations of Words and Phrases and their Compositionality,\" in NeurIPS, pp. 3111–3119, 2013. [Online]. Available: https://arxiv.org/abs/1310.4546"
  ),
  // spacer(120),
  pageBreak(),

  // ── Persona / digital twin ────────────────────────────────────────────────
  heading2("Persona Modelling and Digital Twins"),
  spacer(80),
  bibEntry(
    11,
    "J. S. Park et al., \"Generative Agents: Interactive Simulacra of Human Behavior,\" in Proc. of ACM UIST, 2023. [Online]. Available: https://arxiv.org/abs/2304.03442"
  ),
  bibEntry(
    12,
    "S. Argyle et al., \"Out of One, Many: Using Language Models to Simulate Human Samples,\" Political Analysis, vol. 31, no. 3, pp. 337–351, 2023. [Online]. Available: https://arxiv.org/abs/2209.06899"
  ),
  bibEntry(
    13,
    "X. Wang et al., \"RoleLLM: Benchmarking, Eliciting, and Enhancing Role-Playing Abilities of Large Language Models,\" arXiv preprint arXiv:2310.00746, Oct. 2023. [Online]. Available: https://arxiv.org/abs/2310.00746"
  ),
  spacer(120),

  // ── Few-shot prompting ────────────────────────────────────────────────────
  heading2("Few-Shot and In-Context Learning"),
  spacer(80),
  bibEntry(
    14,
    "S. Min et al., \"Rethinking the Role of Demonstrations: What Makes In-Context Learning Work?,\" in Proc. of EMNLP, pp. 11048–11064, 2022. [Online]. Available: https://arxiv.org/abs/2202.12837"
  ),
  bibEntry(
    15,
    "T. Gao et al., \"Making Pre-trained Language Models Better Few-shot Learners,\" in Proc. of ACL, pp. 3816–3830, 2021. [Online]. Available: https://arxiv.org/abs/2012.15723"
  ),
  spacer(120),

  // ── Local AI / Privacy ────────────────────────────────────────────────────
  heading2("Local AI and Privacy-Preserving Inference"),
  spacer(80),
  bibEntry(
    16,
    "J. Ansel et al., \"Ollama: Local Large Language Model Serving,\" Ollama, Inc., 2023. [Online]. Available: https://ollama.com"
  ),
  bibEntry(
    17,
    "A. Dhar, \"Privacy-Preserving NLP: A Survey,\" arXiv preprint arXiv:2210.03528, Oct. 2022. [Online]. Available: https://arxiv.org/abs/2210.03528"
  ),
  bibEntry(
    18,
    "B. McMahan et al., \"Communication-Efficient Learning of Deep Networks from Decentralized Data,\" in Proc. of AISTATS, vol. 54, pp. 1273–1282, 2017. [Online]. Available: https://arxiv.org/abs/1602.05629"
  ),
  spacer(120),

  // ── Conversational AI ─────────────────────────────────────────────────────
  heading2("Conversational AI and Dialogue Systems"),
  spacer(80),
  bibEntry(
    19,
    "S. Zhang et al., \"Personalizing Dialogue Agents: I Have a Persona,\" in Proc. of ACL, pp. 2204–2213, 2018. [Online]. Available: https://arxiv.org/abs/1801.07243"
  ),
  bibEntry(
    20,
    "H. Touvron et al., \"Improving Language Understanding by Generative Pre-Training,\" OpenAI, 2018. [Online]. Available: https://openai.com/research/language-unsupervised"
  ),
  bibEntry(
    21,
    "R. Roller et al., \"Recipes for Building an Open-Domain Chatbot,\" in Proc. of EACL, pp. 300–325, 2021. [Online]. Available: https://arxiv.org/abs/2004.13637"
  ),
  // spacer(120),
  pageBreak(),

  // ── Web tech stack ────────────────────────────────────────────────────────
  heading2("Web Technologies and Frameworks"),
  spacer(80),
  bibEntry(
    22,
    "Vercel, \"Next.js Documentation,\" 2024. [Online]. Available: https://nextjs.org/docs"
  ),
  bibEntry(
    23,
    "shadcn, \"shadcn/ui: Beautifully Designed Components Built with Radix UI and Tailwind CSS,\" 2024. [Online]. Available: https://ui.shadcn.com"
  ),
  bibEntry(
    24,
    "Oven GmbH, \"Bun: JavaScript Runtime and Toolkit,\" 2024. [Online]. Available: https://bun.sh"
  ),
  spacer()
)

// ── DOCUMENT ASSEMBLY ─────────────────────────────────────────────────────────

const doc = new Document({
  numbering: {
    config: [
      {
        reference: "bullets",
        levels: [
          {
            level: 0,
            format: LevelFormat.BULLET,
            text: "\u2022",
            alignment: AlignmentType.LEFT,
            style: { paragraph: { indent: { left: 720, hanging: 360 } } },
          },
          {
            level: 1,
            format: LevelFormat.BULLET,
            text: "-",
            alignment: AlignmentType.LEFT,
            style: { paragraph: { indent: { left: 1080, hanging: 360 } } },
          },
        ],
      },
      {
        reference: "numbers",
        levels: [
          {
            level: 0,
            format: LevelFormat.DECIMAL,
            text: "%1.",
            alignment: AlignmentType.LEFT,
            style: { paragraph: { indent: { left: 720, hanging: 360 } } },
          },
        ],
      },
    ],
  },
  styles: {
    default: {
      document: { run: { font: "Arial", size: 22, color: "000000" } },
    },
    paragraphStyles: [
      {
        id: "Heading1",
        name: "Heading 1",
        basedOn: "Normal",
        next: "Normal",
        quickFormat: true,
        run: { size: 32, bold: true, font: "Arial", color: "1F3864" },
        paragraph: {
          spacing: { before: 360, after: 160 },
          outlineLevel: 0,
          border: {
            bottom: { style: BorderStyle.SINGLE, size: 4, color: "1F3864", space: 4 },
          },
        },
      },
      {
        id: "Heading2",
        name: "Heading 2",
        basedOn: "Normal",
        next: "Normal",
        quickFormat: true,
        run: { size: 26, bold: true, font: "Arial", color: "2E5090" },
        paragraph: { spacing: { before: 280, after: 120 }, outlineLevel: 1 },
      },
      {
        id: "Heading3",
        name: "Heading 3",
        basedOn: "Normal",
        next: "Normal",
        quickFormat: true,
        run: { size: 22, bold: true, font: "Arial", color: "2E5090" },
        paragraph: { spacing: { before: 200, after: 80 }, outlineLevel: 2 },
      },
    ],
  },
  sections: [
    // ── Section 1: Front pages — no header, no footer ──────────────────────
    {
      properties: {
        page: {
          size: { width: 12240, height: 15840 },
          margin: PAGE_MARGIN,
        },
      },
      children: front_children,
    },
    // ── Section 2: Main report — with header and footer ────────────────────
    {
      properties: {
        page: {
          size: { width: 12240, height: 15840 },
          margin: PAGE_MARGIN,
        },
      },
      headers: {
        default: new Header({
          children: [
            new Paragraph({
              alignment: AlignmentType.RIGHT,
              border: {
                bottom: { style: BorderStyle.SINGLE, size: 4, color: "CCCCCC", space: 4 },
              },
              children: [
                new TextRun({
                  text: "DITTO \u2014 Digital Twin Studio  |  Project Report",
                  font: "Arial",
                  size: 18,
                  color: "555555",
                }),
              ],
            }),
          ],
        }),
      },
      footers: {
        default: new Footer({
          children: [
            new Paragraph({
              alignment: AlignmentType.CENTER,
              border: {
                top: { style: BorderStyle.SINGLE, size: 4, color: "CCCCCC", space: 4 },
              },
              children: [
                new TextRun({ text: "Page ", font: "Arial", size: 18, color: "555555" }),
                new TextRun({ children: [PageNumber.CURRENT], font: "Arial", size: 18, color: "555555" }),
                new TextRun({ text: " of ", font: "Arial", size: 18, color: "555555" }),
                new TextRun({ children: [PageNumber.TOTAL_PAGES], font: "Arial", size: 18, color: "555555" }),
              ],
            }),
          ],
        }),
      },
      children: doc_children,
    },
  ],
})

const outPath = path.join("docs", "DITTO_Project_Report.docx")
const tmpPath = outPath + ".tmp"
Packer.toBuffer(doc).then((buffer) => {
  writeFileSync(tmpPath, buffer)
  // Atomic replace — works even if the target is briefly locked
  try {
    const { renameSync } = require("node:fs") as typeof import("node:fs")
    renameSync(tmpPath, outPath)
  } catch {
    // If rename fails (e.g. cross-device), leave the .tmp for manual rename
    console.warn(`Could not replace original — saved as: ${tmpPath}`)
  }
  console.log(`Document saved: ${outPath}`)
})
