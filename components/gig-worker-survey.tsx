'use client'

import { useState } from 'react'
import { useWorkflow } from '@/lib/workflow-context'
import { SurveyLayout } from './survey-layout'
import { SkillCard } from './skill-card'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { GigWorkerProfile } from '@/lib/types'
import { 
  Zap, Wrench, TreePine, Sparkles, Paintbrush, 
  Plug, Hammer, MoreHorizontal, Upload, Camera, ArrowRight, Home
} from 'lucide-react'
import { Button } from './ui/button'

const TOTAL_STEPS = 10

const PRIMARY_SKILLS = [
  { id: 'electrical', label: 'Electrical Work', icon: <Zap /> },
  { id: 'plumbing', label: 'Plumbing', icon: <Wrench /> },
  { id: 'carpentry', label: 'Carpentry', icon: <TreePine /> },
  { id: 'cleaning', label: 'Cleaning', icon: <Sparkles /> },
  { id: 'painting', label: 'Painting', icon: <Paintbrush /> },
  { id: 'appliance', label: 'Appliance Repair', icon: <Plug /> },
  { id: 'mason', label: 'Mason / Construction', icon: <Hammer /> },
  { id: 'other', label: 'Other', icon: <MoreHorizontal /> },
]

const SECONDARY_SKILLS = [
  'Electrical Wiring',
  'Switch / Board Repair',
  'Pipe Fitting',
  'Leakage Repair',
  'Furniture Making',
  'Cabinet Work',
  'Tile Work',
  'Deep Cleaning',
  'Bathroom Cleaning',
  'Wall Painting',
  'Spray Painting',
  'Appliance Installation',
  'General Repair Work',
]

const EXPERIENCE_OPTIONS = [
  'Less than 6 months',
  '6 months – 1 year',
  '1 – 3 years',
  '3 – 5 years',
  '5 – 10 years',
  '10+ years',
]

const WORK_BACKGROUND_OPTIONS = [
  'Self-employed',
  'Worked under contractor',
  'Worked in company',
  'Mix of all',
]

const JOBS_COMPLETED_OPTIONS = [
  '0 – 10',
  '10 – 50',
  '50 – 200',
  '200+',
]

const TOOLS_OPTIONS = [
  'No tools',
  'Basic tools',
  'Most required tools',
  'Complete professional tools',
]

const MATERIAL_HANDLING_OPTIONS = [
  'Client provides everything',
  'I can suggest materials',
  'I can arrange materials',
]

const WORK_TYPE_OPTIONS = [
  'Full-time',
  'Part-time',
  'Only weekend',
]

const AVAILABILITY_OPTIONS = [
  'Morning',
  'Afternoon',
  'Evening',
  'Flexible',
]

const JOB_PREFERENCE_OPTIONS = [
  'Small quick jobs',
  'Long-duration work',
  'Urgent jobs',
  'Regular work',
]

const TRAVEL_RANGE_OPTIONS = [
  'Within 2 km',
  'Within 5 km',
  'Within 10 km',
  'Anywhere in city',
]

const TRAVEL_WILLINGNESS_OPTIONS = [
  'Only nearby',
  'Within city',
  'Outside city',
]

const VEHICLE_OPTIONS = [
  'Yes',
  'No',
]

const LANGUAGE_OPTIONS = [
  'Hindi',
  'English',
  'Punjabi',
  'Other',
]

const PAYMENT_PREFERENCE_OPTIONS = [
  'Per hour',
  'Per job',
]

const DAILY_INCOME_OPTIONS = [
  '₹300 – ₹500',
  '₹500 – ₹800',
  '₹800 – ₹1200',
  '₹1200+',
]

const ID_PROOF_OPTIONS = [
  'Aadhaar Card',
  'Driving License',
  'Voter ID',
]

const COMMITMENT_OPTIONS = [
  'Always',
  'Most of the time',
  'Depends on situation',
]

const CANCELLATION_OPTIONS = [
  'Never',
  'Rarely',
  'Sometimes',
]

export function GigWorkerSurvey() {
  const { workerData, updateWorkerData, setCurrentStep } = useWorkflow()
  const [step, setStep] = useState(1)
  const [profile, setProfile] = useState<Partial<GigWorkerProfile>>(workerData.gigProfile)
  const [isRegistration, setIsRegistration] = useState(!workerData.name || !workerData.phone)
  const [regName, setRegName] = useState('')
  const [regPhone, setRegPhone] = useState('')
  const [regPassword, setRegPassword] = useState('')
  const [regCity, setRegCity] = useState('')
  const [regErrors, setRegErrors] = useState({ name: '', phone: '', password: '', city: '' })

  // dev only
  const autoFillWorker = (eligible: boolean) => {
    const random = Math.floor(1000 + Math.random() * 9000);
    const finalName = regName.trim() || `Test ${eligible ? 'Eligible' : 'Gig'} ${random}`;
    const finalPhone = regPhone.trim() || `987654${random}`;
    const finalPassword = regPassword.trim() || 'password123';
    const finalCity = regCity.trim() || 'Ludhiana';
    
    updateWorkerData({ name: finalName, phone: finalPhone, password: finalPassword, city: finalCity });
    
    const mockProfile: any = {
      primarySkill: 'electrical',
      secondarySkills: ['Electrical Wiring', 'Switch / Board Repair'],
      yearsOfExperience: eligible ? '5 – 10 years' : 'Less than 6 months',
      workBackground: 'Self-employed',
      jobsCompleted: eligible ? '200+' : '0 – 10',
      toolsAvailability: eligible ? 'Complete professional tools' : 'No tools',
      materialHandling: 'I can arrange materials',
      workType: 'Full-time',
      availability: 'Flexible',
      jobPreference: ['Regular work'],
      travelRange: 'Within 10 km',
      travelWillingness: 'Within city',
      hasVehicle: 'Yes',
      languages: ['English', 'Hindi'],
      paymentPreference: 'Per job',
      expectedDailyIncome: '₹1200+',
      idProofType: 'Aadhaar Card',
      hasWorkPhotos: 'no',
      hasCertification: 'no',
      jobCommitment: eligible ? 'Always' : 'Depends on situation',
      cancellationBehavior: eligible ? 'Never' : 'Sometimes',
    };

    setProfile(mockProfile);
    setIsRegistration(false);
    setStep(10); // Jump to last step or just submit
  }

  const validateRegForm = () => {
    const newErrors = { name: '', phone: '', password: '' }
    let isValid = true

    if (!regName.trim()) {
      newErrors.name = 'Please enter your name'
      isValid = false
    }

    if (!regPhone.trim()) {
      newErrors.phone = 'Please enter your phone number'
      isValid = false
    } else if (!/^[6-9]\d{9}$/.test(regPhone)) {
      newErrors.phone = 'Please enter a valid 10-digit phone number'
      isValid = false
    }

    if (!regPassword.trim()) {
      newErrors.password = 'Please enter a password'
      isValid = false
    } else if (regPassword.length < 6) {
      newErrors.password = 'Password must be at least 6 characters'
      isValid = false
    }

    if (!regCity.trim()) {
      newErrors.city = 'Please enter your city'
      isValid = false
    }

    setRegErrors(newErrors)
    return isValid
  }

  const handleRegSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (validateRegForm()) {
      updateWorkerData({ name: regName, phone: regPhone, password: regPassword, city: regCity })
      setIsRegistration(false)
    }
  }

  const updateProfile = (updates: Partial<GigWorkerProfile>) => {
    setProfile(prev => ({ ...prev, ...updates }))
  }

  const handleNext = async () => {
    if (step < TOTAL_STEPS) {
      setStep(step + 1)
    } else {
      updateWorkerData({ 
        gigProfile: profile as GigWorkerProfile,
        workerType: 'gig'
      })
      try {
        const response = await fetch('/api/saveGigData', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: workerData.name,
            phone: workerData.phone,
            password: workerData.password,
            city: workerData.city,
            ...profile,
          })
        })

        const result = await response.json();

        if (!response.ok) {
          alert(`Error: ${result.error || 'Failed to save data'}`);
          return;
        }

        setCurrentStep('gig-profile-complete')
      } catch (err) {
        console.error('Submission Error:', err);
        alert('Failed to connect to the server. Please check your internet and MongoDB connection.');
      }
    }
  }

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1)
    } else {
      setCurrentStep('sign-in')
    }
  }

  const canProceed = () => {
    switch (step) {
      case 1: return !!profile.primarySkill
      case 2: return (profile.secondarySkills?.length ?? 0) > 0
      case 3: return !!profile.yearsOfExperience && !!profile.workBackground && !!profile.jobsCompleted
      case 4: return !!profile.toolsAvailability && !!profile.materialHandling
      case 5: return !!profile.workType && !!profile.availability && (profile.jobPreference?.length ?? 0) > 0
      case 6: return !!profile.travelRange && !!profile.travelWillingness && !!profile.hasVehicle
      case 7: return (profile.languages?.length ?? 0) > 0
      case 8: return !!profile.paymentPreference && !!profile.expectedDailyIncome
      case 9: return !!profile.idProofType && !!profile.hasWorkPhotos && !!profile.hasCertification
      case 10: return !!profile.jobCommitment && !!profile.cancellationBehavior
      default: return false
    }
  }

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <div className="grid grid-cols-2 gap-4">
            {PRIMARY_SKILLS.map((skill) => (
              <SkillCard
                key={skill.id}
                icon={skill.icon}
                label={skill.label}
                selected={profile.primarySkill === skill.id}
                onClick={() => updateProfile({ primarySkill: skill.id })}
              />
            ))}
          </div>
        )

      case 2:
        return (
          <div className="space-y-3">
            {SECONDARY_SKILLS.map((skill) => (
              <label
                key={skill}
                className="flex items-center gap-3 p-4 rounded-lg border border-border bg-card hover:bg-muted/50 cursor-pointer transition-colors"
              >
                <Checkbox
                  checked={profile.secondarySkills?.includes(skill) ?? false}
                  onCheckedChange={(checked) => {
                    const current = profile.secondarySkills ?? []
                    if (checked) {
                      updateProfile({ secondarySkills: [...current, skill] })
                    } else {
                      updateProfile({ secondarySkills: current.filter(s => s !== skill) })
                    }
                  }}
                />
                <span className="text-sm font-medium">{skill}</span>
              </label>
            ))}
          </div>
        )

      case 3:
        return (
          <div className="space-y-6">
            <div className="space-y-3">
              <Label>How much experience do you have?</Label>
              <Select
                value={profile.yearsOfExperience}
                onValueChange={(value) => updateProfile({ yearsOfExperience: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select experience" />
                </SelectTrigger>
                <SelectContent>
                  {EXPERIENCE_OPTIONS.map((option) => (
                    <SelectItem key={option} value={option}>{option}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-3">
              <Label>Where have you worked before?</Label>
              <RadioGroup
                value={profile.workBackground ?? ''}
                onValueChange={(value) => updateProfile({ workBackground: value })}
                className="space-y-2"
              >
                {WORK_BACKGROUND_OPTIONS.map((option) => (
                  <label
                    key={option}
                    className="flex items-center gap-3 p-4 rounded-lg border border-border bg-card hover:bg-muted/50 cursor-pointer transition-colors"
                  >
                    <RadioGroupItem value={option} />
                    <span className="text-sm font-medium">{option}</span>
                  </label>
                ))}
              </RadioGroup>
            </div>

            <div className="space-y-3">
              <Label>Approximately how many jobs have you completed?</Label>
              <RadioGroup
                value={profile.jobsCompleted ?? ''}
                onValueChange={(value) => updateProfile({ jobsCompleted: value })}
                className="space-y-2"
              >
                {JOBS_COMPLETED_OPTIONS.map((option) => (
                  <label
                    key={option}
                    className="flex items-center gap-3 p-4 rounded-lg border border-border bg-card hover:bg-muted/50 cursor-pointer transition-colors"
                  >
                    <RadioGroupItem value={option} />
                    <span className="text-sm font-medium">{option}</span>
                  </label>
                ))}
              </RadioGroup>
            </div>
          </div>
        )

      case 4:
        return (
          <div className="space-y-6">
            <div className="space-y-3">
              <Label>Do you have your own tools?</Label>
              <RadioGroup
                value={profile.toolsAvailability ?? ''}
                onValueChange={(value) => updateProfile({ toolsAvailability: value })}
                className="space-y-2"
              >
                {TOOLS_OPTIONS.map((option) => (
                  <label
                    key={option}
                    className="flex items-center gap-3 p-4 rounded-lg border border-border bg-card hover:bg-muted/50 cursor-pointer transition-colors"
                  >
                    <RadioGroupItem value={option} />
                    <span className="text-sm font-medium">{option}</span>
                  </label>
                ))}
              </RadioGroup>
            </div>

            <div className="space-y-3">
              <Label>Who will provide materials?</Label>
              <RadioGroup
                value={profile.materialHandling ?? ''}
                onValueChange={(value) => updateProfile({ materialHandling: value })}
                className="space-y-2"
              >
                {MATERIAL_HANDLING_OPTIONS.map((option) => (
                  <label
                    key={option}
                    className="flex items-center gap-3 p-4 rounded-lg border border-border bg-card hover:bg-muted/50 cursor-pointer transition-colors"
                  >
                    <RadioGroupItem value={option} />
                    <span className="text-sm font-medium">{option}</span>
                  </label>
                ))}
              </RadioGroup>
            </div>
          </div>
        )

      case 5:
        return (
          <div className="space-y-6">
            <div className="space-y-3">
              <Label>How do you want to work?</Label>
              <RadioGroup
                value={profile.workType ?? ''}
                onValueChange={(value) => updateProfile({ workType: value })}
                className="space-y-2"
              >
                {WORK_TYPE_OPTIONS.map((option) => (
                  <label
                    key={option}
                    className="flex items-center gap-3 p-4 rounded-lg border border-border bg-card hover:bg-muted/50 cursor-pointer transition-colors"
                  >
                    <RadioGroupItem value={option} />
                    <span className="text-sm font-medium">{option}</span>
                  </label>
                ))}
              </RadioGroup>
            </div>

            <div className="space-y-3">
              <Label>When are you usually available?</Label>
              <RadioGroup
                value={profile.availability ?? ''}
                onValueChange={(value) => updateProfile({ availability: value })}
                className="space-y-2"
              >
                {AVAILABILITY_OPTIONS.map((option) => (
                  <label
                    key={option}
                    className="flex items-center gap-3 p-4 rounded-lg border border-border bg-card hover:bg-muted/50 cursor-pointer transition-colors"
                  >
                    <RadioGroupItem value={option} />
                    <span className="text-sm font-medium">{option}</span>
                  </label>
                ))}
              </RadioGroup>
            </div>

            <div className="space-y-3">
              <Label>What type of jobs do you prefer? (Select all that apply)</Label>
              <div className="space-y-2">
                {JOB_PREFERENCE_OPTIONS.map((option) => (
                  <label
                    key={option}
                    className="flex items-center gap-3 p-4 rounded-lg border border-border bg-card hover:bg-muted/50 cursor-pointer transition-colors"
                  >
                    <Checkbox
                      checked={profile.jobPreference?.includes(option) ?? false}
                      onCheckedChange={(checked) => {
                        const current = profile.jobPreference ?? []
                        if (checked) {
                          updateProfile({ jobPreference: [...current, option] })
                        } else {
                          updateProfile({ jobPreference: current.filter(s => s !== option) })
                        }
                      }}
                    />
                    <span className="text-sm font-medium">{option}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        )

      case 6:
        return (
          <div className="space-y-6">
            <div className="space-y-3">
              <Label>How far can you travel?</Label>
              <RadioGroup
                value={profile.travelRange ?? ''}
                onValueChange={(value) => updateProfile({ travelRange: value })}
                className="space-y-2"
              >
                {TRAVEL_RANGE_OPTIONS.map((option) => (
                  <label
                    key={option}
                    className="flex items-center gap-3 p-4 rounded-lg border border-border bg-card hover:bg-muted/50 cursor-pointer transition-colors"
                  >
                    <RadioGroupItem value={option} />
                    <span className="text-sm font-medium">{option}</span>
                  </label>
                ))}
              </RadioGroup>
            </div>

            <div className="space-y-3">
              <Label>Are you willing to travel far if needed?</Label>
              <RadioGroup
                value={profile.travelWillingness ?? ''}
                onValueChange={(value) => updateProfile({ travelWillingness: value })}
                className="space-y-2"
              >
                {TRAVEL_WILLINGNESS_OPTIONS.map((option) => (
                  <label
                    key={option}
                    className="flex items-center gap-3 p-4 rounded-lg border border-border bg-card hover:bg-muted/50 cursor-pointer transition-colors"
                  >
                    <RadioGroupItem value={option} />
                    <span className="text-sm font-medium">{option}</span>
                  </label>
                ))}
              </RadioGroup>
            </div>

            <div className="space-y-3">
              <Label>Do you have your own vehicle?</Label>
              <RadioGroup
                value={profile.hasVehicle ?? ''}
                onValueChange={(value) => updateProfile({ hasVehicle: value })}
                className="space-y-2"
              >
                {VEHICLE_OPTIONS.map((option) => (
                  <label
                    key={option}
                    className="flex items-center gap-3 p-4 rounded-lg border border-border bg-card hover:bg-muted/50 cursor-pointer transition-colors"
                  >
                    <RadioGroupItem value={option} />
                    <span className="text-sm font-medium">{option}</span>
                  </label>
                ))}
              </RadioGroup>
            </div>
          </div>
        )

      case 7:
        return (
          <div className="space-y-3">
            <Label>Which languages can you speak? (Select all that apply)</Label>
            <div className="space-y-2">
              {LANGUAGE_OPTIONS.map((option) => (
                <label
                  key={option}
                  className="flex items-center gap-3 p-4 rounded-lg border border-border bg-card hover:bg-muted/50 cursor-pointer transition-colors"
                >
                  <Checkbox
                    checked={profile.languages?.includes(option) ?? false}
                    onCheckedChange={(checked) => {
                      const current = profile.languages ?? []
                      if (checked) {
                        updateProfile({ languages: [...current, option] })
                      } else {
                        updateProfile({ languages: current.filter(s => s !== option) })
                      }
                    }}
                  />
                  <span className="text-sm font-medium">{option}</span>
                </label>
              ))}
            </div>
          </div>
        )

      case 8:
        return (
          <div className="space-y-6">
            <div className="space-y-3">
              <Label>How do you prefer to get paid?</Label>
              <RadioGroup
                value={profile.paymentPreference ?? ''}
                onValueChange={(value) => updateProfile({ paymentPreference: value })}
                className="space-y-2"
              >
                {PAYMENT_PREFERENCE_OPTIONS.map((option) => (
                  <label
                    key={option}
                    className="flex items-center gap-3 p-4 rounded-lg border border-border bg-card hover:bg-muted/50 cursor-pointer transition-colors"
                  >
                    <RadioGroupItem value={option} />
                    <span className="text-sm font-medium">{option}</span>
                  </label>
                ))}
              </RadioGroup>
            </div>

            <div className="space-y-3">
              <Label>What is your expected minimum earning per day?</Label>
              <RadioGroup
                value={profile.expectedDailyIncome ?? ''}
                onValueChange={(value) => updateProfile({ expectedDailyIncome: value })}
                className="space-y-2"
              >
                {DAILY_INCOME_OPTIONS.map((option) => (
                  <label
                    key={option}
                    className="flex items-center gap-3 p-4 rounded-lg border border-border bg-card hover:bg-muted/50 cursor-pointer transition-colors"
                  >
                    <RadioGroupItem value={option} />
                    <span className="text-sm font-medium">{option}</span>
                  </label>
                ))}
              </RadioGroup>
            </div>
          </div>
        )

      case 9:
        return (
          <div className="space-y-6">
            <div className="space-y-3">
              <Label>Upload your ID proof</Label>
              <RadioGroup
                value={profile.idProofType ?? ''}
                onValueChange={(value) => updateProfile({ idProofType: value })}
                className="space-y-2"
              >
                {ID_PROOF_OPTIONS.map((option) => (
                  <label
                    key={option}
                    className="flex items-center gap-3 p-4 rounded-lg border border-border bg-card hover:bg-muted/50 cursor-pointer transition-colors"
                  >
                    <RadioGroupItem value={option} />
                    <span className="text-sm font-medium">{option}</span>
                  </label>
                ))}
              </RadioGroup>
              {profile.idProofType && (
                <Button variant="outline" className="w-full mt-2">
                  <Upload className="w-4 h-4 mr-2" />
                  Upload {profile.idProofType}
                </Button>
              )}
            </div>

            <div className="space-y-3">
              <Label>Do you have photos of your past work?</Label>
              <RadioGroup
                value={profile.hasWorkPhotos ?? ''}
                onValueChange={(value) => updateProfile({ hasWorkPhotos: value })}
                className="space-y-2"
              >
                <label className="flex items-center gap-3 p-4 rounded-lg border border-border bg-card hover:bg-muted/50 cursor-pointer transition-colors">
                  <RadioGroupItem value="yes" />
                  <span className="text-sm font-medium">Yes</span>
                </label>
                <label className="flex items-center gap-3 p-4 rounded-lg border border-border bg-card hover:bg-muted/50 cursor-pointer transition-colors">
                  <RadioGroupItem value="no" />
                  <span className="text-sm font-medium">No</span>
                </label>
              </RadioGroup>
              {profile.hasWorkPhotos === 'yes' && (
                <Button variant="outline" className="w-full mt-2">
                  <Camera className="w-4 h-4 mr-2" />
                  Upload Work Photos
                </Button>
              )}
            </div>

            <div className="space-y-3">
              <Label>Do you have any certification?</Label>
              <RadioGroup
                value={profile.hasCertification ?? ''}
                onValueChange={(value) => updateProfile({ hasCertification: value })}
                className="space-y-2"
              >
                <label className="flex items-center gap-3 p-4 rounded-lg border border-border bg-card hover:bg-muted/50 cursor-pointer transition-colors">
                  <RadioGroupItem value="yes" />
                  <span className="text-sm font-medium">Yes</span>
                </label>
                <label className="flex items-center gap-3 p-4 rounded-lg border border-border bg-card hover:bg-muted/50 cursor-pointer transition-colors">
                  <RadioGroupItem value="no" />
                  <span className="text-sm font-medium">No</span>
                </label>
              </RadioGroup>
            </div>
          </div>
        )

      case 10:
        return (
          <div className="space-y-6">
            <div className="space-y-3">
              <Label>If you accept a job, will you complete it on time?</Label>
              <RadioGroup
                value={profile.jobCommitment ?? ''}
                onValueChange={(value) => updateProfile({ jobCommitment: value })}
                className="space-y-2"
              >
                {COMMITMENT_OPTIONS.map((option) => (
                  <label
                    key={option}
                    className="flex items-center gap-3 p-4 rounded-lg border border-border bg-card hover:bg-muted/50 cursor-pointer transition-colors"
                  >
                    <RadioGroupItem value={option} />
                    <span className="text-sm font-medium">{option}</span>
                  </label>
                ))}
              </RadioGroup>
            </div>

            <div className="space-y-3">
              <Label>How often do you cancel jobs?</Label>
              <RadioGroup
                value={profile.cancellationBehavior ?? ''}
                onValueChange={(value) => updateProfile({ cancellationBehavior: value })}
                className="space-y-2"
              >
                {CANCELLATION_OPTIONS.map((option) => (
                  <label
                    key={option}
                    className="flex items-center gap-3 p-4 rounded-lg border border-border bg-card hover:bg-muted/50 cursor-pointer transition-colors"
                  >
                    <RadioGroupItem value={option} />
                    <span className="text-sm font-medium">{option}</span>
                  </label>
                ))}
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
      case 1: return 'What is your main skill?'
      case 2: return 'What other work can you do?'
      case 3: return 'Tell us about your experience'
      case 4: return 'Tools & Capability'
      case 5: return 'Availability & Work Preference'
      case 6: return 'Travel & Mobility'
      case 7: return 'Communication'
      case 8: return 'Pricing'
      case 9: return 'Trust & Verification'
      case 10: return 'Reliability'
      default: return ''
    }
  }

  const getStepSubtitle = () => {
    switch (step) {
      case 1: return 'Select your primary skill area'
      case 2: return 'Select all additional skills you have'
      case 3: return 'Help us understand your work history'
      case 4: return 'What tools and materials can you handle?'
      case 5: return 'When and how do you prefer to work?'
      case 6: return 'How far can you travel for work?'
      case 7: return 'Which languages do you speak?'
      case 8: return 'How do you want to get paid?'
      case 9: return 'Upload documents for verification'
      case 10: return 'Tell us about your work commitment'
      default: return ''
    }
  }

  if (isRegistration) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <header className="px-4 py-6 border-b border-border bg-card">
          <div className="max-w-md mx-auto flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-lg">W</span>
              </div>
              <span className="font-semibold text-xl text-foreground">WorkLink</span>
            </div>
            <Button 
              type="button"
              variant="ghost" 
              size="sm" 
              onClick={() => setCurrentStep('selection')}
              className="flex items-center gap-2 text-muted-foreground hover:text-foreground"
            >
              <Home className="w-4 h-4" />
              <span>Home</span>
            </Button>
          </div>
        </header>
        <main className="flex-1 px-4 py-8">
          <div className="max-w-md mx-auto">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-foreground mb-3 text-balance">
                Register as a Skilled Worker
              </h1>
              <p className="text-muted-foreground">
                Create your account to start finding work opportunities
              </p>
            </div>
            <Card>
              <CardHeader>
                <CardTitle>Basic Information</CardTitle>
                <CardDescription>
                  Please provide your details to get started
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleRegSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="reg-name">Full Name</Label>
                    <Input
                      id="reg-name"
                      placeholder="Enter your full name"
                      value={regName}
                      onChange={(e) => setRegName(e.target.value)}
                      className={regErrors.name ? 'border-destructive' : ''}
                    />
                    {regErrors.name && (
                      <p className="text-sm text-destructive">{regErrors.name}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="reg-phone">Phone Number</Label>
                    <Input
                      id="reg-phone"
                      type="tel"
                      placeholder="Enter 10-digit phone number"
                      value={regPhone}
                      onChange={(e) => setRegPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                      className={regErrors.phone ? 'border-destructive' : ''}
                    />
                    {regErrors.phone && (
                      <p className="text-sm text-destructive">{regErrors.phone}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="reg-password">Password</Label>
                    <Input
                      id="reg-password"
                      type="password"
                      placeholder="Create a password (min. 6 characters)"
                      value={regPassword}
                      onChange={(e) => setRegPassword(e.target.value)}
                      className={regErrors.password ? 'border-destructive' : ''}
                    />
                    {regErrors.password && (
                      <p className="text-sm text-destructive">{regErrors.password}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="reg-city">City</Label>
                    <Input
                      id="reg-city"
                      placeholder="Enter your city (e.g. Ludhiana)"
                      value={regCity}
                      onChange={(e) => setRegCity(e.target.value)}
                      className={regErrors.city ? 'border-destructive' : ''}
                    />
                    {regErrors.city && (
                      <p className="text-sm text-destructive">{regErrors.city}</p>
                    )}
                  </div>
                  <div className="space-y-4">
                    <div className="flex gap-2">
                      <Button type="button" variant="outline" onClick={() => setCurrentStep('sign-in')} className="flex-1">
                        Back
                      </Button>
                      <Button type="submit" className="flex-1">
                        Continue to Survey
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </Button>
                    </div>

                    {/* Development Buttons */}
                    <div className="grid grid-cols-2 gap-2 border-t pt-4">
                      <Button 
                        type="button" 
                        variant="outline" 
                        size="sm" 
                        className="text-[10px] bg-red-50 hover:bg-red-100 border-red-200 h-auto py-2"
                        onClick={() => autoFillWorker(false)}
                      >
                        DEV: Auto Gig (Ineligible)
                      </Button>
                      <Button 
                        type="button" 
                        variant="outline" 
                        size="sm" 
                        className="text-[10px] bg-green-50 hover:bg-green-100 border-green-200 h-auto py-2"
                        onClick={() => autoFillWorker(true)}
                      >
                        DEV: Auto Gig (Eligible)
                      </Button>
                    </div>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    )
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
      nextLabel={step === TOTAL_STEPS ? 'Complete Profile' : 'Continue'}
    >
      {renderStep()}
    </SurveyLayout>
  )
}
