import React, { useState, useEffect, useRef } from 'react';
import { 
  Bot, 
  Mic, 
  MicOff, 
  Volume2, 
  VolumeX, 
  Send, 
  X, 
  Sparkles, 
  ArrowRight, 
  UserPlus, 
  CreditCard, 
  Building2, 
  FileText, 
  GraduationCap, 
  CheckCircle2, 
  AlertCircle,
  RefreshCw,
  HelpCircle,
  Compass,
  MessageSquare
} from 'lucide-react';

export default function AIRobotAssistant({ 
  onNavigate, 
  activeView, 
  adminUser, 
  staffUser, 
  studentUser 
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [inputQuery, setInputQuery] = useState('');
  const [isThinking, setIsThinking] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(true);

  // Message conversation history
  const [messages, setMessages] = useState([
    {
      id: 'welcome',
      sender: 'bot',
      text: 'Namaste! Main aapka AI University Assistant hoon. 🤖\nAap bolkar ya type karke mujhse kuch bhi karwa sakte hain, jaise:\n• "Student fees dekhna hai"\n• "Naye student ka admission karna hai"\n• "University create karna hai"\n• "Syllabus upload karna hai"',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);

  const messagesEndRef = useRef(null);
  const recognitionRef = useRef(null);

  // Auto-scroll to bottom of chat
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  // Initialize Web Speech Recognition
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'hi-IN'; // Hindi + Indian English / Hinglish

      recognition.onstart = () => {
        setIsListening(true);
      };

      recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        if (transcript) {
          handleUserQuery(transcript);
        }
      };

      recognition.onerror = (event) => {
        console.warn('Speech recognition error:', event.error);
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
    } else {
      setSpeechSupported(false);
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }
    };
  }, []);

  // Text-To-Speech (Robot speaks back)
  const speakVoice = (text) => {
    if (!voiceEnabled || typeof window === 'undefined' || !window.speechSynthesis) return;
    try {
      window.speechSynthesis.cancel(); // Stop any ongoing speech
      const cleanText = text
        .replace(/[•\*\#\_\`\~]/g, '')
        .replace(/[\u{1F600}-\u{1F64F}|\u{1F300}-\u{1F5FF}|\u{1F680}-\u{1F6FF}|\u{1F700}-\u{1F77F}|\u{1F780}-\u{1F7FF}|\u{1F800}-\u{1F8FF}|\u{1F900}-\u{1F9FF}|\u{1FA00}-\u{1FA6F}|\u{1FA70}-\u{1FAFF}|\u{2600}-\u{26FF}|\u{2700}-\u{27BF}]/gu, '')
        .trim();

      const utterance = new SpeechSynthesisUtterance(cleanText);
      utterance.rate = 1.0;
      utterance.pitch = 1.05;
      utterance.lang = 'hi-IN';

      const voices = window.speechSynthesis.getVoices();
      const hindiVoice = voices.find(v => v.lang.includes('hi') || v.name.includes('Hindi') || v.lang.includes('IN'));
      if (hindiVoice) {
        utterance.voice = hindiVoice;
      }

      window.speechSynthesis.speak(utterance);
    } catch (err) {
      console.warn('Text-to-speech error:', err);
    }
  };

  // Toggle Voice Listening (Mic)
  const toggleListening = () => {
    if (!recognitionRef.current) {
      alert('Speech recognition is not supported in this browser. Please use Chrome or type your request.');
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      try {
        recognitionRef.current.start();
      } catch (err) {
        console.warn('Speech start error:', err);
      }
    }
  };

  // Process and Execute Natural Language Intent
  const handleUserQuery = async (queryText) => {
    if (!queryText || !queryText.trim()) return;

    const userMsg = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: queryText.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    setInputQuery('');
    setIsThinking(true);

    const q = queryText.toLowerCase().trim();

    // Response object
    let botReplyText = '';
    let actionTriggered = null;

    // 1. INTENT: STUDENT FEES / COLLECTION / LEDGER
    if (
      q.includes('fee') || 
      q.includes('fees') || 
      q.includes('paisa') || 
      q.includes('balance') || 
      q.includes('due') || 
      q.includes('ledger') || 
      q.includes('collection') ||
      q.includes('kist')
    ) {
      botReplyText = 'Ji! Main aapko Student Fees & Collection Desk par le chal raha hoon, jahan aap Course Fee, Admission Fee aur Balances check kar sakte hain.';
      actionTriggered = 'NAV_FEES';
      
      if (staffUser && !adminUser) {
        if (onNavigate) onNavigate('staff', '/staff');
      } else {
        if (onNavigate) onNavigate('admin', '/admin');
      }
      setTimeout(() => {
        window.dispatchEvent(new CustomEvent('ai-action', { detail: { type: 'focus-fees' } }));
      }, 350);
    }

    // 2. INTENT: NEW ADMISSION / STUDENT ENROLLMENT
    else if (
      q.includes('admission') || 
      q.includes('enroll') || 
      q.includes('register') || 
      q.includes('dakhila') || 
      q.includes('form') || 
      q.includes('naya student') || 
      q.includes('naye student')
    ) {
      botReplyText = 'Sure! New Student Admission Form open kar diya gaya hai. Yahan aap candidate ki personal details, photo, aur Course + Admission fee fill kar sakte hain.';
      actionTriggered = 'NAV_ADMISSION';
      
      if (staffUser && !adminUser) {
        if (onNavigate) onNavigate('staff', '/staff');
      } else {
        if (onNavigate) onNavigate('admin', '/admin');
      }
      setTimeout(() => {
        window.dispatchEvent(new CustomEvent('ai-action', { detail: { type: 'open-admission' } }));
      }, 350);
    }

    // 3. INTENT: CREATE / ADD UNIVERSITY
    else if (
      (q.includes('university') && (q.includes('create') || q.includes('add') || q.includes('banao') || q.includes('nayi') || q.includes('karna'))) ||
      q.includes('add university') ||
      q.includes('create university')
    ) {
      botReplyText = 'Academic Hub open ho gaya hai aur "Add New University" ka form screen par khol diya gaya hai!';
      actionTriggered = 'ADD_UNIVERSITY';
      
      if (onNavigate) {
        onNavigate('admin', '/admin');
      }
      setTimeout(() => {
        window.dispatchEvent(new CustomEvent('ai-action', { detail: { type: 'open-add-university' } }));
      }, 400);
    }

    // 4. INTENT: AFFILIATED COLLEGES
    else if (
      q.includes('college') || 
      q.includes('colleges') || 
      q.includes('affiliated') || 
      q.includes('maha vidyalaya')
    ) {
      botReplyText = 'Affiliated Colleges section khol diya gaya hai. Yahan aap university-wise affiliated colleges dekh sakte hain aur naya college add kar sakte hain.';
      actionTriggered = 'NAV_COLLEGES';
      
      if (onNavigate) {
        onNavigate('admin', '/admin');
      }
      setTimeout(() => {
        window.dispatchEvent(new CustomEvent('ai-action', { detail: { type: 'switch-tab', tab: 'colleges' } }));
      }, 400);
    }

    // 5. INTENT: UPLOAD / VIEW SYLLABUS
    else if (
      q.includes('syllabus') || 
      q.includes('pdf') || 
      q.includes('excel') || 
      q.includes('pathyakram')
    ) {
      botReplyText = 'Upload Syllabus section open ho gaya hai! Yahan University ➔ College ➔ Branch ➔ Semester select karke aap PDF ya Excel syllabus upload kar sakte hain.';
      actionTriggered = 'NAV_SYLLABUS';
      
      if (onNavigate) {
        onNavigate('admin', '/admin');
      }
      setTimeout(() => {
        window.dispatchEvent(new CustomEvent('ai-action', { detail: { type: 'switch-tab', tab: 'upload_syllabus' } }));
      }, 400);
    }

    // 6. INTENT: TOTAL STUDENTS / DATABASE COUNTS
    else if (
      q.includes('kitne student') || 
      q.includes('total student') || 
      q.includes('count') || 
      q.includes('stats') || 
      q.includes('kitne bache') ||
      q.includes('students count')
    ) {
      try {
        const res = await fetch('/api/students');
        const data = await res.json();
        const count = data.students ? data.students.length : 0;
        botReplyText = `Portal par abhi total ${count} students successfully registered hain. Unki details dekhne ke liye main Student Directory open kar sakta hoon.`;
      } catch {
        botReplyText = 'Portal par student records live database me stored hain. Main aapko Student Directory par le chalta hoon.';
      }
      actionTriggered = 'CHECK_STATS';
      if (staffUser && !adminUser) {
        if (onNavigate) onNavigate('staff', '/staff');
      } else {
        if (onNavigate) onNavigate('admin', '/admin');
      }
      setTimeout(() => {
        window.dispatchEvent(new CustomEvent('ai-action', { detail: { type: 'focus-students' } }));
      }, 350);
    }

    // 7. INTENT: COURSES & PROGRAMS CATALOG
    else if (
      q.includes('course') || 
      q.includes('courses') || 
      q.includes('b.tech') || 
      q.includes('btech') || 
      q.includes('mba') || 
      q.includes('program')
    ) {
      botReplyText = 'University Course Catalog open kar diya gaya hai, jahan B.Tech ki 13 branches aur MBA ki 8 streams listed hain.';
      actionTriggered = 'NAV_COURSES';
      if (onNavigate) {
        onNavigate('public', '/');
      }
      window.dispatchEvent(new CustomEvent('ai-action', { detail: { type: 'switch-public-tab', tab: 'courses' } }));
    }

    // 8. INTENT: ADMIN PORTAL LOGIN / DESK
    else if (
      q.includes('admin') || 
      q.includes('control desk') || 
      q.includes('dashboard')
    ) {
      botReplyText = 'Admin Control Desk open kiya ja raha hai.';
      actionTriggered = 'NAV_ADMIN';
      if (onNavigate) {
        onNavigate('admin', '/admin');
      }
    }

    // 9. INTENT: HELP / CAPABILITIES
    else if (
      q.includes('help') || 
      q.includes('kya kar sakte ho') || 
      q.includes('madad') || 
      q.includes('kaise') || 
      q.includes('command')
    ) {
      botReplyText = 'Main aapka voice & automation AI robot hoon! Main ye sab kar sakta hoon:\n1. 💰 Student fees & balance dikhana\n2. 📝 Naye student ka admission form kholna\n3. 🏛️ Nayi University create karna\n4. 📂 Syllabus (PDF/Excel) upload karna\n5. 🏫 Affiliated colleges manage karna\n\nAap bas mic daba kar boliye!';
      actionTriggered = 'HELP';
    }

    // DEFAULT FALLBACK
    else {
      botReplyText = `Aapne poocha: "${queryText}". Main aapki help ke liye tayaar hoon. Aap fees, admission, university ya syllabus me se kya karna chahte hain?`;
      actionTriggered = 'FALLBACK';
    }

    setIsThinking(false);

    const botMsg = {
      id: `bot-${Date.now()}`,
      sender: 'bot',
      text: botReplyText,
      actionTag: actionTriggered,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, botMsg]);

    // Speak audio reply
    speakVoice(botReplyText);
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    if (inputQuery.trim()) {
      handleUserQuery(inputQuery);
    }
  };

  const handleQuickChip = (chipText) => {
    handleUserQuery(chipText);
  };

  return (
    <>
      {/* ========================================================================= */}
      {/* 1. FLOATING ROBOT TRIGGER BUTTON (Fixed at Bottom-Right) */}
      {/* ========================================================================= */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-2 no-print font-sans">
        
        {/* Floating Tooltip if Closed */}
        {!isOpen && (
          <div 
            onClick={() => setIsOpen(true)}
            className="hidden sm:flex items-center gap-2 bg-slate-900/90 backdrop-blur-md text-white px-3.5 py-1.5 rounded-full text-xs font-bold shadow-xl border border-amber-400/40 cursor-pointer animate-bounce select-none"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>AI Voice Copilot</span>
            <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-1.5 py-0.2 rounded-full border border-emerald-400/30">
              Active
            </span>
          </div>
        )}

        {/* The Animated Floating Robot Button */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={`relative group w-14 h-14 sm:w-16 sm:h-16 rounded-full shadow-2xl flex items-center justify-center transition-all duration-300 cursor-pointer ${
            isOpen 
              ? 'bg-rose-600 hover:bg-rose-700 text-white rotate-90 scale-95' 
              : 'bg-gradient-to-tr from-indigo-900 via-[#071530] to-indigo-700 text-white hover:scale-105 border-2 border-amber-400 shadow-indigo-900/50'
          }`}
          title="Open AI Robot Assistant"
        >
          {/* Animated Pulse Rings when Idle */}
          {!isOpen && (
            <>
              <span className="absolute -inset-1.5 rounded-full bg-amber-400/20 animate-ping"></span>
              <span className="absolute -inset-0.5 rounded-full bg-gradient-to-r from-amber-400 to-indigo-500 opacity-60 blur-xs"></span>
            </>
          )}

          {/* Button Icon */}
          <div className="relative z-10 flex items-center justify-center">
            {isOpen ? (
              <X className="w-7 h-7" />
            ) : (
              <div className="relative flex items-center justify-center">
                <Bot className="w-8 h-8 text-amber-400 group-hover:scale-110 transition-transform" />
                <span className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-500 border-2 border-[#071530] rounded-full"></span>
              </div>
            )}
          </div>
        </button>
      </div>

      {/* ========================================================================= */}
      {/* 2. EXPANDABLE AI ROBOT COPILOT DIALOGUE WINDOW */}
      {/* ========================================================================= */}
      {isOpen && (
        <div className="fixed bottom-24 right-4 sm:right-6 z-50 w-[94vw] sm:w-[420px] max-h-[82vh] bg-[#071530] text-slate-100 rounded-3xl shadow-2xl border border-indigo-900/80 flex flex-col overflow-hidden backdrop-blur-xl animate-fadeIn font-sans">
          
          {/* Header Bar */}
          <div className="bg-slate-900/90 px-4 sm:px-5 py-3.5 border-b border-indigo-900/60 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-500 to-indigo-600 p-0.5 flex items-center justify-center shadow-md shrink-0">
                <div className="w-full h-full bg-[#071530] rounded-2xl flex items-center justify-center">
                  <Bot className="w-5 h-5 text-amber-400" />
                </div>
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h3 className="font-extrabold text-sm text-white tracking-tight">
                    PKC Voice Copilot
                  </h3>
                  <span className="text-[9px] font-extrabold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-1.5 py-0.2 rounded-full">
                    LIVE AI
                  </span>
                </div>
                <p className="text-[10px] text-slate-400">
                  Speak or type to automate any portal action
                </p>
              </div>
            </div>

            {/* Top Controls: Voice Mute & Close */}
            <div className="flex items-center gap-1">
              <button
                onClick={() => setVoiceEnabled(!voiceEnabled)}
                className={`p-1.5 rounded-xl transition-colors cursor-pointer ${
                  voiceEnabled ? 'text-amber-400 hover:bg-white/10' : 'text-slate-500 hover:bg-white/10'
                }`}
                title={voiceEnabled ? 'Mute Voice Speech' : 'Enable Voice Speech'}
              >
                {voiceEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
              </button>

              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 text-slate-400 hover:text-white hover:bg-white/10 rounded-xl transition-colors cursor-pointer"
                title="Close Copilot"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Quick Action Chips (1-Tap Automation) */}
          <div className="bg-slate-950/70 px-3 py-2 border-b border-indigo-950/80 flex items-center gap-1.5 overflow-x-auto text-[11px] shrink-0 no-scrollbar">
            <button
              onClick={() => handleQuickChip('Students ki fees dekhna hai')}
              className="flex items-center gap-1 bg-white/10 hover:bg-indigo-600 text-slate-200 hover:text-white px-2.5 py-1 rounded-full whitespace-nowrap transition-colors cursor-pointer border border-white/10"
            >
              <CreditCard className="w-3 h-3 text-emerald-400" />
              <span>Check Fees</span>
            </button>

            <button
              onClick={() => handleQuickChip('Naye student ka admission form')}
              className="flex items-center gap-1 bg-white/10 hover:bg-indigo-600 text-slate-200 hover:text-white px-2.5 py-1 rounded-full whitespace-nowrap transition-colors cursor-pointer border border-white/10"
            >
              <UserPlus className="w-3 h-3 text-amber-400" />
              <span>New Admission</span>
            </button>

            <button
              onClick={() => handleQuickChip('University create karna hai')}
              className="flex items-center gap-1 bg-white/10 hover:bg-indigo-600 text-slate-200 hover:text-white px-2.5 py-1 rounded-full whitespace-nowrap transition-colors cursor-pointer border border-white/10"
            >
              <Building2 className="w-3 h-3 text-indigo-400" />
              <span>Add University</span>
            </button>

            <button
              onClick={() => handleQuickChip('Syllabus upload karna hai')}
              className="flex items-center gap-1 bg-white/10 hover:bg-indigo-600 text-slate-200 hover:text-white px-2.5 py-1 rounded-full whitespace-nowrap transition-colors cursor-pointer border border-white/10"
            >
              <FileText className="w-3 h-3 text-teal-400" />
              <span>Upload Syllabus</span>
            </button>

            <button
              onClick={() => handleQuickChip('Total kitne students hain')}
              className="flex items-center gap-1 bg-white/10 hover:bg-indigo-600 text-slate-200 hover:text-white px-2.5 py-1 rounded-full whitespace-nowrap transition-colors cursor-pointer border border-white/10"
            >
              <GraduationCap className="w-3 h-3 text-rose-400" />
              <span>Students Count</span>
            </button>
          </div>

          {/* Conversation Chat Body */}
          <div className="flex-1 p-4 overflow-y-auto space-y-3.5 text-xs">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex gap-2.5 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {msg.sender === 'bot' && (
                  <div className="w-7 h-7 rounded-xl bg-amber-500/20 border border-amber-400/30 flex items-center justify-center shrink-0 mt-0.5">
                    <Bot className="w-4 h-4 text-amber-400" />
                  </div>
                )}

                <div className={`max-w-[85%] rounded-2xl p-3 text-xs leading-relaxed space-y-1 ${
                  msg.sender === 'user'
                    ? 'bg-gradient-to-r from-indigo-600 to-indigo-700 text-white rounded-br-none shadow-md'
                    : 'bg-white/10 border border-white/10 text-slate-200 rounded-bl-none shadow-md'
                }`}>
                  <p className="whitespace-pre-line">{msg.text}</p>
                  <span className={`block text-[9px] text-right ${
                    msg.sender === 'user' ? 'text-indigo-200' : 'text-slate-400'
                  }`}>
                    {msg.timestamp}
                  </span>
                </div>
              </div>
            ))}

            {isThinking && (
              <div className="flex items-center gap-2 text-slate-400 text-xs bg-white/5 p-2.5 rounded-2xl w-fit">
                <RefreshCw className="w-3.5 h-3.5 animate-spin text-amber-400" />
                <span>AI processing action...</span>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Listening Audio Waves Banner */}
          {isListening && (
            <div className="bg-emerald-950/80 border-t border-emerald-500/40 px-4 py-2 flex items-center justify-between text-xs text-emerald-300">
              <div className="flex items-center gap-2">
                <span className="relative flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
                </span>
                <span className="font-bold">Listening to your voice... Boliye!</span>
              </div>
              <button
                onClick={toggleListening}
                className="text-xs bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-2 py-0.5 rounded cursor-pointer"
              >
                Stop
              </button>
            </div>
          )}

          {/* Input & Voice Bar */}
          <div className="bg-slate-900/90 p-3 border-t border-indigo-950/80 shrink-0">
            <form onSubmit={handleFormSubmit} className="flex items-center gap-2">
              
              {/* Voice Mic Button */}
              {speechSupported && (
                <button
                  type="button"
                  onClick={toggleListening}
                  className={`w-10 h-10 rounded-2xl flex items-center justify-center transition-all cursor-pointer shrink-0 ${
                    isListening
                      ? 'bg-rose-600 text-white animate-pulse ring-4 ring-rose-500/30'
                      : 'bg-white/10 hover:bg-amber-500 text-amber-400 hover:text-slate-950 border border-amber-400/30'
                  }`}
                  title={isListening ? 'Stop Listening' : 'Tap to Speak (Mic)'}
                >
                  {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
                </button>
              )}

              {/* Text Input */}
              <input
                type="text"
                value={inputQuery}
                onChange={(e) => setInputQuery(e.target.value)}
                placeholder={isListening ? 'Listening...' : 'Type or say: "Fees dekhna hai"...'}
                className="flex-1 bg-white/10 border border-white/15 focus:border-amber-400/60 rounded-2xl px-3.5 py-2.5 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-amber-400/30"
              />

              {/* Send Button */}
              <button
                type="submit"
                disabled={!inputQuery.trim()}
                className="w-10 h-10 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white rounded-2xl flex items-center justify-center transition-colors cursor-pointer shrink-0"
                title="Send Command"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>

        </div>
      )}
    </>
  );
}
