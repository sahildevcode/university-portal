import React, { useState, useEffect } from 'react';
import { Award, Plus, Trash2, CheckCircle2, AlertCircle, Save, Printer, User, BookOpen, ToggleLeft, ToggleRight, Radio, ShieldAlert } from 'lucide-react';
import PrintMarksheet from '../components/PrintMarksheet';

export default function ResultEntry({ courses, students, onRefreshStudents }) {
  const [localStudents, setLocalStudents] = useState(students || []);
  const [portalActive, setPortalActive] = useState(false);
  const [updatingPortal, setUpdatingPortal] = useState(false);
  const [portalMessage, setPortalMessage] = useState(null);

  const [selectedRoll, setSelectedRoll] = useState('');
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [semester, setSemester] = useState('1');
  const [examSession, setExamSession] = useState('Regular Exam Session 2026-27');
  const [declarationDate, setDeclarationDate] = useState(new Date().toISOString().split('T')[0]);
  const [remarks, setRemarks] = useState('Promoted to next academic semester.');
  
  const [subjects, setSubjects] = useState([
    { code: 'SUB101', name: 'Engineering Mathematics-I', maxTheory: 70, obTheory: 58, maxPractical: 30, obPractical: 26 },
    { code: 'SUB102', name: 'Programming & Data Structures', maxTheory: 70, obTheory: 62, maxPractical: 30, obPractical: 28 },
    { code: 'SUB103', name: 'Applied Physics & Systems', maxTheory: 70, obTheory: 55, maxPractical: 30, obPractical: 24 },
    { code: 'SUB104', name: 'Digital Electronics & Logic', maxTheory: 70, obTheory: 52, maxPractical: 30, obPractical: 25 }
  ]);

  const [loading, setLoading] = useState(false);
  const [successResult, setSuccessResult] = useState(null);
  const [error, setError] = useState(null);
  const [showPrintModal, setShowPrintModal] = useState(false);

  // Fetch settings & student list on mount
  useEffect(() => {
    fetch('/api/settings')
      .then(res => res.json())
      .then(data => {
        if (data.success && data.settings) {
          setPortalActive(!!data.settings.resultPortalActive);
        }
      })
      .catch(console.error);

    fetch('/api/students')
      .then(res => res.json())
      .then(data => {
        if (data.success && data.students) {
          setLocalStudents(data.students);
        }
      })
      .catch(console.error);
  }, []);

  const handleTogglePortal = async () => {
    setUpdatingPortal(true);
    setPortalMessage(null);
    const newStatus = !portalActive;

    try {
      const res = await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ resultPortalActive: newStatus })
      });
      const data = await res.json();
      if (data.success) {
        setPortalActive(newStatus);
        setPortalMessage(newStatus 
          ? '📢 Results Portal is now DECLARED & LIVE on the frontend! Students can now check their results.'
          : '🔒 Results Portal is now LOCKED & HIDDEN on frontend. Results are marked under evaluation.'
        );
      }
    } catch (err) {
      alert('Failed to update result portal status');
    } finally {
      setUpdatingPortal(false);
    }
  };

  const handleStudentSelect = (roll) => {
    setSelectedRoll(roll);
    const std = localStudents.find(s => s.rollNo === roll);
    setSelectedStudent(std || null);

    if (std) {
      const course = courses.find(c => c.id === std.courseId || c.name === std.courseName);
      if (course && course.subjectsBySemester && course.subjectsBySemester[semester]) {
        const defaultSubs = course.subjectsBySemester[semester].map(s => ({
          code: s.code,
          name: s.name,
          maxTheory: s.maxTheory || 70,
          obTheory: 55,
          maxPractical: s.maxPractical || 30,
          obPractical: 25
        }));
        setSubjects(defaultSubs);
      }
    }
  };

  const handleSemesterChange = (newSem) => {
    setSemester(newSem);
    if (selectedStudent) {
      const course = courses.find(c => c.id === selectedStudent.courseId || c.name === selectedStudent.courseName);
      if (course && course.subjectsBySemester && course.subjectsBySemester[newSem]) {
        const defaultSubs = course.subjectsBySemester[newSem].map(s => ({
          code: s.code,
          name: s.name,
          maxTheory: s.maxTheory || 70,
          obTheory: 55,
          maxPractical: s.maxPractical || 30,
          obPractical: 25
        }));
        setSubjects(defaultSubs);
      }
    }
  };

  const handleSubjectChange = (index, field, value) => {
    const updated = [...subjects];
    updated[index][field] = value;
    setSubjects(updated);
  };

  const handleAddSubject = () => {
    setSubjects([
      ...subjects,
      { code: `SUB${subjects.length + 1}01`, name: 'New Subject Name', maxTheory: 70, obTheory: 50, maxPractical: 30, obPractical: 25 }
    ]);
  };

  const handleRemoveSubject = (index) => {
    setSubjects(subjects.filter((_, i) => i !== index));
  };

  const totalMax = subjects.reduce((acc, s) => acc + (Number(s.maxTheory) || 0) + (Number(s.maxPractical) || 0), 0);
  const totalObt = subjects.reduce((acc, s) => acc + (Number(s.obTheory) || 0) + (Number(s.obPractical) || 0), 0);
  const percentage = totalMax > 0 ? ((totalObt / totalMax) * 100).toFixed(2) : 0;
  const sgpa = (percentage / 9.5).toFixed(2);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedRoll) {
      setError('Please select a student.');
      return;
    }
    if (subjects.length === 0) {
      setError('Please add at least one subject.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const payload = {
        rollNo: selectedRoll,
        semester: semester,
        examSession: examSession,
        declarationDate: declarationDate,
        remarks: remarks,
        subjects: subjects
      };

      const res = await fetch('/api/results', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Failed to publish result');
      }

      setSuccessResult(data.result);
      setShowPrintModal(true);
      if (onRefreshStudents) onRefreshStudents();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto space-y-2">
        <span className="text-xs font-bold uppercase tracking-widest text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full border border-indigo-100">
          Examination Evaluation Directorate
        </span>
        <h1 className="text-3xl font-extrabold text-slate-900">
          Exam Marks Entry & Result Declaration Controller
        </h1>
        <p className="text-xs sm:text-sm text-slate-500">
          Admin panel to declare semester exam results, determine Pass / Backlog status, and control the public Result Portal toggle switch.
        </p>
      </div>

      {/* 📢 Master Result Portal Declaration Switch */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white rounded-3xl p-6 sm:p-7 shadow-xl border border-indigo-900 flex flex-col sm:flex-row items-center justify-between gap-6">
        <div className="space-y-1 text-center sm:text-left">
          <div className="flex items-center justify-center sm:justify-start gap-2">
            <span className={`w-3 h-3 rounded-full animate-pulse ${portalActive ? 'bg-emerald-400' : 'bg-rose-400'}`} />
            <h3 className="font-bold text-base">
              Online Result Portal Visibility: {portalActive ? '🟢 ACTIVE & DECLARED (ON)' : '🔴 LOCKED / UNDER REVIEW (OFF)'}
            </h3>
          </div>
          <p className="text-xs text-indigo-200">
            {portalActive 
              ? 'Students can currently view and print their marksheets using Roll Number.'
              : 'Public Result Checker is disabled. Students will see "Results under evaluation" notice until enabled.'}
          </p>
        </div>

        <button
          type="button"
          disabled={updatingPortal}
          onClick={handleTogglePortal}
          className={`flex items-center gap-2 font-bold px-6 py-3 rounded-2xl text-xs shadow-lg transition-all cursor-pointer whitespace-nowrap ${
            portalActive 
              ? 'bg-rose-600 hover:bg-rose-700 text-white shadow-rose-600/30' 
              : 'bg-emerald-500 hover:bg-emerald-600 text-slate-950 shadow-emerald-500/30 font-extrabold'
          }`}
        >
          {portalActive ? (
            <>
              <ToggleRight className="w-5 h-5" />
              <span>Lock / Hide Result Portal</span>
            </>
          ) : (
            <>
              <ToggleLeft className="w-5 h-5" />
              <span>Declare & Enable Result Portal</span>
            </>
          )}
        </button>
      </div>

      {portalMessage && (
        <div className="bg-indigo-50 border border-indigo-200 text-indigo-950 p-4 rounded-2xl text-xs font-semibold flex items-center gap-2 animate-fadeIn">
          <Radio className="w-4 h-4 text-indigo-600 shrink-0" />
          <span>{portalMessage}</span>
        </div>
      )}

      {error && (
        <div className="bg-rose-50 border border-rose-200 rounded-2xl p-4 text-rose-800 flex items-center gap-3 text-sm">
          <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {successResult && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-6 text-emerald-900 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="w-8 h-8 text-emerald-600 shrink-0" />
            <div>
              <h3 className="font-bold text-base">Result Saved Successfully!</h3>
              <p className="text-xs text-emerald-700">
                Semester {successResult.semester} Result for Roll No: <strong className="font-mono">{successResult.rollNo}</strong> ({successResult.studentName}) with <strong>{successResult.percentage}% ({successResult.resultStatus})</strong>.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setShowPrintModal(true)}
            className="flex items-center gap-2 bg-emerald-700 hover:bg-emerald-800 text-white font-bold px-4 py-2 rounded-xl text-xs shadow-md transition-all whitespace-nowrap cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            <span>Print Generated Marksheet</span>
          </button>
        </div>
      )}

      {/* Main Marks Entry Form */}
      <form onSubmit={handleSubmit} className="bg-white rounded-3xl p-6 sm:p-10 shadow-xl border border-slate-200 space-y-8">
        
        {/* Step 1: Select Student & Semester */}
        <div className="space-y-4 bg-slate-50 p-6 rounded-2xl border border-slate-200">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Select Enrolled Student *
              </label>
              <select
                value={selectedRoll}
                onChange={(e) => handleStudentSelect(e.target.value)}
                className="w-full px-3.5 py-2.5 text-sm font-semibold bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 focus:outline-none"
                required
              >
                <option value="">-- Choose Student by Roll No / Name --</option>
                {localStudents.map(s => (
                  <option key={s.id} value={s.rollNo}>
                    {s.rollNo} — {s.fullName} ({s.courseName})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Examination Semester *
              </label>
              <select
                value={semester}
                onChange={(e) => handleSemesterChange(e.target.value)}
                className="w-full px-3.5 py-2.5 text-sm font-semibold bg-white border border-slate-300 rounded-xl focus:outline-none"
              >
                {[1, 2, 3, 4, 5, 6, 7, 8].map(s => (
                  <option key={s} value={s}>Semester {s}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Exam Session
              </label>
              <input
                type="text"
                value={examSession}
                onChange={(e) => setExamSession(e.target.value)}
                className="w-full px-3.5 py-2 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Result Declaration Date
              </label>
              <input
                type="date"
                value={declarationDate}
                onChange={(e) => setDeclarationDate(e.target.value)}
                className="w-full px-3.5 py-2 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Academic Remarks
              </label>
              <input
                type="text"
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
                className="w-full px-3.5 py-2 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none"
              />
            </div>
          </div>

          {selectedStudent && (
            <div className="bg-indigo-50 border border-indigo-200 p-4 rounded-xl flex flex-wrap items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-indigo-600 text-white flex items-center justify-center font-bold">
                  {selectedStudent.fullName?.charAt(0)}
                </div>
                <div>
                  <span className="font-bold text-sm text-indigo-950 block">{selectedStudent.fullName}</span>
                  <span className="text-slate-600">Father: {selectedStudent.fatherName}</span>
                </div>
              </div>
              <div>
                <span className="text-slate-500 block">Enrolled Program:</span>
                <span className="font-bold text-slate-800">{selectedStudent.courseName}</span>
              </div>
              <div>
                <span className="text-slate-500 block">Roll & Reg No:</span>
                <span className="font-mono font-bold text-indigo-700">{selectedStudent.rollNo} ({selectedStudent.registrationNo})</span>
              </div>
            </div>
          )}
        </div>

        {/* Step 2: Subjects & Marks Table */}
        <div className="space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-indigo-600" />
              <span>Subjects & Marks Entry Table</span>
            </h3>

            <button
              type="button"
              onClick={handleAddSubject}
              className="flex items-center gap-1 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 font-bold px-3 py-1.5 rounded-lg text-xs transition-colors cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" /> Add Subject
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-100 text-slate-700 uppercase font-bold text-[11px]">
                <tr>
                  <th className="p-3 w-28">Subject Code</th>
                  <th className="p-3">Paper / Subject Name</th>
                  <th className="p-3 w-24 text-center">Max Theory</th>
                  <th className="p-3 w-28 text-center">Theory Obt</th>
                  <th className="p-3 w-24 text-center">Max Pract</th>
                  <th className="p-3 w-28 text-center">Pract Obt</th>
                  <th className="p-3 w-20 text-center">Total</th>
                  <th className="p-3 w-12 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {subjects.map((sub, idx) => {
                  const subTotal = (Number(sub.obTheory) || 0) + (Number(sub.obPractical) || 0);
                  const subMax = (Number(sub.maxTheory) || 0) + (Number(sub.maxPractical) || 0);

                  return (
                    <tr key={idx} className="hover:bg-slate-50/50">
                      <td className="p-2">
                        <input
                          type="text"
                          value={sub.code}
                          onChange={(e) => handleSubjectChange(idx, 'code', e.target.value)}
                          className="w-full p-2 font-mono uppercase bg-slate-50 border border-slate-300 rounded-lg text-xs font-bold text-indigo-900"
                        />
                      </td>
                      <td className="p-2">
                        <input
                          type="text"
                          value={sub.name}
                          onChange={(e) => handleSubjectChange(idx, 'name', e.target.value)}
                          className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-medium"
                        />
                      </td>
                      <td className="p-2 text-center">
                        <input
                          type="number"
                          value={sub.maxTheory}
                          onChange={(e) => handleSubjectChange(idx, 'maxTheory', e.target.value)}
                          className="w-16 p-2 text-center bg-slate-50 border border-slate-300 rounded-lg text-xs"
                        />
                      </td>
                      <td className="p-2 text-center">
                        <input
                          type="number"
                          value={sub.obTheory}
                          onChange={(e) => handleSubjectChange(idx, 'obTheory', e.target.value)}
                          className="w-20 p-2 text-center font-bold text-indigo-950 bg-white border border-indigo-300 rounded-lg text-xs"
                        />
                      </td>
                      <td className="p-2 text-center">
                        <input
                          type="number"
                          value={sub.maxPractical}
                          onChange={(e) => handleSubjectChange(idx, 'maxPractical', e.target.value)}
                          className="w-16 p-2 text-center bg-slate-50 border border-slate-300 rounded-lg text-xs"
                        />
                      </td>
                      <td className="p-2 text-center">
                        <input
                          type="number"
                          value={sub.obPractical}
                          onChange={(e) => handleSubjectChange(idx, 'obPractical', e.target.value)}
                          className="w-20 p-2 text-center font-bold text-indigo-950 bg-white border border-indigo-300 rounded-lg text-xs"
                        />
                      </td>
                      <td className="p-2 text-center font-bold text-slate-900">
                        {subTotal} / {subMax}
                      </td>
                      <td className="p-2 text-center">
                        <button
                          type="button"
                          onClick={() => handleRemoveSubject(idx)}
                          className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-lg cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Live Calculation Preview Banner */}
        <div className="bg-gradient-to-r from-indigo-900 to-navy-900 text-white p-6 rounded-2xl grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
          <div>
            <span className="text-xs text-indigo-200 block">Total Marks Aggregate</span>
            <span className="text-xl font-black">{totalObt} / {totalMax}</span>
          </div>
          <div>
            <span className="text-xs text-indigo-200 block">Calculated Percentage</span>
            <span className="text-xl font-black text-amber-300">{percentage}%</span>
          </div>
          <div>
            <span className="text-xs text-indigo-200 block">Estimated SGPA</span>
            <span className="text-xl font-black text-emerald-300">{sgpa} / 10</span>
          </div>
          <div>
            <span className="text-xs text-indigo-200 block">Result Status</span>
            <span className="text-xs font-bold uppercase bg-emerald-500 text-slate-950 px-2 py-1 rounded inline-block mt-1">
              {Number(percentage) >= 75 ? 'Distinction' : Number(percentage) >= 50 ? 'Passed' : 'Backlog'}
            </span>
          </div>
        </div>

        {/* Actions */}
        <div className="pt-4 flex justify-end gap-3">
          <button
            type="submit"
            disabled={loading}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3.5 px-8 rounded-xl text-sm shadow-md transition-all disabled:opacity-50 cursor-pointer"
          >
            {loading ? <span>Saving Exam Record...</span> : <><Save className="w-4 h-4" /><span>Save & Publish Student Result</span></>}
          </button>
        </div>

      </form>

      {/* Marksheet Print Modal */}
      {showPrintModal && successResult && (
        <PrintMarksheet
          result={successResult}
          student={selectedStudent}
          onClose={() => setShowPrintModal(false)}
        />
      )}

    </div>
  );
}
