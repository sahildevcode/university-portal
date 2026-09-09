import React, { useState, useEffect, useRef } from 'react';
import { CreditCard, UserPlus, FileText, Printer, Banknote, ShieldCheck, LogOut, UserCheck, FolderCheck, ChevronDown, ExternalLink } from 'lucide-react';
import StudentRegistration from './StudentRegistration';
import AccountsDashboard from './AccountsDashboard';
import StudentDocumentsTracker from './StudentDocumentsTracker';

export default function CashCounterPortal({ courses, staffUser, onStaffLogout }) {
  const [activeTab, setActiveTab] = useState('collect-fee'); // 'collect-fee' | 'walkin-admission' | 'documents'
  const [isDeskDropdownOpen, setIsDeskDropdownOpen] = useState(false);
  const deskDropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (deskDropdownRef.current && !deskDropdownRef.current.contains(event.target)) {
        setIsDeskDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const staffDesks = [
    {
      id: 'collect-fee',
      label: '1. Collect Fee Installments (Cash / Card / Online)',
      sub: 'छात्र फीस रसीद, नकद, यूपीआई व कार्ड पेमेंट डेस्क',
      icon: Banknote,
      color: 'text-emerald-600',
      badge: 'Fee Collection'
    },
    {
      id: 'walkin-admission',
      label: '2. Physical Walk-in Admission & Initial Fee',
      sub: 'सीधे काउंटर पर नया छात्र प्रवेश व नामांकन',
      icon: UserPlus,
      color: 'text-indigo-600',
      badge: 'Offline Admission'
    },
    {
      id: 'documents',
      label: '3. Student Documents & Verification Desk',
      sub: 'छात्र मूल दस्तावेज़, अंकसूची व आईडी सत्यापन',
      icon: FolderCheck,
      color: 'text-purple-600',
      badge: 'Doc Verification'
    }
  ];

  const activeDesk = staffDesks.find(d => d.id === activeTab) || staffDesks[0];
  const ActiveDeskIcon = activeDesk.icon;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 text-slate-900">
      
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-emerald-950 via-slate-900 to-emerald-950 text-white rounded-3xl p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-xl border border-emerald-900">
        <div className="flex items-center gap-4 text-center sm:text-left">
          <div className="w-16 h-16 rounded-2xl bg-emerald-500 text-slate-950 flex items-center justify-center font-black shrink-0 shadow-lg">
            <UserCheck className="w-9 h-9" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-300 bg-emerald-400/15 px-3 py-1 rounded-full border border-emerald-400/30 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                Official Staff Desk
              </span>
              {staffUser && (
                <span className="text-xs font-semibold bg-white/10 px-3 py-1 rounded-full text-emerald-200 border border-white/10">
                  Staff ID: <span className="font-mono text-white font-bold">{staffUser.username}</span>
                </span>
              )}
            </div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-white">
              PKC Education Group — Cash Counter & Walk-in Desk
            </h1>
            <p className="text-xs text-emerald-200 mt-0.5">
              Supports <strong className="text-white">Cash (नकद), Card Swipe (POS) & Online UPI</strong> payments with automatic live sync to Admin Treasury.
            </p>
          </div>
        </div>

        {staffUser ? (
          <div className="flex flex-col sm:items-end items-center gap-2 bg-slate-900/70 p-4 rounded-2xl border border-emerald-500/20 backdrop-blur-xs">
            <div className="text-center sm:text-right">
              <div className="text-sm font-extrabold text-white uppercase tracking-wide">
                {staffUser.name}
              </div>
              <div className="text-xs text-emerald-300 font-semibold">
                {staffUser.role || 'Staff Operator'}
              </div>
              <div className="text-[11px] text-slate-400">
                Department: <span className="text-slate-200 font-medium">{staffUser.department || 'Accounts & Admissions'}</span>
              </div>
            </div>
            <div className="flex items-center gap-2 mt-1">
              <a
                href="/"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 text-xs font-bold text-slate-200 hover:text-white bg-white/10 hover:bg-white/20 px-3 py-1.5 rounded-xl transition-colors border border-white/10"
              >
                <ExternalLink className="w-3.5 h-3.5 text-emerald-400" />
                <span>Student Site</span>
              </a>
              <button
                onClick={onStaffLogout}
                className="flex items-center gap-1.5 text-xs font-bold text-rose-200 hover:text-white bg-rose-600/80 hover:bg-rose-600 px-3 py-1.5 rounded-xl transition-colors cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Logout</span>
              </button>
            </div>
          </div>
        ) : null}
      </div>

      {/* Operator Session Bar */}
      {staffUser && (
        <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs shadow-xs">
          <div className="flex items-center gap-2.5 text-emerald-950 font-medium">
            <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0" />
            <span>
              Active Session: <strong className="font-bold uppercase text-emerald-900">{staffUser.name}</strong> ({staffUser.role} • {staffUser.department}). Every fee transaction and registration issued from this terminal will be authenticated and signed in your name.
            </span>
          </div>
          <span className="text-[11px] font-mono font-bold text-emerald-800 bg-white px-3 py-1 rounded-lg border border-emerald-200 shrink-0">
            {staffUser.username}
          </span>
        </div>
      )}

      {/* Staff Desk Mode Dropdown Selector */}
      <div className="bg-white p-3.5 sm:p-4 rounded-3xl border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3 relative z-30">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-emerald-950 text-emerald-400 flex items-center justify-center shrink-0 shadow-xs">
            <ActiveDeskIcon className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
              Staff Desk Mode (कार्य अनुभाग चुनें):
            </span>
            <div className="text-sm sm:text-base font-extrabold text-slate-900 flex items-center gap-2">
              <span>{activeDesk.label}</span>
              <span className="text-[11px] font-bold text-slate-500 hidden md:inline">({activeDesk.sub})</span>
            </div>
          </div>
        </div>

        {/* Interactive Custom Dropdown Menu */}
        <div className="relative min-w-[280px] sm:min-w-[360px]" ref={deskDropdownRef}>
          <button
            type="button"
            onClick={() => setIsDeskDropdownOpen(!isDeskDropdownOpen)}
            className="w-full flex items-center justify-between gap-3 bg-slate-50 hover:bg-slate-100 border border-slate-300 p-2.5 sm:px-4 rounded-2xl text-xs font-extrabold text-slate-800 transition-all cursor-pointer shadow-xs"
          >
            <div className="flex items-center gap-2.5 truncate">
              <ActiveDeskIcon className={`w-4 h-4 shrink-0 ${activeDesk.color}`} />
              <span className="truncate">{activeDesk.label}</span>
            </div>
            <ChevronDown className={`w-4 h-4 text-slate-500 shrink-0 transition-transform duration-200 ${isDeskDropdownOpen ? 'rotate-180' : ''}`} />
          </button>

          {/* Floating Menu */}
          {isDeskDropdownOpen && (
            <div className="absolute right-0 top-full mt-2 w-full sm:w-[380px] bg-white rounded-2xl shadow-2xl border border-slate-200 py-2 z-50 animate-fadeIn">
              <div className="px-4 py-2 border-b border-slate-100 text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center justify-between">
                <span>Select Desk Function:</span>
                <span className="text-[10px] text-emerald-700 font-extrabold">3 Desks</span>
              </div>
              <div className="divide-y divide-slate-100">
                {staffDesks.map((desk) => {
                  const Icon = desk.icon;
                  const isSelected = activeTab === desk.id;
                  return (
                    <button
                      key={desk.id}
                      type="button"
                      onClick={() => {
                        setActiveTab(desk.id);
                        setIsDeskDropdownOpen(false);
                      }}
                      className={`w-full text-left p-3 sm:px-4 flex items-start gap-3 transition-colors cursor-pointer ${
                        isSelected ? 'bg-emerald-50/80 text-emerald-950 font-bold' : 'hover:bg-slate-50 text-slate-700'
                      }`}
                    >
                      <div className={`p-2 rounded-xl shrink-0 mt-0.5 ${isSelected ? 'bg-emerald-600 text-white shadow-xs' : 'bg-slate-100 text-slate-600'}`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-xs font-bold truncate">{desk.label}</span>
                          {isSelected ? (
                            <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full shrink-0">Active</span>
                          ) : (
                            <span className="text-[10px] text-slate-400 font-medium shrink-0">{desk.badge}</span>
                          )}
                        </div>
                        <p className="text-[11px] text-slate-500 truncate mt-0.5">{desk.sub}</p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === 'collect-fee' && (
        <div className="space-y-4">
          <div className="bg-slate-100 border border-slate-200 text-slate-700 px-4 py-2.5 rounded-2xl text-xs flex items-center gap-2">
            <span className="font-bold">🔒 Cashier Counter:</span>
            <span>Fee collection entries are locked upon receipt generation. Corrections or fee reductions require University Admin authority.</span>
          </div>
          <AccountsDashboard isAdmin={false} staffUser={staffUser} />
        </div>
      )}

      {activeTab === 'walkin-admission' && (
        <div className="space-y-4">
          <div className="bg-indigo-50 border border-indigo-200 p-4 rounded-2xl text-xs text-indigo-950 flex items-center gap-3">
            <ShieldCheck className="w-5 h-5 text-indigo-600 shrink-0" />
            <span>
              <strong>Walk-in Admission Desk:</strong> Register offline student candidate, upload document proofs, and collect initial admission fee via <strong>Cash, Card Swipe, or UPI</strong>.
            </span>
          </div>
          <StudentRegistration courses={courses} staffUser={staffUser} />
        </div>
      )}

      {activeTab === 'documents' && (
        <div className="space-y-4">
          <StudentDocumentsTracker isAdmin={false} staffUser={staffUser} courses={courses} />
        </div>
      )}

    </div>
  );
}
