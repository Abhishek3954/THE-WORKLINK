'use client'

import { useWorkflow } from '@/lib/workflow-context'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { 
  Briefcase, Clock, MapPin, Star, Wallet, ChevronRight, User,
  Phone, Settings, Bell, Search, Filter, Zap, ArrowUpRight,
  CheckCircle2, CircleDot, Calendar, Info, X, Loader2, Users, Trophy,
  AlertTriangle, RefreshCw, UserPlus, TrendingUp
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useState, useEffect } from 'react'
import { GigWorkerProfile } from '@/components/gig-worker-profile'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

const PRIMARY_SKILLS_MAP: Record<string, string> = {
  'other': 'Worker',
}

function renderImage(imageObj: any) {
  if (!imageObj) return null;
  if (typeof imageObj.data === 'string') return imageObj.data;
  
  if (!imageObj.data) return null;
  try {
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

export function WorkLinkEmployeeDashboard() {
  const { workerData, setCurrentStep, updateWorkerData } = useWorkflow()
  const [activeTab, setActiveTab] = useState<'home' | 'jobs' | 'earnings' | 'profile' | 'workforce'>(() => {
    if (typeof window !== 'undefined') {
      return (sessionStorage.getItem('worklink_employee_activeTab') as any) || 'home'
    }
    return 'home'
  })
  const [dbName, setDbName] = useState(workerData.name)
  const [dbProfilePic, setDbProfilePic] = useState('')
  const [dbPrimarySkill, setDbPrimarySkill] = useState('Worker')
  const [dbRank, setDbRank] = useState(0)
  const [dbRankPoints, setDbRankPoints] = useState(0)
  const [rankUpPopup, setRankUpPopup] = useState<{show: boolean, newRank: number}>({show: false, newRank: 0})
  const [dbCity, setDbCity] = useState('')
  const [dbEarnings, setDbEarnings] = useState<any>(null)
  const [isOnline, setIsOnline] = useState(false)
  const [jobs, setJobs] = useState<any[]>([])
  const [acceptedJobs, setAcceptedJobs] = useState<any[]>([])
  const [loadingJobs, setLoadingJobs] = useState(false)
  const [showAcceptModal, setShowAcceptModal] = useState<any>(null)
  const [scheduledTime, setScheduledTime] = useState('')
  const [isAccepting, setIsAccepting] = useState(false)
  const [error, setError] = useState('')
  const [selectedFullImage, setSelectedFullImage] = useState<string | null>(null)
  const [selectedConsumerPhone, setSelectedConsumerPhone] = useState<string | null>(null)

  // Recruitment States
  const [recruitType, setRecruitType] = useState<'none' | 'rookie' | 'mentor'>('none')
  const [availableWorkforce, setAvailableWorkforce] = useState<any[]>([])
  const [loadingWorkforce, setLoadingWorkforce] = useState(false)
  const [selectedRecruitPhone, setSelectedRecruitPhone] = useState<string | null>(null)
  const [recruitmentRequests, setRecruitmentRequests] = useState<any[]>([])
  const [loadingRequests, setLoadingRequests] = useState(false)

  // Decline handling states
  const [declinedOrders, setDeclinedOrders] = useState<any[]>([])
  const [showDeclineModal, setShowDeclineModal] = useState<any>(null)
  const [reRecruitType, setReRecruitType] = useState<'none' | 'rookie' | 'mentor'>('none')
  const [reAvailableWorkforce, setReAvailableWorkforce] = useState<any[]>([])
  const [reLoadingWorkforce, setReLoadingWorkforce] = useState(false)
  const [reSelectedPhone, setReSelectedPhone] = useState<string | null>(null)
  const [declineActionLoading, setDeclineActionLoading] = useState(false)

  const handleTabChange = (tab: 'home' | 'jobs' | 'earnings' | 'profile' | 'workforce') => {
    setActiveTab(tab)
    sessionStorage.setItem('worklink_employee_activeTab', tab)
  }

  const fetchEmployeeData = async () => {
    if (!workerData.phone) return
    try {
      const res = await fetch(`/api/worklink/profile?phone=${workerData.phone}`)
      const json = await res.json()
      if (json.success && json.data) {
        setDbName(json.data.name)
        setDbProfilePic(json.data.profilePic || '')
        setDbPrimarySkill(json.data.primarySkill || 'Employee')
        setIsOnline(json.data.isOnline || false)
        setDbRank(json.data.rank || 5)
        setDbRankPoints(json.data.rankPoints || 0)
        setDbCity(json.data.city || 'Ludhiana')
        setDbEarnings(json.data.earnings || null)
        
        // Check for rank upgrade notification
        if (json.data.rankUpgraded) {
          setRankUpPopup({ show: true, newRank: json.data.rank })
          // Clear the flag in the database
          fetch('/api/worklink/profile', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ phone: workerData.phone, rankUpgraded: false })
          })
        }
        
        // Sync context
        updateWorkerData({
          name: json.data.name,
          profileImage: json.data.profilePic || '',
          workerType: 'worklink',
          phone: json.data.phone
        })
      }
    } catch (err) {
      console.error("Fetch employee data error:", err)
    }
  }

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
      const res = await fetch(`/api/worker/jobs?phone=${workerData.phone}&priority=true`)
      const data = await res.json()
      if (data.success) {
        setJobs(data.data)
      }
    } catch (err) {
      console.error("Fetch priority jobs error:", err)
    } finally {
      setLoadingJobs(false)
    }
  }

  const [lastOrderState, setLastOrderState] = useState<Record<string, { status: string, rating?: number }>>({});
  const [completionPopup, setCompletionPopup] = useState<any>(null);

  const fetchAcceptedJobs = async () => {
    if (!workerData.phone) return
    try {
      const res = await fetch(`/api/getWorkerAcceptedJobs?phone=${workerData.phone}`)
      const data = await res.json()
      if (data.success) {
        // Detect status or rating changes
        data.data.forEach((job: any) => {
          const prevState = lastOrderState[job._id];
          if (prevState && prevState.status !== 'completed' && job.status === 'completed') {
            setCompletionPopup(job);
          }
          if (prevState && prevState.status === 'completed' && !prevState.rating && job.rating) {
            setCompletionPopup(job);
          }
        });

        // Update tracking
        const newStateMap: Record<string, { status: string, rating?: number }> = {};
        data.data.forEach((job: any) => {
          newStateMap[job._id] = { status: job.status, rating: job.rating };
        });
        setLastOrderState(newStateMap);
        setAcceptedJobs(data.data)
      }
    } catch (err) {
      console.error("Fetch accepted jobs error:", err)
    }
  }

  const fetchRequests = async () => {
    if (!workerData.phone) return
    setLoadingRequests(true)
    try {
      const res = await fetch(`/api/workforce/request?phone=${workerData.phone}`)
      const data = await res.json()
      if (data.success) {
        setRecruitmentRequests(data.data)
      }
    } catch (err) {
      console.error("Fetch requests error:", err)
    } finally {
      setLoadingRequests(false)
    }
  }

  const fetchDeclinedOrders = async () => {
    if (!workerData.phone) return
    try {
      const res = await fetch(`/api/workforce/request?phone=${workerData.phone}&type=declined`)
      const data = await res.json()
      if (data.success && data.data.length > 0) {
        setDeclinedOrders(data.data)
        // Auto-show the first declined order popup
        if (!showDeclineModal) {
          setShowDeclineModal(data.data[0])
        }
      } else {
        setDeclinedOrders([])
      }
    } catch (err) {
      console.error("Fetch declined orders error:", err)
    }
  }

  const handleWorkAlone = async (orderId: string) => {
    setDeclineActionLoading(true)
    try {
      const res = await fetch('/api/workforce/request', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId, action: 'work_alone' })
      })
      const data = await res.json()
      if (data.success) {
        setShowDeclineModal(null)
        setDeclinedOrders(prev => prev.filter(o => o.orderId !== orderId))
        fetchAcceptedJobs()
        handleTabChange('home')
      }
    } catch (err) {
      console.error("Work alone error:", err)
    } finally {
      setDeclineActionLoading(false)
    }
  }

  const handleReRequest = async (orderId: string) => {
    if (!reSelectedPhone || reRecruitType === 'none') return
    setDeclineActionLoading(true)
    try {
      const res = await fetch('/api/workforce/request', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId,
          action: 're_request',
          recruitedPhone: reSelectedPhone,
          recruitmentType: reRecruitType
        })
      })
      const data = await res.json()
      if (data.success) {
        setShowDeclineModal(null)
        setReRecruitType('none')
        setReSelectedPhone(null)
        setReAvailableWorkforce([])
        setDeclinedOrders(prev => prev.filter(o => o.orderId !== orderId))
      }
    } catch (err) {
      console.error("Re-request error:", err)
    } finally {
      setDeclineActionLoading(false)
    }
  }

  useEffect(() => {
    if (workerData.phone) fetchEmployeeData()
  }, [workerData.phone])

  useEffect(() => {
    if (activeTab === 'jobs') fetchJobs()
    if (activeTab === 'workforce') fetchRequests()
    if (activeTab === 'home') {
      fetchAcceptedJobs();
      fetchDeclinedOrders();
      fetchEmployeeData();
      const interval = setInterval(() => {
        fetchAcceptedJobs();
        fetchDeclinedOrders();
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [activeTab, workerData.phone]);

  useEffect(() => {
    const fetchWorkforce = async () => {
      if (recruitType !== 'none' && workerData.phone) {
        setLoadingWorkforce(true)
        setSelectedRecruitPhone(null)
        try {
          const res = await fetch(`/api/workforce/available?phone=${workerData.phone}&type=${recruitType}&city=${dbCity}`)
          const data = await res.json()
          if (data.success) {
            setAvailableWorkforce(data.data)
          }
        } catch (err) {
          console.error("Fetch workforce error:", err)
        } finally {
          setLoadingWorkforce(false)
        }
      }
    }
    fetchWorkforce()
  }, [recruitType, workerData.phone, dbCity])

  // Fetch available workforce for re-recruitment
  useEffect(() => {
    const fetchReWorkforce = async () => {
      if (reRecruitType !== 'none' && workerData.phone) {
        setReLoadingWorkforce(true)
        setReSelectedPhone(null)
        try {
          const res = await fetch(`/api/workforce/available?phone=${workerData.phone}&type=${reRecruitType}&city=${dbCity}`)
          const data = await res.json()
          if (data.success) {
            setReAvailableWorkforce(data.data)
          }
        } catch (err) {
          console.error("Fetch re-workforce error:", err)
        } finally {
          setReLoadingWorkforce(false)
        }
      }
    }
    fetchReWorkforce()
  }, [reRecruitType, workerData.phone, dbCity])

  const handleHandleRequest = async (orderId: string, status: 'accepted' | 'declined') => {
    try {
      const res = await fetch('/api/workforce/request', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId, status })
      })
      const data = await res.json()
      if (data.success) {
        fetchRequests()
        fetchEmployeeData()
        if (status === 'accepted') handleTabChange('home')
      }
    } catch (err) {
      console.error("Handle request error:", err)
    }
  }

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
          scheduledTime,
          hasRecruitment: recruitType !== 'none' && !!selectedRecruitPhone
        })
      })
      const data = await res.json()
      if (data.success) {
        if (recruitType !== 'none' && selectedRecruitPhone) {
          await fetch('/api/workforce/request', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              orderId: showAcceptModal._id,
              recruiterPhone: workerData.phone,
              recruitedPhone: selectedRecruitPhone,
              type: recruitType
            })
          })
        }
        setShowAcceptModal(null)
        setScheduledTime('')
        setRecruitType('none')
        setSelectedRecruitPhone(null)
        fetchJobs()
        // Only go to home if not recruiting (recruitment_pending orders shouldn't show on home)
        if (recruitType === 'none' || !selectedRecruitPhone) {
          handleTabChange('home')
        } else {
          fetchAcceptedJobs()
        }
      } else {
        setError(data.error || 'Failed to accept job')
      }
    } catch (err) {
      setError('Something went wrong')
    } finally {
      setIsAccepting(false)
    }
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header - Styled like Gig Dashboard but with violet accents */}
      <header className="bg-card border-b border-border px-4 py-3 sticky top-0 z-10">
        <div className="max-w-md mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-violet-100 flex items-center justify-center text-lg font-bold text-violet-600 overflow-hidden shrink-0 border border-violet-200">
              {dbProfilePic ? (
                <img src={dbProfilePic} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                dbName.charAt(0).toUpperCase()
              )}
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <p className="font-semibold text-foreground text-sm">Hi, {dbName.split(' ')[0]}</p>
                <div className="px-1.5 py-0.5 rounded-full bg-violet-600 text-white text-[8px] font-black uppercase flex items-center gap-0.5">
                   Rank {dbRank}
                </div>
              </div>
              <div className="flex items-center gap-2 mt-0.5">
                <p className="text-xs text-muted-foreground">{dbPrimarySkill}</p>
                {dbRank < 4 && (
                  <div className="flex items-center gap-1">
                    <div className="w-16 h-1.5 bg-violet-100 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-violet-500 to-violet-600 rounded-full transition-all duration-1000 ease-out"
                        style={{ width: `${dbRankPoints}%` }}
                      />
                    </div>
                    <span className="text-[8px] font-bold text-violet-400">{dbRankPoints}/100</span>
                  </div>
                )}
              </div>
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
              {/* Status Banner - Gig Style but violet */}
              <Card className="bg-violet-50/50 border-violet-100 shadow-sm">
                <CardContent className="py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-violet-100 flex items-center justify-center">
                      <CircleDot className={`w-6 h-6 ${isOnline ? 'text-violet-600' : 'text-muted-foreground'}`} />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className={`w-2 h-2 rounded-full ${isOnline ? 'bg-violet-600 animate-pulse' : 'bg-muted-foreground'}`} />
                        <span className="text-sm font-medium text-foreground">
                          {isOnline ? 'Active & Ready' : 'System Offline'}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {isOnline ? 'You are receiving priority matches' : 'Enable to access high-priority jobs'}
                      </p>
                    </div>
                    <Button 
                      variant={isOnline ? "outline" : "default"} 
                      size="sm" 
                      className={cn("text-xs", !isOnline && "bg-violet-600 hover:bg-violet-700")}
                      onClick={toggleOnline}
                    >
                      {isOnline ? 'OFF' : 'ON'}
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Stats Grid - Gig Style */}
                <Card className="text-center shadow-sm">
                  <CardContent className="py-5 px-2">
                    <p className="text-2xl font-black text-foreground">{acceptedJobs.filter(j => j.status === 'completed').length}</p>
                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mt-1">Jobs Done</p>
                  </CardContent>
                </Card>
                <Card className="text-center shadow-sm">
                  <CardContent className="py-5 px-2">
                    <p className="text-2xl font-black text-foreground">₹{dbEarnings?.balance || 0}</p>
                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mt-1">Earnings</p>
                  </CardContent>
                </Card>

              {/* Active Assignments - exclude recruitment_pending */}
              {acceptedJobs.filter(j => j.status === 'accepted' || j.status === 'ongoing').length > 0 && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h2 className="font-bold text-foreground">My Assignments</h2>
                    <span className="text-xs font-black text-violet-600 bg-violet-50 px-2 py-0.5 rounded-full">{acceptedJobs.filter(j => j.status === 'accepted' || j.status === 'ongoing').length}</span>
                  </div>
                  <div className="space-y-3">
                    {acceptedJobs.filter(j => j.status === 'accepted' || j.status === 'ongoing').map((job) => (
                      <Card key={job._id} className="border-violet-100 bg-violet-50/20 shadow-sm relative overflow-hidden group">
                        <CardContent className="p-5">
                          <div className="flex items-start justify-between">
                            <div className="space-y-4 flex-1">
                              <div>
                                <div className="flex items-center gap-2 mb-2">
                                  <Badge variant="secondary" className={`border-none uppercase text-[10px] h-6 px-4 font-black tracking-widest ${
                                    job.status === 'ongoing' ? 'bg-indigo-600 text-white shadow-md' : 'bg-violet-600 text-white'
                                  }`}>
                                    {job.status === 'ongoing' ? 'ASSIGNMENT ONGOING' : 'Priority Order'}
                                  </Badge>
                                  {job.isUrgent && (
                                    <Badge className="bg-red-500 text-white border-0 text-[8px] font-black uppercase px-2 h-6">
                                      <Zap className="w-2.5 h-2.5 mr-1" /> URGENT • {job.urgentHours}H
                                    </Badge>
                                  )}
                                </div>
                                <h3 className="text-lg font-black text-foreground leading-none">{job.mainSkill}</h3>
                              </div>
                              
                              <div className="space-y-2">
                                <div className="flex items-center gap-2 text-xs text-muted-foreground italic">
                                  <Info className="w-3.5 h-3.5 text-violet-400" />
                                  <p className="line-clamp-2">{job.description}</p>
                                </div>
                                <div className="flex justify-between items-center">
                                  <div className="flex items-center gap-2 text-xs font-bold text-violet-600">
                                    <Calendar className="w-4 h-4" />
                                    <span>{new Date(job.scheduledTime).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}</span>
                                  </div>
                                  <Badge variant="outline" className="text-[9px] font-black bg-white border-violet-200 text-violet-600 h-5">
                                    {job.paymentStatus === 'half' ? '50% PAID' : 'PENDING'}
                                  </Badge>
                                </div>
                              </div>
                            </div>
                            {job.image && (
                              <button 
                                className="w-16 h-16 rounded-xl overflow-hidden bg-white border border-violet-100 flex-shrink-0 cursor-zoom-in group-hover:scale-105 transition-transform"
                                onClick={() => setSelectedFullImage(renderImage(job.image) || '')}
                              >
                                <img src={renderImage(job.image) || ''} alt="Job" className="w-full h-full object-cover" />
                              </button>
                            )}
                          </div>
                          <Button 
                            className={`w-full mt-5 font-black h-12 tracking-wider rounded-2xl ${
                              job.status === 'ongoing' ? 'bg-indigo-600 hover:bg-indigo-700' : 'bg-slate-900 hover:bg-slate-800'
                            }`}
                          >
                            {job.status === 'ongoing' ? 'RESUME PROTOCOL' : 'START PROTOCOL'}
                          </Button>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              )}

              {/* Awaiting Recruitment Response - recruitment_pending orders */}
              {acceptedJobs.filter(j => j.status === 'recruitment_pending').length > 0 && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h2 className="font-bold text-foreground flex items-center gap-2">
                      <Users className="w-4 h-4 text-amber-500" />
                      Awaiting Recruitment
                    </h2>
                    <Badge className="bg-amber-100 text-amber-700 border-amber-200 text-[8px] font-black uppercase">
                      PENDING RESPONSE
                    </Badge>
                  </div>
                  <div className="space-y-3">
                    {acceptedJobs.filter(j => j.status === 'recruitment_pending').map((job) => (
                      <Card key={job._id} className="border-amber-100 bg-amber-50/20 shadow-sm relative overflow-hidden">
                        <CardContent className="p-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center">
                              <Clock className="w-5 h-5 text-amber-600" />
                            </div>
                            <div className="flex-1">
                              <h4 className="text-sm font-bold text-foreground">{job.mainSkill}</h4>
                              <p className="text-[10px] text-muted-foreground mt-0.5">
                                Waiting for {job.recruitmentType} to accept • ₹{job.budget}
                              </p>
                            </div>
                            <div className="w-2 h-2 bg-amber-400 rounded-full animate-pulse" />
                          </div>
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
                      <CheckCircle2 className="w-4 h-4 text-violet-500" />
                      Assignment History
                    </h2>
                    <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">{acceptedJobs.filter(j => j.status === 'completed').length} DONE</span>
                  </div>
                  <div className="space-y-3">
                    {acceptedJobs.filter(j => j.status === 'completed').map((job) => (
                      <Card key={job._id} className="p-4 border-dashed border-border bg-slate-50/50 group block">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-xl bg-white border border-border flex items-center justify-center text-muted-foreground">
                              <CheckCircle2 className="w-5 h-5 text-violet-500" />
                            </div>
                            <div>
                              <div className="flex flex-col items-start gap-1">
                                <h4 className="text-sm font-bold text-foreground">{job.mainSkill}</h4>
                                {job.isUrgent && (
                                  <Badge className="bg-red-50 text-red-600 border border-red-100 text-[8px] font-black uppercase px-1.5 py-0 h-4 items-center flex inline-flex shadow-sm">
                                    <Zap className="w-2 h-2 mr-1" /> URGENT • {job.urgentHours}H
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
                                <Star key={s} className={`w-2.5 h-2.5 ${s <= (job.rating || 0) ? 'text-amber-400 fill-amber-400' : 'text-slate-200 fill-slate-200'}`} />
                              ))}
                            </div>
                          </div>
                        </div>

                        <p className="text-xs text-slate-500 italic mb-4 line-clamp-2 px-1">"{job.description}"</p>

                        <div className="flex items-center justify-between pt-3 border-t border-border/50">
                          <Badge variant="outline" className="text-[9px] font-black bg-white text-muted-foreground border-border uppercase h-5">
                            COMPLETED
                          </Badge>
                          <Button 
                            size="sm" 
                            variant="ghost" 
                            className="h-7 text-[10px] font-bold text-violet-600 hover:text-violet-700 p-0"
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

              {acceptedJobs.filter(j => j.status === 'accepted' || j.status === 'ongoing').length === 0 && acceptedJobs.filter(j => j.status === 'recruitment_pending').length === 0 && (
                 <div className="p-8 bg-muted/30 rounded-3xl border border-dashed border-border text-center">
                    <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-sm border border-border">
                        <Search className="w-6 h-6 text-muted-foreground" />
                    </div>
                    <p className="text-sm font-bold text-slate-900 mb-1 leading-none uppercase tracking-tight">Looking for matches...</p>
                    <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-widest">Priority assignments will appear here</p>
                 </div>
              )}
            </>
          )}

          {activeTab === 'jobs' && (
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <h2 className="text-xl font-black text-foreground tracking-tight">Priority Matches</h2>
                    <Button variant="ghost" size="sm" className="font-bold text-violet-600 text-xs" onClick={fetchJobs}>
                        Refresh
                    </Button>
                </div>

                {!isOnline ? (
                    <div className="py-12 px-6 bg-slate-50 border border-dashed border-border rounded-3xl text-center">
                        <Zap className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
                        <h3 className="text-sm font-black text-slate-800 uppercase tracking-tight mb-1">Status: Offline</h3>
                        <p className="text-[11px] text-muted-foreground font-medium mb-6">Switch to online status to access high-priority prioritized work orders.</p>
                        <Button className="bg-violet-600 hover:bg-violet-700 text-white font-black px-8 h-11 rounded-xl" onClick={toggleOnline}>Go Online</Button>
                    </div>
                ) : (
                    <div className="grid gap-4">
                        {loadingJobs ? (
                            <div className="flex flex-col items-center justify-center py-20">
                                <span className="animate-spin rounded-full h-8 w-8 border-b-2 border-violet-600 mb-4" />
                                <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">System Scan Active...</p>
                            </div>
                        ) : jobs.length === 0 ? (
                            <div className="py-20 text-center">
                                <p className="text-sm font-bold text-muted-foreground uppercase tracking-wider italic">No priority matches right now.</p>
                            </div>
                        ) : (
                            jobs.map((job) => (
                                <Card key={job._id} className="relative overflow-hidden group hover:border-violet-300 transition-all shadow-sm">
                                    <div className="bg-violet-50/30 p-4 border-b border-violet-100">
                                        <div className="flex justify-between items-start mb-2">
                                            <div className="flex items-center gap-2">
                                              <Badge className="bg-white text-violet-600 border border-violet-100 text-[9px] font-black uppercase tracking-widest px-2 h-6">Verified Offer</Badge>
                                              {job.isUrgent && (
                                                <Badge className="bg-red-500 text-white border-0 text-[8px] font-black uppercase px-2 h-6">
                                                  <Zap className="w-2.5 h-2.5 mr-1" /> URGENT • {job.urgentHours}H
                                                </Badge>
                                              )}
                                            </div>
                                            <div className="text-right">
                                                <p className="text-[10px] font-black text-violet-400 leading-none">EST. PAYOUT</p>
                                                <p className="text-xl font-black text-violet-600">₹{job.budget}</p>
                                            </div>
                                        </div>
                                        <h3 className="text-lg font-black text-slate-900 leading-tight">{job.mainSkill}</h3>
                                        <div className="flex items-center gap-3 mt-2 text-[10px] font-black text-muted-foreground uppercase tracking-widest">
                                            <span className="flex items-center gap-1"><MapPin className="w-3 h-3 text-violet-400" /> Near You</span>
                                            <span className="flex items-center gap-1"><Clock className="w-3 h-3 text-violet-400" /> Fast Action</span>
                                        </div>
                                    </div>
                                    <CardContent className="p-4">
                                        {job.image && (
                                          <button 
                                            className="w-full h-32 rounded-2xl overflow-hidden bg-muted mb-4 border border-border cursor-zoom-in group-hover:ring-2 group-hover:ring-violet-400/30 transition-all"
                                            onClick={() => setSelectedFullImage(renderImage(job.image) || '')}
                                          >
                                            <img src={renderImage(job.image) || ''} alt="Job" className="w-full h-full object-cover" />
                                          </button>
                                        )}
                                        <p className="text-xs text-slate-500 font-medium mb-4 line-clamp-2 italic">
                                            "{job.description}"
                                        </p>
                                        <Button 
                                            className="w-full bg-violet-600 hover:bg-violet-700 text-white font-black h-12 shadow-lg shadow-violet-100 capitalize text-sm tracking-wide"
                                            onClick={() => setShowAcceptModal(job)}
                                        >
                                            Verify & Accept
                                        </Button>
                                    </CardContent>
                                </Card>
                            ))
                        )}
                    </div>
                )}
            </div>
          )}

          {activeTab === 'profile' && <GigWorkerProfile />}

          {activeTab === 'earnings' && (
            <div className="space-y-6">
              <div className="text-center py-6">
                <h2 className="text-3xl font-black text-slate-900 leading-none">₹{dbEarnings?.balance || 0}</h2>
                <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mt-2">Total Managed Balance</p>
              </div>

              {/* Bonus Section */}
              <div className="space-y-3">
                <div className="flex items-center justify-between px-1">
                  <h3 className="font-bold text-slate-900 flex items-center gap-2">
                    <Trophy className="w-4 h-4 text-amber-500" />
                    Bonus Earnings
                  </h3>
                  <span className="text-[9px] font-black text-violet-600 bg-violet-50 px-2 py-0.5 rounded-full">WORKFORCE REWARDS</span>
                </div>

                {dbEarnings?.bonuses?.length > 0 ? (
                  <div className="space-y-2">
                    {dbEarnings.bonuses.map((bonus: any, idx: number) => (
                      <Card key={idx} className="border-border/50 shadow-none bg-slate-50/50">
                        <CardContent className="p-3">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center">
                                <Zap className="w-4 h-4 text-amber-600" />
                              </div>
                              <div>
                                <p className="text-xs font-bold text-slate-900">{bonus.type}</p>
                                <p className="text-[10px] text-muted-foreground uppercase">{new Date(bonus.date).toLocaleDateString()}</p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="text-sm font-black text-green-600">+₹{bonus.amount}</p>
                              <Badge className="bg-amber-100 text-amber-700 border-none text-[8px] h-4 font-black">BONUS</Badge>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="p-10 border border-dashed border-border rounded-3xl text-center bg-muted/20">
                    <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">No bonuses earned yet</p>
                  </div>
                )}
              </div>

              <div className="pt-20 text-center space-y-4">
                <div className="w-16 h-16 bg-muted rounded-2xl flex items-center justify-center mx-auto mb-2 shadow-sm border border-border">
                  <Wallet className="w-8 h-8 text-muted-foreground" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-slate-800 uppercase tracking-tight leading-none mb-1">Earning Protocol</h3>
                  <p className="text-[11px] text-muted-foreground font-medium uppercase tracking-widest px-10">Payroll tracking and payout settings are coming soon for employees.</p>
                </div>
                <Button variant="outline" className="border-border text-slate-600 font-black h-10 px-6 rounded-xl text-[11px] tracking-widest">VIEW HISTORY</Button>
              </div>
            </div>
          )}

          {activeTab === 'workforce' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-black text-foreground tracking-tight">Workforce Development</h2>
                <Badge className="bg-violet-600 text-white uppercase text-[8px] font-black">PENDING REQUESTS</Badge>
              </div>

              {loadingRequests ? (
                <div className="py-20 flex flex-col items-center">
                  <Loader2 className="w-8 h-8 text-violet-600 animate-spin mb-4" />
                  <p className="text-[10px] font-black text-muted-foreground uppercase">Scanning for invitations...</p>
                </div>
              ) : recruitmentRequests.length === 0 ? (
                <div className="py-20 text-center bg-slate-50 border border-dashed border-border rounded-3xl">
                  <Users className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
                  <p className="text-sm font-bold text-slate-800 uppercase tracking-tight mb-1">No Active Requests</p>
                  <p className="text-[10px] text-muted-foreground font-medium px-12">Recruitment invitations from other employees will appear here.</p>
                </div>
              ) : (
                <div className="space-y-4">
                   {recruitmentRequests.map((req) => (
                     <Card key={req.orderId} className="border-violet-200 bg-violet-50/20 shadow-sm relative overflow-hidden">
                        <div className="p-5">
                          <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-xl bg-white border border-violet-100 flex items-center justify-center overflow-hidden">
                                {req.recruiterImage ? <img src={req.recruiterImage} className="w-full h-full object-cover" /> : <User className="text-violet-400" />}
                              </div>
                              <div>
                                <h4 className="text-sm font-black text-slate-900 leading-tight">{req.recruiterName}</h4>
                                <div className="flex items-center gap-1.5 mt-0.5">
                                   <Badge className="bg-violet-600 text-white text-[8px] h-3.5 px-1 font-black">RANK {req.recruiterRank}</Badge>
                                   <p className="text-[9px] font-bold text-muted-foreground uppercase">Needs a {req.type}</p>
                                </div>
                              </div>
                            </div>
                            <div className="text-right">
                               <p className="text-[8px] font-black text-violet-500 uppercase">Shared Budget</p>
                               <p className="text-lg font-black text-slate-900 leading-none">₹{req.budget}</p>
                            </div>
                          </div>
                          
                          <div className="bg-white rounded-xl p-3 border border-violet-100 mb-4">
                             <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">JOB PROTOCOL</p>
                             <p className="text-xs font-bold text-slate-700">{req.mainSkill}</p>
                          </div>

                          <div className="flex gap-2">
                             <Button 
                               variant="outline" 
                               className="flex-1 h-10 rounded-xl font-bold text-[10px] uppercase border-red-100 text-red-500 hover:bg-red-50"
                               onClick={() => handleHandleRequest(req.orderId, 'declined')}
                             >
                               Decline
                             </Button>
                             <Button 
                               className="flex-1 h-10 rounded-xl bg-violet-600 hover:bg-violet-700 font-bold text-[10px] uppercase shadow-md shadow-violet-100"
                               onClick={() => handleHandleRequest(req.orderId, 'accepted')}
                             >
                               Accept & Join
                             </Button>
                          </div>
                        </div>
                     </Card>
                   ))}
                </div>
              )}
            </div>
          )}

        </div>
      </main>

      {/* Bottom Navigation - Gig Style */}
      <nav className="fixed bottom-0 left-0 right-0 bg-card border-t border-border px-4 py-2 z-20">
        <div className="max-w-md mx-auto flex items-center justify-around">
          {[
            { id: 'home', icon: Briefcase, label: 'Home' },
            { id: 'jobs', icon: Search, label: 'Jobs' },
            { id: 'workforce', icon: Users, label: 'Workforce' },
            { id: 'earnings', icon: Wallet, label: 'Earnings' },
            { id: 'profile', icon: User, label: 'Profile' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => handleTabChange(tab.id as typeof activeTab)}
              className={cn(
                "flex flex-col items-center gap-1 py-1 px-4 transition-colors",
                activeTab === tab.id ? "text-violet-600" : "text-muted-foreground"
              )}
            >
              <tab.icon className={cn("w-5 h-5", activeTab === tab.id ? "stroke-[2.5px]" : "stroke-[2px]")} />
              <span className="text-[10px] font-black uppercase tracking-tight">{tab.label}</span>
            </button>
          ))}
        </div>
      </nav>

      {/* Accept Job Modal - Gig Style but violet */}
      <Dialog open={!!showAcceptModal} onOpenChange={(open) => !open && setShowAcceptModal(null)}>
        <DialogContent className="sm:max-w-md bg-white rounded-3xl p-6 border-0 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
          <DialogHeader className="mb-4">
            <div className="w-12 h-12 bg-violet-100 rounded-2xl flex items-center justify-center mb-2">
              <Zap className="w-6 h-6 text-violet-600" />
            </div>
            <DialogTitle className="text-2xl font-black text-gray-900 tracking-tight leading-none mb-1">Accept Assignment</DialogTitle>
            <DialogDescription className="text-xs font-bold text-gray-400 tracking-widest uppercase">
                Confirm your arrival protocol.
            </DialogDescription>
          </DialogHeader>

          {(() => {
            const maxDate = showAcceptModal?.isUrgent && showAcceptModal?.urgentHours
              ? new Date(new Date(showAcceptModal.createdAt || Date.now()).getTime() + showAcceptModal.urgentHours * 60 * 60 * 1000)
              : new Date(new Date(showAcceptModal?.createdAt || Date.now()).getTime() + 3 * 24 * 60 * 60 * 1000);
            
            return (
          <form onSubmit={handleAcceptJob} className="space-y-5">
              <div className="bg-slate-50 rounded-2xl p-4 space-y-2 border border-slate-100">
                <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-gray-400">
                  <span>Contract Budget</span>
                  <span className="text-violet-600 font-black text-sm">₹{showAcceptModal?.budget}</span>
                </div>
                <p className="text-xs text-slate-500 font-medium italic leading-relaxed">"{showAcceptModal?.description}"</p>
              </div>

              {/* Recruitment Options */}
              <div className="space-y-3">
                <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 ml-1">Team Protocol (Optional)</Label>
                <div className="flex gap-2">
                   {['none', 'rookie', 'mentor'].map((type) => (
                     <button
                       key={type}
                       type="button"
                       onClick={() => setRecruitType(type as any)}
                       className={cn(
                         "flex-1 py-3 px-2 rounded-xl text-[10px] font-black uppercase tracking-tighter border transition-all",
                         recruitType === type 
                           ? "bg-violet-600 text-white border-violet-600 shadow-lg shadow-violet-100" 
                           : "bg-white text-slate-400 border-slate-100 hover:border-violet-200"
                       )}
                     >
                       {type === 'none' ? 'Solo' : `Recruit ${type}`}
                     </button>
                   ))}
                </div>

                {recruitType !== 'none' && (
                  <div className="space-y-2">
                    <Label className="text-[9px] font-bold text-gray-400 uppercase italic ml-1">
                       Available {recruitType === 'rookie' ? 'Rookies (Lower Rank)' : 'Mentors (Higher Rank)'} in {dbCity}
                    </Label>
                    <div className="max-h-40 overflow-y-auto space-y-2 pr-1">
                      {loadingWorkforce ? (
                        <div className="py-4 flex justify-center"><Loader2 className="w-5 h-5 animate-spin text-violet-400" /></div>
                      ) : availableWorkforce.length === 0 ? (
                        <p className="text-[10px] text-gray-400 text-center py-2">No available {recruitType}s found in your city.</p>
                      ) : (
                        availableWorkforce.map((w) => (
                          <div 
                            key={w.phone}
                            onClick={() => setSelectedRecruitPhone(w.phone)}
                            className={cn(
                              "flex items-center justify-between p-3 rounded-xl border transition-all cursor-pointer",
                              selectedRecruitPhone === w.phone 
                                ? "bg-violet-50 border-violet-600 ring-1 ring-violet-600" 
                                : "bg-white border-slate-100 hover:border-violet-200"
                            )}
                          >
                            <div className="flex items-center gap-2">
                              {w.profileImage ? (
                                <img src={w.profileImage} className="w-8 h-8 rounded-lg object-cover" />
                              ) : (
                                <div className="w-8 h-8 rounded-lg bg-violet-100 flex items-center justify-center text-violet-600 font-bold text-xs">{w.name.charAt(0)}</div>
                              )}
                              <div>
                                <p className="text-xs font-bold text-slate-800">{w.name}</p>
                                <p className="text-[9px] text-slate-400 font-medium">Rank {w.rank} • {w.primarySkill}</p>
                              </div>
                            </div>
                            {selectedRecruitPhone === w.phone && <CheckCircle2 className="w-4 h-4 text-violet-600" />}
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 ml-1">Arrival Time Schedule</Label>
              <div className="relative">
                <Calendar className="absolute left-4 top-4 w-4 h-4 text-violet-400" />
                <Input 
                  type="datetime-local" 
                  className="rounded-2xl border-slate-100 bg-slate-50/50 h-14 font-black pl-11 focus:ring-violet-200"
                  required
                  min={new Date().toISOString().slice(0, 16)}
                  max={maxDate.toISOString().slice(0, 16)}
                  value={scheduledTime}
                  onChange={(e) => setScheduledTime(e.target.value)}
                />
              </div>
              {showAcceptModal?.isUrgent ? (
                <p className="text-[10px] text-red-500 font-bold ml-1 flex flex-col gap-0.5 mt-1">
                  <span>URGENT DEADLINE</span>
                  <span className="text-slate-900">{maxDate.toLocaleString()}</span>
                </p>
              ) : (
                <p className="text-[10px] text-muted-foreground ml-1 mt-1">Must be within 3 days: <span className="font-bold text-slate-900">
                  {maxDate.toLocaleDateString()}
                </span></p>
              )}
            </div>

            {error && (
                <div className="bg-red-50 text-red-600 p-3 rounded-2xl text-[10px] font-black uppercase flex items-center gap-2 border border-red-100">
                    <Info className="w-4 h-4" />
                    {error}
                </div>
            )}

            <div className="flex gap-3 pt-2">
                <Button 
                    type="button" 
                    variant="ghost" 
                    onClick={() => setShowAcceptModal(null)}
                    className="flex-1 h-14 rounded-2xl font-black text-slate-400 uppercase tracking-widest text-[10px]"
                >
                    Cancel
                </Button>
                <Button 
                    type="submit" 
                    disabled={isAccepting}
                    className="flex-1 h-14 rounded-2xl bg-violet-600 hover:bg-violet-700 text-white font-black shadow-lg shadow-violet-100 uppercase tracking-widest text-[10px]"
                >
                    {isAccepting ? <span className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" /> : 'Confirm Order'}
                </Button>
            </div>
          </form>
            );
          })()}
        </DialogContent>
      </Dialog>

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
      {/* Work Completed Message Modal */}
      <Dialog open={!!completionPopup} onOpenChange={(open) => !open && setCompletionPopup(null)}>
        <DialogContent className="sm:max-w-xs bg-white rounded-3xl p-6 border-0 shadow-2xl animate-in zoom-in-95 duration-300">
          <DialogHeader className="flex flex-col items-center text-center">
            <div className="w-16 h-16 bg-violet-50 rounded-2xl flex items-center justify-center mb-4">
               <CheckCircle2 className="w-8 h-8 text-violet-600" />
            </div>
            <DialogTitle className="text-xl font-black text-gray-900 tracking-tight leading-none">
              {completionPopup?.rating ? 'New Rating Received!' : 'Work Completed!'}
            </DialogTitle>
            <p className="text-sm font-medium text-gray-500 mt-3">
              Your assignment for <span className="font-bold text-gray-900">{completionPopup?.mainSkill}</span> has been marked as <span className="text-violet-600 font-bold uppercase tracking-tighter">Completed</span>.
            </p>
            {completionPopup?.rating && (
              <div className="flex items-center gap-1 mt-4">
                {[1, 1.5, 2, 2.5, 3, 3.5, 4, 4.5, 5].map((s) => (
                  <Star key={s} className={`w-5 h-5 ${s <= completionPopup.rating ? 'text-amber-400 fill-amber-400' : 'text-gray-100 fill-gray-100'}`} />
                ))}
                <span className="ml-2 text-lg font-black text-amber-500">{completionPopup.rating}</span>
              </div>
            )}
          </DialogHeader>
          <div className="bg-gray-50 rounded-2xl p-4 mt-6 text-center">
             <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest leading-none mb-1">Status Protocol</p>
             <p className="text-xs font-black text-slate-900">ID: {completionPopup?._id.slice(-8).toUpperCase()}</p>
          </div>
          <Button onClick={() => setCompletionPopup(null)} className="w-full h-12 rounded-2xl bg-violet-600 hover:bg-violet-700 text-white font-bold mt-6 shadow-xl uppercase tracking-widest text-[10px]">Acknowledge</Button>
        </DialogContent>
      </Dialog>

      {/* Recruitment Declined Modal - Options for original worker */}
      <Dialog open={!!showDeclineModal} onOpenChange={(open) => { if (!open) { setShowDeclineModal(null); setReRecruitType('none'); setReSelectedPhone(null); } }}>
        <DialogContent className="sm:max-w-md bg-white rounded-3xl p-6 border-0 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
          <DialogHeader className="mb-2">
            <div className="w-12 h-12 bg-red-50 rounded-2xl flex items-center justify-center mb-2">
              <AlertTriangle className="w-6 h-6 text-red-500" />
            </div>
            <DialogTitle className="text-xl font-black text-gray-900 tracking-tight leading-none mb-1">Recruitment Declined</DialogTitle>
            <DialogDescription className="text-xs font-medium text-gray-400">
              Your recruitment request for <span className="font-bold text-gray-700">{showDeclineModal?.mainSkill}</span> (₹{showDeclineModal?.budget}) was declined.
            </DialogDescription>
          </DialogHeader>

          {reRecruitType === 'none' ? (
            <div className="space-y-3 mt-2">
              <Button 
                className="w-full h-14 rounded-2xl bg-violet-600 hover:bg-violet-700 text-white font-black uppercase tracking-widest text-[10px] shadow-lg shadow-violet-100"
                disabled={declineActionLoading}
                onClick={() => handleWorkAlone(showDeclineModal?.orderId)}
              >
                {declineActionLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : (
                  <><Briefcase className="w-4 h-4 mr-2" /> Work Alone</>
                )}
              </Button>
              <Button 
                variant="outline"
                className="w-full h-14 rounded-2xl font-black uppercase tracking-widest text-[10px] border-violet-200 text-violet-600 hover:bg-violet-50"
                onClick={() => setReRecruitType(showDeclineModal?.recruitmentType || 'rookie')}
              >
                <RefreshCw className="w-4 h-4 mr-2" /> Request Recruitment Again
              </Button>
            </div>
          ) : (
            <div className="space-y-4 mt-2">
              <div>
                <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 ml-1">Select Type</Label>
                <div className="flex gap-2 mt-2">
                  {['rookie', 'mentor'].map((type) => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => setReRecruitType(type as any)}
                      className={cn(
                        "flex-1 py-3 px-2 rounded-xl text-[10px] font-black uppercase tracking-tighter border transition-all",
                        reRecruitType === type 
                          ? "bg-violet-600 text-white border-violet-600 shadow-lg shadow-violet-100" 
                          : "bg-white text-slate-400 border-slate-100 hover:border-violet-200"
                      )}
                    >
                      Recruit {type}
                    </button>
                  ))}
                </div>
              </div>

              <div className="max-h-40 overflow-y-auto space-y-2">
                {reLoadingWorkforce ? (
                  <div className="py-4 flex justify-center"><Loader2 className="w-5 h-5 animate-spin text-violet-400" /></div>
                ) : reAvailableWorkforce.length === 0 ? (
                  <p className="text-[10px] text-gray-400 text-center py-2">No available {reRecruitType}s found.</p>
                ) : (
                  reAvailableWorkforce.map((w) => (
                    <div 
                      key={w.phone}
                      onClick={() => setReSelectedPhone(w.phone)}
                      className={cn(
                        "flex items-center justify-between p-3 rounded-xl border transition-all cursor-pointer",
                        reSelectedPhone === w.phone 
                          ? "bg-violet-50 border-violet-600 ring-1 ring-violet-600" 
                          : "bg-white border-slate-100 hover:border-violet-200"
                      )}
                    >
                      <div className="flex items-center gap-2">
                        {w.profileImage ? (
                          <img src={w.profileImage} className="w-8 h-8 rounded-lg object-cover" />
                        ) : (
                          <div className="w-8 h-8 rounded-lg bg-violet-100 flex items-center justify-center text-violet-600 font-bold text-xs">{w.name.charAt(0)}</div>
                        )}
                        <div>
                          <p className="text-xs font-bold text-slate-800">{w.name}</p>
                          <p className="text-[9px] text-slate-400 font-medium">Rank {w.rank} • {w.primarySkill}</p>
                        </div>
                      </div>
                      {reSelectedPhone === w.phone && <CheckCircle2 className="w-4 h-4 text-violet-600" />}
                    </div>
                  ))
                )}
              </div>

              <div className="flex gap-3">
                <Button 
                  variant="ghost"
                  className="flex-1 h-12 rounded-2xl font-black text-slate-400 uppercase tracking-widest text-[10px]"
                  onClick={() => { setReRecruitType('none'); setReSelectedPhone(null); }}
                >
                  Back
                </Button>
                <Button 
                  className="flex-1 h-12 rounded-2xl bg-violet-600 hover:bg-violet-700 text-white font-black shadow-lg shadow-violet-100 uppercase tracking-widest text-[10px]"
                  disabled={!reSelectedPhone || declineActionLoading}
                  onClick={() => handleReRequest(showDeclineModal?.orderId)}
                >
                  {declineActionLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Send Request'}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Rank Up Celebration Popup */}
      <Dialog open={rankUpPopup.show} onOpenChange={(open) => !open && setRankUpPopup({show: false, newRank: 0})}>
        <DialogContent className="sm:max-w-xs bg-white rounded-3xl p-8 border-0 shadow-2xl animate-in zoom-in-50 duration-500">
          <DialogHeader className="flex flex-col items-center text-center">
            <div className="relative mb-4">
              <div className="w-24 h-24 bg-gradient-to-br from-violet-500 to-indigo-600 rounded-3xl flex items-center justify-center shadow-2xl shadow-violet-200 animate-bounce">
                <TrendingUp className="w-10 h-10 text-white" />
              </div>
              <div className="absolute -top-2 -right-2 w-10 h-10 bg-amber-400 rounded-full flex items-center justify-center shadow-lg border-4 border-white">
                <span className="text-sm font-black text-white">{rankUpPopup.newRank}</span>
              </div>
            </div>
            <DialogTitle className="text-2xl font-black text-gray-900 tracking-tight leading-none">
              Rank Up! 🎉
            </DialogTitle>
            <DialogDescription className="text-sm font-medium text-gray-500 mt-3">
              Congratulations! You've been promoted to <span className="font-black text-violet-600">Rank {rankUpPopup.newRank}</span>!
              {rankUpPopup.newRank === 4 && <span className="block mt-1 text-amber-600 font-bold">🏆 Maximum rank achieved!</span>}
            </DialogDescription>
          </DialogHeader>
          <div className="flex items-center justify-center gap-1 mt-4">
            {[1, 2, 3, 4].map((r) => (
              <div 
                key={r} 
                className={cn(
                  "w-8 h-8 rounded-lg flex items-center justify-center text-xs font-black transition-all duration-500",
                  r <= rankUpPopup.newRank 
                    ? "bg-violet-600 text-white shadow-md scale-110" 
                    : "bg-gray-100 text-gray-300"
                )}
              >
                {r}
              </div>
            ))}
          </div>
          <Button 
            onClick={() => setRankUpPopup({show: false, newRank: 0})} 
            className="w-full h-12 rounded-2xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white font-black mt-6 shadow-xl uppercase tracking-widest text-[10px]"
          >
            Awesome!
          </Button>
        </DialogContent>
      </Dialog>

      <ConsumerDetailsModal 
        phone={selectedConsumerPhone} 
        onClose={() => setSelectedConsumerPhone(null)} 
      />
    </div>
  )
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
      <DialogContent className="sm:max-w-md bg-white rounded-3xl p-0 border-0 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        {loading ? (
          <div className="p-12 flex flex-col items-center gap-4">
            <Loader2 className="w-8 h-8 text-violet-600 animate-spin" />
            <p className="text-sm font-bold text-gray-400">Loading customer profile...</p>
          </div>
        ) : consumer ? (
          <div className="flex flex-col">
            <div className="h-24 bg-gradient-to-r from-violet-600 to-indigo-600 relative p-6">
              <DialogHeader>
                <DialogTitle className="text-white font-black text-lg">Customer Profile</DialogTitle>
                <DialogDescription className="sr-only">Viewing profile details for {consumer.fullName}</DialogDescription>
              </DialogHeader>
              <div className="absolute -bottom-10 left-6">
                <div className="w-20 h-20 rounded-2xl border-4 border-white overflow-hidden shadow-lg bg-gray-50 flex items-center justify-center">
                  {consumer.profileImage ? (
                    <img src={consumer.profileImage} className="w-full h-full object-cover" alt="Profile" />
                  ) : (
                    <div className="text-2xl font-black text-violet-700">{consumer.fullName[0]}</div>
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
                    <Phone className="w-3.5 h-3.5 text-violet-600" />
                    {consumer.phone}
                  </p>
                </div>
                <div className="space-y-1">
                  <Label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">City</Label>
                  <p className="text-sm font-bold text-gray-900 flex items-center gap-2">
                    <MapPin className="w-3.5 h-3.5 text-violet-600" />
                    {consumer.city || 'Not specified'}
                  </p>
                </div>
              </div>
              <div className="bg-violet-50 p-4 rounded-2xl border border-violet-100 flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center shadow-sm">
                  <CheckCircle2 className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <p className="text-xs font-bold text-gray-500 uppercase">Verified Customer</p>
                  <p className="text-[10px] text-muted-foreground italic">Registered WorkLink consumer</p>
                </div>
              </div>
              <Button className="w-full h-12 rounded-2xl bg-violet-600 text-white font-bold" onClick={onClose}>Close Profile</Button>
            </div>
          </div>
        ) : <div className="p-12 text-center text-gray-500 font-bold">Profile not found</div>}
      </DialogContent>
    </Dialog>
  );
}
