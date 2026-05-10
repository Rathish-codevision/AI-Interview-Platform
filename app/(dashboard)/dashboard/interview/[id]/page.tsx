"use client"

import { useState, useEffect, use } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { QuestionCard } from "@/components/question-card"
import { getSession, saveSession, addToHistory } from "@/lib/interview-store"
import type { InterviewSession, Answer, QuestionFeedback } from "@/lib/types"
import { toast } from "sonner"
import { ArrowLeft, CheckCircle, Loader2, Trophy } from "lucide-react"

export default function InterviewPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  const [session, setSession] = useState<InterviewSession | null>(null)
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [isCompleting, setIsCompleting] = useState(false)

  useEffect(() => {
    const loadedSession = getSession(id)
    if (loadedSession) {
      setSession(loadedSession)
      // Find the first unanswered question
      const firstUnanswered = loadedSession.questions.findIndex(
        (q) => !loadedSession.answers.find((a) => a.questionId === q.id)
      )
      setCurrentQuestionIndex(firstUnanswered >= 0 ? firstUnanswered : 0)
    } else {
      toast.error("Interview session not found")
      router.push("/dashboard")
    }
    setIsLoading(false)
  }, [id, router])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (!session) {
    return null
  }

  const handleSubmitAnswer = async (answer: Answer): Promise<QuestionFeedback> => {
    const question = session.questions.find((q) => q.id === answer.questionId)

    // Call the feedback API
    const response = await fetch("/api/interview/feedback", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        question: question?.question,
        answer: answer.answer,
        domain: session.domain,
        isCode: answer.isCode,
      }),
    })

    if (!response.ok) {
      throw new Error("Failed to get feedback")
    }

    // Parse streaming response
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

    // Extract JSON from SSE
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

    // Parse feedback JSON
    let feedback: QuestionFeedback
    try {
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
      const parsed = JSON.parse(jsonText.trim())
      feedback = {
        questionId: answer.questionId,
        score: parsed.score || 70,
        technicalAccuracy: parsed.technicalAccuracy || 70,
        communication: parsed.communication || 70,
        confidence: parsed.confidence || 70,
        feedback: parsed.feedback || "Good attempt!",
        correctAnswer: parsed.correctAnswer || "No ideal answer provided.",
        suggestions: parsed.suggestions || [],
      }
    } catch {
      // Fallback feedback
      feedback = {
        questionId: answer.questionId,
        score: 70,
        technicalAccuracy: 70,
        communication: 70,
        confidence: 70,
        feedback: "Your answer has been recorded. Keep practicing to improve!",
        correctAnswer: "Unable to generate ideal answer at this time.",
        suggestions: ["Practice more", "Review the fundamentals"],
      }
    }

    // Update session
    const updatedSession: InterviewSession = {
      ...session,
      answers: [...session.answers, answer],
      feedback: [...session.feedback, feedback],
    }
    setSession(updatedSession)
    saveSession(updatedSession)

    return feedback
  }

  const handleNextQuestion = () => {
    if (currentQuestionIndex < session.questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1)
      // Scroll to top
      window.scrollTo({ top: 0, behavior: "smooth" })
    }
  }

  const handleCompleteInterview = async () => {
    setIsCompleting(true)

    // Calculate overall score
    const totalScore = session.feedback.reduce((acc, f) => acc + f.score, 0)
    const overallScore = Math.round(totalScore / session.feedback.length)

    const completedSession: InterviewSession = {
      ...session,
      overallScore,
      completedAt: new Date().toISOString(),
      status: "completed",
    }

    saveSession(completedSession)
    addToHistory(completedSession)

    toast.success("Interview completed!")
    router.push(`/dashboard/results/${session.id}`)
  }

  const answeredCount = session.answers.length
  const totalQuestions = session.questions.length
  const progress = (answeredCount / totalQuestions) * 100
  const allAnswered = answeredCount === totalQuestions

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link href="/dashboard">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-xl font-bold">{session.domainName} Interview</h1>
            <p className="text-sm text-muted-foreground">
              {answeredCount} of {totalQuestions} questions answered
            </p>
          </div>
        </div>
        {allAnswered && (
          <Button onClick={handleCompleteInterview} disabled={isCompleting} className="gap-2">
            {isCompleting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Completing...
              </>
            ) : (
              <>
                <Trophy className="h-4 w-4" />
                Complete Interview
              </>
            )}
          </Button>
        )}
      </div>

      {/* Progress */}
      <Card>
        <CardContent className="py-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Progress</span>
            <span className="text-sm text-muted-foreground">{Math.round(progress)}%</span>
          </div>
          <Progress value={progress} className="h-2" />
          <div className="flex gap-1 mt-3">
            {session.questions.map((q, i) => {
              const isAnswered = session.answers.some((a) => a.questionId === q.id)
              return (
                <button
                  key={q.id}
                  onClick={() => setCurrentQuestionIndex(i)}
                  className={`flex-1 h-2 rounded-full transition-colors ${
                    isAnswered
                      ? "bg-green-500"
                      : i === currentQuestionIndex
                        ? "bg-primary"
                        : "bg-muted"
                  }`}
                  title={`Question ${i + 1}`}
                />
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Questions */}
      <div className="space-y-4">
        {session.questions.map((question, index) => (
          <QuestionCard
            key={question.id}
            question={question}
            questionNumber={index + 1}
            totalQuestions={totalQuestions}
            domain={session.domain}
            existingAnswer={session.answers.find((a) => a.questionId === question.id)}
            existingFeedback={session.feedback.find((f) => f.questionId === question.id)}
            onSubmitAnswer={handleSubmitAnswer}
            isActive={index === currentQuestionIndex}
            onNext={handleNextQuestion}
          />
        ))}
      </div>

      {/* Complete Button (when all answered) */}
      {allAnswered && (
        <Card className="border-green-500/50 bg-green-500/5">
          <CardContent className="py-6 text-center">
            <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">All Questions Answered!</h3>
            <p className="text-muted-foreground mb-4">
              Great job! Click the button below to see your final results.
            </p>
            <Button onClick={handleCompleteInterview} disabled={isCompleting} size="lg" className="gap-2">
              {isCompleting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Calculating Results...
                </>
              ) : (
                <>
                  <Trophy className="h-4 w-4" />
                  View Results
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
