import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import mongoose from 'mongoose';
import {
  connectMongoDB,
  SettingModel,
  UserModel,
  EntranceExamModel,
  CourseModel,
  StudentModel,
  FeePaymentModel,
  ResultModel,
  TestimonialModel,
  AboutModel,
  InquiryModel,
  EventPhotoModel,
  UniversityPaymentModel,
  UniversityCourseFeeModel
} from '../db_mongo.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DB_FILE = path.join(__dirname, '..', 'data', 'database.json');

async function migrate() {
  const mongoUri = process.env.MONGODB_URI;
  if (!mongoUri) {
    console.error('❌ Please provide MONGODB_URI environment variable.');
    console.error('Usage: MONGODB_URI="your_mongodb_connection_string" node scripts/migrate-to-mongo.js');
    process.exit(1);
  }

  console.log('🔄 Connecting to MongoDB Atlas...');
  const connected = await connectMongoDB(mongoUri);
  if (!connected) {
    console.error('❌ Failed to connect to MongoDB.');
    process.exit(1);
  }

  if (!fs.existsSync(DB_FILE)) {
    console.error('❌ Local database.json file not found at:', DB_FILE);
    process.exit(1);
  }

  console.log('📂 Reading local database.json (1.7MB)...');
  const raw = fs.readFileSync(DB_FILE, 'utf8');
  const dbData = JSON.parse(raw);

  console.log('🚀 Starting data migration to MongoDB Atlas...');

  // 1. Settings
  if (dbData.settings) {
    await SettingModel.deleteMany({});
    await SettingModel.create({ key: 'main', ...dbData.settings });
    console.log('✅ Settings migrated.');
  }

  // 2. Users
  if (dbData.users && dbData.users.length > 0) {
    await UserModel.deleteMany({});
    await UserModel.insertMany(dbData.users);
    console.log(`✅ Users migrated (${dbData.users.length} users).`);
  }

  // 3. Entrance Exams
  if (dbData.entrance_exams && dbData.entrance_exams.length > 0) {
    await EntranceExamModel.deleteMany({});
    await EntranceExamModel.insertMany(dbData.entrance_exams);
    console.log(`✅ Entrance Exams migrated (${dbData.entrance_exams.length} exams).`);
  }

  // 4. Courses
  if (dbData.courses && dbData.courses.length > 0) {
    await CourseModel.deleteMany({});
    await CourseModel.insertMany(dbData.courses);
    console.log(`✅ Courses migrated (${dbData.courses.length} courses).`);
  }

  // 5. Students
  if (dbData.students && dbData.students.length > 0) {
    await StudentModel.deleteMany({});
    await StudentModel.insertMany(dbData.students);
    console.log(`✅ Students migrated (${dbData.students.length} students).`);
  }

  // 6. Fee Payments
  if (dbData.fee_payments && dbData.fee_payments.length > 0) {
    await FeePaymentModel.deleteMany({});
    await FeePaymentModel.insertMany(dbData.fee_payments);
    console.log(`✅ Fee Payments migrated (${dbData.fee_payments.length} payments).`);
  }

  // 7. Results
  if (dbData.results && dbData.results.length > 0) {
    await ResultModel.deleteMany({});
    await ResultModel.insertMany(dbData.results);
    console.log(`✅ Results migrated (${dbData.results.length} results).`);
  }

  // 8. Testimonials
  if (dbData.testimonials && dbData.testimonials.length > 0) {
    await TestimonialModel.deleteMany({});
    await TestimonialModel.insertMany(dbData.testimonials);
    console.log(`✅ Testimonials migrated (${dbData.testimonials.length} items).`);
  }

  // 9. About
  if (dbData.about) {
    await AboutModel.deleteMany({});
    await AboutModel.create({ key: 'main', ...dbData.about });
    console.log('✅ About page data migrated.');
  }

  // 10. Inquiries
  if (dbData.inquiries && dbData.inquiries.length > 0) {
    await InquiryModel.deleteMany({});
    await InquiryModel.insertMany(dbData.inquiries);
    console.log(`✅ Inquiries migrated (${dbData.inquiries.length} inquiries).`);
  }

  // 11. Event Photos
  if (dbData.event_photos && dbData.event_photos.length > 0) {
    await EventPhotoModel.deleteMany({});
    await EventPhotoModel.insertMany(dbData.event_photos);
    console.log(`✅ Event Photos migrated (${dbData.event_photos.length} items).`);
  }

  // 12. University Payments
  if (dbData.university_payments && dbData.university_payments.length > 0) {
    await UniversityPaymentModel.deleteMany({});
    await UniversityPaymentModel.insertMany(dbData.university_payments);
    console.log(`✅ University Payments migrated (${dbData.university_payments.length} items).`);
  }

  // 13. University Course Fees
  if (dbData.university_course_fees && dbData.university_course_fees.length > 0) {
    await UniversityCourseFeeModel.deleteMany({});
    await UniversityCourseFeeModel.insertMany(dbData.university_course_fees);
    console.log(`✅ University Course Fees migrated (${dbData.university_course_fees.length} items).`);
  }

  console.log('🎉 ALL DATA SUCCESSFULLY MIGRATED TO MONGODB ATLAS!');
  await mongoose.disconnect();
  process.exit(0);
}

migrate();
