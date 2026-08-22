# انتخابات سسٹم (Candidate Registration System) - MERN

## Fixed Issues
1. **Landing Page Request Error** – `/api/candidate/request-otp` route was missing from `candidateRoutes.js`. Now fixed.
2. **Admin routes** – were not mounted in `server.js`. Now mounted at `/api/admin`.
3. OTP flow now works as follows:

### Correct Flow
1. User opens `/landingpage` → enters email → clicks **درخواست بھیجیں**
2. Backend creates candidate with status `pending_approval`
3. Frontend switches to **OTP entry screen**
4. Admin logs in (`admin@system.gov.pk` / `admin123`) → goes to **درخواستیں**
5. Admin clicks **OTP بھیجیں** → status becomes `approved`, 6-digit OTP generated & emailed
6. User enters OTP → verified → redirected to registration form

## How to Run

### Requirements
- Node.js 18+
- MongoDB running locally (`mongodb://127.0.0.1:27017`)

### Backend
```bash
cd backend
npm install
# Edit .env if needed (EMAIL_USER / EMAIL_PASS for Gmail App Password)
npm run dev
# Server on http://localhost:5000
```

### Frontend
```bash
cd frontend/Local-Elections
npm install
npm run dev
# Vite usually on http://localhost:5173 or 5174
```

Open: `http://localhost:5173/landingpage` (or your Vite port)

### Admin Login
- Email: `admin@system.gov.pk`
- Password: `admin123`
- Then go to `/admin/requests`

### Email (OTP)
`.env` already has:
```
EMAIL_USER=okayayan072@gmail.com
EMAIL_PASS=uhldwoqjrccsphdy
```
This must be a Gmail **App Password** (not regular password). If email fails, admin response still shows the generated OTP so you can share it manually.

## Project Structure
```
Candidate System/
├── backend/
│   ├── controllers/
│   ├── models/
│   ├── routes/
│   ├── utils/sendEmail.js
│   ├── server.js
│   └── .env
└── frontend/Local-Elections/
    └── src/pages/LandingPage.jsx  (OTP step UI)
```
