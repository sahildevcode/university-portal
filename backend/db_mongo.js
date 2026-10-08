import mongoose from 'mongoose';
import dns from 'dns';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DB_FILE = path.join(__dirname, 'data', 'database.json');

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
  status: String,
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

const staffUserSchema = new mongoose.Schema({
  id: String,
  username: String,
  name: String,
  role: String,
  department: String,
  status: String,
  salary: Number
}, { strict: false, timestamps: true });

const staffAttendanceSchema = new mongoose.Schema({
  id: String,
  date: String,
  staffId: String,
  staffName: String,
  status: String
}, { strict: false, timestamps: true });

const staffSalaryPaymentSchema = new mongoose.Schema({
  id: String,
  voucherNo: String,
  staffId: String,
  staffName: String,
  monthString: String
}, { strict: false, timestamps: true });

const jobApplicationSchema = new mongoose.Schema({
  id: String,
  fullName: String,
  phone: String,
  email: String,
  city: String,
  role: String,
  experience: String,
  education: String,
  skills: String,
  coverNote: String,
  resumeFileName: String,
  resumeFileSize: String,
  resumeBase64: String,
  resumeUrl: String,
  date: String,
  status: { type: String, default: 'New' }
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
export const StaffUserModel = mongoose.model('StaffUser', staffUserSchema);
export const StaffAttendanceModel = mongoose.model('StaffAttendance', staffAttendanceSchema);
export const StaffSalaryPaymentModel = mongoose.model('StaffSalaryPayment', staffSalaryPaymentSchema);
export const JobApplicationModel = mongoose.model('JobApplication', jobApplicationSchema);
export const VocationalInstituteModel = mongoose.model('VocationalInstitute', new mongoose.Schema({
  id: String,
  name: String,
  shortName: String,
  code: String,
  parentCenter: String,
  type: String,
  address: String,
  contact: String,
  description: String,
  status: String
}, { strict: false, timestamps: true }));
export const VocationalCourseModel = mongoose.model('VocationalCourse', new mongoose.Schema({
  id: String,
  instituteId: String,
  instituteName: String,
  courseName: String,
  courseCode: String,
  sector: String,
  duration: String,
  eligibility: String,
  fee: Number,
  certification: String,
  mode: String,
  description: String,
  status: String
}, { strict: false, timestamps: true }));

export const HomeCmsModel = mongoose.model('HomeCms', new mongoose.Schema({
  key: { type: String, default: 'main', unique: true },
  heroTitleEn: String,
  heroTitleHi: String,
  heroTaglineEn: String,
  heroTaglineHi: String,
  campusBgImage: String,
  sirHeroImage: String,
  honorBadgeTitle: String,
  honorBadgeEst: String,
  honorBadgeReg: String,
  tickerTextEn: String,
  tickerTextHi: String,
  counterStudents: Number,
  counterAffiliations: Number,
  counterDegrees: Number,
  counterYears: Number,
  counterCareerRate: Number
}, { strict: false, timestamps: true }));

export const UniversityModel = mongoose.model('University', new mongoose.Schema({
  id: String,
  name: String,
  shortName: String,
  code: String,
  city: String,
  state: String,
  approvedBy: String,
  website: String,
  description: String,
  establishedYear: Number,
  status: String,
  createdAt: String
}, { strict: false, timestamps: true }));

export const CollegeModel = mongoose.model('College', new mongoose.Schema({
  id: String,
  name: String,
  shortName: String,
  code: String,
  universityId: String,
  universityName: String,
  district: String,
  state: String,
  address: String,
  status: String,
  createdAt: String
}, { strict: false, timestamps: true }));

export const FeedbackModel = mongoose.model('Feedback', new mongoose.Schema({
  id: String,
  name: String,
  studentName: String,
  rollNo: String,
  message: String,
  rating: Number,
  status: String,
  date: String
}, { strict: false, timestamps: true }));

export const StudentUserModel = mongoose.model('StudentUser', new mongoose.Schema({
  id: String,
  rollNo: String,
  password: String,
  studentName: String,
  phone: String,
  status: String
}, { strict: false, timestamps: true }));

export const FeeAdjustmentModel = mongoose.model('FeeAdjustment', new mongoose.Schema({
  id: String,
  studentId: String,
  rollNo: String,
  studentName: String,
  amount: Number,
  type: String,
  reason: String,
  date: String
}, { strict: false, timestamps: true }));

function cleanDoc(doc) {
  if (!doc) return doc;
  const { _id, __v, ...rest } = doc;
  return rest;
}

// In-memory state tracking for lightning-fast diff-based syncing
let previousDbState = null;
let isSyncing = false;
let pendingDb = null;

function sanitizeMongoUri(rawUri) {
  if (!rawUri) return rawUri;
  let uri = String(rawUri).trim();
  if ((uri.startsWith('"') && uri.endsWith('"')) || (uri.startsWith("'") && uri.endsWith("'"))) {
    uri = uri.slice(1, -1).trim();
  }
  try {
    const parsed = new URL(uri);
    const seen = new Set();
    const cleanParams = [];
    for (const [key, val] of parsed.searchParams.entries()) {
      const lower = key.toLowerCase();
      if (!seen.has(lower)) {
        seen.add(lower);
        cleanParams.push(`${key}=${val}`);
      }
    }
    parsed.search = cleanParams.length ? '?' + cleanParams.join('&') : '';
    return parsed.toString();
  } catch (e) {
    return uri;
  }
}

export function isMongoConnected() {
  return mongoose.connection.readyState === 1;
}

export async function connectMongoDB(rawUri) {
  if (mongoose.connection.readyState === 1) {
    return true;
  }
  if (!rawUri) {
    console.warn('⚠️ MONGODB_URI not provided. Falling back to local JSON database.');
    return false;
  }
  const uri = sanitizeMongoUri(rawUri);
  try {
    try {
      dns.setServers(['8.8.8.8', '8.8.4.4']);
    } catch (dnsErr) {}
    await mongoose.connect(uri);
    console.log('✅ Connected to MongoDB Atlas Cloud Database successfully!');
    global.__scheduleMongoSync = scheduleMongoSync;
    return true;
  } catch (error) {
    console.error('❌ MongoDB Atlas connection error:', error.message);
    return false;
  }
}

// Hydrate database.json from MongoDB Atlas on server startup
export async function hydrateFromMongo() {
  try {
    console.log('🔄 Checking & Hydrating database from MongoDB Atlas...');
    const [
      students,
      courses,
      fee_payments,
      inquiries,
      testimonials,
      event_photos,
      settings,
      about,
      users,
      university_payments,
      university_course_fees,
      staff_users,
      staff_attendance,
      staff_salary_payments,
      job_applications,
      vocational_institutes,
      vocational_courses,
      home_cms,
      universities,
      colleges,
      results,
      entrance_exams,
      feedbacks,
      student_users,
      fee_adjustments
    ] = await Promise.all([
      StudentModel.find({}).lean(),
      CourseModel.find({}).lean(),
      FeePaymentModel.find({}).lean(),
      InquiryModel.find({}).lean(),
      TestimonialModel.find({}).lean(),
      EventPhotoModel.find({}).lean(),
      SettingModel.findOne({ key: 'main' }).lean(),
      AboutModel.findOne({ key: 'main' }).lean(),
      UserModel.find({}).lean(),
      UniversityPaymentModel.find({}).lean(),
      UniversityCourseFeeModel.find({}).lean(),
      StaffUserModel.find({}).lean(),
      StaffAttendanceModel.find({}).lean(),
      StaffSalaryPaymentModel.find({}).lean(),
      JobApplicationModel.find({}).lean(),
      VocationalInstituteModel.find({}).lean(),
      VocationalCourseModel.find({}).lean(),
      HomeCmsModel.findOne({ key: 'main' }).lean(),
      UniversityModel.find({}).lean(),
      CollegeModel.find({}).lean(),
      ResultModel.find({}).lean(),
      EntranceExamModel.find({}).lean(),
      FeedbackModel.find({}).lean(),
      StudentUserModel.find({}).lean(),
      FeeAdjustmentModel.find({}).lean(),
    ]);

    let localDb = {};
    if (fs.existsSync(DB_FILE)) {
      try {
        localDb = JSON.parse(fs.readFileSync(DB_FILE, 'utf8'));
      } catch (e) {}
    }

    if (students && students.length > 0) {
      localDb.students = students.map(cleanDoc);
      if (courses && courses.length > 0) localDb.courses = courses.map(cleanDoc);
      if (fee_payments && fee_payments.length > 0) localDb.fee_payments = fee_payments.map(cleanDoc);
      if (inquiries && inquiries.length > 0) localDb.inquiries = inquiries.map(cleanDoc);
      if (testimonials && testimonials.length > 0) localDb.testimonials = testimonials.map(cleanDoc);
      if (event_photos && event_photos.length > 0) localDb.event_photos = event_photos.map(cleanDoc);
      if (settings) localDb.settings = cleanDoc(settings);
      if (about) localDb.about = cleanDoc(about);
      if (users && users.length > 0) localDb.users = users.map(cleanDoc);
      if (university_payments && university_payments.length > 0) localDb.university_payments = university_payments.map(cleanDoc);
      if (university_course_fees && university_course_fees.length > 0) localDb.university_course_fees = university_course_fees.map(cleanDoc);
      if (staff_users && staff_users.length > 0) localDb.staff_users = staff_users.map(cleanDoc);
      if (staff_attendance && staff_attendance.length > 0) localDb.staff_attendance = staff_attendance.map(cleanDoc);
      if (staff_salary_payments && staff_salary_payments.length > 0) localDb.staff_salary_payments = staff_salary_payments.map(cleanDoc);
      if (job_applications && job_applications.length > 0) {
        localDb.jobApplications = job_applications.map(cleanDoc);
      }
      if (vocational_institutes && vocational_institutes.length > 0) {
        localDb.vocationalInstitutes = vocational_institutes.map(cleanDoc);
      }
      if (vocational_courses && vocational_courses.length > 0) {
        localDb.vocationalCourses = vocational_courses.map(cleanDoc);
      }
      if (home_cms) {
        localDb.home_cms = cleanDoc(home_cms);
      }
      if (universities && universities.length > 0) {
        localDb.universities = universities.map(cleanDoc);
      }
      if (colleges && colleges.length > 0) {
        localDb.colleges = colleges.map(cleanDoc);
      }
      if (results && results.length > 0) {
        localDb.results = results.map(cleanDoc);
      }
      if (entrance_exams && entrance_exams.length > 0) {
        localDb.entrance_exams = entrance_exams.map(cleanDoc);
      }
      if (feedbacks && feedbacks.length > 0) {
        localDb.feedbacks = feedbacks.map(cleanDoc);
      }
      if (student_users && student_users.length > 0) {
        localDb.student_users = student_users.map(cleanDoc);
      }
      if (fee_adjustments && fee_adjustments.length > 0) {
        localDb.fee_adjustments = fee_adjustments.map(cleanDoc);
      }

      // If Atlas doesn't have staff data yet, auto-seed from local database.json
      if ((!staff_users || staff_users.length === 0) && localDb.staff_users && localDb.staff_users.length > 0) {
        await StaffUserModel.deleteMany({});
        await StaffUserModel.insertMany(localDb.staff_users);
      }
      if ((!staff_attendance || staff_attendance.length === 0) && localDb.staff_attendance && localDb.staff_attendance.length > 0) {
        await StaffAttendanceModel.deleteMany({});
        await StaffAttendanceModel.insertMany(localDb.staff_attendance);
      }
      if ((!staff_salary_payments || staff_salary_payments.length === 0) && localDb.staff_salary_payments && localDb.staff_salary_payments.length > 0) {
        await StaffSalaryPaymentModel.deleteMany({});
        await StaffSalaryPaymentModel.insertMany(localDb.staff_salary_payments);
      }
      if ((!job_applications || job_applications.length === 0) && localDb.jobApplications && localDb.jobApplications.length > 0) {
        await JobApplicationModel.deleteMany({});
        await JobApplicationModel.insertMany(localDb.jobApplications);
      }
      if ((!vocational_institutes || vocational_institutes.length === 0) && localDb.vocationalInstitutes && localDb.vocationalInstitutes.length > 0) {
        await VocationalInstituteModel.deleteMany({});
        await VocationalInstituteModel.insertMany(localDb.vocationalInstitutes);
      }
      if ((!vocational_courses || vocational_courses.length === 0) && localDb.vocationalCourses && localDb.vocationalCourses.length > 0) {
        await VocationalCourseModel.deleteMany({});
        await VocationalCourseModel.insertMany(localDb.vocationalCourses);
      }
      if ((!universities || universities.length === 0) && localDb.universities && localDb.universities.length > 0) {
        await UniversityModel.deleteMany({});
        await UniversityModel.insertMany(localDb.universities);
      }
      if ((!colleges || colleges.length === 0) && localDb.colleges && localDb.colleges.length > 0) {
        await CollegeModel.deleteMany({});
        await CollegeModel.insertMany(localDb.colleges);
      }
      if ((!results || results.length === 0) && localDb.results && localDb.results.length > 0) {
        await ResultModel.deleteMany({});
        await ResultModel.insertMany(localDb.results);
      }
      if ((!entrance_exams || entrance_exams.length === 0) && localDb.entrance_exams && localDb.entrance_exams.length > 0) {
        await EntranceExamModel.deleteMany({});
        await EntranceExamModel.insertMany(localDb.entrance_exams);
      }
      if ((!feedbacks || feedbacks.length === 0) && localDb.feedbacks && localDb.feedbacks.length > 0) {
        await FeedbackModel.deleteMany({});
        await FeedbackModel.insertMany(localDb.feedbacks);
      }
      if ((!student_users || student_users.length === 0) && localDb.student_users && localDb.student_users.length > 0) {
        await StudentUserModel.deleteMany({});
        await StudentUserModel.insertMany(localDb.student_users);
      }
      if ((!fee_adjustments || fee_adjustments.length === 0) && localDb.fee_adjustments && localDb.fee_adjustments.length > 0) {
        await FeeAdjustmentModel.deleteMany({});
        await FeeAdjustmentModel.insertMany(localDb.fee_adjustments);
      }

      fs.writeFileSync(DB_FILE, JSON.stringify(localDb, null, 2), 'utf8');
      console.log(`✅ MongoDB Atlas Hydration complete: ${localDb.students.length} students, ${localDb.universities?.length || 0} universities, ${localDb.vocationalCourses?.length || 0} vocational courses synced into memory/cache.`);
    } else if (localDb.students && localDb.students.length > 0) {
      console.log('⚠️ MongoDB Atlas is empty. Auto-seeding from local database.json...');
      await seedMongoFromDb(localDb);
    }

    previousDbState = JSON.parse(JSON.stringify(localDb));
    return localDb;
  } catch (err) {
    console.error('❌ MongoDB hydration error:', err.message);
  }
}

// Background scheduler for MongoDB Sync (debounced and queued)
export function scheduleMongoSync(newDb) {
  if (mongoose.connection.readyState !== 1) return;
  pendingDb = JSON.parse(JSON.stringify(newDb));
  if (isSyncing) return;

  isSyncing = true;
  setTimeout(async () => {
    while (pendingDb) {
      const current = pendingDb;
      pendingDb = null;
      try {
        await diffAndSync(current);
      } catch (err) {
        console.error('❌ Background MongoDB sync error:', err.message);
      }
    }
    isSyncing = false;
  }, 100);
}

// Diff and push only changed documents to MongoDB Atlas
async function diffAndSync(current) {
  if (!previousDbState) {
    previousDbState = {};
  }

  await Promise.all([
    diffCollection(StudentModel, previousDbState.students || [], current.students || [], 'id'),
    diffCollection(FeePaymentModel, previousDbState.fee_payments || [], current.fee_payments || [], 'id'),
    diffCollection(CourseModel, previousDbState.courses || [], current.courses || [], 'id'),
    diffCollection(InquiryModel, previousDbState.inquiries || [], current.inquiries || [], 'id'),
    diffCollection(TestimonialModel, previousDbState.testimonials || [], current.testimonials || [], 'id'),
    diffCollection(EventPhotoModel, previousDbState.event_photos || [], current.event_photos || [], 'id'),
    diffCollection(UniversityPaymentModel, previousDbState.university_payments || [], current.university_payments || [], 'id'),
    diffCollection(UniversityCourseFeeModel, previousDbState.university_course_fees || [], current.university_course_fees || [], 'id'),
    diffCollection(StaffUserModel, previousDbState.staff_users || [], current.staff_users || [], 'id'),
    diffCollection(StaffAttendanceModel, previousDbState.staff_attendance || [], current.staff_attendance || [], 'id'),
    diffCollection(StaffSalaryPaymentModel, previousDbState.staff_salary_payments || [], current.staff_salary_payments || [], 'id'),
    diffCollection(JobApplicationModel, previousDbState.jobApplications || [], current.jobApplications || [], 'id'),
    diffCollection(VocationalInstituteModel, previousDbState.vocationalInstitutes || [], current.vocationalInstitutes || [], 'id'),
    diffCollection(VocationalCourseModel, previousDbState.vocationalCourses || [], current.vocationalCourses || [], 'id'),
    diffCollection(UniversityModel, previousDbState.universities || [], current.universities || [], 'id'),
    diffCollection(CollegeModel, previousDbState.colleges || [], current.colleges || [], 'id'),
    diffCollection(ResultModel, previousDbState.results || [], current.results || [], 'id'),
    diffCollection(EntranceExamModel, previousDbState.entrance_exams || [], current.entrance_exams || [], 'id'),
    diffCollection(FeedbackModel, previousDbState.feedbacks || [], current.feedbacks || [], 'id'),
    diffCollection(StudentUserModel, previousDbState.student_users || [], current.student_users || [], 'id'),
    diffCollection(FeeAdjustmentModel, previousDbState.fee_adjustments || [], current.fee_adjustments || [], 'id')
  ]);

  if (current.settings && JSON.stringify(current.settings) !== JSON.stringify(previousDbState.settings)) {
    await SettingModel.findOneAndUpdate({ key: 'main' }, { key: 'main', ...current.settings }, { upsert: true });
  }

  if (current.about && JSON.stringify(current.about) !== JSON.stringify(previousDbState.about)) {
    await AboutModel.findOneAndUpdate({ key: 'main' }, { key: 'main', ...current.about }, { upsert: true });
  }

  if (current.home_cms && JSON.stringify(current.home_cms) !== JSON.stringify(previousDbState.home_cms)) {
    await HomeCmsModel.findOneAndUpdate({ key: 'main' }, { key: 'main', ...current.home_cms }, { upsert: true });
  }

  previousDbState = JSON.parse(JSON.stringify(current));
}

// Diff individual collections
async function diffCollection(Model, prevList, currentList, idKey = 'id') {
  const prevMap = new Map();
  for (const item of prevList) {
    if (item && item[idKey]) {
      prevMap.set(String(item[idKey]), JSON.stringify(item));
    }
  }

  const currentMap = new Map();
  const toUpsert = [];
  for (const item of currentList) {
    if (item && item[idKey]) {
      const idStr = String(item[idKey]);
      const jsonStr = JSON.stringify(item);
      currentMap.set(idStr, true);
      const prevJson = prevMap.get(idStr);
      if (!prevJson || prevJson !== jsonStr) {
        toUpsert.push(item);
      }
    }
  }

  const toDeleteIds = [];
  for (const [idStr] of prevMap.entries()) {
    if (!currentMap.has(idStr)) {
      toDeleteIds.push(idStr);
    }
  }

  if (toUpsert.length > 0) {
    if (toUpsert.length <= 15) {
      await Promise.all(toUpsert.map(doc =>
        Model.findOneAndUpdate({ [idKey]: doc[idKey] }, doc, { upsert: true })
      ));
    } else {
      const ops = toUpsert.map(doc => ({
        updateOne: {
          filter: { [idKey]: doc[idKey] },
          update: { $set: doc },
          upsert: true
        }
      }));
      await Model.bulkWrite(ops);
    }
  }

  if (toDeleteIds.length > 0) {
    await Model.deleteMany({ [idKey]: { $in: toDeleteIds } });
  }
}

// Auto-seed Atlas from local DB if Atlas was empty
async function seedMongoFromDb(data) {
  if (data.settings) await SettingModel.findOneAndUpdate({ key: 'main' }, { key: 'main', ...data.settings }, { upsert: true });
  if (data.about) await AboutModel.findOneAndUpdate({ key: 'main' }, { key: 'main', ...data.about }, { upsert: true });
  if (data.home_cms) await HomeCmsModel.findOneAndUpdate({ key: 'main' }, { key: 'main', ...data.home_cms }, { upsert: true });
  if (Array.isArray(data.users) && data.users.length) {
    await UserModel.deleteMany({});
    await UserModel.insertMany(data.users);
  }
  if (Array.isArray(data.courses) && data.courses.length) {
    await CourseModel.deleteMany({});
    await CourseModel.insertMany(data.courses);
  }
  if (Array.isArray(data.students) && data.students.length) {
    await StudentModel.deleteMany({});
    const chunkSize = 100;
    for (let i = 0; i < data.students.length; i += chunkSize) {
      await StudentModel.insertMany(data.students.slice(i, i + chunkSize));
    }
  }
  if (Array.isArray(data.fee_payments) && data.fee_payments.length) {
    await FeePaymentModel.deleteMany({});
    const chunkSize = 100;
    for (let i = 0; i < data.fee_payments.length; i += chunkSize) {
      await FeePaymentModel.insertMany(data.fee_payments.slice(i, i + chunkSize));
    }
  }
  if (Array.isArray(data.inquiries) && data.inquiries.length) {
    await InquiryModel.deleteMany({});
    await InquiryModel.insertMany(data.inquiries);
  }
  if (Array.isArray(data.testimonials) && data.testimonials.length) {
    await TestimonialModel.deleteMany({});
    await TestimonialModel.insertMany(data.testimonials);
  }
  if (Array.isArray(data.event_photos) && data.event_photos.length) {
    await EventPhotoModel.deleteMany({});
    await EventPhotoModel.insertMany(data.event_photos);
  }
  if (Array.isArray(data.university_payments) && data.university_payments.length) {
    await UniversityPaymentModel.deleteMany({});
    await UniversityPaymentModel.insertMany(data.university_payments);
  }
  if (Array.isArray(data.university_course_fees) && data.university_course_fees.length) {
    await UniversityCourseFeeModel.deleteMany({});
    await UniversityCourseFeeModel.insertMany(data.university_course_fees);
  }
  if (Array.isArray(data.staff_users) && data.staff_users.length) {
    await StaffUserModel.deleteMany({});
    await StaffUserModel.insertMany(data.staff_users);
  }
  if (Array.isArray(data.staff_attendance) && data.staff_attendance.length) {
    await StaffAttendanceModel.deleteMany({});
    await StaffAttendanceModel.insertMany(data.staff_attendance);
  }
  if (Array.isArray(data.staff_salary_payments) && data.staff_salary_payments.length) {
    await StaffSalaryPaymentModel.deleteMany({});
    await StaffSalaryPaymentModel.insertMany(data.staff_salary_payments);
  }
  if (Array.isArray(data.jobApplications) && data.jobApplications.length) {
    await JobApplicationModel.deleteMany({});
    await JobApplicationModel.insertMany(data.jobApplications);
  }
  if (Array.isArray(data.vocationalInstitutes) && data.vocationalInstitutes.length) {
    await VocationalInstituteModel.deleteMany({});
    await VocationalInstituteModel.insertMany(data.vocationalInstitutes);
  }
  if (Array.isArray(data.vocationalCourses) && data.vocationalCourses.length) {
    await VocationalCourseModel.deleteMany({});
    const chunkSize = 100;
    for (let i = 0; i < data.vocationalCourses.length; i += chunkSize) {
      await VocationalCourseModel.insertMany(data.vocationalCourses.slice(i, i + chunkSize));
    }
  }
  if (Array.isArray(data.universities) && data.universities.length) {
    await UniversityModel.deleteMany({});
    await UniversityModel.insertMany(data.universities);
  }
  if (Array.isArray(data.colleges) && data.colleges.length) {
    await CollegeModel.deleteMany({});
    await CollegeModel.insertMany(data.colleges);
  }
  if (Array.isArray(data.results) && data.results.length) {
    await ResultModel.deleteMany({});
    await ResultModel.insertMany(data.results);
  }
  if (Array.isArray(data.entrance_exams) && data.entrance_exams.length) {
    await EntranceExamModel.deleteMany({});
    await EntranceExamModel.insertMany(data.entrance_exams);
  }
  if (Array.isArray(data.feedbacks) && data.feedbacks.length) {
    await FeedbackModel.deleteMany({});
    await FeedbackModel.insertMany(data.feedbacks);
  }
  if (Array.isArray(data.student_users) && data.student_users.length) {
    await StudentUserModel.deleteMany({});
    await StudentUserModel.insertMany(data.student_users);
  }
  if (Array.isArray(data.fee_adjustments) && data.fee_adjustments.length) {
    await FeeAdjustmentModel.deleteMany({});
    await FeeAdjustmentModel.insertMany(data.fee_adjustments);
  }
}
