"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useAuth } from "@/hooks/use-auth"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { INTERVIEW_DOMAINS, getHistory, getSessions } from "@/lib/interview-store"
import type { InterviewHistory, InterviewSession } from "@/lib/types"
import {
  ArrowRight,
  Brain,
  Code,
  Database,
  FileCode,
  Layers,
  Server,
  Trophy,
  Zap,
  Clock,
  Target,
} from "lucide-react"

const domainIcons: Record<string, React.ReactNode> = {
  javascript: <FileCode className="h-6 w-6" />,
  react: <Layers className="h-6 w-6" />,
  nodejs: <Server className="h-6 w-6" />,
  python: <Code className="h-6 w-6" />,
  java: <FileCode className="h-6 w-6" />,
  "system-design": <Layers className="h-6 w-6" />,
  dsa: <Brain className="h-6 w-6" />,
  sql: <Database className="h-6 w-6" />,
}

export default function DashboardPage() {
  const { user } = useAuth()
  const [history, setHistory] = useState<InterviewHistory[]>([])
  const [inProgressSessions, setInProgressSessions] = useState<InterviewSession[]>([])

  useEffect(() => {
    setHistory(getHistory())
    const sessions = getSessions().filter((s) => s.status === "in-progress")
    setInProgressSessions(sessions)
  }, [])

  const completedInterviews = history.length
  const averageScore =
    history.length > 0 ? Math.round(history.reduce((acc, h) => acc + h.overallScore, 0) / history.length) : 0

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold">Welcome back, {user?.name?.split(" ")[0] || "User"}!</h1>
        <p className="text-muted-foreground">Choose a domain to start practicing your interview skills.</p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Completed Interviews</p>
                <p className="text-3xl font-bold">{completedInterviews}</p>
              </div>
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                <Target className="h-6 w-6 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Average Score</p>
                <p className="text-3xl font-bold">{averageScore}%</p>
              </div>
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                <Trophy className="h-6 w-6 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">In Progress</p>
                <p className="text-3xl font-bold">{inProgressSessions.length}</p>
              </div>
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                <Clock className="h-6 w-6 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* In Progress Sessions */}
      {inProgressSessions.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Continue Interview</h2>
          <div className="grid gap-4 md:grid-cols-2">
            {inProgressSessions.map((session) => (
              <Card key={session.id} className="border-primary/50">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                        {domainIcons[session.domain] || <Code className="h-5 w-5" />}
                      </div>
                      <div>
                        <h3 className="font-semibold">{session.domainName}</h3>
                        <p className="text-sm text-muted-foreground">
                          {session.answers.length} of {session.questions.length} answered
                        </p>
                      </div>
                    </div>
                    <Link href={`/dashboard/interview/${session.id}`}>
                      <Button size="sm" className="gap-2">
                        Continue
                        <ArrowRight className="h-4 w-4" />
                      </Button>
                    </Link>
                  </div>
                  <Progress
                    value={(session.answers.length / session.questions.length) * 100}
                    className="mt-4 h-2"
                  />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Interview Domains */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">Start New Interview</h2>
          <Badge variant="secondary" className="gap-1">
            <Zap className="h-3 w-3" />
            AI-Powered
          </Badge>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {INTERVIEW_DOMAINS.map((domain) => (
            <Link key={domain.id} href={`/dashboard/interview/new?domain=${domain.id}`}>
              <Card className="h-full hover:border-primary/50 hover:shadow-md transition-all cursor-pointer group">
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                      {domainIcons[domain.id] || <Code className="h-5 w-5" />}
                    </div>
                    <div>
                      <CardTitle className="text-base">{domain.name}</CardTitle>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <CardDescription className="line-clamp-2">{domain.description}</CardDescription>
                  <div className="mt-3 flex items-center justify-between">
                    <Badge variant="outline" className="text-xs">
                      {domain.questionCount} questions
                    </Badge>
                    <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>

      {/* Recent History Preview */}
      {history.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Recent Activity</h2>
            <Link href="/dashboard/history">
              <Button variant="ghost" size="sm" className="gap-2">
                View All
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            {history.slice(0, 3).map((item) => (
              <Card key={item.id}>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-medium">{item.domainName}</h3>
                    <Badge variant={item.overallScore >= 70 ? "default" : "secondary"}>
                      {item.overallScore}%
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {item.questionsAnswered} of {item.totalQuestions} questions
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {new Date(item.completedAt).toLocaleDateString()}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
