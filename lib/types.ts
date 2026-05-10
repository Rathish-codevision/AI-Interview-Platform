export interface User {
  id: string
  name: string
  email: string
}

export interface InterviewDomain {
  id: string
  name: string
  description: string
  icon: string
  questionCount: number
}

export interface InterviewQuestion {
  id: string
  question: string
  type: "text" | "code"
  language?: string
  difficulty: "easy" | "medium" | "hard"
}

export interface Answer {
  questionId: string
  answer: string
  isCode: boolean
  timeTaken: number
}

export interface QuestionFeedback {
  questionId: string
  score: number
  technicalAccuracy: number
  communication: number
  confidence: number
  feedback: string
  correctAnswer: string
  suggestions: string[]
}

export interface InterviewSession {
  id: string
  domain: string
  domainName: string
  questions: InterviewQuestion[]
  answers: Answer[]
  feedback: QuestionFeedback[]
  overallScore: number
  startedAt: string
  completedAt?: string
  status: "in-progress" | "completed"
}

export interface InterviewHistory {
  id: string
  domain: string
  domainName: string
  overallScore: number
  questionsAnswered: number
  totalQuestions: number
  completedAt: string
}
