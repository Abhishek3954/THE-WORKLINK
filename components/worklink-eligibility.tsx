'use client'

import { useEffect, useState } from 'react'
import { useWorkflow } from '@/lib/workflow-context'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { CheckCircle, XCircle, AlertCircle, ArrowRight, ArrowLeft } from 'lucide-react'
import { cn } from '@/lib/utils'

interface EligibilityCriteria {
  label: string
  passed: boolean
  reason: string
}

export function WorkLinkEligibility() {
  const { workerData, updateWorkerData, setCurrentStep } = useWorkflow()
  const [checking, setChecking] = useState(true)
  const [criteria, setCriteria] = useState<EligibilityCriteria[]>([])

  useEffect(() => {
    // Simulate eligibility check
    const timer = setTimeout(() => {
      const profile = workerData.gigProfile
      
      const eligibilityCriteria: EligibilityCriteria[] = [
        {
          label: 'Experience Level',
          passed: ['3 – 5 years', '5 – 10 years', '10+ years'].includes(profile.yearsOfExperience!),
          reason: ['3 – 5 years', '5 – 10 years', '10+ years'].includes(profile.yearsOfExperience!)
            ? 'Candidate has 3+ years experience' 
            : 'At least 3 years experience required',
        },
        {
          label: 'Jobs Completed',
          passed: ['50 – 200', '200+'].includes(profile.jobsCompleted!),
          reason: ['50 – 200', '200+'].includes(profile.jobsCompleted!)
            ? 'High volume of jobs completed'
            : 'Requires 50+ completed jobs',
        },
        {
          label: 'Tool Availability',
          passed: ['Most required tools', 'Complete professional tools'].includes(profile.toolsAvailability!),
          reason: ['Most required tools', 'Complete professional tools'].includes(profile.toolsAvailability!)
            ? 'Equipped with professional tools'
            : 'Requires most or all professional tools',
        },
        {
          label: 'Job Commitment',
          passed: profile.jobCommitment === 'Always',
          reason: profile.jobCommitment === 'Always'
            ? 'Full commitment to accepted jobs'
            : 'Must commit to completing all jobs',
        },
        {
          label: 'Cancellation Behavior',
          passed: profile.cancellationBehavior === 'Never',
          reason: profile.cancellationBehavior === 'Never'
            ? 'Reliable cancellation history'
            : 'Never cancels accepted jobs',
        },
      ]

      setCriteria(eligibilityCriteria)
      
      const passedCount = eligibilityCriteria.filter(c => c.passed).length
      const score = Math.round((passedCount / eligibilityCriteria.length) * 100)
      const isEligible = passedCount === 5

      updateWorkerData({
        isEligibleForWorkLink: isEligible,
        workLinkEligibilityScore: score,
      })

      setChecking(false)
    }, 2000)

    return () => clearTimeout(timer)
  }, [workerData.gigProfile, updateWorkerData])

  const handleContinue = () => {
    if (workerData.isEligibleForWorkLink) {
      setCurrentStep('worklink-survey')
    } else {
      setCurrentStep('dashboard')
    }
  }

  const handleBack = () => {
    setCurrentStep('dashboard')
  }

  const passedCount = criteria.filter(c => c.passed).length

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="px-4 py-6 border-b border-border bg-card">
        <div className="max-w-md mx-auto flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center">
            <span className="text-primary-foreground font-bold text-lg">W</span>
          </div>
          <span className="font-semibold text-xl text-foreground">WorkLink</span>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 px-4 py-8">
        <div className="max-w-md mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-foreground mb-2">
              Eligibility Check
            </h1>
            <p className="text-muted-foreground">
              Checking if you qualify for WorkLink Employee status
            </p>
          </div>

          {checking ? (
            <Card>
              <CardContent className="py-12">
                <div className="flex flex-col items-center">
                  <div className="w-16 h-16 rounded-full border-4 border-primary border-t-transparent animate-spin mb-4" />
                  <p className="text-muted-foreground">Checking your profile...</p>
                </div>
              </CardContent>
            </Card>
          ) : (
            <>
              {/* Result Card */}
              <Card className={cn(
                "mb-6 border-2",
                workerData.isEligibleForWorkLink ? "border-success bg-success/5" : "border-warning bg-warning/5"
              )}>
                <CardHeader className="text-center pb-2">
                  {workerData.isEligibleForWorkLink ? (
                    <>
                      <div className="w-16 h-16 rounded-full bg-success/10 flex items-center justify-center mx-auto mb-2">
                        <CheckCircle className="w-8 h-8 text-success" />
                      </div>
                      <CardTitle className="text-success">You are Eligible!</CardTitle>
                      <CardDescription>
                        You meet the requirements to become a WorkLink Employee
                      </CardDescription>
                    </>
                  ) : (
                    <>
                      <div className="w-16 h-16 rounded-full bg-warning/10 flex items-center justify-center mx-auto mb-2">
                        <AlertCircle className="w-8 h-8 text-warning" />
                      </div>
                      <CardTitle className="text-warning-foreground">Not Eligible Yet</CardTitle>
                      <CardDescription>
                        You can continue as a Gig Worker and apply later
                      </CardDescription>
                    </>
                  )}
                </CardHeader>
                <CardContent>
                  <div className="text-center">
                    <span className="text-3xl font-bold text-foreground">{passedCount}</span>
                    <span className="text-muted-foreground">/{criteria.length} criteria met</span>
                  </div>
                </CardContent>
              </Card>

              {/* Criteria List */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Eligibility Criteria</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {criteria.map((item, index) => (
                    <div
                      key={index}
                      className={cn(
                        "flex items-start gap-3 p-3 rounded-lg",
                        item.passed ? "bg-success/10" : "bg-destructive/10"
                      )}
                    >
                      {item.passed ? (
                        <CheckCircle className="w-5 h-5 text-success shrink-0 mt-0.5" />
                      ) : (
                        <XCircle className="w-5 h-5 text-destructive shrink-0 mt-0.5" />
                      )}
                      <div>
                        <p className="font-medium text-sm text-foreground">{item.label}</p>
                        <p className="text-xs text-muted-foreground">{item.reason}</p>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </>
          )}
        </div>
      </main>

      {/* Footer */}
      {!checking && (
        <footer className="sticky bottom-0 bg-card border-t border-border px-4 py-4">
          <div className="max-w-md mx-auto flex gap-4">
            {workerData.isEligibleForWorkLink ? (
              <>
                <Button variant="outline" onClick={handleBack} className="flex-1">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back
                </Button>
                <Button onClick={handleContinue} className="flex-1">
                  Continue
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </>
            ) : (
              <>
                <Button variant="outline" onClick={handleContinue} className="flex-1">
                  Gig Dashboard
                </Button>
                <Button onClick={() => setCurrentStep('worklink-survey')} className="flex-1 bg-violet-600 hover:bg-violet-700">
                  Demo Employee
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </>
            )}
          </div>
        </footer>
      )}
    </div>
  )
}
