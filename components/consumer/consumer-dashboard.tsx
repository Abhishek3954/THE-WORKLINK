'use client'

import React, { useState, useEffect } from 'react';
import { useWorkflow } from '@/lib/workflow-context';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  MapPin, Package, IndianRupee, ArrowRight, Plus, CalendarDays,
  Zap, Wrench, Hammer, Paintbrush, Truck, Home, Clock,
  FileText, Users, CreditCard, Star, ShieldCheck, Award,
  HelpCircle, MessageSquare, AlertTriangle,
  User, Bell, Shield, Settings, ChevronRight, LogOut,
  Heart, CheckCircle2, Search, Menu, Phone, Camera, X, Loader2, Lock
} from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';

// ── Mock Data ──
const SERVICES = [
  { id: '1', label: 'Electrician', icon: 'Zap', startingPrice: 499 },
  { id: '2', label: 'Plumber', icon: 'Wrench', startingPrice: 499 },
  { id: '3', label: 'Carpenter', icon: 'Hammer', startingPrice: 599 },
  { id: '4', label: 'Painter', icon: 'Paintbrush', startingPrice: 999 },
  { id: '5', label: 'Movers', icon: 'Truck', startingPrice: 1499 },
  { id: '6', label: 'Cleaning', icon: 'Home', startingPrice: 699 },
];

const ICON_MAP: Record<string, any> = { Zap, Wrench, Hammer, Paintbrush, Truck, Home };

function formatCurrency(amount: number) {
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(amount);
}

function getInitials(name: string) {
  return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() || 'U';
}

function renderImage(imageObj: any) {
  if (!imageObj) return null;
  // If the API already converted it to a base64 string
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

function StatCard({ icon, value, label }: { icon: React.ReactNode, value: string, label: string }) {
  return (
    <Card className="flex-1 p-3 text-center border-gray-100 shadow-sm">
      <div className="flex justify-center mb-1 text-purple-600">{icon}</div>
      <p className="font-bold text-gray-900">{value}</p>
      <p className="text-[10px] uppercase tracking-wider text-gray-500 font-semibold">{label}</p>
    </Card>
  );
}

function EmptyState({ icon, title, description, action }: any) {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
      <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center text-gray-400 mb-4">
        {icon}
      </div>
      <h3 className="text-lg font-bold text-gray-900 mb-1">{title}</h3>
      <p className="text-sm text-gray-500 mb-6 max-w-xs">{description}</p>
      {action}
    </div>
  );
}

// ━━━━━━━━━━━━━━━━━━ TABS ━━━━━━━━━━━━━━━━━━

function HomeTab({ onPlaceOrder, ongoingWork = [], history = [], onViewWorker, onEnlargeImage, onUpdateStatus }: { 
  onPlaceOrder: () => void, 
  ongoingWork: any[], 
  history: any[],
  onViewWorker: (phone: string) => void,
  onEnlargeImage: (url: string) => void,
  onUpdateStatus: (order: any, nextStatus: string) => void
}) {
  const { workerData } = useWorkflow();
  const [promotions, setPromotions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timeout = setTimeout(() => {
      setPromotions([
        { id: '1', title: '50% off First Service', description: 'Up to ₹200 off', code: 'WELCOME50', bgColor: 'bg-purple-100 border-purple-200 text-purple-900' },
        { id: '2', title: 'Free AC Checkup', description: 'With any service >₹999', code: 'FREEAC', bgColor: 'bg-blue-100 border-blue-200 text-blue-900' },
      ]);
      setLoading(false);
    }, 1000);
    return () => clearTimeout(timeout);
  }, []);

  return (
    <div className="pb-24 px-4 pt-4 space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Overview Stats */}
      <div className="flex gap-3">
        <StatCard icon={<MapPin className="w-4 h-4" />} value={workerData.city || 'Location'} label="Location" />
        <StatCard icon={<Package className="w-4 h-4" />} value={ongoingWork.length.toString()} label="Active" />
        <StatCard icon={<Clock className="w-4 h-4" />} value={history.length.toString()} label="Done" />
      </div>

      {/* Ongoing Work Section */}
      {ongoingWork.length > 0 && (
        <div className="animate-in fade-in slide-in-from-top-4 duration-700">
          <div className="flex items-center justify-between mb-3 px-1">
            <h3 className="text-base font-black text-gray-900 tracking-tight flex items-center gap-2">
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              Active Orders
            </h3>
            <div className="flex items-center gap-2">
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-6 text-[10px] font-bold text-purple-600 hover:text-purple-700 p-0"
                onClick={() => window.location.reload()}
              >
                Refresh
              </Button>
              <Badge variant="secondary" className="bg-green-50 text-green-700 border-green-100 text-[10px] font-bold">
                {ongoingWork.length} ACTIVE
              </Badge>
            </div>
          </div>          <div className="space-y-3">
            {ongoingWork.map((work) => (
              <Card key={work._id} className={`p-4 border-l-4 shadow-sm relative overflow-hidden group ${
                work.status === 'ongoing' ? 'border-l-indigo-500 bg-indigo-50/10' : 'border-l-green-500 bg-green-50/10'
              }`}>
                <div className="flex justify-between items-start">
                  <div className="space-y-1 flex-1">
                    <div className="flex items-center gap-2">
                      <p className={`text-[10px] font-bold uppercase tracking-widest ${
                        work.status === 'ongoing' ? 'text-indigo-600' : 'text-green-600'
                      }`}>{work.mainSkill}</p>
                      <Badge variant="outline" className="text-[8px] h-4 px-1 font-black bg-white">
                        {work.status === 'accepted' ? 'PARTNER MATCHED' : 'WORK IN PROGRESS'}
                      </Badge>
                    </div>
                    <div className="flex flex-col gap-1">
                      <h4 className="text-sm font-bold text-gray-900 line-clamp-1">{work.description}</h4>
                      {work.isUrgent && (
                        <Badge className="bg-red-500 hover:bg-red-600 text-white border-0 text-[9px] font-black uppercase px-1.5 py-0 h-5 items-center flex inline-flex w-fit shadow-sm">
                          <AlertTriangle className="w-3 h-3 mr-1" /> URGENT • {work.urgentHours}H
                        </Badge>
                      )}
                    </div>
                    {work.image && (
                      <button 
                        className="w-full h-20 rounded-lg overflow-hidden bg-gray-100 my-2 cursor-zoom-in hover:ring-2 hover:ring-purple-400 transition"
                        onClick={() => onEnlargeImage(renderImage(work.image) || '')}
                      >
                        <img src={renderImage(work.image) || ''} alt="Job" className="w-full h-full object-cover" />
                      </button>
                    )}
                    <div className="flex flex-col gap-1 pt-1">
                      <p className="text-[11px] text-gray-500 flex items-center gap-1.5">
                        <CalendarDays className="w-3 h-3 text-purple-500" />
                        Time: <span className="font-bold text-gray-700">{new Date(work.scheduledTime).toLocaleString()}</span>
                      </p>
                      <p className="text-[11px] text-gray-500 flex items-center gap-1.5">
                        <Star className="w-3 h-3 text-amber-400" />
                        Payment: <span className="font-black text-gray-900">
                          {work.paymentStatus === 'half' ? '50% PAID' : work.paymentStatus === 'final' ? '100% PAID' : 'PENDING'}
                        </span>
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-col gap-2 shrink-0 ml-3">
                    <Button 
                      size="sm" 
                      variant="outline"
                      className="bg-white border-gray-200 text-gray-700 hover:bg-gray-50 rounded-xl text-[10px] font-bold h-7 px-2 shadow-sm"
                      onClick={() => onViewWorker(work.workerPhone)}
                    >
                      View Profile
                    </Button>
                    {work.status === 'accepted' ? (
                      <Button 
                        size="sm" 
                        className={`bg-green-600 hover:bg-green-700 text-white rounded-xl text-[10px] font-black h-8 px-2 shadow-md shadow-green-100 ${work.isDemo ? 'animate-pulse ring-4 ring-green-400/50' : ''}`}
                        onClick={() => onUpdateStatus(work, 'ongoing')}
                      >
                        {work.isDemo ? 'Pay First 50% (Demo)' : 'Worker Arrived'}
                      </Button>
                    ) : (
                      <Button 
                        size="sm" 
                        className={`bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-[10px] font-black h-8 px-2 shadow-md shadow-indigo-100 ${work.isDemo ? 'animate-pulse ring-4 ring-indigo-400/50' : ''}`}
                        onClick={() => onUpdateStatus(work, 'completed')}
                      >
                        {work.isDemo ? 'Pay Final 50% (Demo)' : 'Work Completed'}
                      </Button>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div className="grid grid-cols-2 gap-3">
        <Card 
          onClick={onPlaceOrder}
          className="p-4 border-purple-200 hover:border-purple-400 transition-colors cursor-pointer bg-gradient-to-br from-white to-purple-50 group"
        >
          <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center mb-2 group-hover:bg-purple-600 group-hover:scale-110 transition-all">
            <Plus className="w-5 h-5 text-purple-600 group-hover:text-white transition-colors" />
          </div>
          <p className="text-sm font-semibold text-gray-900">Place New Order</p>
          <p className="text-xs text-gray-500 mt-0.5">Book a service now</p>
        </Card>
        <Card className="p-4 opacity-70 border-gray-100 bg-gray-50/30">
          <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center mb-2">
            <CreditCard className="w-5 h-5 text-gray-400" />
          </div>
          <div className="flex items-center gap-2">
            <p className="text-sm font-semibold text-gray-900">Payments</p>
            <Badge variant="secondary" className="text-[10px] px-1 py-0 h-4">SOON</Badge>
          </div>
          <p className="text-xs text-gray-500 mt-0.5">Manage billing</p>
        </Card>
      </div>

      {/* Promotions */}
      {loading ? (
        <div className="flex gap-3 overflow-hidden">
          <Skeleton className="min-w-[280px] h-28 rounded-xl" />
        </div>
      ) : (
        promotions.length > 0 && (
          <div className="flex gap-3 overflow-x-auto snap-x pb-2 -mx-4 px-4 scrollbar-hide">
            {promotions.map((p) => (
              <div key={p.id} className={`min-w-[260px] snap-start rounded-xl p-4 border ${p.bgColor}`}>
                <p className="text-sm font-bold mb-1">{p.title}</p>
                <p className="text-xs opacity-80 mb-3">{p.description}</p>
                <div className="flex items-center justify-between">
                  <span className="bg-white/50 px-2 py-1 rounded text-xs font-mono font-bold tracking-wider">{p.code}</span>
                  <span className="text-xs font-bold flex items-center gap-1 cursor-pointer hover:underline">Apply <ArrowRight className="w-3 h-3" /></span>
                </div>
              </div>
            ))}
          </div>
        )
      )}

      {/* Services Grid */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-base font-bold text-gray-900">Our Services</h3>
          <span className="text-xs text-purple-600 font-semibold cursor-pointer">View All</span>
        </div>
        <div className="grid grid-cols-3 gap-3">
          {SERVICES.map((s) => {
            const Icon = ICON_MAP[s.icon] || Home;
            return (
              <Card
                key={s.id}
                className="p-3 text-center hover:border-purple-300 hover:shadow-md transition-all cursor-pointer group"
              >
                <div className="w-12 h-12 bg-gray-50 group-hover:bg-purple-50 rounded-full flex items-center justify-center mx-auto mb-2 transition-colors">
                  <Icon className="w-5 h-5 text-gray-600 group-hover:text-purple-600 transition-colors" />
                </div>
                <p className="text-[11px] font-semibold text-gray-900 leading-tight">{s.label}</p>
                <p className="text-[9px] text-gray-500 mt-0.5">start ₹{s.startingPrice}</p>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Order History Section */}
      {history.length > 0 && (
        <div className="pt-4 border-t border-gray-100">
          <div className="flex items-center justify-between mb-4 px-1">
            <h3 className="text-base font-black text-gray-900 tracking-tight flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-green-500" />
              Service History
            </h3>
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{history.length} COMPLETED</span>
          </div>
          <div className="space-y-3">
            {history.map((order) => (
              <Card key={order._id} className="p-4 border-dashed border-gray-200 bg-gray-50/50 group block">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-white border border-gray-100 flex items-center justify-center text-gray-400">
                      {ICON_MAP[SERVICES.find(s => s.label.toLowerCase() === order.mainSkill.toLowerCase())?.icon || 'Package'] ? (
                        React.createElement(ICON_MAP[SERVICES.find(s => s.label.toLowerCase() === order.mainSkill.toLowerCase())?.icon || 'Package'], { className: "w-5 h-5 text-purple-500" })
                      ) : <Package className="w-5 h-5 text-purple-500" />}
                    </div>
                    <div>
                      <div className="flex flex-col items-start gap-1">
                        <h4 className="text-sm font-bold text-gray-900">{order.mainSkill}</h4>
                        {order.isUrgent && (
                          <Badge className="bg-red-50 text-red-600 border border-red-100 text-[8px] font-black uppercase px-1 py-0 h-4 items-center flex inline-flex shadow-sm">
                            <AlertTriangle className="w-2.5 h-2.5 mr-1" /> URGENT • {order.urgentHours}H
                          </Badge>
                        )}
                      </div>
                      <p className="text-[10px] text-gray-500 font-medium mt-1">{new Date(order.updatedAt).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <div className="text-right flex flex-col items-end gap-1">
                    <p className="text-sm font-black text-gray-900">₹{order.budget}</p>
                    <div className="flex items-center gap-0.5">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <Star key={s} className={`w-2.5 h-2.5 ${s <= (order.rating || 0) ? 'text-amber-400 fill-amber-400' : 'text-gray-200 fill-gray-200'}`} />
                      ))}
                    </div>
                  </div>
                </div>
                
                <p className="text-xs text-gray-500 italic mb-4 line-clamp-2 px-1">"{order.description}"</p>
                
                <div className="flex items-center justify-between pt-3 border-t border-gray-100/50">
                  <Badge variant="outline" className="text-[9px] font-black bg-green-50 text-green-600 border-green-100 uppercase h-5">
                    Service Delivered
                  </Badge>
                  <Button 
                    size="sm" 
                    variant="ghost" 
                    className="h-7 text-[10px] font-bold text-purple-600 hover:text-purple-700 p-0"
                    onClick={() => onViewWorker(order.workerPhone)}
                  >
                    View Worker Profile <ChevronRight className="w-3 h-3 ml-1" />
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}


function OrdersTab({ onEnlargeImage }: { onEnlargeImage: (url: string) => void }) {
  const { workerData } = useWorkflow();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [orderToDelete, setOrderToDelete] = useState<string | null>(null);

  const fetchOrders = async () => {
    try {
      const response = await fetch(`/api/consumer/order?phone=${workerData.phone}`, { cache: 'no-store' });
      const data = await response.json();
      if (data.success) {
        setOrders(data.data);
      }
    } catch (err) {
      console.error("Error fetching orders:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteOrder = async () => {
    if (!orderToDelete) return;
    const id = orderToDelete;
    setDeletingId(id);
    setOrderToDelete(null);
    try {
      const response = await fetch(`/api/consumer/order?id=${id}`, { method: 'DELETE' });
      const data = await response.json();
      if (data.success) {
        setOrders(prev => prev.filter(o => o._id !== id));
      }
    } catch (err) {
      console.error("Error deleting order:", err);
    } finally {
      setDeletingId(null);
    }
  };

  useEffect(() => {
    if (workerData.phone) fetchOrders();
  }, [workerData.phone]);

  if (loading) {
    return (
      <div className="h-full pt-4 px-4 space-y-4">
        {[1, 2, 3].map(i => <Skeleton key={i} className="w-full h-32 rounded-xl" />)}
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col pt-4 px-4 pb-24 animate-in fade-in overflow-y-auto scrollbar-hide">
      <h2 className="text-xl font-bold text-gray-900 mb-6 px-1">My Orders</h2>
      {orders.length === 0 ? (
        <EmptyState
          icon={<FileText className="w-8 h-8" />}
          title="No orders yet"
          description="Your service history will appear here once you book a worker."
        />
      ) : (
        <div className="space-y-4">
          {[...orders].sort((a, b) => new Date(b.createdAt || Date.now()).getTime() - new Date(a.createdAt || Date.now()).getTime()).map((order) => (
            <Card key={order._id} className="p-4 border-gray-100 shadow-sm relative overflow-hidden">
               <div className={`absolute top-0 right-0 w-1.5 h-full ${
                (order.status === 'pending' || order.status === 'recruitment_pending') ? 'bg-amber-400' : 'bg-green-500'
              }`} />
              <div className="flex justify-between items-start mb-2">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Badge variant="secondary" className="bg-purple-50 text-purple-700 border-purple-100 uppercase text-[10px] tracking-wider">
                      {order.mainSkill}
                    </Badge>
                    {order.isUrgent && (
                      <Badge className="bg-red-500 hover:bg-red-600 text-white border-0 text-[9px] font-black uppercase px-1.5 py-0 h-5">
                        <AlertTriangle className="w-3 h-3 mr-1" /> URGENT • {order.urgentHours}H
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm font-bold text-gray-900">{order.mainSkill}</p>
                </div>
                <p className="text-sm font-black text-purple-600">₹{order.budget}</p>
              </div>
              <p className="text-xs text-gray-500 line-clamp-2 mb-3 leading-relaxed">{order.description}</p>
              {order.image && (
                <button 
                  className="w-full h-32 rounded-lg overflow-hidden bg-gray-100 mb-3 border border-gray-100 cursor-zoom-in hover:ring-2 hover:ring-purple-400 transition"
                  onClick={() => onEnlargeImage(renderImage(order.image) || '')}
                >
                  <img src={renderImage(order.image) || ''} alt="Order" className="w-full h-full object-cover" />
                </button>
              )}
              <div className="flex items-center justify-between pt-3 border-t border-gray-50">
                <span className="text-[10px] font-bold text-gray-400 flex items-center gap-1 uppercase tracking-tighter">
                  <span className={`w-1.5 h-1.5 rounded-full ${(order.status === 'pending' || order.status === 'recruitment_pending') ? 'bg-amber-400 animate-pulse' : 'bg-green-500'}`} />
                  {order.status === 'recruitment_pending' ? 'pending' : order.status}
                </span>
                <div className="flex items-center gap-2">
                  {(order.status === 'pending' || order.status === 'recruitment_pending') && (
                    <Button 
                      variant="outline" 
                      onClick={() => setOrderToDelete(order._id)}
                      disabled={deletingId === order._id}
                      className="h-7 text-[10px] font-bold text-red-500 uppercase tracking-wider p-0 bg-transparent border-0 hover:bg-transparent"
                    >
                      {deletingId === order._id ? 'Cancelling...' : 'Cancel'}
                    </Button>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Cancellation Dialog */}
      <AlertDialog open={!!orderToDelete} onOpenChange={(open) => !open && setOrderToDelete(null)}>
        <AlertDialogContent className="rounded-3xl border-0 shadow-2xl p-6 bg-white animate-in zoom-in-95 duration-200">
          <AlertDialogHeader>
            <div className="w-12 h-12 bg-red-50 rounded-2xl flex items-center justify-center mb-2">
              <AlertTriangle className="w-6 h-6 text-red-500" />
            </div>
            <AlertDialogTitle className="text-xl font-black text-gray-900 tracking-tight">Cancel Order?</AlertDialogTitle>
            <AlertDialogDescription className="text-sm font-medium text-gray-500">This will permanently delete your request.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex gap-3 mt-4">
            <AlertDialogCancel className="rounded-2xl border-gray-100 h-12 flex-1 uppercase text-[11px] tracking-widest text-gray-400">Back</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteOrder} className="rounded-2xl bg-red-500 hover:bg-red-600 h-12 flex-1 uppercase text-[11px] tracking-widest text-white border-0">Cancel Order</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

function AccountTab({ handleLogout, phone, updateWorkerData }: { handleLogout: () => void, phone: string, updateWorkerData: any }) {
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState('main'); 
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const [editName, setEditName] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editCity, setEditCity] = useState('');
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileMsg, setProfileMsg] = useState({ type: '', text: '' });

  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');

  useEffect(() => {
    if (phone) {
      fetch(`/api/consumer/auth?phone=${phone}`, { cache: 'no-store' })
        .then(res => res.json())
        .then(data => {
          if (data.success) {
            setProfile(data.data);
            setEditName(data.data.fullName);
            setEditPhone(data.data.phone);
            setEditCity(data.data.city);
          }
          setLoading(false);
        })
        .catch(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [phone]);

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileLoading(true);
    try {
      const response = await fetch('/api/consumer/auth?action=updateProfile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPhone: phone, fullName: editName, phone: editPhone, city: editCity })
      });
      const data = await response.json();
      if (data.success) {
        setProfileMsg({ type: 'success', text: 'Profile updated' });
        setProfile(data.data);
        updateWorkerData({ phone: data.data.phone, name: data.data.fullName, profileImage: data.data.profileImage });
      }
    } catch (err) {
      setProfileMsg({ type: 'error', text: 'Update failed' });
    } finally {
      setProfileLoading(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64String = reader.result as string;
      setProfileLoading(true);
      try {
        const response = await fetch('/api/consumer/auth?action=updateProfile', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ currentPhone: phone, profileImage: base64String })
        });
        const data = await response.json();
        if (data.success) {
          setProfile(data.data);
          updateWorkerData({ profileImage: data.data.profileImage });
        }
      } catch (err) {} finally { setProfileLoading(false); }
    };
    reader.readAsDataURL(file);
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setPasswordError('Passwords do not match');
      return;
    }
    if (newPassword.length < 6) {
      setPasswordError('Password must be at least 6 characters');
      return;
    }
    setProfileLoading(true);
    setPasswordError('');
    setPasswordSuccess('');
    try {
      const res = await fetch('/api/consumer/auth?action=changePassword', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, oldPassword, newPassword })
      });
      const data = await res.json();
      if (data.success) {
        setPasswordSuccess('Password updated successfully');
        setOldPassword('');
        setNewPassword('');
        setConfirmPassword('');
      } else {
        setPasswordError(data.error || 'Failed to update password');
      }
    } catch (err) {
      setPasswordError('An error occurred');
    } finally {
      setProfileLoading(false);
    }
  };

  if (view === 'profile') {
    return (
      <div className="pb-24 animate-in fade-in slide-in-from-right-4 duration-300 px-4 pt-4">
        <Button variant="ghost" className="mb-4" onClick={() => setView('main')}><ChevronRight className="rotate-180 mr-2" /> Back</Button>
        <Card className="p-5">
           <form onSubmit={handleProfileUpdate} className="space-y-4">
            <Label>Name</Label><Input value={editName} onChange={e => setEditName(e.target.value)} />
            <Label>Phone</Label><Input value={editPhone} onChange={e => setEditPhone(e.target.value)} />
            <Label>City</Label><Input value={editCity} onChange={e => setEditCity(e.target.value)} />
            <Button className="w-full bg-purple-600 text-white" disabled={profileLoading}>Save</Button>
           </form>
        </Card>
      </div>
    );
  }

  if (view === 'changePassword') {
    return (
      <div className="pb-24 animate-in fade-in slide-in-from-right-4 duration-300 px-4 pt-4">
        <Button variant="ghost" className="mb-4" onClick={() => { setView('main'); setPasswordError(''); setPasswordSuccess(''); }}><ChevronRight className="rotate-180 mr-2" /> Back</Button>
        <Card className="p-6 border-0 shadow-xl bg-white rounded-3xl">
          <h3 className="text-xl font-black text-gray-900 mb-6 flex items-center gap-2">
            <Shield className="w-5 h-5 text-purple-600" />
            Update Password
          </h3>
          <form onSubmit={handlePasswordChange} className="space-y-4">
            {passwordError && <div className="p-3 bg-red-50 text-red-600 rounded-xl text-xs font-bold animate-in shake-in-1">{passwordError}</div>}
            {passwordSuccess && <div className="p-3 bg-green-50 text-green-600 rounded-xl text-xs font-bold animate-in zoom-in-95">{passwordSuccess}</div>}
            
            <div className="space-y-1.5">
              <Label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Current Password</Label>
              <Input type="password" value={oldPassword} onChange={e => setOldPassword(e.target.value)} className="rounded-xl h-12 bg-gray-50 border-gray-100" required />
            </div>
            
            <div className="space-y-1.5">
              <Label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">New Password</Label>
              <Input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} className="rounded-xl h-12 bg-gray-50 border-gray-100" placeholder="Min 6 characters" required />
            </div>
            
            <div className="space-y-1.5">
              <Label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Confirm New Password</Label>
              <Input type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} className="rounded-xl h-12 bg-gray-50 border-gray-100" required />
            </div>
            
            <Button className="w-full bg-purple-600 text-white h-12 rounded-xl font-bold shadow-lg shadow-purple-100 mt-4" disabled={profileLoading}>
              {profileLoading ? <Loader2 className="animate-spin w-5 h-5 mx-auto" /> : 'Update Password'}
            </Button>
          </form>
        </Card>
      </div>
    );
  }

  return (
    <div className="pb-24 p-5 space-y-6">
      <Card className="p-5 flex items-center gap-4">
        <div className="relative">
          <Avatar className="w-16 h-16 border-2 border-purple-100">
            {profile?.profileImage ? <img src={profile.profileImage} className="w-full h-full object-cover" /> : <AvatarFallback>{profile ? getInitials(profile.fullName) : 'U'}</AvatarFallback>}
          </Avatar>
          <input type="file" ref={fileInputRef} className="hidden" onChange={handleImageUpload} />
          <Button size="icon" className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full p-0" onClick={() => fileInputRef.current?.click()}><Plus className="w-3 h-3" /></Button>
        </div>
        <div>
          <h2 className="text-lg font-bold">{profile?.fullName}</h2>
          <p className="text-xs text-gray-400">{profile?.phone}</p>
        </div>
      </Card>
      <div className="grid grid-cols-2 gap-3">
        <Card className="p-4 cursor-pointer hover:bg-gray-50 group border-gray-100 shadow-sm" onClick={() => setView('profile')}>
          <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center mb-2 group-hover:bg-blue-500 transition-colors">
            <User className="w-5 h-5 text-blue-500 group-hover:text-white" />
          </div>
          <p className="text-sm font-bold text-gray-900 text-left">Profile</p>
          <p className="text-[10px] text-gray-400 uppercase tracking-tight text-left">Edit info</p>
        </Card>
        
        <Card className="p-4 cursor-pointer hover:bg-gray-50 group border-gray-100 shadow-sm" onClick={() => setView('changePassword')}>
          <div className="w-10 h-10 bg-purple-50 rounded-xl flex items-center justify-center mb-2 group-hover:bg-purple-500 transition-colors">
            <Lock className="w-5 h-5 text-purple-500 group-hover:text-white" />
          </div>
          <p className="text-sm font-bold text-gray-900 text-left">Security</p>
          <p className="text-[10px] text-gray-400 uppercase tracking-tight text-left">Password</p>
        </Card>

        <Card className="p-4 cursor-pointer hover:bg-red-50 group border-gray-100 shadow-sm transition-colors" onClick={handleLogout}>
          <div className="w-10 h-10 bg-red-50 rounded-xl flex items-center justify-center mb-2 group-hover:bg-red-500 transition-colors">
            <LogOut className="w-5 h-5 text-red-500 group-hover:text-white" />
          </div>
          <p className="text-sm font-bold text-gray-900 text-left">Logout</p>
          <p className="text-[10px] text-gray-400 uppercase tracking-tight text-left">Exit App</p>
        </Card>
      </div>
    </div>
  );
}

// ━━━━━━━━━━━━━━━━━━ MAIN DASHBOARD ━━━━━━━━━━━━━━━━━━

export function ConsumerDashboard() {
  const { setCurrentStep, workerData, updateWorkerData } = useWorkflow();
  const [activeTab, setActiveTab] = useState(() => {
    if (typeof window !== 'undefined') {
      return sessionStorage.getItem('worklink_consumer_activeTab') || 'home';
    }
    return 'home';
  });
  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [selectedWorkerPhone, setSelectedWorkerPhone] = useState<string | null>(null);
  const [ongoingWork, setOngoingWork] = useState<any[]>([]);
  const [history, setHistory] = useState<any[]>([]);
  const [selectedFullImage, setSelectedFullImage] = useState<string | null>(null);

  // Rating Modal State
  const [ratingModal, setRatingModal] = useState<{
    isOpen: boolean,
    orderId: string,
    workerName: string,
    isDemo?: boolean
  }>({
    isOpen: false,
    orderId: '',
    workerName: '',
    isDemo: false
  });

  // Payment Modal State
  const [paymentModal, setPaymentModal] = useState<{
    isOpen: boolean,
    amount: number,
    stage: 'initial' | 'final',
    orderId: string,
    nextStatus: string,
    order: any
  }>({
    isOpen: false,
    amount: 0,
    stage: 'initial',
    orderId: '',
    nextStatus: '',
    order: null
  });

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    sessionStorage.setItem('worklink_consumer_activeTab', tab);
  };

  const fetchOrders = async (excludeImages = false) => {
    try {
      const res = await fetch(`/api/consumer/order?phone=${workerData.phone}${excludeImages ? '&excludeImages=true' : ''}`, { cache: 'no-store' });
      const data = await res.json();
      if (data.success) {
        // Exclude recruitment_pending from active orders on homepage
        // recruitment_pending orders should appear as 'pending' in orders tab
        const activeOrders = data.data.filter((o: any) => (o.status === 'accepted' || o.status === 'ongoing') && o.status !== 'recruitment_pending');
        const completedOrders = data.data.filter((o: any) => o.status === 'completed');

        if (excludeImages) {
          // Merge and preserve images
          setOngoingWork(prev => activeOrders.map((newOrder: any) => {
            const existing = prev.find(o => o._id === newOrder._id);
            return existing && existing.image ? { ...newOrder, image: existing.image } : newOrder;
          }));
          setHistory(prev => completedOrders.map((newOrder: any) => {
            const existing = prev.find(o => o._id === newOrder._id);
            return existing && existing.image ? { ...newOrder, image: existing.image } : newOrder;
          }));
        } else {
          setOngoingWork(activeOrders);
          setHistory(completedOrders);
        }
      }
    } catch (err) {
      console.error("Error fetching orders:", err);
    }
  };

  useEffect(() => {
    if (workerData.phone) fetchOrders();
    // Poll on home tab to catch recruitment status changes without image data overhead
    if (activeTab === 'home' && workerData.phone) {
      const interval = setInterval(() => fetchOrders(true), 5000);
      return () => clearInterval(interval);
    }
  }, [workerData.phone, activeTab]);

  const handleUpdateStatus = (order: any, nextStatus: string) => {
    const isStageInitial = nextStatus === 'ongoing';
    setPaymentModal({
      isOpen: true,
      amount: order.budget / 2,
      stage: isStageInitial ? 'initial' : 'final',
      orderId: order._id,
      nextStatus,
      order
    });
  };

  const confirmPayment = async () => {
    try {
      const res = await fetch('/api/consumer/order', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          id: paymentModal.orderId, 
          status: paymentModal.nextStatus,
          paymentStatus: paymentModal.stage === 'initial' ? 'half' : 'final'
        })
      });
      const data = await res.json();
      if (data.success) {
        if (paymentModal.stage === 'final') {
          // Open rating modal
          setRatingModal({
            isOpen: true,
            orderId: paymentModal.orderId,
            workerName: 'your worker',
            isDemo: paymentModal.order?.isDemo
          });
        }
        await fetchOrders();
      }
    } catch (err) {
      console.error("Error updating status:", err);
    }
  };

  const submitRating = async (rating: number) => {
    try {
      await fetch('/api/consumer/order', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          id: ratingModal.orderId, 
          rating 
        })
      });
      fetchOrders();
      if (ratingModal.isDemo) {
        setShowFeedbackModal(true);
      }
    } catch (err) {
      console.error("Error submitting rating:", err);
    }
  };

  const handleLogout = () => {
    setCurrentStep('selection');
  };

  const renderTab = () => {
    switch (activeTab) {
      case 'home': return (
        <HomeTab 
          onPlaceOrder={() => setIsOrderModalOpen(true)} 
          ongoingWork={ongoingWork} 
          history={history}
          onViewWorker={(p) => setSelectedWorkerPhone(p)} 
          onEnlargeImage={setSelectedFullImage}
          onUpdateStatus={handleUpdateStatus}
        />
      );
      case 'orders': return <OrdersTab onEnlargeImage={setSelectedFullImage} />;
      case 'account': return <AccountTab handleLogout={handleLogout} phone={workerData.phone} updateWorkerData={updateWorkerData} />;
      default: return (
        <HomeTab 
          onPlaceOrder={() => setIsOrderModalOpen(true)} 
          ongoingWork={ongoingWork} 
          history={history}
          onViewWorker={(p) => setSelectedWorkerPhone(p)} 
          onEnlargeImage={setSelectedFullImage}
          onUpdateStatus={handleUpdateStatus}
        />
      );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans relative">
      <div className="w-full max-w-md mx-auto flex flex-col flex-1 relative">
        <PlaceOrderModal 
          isOpen={isOrderModalOpen} 
          onClose={() => setIsOrderModalOpen(false)} 
          phone={workerData.phone}
          onSuccess={() => { handleTabChange('home'); fetchOrders(); }}
        />
        <WorkerDetailsModal 
          phone={selectedWorkerPhone} 
          onClose={() => setSelectedWorkerPhone(null)} 
          scheduledTime={ongoingWork.find(o => o.workerPhone === selectedWorkerPhone)?.scheduledTime}
        />
        <Dialog open={showFeedbackModal} onOpenChange={(open) => !open && setShowFeedbackModal(false)}>
          <DialogContent aria-describedby={undefined} className="sm:max-w-xs bg-white rounded-3xl p-6 border-0 shadow-2xl text-center">
            <DialogHeader>
              <div className="w-16 h-16 bg-purple-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <MessageSquare className="w-8 h-8 text-purple-600" />
              </div>
              <DialogTitle className="text-xl font-black text-gray-900 tracking-tight">Demo Completed!</DialogTitle>
              <p className="text-sm font-medium text-gray-500 mt-2">
                Please leave a review and let us know your opinion on the application.
              </p>
            </DialogHeader>
            <div className="flex gap-3 mt-6">
              <Button variant="ghost" onClick={() => setShowFeedbackModal(false)} className="flex-1 text-gray-500 hover:bg-gray-50 font-bold h-12 rounded-2xl">Cancel</Button>
              <a href="https://forms.gle/VSdt18tJrmbN7PxG8" target="_blank" rel="noopener noreferrer" className="flex-1">
                <Button className="w-full bg-purple-600 text-white font-bold h-12 rounded-2xl" onClick={() => setShowFeedbackModal(false)}>OK</Button>
              </a>
            </div>
          </DialogContent>
        </Dialog>
        <StaticPaymentModal
          isOpen={paymentModal.isOpen}
          onClose={() => setPaymentModal(prev => ({ ...prev, isOpen: false }))}
          amount={paymentModal.amount}
          stage={paymentModal.stage}
          onSuccess={confirmPayment}
        />
        <RatingModal
          isOpen={ratingModal.isOpen}
          onClose={() => setRatingModal(prev => ({ ...prev, isOpen: false }))}
          onSubmit={submitRating}
          workerName={ratingModal.workerName}
        />

        <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-border px-4 py-3 sticky top-0 z-10">
          <div className="max-w-md mx-auto flex items-center justify-between w-full">
            <div className="flex items-center gap-3">
              <Avatar className="w-9 h-9 border border-purple-100 rounded-lg overflow-hidden bg-gray-50">
                {workerData.profileImage ? <img src={workerData.profileImage} className="w-full h-full object-cover" /> : <AvatarFallback className="bg-purple-600 text-white text-[13px] font-bold">{getInitials(workerData.name || 'User')}</AvatarFallback>}
              </Avatar>
              <div className="flex flex-col">
                <p className="font-semibold text-foreground text-sm leading-tight">{workerData.name || 'WorkLink'}</p>
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-bold">Consumer Dashboard</p>
              </div>
            </div>
            <Menu className="w-5 h-5 text-muted-foreground" />
          </div>
        </header>

        <main className="flex-1 overflow-y-auto bg-gray-50/50 scrollbar-hide">
          {renderTab()}
        </main>

        <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-border px-4 py-2">
          <div className="max-w-md mx-auto flex justify-around items-center">
            <button onClick={() => handleTabChange('home')} className={`flex flex-col items-center gap-1 py-1 px-4 ${activeTab === 'home' ? 'text-purple-600' : 'text-muted-foreground'}`}>
              <Home className="w-5 h-5" /><span className="text-[10px] font-semibold">Home</span>
            </button>
            <button onClick={() => handleTabChange('orders')} className={`flex flex-col items-center gap-1 py-1 px-4 ${activeTab === 'orders' ? 'text-purple-600' : 'text-muted-foreground'}`}>
              <FileText className="w-5 h-5" /><span className="text-[10px] font-semibold">Orders</span>
            </button>
            <button onClick={() => handleTabChange('account')} className={`flex flex-col items-center gap-1 py-1 px-4 ${activeTab === 'account' ? 'text-purple-600' : 'text-muted-foreground'}`}>
              <User className="w-5 h-5" /><span className="text-[10px] font-semibold">Account</span>
            </button>
          </div>
        </nav>

        {/* Full Image Preview Modal */}
        <Dialog open={!!selectedFullImage} onOpenChange={(open) => !open && setSelectedFullImage(null)}>
          <DialogContent aria-describedby={undefined} className="max-w-3xl p-0 border-0 bg-transparent flex items-center justify-center">
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
      </div>
    </div>
  );
}

// ━━━━━━━━━━━━━━━━━━ ORDER MODAL ━━━━━━━━━━━━━━━━━━

function PlaceOrderModal({ isOpen, onClose, phone, onSuccess }: { isOpen: boolean, onClose: () => void, phone: string, onSuccess: () => void }) {
  const [skill, setSkill] = useState('');
  const [otherSkill, setOtherSkill] = useState('');
  const [description, setDescription] = useState('');
  const [budget, setBudget] = useState('');
  const [image, setImage] = useState('');
  const [workerType, setWorkerType] = useState<'gig' | 'worklink'>('gig');
  const [isUrgent, setIsUrgent] = useState(false);
  const [urgentHours, setUrgentHours] = useState(12);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setError('Image must be less than 5MB');
      e.target.value = '';
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setImage(reader.result as string);
      setError('');
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const finalSkill = skill === 'other' ? otherSkill : skill;
    
    // Calculate final budget with urgent surcharge
    const baseBudget = Number(budget);
    const urgencyPercentage = 20 - (urgentHours - 1) * (15 / 23);
    const finalBudget = isUrgent ? Math.round(baseBudget * (1 + urgencyPercentage / 100)) : baseBudget;

    setIsLoading(true);
    try {
      const res = await fetch('/api/consumer/order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          consumerPhone: phone, 
          mainSkill: finalSkill, 
          description, 
          budget: finalBudget, 
          image,
          workerType,
          isUrgent,
          urgentHours: isUrgent ? urgentHours : undefined
        })
      });
      const data = await res.json();
      if (data.success) { onSuccess(); onClose(); }
      else { setError(data.error || 'Failed to place order'); }
    } catch (err) { setError('Something went wrong'); } finally { setIsLoading(false); }
  };

  const handleDemoRun = async () => {
    if (!skill || !description || !budget) {
      setError('Please fill all required fields');
      return;
    }
    const finalSkill = skill === 'other' ? otherSkill : skill;
    
    // Calculate final budget with urgent surcharge
    const baseBudget = Number(budget);
    const urgencyPercentage = 20 - (urgentHours - 1) * (15 / 23);
    const finalBudget = isUrgent ? Math.round(baseBudget * (1 + urgencyPercentage / 100)) : baseBudget;

    setIsLoading(true);
    try {
      const res = await fetch('/api/demo/consumer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          consumerPhone: phone,
          mainSkill: finalSkill, 
          description, 
          budget: finalBudget, 
          image,
          workerType,
          isUrgent,
          urgentHours: isUrgent ? urgentHours : undefined
        })
      });
      const data = await res.json();
      if (data.success) { onSuccess(); onClose(); }
      else { setError(data.error || 'Failed to place demo order'); }
    } catch (err) { setError('Something went wrong'); } finally { setIsLoading(false); }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md bg-white rounded-3xl p-6 border-0 shadow-2xl overflow-y-auto max-h-[90vh]">
        <DialogHeader className="mb-4">
          <DialogTitle className="text-2xl font-black text-gray-900 tracking-tight flex items-center gap-2"><Package className="w-6 h-6 text-purple-600" />Place New Order</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && <div className="p-3 bg-red-50 text-red-600 rounded-xl text-xs font-bold animate-in shake-in-1 duration-300">{error}</div>}
          <Label>Worker Type</Label>
          <Select value={workerType} onValueChange={(val: any) => setWorkerType(val)}>
            <SelectTrigger className="rounded-xl h-12">
              <SelectValue placeholder="Select worker type" />
            </SelectTrigger>
            <SelectContent className="rounded-xl">
              <SelectItem value="gig">Gig Worker (Flexible)</SelectItem>
              <SelectItem value="worklink">WorkLink Employee (Priority)</SelectItem>
            </SelectContent>
          </Select>

          <Label>Professional Type</Label>
          <Select onValueChange={setSkill}>
            <SelectTrigger className="rounded-xl h-12"><SelectValue placeholder="Select skill" /></SelectTrigger>
            <SelectContent className="rounded-xl">
              {SERVICES.map(s => <SelectItem key={s.id} value={s.label.toLowerCase()}>{s.label}</SelectItem>)}
              <SelectItem value="other">Other</SelectItem>
            </SelectContent>
          </Select>
          {skill === 'other' && <Input placeholder="Skill name" value={otherSkill} onChange={e => setOtherSkill(e.target.value)} />}
          
          <Label>Job Description</Label>
          <Textarea placeholder="What needs to be done?" className="rounded-xl min-h-[100px]" value={description} onChange={e => setDescription(e.target.value)} required />
          
          <Label>Offered Wage (₹)</Label>
          <Input type="number" placeholder="Budget" value={budget} onChange={e => setBudget(e.target.value)} required />

          <div className="space-y-3 bg-red-50/50 p-4 rounded-xl border border-red-100">
            <div className="flex items-center justify-between">
              <Label className="font-bold flex items-center gap-2 text-red-600">
                <AlertTriangle className="w-4 h-4" />
                Urgent Order
              </Label>
              <input 
                type="checkbox" 
                className="w-5 h-5 accent-red-600 cursor-pointer rounded-lg"
                checked={isUrgent}
                onChange={(e) => setIsUrgent(e.target.checked)}
              />
            </div>
            
            {isUrgent && (
              <div className="space-y-4 pt-2 animate-in fade-in zoom-in-95 duration-200">
                <div className="flex justify-between items-center text-xs font-bold text-red-700">
                  <span>Complete within:</span>
                  <span className="bg-red-100 px-2 py-1 rounded-lg">{urgentHours} {urgentHours === 1 ? 'Hour' : 'Hours'}</span>
                </div>
                <input 
                  type="range" 
                  min="1" 
                  max="24" 
                  value={urgentHours}
                  onChange={(e) => setUrgentHours(Number(e.target.value))}
                  className="w-full accent-red-600 h-2 bg-red-200 rounded-lg appearance-none cursor-pointer"
                />
                
                {budget && (
                  <div className="bg-white p-3 rounded-xl border border-red-100 text-sm shadow-sm">
                    <div className="flex justify-between text-gray-500 mb-1">
                      <span>Base Budget:</span>
                      <span>₹{budget}</span>
                    </div>
                    <div className="flex justify-between text-red-600 font-bold mb-1">
                      <span>Urgency Fee ({(20 - (urgentHours - 1) * (15 / 23)).toFixed(1)}%):</span>
                      <span>+₹{Math.round(Number(budget) * ((20 - (urgentHours - 1) * (15 / 23)) / 100))}</span>
                    </div>
                    <div className="flex justify-between text-gray-900 font-black pt-2 border-t border-gray-100 mt-2">
                      <span>Total Budget:</span>
                      <span>₹{Math.round(Number(budget) * (1 + (20 - (urgentHours - 1) * (15 / 23)) / 100))}</span>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          <Label>Reference Image (Max 5MB)</Label>
          <div className="space-y-3">
            <Input type="file" accept="image/*" onChange={handleImageUpload} className="rounded-xl h-12 pt-2.5" />
            {image && (
              <div className="relative w-full h-32 rounded-xl overflow-hidden border-2 border-dashed border-purple-100 p-1">
                <img src={image} className="w-full h-full object-cover rounded-lg" alt="Preview" />
                <button 
                  type="button"
                  onClick={() => setImage('')}
                  className="absolute top-2 right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center shadow-lg"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>

          <div className="flex gap-3 mt-4">
            <Button type="submit" className="flex-1 bg-purple-600 text-white h-12 rounded-xl font-bold shadow-lg shadow-purple-100" disabled={isLoading}>
              {isLoading ? <Loader2 className="animate-spin w-5 h-5 mx-auto" /> : 'Confirm Order'}
            </Button>
            <Button 
              type="button" 
              onClick={handleDemoRun}
              className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white h-12 rounded-xl font-bold shadow-lg shadow-indigo-100" 
              disabled={isLoading}
            >
              Demo Run
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// ━━━━━━━━━━━━━━━━━━ WORKER DETAILS MODAL ━━━━━━━━━━━━━━━━━━

function WorkerDetailsModal({ phone, onClose, scheduledTime }: { phone: string | null, onClose: () => void, scheduledTime?: string }) {
  const [worker, setWorker] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (phone === '9999999999') {
      setWorker({
        name: 'Jane Doe (Demo Worker)',
        phone: '9999999999',
        city: 'Demo City',
        primarySkill: 'Demo Service Specialist',
        rank: 4,
        hasVehicle: 'Yes'
      });
      setLoading(false);
      return;
    }
    if (phone) {
      setLoading(true);
      fetch(`/api/getWorkerDetails?phone=${phone}`)
        .then(res => res.json())
        .then(data => { if (data.success) setWorker(data.data); setLoading(false); })
        .catch(() => setLoading(false));
    } else { setWorker(null); }
  }, [phone]);

  return (
    <Dialog open={!!phone} onOpenChange={(open) => !open && onClose()}>
      <DialogContent aria-describedby={undefined} className="sm:max-w-md bg-white rounded-3xl p-0 border-0 shadow-2xl overflow-hidden">
        {loading ? (
          <>
            <DialogHeader className="sr-only"><DialogTitle>Loading Worker Details</DialogTitle></DialogHeader>
            <div className="p-12 flex flex-col items-center gap-4"><Loader2 className="w-8 h-8 text-purple-600 animate-spin" /><p className="text-sm font-bold text-gray-400">Loading worker profile...</p></div>
          </>
        ) : worker ? (
          <div className="flex flex-col">
            <div className="h-24 bg-gradient-to-r from-purple-600 to-indigo-600 relative p-6">
              <DialogHeader>
                <DialogTitle className="text-white font-black text-lg">Worker Profile</DialogTitle>
              </DialogHeader>
              <div className="absolute -bottom-10 left-6">
                <div className="w-20 h-20 rounded-2xl border-4 border-white overflow-hidden shadow-lg bg-gray-50 flex items-center justify-center">
                  {worker.profilePic?.data ? (
                    <img src={renderImage(worker.profilePic) || ''} className="w-full h-full object-cover" alt="Profile" />
                  ) : (
                    <div className="text-2xl font-black text-purple-700">{worker.name[0]}</div>
                  )}
                </div>
              </div>
            </div>
            <div className="pt-12 px-6 pb-6 space-y-4">
              <div>
                <h3 className="text-xl font-black">{worker.name}</h3>
                <Badge className="bg-purple-100 text-purple-700 border-0 text-[10px] font-bold p-1 uppercase">{worker.primarySkill}</Badge>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1"><Label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Phone</Label><p className="text-sm font-bold">{worker.phone}</p></div>
                <div className="space-y-1"><Label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Vehicle</Label><p className="text-sm font-bold">{worker.hasVehicle || 'No'}</p></div>
              </div>
              {scheduledTime && (
                <div className="bg-green-50 p-4 rounded-2xl border border-green-100 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center"><Clock className="w-5 h-5 text-green-600" /></div>
                  <div><p className="text-xs font-bold text-gray-500 uppercase">Confirmed Appointment</p><p className="text-sm font-black">{new Date(scheduledTime).toLocaleString()}</p></div>
                </div>
              )}
              <Button className="w-full h-12 rounded-2xl bg-purple-600 text-white font-bold" onClick={onClose}>Close</Button>
            </div>
          </div>
        ) : <div className="p-12 text-center text-gray-500 font-bold">Worker not found</div>}
      </DialogContent>
    </Dialog>
  );
}

// ━━━━━━━━━━━━━━━━━━ STATIC PAYMENT MODAL ━━━━━━━━━━━━━━━━━━

function StaticPaymentModal({ isOpen, onClose, amount, onSuccess, stage }: { 
  isOpen: boolean, 
  onClose: () => void, 
  amount: number, 
  onSuccess: () => Promise<void> | void,
  stage: 'initial' | 'final'
}) {
  const [isProcessing, setIsProcessing] = useState(false);

  const handlePay = async () => {
    setIsProcessing(true);
    await onSuccess();
    setIsProcessing(false);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent aria-describedby={undefined} className="sm:max-w-md bg-white rounded-3xl p-6 border-0 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        <DialogHeader className="mb-4">
          <div className="w-12 h-12 bg-green-50 rounded-2xl flex items-center justify-center mb-2">
            <CreditCard className="w-6 h-6 text-green-600" />
          </div>
          <DialogTitle className="text-2xl font-black text-gray-900 tracking-tight">
            {stage === 'initial' ? 'Worker Reached: Initial Payment' : 'Work Done: Final Payment'}
          </DialogTitle>
          <p className="text-sm font-medium text-gray-500">
            {stage === 'initial' 
              ? 'The worker has reached your place. Please make the initial 50% payment to begin the service.' 
              : 'The work is done! Please make the final 50% payment to complete the order.'}
          </p>
        </DialogHeader>

        <div className="bg-gray-50 rounded-2xl p-6 space-y-4 mb-6">
          <div className="flex justify-between items-center text-xs font-bold uppercase tracking-widest text-gray-400">
            <span>Amount to Pay</span>
            <span className="text-gray-900 font-black text-2xl">₹{amount}</span>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-tighter text-gray-400">
              <span>Payment Method</span>
              <span className="text-green-600">Secure Gateway</span>
            </div>
            <div className="h-12 w-full border border-gray-100 rounded-xl bg-white flex items-center justify-between px-4">
              <div className="flex items-center gap-2">
                <div className="w-6 h-4 bg-blue-600 rounded-sm" />
                <span className="text-xs font-bold text-gray-700">•••• •••• •••• 4242</span>
              </div>
              <ChevronRight className="w-4 h-4 text-gray-300" />
            </div>
          </div>
        </div>

        <div className="flex gap-3">
          <Button variant="ghost" onClick={onClose} className="flex-1 h-14 rounded-2xl font-bold text-gray-400 hover:bg-gray-50">Cancel</Button>
          <Button 
            onClick={handlePay} 
            disabled={isProcessing}
            className="flex-1 h-14 rounded-2xl bg-green-600 hover:bg-green-700 text-white font-bold shadow-lg shadow-green-100"
          >
            {isProcessing ? <Loader2 className="w-5 h-5 animate-spin" /> : `Pay ₹${amount}`}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ━━━━━━━━━━━━━━━━━━ RATING MODAL ━━━━━━━━━━━━━━━━━━

function RatingModal({ isOpen, onClose, onSubmit, workerName }: { 
  isOpen: boolean, 
  onClose: () => void, 
  onSubmit: (rating: number) => void,
  workerName: string 
}) {
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent aria-describedby={undefined} className="sm:max-w-xs bg-white rounded-3xl p-6 border-0 shadow-2xl text-center">
        <DialogHeader>
          <div className="w-16 h-16 bg-amber-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Star className="w-8 h-8 text-amber-500 fill-amber-500" />
          </div>
          <DialogTitle className="text-2xl font-black text-gray-900 tracking-tight">Rate your Experience</DialogTitle>
          <p className="text-sm font-medium text-gray-500 mt-2">
            How was your service with <span className="font-bold text-gray-900">{workerName}</span>?
          </p>
        </DialogHeader>

        <div className="flex justify-center gap-2 my-8">
          {[1, 2, 3, 4, 5].map((star) => (
            <div key={star} className="relative w-8 h-8 cursor-pointer flex">
              <div 
                className="w-1/2 h-full z-10" 
                onMouseEnter={() => setHover(star - 0.5)} 
                onMouseLeave={() => setHover(0)} 
                onClick={() => setRating(star - 0.5)} 
              />
              <div 
                className="w-1/2 h-full z-10" 
                onMouseEnter={() => setHover(star)} 
                onMouseLeave={() => setHover(0)} 
                onClick={() => setRating(star)} 
              />
              <Star className="absolute top-0 left-0 w-8 h-8 text-gray-200 fill-gray-200" />
              <div 
                className="absolute top-0 left-0 overflow-hidden pointer-events-none transition-all" 
                style={{ width: (hover || rating) >= star ? '100%' : (hover || rating) === star - 0.5 ? '50%' : '0%' }}
              >
                <Star className="w-8 h-8 text-amber-400 fill-amber-400" />
              </div>
            </div>
          ))}
        </div>

        <div className="flex flex-col gap-3">
          <Button 
            disabled={rating === 0}
            onClick={() => { onSubmit(rating); onClose(); }} 
            className="w-full h-14 rounded-2xl bg-gray-900 text-white font-bold shadow-xl disabled:opacity-50"
          >
            Submit Rating
          </Button>
          <Button variant="ghost" onClick={onClose} className="text-gray-400 font-bold hover:bg-gray-50">Skip</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
