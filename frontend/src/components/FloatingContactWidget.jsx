import React from 'react';
import { Mail, MapPin, ExternalLink } from 'lucide-react';

export default function FloatingContactWidget() {
  const whatsappNumber = '917000212637';
  const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent('Hello PKC Education Institute, I would like to inquire about admissions and degree courses.')}`;
  const mapsUrl = 'https://maps.app.goo.gl/j28qn74aWXJN1ueM8';
  const emailAddress = 'pkcinstituteaiu@gmail.com';
  const emailUrl = `mailto:${emailAddress}?subject=${encodeURIComponent('Admission Inquiry - PKC Education Learning Institute')}&body=${encodeURIComponent('Hello, I would like to inquire about degree course admissions and details at PKC Education Learning Institute. Please provide guidance.')}`;

  return (
    <aside 
      aria-label="Quick Contact & Location Desk" 
      className="fixed right-0 top-[calc(50%+36px)] -translate-y-1/2 z-50 flex flex-col items-end gap-2 select-none print:hidden pointer-events-none"
    >
      
      {/* ========================================================================= */}
      {/* 1. WHATSAPP TAB (Right side, deeply tucked in: only ~12px visible until hover) */}
      {/* ========================================================================= */}
      <div className="pointer-events-auto transform translate-x-[calc(100%-12px)] hover:translate-x-0 transition-transform duration-300 ease-out group">
        <a
          href={whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 bg-[#25D366] hover:bg-[#20ba5a] text-white pl-2.5 pr-4 py-2 rounded-l-xl shadow-xl shadow-emerald-700/30 border-y border-l border-emerald-300/40 cursor-pointer transition-colors"
          title="Chat on WhatsApp (+91 7000212637)"
          aria-label="Chat on WhatsApp with PKC Institute"
        >
          {/* Peeking Icon at the left edge of tab */}
          <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
            <svg 
              className="w-3.5 h-3.5 fill-current text-white" 
              viewBox="0 0 24 24" 
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M17.507 14.307l-.009.075c-.234-.117-1.385-.683-1.6-.761-.215-.078-.372-.117-.528.117-.157.234-.607.761-.744.918-.137.157-.274.176-.508.059-.234-.117-.99-.365-1.886-1.164-.697-.621-1.168-1.389-1.305-1.623-.137-.234-.015-.36.103-.477.106-.105.234-.274.351-.411.117-.137.156-.234.234-.391.078-.157.039-.294-.02-.411-.059-.117-.528-1.272-.724-1.742-.191-.459-.385-.396-.528-.403l-.45-.008c-.156 0-.411.059-.626.294s-.822.802-.822 1.956c0 1.154.841 2.27 1.017 2.426.176.157 1.656 2.529 4.012 3.546.561.242.998.387 1.34.496.563.179 1.076.154 1.481.093.452-.068 1.385-.566 1.581-1.113.196-.547.196-1.016.137-1.113-.058-.098-.214-.157-.448-.274m-5.467 7.693c-1.802 0-3.57-.48-5.116-1.391l-.367-.218-3.805.998 1.016-3.709-.239-.381c-1.002-1.594-1.531-3.447-1.531-5.348 0-5.542 4.508-10.05 10.05-10.05 2.686 0 5.21 1.047 7.109 2.949 1.9 1.901 2.946 4.426 2.945 7.112-.002 5.543-4.51 10.048-10.063 10.048m8.528-18.577c-2.276-2.279-5.305-3.535-8.526-3.535-6.643 0-12.049 5.405-12.052 12.049 0 2.121.554 4.19 1.608 6.016l-1.708 6.24 6.386-1.675c1.758.959 3.738 1.465 5.761 1.467h.005c6.644 0 12.05-5.406 12.053-12.05.002-3.219-1.251-6.249-3.527-8.512"/>
            </svg>
          </div>

          {/* Slide-out Text Content */}
          <div className="text-left whitespace-nowrap pr-1">
            <span className="block text-[9px] uppercase tracking-wider font-extrabold text-emerald-100 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse"></span>
              WhatsApp
            </span>
            <span className="block text-xs font-black tracking-tight text-white">
              +91 7000212637
            </span>
          </div>
        </a>
      </div>

      {/* ========================================================================= */}
      {/* 2. GOOGLE MAPS LOCATION TAB (Right side, deeply tucked in: only ~12px visible) */}
      {/* ========================================================================= */}
      <div className="pointer-events-auto transform translate-x-[calc(100%-12px)] hover:translate-x-0 transition-transform duration-300 ease-out group">
        <a
          href={mapsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 text-white pl-2.5 pr-4 py-2 rounded-l-xl shadow-xl shadow-rose-700/30 border-y border-l border-rose-300/40 cursor-pointer transition-colors"
          title="Open Campus Location on Google Maps"
          aria-label="View PKC Institute Location on Google Maps"
        >
          {/* Peeking Icon at the left edge of tab */}
          <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
            <MapPin className="w-3.5 h-3.5 text-white" />
          </div>

          {/* Slide-out Text Content */}
          <div className="text-left whitespace-nowrap pr-1">
            <span className="block text-[9px] uppercase tracking-wider font-extrabold text-rose-100 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse"></span>
              Location
            </span>
            <span className="block text-xs font-black tracking-tight text-white flex items-center gap-1">
              Near Bus Stand, Chhatarpur <ExternalLink className="w-3 h-3 text-amber-200" />
            </span>
          </div>
        </a>
      </div>

      {/* ========================================================================= */}
      {/* 3. EMAIL TAB (Right side, deeply tucked in: only ~12px visible) */}
      {/* ========================================================================= */}
      <div className="pointer-events-auto transform translate-x-[calc(100%-12px)] hover:translate-x-0 transition-transform duration-300 ease-out group">
        <a
          href={emailUrl}
          className="flex items-center gap-2 bg-[#071530] hover:bg-[#0c2049] text-white pl-2.5 pr-4 py-2 rounded-l-xl shadow-xl shadow-slate-950/50 border-y border-l border-[#C59B27]/60 cursor-pointer transition-colors"
          title="Direct Email: pkcinstituteaiu@gmail.com"
          aria-label="Direct Email to PKC Institute"
        >
          {/* Peeking Icon at the left edge of tab */}
          <div className="w-6 h-6 rounded-full bg-amber-400/20 text-amber-400 border border-amber-400/40 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
            <Mail className="w-3.5 h-3.5 text-amber-400" />
          </div>

          {/* Slide-out Text Content */}
          <div className="text-left whitespace-nowrap pr-1">
            <span className="block text-[9px] uppercase tracking-wider font-extrabold text-amber-400">
              Email Us
            </span>
            <span className="block text-xs font-black tracking-tight text-white">
              pkcinstituteaiu@gmail.com
            </span>
          </div>
        </a>
      </div>

    </aside>
  );
}
