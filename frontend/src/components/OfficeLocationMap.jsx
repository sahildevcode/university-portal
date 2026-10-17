import React, { useState, useRef } from 'react';
import { 
  MapPin, 
  Navigation, 
  Share2, 
  Download, 
  ExternalLink, 
  Check, 
  Copy, 
  Phone, 
  MessageSquare, 
  Star, 
  Maximize2, 
  Minimize2, 
  Plus, 
  Minus, 
  Compass, 
  CheckCircle2,
  Building2,
  Clock,
  X
} from 'lucide-react';

export default function OfficeLocationMap({ className = "" }) {
  const [zoomLevel, setZoomLevel] = useState(1);
  const [copiedType, setCopiedType] = useState(null);
  const [isExpanded, setIsExpanded] = useState(false);
  const [viewMode, setViewMode] = useState('dark'); // 'dark' or 'satellite'
  const [downloading, setDownloading] = useState(false);
  const [shareModalOpen, setShareModalOpen] = useState(false);

  // Both Official Campuses Data
  const locations = {
    office: {
      id: 'office',
      name: "PKC Education Learning Institute (Head Office)",
      shortName: "Head Office (Panna Road)",
      tag: "HEAD OFFICE (MAIN CAMPUS)",
      badge: "UGC Admissions & Administration",
      address: "Beside Govt. Girls College, Panna Road, Choubey Colony, Chhatarpur (M.P.) - 471001",
      landmarks: "Near Loknathpuram Colony & Govt. Maharaja PG College",
      mapsUrl: "https://share.google/r5US9gVYqU8Uui9Gj",
      navUrl: "https://www.google.com/maps/dir/?api=1&destination=PKC+Education+Learning+Institute+Office+Chhatarpur"
    },
    institute: {
      id: 'institute',
      name: "PKC Education Learning Institute (Institute Campus)",
      shortName: "Institute Campus (Satai Road)",
      tag: "INSTITUTE CAMPUS (BRANCH)",
      badge: "Computer Lab & IT Training",
      address: "PKC Education Learning Institute, Satai Road, Pooja Doodh Dairy ke Upper, Chhatarpur (M.P.)",
      landmarks: "Near Pooja Doodh Dairy, Satai Road",
      mapsUrl: "https://maps.app.goo.gl/kTX4J2zAUR8LHpuU9",
      navUrl: "https://www.google.com/maps/dir/?api=1&destination=PKC+Education+Learning+Institute+Satai+Road+Chhatarpur"
    }
  };

  const helplineNumber = "+91 7580878825";
  const officeHoursText = "Mon - Sat: 10:00 AM - 06:00 PM";
  const googleMapsUrl = locations.office.mapsUrl;

  // Share functionality with 2 location options
  const handleShareLocation = async (type = 'office') => {
    const loc = locations[type];
    const shareData = {
      title: loc.name,
      text: `${loc.name} location on Google Maps:\nAddress: ${loc.address}\nLandmark: ${loc.landmarks}\nHelpline: ${helplineNumber}\nTiming: ${officeHoursText}\n`,
      url: loc.mapsUrl,
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
        return;
      } catch (err) {}
    }

    try {
      await navigator.clipboard.writeText(`${loc.name}\nAddress: ${loc.address}\nHelpline: ${helplineNumber}\nGoogle Maps: ${loc.mapsUrl}`);
      setCopiedType(type);
      setTimeout(() => setCopiedType(null), 3000);
    } catch {
      window.prompt("Copy location link:", loc.mapsUrl);
    }
  };

  // WhatsApp Share with 2 location options
  const handleWhatsAppShare = (type = 'office') => {
    const loc = locations[type];
    const text = encodeURIComponent(
      `📍 *${loc.name}*\n\n` +
      `🏢 *Address:* ${loc.address}\n` +
      `📌 *Landmark:* ${loc.landmarks}\n` +
      `📞 *Helpline:* ${helplineNumber}\n` +
      `⏰ *Office Hours:* ${officeHoursText}\n` +
      `🗺️ *Google Maps Link:* ${loc.mapsUrl}\n\n` +
      `Admissions & Course Counseling: BA, B.Sc, B.Com, BCA, MBA, B.Tech, DCA, PGDCA, B.Ed, MPTASS Scholarship`
    );
    window.open(`https://api.whatsapp.com/send?text=${text}`, '_blank');
  };

  // Handle Offline Location Card Download via Canvas (Generates image featuring BOTH Campuses)
  const handleDownloadCard = () => {
    setDownloading(true);
    try {
      const canvas = document.createElement('canvas');
      canvas.width = 1200;
      canvas.height = 780;
      const ctx = canvas.getContext('2d');

      // 1. Background Gradient
      const grad = ctx.createLinearGradient(0, 0, 1200, 780);
      grad.addColorStop(0, '#071530');
      grad.addColorStop(0.5, '#0c234b');
      grad.addColorStop(1, '#050f24');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, 1200, 780);

      // Gold Accent Border
      ctx.strokeStyle = '#C59B27';
      ctx.lineWidth = 8;
      ctx.strokeRect(20, 20, 1160, 740);

      // Inner subtle border
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
      ctx.lineWidth = 2;
      ctx.strokeRect(32, 32, 1136, 716);

      // Top Tag
      ctx.fillStyle = '#C59B27';
      ctx.font = 'bold 22px system-ui, sans-serif';
      ctx.letterSpacing = '3px';
      ctx.fillText('OFFICIAL HEAD OFFICE & CAMPUS LOCATION GUIDE', 60, 85);

      // Institute Name
      ctx.fillStyle = '#FFFFFF';
      ctx.font = 'bold 40px Georgia, serif';
      ctx.letterSpacing = '0px';
      ctx.fillText('PKC Education Learning Institute & Consultancy', 60, 140);

      // Rating & Verified badge
      ctx.fillStyle = '#F59E0B';
      ctx.font = 'bold 24px system-ui, sans-serif';
      ctx.fillText('★ 5.0 Google Verified (Education Center)', 60, 185);

      // Divider line
      ctx.strokeStyle = 'rgba(197, 155, 39, 0.4)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(60, 210);
      ctx.lineTo(1140, 210);
      ctx.stroke();

      // ==========================================
      // BOX 1 (LEFT): 🏢 HEAD OFFICE (PANNA ROAD)
      // ==========================================
      ctx.fillStyle = '#0f1f3d';
      ctx.fillRect(60, 230, 525, 340);
      ctx.strokeStyle = 'rgba(197, 155, 39, 0.35)';
      ctx.lineWidth = 2;
      ctx.strokeRect(60, 230, 525, 340);

      ctx.fillStyle = '#93C5FD';
      ctx.font = 'bold 20px system-ui, sans-serif';
      ctx.fillText('🏢 1. HEAD OFFICE (PANNA ROAD):', 85, 275);

      ctx.fillStyle = '#FFFFFF';
      ctx.font = 'bold 23px system-ui, sans-serif';
      ctx.fillText('Beside Govt. Girls College, Panna Road,', 85, 320);
      ctx.fillText('Choubey Colony, Chhatarpur (M.P.) - 471001', 85, 360);

      ctx.fillStyle = '#CBD5E1';
      ctx.font = '18px system-ui, sans-serif';
      ctx.fillText('Landmark: Near Loknathpuram & Maharaja College', 85, 420);

      ctx.fillStyle = '#FBBF24';
      ctx.font = '16px system-ui, sans-serif';
      ctx.fillText('🗺️ Maps: https://share.google/r5US9gVYqU8Uui9Gj', 85, 475);
      ctx.fillText('• UGC Degree Admissions & University Counseling', 85, 525);

      // ==========================================
      // BOX 2 (RIGHT): 🏫 INSTITUTE CAMPUS (SATAI ROAD)
      // ==========================================
      ctx.fillStyle = '#0f1f3d';
      ctx.fillRect(615, 230, 525, 340);
      ctx.strokeStyle = 'rgba(52, 211, 153, 0.35)';
      ctx.lineWidth = 2;
      ctx.strokeRect(615, 230, 525, 340);

      ctx.fillStyle = '#A7F3D0';
      ctx.font = 'bold 20px system-ui, sans-serif';
      ctx.fillText('🏫 2. INSTITUTE CAMPUS (SATAI ROAD):', 640, 275);

      ctx.fillStyle = '#FFFFFF';
      ctx.font = 'bold 23px system-ui, sans-serif';
      ctx.fillText('PKC Education Learning Institute,', 640, 320);
      ctx.fillText('Satai Road, Pooja Doodh Dairy ke Upper,', 640, 360);
      ctx.fillText('Chhatarpur (M.P.)', 640, 400);

      ctx.fillStyle = '#CBD5E1';
      ctx.font = '18px system-ui, sans-serif';
      ctx.fillText('Landmark: Near Pooja Doodh Dairy, Satai Road', 640, 450);

      ctx.fillStyle = '#FBBF24';
      ctx.font = '16px system-ui, sans-serif';
      ctx.fillText('🗺️ Maps: https://maps.app.goo.gl/kTX4J2zAUR8LHpuU9', 640, 495);
      ctx.fillText('• Practical Computer Labs, DCA, PGDCA & Training', 640, 535);

      // Contact & Timing Row (Below Boxes)
      ctx.fillStyle = '#10B981';
      ctx.font = 'bold 24px system-ui, sans-serif';
      ctx.fillText(`📞 Helpline: ${helplineNumber}`, 60, 615);

      ctx.fillStyle = '#FBBF24';
      ctx.font = 'bold 24px system-ui, sans-serif';
      ctx.fillText(`⏰ Office Hours: ${officeHoursText}`, 550, 615);

      // Bottom footer branding
      ctx.fillStyle = '#94A3B8';
      ctx.font = 'italic 18px system-ui, sans-serif';
      ctx.fillText('Authorized UGC Degree Admissions & Govt. Recognized IT Diplomas (Est. 2011)', 60, 670);

      // Download triggered
      const imageURL = canvas.toDataURL('image/png');
      const downloadLink = document.createElement('a');
      downloadLink.href = imageURL;
      downloadLink.download = 'PKC_Education_Head_Office_And_Institute_Location.png';
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);
    } catch (e) {
      console.error('Download error:', e);
      window.open(locations.office.mapsUrl, '_blank');
    } finally {
      setTimeout(() => setDownloading(false), 800);
    }
  };

  return (
    <div className={`w-full ${className}`}>
      <div className="bg-[#0b1325] border border-slate-800 rounded-3xl shadow-2xl overflow-hidden">
        
        {/* Top Header Bar */}
        <div className="p-4 sm:p-5 bg-gradient-to-r from-[#071530] via-[#0d1e3d] to-[#071530] border-b border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <span className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/30 text-[#C59B27]">
              <MapPin className="w-5 h-5 text-red-500 animate-bounce" />
            </span>
            <div>
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[#C59B27] block">
                OFFICIAL GOOGLE MAPS LOCATION
              </span>
              <h3 className="font-serif-academic font-bold text-lg sm:text-xl text-white">
                PKC Education Learning Institute Office Chhatarpur
              </h3>
            </div>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            <button
              onClick={() => setViewMode(viewMode === 'dark' ? 'interactive' : 'dark')}
              className={`text-xs font-bold px-3 py-1.5 rounded-lg border transition-all cursor-pointer flex items-center gap-1.5 ${
                viewMode === 'interactive' 
                  ? 'bg-amber-500/20 text-amber-300 border-amber-400/40' 
                  : 'bg-slate-900 text-slate-300 border-slate-700 hover:text-white'
              }`}
            >
              <Compass className="w-3.5 h-3.5" />
              <span>{viewMode === 'interactive' ? 'Stylized Map' : 'Satellite / Live'}</span>
            </button>

            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="text-xs font-bold p-1.5 rounded-lg bg-slate-900 text-slate-300 hover:text-white border border-slate-700 transition-all cursor-pointer"
              title={isExpanded ? "Collapse View" : "Expand Map"}
            >
              {isExpanded ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* MAIN MAP CANVAS / EMBED (MATCHING THE SCREENSHOT EXACTLY) */}
        {/* ========================================================================= */}
        <div className={`relative w-full bg-[#152238] overflow-hidden select-none transition-all duration-300 ${isExpanded ? 'h-[520px]' : 'h-80 sm:h-96'}`}>
          
          {viewMode === 'dark' ? (
            /* STYLIZED DARK SLATE MAP CONTAINER (Identical to User Reference Screenshot) */
            <div 
              className="relative w-full h-full cursor-grab active:cursor-grabbing overflow-hidden"
              style={{
                background: 'radial-gradient(ellipse at center, #1a2d4b 0%, #101c31 70%, #0a1322 100%)',
              }}
            >
              {/* Scaled Map Geometry */}
              <div 
                className="absolute inset-0 w-full h-full transition-transform duration-300"
                style={{ transform: `scale(${zoomLevel})`, transformOrigin: '50% 50%' }}
              >
                {/* SVG Road Network & Landmarks (Matching Chhatarpur Choubey Colony map layout) */}
                <svg className="w-full h-full" viewBox="0 0 900 500" preserveAspectRatio="none">
                  <defs>
                    <linearGradient id="roadGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#2c4266" />
                      <stop offset="100%" stopColor="#1e2e47" />
                    </linearGradient>
                    <linearGradient id="mainHwy" x1="0%" y1="100%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#3d5885" />
                      <stop offset="100%" stopColor="#2e4368" />
                    </linearGradient>
                    <filter id="glowPin" x="-50%" y="-50%" width="200%" height="200%">
                      <feDropShadow dx="0" dy="4" stdDeviation="6" floodColor="#ef4444" floodOpacity="0.6" />
                    </filter>
                  </defs>

                  {/* Grid / Colony Blocks */}
                  <g opacity="0.25">
                    {/* Loknathpuram Colony Grid */}
                    <path d="M 120 280 L 320 230 L 400 350 L 200 400 Z" fill="none" stroke="#3b5986" strokeWidth="1" />
                    <line x1="160" y1="270" x2="240" y2="390" stroke="#3b5986" strokeWidth="1" strokeDasharray="3,3" />
                    <line x1="200" y1="260" x2="280" y2="380" stroke="#3b5986" strokeWidth="1" strokeDasharray="3,3" />
                    <line x1="240" y1="250" x2="320" y2="370" stroke="#3b5986" strokeWidth="1" strokeDasharray="3,3" />
                    <line x1="140" y1="310" x2="340" y2="260" stroke="#3b5986" strokeWidth="1" strokeDasharray="3,3" />
                    <line x1="160" y1="350" x2="360" y2="300" stroke="#3b5986" strokeWidth="1" strokeDasharray="3,3" />

                    {/* Shanti Nagar Grid Top Left */}
                    <path d="M 80 180 L 220 140 L 240 220 L 100 260 Z" fill="none" stroke="#3b5986" strokeWidth="1" />
                    <line x1="110" y1="170" x2="130" y2="250" stroke="#3b5986" strokeWidth="0.8" />
                    <line x1="140" y1="160" x2="160" y2="240" stroke="#3b5986" strokeWidth="0.8" />
                    <line x1="170" y1="150" x2="190" y2="230" stroke="#3b5986" strokeWidth="0.8" />

                    {/* East Blocks */}
                    <path d="M 680 120 L 850 100 L 870 240 L 700 260 Z" fill="none" stroke="#3b5986" strokeWidth="1" />
                    <line x1="720" y1="115" x2="740" y2="255" stroke="#3b5986" strokeWidth="0.8" />
                    <line x1="760" y1="110" x2="780" y2="250" stroke="#3b5986" strokeWidth="0.8" />
                    <line x1="800" y1="105" x2="820" y2="245" stroke="#3b5986" strokeWidth="0.8" />
                    <line x1="690" y1="160" x2="860" y2="140" stroke="#3b5986" strokeWidth="0.8" />
                    <line x1="695" y1="200" x2="865" y2="180" stroke="#3b5986" strokeWidth="0.8" />
                  </g>

                  {/* Water Body / Lake (Talab near Chhatarpur) */}
                  <path d="M 360 80 Q 420 50 460 100 Q 480 150 430 180 Q 370 190 350 140 Z" fill="#0c2340" opacity="0.6" stroke="#1d4069" strokeWidth="1" />

                  {/* Secondary Roads */}
                  <g stroke="url(#roadGrad)" strokeWidth="3" fill="none" opacity="0.7">
                    <path d="M 50 250 L 320 210 L 450 170 L 600 160 L 880 150" />
                    <path d="M 320 210 L 410 320 L 520 420 L 650 480" />
                    <path d="M 210 140 L 300 210 L 380 150 L 530 110 L 700 80" />
                    <path d="M 120 480 L 250 360 L 440 280 L 620 220" />
                    <path d="M 530 110 L 580 250 L 680 340 L 850 370" />
                  </g>

                  {/* Main Road: Choubey Colony Rd & Hamirpur Highway (Dominant) */}
                  <g fill="none">
                    {/* Hamirpur Chungi Highway */}
                    <path d="M 100 40 L 240 220 L 360 380 L 450 490" stroke="url(#mainHwy)" strokeWidth="8" strokeLinecap="round" opacity="0.85" />
                    <path d="M 100 40 L 240 220 L 360 380 L 450 490" stroke="#7193c7" strokeWidth="1.5" strokeDasharray="6,4" opacity="0.6" />

                    {/* Choubey Colony Rd (Running straight through PKC Institute) */}
                    <path d="M 380 40 L 460 210 L 520 330 L 600 480" stroke="#3d6299" strokeWidth="7" strokeLinecap="round" opacity="0.9" />
                    <path d="M 380 40 L 460 210 L 520 330 L 600 480" stroke="#a0c2f7" strokeWidth="1.5" strokeDasharray="5,4" opacity="0.8" />
                  </g>

                  {/* Green Park / Campus Circle around Institute */}
                  <ellipse cx="490" cy="230" rx="36" ry="24" fill="#06382f" opacity="0.5" stroke="#0d7a64" strokeWidth="1" />
                </svg>

                {/* Road Labels (Matching the exact labels from screenshot) */}
                <div className="absolute top-10 left-36 -rotate-45 text-[11px] font-bold text-slate-400 tracking-wider select-none pointer-events-none">
                  हमरीपुर - चुंगी हाईवे
                </div>
                <div className="absolute top-36 left-48 -rotate-12 text-[10px] font-bold text-slate-400 select-none pointer-events-none">
                  Gali Number 1
                </div>
                <div className="absolute bottom-28 left-96 rotate-45 text-[11px] font-bold text-slate-300 tracking-wider select-none pointer-events-none">
                  Choubey Colony Rd
                </div>

                {/* Colony Names */}
                <div className="absolute top-44 left-24 text-center select-none pointer-events-none">
                  <div className="text-[11px] font-black uppercase text-slate-300 tracking-wider">SHANTI NAGAR</div>
                  <div className="text-[10px] text-slate-400 font-medium">शांति नगर</div>
                </div>

                <div className="absolute bottom-32 left-44 text-center select-none pointer-events-none">
                  <div className="text-[12px] font-black uppercase text-slate-200 tracking-wider">LOKNATHPURAM COLONY</div>
                  <div className="text-[10px] text-slate-400 font-medium">लोकनाथपुरम कॉलोनी</div>
                </div>

                {/* Major Landmark: Chhatarpur Title Top Center */}
                <div className="absolute top-4 left-1/3 text-center select-none pointer-events-none">
                  <h4 className="text-xl sm:text-2xl font-black text-white tracking-wide drop-shadow-md">
                    Chhatarpur
                  </h4>
                  <span className="text-xs font-bold text-slate-300 block -mt-0.5">
                    छतरपुर
                  </span>
                </div>

                {/* Landmark 1: Govt Maharaja PG College */}
                <div className="absolute top-24 left-72 max-w-[170px] flex items-start gap-1.5 select-none pointer-events-none">
                  <div className="w-4 h-4 rounded-full bg-slate-500/80 border-2 border-white/80 shrink-0 mt-0.5 shadow-md" />
                  <div>
                    <div className="text-[11px] font-bold text-slate-200 leading-tight drop-shadow">
                      Government Maharaja PG College
                    </div>
                    <div className="text-[9.5px] text-slate-400 font-medium leading-tight">
                      गवर्नमेंट महाराजा पी.जी. कॉलेज
                    </div>
                  </div>
                </div>

                {/* Landmark 2: Maharaja Chhatrasal Bundelkhand University (MCBU) */}
                <div className="absolute top-20 right-36 max-w-[200px] flex items-start gap-1.5 select-none pointer-events-none">
                  <div className="w-4 h-4 rounded-full bg-slate-500/80 border-2 border-white/80 shrink-0 mt-0.5 shadow-md" />
                  <div>
                    <div className="text-[11px] font-bold text-slate-200 leading-tight drop-shadow">
                      Maharaja Chhatrasal Bundelkhand University
                    </div>
                    <div className="text-[9.5px] text-slate-400 font-medium leading-tight">
                      महाराजा छत्रसाल बुन्देलखण्ड विश्वविद्यालय
                    </div>
                  </div>
                </div>

                {/* Landmark 3: Pandey Auto Motors TVS */}
                <div className="absolute bottom-10 right-28 max-w-[190px] select-none pointer-events-none text-right">
                  <div className="text-[10.5px] font-bold text-slate-300 leading-tight">
                    Pandey Auto Motors Llp - TVS
                  </div>
                  <div className="text-[9px] text-slate-400 font-medium">
                    पाण्डेय ऑटो मोटर्स - टीवीएस
                  </div>
                </div>

                {/* ========================================================================= */}
                {/* 🔴 THE MAIN RED PIN: PKC Education Learning Institute Office Chhatarpur */}
                {/* ========================================================================= */}
                <div 
                  className="absolute top-[44%] left-[48%] -translate-x-1/2 -translate-y-full cursor-pointer group z-30"
                  onClick={() => window.open(googleMapsUrl, '_blank')}
                  title="Click to open PKC Education on Google Maps"
                >
                  {/* Pulsing Target Radar Wave */}
                  <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-8 h-8 rounded-full bg-red-500/40 animate-ping pointer-events-none" />
                  <span className="absolute -bottom-0.5 left-1/2 -translate-x-1/2 w-3.5 h-3.5 rounded-full bg-red-600 shadow-lg pointer-events-none" />

                  {/* The Big Red Map Marker SVG */}
                  <div className="relative transform group-hover:scale-125 transition-transform duration-300 drop-shadow-2xl">
                    <svg className="w-12 h-12 text-red-600 drop-shadow-[0_10px_10px_rgba(239,68,68,0.7)]" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
                    </svg>
                    <div className="absolute top-2.5 left-1/2 -translate-x-1/2 w-4 h-4 rounded-full bg-white flex items-center justify-center">
                      <div className="w-2 h-2 rounded-full bg-slate-900" />
                    </div>
                  </div>

                  {/* Pin Floating Tooltip Badge */}
                  <div className="absolute top-1 left-12 whitespace-nowrap bg-slate-950/95 backdrop-blur-md border border-amber-500/50 px-3 py-1.5 rounded-xl shadow-2xl pointer-events-none">
                    <div className="text-[12px] font-black text-white tracking-wide flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                      <span>PKC Education Learning Institute...</span>
                    </div>
                    <div className="text-[10px] text-amber-300 font-semibold">
                      PKC एजुकेशन लर्निंग इंस्टीट्यूट...
                    </div>
                  </div>
                </div>

                {/* Second Campus Tag on Satai Road */}
                <div 
                  className="absolute bottom-20 right-48 flex items-center gap-1.5 cursor-pointer group z-20"
                  onClick={() => window.open("https://maps.app.goo.gl/kTX4J2zAUR8LHpuU9", '_blank')}
                  title="PKC Satai Road Branch Office"
                >
                  <div className="w-7 h-7 rounded-full bg-red-600/90 border border-white text-white flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                    <Building2 className="w-3.5 h-3.5 text-white" />
                  </div>
                  <div className="bg-slate-950/80 backdrop-blur-xs border border-slate-700/80 px-2 py-0.5 rounded-lg">
                    <div className="text-[10.5px] font-bold text-slate-200">PKC Education Learning institute...</div>
                  </div>
                </div>

              </div>

              {/* Watermark / Map Terms Footer */}
              <div className="absolute bottom-1 right-2 text-[9.5px] text-slate-400 select-none pointer-events-none">
                Map data ©2026 Google • Terms
              </div>
            </div>
          ) : (
            /* INTERACTIVE SATELLITE / GOOGLE MAP EMBED FALLBACK */
            <div className="relative w-full h-full bg-slate-950">
              <iframe
                title="PKC Education Learning Institute Office Chhatarpur Google Map"
                src="https://maps.google.com/maps?q=Choubey+Colony,+Chhatarpur,+Madhya+Pradesh+471001&t=k&z=16&ie=UTF8&iwloc=&output=embed"
                className="w-full h-full border-0 filter brightness-90 contrast-110"
                loading="lazy"
                allowFullScreen
              />
            </div>
          )}

          {/* ========================================================================= */}
          {/* BOTTOM LEFT PILL: "Open in Maps" (Exact look from reference image) */}
          {/* ========================================================================= */}
          <a
            href={googleMapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="absolute bottom-4 left-4 z-40 bg-slate-950/90 hover:bg-slate-900 backdrop-blur-md text-white font-bold text-xs sm:text-sm px-4 py-2.5 rounded-full border border-slate-700/80 hover:border-amber-400/80 shadow-2xl flex items-center gap-2.5 hover:scale-105 active:scale-95 transition-all group cursor-pointer"
          >
            {/* Google Maps Styled Colored Pin Icon */}
            <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" />
              <circle fill="#EA4335" cx="12" cy="9" r="2.5" />
            </svg>
            <span className="group-hover:text-amber-300 transition-colors">Open in Maps</span>
            <ExternalLink className="w-3.5 h-3.5 text-slate-400 group-hover:text-amber-300" />
          </a>

          {/* ========================================================================= */}
          {/* BOTTOM RIGHT ZOOM CONTROLS (+ / - and Target) */}
          {/* ========================================================================= */}
          <div className="absolute bottom-4 right-4 z-40 flex flex-col items-center gap-1.5">
            <button
              onClick={() => setZoomLevel(prev => Math.min(prev + 0.25, 2.0))}
              className="w-8 h-8 rounded-lg bg-slate-950/90 hover:bg-slate-800 text-white border border-slate-700 flex items-center justify-center shadow-lg hover:scale-105 active:scale-95 transition-all cursor-pointer"
              title="Zoom In"
            >
              <Plus className="w-4 h-4" />
            </button>
            <button
              onClick={() => setZoomLevel(prev => Math.max(prev - 0.25, 0.75))}
              className="w-8 h-8 rounded-lg bg-slate-950/90 hover:bg-slate-800 text-white border border-slate-700 flex items-center justify-center shadow-lg hover:scale-105 active:scale-95 transition-all cursor-pointer"
              title="Zoom Out"
            >
              <Minus className="w-4 h-4" />
            </button>
            <button
              onClick={() => setZoomLevel(1)}
              className="w-8 h-8 rounded-lg bg-slate-950/90 hover:bg-slate-800 text-amber-400 border border-slate-700 flex items-center justify-center shadow-lg hover:scale-105 active:scale-95 transition-all cursor-pointer text-[10px] font-bold"
              title="Reset View"
            >
              1x
            </button>
          </div>

        </div>

        {/* ========================================================================= */}
        {/* OFFICE DETAILS & BOTH CAMPUS CARDS (Directly Under Map) */}
        {/* ========================================================================= */}
        <div className="p-5 sm:p-7 bg-gradient-to-b from-[#0a152d] to-[#071024] border-t border-slate-800 space-y-6">
          
          {/* Header Row: Title, Rating & Quick Timings */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            
            <div className="space-y-1.5">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs font-black uppercase tracking-wider text-amber-400 bg-amber-400/10 border border-amber-400/30 px-2.5 py-0.5 rounded-md">
                  CHHATARPUR CAMPUSES &amp; OFFICES
                </span>
                <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-2 py-0.5 rounded-md flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Google Verified Locations</span>
                </span>
              </div>

              <h2 className="font-serif-academic text-xl sm:text-2xl font-bold text-white tracking-tight">
                PKC Education Learning Institute &amp; Consultancy
              </h2>

              {/* 5.0 Google Rating */}
              <div className="flex items-center gap-2 text-xs sm:text-sm text-slate-300">
                <span className="font-black text-amber-400">5.0</span>
                <div className="flex items-center text-amber-400">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <span className="text-slate-400 font-semibold">(1) • Official Education Center</span>
              </div>
            </div>

            {/* Quick Timing & Contact Badge Box (Updated: 10 AM to 6 PM & only 7580878825) */}
            <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 space-y-2 shrink-0">
              <div className="flex items-center gap-2 text-xs text-slate-300 font-medium">
                <Clock className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Office: Mon - Sat: <strong>10:00 AM - 06:00 PM</strong></span>
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-300 font-medium">
                <Phone className="w-4 h-4 text-[#C59B27] shrink-0" />
                <span>Call Desk: <strong className="text-white">+91 7580878825</strong></span>
              </div>
            </div>

          </div>

          {/* ========================================================================= */}
          {/* BOTH CAMPUS ADDRESS CARDS (HEAD OFFICE + INSTITUTE CAMPUS) */}
          {/* ========================================================================= */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* Campus 1: Head Office Card */}
            <div className="p-4 rounded-2xl bg-slate-900/80 border border-amber-500/30 hover:border-amber-400/60 transition-all space-y-3 flex flex-col justify-between group">
              <div className="space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[10px] font-black uppercase tracking-wider text-amber-300 bg-amber-500/15 border border-amber-400/30 px-2 py-0.5 rounded-md flex items-center gap-1.5">
                    <Building2 className="w-3 h-3 text-amber-400" />
                    <span>HEAD OFFICE (PANNA ROAD)</span>
                  </span>
                  <span className="text-[10px] text-slate-400 font-bold">UGC Admissions</span>
                </div>

                <h4 className="font-bold text-white text-sm group-hover:text-amber-300 transition-colors">
                  {locations.office.name}
                </h4>

                <p className="text-xs text-slate-300 leading-relaxed flex items-start gap-1.5">
                  <MapPin className="w-4 h-4 text-[#C59B27] shrink-0 mt-0.5" />
                  <span>{locations.office.address}</span>
                </p>

                <p className="text-[11px] text-slate-400 pl-5">
                  <strong>Landmark:</strong> {locations.office.landmarks}
                </p>
              </div>

              {/* Action Buttons for Office */}
              <div className="pt-2 border-t border-slate-800/80 flex flex-wrap items-center gap-2">
                <a
                  href={locations.office.navUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-400/40 text-[11px] font-bold py-2 px-3 rounded-lg flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Navigation className="w-3.5 h-3.5" />
                  <span>Directions</span>
                </a>

                <button
                  onClick={() => handleShareLocation('office')}
                  className="bg-slate-800 hover:bg-slate-700 text-slate-200 text-[11px] font-bold py-2 px-3 rounded-lg flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                  title="Copy Head Office Google Maps Link"
                >
                  {copiedType === 'office' ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="text-emerald-400">Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5 text-amber-400" />
                      <span>Copy Link</span>
                    </>
                  )}
                </button>

                <button
                  onClick={() => handleWhatsAppShare('office')}
                  className="bg-[#25D366]/20 hover:bg-[#25D366]/30 text-[#25D366] border border-[#25D366]/40 text-[11px] font-bold py-2 px-3 rounded-lg flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                  title="Share Office on WhatsApp"
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>WhatsApp</span>
                </button>
              </div>
            </div>

            {/* Campus 2: Institute Campus Card */}
            <div className="p-4 rounded-2xl bg-slate-900/80 border border-emerald-500/30 hover:border-emerald-400/60 transition-all space-y-3 flex flex-col justify-between group">
              <div className="space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[10px] font-black uppercase tracking-wider text-emerald-300 bg-emerald-500/15 border border-emerald-400/30 px-2 py-0.5 rounded-md flex items-center gap-1.5">
                    <Building2 className="w-3 h-3 text-emerald-400" />
                    <span>INSTITUTE CAMPUS (SATAI ROAD)</span>
                  </span>
                  <span className="text-[10px] text-slate-400 font-bold">IT Labs &amp; Training</span>
                </div>

                <h4 className="font-bold text-white text-sm group-hover:text-emerald-300 transition-colors">
                  {locations.institute.name}
                </h4>

                <p className="text-xs text-slate-300 leading-relaxed flex items-start gap-1.5">
                  <MapPin className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span>{locations.institute.address}</span>
                </p>

                <p className="text-[11px] text-slate-400 pl-5">
                  <strong>Landmark:</strong> {locations.institute.landmarks}
                </p>
              </div>

              {/* Action Buttons for Institute */}
              <div className="pt-2 border-t border-slate-800/80 flex flex-wrap items-center gap-2">
                <a
                  href={locations.institute.navUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-400/40 text-[11px] font-bold py-2 px-3 rounded-lg flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Navigation className="w-3.5 h-3.5" />
                  <span>Directions</span>
                </a>

                <button
                  onClick={() => handleShareLocation('institute')}
                  className="bg-slate-800 hover:bg-slate-700 text-slate-200 text-[11px] font-bold py-2 px-3 rounded-lg flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                  title="Copy Institute Campus Google Maps Link"
                >
                  {copiedType === 'institute' ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="text-emerald-400">Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Copy Link</span>
                    </>
                  )}
                </button>

                <button
                  onClick={() => handleWhatsAppShare('institute')}
                  className="bg-[#25D366]/20 hover:bg-[#25D366]/30 text-[#25D366] border border-[#25D366]/40 text-[11px] font-bold py-2 px-3 rounded-lg flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                  title="Share Institute on WhatsApp"
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>WhatsApp</span>
                </button>
              </div>
            </div>

          </div>

          {/* ========================================================================= */}
          {/* USER ACTION BUTTONS BAR: Share Choice, WhatsApp & Download */}
          {/* ========================================================================= */}
          <div className="pt-2 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-3">
            
            {/* Left Action Buttons */}
            <div className="flex flex-wrap items-center gap-2.5 sm:gap-3 w-full sm:w-auto">
              
              {/* 1. Share Location (Opens 2-option chooser) */}
              <button
                onClick={() => setShareModalOpen(true)}
                className="flex-1 sm:flex-initial bg-[#C59B27] hover:bg-amber-500 text-slate-950 font-black text-xs uppercase tracking-wider px-5 py-3 rounded-xl shadow-lg hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer"
                title="Share Office or Institute location link"
              >
                <Share2 className="w-4 h-4 text-slate-950" />
                <span>SHARE LOCATION LINK (2 OPTIONS)</span>
              </button>

              {/* 2. WhatsApp Direct Share (Opens 2-option chooser) */}
              <button
                onClick={() => setShareModalOpen(true)}
                className="flex-1 sm:flex-initial bg-[#25D366] hover:bg-[#20bd5a] text-white font-bold text-xs uppercase tracking-wider px-4 py-3 rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
                title="Share Location on WhatsApp"
              >
                <MessageSquare className="w-4 h-4 text-white" />
                <span>WHATSAPP SHARE</span>
              </button>

              {/* 3. Download Location / Visiting Card (Features Both Campuses) */}
              <button
                onClick={handleDownloadCard}
                disabled={downloading}
                className="flex-1 sm:flex-initial bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-black text-xs uppercase tracking-wider px-4 py-3 rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95"
                title="Download offline location map card with both campus addresses"
              >
                <Download className={`w-4 h-4 text-white ${downloading ? 'animate-bounce' : ''}`} />
                <span>{downloading ? 'GENERATING...' : 'DOWNLOAD MAP CARD'}</span>
              </button>

            </div>

            {/* Direct Dial Call Office Button (Updated: only +91 7580878825) */}
            <a
              href={`tel:${helplineNumber}`}
              className="text-xs font-bold text-slate-300 hover:text-white flex items-center gap-1.5 transition-colors"
            >
              <Phone className="w-3.5 h-3.5 text-emerald-400" />
              <span>Need help reaching? Call {helplineNumber}</span>
            </a>

          </div>

        </div>

      </div>

      {/* ========================================================================= */}
      {/* 2-OPTION LINK SHARE CHOOSER MODAL (INSTITUTE VS OFFICE) */}
      {/* ========================================================================= */}
      {shareModalOpen && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fadeIn"
          onClick={() => setShareModalOpen(false)}
        >
          <div 
            className="bg-[#0b1325] border border-slate-700 w-full max-w-lg rounded-3xl p-5 sm:p-6 shadow-2xl space-y-5 animate-scaleUp"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2.5">
                <span className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400">
                  <Share2 className="w-5 h-5 text-amber-400" />
                </span>
                <div>
                  <h3 className="font-serif-academic font-bold text-lg text-white">
                    Share Location Link
                  </h3>
                  <p className="text-xs text-amber-300/80 font-medium">
                    चुनें कि आपको किस लोकेशन का लिंक शेयर करना है:
                  </p>
                </div>
              </div>

              <button
                onClick={() => setShareModalOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Options List */}
            <div className="space-y-3.5">
              
              {/* Option 1: Head Office */}
              <div className="p-4 rounded-2xl bg-slate-900 border border-amber-500/30 hover:border-amber-400 transition-all space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black uppercase tracking-wider text-amber-300 bg-amber-500/15 border border-amber-400/30 px-2 py-0.5 rounded">
                    OPTION 1: HEAD OFFICE
                  </span>
                  <span className="text-xs font-bold text-slate-400">Panna Road</span>
                </div>

                <div>
                  <h4 className="font-bold text-white text-sm">
                    {locations.office.name}
                  </h4>
                  <p className="text-xs text-slate-300 leading-relaxed mt-0.5">
                    {locations.office.address}
                  </p>
                </div>

                <div className="flex items-center gap-2 pt-1">
                  <button
                    onClick={() => handleShareLocation('office')}
                    className="flex-1 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs py-2 px-3 rounded-xl flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                  >
                    {copiedType === 'office' ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-slate-950" />
                        <span>Link Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copy Office Link</span>
                      </>
                    )}
                  </button>

                  <button
                    onClick={() => handleWhatsAppShare('office')}
                    className="bg-[#25D366] hover:bg-[#20bd5a] text-white font-bold text-xs py-2 px-3 rounded-xl flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                    <span>WhatsApp</span>
                  </button>

                  <a
                    href={locations.office.mapsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white p-2 rounded-xl transition-colors"
                    title="Open in Maps"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </div>
              </div>

              {/* Option 2: Institute Campus */}
              <div className="p-4 rounded-2xl bg-slate-900 border border-emerald-500/30 hover:border-emerald-400 transition-all space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black uppercase tracking-wider text-emerald-300 bg-emerald-500/15 border border-emerald-400/30 px-2 py-0.5 rounded">
                    OPTION 2: INSTITUTE CAMPUS
                  </span>
                  <span className="text-xs font-bold text-slate-400">Satai Road</span>
                </div>

                <div>
                  <h4 className="font-bold text-white text-sm">
                    {locations.institute.name}
                  </h4>
                  <p className="text-xs text-slate-300 leading-relaxed mt-0.5">
                    {locations.institute.address}
                  </p>
                </div>

                <div className="flex items-center gap-2 pt-1">
                  <button
                    onClick={() => handleShareLocation('institute')}
                    className="flex-1 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs py-2 px-3 rounded-xl flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                  >
                    {copiedType === 'institute' ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-slate-950" />
                        <span>Link Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copy Institute Link</span>
                      </>
                    )}
                  </button>

                  <button
                    onClick={() => handleWhatsAppShare('institute')}
                    className="bg-[#25D366] hover:bg-[#20bd5a] text-white font-bold text-xs py-2 px-3 rounded-xl flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                    <span>WhatsApp</span>
                  </button>

                  <a
                    href={locations.institute.mapsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white p-2 rounded-xl transition-colors"
                    title="Open in Maps"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </div>
              </div>

            </div>

            {/* Modal Footer */}
            <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
              <span>Helpline: {helplineNumber}</span>
              <button
                onClick={() => setShareModalOpen(false)}
                className="font-bold text-slate-400 hover:text-white cursor-pointer"
              >
                Close
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
