import React, { useState, useEffect } from 'react';
import { Award, Plus, Search, Filter, CheckCircle2, AlertCircle, Users, FileText, Check, Clock } from 'lucide-react';

export default function EntranceManager({ courses }) {
  const [applicants, setApplicants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [courseFilter, setCourseFilter] = useState('all');

  // New Applicant Modal
  const [showAddModal, setShowAddModal] = useState(false);
  const [newCandidate, setNewCandidate] = useState({
    candidateName: '',
    appliedCourse: courses[0]?.name || 'B.Tech Computer Science & Engineering',
    entranceScore: '',
    maxScore: 100,
    meritRank: '',
    status: 'Qualified / Selected for Admission',
    examDate: new Date().toISOString().split('T')[0]
  });

  const fetchApplicants = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/entrance-exams');
      const data = await res.json();
      if (data.success) {
        setApplicants(data.applicants || []);
      }
    } catch (err) {
      console.error('Error fetching entrance data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplicants();
  }, []);

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/entrance-exams', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newCandidate)
      });
      const data = await res.json();
      if (data.success) {
        setShowAddModal(false);
        setNewCandidate({
          candidateName: '',
          appliedCourse: courses[0]?.name || 'B.Tech Computer Science & Engineering',
          entranceScore: '',
          maxScore: 100,
          meritRank: '',
          status: 'Qualified / Selected for Admission',
          examDate: new Date().toISOString().split('T')[0]
        });
        fetchApplicants();
      }
    } catch (err) {
      alert('Failed to add candidate');
    }
  };

  const filtered = applicants.filter(a => {
    const matchSearch = a.candidateName?.toLowerCase().includes(search.toLowerCase()) ||
                        a.appNo?.toLowerCase().includes(search.toLowerCase());
    const matchCourse = courseFilter === 'all' || a.appliedCourse === courseFilter;
    return matchSearch && matchCourse;
  });

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-widest text-purple-700 bg-purple-50 px-3 py-1 rounded-full border border-purple-200">
            Admissions & Entrance Cell
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1">
            Entrance Exam & Merit Admission List
          </h1>
          <p className="text-xs text-slate-500">
            Private administrative portal for managing university entrance test scores, candidate merit rankings, and provisional seat allotments.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white font-bold px-4 py-2.5 rounded-xl text-xs shadow-md transition-all whitespace-nowrap self-start sm:self-auto cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>+ Add Entrance Candidate</span>
        </button>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm grid grid-cols-1 sm:grid-cols-12 gap-3 items-center">
        <div className="sm:col-span-8 relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Search entrance candidate by name or application no..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:border-purple-600"
          />
        </div>

        <div className="sm:col-span-4">
          <select
            value={courseFilter}
            onChange={(e) => setCourseFilter(e.target.value)}
            className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:outline-none"
          >
            <option value="all">All Applied Programs</option>
            {courses.map(c => (
              <option key={c.id} value={c.name}>{c.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-900 text-white uppercase text-[11px] font-bold tracking-wider">
              <tr>
                <th className="p-3.5">Application No</th>
                <th className="p-3.5">Candidate Name</th>
                <th className="p-3.5">Applied Course</th>
                <th className="p-3.5 text-center">Score (/100)</th>
                <th className="p-3.5 text-center">Merit Rank</th>
                <th className="p-3.5">Admission Status</th>
                <th className="p-3.5">Exam Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan="7" className="p-8 text-center text-slate-400">Loading entrance lists...</td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan="7" className="p-8 text-center text-slate-400">No entrance applicants found.</td>
                </tr>
              ) : (
                filtered.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="p-3.5 font-mono font-bold text-purple-700">{item.appNo}</td>
                    <td className="p-3.5 font-semibold text-slate-900 uppercase">{item.candidateName}</td>
                    <td className="p-3.5 text-slate-700 font-medium">{item.appliedCourse}</td>
                    <td className="p-3.5 text-center font-extrabold text-slate-900 text-sm">
                      {item.entranceScore} <span className="text-[10px] text-slate-400">/ {item.maxScore}</span>
                    </td>
                    <td className="p-3.5 text-center">
                      <span className="font-mono font-bold bg-amber-50 text-amber-900 border border-amber-200 px-2 py-0.5 rounded">
                        #{item.meritRank}
                      </span>
                    </td>
                    <td className="p-3.5">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                        item.status.includes('Selected') ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                        item.status.includes('Waitlisted') ? 'bg-amber-50 text-amber-700 border border-amber-200' :
                        'bg-slate-100 text-slate-700'
                      }`}>
                        {item.status}
                      </span>
                    </td>
                    <td className="p-3.5 text-slate-500 font-mono text-[11px]">{item.examDate}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Candidate Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto" onClick={() => setShowAddModal(false)}>
          <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl p-6 sm:p-8 space-y-5 border border-slate-200" onClick={(e) => e.stopPropagation()}>
            <h3 className="font-bold text-lg text-slate-900">Add Entrance Exam Candidate</h3>
            
            <form onSubmit={handleAddSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1">Candidate Full Name *</label>
                <input
                  type="text"
                  value={newCandidate.candidateName}
                  onChange={(e) => setNewCandidate({ ...newCandidate, candidateName: e.target.value })}
                  placeholder="e.g. Ramesh Kushwaha"
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl"
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1">Applied Degree Course *</label>
                <select
                  value={newCandidate.appliedCourse}
                  onChange={(e) => setNewCandidate({ ...newCandidate, appliedCourse: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-medium"
                >
                  {courses.map(c => (
                    <option key={c.id} value={c.name}>{c.name}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">Entrance Score (Max 100) *</label>
                  <input
                    type="number"
                    value={newCandidate.entranceScore}
                    onChange={(e) => setNewCandidate({ ...newCandidate, entranceScore: e.target.value })}
                    placeholder="85"
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl"
                    required
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">Merit Rank *</label>
                  <input
                    type="number"
                    value={newCandidate.meritRank}
                    onChange={(e) => setNewCandidate({ ...newCandidate, meritRank: e.target.value })}
                    placeholder="5"
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1">Admission Selection Status</label>
                <select
                  value={newCandidate.status}
                  onChange={(e) => setNewCandidate({ ...newCandidate, status: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl"
                >
                  <option value="Qualified / Selected for Admission">Qualified / Selected for Admission</option>
                  <option value="Waitlisted (Round 2)">Waitlisted (Round 2)</option>
                  <option value="Provisionally Allotted">Provisionally Allotted</option>
                </select>
              </div>

              <div className="pt-4 border-t border-slate-100 flex justify-end gap-2">
                <button type="button" onClick={() => setShowAddModal(false)} className="px-4 py-2 rounded-xl bg-slate-100 text-slate-600 font-bold">Cancel</button>
                <button type="submit" className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold shadow-sm">Save Candidate Record</button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
