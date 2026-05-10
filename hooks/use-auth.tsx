"use client"

import { createContext, useContext, useEffect, useState, type ReactNode } from "react"
import type { User } from "@/lib/types"

interface AuthContextType {
  user: User | null
  isLoading: boolean
  isAuthenticated: boolean
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>
  register: (name: string, email: string, password: string) => Promise<{ success: boolean; error?: string }>
  logout: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

// Demo users for the platform
const DEMO_USERS: { email: string; password: string; name: string }[] = [
  { email: "demo@example.com", password: "password123", name: "Demo User" },
]

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Check for existing session
    const storedUser = localStorage.getItem("ai-interview-user")
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser))
      } catch {
        localStorage.removeItem("ai-interview-user")
      }
    }
    setIsLoading(false)
  }, [])

  const login = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 500))

    // Check demo users
    const demoUser = DEMO_USERS.find((u) => u.email === email && u.password === password)
    if (demoUser) {
      const userData: User = {
        id: `user-${Date.now()}`,
        name: demoUser.name,
        email: demoUser.email,
      }
      setUser(userData)
      localStorage.setItem("ai-interview-user", JSON.stringify(userData))
      return { success: true }
    }

    // Check registered users
    const registeredUsers = JSON.parse(localStorage.getItem("ai-interview-registered-users") || "[]")
    const registeredUser = registeredUsers.find(
      (u: { email: string; password: string }) => u.email === email && u.password === password
    )
    if (registeredUser) {
      const userData: User = {
        id: registeredUser.id,
        name: registeredUser.name,
        email: registeredUser.email,
      }
      setUser(userData)
      localStorage.setItem("ai-interview-user", JSON.stringify(userData))
      return { success: true }
    }

    return { success: false, error: "Invalid email or password" }
  }

  const register = async (
    name: string,
    email: string,
    password: string
  ): Promise<{ success: boolean; error?: string }> => {
    await new Promise((resolve) => setTimeout(resolve, 500))

    const registeredUsers = JSON.parse(localStorage.getItem("ai-interview-registered-users") || "[]")
    const existingUser = registeredUsers.find((u: { email: string }) => u.email === email)
    if (existingUser) {
      return { success: false, error: "Email already registered" }
    }

    const newUser = {
      id: `user-${Date.now()}`,
      name,
      email,
      password,
    }
    registeredUsers.push(newUser)
    localStorage.setItem("ai-interview-registered-users", JSON.stringify(registeredUsers))

    const userData: User = {
      id: newUser.id,
      name: newUser.name,
      email: newUser.email,
    }
    setUser(userData)
    localStorage.setItem("ai-interview-user", JSON.stringify(userData))
    return { success: true }
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem("ai-interview-user")
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
