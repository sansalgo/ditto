import { NextResponse } from "next/server"

import { queryPersonaMemories } from "@/lib/chroma"
import { generateWithOllama } from "@/lib/ollama"
import type { ChatSimulationResponse, PersonalityProfile } from "@/lib/types"

function buildSimulationPrompt(args: {
  personaName: string
  profile: PersonalityProfile
  input: string
  retrievedContext: string
}) {
  return `
You are ${args.personaName}.

Personality:
${JSON.stringify(args.profile, null, 2)}

Relevant past conversations:
${args.retrievedContext}

User message:
${args.input}

Reply in the exact same style. Stay natural, concise, and consistent with the person's vocabulary and tone.
`.trim()
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      personaName?: string
      message?: string
      profile?: PersonalityProfile
    }

    const personaName = body.personaName?.trim()
    const message = body.message?.trim()
    const profile = body.profile

    if (!personaName || !message || !profile) {
      return NextResponse.json(
        { error: "personaName, message, and profile are required." },
        { status: 400 }
      )
    }

    const retrievedContext = await queryPersonaMemories(personaName, message, 5)
    const contextText = retrievedContext
      .map(
        (memory) =>
          `[${memory.timestamp}] ${memory.author}: ${memory.content} (distance: ${
            memory.distance?.toFixed(3) ?? "n/a"
          })`
      )
      .join("\n")

    const reply = await generateWithOllama(
      buildSimulationPrompt({
        personaName,
        profile,
        input: message,
        retrievedContext: contextText || "No related past conversation found.",
      })
    )

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
