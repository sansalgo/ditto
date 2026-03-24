import { ChromaClient } from "chromadb"

import { embedWithOllama } from "@/lib/ollama"
import type { ChatMessage, RetrievedMemory } from "@/lib/types"

const CHROMA_URL = process.env.CHROMA_URL ?? "http://127.0.0.1:8000"
const COLLECTION_NAME = "ditto_memories_v2"
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
    metadata: {
      product: "ditto",
    },
  })
}

export async function storePersonaMemories(personaName: string, messages: ChatMessage[]) {
  const collection = await getCollection()
  const embeddings = await embedWithOllama(messages.map((message) => message.content))

  await collection.upsert({
    ids: messages.map((message) => `${personaName}:${message.id}`),
    embeddings,
    documents: messages.map((message) => message.content),
    metadatas: messages.map((message) => ({
      personaName,
      author: message.author,
      timestamp: message.timestamp,
    })),
  })

  return messages.length
}

export async function queryPersonaMemories(
  personaName: string,
  queryText: string,
  limit = 5
) {
  const collection = await getCollection()
  const [queryEmbedding] = await embedWithOllama([queryText])
  const result = await collection.query({
    queryEmbeddings: [queryEmbedding],
    nResults: limit,
    where: {
      personaName: {
        $eq: personaName,
      },
    },
    include: ["documents", "metadatas", "distances"],
  })

  const documents = result.documents?.[0] ?? []
  const metadatas = result.metadatas?.[0] ?? []
  const ids = result.ids?.[0] ?? []
  const distances = result.distances?.[0] ?? []

  return ids.map((id, index) => {
    const metadata = metadatas[index]

    return {
      id,
      author: String(metadata?.author ?? personaName),
      content: String(documents[index] ?? ""),
      timestamp: String(metadata?.timestamp ?? ""),
      distance: distances[index] ?? null,
    } satisfies RetrievedMemory
  })
}

export function getChromaConfig() {
  return {
    url: CHROMA_URL,
    collection: COLLECTION_NAME,
  }
}
