"use client"

import { useState, useTransition } from "react"
import {
  Brain,
  Database,
  MessageSquareText,
  Radar,
  Send,
  Sparkles,
  UserRound,
} from "lucide-react"

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

const SAMPLE_CHAT = `19/10/25, 15:52 - Messages and calls are end-to-end encrypted. Only people in this chat can read, listen to, or share them. *Learn more*.
21/10/25, 07:18 - Hari Jr: I can connect via mobile if you’d like, including Santhosh
21/10/25, 07:23 - SANS: I can join the meeting via mobile if you'd like. Should I ask Santhosh to do the same?
26/10/25, 15:57 - Hari Jr: Do you get anything epic
26/10/25, 15:57 - SANS: Nope
26/10/25, 15:57 - Hari Jr: Y
26/10/25, 15:57 - Hari Jr: Get it
26/10/25, 15:57 - SANS: Yes
29/10/25, 07:03 - Hari Jr: Another day another coffee but place is Madurai
02/11/25, 20:35 - SANS: Pumpkin
08/11/25, 06:24 - SANS: DSA
08/11/25, 06:24 - SANS: No Brawlstars
11/11/25, 19:01 - SANS: Cool
11/11/25, 19:09 - SANS: Nice
11/11/25, 20:46 - SANS: 70 gems`

type ChatTurn = {
  role: "user" | "assistant"
  content: string
}

export function DittoStudio() {
  const [personaName, setPersonaName] = useState("SANS")
  const [chatHistory, setChatHistory] = useState(SAMPLE_CHAT)
  const [message, setMessage] = useState("What game should we play tonight?")
  const [personaData, setPersonaData] = useState<CreatePersonaResponse | null>(null)
  const [chatResult, setChatResult] = useState<ChatSimulationResponse | null>(null)
  const [chatTurns, setChatTurns] = useState<ChatTurn[]>([])
  const [error, setError] = useState<string | null>(null)
  const [isCreating, startCreating] = useTransition()
  const [isChatting, startChatting] = useTransition()

  const profile: PersonalityProfile | null = personaData?.persona.profile ?? null

  function handleCreatePersona() {
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
      setError("Create a persona first so Ditto has a personality profile to simulate.")
      return
    }

    setError(null)

    startChatting(async () => {
      try {
        const response = await fetch("/api/personas/chat", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            personaName,
            message,
            profile,
          }),
        })

        const data = (await response.json()) as ChatSimulationResponse & {
          error?: string
        }

        if (!response.ok) {
          throw new Error(data.error ?? "Failed to simulate chat.")
        }

        setChatResult(data)
        setChatTurns((current) => [
          ...current,
          { role: "user", content: message },
          { role: "assistant", content: data.reply },
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
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(209,250,229,0.75),_transparent_28%),radial-gradient(circle_at_top_right,_rgba(191,219,254,0.7),_transparent_24%),linear-gradient(180deg,_rgba(255,255,255,0.92),_rgba(244,247,245,0.98))]" />
      <div className="absolute inset-x-0 top-0 h-72 bg-[linear-gradient(135deg,rgba(15,23,42,0.04),transparent)]" />
      <main className="relative mx-auto flex w-full max-w-7xl flex-col gap-6 px-6 py-8 lg:px-10">
        <section className="grid gap-5 lg:grid-cols-[1.15fr_0.85fr]">
          <Card className="border-0 bg-card/85 shadow-[0_24px_90px_-40px_rgba(15,23,42,0.45)] backdrop-blur">
            <CardHeader className="gap-3">
              <Badge variant="outline" className="gap-1 border-border/70 bg-background/70">
                <Sparkles />
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
                icon={<Radar />}
                title="Profile Extraction"
                text="Structured JSON for tone, style, phrases, and sentiment."
              />
              <FeatureCard
                icon={<Database />}
                title="Memory Retrieval"
                text="Embeddings stored in Chroma for top-K contextual recall."
              />
              <FeatureCard
                icon={<MessageSquareText />}
                title="Persona Chat"
                text="LLM replies grounded in profile plus retrieved history."
              />
            </CardContent>
          </Card>

          <Card className="border-0 bg-slate-950 text-slate-50 shadow-[0_24px_90px_-40px_rgba(15,23,42,0.75)]">
            <CardHeader>
              <CardTitle className="text-xl">System Status</CardTitle>
              <CardDescription className="text-slate-300">
                Local-first stack: Next.js, Ollama `llama3`, and Chroma.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              <StatusPill label="Frontend" value="Next.js App Router" />
              <StatusPill label="Generation" value="Ollama llama3" />
              <StatusPill label="Vector Memory" value="Chroma collection" />
              <StatusPill label="Embedding" value="Default local embedder" />
              <p className="text-sm leading-6 text-slate-300">
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
                Upload or paste chat history, choose the speaker name, and build
                the digital twin profile.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              <div className="grid gap-4 md:grid-cols-[220px_1fr]">
                <div className="flex flex-col gap-2">
                  <label htmlFor="persona-name" className="text-sm font-medium">
                    Persona name
                  </label>
                  <Input
                    id="persona-name"
                    value={personaName}
                    onChange={(event) => setPersonaName(event.target.value)}
                    placeholder="SANS"
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <label htmlFor="chat-history" className="text-sm font-medium">
                    Chat history
                  </label>
                  <Textarea
                    id="chat-history"
                    value={chatHistory}
                    onChange={(event) => setChatHistory(event.target.value)}
                    className="min-h-64 font-mono text-xs leading-6"
                    placeholder="Paste WhatsApp-style chat export here..."
                  />
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <Button onClick={handleCreatePersona} disabled={isCreating}>
                  <Brain data-icon="inline-start" />
                  {isCreating ? "Building persona..." : "Create Persona"}
                </Button>
                <Badge variant="secondary">Target: {personaName || "Unknown"}</Badge>
                <Badge variant="outline">Sample-ready input loaded</Badge>
              </div>

              {error ? (
                <div className="rounded-xl border border-destructive/20 bg-destructive/10 px-4 py-3 text-sm text-destructive">
                  {error}
                </div>
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
                <Textarea
                  id="prompt-message"
                  value={message}
                  onChange={(event) => setMessage(event.target.value)}
                  className="min-h-24"
                  placeholder="Ask the persona something..."
                />
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <Button onClick={handleChat} disabled={isChatting || !profile}>
                  <Send data-icon="inline-start" />
                  {isChatting ? "Generating reply..." : "Simulate Reply"}
                </Button>
                <Badge variant={profile ? "secondary" : "outline"}>
                  {profile ? "Persona ready" : "Create a persona first"}
                </Badge>
              </div>

              <div className="grid gap-3">
                {chatTurns.length === 0 ? (
                  <div className="rounded-2xl border border-dashed border-border bg-muted/40 px-4 py-5 text-sm text-muted-foreground">
                    Persona chat will appear here after the first simulated turn.
                  </div>
                ) : (
                  chatTurns.map((turn, index) => (
                    <div
                      key={`${turn.role}-${index}`}
                      className={`rounded-2xl px-4 py-3 text-sm leading-6 ${
                        turn.role === "assistant"
                          ? "bg-slate-950 text-slate-50"
                          : "bg-muted"
                      }`}
                    >
                      <div className="mb-1 flex items-center gap-2 text-xs uppercase tracking-[0.18em] opacity-70">
                        {turn.role === "assistant" ? <UserRound /> : <Send />}
                        {turn.role}
                      </div>
                      <p>{turn.content}</p>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </section>

        <section className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
          <Card className="border-0 bg-card/90 shadow-[0_18px_70px_-42px_rgba(15,23,42,0.45)] backdrop-blur">
            <CardHeader>
              <CardTitle>Extracted Personality Profile</CardTitle>
              <CardDescription>
                Structured output generated from the persona&apos;s past messages.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              {personaData ? (
                <>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <Stat label="Messages" value={String(personaData.persona.summary.totalMessages)} />
                    <Stat
                      label="Avg words / msg"
                      value={String(personaData.persona.summary.averageWordsPerMessage)}
                    />
                    <Stat label="Stored memories" value={String(personaData.storedMemories)} />
                    <Stat
                      label="Authors seen"
                      value={String(personaData.persona.summary.sourceAuthors.length)}
                    />
                  </div>
                  <pre className="overflow-x-auto rounded-2xl bg-slate-950 p-4 font-mono text-xs leading-6 text-slate-100">
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
                chatResult.retrievedContext.map((memory) => (
                  <div
                    key={memory.id}
                    className="rounded-2xl border border-border/80 bg-background/80 px-4 py-3"
                  >
                    <div className="mb-2 flex flex-wrap items-center gap-2">
                      <Badge variant="outline">{memory.author}</Badge>
                      <Badge variant="secondary">{memory.timestamp}</Badge>
                      <Badge variant="outline">
                        distance {memory.distance?.toFixed(3) ?? "n/a"}
                      </Badge>
                    </div>
                    <p className="text-sm leading-6 text-muted-foreground">
                      {memory.content}
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

function FeatureCard(props: { icon: React.ReactNode; title: string; text: string }) {
  return (
    <div className="rounded-2xl border border-border/60 bg-background/65 p-4">
      <div className="mb-3 flex size-10 items-center justify-center rounded-2xl bg-muted">
        {props.icon}
      </div>
      <h3 className="mb-1 font-medium">{props.title}</h3>
      <p className="text-sm leading-6 text-muted-foreground">{props.text}</p>
    </div>
  )
}

function StatusPill(props: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
      <span className="text-sm text-slate-300">{props.label}</span>
      <span className="text-sm font-medium text-white">{props.value}</span>
    </div>
  )
}

function Stat(props: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-border/70 bg-background/70 px-4 py-3">
      <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
        {props.label}
      </p>
      <p className="mt-2 text-2xl font-semibold tracking-tight">{props.value}</p>
    </div>
  )
}

function EmptyPanel(props: { text: string }) {
  return (
    <div className="rounded-2xl border border-dashed border-border bg-muted/40 px-4 py-5 text-sm text-muted-foreground">
      {props.text}
    </div>
  )
}
