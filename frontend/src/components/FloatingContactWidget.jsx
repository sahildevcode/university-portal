import React, { useState } from 'react';
import { Mail, MessageCircle, X } from 'lucide-react';

export default function FloatingContactWidget() {
  const whatsappNumber = '917000212637';
  const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent('Hello PKC Education Institute, I would like to inquire about admissions and degree courses.')}`;
  const emailAddress = 'pkcinstituteaiu@gmail.com';
  const emailUrl = `mailto:${emailAddress}?subject=${encodeURIComponent('Admission Inquiry - PKC Education Learning Institute')}&body=${encodeURIComponent('Hello, I would like to inquire about degree course admissions and details at PKC Education Learning Institute. Please provide guidance.')}`;

  return (
    <aside aria-label="Quick Contact Options" className="fixed bottom-6 right-5 sm:right-7 z-50 flex flex-col items-end gap-2.5 select-none print:hidden">
      
      {/* 1. WHATSAPP BUTTON (Top) */}
      <div className="relative group flex items-center">
        {/* Tooltip on Hover / First Visit */}
        <span className="hidden sm:flex absolute right-full mr-3 items-center gap-1 bg-slate-900/95 text-white text-[11px] font-bold py-1.5 px-3 rounded-xl shadow-xl whitespace-nowrap opacity-0 group-hover:opacity-100 transition-all duration-200 pointer-events-none border border-slate-700">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          WhatsApp Us: +91 7000212637
        </span>

        <a
          href={whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="relative w-13 h-13 sm:w-14 sm:h-14 rounded-full bg-[#25D366] hover:bg-[#20ba5a] text-white flex items-center justify-center shadow-2xl shadow-emerald-500/40 hover:scale-110 active:scale-95 transition-all duration-300 group"
          title="Direct WhatsApp with Owner: 7000212637"
          aria-label="Direct WhatsApp Chat with Institute Owner"
        >
          {/* Subtle Pulse Ring */}
          <span className="absolute inset-0 rounded-full bg-[#25D366] opacity-40 animate-ping -z-10 group-hover:animate-none"></span>

          {/* WhatsApp Official SVG Logo */}
          <svg 
            className="w-7 h-7 sm:w-8 sm:h-8 fill-current" 
            viewBox="0 0 24 24" 
            xmlns="http://www.w3.org/2000/svg"
          >
            <path d="M17.507 14.307l-.009.075c-.234-.117-1.385-.683-1.6-.761-.215-.078-.372-.117-.528.117-.157.234-.607.761-.744.918-.137.157-.274.176-.508.059-.234-.117-.99-.365-1.886-1.164-.697-.621-1.168-1.389-1.305-1.623-.137-.234-.015-.36.103-.477.106-.105.234-.274.351-.411.117-.137.156-.234.234-.391.078-.157.039-.294-.02-.411-.059-.117-.528-1.272-.724-1.742-.191-.459-.385-.396-.528-.403l-.45-.008c-.156 0-.411.059-.626.294s-.822.802-.822 1.956c0 1.154.841 2.27 1.017 2.426.176.157 1.656 2.529 4.012 3.546.561.242.998.387 1.34.496.563.179 1.076.154 1.481.093.452-.068 1.385-.566 1.581-1.113.196-.547.196-1.016.137-1.113-.058-.098-.214-.157-.448-.274m-5.467 7.693c-1.802 0-3.57-.48-5.116-1.391l-.367-.218-3.805.998 1.016-3.709-.239-.381c-1.002-1.594-1.531-3.447-1.531-5.348 0-5.542 4.508-10.05 10.05-10.05 2.686 0 5.21 1.047 7.109 2.949 1.9 1.901 2.946 4.426 2.945 7.112-.002 5.543-4.51 10.048-10.063 10.048m8.528-18.577c-2.276-2.279-5.305-3.535-8.526-3.535-6.643 0-12.049 5.405-12.052 12.049 0 2.121.554 4.19 1.608 6.016l-1.708 6.24 6.386-1.675c1.758.959 3.738 1.465 5.761 1.467h.005c6.644 0 12.05-5.406 12.053-12.05.002-3.219-1.251-6.249-3.527-8.512"/>
          </svg>
        </a>
      </div>

      {/* 2. EMAIL BUTTON (Below WhatsApp) */}
      <div className="relative group flex items-center">
        {/* Tooltip on Hover */}
        <span className="hidden sm:flex absolute right-full mr-3 items-center gap-1 bg-[#071530] text-[#C59B27] text-[11px] font-bold py-1.5 px-3 rounded-xl shadow-xl whitespace-nowrap opacity-0 group-hover:opacity-100 transition-all duration-200 pointer-events-none border border-[#C59B27]/40">
          <Mail className="w-3.5 h-3.5 text-[#C59B27]" />
          Email: pkcinstituteaiu@gmail.com
        </span>

        <a
          href={emailUrl}
          className="w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-[#071530] hover:bg-[#0f2a5c] text-amber-400 border border-[#C59B27]/60 flex items-center justify-center shadow-xl hover:scale-110 active:scale-95 transition-all duration-300 group"
          title="Direct Email: pkcinstituteaiu@gmail.com"
          aria-label="Direct Email to PKC Institute"
        >
          <Mail className="w-5 h-5 group-hover:rotate-6 transition-transform" />
        </a>
      </div>

    </aside>
  );
}
