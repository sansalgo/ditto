export type ChatMessage = {
  id: string
  timestamp: string
  author: string
  content: string
  raw: string
}

export type PersonalityProfile = {
  tone: string
  communicationStyle: string
  responseLength: string
  commonPhrases: string[]
  sentiment: string
  vocabularyPatterns: string[]
  relationshipSignals: string[]
  notes: string
}

export type PersonaSummary = {
  personaName: string
  totalMessages: number
  averageWordsPerMessage: number
  sourceAuthors: string[]
}

export type RetrievedMemory = {
  id: string
  author: string
  content: string
  timestamp: string
  distance?: number | null
}

export type PersonaRecord = {
  summary: PersonaSummary
  profile: PersonalityProfile
  sampleMessages: ChatMessage[]
}

export type CreatePersonaResponse = {
  persona: PersonaRecord
  storedMemories: number
}

export type ChatSimulationResponse = {
  reply: string
  retrievedContext: RetrievedMemory[]
}
