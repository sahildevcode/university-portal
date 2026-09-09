import React, { useState } from 'react';
import { MessageSquare, Star, Send, CheckCircle2, AlertCircle, Sparkles } from 'lucide-react';

export default function FeedbackPage() {
  const [formData, setFormData] = useState({
    studentName: '',
    email: '',
    rollNo: '',
    subject: 'Academic & Campus Experience',
    rating: 5,
    message: ''
  });
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/feedbacks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.message || 'Submission failed');

      setSubmitted(true);
      setFormData({
        studentName: '',
        email: '',
        rollNo: '',
        subject: 'Academic & Campus Experience',
        rating: 5,
        message: ''
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
      
      <div className="text-center max-w-2xl mx-auto space-y-2">
        <span className="text-xs font-bold uppercase tracking-widest text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full border border-indigo-100">
          Student Voice & Reviews
        </span>
        <h1 className="text-3xl font-extrabold text-slate-900">
          Student Feedback & Suggestion Portal
        </h1>
        <p className="text-xs sm:text-sm text-slate-500">
          We value your experience! Share your feedback regarding courses, campus facilities, faculty, or examination cell.
        </p>
      </div>

      {submitted ? (
        <div className="bg-emerald-50 border-2 border-emerald-200 rounded-3xl p-8 text-center space-y-4 max-w-xl mx-auto animate-fadeIn">
          <div className="w-16 h-16 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-10 h-10" />
          </div>
          <h3 className="text-2xl font-bold text-emerald-950">Thank You For Your Feedback!</h3>
          <p className="text-xs sm:text-sm text-emerald-800 leading-relaxed">
            Your review has been successfully transmitted to the University Administrative Committee. Your suggestions help us continually enhance campus life.
          </p>
          <button
            onClick={() => setSubmitted(false)}
            className="bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold px-6 py-2.5 rounded-xl shadow-md transition-all cursor-pointer"
          >
            Submit Another Feedback
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="bg-white rounded-3xl p-6 sm:p-10 shadow-xl border border-slate-200 space-y-6">
          
          {error && (
            <div className="bg-rose-50 border border-rose-200 text-rose-800 p-3 rounded-xl text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Your Full Name *
              </label>
              <input
                type="text"
                value={formData.studentName}
                onChange={(e) => setFormData({ ...formData, studentName: e.target.value })}
                placeholder="e.g. Aman Patel"
                className="w-full p-2.5 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:border-indigo-600"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Email Address *
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="aman@example.com"
                className="w-full p-2.5 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:border-indigo-600"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                University Roll Number (Optional)
              </label>
              <input
                type="text"
                value={formData.rollNo}
                onChange={(e) => setFormData({ ...formData, rollNo: e.target.value })}
                placeholder="e.g. UNIV202601"
                className="w-full p-2.5 text-xs bg-slate-50 border border-slate-300 rounded-xl uppercase font-mono focus:outline-none focus:border-indigo-600"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Feedback Category / Topic *
              </label>
              <select
                value={formData.subject}
                onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                className="w-full p-2.5 text-xs bg-slate-50 border border-slate-300 rounded-xl font-medium focus:outline-none"
              >
                <option value="Academic & Course Curriculum">Academic & Course Curriculum</option>
                <option value="Laboratories & Computing Facilities">Laboratories & Computing Facilities</option>
                <option value="Faculty & Teaching Quality">Faculty & Teaching Quality</option>
                <option value="Examination & Results Cell">Examination & Results Cell</option>
                <option value="Library & Research Support">Library & Research Support</option>
                <option value="Campus Amenities & Canteen">Campus Amenities & Canteen</option>
              </select>
            </div>
          </div>

          {/* Rating Stars */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              Overall University Rating
            </label>
            <div className="flex items-center gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setFormData({ ...formData, rating: star })}
                  className="p-1 text-amber-400 hover:scale-110 transition-transform cursor-pointer"
                >
                  <Star className={`w-7 h-7 ${formData.rating >= star ? 'fill-amber-400 text-amber-400' : 'text-slate-300'}`} />
                </button>
              ))}
              <span className="text-xs font-bold text-slate-600 ml-2">
                {formData.rating} / 5 Stars ({formData.rating === 5 ? 'Excellent' : formData.rating === 4 ? 'Very Good' : 'Satisfactory'})
              </span>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Detailed Comments & Suggestions *
            </label>
            <textarea
              rows="4"
              value={formData.message}
              onChange={(e) => setFormData({ ...formData, message: e.target.value })}
              placeholder="Tell us what you loved or how we can improve..."
              className="w-full p-3 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:border-indigo-600"
              required
            />
          </div>

          <div className="pt-4 border-t border-slate-100 flex justify-end">
            <button
              type="submit"
              disabled={loading}
              className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-8 rounded-xl text-xs shadow-md transition-all disabled:opacity-50 cursor-pointer"
            >
              {loading ? <span>Submitting...</span> : <><Send className="w-4 h-4" /><span>Submit Official Feedback</span></>}
            </button>
          </div>

        </form>
      )}

    </div>
  );
}
