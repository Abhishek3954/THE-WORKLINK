'use client'

import { ReactNode, useState, useRef, useEffect } from 'react'
import { ProgressBar } from './progress-bar'
import { Button } from '@/components/ui/button'
import { ArrowLeft, ArrowRight } from 'lucide-react'

function AudioIconButton({ src }: { src: string }) {
  const audioRef = useRef<HTMLAudioElement>(null)
  const [isPlaying, setIsPlaying] = useState(false)

  const togglePlay = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause()
      } else {
        audioRef.current.play()
      }
    }
  }

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    
    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);
    const handleEnded = () => setIsPlaying(false);

    audio.addEventListener('play', handlePlay);
    audio.addEventListener('pause', handlePause);
    audio.addEventListener('ended', handleEnded);

    return () => {
      audio.removeEventListener('play', handlePlay);
      audio.removeEventListener('pause', handlePause);
      audio.removeEventListener('ended', handleEnded);
    }
  }, [src])

  return (
    <>
      <button
        onClick={togglePlay}
        className={`w-8 h-8 flex-shrink-0 flex items-center justify-center rounded-full text-white font-serif italic text-base shadow-sm transition-all ${isPlaying ? 'bg-sky-400 animate-pulse' : 'bg-sky-400 hover:bg-sky-500'}`}
        title={isPlaying ? "Pause audio" : "Play audio"}
        type="button"
      >
        i
      </button>
      <audio ref={audioRef} src={src} preload="metadata" />
    </>
  )
}

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
  hideAudio?: boolean
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
  hideAudio = false,
}: SurveyLayoutProps) {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-card border-b border-border px-4 py-4">
        <div className="max-w-2xl mx-auto">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4 relative z-0 pr-28 sm:pr-0">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center flex-shrink-0">
                <span className="text-primary-foreground font-bold text-lg">W</span>
              </div>
              <span className="font-semibold text-lg text-foreground truncate">WorkLink</span>
            </div>
            {currentStep === 1 && !hideAudio && (
              <div className="flex items-center gap-2 self-start sm:self-auto">
                <span className="text-sm font-medium text-muted-foreground whitespace-nowrap">General instruction</span>
                <div className="flex-shrink-0">
                  <AudioIconButton src="/audios/Opening.mp4" />
                </div>
              </div>
            )}
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
            <div className="flex items-start gap-3 mb-2">
              {currentStep >= 1 && currentStep <= 10 && !hideAudio && (
                <div className="mt-1 flex-shrink-0">
                  <AudioIconButton key={currentStep} src={`/audios/Step ${currentStep}.mp4`} />
                </div>
              )}
              <h1 className="text-2xl font-bold text-foreground text-balance">{title}</h1>
            </div>
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
    </div>
  )
}
