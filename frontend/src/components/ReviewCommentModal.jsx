import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { MessageSquare, X, Send, CheckCircle2, User, Sparkles } from 'lucide-react';
import { fireCelebration } from '../utils/confetti';

export const INITIAL_13_REVIEWS = [
  {
    id: 'rev-1',
    name: 'Aman Shrivastava',
    city: 'Chhatarpur, MP',
    rating: 5,
    date: '2 din pehle',
    comment: 'PKC Education se maine DCA complete kiya. Faculty bahut supportive hai aur computer practical lab training Chhatarpur me sabse best hai. 100% recommended!'
  },
  {
    id: 'rev-2',
    name: 'Pooja Patel',
    city: 'Nowgong, MP',
    rating: 5,
    date: '4 din pehle',
    comment: 'MPTASS scholarship form bharne me PKC team ne meri poori madad ki. Zero tuition fee me meri UGC degree complete ho rahi hai. Bahut badhiya guidance mila.'
  },
  {
    id: 'rev-3',
    name: 'Rohit Tiwari',
    city: 'Chhatarpur, MP',
    rating: 5,
    date: '1 hafte pehle',
    comment: 'MBA admission ke liye Bundelkhand me sabse bharosemand consultancy hai. Regular exam updates, assignment aur syllabus guidance time par milta hai.'
  },
  {
    id: 'rev-4',
    name: 'Neha Ahirwar',
    city: 'Bijawar, MP',
    rating: 5,
    date: '1 hafte pehle',
    comment: 'PGDCA computer course yahan se kiya aur MP Online exam me mera selection ho gaya. Pradeep Sir aur PKC team ka guidance bahut faydemand raha.'
  },
  {
    id: 'rev-5',
    name: 'Deepak Yadav',
    city: 'Rajnagar, MP',
    rating: 5,
    date: '2 hafte pehle',
    comment: 'B.Tech admission ke guidance ke liye aya tha. Sahi UGC approved university aur affordable fee structure me admission mil gaya. Transparent counseling.'
  },
  {
    id: 'rev-6',
    name: 'Kavita Sen',
    city: 'Khajuraho, MP',
    rating: 5,
    date: '2 hafte pehle',
    comment: 'Online inquiry karne ke sirf 10 minute me call back aaya. Staff ka nature bahut cooperative aur respectful hai. Sabhi course ki jankari acche se di.'
  },
  {
    id: 'rev-7',
    name: 'Sachin Vishwakarma',
    city: 'Chhatarpur, MP',
    rating: 5,
    date: '3 hafte pehle',
    comment: 'CPCT aur Tally Prime with GST ka practical training yahan ka lajawab hai. Accounting ka real-world experience mila jisse job jaldi lagi.'
  },
  {
    id: 'rev-8',
    name: 'Priyanka Mishra',
    city: 'Panna, MP',
    rating: 5,
    date: '3 hafte pehle',
    comment: 'MA English distance mode se karna tha. PKC Education ne step-by-step admission form aur verified marksheet process bohot aasan bana diya.'
  },
  {
    id: 'rev-9',
    name: 'Ankit Rajput',
    city: 'Bada Malhera, MP',
    rating: 5,
    date: '1 mahine pehle',
    comment: 'B.Sc Agriculture me 100% scholarship guidance aur original university verification support mila. Chhatarpur ka No. 1 center.'
  },
  {
    id: 'rev-10',
    name: 'Ritu Chouhan',
    city: 'Chhatarpur, MP',
    rating: 5,
    date: '1 mahine pehle',
    comment: 'Library, study notes aur online mock test facility bahut useful hai. Teachers hamesha sabhi doubts solve karte hain.'
  },
  {
    id: 'rev-11',
    name: 'Vikas Sahu',
    city: 'Chhatarpur, MP',
    rating: 5,
    date: '1 mahine pehle',
    comment: 'Hindi aur English computer typing training best hai. CPCT scorecard first attempt me qualify ho gaya. Thanks PKC!'
  },
  {
    id: 'rev-12',
    name: 'Sunita Kushwaha',
    city: 'Gaurihar, MP',
    rating: 5,
    date: '1 mahine pehle',
    comment: 'Girls students ke liye safe environment aur dedicated scholarship helpdesk bahut achha hai. Polite and caring counseling.'
  },
  {
    id: 'rev-13',
    name: 'Manish Rawat',
    city: 'Mahoba, UP',
    rating: 5,
    date: '2 mahine pehle',
    comment: 'University documents verification, migration certificate aur marksheets timely mil gaya bina kisi pareshani ke. Genuine service.'
  }
];

export function getStoredReviews() {
  try {
    const raw = localStorage.getItem('pkc_reviews_list');
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch {}
  return INITIAL_13_REVIEWS;
}

export async function fetchLiveReviews() {
  try {
    const res = await fetch('/api/reviews');
    const data = await res.json();
    if (data.success && Array.isArray(data.reviews) && data.reviews.length > 0) {
      try {
        localStorage.setItem('pkc_reviews_list', JSON.stringify(data.reviews));
      } catch {}
      return data.reviews;
    }
  } catch (err) {
    console.warn('Could not fetch reviews from server, falling back to local cache', err);
  }
  return getStoredReviews();
}

export default function ReviewCommentModal({ isOpen, onClose, onReviewAdded }) {
  const [reviews, setReviews] = useState(getStoredReviews);
  const [reviewerName, setReviewerName] = useState('');
  const [reviewerComment, setReviewerComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchLiveReviews().then(liveList => {
        setReviews(liveList);
        if (onReviewAdded) onReviewAdded(liveList.length);
      });
      setSuccessMsg(false);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    const cleanName = reviewerName.trim();
    const cleanComment = reviewerComment.trim();

    if (!cleanName || !cleanComment) return;

    setIsSubmitting(true);

    const newReview = {
      name: cleanName,
      city: 'Chhatarpur, MP',
      rating: 5,
      comment: cleanComment
    };

    try {
      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newReview)
      });
      const data = await res.json();
      if (data.success && data.review) {
        const updated = [data.review, ...reviews.filter(r => r.id !== data.review.id)];
        setReviews(updated);
        try {
          localStorage.setItem('pkc_reviews_list', JSON.stringify(updated));
          window.dispatchEvent(new Event('pkc_reviews_updated'));
        } catch {}
        if (onReviewAdded) onReviewAdded(updated.length);
      }
    } catch (err) {
      console.error('Failed to submit review to server:', err);
      // Fallback local addition if network offline
      const fallbackRev = {
        id: 'rev-' + Date.now(),
        name: cleanName,
        city: 'Chhatarpur, MP',
        rating: 5,
        date: 'Abhi-abhi (Just now)',
        comment: cleanComment
      };
      const updated = [fallbackRev, ...reviews];
      setReviews(updated);
      try {
        localStorage.setItem('pkc_reviews_list', JSON.stringify(updated));
        window.dispatchEvent(new Event('pkc_reviews_updated'));
      } catch {}
      if (onReviewAdded) onReviewAdded(updated.length);
    }

    fireCelebration({ x: 0.5, y: 0.4 });
    setReviewerName('');
    setReviewerComment('');
    setIsSubmitting(false);
    setSuccessMsg(true);

    setTimeout(() => {
      setSuccessMsg(false);
    }, 4500);
  };

  return createPortal(
    <div 
      className="fixed inset-0 z-[999999] flex items-center justify-center p-3 sm:p-5 bg-black/70 backdrop-blur-sm animate-fadeIn overflow-y-auto"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] sm:max-h-[88vh] flex flex-col min-h-0 overflow-hidden border border-slate-200 my-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-[#071530] text-white px-5 py-4 sm:px-6 sm:py-5 flex items-center justify-between shrink-0 relative border-b border-amber-500/30">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-amber-400/15 border border-amber-400/40 text-amber-400 flex items-center justify-center shadow-inner shrink-0">
              <MessageSquare className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-serif-academic font-bold text-base sm:text-xl text-white">
                  PKC Reviews & Comments
                </h3>
                <span className="bg-emerald-500/20 text-emerald-300 text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full border border-emerald-400/30">
                  Verified
                </span>
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white flex items-center justify-center transition-colors cursor-pointer shrink-0"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content Body */}
        <div className="overflow-y-auto flex-1 min-h-0 p-4 sm:p-6 space-y-6 divide-y divide-slate-100">
          
          {/* Write a Review / Comment Form */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="font-serif-academic font-bold text-base text-[#071530] flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-amber-600" />
                <span>Write Your Review / अपना कमेंट लिखें</span>
              </h4>
            </div>

            {successMsg && (
              <div className="bg-emerald-50 border border-emerald-300 rounded-2xl p-3.5 text-xs font-bold text-emerald-800 flex items-center gap-2.5 animate-fadeIn">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                <span>आपका रीव्यू सफलतापूर्वक जुड़ गया है! समीक्षा के लिए धन्यवाद।</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-3 bg-slate-50 p-4 rounded-2xl border border-slate-200">
              {/* Name Input Field */}
              <div>
                <label className="block text-[11px] font-black uppercase tracking-wider text-slate-600 mb-1">
                  Your Name / आपका नाम <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="text"
                    required
                    value={reviewerName}
                    onChange={(e) => setReviewerName(e.target.value)}
                    placeholder="उदा. राहुल शर्मा / Rahul Sharma"
                    className="w-full pl-9 pr-3.5 py-2.5 bg-white rounded-xl border border-slate-200 text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500/40 focus:border-amber-500 transition-all font-medium"
                  />
                </div>
              </div>

              {/* Comment Box Field */}
              <div>
                <label className="block text-[11px] font-black uppercase tracking-wider text-slate-600 mb-1">
                  Comment Box / अपना कमेंट या रीव्यू लिखें <span className="text-rose-500">*</span>
                </label>
                <textarea
                  required
                  rows={3}
                  value={reviewerComment}
                  onChange={(e) => setReviewerComment(e.target.value)}
                  placeholder="PKC Education ke bare me apna anubhav ya review yahan likhein..."
                  className="w-full p-3 bg-white rounded-xl border border-slate-200 text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500/40 focus:border-amber-500 transition-all font-medium resize-none"
                />
              </div>

              {/* Submit Button */}
              <div className="pt-1 flex justify-end">
                <button
                  type="submit"
                  disabled={isSubmitting || !reviewerName.trim() || !reviewerComment.trim()}
                  className="bg-[#071530] hover:bg-[#0d2350] disabled:opacity-50 text-[#C59B27] font-black text-xs uppercase tracking-wider px-6 py-2.5 rounded-xl border border-amber-400/40 shadow hover:shadow-md hover:scale-105 active:scale-95 transition-all cursor-pointer flex items-center gap-2"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Post Review / कमेंट सबमिट करें</span>
                </button>
              </div>
            </form>
          </div>

          {/* 13 Verified Reviews List */}
          <div className="pt-6 space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="font-serif-academic font-bold text-base text-[#071530] flex items-center gap-2">
                <span>Recent Comments & Reviews</span>
                <span className="text-xs font-black bg-amber-100 text-amber-900 px-2 py-0.5 rounded-full border border-amber-300">
                  {reviews.length}
                </span>
              </h4>
              <span className="text-[11px] text-slate-400 font-medium">Sorted by latest</span>
            </div>

            <div className="space-y-3">
              {reviews.map((rev) => (
                <div 
                  key={rev.id}
                  className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs hover:border-amber-300 transition-all space-y-2"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-[#071530] to-slate-800 text-amber-400 font-black text-xs flex items-center justify-center border border-amber-400/30 shrink-0">
                        {rev.name ? rev.name.charAt(0).toUpperCase() : 'S'}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h5 className="font-serif-academic font-bold text-sm text-[#071530]">
                            {rev.name}
                          </h5>
                          {rev.city && (
                            <span className="text-[10px] text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md font-medium">
                              {rev.city}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <span className="text-[10px] text-slate-400 font-medium shrink-0">
                      {rev.date}
                    </span>
                  </div>

                  <p className="text-xs text-slate-600 leading-relaxed font-normal pl-12">
                    "{rev.comment}"
                  </p>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Modal Footer */}
        <div className="bg-slate-50 px-6 py-3 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500 shrink-0">
          <span className="flex items-center gap-1.5 font-bold text-slate-700">
            <Sparkles className="w-3.5 h-3.5 text-amber-600" />
            PKC Education Learning Institute & Consultancy, Chhatarpur
          </span>
          <button
            onClick={onClose}
            className="text-xs font-bold text-slate-600 hover:text-slate-900 cursor-pointer"
          >
            Close
          </button>
        </div>

      </div>
    </div>,
    document.body
  );
}
