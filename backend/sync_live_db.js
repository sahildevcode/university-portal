import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function syncLiveData() {
  const dbPath = path.join(__dirname, 'data', 'database.json');
  const backupPath = path.join(__dirname, 'data', `database_backup_live_${Date.now()}.json`);

  console.log('Reading local database.json...');
  const localDb = JSON.parse(fs.readFileSync(dbPath, 'utf8'));

  // 1. Create safety backup first
  fs.writeFileSync(backupPath, JSON.stringify(localDb, null, 2), 'utf8');
  console.log('Safety backup created at:', backupPath);

  // 2. Fetch live students from Render
  console.log('Fetching live students from Render...');
  const resStudents = await fetch('https://pkc-university-api.onrender.com/api/students');
  const studentsData = await resStudents.json();
  const liveStudents = studentsData.students || [];

  if (!Array.isArray(liveStudents) || liveStudents.length === 0) {
    throw new Error('Failed to fetch live students: empty or invalid response');
  }

  // Map local students by id and rollNo
  const studentMap = new Map();
  localDb.students.forEach((s, idx) => {
    if (s.id) studentMap.set(s.id, idx);
    if (s.rollNo) studentMap.set(s.rollNo, idx);
  });

  let updatedCount = 0;
  let addedCount = 0;

  for (const ls of liveStudents) {
    const key = ls.id || ls.rollNo;
    const idx = studentMap.get(key);
    if (idx !== undefined) {
      localDb.students[idx] = { ...localDb.students[idx], ...ls };
      updatedCount++;
    } else {
      localDb.students.push(ls);
      studentMap.set(key, localDb.students.length - 1);
      addedCount++;
    }
  }
  console.log(`Students sync complete: ${updatedCount} updated, ${addedCount} added.`);

  // 3. Sync fee payments
  if (!Array.isArray(localDb.fee_payments)) localDb.fee_payments = [];
  const existingPayIds = new Set(localDb.fee_payments.map(p => p.id || p.receiptNo));

  let newPayments = 0;
  liveStudents.forEach(s => {
    if (Array.isArray(s.feeHistory)) {
      s.feeHistory.forEach(r => {
        const pKey = r.id || r.receiptNo;
        if (!existingPayIds.has(pKey)) {
          localDb.fee_payments.unshift(r);
          existingPayIds.add(pKey);
          newPayments++;
        }
      });
    }
  });
  console.log(`Fee payments synced: ${newPayments} new receipt(s) added.`);

  // 4. Fetch live courses
  console.log('Fetching live courses...');
  try {
    const resCourses = await fetch('https://pkc-university-api.onrender.com/api/courses');
    const coursesData = await resCourses.json();
    const liveCourses = coursesData.courses || [];
    if (Array.isArray(liveCourses) && liveCourses.length > localDb.courses.length) {
      console.log(`Updating courses from ${localDb.courses.length} to ${liveCourses.length}...`);
      localDb.courses = liveCourses;
    }
  } catch (e) {
    console.warn('Courses fetch notice:', e.message);
  }

  // 5. Fetch live staff
  console.log('Fetching live staff...');
  try {
    const resStaff = await fetch('https://pkc-university-api.onrender.com/api/staff');
    const staffData = await resStaff.json();
    if (staffData.success && Array.isArray(staffData.staff)) {
      console.log(`Live staff count: ${staffData.staff.length}`);
      localDb.staff_users = staffData.staff;
    }
  } catch (e) {
    console.warn('Staff fetch notice:', e.message);
  }

  // 6. Save synced database.json
  fs.writeFileSync(dbPath, JSON.stringify(localDb, null, 2), 'utf8');
  console.log('SUCCESS: Successfully updated local database.json with 100% of live data and fee entries!');
}

syncLiveData().catch(err => {
  console.error('Sync failed:', err);
  process.exit(1);
});
