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

// Sanitize student records (dual enrollment linkages, N/A strings, legacy remarks)
try {
  const db = readDB();
  let dbChanged = false;
  if (Array.isArray(db.students)) {
    db.students.forEach(s => {
      const r = (s.rollNo || '').toUpperCase();
      if (r && !r.includes('-')) {
        if (s.primaryRollNo || s.primaryStudentId || s.isSecondaryCourse) {
          s.primaryRollNo = null;
          s.primaryStudentId = null;
          s.isSecondaryCourse = false;
          dbChanged = true;
        }
      }
      if (r && r.includes('-')) {
        const baseRoll = r.split('-')[0];
        if (s.primaryRollNo?.toUpperCase() !== baseRoll) {
          s.primaryRollNo = baseRoll;
          s.isSecondaryCourse = true;
          s.isDualEnrollment = true;
          dbChanged = true;
        }
      }
      // Clean up legacy N/A strings
      if (s.remark === 'Imported via Bulk Data Migration (Legacy)' || s.remark === 'Legacy Session Archive') {
        s.remark = '';
        dbChanged = true;
      }
      ['aadhaarNo', 'samagraId', 'abcId', 'mptassId', 'mptassPassword', 'otrId', 'debId', 'scholerId', 'userId', 'motherName'].forEach(field => {
        if (s[field] === 'N/A' || s[field] === 'NA' || s[field] === 'null' || s[field] === 'undefined') {
          s[field] = '';
          dbChanged = true;
        }
      });
    });
  }
  if (dbChanged) {
    writeDB(db);
    console.log('Sanitized database records successfully.');
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

const collegeCoursesUploadDir = path.join(__dirname, 'uploads', 'college_courses');
if (!fs.existsSync(collegeCoursesUploadDir)) {
  fs.mkdirSync(collegeCoursesUploadDir, { recursive: true });
}

const collegeCoursesStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, collegeCoursesUploadDir);
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname) || '.xlsx';
    const collegeId = (req.params.id || 'college').replace(/[^a-zA-Z0-9-]/g, '_');
    const unique = Date.now() + '-' + Math.round(Math.random() * 1e6);
    cb(null, `course_list-${collegeId}-${unique}${ext}`);
  }
});

const collegeCoursesUpload = multer({
  storage: collegeCoursesStorage,
  limits: { fileSize: 30 * 1024 * 1024 }
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

// Admin: Update staff account
app.put('/api/staff/:id', (req, res) => {
  try {
    const db = readDB();
    const { id } = req.params;
    const { name, username, password, role, department, status } = req.body;

    if (!db.staff_users) db.staff_users = [];
    const staff = db.staff_users.find(s => s.id === id || s.username === id);
    if (!staff) {
      return res.status(404).json({ success: false, message: 'Staff member not found.' });
    }

    if (username && username.trim().toLowerCase() !== (staff.username || '').trim().toLowerCase()) {
      const exists = db.staff_users.some(s => s.id !== staff.id && (s.username || '').trim().toLowerCase() === username.trim().toLowerCase());
      if (exists) {
        return res.status(400).json({ success: false, message: `Staff login ID "${username}" is already taken.` });
      }
      staff.username = username.trim().toLowerCase();
    }

    if (name) staff.name = name.trim();
    if (password) staff.password = password.trim();
    if (role) staff.role = role.trim();
    if (department !== undefined) staff.department = department.trim();
    if (status) staff.status = status.trim();

    writeDB(db);
    res.json({ success: true, message: 'Staff credentials updated successfully.', staff });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
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

// ----------------------------------------------------
// HELPER FUNCTIONS FOR EXCEL & BULK IMPORT
// ----------------------------------------------------
function formatExcelDate(val) {
  if (!val) return '';
  if (val instanceof Date) {
    if (!isNaN(val.getTime())) {
      const y = val.getFullYear();
      const m = String(val.getMonth() + 1).padStart(2, '0');
      const d = String(val.getDate()).padStart(2, '0');
      return `${y}-${m}-${d}`;
    }
    return '';
  }
  if (typeof val === 'number') {
    try {
      const dateObj = XLSX.SSF.parse_date_code(val);
      if (dateObj) {
        const y = dateObj.y;
        const m = String(dateObj.m).padStart(2, '0');
        const d = String(dateObj.d).padStart(2, '0');
        return `${y}-${m}-${d}`;
      }
    } catch (e) {}
  }
  const str = String(val).trim();
  if (!str) return '';
  
  // Standard YYYY-MM-DD
  if (/^\d{4}-\d{2}-\d{2}$/.test(str)) {
    return str;
  }
  // ISO strings with T
  if (str.includes('T') && !isNaN(Date.parse(str))) {
    const dObj = new Date(str);
    if (!isNaN(dObj.getTime())) {
      const y = dObj.getFullYear();
      const m = String(dObj.getMonth() + 1).padStart(2, '0');
      const d = String(dObj.getDate()).padStart(2, '0');
      return `${y}-${m}-${d}`;
    }
  }
  // DD-MM-YYYY or DD/MM/YYYY
  const dmY = str.match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})$/);
  if (dmY) {
    const day = String(dmY[1]).padStart(2, '0');
    const month = String(dmY[2]).padStart(2, '0');
    const year = dmY[3];
    return `${year}-${month}-${day}`;
  }
  // YYYY/MM/DD
  const yMD = str.match(/^(\d{4})[\/\-](\d{1,2})[\/\-](\d{1,2})$/);
  if (yMD) {
    const year = yMD[1];
    const month = String(yMD[2]).padStart(2, '0');
    const day = String(yMD[3]).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
  // Try fallback Date parse
  const parsed = new Date(str);
  if (!isNaN(parsed.getTime()) && parsed.getFullYear() > 1900 && parsed.getFullYear() < 2100) {
    const y = parsed.getFullYear();
    const m = String(parsed.getMonth() + 1).padStart(2, '0');
    const d = String(parsed.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }
  return str;
}

function getColVal(row, possibleKeys) {
  if (!row || typeof row !== 'object') return '';
  
  const rowKeys = Object.keys(row);
  for (const pKey of possibleKeys) {
    if (row[pKey] !== undefined && row[pKey] !== null && String(row[pKey]).trim() !== '') {
      return String(row[pKey]).trim();
    }
    const normPKey = pKey.toLowerCase().replace(/[\s_]/g, '');
    for (const rKey of rowKeys) {
      const normRKey = rKey.toLowerCase().replace(/[\s_]/g, '');
      if (normPKey === normRKey) {
        const val = row[rKey];
        if (val !== undefined && val !== null && String(val).trim() !== '') {
          return String(val).trim();
        }
      }
    }
  }
  return '';
}

function normalizeStudentRow(row, idx = 0) {
  const studentName = getColVal(row, ['student_name', 'Student_Name', 'studentName', 'fullName', 'Name', 'Student', 'नाम', 'विद्यार्थी का नाम']) || `Student ${idx + 1}`;
  const fatherName = getColVal(row, ['father_name', 'Father_Name', 'fatherName', 'Father', 'पिता का नाम', 'FathersName']);
  const motherName = getColVal(row, ['mother_name', 'Mother_Name', 'motherName', 'Mother', 'माता का नाम']);
  const rawDob = getColVal(row, ['dob', 'Date_Of_Birth', 'DateOfBirth', 'DOB', 'जन्म तिथि']);
  const dob = formatExcelDate(rawDob);
  const gender = getColVal(row, ['gender', 'Gender', 'Sex', 'लिंग']) || 'Male';
  const phone = getColVal(row, ['contact', 'phone', 'Contact_No', 'Contact', 'Phone', 'Mobile', 'मोबाइल', 'ContactNumber']);
  const email = getColVal(row, ['email', 'Email_ID', 'Email', 'EmailId', 'Mail']);
  const address = getColVal(row, ['address', 'Address', 'City', 'District', 'पता']);
  const aadhaarNo = getColVal(row, ['aadhaar_no', 'Aadhaar_No', 'Aadhaar', 'Aadhar', 'AadhaarNo', 'आधार']);
  const samagraId = getColVal(row, ['samagra_id', 'Samagra_ID', 'Samagra', 'SamagraId', 'समग्र']);
  const enrollmentNo = getColVal(row, ['enrollment_no', 'Enrollment_No', 'Enrollment', 'EnrollmentNo', 'RegNo', 'Registration_No', 'पंजीयन क्र']);
  const rollNo = getColVal(row, ['rollNo', 'Roll_No', 'RollNo', 'Roll', 'अनुक्रमांक', 'RollNumber']) || enrollmentNo;
  
  const abcId = getColVal(row, ['abc_id', 'Abc_id', 'ABC_ID', 'ABCID', 'AbcId']);
  const mpTassId = getColVal(row, ['mptass_id', 'MPTass_id', 'MPTASS_ID', 'MPTASSID', 'MpTassId']);
  const mpTassPassword = getColVal(row, ['mptass_password', 'MPTass_Password', 'MPTASS_Password', 'MpTassPassword']);
  const otrId = getColVal(row, ['otr_id', 'OTR_id', 'OTR_ID', 'OTRID', 'OtrId']);
  const debId = getColVal(row, ['deb_id', 'Deb_id', 'DEB_ID', 'DEBID', 'DebId']);
  const scholerId = getColVal(row, ['scholer_id', 'Scholer_id', 'Scholar_ID', 'ScholarID', 'ScholerId', 'scholarId']);
  const userId = getColVal(row, ['user_id', 'User_id', 'USER_ID', 'UserID', 'UserId']);
  
  const medium = getColVal(row, ['medium', 'Medium', 'माध्यम']) || 'Hindi';
  const admissionSession = getColVal(row, ['admission_session', 'Admission_Session', 'AdmissionSession', 'Session', 'सत्र', 'AcademicSession', 'Batch']) || '2024-2025';
  const admissionSatra = getColVal(row, ['admission_satra', 'Admission_Satra', 'AdmissionSatra', 'Satra']) || 'July';
  const rawAdmDate = getColVal(row, ['admission_date', 'Admission_Date', 'AdmissionDate']);
  const admissionDate = formatExcelDate(rawAdmDate);
  const universityName = getColVal(row, ['university_name', 'University_Name', 'UniversityName', 'University', 'विश्वविद्यालय']) || 'Maharaja Chhatrasal Bundelkhand University (MCBU)';
  const collegeName = getColVal(row, ['college_name', 'College_Name', 'CollegeName', 'College', 'महाविद्यालय']) || 'PKC Education & Consultancy';
  const courseName = getColVal(row, ['course_name', 'Course_Name', 'CourseName', 'Course', 'कोर्स', 'Program', 'Degree']) || 'General Degree';
  const branch = getColVal(row, ['branch', 'Branch', 'Stream', 'Department', 'शाखा']) || 'General';
  const courseType = getColVal(row, ['course_type', 'Course_Type', 'CourseType']) || 'UG';
  const courseMode = getColVal(row, ['course_mode', 'Course_Mode', 'CourseMode']) || 'Regular';
  const socialCategory = getColVal(row, ['socialCategory', 'social_category', 'Social_category', 'Category', 'SocialCategory', 'Caste', 'वर्ग', 'जाति']) || 'General';
  const docsSubmitted = getColVal(row, ['document_submit', 'Document_Submit', 'DocumentSubmit', 'Documents_Submitted', 'Documents', 'Docs', 'दस्तावेज']) || '10th, 12th, Aadhaar';
  const bloodGroup = getColVal(row, ['blood_group', 'Blood_Group', 'BloodGroup']) || 'NA';
  
  const rawFee = getColVal(row, ['student_fee', 'Student_fee', 'Total_Fee', 'TotalFee', 'CourseFee', 'Fee', 'PackageFee']);
  const totalFee = Number(rawFee.replace(/[^0-9.]/g, '')) || 0;
  
  const rawSch = getColVal(row, ['scholarship_amount', 'Scholarship_Amount', 'ScholarshipAmount', 'Scholarship', 'छात्रवृत्ति']);
  const scholarshipAmount = Number(rawSch.replace(/[^0-9.]/g, '')) || 0;

  const rawPaid = getColVal(row, ['fee_paid', 'Fee_Paid', 'FeePaid', 'Paid', 'TotalPaid', 'जमा फीस', 'AmountPaid']);
  const totalPaid = Number(rawPaid.replace(/[^0-9.]/g, '')) || 0;

  const netTotalFee = Math.max(0, totalFee - scholarshipAmount);
  const balanceDue = Math.max(0, netTotalFee - totalPaid);
  
  const remark = getColVal(row, ['remark', 'Remark', 'Remarks', 'टिप्पणी']);
  const statusVal = getColVal(row, ['cancel', 'Cancel', 'status', 'Status']);
  const status = statusVal === 'true' || statusVal === 'Cancelled' ? 'Cancelled' : 'Active';
  const studentImage = getColVal(row, ['student_image', 'Student_image', 'StudentImage', 'Photo', 'photo']);

  const currentClassVal = getColVal(row, ['current_class', 'Current_Class', 'CurrentClass', 'Class', 'Semester', 'Sem', 'कक्षा', 'सेमेस्टर']) || 'SEM-1';
  let currentSemester = 1;
  const semMatch = currentClassVal.match(/\d+/);
  if (semMatch) {
    currentSemester = parseInt(semMatch[0], 10);
  }
  const currentClass = currentClassVal.toUpperCase().startsWith('SEM') ? currentClassVal.toUpperCase() : `SEM-${currentSemester}`;

  return {
    studentName,
    fatherName,
    motherName,
    dob,
    gender,
    phone,
    email,
    address,
    aadhaarNo,
    samagraId,
    enrollmentNo,
    rollNo,
    abcId,
    mpTassId,
    mpTassPassword,
    otrId,
    debId,
    scholerId,
    userId,
    medium,
    admissionSession,
    admissionSatra,
    admissionDate,
    universityName,
    collegeName,
    courseName,
    branch,
    courseType,
    courseMode,
    socialCategory,
    docsSubmitted,
    bloodGroup,
    totalFee,
    scholarshipAmount,
    totalPaid,
    netTotalFee,
    balanceDue,
    remark,
    status,
    studentImage,
    currentClass,
    currentSemester
  };
}

// Parse Excel Endpoint
app.post('/api/students/parse-excel', memUpload.single('file'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Please upload an Excel file (.xlsx or .xls).' });
    }
    const workbook = XLSX.read(req.file.buffer, { type: 'buffer', cellDates: true });
    const firstSheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[firstSheetName];
    const rawRows = XLSX.utils.sheet_to_json(worksheet, { defval: '' });

    if (!rawRows || rawRows.length === 0) {
      return res.status(400).json({ success: false, message: 'Excel sheet is empty or contains no valid rows.' });
    }

    const normalizedRecords = rawRows.map((row, idx) => normalizeStudentRow(row, idx));

    res.json({
      success: true,
      sheetName: firstSheetName,
      totalRows: rawRows.length,
      records: normalizedRecords
    });
  } catch (err) {
    console.error('Error parsing Excel:', err);
    res.status(500).json({ success: false, message: 'Failed to parse Excel file: ' + err.message });
  }
});

// Parse PDF Endpoint
app.post('/api/students/parse-pdf', memUpload.single('file'), async (req, res) => {
  try {
    let text = '';
    if (req.file) {
      const data = await PDFParse(req.file.buffer);
      text = data.text || '';
    } else if (req.body.rawText) {
      text = req.body.rawText;
    }

    if (!text.trim()) {
      return res.status(400).json({ success: false, message: 'No text extracted from PDF file.' });
    }

    const lines = text.split('\n').map(l => l.trim()).filter(Boolean);
    const records = [];
    lines.forEach((line, idx) => {
      const parts = line.split('|').map(p => p.trim());
      if (parts.length >= 3) {
        records.push({
          studentName: parts[0] || `Student ${idx + 1}`,
          fatherName: parts[1] || '',
          courseName: parts[2] || 'General Degree',
          admissionSession: parts[3] || '2024-2025',
          currentClass: parts[4] || 'SEM-1',
          totalFee: Number((parts[5] || '').replace(/\D/g, '')) || 0,
          totalPaid: Number((parts[6] || '').replace(/\D/g, '')) || 0,
          phone: parts[7] || ''
        });
      }
    });

    res.json({
      success: true,
      totalRows: records.length,
      records: records
    });
  } catch (err) {
    console.error('Error parsing PDF:', err);
    res.status(500).json({ success: false, message: 'Failed to parse PDF file: ' + err.message });
  }
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

    // Keep snapshot of pre-existing students so imported rows from the same sheet never overwrite each other
    const existingStudentsSnapshot = clearExisting ? [] : [...db.students];
    const importedStudents = [];
    const generatedReceipts = [];
    const timestamp = new Date().toISOString();

    for (let i = 0; i < rawStudents.length; i++) {
      const row = normalizeStudentRow(rawStudents[i], i);
      const studentIdx = db.students.length + 1;
      const yr = row.admissionSession ? row.admissionSession.split('-')[0] : '2024';

      // Roll Number / Enrollment handling:
      // DO NOT auto-generate fake roll numbers if left blank in Excel! Keep empty string "" if not in Excel.
      const finalRoll = (row.enrollmentNo || row.rollNo || '').toUpperCase();
      const regNo = `REG-IMP-${yr}-${Math.floor(1000 + Math.random() * 9000)}`;

      const courseFee = Number(row.totalFee || row.studentFee || 0);
      const schAmt = Number(row.scholarshipAmount || 0);
      const netFee = Math.max(0, courseFee - schAmt);

      let paid = 0;
      if (row.totalPaid !== undefined && row.totalPaid !== null) {
        paid = Number(row.totalPaid);
      } else {
        paid = courseFee > 0 ? courseFee : 0;
      }

      const due = Math.max(0, netFee - paid);

      const docList = Array.isArray(row.docsSubmitted) ? row.docsSubmitted.join(', ') : (row.docsSubmitted || 'Pending Document Submission');
      const docStatusMap = {
        doc10th: docList.toLowerCase().includes('10th') ? 'Verified' : 'Pending',
        doc12th: docList.toLowerCase().includes('12th') ? 'Verified' : 'Pending',
        aadhar: docList.toLowerCase().includes('aadhaar') || docList.toLowerCase().includes('aadhar') ? 'Verified' : 'Pending'
      };

      const newStudent = {
        id: `std-leg-${Date.now()}-${i}-${Math.floor(100 + Math.random() * 900)}`,
        rollNo: finalRoll,
        registrationNo: regNo,
        studentName: row.studentName || `Student ${studentIdx}`,
        fullName: row.studentName || `Student ${studentIdx}`,
        fatherName: row.fatherName || '',
        motherName: row.motherName || '',
        dob: row.dob || '',
        gender: row.gender || 'Male',
        contact: row.phone || '',
        phone: row.phone || '',
        email: row.email || '',
        address: row.address || '',
        aadhaarNo: row.aadhaarNo || '',
        samagraId: row.samagraId || '',
        enrollmentNo: row.enrollmentNo || finalRoll,
        abcId: row.abcId || '',
        mptassId: row.mpTassId || '',
        mptassPassword: row.mpTassPassword || '',
        otrId: row.otrId || '',
        debId: row.debId || '',
        scholerId: row.scholerId || '',
        userId: row.userId || '',
        medium: row.medium || 'Hindi',
        admissionSession: row.admissionSession || '2024-2025',
        admissionSatra: row.admissionSatra || 'July',
        admissionDate: row.admissionDate || `${yr}-07-15`,
        universityName: row.universityName || 'Maharaja Chhatrasal Bundelkhand University (MCBU)',
        collegeName: row.collegeName || 'PKC Education & Consultancy',
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

      // Bulk Import: Every row in the uploaded file is an individual student admission record.
      // We only update an existing student if clearExisting is false AND:
      // 1. Explicit row.id matches an existing student in database
      // 2. OR non-empty finalRoll, courseName, and admissionSession all match an already-existing student
      let existingIndex = -1;
      if (!clearExisting && existingStudentsSnapshot.length > 0) {
        existingIndex = db.students.findIndex(s => {
          if (row.id && s.id === row.id) return true;
          if (finalRoll && s.rollNo && s.rollNo.toUpperCase() === finalRoll &&
              s.courseName && newStudent.courseName && s.courseName.trim().toLowerCase() === newStudent.courseName.trim().toLowerCase() &&
              s.admissionSession === newStudent.admissionSession) {
            return true;
          }
          return false;
        });
      }

      if (existingIndex !== -1) {
        const existingStudent = db.students[existingIndex];
        db.students[existingIndex] = {
          ...existingStudent,
          ...newStudent,
          id: existingStudent.id,
          rollNo: finalRoll || existingStudent.rollNo || '',
          enrollmentNo: row.enrollmentNo || finalRoll || existingStudent.enrollmentNo || ''
        };
        importedStudents.push(db.students[existingIndex]);
      } else {
        db.students.push(newStudent);
        importedStudents.push(newStudent);
      }

      // Create Payment Ledger entry if fee was paid
      if (paid > 0) {
        const receiptNo = String(getNextReceiptNumber(db));
        const receipt = {
          id: `pay-leg-${Date.now()}-${i}-${Math.floor(100 + Math.random() * 900)}`,
          receiptNo: receiptNo,
          studentId: existingIndex !== -1 ? db.students[existingIndex].id : newStudent.id,
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

// GET all students endpoint with search & filters
app.get('/api/students', (req, res) => {
  try {
    const db = readDB();
    const { course = 'all', semester = 'all', timeframe = 'all', search = '', session = 'all', university = 'all', college = 'all' } = req.query;
    let list = [...(db.students || [])];

    const now = new Date();
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const oneMonthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const oneYearAgo = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);

    const timeframeCounts = {
      all: list.length,
      week: list.filter(s => s.admissionTimestamp && new Date(s.admissionTimestamp) >= oneWeekAgo).length,
      month: list.filter(s => s.admissionTimestamp && new Date(s.admissionTimestamp) >= oneMonthAgo).length,
      year: list.filter(s => s.admissionTimestamp && new Date(s.admissionTimestamp) >= oneYearAgo).length
    };

    if (course !== 'all') {
      list = list.filter(s => (s.courseId || '').toLowerCase() === course.toLowerCase() || (s.courseName || '').toLowerCase().includes(course.toLowerCase()));
    }

    if (semester !== 'all') {
      list = list.filter(s => String(s.currentSemester) === String(semester) || String(s.currentClass).includes(`SEM-${semester}`));
    }

    if (session !== 'all') {
      list = list.filter(s => (s.currentSession || s.admissionSession || '') === session);
    }

    if (university !== 'all') {
      const uTarget = university.toLowerCase();
      list = list.filter(s => (s.universityName || s.collegeName || '').toLowerCase().includes(uTarget) || uTarget.includes((s.universityName || '').toLowerCase()));
    }

    if (college !== 'all') {
      const cTarget = college.toLowerCase();
      list = list.filter(s => (s.collegeName || s.universityName || '').toLowerCase().includes(cTarget) || cTarget.includes((s.collegeName || '').toLowerCase()));
    }

    if (timeframe === 'week') {
      list = list.filter(s => s.admissionTimestamp && new Date(s.admissionTimestamp) >= oneWeekAgo);
    } else if (timeframe === 'month') {
      list = list.filter(s => s.admissionTimestamp && new Date(s.admissionTimestamp) >= oneMonthAgo);
    } else if (timeframe === 'year') {
      list = list.filter(s => s.admissionTimestamp && new Date(s.admissionTimestamp) >= oneYearAgo);
    }

    if (search && search.trim()) {
      const q = search.trim().toLowerCase();
      const cleanNum = q.replace(/[\s-]/g, '');
      list = list.filter(s =>
        (s.fullName || s.studentName || '').toLowerCase().includes(q) ||
        (s.rollNo || '').toLowerCase().includes(q) ||
        (s.registrationNo || '').toLowerCase().includes(q) ||
        (s.fatherName || '').toLowerCase().includes(q) ||
        (s.phone || s.contact || '').includes(q) ||
        (s.aadhaarNo && s.aadhaarNo.replace(/[\s-]/g, '').includes(cleanNum)) ||
        (s.courseName || '').toLowerCase().includes(q) ||
        (s.universityName || '').toLowerCase().includes(q) ||
        (s.collegeName || '').toLowerCase().includes(q) ||
        (s.branch || '').toLowerCase().includes(q)
      );
    }

    res.json({
      success: true,
      students: list,
      timeframeCounts
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Universal Student Lookup Helper by ID, RollNo, EnrollmentNo, RegistrationNo, PrimaryRollNo
function findStudentIndex(students, key) {
  if (!key) return -1;
  const raw = String(key).trim();
  const upper = raw.toUpperCase();
  return (students || []).findIndex(s => {
    if (!s) return false;
    if (s.id && String(s.id).trim() === raw) return true;
    if (s.rollNo && String(s.rollNo).trim().toUpperCase() === upper) return true;
    if (s.enrollmentNo && String(s.enrollmentNo).trim().toUpperCase() === upper) return true;
    if (s.registrationNo && String(s.registrationNo).trim().toUpperCase() === upper) return true;
    if (s.primaryRollNo && String(s.primaryRollNo).trim().toUpperCase() === upper) return true;
    return false;
  });
}

function findStudent(students, key) {
  const idx = findStudentIndex(students, key);
  return idx !== -1 ? students[idx] : null;
}

app.get('/api/students/:rollNo', (req, res) => {
  try {
    const db = readDB();
    const rawKey = (req.params.rollNo || '').trim();
    const student = findStudent(db.students, rawKey);
    
    if (!student) {
      return res.status(404).json({ success: false, message: 'Student not found with this Roll / Reg No.' });
    }

    const sRoll = student.rollNo ? student.rollNo.toUpperCase() : '';
    const sId = student.id || '';
    const payments = (db.fee_payments || []).filter(p => 
      (sRoll && p.rollNo && p.rollNo.toUpperCase() === sRoll) ||
      (sId && p.studentId && p.studentId === sId)
    );
    const results = (db.results || []).filter(r => 
      (sRoll && r.rollNo && r.rollNo.toUpperCase() === sRoll) ||
      (sId && r.studentId && r.studentId === sId)
    );

    res.json({
      success: true,
      student: { ...student, payments, results }
    });
  } catch (err) {
    console.error('Error fetching student profile:', err);
    res.status(500).json({ success: false, message: 'Server error: ' + err.message });
  }
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
  try {
    const db = readDB();
    const rawKey = (req.params.rollNo || '').trim();
    const index = findStudentIndex(db.students, rawKey);

    if (index === -1) {
      return res.status(404).json({ success: false, message: 'Student not found' });
    }

    const existing = db.students[index];
    const body = req.body;

    // Handle potential Roll Number change (Optional / Empty allowed)
    let newRoll = existing.rollNo || '';
    if (body.rollNo !== undefined) {
      newRoll = String(body.rollNo || '').trim().toUpperCase();
    } else if (body.Roll_No !== undefined) {
      newRoll = String(body.Roll_No || '').trim().toUpperCase();
    }

    if (newRoll && newRoll !== (existing.rollNo || '').toUpperCase() && db.students.some((s, idx) => idx !== index && s.rollNo && s.rollNo.toUpperCase() === newRoll)) {
      return res.status(400).json({ success: false, message: `Roll Number ${newRoll} is already in use by another student!` });
    }

    // Update student fields
    const updatedStudent = {
      ...existing,
      rollNo: newRoll,
      fullName: body.fullName || body.studentName || body.Student_Name || existing.fullName,
      studentName: body.fullName || body.studentName || body.Student_Name || existing.studentName || existing.fullName,
      motherName: body.motherName !== undefined ? body.motherName : (body.mother_name !== undefined ? body.mother_name : existing.motherName),
      fatherName: body.fatherName || body.father_name || body.Father_Name || existing.fatherName,
      dob: body.dob !== undefined ? body.dob : (body.Date_Of_Birth !== undefined ? body.Date_Of_Birth : existing.dob),
      gender: body.gender || body.Gender || existing.gender,
      bloodGroup: body.bloodGroup || body.Blood_Group || existing.bloodGroup,
      phone: body.phone !== undefined ? body.phone : (body.contact !== undefined ? body.contact : existing.phone),
      contact: body.phone !== undefined ? body.phone : (body.contact !== undefined ? body.contact : existing.contact || existing.phone),
      email: body.email !== undefined ? body.email : (body.Email_ID !== undefined ? body.Email_ID : existing.email),
      address: body.address !== undefined ? body.address : (body.Address !== undefined ? body.Address : existing.address),
      aadhaarNo: body.aadhaarNo !== undefined ? body.aadhaarNo : (body.aadhaar_no !== undefined ? body.aadhaar_no : (body.aadharNo !== undefined ? body.aadharNo : existing.aadhaarNo)),
      enrollmentNo: body.enrollmentNo !== undefined ? String(body.enrollmentNo).trim().toUpperCase() : (body.Enrollment_No !== undefined ? String(body.Enrollment_No).trim().toUpperCase() : existing.enrollmentNo),
      samagraId: body.samagraId !== undefined ? body.samagraId : (body.samagra_id !== undefined ? body.samagra_id : existing.samagraId),
      abcId: body.abcId !== undefined ? body.abcId : (body.abc_id !== undefined ? body.abc_id : existing.abcId),
      mptassId: body.mptassId !== undefined ? body.mptassId : (body.mpTassId !== undefined ? body.mpTassId : (body.mptass_id !== undefined ? body.mptass_id : existing.mptassId)),
      mptassPassword: body.mptassPassword !== undefined ? body.mptassPassword : (body.mpTassPassword !== undefined ? body.mpTassPassword : existing.mptassPassword),
      otrId: body.otrId !== undefined ? body.otrId : (body.otr_id !== undefined ? body.otr_id : existing.otrId),
      debId: body.debId !== undefined ? body.debId : (body.deb_id !== undefined ? body.deb_id : existing.debId),
      scholarId: body.scholarId !== undefined ? body.scholarId : (body.scholerId !== undefined ? body.scholerId : (body.scholer_id !== undefined ? body.scholer_id : existing.scholarId)),
      scholerId: body.scholarId !== undefined ? body.scholarId : (body.scholerId !== undefined ? body.scholerId : (body.scholer_id !== undefined ? body.scholer_id : existing.scholerId)),
      userId: body.userId !== undefined ? body.userId : (body.user_id !== undefined ? body.user_id : existing.userId),
      studentImage: body.studentImage !== undefined ? body.studentImage : (body.photo !== undefined ? body.photo : existing.studentImage),
      photo: body.photo !== undefined ? body.photo : (body.studentImage !== undefined ? body.studentImage : existing.photo),
      universityName: body.universityName || body.University_Name || existing.universityName,
      collegeName: body.collegeName || body.College_Name || existing.collegeName,
      courseName: body.courseName || body.Course_Name || existing.courseName,
      branch: body.branch || body.Branch || existing.branch,
      courseType: body.courseType || body.Course_Type || existing.courseType,
      courseMode: body.courseMode || body.Course_Mode || existing.courseMode,
      socialCategory: body.socialCategory || body.Social_category || existing.socialCategory,
      admissionSession: body.admissionSession || body.Admission_Session || body.currentSession || existing.admissionSession,
      admissionSatra: body.admissionSatra || body.Admission_Satra || existing.admissionSatra,
      admissionDate: body.admissionDate || body.Admission_Date || existing.admissionDate,
      currentSession: body.currentSession || body.Current_session || existing.currentSession,
      currentClass: body.currentClass || body.Current_class || existing.currentClass,
      currentSemester: Number(body.currentSemester) || existing.currentSemester,
      manualSemester: body.manualSemester !== undefined ? Number(body.manualSemester) : existing.manualSemester,
      totalFee: (body.totalFee !== undefined && body.totalFee !== '') ? Math.max(0, Number(body.totalFee) || 0) : ((body.academicFee !== undefined && body.academicFee !== '') ? Math.max(0, Number(body.academicFee) || 0) : (existing.totalFee !== undefined ? Number(existing.totalFee) : 0)),
      studentFee: (body.totalFee !== undefined && body.totalFee !== '') ? Math.max(0, Number(body.totalFee) || 0) : ((body.academicFee !== undefined && body.academicFee !== '') ? Math.max(0, Number(body.academicFee) || 0) : (existing.studentFee !== undefined ? Number(existing.studentFee) : (existing.totalFee || 0))),
      courseFee: (body.academicFee !== undefined && body.academicFee !== '') ? Math.max(0, Number(body.academicFee) || 0) : ((body.totalFee !== undefined && body.totalFee !== '') ? Math.max(0, Number(body.totalFee) || 0) : (existing.courseFee !== undefined ? Number(existing.courseFee) : (existing.studentFee || 0))),
      academicFee: (body.academicFee !== undefined && body.academicFee !== '') ? Math.max(0, Number(body.academicFee) || 0) : ((body.totalFee !== undefined && body.totalFee !== '') ? Math.max(0, Number(body.totalFee) || 0) : (existing.academicFee !== undefined ? Number(existing.academicFee) : (existing.studentFee || 0))),
      scholarshipAmount: (body.scholarshipAmount !== undefined && body.scholarshipAmount !== '') ? Math.max(0, Number(body.scholarshipAmount) || 0) : (existing.scholarshipAmount || 0),
      admissionYear: Number(body.admissionYear) || existing.admissionYear,
      remark: body.remark !== undefined ? body.remark : (body.Remark !== undefined ? body.Remark : existing.remark),
      status: body.status || existing.status || 'Active',
      updatedAt: new Date().toISOString()
    };

    if (updatedStudent.studentImage) {
      if (!updatedStudent.documents) updatedStudent.documents = { ...(existing.documents || {}) };
      updatedStudent.documents.student_image = updatedStudent.studentImage;
      updatedStudent.documents.photo = updatedStudent.studentImage;
    }

    // Re-calculate net fee and balance due considering scholarship
    const schAmt = Number(updatedStudent.scholarshipAmount) || 0;
    const acadFee = Number(updatedStudent.academicFee !== undefined ? updatedStudent.academicFee : (updatedStudent.totalFee || 0));
    updatedStudent.totalFee = acadFee + schAmt;
    updatedStudent.netTotalFee = updatedStudent.totalFee;
    updatedStudent.balanceDue = Math.max(0, updatedStudent.totalFee - (Number(updatedStudent.totalPaid) || 0));

    // If roll number changed, update linked fee_payments and dual references
    if (newRoll && newRoll !== (existing.rollNo || '').toUpperCase()) {
      (db.fee_payments || []).forEach(p => {
        if (p.rollNo && p.rollNo.toUpperCase() === (existing.rollNo || '').toUpperCase()) {
          p.rollNo = newRoll;
        }
      });
      db.students.forEach(s => {
        if (s.primaryRollNo && s.primaryRollNo.toUpperCase() === (existing.rollNo || '').toUpperCase()) {
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
  } catch (err) {
    console.error('Error updating student:', err);
    res.status(500).json({ success: false, message: 'Failed to update student: ' + err.message });
  }
});

// Dedicated endpoint to upload/update student photo
app.post('/api/students/:rollNo/photo', upload.single('photo'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No photo file uploaded.' });
    }
    const db = readDB();
    const rawKey = (req.params.rollNo || '').trim();
    const roll = rawKey.toUpperCase();
    const student = db.students.find(s => 
      (s.id && s.id === rawKey) ||
      (s.rollNo && s.rollNo.toUpperCase() === roll) ||
      (s.enrollmentNo && s.enrollmentNo.toUpperCase() === roll) ||
      (s.registrationNo && s.registrationNo.toUpperCase() === roll)
    );

    if (!student) {
      return res.status(404).json({ success: false, message: `Student ${rawKey} not found.` });
    }

    const photoUrl = `/uploads/documents/${req.file.filename}`;
    student.studentImage = photoUrl;
    student.photo = photoUrl;
    if (!student.documents) student.documents = {};
    student.documents.student_image = photoUrl;
    student.documents.photo = photoUrl;
    student.updatedAt = new Date().toISOString();

    writeDB(db);

    res.json({
      success: true,
      message: `Photo uploaded successfully for ${student.fullName || student.rollNo}!`,
      photoUrl,
      student
    });
  } catch (err) {
    console.error('Error uploading student photo:', err);
    res.status(500).json({ success: false, message: 'Failed to upload photo: ' + err.message });
  }
});

// Dedicated endpoint to remove student photo
app.delete('/api/students/:rollNo/photo', (req, res) => {
  try {
    const db = readDB();
    const rawKey = (req.params.rollNo || '').trim();
    const roll = rawKey.toUpperCase();
    const student = db.students.find(s => 
      (s.id && s.id === rawKey) ||
      (s.rollNo && s.rollNo.toUpperCase() === roll) ||
      (s.enrollmentNo && s.enrollmentNo.toUpperCase() === roll) ||
      (s.registrationNo && s.registrationNo.toUpperCase() === roll)
    );

    if (!student) {
      return res.status(404).json({ success: false, message: `Student ${rawKey} not found.` });
    }

    student.studentImage = '';
    student.photo = '';
    if (student.documents) {
      student.documents.student_image = '';
      student.documents.photo = '';
    }
    student.updatedAt = new Date().toISOString();

    writeDB(db);

    res.json({
      success: true,
      message: `Photo removed successfully for ${student.fullName || student.rollNo}!`,
      student
    });
  } catch (err) {
    console.error('Error removing student photo:', err);
    res.status(500).json({ success: false, message: 'Failed to remove photo: ' + err.message });
  }
});

// Dedicated endpoint to promote individual student to next semester / year
app.post('/api/students/:rollNo/promote', (req, res) => {
  try {
    const db = readDB();
    const rawKey = (req.params.rollNo || '').trim();
    const index = findStudentIndex(db.students, rawKey);

    if (index === -1) {
      return res.status(404).json({ success: false, message: 'Student not found' });
    }

    const student = db.students[index];
    const rawTargetSem = req.body.targetSemester !== undefined ? req.body.targetSemester : req.body.nextSemester;
    const currentSem = Number(student.currentSemester) || 1;
    const nextSem = rawTargetSem !== undefined && rawTargetSem !== '' ? Number(rawTargetSem) : currentSem + 1;
    const nextClass = req.body.targetClass || req.body.nextClass || `SEM-${nextSem}`;
    const nextSession = req.body.nextSession;
    const promotionDate = req.body.promotionDate || new Date().toISOString().split('T')[0];
    const remark = req.body.remark || `Promoted to ${nextClass}`;

    const prevClass = student.currentClass || `SEM-${currentSem}`;
    const prevSession = student.currentSession || student.admissionSession || '';

    // Update student fields
    student.currentSemester = nextSem;
    student.manualSemester = nextSem;
    student.manualPromotion = true;
    student.currentClass = String(nextClass).trim();
    if (nextSession) {
      student.currentSession = String(nextSession).trim();
    }
    student.promotedAt = new Date().toISOString();
    student.updatedAt = new Date().toISOString();

    // Log in semester history
    if (!Array.isArray(student.semesterHistory)) student.semesterHistory = [];
    student.semesterHistory.push({
      fromSemester: currentSem,
      toSemester: nextSem,
      className: nextClass,
      promotedAt: new Date().toISOString(),
      remark
    });

    // Log in promotion history
    if (!Array.isArray(student.promotionHistory)) student.promotionHistory = [];
    student.promotionHistory.push({
      id: 'PROM-' + Date.now(),
      date: promotionDate,
      fromClass: prevClass,
      toClass: student.currentClass,
      fromSession: prevSession,
      toSession: student.currentSession,
      promotedAt: new Date().toISOString(),
      remark
    });

    // Also update any linked dual enrollment secondary student record if applicable
    if (student.linkedCourses && Array.isArray(student.linkedCourses)) {
      student.linkedCourses.forEach(l => {
        if (l.rollNo) {
          const lIdx = findStudentIndex(db.students, l.rollNo);
          if (lIdx !== -1) {
            db.students[lIdx].currentSemester = nextSem;
            db.students[lIdx].currentClass = nextClass;
            db.students[lIdx].manualSemester = nextSem;
            if (nextSession) db.students[lIdx].currentSession = student.currentSession;
          }
        }
      });
    }

    writeDB(db);

    res.json({
      success: true,
      message: `🎉 Student ${student.fullName || student.studentName} successfully promoted to ${student.currentClass || ('SEM-' + student.currentSemester)}!`,
      student
    });
  } catch (err) {
    console.error('Error promoting student:', err);
    res.status(500).json({ success: false, message: 'Failed to promote student: ' + err.message });
  }
});

// Dedicated endpoint to batch promote multiple students
app.post('/api/students/batch-promote', (req, res) => {
  try {
    const db = readDB();
    const { rollNumbers, nextSemester, nextClass, nextSession, promotionDate, remark } = req.body;

    if (!Array.isArray(rollNumbers) || rollNumbers.length === 0) {
      return res.status(400).json({ success: false, message: 'No students selected for promotion.' });
    }

    let promotedCount = 0;
    const promotedStudents = [];

    rollNumbers.forEach(roll => {
      const idx = findStudentIndex(db.students, roll);
      if (idx !== -1) {
        const student = db.students[idx];
        const prevClass = student.currentClass || `SEM-${student.currentSemester || 1}`;
        const prevSession = student.currentSession || student.admissionSession || '';

        if (nextSemester !== undefined && nextSemester !== '') {
          student.currentSemester = Number(nextSemester);
          student.manualSemester = Number(nextSemester);
        }
        if (nextClass) {
          student.currentClass = String(nextClass).trim();
        } else if (nextSemester) {
          student.currentClass = `SEM-${nextSemester}`;
        }
        if (nextSession) {
          student.currentSession = String(nextSession).trim();
        }
        student.updatedAt = new Date().toISOString();

        if (!student.promotionHistory) student.promotionHistory = [];
        student.promotionHistory.push({
          id: 'PROM-' + Date.now() + '-' + promotedCount,
          date: promotionDate || new Date().toISOString().split('T')[0],
          fromClass: prevClass,
          toClass: student.currentClass,
          fromSession: prevSession,
          toSession: student.currentSession,
          promotedAt: new Date().toISOString(),
          remark: remark || 'Batch promoted to next academic term'
        });

        promotedStudents.push(student);
        promotedCount++;
      }
    });

    writeDB(db);

    res.json({
      success: true,
      message: `🎉 Successfully promoted ${promotedCount} students to ${nextClass || ('SEM-' + nextSemester)}!`,
      promotedCount,
      students: promotedStudents
    });
  } catch (err) {
    console.error('Error in batch promote:', err);
    res.status(500).json({ success: false, message: 'Batch promotion failed: ' + err.message });
  }
});

// Dedicated endpoint to cancel student admission
app.post('/api/students/:rollNo/cancel-admission', (req, res) => {
  try {
    const db = readDB();
    const rawKey = (req.params.rollNo || '').trim();
    const student = findStudent(db.students, rawKey);

    if (!student) {
      return res.status(404).json({ success: false, message: `Student ${rawKey} not found.` });
    }

    const { reason, cancelledBy, refundPaid, refundNotes } = req.body || {};

    student.status = 'Cancelled';
    student.cancel = 'Yes';
    student.cancellationDate = req.body.cancellationDate || new Date().toISOString().split('T')[0];
    student.cancellationTimestamp = new Date().toISOString();
    student.cancellationReason = (reason || 'Admission cancelled by administration').trim();
    student.cancelledBy = (cancelledBy || 'Admin').trim();

    // Financial refund details
    if (student.refundPaid === undefined || student.refundPaid === null) {
      student.refundPaid = Number(refundPaid || 0);
    }
    if (!Array.isArray(student.refundHistory)) {
      student.refundHistory = [];
    }
    if (Number(refundPaid) > 0) {
      student.refundHistory.push({
        id: 'REF-' + Date.now(),
        amount: Number(refundPaid),
        paymentMode: req.body.paymentMode || 'Cash',
        referenceNo: req.body.referenceNo || `REF-${Date.now().toString().slice(-6)}`,
        date: student.cancellationDate,
        recordedBy: student.cancelledBy,
        remarks: refundNotes || 'Initial refund on cancellation'
      });
    }

    student.updatedAt = new Date().toISOString();
    writeDB(db);

    res.json({
      success: true,
      message: `Admission successfully cancelled for ${student.fullName || student.rollNo}!`,
      student
    });
  } catch (err) {
    console.error('Error cancelling student admission:', err);
    res.status(500).json({ success: false, message: 'Failed to cancel admission: ' + err.message });
  }
});

// Dedicated endpoint to restore student admission
app.post('/api/students/:rollNo/restore-admission', (req, res) => {
  try {
    const db = readDB();
    const rawKey = (req.params.rollNo || '').trim();
    const student = findStudent(db.students, rawKey);

    if (!student) {
      return res.status(404).json({ success: false, message: `Student ${rawKey} not found.` });
    }

    student.status = 'Active';
    student.cancel = '';
    student.restoredAt = new Date().toISOString();
    student.restoredBy = req.body?.restoredBy || 'Admin';
    student.updatedAt = new Date().toISOString();

    writeDB(db);

    res.json({
      success: true,
      message: `Admission restored to Active for ${student.fullName || student.rollNo}!`,
      student
    });
  } catch (err) {
    console.error('Error restoring student admission:', err);
    res.status(500).json({ success: false, message: 'Failed to restore admission: ' + err.message });
  }
});

// Dedicated endpoint to record refund payment for a student
app.post('/api/students/:rollNo/record-refund', (req, res) => {
  try {
    const db = readDB();
    const rawKey = (req.params.rollNo || '').trim();
    const student = findStudent(db.students, rawKey);

    if (!student) {
      return res.status(404).json({ success: false, message: `Student ${rawKey} not found.` });
    }

    const { amount, paymentMode, referenceNo, remarks, recordedBy, date } = req.body || {};
    const refundAmt = Number(amount) || 0;
    if (refundAmt <= 0) {
      return res.status(400).json({ success: false, message: 'Valid refund amount is required.' });
    }

    student.refundPaid = Number(student.refundPaid || 0) + refundAmt;
    if (!Array.isArray(student.refundHistory)) {
      student.refundHistory = [];
    }

    const refundEntry = {
      id: 'REF-' + Date.now(),
      amount: refundAmt,
      paymentMode: paymentMode || 'Cash',
      referenceNo: referenceNo || `REF-${Date.now().toString().slice(-6)}`,
      date: date || new Date().toISOString().split('T')[0],
      recordedBy: recordedBy || 'Admin',
      remarks: remarks || 'Fee refund payment'
    };
    student.refundHistory.push(refundEntry);
    student.updatedAt = new Date().toISOString();

    writeDB(db);

    res.json({
      success: true,
      message: `Refund of ₹${refundAmt.toLocaleString('en-IN')} recorded successfully!`,
      student,
      refundEntry
    });
  } catch (err) {
    console.error('Error recording refund payment:', err);
    res.status(500).json({ success: false, message: 'Failed to record refund: ' + err.message });
  }
});

// Dedicated endpoint to attach an additional / dual course to an existing student
app.post('/api/students/:rollNo/add-course', (req, res) => {
  const db = readDB();
  const rawKey = (req.params.rollNo || '').trim();
  const existing = findStudent(db.students, rawKey);

  if (!existing) {
    return res.status(404).json({ success: false, message: 'Student not found' });
  }

  const sec = req.body;
  const secCourseName = (sec.courseName || sec.Course_Name || sec.branch || '').trim();
  if (!secCourseName) {
    return res.status(400).json({ success: false, message: 'Course name is required' });
  }

  const baseRoll = (existing.primaryRollNo || existing.rollNo || existing.id).trim().toUpperCase();
  const secUnivName = (sec.universityName || sec.University_Name || existing.universityName || 'University').trim();
  const secCollegeName = (sec.collegeName || sec.College_Name || existing.collegeName || 'College').trim();
  const secCourseType = sec.courseType || sec.Course_Type || 'Diploma';
  const secBranch = sec.branch || sec.Branch || 'General';
  const secCode = (secBranch !== 'General' ? secBranch : secCourseName).replace(/[^a-zA-Z0-9]/g, '').slice(0, 5).toUpperCase() || 'PROG';

  let secCandidateRoll = `${baseRoll}-${secCode}`;
  let counter = 2;
  while (db.students.some(s => (s.rollNo || '').toUpperCase() === secCandidateRoll.toUpperCase())) {
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
    id: `std-dual-${Date.now()}-${Math.floor(Math.random()*1000)}`,
    isSecondaryCourse: true,
    primaryRollNo: existing.rollNo || existing.id,
    primaryStudentId: existing.id,
    rollNo: secCandidateRoll,
    registrationNo: `REG-DUAL-${Date.now().toString().slice(-6)}`,
    enrollmentNo: sec.enrollmentNo || existing.enrollmentNo || '',
    fullName: existing.fullName,
    studentName: existing.studentName || existing.fullName,
    fatherName: existing.fatherName,
    motherName: existing.motherName,
    contact: existing.contact,
    phone: existing.phone,
    email: existing.email,
    category: existing.category,
    dob: existing.dob,
    gender: existing.gender,
    address: existing.address,
    aadhaarNo: existing.aadhaarNo,
    samagraId: existing.samagraId,
    abcId: existing.abcId,
    mptassId: existing.mptassId,
    status: 'Active',
    courseName: secCourseName,
    branch: secBranch,
    courseType: secCourseType,
    universityName: secUnivName,
    collegeName: secCollegeName,
    courseFee: secCourseFee,
    studentFee: secCourseFee,
    academicFee: secCourseFee,
    admissionFee: secAdmissionFee,
    totalFee: secGrandTotal,
    netTotalFee: secNetTotal,
    scholarshipAmount: secScholarship,
    totalPaid: secPaid,
    balanceDue: secBalanceDue,
    currentSemester: 1,
    currentClass: 'SEM-1',
    admissionDate,
    admissionYear,
    admissionSession: sec.admissionSession || existing.admissionSession || '2025-2026',
    admissionSatra: sec.admissionSatra || existing.admissionSatra || 'July',
    remark: sec.remark || `Dual enrollment attached to primary roll ${existing.rollNo || existing.id}`,
    documents: existing.documents || {},
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  db.students.push(addedSecondaryStudent);
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
  const rawKey = (req.params.rollNo || '').trim();
  const student = findStudent(db.students, rawKey);

  if (!student) {
    return res.status(404).json({ success: false, message: 'Student not found' });
  }

  const rawTargetSem = req.body.targetSemester !== undefined ? req.body.targetSemester : req.body.nextSemester;
  const currentSem = Number(student.currentSemester) || 1;
  const nextSem = rawTargetSem !== undefined && rawTargetSem !== '' ? Number(rawTargetSem) : currentSem + 1;
  const nextClass = req.body.targetClass || req.body.nextClass || `SEM-${nextSem}`;
  const nextSession = req.body.nextSession;
  const promotionDate = req.body.promotionDate || new Date().toISOString().split('T')[0];
  const remark = req.body.remark || `Promoted to ${nextClass}`;

  const prevClass = student.currentClass || `SEM-${currentSem}`;
  const prevSession = student.currentSession || student.admissionSession || '';

  student.currentSemester = nextSem;
  student.manualSemester = nextSem;
  student.manualPromotion = true;
  student.currentClass = String(nextClass).trim();
  if (nextSession) {
    student.currentSession = String(nextSession).trim();
  }
  student.promotedAt = new Date().toISOString();
  student.updatedAt = new Date().toISOString();

  if (!Array.isArray(student.semesterHistory)) {
    student.semesterHistory = [];
  }
  student.semesterHistory.push({
    fromSemester: currentSem,
    toSemester: nextSem,
    className: nextClass,
    promotedAt: new Date().toISOString(),
    remark
  });

  if (!Array.isArray(student.promotionHistory)) {
    student.promotionHistory = [];
  }
  student.promotionHistory.push({
    id: 'PROM-' + Date.now(),
    date: promotionDate,
    fromClass: prevClass,
    toClass: student.currentClass,
    fromSession: prevSession,
    toSession: student.currentSession,
    promotedAt: new Date().toISOString(),
    remark
  });

  if (student.linkedCourses && Array.isArray(student.linkedCourses)) {
    student.linkedCourses.forEach(l => {
      if (l.rollNo) {
        const lIdx = findStudentIndex(db.students, l.rollNo);
        if (lIdx !== -1) {
          db.students[lIdx].currentSemester = nextSem;
          db.students[lIdx].currentClass = nextClass;
          db.students[lIdx].manualSemester = nextSem;
          if (nextSession) db.students[lIdx].currentSession = student.currentSession;
        }
      }
    });
  }

  writeDB(db);

  res.json({
    success: true,
    message: `🎉 Student ${student.fullName || student.studentName} promoted to ${student.currentClass} successfully!`,
    student: {
      rollNo: student.rollNo,
      currentSemester: student.currentSemester,
      currentClass: student.currentClass,
      currentSession: student.currentSession,
      promotedAt: student.promotedAt
    }
  });
});

// Set Student Fee (Academic Fee & Purpose entries with Multi-entry support)
app.put('/api/students/:rollNo/set-fee', (req, res) => {
  const db = readDB();
  const rawKey = (req.params.rollNo || '').trim();
  const student = findStudent(db.students, rawKey);

  if (!student) {
    return res.status(404).json({ success: false, message: 'Student not found' });
  }

  const {
    academicFee,
    remark,
    feeDate,
    currentClass,
    paymentMode,
    refNo,
    receivedBy,
    receiptNo,
    purpose,
    id,
    action,
    entries
  } = req.body;

  if (!Array.isArray(student.academicFeeHistory)) {
    student.academicFeeHistory = [];
    if (Number(student.academicFee) > 0) {
      student.academicFeeHistory.push({
        id: 'CF-' + (student.id || student.rollNo || '1'),
        receiptNo: `CF-${student.rollNo || '001'}`,
        date: student.academicFeeDate || new Date().toISOString().split('T')[0],
        feeDate: student.academicFeeDate || new Date().toISOString().split('T')[0],
        currentClass: student.currentClass || 'SEM-1',
        purpose: 'Center Fee',
        paymentMode: 'Official Record',
        refNo: '-',
        receivedBy: 'Admin Desk',
        amount: Number(student.academicFee),
        amountPaid: Number(student.academicFee),
        remark: student.remark || 'Center Fee'
      });
    }
  }

  const dateStr = feeDate ? (typeof feeDate === 'string' && feeDate.includes('T') ? feeDate.split('T')[0] : feeDate) : new Date().toISOString().split('T')[0];
  student.academicFeeDate = dateStr;

  if (Array.isArray(entries) && entries.length > 0) {
    // Multiple entries passed together!
    entries.forEach((entry, idx) => {
      const amt = Number(entry.amount || entry.academicFee || entry.amountPaid) || 0;
      if (amt > 0) {
        const eDate = entry.feeDate || dateStr;
        student.academicFeeHistory.push({
          id: 'CF-' + Date.now() + '-' + idx + '-' + Math.random().toString(36).substr(2, 4),
          receiptNo: entry.receiptNo || `CF-${student.rollNo || getNextReceiptNumber(db)}-${Date.now().toString().slice(-4)}${idx > 0 ? ('-' + (idx + 1)) : ''}`,
          date: eDate,
          feeDate: eDate,
          currentClass: entry.currentClass || currentClass || student.currentClass || 'SEM-1',
          purpose: entry.purpose || 'Center Fee',
          paymentMode: entry.paymentMode || 'Official Record',
          refNo: entry.refNo || '-',
          receivedBy: entry.receivedBy || 'Admin Desk',
          amount: amt,
          amountPaid: amt,
          remark: entry.remark || ''
        });
      }
    });
  } else if (action === 'update' || (id && student.academicFeeHistory.some(e => e.id === id || e.receiptNo === id))) {
    // Update existing entry
    const targetIdx = student.academicFeeHistory.findIndex(e => e.id === id || e.receiptNo === id);
    const amt = Number(academicFee) >= 0 ? Number(academicFee) : 0;
    if (targetIdx !== -1) {
      student.academicFeeHistory[targetIdx] = {
        ...student.academicFeeHistory[targetIdx],
        amount: amt,
        amountPaid: amt,
        purpose: purpose || student.academicFeeHistory[targetIdx].purpose || 'Center Fee',
        feeDate: dateStr,
        date: dateStr,
        currentClass: currentClass || student.academicFeeHistory[targetIdx].currentClass || 'SEM-1',
        remark: remark !== undefined ? remark : (student.academicFeeHistory[targetIdx].remark || '')
      };
    }
  } else {
    // Append single entry
    const amt = Number(academicFee) >= 0 ? Number(academicFee) : 0;
    if (amt > 0) {
      student.academicFeeHistory.push({
        id: 'CF-' + Date.now() + '-' + Math.random().toString(36).substr(2, 4),
        receiptNo: receiptNo || `CF-${student.rollNo || getNextReceiptNumber(db)}-${Date.now().toString().slice(-4)}`,
        date: dateStr,
        feeDate: dateStr,
        currentClass: currentClass || student.currentClass || 'SEM-1',
        purpose: purpose || 'Center Fee',
        paymentMode: paymentMode || 'Official Record',
        refNo: refNo || '-',
        receivedBy: receivedBy || 'Admin Desk',
        amount: amt,
        amountPaid: amt,
        remark: remark || ''
      });
    }
  }

  // Recalculate total academic fee as the sum of all entries
  const totalAcad = student.academicFeeHistory.reduce((sum, e) => {
    const val = Number(e.amountPaid !== undefined ? e.amountPaid : (e.amount || 0));
    return sum + (val > 0 ? val : 0);
  }, 0);

  student.academicFee = totalAcad;
  student.studentFee = totalAcad;
  student.courseFee = totalAcad;
  if (remark !== undefined) {
    student.remark = remark;
  }

  const sch = Number(student.scholarshipAmount) || 0;
  student.totalFee = totalAcad + sch;
  student.netTotalFee = student.totalFee;
  student.balanceDue = Math.max(0, student.totalFee - (Number(student.totalPaid) || 0));
  student.updatedAt = new Date().toISOString();

  writeDB(db);

  res.json({
    success: true,
    message: `Academic fee for ${student.fullName || student.rollNo || 'Student'} updated. Total Set Fee: ₹${totalAcad.toLocaleString('en-IN')}`,
    student
  });
});

// Delete / Reset Academic Center Fee entry or all entries
app.delete(['/api/students/:rollNo/set-fee', '/api/students/:rollNo/set-fee/:entryId'], (req, res) => {
  const db = readDB();
  const rawKey = (req.params.rollNo || '').trim();
  const entryId = req.params.entryId || req.query.entryId || (req.body && req.body.entryId);
  const student = findStudent(db.students, rawKey);

  if (!student) {
    return res.status(404).json({ success: false, message: 'Student not found' });
  }

  if (!Array.isArray(student.academicFeeHistory)) {
    student.academicFeeHistory = [];
  }

  if (entryId && entryId !== 'all') {
    student.academicFeeHistory = student.academicFeeHistory.filter(e => e.id !== entryId && e.receiptNo !== entryId);
  } else {
    student.academicFeeHistory = [];
  }

  const totalAcad = student.academicFeeHistory.reduce((sum, e) => {
    const val = Number(e.amountPaid !== undefined ? e.amountPaid : (e.amount || 0));
    return sum + (val > 0 ? val : 0);
  }, 0);

  student.academicFee = totalAcad;
  student.studentFee = totalAcad;
  student.courseFee = totalAcad;
  const sch = Number(student.scholarshipAmount) || 0;
  student.totalFee = totalAcad + sch;
  student.netTotalFee = student.totalFee;
  student.balanceDue = Math.max(0, student.totalFee - (Number(student.totalPaid) || 0));
  student.updatedAt = new Date().toISOString();

  writeDB(db);

  res.json({
    success: true,
    message: entryId && entryId !== 'all' ? `Fee entry deleted. Remaining Academic Fee: ₹${totalAcad.toLocaleString('en-IN')}` : `Academic center fee reset to ₹0.`,
    student
  });
});

// Set Student Scholarship (Multi-Year Support: 1st Year, 2nd Year, 3rd Year, 4th Year)
app.put('/api/students/:rollNo/set-scholarship', (req, res) => {
  const db = readDB();
  const rawKey = (req.params.rollNo || '').trim();
  const student = findStudent(db.students, rawKey);

  if (!student) {
    return res.status(404).json({ success: false, message: 'Student not found' });
  }

  const { 
    scholarshipAmount, 
    scholarshipYear1, 
    scholarshipYear2, 
    scholarshipYear3, 
    scholarshipYear4,
    year, // 'year1' | 'year2' | 'year3' | 'year4'
    yearLabel, // 'First Year Scholarship'
    amount,
    remark,
    feeDate,
    currentClass,
    paymentMode,
    refNo,
    receivedBy,
    receiptNo,
    purpose
  } = req.body;

  // If specific year update was sent
  if (year && amount !== undefined) {
    const amt = Math.max(0, Number(amount) || 0);
    if (year === 'year1' || year === '1') student.scholarshipYear1 = amt;
    else if (year === 'year2' || year === '2') student.scholarshipYear2 = amt;
    else if (year === 'year3' || year === '3') student.scholarshipYear3 = amt;
    else if (year === 'year4' || year === '4') student.scholarshipYear4 = amt;
  } else {
    // If multi-year individual values were sent
    if (scholarshipYear1 !== undefined) student.scholarshipYear1 = Math.max(0, Number(scholarshipYear1) || 0);
    if (scholarshipYear2 !== undefined) student.scholarshipYear2 = Math.max(0, Number(scholarshipYear2) || 0);
    if (scholarshipYear3 !== undefined) student.scholarshipYear3 = Math.max(0, Number(scholarshipYear3) || 0);
    if (scholarshipYear4 !== undefined) student.scholarshipYear4 = Math.max(0, Number(scholarshipYear4) || 0);

    // If only generic scholarshipAmount was passed and no year fields exist yet
    if (scholarshipAmount !== undefined && scholarshipYear1 === undefined && scholarshipYear2 === undefined) {
      const schAmt = Math.max(0, Number(scholarshipAmount) || 0);
      student.scholarshipYear1 = schAmt;
    }
  }

  // Auto calculate total scholarship from all years
  const y1 = Number(student.scholarshipYear1) || 0;
  const y2 = Number(student.scholarshipYear2) || 0;
  const y3 = Number(student.scholarshipYear3) || 0;
  const y4 = Number(student.scholarshipYear4) || 0;
  const totalSch = y1 + y2 + y3 + y4;
  student.scholarshipAmount = totalSch;

  const dateStr = feeDate ? (typeof feeDate === 'string' && feeDate.includes('T') ? feeDate.split('T')[0] : feeDate) : new Date().toISOString().split('T')[0];
  student.scholarshipDate = dateStr;

  // Maintain audit history of scholarship adjustments
  if (!Array.isArray(student.scholarshipHistory)) {
    student.scholarshipHistory = [];
  }
  const rNo = receiptNo || `SCH-${student.rollNo || getNextReceiptNumber(db)}`;
  const entryAmt = (year && amount !== undefined) ? Math.max(0, Number(amount) || 0) : totalSch;

  student.scholarshipHistory.push({
    id: 'SCH-' + Date.now(),
    receiptNo: rNo,
    date: dateStr,
    feeDate: dateStr,
    currentClass: currentClass || student.currentClass || 'SEM-1',
    purpose: purpose || yearLabel || (year === 'year1' ? 'First Year Scholarship' : year === 'year2' ? 'Second Year Scholarship' : year === 'year3' ? 'Third Year Scholarship' : year === 'year4' ? 'Fourth Year Scholarship' : 'Annual Scholarship Breakdown'),
    year: year || 'All Years',
    yearLabel: yearLabel || (year === 'year1' ? 'First Year Scholarship' : year === 'year2' ? 'Second Year Scholarship' : year === 'year3' ? 'Third Year Scholarship' : year === 'year4' ? 'Fourth Year Scholarship' : 'Annual Scholarship Breakdown'),
    paymentMode: paymentMode || 'Govt Scholarship Grant',
    refNo: refNo || '-',
    receivedBy: receivedBy || 'Admin Desk',
    amount: entryAmt,
    amountPaid: entryAmt,
    year1: y1,
    year2: y2,
    year3: y3,
    year4: y4,
    total: totalSch,
    remark: remark || 'Scholarship updated by admin',
    updatedAt: new Date().toISOString()
  });

  const acadFee = Number(student.academicFee !== undefined ? student.academicFee : (student.studentFee || 0));
  student.totalFee = acadFee + totalSch;
  student.netTotalFee = student.totalFee;
  student.balanceDue = Math.max(0, student.totalFee - (Number(student.totalPaid) || 0));
  student.updatedAt = new Date().toISOString();

  writeDB(db);

  res.json({
    success: true,
    message: `Scholarship for ${student.fullName || student.rollNo || 'Student'} updated. Total: ₹${totalSch.toLocaleString('en-IN')}`,
    student
  });
});

// Delete / Reset Scholarship Entry or Year
app.delete('/api/students/:rollNo/scholarships/:idOrYear', (req, res) => {
  const db = readDB();
  const rawKey = (req.params.rollNo || '').trim();
  const idOrYear = (req.params.idOrYear || '').trim().toLowerCase();
  const student = findStudent(db.students, rawKey);

  if (!student) {
    return res.status(404).json({ success: false, message: 'Student not found' });
  }

  if (idOrYear === 'year1' || idOrYear === '1') {
    student.scholarshipYear1 = 0;
    if (Array.isArray(student.scholarshipHistory)) {
      student.scholarshipHistory = student.scholarshipHistory.filter(h => h.year !== 'year1' && h.year !== '1');
    }
  } else if (idOrYear === 'year2' || idOrYear === '2') {
    student.scholarshipYear2 = 0;
    if (Array.isArray(student.scholarshipHistory)) {
      student.scholarshipHistory = student.scholarshipHistory.filter(h => h.year !== 'year2' && h.year !== '2');
    }
  } else if (idOrYear === 'year3' || idOrYear === '3') {
    student.scholarshipYear3 = 0;
    if (Array.isArray(student.scholarshipHistory)) {
      student.scholarshipHistory = student.scholarshipHistory.filter(h => h.year !== 'year3' && h.year !== '3');
    }
  } else if (idOrYear === 'year4' || idOrYear === '4') {
    student.scholarshipYear4 = 0;
    if (Array.isArray(student.scholarshipHistory)) {
      student.scholarshipHistory = student.scholarshipHistory.filter(h => h.year !== 'year4' && h.year !== '4');
    }
  } else if (idOrYear.startsWith('sch-')) {
    if (Array.isArray(student.scholarshipHistory)) {
      const target = student.scholarshipHistory.find(h => String(h.id || '').toLowerCase() === idOrYear || String(h.receiptNo || '').toLowerCase() === idOrYear);
      if (target && target.year) {
        if (target.year === 'year1' || target.year === '1') student.scholarshipYear1 = 0;
        if (target.year === 'year2' || target.year === '2') student.scholarshipYear2 = 0;
        if (target.year === 'year3' || target.year === '3') student.scholarshipYear3 = 0;
        if (target.year === 'year4' || target.year === '4') student.scholarshipYear4 = 0;
      }
      student.scholarshipHistory = student.scholarshipHistory.filter(h => String(h.id || '').toLowerCase() !== idOrYear && String(h.receiptNo || '').toLowerCase() !== idOrYear);
    }
  } else {
    student.scholarshipYear1 = 0;
    student.scholarshipYear2 = 0;
    student.scholarshipYear3 = 0;
    student.scholarshipYear4 = 0;
    student.scholarshipHistory = [];
  }

  const y1 = Number(student.scholarshipYear1) || 0;
  const y2 = Number(student.scholarshipYear2) || 0;
  const y3 = Number(student.scholarshipYear3) || 0;
  const y4 = Number(student.scholarshipYear4) || 0;
  const totalSch = y1 + y2 + y3 + y4;
  student.scholarshipAmount = totalSch;

  const acadFee = Number(student.academicFee !== undefined ? student.academicFee : (student.studentFee || 0));
  student.totalFee = acadFee + totalSch;
  student.netTotalFee = student.totalFee;
  student.balanceDue = Math.max(0, student.totalFee - (Number(student.totalPaid) || 0));
  student.updatedAt = new Date().toISOString();

  writeDB(db);

  res.json({
    success: true,
    message: `Scholarship updated successfully.`,
    student
  });
});

// Receive Student Fee / Set Paid Fee
app.post('/api/students/:rollNo/receive-fee', (req, res) => {
  const db = readDB();
  const rawKey = (req.params.rollNo || '').trim();
  const student = findStudent(db.students, rawKey);

  if (!student) {
    return res.status(404).json({ success: false, message: 'Student not found' });
  }

  const { amount, paymentMode, receiptNo, remark, receivedBy, feeDate, purpose, currentClass, refNo, action } = req.body;
  const payAmt = (amount === '' || amount === null || amount === undefined) ? 0 : Number(amount);

  if (isNaN(payAmt) || payAmt < 0) {
    return res.status(400).json({ success: false, message: 'Please provide a valid fee payment amount (0 or more).' });
  }

  const sRoll = (student.rollNo || '').toUpperCase();
  const sId = student.id || '';

  // If action is set_paid or amount is 0: Edit/Set totalPaid directly (allows setting back to 0)
  if (action === 'set_paid' || payAmt === 0) {
    student.totalPaid = payAmt;
    const totalFee = Number(student.totalFee) || 0;
    student.balanceDue = Math.max(0, totalFee - payAmt);
    if (currentClass) student.currentClass = currentClass;
    if (remark !== undefined) student.remark = remark;
    student.updatedAt = new Date().toISOString();

    // If set to 0, clear erroneous fee_payments for this student
    if (payAmt === 0) {
      if (Array.isArray(db.fee_payments)) {
        db.fee_payments = db.fee_payments.filter(p => {
          const match = (sRoll && p.rollNo && p.rollNo.toUpperCase() === sRoll) ||
                        (sId && p.studentId && p.studentId === sId);
          return !match;
        });
      }
    }

    writeDB(db);

    const studentPayments = (db.fee_payments || []).filter(p => 
      (sRoll && p.rollNo && p.rollNo.toUpperCase() === sRoll) ||
      (sId && p.studentId && p.studentId === sId)
    );

    return res.json({
      success: true,
      message: `Total Paid Fee for ${student.fullName || student.rollNo || 'Student'} updated to ₹${payAmt.toLocaleString('en-IN')}`,
      student,
      payments: studentPayments
    });
  }

  // Otherwise: Add new payment entry to ledger
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
    rollNo: student.rollNo || student.enrollmentNo || student.id,
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
    refNo: refNo || '',
    paymentDate: pDate,
    remainingDues: newBalance,
    remark: remark || '',
    receivedBy: receivedBy || 'Admin Desk'
  };

  if (!Array.isArray(db.fee_payments)) db.fee_payments = [];
  db.fee_payments.unshift(receipt);

  writeDB(db);

  // Return all payments for this student so frontend can update immediately
  const studentPayments = db.fee_payments.filter(p => 
    (sRoll && p.rollNo && p.rollNo.toUpperCase() === sRoll) ||
    (sId && p.studentId && p.studentId === sId)
  );

  res.status(201).json({
    success: true,
    message: `Payment of ₹${payAmt.toLocaleString('en-IN')} received successfully!`,
    student,
    receipt,
    payments: studentPayments
  });
});

// Delete Payment Entry
app.delete('/api/students/:rollNo/payments/:paymentId', (req, res) => {
  const db = readDB();
  const rawKey = (req.params.rollNo || '').trim();
  const paymentId = (req.params.paymentId || '').trim();
  const student = findStudent(db.students, rawKey);

  if (!student) {
    return res.status(404).json({ success: false, message: 'Student not found' });
  }

  if (!Array.isArray(db.fee_payments)) db.fee_payments = [];

  const pIdx = db.fee_payments.findIndex(p => p.id === paymentId || p.receiptNo === paymentId);
  if (pIdx === -1) {
    return res.status(404).json({ success: false, message: 'Payment record not found' });
  }

  const removed = db.fee_payments.splice(pIdx, 1)[0];
  const removedAmt = Number(removed.amountPaid || removed.amount || 0);

  // Deduct from student.totalPaid
  student.totalPaid = Math.max(0, (Number(student.totalPaid) || 0) - removedAmt);
  const totalFee = Number(student.totalFee) || 0;
  student.balanceDue = Math.max(0, totalFee - student.totalPaid);
  student.updatedAt = new Date().toISOString();

  writeDB(db);

  const sRoll = (student.rollNo || '').toUpperCase();
  const sId = student.id || '';
  const studentPayments = db.fee_payments.filter(p => 
    (sRoll && p.rollNo && p.rollNo.toUpperCase() === sRoll) ||
    (sId && p.studentId && p.studentId === sId)
  );

  res.json({
    success: true,
    message: `Payment entry of ₹${removedAmt.toLocaleString('en-IN')} deleted successfully.`,
    student,
    payments: studentPayments
  });
});

// Update / Edit Specific Payment Entry
app.put('/api/students/:rollNo/payments/:paymentId', (req, res) => {
  const db = readDB();
  const rawKey = (req.params.rollNo || '').trim();
  const paymentId = (req.params.paymentId || '').trim();
  const student = findStudent(db.students, rawKey);

  if (!student) {
    return res.status(404).json({ success: false, message: 'Student not found' });
  }

  if (!Array.isArray(db.fee_payments)) db.fee_payments = [];

  const payment = db.fee_payments.find(p => p.id === paymentId || p.receiptNo === paymentId);
  if (!payment) {
    return res.status(404).json({ success: false, message: 'Payment record not found' });
  }

  const oldAmt = Number(payment.amountPaid || payment.amount || 0);
  const { amount, paymentMode, purpose, refNo, receivedBy, feeDate, remark, currentClass } = req.body;
  const newAmt = (amount === '' || amount === null || amount === undefined) ? 0 : Math.max(0, Number(amount) || 0);

  // Update payment object
  payment.amountPaid = newAmt;
  if (paymentMode !== undefined) payment.paymentMode = paymentMode;
  if (purpose !== undefined) {
    payment.purpose = purpose;
    payment.feeType = purpose;
  }
  if (refNo !== undefined) payment.refNo = refNo;
  if (receivedBy !== undefined) payment.receivedBy = receivedBy;
  if (remark !== undefined) payment.remark = remark;
  if (currentClass !== undefined) payment.currentClass = currentClass;
  if (feeDate) payment.paymentDate = new Date(feeDate).toISOString();

  // Recalculate student.totalPaid
  student.totalPaid = Math.max(0, (Number(student.totalPaid) || 0) - oldAmt + newAmt);
  const totalFee = Number(student.totalFee) || 0;
  student.balanceDue = Math.max(0, totalFee - student.totalPaid);
  student.updatedAt = new Date().toISOString();

  writeDB(db);

  const sRoll = (student.rollNo || '').toUpperCase();
  const sId = student.id || '';
  const studentPayments = db.fee_payments.filter(p => 
    (sRoll && p.rollNo && p.rollNo.toUpperCase() === sRoll) ||
    (sId && p.studentId && p.studentId === sId)
  );

  res.json({
    success: true,
    message: `Payment entry updated successfully to ₹${newAmt.toLocaleString('en-IN')}.`,
    student,
    payment,
    payments: studentPayments
  });
});

app.delete('/api/students/:rollNo', (req, res) => {
  const db = readDB();
  const rawKey = (req.params.rollNo || '').trim();
  const index = findStudentIndex(db.students, rawKey);

  if (index === -1) {
    return res.status(404).json({ success: false, message: 'Student not found' });
  }

  const deleted = db.students.splice(index, 1)[0];

  // If deleting a primary course, also delete its attached secondary dual course:
  if (!deleted.primaryRollNo) {
    db.students = db.students.filter(s => 
      !(s.primaryRollNo && s.primaryRollNo.toUpperCase() === roll) &&
      !(s.primaryStudentId && s.primaryStudentId === deleted.id)
    );
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

    const rawKey = (rollNo || '').trim();
    const student = findStudent(db.students, rawKey);
    if (!student) {
      return res.status(404).json({ success: false, message: `Student "${rawKey}" not found.` });
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
    const rawKey = (req.params.rollNo || '').trim();
    const student = findStudent(db.students, rawKey);

    if (!student) {
      return res.status(404).json({ success: false, message: `Student "${rawKey}" not found.` });
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
// ACADEMIC COURSES CMS & CATALOG APIS
// ====================================================
// Get all academic courses
app.get('/api/courses', (req, res) => {
  try {
    const db = readDB();
    res.json({ success: true, courses: db.courses || [] });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Add new academic course
app.post('/api/courses', (req, res) => {
  try {
    const db = readDB();
    const { 
      name, 
      code, 
      department, 
      universityName, 
      collegeName, 
      durationYears, 
      totalSemesters, 
      totalFee, 
      feePerSemester, 
      eligibility, 
      description 
    } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ success: false, message: 'Course Name is required.' });
    }

    if (!db.courses) db.courses = [];
    const courseCode = (code || name.replace(/[^a-zA-Z0-9]/g, '').slice(0, 8)).toUpperCase();
    const baseSlug = (code || name).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') || `crs-${Date.now()}`;

    let finalId = baseSlug;
    let counter = 1;
    while (db.courses.some(c => c.id === finalId)) {
      finalId = `${baseSlug}-${counter++}`;
    }

    const newCourse = {
      id: finalId,
      name: name.trim(),
      code: courseCode,
      department: department || 'School of General Studies',
      universityName: universityName || 'Maharaja Chhatrasal Bundelkhand University (MCBU)',
      collegeName: collegeName || 'PKC Education Learning Institute & Consultancy',
      durationYears: Number(durationYears) || 3,
      totalSemesters: Number(totalSemesters) || (Number(durationYears) ? Number(durationYears) * 2 : 6),
      totalFee: Number(totalFee) || 0,
      feePerSemester: Number(feePerSemester) || 0,
      eligibility: eligibility || '10+2 or equivalent recognized qualification',
      description: description || `${name} - Approved Academic Program offered with comprehensive curriculum.`,
      createdAt: new Date().toISOString()
    };

    db.courses.push(newCourse);
    writeDB(db);

    res.status(201).json({ 
      success: true, 
      message: `Course "${newCourse.name}" added successfully!`, 
      course: newCourse 
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Update academic course
app.put('/api/courses/:id', (req, res) => {
  try {
    const db = readDB();
    const { id } = req.params;
    if (!db.courses) db.courses = [];
    const index = db.courses.findIndex(c => c.id === id || c.code === id);
    if (index === -1) {
      return res.status(404).json({ success: false, message: 'Course not found.' });
    }

    const current = db.courses[index];
    const updated = {
      ...current,
      ...req.body,
      id: current.id, // preserve immutable ID
      durationYears: req.body.durationYears !== undefined ? Number(req.body.durationYears) : current.durationYears,
      totalSemesters: req.body.totalSemesters !== undefined ? Number(req.body.totalSemesters) : current.totalSemesters,
      totalFee: req.body.totalFee !== undefined ? Number(req.body.totalFee) : current.totalFee,
      feePerSemester: req.body.feePerSemester !== undefined ? Number(req.body.feePerSemester) : current.feePerSemester,
      updatedAt: new Date().toISOString()
    };

    db.courses[index] = updated;
    writeDB(db);

    res.json({ 
      success: true, 
      message: `Course "${updated.name}" updated successfully!`, 
      course: updated 
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Delete academic course
app.delete('/api/courses/:id', (req, res) => {
  try {
    const db = readDB();
    const { id } = req.params;
    if (!db.courses) db.courses = [];
    const index = db.courses.findIndex(c => c.id === id || c.code === id);
    if (index === -1) {
      return res.status(404).json({ success: false, message: 'Course not found.' });
    }

    const deleted = db.courses.splice(index, 1);
    writeDB(db);

    res.json({ 
      success: true, 
      message: `Course "${deleted[0].name}" deleted successfully.`, 
      course: deleted[0] 
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
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
    const student = findStudent(db.students, rollNo);
    if (!student) {
      return res.status(404).json({ success: false, message: `Student with identifier "${rollNo}" not found.` });
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
      rollNo: student.rollNo || student.enrollmentNo || student.id,
      studentId: student.id,
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
    const student = findStudent(db.students, rollNo);
    if (!student) {
      return res.status(404).json({ success: false, message: `Student with identifier "${rollNo}" not found.` });
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

// 8.6.1 Update University Payment Voucher
app.put('/api/university/payments/:id', (req, res) => {
  try {
    const { id } = req.params;
    const {
      amountPaidToUniversity,
      paymentDate,
      paidSemester,
      paymentMode,
      transactionRef,
      purpose,
      remark,
      recordedBy
    } = req.body;

    const db = readDB();
    if (!db.university_payments) db.university_payments = [];

    const paymentIndex = db.university_payments.findIndex(p => p.id === id || p.voucherNo === id);
    if (paymentIndex === -1) {
      return res.status(404).json({ success: false, message: 'University payment record not found.' });
    }

    const existingPayment = db.university_payments[paymentIndex];
    const oldAmount = Number(existingPayment.amountPaidToUniversity) || 0;
    const newAmount = amountPaidToUniversity !== undefined && amountPaidToUniversity !== '' ? Number(amountPaidToUniversity) : oldAmount;

    // Update payment record fields
    if (amountPaidToUniversity !== undefined && amountPaidToUniversity !== '') existingPayment.amountPaidToUniversity = newAmount;
    if (paymentDate) existingPayment.paymentDate = new Date(paymentDate).toISOString();
    if (paidSemester) existingPayment.paidSemester = paidSemester.trim();
    if (paymentMode) existingPayment.paymentMode = paymentMode.trim();
    if (transactionRef !== undefined) existingPayment.transactionRef = transactionRef.trim();
    if (purpose) existingPayment.purpose = purpose.trim();
    if (remark !== undefined) existingPayment.remark = remark.trim();
    if (recordedBy) existingPayment.recordedBy = recordedBy.trim();

    // Recalculate student's universityPaid & universityDue
    const student = findStudent(db.students, existingPayment.rollNo);
    if (student) {
      const currentPaid = Number(student.universityPaid) || 0;
      student.universityPaid = Math.max(0, currentPaid - oldAmount + newAmount);
      student.universityDue = Math.max(0, (Number(student.universityFee) || 0) - student.universityPaid);
    }

    writeDB(db);
    res.json({
      success: true,
      message: 'University payment voucher updated successfully.',
      payment: existingPayment,
      student
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// 8.6.2 Delete University Payment Voucher
app.delete('/api/university/payments/:id', (req, res) => {
  try {
    const { id } = req.params;
    const db = readDB();
    if (!db.university_payments) db.university_payments = [];

    const paymentIndex = db.university_payments.findIndex(p => p.id === id || p.voucherNo === id);
    if (paymentIndex === -1) {
      return res.status(404).json({ success: false, message: 'University payment record not found.' });
    }

    const [deletedPayment] = db.university_payments.splice(paymentIndex, 1);
    const amountToDeduct = Number(deletedPayment.amountPaidToUniversity) || 0;

    // Deduct from student's universityPaid
    const student = findStudent(db.students, deletedPayment.rollNo);
    if (student) {
      const currentPaid = Number(student.universityPaid) || 0;
      student.universityPaid = Math.max(0, currentPaid - amountToDeduct);
      student.universityDue = Math.max(0, (Number(student.universityFee) || 0) - student.universityPaid);
    }

    writeDB(db);
    res.json({
      success: true,
      message: `Payment voucher "${deletedPayment.voucherNo || id}" deleted successfully.`,
      deletedPayment,
      student
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
      const uId = universityId.toLowerCase();
      colleges = colleges.filter(c => {
        if (c.universityId === universityId) return true;
        const cUnivId = (c.universityId || '').toLowerCase();
        const cu = (c.universityName || '').toLowerCase();
        if (uId === 'univ-mcbu' || uId.includes('mcbu') || uId.includes('chhatrasal')) {
          return cUnivId.includes('mcbu') || cu.includes('mcbu') || cu.includes('chhatrasal');
        }
        if (uId.includes('subharti') || uId.includes('bharti')) {
          return cUnivId.includes('subharti') || cu.includes('subharti') || cu.includes('bharti');
        }
        if (uId.includes('ies')) {
          return cUnivId.includes('ies') || cu.includes('ies');
        }
        if (uId.includes('mcrpv') || uId.includes('makhanlal')) {
          return cUnivId.includes('mcrpv') || cu.includes('mcrpv') || cu.includes('makhanlal');
        }
        if (uId.includes('bhabha')) {
          return cUnivId.includes('bhabha') || cu.includes('bhabha');
        }
        if (uId.includes('gyanveer')) {
          return cUnivId.includes('gyanveer') || cu.includes('gyanveer');
        }
        if (uId.includes('mmyvv') || uId.includes('maharishi') || uId.includes('vedic')) {
          return cUnivId.includes('mmyvv') || cu.includes('mmyvv') || cu.includes('maharishi') || cu.includes('vedic');
        }
        if (uId.includes('mpu') || uId.includes('madhyanchal')) {
          return cUnivId.includes('mpu') || cu.includes('mpu') || cu.includes('madhyanchal');
        }
        if (uId.includes('sku') || uId.includes('krishna')) {
          return cUnivId.includes('sku') || cu.includes('sku') || cu.includes('krishna');
        }
        if (uId.includes('mgcgv') || uId.includes('chitrakoot') || uId.includes('gramodaya')) {
          return cUnivId.includes('mgcgv') || cu.includes('chitrakoot') || cu.includes('gramodaya');
        }
        return false;
      });
    } else if (universityName && universityName !== 'ALL') {
      const uq = universityName.toLowerCase().trim();
      colleges = colleges.filter(c => {
        const cu = (c.universityName || '').toLowerCase();
        return cu === uq ||
               cu.includes(uq) ||
               uq.includes(cu) ||
               ((uq.includes('mcbu') || uq.includes('chhatrasal')) && (cu.includes('mcbu') || cu.includes('chhatrasal'))) ||
               ((uq.includes('subharti') || uq.includes('bharti')) && (cu.includes('subharti') || cu.includes('bharti'))) ||
               (uq.includes('ies') && cu.includes('ies')) ||
               ((uq.includes('mcrpv') || uq.includes('makhanlal')) && (cu.includes('mcrpv') || cu.includes('makhanlal'))) ||
               (uq.includes('bhabha') && cu.includes('bhabha')) ||
               (uq.includes('gyanveer') && cu.includes('gyanveer')) ||
               ((uq.includes('mmyvv') || uq.includes('maharishi') || uq.includes('vedic')) && (cu.includes('mmyvv') || cu.includes('maharishi') || cu.includes('vedic'))) ||
               ((uq.includes('mpu') || uq.includes('madhyanchal')) && (cu.includes('mpu') || cu.includes('madhyanchal'))) ||
               ((uq.includes('sku') || uq.includes('shri krishna')) && (cu.includes('sku') || cu.includes('krishna'))) ||
               ((uq.includes('chitrakoot') || uq.includes('gramodaya') || uq.includes('mgcgv')) && (cu.includes('chitrakoot') || cu.includes('gramodaya') || cu.includes('mgcgv')));
      });
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

// 9.7 Update College
app.put('/api/colleges/:id', (req, res) => {
  try {
    const { id } = req.params;
    const { name, shortName, code, universityId, universityName, district, state, address, status } = req.body;
    const db = readDB();
    if (!db.colleges) db.colleges = [];

    const index = db.colleges.findIndex(c => c.id === id);
    if (index === -1) {
      return res.status(404).json({ success: false, message: 'College not found.' });
    }

    const existing = db.colleges[index];
    const updatedCol = {
      ...existing,
      ...(name !== undefined && { name: name.trim() }),
      ...(shortName !== undefined && { shortName: shortName.trim() }),
      ...(code !== undefined && { code: code.trim().toUpperCase() }),
      ...(universityId !== undefined && { universityId }),
      ...(universityName !== undefined && { universityName: universityName.trim() }),
      ...(district !== undefined && { district: district.trim() }),
      ...(state !== undefined && { state: state.trim() }),
      ...(address !== undefined && { address: address.trim() }),
      ...(status !== undefined && { status }),
      updatedAt: new Date().toISOString()
    };

    db.colleges[index] = updatedCol;
    writeDB(db);

    res.json({
      success: true,
      message: `College "${updatedCol.shortName || updatedCol.name}" updated successfully!`,
      college: updatedCol
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// 9.8 Delete College
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

// Helper: Extract course and branch rows from Excel buffer
function extractCoursesFromExcelBuffer(buffer) {
  const workbook = XLSX.read(buffer, { type: 'buffer', cellDates: true });
  const sheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[sheetName];
  if (!worksheet) return [];

  const rawRows = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: '' });
  if (!rawRows || rawRows.length === 0) return [];

  // Detect header if any row within the first 5 rows contains keywords
  let headerIndex = -1;
  for (let r = 0; r < Math.min(rawRows.length, 5); r++) {
    const rowStr = rawRows[r].join(' ').toLowerCase();
    if (rowStr.includes('course') || rowStr.includes('program') || rowStr.includes('degree') || (rowStr.includes('name') && rowStr.includes('duration'))) {
      headerIndex = r;
      break;
    }
  }

  let colMap = { course: -1, branch: -1, duration: -1, sNo: -1 };
  if (headerIndex !== -1) {
    const hRow = rawRows[headerIndex];
    hRow.forEach((h, colIdx) => {
      const colName = String(h).toLowerCase().trim();
      if (colName.includes('course') || colName.includes('program') || colName.includes('degree')) colMap.course = colIdx;
      else if (colName.includes('branch') || colName.includes('special') || colName.includes('stream') || colName.includes('subject')) colMap.branch = colIdx;
      else if (colName.includes('duration') || colName.includes('year') || colName.includes('sem')) colMap.duration = colIdx;
      else if (colName.includes('s.no') || colName.includes('sr') || colName === 'no' || colName === '#') colMap.sNo = colIdx;
    });
  }

  const startRow = headerIndex !== -1 ? headerIndex + 1 : 0;
  const courses = [];

  for (let r = startRow; r < rawRows.length; r++) {
    const row = rawRows[r];
    if (!Array.isArray(row) || row.length === 0) continue;
    const cleanCells = row.map(c => (c !== null && c !== undefined ? String(c).trim() : ''));
    if (cleanCells.every(c => !c)) continue;

    let courseName = '';
    let duration = '';
    let branch = '';
    let sNo = '';

    if (colMap.course !== -1 && cleanCells[colMap.course]) {
      courseName = cleanCells[colMap.course];
      if (colMap.branch !== -1 && cleanCells[colMap.branch]) branch = cleanCells[colMap.branch];
      if (colMap.duration !== -1 && cleanCells[colMap.duration]) duration = cleanCells[colMap.duration];
      if (colMap.sNo !== -1 && cleanCells[colMap.sNo]) sNo = cleanCells[colMap.sNo];
    } else {
      let startCol = 0;
      if (/^\d+$/.test(cleanCells[0])) {
        sNo = cleanCells[0];
        startCol = 1;
      }

      for (let i = startCol; i < cleanCells.length; i++) {
        const val = cleanCells[i];
        if (/(\d+)\s*(year|yr|month|sem|saal)/i.test(val) || /^[1-5]\s*Y/i.test(val)) {
          duration = val;
        } else if (!courseName && val && !/^(s\.?no|no\.?|sr|sr\.no)$/i.test(val) && !/university/i.test(val)) {
          courseName = val;
        } else if (courseName && !duration && val) {
          if (/^[1-5]$/.test(val)) {
            duration = val + ' Years';
          } else if (!branch) {
            branch = val;
          }
        }
      }
    }

    if (!courseName) continue;

    // Filter out university title rows if matched as courseName
    if (/university|vishwavidyalaya|college|total/i.test(courseName) && !/b\.?sc|m\.?sc|b\.?a|m\.?a|mba|bba|b\.?ed|b\.?tech/i.test(courseName)) {
      continue;
    }

    // Extract branch from parentheses if not specified separately
    if (!branch || branch === 'General') {
      const parenMatch = courseName.match(/\((.*?)\)/);
      if (parenMatch && parenMatch[1]) {
        branch = parenMatch[1].trim();
      }
    }

    // Default duration
    if (!duration) {
      if (/m\.?sc|m\.?a|mba|m\.?com|msw|m\.?ed|m\.?tech/i.test(courseName)) duration = '2 Years';
      else if (/b\.?lib|m\.?lib|pgdca|dca/i.test(courseName)) duration = '1 Year';
      else if (/b\.?tech|engineering/i.test(courseName)) duration = '4 Years';
      else duration = '3 Years';
    }

    // Detect degree / category
    let degree = 'Other';
    const cUpper = courseName.toUpperCase();
    if (/\bB\.?\s*TECH\b|\bBACHELOR OF TECHNOLOGY\b/i.test(cUpper)) degree = 'B.Tech';
    else if (/\bM\.?\s*TECH\b|\bMASTER OF TECHNOLOGY\b/i.test(cUpper)) degree = 'M.Tech';
    else if (/\bM\.?B\.?A\b|\bMASTER OF BUSINESS\b/i.test(cUpper)) degree = 'MBA';
    else if (/\bB\.?B\.?A\b|\bBACHELOR OF BUSINESS\b/i.test(cUpper)) degree = 'BBA';
    else if (/\bM\.?\s*SC\b|\bMSC\b|\bMASTER OF SCIENCE\b/i.test(cUpper)) degree = 'M.Sc';
    else if (/\bB\.?\s*SC\b|\bBSC\b|\bBACHELOR OF SCIENCE\b/i.test(cUpper)) degree = 'B.Sc';
    else if (/\bM\.?\s*COM\b|\bMCOM\b|\bMASTER OF COMMERCE\b/i.test(cUpper)) degree = 'M.Com';
    else if (/\bB\.?\s*COM\b|\bBCOM\b|\bBACHELOR OF COMMERCE\b/i.test(cUpper)) degree = 'B.Com';
    else if (/\bM\.?A\b|\bMASTER OF ARTS\b/i.test(cUpper)) degree = 'MA';
    else if (/\bB\.?A\b|\bBACHELOR OF ARTS\b/i.test(cUpper)) degree = 'BA';
    else if (/\bBCA\b/i.test(cUpper)) degree = 'BCA';
    else if (/\bMCA\b/i.test(cUpper)) degree = 'MCA';
    else if (/\bB\.?ED\b/i.test(cUpper)) degree = 'B.Ed';
    else if (/\bM\.?ED\b/i.test(cUpper)) degree = 'M.Ed';
    else if (/\bBSW\b/i.test(cUpper)) degree = 'BSW';
    else if (/\bMSW\b/i.test(cUpper)) degree = 'MSW';
    else if (/\bB\.?LIB\b/i.test(cUpper)) degree = 'B.Lib';
    else if (/\bM\.?LIB\b/i.test(cUpper)) degree = 'M.Lib';
    else degree = courseName.split(/[\s(]/)[0].toUpperCase();

    courses.push({
      id: `crs-${courses.length + 1}-${Date.now().toString().slice(-4)}`,
      sNo: sNo || String(courses.length + 1),
      courseName,
      degree,
      branch: branch || 'General',
      duration
    });
  }

  return courses;
}

// 9.9 Download College Course List Sample Excel Template
app.get('/api/colleges/courses/template', (req, res) => {
  try {
    const sampleData = [
      { 'S.No': 1, 'Course Name': 'BA', 'Duration': '3 Years', 'Branch / Specialization': 'General' },
      { 'S.No': 2, 'Course Name': 'MA (Education)', 'Duration': '2 Years', 'Branch / Specialization': 'Education' },
      { 'S.No': 3, 'Course Name': 'MA (History)', 'Duration': '2 Years', 'Branch / Specialization': 'History' },
      { 'S.No': 4, 'Course Name': 'B.Sc.', 'Duration': '3 Years', 'Branch / Specialization': 'General' },
      { 'S.No': 5, 'Course Name': 'M.Sc.(Physics)', 'Duration': '2 Years', 'Branch / Specialization': 'Physics' },
      { 'S.No': 6, 'Course Name': 'M.Sc.(Chemistry)', 'Duration': '2 Years', 'Branch / Specialization': 'Chemistry' },
      { 'S.No': 7, 'Course Name': 'M.Sc.(Computer Science)', 'Duration': '2 Years', 'Branch / Specialization': 'Computer Science' },
      { 'S.No': 8, 'Course Name': 'B.B.A.', 'Duration': '3 Years', 'Branch / Specialization': 'General' },
      { 'S.No': 9, 'Course Name': 'M.B.A.', 'Duration': '2 Years', 'Branch / Specialization': 'Finance / Marketing / HR' },
      { 'S.No': 10, 'Course Name': 'B.Tech (Computer Science)', 'Duration': '4 Years', 'Branch / Specialization': 'Computer Science' },
      { 'S.No': 11, 'Course Name': 'B.Lib', 'Duration': '1 Year', 'Branch / Specialization': 'Library Science' }
    ];

    const ws = XLSX.utils.json_to_sheet(sampleData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Course_List');

    const buffer = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });
    res.setHeader('Content-Disposition', 'attachment; filename="College_Course_List_Template.xlsx"');
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.send(buffer);
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// 9.10 Upload College Course List (Excel or PDF)
app.post('/api/colleges/:id/courses/upload', collegeCoursesUpload.single('file'), async (req, res) => {
  try {
    const { id } = req.params;
    const db = readDB();
    if (!db.colleges) db.colleges = [];

    const college = db.colleges.find(c => c.id === id || c.code === id);
    if (!college) {
      return res.status(404).json({ success: false, message: 'College not found.' });
    }

    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Please select an Excel (.xlsx, .xls, .csv) or PDF file.' });
    }

    const ext = path.extname(req.file.originalname).toLowerCase();
    let courses = [];

    if (['.xlsx', '.xls', '.csv'].includes(ext)) {
      const fileBuffer = fs.readFileSync(req.file.path);
      courses = extractCoursesFromExcelBuffer(fileBuffer);
    } else if (ext === '.pdf') {
      try {
        const fileBuffer = fs.readFileSync(req.file.path);
        const parser = new PDFParse({ data: fileBuffer });
        await parser.load();
        const textResult = await parser.getText();
        const text = textResult?.text || '';

        // Extract lines matching common degree courses
        const lines = text.split('\n').map(l => l.trim()).filter(Boolean);
        lines.forEach((line, idx) => {
          if (/(\bBA\b|\bMA\b|\bB\.?SC\b|\bM\.?SC\b|\bB\.?COM\b|\bM\.?COM\b|\bMBA\b|\bBBA\b|\bB\.?TECH\b|\bB\.?LIB\b|\bBSW\b|\bMSW\b)/i.test(line)) {
            const parenMatch = line.match(/\((.*?)\)/);
            const branch = parenMatch && parenMatch[1] ? parenMatch[1].trim() : 'General';
            const durMatch = line.match(/(\d+)\s*(year|yr|month|sem|saal)/i);
            const duration = durMatch ? durMatch[0] : (line.includes('Tech') ? '4 Years' : line.includes('M') ? '2 Years' : '3 Years');

            courses.push({
              id: `crs-${courses.length + 1}-${Date.now().toString().slice(-4)}`,
              sNo: String(courses.length + 1),
              courseName: line.replace(/\s+/g, ' '),
              degree: line.split(/[\s(]/)[0].toUpperCase(),
              branch,
              duration
            });
          }
        });
      } catch (pdfErr) {
        console.warn('PDF text parse note:', pdfErr.message);
      }
    }

    // Attach courses and uploaded file info to the college record
    college.courses = courses;
    college.courseListFile = {
      filename: req.file.filename,
      originalName: req.file.originalname,
      url: `/uploads/college_courses/${req.file.filename}`,
      size: req.file.size,
      fileType: ext.replace('.', '').toUpperCase(),
      uploadedAt: new Date().toISOString()
    };
    college.updatedAt = new Date().toISOString();

    writeDB(db);

    res.json({
      success: true,
      message: `Successfully uploaded ${req.file.originalname}! Extracted ${courses.length} courses for ${college.shortName || college.name}.`,
      courses,
      college,
      courseListFile: college.courseListFile
    });
  } catch (err) {
    console.error('Course upload error:', err);
    res.status(500).json({ success: false, message: 'Failed to process course file: ' + err.message });
  }
});

// 9.11 Get College Courses
app.get('/api/colleges/:id/courses', (req, res) => {
  try {
    const { id } = req.params;
    const db = readDB();
    const college = (db.colleges || []).find(c => c.id === id || c.code === id);
    if (!college) {
      return res.status(404).json({ success: false, message: 'College not found.' });
    }

    res.json({
      success: true,
      collegeName: college.name,
      courses: college.courses || [],
      courseListFile: college.courseListFile || null
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// 9.12 Clear College Courses
app.delete('/api/colleges/:id/courses', (req, res) => {
  try {
    const { id } = req.params;
    const db = readDB();
    const college = (db.colleges || []).find(c => c.id === id || c.code === id);
    if (!college) {
      return res.status(404).json({ success: false, message: 'College not found.' });
    }

    college.courses = [];
    college.courseListFile = null;
    college.updatedAt = new Date().toISOString();
    writeDB(db);

    res.json({ success: true, message: `Courses cleared for ${college.shortName || college.name}.` });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ============================================================================
// VOCATIONAL INSTITUTES, COURSES & SKILLS DESK API ENDPOINTS
// ============================================================================

const DEFAULT_VOCATIONAL_INSTITUTES = [
  {
    id: 'inst-mdvti',
    name: 'Maharishi Dayanand Vocational Training Institute (MDVTI)',
    shortName: 'MDVTI',
    code: 'MDVTI-01',
    parentCenter: 'PKC Institute',
    type: 'Vocational Training Institute',
    address: 'Bhopal / Damoh (M.P)',
    contact: '9876543210',
    description: 'Premier Vocational, Skill Development and Technical Trade Training Institute.',
    status: 'Active',
    createdAt: new Date().toISOString()
  },
  {
    id: 'inst-mdette',
    name: 'Maharishi Dayanand Early Teachers Training and Education (MDETTE)',
    shortName: 'MDETTE',
    code: 'MDETTE-02',
    parentCenter: 'PKC Institute',
    type: 'Early Teachers Training & Education',
    address: 'Bhopal / Damoh (M.P)',
    contact: '9876543210',
    description: 'Specialized Nursery Teacher Training (NTT), ECCE and Pre-Primary Educator Programs.',
    status: 'Active',
    createdAt: new Date().toISOString()
  }
];

const DEFAULT_VOCATIONAL_COURSES = [];

// Helper: Ensure vocational tables exist
function ensureVocationalData(db) {
  if (!Array.isArray(db.vocationalInstitutes) || db.vocationalInstitutes.length === 0) {
    db.vocationalInstitutes = DEFAULT_VOCATIONAL_INSTITUTES;
  }
  if (!Array.isArray(db.vocationalCourses)) {
    db.vocationalCourses = DEFAULT_VOCATIONAL_COURSES;
  }
}

// 1. Get all vocational institutes
app.get('/api/vocational-institutes', (req, res) => {
  try {
    const db = readDB();
    ensureVocationalData(db);
    res.json({ success: true, institutes: db.vocationalInstitutes });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// 0.1 Add single vocational institute manually
app.post('/api/vocational-institutes', (req, res) => {
  try {
    const db = readDB();
    if (!Array.isArray(db.vocationalInstitutes)) db.vocationalInstitutes = [];

    const { name, code, parentCenter, type, address, contact, description, status } = req.body;
    if (!name || !name.trim()) {
      return res.status(400).json({ success: false, message: 'Institute name is required.' });
    }

    const newInst = {
      id: 'inst-' + Date.now(),
      name: name.trim(),
      shortName: (code || name.slice(0, 8)).trim().toUpperCase(),
      code: (code || `INST-${Date.now().toString().slice(-4)}`).trim().toUpperCase(),
      parentCenter: (parentCenter || 'PKC Institute').trim(),
      type: (type || 'Vocational Training Institute').trim(),
      address: (address || '').trim(),
      contact: (contact || '').trim(),
      description: (description || '').trim(),
      status: status || 'Active',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    db.vocationalInstitutes.unshift(newInst);

    // Also register in db.universities if not present
    if (!Array.isArray(db.universities)) db.universities = [];
    if (!db.universities.some(u => (u.name || '').toLowerCase() === newInst.name.toLowerCase())) {
      db.universities.push({
        id: newInst.id,
        name: newInst.name,
        shortName: newInst.shortName,
        code: newInst.code,
        status: 'Active'
      });
    }

    // Also ensure parentCenter is in db.colleges
    if (!Array.isArray(db.colleges)) db.colleges = [];
    if (!db.colleges.some(c => (c.name || '').toLowerCase() === newInst.parentCenter.toLowerCase())) {
      db.colleges.push({
        id: 'col-' + Date.now(),
        name: newInst.parentCenter,
        shortName: newInst.parentCenter,
        code: 'PKC-01',
        universityName: newInst.name,
        status: 'Active'
      });
    }

    writeDB(db);
    res.json({ success: true, message: 'Institute added successfully!', institute: newInst });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to add institute: ' + err.message });
  }
});

// 0.2 Update vocational institute
app.put('/api/vocational-institutes/:id', (req, res) => {
  try {
    const db = readDB();
    if (!Array.isArray(db.vocationalInstitutes)) db.vocationalInstitutes = [];

    const id = req.params.id;
    const index = db.vocationalInstitutes.findIndex(inst => inst.id === id);
    if (index === -1) {
      return res.status(404).json({ success: false, message: 'Institute not found.' });
    }

    const existing = db.vocationalInstitutes[index];
    const { name, code, parentCenter, type, address, contact, description, status } = req.body;

    db.vocationalInstitutes[index] = {
      ...existing,
      name: name !== undefined ? name.trim() : existing.name,
      shortName: code !== undefined ? code.trim().toUpperCase() : existing.shortName,
      code: code !== undefined ? code.trim().toUpperCase() : existing.code,
      parentCenter: parentCenter !== undefined ? parentCenter.trim() : existing.parentCenter,
      type: type !== undefined ? type.trim() : existing.type,
      address: address !== undefined ? address.trim() : existing.address,
      contact: contact !== undefined ? contact.trim() : existing.contact,
      description: description !== undefined ? description.trim() : existing.description,
      status: status !== undefined ? status : existing.status,
      updatedAt: new Date().toISOString()
    };

    writeDB(db);
    res.json({ success: true, message: 'Institute updated successfully!', institute: db.vocationalInstitutes[index] });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to update institute: ' + err.message });
  }
});

// 0.3 Delete vocational institute
app.delete('/api/vocational-institutes/:id', (req, res) => {
  try {
    const db = readDB();
    if (!Array.isArray(db.vocationalInstitutes)) db.vocationalInstitutes = [];

    const id = req.params.id;
    db.vocationalInstitutes = db.vocationalInstitutes.filter(inst => inst.id !== id);
    writeDB(db);
    res.json({ success: true, message: 'Institute removed successfully!' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to delete institute: ' + err.message });
  }
});

// 1. Get all vocational courses
app.get('/api/vocational-courses', (req, res) => {
  try {
    const db = readDB();
    if (!Array.isArray(db.vocationalCourses)) {
      db.vocationalCourses = [];
      writeDB(db);
    }
    res.json({ success: true, courses: db.vocationalCourses });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to fetch vocational courses: ' + err.message });
  }
});

// 1.1 Clear all vocational courses
app.delete('/api/vocational-courses', (req, res) => {
  try {
    const db = readDB();
    db.vocationalCourses = [];
    writeDB(db);
    res.json({ success: true, message: 'All vocational courses removed successfully!' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// 2. Add single vocational course manually
app.post('/api/vocational-courses', (req, res) => {
  try {
    const db = readDB();
    if (!Array.isArray(db.vocationalCourses)) db.vocationalCourses = [];

    const { 
      courseName, 
      courseCode, 
      sector, 
      duration, 
      eligibility, 
      fee, 
      certification, 
      mode, 
      description,
      status,
      instituteId,
      instituteName
    } = req.body;

    if (!courseName || !courseName.trim()) {
      return res.status(400).json({ success: false, message: 'Course name is required.' });
    }

    const targetInstId = instituteId || 'inst-mdvti';
    const targetInstName = instituteName || (targetInstId === 'inst-mdette' 
      ? 'Maharishi Dayanand Early Teachers Training and Education (MDETTE)'
      : 'Maharishi Dayanand Vocational Training Institute (MDVTI)');

    const newCourse = {
      id: 'voc-' + Date.now(),
      instituteId: targetInstId,
      instituteName: targetInstName,
      courseName: courseName.trim(),
      courseCode: (courseCode || `VOC-${Date.now().toString().slice(-4)}`).trim().toUpperCase(),
      sector: (sector || 'General Vocational').trim(),
      duration: (duration || '6 Months').trim(),
      eligibility: (eligibility || '10th Pass').trim(),
      fee: Number(fee) || 0,
      certification: (certification || 'PKC Certified Skill Diploma').trim(),
      mode: (mode || 'Regular').trim(),
      description: (description || '').trim(),
      status: status || 'Active',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    db.vocationalCourses.unshift(newCourse);
    writeDB(db);

    res.json({ success: true, message: `🎉 Course "${newCourse.courseName}" added successfully!`, course: newCourse });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to add vocational course: ' + err.message });
  }
});

// 3. Update vocational course
app.put('/api/vocational-courses/:id', (req, res) => {
  try {
    const db = readDB();
    if (!Array.isArray(db.vocationalCourses)) db.vocationalCourses = [];

    const id = req.params.id;
    const index = db.vocationalCourses.findIndex(c => c.id === id || c.courseCode === id);

    if (index === -1) {
      return res.status(404).json({ success: false, message: 'Vocational course not found.' });
    }

    const existing = db.vocationalCourses[index];
    const { 
      courseName, 
      courseCode, 
      sector, 
      duration, 
      eligibility, 
      fee, 
      certification, 
      mode, 
      description,
      status 
    } = req.body;

    db.vocationalCourses[index] = {
      ...existing,
      courseName: courseName !== undefined ? courseName.trim() : existing.courseName,
      courseCode: courseCode !== undefined ? courseCode.trim().toUpperCase() : existing.courseCode,
      sector: sector !== undefined ? sector.trim() : existing.sector,
      duration: duration !== undefined ? duration.trim() : existing.duration,
      eligibility: eligibility !== undefined ? eligibility.trim() : existing.eligibility,
      fee: fee !== undefined ? Number(fee) : existing.fee,
      certification: certification !== undefined ? certification.trim() : existing.certification,
      mode: mode !== undefined ? mode.trim() : existing.mode,
      description: description !== undefined ? description.trim() : existing.description,
      status: status !== undefined ? status : existing.status,
      updatedAt: new Date().toISOString()
    };

    writeDB(db);
    res.json({ success: true, message: 'Course updated successfully!', course: db.vocationalCourses[index] });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to update course: ' + err.message });
  }
});

// 4. Delete vocational course
app.delete('/api/vocational-courses/:id', (req, res) => {
  try {
    const db = readDB();
    if (!Array.isArray(db.vocationalCourses)) db.vocationalCourses = [];

    const id = req.params.id;
    const beforeCount = db.vocationalCourses.length;
    db.vocationalCourses = db.vocationalCourses.filter(c => c.id !== id && c.courseCode !== id);

    if (db.vocationalCourses.length === beforeCount) {
      return res.status(404).json({ success: false, message: 'Course not found.' });
    }

    writeDB(db);
    res.json({ success: true, message: 'Vocational course deleted successfully!' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to delete course: ' + err.message });
  }
});

// 5. Bulk Import Vocational Courses from parsed Excel array
app.post('/api/vocational-courses/bulk-import', (req, res) => {
  try {
    const db = readDB();
    if (!Array.isArray(db.vocationalCourses)) db.vocationalCourses = [];

    const { courses: incomingCourses, mode, instituteId, instituteName } = req.body;
    if (!Array.isArray(incomingCourses) || incomingCourses.length === 0) {
      return res.status(400).json({ success: false, message: 'No courses provided to import.' });
    }

    const targetInstId = instituteId || 'inst-mdvti';
    const targetInstName = instituteName || (targetInstId === 'inst-mdette' 
      ? 'महर्षि दयानंद इयरली टीचर्स ट्रेनिंग एंड एजुकेशन (Maharishi Dayanand Early Teachers Training and Education)'
      : 'महर्षि दयानंद वोकेशनल ट्रेनिंग इंस्टीट्यूट (Maharishi Dayanand Vocational Training Institute)');

    let addedCount = 0;
    const formatted = incomingCourses.map((c, i) => {
      addedCount++;
      return {
        id: 'voc-' + Date.now() + '-' + i,
        instituteId: c.instituteId || targetInstId,
        instituteName: c.instituteName || targetInstName,
        courseName: String(c.courseName || c.name || c['Course Name'] || c['पाठ्यक्रम'] || `Vocational Course ${i + 1}`).trim(),
        courseCode: String(c.courseCode || c.code || c['Course Code'] || `VOC-${Date.now().toString().slice(-4)}-${i + 1}`).trim().toUpperCase(),
        sector: String(c.sector || c.category || c['Sector'] || c['Trade'] || 'General Vocational').trim(),
        duration: String(c.duration || c['Duration'] || '6 Months').trim(),
        eligibility: String(c.eligibility || c['Eligibility'] || '10th Pass').trim(),
        fee: Number(c.fee || c.courseFee || c['Fee'] || c['Fees'] || 0) || 0,
        certification: String(c.certification || c['Certification'] || 'PKC Certified Skill Diploma').trim(),
        mode: String(c.mode || c['Mode'] || 'Regular').trim(),
        description: String(c.description || c['Description'] || '').trim(),
        status: c.status || 'Active',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
    });

    if (mode === 'replace') {
      db.vocationalCourses = formatted;
    } else {
      const existingNames = new Set(db.vocationalCourses.map(c => (c.courseName || '').toLowerCase()));
      const toAdd = formatted.filter(c => !existingNames.has(c.courseName.toLowerCase()));
      db.vocationalCourses = [...toAdd, ...db.vocationalCourses];
      addedCount = toAdd.length;
    }

    writeDB(db);
    res.json({
      success: true,
      message: `🎉 Successfully imported ${addedCount} vocational courses!`,
      count: addedCount,
      courses: db.vocationalCourses
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Bulk import failed: ' + err.message });
  }
});

// 6. Direct Excel File Upload & Parse endpoint
app.post('/api/vocational-courses/upload', upload.single('file'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Please upload an Excel file (.xlsx, .xls, .csv).' });
    }

    const workbook = XLSX.readFile(req.file.path);
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const rawRows = XLSX.utils.sheet_to_json(sheet);

    if (!rawRows || rawRows.length === 0) {
      return res.status(400).json({ success: false, message: 'The uploaded Excel sheet contains no rows.' });
    }

    const db = readDB();
    if (!Array.isArray(db.vocationalCourses)) db.vocationalCourses = [];

    const targetInstId = req.body.instituteId || 'inst-mdvti';
    const targetInstName = req.body.instituteName || (targetInstId === 'inst-mdette' 
      ? 'Maharishi Dayanand Early Teachers Training and Education (MDETTE)'
      : 'Maharishi Dayanand Vocational Training Institute (MDVTI)');

    const formatted = rawRows.map((r, i) => {
      const name = r['Course Name'] || r['courseName'] || r['Course'] || r['Trade'] || r['पाठ्यक्रम'] || r['Name'] || '';
      if (!name) return null;

      return {
        id: 'voc-' + Date.now() + '-' + i,
        instituteId: targetInstId,
        instituteName: targetInstName,
        courseName: String(name).trim(),
        courseCode: String(r['Course Code'] || r['Code'] || r['courseCode'] || `VOC-${Date.now().toString().slice(-4)}-${i + 1}`).trim().toUpperCase(),
        sector: String(r['Sector'] || r['Category'] || r['sector'] || 'General Vocational').trim(),
        duration: String(r['Duration'] || r['duration'] || '6 Months').trim(),
        eligibility: String(r['Eligibility'] || r['eligibility'] || '10th Pass').trim(),
        fee: Number(r['Fee'] || r['Total Fee'] || r['fee'] || 0) || 0,
        certification: String(r['Certification'] || r['certification'] || 'PKC Certified Skill Diploma').trim(),
        mode: String(r['Mode'] || r['mode'] || 'Regular').trim(),
        description: String(r['Description'] || r['description'] || '').trim(),
        status: 'Active',
        createdAt: new Date().toISOString()
      };
    }).filter(Boolean);

    db.vocationalCourses = [...formatted, ...db.vocationalCourses];
    writeDB(db);

    res.json({
      success: true,
      message: `🎉 Successfully parsed and imported ${formatted.length} vocational courses from "${req.file.originalname}" into ${targetInstName}!`,
      count: formatted.length,
      courses: db.vocationalCourses
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to process Excel file: ' + err.message });
  }
});

// ============================================================================
// VOCATIONAL STUDENTS ENROLLMENT & TRACKING
// ============================================================================

// 8. Enroll Vocational Student into Central Students Database (db.students)
app.post('/api/vocational-students', (req, res) => {
  try {
    const db = readDB();
    if (!Array.isArray(db.students)) db.students = [];

    const {
      studentName,
      fullName,
      fatherName,
      motherName,
      aadhaarNo,
      abcId,
      phone,
      contact,
      instituteId,
      instituteName,
      parentCenter,
      courseId,
      courseName,
      trade,
      sector,
      duration,
      totalFee,
      initialPaid,
      paymentMode,
      admissionSession,
      admissionDate,
      address,
      category,
      gender,
      dob,
      remark
    } = req.body;

    const name = (fullName || studentName || '').trim();
    if (!name) {
      return res.status(400).json({ success: false, message: 'Student Name is required.' });
    }
    if (!fatherName || !fatherName.trim()) {
      return res.status(400).json({ success: false, message: "Father's Name is required." });
    }
    if (!aadhaarNo || !String(aadhaarNo).trim()) {
      return res.status(400).json({ success: false, message: 'Aadhaar Card No. is required.' });
    }

    const currentTotal = db.students.length;
    const nextSeq = currentTotal + 1;
    const year = new Date().getFullYear();

    const targetInstId = instituteId || 'inst-mdvti';
    const targetInstName = (instituteName || (targetInstId === 'inst-mdette' 
      ? 'Maharishi Dayanand Early Teachers Training and Education (MDETTE)'
      : 'Maharishi Dayanand Vocational Training Institute (MDVTI)')).trim();

    const targetParentCenter = (parentCenter || 'PKC Institute').trim();
    const instPrefix = targetInstName.toLowerCase().includes('teacher') || targetInstName.includes('टीचर्स') || targetInstId === 'inst-mdette' ? 'MDETTE' : 'MDVTI';
    
    const rollNo = req.body.rollNo ? String(req.body.rollNo).trim().toUpperCase() : `${instPrefix}-${year}-${String(nextSeq).padStart(4, '0')}`;
    const enrollmentNo = req.body.enrollmentNo ? String(req.body.enrollmentNo).trim().toUpperCase() : '';
    const registrationNo = `REG-VOC-${year}-${Math.floor(1000 + Math.random() * 9000)}`;

    const feeVal = Number(totalFee) || 0;
    const paidVal = Number(initialPaid) || 0;
    const dueVal = Math.max(0, feeVal - paidVal);

    const newStudent = {
      id: `std-voc-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      rollNo,
      enrollmentNo,
      registrationNo,
      studentName: name,
      fullName: name,
      fatherName: fatherName.trim(),
      motherName: (motherName || '').trim(),
      aadhaarNo: String(aadhaarNo).trim(),
      abcId: String(abcId || '').trim(),
      phone: String(phone || contact || '').trim(),
      contact: String(phone || contact || '').trim(),
      gender: gender || 'Male',
      dob: dob || '',
      address: (address || '').trim(),
      socialCategory: category || 'General',
      category: category || 'General',
      admissionSession: admissionSession || `${year}-${year + 1}`,
      admissionDate: admissionDate || new Date().toISOString().split('T')[0],
      universityName: targetInstName,
      collegeName: targetParentCenter,
      courseId: courseId || 'voc-custom',
      courseName: (courseName || trade || 'Vocational Skill Program').trim(),
      branch: (sector || trade || 'Vocational Skills').trim(),
      courseType: 'Vocational Certification',
      courseMode: 'Regular',
      currentSemester: 1,
      currentClass: 'Year-1 / Cert',
      academicFee: feeVal,
      studentFee: feeVal,
      courseFee: feeVal,
      totalFee: feeVal,
      initialPayment: paidVal,
      totalPaid: paidVal,
      balanceDue: dueVal,
      pendingDue: dueVal,
      status: 'Active',
      isVocational: true,
      instituteId: targetInstId,
      instituteName: targetInstName,
      parentCenter: targetParentCenter,
      remark: remark || `Enrolled under ${targetInstName} (${targetParentCenter})`,
      paymentMode: paymentMode || 'Cash',
      admissionTimestamp: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      feeHistory: paidVal > 0 ? [
        {
          id: `FEE-VOC-${Date.now()}`,
          date: admissionDate || new Date().toISOString().split('T')[0],
          amount: paidVal,
          purpose: 'Admission & Course Fee',
          paymentMode: paymentMode || 'Cash',
          receivedBy: 'Admin Desk',
          remark: 'Initial fee payment at admission'
        }
      ] : []
    };

    // Push into db.students at top - instantly incrementing student count from 718 -> 719, 720, etc.!
    db.students.unshift(newStudent);

    // Ensure PKC Institute is in db.colleges
    if (!Array.isArray(db.colleges)) db.colleges = [];
    const hasCol = db.colleges.some(c => (c.name || '').toLowerCase() === targetParentCenter.toLowerCase());
    if (!hasCol) {
      db.colleges.push({
        id: 'col-pkc-' + Date.now(),
        name: targetParentCenter,
        shortName: targetParentCenter,
        code: 'PKC-01',
        universityName: targetInstName,
        status: 'Active'
      });
    }

    // Ensure institute is in db.universities
    if (!Array.isArray(db.universities)) db.universities = [];
    const hasUniv = db.universities.some(u => (u.name || '').toLowerCase() === targetInstName.toLowerCase());
    if (!hasUniv) {
      db.universities.push({
        id: targetInstId,
        name: targetInstName,
        shortName: instPrefix,
        code: instPrefix,
        status: 'Active'
      });
    }

    writeDB(db);

    res.json({
      success: true,
      message: `🎉 Student "${name}" successfully enrolled in ${targetInstName}! Total students: ${db.students.length}`,
      student: newStudent,
      totalStudents: db.students.length
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to enroll student: ' + err.message });
  }
});

// 9. Get all vocational students specifically
app.get('/api/vocational-students', (req, res) => {
  try {
    const db = readDB();
    const students = (db.students || []).filter(s => 
      s.isVocational === true ||
      (s.universityName && (s.universityName.includes('दयानंद') || s.universityName.includes('Vocational') || s.universityName.includes('Teachers Training'))) ||
      (s.collegeName && (s.collegeName.includes('PKC') || s.collegeName.includes('PTC'))) ||
      s.courseType === 'Vocational Certification'
    );
    res.json({ success: true, count: students.length, totalEnrolledAll: (db.students || []).length, students });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// 9b. Update Student Enrollment Number (Admin can set or edit anytime)
app.patch('/api/vocational-students/:id/enrollment-no', (req, res) => {
  try {
    const db = readDB();
    if (!Array.isArray(db.students)) db.students = [];
    const key = (req.params.id || '').trim();
    const index = findStudentIndex(db.students, key);
    if (index === -1) {
      return res.status(404).json({ success: false, message: 'Student not found in database.' });
    }

    const enr = req.body.enrollmentNo !== undefined ? String(req.body.enrollmentNo).trim().toUpperCase() : '';
    db.students[index].enrollmentNo = enr;
    db.students[index].updatedAt = new Date().toISOString();

    writeDB(db);
    res.json({
      success: true,
      message: `Enrollment number updated to "${enr || 'None'}" successfully.`,
      student: db.students[index]
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to update enrollment number: ' + err.message });
  }
});

// 7. Download sample Excel template
app.get('/api/vocational-courses/template', (req, res) => {
  try {
    const wb = XLSX.utils.book_new();
    const sampleData = [
      {
        'Course Name': 'Electrician & Building Wireman',
        'Course Code': 'VOC-ELE-101',
        'Sector': 'Electrical & Electronics',
        'Duration': '1 Year',
        'Eligibility': '10th Pass',
        'Total Fee': 12000,
        'Certification': 'PKC Certified Skill Diploma',
        'Mode': 'Regular',
        'Description': 'House wiring, single phase and three phase motor repair, control panels'
      },
      {
        'Course Name': 'Web Development & Full-Stack Coding',
        'Course Code': 'VOC-IT-102',
        'Sector': 'IT & Computer Software',
        'Duration': '6 Months',
        'Eligibility': '12th Pass',
        'Total Fee': 15000,
        'Certification': 'PKC Professional Tech Certification',
        'Mode': 'Regular / Hybrid',
        'Description': 'HTML, CSS, JavaScript, React, Node.js and full-stack project building'
      },
      {
        'Course Name': 'Beautician & Salon Management',
        'Course Code': 'VOC-BW-103',
        'Sector': 'Beauty & Wellness',
        'Duration': '6 Months',
        'Eligibility': '8th / 10th Pass',
        'Total Fee': 10000,
        'Certification': 'PKC Beauty Diploma',
        'Mode': 'Regular',
        'Description': 'Bridal makeup, hair styling, skin treatments, facials and salon management'
      },
      {
        'Course Name': 'Solar PV System Installer',
        'Course Code': 'VOC-SOL-104',
        'Sector': 'Solar & Renewable Energy',
        'Duration': '3 Months',
        'Eligibility': '10th Pass',
        'Total Fee': 8500,
        'Certification': 'Green Energy Skill Certificate',
        'Mode': 'Regular',
        'Description': 'Rooftop solar panel mounting, wiring, inverter connection and maintenance'
      }
    ];

    const ws = XLSX.utils.json_to_sheet(sampleData);
    XLSX.utils.book_append_sheet(wb, ws, 'Vocational_Courses');
    const buffer = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });
    res.setHeader('Content-Disposition', 'attachment; filename="Vocational_Course_Import_Template.xlsx"');
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.send(buffer);
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to generate template: ' + err.message });
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
