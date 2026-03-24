import type { ChatMessage, PersonalityProfile, PersonaSummary } from "@/lib/types"
import { generateWithOllama } from "@/lib/ollama"

const FALLBACK_PROFILE: PersonalityProfile = {
  tone: "casual and direct",
  communicationStyle: "short, conversational replies with quick back-and-forth rhythm",
  responseLength: "mostly short responses with occasional one-liners",
  commonPhrases: [],
  sentiment: "light and informal",
  vocabularyPatterns: [],
  relationshipSignals: [],
  notes: "Fallback profile used because structured extraction did not return valid JSON.",
}

function topPhrases(messages: ChatMessage[]) {
  const counts = new Map<string, number>()

  for (const message of messages) {
    const cleaned = message.content
      .toLowerCase()
      .replace(/[^\w\s]/g, " ")
      .split(/\s+/)
      .filter((word) => word.length >= 3)

    for (const word of cleaned) {
      counts.set(word, (counts.get(word) ?? 0) + 1)
    }
  }

  return [...counts.entries()]
    .filter(([, count]) => count > 1)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8)
    .map(([word]) => word)
}

function extractJsonObject(input: string) {
  const start = input.indexOf("{")
  const end = input.lastIndexOf("}")

  if (start === -1 || end === -1 || end <= start) {
    return null
  }

  return input.slice(start, end + 1)
}

function normalizeProfile(candidate: Partial<PersonalityProfile>, fallbackPhrases: string[]) {
  return {
    tone: candidate.tone?.trim() || FALLBACK_PROFILE.tone,
    communicationStyle:
      candidate.communicationStyle?.trim() || FALLBACK_PROFILE.communicationStyle,
    responseLength: candidate.responseLength?.trim() || FALLBACK_PROFILE.responseLength,
    commonPhrases:
      candidate.commonPhrases?.filter(Boolean).slice(0, 8) ?? fallbackPhrases,
    sentiment: candidate.sentiment?.trim() || FALLBACK_PROFILE.sentiment,
    vocabularyPatterns:
      candidate.vocabularyPatterns?.filter(Boolean).slice(0, 6) ?? fallbackPhrases,
    relationshipSignals:
      candidate.relationshipSignals?.filter(Boolean).slice(0, 6) ?? [],
    notes: candidate.notes?.trim() || FALLBACK_PROFILE.notes,
  } satisfies PersonalityProfile
}

export async function buildPersonalityProfile(
  personaName: string,
  messages: ChatMessage[],
  summary: PersonaSummary
) {
  const sampleWindow = messages.slice(0, 80)
  const phrases = topPhrases(messages)
  const transcript = sampleWindow
    .map((message) => `[${message.timestamp}] ${message.author}: ${message.content}`)
    .join("\n")

  const prompt = `
Analyze the following chat history for ${personaName}.

Extract:
- tone
- communication style
- response length
- common phrases
- sentiment
- vocabulary patterns
- relationship signals
- notes about how this person usually responds

Return ONLY JSON in this exact shape:
{
  "tone": "string",
  "communicationStyle": "string",
  "responseLength": "string",
  "commonPhrases": ["string"],
  "sentiment": "string",
  "vocabularyPatterns": ["string"],
  "relationshipSignals": ["string"],
  "notes": "string"
}

Conversation stats:
${JSON.stringify(summary, null, 2)}

Chat history:
${transcript}
`.trim()

  try {
    const raw = await generateWithOllama(prompt)
    const jsonBlock = extractJsonObject(raw)

    if (!jsonBlock) {
      return normalizeProfile({}, phrases)
    }

    const parsed = JSON.parse(jsonBlock) as Partial<PersonalityProfile>
    return normalizeProfile(parsed, phrases)
  } catch {
    return normalizeProfile({}, phrases)
  }
}
