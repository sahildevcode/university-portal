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
      university_course_fees
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

      fs.writeFileSync(DB_FILE, JSON.stringify(localDb, null, 2), 'utf8');
      console.log(`✅ MongoDB Atlas Hydration complete: ${localDb.students.length} students, ${localDb.fee_payments?.length || 0} fee payments, ${localDb.courses?.length || 0} courses synced into memory/cache.`);
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
    diffCollection(UniversityCourseFeeModel, previousDbState.university_course_fees || [], current.university_course_fees || [], 'id')
  ]);

  if (current.settings && JSON.stringify(current.settings) !== JSON.stringify(previousDbState.settings)) {
    await SettingModel.findOneAndUpdate({ key: 'main' }, { key: 'main', ...current.settings }, { upsert: true });
  }

  if (current.about && JSON.stringify(current.about) !== JSON.stringify(previousDbState.about)) {
    await AboutModel.findOneAndUpdate({ key: 'main' }, { key: 'main', ...current.about }, { upsert: true });
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
}
