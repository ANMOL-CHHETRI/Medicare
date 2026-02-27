"use client"

import { useState } from "react"
import { useAuth } from "@/lib/context/auth"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

// roles removed – role is determined by server

export function LoginForm() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const { login, isLoading } = useAuth()
  const [errors, setErrors] = useState({ email: "", password: "", form: "" })

  const handleSubmit = async (e) => {
    e.preventDefault()
    const nextErrors = { email: "", password: "", form: "" }
    const emailOk = /.+@.+\..+/.test(email)
    if (!emailOk) nextErrors.email = "Enter a valid email address"
    if (password.length < 6) nextErrors.password = "Password must be at least 6 characters"
    setErrors(nextErrors)
    if (nextErrors.email || nextErrors.password) return
    try {
      await login(email, password)
    } catch (err) {
      setErrors((prev) => ({ ...prev, form: err?.message || "Login failed" }))
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-2">
          <CardTitle className="text-2xl">Patient Management</CardTitle>
          <CardDescription>Sign in to your account to continue</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value)
                  if (errors.email) setErrors((prev) => ({ ...prev, email: "" }))
                }}
                required
              />
              {errors.email ? <p className="text-xs text-red-600">{errors.email}</p> : null}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Enter password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value)
                  if (errors.password) setErrors((prev) => ({ ...prev, password: "" }))
                }}
                required
              />
              {errors.password ? <p className="text-xs text-red-600">{errors.password}</p> : null}
            </div>

            {errors.form ? <p className="text-sm text-red-600">{errors.form}</p> : null}

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Signing in..." : "Sign In"}
            </Button>
          </form>

          <div className="mt-6 p-3 bg-muted rounded-lg text-sm text-muted-foreground">
            <p className="font-medium mb-1">Demo Credentials:</p>
            <p>Email: demo@hospital.com</p>
            <p>Password: demo123</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
