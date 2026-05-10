"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { getHistory, clearHistory } from "@/lib/interview-store"
import type { InterviewHistory } from "@/lib/types"
import { toast } from "sonner"
import {
  ArrowRight,
  Calendar,
  Clock,
  History as HistoryIcon,
  Target,
  Trash2,
  Trophy,
  BarChart3,
} from "lucide-react"
import { cn } from "@/lib/utils"

export default function HistoryPage() {
  const [history, setHistory] = useState<InterviewHistory[]>([])

  useEffect(() => {
    setHistory(getHistory())
  }, [])

  const handleClearHistory = () => {
    clearHistory()
    setHistory([])
    toast.success("History cleared")
  }

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600"
    if (score >= 60) return "text-yellow-600"
    return "text-red-600"
  }

  const getScoreBadgeVariant = (score: number): "default" | "secondary" | "destructive" => {
    if (score >= 70) return "default"
    if (score >= 50) return "secondary"
    return "destructive"
  }

  // Calculate stats
  const totalInterviews = history.length
  const averageScore =
    totalInterviews > 0 ? Math.round(history.reduce((acc, h) => acc + h.overallScore, 0) / totalInterviews) : 0
  const bestScore = totalInterviews > 0 ? Math.max(...history.map((h) => h.overallScore)) : 0
  const domainCounts = history.reduce(
    (acc, h) => {
      acc[h.domainName] = (acc[h.domainName] || 0) + 1
      return acc
    },
    {} as Record<string, number>
  )
  const mostPracticed =
    Object.entries(domainCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || "None yet"

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <HistoryIcon className="h-8 w-8" />
            Interview History
          </h1>
          <p className="text-muted-foreground mt-1">Track your progress and review past interviews</p>
        </div>
        {history.length > 0 && (
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="outline" className="gap-2 text-destructive hover:text-destructive">
                <Trash2 className="h-4 w-4" />
                Clear History
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Clear all history?</AlertDialogTitle>
                <AlertDialogDescription>
                  This will permanently delete all your interview history. This action cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleClearHistory} className="bg-destructive text-destructive-foreground">
                  Clear All
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        )}
      </div>

      {/* Stats Overview */}
      {history.length > 0 && (
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Interviews</p>
                  <p className="text-3xl font-bold">{totalInterviews}</p>
                </div>
                <Target className="h-8 w-8 text-primary opacity-50" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Average Score</p>
                  <p className={cn("text-3xl font-bold", getScoreColor(averageScore))}>{averageScore}%</p>
                </div>
                <BarChart3 className="h-8 w-8 text-primary opacity-50" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Best Score</p>
                  <p className={cn("text-3xl font-bold", getScoreColor(bestScore))}>{bestScore}%</p>
                </div>
                <Trophy className="h-8 w-8 text-primary opacity-50" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Most Practiced</p>
                  <p className="text-xl font-bold truncate">{mostPracticed}</p>
                </div>
                <Clock className="h-8 w-8 text-primary opacity-50" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* History List */}
      {history.length === 0 ? (
        <Card className="py-16">
          <CardContent className="text-center">
            <HistoryIcon className="h-16 w-16 mx-auto text-muted-foreground/50 mb-4" />
            <h3 className="text-xl font-semibold mb-2">No Interview History</h3>
            <p className="text-muted-foreground mb-6">
              Complete your first interview to start tracking your progress.
            </p>
            <Link href="/dashboard">
              <Button className="gap-2">
                Start Practicing
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Recent Interviews</CardTitle>
            <CardDescription>Your last {history.length} interview sessions</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {history.map((item, index) => (
                <div
                  key={item.id}
                  className={cn(
                    "flex items-center justify-between p-4 rounded-lg border hover:bg-muted/50 transition-colors",
                    index === 0 && "border-primary/50 bg-primary/5"
                  )}
                >
                  <div className="flex items-center gap-4">
                    <div
                      className={cn(
                        "h-12 w-12 rounded-full flex items-center justify-center text-lg font-bold",
                        item.overallScore >= 70
                          ? "bg-green-500/10 text-green-600"
                          : item.overallScore >= 50
                            ? "bg-yellow-500/10 text-yellow-600"
                            : "bg-red-500/10 text-red-600"
                      )}
                    >
                      {item.overallScore}%
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-semibold">{item.domainName}</h4>
                        {index === 0 && (
                          <Badge variant="outline" className="text-xs">
                            Latest
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-3 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {new Date(item.completedAt).toLocaleDateString()}
                        </span>
                        <span>
                          {item.questionsAnswered}/{item.totalQuestions} questions
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="hidden md:block w-32">
                      <Progress value={item.overallScore} className="h-2" />
                    </div>
                    <Link href={`/dashboard/results/${item.id}`}>
                      <Button variant="ghost" size="sm" className="gap-2">
                        View Details
                        <ArrowRight className="h-4 w-4" />
                      </Button>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
