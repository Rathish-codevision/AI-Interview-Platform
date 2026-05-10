"use client"

import { useState, useEffect, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { toast } from "sonner"
import { getInterviewDomain, saveSession } from "@/lib/interview-store"
import type { InterviewQuestion, InterviewSession } from "@/lib/types"
import { ArrowLeft, ArrowRight, Brain, FileText, Loader2, Upload, Sparkles } from "lucide-react"
import Link from "next/link"

function NewInterviewContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const domainId = searchParams.get("domain")

  const [level, setLevel] = useState("fresher")
  const [resumeText, setResumeText] = useState("")
  const [isGenerating, setIsGenerating] = useState(false)

  const domain = domainId ? getInterviewDomain(domainId) : null

  useEffect(() => {
    if (!domainId || !domain) {
      router.push("/dashboard")
    }
  }, [domainId, domain, router])

  if (!domain) {
    return null
  }

  const handleStartInterview = async () => {
    setIsGenerating(true)

    try {
      const response = await fetch("/api/interview/questions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          domain: domainId,
          level,
          resumeContext: resumeText.trim(),
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to generate questions")
      }

      // Read the streaming response
      const reader = response.body?.getReader()
      const decoder = new TextDecoder()
      let fullContent = ""

      if (reader) {
        while (true) {
          const { done, value } = await reader.read()
          if (done) break
          fullContent += decoder.decode(value, { stream: true })
        }
      }

      // Extract JSON from the SSE response
      const lines = fullContent.split("\n")
      let jsonText = ""
      for (const line of lines) {
        if (line.startsWith("data:")) {
          const data = line.slice(5).trim()
          if (data && data !== "[DONE]") {
            try {
              const parsed = JSON.parse(data)
              if (parsed.type === "text-delta" && parsed.delta) {
                jsonText += parsed.delta
              }
            } catch {
              // Skip invalid JSON
            }
          }
        }
      }

      // Parse the accumulated JSON
      let questions: InterviewQuestion[]
      try {
        // Clean up potential markdown formatting
        jsonText = jsonText.trim()
        if (jsonText.startsWith("```json")) {
          jsonText = jsonText.slice(7)
        }
        if (jsonText.startsWith("```")) {
          jsonText = jsonText.slice(3)
        }
        if (jsonText.endsWith("```")) {
          jsonText = jsonText.slice(0, -3)
        }
        questions = JSON.parse(jsonText.trim())
      } catch {
        // Fallback questions if parsing fails
        questions = [
          {
            id: "q1",
            question: `Explain the key concepts of ${domain.name}.`,
            type: "text",
            difficulty: "easy",
          },
          {
            id: "q2",
            question: `What are best practices when working with ${domain.name}?`,
            type: "text",
            difficulty: "easy",
          },
          {
            id: "q3",
            question: `Describe a challenging problem you solved using ${domain.name}.`,
            type: "text",
            difficulty: "medium",
          },
          {
            id: "q4",
            question: `How would you optimize performance in a ${domain.name} application?`,
            type: "text",
            difficulty: "medium",
          },
          {
            id: "q5",
            question: `Design a solution for a complex ${domain.name} problem.`,
            type: "text",
            difficulty: "hard",
          },
        ]
      }

      // Create the interview session
      const session: InterviewSession = {
        id: `session-${Date.now()}`,
        domain: domainId!,
        domainName: domain.name,
        questions,
        answers: [],
        feedback: [],
        overallScore: 0,
        startedAt: new Date().toISOString(),
        status: "in-progress",
      }

      saveSession(session)
      toast.success("Interview started!")
      router.push(`/dashboard/interview/${session.id}`)
    } catch (error) {
      console.error("Error generating questions:", error)
      toast.error("Failed to start interview. Please try again.")
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/dashboard">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold">{domain.name} Interview</h1>
          <p className="text-muted-foreground">{domain.description}</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            Configure Your Interview
          </CardTitle>
          <CardDescription>Customize your interview experience for better practice</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Experience Level */}
          <div className="space-y-3">
            <Label className="text-base">Experience Level</Label>
            <RadioGroup value={level} onValueChange={setLevel} className="grid grid-cols-3 gap-4">
              <div>
                <RadioGroupItem value="fresher" id="fresher" className="peer sr-only" />
                <Label
                  htmlFor="fresher"
                  className="flex flex-col items-center justify-center rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary cursor-pointer"
                >
                  <span className="text-sm font-medium">Fresher</span>
                  <span className="text-xs text-muted-foreground">0-1 years</span>
                </Label>
              </div>
              <div>
                <RadioGroupItem value="intermediate" id="intermediate" className="peer sr-only" />
                <Label
                  htmlFor="intermediate"
                  className="flex flex-col items-center justify-center rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary cursor-pointer"
                >
                  <span className="text-sm font-medium">Mid-Level</span>
                  <span className="text-xs text-muted-foreground">2-5 years</span>
                </Label>
              </div>
              <div>
                <RadioGroupItem value="senior" id="senior" className="peer sr-only" />
                <Label
                  htmlFor="senior"
                  className="flex flex-col items-center justify-center rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary cursor-pointer"
                >
                  <span className="text-sm font-medium">Senior</span>
                  <span className="text-xs text-muted-foreground">5+ years</span>
                </Label>
              </div>
            </RadioGroup>
          </div>

          {/* Resume Context */}
          <Tabs defaultValue="none" className="space-y-4">
            <div className="space-y-2">
              <Label className="text-base">Resume Context (Optional)</Label>
              <p className="text-sm text-muted-foreground">
                Add context from your resume for personalized questions
              </p>
            </div>
            <TabsList className="grid grid-cols-2">
              <TabsTrigger value="none">No Resume</TabsTrigger>
              <TabsTrigger value="paste">Paste Resume</TabsTrigger>
            </TabsList>
            <TabsContent value="none" className="space-y-2">
              <div className="rounded-lg border border-dashed p-6 text-center text-muted-foreground">
                <FileText className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">Questions will be generated based on domain and level only</p>
              </div>
            </TabsContent>
            <TabsContent value="paste" className="space-y-2">
              <Textarea
                placeholder="Paste your resume text here for personalized questions..."
                value={resumeText}
                onChange={(e) => setResumeText(e.target.value)}
                rows={6}
              />
              <p className="text-xs text-muted-foreground">
                AI will analyze your experience to generate relevant questions
              </p>
            </TabsContent>
          </Tabs>

          {/* Interview Info */}
          <div className="rounded-lg bg-muted p-4 space-y-2">
            <h4 className="font-medium">Interview Details</h4>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">Questions:</span>
                <span className="ml-2 font-medium">{domain.questionCount}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Duration:</span>
                <span className="ml-2 font-medium">~15-20 min</span>
              </div>
              <div>
                <span className="text-muted-foreground">Features:</span>
                <div className="flex gap-1 mt-1">
                  <Badge variant="outline" className="text-xs">
                    Voice Input
                  </Badge>
                  <Badge variant="outline" className="text-xs">
                    AI Feedback
                  </Badge>
                </div>
              </div>
            </div>
          </div>

          <Button onClick={handleStartInterview} disabled={isGenerating} className="w-full gap-2" size="lg">
            {isGenerating ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Generating Questions...
              </>
            ) : (
              <>
                <Brain className="h-4 w-4" />
                Start Interview
                <ArrowRight className="h-4 w-4" />
              </>
            )}
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}

export default function NewInterviewPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      }
    >
      <NewInterviewContent />
    </Suspense>
  )
}
