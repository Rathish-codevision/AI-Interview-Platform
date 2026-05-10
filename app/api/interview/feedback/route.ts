import { streamText, convertToModelMessages, type UIMessage } from "ai"

export const maxDuration = 60

export async function POST(req: Request) {
  const {
    question,
    answer,
    domain,
    isCode = false,
  }: { question: string; answer: string; domain: string; isCode?: boolean } = await req.json()

  const systemPrompt = `You are an expert technical interviewer evaluating a candidate's answer for a ${domain} interview.

Question: "${question}"
Candidate's Answer: "${answer}"
Answer Type: ${isCode ? "Code" : "Text"}

Evaluate the answer and return a JSON object with this exact structure:
{
  "score": 85,
  "technicalAccuracy": 90,
  "communication": 80,
  "confidence": 85,
  "feedback": "Detailed feedback about the answer",
  "correctAnswer": "The ideal answer or solution",
  "suggestions": ["Suggestion 1", "Suggestion 2", "Suggestion 3"]
}

Scoring Guidelines:
- score: Overall score 0-100
- technicalAccuracy: How technically correct is the answer (0-100)
- communication: How well was the answer communicated (0-100)
- confidence: Estimated confidence level based on answer quality (0-100)
- feedback: 2-3 sentences of constructive feedback
- correctAnswer: A concise but complete ideal answer
- suggestions: 2-4 specific improvement suggestions

Be encouraging but honest. Focus on helping the candidate improve.
Return ONLY valid JSON, no markdown or explanation.`

  const messages: UIMessage[] = [
    {
      id: "1",
      role: "user",
      parts: [{ type: "text", text: "Evaluate my answer now." }],
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
