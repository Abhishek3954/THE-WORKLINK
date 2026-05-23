'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { WorkflowStep, WorkerData, initialWorkerData } from './types'

interface WorkflowContextType {
  currentStep: WorkflowStep
  setCurrentStep: (step: WorkflowStep) => void
  workerData: WorkerData
  updateWorkerData: (data: Partial<WorkerData>) => void
  goToNextStep: () => void
  goToPreviousStep: () => void
}

const WorkflowContext = createContext<WorkflowContextType | null>(null)

const stepOrder: WorkflowStep[] = [
  'selection',
  'sign-in',
  'gig-survey',
  'gig-profile-complete',
  'worklink-eligibility',
  'worklink-survey',
  'document-verification',
  'skill-assessment',
  'dashboard',
  'worklink-dashboard',
]

export function WorkflowProvider({ children }: { children: ReactNode }) {
  const [currentStep, setCurrentStep] = useState<WorkflowStep>('selection')
  const [workerData, setWorkerData] = useState<WorkerData>(initialWorkerData)
  const [isHydrated, setIsHydrated] = useState(false)

  // Restore session from sessionStorage on mount
  useEffect(() => {
    const savedStep = sessionStorage.getItem('worklink_step') as WorkflowStep | null
    const savedPhone = sessionStorage.getItem('worklink_phone')
    const savedName = sessionStorage.getItem('worklink_name')
    const savedProfileImage = sessionStorage.getItem('worklink_profileImage')
    const savedCity = sessionStorage.getItem('worklink_city')
    const savedWorkerType = sessionStorage.getItem('worklink_workerType') as any

    if ((savedStep === 'dashboard' || savedStep === 'consumer-dashboard' || savedStep === 'worklink-dashboard') && savedPhone) {
      setCurrentStep(savedStep)
      setWorkerData(prev => ({ 
        ...prev, 
        phone: savedPhone,
        name: savedName || prev.name,
        profileImage: savedProfileImage || prev.profileImage,
        city: savedCity || prev.city,
        workerType: savedWorkerType || 'gig'
      }))
    }
    setIsHydrated(true)
  }, [])

  // Centralized Persistence Effect
  useEffect(() => {
    if (!isHydrated) return;

    if (currentStep === 'dashboard' || currentStep === 'consumer-dashboard' || currentStep === 'worklink-dashboard') {
      sessionStorage.setItem('worklink_step', currentStep)
      if (workerData.phone) sessionStorage.setItem('worklink_phone', workerData.phone)
      if (workerData.name) sessionStorage.setItem('worklink_name', workerData.name)
      if (workerData.profileImage) sessionStorage.setItem('worklink_profileImage', workerData.profileImage)
      if (workerData.city) sessionStorage.setItem('worklink_city', workerData.city)
      if (workerData.workerType) sessionStorage.setItem('worklink_workerType', workerData.workerType)
    } else if (currentStep === 'selection' || currentStep === 'sign-in' || currentStep === 'consumer-sign-in') {
      // Clear specific session keys rather than full storage to avoid wiping other non-auth state if necessary,
      // but sessionClear is fine here if we only want to stay on these screens.
      sessionStorage.clear()
      if (workerData.phone || workerData.name) {
        setWorkerData(initialWorkerData)
      }
    }
  }, [currentStep, workerData, isHydrated])

  const updateWorkerData = (data: Partial<WorkerData>) => {
    setWorkerData(prev => ({ ...prev, ...data }))
  }

  const handleSetCurrentStep = (step: WorkflowStep) => {
    setCurrentStep(step)
  }

  const goToNextStep = () => {
    const currentIndex = stepOrder.indexOf(currentStep)
    if (currentIndex < stepOrder.length - 1) {
      setCurrentStep(stepOrder[currentIndex + 1])
    }
  }

  const goToPreviousStep = () => {
    const currentIndex = stepOrder.indexOf(currentStep)
    if (currentIndex > 0) {
      setCurrentStep(stepOrder[currentIndex - 1])
    }
  }

  if (!isHydrated) return null

  return (
    <WorkflowContext.Provider
      value={{
        currentStep,
        setCurrentStep: handleSetCurrentStep,
        workerData,
        updateWorkerData,
        goToNextStep,
        goToPreviousStep,
      }}
    >
      {children}
    </WorkflowContext.Provider>
  )
}

export function useWorkflow() {
  const context = useContext(WorkflowContext)
  if (!context) {
    throw new Error('useWorkflow must be used within a WorkflowProvider')
  }
  return context
}
