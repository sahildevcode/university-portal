import React from 'react';

export const STUDENT_TERMS_AND_CONDITIONS = [
  'एडमिशन के बाद विद्यार्थी यदि कोर्स को बीच में ही छोड़ता है तो विद्यार्थी को कोर्स की पूरी फीस देनी पड़ेगी।',
  'एडमिशन के लिए जो दस्तावेज विद्यार्थी से मांगे जायेगे, तो विद्यार्थी को अपने सभी दस्तावेज समय से उपलब्ध कराने होंगे।',
  'जो फीस किस्तों में जमा करनी है, विद्यार्थी उसे समय से दे, यदि विद्यार्थी फीस समय से जमा नहीं करता है,तो उस विद्यार्थी को प्रतिदिन की पेनाल्टी देनी पड़ेगी।',
  'यदि विद्यार्थी का एडमिशन स्कॉलरशिप बेस पर है, लेकिन यदि किसी कारण से विद्यार्थी की स्कॉलरशिप नहीं आती है, तो विद्यार्थी को पूरी फीस जमा करने पड़ेगी।',
  'किसी भी कोर्स को करने के लिए विद्यार्थी प्रवेश लेते समय जो भी फीस जमा करेगा, उसे बाद मे वापिस नहीं की जायगी।',
  'यदि विद्यार्थी स्कॉलरशिप फॉर्म के लिए सही दस्तावेज नहीं देता है, और उसकी स्कॉलरशिप नहीं आती है तो स्वयं विद्यार्थी जिम्मेदार होगा संस्था नहीं।',
  'यदि विद्यार्थी ओरिजनल टी.सी. और माइग्रेशन समय पर नहीं देता है तो उसका एडमिशन निरस्त कर दिया जायेगा इसका जिम्मेदार स्वयं विद्यार्थी होगा।',
  'विद्यार्थी परीक्षा, असाइमेंट और प्रैक्टिकल स्वयं के द्वारा लिखना अनिवार्य है।'
];

export default function StudentTermsAndConditions({
  compact = false,
  showSignatures = true,
  studentSignatureImage = null,
  title = "नियम एवं शर्तें (Terms & Conditions)",
  className = ""
}) {
  return (
    <div className={`terms-conditions-block border border-slate-300 rounded-xl p-3.5 bg-slate-50/50 print:bg-transparent print:border-slate-400 break-inside-avoid print:break-inside-avoid ${className}`}>
      {title && (
        <div className="flex items-center justify-between border-b border-slate-300 pb-1.5 mb-2">
          <h4 className="font-extrabold text-[11px] text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
            <span>📜 {title}</span>
          </h4>
          <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider">
            Mandatory Student Undertaking
          </span>
        </div>
      )}

      <div className={`space-y-1.5 text-slate-800 ${compact ? 'text-[9.5px] leading-snug' : 'text-[10.5px] leading-normal'}`}>
        {STUDENT_TERMS_AND_CONDITIONS.map((term, idx) => (
          <div key={idx} className="flex items-start gap-1.5">
            <span className="text-slate-900 font-bold shrink-0 mt-0.5 text-[11px]">❖</span>
            <span className="font-medium text-slate-800">{term}</span>
          </div>
        ))}
      </div>

      {showSignatures && (
        <div className="pt-6 mt-4 border-t border-slate-300 grid grid-cols-3 gap-4 text-center">
          {/* 1. विद्यार्थी हस्ताक्षर */}
          <div className="flex flex-col items-center justify-end">
            <div className="h-9 w-32 sm:w-36 border-b border-slate-700 mb-1 flex items-end justify-center">
              {studentSignatureImage && (
                <img src={studentSignatureImage} alt="Student Signature" className="h-7 max-w-full object-contain mb-0.5" />
              )}
            </div>
            <p className="font-black text-[10.5px] sm:text-[11px] text-slate-900 whitespace-nowrap">
              विद्यार्थी हस्ताक्षर
            </p>
          </div>

          {/* 2. हस्ताक्षर */}
          <div className="flex flex-col items-center justify-end">
            <div className="h-9 w-32 sm:w-36 border-b border-slate-700 mb-1 flex items-end justify-center"></div>
            <p className="font-black text-[10.5px] sm:text-[11px] text-slate-900 whitespace-nowrap">
              हस्ताक्षर
            </p>
          </div>

          {/* 3. संस्था संचालक हस्ताक्षर */}
          <div className="flex flex-col items-center justify-end">
            <div className="h-9 w-36 sm:w-44 border-b border-slate-700 mb-1 flex items-end justify-center">
              <span className="font-serif-univ font-bold text-indigo-950 text-[9px] opacity-80 mb-0.5">
                PKC ACADEMY SEAL
              </span>
            </div>
            <p className="font-black text-[10.5px] sm:text-[11px] text-slate-900 whitespace-nowrap">
              संस्था संचालक हस्ताक्षर
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
