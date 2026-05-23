'use client'

import { useState } from 'react'
import { useWorkflow } from '@/lib/workflow-context'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ArrowRight, Briefcase, Shield, TrendingUp, Home } from 'lucide-react'

export function SignIn() {
  const { updateWorkerData, setCurrentStep } = useWorkflow()
  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')
  const [errors, setErrors] = useState({ phone: '', password: '' })
  const [isLoading, setIsLoading] = useState(false)
  const validateForm = () => {
    const newErrors = { phone: '', password: '' }
    let isValid = true

    if (!phone.trim()) {
      newErrors.phone = 'Please enter your phone number'
      isValid = false
    } else if (!/^[6-9]\d{9}$/.test(phone)) {
      newErrors.phone = 'Please enter a valid 10-digit phone number'
      isValid = false
    }

    if (!password.trim()) {
      newErrors.password = 'Please enter your password'
      isValid = false
    }

    setErrors(newErrors)
    return isValid
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (validateForm()) {
      setIsLoading(true)
      setErrors({ phone: '', password: '' })
      try {
        const response = await fetch('/api/worker/auth', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ phone, password })
        })
        const data = await response.json()

        if (response.ok && data.success && data.data) {
          updateWorkerData({ 
            name: data.data.name, 
            phone: data.data.phone, 
            profileImage: data.data.profileImage,
            gigProfile: data.data.gigProfile,
            workerType: data.data.workerType || 'gig'
          })
          
          if (data.data.workerType === 'worklink') {
            setCurrentStep('worklink-dashboard')
          } else {
            setCurrentStep('dashboard')
          }
        } else {
          setErrors({ phone: '', password: data.error || 'Invalid credentials' })
          if (response.status === 404) {
            setErrors({ phone: 'Account not found. Please sign up.', password: '' })
          } else if (response.status === 401) {
            setErrors({ phone: '', password: 'Incorrect password. Try again.' })
          }
        }
      } catch (error) {
        setErrors({ phone: 'Something went wrong. Please try again.', password: '' })
      } finally {
        setIsLoading(false)
      }
    }
  }

  const handleSignUp = () => {
    setCurrentStep('gig-survey')
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="px-4 py-6 border-b border-border bg-card sticky top-0 z-50">
        <div className="max-w-md mx-auto flex items-center justify-between">
          <div 
            className="flex items-center gap-3 cursor-pointer select-none hover:opacity-90 transition-opacity"
            onClick={() => setCurrentStep('selection')}
          >
            <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-lg">W</span>
            </div>
            <span className="font-semibold text-xl text-foreground">WorkLink</span>
          </div>
          <Button 
            variant="ghost" 
            size="sm" 
            className="flex items-center gap-2 hover:bg-muted"
            onClick={() => setCurrentStep('selection')}
          >
            <Home className="w-4 h-4" />
            <span className="hidden sm:inline">Back to Home</span>
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 px-4 py-8">
        <div className="max-w-md mx-auto">
          {/* Hero Section */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-3 text-balance">
              Join WorkLink as a Skilled Worker
            </h1>
            <p className="text-muted-foreground">
              Register to find work opportunities that match your skills
            </p>
          </div>

          {/* Benefits */}
          <div className="grid grid-cols-3 gap-4 mb-8">
            <div className="flex flex-col items-center text-center p-4 rounded-xl bg-card border border-border">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center mb-2">
                <Briefcase className="w-5 h-5 text-primary" />
              </div>
              <span className="text-xs font-medium text-foreground">Regular Work</span>
            </div>
            <div className="flex flex-col items-center text-center p-4 rounded-xl bg-card border border-border">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center mb-2">
                <TrendingUp className="w-5 h-5 text-primary" />
              </div>
              <span className="text-xs font-medium text-foreground">Good Earnings</span>
            </div>
            <div className="flex flex-col items-center text-center p-4 rounded-xl bg-card border border-border">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center mb-2">
                <Shield className="w-5 h-5 text-primary" />
              </div>
              <span className="text-xs font-medium text-foreground">Secure Pay</span>
            </div>
          </div>

          {/* Sign In Form */}
          <Card>
            <CardHeader>
              <CardTitle>Sign In to Your Account</CardTitle>
              <CardDescription>
                Enter your details to access your account
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="Enter 10-digit phone number"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                    className={errors.phone ? 'border-destructive' : ''}
                  />
                  {errors.phone && (
                    <p className="text-sm text-destructive">{errors.phone}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className={errors.password ? 'border-destructive' : ''}
                  />
                  {errors.password && (
                    <p className="text-sm text-destructive">{errors.password}</p>
                  )}
                </div>

                  <Button type="submit" className="w-full" size="lg" disabled={isLoading}>
                  {isLoading ? 'Signing In...' : 'Sign In'}
                  {!isLoading && <ArrowRight className="w-4 h-4 ml-2" />}
                </Button>
                <p className="text-center text-sm text-muted-foreground">
                  New user? <button onClick={handleSignUp} className="text-primary hover:underline">Sign up now</button>
                </p>
              </form>
            </CardContent>
          </Card>

          <p className="text-center text-xs text-muted-foreground mt-6">
            By continuing, you agree to our Terms of Service and Privacy Policy
          </p>
        </div>
      </main>
    </div>
  )
}
