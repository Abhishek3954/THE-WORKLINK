'use client'

import { ReactNode, useRef, useState, useEffect } from 'react'
import { ProgressBar } from './progress-bar'
import { Button } from '@/components/ui/button'
import { ArrowLeft, ArrowRight, Play } from 'lucide-react'

interface SurveyLayoutProps {
  children: ReactNode
  title: string
  subtitle?: string
  currentStep: number
  totalSteps: number
  onNext?: () => void
  onBack?: () => void
  nextLabel?: string
  backLabel?: string
  canProceed?: boolean
  showBack?: boolean
}

export function SurveyLayout({
  children,
  title,
  subtitle,
  currentStep,
  totalSteps,
  onNext,
  onBack,
  nextLabel = 'Continue',
  backLabel = 'Back',
  canProceed = true,
  showBack = true,
}: SurveyLayoutProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [isPlaying, setIsPlaying] = useState(false)

  // Autoplay handler
  useEffect(() => {
    // Only attempt autoplay once when component mounts
    if (videoRef.current) {
      videoRef.current.play().catch(e => {
        console.log("Autoplay prevented by browser:", e)
      })
    }
  }, [])

  const handleVideoClick = () => {
    if (videoRef.current) {
      videoRef.current.currentTime = 0;
      videoRef.current.play();
    }
  }
  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-card border-b border-border px-4 py-4">
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-lg">W</span>
            </div>
            <span className="font-semibold text-lg text-foreground">WorkLink</span>
          </div>
          <ProgressBar
            currentStep={currentStep}
            totalSteps={totalSteps}
            label={`Step ${currentStep}`}
          />
        </div>
      </header>

      {/* Content */}
      <main className="flex-1 px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-foreground mb-2 text-balance">{title}</h1>
            {subtitle && (
              <p className="text-muted-foreground">{subtitle}</p>
            )}
          </div>
          {children}
        </div>
      </main>

      {/* Footer */}
      <footer className="sticky bottom-0 bg-card border-t border-border px-4 py-4">
        <div className="max-w-2xl mx-auto flex gap-4">
          {showBack && onBack && (
            <Button
              variant="outline"
              onClick={onBack}
              className="flex-1"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              {backLabel}
            </Button>
          )}
          {onNext && (
            <Button
              onClick={onNext}
              disabled={!canProceed}
              className={showBack && onBack ? "flex-1" : "w-full"}
            >
              {nextLabel}
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          )}
        </div>
      </footer>

      {/* Floating Video Overlay */}
      <div 
        onClick={handleVideoClick}
        className="fixed bottom-24 right-4 w-32 md:w-48 aspect-[9/16] rounded-2xl overflow-hidden shadow-2xl z-50 cursor-pointer border-[3px] border-primary hover:scale-105 transition-transform bg-black group"
      >
        <video 
          ref={videoRef}
          src="/survey-intro.mp4" 
          autoPlay
          playsInline
          onPlay={() => setIsPlaying(true)}
          onPause={() => setIsPlaying(false)}
          onEnded={() => setIsPlaying(false)}
          className="w-full h-full object-cover"
        />
        {!isPlaying && (
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center transition-opacity">
            <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center text-primary-foreground shadow-lg">
              <Play className="w-5 h-5 ml-1" />
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
