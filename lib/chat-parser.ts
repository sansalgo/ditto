import { createHash } from "node:crypto"

import type { ChatMessage } from "@/lib/types"

const CHAT_LINE_REGEX =
  /^(\d{1,2}\/\d{1,2}\/\d{2,4}), (\d{1,2}:\d{2}) - ([^:]+):\s?(.*)$/

function normalizeTimestamp(datePart: string, timePart: string) {
  const [day, month, yearRaw] = datePart.split("/")
  const year = yearRaw.length === 2 ? `20${yearRaw}` : yearRaw
  const isoDate = `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`
  return `${isoDate} ${timePart}`
}

function isNoiseLine(content: string) {
  const trimmed = content.trim()
  return (
    trimmed.length === 0 ||
    trimmed === "<Media omitted>" ||
    trimmed.includes("Messages and calls are end-to-end encrypted")
  )
}

export function parseChatHistory(input: string) {
  const lines = input
    .split(/\r?\n/)
    .map((line) => line.trimEnd())
    .filter(Boolean)

  const messages: ChatMessage[] = []

  for (const line of lines) {
    const match = line.match(CHAT_LINE_REGEX)

    if (!match) {
      const previous = messages.at(-1)
      if (previous) {
        previous.content = `${previous.content}\n${line}`.trim()
        previous.raw = `${previous.raw}\n${line}`
      }
      continue
    }

    const [, datePart, timePart, author, content] = match
    const normalizedContent = content.trim()

    if (isNoiseLine(normalizedContent)) {
      continue
    }

    const raw = line
    messages.push({
      id: createHash("sha1").update(raw).digest("hex"),
      timestamp: normalizeTimestamp(datePart, timePart),
      author: author.trim(),
      content: normalizedContent,
      raw,
    })
  }

  return messages.filter((message) => !isNoiseLine(message.content))
}

export function getPersonaMessages(messages: ChatMessage[], personaName: string) {
  return messages.filter(
    (message) => message.author.toLowerCase() === personaName.trim().toLowerCase()
  )
}

export function getAverageWordsPerMessage(messages: ChatMessage[]) {
  if (messages.length === 0) {
    return 0
  }

  const totalWords = messages.reduce((sum, message) => {
    const words = message.content.trim().split(/\s+/).filter(Boolean)
    return sum + words.length
  }, 0)

  return Number((totalWords / messages.length).toFixed(1))
}
