"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Mic, MicOff, Square } from "lucide-react"
import { cn } from "@/lib/utils"

interface VoiceRecorderProps {
  onTranscript: (text: string) => void
  disabled?: boolean
  className?: string
}

export function VoiceRecorder({ onTranscript, disabled, className }: VoiceRecorderProps) {
  const [isRecording, setIsRecording] = useState(false)
  const [isSupported, setIsSupported] = useState(false)
  const [transcript, setTranscript] = useState("")
  const recognitionRef = useRef<SpeechRecognition | null>(null)

  useEffect(() => {
    // Check for browser support
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    if (SpeechRecognition) {
      setIsSupported(true)
    }
  }, [])

  const startRecording = useCallback(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    if (!SpeechRecognition) return

    const recognition = new SpeechRecognition()
    recognition.continuous = true
    recognition.interimResults = true
    recognition.lang = "en-US"

    let finalTranscript = ""

    recognition.onresult = (event) => {
      let interimTranscript = ""
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript
        if (event.results[i].isFinal) {
          finalTranscript += transcript + " "
        } else {
          interimTranscript += transcript
        }
      }
      setTranscript(finalTranscript + interimTranscript)
    }

    recognition.onerror = (event) => {
      console.error("Speech recognition error:", event.error)
      setIsRecording(false)
    }

    recognition.onend = () => {
      setIsRecording(false)
      if (finalTranscript.trim()) {
        onTranscript(finalTranscript.trim())
      }
    }

    recognitionRef.current = recognition
    recognition.start()
    setIsRecording(true)
    setTranscript("")
  }, [onTranscript])

  const stopRecording = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.stop()
      recognitionRef.current = null
    }
    setIsRecording(false)
    if (transcript.trim()) {
      onTranscript(transcript.trim())
    }
  }, [transcript, onTranscript])

  if (!isSupported) {
    return (
      <Button variant="outline" size="sm" disabled className={cn("gap-2", className)}>
        <MicOff className="h-4 w-4" />
        <span className="hidden sm:inline">Voice not supported</span>
      </Button>
    )
  }

  return (
    <div className={cn("flex items-center gap-2", className)}>
      {isRecording ? (
        <Button variant="destructive" size="sm" onClick={stopRecording} disabled={disabled} className="gap-2">
          <Square className="h-3 w-3 fill-current" />
          Stop Recording
        </Button>
      ) : (
        <Button variant="outline" size="sm" onClick={startRecording} disabled={disabled} className="gap-2">
          <Mic className="h-4 w-4" />
          <span className="hidden sm:inline">Voice Input</span>
        </Button>
      )}
      {isRecording && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
          </span>
          <span className="hidden sm:inline">Recording...</span>
        </div>
      )}
    </div>
  )
}

// Add type declarations for Web Speech API
declare global {
  interface Window {
    SpeechRecognition: typeof SpeechRecognition
    webkitSpeechRecognition: typeof SpeechRecognition
  }
}
