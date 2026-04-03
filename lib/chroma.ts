import { ChromaClient } from "chromadb"
import { createHash } from "node:crypto"

import { embedWithOllama } from "@/lib/ollama"
import type { ConversationPair } from "@/lib/types"

const CHROMA_URL = process.env.CHROMA_URL ?? "http://127.0.0.1:8000"
// New collection stores (contextWindow → personaReply) pairs.
// Embedding is on the CONTEXT side so retrieval matches "what triggered this reply".
const COLLECTION_NAME = "ditto_pairs_v1"
const parsedChromaUrl = new URL(CHROMA_URL)

const client = new ChromaClient({
  host: parsedChromaUrl.hostname,
  port: Number(parsedChromaUrl.port || 8000),
  ssl: parsedChromaUrl.protocol === "https:",
})

async function getCollection() {
  return client.getOrCreateCollection({
    name: COLLECTION_NAME,
    embeddingFunction: null,
    metadata: { product: "ditto" },
  })
}

type RawPair = {
  contextWindow: string
  personaReply: string
  timestamp: string
}

export async function storeConversationPairs(personaName: string, pairs: RawPair[]) {
  if (pairs.length === 0) return 0

  const collection = await getCollection()

  // Deduplicate by hashing contextWindow + reply so re-runs are idempotent
  const seen = new Set<string>()
  const deduped = pairs.filter(({ contextWindow, personaReply }) => {
    const key = createHash("sha1").update(`${personaName}:${contextWindow}:${personaReply}`).digest("hex")
    if (seen.has(key)) return false
    seen.add(key)
    return true
  })

  // Embed the CONTEXT side — that's what incoming messages will be compared against
  const embeddings = await embedWithOllama(deduped.map((p) => p.contextWindow))

  const ids = deduped.map(({ contextWindow, personaReply }) =>
    createHash("sha1").update(`${personaName}:${contextWindow}:${personaReply}`).digest("hex")
  )

  await collection.upsert({
    ids,
    embeddings,
    // Store the reply as the document so it's easy to retrieve
    documents: deduped.map((p) => p.personaReply),
    metadatas: deduped.map((p) => ({
      personaName,
      contextWindow: p.contextWindow,
      timestamp: p.timestamp,
    })),
  })

  return deduped.length
}

export async function queryConversationPairs(
  personaName: string,
  queryText: string,
  limit = 6
): Promise<ConversationPair[]> {
  const collection = await getCollection()
  const [queryEmbedding] = await embedWithOllama([queryText])

  const result = await collection.query({
    queryEmbeddings: [queryEmbedding],
    nResults: limit,
    where: { personaName: { $eq: personaName } },
    include: ["documents", "metadatas", "distances"],
  })

  const documents = result.documents?.[0] ?? []
  const metadatas = result.metadatas?.[0] ?? []
  const distances = result.distances?.[0] ?? []

  return documents.map((doc, i) => ({
    contextWindow: String(metadatas[i]?.contextWindow ?? ""),
    personaReply: String(doc ?? ""),
    timestamp: String(metadatas[i]?.timestamp ?? ""),
    distance: distances[i] ?? null,
  }))
}

export function getChromaConfig() {
  return {
    url: CHROMA_URL,
    collection: COLLECTION_NAME,
  }
}
