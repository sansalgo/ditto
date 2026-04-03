"use client"

import { useRef, useState, useTransition } from "react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import type {
  ChatSimulationResponse,
  CreatePersonaResponse,
  PersonalityProfile,
} from "@/lib/types"
import { RadioGroup, RadioGroupItem } from "./ui/radio-group"
import { FieldLabel } from "./ui/field"
import { BracketsCurlyIcon, BrainIcon, ChatTextIcon, DatabaseIcon, SparkleIcon } from "@phosphor-icons/react"
import { ArrowRightIcon } from "lucide-react"
import { Alert, AlertDescription } from "./ui/alert"
import { ScrollArea } from "./ui/scroll-area"

const CHAT_TIME_PATTERN = "\\d{1,2}:\\d{2}(?:\\s?[AaPp]\\.?[Mm]\\.?)?"
const CHAT_LINE_REGEX = new RegExp(
  `^(\\d{1,2}\\/\\d{1,2}\\/\\d{2,4}), (${CHAT_TIME_PATTERN}) - ([^:]+):\\s?(.*)$`
)

type ChatTurn = {
  role: "user" | "assistant"
  content: string
  timestamp: string
}

function getPersonaOptions(input: string) {
  const authors = new Set<string>()

  for (const line of input.split(/\r?\n/)) {
    const match = line.match(CHAT_LINE_REGEX)
    if (!match) {
      continue
    }

    const author = match[3]?.trim()
    if (author) {
      authors.add(author)
    }
  }

  return [...authors]
}

function hasValidChatFormat(input: string) {
  return input.split(/\r?\n/).some((line) => CHAT_LINE_REGEX.test(line))
}

export function DittoStudio() {
  const [personaName, setPersonaName] = useState("")
  const [chatHistory, setChatHistory] = useState("")
  const [personaOptions, setPersonaOptions] = useState<string[]>([])
  const [message, setMessage] = useState("What game should we play tonight?")
  const [personaData, setPersonaData] = useState<CreatePersonaResponse | null>(
    null
  )
  const [chatResult, setChatResult] = useState<ChatSimulationResponse | null>(
    null
  )
  const [chatTurns, setChatTurns] = useState<ChatTurn[]>([])
  const [error, setError] = useState<string | null>(null)
  const [isCreating, startCreating] = useTransition()
  const [isChatting, startChatting] = useTransition()
  const previewRef = useRef<HTMLDivElement | null>(null)

  const profile: PersonalityProfile | null =
    personaData?.persona.profile ?? null

  async function handleChatUpload(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]

    if (!file) {
      return
    }

    setError(null)
    setPersonaData(null)
    setChatResult(null)
    setChatTurns([])

    const fileName = file.name.toLowerCase()
    const looksLikeText =
      file.type.startsWith("text/") || fileName.endsWith(".txt")

    if (!looksLikeText) {
      setChatHistory("")
      setPersonaName("")
      setPersonaOptions([])
      setError("Upload a plain text chat export file in .txt format.")
      event.target.value = ""
      return
    }

    const content = await file.text()

    if (!hasValidChatFormat(content)) {
      setChatHistory("")
      setPersonaName("")
      setPersonaOptions([])
      setError(
        "This file does not match the expected chat format: DD/MM/YY, HH:MM - Name: Message or DD/MM/YY, H:MM am/pm - Name: Message"
      )
      event.target.value = ""
      return
    }

    const names = getPersonaOptions(content)

    setUploadedFileName(file.name)
    setChatHistory(content)
    setPersonaOptions(names)
    setPersonaName(names[0] ?? "")

    requestAnimationFrame(() => {
      previewRef.current?.scrollIntoView({ behavior: "smooth", block: "start" })
    })
  }

  function handleCreatePersona() {
    if (!chatHistory) {
      setError("Upload a chat text file first.")
      return
    }

    if (!personaName) {
      setError(
        "Select a persona name from the uploaded chat before creating the persona."
      )
      return
    }

    setError(null)
    setChatResult(null)

    startCreating(async () => {
      try {
        const response = await fetch("/api/personas", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            personaName,
            chatHistory,
          }),
        })

        const data = (await response.json()) as CreatePersonaResponse & {
          error?: string
        }

        if (!response.ok) {
          throw new Error(data.error ?? "Failed to create persona.")
        }

        setPersonaData(data)
        setChatTurns([])
      } catch (requestError) {
        setPersonaData(null)
        setError(
          requestError instanceof Error
            ? requestError.message
            : "Failed to create persona."
        )
      }
    })
  }

  function handleChat() {
    if (!profile) {
      setError(
        "Create a persona first so Ditto has a personality profile to simulate."
      )
      return
    }

    setError(null)

    startChatting(async () => {
      try {
        const conversationHistory = chatTurns
          .slice(-6)
          .map(({ role, content }) => ({ role, content }))

        const response = await fetch("/api/personas/chat", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            personaName,
            message,
            profile,
            conversationHistory,
          }),
        })

        const data = (await response.json()) as ChatSimulationResponse & {
          error?: string
        }

        if (!response.ok) {
          throw new Error(data.error ?? "Failed to simulate chat.")
        }

        setChatResult(data)
        const now = new Date()
        const ts = `${now.getDate().toString().padStart(2, "0")}/${(now.getMonth() + 1).toString().padStart(2, "0")}/${now.getFullYear().toString().slice(-2)}, ${now.getHours().toString().padStart(2, "0")}:${now.getMinutes().toString().padStart(2, "0")}`
        setChatTurns((current) => [
          ...current,
          { role: "user", content: message, timestamp: ts },
          { role: "assistant", content: data.reply, timestamp: ts },
        ])
      } catch (requestError) {
        setError(
          requestError instanceof Error
            ? requestError.message
            : "Failed to simulate chat."
        )
      }
    })
  }

  return (
    <div className="relative min-h-svh overflow-hidden bg-background">
      <main className="relative mx-auto flex w-full max-w-7xl flex-col gap-6 px-6 py-8 lg:px-10">
        <section className="grid gap-5 lg:grid-cols-[1.15fr_0.85fr]">
          <Card className="border-0 bg-card/85 shadow-[0_24px_90px_-40px_rgba(15,23,42,0.45)] backdrop-blur">
            <CardHeader className="gap-3">
              <Badge
                variant="outline"
                className="gap-1 border-border/70 bg-background/70"
              >
                <SparkleIcon />
                Digital Twin Studio
              </Badge>
              <CardTitle className="max-w-3xl text-4xl leading-tight font-semibold tracking-tight sm:text-5xl">
                Build a personality simulation from raw chat history.
              </CardTitle>
              <CardDescription className="max-w-2xl text-base leading-7">
                DITTO ingests messages, extracts tone and vocabulary, stores
                memories in Chroma, and responds using Ollama-powered persona
                prompting.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-3 sm:grid-cols-3">
              <FeatureCard
                icon={<BracketsCurlyIcon size={24} />}
                title="Profile Extraction"
                text="Structured JSON for tone, style, phrases, and sentiment."
              />
              <FeatureCard
                icon={<DatabaseIcon size={24} />}
                title="Memory Retrieval"
                text="Embeddings stored in Chroma for top-K contextual recall."
              />
              <FeatureCard
                icon={<ChatTextIcon size={24} />}
                title="Persona Chat"
                text="LLM replies grounded in profile plus retrieved history."
              />
            </CardContent>
          </Card>

          <Card className="border-0 bg-card/90 shadow-[0_24px_90px_-40px_rgba(15,23,42,0.45)] backdrop-blur">
            <CardHeader>
              <CardTitle className="text-xl">System Status</CardTitle>
              <CardDescription>
                Local-first stack: Next.js, Ollama `llama3`, and Chroma.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              <StatusPill label="Frontend" value="Next.js App Router" />
              <StatusPill label="Generation" value="Ollama llama3" />
              <StatusPill label="Vector Memory" value="Chroma collection" />
              <StatusPill label="Embedding" value="Default local embedder" />
              <p className="text-sm leading-6 text-muted-foreground">
                Keep Ollama on `localhost:11434` and Chroma on `localhost:8000`
                unless you override them with env vars.
              </p>
            </CardContent>
          </Card>
        </section>

        <section className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
          <Card className="border-0 bg-card/90 shadow-[0_18px_70px_-42px_rgba(15,23,42,0.45)] backdrop-blur">
            <CardHeader>
              <CardTitle className="text-2xl">1. Create Persona</CardTitle>
              <CardDescription>
                Upload a chat export, validate the format, pick a detected
                speaker, and then build the digital twin profile.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              <div className="grid gap-4 lg:grid-cols-1">
                <div className="flex flex-col gap-4">
                  <div className="flex flex-col gap-2">
                    <label
                      htmlFor="chat-upload"
                      className="text-sm font-medium"
                    >
                      Chat file
                    </label>
                    <Input
                      id="chat-upload"
                      type="file"
                      accept=".txt,text/plain"
                      onChange={handleChatUpload}
                      className="cursor-pointer"
                    />
                    <p className="text-sm leading-6 text-muted-foreground">
                      Upload a plain text chat export in WhatsApp-style format.
                    </p>
                  </div>

                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-medium">
                      Detected personas
                    </label>
                    <div className="border border-border/70 bg-background/70 p-4">
                      {personaOptions.length > 0 ? (
                        <RadioGroup
                          className="flex flex-wrap gap-2"
                          defaultValue={personaOptions[0]}
                          onValueChange={(e) => setPersonaName(e)}
                        >
                          {personaOptions.map((option, index) => (
                            <FieldLabel
                              key={index}
                              className="cursor-pointer border px-3 py-1.5 text-sm transition"
                            >
                              {option}
                              <RadioGroupItem
                                className="pointer-events-none absolute opacity-0"
                                value={option}
                              />
                            </FieldLabel>
                          ))}
                        </RadioGroup>
                      ) : (
                        <p className="text-sm leading-6 text-muted-foreground">
                          Upload a valid chat file to detect available speaker
                          names.
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                <div ref={previewRef} className="flex flex-col gap-2">
                  <label className="text-sm font-medium">Chat preview</label>
                  <ScrollArea className="max-h-80 border border-border bg-muted/20 p-4">
                    {chatHistory ? (
                      <pre className="font-mono text-xs leading-6 whitespace-pre-wrap text-foreground">
                        {chatHistory}
                      </pre>
                    ) : (
                      <p className="text-sm leading-6 text-muted-foreground">
                        The uploaded chat preview will appear here after
                        validation.
                      </p>
                    )}
                  </ScrollArea>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <Button
                  onClick={handleCreatePersona}
                  disabled={isCreating || !chatHistory || !personaName}
                >
                  <BrainIcon data-icon="inline-start" />
                  {isCreating ? "Building persona..." : "Create Persona"}
                </Button>
              </div>

              {error ? (
                // <div className="border border-destructive/20 bg-destructive/10 px-4 py-3 text-sm text-destructive">
                //   {error}
                // </div>
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              ) : null}
            </CardContent>
          </Card>

          <Card className="border-0 bg-card/90 shadow-[0_18px_70px_-42px_rgba(15,23,42,0.45)] backdrop-blur">
            <CardHeader>
              <CardTitle className="text-2xl">2. Chat Simulation</CardTitle>
              <CardDescription>
                Ask something new and let DITTO answer in the learned style.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              <div className="flex flex-col gap-2">
                <label htmlFor="prompt-message" className="text-sm font-medium">
                  User message
                </label>
                <ScrollArea className="h-64 border border-border bg-muted/20 p-4">
                  {chatTurns.length === 0 ? (
                    <p className="text-sm leading-6 text-muted-foreground">
                      Persona chat will appear here after the first simulated turn.
                    </p>
                  ) : (
                    <pre className="font-mono text-xs leading-6 whitespace-pre-wrap text-foreground">
                      {chatTurns
                        .map(
                          (turn) =>
                            `${turn.timestamp} - ${turn.role === "user" ? "USER" : (personaName || "ASSISTANT")}: ${turn.content}`
                        )
                        .join("\n")}
                    </pre>
                  )}
                </ScrollArea>
                <Textarea
                  id="prompt-message"
                  value={message}
                  onChange={(event) => setMessage(event.target.value)}
                  className="min-h-24"
                  placeholder="Ask the persona something..."
                />
              </div>

              <div className="flex flex-wrap items-center justify-between gap-3">
                <Badge variant={profile ? "secondary" : "outline"}>
                  {profile ? "Persona ready" : "Create a persona first"}
                </Badge>
                <Button onClick={handleChat} disabled={isChatting || !profile}>
                  <ArrowRightIcon data-icon="inline-start" />
                  {isChatting ? "Generating reply..." : "Simulate Reply"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </section>

        <section className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
          <Card className="border-0 bg-card/90 shadow-[0_18px_70px_-42px_rgba(15,23,42,0.45)] backdrop-blur">
            <CardHeader>
              <CardTitle>Extracted Personality Profile</CardTitle>
              <CardDescription>
                Structured output generated from the persona&apos;s past
                messages.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              {personaData ? (
                <>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <Stat
                      label="Messages"
                      value={String(personaData.persona.summary.totalMessages)}
                    />
                    <Stat
                      label="Avg words / msg"
                      value={String(
                        personaData.persona.summary.averageWordsPerMessage
                      )}
                    />
                    <Stat
                      label="Stored memories"
                      value={String(personaData.storedMemories)}
                    />
                    <Stat
                      label="Authors seen"
                      value={String(
                        personaData.persona.summary.sourceAuthors.length
                      )}
                    />
                  </div>
                  <pre className="overflow-x-auto bg-slate-950 p-4 font-mono text-xs leading-6 text-slate-100">
                    {JSON.stringify(personaData.persona.profile, null, 2)}
                  </pre>
                </>
              ) : (
                <EmptyPanel text="Create a persona to inspect the extracted JSON profile." />
              )}
            </CardContent>
          </Card>

          <Card className="border-0 bg-card/90 shadow-[0_18px_70px_-42px_rgba(15,23,42,0.45)] backdrop-blur">
            <CardHeader>
              <CardTitle>Retrieved Context</CardTitle>
              <CardDescription>
                Top Chroma memories used to ground the next generated response.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-3">
              {chatResult?.retrievedContext.length ? (
                chatResult.retrievedContext.map((pair, i) => (
                  <div
                    key={i}
                    className="border border-border/80 bg-background/80 px-4 py-3"
                  >
                    <div className="mb-2 flex flex-wrap items-center gap-2">
                      <Badge variant="secondary">{pair.timestamp}</Badge>
                      <Badge variant={
                        (pair.distance ?? 1) < 1.0 ? "default" :
                        (pair.distance ?? 1) < 1.3 ? "secondary" : "outline"
                      }>
                        {(pair.distance ?? 1) < 1.3 ? "relevant" : "distant"} · {pair.distance?.toFixed(3) ?? "n/a"}
                      </Badge>
                    </div>
                    <pre className="mb-2 font-mono text-xs leading-5 whitespace-pre-wrap text-muted-foreground">
                      {pair.contextWindow}
                    </pre>
                    <p className="border-l-2 border-primary pl-3 text-sm leading-6 text-foreground">
                      {pair.personaReply}
                    </p>
                  </div>
                ))
              ) : (
                <EmptyPanel text="Run a chat simulation to inspect the retrieved top-K memories." />
              )}
            </CardContent>
          </Card>
        </section>
      </main>
    </div>
  )
}

function FeatureCard(props: {
  icon: React.ReactNode
  title: string
  text: string
}) {
  return (
    <div className="border border-border/60 bg-background/65 p-4">
      <div className="mb-3 flex size-10 items-center justify-center bg-muted">
        {props.icon}
      </div>
      <h3 className="mb-1 font-medium">{props.title}</h3>
      <p className="text-sm leading-6 text-muted-foreground">{props.text}</p>
    </div>
  )
}

function StatusPill(props: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between border border-border/70 bg-background/70 px-4 py-3">
      <span className="text-sm text-muted-foreground">{props.label}</span>
      <span className="text-sm font-medium">{props.value}</span>
    </div>
  )
}

function Stat(props: { label: string; value: string }) {
  return (
    <div className="border border-border/70 bg-background/70 px-4 py-3">
      <p className="text-xs tracking-[0.18em] text-muted-foreground uppercase">
        {props.label}
      </p>
      <p className="mt-2 text-2xl font-semibold tracking-tight">
        {props.value}
      </p>
    </div>
  )
}

function EmptyPanel(props: { text: string }) {
  return (
    <div className="border border-dashed border-border bg-muted/40 px-4 py-5 text-sm text-muted-foreground">
      {props.text}
    </div>
  )
}
