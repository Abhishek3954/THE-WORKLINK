'use client'

import { useState } from 'react'
import { useWorkflow } from '@/lib/workflow-context'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ArrowRight, Eye, EyeOff, Lock, Phone, Home } from 'lucide-react'

export function ConsumerSignIn() {
  const { setCurrentStep, updateWorkerData } = useWorkflow()
  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [errors, setErrors] = useState({ phone: '', password: '' })
  const [isLoading, setIsLoading] = useState(false)
  const [apiError, setApiError] = useState('')

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
      newErrors.password = 'Please enter your password';
      isValid = false
    } else if (password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters'
      isValid = false
    }

    setErrors(newErrors)
    return isValid
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (validateForm()) {
      setIsLoading(true)
      setApiError('')
      
      try {
        const response = await fetch('/api/consumer/auth?action=signin', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ phone, password })
        })

        const data = await response.json()
        
        if (response.ok && data.success) {
          updateWorkerData({ 
            phone: data.data.phone, 
            name: data.data.fullName,
            city: data.data.city,
            profileImage: data.data.profileImage
          })
          setCurrentStep('consumer-dashboard')
        } else {
          setApiError(data.error || 'Invalid credentials')
        }
      } catch (error) {
        setApiError('Something went wrong. Please try again.')
      } finally {
        setIsLoading(false)
      }
    }
  }

  const handleRegister = () => {
    setCurrentStep('consumer-sign-up')
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="px-4 py-6 border-b border-border bg-card">
        <div className="max-w-md mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-purple-600 flex items-center justify-center">
              <span className="text-white font-bold text-lg">C</span>
            </div>
            <span className="font-semibold text-xl text-foreground">WorkLink Consumer</span>
          </div>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => setCurrentStep('selection')}
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground"
          >
            <Home className="w-4 h-4 text-purple-600" />
            <span>Home</span>
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 px-4 py-8 flex items-center justify-center">
        <div className="w-full max-w-md">
          {/* Hero Section */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-3 text-balance">
              Welcome Back
            </h1>
            <p className="text-muted-foreground">
              Sign in to find and hire skilled professionals
            </p>
          </div>

          {/* Sign In Form */}
          <Card>
            <CardHeader>
              <CardTitle>Sign In</CardTitle>
              <CardDescription>
                Enter your phone number and password
              </CardDescription>
              {apiError && (
                <div className="bg-red-50 text-red-600 p-3 rounded-md text-sm mt-2 font-medium">
                  {apiError}
                </div>
              )}
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="phone"
                      type="tel"
                      placeholder="Enter 10-digit phone number"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                      className={`pl-10 ${errors.phone ? 'border-destructive' : ''}`}
                    />
                  </div>
                  {errors.phone && (
                    <p className="text-sm text-destructive">{errors.phone}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Minimum 6 characters"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className={`pl-10 pr-10 ${errors.password ? 'border-destructive' : ''}`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-3 text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                  {errors.password && (
                    <p className="text-sm text-destructive">{errors.password}</p>
                  )}
                </div>

                <Button type="submit" className="w-full bg-purple-600 hover:bg-purple-700 text-white" size="lg" disabled={isLoading}>
                  {isLoading ? 'Signing In...' : 'Sign In'}
                  {!isLoading && <ArrowRight className="w-4 h-4 ml-2" />}
                </Button>
                
                <div className="mt-4 text-center">
                  <p className="text-sm text-muted-foreground">
                    Don't have an account?{' '}
                    <button 
                      type="button" 
                      onClick={handleRegister} 
                      className="text-purple-600 hover:text-purple-700 font-medium hover:underline"
                    >
                      Register here
                    </button>
                  </p>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
