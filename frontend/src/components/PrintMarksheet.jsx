import React from 'react';
import { School, Printer, X, Award, CheckCircle2 } from 'lucide-react';

export default function PrintMarksheet({ result, student, onClose }) {
  if (!result) return null;

  const handlePrint = () => {
    window.print();
  };

  const isDistinction = result.percentage >= 75;
  const isPass = result.resultStatus?.includes('PASS');

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white w-full max-w-4xl rounded-2xl shadow-2xl overflow-hidden my-8 border border-slate-200">
        
        {/* Top Controls */}
        <div className="no-print bg-slate-900 text-white px-6 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Award className="w-5 h-5 text-amber-400" />
            <span className="font-semibold text-sm">Official Semester Examination Statement of Marks</span>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handlePrint}
              className="flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-slate-950 px-4 py-1.5 rounded-lg text-sm font-bold transition-colors shadow-sm"
            >
              <Printer className="w-4 h-4" /> Print Marksheet
            </button>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-white p-1 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Marksheet Sheet */}
        <div className="printable-area p-8 sm:p-12 bg-white text-slate-800 font-sans border-8 border-double border-indigo-950">
          
          {/* Top Header */}
          <div className="border-b-2 border-indigo-950 pb-4 mb-6 text-center">
            <div className="flex items-center justify-center gap-4 mb-2">
              <div className="w-16 h-16 rounded-xl bg-indigo-950 text-amber-400 flex items-center justify-center shadow-md">
                <School className="w-10 h-10" />
              </div>
              <div className="text-left">
                <h1 className="font-serif-univ font-black text-2xl sm:text-3xl text-indigo-950 uppercase tracking-tight">
                  Apex Global University
                </h1>
                <p className="text-xs font-bold text-slate-700">
                  Established by Government of India Act • NAAC 'A++' Accredited
                </p>
                <p className="text-[11px] text-slate-500">
                  Examination Cell & Evaluation Directorate, Central Campus, Bhopal (M.P.)
                </p>
              </div>
            </div>
            <div className="inline-block bg-indigo-950 text-amber-300 font-serif-univ font-bold text-xs sm:text-sm px-6 py-1 rounded tracking-widest uppercase mt-2">
              Statement of Grades & Marks (Semester - {result.semester})
            </div>
          </div>

          {/* Student & Examination Details Grid */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-300 mb-6 text-xs">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div>
                <span className="text-slate-500 block font-medium">Roll Number:</span>
                <span className="font-bold text-indigo-950 text-sm font-mono">{result.rollNo}</span>
              </div>
              <div>
                <span className="text-slate-500 block font-medium">Student Name:</span>
                <span className="font-bold text-slate-900 text-sm uppercase">{result.studentName}</span>
              </div>
              <div>
                <span className="text-slate-500 block font-medium">Degree / Course:</span>
                <span className="font-semibold text-slate-800">{result.courseName}</span>
              </div>
              <div>
                <span className="text-slate-500 block font-medium">Examination Session:</span>
                <span className="font-semibold text-slate-800">{result.examSession || 'Session 2026-27'}</span>
              </div>
            </div>
          </div>

          {/* Marks Table */}
          <div className="mb-6 overflow-x-auto">
            <table className="w-full text-xs text-left border-collapse border border-slate-400">
              <thead className="bg-indigo-950 text-white uppercase text-[11px]">
                <tr>
                  <th className="p-2.5 border border-slate-400 text-center w-12">#</th>
                  <th className="p-2.5 border border-slate-400 w-24">Code</th>
                  <th className="p-2.5 border border-slate-400">Subject Name / Paper Title</th>
                  <th className="p-2.5 border border-slate-400 text-center w-20">Theory (70)</th>
                  <th className="p-2.5 border border-slate-400 text-center w-20">Practical (30)</th>
                  <th className="p-2.5 border border-slate-400 text-center w-24">Total (100)</th>
                  <th className="p-2.5 border border-slate-400 text-center w-16">Grade</th>
                  <th className="p-2.5 border border-slate-400 text-center w-16">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-300">
                {result.subjects?.map((sub, idx) => (
                  <tr key={idx} className={idx % 2 === 0 ? 'bg-white' : 'bg-slate-50'}>
                    <td className="p-2 border border-slate-300 text-center font-medium">{idx + 1}</td>
                    <td className="p-2 border border-slate-300 font-mono font-bold text-indigo-900">{sub.code}</td>
                    <td className="p-2 border border-slate-300 font-medium text-slate-800">{sub.name}</td>
                    <td className="p-2 border border-slate-300 text-center">{sub.obTheory}</td>
                    <td className="p-2 border border-slate-300 text-center">{sub.obPractical}</td>
                    <td className="p-2 border border-slate-300 text-center font-bold text-slate-950">{sub.totalObtained}</td>
                    <td className="p-2 border border-slate-300 text-center font-bold text-indigo-700">{sub.grade}</td>
                    <td className="p-2 border border-slate-300 text-center">
                      <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                        sub.pass ? 'text-emerald-700 bg-emerald-50' : 'text-rose-700 bg-rose-50'
                      }`}>
                        {sub.pass ? 'PASS' : 'FAIL'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="bg-slate-100 font-bold text-slate-900 text-xs border-t-2 border-slate-400">
                <tr>
                  <td colSpan="5" className="p-2.5 border border-slate-400 text-right uppercase">
                    Grand Aggregate Total:
                  </td>
                  <td className="p-2.5 border border-slate-400 text-center text-sm font-extrabold text-indigo-950">
                    {result.totalObtainedMarks} / {result.totalMaxMarks}
                  </td>
                  <td colSpan="2" className="p-2.5 border border-slate-400 text-center text-indigo-900">
                    {result.percentage}%
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>

          {/* Performance Summary Cards */}
          <div className="grid grid-cols-4 gap-3 mb-6 text-center text-xs">
            <div className="p-3 bg-indigo-50 border border-indigo-200 rounded-xl">
              <span className="text-indigo-900 font-medium block">Total Percentage</span>
              <span className="text-xl font-black text-indigo-950">{result.percentage}%</span>
            </div>
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl">
              <span className="text-amber-900 font-medium block">Semester SGPA</span>
              <span className="text-xl font-black text-amber-950">{result.sgpa} / 10</span>
            </div>
            <div className="p-3 bg-purple-50 border border-purple-200 rounded-xl">
              <span className="text-purple-900 font-medium block">Cumulative CGPA</span>
              <span className="text-xl font-black text-purple-950">{result.cgpa} / 10</span>
            </div>
            <div className={`p-3 border rounded-xl ${
              isPass ? 'bg-emerald-50 border-emerald-200 text-emerald-950' : 'bg-rose-50 border-rose-200 text-rose-950'
            }`}>
              <span className="font-medium block">Final Result</span>
              <span className="text-sm font-black uppercase tracking-tight block truncate mt-1">
                {result.resultStatus}
              </span>
            </div>
          </div>

          {/* Remarks & Grading Scale Note */}
          <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 text-[11px] text-slate-600 mb-8 space-y-1">
            <p><span className="font-bold text-slate-800">Academic Remarks:</span> {result.remarks || 'Promoted to subsequent semester without backlogs.'}</p>
            <p><span className="font-bold text-slate-800">Grading Key:</span> O (Outstanding - 10) | A+ (Excellent - 9) | A (Very Good - 8) | B+ (Good - 7) | B (Above Average - 6) | C (Pass - 5) | F (Fail - 0)</p>
          </div>

          {/* Signatures */}
          <div className="pt-6 border-t border-slate-300 grid grid-cols-3 gap-6 text-center text-xs">
            <div>
              <div className="h-8 mb-1 flex items-center justify-center font-mono text-[11px] text-slate-500">
                {result.declarationDate || new Date().toISOString().split('T')[0]}
              </div>
              <p className="font-semibold text-slate-700">Date of Declaration</p>
            </div>
            <div>
              <div className="h-8 mb-1 flex items-center justify-center font-serif-univ font-bold text-indigo-900 text-xs">
                EXAM CELL
              </div>
              <p className="font-semibold text-slate-700">Tabulator / Verified by</p>
            </div>
            <div>
              <div className="h-8 mb-1 flex items-center justify-center font-serif-univ font-bold text-indigo-950 text-xs tracking-wider">
                CONTROLLER OF EXAMINATIONS
              </div>
              <p className="font-semibold text-slate-700">Apex Global University</p>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
