"use client"

import { useState, useEffect, use } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
import { getSession } from "@/lib/interview-store"
import type { InterviewSession } from "@/lib/types"
import { toast } from "sonner"
import {
  ArrowLeft,
  ArrowRight,
  Award,
  BarChart3,
  Brain,
  CheckCircle,
  Clock,
  Download,
  Home,
  Lightbulb,
  MessageSquare,
  RefreshCw,
  Share2,
  Target,
  Trophy,
  XCircle,
} from "lucide-react"
import { cn } from "@/lib/utils"

export default function ResultsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  const [session, setSession] = useState<InterviewSession | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const loadedSession = getSession(id)
    if (loadedSession && loadedSession.status === "completed") {
      setSession(loadedSession)
    } else {
      toast.error("Results not found")
      router.push("/dashboard")
    }
    setIsLoading(false)
  }, [id, router])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-pulse text-muted-foreground">Loading results...</div>
      </div>
    )
  }

  if (!session) {
    return null
  }

  const overallScore = session.overallScore
  const avgTechnical = Math.round(
    session.feedback.reduce((acc, f) => acc + f.technicalAccuracy, 0) / session.feedback.length
  )
  const avgCommunication = Math.round(
    session.feedback.reduce((acc, f) => acc + f.communication, 0) / session.feedback.length
  )
  const avgConfidence = Math.round(
    session.feedback.reduce((acc, f) => acc + f.confidence, 0) / session.feedback.length
  )
  const totalTime = session.answers.reduce((acc, a) => acc + a.timeTaken, 0)

  const getScoreGrade = (score: number) => {
    if (score >= 90) return { grade: "A+", color: "text-green-600", message: "Outstanding!" }
    if (score >= 80) return { grade: "A", color: "text-green-600", message: "Excellent work!" }
    if (score >= 70) return { grade: "B", color: "text-blue-600", message: "Good job!" }
    if (score >= 60) return { grade: "C", color: "text-yellow-600", message: "Keep practicing!" }
    return { grade: "D", color: "text-red-600", message: "Needs improvement" }
  }

  const gradeInfo = getScoreGrade(overallScore)

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}m ${secs}s`
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/dashboard">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold">Interview Results</h1>
            <p className="text-muted-foreground">{session.domainName}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Link href={`/dashboard/interview/new?domain=${session.domain}`}>
            <Button variant="outline" className="gap-2">
              <RefreshCw className="h-4 w-4" />
              Try Again
            </Button>
          </Link>
          <Link href="/dashboard">
            <Button className="gap-2">
              <Home className="h-4 w-4" />
              Dashboard
            </Button>
          </Link>
        </div>
      </div>

      {/* Score Overview */}
      <Card className="overflow-hidden">
        <div className="bg-gradient-to-r from-primary/10 to-primary/5 p-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="text-center md:text-left">
              <p className="text-sm text-muted-foreground mb-2">Overall Score</p>
              <div className="flex items-baseline gap-3">
                <span className={cn("text-6xl font-bold", gradeInfo.color)}>{overallScore}%</span>
                <Badge variant="secondary" className="text-lg px-3 py-1">
                  {gradeInfo.grade}
                </Badge>
              </div>
              <p className="text-lg mt-2">{gradeInfo.message}</p>
            </div>
            <div className="flex items-center justify-center">
              <div className="relative">
                <Trophy
                  className={cn(
                    "h-24 w-24",
                    overallScore >= 80 ? "text-yellow-500" : overallScore >= 60 ? "text-gray-400" : "text-gray-300"
                  )}
                />
                {overallScore >= 80 && (
                  <Award className="h-8 w-8 text-yellow-600 absolute -top-2 -right-2" />
                )}
              </div>
            </div>
          </div>
        </div>

        <CardContent className="p-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="text-center">
              <Target className="h-6 w-6 mx-auto mb-2 text-primary" />
              <p className="text-2xl font-bold">{avgTechnical}%</p>
              <p className="text-sm text-muted-foreground">Technical</p>
              <Progress value={avgTechnical} className="h-1 mt-2" />
            </div>
            <div className="text-center">
              <MessageSquare className="h-6 w-6 mx-auto mb-2 text-primary" />
              <p className="text-2xl font-bold">{avgCommunication}%</p>
              <p className="text-sm text-muted-foreground">Communication</p>
              <Progress value={avgCommunication} className="h-1 mt-2" />
            </div>
            <div className="text-center">
              <Brain className="h-6 w-6 mx-auto mb-2 text-primary" />
              <p className="text-2xl font-bold">{avgConfidence}%</p>
              <p className="text-sm text-muted-foreground">Confidence</p>
              <Progress value={avgConfidence} className="h-1 mt-2" />
            </div>
            <div className="text-center">
              <Clock className="h-6 w-6 mx-auto mb-2 text-primary" />
              <p className="text-2xl font-bold">{formatTime(totalTime)}</p>
              <p className="text-sm text-muted-foreground">Total Time</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Question Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Question Breakdown
          </CardTitle>
          <CardDescription>Detailed feedback for each question</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {session.questions.map((question, index) => {
            const answer = session.answers.find((a) => a.questionId === question.id)
            const feedback = session.feedback.find((f) => f.questionId === question.id)

            if (!answer || !feedback) return null

            const isGoodScore = feedback.score >= 70

            return (
              <div key={question.id} className="space-y-4">
                {index > 0 && <Separator />}
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">Q{index + 1}</Badge>
                      <Badge
                        variant="secondary"
                        className={cn(
                          "capitalize",
                          question.difficulty === "easy"
                            ? "bg-green-500/10 text-green-600"
                            : question.difficulty === "medium"
                              ? "bg-yellow-500/10 text-yellow-600"
                              : "bg-red-500/10 text-red-600"
                        )}
                      >
                        {question.difficulty}
                      </Badge>
                    </div>
                    <p className="font-medium">{question.question}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    {isGoodScore ? (
                      <CheckCircle className="h-5 w-5 text-green-500" />
                    ) : (
                      <XCircle className="h-5 w-5 text-red-500" />
                    )}
                    <span
                      className={cn("text-lg font-bold", isGoodScore ? "text-green-600" : "text-red-600")}
                    >
                      {feedback.score}%
                    </span>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="rounded-lg bg-muted/50 p-4">
                    <p className="text-sm font-medium mb-2">Your Answer</p>
                    <p className="text-sm text-muted-foreground line-clamp-3">{answer.answer}</p>
                  </div>
                  <div className="rounded-lg bg-primary/5 p-4">
                    <p className="text-sm font-medium mb-2 flex items-center gap-2">
                      <Lightbulb className="h-4 w-4 text-primary" />
                      Ideal Answer
                    </p>
                    <p className="text-sm text-muted-foreground line-clamp-3">{feedback.correctAnswer}</p>
                  </div>
                </div>

                <div className="text-sm text-muted-foreground bg-muted/30 rounded-lg p-3">
                  <strong>Feedback:</strong> {feedback.feedback}
                </div>
              </div>
            )
          })}
        </CardContent>
      </Card>

      {/* Key Takeaways */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lightbulb className="h-5 w-5" />
            Key Takeaways
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium mb-3 text-green-600 flex items-center gap-2">
                <CheckCircle className="h-4 w-4" />
                Strengths
              </h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                {avgTechnical >= 70 && <li>Good technical understanding of concepts</li>}
                {avgCommunication >= 70 && <li>Clear and effective communication</li>}
                {avgConfidence >= 70 && <li>Confident delivery of answers</li>}
                {session.feedback.some((f) => f.score >= 80) && (
                  <li>Strong performance on difficult questions</li>
                )}
              </ul>
            </div>
            <div>
              <h4 className="font-medium mb-3 text-yellow-600 flex items-center gap-2">
                <ArrowRight className="h-4 w-4" />
                Areas to Improve
              </h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                {avgTechnical < 70 && <li>Deepen technical knowledge in this domain</li>}
                {avgCommunication < 70 && <li>Practice structuring answers more clearly</li>}
                {avgConfidence < 70 && <li>Build confidence through more practice</li>}
                {session.feedback.some((f) => f.score < 60) && (
                  <li>Review fundamentals for challenging topics</li>
                )}
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <Link href={`/dashboard/interview/new?domain=${session.domain}`}>
          <Button size="lg" className="w-full sm:w-auto gap-2">
            <RefreshCw className="h-4 w-4" />
            Practice Again
          </Button>
        </Link>
        <Link href="/dashboard">
          <Button size="lg" variant="outline" className="w-full sm:w-auto gap-2">
            <Home className="h-4 w-4" />
            Back to Dashboard
          </Button>
        </Link>
      </div>
    </div>
  )
}
