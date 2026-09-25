import mongoose from 'mongoose';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dns from 'dns';

try { dns.setDefaultResultOrder('ipv4first'); } catch (e) {}

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const MONGODB_URI = 'mongodb+srv://juniourkhan9_db_user:s3BdVXa0cgivh185@cluster0.om2mekn.mongodb.net/pkc_university?retryWrites=true&w=majority&appName=Cluster0';

import {
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
} from './db_mongo.js';

async function migrate() {
  console.log('🔄 Connecting to MongoDB Atlas...');
  try {
    try {
      dns.setServers(['8.8.8.8', '8.8.4.4']);
    } catch (e) {}
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB Atlas successfully!');

    const dbPath = path.join(__dirname, 'data', 'database.json');
    if (!fs.existsSync(dbPath)) {
      console.error('❌ database.json not found at:', dbPath);
      process.exit(1);
    }

    const raw = fs.readFileSync(dbPath, 'utf8');
    const data = JSON.parse(raw);

    console.log('\n📊 Data to migrate:');
    console.log(`- Students: ${data.students?.length || 0}`);
    console.log(`- Courses: ${data.courses?.length || 0}`);
    console.log(`- Fee Payments: ${data.fee_payments?.length || 0}`);
    console.log(`- Users: ${data.users?.length || 0}`);
    console.log(`- Inquiries: ${data.inquiries?.length || 0}`);
    console.log(`- Testimonials: ${data.testimonials?.length || 0}`);
    console.log(`- Event Photos: ${data.event_photos?.length || 0}`);

    // 1. Settings
    if (data.settings) {
      await SettingModel.deleteMany({});
      await SettingModel.create({ key: 'main', ...data.settings });
      console.log('✅ Settings migrated');
    }

    // 2. Users
    if (Array.isArray(data.users) && data.users.length > 0) {
      await UserModel.deleteMany({});
      await UserModel.insertMany(data.users);
      console.log(`✅ ${data.users.length} Users migrated`);
    }

    // 3. Courses
    if (Array.isArray(data.courses) && data.courses.length > 0) {
      await CourseModel.deleteMany({});
      await CourseModel.insertMany(data.courses);
      console.log(`✅ ${data.courses.length} Courses migrated`);
    }

    // 4. Students
    if (Array.isArray(data.students) && data.students.length > 0) {
      await StudentModel.deleteMany({});
      // Insert in chunks of 100 for safety
      const chunkSize = 100;
      for (let i = 0; i < data.students.length; i += chunkSize) {
        const chunk = data.students.slice(i, i + chunkSize);
        await StudentModel.insertMany(chunk);
      }
      console.log(`✅ ${data.students.length} Students migrated`);
    }

    // 5. Fee Payments
    if (Array.isArray(data.fee_payments) && data.fee_payments.length > 0) {
      await FeePaymentModel.deleteMany({});
      const chunkSize = 100;
      for (let i = 0; i < data.fee_payments.length; i += chunkSize) {
        const chunk = data.fee_payments.slice(i, i + chunkSize);
        await FeePaymentModel.insertMany(chunk);
      }
      console.log(`✅ ${data.fee_payments.length} Fee Payments migrated`);
    }

    // 6. Inquiries
    if (Array.isArray(data.inquiries) && data.inquiries.length > 0) {
      await InquiryModel.deleteMany({});
      await InquiryModel.insertMany(data.inquiries);
      console.log(`✅ ${data.inquiries.length} Inquiries migrated`);
    }

    // 7. Testimonials
    if (Array.isArray(data.testimonials) && data.testimonials.length > 0) {
      await TestimonialModel.deleteMany({});
      await TestimonialModel.insertMany(data.testimonials);
      console.log(`✅ ${data.testimonials.length} Testimonials migrated`);
    }

    // 8. Event Photos
    if (Array.isArray(data.event_photos) && data.event_photos.length > 0) {
      await EventPhotoModel.deleteMany({});
      await EventPhotoModel.insertMany(data.event_photos);
      console.log(`✅ ${data.event_photos.length} Event Photos migrated`);
    }

    // 9. About
    if (data.about) {
      await AboutModel.deleteMany({});
      await AboutModel.create({ key: 'main', ...data.about });
      console.log('✅ About info migrated');
    }

    // 10. University Payments
    if (Array.isArray(data.university_payments) && data.university_payments.length > 0) {
      await UniversityPaymentModel.deleteMany({});
      await UniversityPaymentModel.insertMany(data.university_payments);
      console.log(`✅ ${data.university_payments.length} University Payments migrated`);
    }

    // 11. University Course Fees
    if (Array.isArray(data.university_course_fees) && data.university_course_fees.length > 0) {
      await UniversityCourseFeeModel.deleteMany({});
      await UniversityCourseFeeModel.insertMany(data.university_course_fees);
      console.log(`✅ ${data.university_course_fees.length} University Course Fees migrated`);
    }

    console.log('\n🎉 ALL DATA MIGRATED TO MONGODB ATLAS CLOUD SUCCESSFULLY!');
    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error('❌ Migration failed:', err);
    process.exit(1);
  }
}

migrate();
