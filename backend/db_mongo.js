import mongoose from 'mongoose';
import dns from 'dns';
try { dns.setDefaultResultOrder('ipv4first'); } catch (e) {}

// Flexible Schema definitions for all collections in the portal

const settingSchema = new mongoose.Schema({
  key: { type: String, default: 'main' },
  resultPortalActive: { type: Boolean, default: false },
  academicSession: { type: String, default: '2026-27' },
  announcementNotice: { type: String, default: '' }
}, { strict: false, timestamps: true });

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, default: 'admin' },
  name: { type: String, default: '' }
}, { strict: false, timestamps: true });

const entranceExamSchema = new mongoose.Schema({
  id: String,
  appNo: String,
  candidateName: String,
  appliedCourse: String,
  entranceScore: Number,
  maxScore: Number,
  meritRank: Number,
  status: String,
  examDate: String
}, { strict: false, timestamps: true });

const courseSchema = new mongoose.Schema({
  id: String,
  name: String,
  code: String,
  department: String,
  durationYears: Number,
  totalSemesters: Number,
  totalFee: Number,
  feePerSemester: Number,
  eligibility: String,
  description: String,
  subjectsBySemester: mongoose.Schema.Types.Mixed
}, { strict: false, timestamps: true });

const studentSchema = new mongoose.Schema({
  id: String,
  enrollmentNo: String,
  rollNo: String,
  name: String,
  fatherName: String,
  motherName: String,
  dob: String,
  gender: String,
  category: String,
  course: String,
  session: String,
  admissionDate: String,
  status: { type: String, default: 'Active' },
  studentPhotoUrl: String,
  documents: [mongoose.Schema.Types.Mixed],
  universityName: String,
  collegeName: String,
  totalPackageFee: Number,
  paidFee: Number,
  dueFee: Number,
  universityFee: Number,
  universityPaid: Number,
  universityDue: Number
}, { strict: false, timestamps: true });

const feePaymentSchema = new mongoose.Schema({
  id: String,
  receiptNo: String,
  studentId: String,
  enrollmentNo: String,
  studentName: String,
  course: String,
  amount: Number,
  paymentMode: String,
  transactionId: String,
  paymentDate: String,
  remarks: String
}, { strict: false, timestamps: true });

const resultSchema = new mongoose.Schema({
  id: String,
  enrollmentNo: String,
  rollNo: String,
  studentName: String,
  course: String,
  semester: Number,
  session: String,
  examDate: String,
  status: String, // Pass, Fail, Backlog
  sgpa: Number,
  cgpa: Number,
  subjects: [mongoose.Schema.Types.Mixed]
}, { strict: false, timestamps: true });

const testimonialSchema = new mongoose.Schema({
  id: String,
  title: String,
  studentName: String,
  course: String,
  review: String,
  badge: String,
  imageUrl: String,
  rating: Number,
  active: Boolean
}, { strict: false, timestamps: true });

const aboutSchema = new mongoose.Schema({
  key: { type: String, default: 'main' },
  establishedYear: Number,
  yearsOfExcellence: Number,
  totalStudentsGuided: Number,
  totalAffiliations: Number,
  placementRate: String,
  tagline: String,
  mission: String,
  history: String,
  directorName: String,
  services: [String]
}, { strict: false, timestamps: true });

const inquirySchema = new mongoose.Schema({
  id: String,
  name: String,
  email: String,
  phone: String,
  course: String,
  message: String,
  status: { type: String, default: 'New' },
  createdAt: String
}, { strict: false, timestamps: true });

const eventPhotoSchema = new mongoose.Schema({
  id: String,
  title: String,
  titleHi: String,
  category: String,
  date: String,
  description: String,
  imageUrl: String,
  active: Boolean
}, { strict: false, timestamps: true });

const universityPaymentSchema = new mongoose.Schema({
  id: String,
  receiptNo: String,
  studentId: String,
  universityName: String,
  amount: Number,
  paymentMode: String,
  transactionId: String,
  paymentDate: String,
  remarks: String
}, { strict: false, timestamps: true });

const universityCourseFeeSchema = new mongoose.Schema({
  id: String,
  universityName: String,
  courseName: String,
  officialFee: Number,
  feePerSemester: Number,
  notes: String
}, { strict: false, timestamps: true });

// Models
export const SettingModel = mongoose.model('Setting', settingSchema);
export const UserModel = mongoose.model('User', userSchema);
export const EntranceExamModel = mongoose.model('EntranceExam', entranceExamSchema);
export const CourseModel = mongoose.model('Course', courseSchema);
export const StudentModel = mongoose.model('Student', studentSchema);
export const FeePaymentModel = mongoose.model('FeePayment', feePaymentSchema);
export const ResultModel = mongoose.model('Result', resultSchema);
export const TestimonialModel = mongoose.model('Testimonial', testimonialSchema);
export const AboutModel = mongoose.model('About', aboutSchema);
export const InquiryModel = mongoose.model('Inquiry', inquirySchema);
export const EventPhotoModel = mongoose.model('EventPhoto', eventPhotoSchema);
export const UniversityPaymentModel = mongoose.model('UniversityPayment', universityPaymentSchema);
export const UniversityCourseFeeModel = mongoose.model('UniversityCourseFee', universityCourseFeeSchema);

export async function connectMongoDB(uri) {
  if (!uri) {
    console.warn('⚠️ MONGODB_URI not provided. Falling back to local JSON database.');
    return false;
  }
  try {
    try {
      dns.setServers(['8.8.8.8', '8.8.4.4']);
    } catch (dnsErr) {}
    await mongoose.connect(uri);
    console.log('✅ Connected to MongoDB Atlas Cloud Database successfully!');
    return true;
  } catch (error) {
    console.error('❌ MongoDB Atlas connection error:', error.message);
    return false;
  }
}
