# PKC University Portal — Client Setup Guide
# PKC University Management System

---

## ⚡ QUICK START (Short Version)

1. **Install Node.js** from https://nodejs.org (LTS version, one time only)
2. Copy the `university-portal` folder to your computer
3. Double-click **`START.bat`**
4. Portal opens automatically at **http://localhost:5000**

---

## 📋 Detailed Setup (Step-by-Step)

### Step 1: Install Node.js (One Time Only)

1. Go to: **https://nodejs.org**
2. Click on **"LTS"** (recommended) version to download
3. Run the downloaded installer
4. Click "Next" → "Next" → "Install" → "Finish"
5. Restart your computer

### Step 2: Copy the Project Folder

- Copy the entire **`university-portal`** folder to your computer
- Suggested location: `C:\university-portal\` or Desktop
- Make sure the folder contains: `START.bat`, `backend/`, `frontend/`

### Step 3: Run the Portal

- Double-click **`START.bat`**
- First time will take 2-3 minutes (installing packages + building)
- After that, it will open **http://localhost:5000** in your browser automatically
- **DO NOT close the black Command window** while using the portal!

### Step 4: Daily Use

- Every day: Double-click `START.bat` → Portal opens
- To stop: Close the black Command window or press `Ctrl+C`

---

## 💾 Database Information

| Feature | Details |
|---------|---------|
| **Database file** | `backend/data/database.json` |
| **All data permanent** | ✅ Yes — stored in this file |
| **Student admissions** | ✅ Saved permanently |
| **Fee payments** | ✅ Saved permanently |
| **Course additions** | ✅ Saved permanently |
| **Cancelled admissions** | ✅ Saved permanently |
| **University changes** | ✅ Saved permanently |
| **Staff/Admin changes** | ✅ Saved permanently |

> ⚠️ **IMPORTANT:** Take a backup of `backend/data/database.json` regularly!
> Copy it to a USB drive or Google Drive weekly.

---

## 🔐 Login Credentials

| Role | Username | Password |
|------|----------|----------|
| Admin | `admin` | `admin123` |
| Accounts | `accounts` | `accounts123` |

---

## ❓ Troubleshooting

### "Node.js not found" error
→ Install Node.js from https://nodejs.org and restart computer

### Portal not opening in browser
→ Manually open browser and go to: **http://localhost:5000**

### "Port already in use" error
→ Some other program is using port 5000. Restart computer and try again.

### Data lost after update
→ Never delete `backend/data/database.json` — this is your database!

---

## 📞 Support

Contact the developer if you need any help.

---
*PKC University Management Portal — All Rights Reserved*
