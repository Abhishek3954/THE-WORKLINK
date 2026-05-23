'use client'

import { useState } from 'react'
import { Languages } from 'lucide-react'
import { useLanguage } from '@/lib/i18n-context'
import { Language } from '@/lib/translations'

export function LanguageTranslator() {
  const { language, setLanguage } = useLanguage()
  const [isOpen, setIsOpen] = useState(false)

  const switchLanguage = (lang: Language) => {
    setLanguage(lang)
    setIsOpen(false)
  }

  return (
    <div className="fixed top-2 left-2 z-[99999]">
      {/* Backdrop for click-away on mobile */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-[-1] bg-transparent" 
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Custom native styling UI - Tiny Circular Button */}
      <div className="relative">
        <button 
          onClick={() => setIsOpen(!isOpen)}
          className="w-8 h-8 bg-white/90 backdrop-blur-lg rounded-full shadow-[0_4px_12px_rgba(0,0,0,0.1)] border border-indigo-100 flex items-center justify-center hover:shadow-xl hover:bg-white hover:scale-105 transition-all cursor-pointer active:scale-95"
        >
          <Languages className="w-4 h-4 text-indigo-600" />
        </button>
        
        {/* Dropdown Menu */}
        <div className={`
          absolute top-full left-0 mt-2 w-32 bg-white rounded-xl shadow-2xl border border-gray-100 
          transition-all origin-top-left transform overflow-hidden flex flex-col
          ${isOpen ? 'opacity-100 visible scale-100 translate-y-0' : 'opacity-0 invisible scale-95 -translate-y-2 pointer-events-none'}
        `}>
          <button 
            onClick={() => switchLanguage('en')} 
            className={`w-full text-left px-3 py-2 text-xs font-bold transition-colors ${language === 'en' ? 'bg-indigo-50 text-indigo-700' : 'text-gray-700 hover:bg-gray-50'}`}
          >
            English
          </button>
          <button 
            onClick={() => switchLanguage('hi')} 
            className={`w-full text-left px-3 py-2 text-xs font-bold transition-colors ${language === 'hi' ? 'bg-indigo-50 text-indigo-700' : 'text-gray-700 hover:bg-gray-50'}`}
          >
            Hindi <span className="text-[10px] text-gray-400 ml-1">(हिंदी)</span>
          </button>
          <button 
            onClick={() => switchLanguage('pa')} 
            className={`w-full text-left px-3 py-2 text-xs font-bold transition-colors ${language === 'pa' ? 'bg-indigo-50 text-indigo-700' : 'text-gray-700 hover:bg-gray-50'}`}
          >
            Punjabi <span className="text-[10px] text-gray-400 ml-1">(ਪੰਜਾਬੀ)</span>
          </button>
        </div>
      </div>
    </div>
  )
}
