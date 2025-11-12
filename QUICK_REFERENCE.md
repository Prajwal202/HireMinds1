# HireMind - Quick Reference Card

## 🚀 Quick Start Commands

### Start Backend
```bash
cd backend
npm run dev
```
**URL:** http://localhost:5000

### Start Frontend
```bash
cd hiremind
npm start
```
**URL:** http://localhost:3000

### Start Both (Windows)
Double-click `START.bat` in root directory

---

## 📡 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/jobs` | Get all jobs |
| GET | `/api/jobs/:id` | Get single job |
| POST | `/api/jobs` | Create job |
| PUT | `/api/jobs/:id` | Update job |
| DELETE | `/api/jobs/:id` | Delete job |

---

## 🧪 Quick Test Commands

### Test Backend API
```bash
# Get all jobs
curl http://localhost:5000/api/jobs

# Create a job
curl -X POST http://localhost:5000/api/jobs ^
  -H "Content-Type: application/json" ^
  -d "{\"title\":\"Developer\",\"company\":\"TechCorp\",\"location\":\"Remote\",\"description\":\"Great opportunity\",\"type\":\"Full-time\"}"
```

### Check MongoDB Connection
```bash
# In MongoDB shell
mongosh
use hiremind
db.jobs.find()
```

---

## 📁 Project Structure

```
HireMinds/
├── backend/              # Node.js + Express
│   ├── config/          # DB connection
│   ├── controllers/     # Business logic
│   ├── models/          # Data schemas
│   ├── routes/          # API routes
│   ├── server.js        # Main server
│   └── .env             # Config
│
└── hiremind/            # React frontend
    ├── src/
    │   ├── api.js       # API client
    │   ├── components/  # UI components
    │   └── pages/       # Page components
    └── package.json
```

---

## 🔧 Environment Variables

### backend/.env
```env
MONGO_URI=mongodb://localhost:27017/hiremind
PORT=5000
```

---

## 💾 Database Schema

### Job Model
```javascript
{
  title: String,        // Required
  company: String,      // Required
  location: String,     // Required
  description: String,  // Required
  salary: String,       // Optional
  type: String,         // Full-time, Part-time, Contract, Internship
  postedDate: Date,     // Auto
  createdAt: Date,      // Auto
  updatedAt: Date       // Auto
}
```

---

## 🐛 Common Issues & Fixes

### MongoDB Not Running
```bash
# Windows
net start MongoDB

# Mac
brew services start mongodb-community

# Linux
sudo systemctl start mongod
```

### Port Already in Use
Change `PORT=5001` in `backend/.env`

### CORS Error
- Backend must be on port 5000
- Frontend must be on port 3000
- Check `server.js` CORS config

### Module Not Found
```bash
# Backend
cd backend && npm install

# Frontend
cd hiremind && npm install
```

---

## 📊 Testing Checklist

- [ ] MongoDB is running
- [ ] Backend starts on port 5000
- [ ] Frontend starts on port 3000
- [ ] Can view jobs list
- [ ] Can create new job
- [ ] New job appears in list
- [ ] No console errors
- [ ] Toast notifications work

---

## 🔗 Important URLs

| Service | URL |
|---------|-----|
| Frontend | http://localhost:3000 |
| Backend API | http://localhost:5000 |
| Jobs Endpoint | http://localhost:5000/api/jobs |
| MongoDB | mongodb://localhost:27017/hiremind |

---

## 📝 Useful npm Scripts

### Backend
```bash
npm start      # Production mode
npm run dev    # Development mode (nodemon)
```

### Frontend
```bash
npm start      # Development server
npm run build  # Production build
npm test       # Run tests
```

---

## 🎯 Frontend API Usage

```javascript
import { jobAPI } from './api';

// Get all jobs
const jobs = await jobAPI.getAllJobs();

// Get single job
const job = await jobAPI.getJobById(id);

// Create job
const newJob = await jobAPI.createJob({
  title: "Developer",
  company: "TechCorp",
  location: "Remote",
  description: "Great job",
  type: "Full-time"
});

// Update job
const updated = await jobAPI.updateJob(id, { salary: "$100k" });

// Delete job
await jobAPI.deleteJob(id);
```

---

## 📚 Documentation Files

1. **SETUP_AND_TEST.md** - Complete setup guide
2. **ARCHITECTURE.md** - System architecture
3. **PROJECT_SUMMARY.md** - Project overview
4. **QUICK_REFERENCE.md** - This file
5. **backend/README.md** - Backend docs

---

## 🆘 Need Help?

1. Check console logs (frontend & backend)
2. Verify MongoDB is running
3. Check ports 3000 and 5000 are free
4. Review error messages in browser DevTools
5. Consult documentation files

---

## 🎉 Success Indicators

✅ Backend console shows: "Server is running on port 5000"
✅ Backend console shows: "MongoDB Connected"
✅ Frontend opens at http://localhost:3000
✅ Jobs page displays without errors
✅ Can create and view jobs
✅ No CORS errors in browser console

---

**Last Updated:** 2024
**Version:** 1.0.0
