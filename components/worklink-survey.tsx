'use client'

import { useState } from 'react'
import { useWorkflow } from '@/lib/workflow-context'
import { SurveyLayout } from './survey-layout'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { WorkLinkEmployeeProfile } from '@/lib/types'
import { AlertCircle } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from './ui/button'

const TOTAL_STEPS = 9

const INTENT_OPTIONS = [
  { value: 'stable', label: 'I want stable and regular work' },
  { value: 'earning', label: 'I want higher earning opportunities' },
  { value: 'growth', label: 'I want to grow professionally' },
  { value: 'exploring', label: 'Just exploring', warning: true },
]

const EXPERIENCE_LEVEL_OPTIONS = [
  { value: 'less-1', label: 'Less than 1 year', warning: true },
  { value: '1-3', label: '1 – 3 years' },
  { value: '3-5', label: '3 – 5 years' },
  { value: '5+', label: '5+ years' },
]

const JOB_VOLUME_OPTIONS = [
  { value: 'less-20', label: 'Less than 20', warning: true },
  { value: '20-100', label: '20 – 100' },
  { value: '100-300', label: '100 – 300' },
  { value: '300+', label: '300+' },
]

const WORK_TYPE_HISTORY_OPTIONS = [
  { value: 'basic', label: 'Small basic jobs' },
  { value: 'mixed', label: 'Mixed work' },
  { value: 'complex', label: 'Complex / professional jobs' },
]

const SPECIALIZATION_OPTIONS = [
  { value: 'general', label: 'General work' },
  { value: 'skilled', label: 'Skilled work' },
  { value: 'advanced', label: 'Advanced / expert work' },
]

const PROBLEM_HANDLING_OPTIONS = [
  { value: 'independent', label: 'Yes, independently' },
  { value: 'with-help', label: 'Yes, with some help' },
  { value: 'no', label: 'No' },
]

const TOOLS_OWNERSHIP_OPTIONS = [
  { value: 'basic', label: 'Basic tools' },
  { value: 'most', label: 'Most required tools' },
  { value: 'complete', label: 'Complete professional setup' },
]

const WORK_SETUP_OPTIONS = [
  { value: 'alone', label: 'Alone' },
  { value: 'helper', label: 'With helper' },
  { value: 'team', label: 'Small team' },
]

const COMMITMENT_OPTIONS = [
  { value: 'always', label: 'Yes, always' },
  { value: 'mostly', label: 'Mostly' },
  { value: 'depends', label: 'Depends', warning: true },
]

const TIMELINESS_OPTIONS = [
  { value: 'always', label: 'Always' },
  { value: 'mostly', label: 'Mostly' },
  { value: 'sometimes', label: 'Sometimes' },
]

const CANCELLATION_OPTIONS = [
  { value: 'never', label: 'Never' },
  { value: 'rarely', label: 'Rarely' },
  { value: 'sometimes', label: 'Sometimes', warning: true },
]

const YES_NO_OPTIONS = [
  { value: 'yes', label: 'Yes' },
  { value: 'no', label: 'No', warning: true },
]

const WORK_MODE_OPTIONS = [
  { value: 'full-time', label: 'Full-time' },
  { value: 'part-time', label: 'Part-time' },
]

const DAILY_AVAILABILITY_OPTIONS = [
  { value: '2-4', label: '2–4 hours' },
  { value: '4-8', label: '4–8 hours' },
  { value: '8+', label: '8+ hours' },
]

export function WorkLinkSurvey() {
  const { workerData, updateWorkerData, setCurrentStep } = useWorkflow()
  const [step, setStep] = useState(1)
  const [profile, setProfile] = useState<Partial<WorkLinkEmployeeProfile>>(workerData.workLinkProfile)
  const [hasRejection, setHasRejection] = useState(false)

  // dev only
  const autoFillWorkLink = (rank: 1 | 2 | 3 | 4 | 5) => {
    const mockProfile: WorkLinkEmployeeProfile = {
      intent: rank === 5 ? 'exploring' : 'stable',
      experienceLevel: rank === 5 ? 'less-1' : '5+',
      jobVolume: rank === 5 ? 'less-20' : '300+',
      workTypeHistory: 'complex',
      specialization: 'skilled',
      problemHandling: 'independent',
      toolsOwnership: 'complete',
      workSetup: 'alone',
      commitment: 'always',
      timeliness: 'always',
      cancellation: 'never',
      autoAssignment: 'yes',
      paymentStructure: 'yes',
      codeOfConduct: 'yes',
      idBackgroundCheck: 'yes',
      skillAssessment: 'yes',
      openToTraining: 'yes',
      workMode: 'full-time',
      dailyAvailability: '8+',
      hasPortfolio: 'yes',
      hasReference: 'yes',
    };

    if (rank === 5) {
      setProfile(mockProfile);
      setHasRejection(true);
      return;
    }

    const scores = [100, 80, 60, 40];
    const ranks = ['platinum', 'gold', 'silver', 'bronze'] as const;
    const score = scores[rank - 1];
    const rankName = ranks[rank - 1];

    updateWorkerData({
      workLinkProfile: mockProfile,
      workerType: 'worklink',
      skillAssessmentScore: score,
      workerRank: rankName,
      isEligibleForWorkLink: true
    });

    // Also update server
    fetch('/api/worklink/profile', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        phone: workerData.phone, 
        ...mockProfile,
        skillAssessmentScore: score,
        workerRank: rankName,
        rank: rank, // Numeric rank for dashboard legacy support
        workerType: 'worklink',
        isEligibleForWorkLink: true
      })
    });

    setCurrentStep('worklink-dashboard');
  }

  const updateProfile = (updates: Partial<WorkLinkEmployeeProfile>) => {
    setProfile(prev => ({ ...prev, ...updates }))
  }

  const handleNext = () => {
    // Check for rejection criteria
    if (step === 1 && profile.intent === 'exploring') {
      setHasRejection(true)
      return
    }
    if (step === 2 && (profile.experienceLevel === 'less-1' || profile.jobVolume === 'less-20')) {
      setHasRejection(true)
      return
    }
    if (step === 5 && (profile.commitment === 'depends' || profile.cancellation === 'sometimes')) {
      setHasRejection(true)
      return
    }
    if (step === 6 && (profile.autoAssignment === 'no' || profile.paymentStructure === 'no' || profile.codeOfConduct === 'no')) {
      setHasRejection(true)
      return
    }
    if (step === 7 && (profile.idBackgroundCheck === 'no' || profile.skillAssessment === 'no' || profile.openToTraining === 'no')) {
      setHasRejection(true)
      return
    }

    if (step < TOTAL_STEPS) {
      setStep(step + 1)
    } else {
      const submitData = async () => {
        try {
          // 1. Save WorkLink Profile Data
          await fetch('/api/worklink/profile', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ phone: workerData.phone, ...profile })
          })

          // 2. Migrate Role to WorkLink
          await fetch('/api/worker/role', {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ phone: workerData.phone, workerType: 'worklink' })
          })

          updateWorkerData({ 
            workLinkProfile: profile as WorkLinkEmployeeProfile,
            workerType: 'worklink'
          })
          setCurrentStep('worklink-dashboard')
        } catch (err) {
          console.error("Submission error:", err)
          // Fallback
          setCurrentStep('dashboard')
        }
      }
      submitData()
    }
  }

  const handleBack = () => {
    if (hasRejection) {
      setHasRejection(false)
      return
    }
    if (step > 1) {
      setStep(step - 1)
    } else {
      setCurrentStep('worklink-eligibility')
    }
  }

  const handleRejectionContinue = () => {
    updateWorkerData({ 
      workLinkProfile: profile as WorkLinkEmployeeProfile,
      isEligibleForWorkLink: false,
    })
    setCurrentStep('dashboard')
  }

  const canProceed = () => {
    switch (step) {
      case 1: return !!profile.intent
      case 2: return !!profile.experienceLevel && !!profile.jobVolume && !!profile.workTypeHistory
      case 3: return !!profile.specialization && !!profile.problemHandling
      case 4: return !!profile.toolsOwnership && !!profile.workSetup
      case 5: return !!profile.commitment && !!profile.timeliness && !!profile.cancellation
      case 6: return !!profile.autoAssignment && !!profile.paymentStructure && !!profile.codeOfConduct
      case 7: return !!profile.idBackgroundCheck && !!profile.skillAssessment && !!profile.openToTraining
      case 8: return !!profile.workMode && !!profile.dailyAvailability
      case 9: return !!profile.hasPortfolio && !!profile.hasReference
      default: return false
    }
  }

  if (hasRejection) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <header className="px-4 py-6 border-b border-border bg-card">
          <div className="max-w-md mx-auto flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-lg">W</span>
            </div>
            <span className="font-semibold text-xl text-foreground">WorkLink</span>
          </div>
        </header>
        <main className="flex-1 px-4 py-8 flex items-center justify-center">
          <div className="max-w-md text-center">
            <div className="w-20 h-20 rounded-full bg-warning/10 flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="w-10 h-10 text-warning" />
            </div>
            <h2 className="text-2xl font-bold text-foreground mb-2">
              Application Paused
            </h2>
            <p className="text-muted-foreground mb-6">
              Based on your responses, you may not be ready for WorkLink Employee status at this time. 
              You can continue as a Gig Worker and apply again later.
            </p>
            <div className="flex gap-4">
              <button
                onClick={handleBack}
                className="flex-1 px-4 py-3 rounded-lg border border-border text-foreground font-medium hover:bg-muted transition-colors"
              >
                Go Back
              </button>
              <button
                onClick={handleRejectionContinue}
                className="flex-1 px-4 py-3 rounded-lg bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-colors"
              >
                Continue as Gig Worker
              </button>
            </div>
          </div>
        </main>
      </div>
    )
  }

  const renderRadioOption = (option: { value: string; label: string; warning?: boolean }, currentValue: string | undefined, onChange: (value: string) => void) => (
    <label
      key={option.value}
      className={cn(
        "flex items-center gap-3 p-4 rounded-lg border bg-card cursor-pointer transition-colors",
        currentValue === option.value 
          ? option.warning 
            ? "border-warning bg-warning/10" 
            : "border-primary bg-primary/10"
          : "border-border hover:bg-muted/50",
      )}
    >
      <RadioGroupItem value={option.value} />
      <span className="text-sm font-medium flex-1">{option.label}</span>
      {option.warning && (
        <AlertCircle className="w-4 h-4 text-warning" />
      )}
    </label>
  )

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <div className="space-y-3">
            {/* Development Buttons */}
            <div className="bg-muted/50 p-4 rounded-lg border border-dashed border-border mb-4">
              <p className="text-[10px] font-bold text-muted-foreground uppercase mb-2">DEV: Auto-Fill Rank</p>
              <div className="grid grid-cols-5 gap-1">
                {[1, 2, 3, 4, 5].map((r) => (
                  <Button 
                    key={r}
                    variant="outline" 
                    size="sm" 
                    className="text-[10px] h-auto py-1 px-0"
                    onClick={() => autoFillWorkLink(r as any)}
                  >
                    {r === 5 ? 'INELIG' : `RANK ${r}`}
                  </Button>
                ))}
              </div>
            </div>
            <RadioGroup
              value={profile.intent ?? ''}
              onValueChange={(value) => updateProfile({ intent: value })}
              className="space-y-2"
            >
              {INTENT_OPTIONS.map((option) => renderRadioOption(option, profile.intent, (v) => updateProfile({ intent: v })))}
            </RadioGroup>
          </div>
        )

      case 2:
        return (
          <div className="space-y-6">
            <div className="space-y-3">
              <Label>How much experience do you have in your main skill?</Label>
              <RadioGroup
                value={profile.experienceLevel ?? ''}
                onValueChange={(value) => updateProfile({ experienceLevel: value })}
                className="space-y-2"
              >
                {EXPERIENCE_LEVEL_OPTIONS.map((option) => renderRadioOption(option, profile.experienceLevel, (v) => updateProfile({ experienceLevel: v })))}
              </RadioGroup>
            </div>

            <div className="space-y-3">
              <Label>How many jobs have you completed?</Label>
              <RadioGroup
                value={profile.jobVolume ?? ''}
                onValueChange={(value) => updateProfile({ jobVolume: value })}
                className="space-y-2"
              >
                {JOB_VOLUME_OPTIONS.map((option) => renderRadioOption(option, profile.jobVolume, (v) => updateProfile({ jobVolume: v })))}
              </RadioGroup>
            </div>

            <div className="space-y-3">
              <Label>What type of work have you mostly done?</Label>
              <RadioGroup
                value={profile.workTypeHistory ?? ''}
                onValueChange={(value) => updateProfile({ workTypeHistory: value })}
                className="space-y-2"
              >
                {WORK_TYPE_HISTORY_OPTIONS.map((option) => renderRadioOption(option, profile.workTypeHistory, (v) => updateProfile({ workTypeHistory: v })))}
              </RadioGroup>
            </div>
          </div>
        )

      case 3:
        return (
          <div className="space-y-6">
            <div className="space-y-3">
              <Label>What is your specialization?</Label>
              <RadioGroup
                value={profile.specialization ?? ''}
                onValueChange={(value) => updateProfile({ specialization: value })}
                className="space-y-2"
              >
                {SPECIALIZATION_OPTIONS.map((option) => renderRadioOption(option, profile.specialization, (v) => updateProfile({ specialization: v })))}
              </RadioGroup>
            </div>

            <div className="space-y-3">
              <Label>Can you handle complex or unexpected problems on-site?</Label>
              <RadioGroup
                value={profile.problemHandling ?? ''}
                onValueChange={(value) => updateProfile({ problemHandling: value })}
                className="space-y-2"
              >
                {PROBLEM_HANDLING_OPTIONS.map((option) => renderRadioOption(option, profile.problemHandling, (v) => updateProfile({ problemHandling: v })))}
              </RadioGroup>
            </div>
          </div>
        )

      case 4:
        return (
          <div className="space-y-6">
            <div className="space-y-3">
              <Label>What tools do you have?</Label>
              <RadioGroup
                value={profile.toolsOwnership ?? ''}
                onValueChange={(value) => updateProfile({ toolsOwnership: value })}
                className="space-y-2"
              >
                {TOOLS_OWNERSHIP_OPTIONS.map((option) => renderRadioOption(option, profile.toolsOwnership, (v) => updateProfile({ toolsOwnership: v })))}
              </RadioGroup>
            </div>

            <div className="space-y-3">
              <Label>Do you work alone or with a team?</Label>
              <RadioGroup
                value={profile.workSetup ?? ''}
                onValueChange={(value) => updateProfile({ workSetup: value })}
                className="space-y-2"
              >
                {WORK_SETUP_OPTIONS.map((option) => renderRadioOption(option, profile.workSetup, (v) => updateProfile({ workSetup: v })))}
              </RadioGroup>
            </div>
          </div>
        )

      case 5:
        return (
          <div className="space-y-6">
            <div className="space-y-3">
              <Label>If assigned a job, will you always accept and complete it?</Label>
              <RadioGroup
                value={profile.commitment ?? ''}
                onValueChange={(value) => updateProfile({ commitment: value })}
                className="space-y-2"
              >
                {COMMITMENT_OPTIONS.map((option) => renderRadioOption(option, profile.commitment, (v) => updateProfile({ commitment: v })))}
              </RadioGroup>
            </div>

            <div className="space-y-3">
              <Label>How often do you reach job location on time?</Label>
              <RadioGroup
                value={profile.timeliness ?? ''}
                onValueChange={(value) => updateProfile({ timeliness: value })}
                className="space-y-2"
              >
                {TIMELINESS_OPTIONS.map((option) => renderRadioOption(option, profile.timeliness, (v) => updateProfile({ timeliness: v })))}
              </RadioGroup>
            </div>

            <div className="space-y-3">
              <Label>How often do you cancel jobs?</Label>
              <RadioGroup
                value={profile.cancellation ?? ''}
                onValueChange={(value) => updateProfile({ cancellation: value })}
                className="space-y-2"
              >
                {CANCELLATION_OPTIONS.map((option) => renderRadioOption(option, profile.cancellation, (v) => updateProfile({ cancellation: v })))}
              </RadioGroup>
            </div>
          </div>
        )

      case 6:
        return (
          <div className="space-y-6">
            <div className="space-y-3">
              <Label>Are you willing to accept auto-assigned jobs from WorkLink?</Label>
              <RadioGroup
                value={profile.autoAssignment ?? ''}
                onValueChange={(value) => updateProfile({ autoAssignment: value })}
                className="space-y-2"
              >
                {YES_NO_OPTIONS.map((option) => renderRadioOption(option, profile.autoAssignment, (v) => updateProfile({ autoAssignment: v })))}
              </RadioGroup>
            </div>

            <div className="space-y-3">
              <Label>Are you okay with platform commission on each job?</Label>
              <RadioGroup
                value={profile.paymentStructure ?? ''}
                onValueChange={(value) => updateProfile({ paymentStructure: value })}
                className="space-y-2"
              >
                {YES_NO_OPTIONS.map((option) => renderRadioOption(option, profile.paymentStructure, (v) => updateProfile({ paymentStructure: v })))}
              </RadioGroup>
            </div>

            <div className="space-y-3">
              <Label>Will you follow WorkLink service standards and behavior rules?</Label>
              <RadioGroup
                value={profile.codeOfConduct ?? ''}
                onValueChange={(value) => updateProfile({ codeOfConduct: value })}
                className="space-y-2"
              >
                {YES_NO_OPTIONS.map((option) => renderRadioOption(option, profile.codeOfConduct, (v) => updateProfile({ codeOfConduct: v })))}
              </RadioGroup>
            </div>
          </div>
        )

      case 7:
        return (
          <div className="space-y-6">
            <div className="space-y-3">
              <Label>Are you ready for full verification (ID & background check)?</Label>
              <RadioGroup
                value={profile.idBackgroundCheck ?? ''}
                onValueChange={(value) => updateProfile({ idBackgroundCheck: value })}
                className="space-y-2"
              >
                {YES_NO_OPTIONS.map((option) => renderRadioOption(option, profile.idBackgroundCheck, (v) => updateProfile({ idBackgroundCheck: v })))}
              </RadioGroup>
            </div>

            <div className="space-y-3">
              <Label>Are you ready for offline skill testing?</Label>
              <RadioGroup
                value={profile.skillAssessment ?? ''}
                onValueChange={(value) => updateProfile({ skillAssessment: value })}
                className="space-y-2"
              >
                {YES_NO_OPTIONS.map((option) => renderRadioOption(option, profile.skillAssessment, (v) => updateProfile({ skillAssessment: v })))}
              </RadioGroup>
            </div>

            <div className="space-y-3">
              <Label>Are you open to training before activation (if required)?</Label>
              <RadioGroup
                value={profile.openToTraining ?? ''}
                onValueChange={(value) => updateProfile({ openToTraining: value })}
                className="space-y-2"
              >
                {YES_NO_OPTIONS.map((option) => renderRadioOption(option, profile.openToTraining, (v) => updateProfile({ openToTraining: v })))}
              </RadioGroup>
            </div>
          </div>
        )

      case 8:
        return (
          <div className="space-y-6">
            <div className="space-y-3">
              <Label>How will you work with WorkLink?</Label>
              <RadioGroup
                value={profile.workMode ?? ''}
                onValueChange={(value) => updateProfile({ workMode: value })}
                className="space-y-2"
              >
                {WORK_MODE_OPTIONS.map((option) => renderRadioOption(option, profile.workMode, (v) => updateProfile({ workMode: v })))}
              </RadioGroup>
            </div>

            <div className="space-y-3">
              <Label>How many hours can you work daily?</Label>
              <RadioGroup
                value={profile.dailyAvailability ?? ''}
                onValueChange={(value) => updateProfile({ dailyAvailability: value })}
                className="space-y-2"
              >
                {DAILY_AVAILABILITY_OPTIONS.map((option) => renderRadioOption(option, profile.dailyAvailability, (v) => updateProfile({ dailyAvailability: v })))}
              </RadioGroup>
            </div>
          </div>
        )

      case 9:
        return (
          <div className="space-y-6">
            <div className="space-y-3">
              <Label>Upload photos of your past work (required)</Label>
              <RadioGroup
                value={profile.hasPortfolio ?? ''}
                onValueChange={(value) => updateProfile({ hasPortfolio: value })}
                className="space-y-2"
              >
                <label className="flex items-center gap-3 p-4 rounded-lg border border-border bg-card hover:bg-muted/50 cursor-pointer transition-colors">
                  <RadioGroupItem value="yes" />
                  <span className="text-sm font-medium">Yes, I will upload</span>
                </label>
              </RadioGroup>
              {profile.hasPortfolio === 'yes' && (
                <div className="border-2 border-dashed border-border rounded-lg p-8 text-center">
                  <p className="text-muted-foreground text-sm">Upload work photos here</p>
                </div>
              )}
            </div>

            <div className="space-y-3">
              <Label>Can you provide a previous client reference?</Label>
              <RadioGroup
                value={profile.hasReference ?? ''}
                onValueChange={(value) => updateProfile({ hasReference: value })}
                className="space-y-2"
              >
                {[
                  { value: 'yes', label: 'Yes' },
                  { value: 'no', label: 'No' },
                ].map((option) => renderRadioOption(option, profile.hasReference, (v) => updateProfile({ hasReference: v })))}
              </RadioGroup>
            </div>
          </div>
        )

      default:
        return null
    }
  }

  const getStepTitle = () => {
    switch (step) {
      case 1: return 'Why do you want to become a WorkLink Employee?'
      case 2: return 'Experience Qualification'
      case 3: return 'Skill Depth'
      case 4: return 'Tools & Professional Setup'
      case 5: return 'Reliability & Discipline'
      case 6: return 'Platform Rules Acceptance'
      case 7: return 'Verification Readiness'
      case 8: return 'Availability Commitment'
      case 9: return 'Proof of Work'
      default: return ''
    }
  }

  const getStepSubtitle = () => {
    switch (step) {
      case 1: return 'Select your main motivation'
      case 2: return 'Tell us about your work history'
      case 3: return 'We want to understand your skill level'
      case 4: return 'Your professional equipment and work style'
      case 5: return 'This is the most important section'
      case 6: return 'Agree to WorkLink platform policies'
      case 7: return 'Confirm you are ready for verification'
      case 8: return 'How much time can you dedicate?'
      case 9: return 'Show us your work quality'
      default: return ''
    }
  }

  return (
    <SurveyLayout
      title={getStepTitle()}
      subtitle={getStepSubtitle()}
      currentStep={step}
      totalSteps={TOTAL_STEPS}
      onNext={handleNext}
      onBack={handleBack}
      canProceed={canProceed()}
      nextLabel={step === TOTAL_STEPS ? 'Submit Application' : 'Continue'}
    >
      {renderStep()}
    </SurveyLayout>
  )
}
