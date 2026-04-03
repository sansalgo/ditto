import { NextResponse } from "next/server"

import { queryConversationPairs } from "@/lib/chroma"
import { chatWithOllama } from "@/lib/ollama"
import type { ChatSimulationResponse, ConversationPair, PersonalityProfile } from "@/lib/types"

// Distances above this have no meaningful semantic relation for nomic-embed-text
const RELEVANCE_THRESHOLD = 1.3

function buildSystemPrompt(
  personaName: string,
  profile: PersonalityProfile,
  pairs: ConversationPair[],
  hasRelevantContext: boolean
) {
  // Build few-shot block from retrieved (context → reply) pairs
  const fewShots = pairs
    .filter((p) => p.contextWindow.trim() && p.personaReply.trim())
    .map(
      (p, i) =>
        `Example ${i + 1}:\n[Context]\n${p.contextWindow}\n[${personaName} replied]\n${p.personaReply}`
    )
    .join("\n\n")

  const relevanceNote = hasRelevantContext
    ? ""
    : `\nNo closely matching past conversation found. Reply based on their general style — keep it short and natural.`

  return `You are roleplaying as a real person whose name/nickname is "${personaName}". This is NOT a fictional character.

Their communication style (for reference only):
- Tone: ${profile.tone}
- Response length: ${profile.responseLength}
- Phrases they use: ${profile.commonPhrases.slice(0, 6).join(", ") || "see examples"}
- Notes: ${profile.notes}

${fewShots ? `Real examples of how ${personaName} responds in conversation:\n\n${fewShots}` : ""}${relevanceNote}

STRICT RULES:
- Output ONLY ${personaName}'s reply — no labels, no explanation, nothing else
- Never use AI-assistant phrases ("Certainly!", "Of course!", "I'd be happy to")
- Match their exact capitalization, punctuation style, and emoji usage from the examples
- If they text short, text short — do not pad the reply`.trim()
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      personaName?: string
      message?: string
      profile?: PersonalityProfile
      conversationHistory?: { role: "user" | "assistant"; content: string }[]
    }

    const personaName = body.personaName?.trim()
    const message = body.message?.trim()
    const profile = body.profile
    const history = (body.conversationHistory ?? []).slice(-6)

    if (!personaName || !message || !profile) {
      return NextResponse.json(
        { error: "personaName, message, and profile are required." },
        { status: 400 }
      )
    }

    // Retrieve most similar (context → reply) pairs from ChromaDB
    const retrievedContext = await queryConversationPairs(personaName, message, 6)

    // Point 5: relevance gate — check if ANY pair is actually close
    const hasRelevantContext = retrievedContext.some(
      (p) => (p.distance ?? 1) < RELEVANCE_THRESHOLD
    )

    // Only feed relevant pairs as few-shot examples; irrelevant ones add noise
    const usablePairs = retrievedContext.filter(
      (p) => (p.distance ?? 1) < RELEVANCE_THRESHOLD
    )

    const systemPrompt = buildSystemPrompt(personaName, profile, usablePairs, hasRelevantContext)
    const reply = await chatWithOllama(systemPrompt, history, message)

    const response: ChatSimulationResponse = {
      reply,
      retrievedContext,
    }

    return NextResponse.json(response)
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to generate persona reply."

    return NextResponse.json({ error: message }, { status: 500 })
  }
}
