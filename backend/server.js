import express from 'express';
import cors from 'cors';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { readDB, writeDB, initDB } from './db.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

initDB();
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
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ----------------------------------------------------
// 0. AUTHENTICATION & SETTINGS
// ----------------------------------------------------
// Admin / Cashier Staff Login
app.post('/api/auth/login', (req, res) => {
  const { username, password } = req.body;
  const db = readDB();

  const user = (db.users || []).find(
    u => u.username.toLowerCase() === (username || '').trim().toLowerCase() && u.password === password
  );

  if (!user) {
    return res.status(401).json({
      success: false,
      message: 'Invalid User ID or Password. Please verify your credentials.'
    });
  }

  res.json({
    success: true,
    message: 'Staff authentication successful.',
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

  const staff = (db.staff_users || []).find(
    s => (s.username || '').trim().toLowerCase() === cleanUser && (s.password || '').trim() === cleanPass
  );

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
    fatherName: 'Self-Registered Online',
    motherName: 'N/A',
    dob: '2005-01-01',
    gender: 'Other',
    category: 'General',
    email: email.trim(),
    phone: phone || '',
    altPhone: '',
    address: 'Online Enrollment',
    city: 'Online',
    state: 'Online',
    pincode: '000000',
    courseId: selectedCourse?.id || 'custom',
    courseName: selectedCourse?.name || 'Selected Degree',
    admissionYear: year,
    currentSemester: 1,
    admissionType: 'Online Portal Enrollment',
    academic10th: { board: 'CBSE', passingYear: 2022, marksObtained: 450, totalMarks: 500, percentage: 90 },
    academic12th: { board: 'CBSE', passingYear: 2024, marksObtained: 430, totalMarks: 500, percentage: 86 },
    documents: { photo: '', signature: '', doc10th: '', doc12th: '', aadhar: '', pan: '' },
    totalFee: selectedCourse?.totalFee || 100000,
    totalPaid: 0,
    balanceDue: selectedCourse?.totalFee || 100000,
    universityName: 'Maharaja Chhatrasal Bundelkhand University (MCBU)',
    collegeName: 'Govt PG College Chhatarpur',
    universityFee: Math.round((selectedCourse?.totalFee || 100000) * 0.5),
    universityPaid: 0,
    universityDue: Math.round((selectedCourse?.totalFee || 100000) * 0.5),
    admissionDate: new Date().toISOString(),
    status: 'Active'
  };

  db.students.unshift(newStudent);
  writeDB(db);

  res.status(201).json({
    success: true,
    message: 'Student account created successfully!',
    user: newStudentUser,
    student: newStudent
  });
});

// Student Login
app.post('/api/auth/student-login', (req, res) => {
  const { username, password } = req.body;
  const db = readDB();

  if (!db.student_users) db.student_users = [];
  const user = db.student_users.find(
    u => (u.username.toLowerCase() === (username || '').trim().toLowerCase() || u.email.toLowerCase() === (username || '').trim().toLowerCase()) && u.password === password
  );

  if (!user) {
    return res.status(401).json({
      success: false,
      message: 'Invalid Student ID / Email or Password.'
    });
  }

  // Find linked student record
  const student = db.students.find(s => s.rollNo === user.rollNo || s.email === user.email);
  const payments = db.fee_payments.filter(p => p.rollNo === user.rollNo);
  const results = db.results.filter(r => r.rollNo === user.rollNo);

  res.json({
    success: true,
    message: 'Student logged in successfully.',
    user,
    student: student ? { ...student, payments, results } : null
  });
});

// Settings & Declaration Toggle
app.get('/api/settings', (req, res) => {
  const db = readDB();
  res.json({
    success: true,
    settings: db.settings || { resultPortalActive: false, academicSession: '2026-27' }
  });
});

app.post('/api/settings', (req, res) => {
  const db = readDB();
  db.settings = { ...db.settings, ...req.body };
  writeDB(db);
  res.json({ success: true, message: 'Settings updated.', settings: db.settings });
});

// ----------------------------------------------------
// 1. COURSES & SYLLABUS APIS (Admin Management)
// ----------------------------------------------------
app.get('/api/courses', (req, res) => {
  const db = readDB();
  res.json({ success: true, courses: db.courses });
});

// Add New Course (Admin Panel)
app.post('/api/courses', (req, res) => {
  const db = readDB();
  const { name, code, department, durationYears, totalSemesters, totalFee, feePerSemester, eligibility, description, subjectsBySemester } = req.body;

  if (!name || !code) {
    return res.status(400).json({ success: false, message: 'Course name and code are required.' });
  }

  const id = code.toLowerCase().replace(/[^a-z0-9]/g, '-') + '-' + Date.now();
  const newCourse = {
    id: id,
    name: name.trim(),
    code: code.trim().toUpperCase(),
    department: department || 'School of Advanced Studies',
    durationYears: req.body.durationYears !== undefined && req.body.durationYears !== '' ? Number(req.body.durationYears) : 3,
    totalSemesters: req.body.totalSemesters !== undefined && req.body.totalSemesters !== '' ? Number(req.body.totalSemesters) : 6,
    totalFee: req.body.totalFee !== undefined && req.body.totalFee !== '' ? Number(req.body.totalFee) : 0,
    feePerSemester: req.body.feePerSemester !== undefined && req.body.feePerSemester !== '' ? Number(req.body.feePerSemester) : (req.body.totalFee ? Math.round(Number(req.body.totalFee) / (Number(req.body.totalSemesters) || 6)) : 0),
    eligibility: eligibility || '10+2 with minimum 50% aggregate marks',
    description: description || 'Professional degree program designed for academic and industry excellence.',
    subjectsBySemester: subjectsBySemester || {
      "1": [
        { code: `${code}101`, name: 'Foundation Core I', maxTheory: 70, maxPractical: 30 },
        { code: `${code}102`, name: 'Foundation Core II', maxTheory: 70, maxPractical: 30 }
      ]
    }
  };

  db.courses.push(newCourse);
  writeDB(db);
  res.status(201).json({ success: true, message: 'New course added successfully!', course: newCourse });
});

// Edit Course Details & Fees (Admin Panel)
app.put('/api/courses/:id', (req, res) => {
  const db = readDB();
  const index = db.courses.findIndex(c => c.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ success: false, message: 'Course not found' });
  }

  db.courses[index] = {
    ...db.courses[index],
    ...req.body,
    totalFee: req.body.totalFee !== undefined && req.body.totalFee !== '' ? Number(req.body.totalFee) : db.courses[index].totalFee,
    feePerSemester: req.body.feePerSemester !== undefined && req.body.feePerSemester !== '' ? Number(req.body.feePerSemester) : db.courses[index].feePerSemester,
    durationYears: req.body.durationYears !== undefined && req.body.durationYears !== '' ? Number(req.body.durationYears) : db.courses[index].durationYears,
    totalSemesters: req.body.totalSemesters !== undefined && req.body.totalSemesters !== '' ? Number(req.body.totalSemesters) : db.courses[index].totalSemesters
  };

  writeDB(db);
  res.json({ success: true, message: 'Course and fee updated successfully!', course: db.courses[index] });
});

// Upload Syllabus File (PDF/Excel) for Degree & Semester
const handleSyllabusUpload = (req, res) => {
  try {
    const { courseId } = req.params;
    const file = req.file || (req.files && req.files[0]);
    if (!file) {
      return res.status(400).json({ success: false, message: 'Please select a PDF or Excel syllabus file to upload.' });
    }

    const sem = String(req.params.semester || req.body.semester || '1');
    const db = readDB();
    const course = db.courses.find(c => c.id === courseId);
    if (!course) {
      return res.status(404).json({ success: false, message: 'Course degree program not found.' });
    }

    if (!course.syllabusFiles) course.syllabusFiles = {};

    // Remove previous syllabus file for this semester if present
    const prevFile = course.syllabusFiles[sem];
    if (prevFile && prevFile.fileUrl) {
      const prevPath = path.join(__dirname, prevFile.fileUrl);
      if (fs.existsSync(prevPath)) {
        try { fs.unlinkSync(prevPath); } catch (e) {}
      }
    }

    const fileRecord = {
      fileName: file.originalname,
      fileUrl: `/uploads/syllabus/${file.filename}`,
      fileSize: file.size,
      uploadedAt: new Date().toISOString()
    };

    course.syllabusFiles[sem] = fileRecord;
    writeDB(db);

    res.json({
      success: true,
      message: `Syllabus for ${course.name} (Semester ${sem}) uploaded successfully!`,
      syllabusFile: fileRecord,
      course
    });
  } catch (err) {
    console.error('Syllabus upload error:', err);
    res.status(500).json({ success: false, message: 'Error uploading syllabus file: ' + err.message });
  }
};

app.post('/api/courses/:courseId/syllabus-file', syllabusUpload.any(), handleSyllabusUpload);
app.post('/api/courses/:courseId/syllabus-file/:semester', syllabusUpload.any(), handleSyllabusUpload);

// Delete Syllabus File
app.delete('/api/courses/:courseId/syllabus-file/:semester', (req, res) => {
  const { courseId, semester } = req.params;
  const db = readDB();
  const course = db.courses.find(c => c.id === courseId);
  if (!course) {
    return res.status(404).json({ success: false, message: 'Course not found' });
  }

  if (course.syllabusFiles && course.syllabusFiles[semester]) {
    const fileUrl = course.syllabusFiles[semester].fileUrl;
    const filePath = path.join(__dirname, fileUrl);
    if (fs.existsSync(filePath)) {
      try { fs.unlinkSync(filePath); } catch (e) {}
    }
    delete course.syllabusFiles[semester];
    writeDB(db);
  }

  res.json({ success: true, message: `Semester ${semester} syllabus file removed.`, course });
});

// 1.2 Unified Syllabi Directory APIs (University + College + Branch + Semester)
app.get('/api/syllabi', (req, res) => {
  try {
    const db = readDB();
    const { universityId, collegeId, courseId, semester, search } = req.query;
    let list = db.syllabi || [];

    if (universityId && universityId !== 'ALL') {
      list = list.filter(s => s.universityId === universityId);
    }
    if (collegeId && collegeId !== 'ALL') {
      list = list.filter(s => s.collegeId === collegeId);
    }
    if (courseId && courseId !== 'ALL') {
      list = list.filter(s => s.courseId === courseId || s.branch === courseId);
    }
    if (semester && semester !== 'ALL') {
      list = list.filter(s => String(s.semester) === String(semester));
    }
    if (search && search.trim()) {
      const q = search.trim().toLowerCase();
      list = list.filter(s => 
        (s.branch || '').toLowerCase().includes(q) ||
        (s.courseName || '').toLowerCase().includes(q) ||
        (s.collegeName || '').toLowerCase().includes(q) ||
        (s.universityName || '').toLowerCase().includes(q) ||
        (s.fileName || '').toLowerCase().includes(q)
      );
    }

    res.json({ success: true, count: list.length, syllabi: list });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

app.post('/api/syllabi/upload', syllabusUpload.any(), (req, res) => {
  try {
    const file = req.file || (req.files && req.files[0]);
    if (!file) {
      return res.status(400).json({ success: false, message: 'Please select a PDF or Excel syllabus file to upload.' });
    }

    const {
      universityId,
      universityName,
      collegeId,
      collegeName,
      courseId,
      courseName,
      branch,
      semester
    } = req.body;

    const sem = String(semester || '1');
    const db = readDB();
    if (!db.syllabi) db.syllabi = [];

    // Replace if exact match exists for this university + college + branch + semester
    const branchKey = (branch || courseName || '').trim().toLowerCase();
    const existingIndex = db.syllabi.findIndex(s => 
      s.universityId === universityId &&
      s.collegeId === collegeId &&
      ((s.branch || '').toLowerCase() === branchKey || (s.courseName || '').toLowerCase() === branchKey) &&
      String(s.semester) === sem
    );

    if (existingIndex !== -1) {
      const prev = db.syllabi[existingIndex];
      if (prev.fileUrl) {
        const prevPath = path.join(__dirname, prev.fileUrl);
        if (fs.existsSync(prevPath)) {
          try { fs.unlinkSync(prevPath); } catch (e) {}
        }
      }
      db.syllabi.splice(existingIndex, 1);
    }

    const ext = path.extname(file.originalname).toLowerCase();
    const fileType = (ext.includes('xls') || ext.includes('csv')) ? 'Excel' : (ext.includes('doc') ? 'Word' : 'PDF');

    const syllabusRecord = {
      id: `syl-${Date.now()}`,
      universityId: universityId || 'univ-mpu',
      universityName: universityName || 'Madhyanchal Professional University Bhopal',
      collegeId: collegeId || '',
      collegeName: collegeName || 'Affiliated College',
      courseId: courseId || '',
      courseName: courseName || branch || 'B.Tech Program',
      branch: branch || courseName || 'General',
      semester: sem,
      fileUrl: `/uploads/syllabus/${file.filename}`,
      fileName: file.originalname,
      fileSize: file.size,
      fileType: fileType,
      uploadedAt: new Date().toISOString()
    };

    db.syllabi.unshift(syllabusRecord);

    // Also update legacy course object if courseId matches
    if (courseId && db.courses) {
      const c = db.courses.find(cr => cr.id === courseId);
      if (c) {
        if (!c.syllabusFiles) c.syllabusFiles = {};
        c.syllabusFiles[sem] = {
          fileName: file.originalname,
          fileUrl: syllabusRecord.fileUrl,
          fileSize: file.size,
          uploadedAt: syllabusRecord.uploadedAt
        };
      }
    }

    writeDB(db);

    res.status(201).json({
      success: true,
      message: `Syllabus for ${syllabusRecord.branch} (Sem ${sem}) uploaded successfully!`,
      syllabus: syllabusRecord
    });
  } catch (err) {
    console.error('Syllabus upload error:', err);
    res.status(500).json({ success: false, message: 'Error uploading syllabus: ' + err.message });
  }
});

app.delete('/api/syllabi/:id', (req, res) => {
  try {
    const { id } = req.params;
    const db = readDB();
    if (!db.syllabi) db.syllabi = [];

    const index = db.syllabi.findIndex(s => s.id === id);
    if (index === -1) {
      return res.status(404).json({ success: false, message: 'Syllabus not found.' });
    }

    const item = db.syllabi[index];
    if (item.fileUrl) {
      const p = path.join(__dirname, item.fileUrl);
      if (fs.existsSync(p)) {
        try { fs.unlinkSync(p); } catch (e) {}
      }
    }

    db.syllabi.splice(index, 1);
    writeDB(db);

    res.json({ success: true, message: 'Syllabus file deleted successfully!' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Delete Course (Admin Panel)
app.delete('/api/courses/:id', (req, res) => {
  const db = readDB();
  const index = db.courses.findIndex(c => c.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ success: false, message: 'Course not found' });
  }

  const deleted = db.courses.splice(index, 1);
  writeDB(db);
  res.json({ success: true, message: 'Course deleted successfully', course: deleted[0] });
});

// ----------------------------------------------------
// 2. FEEDBACK APIS
// ----------------------------------------------------
app.get('/api/feedbacks', (req, res) => {
  const db = readDB();
  res.json({ success: true, feedbacks: db.feedbacks || [] });
});

app.post('/api/feedbacks', (req, res) => {
  const db = readDB();
  const { studentName, email, rollNo, subject, message, rating } = req.body;

  if (!studentName || !message) {
    return res.status(400).json({ success: false, message: 'Name and feedback message are required.' });
  }

  const newFeedback = {
    id: `fb-${Date.now()}`,
    studentName: studentName.trim(),
    email: email || '',
    rollNo: rollNo || '',
    subject: subject || 'General Student Feedback',
    message: message.trim(),
    rating: Number(rating) || 5,
    createdAt: new Date().toISOString()
  };

  if (!db.feedbacks) db.feedbacks = [];
  db.feedbacks.unshift(newFeedback);
  writeDB(db);

  res.status(201).json({ success: true, message: 'Feedback submitted successfully! Thank you for your review.', feedback: newFeedback });
});

// ----------------------------------------------------
// 3. PHYSICAL ADMISSION & CASH COUNTER (On-Campus Desk)
// ----------------------------------------------------
// Helper to parse student admission date reliably
function getStudentAdmissionDate(s) {
  if (s.admissionDate) {
    const d = new Date(s.admissionDate);
    if (!isNaN(d.getTime())) return d;
  }
  if (s.admissionTimestamp) {
    const d = new Date(s.admissionTimestamp);
    if (!isNaN(d.getTime())) return d;
  }
  if (s.createdAt) {
    const d = new Date(s.createdAt);
    if (!isNaN(d.getTime())) return d;
  }
  if (s.id && typeof s.id === 'string' && s.id.startsWith('std-')) {
    const ts = parseInt(s.id.replace('std-', ''), 10);
    if (!isNaN(ts)) return new Date(ts);
  }
  if (s.admissionYear) {
    return new Date(s.admissionYear, 0, 1);
  }
  return new Date();
}

// Helper to check timeframe match (week, month, last_month, year)
function isDateInTimeframe(d, timeframe, now = new Date()) {
  if (!d || isNaN(d.getTime())) return false;
  if (!timeframe || timeframe === 'all') return true;

  if (timeframe === 'week') {
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    return d >= sevenDaysAgo;
  }
  if (timeframe === 'month' || timeframe === 'this_month') {
    return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth();
  }
  if (timeframe === 'last_month') {
    const lm = now.getMonth() === 0 ? 11 : now.getMonth() - 1;
    const ly = now.getMonth() === 0 ? now.getFullYear() - 1 : now.getFullYear();
    return d.getFullYear() === ly && d.getMonth() === lm;
  }
  if (timeframe === 'year' || timeframe === 'this_year') {
    return d.getFullYear() === now.getFullYear();
  }
  return true;
}

app.get('/api/students', (req, res) => {
  const db = readDB();
  const { search, course, semester, timeframe = 'all' } = req.query;
  const now = new Date();
  let list = [...db.students];

  // Calculate live counts across all students for timeframes
  const timeframeCounts = {
    all: db.students.length,
    week: db.students.filter(s => isDateInTimeframe(getStudentAdmissionDate(s), 'week', now)).length,
    month: db.students.filter(s => isDateInTimeframe(getStudentAdmissionDate(s), 'month', now)).length,
    year: db.students.filter(s => isDateInTimeframe(getStudentAdmissionDate(s), 'year', now)).length
  };

  if (course && course !== 'all') {
    list = list.filter(s => s.courseId === course || s.courseName?.toLowerCase().includes(course.toLowerCase()));
  }
  if (semester && semester !== 'all') {
    list = list.filter(s => String(s.currentSemester) === String(semester));
  }
  if (timeframe && timeframe !== 'all') {
    list = list.filter(s => isDateInTimeframe(getStudentAdmissionDate(s), timeframe, now));
  }
  if (search) {
    const q = search.trim().toLowerCase();
    const cleanNum = q.replace(/[\s-]/g, '');
    list = list.filter(s => {
      const nameMatch = s.fullName?.toLowerCase().includes(q) || s.studentName?.toLowerCase().includes(q);
      const fatherMatch = s.fatherName?.toLowerCase().includes(q) || s.father_name?.toLowerCase().includes(q) || s.motherName?.toLowerCase().includes(q);
      const rollMatch = s.rollNo?.toLowerCase().includes(q) || s.enrollmentNo?.toLowerCase().includes(q) || s.registrationNo?.toLowerCase().includes(q);
      
      const aadharRaw = (s.aadhaarNo || s.aadharNo || s.aadhar || s.aadhaar || '').toString();
      const aadharClean = aadharRaw.replace(/[\s-]/g, '');
      const aadharMatch = aadharRaw.toLowerCase().includes(q) || (cleanNum && aadharClean.includes(cleanNum));

      const phoneRaw = (s.phone || s.contact || '').toString();
      const phoneClean = phoneRaw.replace(/[\s-]/g, '');
      const phoneMatch = phoneRaw.includes(q) || (cleanNum && phoneClean.includes(cleanNum));
      const emailMatch = s.email?.toLowerCase().includes(q);
      const samagraMatch = s.samagraId?.toLowerCase().includes(q);

      return nameMatch || fatherMatch || rollMatch || aadharMatch || phoneMatch || emailMatch || samagraMatch;
    });
  }

  res.json({ success: true, count: list.length, students: list, timeframeCounts });
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
      const rollNo = body.rollNo ? body.rollNo.trim().toUpperCase() : (body.Enrollment_No ? body.Enrollment_No.trim().toUpperCase() : generatedRollNo);
      const registrationNo = `REG-${year}-${Math.floor(1000 + Math.random() * 9000)}`;

      if (db.students.some(s => s.rollNo.toUpperCase() === rollNo)) {
        return res.status(400).json({ success: false, message: `Roll Number / Enrollment No ${rollNo} already exists!` });
      }

      const selectedCourse = db.courses.find(c => c.id === body.courseId || c.name === body.Course_Name || c.name === body.courseName) || {
        name: body.Course_Name || body.courseName || "General Degree",
        totalFee: Number(body.Student_fee) || Number(body.totalFee) || 100000
      };

      const courseFee = Number(body.Student_fee) || Number(body.totalFee) || selectedCourse.totalFee || 100000;
      const initialPaid = Number(body.Initial_Payment) || Number(body.initialPayment) || 0;
      const balanceDue = Math.max(0, courseFee - initialPaid);

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
        courseId: body.courseId || selectedCourse.id || 'custom',
        courseName: body.Course_Name || selectedCourse.name || body.courseName || 'General Degree',
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
        studentFee: courseFee,
        totalFee: courseFee,
        initialPayment: initialPaid,
        totalPaid: initialPaid,
        balanceDue: balanceDue,
        universityFee: Number(body.universityFee) || Number(body.University_Fee) || Math.round(courseFee * 0.5),
        universityPaid: Number(body.universityPaid) || 0,
        universityDue: Math.max(0, (Number(body.universityFee) || Number(body.University_Fee) || Math.round(courseFee * 0.5)) - (Number(body.universityPaid) || 0)),
        remark: body.Remark || body.remark || '',
        status: body.Status && !['Cashier', 'Accounts', 'Admin'].includes(body.Status) ? body.Status : 'Active',
        feeType: body.Fee_Type || body.feeType || 'Admission Fee',
        feeCollectedBy: body.Fee_Collected_By || body.feeCollectedBy || body.operatorName || 'Cashier',
        paymentMode: body.Payment_Mode || body.paymentMode || 'Cash / Desk',
        reference: body.Reference || body.reference || 'Direct Walk-in',
        studentImage: studentImgUrl,
        documents: documents,
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
        const receiptNo = `RCPT-${year}-${String(db.fee_payments.length + 1).padStart(4, '0')}`;
        initialReceipt = {
          id: `pay-${Date.now()}`,
          receiptNo: receiptNo,
          studentId: newStudent.id,
          rollNo: newStudent.rollNo,
          studentName: newStudent.fullName,
          courseName: newStudent.courseName,
          amountPaid: initialPaid,
          feeType: body.Fee_Type || body.feeType || 'Admission Fee',
          paymentMode: body.Payment_Mode || body.paymentMode || 'Cash / Desk',
          transactionRef: body.Transaction_Ref || body.transactionRef || `ADM-INIT-${Math.floor(100000 + Math.random() * 900000)}`,
          paidFor: `${body.Fee_Type || body.feeType || 'Admission Fee'} Deposit`,
          paymentDate: new Date().toISOString(),
          totalFee: courseFee,
          totalPaidToDate: initialPaid,
          balanceRemaining: balanceDue,
          receivedBy: body.Fee_Collected_By || body.feeCollectedBy || body.operatorName || 'Cashier'
        };
        db.fee_payments.unshift(initialReceipt);
      }

      writeDB(db);

      res.status(201).json({
        success: true,
        message: 'Student registered & admitted successfully!',
        student: newStudent,
        receipt: initialReceipt
      });
    } catch (err) {
      console.error('Error during student registration:', err);
      res.status(500).json({ success: false, message: 'Server error: ' + err.message });
    }
  }
);

app.delete('/api/students/:rollNo', (req, res) => {
  const db = readDB();
  const roll = req.params.rollNo.toUpperCase();
  const index = db.students.findIndex(s => s.rollNo.toUpperCase() === roll);

  if (index === -1) {
    return res.status(404).json({ success: false, message: 'Student not found' });
  }

  const deleted = db.students.splice(index, 1);
  writeDB(db);
  res.json({ success: true, message: 'Student removed successfully', student: deleted[0] });
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
  const totalFee = Number(student.studentFee || student.totalFee || course.totalFee || 100000);
  const feePerSemester = Number(course.feePerSemester) || Math.max(1, Math.round(totalFee / totalSemesters));
  const totalPaid = Number(student.totalPaid || 0);

  // How many semesters have been fully cleared:
  const clearedSemesters = Math.min(totalSemesters, Math.floor(totalPaid / feePerSemester));
  
  let currentSemester = 1;
  if (totalPaid >= totalFee || clearedSemesters >= totalSemesters) {
    currentSemester = totalSemesters;
  } else {
    currentSemester = Math.min(totalSemesters, clearedSemesters + 1);
  }
  const currentClass = `SEM-${currentSemester}`;

  // Amount paid towards current semester & remaining due for current semester
  let currentSemesterPaid = 0;
  let currentSemesterDue = 0;

  if (totalPaid >= totalFee) {
    currentSemesterPaid = feePerSemester;
    currentSemesterDue = 0;
  } else {
    currentSemesterPaid = totalPaid - (clearedSemesters * feePerSemester);
    currentSemesterDue = Math.max(0, feePerSemester - currentSemesterPaid);
  }

  let semesterFeeStatus = '';
  if (totalPaid >= totalFee) {
    semesterFeeStatus = 'All Semesters Paid (Fully Paid)';
  } else if (clearedSemesters > 0) {
    semesterFeeStatus = `Sem 1-${clearedSemesters} Paid • Sem ${currentSemester} Due (₹${currentSemesterDue.toLocaleString('en-IN')})`;
  } else {
    semesterFeeStatus = `Sem 1 Due (₹${currentSemesterDue.toLocaleString('en-IN')})`;
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
  const { search, status, course, dueFilter = 'all' } = req.query;

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
      totalPaid: s.totalPaid || 0,
      balanceDue: Math.max(0, (s.totalFee || 0) - (s.totalPaid || 0)),
      feeStatus: feeStatus,
      lastPaymentDate: s.admissionDate,
      fatherName: s.fatherName || s.father_name || '',
      aadhaarNo: s.aadhaarNo || s.aadharNo || s.aadhar || '',
      documentsStatus: s.documentsStatus || {},
      documentSubmit: s.documentSubmit || []
    };
  });

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
    ledger = ledger.filter(s => 
      s.fullName?.toLowerCase().includes(q) ||
      s.rollNo?.toLowerCase().includes(q) ||
      s.registrationNo?.toLowerCase().includes(q) ||
      s.fatherName?.toLowerCase().includes(q) ||
      (s.aadhaarNo && (s.aadhaarNo.toLowerCase().includes(q) || (cleanNum && s.aadhaarNo.replace(/[\s-]/g, '').includes(cleanNum)))) ||
      s.phone?.includes(q) ||
      s.collegeName?.toLowerCase().includes(q) ||
      s.courseName?.toLowerCase().includes(q)
    );
  }

  const totalBalanceDue = ledger.reduce((acc, s) => acc + (s.balanceDue || 0), 0);
  const totalSemesterDue = ledger.reduce((acc, s) => acc + (s.currentSemesterDue || 0), 0);
  const dueStudentsCount = ledger.filter(s => s.balanceDue > 0).length;

  res.json({
    success: true,
    ledger,
    summary: {
      totalStudents: ledger.length,
      dueStudentsCount,
      totalBalanceDue,
      totalSemesterDue
    }
  });
});

// Record Fee Payment (Cash Counter or Online Portal)
app.post('/api/fees/pay', (req, res) => {
  try {
    const db = readDB();
    const { rollNo, amount, paymentMode, transactionRef, paidFor, feeType, receivedBy } = req.body;

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

    const year = new Date().getFullYear();
    const receiptNo = `RCPT-${year}-${String(db.fee_payments.length + 1).padStart(4, '0')}`;

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

// Admin Fee Adjustment & Correction (To fix cashier entry mistakes e.g. 11,80,000 -> 1,80,000 or paid 1,00,000 -> 10,000)
app.put('/api/fees/student/:rollNo/adjust', (req, res) => {
  try {
    const { rollNo } = req.params;
    const { totalFee, totalPaid, adjustmentReason, adminUser } = req.body;
    const db = readDB();

    const roll = rollNo.trim().toUpperCase();
    const student = db.students.find(s => s.rollNo.toUpperCase() === roll);
    if (!student) {
      return res.status(404).json({ success: false, message: `Student with Roll Number "${roll}" not found.` });
    }

    const oldTotalFee = Number(student.totalFee) || 0;
    const oldTotalPaid = Number(student.totalPaid) || 0;

    const newTotalFee = totalFee !== undefined && totalFee !== '' ? Math.max(0, Number(totalFee)) : oldTotalFee;
    const newTotalPaid = totalPaid !== undefined && totalPaid !== '' ? Math.max(0, Number(totalPaid)) : oldTotalPaid;
    const newBalance = Math.max(0, newTotalFee - newTotalPaid);

    student.totalFee = newTotalFee;
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
      oldTotalPaid,
      newTotalPaid,
      newBalanceDue: newBalance,
      reason: adjustmentReason || 'Admin manual correction for cashier typo',
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
