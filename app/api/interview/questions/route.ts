import { streamText, convertToModelMessages, type UIMessage } from "ai"

export const maxDuration = 60

const DOMAIN_PROMPTS: Record<string, string> = {
  javascript: "JavaScript programming including ES6+, closures, promises, async/await, and DOM manipulation",
  react: "React.js including hooks, components, state management, context API, and best practices",
  nodejs: "Node.js backend development including Express, APIs, middleware, and server-side concepts",
  python: "Python programming including data structures, OOP, decorators, and common libraries",
  java: "Java programming including OOP, JVM, collections, multithreading, and design patterns",
  "system-design": "System design including scalability, databases, caching, load balancing, and microservices",
  dsa: "Data structures and algorithms including arrays, trees, graphs, sorting, and problem-solving",
  sql: "SQL and databases including queries, joins, indexing, normalization, and optimization",
}

export async function POST(req: Request) {
  const { domain, level = "fresher", resumeContext = "" }: { domain: string; level?: string; resumeContext?: string } =
    await req.json()

  const domainDescription = DOMAIN_PROMPTS[domain] || domain

  const systemPrompt = `You are an expert technical interviewer. Generate exactly 5 interview questions for a ${level} level candidate about ${domainDescription}.

${resumeContext ? `Consider the candidate's resume context: ${resumeContext}` : ""}

Return your response as a JSON array with this exact structure:
[
  {
    "id": "q1",
    "question": "Your question here",
    "type": "text",
    "difficulty": "easy"
  },
  {
    "id": "q2",
    "question": "Your question here",
    "type": "code",
    "language": "javascript",
    "difficulty": "medium"
  }
]

Rules:
- Generate exactly 5 questions
- Mix difficulties: 2 easy, 2 medium, 1 hard
- For coding questions, set type to "code" and include appropriate language
- For conceptual questions, set type to "text"
- Make questions progressively challenging
- Questions should be practical and test real understanding
- Return ONLY valid JSON, no markdown or explanation`

  const messages: UIMessage[] = [
    {
      id: "1",
      role: "user",
      parts: [{ type: "text", text: "Generate the interview questions now." }],
    },
  ]

  const result = streamText({
    model: "openai/gpt-4o-mini",
    system: systemPrompt,
    messages: await convertToModelMessages(messages),
    abortSignal: req.signal,
  })

  return result.toUIMessageStreamResponse()
}
