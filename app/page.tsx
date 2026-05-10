"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { useAuth } from "@/hooks/use-auth"
import {
  Brain,
  Mic,
  MessageSquare,
  BarChart3,
  FileText,
  Code,
  CheckCircle,
  ArrowRight,
  Sparkles,
} from "lucide-react"

export default function LandingPage() {
  const { isAuthenticated, isLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      router.push("/dashboard")
    }
  }, [isAuthenticated, isLoading, router])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-pulse text-muted-foreground">Loading...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Brain className="h-8 w-8 text-primary" />
            <span className="text-xl font-bold">AI Interview Prep</span>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/login">
              <Button variant="ghost">Sign In</Button>
            </Link>
            <Link href="/register">
              <Button>Get Started</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 md:py-32">
        <div className="container mx-auto px-4 text-center">
          <div className="inline-flex items-center gap-2 rounded-full bg-muted px-4 py-2 text-sm mb-6">
            <Sparkles className="h-4 w-4 text-primary" />
            <span>AI-Powered Interview Practice</span>
          </div>
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-6 text-balance">
            Master Your Technical
            <br />
            <span className="text-primary">Interviews with AI</span>
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-8 text-pretty">
            Practice with AI interviewers, get instant feedback, and track your progress. Prepare for JavaScript, React,
            Python, System Design, and more.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/register">
              <Button size="lg" className="gap-2">
                Start Practicing Free
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link href="/login">
              <Button size="lg" variant="outline">
                Sign In
              </Button>
            </Link>
          </div>
          <p className="text-sm text-muted-foreground mt-4">
            Demo credentials: demo@example.com / password123
          </p>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-4">Everything You Need to Ace Your Interview</h2>
          <p className="text-muted-foreground text-center mb-12 max-w-2xl mx-auto">
            Our AI-powered platform provides comprehensive interview preparation tools to help you land your dream job.
          </p>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <FeatureCard
              icon={<Brain className="h-6 w-6" />}
              title="AI Question Generation"
              description="Get personalized interview questions based on your chosen domain and experience level."
            />
            <FeatureCard
              icon={<MessageSquare className="h-6 w-6" />}
              title="Real-time Feedback"
              description="Receive instant AI-powered feedback on your answers with detailed scores and suggestions."
            />
            <FeatureCard
              icon={<Mic className="h-6 w-6" />}
              title="Voice Input"
              description="Practice answering questions verbally with our speech-to-text technology."
            />
            <FeatureCard
              icon={<Code className="h-6 w-6" />}
              title="Coding Challenges"
              description="Write and test code directly in the browser with our integrated code editor."
            />
            <FeatureCard
              icon={<FileText className="h-6 w-6" />}
              title="Resume Analysis"
              description="Upload your resume and get questions tailored to your experience and skills."
            />
            <FeatureCard
              icon={<BarChart3 className="h-6 w-6" />}
              title="Progress Tracking"
              description="Track your performance over time and identify areas for improvement."
            />
          </div>
        </div>
      </section>

      {/* Domains Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-4">Practice Multiple Domains</h2>
          <p className="text-muted-foreground text-center mb-12 max-w-2xl mx-auto">
            Choose from a variety of technical domains to practice your interview skills.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            {[
              "JavaScript",
              "React",
              "Node.js",
              "Python",
              "Java",
              "System Design",
              "Data Structures",
              "SQL",
            ].map((domain) => (
              <div
                key={domain}
                className="px-6 py-3 rounded-full bg-muted text-foreground font-medium hover:bg-primary hover:text-primary-foreground transition-colors cursor-default"
              >
                {domain}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">How It Works</h2>
          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <StepCard
              step={1}
              title="Choose Your Domain"
              description="Select from JavaScript, React, Python, System Design, and more."
            />
            <StepCard
              step={2}
              title="Answer Questions"
              description="Respond to AI-generated questions via text or voice input."
            />
            <StepCard
              step={3}
              title="Get Feedback"
              description="Receive detailed scores, suggestions, and correct answers."
            />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Ace Your Next Interview?</h2>
          <p className="text-muted-foreground mb-8 max-w-xl mx-auto">
            Join thousands of developers who have improved their interview skills with our AI-powered platform.
          </p>
          <Link href="/register">
            <Button size="lg" className="gap-2">
              Start Practicing Now
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-8">
        <div className="container mx-auto px-4 text-center text-muted-foreground">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Brain className="h-5 w-5" />
            <span className="font-semibold text-foreground">AI Interview Prep</span>
          </div>
          <p className="text-sm">Built with AI SDK and Next.js</p>
        </div>
      </footer>
    </div>
  )
}

function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode
  title: string
  description: string
}) {
  return (
    <Card className="border-border">
      <CardContent className="pt-6">
        <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center text-primary mb-4">
          {icon}
        </div>
        <h3 className="font-semibold text-lg mb-2">{title}</h3>
        <p className="text-muted-foreground">{description}</p>
      </CardContent>
    </Card>
  )
}

function StepCard({
  step,
  title,
  description,
}: {
  step: number
  title: string
  description: string
}) {
  return (
    <div className="text-center">
      <div className="h-12 w-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xl font-bold mx-auto mb-4">
        {step}
      </div>
      <h3 className="font-semibold text-lg mb-2">{title}</h3>
      <p className="text-muted-foreground">{description}</p>
    </div>
  )
}
