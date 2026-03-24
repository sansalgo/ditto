import { NextResponse } from "next/server"

import {
  getAverageWordsPerMessage,
  getPersonaMessages,
  parseChatHistory,
} from "@/lib/chat-parser"
import { getChromaConfig, storePersonaMemories } from "@/lib/chroma"
import { getOllamaConfig } from "@/lib/ollama"
import { buildPersonalityProfile } from "@/lib/personality"
import type { CreatePersonaResponse, PersonaSummary } from "@/lib/types"

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      personaName?: string
      chatHistory?: string
    }

    const personaName = body.personaName?.trim()
    const chatHistory = body.chatHistory?.trim()

    if (!personaName || !chatHistory) {
      return NextResponse.json(
        { error: "personaName and chatHistory are required." },
        { status: 400 }
      )
    }

    const messages = parseChatHistory(chatHistory)
    const personaMessages = getPersonaMessages(messages, personaName)

    if (personaMessages.length === 0) {
      return NextResponse.json(
        {
          error: `No messages were found for "${personaName}". Check the sender name in the uploaded chat.`,
        },
        { status: 400 }
      )
    }

    const summary: PersonaSummary = {
      personaName,
      totalMessages: personaMessages.length,
      averageWordsPerMessage: getAverageWordsPerMessage(personaMessages),
      sourceAuthors: [...new Set(messages.map((message) => message.author))],
    }

    const profile = await buildPersonalityProfile(personaName, personaMessages, summary)
    const storedMemories = await storePersonaMemories(personaName, personaMessages)

    const response: CreatePersonaResponse = {
      persona: {
        summary,
        profile,
        sampleMessages: personaMessages.slice(0, 6),
      },
      storedMemories,
    }

    return NextResponse.json(response)
  } catch (error) {
    const message =
      error instanceof Error
        ? `${error.message} Make sure Ollama (${getOllamaConfig().url}) and Chroma (${getChromaConfig().url}) are running locally.`
        : "Failed to create persona."

    return NextResponse.json({ error: message }, { status: 500 })
  }
}
