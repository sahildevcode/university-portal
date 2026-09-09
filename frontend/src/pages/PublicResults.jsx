import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { 
  Award, 
  Search, 
  Printer, 
  CheckCircle2, 
  AlertCircle, 
  GraduationCap, 
  Sparkles, 
  FileText,
  Lock,
  Radio,
  Clock
} from 'lucide-react';
import PrintMarksheet from '../components/PrintMarksheet';

export default function PublicResults() {
  const [portalActive, setPortalActive] = useState(false);
  const [checkingSettings, setCheckingSettings] = useState(true);
  const [rollNo, setRollNo] = useState('');
  const [semester, setSemester] = useState('1');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [resultData, setResultData] = useState(null);
  const [showPrintModal, setShowPrintModal] = useState(false);
  const [selectedResultToPrint, setSelectedResultToPrint] = useState(null);

  useEffect(() => {
    fetch('/api/settings')
      .then(res => res.json())
      .then(data => {
        if (data.success && data.settings) {
          setPortalActive(!!data.settings.resultPortalActive);
        }
      })
      .catch(console.error)
      .finally(() => setCheckingSettings(false));
  }, []);

  const handleSearch = async (e) => {
    if (e) e.preventDefault();
    if (!portalActive) {
      setError('Results are currently locked and have not yet been declared by the Examination Cell.');
      return;
    }
    if (!rollNo.trim()) {
      setError('Please enter your University Roll Number.');
      return;
    }

    setLoading(true);
    setError(null);
    setResultData(null);

    try {
      const url = `/api/results/search?rollNo=${encodeURIComponent(rollNo.trim())}&semester=${encodeURIComponent(semester)}`;
      const res = await fetch(url);
      const data = await res.json();

      if (!res.ok || !data.success) {
        setError(data.message || 'No result record found for the given Roll Number.');
      } else {
        setResultData(data);
        if (data.results && data.results[0]?.percentage >= 70) {
          confetti({
            particleCount: 80,
            spread: 70,
            origin: { y: 0.6 }
          });
        }
      }
    } catch (err) {
      setError('Unable to reach examination server. Please check your connection.');
    } finally {
      setLoading(false);
    }
  };

  const openPrintModal = (result) => {
    setSelectedResultToPrint(result);
    setShowPrintModal(true);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <span className="text-xs font-bold uppercase tracking-widest text-amber-600 bg-amber-50 px-3 py-1 rounded-full border border-amber-200">
          Examination & Evaluation Directorate
        </span>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900">
          Semester Examination Result Portal
        </h1>
        <p className="text-sm text-slate-500">
          Official digital marksheet repository of Apex Global University.
        </p>
      </div>

      {/* 🔴 Locked / Under Evaluation Notice if Portal is Disabled by Admin */}
      {!checkingSettings && !portalActive && (
        <div className="bg-amber-50 border-2 border-amber-300 rounded-3xl p-6 sm:p-8 text-slate-800 max-w-3xl mx-auto space-y-3 shadow-md">
          <div className="flex items-center gap-3 text-amber-900 font-bold text-base">
            <Clock className="w-6 h-6 text-amber-600 animate-spin" />
            <span>Results Status: Under Evaluation / Pending Declaration</span>
          </div>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
            The Examination Directorate has not declared the results for this academic cycle yet. Once evaluation is approved by the Academic Controller, the portal will be unlocked for online search.
          </p>
          <div className="bg-white/80 p-3 rounded-xl border border-amber-200 text-xs text-amber-900 font-medium">
            🔒 Note: Results will become publicly searchable as soon as the Admin releases the official declaration.
          </div>
        </div>
      )}

      {/* Result Search Box */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-xl border border-slate-200 max-w-3xl mx-auto">
        <form onSubmit={handleSearch} className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-4">
            
            {/* Roll Number Input */}
            <div className="sm:col-span-8">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                University Roll Number *
              </label>
              <div className="relative">
                <Search className="w-5 h-5 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="text"
                  placeholder="e.g. UNIV202601 or UNIV2026004"
                  value={rollNo}
                  onChange={(e) => setRollNo(e.target.value.toUpperCase())}
                  disabled={!portalActive}
                  className="w-full pl-11 pr-4 py-2.5 text-sm font-semibold uppercase tracking-wider bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 focus:outline-none disabled:bg-slate-100 disabled:cursor-not-allowed"
                  required
                />
              </div>
            </div>

            {/* Semester Select */}
            <div className="sm:col-span-4">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Select Semester *
              </label>
              <select
                value={semester}
                onChange={(e) => setSemester(e.target.value)}
                disabled={!portalActive}
                className="w-full px-3.5 py-2.5 text-sm font-medium bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 focus:outline-none disabled:bg-slate-100"
              >
                {[1, 2, 3, 4, 5, 6, 7, 8].map(s => (
                  <option key={s} value={String(s)}>Semester {s}</option>
                ))}
              </select>
            </div>

          </div>

          {/* Quick Demo Roll Numbers */}
          {portalActive && (
            <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 pt-1">
              <span className="font-medium">Try Sample Roll Numbers:</span>
              <button
                type="button"
                onClick={() => { setRollNo('UNIV202601'); setSemester('1'); }}
                className="px-2.5 py-1 rounded bg-indigo-50 text-indigo-700 font-mono font-bold hover:bg-indigo-100 border border-indigo-100 transition-colors cursor-pointer"
              >
                UNIV202601 (Rahul)
              </button>
              <button
                type="button"
                onClick={() => { setRollNo('UNIV202602'); setSemester('1'); }}
                className="px-2.5 py-1 rounded bg-amber-50 text-amber-700 font-mono font-bold hover:bg-amber-100 border border-amber-200 transition-colors cursor-pointer"
              >
                UNIV202602 (Priya)
              </button>
            </div>
          )}

          <button
            type="submit"
            disabled={loading || !portalActive}
            className={`w-full flex items-center justify-center gap-2 py-3.5 px-6 rounded-xl text-sm font-bold shadow-md transition-all ${
              portalActive
                ? 'bg-amber-500 hover:bg-amber-600 text-slate-950 cursor-pointer shadow-amber-500/20'
                : 'bg-slate-200 text-slate-500 cursor-not-allowed'
            }`}
          >
            {loading ? (
              <span>Searching Examination Records...</span>
            ) : !portalActive ? (
              <>
                <Lock className="w-4 h-4" />
                <span>Results Awaiting Admin Declaration</span>
              </>
            ) : (
              <>
                <Award className="w-5 h-5" />
                <span>Search & View Marksheet</span>
              </>
            )}
          </button>
        </form>
      </div>

      {/* Error Message */}
      {error && (
        <div className="max-w-3xl mx-auto bg-rose-50 border border-rose-200 rounded-2xl p-5 text-rose-800 flex items-start gap-3 text-sm">
          <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
          <div>
            <p className="font-bold">Notice</p>
            <p className="text-xs text-rose-700 mt-0.5">{error}</p>
          </div>
        </div>
      )}

      {/* Result Display Section */}
      {resultData && resultData.results && resultData.results.length > 0 && (
        <div className="space-y-8 animate-fadeIn">
          {resultData.results.map((res, idx) => {
            const isPass = res.resultStatus?.includes('PASS');

            return (
              <div 
                key={idx}
                className="bg-white rounded-3xl shadow-xl border border-slate-200 overflow-hidden"
              >
                
                {/* Banner */}
                <div className={`p-6 sm:p-8 text-white flex flex-col sm:flex-row items-center justify-between gap-6 ${
                  isPass ? 'bg-gradient-to-r from-indigo-900 via-indigo-950 to-slate-900' : 'bg-gradient-to-r from-rose-900 to-slate-900'
                }`}>
                  <div className="space-y-2 text-center sm:text-left">
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-amber-300 text-xs font-bold uppercase tracking-wider">
                      <Sparkles className="w-3.5 h-3.5" /> Semester {res.semester} Examination Result
                    </div>
                    <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                      {res.studentName}
                    </h2>
                    <p className="text-xs text-indigo-200 font-medium">
                      Roll Number: <span className="font-mono font-bold text-white text-sm">{res.rollNo}</span> | Course: {res.courseName}
                    </p>
                  </div>

                  <div className="flex flex-col sm:items-end gap-3 text-center sm:text-right">
                    <div className={`px-4 py-2 rounded-xl text-xs font-extrabold uppercase tracking-wider shadow-sm ${
                      isPass ? 'bg-emerald-500 text-slate-950' : 'bg-rose-500 text-white'
                    }`}>
                      {res.resultStatus}
                    </div>
                    
                    <button
                      onClick={() => openPrintModal(res)}
                      className="flex items-center justify-center gap-2 bg-amber-400 hover:bg-amber-300 text-slate-950 px-4 py-2 rounded-xl text-xs font-bold shadow-md shadow-amber-400/20 transition-all cursor-pointer"
                    >
                      <Printer className="w-4 h-4" />
                      <span>Print Marksheet PDF</span>
                    </button>
                  </div>
                </div>

                {/* Performance Metrics Row */}
                <div className="grid grid-cols-2 md:grid-cols-4 divide-y md:divide-y-0 md:divide-x divide-slate-100 bg-slate-50 border-b border-slate-200 p-4 text-center">
                  <div className="p-3">
                    <span className="text-xs font-medium text-slate-500 block">Total Marks</span>
                    <span className="text-xl sm:text-2xl font-extrabold text-slate-900">
                      {res.totalObtainedMarks} <span className="text-xs font-normal text-slate-400">/ {res.totalMaxMarks}</span>
                    </span>
                  </div>
                  <div className="p-3">
                    <span className="text-xs font-medium text-slate-500 block">Percentage</span>
                    <span className="text-xl sm:text-2xl font-extrabold text-indigo-600">
                      {res.percentage}%
                    </span>
                  </div>
                  <div className="p-3">
                    <span className="text-xs font-medium text-slate-500 block">SGPA (Grade Points)</span>
                    <span className="text-xl sm:text-2xl font-extrabold text-amber-600">
                      {res.sgpa} <span className="text-xs font-normal text-slate-400">/ 10</span>
                    </span>
                  </div>
                  <div className="p-3">
                    <span className="text-xs font-medium text-slate-500 block">Cumulative CGPA</span>
                    <span className="text-xl sm:text-2xl font-extrabold text-emerald-600">
                      {res.cgpa} <span className="text-xs font-normal text-slate-400">/ 10</span>
                    </span>
                  </div>
                </div>

                {/* Marks Breakdown Table */}
                <div className="p-6 sm:p-8 space-y-4">
                  <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900 flex items-center gap-2">
                    <FileText className="w-4 h-4 text-indigo-600" />
                    Subject Wise Marks & Grading Breakdown
                  </h3>

                  <div className="overflow-x-auto">
                    <table className="w-full text-xs text-left border-collapse">
                      <thead className="bg-slate-100 text-slate-700 uppercase font-bold text-[11px]">
                        <tr>
                          <th className="p-3 rounded-l-lg">Subject Code & Name</th>
                          <th className="p-3 text-center">Theory (70)</th>
                          <th className="p-3 text-center">Practical (30)</th>
                          <th className="p-3 text-center">Obtained (100)</th>
                          <th className="p-3 text-center">Grade</th>
                          <th className="p-3 rounded-r-lg text-center">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {res.subjects?.map((sub, i) => (
                          <tr key={i} className="hover:bg-slate-50/80 transition-colors">
                            <td className="p-3">
                              <span className="font-mono font-bold text-indigo-700 text-xs mr-2">{sub.code}</span>
                              <span className="font-semibold text-slate-800">{sub.name}</span>
                            </td>
                            <td className="p-3 text-center font-medium text-slate-600">{sub.obTheory}</td>
                            <td className="p-3 text-center font-medium text-slate-600">{sub.obPractical}</td>
                            <td className="p-3 text-center font-bold text-slate-900 text-sm">{sub.totalObtained}</td>
                            <td className="p-3 text-center">
                              <span className="font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-100">
                                {sub.grade}
                              </span>
                            </td>
                            <td className="p-3 text-center">
                              <span className={`px-2 py-0.5 rounded font-bold text-[10px] ${
                                sub.pass ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'
                              }`}>
                                {sub.pass ? 'PASSED' : 'BACKLOG'}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-3">
                    <p><strong className="text-slate-700">Remarks:</strong> {res.remarks}</p>
                    <p className="text-[11px]">Declaration Date: {res.declarationDate}</p>
                  </div>

                </div>

              </div>
            );
          })}
        </div>
      )}

      {/* Marksheet Print Modal */}
      {showPrintModal && selectedResultToPrint && (
        <PrintMarksheet
          result={selectedResultToPrint}
          student={resultData?.student}
          onClose={() => setShowPrintModal(false)}
        />
      )}

    </div>
  );
}
