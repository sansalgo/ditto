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

function sampleMessages(messages: ChatMessage[], count: number) {
  if (messages.length <= count) return messages
  const step = Math.floor(messages.length / count)
  return Array.from({ length: count }, (_, i) => messages[i * step])
}

export async function buildPersonalityProfile(
  personaName: string,
  messages: ChatMessage[],
  summary: PersonaSummary
) {
  // Sample evenly across the full history so early/late patterns are both captured
  const sample = sampleMessages(messages.filter((m) => m.content.trim().length >= 4), 100)
  const phrases = topPhrases(messages)

  // Build a transcript that shows only this persona's own messages as plain examples
  const examples = sample
    .slice(0, 40)
    .map((m) => JSON.stringify(m.content))
    .join("\n")

  // Also build a short multi-turn snippet to show conversational rhythm
  const transcript = sample
    .slice(0, 60)
    .map((message) => `[${message.timestamp}] ${message.author}: ${message.content}`)
    .join("\n")

  const prompt = `
You are a conversation analyst. Study the real messages below written by ${personaName} and extract their authentic communication style.

Focus on HOW they actually write — not a generic description. Be specific and concrete.

Rules:
- Base every field on what you actually observe in the messages, not assumptions
- If they use short replies, say so. If they use slang, name it.
- commonPhrases must be phrases/words they ACTUALLY use (copy from the messages)
- Do NOT say "formal and casual" — pick the dominant style
- notes must describe their real texting personality as if briefing an actor

Return ONLY valid JSON:
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

Stats: ${summary.totalMessages} messages, avg ${summary.averageWordsPerMessage} words/msg

Actual messages by ${personaName}:
${examples}

Conversation context (with timestamps):
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
