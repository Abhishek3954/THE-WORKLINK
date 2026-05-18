'use client'

import { useWorkflow } from '@/lib/workflow-context'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { 
  Briefcase, Clock, MapPin, Star, Wallet, ChevronRight, User,
  Phone, Settings, Bell, Search, Filter, Zap, ArrowUpRight,
  CheckCircle2, CircleDot, Calendar, Info, X, AlertCircle, Package, Loader2
} from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'
import { useState, useEffect } from 'react'
import { GigWorkerProfile } from '@/components/gig-worker-profile'

const PRIMARY_SKILLS_MAP: Record<string, string> = {
  'other': 'Worker',
}

function renderImage(imageObj: any) {
  if (!imageObj) return null;
  // If the API already converted it to a base64 string
  if (typeof imageObj.data === 'string') return imageObj.data;
  
  if (!imageObj.data) return null;
  try {
    // Handle both Buffer and lean() object formats
    const binaryData = imageObj.data.data || imageObj.data;
    const base64String = typeof window !== 'undefined' 
      ? btoa(new Uint8Array(binaryData).reduce((data, byte) => data + String.fromCharCode(byte), ''))
      : Buffer.from(binaryData).toString('base64');
    return `data:${imageObj.contentType};base64,${base64String}`;
  } catch (err) {
    console.error("Image render error:", err);
    return null;
  }
}

const MOCK_JOBS = [
  { id: 1, title: 'AC Repair', location: 'Koramangala, 2.5 km', pay: '₹450', time: '2-3 hrs', urgent: true },
  { id: 2, title: 'Fan Installation', location: 'Indiranagar, 4 km', pay: '₹300', time: '1 hr', urgent: false },
  { id: 3, title: 'Wiring Check', location: 'HSR Layout, 3 km', pay: '₹500', time: '2 hrs', urgent: false },
]

export function GigWorkerDashboard() {
  const { workerData, setCurrentStep } = useWorkflow()
  const [activeTab, setActiveTab] = useState<'home' | 'jobs' | 'earnings' | 'profile'>(() => {
    if (typeof window !== 'undefined') {
      return (sessionStorage.getItem('worklink_activeTab') as any) || 'home'
    }
    return 'home'
  })
  const [dbName, setDbName] = useState(workerData.name)
  const [dbProfilePic, setDbProfilePic] = useState('')
  const [dbPrimarySkill, setDbPrimarySkill] = useState(
    workerData.gigProfile.primarySkill
      ? PRIMARY_SKILLS_MAP[workerData.gigProfile.primarySkill]
      : 'Worker'
  )
  const [isOnline, setIsOnline] = useState(false)
  const [jobs, setJobs] = useState<any[]>([])
  const [acceptedJobs, setAcceptedJobs] = useState<any[]>([])
  const [selectedConsumerPhone, setSelectedConsumerPhone] = useState<string | null>(null)
  const [loadingJobs, setLoadingJobs] = useState(false)
  const [showAcceptModal, setShowAcceptModal] = useState<any>(null)
  const [scheduledTime, setScheduledTime] = useState('')
  const [isAccepting, setIsAccepting] = useState(false)
  const [error, setError] = useState('')
  const [selectedFullImage, setSelectedFullImage] = useState<string | null>(null)

  // Tab persistence handled by lazy initialization

  const handleTabChange = (tab: 'home' | 'jobs' | 'earnings' | 'profile') => {
    setActiveTab(tab)
    sessionStorage.setItem('worklink_activeTab', tab)
  }

  useEffect(() => {
    const fetchWorkerData = async () => {
      try {
        const res = await fetch(`/api/getGigData?phone=${workerData.phone}`, { cache: 'no-store' })
        const json = await res.json()
        if (json.success && json.data) {
          setDbName(json.data.name)
          setDbProfilePic(json.data.profilePic || '')
          setDbPrimarySkill(
            json.data.primarySkill
              ? PRIMARY_SKILLS_MAP[json.data.primarySkill] || json.data.primarySkill
              : 'Worker'
          )
          setIsOnline(json.data.isOnline || false)
          
          // Sync context
          updateWorkerData({
            name: json.data.name,
            profileImage: json.data.profilePic || '',
            phone: json.data.phone
          })
        }
      } catch (err) {
        console.error("Fetch worker data error:", err)
      }
    }
    if (workerData.phone) {
      fetchWorkerData()
    }
  }, [workerData.phone])

  const toggleOnline = async () => {
    try {
      const res = await fetch('/api/worker/status', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: workerData.phone, isOnline: !isOnline })
      })
      const data = await res.json()
      if (data.success) {
        setIsOnline(data.isOnline)
      }
    } catch (err) {
      console.error("Toggle online error:", err)
    }
  }

  const fetchJobs = async () => {
    if (!workerData.phone) return
    setLoadingJobs(true)
    try {
      const res = await fetch(`/api/worker/jobs?phone=${workerData.phone}`, { cache: 'no-store' })
      const data = await res.json()
      if (data.success) {
        setJobs(data.data)
      }
    } catch (err) {
      console.error("Fetch jobs error:", err)
    } finally {
      setLoadingJobs(false)
    }
  }

  const [lastPaymentStatus, setLastPaymentStatus] = useState<Record<string, string>>({});
  const [paymentPopup, setPaymentPopup] = useState<{ isOpen: boolean, order: any, type: string } | null>(null);

  const fetchAcceptedJobs = async (excludeImages = false) => {
    if (!workerData.phone) return
    try {
      const res = await fetch(`/api/getWorkerAcceptedJobs?phone=${workerData.phone}${excludeImages ? '&excludeImages=true' : ''}`, { cache: 'no-store' })
      const data = await res.json()
      if (data.success) {
        // Detect payment/status/rating changes
        data.data.forEach((job: any) => {
          const prevStatus = lastPaymentStatus[job._id];
          
          // Case 1: Payment received
          if (prevStatus && prevStatus !== 'half' && job.paymentStatus === 'half') {
            setPaymentPopup({ 
              isOpen: true, 
              order: job, 
              type: 'Initial (50%)' 
            });
          }

          // Case 2: Final payment & Job completion & Rating
          if (prevStatus && prevStatus !== 'full' && job.paymentStatus === 'full') {
            setPaymentPopup({ 
              isOpen: true, 
              order: job, 
              type: 'Final (100%)' 
            });
          }
        });

        // Update tracking
        const newStatusMap: Record<string, string> = {};
        data.data.forEach((job: any) => {
          newStatusMap[job._id] = job.paymentStatus;
        });
        setLastPaymentStatus(newStatusMap);
        
        if (excludeImages) {
          setAcceptedJobs(prevJobs => {
            return data.data.map((newJob: any) => {
              const existingJob = prevJobs.find(j => j._id === newJob._id);
              if (existingJob && existingJob.image && !newJob.image) {
                return { ...newJob, image: existingJob.image };
              }
              return newJob;
            });
          });
        } else {
          setAcceptedJobs(data.data)
        }
      }
    } catch (err) {
      console.error("Fetch accepted jobs error:", err)
    }
  }

  useEffect(() => {
    if (activeTab === 'jobs') fetchJobs()
    if (activeTab === 'home') {
      fetchAcceptedJobs();
      // Poll every 5 seconds while on home tab to catch payments without image data overhead
      const interval = setInterval(() => fetchAcceptedJobs(true), 5000);
      return () => clearInterval(interval);
    }
  }, [activeTab, workerData.phone]);

  const handleAcceptJob = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!scheduledTime || !showAcceptModal) return
    setIsAccepting(true)
    setError('')

    try {
      const res = await fetch('/api/worker/accept', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          orderId: showAcceptModal._id, 
          workerPhone: workerData.phone, 
          scheduledTime 
        })
      })
      const data = await res.json()
      if (data.success) {
        setShowAcceptModal(null)
        setScheduledTime('')
        fetchJobs()
        handleTabChange('home')
      } else {
        setError(data.error || 'Failed to accept job')
      }
    } catch (err) {
      setError('Something went wrong')
    } finally {
      setIsAccepting(false)
    }
  }

  const primarySkill = dbPrimarySkill

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="bg-card border-b border-border px-4 py-3 sticky top-0 z-10">
        <div className="max-w-md mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-lg font-bold text-primary overflow-hidden shrink-0">
              {dbProfilePic ? (
                <img src={dbProfilePic} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                dbName.charAt(0).toUpperCase()
              )}
            </div>
            <div>
              <p className="font-semibold text-foreground text-sm">Hi, {dbName.split(' ')[0]}</p>
              <p className="text-xs text-muted-foreground">{primarySkill}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button className="w-10 h-10 rounded-full bg-muted flex items-center justify-center relative">
              <Bell className="w-5 h-5 text-muted-foreground" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-destructive rounded-full" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 px-4 py-4 pb-24 overflow-y-auto">
        <div className="max-w-md mx-auto space-y-5">
          
          {activeTab === 'home' && (
            <>
              {/* Status Banner */}
              <Card className="bg-primary/5 border-primary/20">
                <CardContent className="py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                      <CircleDot className={`w-6 h-6 ${isOnline ? 'text-success' : 'text-muted-foreground'}`} />
                    </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full ${isOnline ? 'bg-success animate-pulse' : 'bg-muted-foreground'}`} />
                    <span className="text-sm font-medium text-foreground">
                      {isOnline ? 'You are Online' : 'You are Offline'}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {isOnline ? 'Ready to receive job requests' : 'Go online to see customer jobs'}
                  </p>
                </div>
                <Button 
                  variant={isOnline ? "outline" : "default"} 
                  size="sm" 
                  className="text-xs"
                  onClick={toggleOnline}
                >
                  {isOnline ? 'Go Offline' : 'Go Online'}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Quick Stats */}
          <div className="grid grid-cols-3 gap-3">
            <Card className="text-center">
              <CardContent className="py-4 px-2">
                <p className="text-2xl font-bold text-foreground">0</p>
                <p className="text-xs text-muted-foreground mt-1">Jobs Done</p>
              </CardContent>
            </Card>
            <Card className="text-center">
              <CardContent className="py-4 px-2">
                <p className="text-2xl font-bold text-foreground">₹0</p>
                <p className="text-xs text-muted-foreground mt-1">Earned</p>
              </CardContent>
            </Card>
            <Card className="text-center">
              <CardContent className="py-4 px-2">
                <p className="text-2xl font-bold text-foreground">-</p>
                <p className="text-xs text-muted-foreground mt-1">Rating</p>
              </CardContent>
            </Card>
          </div>

          {/* Active Assignments */}
          {acceptedJobs.filter(j => j.status !== 'completed').length > 0 && (
            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between px-1">
                <h2 className="font-bold text-foreground">Active Assignments</h2>
                <span className="text-xs font-black text-purple-600 bg-purple-50 px-2 py-0.5 rounded-full">{acceptedJobs.filter(j => j.status !== 'completed').length}</span>
              </div>
              <div className="space-y-3">
                {acceptedJobs.filter(j => j.status !== 'completed').map((job) => (
                  <Card key={job._id} className="border-purple-100 bg-purple-50/20 shadow-sm relative overflow-hidden group">
                    <CardContent className="p-5">
                      <div className="flex items-start justify-between">
                        <div className="space-y-4 flex-1">
                          <div>
                            <div className="flex items-center gap-2 mb-2">
                              <Badge variant="secondary" className="bg-purple-600 text-white border-none uppercase text-[9px] font-black tracking-widest leading-none h-5 px-2">
                                {job.status === 'ongoing' ? 'WORK IN PROGRESS' : 'MATCHED'}
                              </Badge>
                              {job.isUrgent && (
                                <Badge className="bg-red-500 text-white border-0 text-[8px] font-black uppercase px-1.5 py-0 h-5">
                                  <AlertCircle className="w-2.5 h-2.5 mr-1" /> URGENT • {job.urgentHours}H
                                </Badge>
                              )}
                            </div>
                            <h3 className="text-lg font-black text-foreground leading-none">{job.mainSkill}</h3>
                          </div>
                          
                          <div className="space-y-2">
                            <div className="flex items-center gap-2 text-xs text-muted-foreground italic">
                              <Info className="w-3.5 h-3.5 text-purple-400" />
                              <p className="line-clamp-2">{job.description}</p>
                            </div>
                            <div className="flex justify-between items-center pr-4">
                              <div className="flex items-center gap-2 text-xs font-bold text-purple-600">
                                <Calendar className="w-4 h-4" />
                                <span>{new Date(job.scheduledTime || Date.now()).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}</span>
                              </div>
                              <Badge variant="outline" className="text-[10px] font-black bg-white border-purple-100 text-purple-600">
                                {job.paymentStatus === 'half' ? '50% PAID' : 'PENDING'}
                              </Badge>
                            </div>
                          </div>
                        </div>
                        {job.image && (
                          <button 
                            className="w-16 h-16 rounded-xl overflow-hidden bg-white border border-purple-100 flex-shrink-0 cursor-zoom-in hover:scale-105 transition-transform"
                            onClick={() => setSelectedFullImage(renderImage(job.image) || '')}
                          >
                            <img src={renderImage(job.image) || ''} alt="Job" className="w-full h-full object-cover" />
                          </button>
                        )}
                      </div>
                      <Button className={`w-full mt-5 font-black h-12 tracking-wider ${
                        job.status === 'ongoing' ? 'bg-indigo-600 hover:bg-indigo-700' : 'bg-gray-900 hover:bg-gray-800'
                      } text-white shadow-lg rounded-2xl`}>
                        {job.status === 'ongoing' ? 'RESUME SERVICE' : 'START SERVICE'}
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Job History */}
          {acceptedJobs.filter(j => j.status === 'completed').length > 0 && (
            <div className="pt-4 border-t border-border">
              <div className="flex items-center justify-between mb-4 px-1">
                <h2 className="font-bold text-foreground flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-success" />
                  Job History
                </h2>
                <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">{acceptedJobs.filter(j => j.status === 'completed').length} COMPLETED</span>
              </div>
              <div className="space-y-3">
                {acceptedJobs.filter(j => j.status === 'completed').map((job) => (
                  <Card key={job._id} className="p-4 border-dashed border-border bg-muted/20 group block">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-card border border-border flex items-center justify-center text-muted-foreground">
                          <CheckCircle2 className="w-5 h-5 text-success" />
                        </div>
                        <div>
                          <div className="flex flex-col items-start gap-1">
                            <h4 className="text-sm font-bold text-foreground">{job.mainSkill}</h4>
                            {job.isUrgent && (
                              <Badge className="bg-red-50 text-red-600 border border-red-100 text-[8px] font-black uppercase px-1 py-0 h-4 items-center flex inline-flex shadow-sm">
                                <AlertCircle className="w-2.5 h-2.5 mr-1" /> URGENT • {job.urgentHours}H
                              </Badge>
                            )}
                          </div>
                          <p className="text-[10px] text-muted-foreground font-medium mt-1">{new Date(job.updatedAt).toLocaleDateString()}</p>
                        </div>
                      </div>
                      <div className="text-right flex flex-col items-end gap-1">
                        <p className="text-sm font-black text-foreground">₹{job.budget}</p>
                        <div className="flex items-center gap-0.5">
                          {[1, 2, 3, 4, 5].map((s) => (
                            <Star key={s} className={`w-2.5 h-2.5 ${s <= (job.rating || 0) ? 'text-amber-400 fill-amber-400' : 'text-gray-200 fill-gray-200'}`} />
                          ))}
                        </div>
                      </div>
                    </div>
                    
                    <p className="text-xs text-muted-foreground italic mb-4 line-clamp-2 px-1">"{job.description}"</p>
                    
                    <div className="flex items-center justify-between pt-3 border-t border-border/50">
                      <Badge variant="outline" className="text-[9px] font-black bg-white text-muted-foreground border-border uppercase h-5">
                        COMPLETED
                      </Badge>
                      <Button 
                        size="sm" 
                        variant="ghost" 
                        className="h-7 text-[10px] font-bold text-primary hover:text-primary/80 p-0"
                        onClick={() => setSelectedConsumerPhone(job.consumerPhone)}
                      >
                        View Customer Profile <ChevronRight className="w-3 h-3 ml-1" />
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Upgrade Banner */}
          <Card className="border-2 border-primary overflow-hidden">
            <div className="bg-primary px-4 py-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Zap className="w-5 h-5 text-primary-foreground" />
                  <span className="font-semibold text-primary-foreground">Upgrade to WorkLink</span>
                </div>
                <ArrowUpRight className="w-4 h-4 text-primary-foreground" />
              </div>
            </div>
            <CardContent className="py-3">
              <p className="text-sm text-muted-foreground mb-3">
                Get priority jobs, higher pay, and insurance benefits
              </p>
              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                <span className="flex items-center gap-1"><CheckCircle2 className="w-3 h-3 text-success" /> More Jobs</span>
                <span className="flex items-center gap-1"><CheckCircle2 className="w-3 h-3 text-success" /> Better Pay</span>
                <span className="flex items-center gap-1"><CheckCircle2 className="w-3 h-3 text-success" /> Insurance</span>
              </div>
              <Button className="w-full mt-3" size="sm" onClick={() => setCurrentStep('worklink-eligibility')}>
                Check Eligibility
              </Button>
            </CardContent>
          </Card>

          {/* Available Jobs */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-semibold text-foreground">Jobs Near You</h2>
              <Button variant="ghost" size="sm" className="text-xs text-primary" onClick={fetchJobs}>
                Refresh
              </Button>
            </div>
            <div className="space-y-3">
              {jobs.length === 0 ? (
                <p className="text-center py-6 text-xs text-muted-foreground italic bg-muted rounded-xl">
                  {isOnline ? 'No matching jobs at the moment' : 'Go online to see available jobs'}
                </p>
              ) : (
                jobs.slice(0, 3).map((job) => (
                  <Card key={job._id} className="hover:border-primary/50 transition-colors cursor-pointer">
                    <CardContent className="py-3">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="font-bold text-foreground">{job.mainSkill}</h3>
                          <p className="text-xs text-muted-foreground line-clamp-1 mt-1">{job.description}</p>
                          <div className="flex items-center gap-3 mt-2 text-[10px] text-muted-foreground font-medium uppercase">
                            <span className="flex items-center gap-1">
                              <MapPin className="w-3 h-3 text-primary" />
                              Near You
                            </span>
                            <span className="flex items-center gap-1 text-success">
                              <Wallet className="w-3 h-3" />
                              ₹{job.budget}
                            </span>
                          </div>
                          {job.image && (
                            <button 
                              className="w-full h-24 rounded-lg overflow-hidden bg-muted my-2 cursor-zoom-in hover:ring-2 hover:ring-primary/40 transition"
                              onClick={() => setSelectedFullImage(renderImage(job.image) || '')}
                            >
                              <img src={renderImage(job.image) || ''} alt="Job" className="w-full h-full object-cover" />
                            </button>
                          )}
                        </div>
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="h-8 text-xs font-bold"
                          onClick={() => {
                            setShowAcceptModal(job)
                            handleTabChange('jobs')
                          }}
                        >
                          Details
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
            {jobs.length > 3 && (
              <Button variant="ghost" className="w-full mt-2 text-xs text-primary" onClick={() => setActiveTab('jobs')}>
                View all {jobs.length} jobs <ChevronRight className="w-3 h-3 ml-1" />
              </Button>
            )}
          </div>

          {/* How It Works */}
          <div>
            <h2 className="font-semibold text-foreground mb-3">How to Get Started</h2>
            <Card>
              <CardContent className="py-4">
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <span className="text-xs font-bold text-primary">1</span>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground">Stay Online</p>
                      <p className="text-xs text-muted-foreground">Keep your status online to receive job requests</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <span className="text-xs font-bold text-primary">2</span>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground">Accept Jobs</p>
                      <p className="text-xs text-muted-foreground">Accept jobs that match your skills and availability</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <span className="text-xs font-bold text-primary">3</span>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground">Complete & Earn</p>
                      <p className="text-xs text-muted-foreground">Finish the job, get rated, and receive payment</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions */}
          <div>
            <h2 className="font-semibold text-foreground mb-3">Quick Actions</h2>
            <div className="grid grid-cols-2 gap-3">
              <Card className="hover:bg-muted/50 transition-colors cursor-pointer">
                <CardContent className="py-4 text-center">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mx-auto mb-2">
                    <Calendar className="w-5 h-5 text-primary" />
                  </div>
                  <p className="text-sm font-medium text-foreground">My Schedule</p>
                  <p className="text-xs text-muted-foreground">View bookings</p>
                </CardContent>
              </Card>
              <Card className="hover:bg-muted/50 transition-colors cursor-pointer">
                <CardContent className="py-4 text-center">
                  <div className="w-10 h-10 rounded-lg bg-success/10 flex items-center justify-center mx-auto mb-2">
                    <Wallet className="w-5 h-5 text-success" />
                  </div>
                  <p className="text-sm font-medium text-foreground">Earnings</p>
                  <p className="text-xs text-muted-foreground">Track income</p>
                </CardContent>
              </Card>
              <Card className="hover:bg-muted/50 transition-colors cursor-pointer">
                <CardContent className="py-4 text-center">
                  <div className="w-10 h-10 rounded-lg bg-warning/10 flex items-center justify-center mx-auto mb-2">
                    <MapPin className="w-5 h-5 text-warning" />
                  </div>
                  <p className="text-sm font-medium text-foreground">Service Area</p>
                  <p className="text-xs text-muted-foreground">Update locations</p>
                </CardContent>
              </Card>
              <Card className="hover:bg-muted/50 transition-colors cursor-pointer">
                <CardContent className="py-4 text-center">
                  <div className="w-10 h-10 rounded-lg bg-chart-5/10 flex items-center justify-center mx-auto mb-2">
                    <Info className="w-5 h-5 text-chart-5" />
                  </div>
                  <p className="text-sm font-medium text-foreground">Help</p>
                  <p className="text-xs text-muted-foreground">Get support</p>
                </CardContent>
              </Card>
            </div>
          </div>
            </>
          )}

          {activeTab === 'profile' && <GigWorkerProfile />}

          {activeTab === 'jobs' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-foreground">Matched Jobs</h2>
                <Button variant="ghost" size="sm" className="text-xs" onClick={fetchJobs}>Refresh</Button>
              </div>
              
              {!isOnline && (
                <div className="p-6 bg-warning/5 border border-dashed border-warning/20 rounded-2xl text-center">
                  <p className="text-sm font-medium text-warning-foreground mb-1">Status: Offline</p>
                  <p className="text-xs text-muted-foreground">Go online to see job requests in your area</p>
                  <Button size="sm" className="mt-4 bg-warning hover:bg-warning/90 text-white" onClick={toggleOnline}>Go Online</Button>
                </div>
              )}

              {isOnline && (
                <div className="space-y-4">
                  {jobs.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12 text-center">
                      <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
                        <Zap className="w-8 h-8 text-muted-foreground/30" />
                      </div>
                      <p className="text-sm font-semibold text-foreground">No matching jobs found</p>
                      <p className="text-xs text-muted-foreground max-w-[200px] mt-1 italic">
                        Jobs appear here when customers need your skills.
                      </p>
                    </div>
                  ) : (
                    jobs.map((job) => (
                      <Card key={job._id} className="relative overflow-hidden group hover:border-primary/50 transition-all shadow-sm">
                        <div className="bg-primary/5 p-4">
                          <div className="flex items-center gap-2 mb-2">
                            <Badge className="bg-primary text-white border-0 text-[9px] font-bold uppercase tracking-wider">{job.mainSkill}</Badge>
                            {job.isUrgent && (
                              <Badge className="bg-red-500 text-white border-0 text-[8px] font-black uppercase px-1.5 py-0 h-5">
                                <AlertCircle className="w-2.5 h-2.5 mr-1" /> URGENT • {job.urgentHours}H
                              </Badge>
                            )}
                            <span className="text-sm font-black text-primary ml-auto">₹{job.budget}</span>
                          </div>
                          <h3 className="text-lg font-bold text-gray-900">{job.mainSkill}</h3>
                          <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> Near You</span>
                            <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {new Date(job.createdAt).toLocaleDateString()}</span>
                          </div>
                          {job.image && (
                            <button 
                              className="w-full h-32 rounded-lg overflow-hidden bg-muted my-3 border border-border cursor-zoom-in hover:ring-2 hover:ring-primary/40 transition"
                              onClick={() => setSelectedFullImage(renderImage(job.image) || '')}
                            >
                              <img src={renderImage(job.image) || ''} alt="Job" className="w-full h-full object-cover" />
                            </button>
                          )}
                        </div>
                        <CardContent className="p-4 pt-3">
                          <p className="text-xs text-gray-500 leading-relaxed mb-4 line-clamp-3">
                            {job.description}
                          </p>
                          <Button 
                            className="w-full bg-primary hover:bg-primary/90 rounded-xl font-bold h-11 shadow-lg shadow-primary/10"
                            onClick={() => setShowAcceptModal(job)}
                          >
                            Accept this Job
                          </Button>
                        </CardContent>
                      </Card>
                    ))
                  )}
                </div>
              )}
            </div>
          )}

          {activeTab === 'earnings' && (
            <div className="flex items-center justify-center p-8 text-muted-foreground text-sm">
              Earnings feature coming soon
            </div>
          )}

        </div>
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-card border-t border-border px-4 py-2 z-20">
        <div className="max-w-md mx-auto flex items-center justify-around">
          {[
            { id: 'home', icon: Briefcase, label: 'Home' },
            { id: 'jobs', icon: Search, label: 'Jobs' },
            { id: 'earnings', icon: Wallet, label: 'Earnings' },
            { id: 'profile', icon: User, label: 'Profile' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => handleTabChange(tab.id as typeof activeTab)}
              className={cn(
                "flex flex-col items-center gap-1 py-1 px-4",
                activeTab === tab.id ? "text-primary" : "text-muted-foreground"
              )}
            >
              <tab.icon className="w-5 h-5" />
              <span className="text-xs">{tab.label}</span>
            </button>
          ))}
        </div>
      </nav>

      {/* Modals */}
      <AcceptJobModal 
        job={showAcceptModal}
        isOpen={!!showAcceptModal}
        onClose={() => {
          setShowAcceptModal(null)
          setError('')
          setScheduledTime('')
        } }
        onAccept={handleAcceptJob}
        scheduledTime={scheduledTime}
        setScheduledTime={setScheduledTime}
        isAccepting={isAccepting}
        error={error}
      />

      {/* Full Image Preview Modal */}
      <Dialog open={!!selectedFullImage} onOpenChange={(open) => !open && setSelectedFullImage(null)}>
        <DialogContent className="max-w-3xl p-0 border-0 bg-transparent flex items-center justify-center">
          <DialogHeader className="sr-only">
            <DialogTitle>Image Preview</DialogTitle>
          </DialogHeader>
          {selectedFullImage && (
            <div className="relative group bg-white/10 backdrop-blur-md p-2 rounded-3xl">
              <img src={selectedFullImage} className="max-w-full max-h-[80vh] rounded-2xl shadow-2xl" alt="Enlarged view" />
              <button 
                onClick={() => setSelectedFullImage(null)}
                className="absolute -top-4 -right-4 w-10 h-10 bg-white shadow-xl rounded-full flex items-center justify-center text-gray-900"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          )}
        </DialogContent>
      </Dialog>
      
      <PaymentReceivedPopup 
        isOpen={paymentPopup ? paymentPopup.isOpen : false} 
        onClose={() => setPaymentPopup(null)} 
        order={paymentPopup ? paymentPopup.order : null}
        type={paymentPopup ? paymentPopup.type : ''}
      />

      <ConsumerDetailsModal 
        phone={selectedConsumerPhone} 
        onClose={() => setSelectedConsumerPhone(null)} 
      />
    </div>
  )
}

function PaymentReceivedPopup({ isOpen, onClose, order, type }: { isOpen: boolean, onClose: () => void, order: any, type: string }) {
  if (!order) return null;
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-xs bg-white rounded-3xl p-6 border-0 shadow-2xl animate-in zoom-in-95 duration-300">
        <DialogHeader className="flex flex-col items-center text-center">
          <div className="w-16 h-16 bg-green-50 rounded-2xl flex items-center justify-center mb-4">
             <div className="relative">
               <Wallet className="w-8 h-8 text-green-600" />
               <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full animate-ping" />
             </div>
          </div>
          <DialogTitle className="text-xl font-black text-gray-900 tracking-tight">Payment Received!</DialogTitle>
          <p className="text-sm font-medium text-gray-500 mt-2">
            You have received the <span className="font-bold text-green-600">{type}</span> payment for <span className="font-bold text-gray-900">{order.mainSkill}</span>.
          </p>
        </DialogHeader>
        <div className="bg-gray-50 rounded-2xl p-4 mt-6 text-center">
           <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Amount Added to Wallet</p>
           <p className="text-2xl font-black text-green-600">₹{order.budget / 2}</p>
        </div>
        <Button onClick={onClose} className="w-full h-12 rounded-2xl bg-gray-900 text-white font-bold mt-6 shadow-xl">Cool!</Button>
      </DialogContent>
    </Dialog>
  );
}

// ━━━━━━━━━━━━━━━━━━ ACCEPT MODAL ━━━━━━━━━━━━━━━━━━

function AcceptJobModal({ 
  job, 
  isOpen, 
  onClose, 
  onAccept, 
  scheduledTime, 
  setScheduledTime, 
  isAccepting, 
  error 
}: any) {
  if (!job) return null;

  const maxDate = job.isUrgent && job.urgentHours
    ? new Date(new Date(job.createdAt || Date.now()).getTime() + job.urgentHours * 60 * 60 * 1000)
    : new Date(new Date(job.createdAt || Date.now()).getTime() + 3 * 24 * 60 * 60 * 1000);

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md bg-white rounded-3xl p-6 border-0 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
        <DialogHeader className="mb-4">
          <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center mb-2">
            <Zap className="w-6 h-6 text-primary" />
          </div>
          <DialogTitle className="text-2xl font-black text-gray-900 tracking-tight">Accept Job Offer</DialogTitle>
          <DialogDescription className="text-sm font-medium text-gray-500">
            Set your available time to perform this {job.mainSkill} service.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={onAccept} className="space-y-5">
          <div className="bg-gray-50 rounded-2xl p-4 space-y-3">
             <div className="flex justify-between items-center text-xs font-bold uppercase tracking-widest text-gray-400">
               <span>Budget Offered</span>
               <span className="text-primary font-black text-sm">₹{job.budget}</span>
             </div>
             <p className="text-xs text-gray-600 italic leading-relaxed">"{job.description}"</p>
          </div>

          <div className="space-y-2">
            <Label className="text-[11px] font-bold uppercase tracking-widest text-gray-400 ml-1">When can you do this work?</Label>
            <div className="relative">
              <Calendar className="absolute left-4 top-4 w-4 h-4 text-gray-400" />
              <Input 
                type="datetime-local" 
                className="rounded-2xl border-gray-100 bg-gray-50/50 h-14 focus:ring-primary/20 pl-11"
                required
                min={new Date().toISOString().slice(0, 16)}
                max={maxDate.toISOString().slice(0, 16)}
                value={scheduledTime}
                onChange={(e) => setScheduledTime(e.target.value)}
              />
            </div>
            {job.isUrgent ? (
              <p className="text-[10px] text-red-500 font-bold ml-1 flex flex-col gap-0.5">
                <span>URGENT DEADLINE</span>
                <span className="text-gray-900">{maxDate.toLocaleString()}</span>
              </p>
            ) : (
              <p className="text-[10px] text-muted-foreground ml-1">Must be within 3 days: <span className="font-bold text-gray-900">
                {maxDate.toLocaleDateString()}
              </span></p>
            )}
          </div>

          {error && (
            <div className="bg-red-50 text-red-600 p-3 rounded-2xl text-[11px] font-bold uppercase items-center flex gap-2">
              <AlertCircle className="w-4 h-4" />
              {error}
            </div>
          )}

          <div className="flex gap-3 pt-4">
            <Button 
              type="button" 
              variant="ghost" 
              onClick={onClose} 
              className="flex-1 h-14 rounded-2xl font-bold text-gray-400 hover:bg-gray-50"
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={isAccepting}
              className="flex-1 h-14 rounded-2xl bg-primary hover:bg-primary/90 text-white font-bold shadow-lg shadow-primary/20"
            >
              {isAccepting ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Confirm & Accept'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// ━━━━━━━━━━━━━━━━━━ CONSUMER DETAILS MODAL ━━━━━━━━━━━━━━━━━━

function ConsumerDetailsModal({ phone, onClose }: { phone: string | null, onClose: () => void }) {
  const [consumer, setConsumer] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (phone) {
      setLoading(true);
      fetch(`/api/consumer/auth?phone=${phone}`)
        .then(res => res.json())
        .then(data => { if (data.success) setConsumer(data.data); setLoading(false); })
        .catch(() => setLoading(false));
    } else { setConsumer(null); }
  }, [phone]);

  return (
    <Dialog open={!!phone} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md bg-white rounded-3xl p-0 border-0 shadow-2xl overflow-hidden">
        {loading ? (
          <div className="p-12 flex flex-col items-center gap-4">
            <Loader2 className="w-8 h-8 text-primary animate-spin" />
            <p className="text-sm font-bold text-gray-400">Loading customer profile...</p>
          </div>
        ) : consumer ? (
          <div className="flex flex-col">
            <div className="h-24 bg-gradient-to-r from-primary to-indigo-600 relative p-6">
              <DialogHeader>
                <DialogTitle className="text-white font-black text-lg">Customer Profile</DialogTitle>
              </DialogHeader>
              <div className="absolute -bottom-10 left-6">
                <div className="w-20 h-20 rounded-2xl border-4 border-white overflow-hidden shadow-lg bg-gray-50 flex items-center justify-center">
                  {consumer.profileImage ? (
                    <img src={consumer.profileImage} className="w-full h-full object-cover" alt="Profile" />
                  ) : (
                    <div className="text-2xl font-black text-primary">{consumer.fullName[0]}</div>
                  )}
                </div>
              </div>
            </div>
            <div className="pt-12 px-6 pb-6 space-y-4">
              <div>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest leading-none mb-1">Full Name</p>
                <h3 className="text-xl font-black text-gray-900">{consumer.fullName}</h3>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <Label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Phone Number</Label>
                  <p className="text-sm font-bold text-gray-900 flex items-center gap-2">
                    <Phone className="w-3.5 h-3.5 text-primary" />
                    {consumer.phone}
                  </p>
                </div>
                <div className="space-y-1">
                  <Label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">City</Label>
                  <p className="text-sm font-bold text-gray-900 flex items-center gap-2">
                    <MapPin className="w-3.5 h-3.5 text-primary" />
                    {consumer.city || 'Not specified'}
                  </p>
                </div>
              </div>
              <div className="bg-primary/5 p-4 rounded-2xl border border-primary/10 flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center shadow-sm">
                  <CheckCircle2 className="w-5 h-5 text-success" />
                </div>
                <div>
                  <p className="text-xs font-bold text-gray-500 uppercase">Verified Customer</p>
                  <p className="text-[10px] text-muted-foreground">This user is a registered WorkLink consumer.</p>
                </div>
              </div>
              <Button className="w-full h-12 rounded-2xl bg-primary text-white font-bold" onClick={onClose}>Close Profile</Button>
            </div>
          </div>
        ) : <div className="p-12 text-center text-gray-500 font-bold">Customer profile not found</div>}
      </DialogContent>
    </Dialog>
  );
}

