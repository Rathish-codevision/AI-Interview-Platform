"use client"

import { useState, useEffect, useRef } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { VoiceRecorder } from "@/components/voice-recorder"
import type { InterviewQuestion, Answer, QuestionFeedback } from "@/lib/types"
import {
  CheckCircle,
  ChevronDown,
  ChevronUp,
  Clock,
  Code,
  Lightbulb,
  Loader2,
  MessageSquare,
  Send,
  Volume2,
  VolumeX,
  XCircle,
} from "lucide-react"
import { cn } from "@/lib/utils"

interface QuestionCardProps {
  question: InterviewQuestion
  questionNumber: number
  totalQuestions: number
  domain: string
  existingAnswer?: Answer
  existingFeedback?: QuestionFeedback
  onSubmitAnswer: (answer: Answer) => Promise<QuestionFeedback>
  isActive: boolean
  onNext: () => void
}

export function QuestionCard({
  question,
  questionNumber,
  totalQuestions,
  domain,
  existingAnswer,
  existingFeedback,
  onSubmitAnswer,
  isActive,
  onNext,
}: QuestionCardProps) {
  const [answer, setAnswer] = useState(existingAnswer?.answer || "")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [feedback, setFeedback] = useState<QuestionFeedback | null>(existingFeedback || null)
  const [showFeedback, setShowFeedback] = useState(!!existingFeedback)
  const [timer, setTimer] = useState(0)
  const [isSpeaking, setIsSpeaking] = useState(false)
  const timerRef = useRef<NodeJS.Timeout | null>(null)
  const startTimeRef = useRef<number>(Date.now())

  useEffect(() => {
    if (isActive && !feedback) {
      startTimeRef.current = Date.now()
      timerRef.current = setInterval(() => {
        setTimer(Math.floor((Date.now() - startTimeRef.current) / 1000))
      }, 1000)
    }
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current)
      }
    }
  }, [isActive, feedback])

  const handleVoiceTranscript = (text: string) => {
    setAnswer((prev) => (prev ? prev + " " + text : text))
  }

  const handleSubmit = async () => {
    if (!answer.trim()) return

    setIsSubmitting(true)
    if (timerRef.current) {
      clearInterval(timerRef.current)
    }

    const answerData: Answer = {
      questionId: question.id,
      answer: answer.trim(),
      isCode: question.type === "code",
      timeTaken: timer,
    }

    try {
      const result = await onSubmitAnswer(answerData)
      setFeedback(result)
      setShowFeedback(true)
    } catch (error) {
      console.error("Failed to submit answer:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const speakQuestion = () => {
    if ("speechSynthesis" in window) {
      if (isSpeaking) {
        window.speechSynthesis.cancel()
        setIsSpeaking(false)
      } else {
        const utterance = new SpeechSynthesisUtterance(question.question)
        utterance.onend = () => setIsSpeaking(false)
        window.speechSynthesis.speak(utterance)
        setIsSpeaking(true)
      }
    }
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "easy":
        return "bg-green-500/10 text-green-600 border-green-500/20"
      case "medium":
        return "bg-yellow-500/10 text-yellow-600 border-yellow-500/20"
      case "hard":
        return "bg-red-500/10 text-red-600 border-red-500/20"
      default:
        return "bg-muted text-muted-foreground"
    }
  }

  const isAnswered = !!feedback

  return (
    <Card className={cn("transition-all", isActive ? "border-primary shadow-md" : "opacity-80")}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-1 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <Badge variant="outline" className="text-xs">
                Question {questionNumber} of {totalQuestions}
              </Badge>
              <Badge className={cn("text-xs capitalize", getDifficultyColor(question.difficulty))}>
                {question.difficulty}
              </Badge>
              {question.type === "code" && (
                <Badge variant="secondary" className="text-xs gap-1">
                  <Code className="h-3 w-3" />
                  {question.language || "Code"}
                </Badge>
              )}
              {isAnswered && (
                <Badge variant="default" className="text-xs gap-1 bg-green-600">
                  <CheckCircle className="h-3 w-3" />
                  Answered
                </Badge>
              )}
            </div>
            <CardTitle className="text-lg leading-relaxed">{question.question}</CardTitle>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={speakQuestion} className="shrink-0">
              {isSpeaking ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
            </Button>
            {!isAnswered && (
              <div className="flex items-center gap-1 text-sm text-muted-foreground bg-muted px-2 py-1 rounded">
                <Clock className="h-3 w-3" />
                {formatTime(timer)}
              </div>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Answer Input */}
        {!isAnswered ? (
          <>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Your Answer</span>
                <VoiceRecorder onTranscript={handleVoiceTranscript} disabled={isSubmitting} />
              </div>
              <Textarea
                placeholder={
                  question.type === "code"
                    ? "Write your code here..."
                    : "Type your answer here or use voice input..."
                }
                value={answer}
                onChange={(e) => setAnswer(e.target.value)}
                rows={question.type === "code" ? 10 : 5}
                disabled={isSubmitting}
                className={cn(question.type === "code" && "font-mono text-sm")}
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button onClick={handleSubmit} disabled={!answer.trim() || isSubmitting} className="gap-2">
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4" />
                    Submit Answer
                  </>
                )}
              </Button>
            </div>
          </>
        ) : (
          <>
            {/* Submitted Answer Display */}
            <div className="rounded-lg bg-muted/50 p-4">
              <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                <MessageSquare className="h-4 w-4" />
                Your Answer
              </div>
              <p className={cn("whitespace-pre-wrap", question.type === "code" && "font-mono text-sm")}>
                {answer}
              </p>
            </div>

            {/* Feedback Section */}
            {feedback && (
              <div className="space-y-4">
                <Button
                  variant="ghost"
                  className="w-full justify-between"
                  onClick={() => setShowFeedback(!showFeedback)}
                >
                  <span className="flex items-center gap-2">
                    <Lightbulb className="h-4 w-4 text-primary" />
                    AI Feedback
                  </span>
                  {showFeedback ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                </Button>

                {showFeedback && (
                  <div className="space-y-4 animate-in fade-in slide-in-from-top-2">
                    {/* Score Overview */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <ScoreCard label="Overall" score={feedback.score} />
                      <ScoreCard label="Technical" score={feedback.technicalAccuracy} />
                      <ScoreCard label="Communication" score={feedback.communication} />
                      <ScoreCard label="Confidence" score={feedback.confidence} />
                    </div>

                    {/* Feedback Text */}
                    <div className="rounded-lg border p-4 space-y-3">
                      <div>
                        <h4 className="text-sm font-medium mb-1">Feedback</h4>
                        <p className="text-sm text-muted-foreground">{feedback.feedback}</p>
                      </div>

                      <div>
                        <h4 className="text-sm font-medium mb-1">Ideal Answer</h4>
                        <p className="text-sm text-muted-foreground">{feedback.correctAnswer}</p>
                      </div>

                      {feedback.suggestions.length > 0 && (
                        <div>
                          <h4 className="text-sm font-medium mb-1">Suggestions</h4>
                          <ul className="text-sm text-muted-foreground space-y-1">
                            {feedback.suggestions.map((suggestion, i) => (
                              <li key={i} className="flex items-start gap-2">
                                <span className="text-primary">•</span>
                                {suggestion}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>

                    {questionNumber < totalQuestions && (
                      <Button onClick={onNext} className="w-full gap-2">
                        Next Question
                        <ChevronDown className="h-4 w-4 rotate-[-90deg]" />
                      </Button>
                    )}
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  )
}

function ScoreCard({ label, score }: { label: string; score: number }) {
  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600"
    if (score >= 60) return "text-yellow-600"
    return "text-red-600"
  }

  return (
    <div className="rounded-lg border p-3 text-center">
      <p className="text-xs text-muted-foreground mb-1">{label}</p>
      <p className={cn("text-2xl font-bold", getScoreColor(score))}>{score}%</p>
      <Progress value={score} className="h-1 mt-2" />
    </div>
  )
}
