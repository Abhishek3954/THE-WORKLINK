'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useWorkflow } from '@/lib/workflow-context'
import { Briefcase, Users, CheckCircle, ArrowRight } from 'lucide-react'
import { useLanguage } from '@/lib/i18n-context'

export function SelectionScreen() {
  const { setCurrentStep, updateWorkerData } = useWorkflow()
  const { t } = useLanguage()

  const chooseWorker = () => {
    updateWorkerData({ workerType: 'gig' })
    setCurrentStep('sign-in')
  }

  const chooseConsumer = () => {
    setCurrentStep('consumer-sign-in')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Hero Section */}
      <div className="relative overflow-hidden min-h-[42vh] lg:min-h-[38vh]">
        {/* Animated background elements */}
        <div className="absolute inset-0">
          <div className="absolute top-20 left-10 w-64 h-64 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>
          <div className="absolute -top-20 right-20 w-80 h-80 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse animation-delay-2000"></div>
          <div className="absolute bottom-20 left-1/2 w-72 h-72 bg-gradient-to-r from-indigo-400 to-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse animation-delay-4000"></div>
        </div>

        <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 text-center">
          {/* Animated Worklink Logo */}
          <div className="mb-8">
            <div className="inline-block">
              <h1 className="text-6xl sm:text-7xl font-black mb-2 bg-gradient-to-r from-slate-800 via-blue-800 to-purple-800 bg-clip-text text-transparent animate-fade-in">
                Worklink
              </h1>
              <div className="h-1 w-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-full animate-scale-in animation-delay-500"></div>
            </div>
          </div>

          <div className="mb-8 animate-fade-in animation-delay-1000">
            <p className="text-xl sm:text-2xl text-slate-600 mb-4 font-medium">
              {t('Connecting Skills with Opportunities')}
            </p>
            <p className="text-lg text-slate-500 max-w-2xl mx-auto leading-relaxed">
              {t('A streamlined platform for gig workers and businesses to connect, collaborate, and grow together.')}
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Choose Your Path */}
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-slate-900 mb-4">{t('Get Started')}</h2>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            {t("Choose how you'd like to use Worklink - whether you're here to work or to hire.")}
          </p>
        </div>

        {/* Path Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16 items-stretch">
          {/* Worker Card */}
          <Card
            className="h-full group cursor-pointer transform transition-all duration-500 hover:shadow-xl hover:-translate-y-2 border-2 border-transparent hover:border-blue-200 bg-white/80 backdrop-blur-sm"
            onClick={chooseWorker}
          >
            <CardHeader className="pb-6">
              <div className="flex items-center gap-4 mb-4">
                <div className="p-3 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl group-hover:scale-110 transition-transform duration-300">
                  <Briefcase className="w-6 h-6 text-white" />
                </div>
                <div>
                  <CardTitle className="text-2xl text-slate-900 group-hover:text-blue-900 transition-colors">{t('Join as Worker')}</CardTitle>
                  <CardDescription className="text-slate-600">{t('Offer your skills and find opportunities')}</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 mb-6">
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium text-slate-900">{t('Profile Setup')}</p>
                    <p className="text-sm text-slate-600">{t('Create your professional profile and showcase your skills')}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium text-slate-900">{t('Skill Assessment')}</p>
                    <p className="text-sm text-slate-600">{t('Complete assessments to highlight your expertise')}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium text-slate-900">{t('Job Matching')}</p>
                    <p className="text-sm text-slate-600">{t('Get matched with relevant opportunities')}</p>
                  </div>
                </div>
              </div>
              <Button
                onClick={chooseWorker}
                className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold py-3 rounded-lg transition-all duration-300 group-hover:shadow-lg"
              >
                {t('Start as Worker')}
                <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
            </CardContent>
          </Card>

          {/* Consumer Card */}
          <Card
            className="h-full group cursor-pointer transform transition-all duration-500 hover:shadow-xl hover:-translate-y-2 border-2 border-transparent hover:border-purple-200 bg-white/80 backdrop-blur-sm"
            onClick={chooseConsumer}
          >
            <CardHeader className="pb-6">
              <div className="flex items-center gap-4 mb-4">
                <div className="p-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl group-hover:scale-110 transition-transform duration-300">
                  <Users className="w-6 h-6 text-white" />
                </div>
                <div>
                  <CardTitle className="text-2xl text-slate-900 group-hover:text-purple-900 transition-colors">{t('Join as Consumer')}</CardTitle>
                  <CardDescription className="text-slate-600">{t('Find and hire skilled professionals')}</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 mb-6">
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium text-slate-900">{t('Eligibility Check')}</p>
                    <p className="text-sm text-slate-600">{t('Verify your business requirements')}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium text-slate-900">{t('Worker Discovery')}</p>
                    <p className="text-sm text-slate-600">{t('Browse and connect with qualified professionals')}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium text-slate-900">{t('Project Management')}</p>
                    <p className="text-sm text-slate-600">{t('Manage jobs and track progress')}</p>
                  </div>
                </div>
              </div>
              <Button
                onClick={chooseConsumer}
                className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold py-3 rounded-lg transition-all duration-300 group-hover:shadow-lg"
              >
                {t('Start as Consumer')}
                <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
            </CardContent>
          </Card>
        </div>

      </div>

      <style jsx>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes scale-in {
          from { transform: scaleX(0); }
          to { transform: scaleX(1); }
        }
        .animate-fade-in {
          animation: fade-in 0.8s ease-out forwards;
          opacity: 0;
        }
        .animate-scale-in {
          animation: scale-in 0.6s ease-out forwards;
          transform-origin: center;
        }
        .animation-delay-500 { animation-delay: 0.5s; }
        .animation-delay-1000 { animation-delay: 1s; }
        .animation-delay-1500 { animation-delay: 1.5s; }
        .animation-delay-2000 { animation-delay: 2s; }
        .animation-delay-4000 { animation-delay: 4s; }
      `}</style>
    </div>
  )
}
