import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { Laptop, X, PhoneCall, MessageCircle, ShieldCheck, Cpu, HardDrive, CheckCircle2, Sparkles, Tag } from 'lucide-react';
import { fireCelebration } from '../utils/confetti';

export const SECOND_HAND_LAPTOPS = [
  {
    id: 'lap-1',
    title: 'Dell Latitude 7490 (Core i5 8th Gen)',
    condition: 'A++ Certified Refurbished',
    specs: 'Intel Core i5 8th Gen | 16GB DDR4 RAM | 256GB NVMe SSD | 14" FHD Display',
    price: '₹18,500',
    originalPrice: '₹65,000',
    discount: '71% OFF',
    warranty: '3 Months Shop Warranty + Lifetime Free OS Support',
    tag: 'Best for Students & Coding',
    image: 'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?auto=format&fit=crop&w=700&q=80'
  },
  {
    id: 'lap-2',
    title: 'HP EliteBook 840 G5 (Core i5 8th Gen)',
    condition: 'Super Slim Metal Body (Pristine)',
    specs: 'Intel Core i5 8th Gen Quad-Core | 8GB RAM | 512GB SSD | Backlit Keyboard | 14" FHD IPS',
    price: '₹19,999',
    originalPrice: '₹72,000',
    discount: '72% OFF',
    warranty: '3 Months Replacement Guarantee',
    tag: 'Top Selling Slim Laptop',
    image: 'https://images.unsplash.com/photo-1544731612-de292439cc67?auto=format&fit=crop&w=700&q=80'
  },
  {
    id: 'lap-3',
    title: 'Lenovo ThinkPad T480 (Heavy Duty Workhorse)',
    condition: 'Tested Military Grade Toughness',
    specs: 'Intel Core i5 8th Gen | 16GB RAM | 256GB SSD | Dual Battery 6-8 Hr Backup | 14" Screen',
    price: '₹21,500',
    originalPrice: '₹78,000',
    discount: '72% OFF',
    warranty: '3 Months Shop Warranty + Charger Original',
    tag: 'Best Battery & Typing Keyboard',
    image: 'https://images.unsplash.com/photo-1593642632823-8f785ba67e45?auto=format&fit=crop&w=700&q=80'
  },
  {
    id: 'lap-4',
    title: 'Apple MacBook Air 13" (Intel Core i5)',
    condition: 'Original Silver Aluminum Finish',
    specs: 'Intel Core i5 | 8GB LPDDR3 RAM | 128GB Apple SSD | macOS Monterey Ready | MagSafe 2',
    price: '₹24,500',
    originalPrice: '₹84,900',
    discount: '71% OFF',
    warranty: '30 Days Full Checking Warranty',
    tag: 'Premium Apple Logo & Light Weight',
    image: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=700&q=80'
  },
  {
    id: 'lap-5',
    title: 'Dell Latitude 5400 (Core i7 8th Gen)',
    condition: 'High Performance Professional Grade',
    specs: 'Intel Core i7 8th Gen Turbo | 16GB DDR4 RAM | 512GB Fast SSD | Type-C Fast Charging',
    price: '₹26,000',
    originalPrice: '₹88,000',
    discount: '70% OFF',
    warranty: '3 Months Full Warranty with Bill',
    tag: 'Fast Core i7 Multi-Tasking',
    image: 'https://images.unsplash.com/photo-1525547719571-a2d4ac8945e2?auto=format&fit=crop&w=700&q=80'
  },
  {
    id: 'lap-6',
    title: 'HP ProBook 440 G6 (Core i5 8th Gen)',
    condition: 'Modern Silver Narrow Bezel',
    specs: 'Intel Core i5 8th Gen | 8GB RAM | 256GB SSD + 1TB HDD Slot | HDMI, USB 3.1, Type-C',
    price: '₹20,500',
    originalPrice: '₹68,000',
    discount: '69% OFF',
    warranty: '3 Months Hardware Support',
    tag: 'Best for Office, Tally & College',
    image: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?auto=format&fit=crop&w=700&q=80'
  },
  {
    id: 'lap-7',
    title: 'Lenovo ThinkPad X280 (Ultra-Portable 12.5")',
    condition: 'Super Lightweight 1.1 Kg Travel Edition',
    specs: 'Intel Core i5 8th Gen | 8GB RAM | 256GB SSD | Full HD IPS | Rapid Charge 80% in 1 Hour',
    price: '₹17,999',
    originalPrice: '₹62,000',
    discount: '71% OFF',
    warranty: '3 Months Replacement Warranty',
    tag: 'Compact Pocket Friendly',
    image: 'https://images.unsplash.com/photo-1588702547919-26089e690ecc?auto=format&fit=crop&w=700&q=80'
  },
  {
    id: 'lap-8',
    title: 'Acer Aspire Gaming / Graphics Laptop',
    condition: 'NVIDIA Dedicated Graphics Support',
    specs: 'Intel Core i5 High Performance | 16GB RAM | 512GB SSD | 2GB NVIDIA Graphic Card | 15.6" Screen',
    price: '₹27,500',
    originalPrice: '₹75,000',
    discount: '63% OFF',
    warranty: '3 Months Comprehensive Warranty',
    tag: 'Best for Editing, AutoCAD & 3D',
    image: 'https://images.unsplash.com/photo-1603302576837-37561b2e2302?auto=format&fit=crop&w=700&q=80'
  }
];

export default function LaptopShowcaseModal({ isOpen, onClose }) {
  const [selectedLaptop, setSelectedLaptop] = useState(null);

  React.useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleInquireWhatsApp = (laptop) => {
    fireCelebration({ x: 0.5, y: 0.4 });
    const msg = `Hello PKC Education, I am interested in buying the Second Hand Laptop: "${laptop.title}" for ${laptop.price}. Is it currently available in your Chhatarpur store? Please share more photos and details.`;
    const url = `https://wa.me/917000212637?text=${encodeURIComponent(msg)}`;
    window.open(url, '_blank');
  };

  if (!isOpen) return null;

  return createPortal(
    <div 
      className="fixed inset-0 z-[999999] flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md animate-fadeIn overflow-y-auto"
      onClick={onClose}
    >
      <div 
        className="bg-slate-900 border border-slate-700/80 w-full max-w-6xl max-h-[88vh] rounded-3xl shadow-2xl flex flex-col min-h-0 overflow-hidden text-white animate-scaleUp my-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Bar */}
        <div className="px-5 sm:px-8 py-4 sm:py-5 bg-gradient-to-r from-[#071530] via-slate-900 to-indigo-950 border-b border-slate-800 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-amber-500/20 border border-amber-400/40 flex items-center justify-center text-amber-400 shadow-sm">
              <Laptop className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] sm:text-[11px] font-black uppercase tracking-widest text-amber-400 bg-amber-400/15 px-2.5 py-0.5 rounded-full border border-amber-400/30">
                  Certified Refurbished & Second Hand Laptops
                </span>
                <span className="hidden md:inline-flex items-center gap-1 text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                  <ShieldCheck className="w-3 h-3" />
                  <span>3 Months Store Warranty</span>
                </span>
              </div>
              <h2 className="text-base sm:text-xl font-black text-white tracking-tight flex items-center gap-2 mt-0.5">
                <span>PKC Verified Second-Hand Laptops (8 Exclusive Deals)</span>
              </h2>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white transition-all cursor-pointer border border-slate-700"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Top Info Banner */}
        <div className="bg-amber-500/10 border-b border-amber-500/20 px-5 sm:px-8 py-2.5 flex flex-wrap items-center justify-between gap-3 text-xs text-amber-200">
          <span className="flex items-center gap-2 font-medium">
            <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
            <span>Sabhi Laptops fully tested, 100% original charger aur Windows 11/10 MS Office pre-installed ke sath milte hain.</span>
          </span>
          <a
            href="tel:+917000212637"
            className="inline-flex items-center gap-1.5 font-bold text-white bg-emerald-600 hover:bg-emerald-500 px-3 py-1 rounded-lg text-[11px] transition-all cursor-pointer shadow-sm"
          >
            <PhoneCall className="w-3 h-3" />
            <span>Call Store: +91 7000212637</span>
          </a>
        </div>

        {/* 8 Laptop Boxes Grid */}
        <div className="p-4 sm:p-6 lg:p-7 overflow-y-auto flex-1 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
          {SECOND_HAND_LAPTOPS.map((lap, index) => (
            <div
              key={lap.id}
              className="group bg-slate-800/90 hover:bg-slate-800 border border-slate-700/80 hover:border-amber-400/70 rounded-2xl p-3.5 flex flex-col justify-between transition-all duration-300 hover:shadow-xl hover:shadow-amber-500/10 hover:-translate-y-1 relative"
            >
              {/* Badge & Index */}
              <div className="absolute top-5 left-5 z-10 flex flex-col gap-1">
                <span className="text-[10px] font-black uppercase tracking-wider text-slate-950 bg-amber-400 px-2 py-0.5 rounded-md shadow-md">
                  Box #{index + 1}
                </span>
                <span className="text-[9.5px] font-bold text-emerald-300 bg-emerald-950/80 border border-emerald-500/40 px-2 py-0.5 rounded-md backdrop-blur-xs">
                  {lap.discount}
                </span>
              </div>

              {/* Laptop Photo */}
              <div className="relative w-full h-44 rounded-xl overflow-hidden bg-slate-950 border border-slate-700/60 mb-3 group-hover:border-amber-400/40 transition-colors">
                <img
                  src={lap.image}
                  alt={lap.title}
                  className="w-full h-full object-cover group-hover:scale-108 transition-transform duration-500 brightness-95 group-hover:brightness-105"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent" />
                <span className="absolute bottom-2 left-2 text-[10px] font-semibold text-slate-300 bg-black/60 px-2 py-0.5 rounded backdrop-blur-xs">
                  {lap.condition}
                </span>
              </div>

              {/* Info */}
              <div className="space-y-2 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="font-extrabold text-sm text-white group-hover:text-amber-300 transition-colors line-clamp-1">
                    {lap.title}
                  </h3>
                  <p className="text-[11px] text-slate-400 leading-snug line-clamp-2 mt-1">
                    {lap.specs}
                  </p>
                </div>

                <div className="pt-2 border-t border-slate-700/70 space-y-2">
                  <div className="flex items-baseline justify-between">
                    <div>
                      <span className="text-lg font-black text-amber-400">{lap.price}</span>
                      <span className="text-xs text-slate-500 line-through ml-2">{lap.originalPrice}</span>
                    </div>
                  </div>

                  <p className="text-[10px] text-emerald-400 flex items-center gap-1 font-medium">
                    <CheckCircle2 className="w-3 h-3 shrink-0" />
                    <span>{lap.warranty}</span>
                  </p>

                  <button
                    onClick={() => handleInquireWhatsApp(lap)}
                    className="w-full py-2 px-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-extrabold text-xs flex items-center justify-center gap-2 transition-all shadow-md hover:shadow-emerald-500/20 active:scale-95 cursor-pointer"
                  >
                    <MessageCircle className="w-3.5 h-3.5" />
                    <span>Buy / Inquire on WhatsApp</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Footer Bar */}
        <div className="px-5 sm:px-8 py-3 bg-slate-950 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-slate-400">
          <p>📍 Available at PKC Education Learning Institute, Beside Govt Girls College, Panna Road, Chhatarpur (M.P.)</p>
          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold transition-all cursor-pointer"
            >
              Close Window
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}
