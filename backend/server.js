import express from 'express';
import cors from 'cors';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import XLSX from 'xlsx';
import { PDFParse } from 'pdf-parse';
import { readDB, writeDB, initDB } from './db.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

const memUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 30 * 1024 * 1024 }
});

initDB();

// Sanitize student dual enrollment linkages so standalone degree admissions are never merged
try {
  const db = readDB();
  let dbChanged = false;
  if (Array.isArray(db.students)) {
    db.students.forEach(s => {
      const r = (s.rollNo || '').toUpperCase();
      // If a student has a standalone base roll number (no hyphen '-') and is a degree course:
      if (r && !r.includes('-')) {
        if (s.primaryRollNo || s.primaryStudentId || s.isSecondaryCourse) {
          s.primaryRollNo = null;
          s.primaryStudentId = null;
          s.isSecondaryCourse = false;
          dbChanged = true;
        }
      }
      // If a student is a suffixed secondary course (contains '-'), ensure primaryRollNo points to its base roll:
      if (r && r.includes('-')) {
        const baseRoll = r.split('-')[0];
        if (s.primaryRollNo?.toUpperCase() !== baseRoll) {
          s.primaryRollNo = baseRoll;
          s.isSecondaryCourse = true;
          s.isDualEnrollment = true;
          dbChanged = true;
        }
      }
    });
  }
  if (dbChanged) {
    writeDB(db);
    console.log('Sanitized dual enrollment linkages in database.json');
  }
} catch (err) {
  console.warn('DB sanitization notice:', err);
}

const uploadDir = path.join(__dirname, 'uploads', 'documents');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname) || '.pdf';
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const field = file.fieldname || 'doc';
    cb(null, `${field}-${uniqueSuffix}${ext}`);
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 15 * 1024 * 1024 }
});

const syllabusUploadDir = path.join(__dirname, 'uploads', 'syllabus');
if (!fs.existsSync(syllabusUploadDir)) {
  fs.mkdirSync(syllabusUploadDir, { recursive: true });
}

const syllabusStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, syllabusUploadDir);
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname) || '.pdf';
    const courseId = (req.params.courseId || 'course').replace(/[^a-zA-Z0-9-]/g, '_');
    const sem = (req.body.semester || '1').replace(/[^a-zA-Z0-9-]/g, '_');
    const unique = Date.now();
    cb(null, `syllabus-${courseId}-sem${sem}-${unique}${ext}`);
  }
});

const syllabusUpload = multer({
  storage: syllabusStorage,
  limits: { fileSize: 30 * 1024 * 1024 }
});

const galleryUploadDir = path.join(__dirname, 'uploads', 'gallery');
if (!fs.existsSync(galleryUploadDir)) {
  fs.mkdirSync(galleryUploadDir, { recursive: true });
}

const galleryStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, galleryUploadDir);
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname) || '.jpg';
    const unique = Date.now() + '-' + Math.round(Math.random() * 1e6);
    cb(null, `event-${unique}${ext}`);
  }
});

const galleryUpload = multer({
  storage: galleryStorage,
  limits: { fileSize: 15 * 1024 * 1024 }
});

app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ----------------------------------------------------
// 0. AUTHENTICATION & SETTINGS
// ----------------------------------------------------
// Admin Login
app.post('/api/auth/login', (req, res) => {
  const { username, password } = req.body;
  const db = readDB();

  const cleanUser = (username || '').trim().toLowerCase();
  const cleanPass = (password || '').trim();

  const user = (db.users || []).find(
    u => (u.username || '').trim().toLowerCase() === cleanUser && (u.password || '').trim() === cleanPass
  );

  if (!user) {
    return res.status(401).json({
      success: false,
      message: 'Invalid Admin User ID or Password. Please verify your administrator credentials.'
    });
  }

  res.json({
    success: true,
    message: 'Admin authentication successful.',
    user: {
      username: user.username,
      name: user.name,
      role: user.role
    }
  });
});

// Dedicated Staff Login (using staff_users managed by Admin)
app.post('/api/auth/staff-login', (req, res) => {
  const { username, password } = req.body;
  const db = readDB();

  const cleanUser = (username || '').trim().toLowerCase();
  const cleanPass = (password || '').trim();

  let staff = (db.staff_users || []).find(
    s => (
      (s.username || '').trim().toLowerCase() === cleanUser ||
      (s.name || '').trim().toLowerCase() === cleanUser ||
      (s.id || '').trim().toLowerCase() === cleanUser
    ) && (s.password || '').trim() === cleanPass
  );

  // Fallback: check if username is a non-admin staff in db.users
  if (!staff) {
    const cashierUser = (db.users || []).find(
      u => (u.username || '').trim().toLowerCase() === cleanUser && 
           (u.password || '').trim() === cleanPass && 
           u.role !== 'admin'
    );
    if (cashierUser) {
      staff = {
        id: `user-${cashierUser.username}`,
        name: cashierUser.name || cashierUser.username,
        username: cashierUser.username,
        role: cashierUser.role || 'Cash Counter & Admission Desk',
        department: 'Accounts & Admissions',
        status: 'Active'
      };
    }
  }

  if (!staff) {
    return res.status(401).json({
      success: false,
      message: 'Invalid Staff ID or Password. Please check the credentials assigned by Admin.'
    });
  }

  if (staff.status === 'Inactive') {
    return res.status(403).json({
      success: false,
      message: 'This Staff Account has been deactivated by Admin.'
    });
  }

  res.json({
    success: true,
    message: 'Staff authenticated successfully.',
    staff: {
      id: staff.id,
      name: staff.name,
      username: staff.username,
      role: staff.role,
      department: staff.department
    }
  });
});

// Admin: List all staff members
app.get('/api/staff', (req, res) => {
  const db = readDB();
  res.json({
    success: true,
    staff: (db.staff_users || []).map(s => ({
      id: s.id,
      name: s.name,
      username: s.username,
      password: s.password, // Return exact password set by Admin so it displays accurately
      role: s.role,
      department: s.department,
      status: s.status || 'Active',
      createdAt: s.createdAt
    }))
  });
});

// Admin: Create new staff account
app.post('/api/staff', (req, res) => {
  const db = readDB();
  const { name, username, password, role, department } = req.body;

  if (!name || !username || !password) {
    return res.status(400).json({ success: false, message: 'Name, Staff ID, and Password are required.' });
  }

  if (!db.staff_users) db.staff_users = [];
  const cleanUser = username.trim().toLowerCase();
  if (db.staff_users.some(s => (s.username || '').trim().toLowerCase() === cleanUser)) {
    return res.status(400).json({ success: false, message: 'Staff ID already exists. Please choose another ID.' });
  }

  const newStaff = {
    id: `stf-${Date.now()}`,
    name: name.trim(),
    username: cleanUser,
    password: password.trim(),
    role: role || 'Cash Counter & Admission Desk',
    department: department || 'Accounts & Admissions',
    status: 'Active',
    createdAt: new Date().toISOString()
  };

  db.staff_users.push(newStaff);
  writeDB(db);

  res.json({
    success: true,
    message: `Staff account for "${newStaff.name}" created successfully!`,
    staff: newStaff
  });
});

// Admin: Delete staff account
app.delete('/api/staff/:id', (req, res) => {
  const db = readDB();
  const { id } = req.params;

  if (!db.staff_users) db.staff_users = [];
  const initialLen = db.staff_users.length;
  db.staff_users = db.staff_users.filter(s => s.id !== id && s.username !== id);

  if (db.staff_users.length === initialLen) {
    return res.status(404).json({ success: false, message: 'Staff member not found.' });
  }

  writeDB(db);
  res.json({ success: true, message: 'Staff account removed successfully.' });
});

// Student Self Sign-Up
app.post('/api/auth/student-register', (req, res) => {
  const db = readDB();
  const { username, password, fullName, email, phone, courseId } = req.body;

  if (!username || !password || !fullName || !email) {
    return res.status(400).json({ success: false, message: 'Please provide all required fields.' });
  }

  if (!db.student_users) db.student_users = [];
  if (db.student_users.some(u => u.username.toLowerCase() === username.toLowerCase())) {
    return res.status(400).json({ success: false, message: 'Username already taken. Please choose another username.' });
  }

  const selectedCourse = db.courses.find(c => c.id === courseId) || db.courses[0];
  const year = new Date().getFullYear();
  const studentCount = db.students.length + 1;
  const rollNo = `UNIV${year}${String(studentCount).padStart(3, '0')}`;
  const regNo = `REG-${year}-${Math.floor(1000 + Math.random() * 9000)}`;

  const newStudentUser = {
    id: `usr-${Date.now()}`,
    username: username.trim(),
    password: password,
    fullName: fullName.trim(),
    email: email.trim(),
    phone: phone || '',
    rollNo: rollNo,
    courseId: selectedCourse?.id || 'custom',
    createdAt: new Date().toISOString()
  };

  db.student_users.push(newStudentUser);

  // Also create student record in database so admin sees them immediately!
  const newStudent = {
    id: `std-${Date.now()}`,
    rollNo: rollNo,
    registrationNo: regNo,
    fullName: fullName.trim(),
    studentName: fullName.trim(),
    fatherName: '',
    motherName: '',
    dob: '',
    gender: 'Male',
    contact: phone || '',
    phone: phone || '',
    email: email.trim(),
    address: '',
    aadhaarNo: '',
    samagraId: '',
    enrollmentNo: rollNo,
    abcId: '',
    universityName: selectedCourse?.universityName || 'Maharaja Chhatrasal Bundelkhand University (MCBU)',
    collegeName: selectedCourse?.collegeName || 'PKC Education Learning Institute & Consultancy',
    courseId: selectedCourse?.id || 'custom',
    courseName: selectedCourse?.name || selectedCourse?.courseName || 'General Course',
    branch: selectedCourse?.branch || 'General',
    courseType: selectedCourse?.courseType || 'UG',
    courseMode: selectedCourse?.courseMode || 'Regular',
    socialCategory: 'General',
    documentSubmit: '',
    bloodGroup: 'NA',
    currentSession: '2024-2025',
    currentSatra: 'July',
    currentClass: 'SEM-1',
    currentSemester: 1,
    studentFee: selectedCourse?.fee || 0,
    totalFee: selectedCourse?.fee || 0,
    scholarshipAmount: 0,
    totalPaid: 0,
    balanceDue: selectedCourse?.fee || 0,
    status: 'Active',
    admissionYear: year,
    admissionDate: new Date().toISOString().split('T')[0]
  };
  db.students.unshift(newStudent);
  writeDB(db);

  res.json({
    success: true,
    message: 'Student registration successful!',
    user: newStudentUser,
    student: newStudent
  });
});

// Bulk Data Import (Excel / JSON) for Legacy Students
app.post('/api/students/bulk-import', (req, res) => {
  try {
    const { students: rawStudents, clearExisting = false, operatorName = 'Admin' } = req.body;
    if (!Array.isArray(rawStudents) || rawStudents.length === 0) {
      return res.status(400).json({ success: false, message: 'No student records provided for import.' });
    }

    const db = readDB();
    if (!db.students) db.students = [];
    if (!db.fee_payments) db.fee_payments = [];

    if (clearExisting) {
      db.students = [];
      db.fee_payments = [];
    }

    const importedStudents = [];
    const generatedReceipts = [];
    const timestamp = new Date().toISOString();

    for (let i = 0; i < rawStudents.length; i++) {
      const row = normalizeStudentRow(rawStudents[i]);
      const studentIdx = db.students.length + 1;
      const yr = row.admissionSession ? row.admissionSession.split('-')[0] : '2024';

      let rollBase = (row.enrollmentNo || row.rollNo || '').toUpperCase();
      if (!rollBase) {
        rollBase = `PKC${yr}${String(studentIdx).padStart(3, '0')}`;
      }

      const finalRoll = rollBase;
      const regNo = `REG-IMP-${yr}-${Math.floor(1000 + Math.random() * 9000)}`;

      const courseFee = Number(row.studentFee || row.totalFee || 0);
      const schAmt = Number(row.scholarshipAmount || 0);
      const netFee = Math.max(0, courseFee - schAmt);

      let paid = 0;
      if (row.totalPaid !== undefined && row.totalPaid !== null) {
        paid = Number(row.totalPaid);
      } else if (row.paidAmount !== undefined && row.paidAmount !== null) {
        paid = Number(row.paidAmount);
      } else {
        paid = courseFee > 0 ? courseFee : 0;
      }

      const due = Math.max(0, netFee - paid);

      const docList = Array.isArray(row.documentSubmit) ? row.documentSubmit.join(', ') : (row.documentSubmit || 'Pending Document Submission');
      const docStatusMap = {
        doc10th: docList.toLowerCase().includes('10th') ? 'Verified' : 'Pending',
        doc12th: docList.toLowerCase().includes('12th') ? 'Verified' : 'Pending',
        aadhar: docList.toLowerCase().includes('aadhaar') || docList.toLowerCase().includes('aadhar') ? 'Verified' : 'Pending'
      };

      const newStudent = {
        id: `std-leg-${Date.now()}-${i}-${Math.floor(100 + Math.random() * 900)}`,
        rollNo: finalRoll,
        registrationNo: regNo,
        studentName: row.studentName || row.fullName || `Student ${studentIdx}`,
        fullName: row.fullName || row.studentName || `Student ${studentIdx}`,
        fatherName: row.fatherName || '',
        motherName: row.motherName || '',
        dob: row.dob || '',
        gender: row.gender || 'Male',
        contact: row.phone || row.contact || '',
        phone: row.phone || row.contact || '',
        email: row.email || '',
        address: row.address || '',
        aadhaarNo: row.aadhaarNo || '',
        samagraId: row.samagraId || '',
        enrollmentNo: row.enrollmentNo || finalRoll,
        abcId: row.abcId || '',
        mptassId: row.mptassId || '',
        mptassPassword: row.mptassPassword || '',
        otrId: row.otrId || '',
        debId: row.debId || '',
        scholerId: row.scholerId || '',
        userId: row.userId || '',
        medium: row.medium || 'Hindi',
        admissionSession: row.admissionSession || '2024-2025',
        admissionSatra: row.admissionSatra || 'July',
        admissionDate: row.admissionDate || `${yr}-07-15`,
        universityName: row.universityName || 'Maharaja Chhatrasal Bundelkhand University (MCBU)',
        collegeName: row.collegeName || 'PKC Education Learning Institute & Consultancy',
        courseId: 'legacy-course',
        courseName: row.courseName || 'General Degree',
        branch: row.branch || 'General',
        courseType: row.courseType || 'UG',
        courseMode: row.courseMode || 'Regular',
        socialCategory: row.socialCategory || 'General',
        category: row.socialCategory || 'General',
        documentSubmit: docList,
        documentsStatus: docStatusMap,
        bloodGroup: row.bloodGroup || 'NA',
        currentSession: row.admissionSession || '2024-2025',
        currentSatra: row.admissionSatra || 'July',
        currentClass: row.currentClass || `SEM-${row.currentSemester || 1}`,
        currentSemester: Number(row.currentSemester) || 1,
        studentFee: courseFee,
        courseFee: courseFee,
        admissionFee: 0,
        totalFee: courseFee,
        scholarshipAmount: schAmt,
        netTotalFee: netFee,
        courseFeePaid: paid,
        admissionFeePaid: 0,
        initialPayment: paid,
        totalPaid: paid,
        balanceDue: due,
        universityFee: 0,
        universityPaid: 0,
        universityDue: 0,
        remark: row.remark !== undefined && row.remark !== null ? String(row.remark).trim() : '',
        cancel: row.cancel || '',
        status: row.status || 'Active',
        feeType: 'Past Session Legacy Fee Deposit',
        feeCollectedBy: operatorName,
        paymentMode: 'Bank / Cash Record (Imported)',
        reference: 'Legacy Session Archive',
        admissionType: 'Bulk Legacy Import',
        admissionYear: Number(yr) || 2024,
        admissionTimestamp: timestamp,
        studentImage: row.studentImage || '',
        documents: {
          student_image: row.studentImage || '',
          photo: row.studentImage || ''
        }
      };

      // Calculate semester progression
      const prog = computeStudentSemesterProgress(newStudent, db.courses);
      if (!row.currentClass) {
        newStudent.currentClass = prog.currentClass;
        newStudent.currentSemester = prog.currentSemester;
      }

      db.students.unshift(newStudent);
      importedStudents.push(newStudent);

      // Create Payment Ledger entry if fee was paid
      if (paid > 0) {
        const receiptNo = String(getNextReceiptNumber(db));
        const receipt = {
          id: `pay-leg-${Date.now()}-${i}-${Math.floor(100 + Math.random() * 900)}`,
          receiptNo: receiptNo,
          studentId: newStudent.id,
          rollNo: newStudent.rollNo,
          studentName: newStudent.fullName,
          courseName: newStudent.courseName,
          amountPaid: paid,
          courseFeePaid: paid,
          admissionFeePaid: 0,
          feeType: 'Past Session Legacy Fee Deposit',
          paymentMode: 'Bank / Cash Record (Imported)',
          transactionRef: `LEG-IMP-${yr}-${String(receiptNo).padStart(4, '0')}`,
          paidFor: `Session ${newStudent.admissionSession} Fee Settlement`,
          paymentDate: newStudent.admissionDate,
          totalFee: courseFee,
          totalPaidToDate: paid,
          balanceRemaining: due,
          receivedBy: operatorName
        };
        db.fee_payments.unshift(receipt);
        generatedReceipts.push(receipt);
      }
    }

    writeDB(db);

    res.json({
      success: true,
      message: `Successfully imported ${importedStudents.length} student records and generated ${generatedReceipts.length} payment ledger entries.`,
      importedCount: importedStudents.length,
      receiptsCount: generatedReceipts.length
    });
  } catch (err) {
    console.error('Error during bulk import:', err);
    res.status(500).json({ success: false, message: 'Bulk import failed: ' + err.message });
  }
});

// Reset / Clear Demo Student Data
app.post('/api/students/reset-demo-data', (req, res) => {
  try {
    const { confirmationKey } = req.body;
    if (confirmationKey !== 'CLEAR_DEMO_DATA') {
      return res.status(400).json({
        success: false,
        message: 'Invalid confirmation key. Please confirm with CLEAR_DEMO_DATA to prevent accidental deletion.'
      });
    }

    const db = readDB();
    const studentsDeleted = db.students ? db.students.length : 0;
    const paymentsDeleted = db.fee_payments ? db.fee_payments.length : 0;

    db.students = [];
    db.fee_payments = [];
    if (db.university_payments) db.university_payments = [];

    writeDB(db);

    res.json({
      success: true,
      message: `Cleared ${studentsDeleted} demo students and ${paymentsDeleted} fee receipts. Database is fresh and ready for real data import!`,
      cleared: { students: studentsDeleted, payments: paymentsDeleted }
    });
  } catch (err) {
    console.error('Error resetting demo data:', err);
    res.status(500).json({ success: false, message: 'Failed to reset demo data: ' + err.message });
  }
});

app.get('/api/students/:rollNo', (req, res) => {
  const db = readDB();
  const roll = req.params.rollNo.toUpperCase();
  const student = db.students.find(s => s.rollNo.toUpperCase() === roll || s.registrationNo.toUpperCase() === roll || s.id === req.params.rollNo);
  
  if (!student) {
    return res.status(404).json({ success: false, message: 'Student not found with this Roll / Reg No.' });
  }

  const payments = db.fee_payments.filter(p => p.rollNo.toUpperCase() === student.rollNo.toUpperCase());
  const results = db.results.filter(r => r.rollNo.toUpperCase() === student.rollNo.toUpperCase());

  res.json({
    success: true,
    student: { ...student, payments, results }
  });
});

// Physical On-Campus Admission with Multipart Docs & Payment (Cash, Card, Online)
app.post(
  '/api/students',
  upload.fields([
    { name: 'student_image', maxCount: 1 },
    { name: 'photo', maxCount: 1 },
    { name: 'signature', maxCount: 1 },
    { name: 'doc10th', maxCount: 1 },
    { name: 'doc12th', maxCount: 1 },
    { name: 'aadhar', maxCount: 1 },
    { name: 'pan', maxCount: 1 }
  ]),
  (req, res) => {
    try {
      const db = readDB();
      const body = req.body;

      const studentCount = db.students.length + 1;
      const year = new Date().getFullYear();
      const generatedRollNo = `UNIV${year}${String(studentCount).padStart(3, '0')}`;
      let rollNo = body.rollNo ? body.rollNo.trim().toUpperCase() : (body.Enrollment_No ? body.Enrollment_No.trim().toUpperCase() : generatedRollNo);
      const registrationNo = `REG-${year}-${Math.floor(1000 + Math.random() * 9000)}`;

      // Check if student with this rollNo already exists
      const existingSameRoll = db.students.find(s => s.rollNo.toUpperCase() === rollNo.toUpperCase());
      let isDualEnrollment = Boolean(body.isDualEnrollment === 'true' || body.isDualEnrollment === true);
      let primaryRollNo = body.primaryRollNo || null;
      let primaryStudentId = body.primaryStudentId || null;

      if (existingSameRoll) {
        const requestedCourse = (body.Course_Name || body.courseName || '').trim();
        const requestedCollege = (body.College_Name || body.collegeName || '').trim();
        const isSameCourseAndCollege = 
          existingSameRoll.courseName?.toLowerCase() === requestedCourse.toLowerCase() &&
          existingSameRoll.collegeName?.toLowerCase() === requestedCollege.toLowerCase();

        if (isSameCourseAndCollege) {
          return res.status(400).json({ 
            success: false, 
            message: `Student with Roll Number ${rollNo} is already enrolled in ${existingSameRoll.courseName} at ${existingSameRoll.collegeName}!` 
          });
        }

        // Student is enrolling in a secondary/dual course (e.g. DCA while doing BCA)
        isDualEnrollment = true;
        primaryRollNo = existingSameRoll.rollNo;
        primaryStudentId = existingSameRoll.id;

        // Auto-assign a disambiguated linked roll number for this 2nd course: e.g. 233324-DCA
        const courseCodePart = (body.Branch || body.Course_Type || body.courseCode || requestedCourse.split(' ')[0] || 'DUAL').replace(/[^a-zA-Z0-9]/g, '').slice(0, 5).toUpperCase();
        let candidateRoll = `${rollNo}-${courseCodePart}`;
        let counter = 2;
        while (db.students.some(s => s.rollNo.toUpperCase() === candidateRoll.toUpperCase())) {
          candidateRoll = `${rollNo}-${courseCodePart}${counter++}`;
        }
        rollNo = candidateRoll;
      }

      const courseFee = body.Student_fee !== undefined ? Number(body.Student_fee) : (body.courseFee !== undefined ? Number(body.courseFee) : (body.totalFee !== undefined ? Number(body.totalFee) : 0));
      const admissionFee = Number(body.Admission_Fee) || Number(body.admissionFee) || 0;
      const scholarshipAmt = Number(body.scholarshipAmount || body.Scholarship_Amount) || 0;
      const grandTotalFee = courseFee + admissionFee + scholarshipAmt;

      const courseFeePaid = Number(body.Course_Fee_Paid) || Number(body.courseFeePaid) || 0;
      const admissionFeePaid = Number(body.Admission_Fee_Paid) || Number(body.admissionFeePaid) || 0;
      const initialPaid = Number(body.Initial_Payment) || (courseFeePaid + admissionFeePaid);
      const balanceDue = Math.max(0, grandTotalFee - initialPaid);

      const files = req.files || {};
      const studentImgUrl = files.student_image 
        ? `/uploads/documents/${files.student_image[0].filename}` 
        : (files.photo ? `/uploads/documents/${files.photo[0].filename}` : (body.photoUrl || body.Student_image || ''));

      const documents = {
        student_image: studentImgUrl,
        photo: studentImgUrl,
        signature: files.signature ? `/uploads/documents/${files.signature[0].filename}` : (body.signatureUrl || ''),
        doc10th: files.doc10th ? `/uploads/documents/${files.doc10th[0].filename}` : (body.doc10thUrl || ''),
        doc12th: files.doc12th ? `/uploads/documents/${files.doc12th[0].filename}` : (body.doc12thUrl || ''),
        aadhar: files.aadhar ? `/uploads/documents/${files.aadhar[0].filename}` : (body.aadharUrl || ''),
        pan: files.pan ? `/uploads/documents/${files.pan[0].filename}` : (body.panUrl || '')
      };

      // Document Submit checklist array
      let docSubmitList = [];
      if (Array.isArray(body.Document_Submit)) {
        docSubmitList = body.Document_Submit;
      } else if (typeof body.Document_Submit === 'string') {
        try {
          docSubmitList = JSON.parse(body.Document_Submit);
        } catch {
          docSubmitList = body.Document_Submit.split(',').map(s => s.trim()).filter(Boolean);
        }
      }

      const studentNameVal = body.Student_Name || body.fullName || 'Student Name';
      const contactVal = body.Contact || body.phone || '';
      const socialCatVal = body.Social_category || body.category || 'General';
      const courseNameInput = (body.Course_Name || body.courseName || '').trim();
      const selectedCourse = (body.courseId && db.courses?.find(c => c.id === body.courseId))
        || (courseNameInput && db.courses?.find(c => c.name && c.name.toLowerCase() === courseNameInput.toLowerCase()))
        || null;

      const newStudent = {
        id: `std-${Date.now()}`,
        rollNo: rollNo,
        registrationNo: registrationNo,
        
        // 39 Core User Admission Fields
        studentName: studentNameVal,
        fullName: studentNameVal, // backward-compat
        motherName: body.Mother_Name || body.motherName || '',
        fatherName: body.Father_Name || body.fatherName || '',
        dob: body.Date_Of_Birth || body.dob || '',
        gender: body.Gender || body.gender || 'Male',
        contact: contactVal,
        phone: contactVal, // backward-compat
        email: body.Email_ID || body.email || '',
        address: body.Address || body.address || '',
        aadhaarNo: body.Aadhaar_No || body.aadhaarNo || '',
        samagraId: body.Samagra_id || body.samagraId || '',
        enrollmentNo: body.Enrollment_No || rollNo,
        abcId: body.Abc_id || body.abcId || '',
        mpTassId: body.MPTass_id || body.mpTassId || '',
        mpTassPassword: body.MPTass_Password || body.mpTassPassword || '',
        otrId: body.OTR_id || body.otrId || '',
        debId: body.Deb_id || body.debId || '',
        scholerId: body.Scholer_id || body.scholerId || '',
        userId: body.User_id || body.userId || '',
        medium: body.Medium || body.medium || 'Hindi',
        admissionSession: body.Admission_Session || body.admissionSession || '2026-2027',
        admissionSatra: body.Admission_Satra || body.admissionSatra || 'July',
        admissionDate: body.Admission_Date || body.admissionDate || new Date().toISOString().split('T')[0],
        universityName: body.University_Name || body.universityName || 'PKC Education & Consultancy',
        collegeName: body.College_Name || body.collegeName || 'PKC Education Learning Institute & Consultancy',
        courseId: body.courseId || selectedCourse?.id || 'custom',
        courseName: courseNameInput || selectedCourse?.name || 'General Degree',
        branch: body.Branch || body.branch || 'General',
        courseType: body.Course_Type || body.courseType || 'UG',
        courseMode: body.Course_Mode || body.courseMode || 'Regular',
        socialCategory: socialCatVal,
        category: socialCatVal, // backward-compat
        documentSubmit: docSubmitList,
        bloodGroup: body.Blood_Group || body.bloodGroup || 'NA',
        currentSession: body.Current_session || body.currentSession || '2026-2027',
        currentSatra: body.Current_satra || body.currentSatra || 'July',
        currentClass: body.Current_class || body.currentClass || 'SEM-1',
        currentSemester: Number(body.currentSemester) || (body.Current_class?.includes('SEM-') ? Number(body.Current_class.replace('SEM-', '')) : 1),
        academicFee: courseFee,
        studentFee: courseFee,
        courseFee: courseFee,
        admissionFee: admissionFee,
        scholarshipAmount: scholarshipAmt,
        totalFee: grandTotalFee,
        netTotalFee: grandTotalFee,
        courseFeePaid: courseFeePaid,
        admissionFeePaid: admissionFeePaid,
        initialPayment: initialPaid,
        totalPaid: initialPaid,
        balanceDue: Math.max(0, grandTotalFee - initialPaid),
        universityFee: Number(body.universityFee) || Number(body.University_Fee) || 0,
        universityPaid: Number(body.universityPaid) || 0,
        universityDue: Math.max(0, (Number(body.universityFee) || Number(body.University_Fee) || 0) - (Number(body.universityPaid) || 0)),
        remark: body.Remark || body.remark || '',
        status: body.Status && !['Cashier', 'Accounts', 'Admin'].includes(body.Status) ? body.Status : 'Active',
        feeType: body.Fee_Type || body.feeType || 'Admission Fee',
        feeCollectedBy: body.Fee_Collected_By || body.feeCollectedBy || body.operatorName || 'Cashier',
        paymentMode: body.Payment_Mode || body.paymentMode || 'Cash / Desk',
        reference: body.Reference || body.reference || 'Direct Walk-in',
        studentImage: studentImgUrl,
        documents: documents,
        isDualEnrollment: isDualEnrollment,
        primaryRollNo: primaryRollNo,
        primaryStudentId: primaryStudentId,
        dualProgramType: body.Course_Type === 'Diploma' ? 'Diploma' : 'Degree / Certificate',
        admissionType: 'Physical Campus Admission Desk',
        admissionYear: Number(body.admissionYear) || 2026,
        admissionTimestamp: new Date().toISOString()
      };

      // Calculate dynamic semester progression right upon registration!
      const initialProg = computeStudentSemesterProgress(newStudent, db.courses);
      newStudent.currentSemester = initialProg.currentSemester;
      newStudent.currentClass = initialProg.currentClass;

      // Initialize detailed document status map (PDF vs Manually)
      let docStatusMap = {};
      if (body.documentsStatus) {
        try {
          docStatusMap = typeof body.documentsStatus === 'string' ? JSON.parse(body.documentsStatus) : body.documentsStatus;
        } catch { docStatusMap = {}; }
      }
      docSubmitList.forEach(item => {
        if (!docStatusMap[item]) {
          docStatusMap[item] = {
            docName: item,
            status: 'submitted_manual',
            mode: 'Manually (Physical Hardcopy)',
            fileUrl: '',
            updatedAt: new Date().toISOString()
          };
        }
      });
      newStudent.documentsStatus = docStatusMap;

      db.students.unshift(newStudent);

      let initialReceipt = null;
      if (initialPaid > 0) {
        const receiptNo = String(getNextReceiptNumber(db));
        initialReceipt = {
          id: `pay-${Date.now()}`,
          receiptNo: receiptNo,
          studentId: newStudent.id,
          rollNo: newStudent.rollNo,
          studentName: newStudent.fullName,
          courseName: newStudent.courseName,
          amountPaid: initialPaid,
          courseFeePaid: courseFeePaid,
          admissionFeePaid: admissionFeePaid,
          feeType: body.Fee_Type || body.feeType || 'Admission Fee',
          paymentMode: body.Payment_Mode || body.paymentMode || 'Cash / Desk',
          transactionRef: body.Transaction_Ref || body.transactionRef || `ADM-INIT-${Math.floor(100000 + Math.random() * 900000)}`,
          paidFor: (admissionFeePaid > 0 && courseFeePaid > 0)
            ? `${body.Fee_Type || 'Admission Fee'} (₹${admissionFeePaid}) + Course Fee Installment (₹${courseFeePaid})`
            : (admissionFeePaid > 0 ? `${body.Fee_Type || 'Admission Fee'} Deposit (₹${admissionFeePaid})` : `Course Fee Installment (₹${courseFeePaid})`),
          paymentDate: new Date().toISOString(),
          totalFee: grandTotalFee,
          totalPaidToDate: initialPaid,
          balanceRemaining: balanceDue,
          receivedBy: body.Fee_Collected_By || body.feeCollectedBy || body.operatorName || 'Cashier'
        };
        db.fee_payments.unshift(initialReceipt);
      }

      // Check if Secondary Course (Dual Enrollment) is requested in same form submission
      let secondaryStudent = null;
      let secondaryReceipt = null;

      if (body.secondaryCourse) {
        let sec = null;
        try {
          sec = typeof body.secondaryCourse === 'string' ? JSON.parse(body.secondaryCourse) : body.secondaryCourse;
        } catch (e) {
          console.warn('Failed to parse secondaryCourse:', e);
        }

        if (sec && (sec.courseName || sec.Course_Name || sec.degree || sec.Course_Program || sec.branch || sec.Branch)) {
          const secCourseName = (sec.Course_Name || sec.courseName || sec.branch || sec.Branch || 'DCA').trim();
          const secCollegeName = (sec.College_Name || sec.collegeName || body.College_Name || 'Affiliated College').trim();
          const secUnivName = (sec.University_Name || sec.universityName || body.University_Name || 'Partner University').trim();
          const secCourseCode = (sec.Branch || sec.degree || sec.Course_Type || secCourseName.split(' ')[0] || 'DCA').replace(/[^a-zA-Z0-9]/g, '').slice(0, 5).toUpperCase();

          let secCandidateRoll = `${newStudent.rollNo}-${secCourseCode}`;
          let secCounter = 2;
          while (db.students.some(s => s.rollNo.toUpperCase() === secCandidateRoll.toUpperCase())) {
            secCandidateRoll = `${newStudent.rollNo}-${secCourseCode}${secCounter++}`;
          }

          const secCourseFee = Number(sec.Student_fee || sec.courseFee || sec.totalFee || 0);
          const secAdmissionFee = Number(sec.Admission_Fee || sec.admissionFee || 0);
          const secGrandTotal = secCourseFee + secAdmissionFee;
          const secPaid = Number(sec.Initial_Payment || sec.Course_Fee_Paid || sec.totalPaid || 0);
          const secBalanceDue = Math.max(0, secGrandTotal - secPaid);

          secondaryStudent = {
            ...newStudent,
            id: 'std-' + (Date.now() + 1),
            rollNo: secCandidateRoll,
            registrationNo: `${secUnivName.slice(0, 3).toUpperCase()}-${year}-${Math.floor(1000 + Math.random() * 9000)}`,
            universityName: secUnivName,
            collegeName: secCollegeName,
            courseName: secCourseName,
            branch: sec.Branch || sec.branch || 'General',
            courseType: sec.Course_Type || sec.courseType || 'Diploma',
            courseMode: sec.Course_Mode || sec.courseMode || 'Regular',
            currentClass: sec.Current_class || 'SEM-1',
            currentSemester: Number(sec.currentSemester) || 1,
            studentFee: secCourseFee,
            courseFee: secCourseFee,
            admissionFee: secAdmissionFee,
            totalFee: secGrandTotal,
            scholarshipAmount: Number(sec.scholarshipAmount || sec.Scholarship_Amount) || 0,
            netTotalFee: Math.max(0, secGrandTotal - (Number(sec.scholarshipAmount || sec.Scholarship_Amount) || 0)),
            totalPaid: secPaid,
            balanceDue: Math.max(0, Math.max(0, secGrandTotal - (Number(sec.scholarshipAmount || sec.Scholarship_Amount) || 0)) - secPaid),
            isDualEnrollment: true,
            primaryRollNo: newStudent.rollNo,
            primaryStudentId: newStudent.id,
            dualProgramType: 'Diploma / 2nd Course',
            admissionTimestamp: new Date().toISOString()
          };

          // Mark primary student as dual enrolled as well
          newStudent.isDualEnrollment = true;

          const secProg = computeStudentSemesterProgress(secondaryStudent, db.courses);
          secondaryStudent.currentSemester = secProg.currentSemester;
          secondaryStudent.currentClass = secProg.currentClass;

          // Insert secondary student AFTER primary newStudent so primary course stays on top
          db.students.splice(1, 0, secondaryStudent);

          if (secPaid > 0) {
            const secReceiptNo = String(getNextReceiptNumber(db));
            secondaryReceipt = {
              id: `pay-${Date.now() + 2}`,
              receiptNo: secReceiptNo,
              studentId: secondaryStudent.id,
              rollNo: secondaryStudent.rollNo,
              studentName: secondaryStudent.fullName,
              courseName: secondaryStudent.courseName,
              amountPaid: secPaid,
              courseFeePaid: secPaid,
              admissionFeePaid: 0,
              feeType: 'Secondary Course Admission Deposit',
              paymentMode: sec.Payment_Mode || body.Payment_Mode || 'Cash / Desk',
              transactionRef: `ADM-SEC-${Math.floor(100000 + Math.random() * 900000)}`,
              paidFor: `Admission & Tuition Fee Deposit for ${secondaryStudent.courseName}`,
              paymentDate: new Date().toISOString(),
              totalFee: secGrandTotal,
              totalPaidToDate: secPaid,
              balanceRemaining: secBalanceDue,
              receivedBy: body.Fee_Collected_By || body.operatorName || 'Cashier'
            };
            db.fee_payments.unshift(secondaryReceipt);
          }
        }
      }

      writeDB(db);

      res.status(201).json({
        success: true,
        message: secondaryStudent 
          ? `Primary (${newStudent.courseName}) and Secondary (${secondaryStudent.courseName}) admitted successfully!`
          : 'Student registered & admitted successfully!',
        student: newStudent,
        receipt: initialReceipt,
        secondaryStudent: secondaryStudent,
        secondaryReceipt: secondaryReceipt
      });
    } catch (err) {
      console.error('Error during student registration:', err);
      res.status(500).json({ success: false, message: 'Server error: ' + err.message });
    }
  }
);

// Full Student Edit Endpoint
app.put('/api/students/:rollNo', (req, res) => {
  const db = readDB();
  const roll = req.params.rollNo.toUpperCase();
  const index = db.students.findIndex(s => s.rollNo.toUpperCase() === roll);

  if (index === -1) {
    return res.status(404).json({ success: false, message: 'Student not found' });
  }

  const existing = db.students[index];
  const body = req.body;

  // Handle potential Roll Number change
  let newRoll = (body.rollNo || body.Roll_No || existing.rollNo).trim().toUpperCase();
  if (newRoll !== roll && db.students.some((s, idx) => idx !== index && s.rollNo.toUpperCase() === newRoll)) {
    return res.status(400).json({ success: false, message: `Roll Number ${newRoll} is already in use by another student!` });
  }

  // Update student fields
  const updatedStudent = {
    ...existing,
    rollNo: newRoll,
    fullName: body.fullName || body.Student_Name || existing.fullName,
    motherName: body.motherName || body.Mother_Name || existing.motherName,
    fatherName: body.fatherName || body.Father_Name || existing.fatherName,
    dob: body.dob || body.Date_Of_Birth || existing.dob,
    gender: body.gender || body.Gender || existing.gender,
    bloodGroup: body.bloodGroup || body.Blood_Group || existing.bloodGroup,
    phone: body.phone || body.Contact || existing.phone,
    email: body.email || body.Email_ID || existing.email,
    address: body.address || body.Address || existing.address,
    aadhaarNo: body.aadhaarNo || body.Aadhaar_No || existing.aadhaarNo,
    samagraId: body.samagraId || body.Samagra_id || existing.samagraId,
    abcId: body.abcId || body.Abc_id || existing.abcId,
    mptassId: body.mptassId || body.MPTass_id || existing.mptassId,
    otrId: body.otrId || body.OTR_id || existing.otrId,
    debId: body.debId || body.Deb_id || existing.debId,
    scholarId: body.scholarId || body.Scholer_id || existing.scholarId,
    userId: body.userId || body.User_id || existing.userId,
    universityName: body.universityName || body.University_Name || existing.universityName,
    collegeName: body.collegeName || body.College_Name || existing.collegeName,
    courseName: body.courseName || body.Course_Name || existing.courseName,
    branch: body.branch || body.Branch || existing.branch,
    courseType: body.courseType || body.Course_Type || existing.courseType,
    courseMode: body.courseMode || body.Course_Mode || existing.courseMode,
    socialCategory: body.socialCategory || body.Social_category || existing.socialCategory,
    currentSession: body.currentSession || body.Current_session || existing.currentSession,
    currentClass: body.currentClass || body.Current_class || existing.currentClass,
    currentSemester: Number(body.currentSemester) || existing.currentSemester,
    manualSemester: body.manualSemester !== undefined ? Number(body.manualSemester) : existing.manualSemester,
    totalFee: body.totalFee !== undefined ? Number(body.totalFee) : existing.totalFee,
    studentFee: body.totalFee !== undefined ? Number(body.totalFee) : (existing.studentFee || existing.totalFee),
    scholarshipAmount: body.scholarshipAmount !== undefined ? Math.max(0, Number(body.scholarshipAmount)) : (existing.scholarshipAmount || 0),
    admissionYear: Number(body.admissionYear) || existing.admissionYear,
    remark: body.remark || body.Remark || existing.remark,
    status: body.status || existing.status || 'Active',
    updatedAt: new Date().toISOString()
  };

  // Re-calculate net fee and balance due considering scholarship
  const schAmt = Number(updatedStudent.scholarshipAmount) || 0;
  updatedStudent.netTotalFee = Math.max(0, (updatedStudent.totalFee || 0) - schAmt);
  updatedStudent.balanceDue = Math.max(0, updatedStudent.netTotalFee - (updatedStudent.totalPaid || 0));

  // If roll number changed, update linked fee_payments and dual references
  if (newRoll !== roll) {
    (db.fee_payments || []).forEach(p => {
      if (p.rollNo && p.rollNo.toUpperCase() === roll) {
        p.rollNo = newRoll;
      }
    });
    db.students.forEach(s => {
      if (s.primaryRollNo && s.primaryRollNo.toUpperCase() === roll) {
        s.primaryRollNo = newRoll;
      }
    });
  }

  // Check if an Additional / Secondary Course is being attached to this student
  let addedSecondaryStudent = null;
  if (body.additionalCourse && typeof body.additionalCourse === 'object') {
    const sec = body.additionalCourse;
    const secCourseName = (sec.courseName || sec.Course_Name || sec.branch || '').trim();
    if (secCourseName) {
      const baseRoll = (updatedStudent.primaryRollNo || updatedStudent.rollNo || roll).trim().toUpperCase();
      const secUnivName = (sec.universityName || sec.University_Name || updatedStudent.universityName || 'University').trim();
      const secCollegeName = (sec.collegeName || sec.College_Name || updatedStudent.collegeName || 'College').trim();
      const secCourseType = sec.courseType || sec.Course_Type || 'Diploma';
      const secBranch = sec.branch || sec.Branch || 'General';
      const secCode = (secBranch !== 'General' ? secBranch : secCourseName).replace(/[^a-zA-Z0-9]/g, '').slice(0, 5).toUpperCase() || 'PROG';

      let secCandidateRoll = `${baseRoll}-${secCode}`;
      let counter = 2;
      while (db.students.some(s => s.rollNo.toUpperCase() === secCandidateRoll.toUpperCase())) {
        secCandidateRoll = `${baseRoll}-${secCode}${counter++}`;
      }

      const secCourseFee = Number(sec.totalFee || sec.studentFee || sec.courseFee || 0);
      const secAdmissionFee = Number(sec.admissionFee || 0);
      const secGrandTotal = secCourseFee + secAdmissionFee;
      const secScholarship = Number(sec.scholarshipAmount) || 0;
      const secPaid = Number(sec.initialPayment || sec.initialPaid || sec.totalPaid || 0);
      const secNetTotal = Math.max(0, secGrandTotal - secScholarship);
      const secBalanceDue = Math.max(0, secNetTotal - secPaid);

      const admissionDate = sec.admissionDate || new Date().toISOString().split('T')[0];
      const admissionYear = Number(sec.admissionYear) || new Date(admissionDate).getFullYear() || 2026;

      addedSecondaryStudent = {
        ...updatedStudent,
        id: 'std-' + (Date.now() + 1),
        rollNo: secCandidateRoll,
        registrationNo: `${secUnivName.slice(0, 3).toUpperCase()}-${admissionYear}-${Math.floor(1000 + Math.random() * 9000)}`,
        universityName: secUnivName,
        collegeName: secCollegeName,
        courseName: secCourseName,
        branch: secBranch,
        courseType: secCourseType,
        courseMode: sec.courseMode || 'Regular',
        currentClass: sec.currentClass || `SEM-${sec.currentSemester || 1}`,
        currentSemester: Number(sec.currentSemester) || 1,
        studentFee: secCourseFee,
        courseFee: secCourseFee,
        admissionFee: secAdmissionFee,
        totalFee: secGrandTotal,
        scholarshipAmount: secScholarship,
        netTotalFee: secNetTotal,
        totalPaid: secPaid,
        balanceDue: secBalanceDue,
        admissionDate: admissionDate,
        admissionYear: admissionYear,
        admissionTimestamp: new Date(admissionDate).toISOString(),
        isDualEnrollment: true,
        isSecondaryCourse: true,
        primaryRollNo: baseRoll,
        primaryStudentId: updatedStudent.primaryStudentId || updatedStudent.id,
        dualProgramType: `${secCourseType} / 2nd Program`,
        status: 'Active',
        remark: sec.remark || '',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      updatedStudent.isDualEnrollment = true;

      // Mark primary base student as isDualEnrollment: true if updatedStudent was secondary
      if (updatedStudent.primaryRollNo) {
        const baseStd = db.students.find(s => s.rollNo.toUpperCase() === updatedStudent.primaryRollNo.toUpperCase());
        if (baseStd) baseStd.isDualEnrollment = true;
      }

      db.students.push(addedSecondaryStudent);

      if (secPaid > 0) {
        const secReceiptNo = String(getNextReceiptNumber(db));
        const receipt = {
          id: 'RCP-' + Date.now(),
          receiptNo: secReceiptNo,
          studentId: addedSecondaryStudent.id,
          rollNo: addedSecondaryStudent.rollNo,
          studentName: addedSecondaryStudent.fullName,
          courseName: addedSecondaryStudent.courseName,
          universityName: addedSecondaryStudent.universityName,
          collegeName: addedSecondaryStudent.collegeName,
          amountPaid: secPaid,
          amount: secPaid,
          paymentMode: sec.paymentMode || 'Cash',
          referenceNo: sec.transactionId || `PAY-${Date.now().toString().slice(-6)}`,
          paymentType: 'Additional Course Admission Fee',
          paymentDate: new Date().toISOString(),
          totalFee: secGrandTotal,
          totalPaidToDate: secPaid,
          balanceRemaining: secBalanceDue,
          receivedBy: body.operatorName || 'Admin'
        };
        if (!Array.isArray(db.fee_payments)) db.fee_payments = [];
        db.fee_payments.unshift(receipt);
      }
    }
  }

  db.students[index] = updatedStudent;
  writeDB(db);

  res.json({
    success: true,
    message: addedSecondaryStudent
      ? `Student updated and additional course (${addedSecondaryStudent.courseName}) added successfully!`
      : 'Student details updated successfully!',
    student: updatedStudent,
    addedSecondaryStudent
  });
});

// Dedicated endpoint to attach an additional / dual course to an existing student
app.post('/api/students/:rollNo/add-course', (req, res) => {
  const db = readDB();
  const roll = req.params.rollNo.toUpperCase();
  const existing = db.students.find(s => s.rollNo.toUpperCase() === roll);

  if (!existing) {
    return res.status(404).json({ success: false, message: 'Student not found' });
  }

  const sec = req.body;
  const secCourseName = (sec.courseName || sec.Course_Name || sec.branch || '').trim();
  if (!secCourseName) {
    return res.status(400).json({ success: false, message: 'Course name is required' });
  }

  const baseRoll = (existing.primaryRollNo || existing.rollNo).trim().toUpperCase();
  const secUnivName = (sec.universityName || sec.University_Name || existing.universityName || 'University').trim();
  const secCollegeName = (sec.collegeName || sec.College_Name || existing.collegeName || 'College').trim();
  const secCourseType = sec.courseType || sec.Course_Type || 'Diploma';
  const secBranch = sec.branch || sec.Branch || 'General';
  const secCode = (secBranch !== 'General' ? secBranch : secCourseName).replace(/[^a-zA-Z0-9]/g, '').slice(0, 5).toUpperCase() || 'PROG';

  let secCandidateRoll = `${baseRoll}-${secCode}`;
  let counter = 2;
  while (db.students.some(s => s.rollNo.toUpperCase() === secCandidateRoll.toUpperCase())) {
    secCandidateRoll = `${baseRoll}-${secCode}${counter++}`;
  }

  const secCourseFee = Number(sec.totalFee || sec.studentFee || sec.courseFee || 0);
  const secAdmissionFee = Number(sec.admissionFee || 0);
  const secGrandTotal = secCourseFee + secAdmissionFee;
  const secScholarship = Number(sec.scholarshipAmount) || 0;
  const secPaid = Number(sec.initialPayment || sec.initialPaid || sec.totalPaid || 0);
  const secNetTotal = Math.max(0, secGrandTotal - secScholarship);
  const secBalanceDue = Math.max(0, secNetTotal - secPaid);

  const admissionDate = sec.admissionDate || new Date().toISOString().split('T')[0];
  const admissionYear = Number(sec.admissionYear) || new Date(admissionDate).getFullYear() || 2026;

  const addedSecondaryStudent = {
    ...existing,
    id: 'std-' + (Date.now() + 1),
    rollNo: secCandidateRoll,
    registrationNo: `${secUnivName.slice(0, 3).toUpperCase()}-${admissionYear}-${Math.floor(1000 + Math.random() * 9000)}`,
    universityName: secUnivName,
    collegeName: secCollegeName,
    courseName: secCourseName,
    branch: secBranch,
    courseType: secCourseType,
    courseMode: sec.courseMode || 'Regular',
    currentClass: sec.currentClass || `SEM-${sec.currentSemester || 1}`,
    currentSemester: Number(sec.currentSemester) || 1,
    studentFee: secCourseFee,
    courseFee: secCourseFee,
    admissionFee: secAdmissionFee,
    totalFee: secGrandTotal,
    scholarshipAmount: secScholarship,
    netTotalFee: secNetTotal,
    totalPaid: secPaid,
    balanceDue: secBalanceDue,
    admissionDate: admissionDate,
    admissionYear: admissionYear,
    admissionTimestamp: new Date(admissionDate).toISOString(),
    isDualEnrollment: true,
    isSecondaryCourse: true,
    primaryRollNo: baseRoll,
    primaryStudentId: existing.primaryStudentId || existing.id,
    dualProgramType: `${secCourseType} / 2nd Program`,
    status: 'Active',
    remark: sec.remark || '',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  existing.isDualEnrollment = true;
  if (existing.primaryRollNo) {
    const baseStd = db.students.find(s => s.rollNo.toUpperCase() === existing.primaryRollNo.toUpperCase());
    if (baseStd) baseStd.isDualEnrollment = true;
  }

  db.students.push(addedSecondaryStudent);

  if (secPaid > 0) {
    const secReceiptNo = String(getNextReceiptNumber(db));
    const receipt = {
      id: 'RCP-' + Date.now(),
      receiptNo: secReceiptNo,
      studentId: addedSecondaryStudent.id,
      rollNo: addedSecondaryStudent.rollNo,
      studentName: addedSecondaryStudent.fullName,
      courseName: addedSecondaryStudent.courseName,
      universityName: addedSecondaryStudent.universityName,
      collegeName: addedSecondaryStudent.collegeName,
      amountPaid: secPaid,
      amount: secPaid,
      paymentMode: sec.paymentMode || 'Cash',
      referenceNo: sec.transactionId || `PAY-${Date.now().toString().slice(-6)}`,
      paymentType: 'Additional Course Admission Fee',
      paymentDate: new Date().toISOString(),
      totalFee: secGrandTotal,
      totalPaidToDate: secPaid,
      balanceRemaining: secBalanceDue,
      receivedBy: sec.operatorName || 'Admin'
    };
    if (!Array.isArray(db.fee_payments)) db.fee_payments = [];
    db.fee_payments.unshift(receipt);
  }

  writeDB(db);

  res.json({
    success: true,
    message: `Additional course (${addedSecondaryStudent.courseName}) added successfully!`,
    secondaryStudent: addedSecondaryStudent
  });
});

// Manual Semester / Year Promotion Endpoint
app.put('/api/students/:rollNo/promote', (req, res) => {
  const db = readDB();
  const roll = req.params.rollNo.toUpperCase();
  const student = db.students.find(s => s.rollNo.toUpperCase() === roll);

  if (!student) {
    return res.status(404).json({ success: false, message: 'Student not found' });
  }

  const { targetSemester, targetClass, remark } = req.body;
  const currentSem = Number(student.currentSemester) || 1;
  const nextSem = targetSemester !== undefined ? Number(targetSemester) : currentSem + 1;
  const nextClass = targetClass || `SEM-${nextSem}`;

  student.currentSemester = nextSem;
  student.currentClass = nextClass;
  student.manualSemester = nextSem;
  student.manualPromotion = true;
  student.promotedAt = new Date().toISOString();

  if (!Array.isArray(student.semesterHistory)) {
    student.semesterHistory = [];
  }
  student.semesterHistory.push({
    fromSemester: currentSem,
    toSemester: nextSem,
    className: nextClass,
    promotedAt: new Date().toISOString(),
    remark: remark || 'Admin manual semester promotion'
  });

  writeDB(db);

  res.json({
    success: true,
    message: `Student ${student.fullName} promoted to ${nextClass} successfully!`,
    student: {
      rollNo: student.rollNo,
      currentSemester: student.currentSemester,
      currentClass: student.currentClass,
      promotedAt: student.promotedAt
    }
  });
});

// Set Student Fee (Academic Fee & Remark)
app.put('/api/students/:rollNo/set-fee', (req, res) => {
  const db = readDB();
  const roll = req.params.rollNo.toUpperCase();
  const student = db.students.find(s => s.rollNo.toUpperCase() === roll);

  if (!student) {
    return res.status(404).json({ success: false, message: 'Student not found' });
  }

  const { academicFee, remark } = req.body;
  const acadFee = Number(academicFee) >= 0 ? Number(academicFee) : 0;
  student.academicFee = acadFee;
  student.studentFee = acadFee;
  student.courseFee = acadFee;
  if (remark !== undefined) {
    student.remark = remark;
  }

  const sch = Number(student.scholarshipAmount) || 0;
  student.totalFee = acadFee + sch;
  student.netTotalFee = student.totalFee;
  student.balanceDue = Math.max(0, student.totalFee - (Number(student.totalPaid) || 0));
  student.updatedAt = new Date().toISOString();

  writeDB(db);

  res.json({
    success: true,
    message: `Academic fee for ${student.fullName || student.rollNo} set to ₹${acadFee.toLocaleString('en-IN')}`,
    student
  });
});

// Set Student Scholarship
app.put('/api/students/:rollNo/set-scholarship', (req, res) => {
  const db = readDB();
  const roll = req.params.rollNo.toUpperCase();
  const student = db.students.find(s => s.rollNo.toUpperCase() === roll);

  if (!student) {
    return res.status(404).json({ success: false, message: 'Student not found' });
  }

  const { scholarshipAmount } = req.body;
  const sch = Math.max(0, Number(scholarshipAmount) || 0);
  student.scholarshipAmount = sch;

  const acadFee = Number(student.academicFee !== undefined ? student.academicFee : (student.studentFee || 0));
  student.totalFee = acadFee + sch;
  student.netTotalFee = student.totalFee;
  student.balanceDue = Math.max(0, student.totalFee - (Number(student.totalPaid) || 0));
  student.updatedAt = new Date().toISOString();

  writeDB(db);

  res.json({
    success: true,
    message: `Scholarship for ${student.fullName || student.rollNo} set to ₹${sch.toLocaleString('en-IN')}`,
    student
  });
});

// Receive Student Fee
app.post('/api/students/:rollNo/receive-fee', (req, res) => {
  const db = readDB();
  const roll = req.params.rollNo.toUpperCase();
  const student = db.students.find(s => s.rollNo.toUpperCase() === roll);

  if (!student) {
    return res.status(404).json({ success: false, message: 'Student not found' });
  }

  const { amount, paymentMode, receiptNo, remark, receivedBy, feeDate, purpose, currentClass, refNo } = req.body;
  const payAmt = Number(amount);

  if (!payAmt || payAmt <= 0) {
    return res.status(400).json({ success: false, message: 'Please provide a valid fee payment amount.' });
  }

  const newTotalPaid = (Number(student.totalPaid) || 0) + payAmt;
  const totalFee = Number(student.totalFee) || 0;
  const newBalance = Math.max(0, totalFee - newTotalPaid);

  student.totalPaid = newTotalPaid;
  student.balanceDue = newBalance;
  if (currentClass) {
    student.currentClass = currentClass;
  }
  if (remark) {
    student.remark = remark;
  }
  student.updatedAt = new Date().toISOString();

  const rNo = receiptNo && String(receiptNo).trim() 
    ? String(receiptNo).trim() 
    : String(getNextReceiptNumber(db));

  const pDate = feeDate ? new Date(feeDate).toISOString() : new Date().toISOString();

  const receipt = {
    id: `pay-${Date.now()}`,
    receiptNo: rNo,
    studentId: student.id,
    rollNo: student.rollNo,
    studentName: student.fullName || student.studentName,
    fatherName: student.fatherName || '',
    collegeName: student.collegeName || '',
    universityName: student.universityName || '',
    courseName: student.courseName || '',
    branch: student.branch || 'General',
    currentSemester: student.currentSemester || 1,
    currentClass: currentClass || student.currentClass || 'SEM-1',
    amountPaid: payAmt,
    paymentMode: paymentMode || 'Cash',
    feeType: purpose || 'Tuition / Academic Fee Payment',
    purpose: purpose || 'Tuition Fee',
    paymentDate: pDate,
    feeDate: feeDate || pDate.split('T')[0],
    transactionRef: refNo || '',
    refNo: refNo || '',
    totalFee: totalFee,
    totalPaidToDate: newTotalPaid,
    balanceRemaining: newBalance,
    remainingDues: newBalance,
    remark: remark || '',
    receivedBy: receivedBy || 'Admin Desk'
  };

  if (!Array.isArray(db.fee_payments)) db.fee_payments = [];
  db.fee_payments.unshift(receipt);

  writeDB(db);

  // Return all payments for this student so frontend can update immediately
  const studentPayments = db.fee_payments.filter(p => p.rollNo.toUpperCase() === student.rollNo.toUpperCase());

  res.status(201).json({
    success: true,
    message: `Payment of ₹${payAmt.toLocaleString('en-IN')} received successfully!`,
    student,
    receipt,
    payments: studentPayments
  });
});

app.delete('/api/students/:rollNo', (req, res) => {
  const db = readDB();
  const roll = req.params.rollNo.toUpperCase();
  const index = db.students.findIndex(s => s.rollNo.toUpperCase() === roll);

  if (index === -1) {
    return res.status(404).json({ success: false, message: 'Student not found' });
  }

  const deleted = db.students.splice(index, 1)[0];

  // If deleting a primary course, also delete its attached secondary dual course:
  if (!deleted.primaryRollNo) {
    db.students = db.students.filter(s => s.primaryRollNo?.toUpperCase() !== roll && s.primaryStudentId !== deleted.id);
  }

  writeDB(db);
  res.json({ success: true, message: 'Student removed successfully', student: deleted });
});

// ----------------------------------------------------
// 4. FEES & CASH COUNTER TRANSACTIONS
// ----------------------------------------------------
app.get('/api/fees/stats', (req, res) => {
  const db = readDB();
  const totalStudents = db.students.length;
  const totalExpectedFee = db.students.reduce((acc, s) => acc + (s.totalFee || 0), 0);
  const totalCollectedFee = db.students.reduce((acc, s) => acc + (s.totalPaid || 0), 0);
  const totalBalanceDue = totalExpectedFee - totalCollectedFee;
  const fullyPaidCount = db.students.filter(s => s.balanceDue <= 0).length;
  const partialPaidCount = db.students.filter(s => s.totalPaid > 0 && s.balanceDue > 0).length;
  const unpaidCount = db.students.filter(s => s.totalPaid === 0).length;

  // Breakdown by payment modes
  const cashTotal = (db.fee_payments || []).filter(p => p.paymentMode?.toLowerCase().includes('cash')).reduce((acc, p) => acc + p.amountPaid, 0);
  const cardTotal = (db.fee_payments || []).filter(p => p.paymentMode?.toLowerCase().includes('card')).reduce((acc, p) => acc + p.amountPaid, 0);
  const onlineTotal = (db.fee_payments || []).filter(p => !p.paymentMode?.toLowerCase().includes('cash') && !p.paymentMode?.toLowerCase().includes('card')).reduce((acc, p) => acc + p.amountPaid, 0);

  res.json({
    success: true,
    stats: {
      totalStudents,
      totalExpectedFee,
      totalCollectedFee,
      totalBalanceDue,
      fullyPaidCount,
      partialPaidCount,
      unpaidCount,
      cashTotal,
      cardTotal,
      onlineTotal,
      recentPayments: db.fee_payments.slice(0, 15)
    }
  });
});

// Helper for parsing payment date reliably
function parsePaymentDate(p) {
  if (p.paymentDate) {
    const d = new Date(p.paymentDate);
    if (!isNaN(d.getTime())) return d;
  }
  if (p.createdAt) {
    const d = new Date(p.createdAt);
    if (!isNaN(d.getTime())) return d;
  }
  if (p.id && typeof p.id === 'string' && p.id.startsWith('pay-')) {
    const ts = parseInt(p.id.replace('pay-', ''), 10);
    if (!isNaN(ts)) return new Date(ts);
  }
  return new Date();
}

// 4.1 TIMEFRAME FEE COLLECTIONS & PAYING STUDENTS DIRECTORY
// Filter collections by: 'all', 'week', 'this_month', 'last_month', 'year'
app.get('/api/fees/payments', (req, res) => {
  const db = readDB();
  const { timeframe = 'all', search } = req.query;
  const now = new Date();
  const allPayments = db.fee_payments || [];

  // Summary counts and amounts across all timeframes for instant analytics
  const weekPayments = allPayments.filter(p => isDateInTimeframe(parsePaymentDate(p), 'week', now));
  const thisMonthPayments = allPayments.filter(p => isDateInTimeframe(parsePaymentDate(p), 'this_month', now));
  const lastMonthPayments = allPayments.filter(p => isDateInTimeframe(parsePaymentDate(p), 'last_month', now));
  const yearPayments = allPayments.filter(p => isDateInTimeframe(parsePaymentDate(p), 'year', now));

  const summary = {
    allTime: {
      totalAmount: allPayments.reduce((acc, p) => acc + (p.amountPaid || 0), 0),
      count: allPayments.length,
      studentsCount: new Set(allPayments.map(p => p.rollNo)).size
    },
    week: {
      totalAmount: weekPayments.reduce((acc, p) => acc + (p.amountPaid || 0), 0),
      count: weekPayments.length,
      studentsCount: new Set(weekPayments.map(p => p.rollNo)).size
    },
    this_month: {
      totalAmount: thisMonthPayments.reduce((acc, p) => acc + (p.amountPaid || 0), 0),
      count: thisMonthPayments.length,
      studentsCount: new Set(thisMonthPayments.map(p => p.rollNo)).size
    },
    last_month: {
      totalAmount: lastMonthPayments.reduce((acc, p) => acc + (p.amountPaid || 0), 0),
      count: lastMonthPayments.length,
      studentsCount: new Set(lastMonthPayments.map(p => p.rollNo)).size
    },
    year: {
      totalAmount: yearPayments.reduce((acc, p) => acc + (p.amountPaid || 0), 0),
      count: yearPayments.length,
      studentsCount: new Set(yearPayments.map(p => p.rollNo)).size
    }
  };

  let filtered = [...allPayments];
  if (timeframe && timeframe !== 'all') {
    filtered = filtered.filter(p => isDateInTimeframe(parsePaymentDate(p), timeframe, now));
  }

  if (search) {
    const q = search.trim().toLowerCase();
    filtered = filtered.filter(p => 
      p.studentName?.toLowerCase().includes(q) ||
      p.rollNo?.toLowerCase().includes(q) ||
      p.receiptNo?.toLowerCase().includes(q) ||
      p.transactionRef?.toLowerCase().includes(q) ||
      p.paymentMode?.toLowerCase().includes(q) ||
      p.courseName?.toLowerCase().includes(q) ||
      p.paidFor?.toLowerCase().includes(q) ||
      p.receivedBy?.toLowerCase().includes(q)
    );
  }

  const totalCollected = filtered.reduce((acc, p) => acc + (p.amountPaid || 0), 0);
  const uniqueStudents = Array.from(new Set(filtered.map(p => p.rollNo)));

  res.json({
    success: true,
    timeframe,
    totalCollected,
    transactionCount: filtered.length,
    uniqueStudentsCount: uniqueStudents.length,
    payments: filtered,
    summary
  });
});

// Helper to get next sequential receipt number (starts from 101 by default, increments automatically)
function getNextReceiptNumber(db) {
  const payments = db.fee_payments || [];
  let maxNum = 100; // Defaults to 100 so first receipt starts at 101
  for (const p of payments) {
    if (!p || !p.receiptNo) continue;
    const str = String(p.receiptNo).trim();
    if (/^\d+$/.test(str)) {
      const n = parseInt(str, 10);
      if (n >= 101 && n < 10000000) {
        if (n > maxNum) maxNum = n;
      }
    } else {
      const match = str.match(/(?:^|[^\d])(\d{3,7})$/);
      if (match) {
        const n = parseInt(match[1], 10);
        if (n >= 101 && n < 10000000 && n !== 2024 && n !== 2025 && n !== 2026 && n !== 2027) {
          if (n > maxNum) maxNum = n;
        }
      }
    }
  }
  return maxNum + 1;
}

// Get Next Sequential Receipt Number
app.get('/api/fees/next-receipt', (req, res) => {
  try {
    const db = readDB();
    const nextReceiptNo = String(getNextReceiptNumber(db));
    res.json({ success: true, nextReceiptNo });
  } catch (err) {
    res.status(500).json({ success: false, nextReceiptNo: '101' });
  }
});

// Helper to dynamically calculate semester progression across any program (8 sem, 6 sem, diploma, etc.)
function computeStudentSemesterProgress(student, courses = []) {
  const course = (courses || []).find(c => c.id === student.courseId || c.name?.toLowerCase() === student.courseName?.toLowerCase()) || {};
  
  let totalSemesters = Number(course.totalSemesters) || (Number(course.durationYears) ? Number(course.durationYears) * 2 : 6);
  if (student.courseName?.toLowerCase().includes('b.tech') || student.courseName?.toLowerCase().includes('engineering')) {
    totalSemesters = totalSemesters || 8;
  } else if (student.courseName?.toLowerCase().includes('diploma') && student.courseName?.toLowerCase().includes('pg')) {
    totalSemesters = totalSemesters || 2;
  }
  totalSemesters = Math.max(1, totalSemesters);

  const durationYears = Number(course.durationYears) || Math.round(totalSemesters / 2) || 3;
  const scholarship = Number(student.scholarshipAmount) || 0;
  const rawTotalFee = Number(student.studentFee || student.totalFee || course.totalFee || 100000);
  const totalFee = Math.max(0, rawTotalFee - scholarship);
  const feePerSemester = Number(course.feePerSemester) || Math.max(1, Math.round(totalFee / totalSemesters));
  const totalPaid = Number(student.totalPaid || 0);

  // How many semesters have been fully cleared:
  const clearedSemesters = Math.min(totalSemesters, Math.floor(totalPaid / feePerSemester));
  
  // Admin manual promotion has highest precedence
  let currentSemester = 1;
  if (student.manualSemester !== undefined && student.manualSemester !== null) {
    currentSemester = Math.max(1, Number(student.manualSemester));
  } else if (student.currentSemester) {
    currentSemester = Math.max(1, Number(student.currentSemester));
  } else if (totalPaid >= totalFee || clearedSemesters >= totalSemesters) {
    currentSemester = totalSemesters;
  } else {
    currentSemester = Math.min(totalSemesters, clearedSemesters + 1);
  }
  const currentClass = student.currentClass || `SEM-${currentSemester}`;

  // Amount paid towards current semester & remaining due for current semester
  let currentSemesterPaid = 0;
  let currentSemesterDue = 0;

  // Fee threshold needed to cover up to currentSemester
  const feeNeededUpToCurrentSem = currentSemester * feePerSemester;
  if (totalPaid >= feeNeededUpToCurrentSem || totalPaid >= totalFee) {
    currentSemesterPaid = feePerSemester;
    currentSemesterDue = 0;
  } else {
    const paidInPrevSems = Math.max(0, (currentSemester - 1) * feePerSemester);
    currentSemesterPaid = Math.max(0, totalPaid - paidInPrevSems);
    currentSemesterDue = Math.max(0, feePerSemester - currentSemesterPaid);
  }

  let semesterFeeStatus = '';
  if (totalPaid >= totalFee) {
    semesterFeeStatus = 'All Semesters Paid (Fully Paid)';
  } else if (currentSemesterDue === 0) {
    semesterFeeStatus = `Sem ${currentSemester} Fully Paid`;
  } else if (clearedSemesters > 0) {
    semesterFeeStatus = `Sem 1-${clearedSemesters} Paid • Sem ${currentSemester} Due (₹${currentSemesterDue.toLocaleString('en-IN')})`;
  } else {
    semesterFeeStatus = `Sem ${currentSemester} Due (₹${currentSemesterDue.toLocaleString('en-IN')})`;
  }

  return {
    totalSemesters,
    durationYears,
    feePerSemester,
    clearedSemesters,
    currentSemester,
    currentClass,
    currentSemesterPaid,
    currentSemesterDue,
    semesterFeeStatus
  };
}

app.get('/api/fees/ledger', (req, res) => {
  const db = readDB();
  const { search, status, course, dueFilter = 'all', university } = req.query;

  let ledger = db.students.map(s => {
    let feeStatus = 'Unpaid';
    if (s.totalPaid >= s.totalFee) feeStatus = 'Fully Paid';
    else if (s.totalPaid > 0) feeStatus = 'Partial';

    const prog = computeStudentSemesterProgress(s, db.courses);

    // Keep student currentSemester and currentClass synced in memory & record
    s.currentSemester = prog.currentSemester;
    s.currentClass = prog.currentClass;

    return {
      id: s.id,
      rollNo: s.rollNo,
      registrationNo: s.registrationNo,
      fullName: s.fullName,
      phone: s.phone,
      email: s.email,
      collegeName: s.collegeName || 'Govt PG College / PKC Learning Institute',
      universityName: s.universityName || 'Barkatullah University / State University',
      courseName: s.courseName,
      courseType: s.courseType || (s.courseName?.toLowerCase().includes('diploma') || s.courseName?.toLowerCase().includes('dca') ? 'Diploma' : 'Degree'),
      branch: s.branch || 'General',
      currentSemester: prog.currentSemester,
      currentClass: prog.currentClass,
      totalSemesters: prog.totalSemesters,
      durationYears: prog.durationYears,
      feePerSemester: prog.feePerSemester,
      clearedSemesters: prog.clearedSemesters,
      currentSemesterPaid: prog.currentSemesterPaid,
      currentSemesterDue: prog.currentSemesterDue,
      semesterFeeStatus: prog.semesterFeeStatus,
      totalFee: s.totalFee || 0,
      scholarshipAmount: s.scholarshipAmount || 0,
      netTotalFee: Math.max(0, (s.totalFee || 0) - (s.scholarshipAmount || 0)),
      totalPaid: s.totalPaid || 0,
      balanceDue: Math.max(0, Math.max(0, (s.totalFee || 0) - (s.scholarshipAmount || 0)) - (s.totalPaid || 0)),
      feeStatus: feeStatus,
      lastPaymentDate: s.admissionDate,
      fatherName: s.fatherName || s.father_name || '',
      aadhaarNo: s.aadhaarNo || s.aadharNo || s.aadhar || '',
      documentsStatus: s.documentsStatus || {},
      documentSubmit: s.documentSubmit || [],
      isDualEnrollment: s.isDualEnrollment || false,
      primaryRollNo: s.primaryRollNo || null,
      primaryStudentId: s.primaryStudentId || null
    };
  });

  // Attach linked courses for dual enrollment across the full student ledger
  ledger = ledger.map(s => {
    const linked = ledger.filter(other => isSameStudent(s, other));
    linked.sort(compareCourseEnrollmentOrder);
    return {
      ...s,
      isDualEnrolled: linked.length > 0,
      dualEnrollmentCount: linked.length + 1,
      linkedCourses: linked.map(l => ({
        id: l.id,
        rollNo: l.rollNo,
        registrationNo: l.registrationNo,
        fullName: l.fullName,
        courseName: l.courseName,
        courseType: l.courseType || (l.courseName?.toLowerCase().includes('diploma') || l.courseName?.toLowerCase().includes('dca') ? 'Diploma' : 'Degree'),
        branch: l.branch || 'General',
        collegeName: l.collegeName,
        universityName: l.universityName,
        currentSemester: l.currentSemester,
        currentClass: l.currentClass,
        totalSemesters: l.totalSemesters,
        durationYears: l.durationYears,
        feePerSemester: l.feePerSemester,
        clearedSemesters: l.clearedSemesters,
        currentSemesterPaid: l.currentSemesterPaid,
        currentSemesterDue: l.currentSemesterDue,
        semesterFeeStatus: l.semesterFeeStatus,
        totalFee: l.totalFee,
        scholarshipAmount: l.scholarshipAmount || 0,
        netTotalFee: l.netTotalFee || Math.max(0, (l.totalFee || 0) - (l.scholarshipAmount || 0)),
        totalPaid: l.totalPaid,
        balanceDue: l.balanceDue,
        feeStatus: l.feeStatus,
        lastPaymentDate: l.lastPaymentDate
      }))
    };
  });

  if (university && university !== 'all') {
    ledger = ledger.filter(s => s.universityName?.toLowerCase().includes(university.toLowerCase()));
  }
  if (course && course !== 'all') {
    ledger = ledger.filter(s => s.courseName?.toLowerCase().includes(course.toLowerCase()));
  }
  if (status && status !== 'all') {
    ledger = ledger.filter(s => s.feeStatus.toLowerCase() === status.toLowerCase());
  }
  if (dueFilter === 'due_only') {
    ledger = ledger.filter(s => s.balanceDue > 0);
  } else if (dueFilter === 'sem_due_only') {
    ledger = ledger.filter(s => s.currentSemesterDue > 0);
  } else if (dueFilter === 'cleared') {
    ledger = ledger.filter(s => s.balanceDue <= 0);
  }
  if (search) {
    const q = search.trim().toLowerCase();
    const cleanNum = q.replace(/[\s-]/g, '');
    ledger = ledger.filter(s => {
      const basicMatch = 
        s.fullName?.toLowerCase().includes(q) ||
        s.rollNo?.toLowerCase().includes(q) ||
        s.registrationNo?.toLowerCase().includes(q) ||
        s.fatherName?.toLowerCase().includes(q) ||
        (s.aadhaarNo && (s.aadhaarNo.toLowerCase().includes(q) || (cleanNum && cleanNum.length >= 3 && s.aadhaarNo.replace(/[\s-]/g, '').includes(cleanNum)))) ||
        (s.phone && (s.phone.includes(q) || (cleanNum && cleanNum.length >= 3 && s.phone.replace(/[\s-]/g, '').includes(cleanNum)))) ||
        (q.includes('@') && s.email?.toLowerCase().includes(q)) ||
        s.courseName?.toLowerCase().includes(q);

      // Search across linked dual enrollments
      const linkedMatch = s.linkedCourses && s.linkedCourses.some(l => 
        l.courseName?.toLowerCase().includes(q) ||
        l.rollNo?.toLowerCase().includes(q) ||
        l.registrationNo?.toLowerCase().includes(q)
      );

      return basicMatch || linkedMatch;
    });
  }

  const totalBalanceDue = ledger.reduce((acc, s) => acc + (s.balanceDue || 0), 0);
  const totalSemesterDue = ledger.reduce((acc, s) => acc + (s.currentSemesterDue || 0), 0);
  const dueStudentsCount = ledger.filter(s => s.balanceDue > 0).length;
  const nextReceiptNo = String(getNextReceiptNumber(db));

  res.json({
    success: true,
    ledger,
    nextReceiptNo,
    summary: {
      totalStudents: ledger.length,
      dueStudentsCount,
      totalBalanceDue,
      totalSemesterDue,
      nextReceiptNo
    }
  });
});

// Record Fee Payment (Cash Counter or Online Portal)
app.post('/api/fees/pay', (req, res) => {
  try {
    const db = readDB();
    const { rollNo, amount, paymentMode, transactionRef, paidFor, feeType, receivedBy, receiptNo: customReceiptNo } = req.body;

    if (!rollNo || !amount || Number(amount) <= 0) {
      return res.status(400).json({ success: false, message: 'Please provide valid Roll No and payment amount.' });
    }

    const roll = rollNo.trim().toUpperCase();
    const studentIndex = db.students.findIndex(s => s.rollNo.toUpperCase() === roll);

    if (studentIndex === -1) {
      return res.status(404).json({ success: false, message: `No student found with Roll Number ${roll}` });
    }

    const student = db.students[studentIndex];
    const amountNum = Number(amount);
    const newTotalPaid = (student.totalPaid || 0) + amountNum;
    const newBalance = Math.max(0, (student.totalFee || 0) - newTotalPaid);

    student.totalPaid = newTotalPaid;
    student.balanceDue = newBalance;

    // Recalculate progressive semester promotion!
    const prog = computeStudentSemesterProgress(student, db.courses);
    student.currentSemester = prog.currentSemester;
    student.currentClass = prog.currentClass;

    const receiptNo = customReceiptNo && String(customReceiptNo).trim()
      ? String(customReceiptNo).trim()
      : String(getNextReceiptNumber(db));

    const newPayment = {
      id: `pay-${Date.now()}`,
      receiptNo: receiptNo,
      studentId: student.id,
      rollNo: student.rollNo,
      studentName: student.fullName,
      collegeName: student.collegeName || 'PKC Education Learning Institute',
      universityName: student.universityName || 'State University',
      courseName: student.courseName,
      branch: student.branch || 'General',
      currentSemester: prog.currentSemester,
      currentClass: prog.currentClass,
      clearedSemesters: prog.clearedSemesters,
      amountPaid: amountNum,
      paymentMode: paymentMode || 'Cash', // Cash, Card POS, UPI Online
      feeType: feeType || 'Tuition / Semester Fee',
      transactionRef: transactionRef || `TXN-${Math.floor(100000 + Math.random() * 900000)}`,
      paidFor: paidFor || `Semester ${prog.currentSemester} Tuition Fee`,
      paymentDate: new Date().toISOString(),
      totalFee: student.totalFee,
      totalPaidToDate: newTotalPaid,
      balanceRemaining: newBalance,
      remainingDues: newBalance,
      totalSemesters: prog.totalSemesters,
      semesterFeeStatus: prog.semesterFeeStatus,
      receivedBy: receivedBy || 'Campus Cash Counter'
    };

    db.fee_payments.unshift(newPayment);
    writeDB(db);

    res.status(201).json({
      success: true,
      message: 'Fee payment recorded successfully!',
      receipt: newPayment,
      student: student,
      progress: prog
    });
  } catch (err) {
    console.error('Error recording fee:', err);
    res.status(500).json({ success: false, message: 'Internal Server Error: ' + err.message });
  }
});

// Admin Fee Adjustment & Correction (To fix cashier entry mistakes and apply student scholarship deductions)
app.put('/api/fees/student/:rollNo/adjust', (req, res) => {
  try {
    const { rollNo } = req.params;
    const { totalFee, totalPaid, scholarshipAmount, adjustmentReason, adminUser } = req.body;
    const db = readDB();

    const roll = rollNo.trim().toUpperCase();
    const student = db.students.find(s => s.rollNo.toUpperCase() === roll);
    if (!student) {
      return res.status(404).json({ success: false, message: `Student with Roll Number "${roll}" not found.` });
    }

    const oldTotalFee = Number(student.totalFee) || 0;
    const oldTotalPaid = Number(student.totalPaid) || 0;
    const oldScholarship = Number(student.scholarshipAmount) || 0;

    const newTotalFee = totalFee !== undefined && totalFee !== '' ? Math.max(0, Number(totalFee)) : oldTotalFee;
    const newTotalPaid = totalPaid !== undefined && totalPaid !== '' ? Math.max(0, Number(totalPaid)) : oldTotalPaid;
    const newScholarship = scholarshipAmount !== undefined && scholarshipAmount !== '' ? Math.max(0, Number(scholarshipAmount)) : oldScholarship;

    // Net fee payable after subtracting scholarship from total fee
    const netFee = Math.max(0, newTotalFee - newScholarship);
    const newBalance = Math.max(0, netFee - newTotalPaid);

    student.totalFee = newTotalFee;
    student.studentFee = newTotalFee;
    student.scholarshipAmount = newScholarship;
    student.netTotalFee = netFee;
    student.totalPaid = newTotalPaid;
    student.balanceDue = newBalance;

    // Recalculate semester progression
    const prog = computeStudentSemesterProgress(student, db.courses);
    student.currentSemester = prog.currentSemester;
    student.currentClass = prog.currentClass;

    if (!db.fee_adjustments) db.fee_adjustments = [];
    const adjustmentEntry = {
      id: `adj-${Date.now()}`,
      rollNo: student.rollNo,
      studentName: student.fullName,
      oldTotalFee,
      newTotalFee,
      oldScholarship,
      newScholarship,
      netTotalFee: netFee,
      oldTotalPaid,
      newTotalPaid,
      newBalanceDue: newBalance,
      reason: adjustmentReason || 'Admin manual correction / scholarship deduction',
      adjustedBy: adminUser || 'University Administrator',
      adjustedAt: new Date().toISOString()
    };
    db.fee_adjustments.unshift(adjustmentEntry);

    writeDB(db);

    res.json({
      success: true,
      message: `Fee record for ${student.fullName} (${student.rollNo}) corrected successfully!`,
      student,
      adjustment: adjustmentEntry,
      progress: prog
    });
  } catch (err) {
    console.error('Error adjusting student fee:', err);
    res.status(500).json({ success: false, message: 'Fee adjustment failed: ' + err.message });
  }
});

// Update Student Document Submission Status (Supports PDF Upload and Manually / Physical Hardcopy)
app.put('/api/students/:rollNo/documents', upload.fields([
  { name: 'document_file', maxCount: 1 }
]), (req, res) => {
  try {
    const db = readDB();
    const roll = req.params.rollNo.trim().toUpperCase();
    const student = db.students.find(s => s.rollNo.toUpperCase() === roll);

    if (!student) {
      return res.status(404).json({ success: false, message: `Student with Roll Number ${roll} not found.` });
    }

    const { docName, mode, status, remarks, verifiedBy, documentsStatus } = req.body;
    // mode: 'PDF' | 'Manually' | 'Pending'
    // status: 'submitted_pdf' | 'submitted_manual' | 'pending'

    // Handle batch document status update if sent as JSON map
    if (documentsStatus) {
      let batchMap = documentsStatus;
      if (typeof batchMap === 'string') {
        try { batchMap = JSON.parse(batchMap); } catch (e) {}
      }
      if (typeof batchMap === 'object' && batchMap !== null) {
        if (!student.documentsStatus) student.documentsStatus = {};
        if (!student.documentSubmit) student.documentSubmit = [];
        Object.keys(batchMap).forEach(docKey => {
          const item = batchMap[docKey];
          student.documentsStatus[docKey] = {
            docName: docKey,
            status: item.status || 'submitted_manual',
            mode: item.mode || (item.status === 'submitted_pdf' ? 'PDF / Digital Upload' : 'Manually (Physical Hardcopy)'),
            fileUrl: item.fileUrl || student.documentsStatus[docKey]?.fileUrl || '',
            remarks: item.remarks || remarks || '',
            verifiedBy: verifiedBy || 'Campus Admission Officer',
            updatedAt: new Date().toISOString()
          };
          if (item.status !== 'pending' && item.status !== 'not_submitted') {
            if (!student.documentSubmit.includes(docKey)) student.documentSubmit.push(docKey);
          } else {
            student.documentSubmit = student.documentSubmit.filter(d => d !== docKey);
          }
        });
        writeDB(db);
        return res.json({
          success: true,
          message: `Batch documents updated for ${student.fullName} (${student.rollNo})!`,
          student,
          documentsStatus: student.documentsStatus
        });
      }
    }

    if (!docName) {
      return res.status(400).json({ success: false, message: 'Document name is required.' });
    }

    if (!student.documentsStatus) student.documentsStatus = {};

    let fileUrl = student.documentsStatus[docName]?.fileUrl || '';
    if (req.files?.document_file) {
      fileUrl = `/uploads/documents/${req.files.document_file[0].filename}`;
    }

    let finalStatus = status;
    let finalMode = mode;

    if (mode === 'Manually' || mode === 'Physical Hardcopy') {
      finalStatus = 'submitted_manual';
      finalMode = 'Manually (Physical Hardcopy)';
    } else if (mode === 'PDF' || fileUrl) {
      finalStatus = 'submitted_pdf';
      finalMode = 'PDF / Digital Upload';
    } else if (mode === 'Pending' || mode === 'Not Submitted') {
      finalStatus = 'pending';
      finalMode = 'Not Submitted';
    }

    student.documentsStatus[docName] = {
      docName,
      status: finalStatus || 'submitted_manual',
      mode: finalMode || 'Manually (Physical Hardcopy)',
      fileUrl: fileUrl,
      remarks: remarks || '',
      verifiedBy: verifiedBy || 'Campus Admission Officer',
      updatedAt: new Date().toISOString()
    };

    // Update documentSubmit array
    if (!student.documentSubmit) student.documentSubmit = [];
    if (finalStatus !== 'pending') {
      if (!student.documentSubmit.includes(docName)) student.documentSubmit.push(docName);
    } else {
      student.documentSubmit = student.documentSubmit.filter(d => d !== docName);
    }

    writeDB(db);

    res.json({
      success: true,
      message: `Document "${docName}" updated for ${student.fullName} (${student.rollNo})!`,
      student,
      documentsStatus: student.documentsStatus
    });
  } catch (err) {
    console.error('Error updating document:', err);
    res.status(500).json({ success: false, message: 'Error updating document: ' + err.message });
  }
});

// ----------------------------------------------------
// 5. RESULTS & EXAMINATION
// ----------------------------------------------------
app.get('/api/results/search', (req, res) => {
  const db = readDB();
  const { rollNo, semester } = req.query;

  if (!db.settings?.resultPortalActive) {
    return res.status(403).json({
      success: false,
      portalInactive: true,
      message: 'Examination results for the current academic session are currently under evaluation. The Examination Directorate will declare the results shortly.'
    });
  }

  if (!rollNo) {
    return res.status(400).json({ success: false, message: 'Roll Number is required to view results.' });
  }

  const roll = rollNo.trim().toUpperCase();
  const student = db.students.find(s => s.rollNo.toUpperCase() === roll);

  let results = db.results.filter(r => r.rollNo.toUpperCase() === roll);

  if (semester && semester !== 'all') {
    results = results.filter(r => String(r.semester) === String(semester));
  }

  if (results.length === 0) {
    return res.status(404).json({
      success: false,
      message: `No published results found for Roll Number "${roll}" ${semester ? `(Semester ${semester})` : ''}.`
    });
  }

  res.json({
    success: true,
    student: student ? {
      fullName: student.fullName,
      fatherName: student.fatherName,
      motherName: student.motherName,
      rollNo: student.rollNo,
      registrationNo: student.registrationNo,
      courseName: student.courseName,
      admissionYear: student.admissionYear,
      photo: student.documents?.photo || ''
    } : null,
    results: results
  });
});

app.post('/api/results', (req, res) => {
  try {
    const db = readDB();
    const { rollNo, semester, examSession, subjects, declarationDate, remarks } = req.body;

    if (!rollNo || !semester || !subjects || !subjects.length) {
      return res.status(400).json({ success: false, message: 'Roll No, semester, and subjects with marks are required.' });
    }

    const roll = rollNo.trim().toUpperCase();
    const student = db.students.find(s => s.rollNo.toUpperCase() === roll);

    if (!student) {
      return res.status(404).json({ success: false, message: `Student with Roll No ${roll} does not exist.` });
    }

    let totalMax = 0;
    let totalObt = 0;
    let hasFail = false;
    let totalGradePoints = 0;

    const formattedSubjects = subjects.map(sub => {
      const maxTh = Number(sub.maxTheory) || 70;
      const obTh = Number(sub.obTheory) || 0;
      const maxPr = Number(sub.maxPractical) || 30;
      const obPr = Number(sub.obPractical) || 0;
      const subMax = maxTh + maxPr;
      const subObt = obTh + obPr;
      const subPerc = subMax > 0 ? (subObt / subMax) * 100 : 0;

      let grade = 'F';
      let points = 0;
      let isPass = subPerc >= 40;

      if (!isPass) hasFail = true;

      if (subPerc >= 90) { grade = 'O'; points = 10; }
      else if (subPerc >= 80) { grade = 'A+'; points = 9; }
      else if (subPerc >= 70) { grade = 'A'; points = 8; }
      else if (subPerc >= 60) { grade = 'B+'; points = 7; }
      else if (subPerc >= 50) { grade = 'B'; points = 6; }
      else if (subPerc >= 40) { grade = 'C'; points = 5; }
      else { grade = 'F'; points = 0; }

      totalMax += subMax;
      totalObt += subObt;
      totalGradePoints += points;

      return {
        code: sub.code || 'SUB101',
        name: sub.name || 'Subject Name',
        maxTheory: maxTh,
        obTheory: obTh,
        maxPractical: maxPr,
        obPractical: obPr,
        totalMax: subMax,
        totalObtained: subObt,
        grade: grade,
        points: points,
        pass: isPass
      };
    });

    const percentage = totalMax > 0 ? Number(((totalObt / totalMax) * 100).toFixed(2)) : 0;
    const sgpa = formattedSubjects.length > 0 ? Number((totalGradePoints / formattedSubjects.length).toFixed(2)) : 0;

    let resultStatus = 'PASSED';
    if (hasFail) {
      resultStatus = 'PROMOTED WITH BACKLOGS (ATKT)';
    } else if (percentage >= 75) {
      resultStatus = 'PASSED WITH DISTINCTION';
    } else if (percentage >= 60) {
      resultStatus = 'PASSED WITH FIRST CLASS';
    } else if (percentage >= 50) {
      resultStatus = 'PASSED WITH SECOND CLASS';
    }

    const newResult = {
      id: `res-${Date.now()}`,
      rollNo: student.rollNo,
      studentName: student.fullName,
      courseName: student.courseName,
      semester: String(semester),
      examSession: examSession || 'Regular Examination 2026-27',
      declarationDate: declarationDate || new Date().toISOString().split('T')[0],
      subjects: formattedSubjects,
      totalMaxMarks: totalMax,
      totalObtainedMarks: totalObt,
      percentage: percentage,
      sgpa: sgpa,
      cgpa: sgpa,
      resultStatus: resultStatus,
      remarks: remarks || (hasFail ? 'Needs to re-appear in backlogs' : 'Eligible for next semester registration')
    };

    const existingIndex = db.results.findIndex(r => r.rollNo.toUpperCase() === roll && String(r.semester) === String(semester));
    if (existingIndex !== -1) {
      db.results[existingIndex] = newResult;
    } else {
      db.results.unshift(newResult);
    }

    writeDB(db);

    res.status(201).json({
      success: true,
      message: `Result for Semester ${semester} saved successfully!`,
      result: newResult
    });
  } catch (err) {
    console.error('Error publishing result:', err);
    res.status(500).json({ success: false, message: 'Internal error: ' + err.message });
  }
});
// TESTIMONIALS APIS (Dynamic Top Slider CMS)
// ----------------------------------------------------
app.get('/api/testimonials', (req, res) => {
  const db = readDB();
  res.json({ success: true, testimonials: db.testimonials || [] });
});

app.post('/api/testimonials', (req, res) => {
  const db = readDB();
  const { title, studentName, course, review, badge, imageUrl, rating } = req.body;
  const newTst = {
    id: 'tst-' + Date.now(),
    title: title || 'Student Success Story',
    studentName: studentName || 'Institute Student',
    course: course || 'Higher Education',
    review: review || '',
    badge: badge || 'Verified Student',
    imageUrl: imageUrl || 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=800&q=80',
    rating: Number(rating) || 5,
    active: true,
    createdAt: new Date().toISOString()
  };
  if (!db.testimonials) db.testimonials = [];
  db.testimonials.unshift(newTst);
  writeDB(db);
  res.status(201).json({ success: true, message: 'Testimonial added successfully!', testimonial: newTst });
});

app.put('/api/testimonials/:id', (req, res) => {
  const db = readDB();
  const index = (db.testimonials || []).findIndex(t => t.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ success: false, message: 'Testimonial not found' });
  }
  db.testimonials[index] = { ...db.testimonials[index], ...req.body };
  writeDB(db);
  res.json({ success: true, message: 'Testimonial updated!', testimonial: db.testimonials[index] });
});

app.delete('/api/testimonials/:id', (req, res) => {
  const db = readDB();
  const index = (db.testimonials || []).findIndex(t => t.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ success: false, message: 'Testimonial not found' });
  }
  const deleted = db.testimonials.splice(index, 1);
  writeDB(db);
  res.json({ success: true, message: 'Testimonial deleted', testimonial: deleted[0] });
});

// ----------------------------------------------------
// ABOUT US & STATISTICS APIS
// ----------------------------------------------------
app.get('/api/about', (req, res) => {
  const db = readDB();
  res.json({ success: true, about: db.about || {} });
});

app.put('/api/about', (req, res) => {
  const db = readDB();
  db.about = { ...db.about, ...req.body };
  writeDB(db);
  res.json({ success: true, message: 'About details and stats updated successfully!', about: db.about });
});

// ----------------------------------------------------
// INQUIRY APIS (Student Leads Desk)
// ----------------------------------------------------
app.get('/api/inquiries', (req, res) => {
  const db = readDB();
  res.json({ success: true, inquiries: db.inquiries || [] });
});

app.post('/api/inquiries', (req, res) => {
  const db = readDB();
  const { name, phone, email, course, city, message } = req.body;
  if (!name || !phone) {
    return res.status(400).json({ success: false, message: 'Student Name and Phone Number are required.' });
  }
  const newInquiry = {
    id: 'inq-' + Date.now(),
    name: name.trim(),
    phone: phone.trim(),
    email: (email || '').trim(),
    course: course || 'General Inquiry',
    city: (city || '').trim(),
    message: (message || '').trim(),
    status: 'New',
    createdAt: new Date().toISOString()
  };
  if (!db.inquiries) db.inquiries = [];
  db.inquiries.unshift(newInquiry);
  writeDB(db);
  res.status(201).json({ success: true, message: 'Your admission inquiry has been submitted! Our counseling desk will contact you soon.', inquiry: newInquiry });
});

app.put('/api/inquiries/:id', (req, res) => {
  const db = readDB();
  const index = (db.inquiries || []).findIndex(i => i.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ success: false, message: 'Inquiry not found' });
  }
  db.inquiries[index] = { ...db.inquiries[index], ...req.body };
  writeDB(db);
  res.json({ success: true, message: 'Inquiry status updated!', inquiry: db.inquiries[index] });
});

app.delete('/api/inquiries/:id', (req, res) => {
  const db = readDB();
  const index = (db.inquiries || []).findIndex(i => i.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ success: false, message: 'Inquiry not found' });
  }
  const deleted = db.inquiries.splice(index, 1);
  writeDB(db);
  res.json({ success: true, message: 'Inquiry deleted', inquiry: deleted[0] });
});

// ----------------------------------------------------
// CAMPUS FUNCTION & EVENT PHOTOS APIS (CMS & Showcase)
// ----------------------------------------------------
app.get('/api/event-photos', (req, res) => {
  const db = readDB();
  res.json({ success: true, photos: db.event_photos || [] });
});

app.post('/api/event-photos/upload', galleryUpload.single('photo'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ success: false, message: 'No photo file uploaded' });
  }
  const imageUrl = `/uploads/gallery/${req.file.filename}`;
  res.json({ success: true, imageUrl, message: 'Photo uploaded successfully!' });
});

app.post('/api/event-photos', (req, res) => {
  const db = readDB();
  const { title, titleHi, category, date, description, imageUrl, active } = req.body;
  
  if (!title || !imageUrl) {
    return res.status(400).json({ success: false, message: 'Event Title and Image are required.' });
  }

  const newPhoto = {
    id: 'evt-' + Date.now(),
    title: title.trim(),
    titleHi: (titleHi || title).trim(),
    category: category || 'Campus Function',
    date: date || new Date().getFullYear().toString(),
    description: (description || '').trim(),
    imageUrl: imageUrl.trim(),
    active: active !== false,
    createdAt: new Date().toISOString()
  };

  if (!db.event_photos) db.event_photos = [];
  db.event_photos.unshift(newPhoto);
  writeDB(db);

  res.status(201).json({ success: true, message: 'Event photo added successfully!', photo: newPhoto });
});

app.put('/api/event-photos/:id', (req, res) => {
  const db = readDB();
  const index = (db.event_photos || []).findIndex(p => p.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ success: false, message: 'Event photo not found' });
  }

  db.event_photos[index] = { ...db.event_photos[index], ...req.body };
  writeDB(db);
  res.json({ success: true, message: 'Event photo updated successfully!', photo: db.event_photos[index] });
});

app.delete('/api/event-photos/:id', (req, res) => {
  const db = readDB();
  const index = (db.event_photos || []).findIndex(p => p.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ success: false, message: 'Event photo not found' });
  }

  const deleted = db.event_photos.splice(index, 1);
  writeDB(db);
  res.json({ success: true, message: 'Event photo deleted successfully', photo: deleted[0] });
});

// ====================================================
// 8. UNIVERSITY PAID & SETTLEMENT MANAGEMENT (COUNSELOR LEDGER)
// ====================================================

// 8.1 Distinct Universities and Colleges
app.get('/api/university/universities', (req, res) => {
  try {
    const db = readDB();
    const univSet = new Set([
      'Maharaja Chhatrasal Bundelkhand University (MCBU)',
      'Barkatullah University (BU Bhopal)',
      'State University',
      'RKDF University',
      'Makhanlal Chaturvedi National University (MCU)'
    ]);
    const collegeSet = new Set([
      'Govt PG College Chhatarpur',
      'Maharaja Chhatrasal College Chhatarpur',
      'PKC Education Learning Institute & Consultancy'
    ]);

    (db.students || []).forEach(s => {
      if (s.universityName) univSet.add(s.universityName.trim());
      if (s.collegeName) collegeSet.add(s.collegeName.trim());
    });

    (db.university_course_fees || []).forEach(c => {
      if (c.universityName) univSet.add(c.universityName.trim());
    });

    res.json({
      success: true,
      universities: Array.from(univSet).filter(Boolean),
      colleges: Array.from(collegeSet).filter(Boolean)
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// 8.2 University Summary Stats & Margin
app.get('/api/university/stats', (req, res) => {
  try {
    const db = readDB();
    const students = db.students || [];
    const payments = db.university_payments || [];

    const totalUniversityFee = students.reduce((acc, s) => acc + (Number(s.universityFee) || 0), 0);
    const totalUniversityPaid = students.reduce((acc, s) => acc + (Number(s.universityPaid) || 0), 0);
    const totalUniversityDue = students.reduce((acc, s) => acc + (Number(s.universityDue) || 0), 0);

    const totalStudentFee = students.reduce((acc, s) => acc + (Number(s.totalFee) || 0), 0);
    const totalStudentPaid = students.reduce((acc, s) => acc + (Number(s.totalPaid) || 0), 0);
    const totalStudentDue = students.reduce((acc, s) => acc + (Number(s.balanceDue) || 0), 0);

    const retainedMargin = totalStudentPaid - totalUniversityPaid; // Cash in hand profit
    const expectedMargin = totalStudentFee - totalUniversityFee; // Projected overall profit

    res.json({
      success: true,
      stats: {
        totalStudents: students.length,
        totalUniversityFee,
        totalUniversityPaid,
        totalUniversityDue,
        totalStudentFee,
        totalStudentPaid,
        totalStudentDue,
        retainedMargin,
        expectedMargin,
        totalPaymentsCount: payments.length
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// 8.3 University Student Ledger (with filters)
app.get('/api/university/ledger', (req, res) => {
  try {
    const db = readDB();
    const { universityName, collegeName, dueStatus, search } = req.query;
    let list = [...(db.students || [])];

    if (universityName && universityName !== 'ALL') {
      list = list.filter(s => (s.universityName || '').toLowerCase() === universityName.toLowerCase());
    }

    if (collegeName && collegeName !== 'ALL') {
      list = list.filter(s => (s.collegeName || '').toLowerCase() === collegeName.toLowerCase());
    }

    if (dueStatus === 'due_only') {
      list = list.filter(s => (Number(s.universityDue) || 0) > 0);
    } else if (dueStatus === 'cleared') {
      list = list.filter(s => (Number(s.universityDue) || 0) <= 0);
    }

    if (search && search.trim()) {
      const q = search.trim().toLowerCase();
      list = list.filter(s =>
        (s.fullName || '').toLowerCase().includes(q) ||
        (s.rollNo || '').toLowerCase().includes(q) ||
        (s.fatherName || '').toLowerCase().includes(q) ||
        (s.courseName || '').toLowerCase().includes(q) ||
        (s.aadharNumber || s.aadhaarNo || '').toLowerCase().includes(q) ||
        (s.universityName || '').toLowerCase().includes(q)
      );
    }

    res.json({
      success: true,
      count: list.length,
      students: list
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// 8.4 Record Payment to University
app.post('/api/university/pay', (req, res) => {
  try {
    const {
      rollNo,
      amountPaidToUniversity,
      paidSemester,
      paymentMode,
      transactionRef,
      purpose,
      remark,
      recordedBy
    } = req.body;

    if (!rollNo || !amountPaidToUniversity || Number(amountPaidToUniversity) <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Valid rollNo and payment amount are required.'
      });
    }

    const db = readDB();
    const student = (db.students || []).find(s => s.rollNo.toUpperCase() === rollNo.trim().toUpperCase());
    if (!student) {
      return res.status(404).json({ success: false, message: `Student with roll number ${rollNo} not found.` });
    }

    const amountNum = Number(amountPaidToUniversity);
    student.universityPaid = (Number(student.universityPaid) || 0) + amountNum;
    student.universityDue = Math.max(0, (Number(student.universityFee) || 0) - student.universityPaid);

    if (!db.university_payments) db.university_payments = [];
    const voucherNo = `UVCH-2026-${String(db.university_payments.length + 1).padStart(4, '0')}`;

    const paymentRecord = {
      id: `univ-pay-${Date.now()}`,
      voucherNo,
      paymentDate: new Date().toISOString(),
      rollNo: student.rollNo,
      studentName: student.fullName || student.studentName,
      fatherName: student.fatherName || '',
      courseName: student.courseName,
      currentSemester: student.currentSemester || 1,
      currentClass: student.currentClass || `SEM-${student.currentSemester || 1}`,
      universityName: student.universityName || 'Maharaja Chhatrasal Bundelkhand University (MCBU)',
      collegeName: student.collegeName || 'Govt PG College Chhatarpur',
      paidSemester: paidSemester || `Semester ${student.currentSemester || 1}`,
      amountPaidToUniversity: amountNum,
      paymentMode: paymentMode || 'Bank NEFT / RTGS',
      transactionRef: transactionRef || '',
      purpose: purpose || 'Official University Fee Settlement',
      remark: remark || '',
      recordedBy: recordedBy || 'Admin Counselor'
    };

    db.university_payments.unshift(paymentRecord);
    writeDB(db);

    res.status(201).json({
      success: true,
      message: `₹${amountNum.toLocaleString('en-IN')} successfully paid to ${paymentRecord.universityName} for ${student.fullName}!`,
      voucher: paymentRecord,
      student
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// 8.5 Update Student's Official University Fee & Affiliation
app.put('/api/university/student/:rollNo/fee', (req, res) => {
  try {
    const { rollNo } = req.params;
    const { universityFee, universityName, collegeName } = req.body;

    const db = readDB();
    const student = (db.students || []).find(s => s.rollNo.toUpperCase() === rollNo.trim().toUpperCase());
    if (!student) {
      return res.status(404).json({ success: false, message: `Student with roll number ${rollNo} not found.` });
    }

    if (universityFee !== undefined) {
      student.universityFee = Number(universityFee) || 0;
      student.universityDue = Math.max(0, student.universityFee - (Number(student.universityPaid) || 0));
    }

    if (universityName) {
      student.universityName = universityName.trim();
    }
    if (collegeName !== undefined) {
      student.collegeName = collegeName.trim();
    }

    writeDB(db);

    res.json({
      success: true,
      message: 'University fee & affiliation updated successfully!',
      student
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// 8.6 University Payment History / Records
app.get('/api/university/payments', (req, res) => {
  try {
    const db = readDB();
    const { rollNo, universityName, search } = req.query;
    let list = [...(db.university_payments || [])];

    if (rollNo) {
      list = list.filter(p => p.rollNo.toUpperCase() === rollNo.trim().toUpperCase());
    }

    if (universityName && universityName !== 'ALL') {
      list = list.filter(p => (p.universityName || '').toLowerCase() === universityName.toLowerCase());
    }

    if (search && search.trim()) {
      const q = search.trim().toLowerCase();
      list = list.filter(p =>
        (p.studentName || '').toLowerCase().includes(q) ||
        (p.rollNo || '').toLowerCase().includes(q) ||
        (p.voucherNo || '').toLowerCase().includes(q) ||
        (p.transactionRef || '').toLowerCase().includes(q) ||
        (p.universityName || '').toLowerCase().includes(q)
      );
    }

    res.json({
      success: true,
      count: list.length,
      payments: list
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// 8.7 Standard University Course Fees (Master List)
app.get('/api/university/course-fees', (req, res) => {
  try {
    const db = readDB();
    res.json({
      success: true,
      courseFees: db.university_course_fees || []
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

app.post('/api/university/course-fees', (req, res) => {
  try {
    const { universityName, courseName, officialFee, feePerSemester, notes } = req.body;
    if (!universityName || !courseName || officialFee === undefined) {
      return res.status(400).json({ success: false, message: 'University, Course and Official Fee are required.' });
    }

    const db = readDB();
    if (!db.university_course_fees) db.university_course_fees = [];

    const existingIndex = db.university_course_fees.findIndex(
      c => c.universityName.toLowerCase() === universityName.trim().toLowerCase() &&
           c.courseName.toLowerCase() === courseName.trim().toLowerCase()
    );

    const item = {
      id: existingIndex !== -1 ? db.university_course_fees[existingIndex].id : `ucf-${Date.now()}`,
      universityName: universityName.trim(),
      courseName: courseName.trim(),
      officialFee: Number(officialFee) || 0,
      feePerSemester: Number(feePerSemester) || 0,
      notes: notes || ''
    };

    if (existingIndex !== -1) {
      db.university_course_fees[existingIndex] = item;
    } else {
      db.university_course_fees.push(item);
    }

    writeDB(db);

    res.status(201).json({
      success: true,
      message: 'Standard university course fee saved successfully!',
      courseFee: item
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ==========================================
// 9. UNIVERSITIES & COLLEGES DIRECTORY API
// ==========================================

// 9.1 Get Universities
app.get('/api/universities', (req, res) => {
  try {
    const db = readDB();
    const universities = db.universities || [];
    const colleges = db.colleges || [];

    const enriched = universities.map(u => ({
      ...u,
      collegesCount: colleges.filter(c => c.universityId === u.id || (c.universityName || '').toLowerCase() === (u.name || '').toLowerCase()).length
    }));

    res.json({ success: true, universities: enriched });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// 9.2 Add New University
app.post('/api/universities', (req, res) => {
  try {
    const { name, shortName, code, city, state, approvedBy, website, description, establishedYear } = req.body;
    if (!name || !name.trim()) {
      return res.status(400).json({ success: false, message: 'University Name is required.' });
    }

    const db = readDB();
    if (!db.universities) db.universities = [];

    const newUniv = {
      id: `univ-${Date.now()}`,
      name: name.trim(),
      shortName: shortName?.trim() || name.trim().split(' ').slice(0, 2).join(' '),
      code: (code || name.trim().slice(0, 4)).toUpperCase(),
      city: city?.trim() || 'Bhopal',
      state: state?.trim() || 'Madhya Pradesh',
      approvedBy: approvedBy?.trim() || 'UGC, AICTE Recognized',
      website: website?.trim() || '',
      description: description?.trim() || '',
      establishedYear: establishedYear ? Number(establishedYear) : new Date().getFullYear(),
      status: 'Active',
      createdAt: new Date().toISOString()
    };

    db.universities.push(newUniv);
    writeDB(db);

    res.status(201).json({
      success: true,
      message: `University "${newUniv.name}" added successfully!`,
      university: newUniv
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// 9.3 Update University
app.put('/api/universities/:id', (req, res) => {
  try {
    const { id } = req.params;
    const db = readDB();
    if (!db.universities) db.universities = [];

    const index = db.universities.findIndex(u => u.id === id);
    if (index === -1) {
      return res.status(404).json({ success: false, message: 'University not found.' });
    }

    db.universities[index] = {
      ...db.universities[index],
      ...req.body,
      id
    };

    writeDB(db);
    res.json({
      success: true,
      message: 'University details updated successfully!',
      university: db.universities[index]
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// 9.4 Delete University
app.delete('/api/universities/:id', (req, res) => {
  try {
    const { id } = req.params;
    const db = readDB();
    if (!db.universities) db.universities = [];

    const univ = db.universities.find(u => u.id === id);
    if (!univ) {
      return res.status(404).json({ success: false, message: 'University not found.' });
    }

    db.universities = db.universities.filter(u => u.id !== id);
    writeDB(db);

    res.json({ success: true, message: `University "${univ.name}" removed.` });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// 9.5 Get Colleges
app.get('/api/colleges', (req, res) => {
  try {
    const { universityId, universityName, search } = req.query;
    const db = readDB();
    let colleges = db.colleges || [];

    if (universityId && universityId !== 'ALL') {
      colleges = colleges.filter(c => c.universityId === universityId);
    } else if (universityName && universityName !== 'ALL') {
      colleges = colleges.filter(c => (c.universityName || '').toLowerCase() === universityName.toLowerCase());
    }

    if (search && search.trim()) {
      const q = search.trim().toLowerCase();
      colleges = colleges.filter(c =>
        (c.name || '').toLowerCase().includes(q) ||
        (c.shortName || '').toLowerCase().includes(q) ||
        (c.code || '').toLowerCase().includes(q) ||
        (c.district || '').toLowerCase().includes(q)
      );
    }

    res.json({ success: true, count: colleges.length, colleges });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// 9.6 Add College
app.post('/api/colleges', (req, res) => {
  try {
    const { name, shortName, code, universityId, universityName, district, state, address } = req.body;
    if (!name || !name.trim()) {
      return res.status(400).json({ success: false, message: 'College name is required.' });
    }

    const db = readDB();
    if (!db.colleges) db.colleges = [];

    const newCol = {
      id: `col-${Date.now()}`,
      universityId: universityId || 'univ-mpu',
      universityName: universityName || 'Madhyanchal Professional University Bhopal',
      code: (code || `COL-${Date.now().toString().slice(-4)}`).toUpperCase(),
      name: name.trim(),
      shortName: shortName?.trim() || name.trim(),
      district: district?.trim() || 'Chhatarpur',
      state: state?.trim() || 'Madhya Pradesh',
      address: address?.trim() || '',
      status: 'Active',
      createdAt: new Date().toISOString()
    };

    db.colleges.push(newCol);
    writeDB(db);

    res.status(201).json({
      success: true,
      message: `College "${newCol.shortName}" registered successfully!`,
      college: newCol
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// 9.7 Delete College
app.delete('/api/colleges/:id', (req, res) => {
  try {
    const { id } = req.params;
    const db = readDB();
    if (!db.colleges) db.colleges = [];

    const college = db.colleges.find(c => c.id === id);
    if (!college) {
      return res.status(404).json({ success: false, message: 'College not found.' });
    }

    db.colleges = db.colleges.filter(c => c.id !== id);
    writeDB(db);

    res.json({ success: true, message: `College "${college.shortName || college.name}" deleted.` });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    university: 'Apex Global University',
    timestamp: new Date().toISOString()
  });
});

app.listen(PORT, () => {
  console.log(`====================================================`);
  console.log(`🎓 University Management API running on port ${PORT}`);
  console.log(`📁 Uploads available at: http://localhost:${PORT}/uploads`);
  console.log(`====================================================`);
});
