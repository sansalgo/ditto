const OLLAMA_URL = process.env.OLLAMA_URL ?? "http://127.0.0.1:11434"
const OLLAMA_MODEL = process.env.OLLAMA_MODEL ?? "llama3"

type OllamaResponse = {
  response: string
}

type OllamaEmbeddingResponse = {
  embeddings?: number[][]
  embedding?: number[]
}

export async function generateWithOllama(prompt: string) {
  const response = await fetch(`${OLLAMA_URL}/api/generate`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: OLLAMA_MODEL,
      prompt,
      stream: false,
      options: {
        temperature: 0.7,
      },
    }),
    cache: "no-store",
  })

  if (!response.ok) {
    const details = await response.text()
    throw new Error(`Ollama request failed (${response.status}): ${details}`)
  }

  const data = (await response.json()) as OllamaResponse
  return data.response.trim()
}

export async function embedWithOllama(input: string[]) {
  const response = await fetch(`${OLLAMA_URL}/api/embed`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: process.env.OLLAMA_EMBED_MODEL ?? "nomic-embed-text",
      input,
      truncate: true,
    }),
    cache: "no-store",
  })

  if (!response.ok) {
    const details = await response.text()
    throw new Error(`Ollama embedding request failed (${response.status}): ${details}`)
  }

  const data = (await response.json()) as OllamaEmbeddingResponse
  if (data.embeddings?.length) {
    return data.embeddings
  }

  if (data.embedding) {
    return [data.embedding]
  }

  throw new Error("Ollama embedding request returned no vectors.")
}

export function getOllamaConfig() {
  return {
    url: OLLAMA_URL,
    model: OLLAMA_MODEL,
  }
}
