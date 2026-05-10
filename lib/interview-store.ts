import type { InterviewSession, InterviewHistory, InterviewDomain } from "./types"

const SESSIONS_KEY = "ai-interview-sessions"
const HISTORY_KEY = "ai-interview-history"

export const INTERVIEW_DOMAINS: InterviewDomain[] = [
  {
    id: "javascript",
    name: "JavaScript",
    description: "Core JavaScript concepts, ES6+, async programming, and more",
    icon: "js",
    questionCount: 5,
  },
  {
    id: "react",
    name: "React",
    description: "React hooks, components, state management, and best practices",
    icon: "react",
    questionCount: 5,
  },
  {
    id: "nodejs",
    name: "Node.js",
    description: "Server-side JavaScript, Express, APIs, and backend development",
    icon: "nodejs",
    questionCount: 5,
  },
  {
    id: "python",
    name: "Python",
    description: "Python fundamentals, data structures, and common libraries",
    icon: "python",
    questionCount: 5,
  },
  {
    id: "java",
    name: "Java",
    description: "Object-oriented programming, JVM, and Java ecosystem",
    icon: "java",
    questionCount: 5,
  },
  {
    id: "system-design",
    name: "System Design",
    description: "Architecture, scalability, databases, and distributed systems",
    icon: "system",
    questionCount: 5,
  },
  {
    id: "dsa",
    name: "Data Structures & Algorithms",
    description: "Arrays, trees, graphs, sorting, and problem-solving",
    icon: "dsa",
    questionCount: 5,
  },
  {
    id: "sql",
    name: "SQL & Databases",
    description: "SQL queries, database design, indexing, and optimization",
    icon: "sql",
    questionCount: 5,
  },
]

export function getInterviewDomain(id: string): InterviewDomain | undefined {
  return INTERVIEW_DOMAINS.find((d) => d.id === id)
}

export function saveSession(session: InterviewSession): void {
  if (typeof window === "undefined") return
  const sessions = getSessions()
  const existingIndex = sessions.findIndex((s) => s.id === session.id)
  if (existingIndex >= 0) {
    sessions[existingIndex] = session
  } else {
    sessions.push(session)
  }
  localStorage.setItem(SESSIONS_KEY, JSON.stringify(sessions))
}

export function getSessions(): InterviewSession[] {
  if (typeof window === "undefined") return []
  const data = localStorage.getItem(SESSIONS_KEY)
  return data ? JSON.parse(data) : []
}

export function getSession(id: string): InterviewSession | undefined {
  return getSessions().find((s) => s.id === id)
}

export function deleteSession(id: string): void {
  if (typeof window === "undefined") return
  const sessions = getSessions().filter((s) => s.id !== id)
  localStorage.setItem(SESSIONS_KEY, JSON.stringify(sessions))
}

export function getHistory(): InterviewHistory[] {
  if (typeof window === "undefined") return []
  const data = localStorage.getItem(HISTORY_KEY)
  return data ? JSON.parse(data) : []
}

export function addToHistory(session: InterviewSession): void {
  if (typeof window === "undefined") return
  const history = getHistory()
  const historyItem: InterviewHistory = {
    id: session.id,
    domain: session.domain,
    domainName: session.domainName,
    overallScore: session.overallScore,
    questionsAnswered: session.answers.length,
    totalQuestions: session.questions.length,
    completedAt: session.completedAt || new Date().toISOString(),
  }
  history.unshift(historyItem)
  localStorage.setItem(HISTORY_KEY, JSON.stringify(history.slice(0, 50))) // Keep last 50
}

export function clearHistory(): void {
  if (typeof window === "undefined") return
  localStorage.removeItem(HISTORY_KEY)
}
