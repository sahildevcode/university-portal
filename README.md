# 🎓 PKC Education Learning Institute & Consultancy Portal

A modern, high-performance, full-stack Educational Consultancy & University Admission Management System designed for student enrollment, fee collections, document tracking, examination results, and official partner university fee settlements.

---

## 🌟 Core Architecture & Features

### 🏛️ Part 1: Main Public Portal
- **Consultancy Website**: Hero banner, campus moments gallery, student testimonials, courses showcase, announcements.
- **Programs & Fee Catalog**: Curriculum explorer with duration, semesters, fee per semester, and total package cost.
- **Online Results Portal**:
  - Search by **Roll Number** + **Semester**.
  - Marksheet with subject-wise theory/practical marks, total, percentage, SGPA, and CGPA.
  - Printable official semester statement of marks with security seals.
- **Online Admission & Inquiries**: Public inquiries desk and online student registration.

### 📋 Part 2: Admin Controller Desk
- **Course & Syllabus Master Hub**: Manage degrees, branches, syllabus PDF uploads by semester.
- **Student Admissions & Directory**:
  - Search by **Roll No, Father's Name, Aadhaar Card Number, Course**.
  - Dynamic Timeframe Filters: **This Week, This Month, This Year, All Students**.
  - Document verification center (10th, 12th, Aadhaar, PAN, Photo, Signature).
- **Cash Counter & Accounts Ledger**:
  - Track student fees, installments, dues, and payment modes (Cash, UPI, Cheque, Bank Transfer).
  - Fee types: Tuition Fee, Examination Fee, Registration Fee, Re-exam Fee.
  - Official printable fee receipts with serial numbers.
  - Timeframe fee filters: Last month, this month, this week collections.
- **🏛️ University Paid & Settlement Desk (Counselor Ledger)**:
  - Counselor dual ledger tracking: Student package fee vs. Official university base fee.
  - Live Retained Cash Margin in Hand (`Student Paid - University Paid`).
  - Expected Gross Profit (`Student Package - University Fee`).
  - Partner universities sync (Maharaja Chhatrasal Bundelkhand University - MCBU, Barkatullah University, State University).
  - Record payments to universities with Bank UTR / Challan references.
  - Printable official **University Fee Settlement Vouchers**.
- **Website CMS & Inquiries Manager**: Live event photo gallery and public inquiries response.
- **Staff & Operator Access Control**: Manage credentials and roles for operators.

---

## 🚀 How to Run Locally

### 1. Start the Backend API (Port 5000)
```bash
cd backend
npm install
npm start
```

### 2. Start the Frontend (Port 5173)
```bash
cd frontend
npm install
npm run dev
```

Visit **`http://localhost:5173`** in your browser.

---

## 🌐 Deploy to Cloud (Free 24/7 Hosting)
- **Backend**: Deploy on **Render.com** (Web Service -> Root: `backend`, Build: `npm install`, Start: `npm start`).
- **Frontend**: Deploy on **Vercel.com** (Root: `frontend`, Framework: `Vite`, Build: `npm run build`, Output: `dist`).
