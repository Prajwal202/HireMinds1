# HireMind - Complete Setup and Testing Guide

This guide will help you set up and test both the backend and frontend of the HireMind application.

## Prerequisites

- Node.js (v14 or higher)
- MongoDB (local installation or MongoDB Atlas account)
- npm or yarn package manager

## Project Structure

```
HireMinds/
├── backend/              # Node.js + Express backend
│   ├── config/
│   ├── controllers/
│   ├── models/
│   ├── routes/
│   ├── server.js
│   └── .env
└── hiremind/            # React frontend
    ├── src/
    │   ├── api.js       # API integration
    │   ├── components/
    │   └── pages/
    └── package.json
```

## Step 1: Install MongoDB

### Option A: Local MongoDB
1. Download and install MongoDB from https://www.mongodb.com/try/download/community
2. Start MongoDB service:
   - Windows: MongoDB should start automatically
   - Mac: `brew services start mongodb-community`
   - Linux: `sudo systemctl start mongod`

### Option B: MongoDB Atlas (Cloud)
1. Create a free account at https://www.mongodb.com/cloud/atlas
2. Create a cluster
3. Get your connection string
4. Update `backend/.env` with your connection string

## Step 2: Setup Backend

### 2.1 Navigate to Backend Directory
```bash
cd backend
```

### 2.2 Install Dependencies (Already Done)
Dependencies are already installed. If needed:
```bash
npm install
```

### 2.3 Configure Environment Variables
The `.env` file is already created with default values:
```
MONGO_URI=mongodb://localhost:27017/hiremind
PORT=5000
```

If using MongoDB Atlas, update `MONGO_URI` with your connection string.

### 2.4 Start Backend Server
```bash
npm run dev
```

You should see:
```
Server is running on port 5000
MongoDB Connected: localhost
```

### 2.5 Test Backend API
Open your browser and navigate to:
```
http://localhost:5000
```

You should see:
```json
{"message": "Welcome to HireMind API"}
```

Test the jobs endpoint:
```
http://localhost:5000/api/jobs
```

Expected response (empty array initially):
```json
{
  "success": true,
  "count": 0,
  "data": []
}
```

## Step 3: Setup Frontend

### 3.1 Open New Terminal
Keep the backend running and open a new terminal window.

### 3.2 Navigate to Frontend Directory
```bash
cd hiremind
```

### 3.3 Install Dependencies (If Not Already Installed)
Axios has been added to dependencies. Install if needed:
```bash
npm install
```

### 3.4 Start Frontend Server
```bash
npm start
```

The React app will open automatically at:
```
http://localhost:3000
```

## Step 4: Test the Application

### 4.1 View Jobs Page
1. Navigate to the Jobs page from the navigation menu
2. You should see the loading spinner initially
3. If no jobs in database, you'll see dummy jobs as fallback

### 4.2 Post a New Job
1. Click "Post Job" or navigate to `/post-job`
2. Fill in the form:
   - **Title**: Full Stack Developer
   - **Company**: TechCorp Inc.
   - **Location**: Remote
   - **Description**: Looking for an experienced developer...
   - **Salary**: $80,000 - $120,000
   - **Type**: Full-time
3. Click "Post Job"
4. You should see a success toast notification
5. You'll be redirected to the jobs page

### 4.3 Verify Job Creation
1. The newly created job should appear in the jobs list
2. Check the backend API directly:
   ```
   http://localhost:5000/api/jobs
   ```
3. You should see your job in the response

### 4.4 Test Job Details
1. Click "View Details" on any job card
2. You'll be taken to the job details page
3. The URL will be `/jobs/:id`

## Step 5: Advanced Testing

### 5.1 Test API with Postman or cURL

#### Get All Jobs
```bash
curl http://localhost:5000/api/jobs
```

#### Create a Job
```bash
curl -X POST http://localhost:5000/api/jobs \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Backend Developer",
    "company": "StartupXYZ",
    "location": "New York",
    "description": "Join our team as a backend developer",
    "salary": "$90,000 - $110,000",
    "type": "Full-time"
  }'
```

#### Get Single Job (replace :id with actual job ID)
```bash
curl http://localhost:5000/api/jobs/:id
```

#### Update a Job
```bash
curl -X PUT http://localhost:5000/api/jobs/:id \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Senior Backend Developer",
    "salary": "$100,000 - $130,000"
  }'
```

#### Delete a Job
```bash
curl -X DELETE http://localhost:5000/api/jobs/:id
```

### 5.2 Test Error Handling

#### Missing Required Fields
Try posting a job without required fields:
```bash
curl -X POST http://localhost:5000/api/jobs \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Test Job"
  }'
```

Expected response:
```json
{
  "success": false,
  "message": "Please provide all required fields"
}
```

#### Invalid Job ID
```bash
curl http://localhost:5000/api/jobs/invalid-id
```

Expected response:
```json
{
  "success": false,
  "message": "Server Error"
}
```

## Step 6: Verify Data Flow

### 6.1 Frontend to Backend Flow
1. Open browser DevTools (F12)
2. Go to Network tab
3. Post a new job from the frontend
4. You should see:
   - POST request to `http://localhost:5000/api/jobs`
   - Status: 201 Created
   - Response with job data

### 6.2 Backend to Frontend Flow
1. Keep Network tab open
2. Navigate to Jobs page
3. You should see:
   - GET request to `http://localhost:5000/api/jobs`
   - Status: 200 OK
   - Response with array of jobs

## Troubleshooting

### Backend Issues

#### MongoDB Connection Failed
```
Error: connect ECONNREFUSED 127.0.0.1:27017
```
**Solution**: 
- Ensure MongoDB is running
- Check `MONGO_URI` in `.env` file
- For Windows: Check MongoDB service in Services

#### Port Already in Use
```
Error: listen EADDRINUSE: address already in use :::5000
```
**Solution**:
- Change `PORT` in `.env` to another port (e.g., 5001)
- Or stop the process using port 5000

### Frontend Issues

#### CORS Error
```
Access to XMLHttpRequest blocked by CORS policy
```
**Solution**:
- Ensure backend is running on port 5000
- Check CORS configuration in `backend/server.js`
- Frontend must be on `http://localhost:3000`

#### API Connection Failed
```
Failed to load jobs. Please try again.
```
**Solution**:
- Verify backend is running
- Check browser console for detailed error
- Verify API URL in `hiremind/src/api.js`

#### Module Not Found: axios
```
Module not found: Can't resolve 'axios'
```
**Solution**:
```bash
cd hiremind
npm install axios
```

## Running Both Servers Simultaneously

### Option 1: Two Terminal Windows
- Terminal 1: `cd backend && npm run dev`
- Terminal 2: `cd hiremind && npm start`

### Option 2: Using Concurrently (Optional)
Install concurrently in the root directory:
```bash
npm install concurrently
```

Add script to root `package.json`:
```json
{
  "scripts": {
    "dev": "concurrently \"cd backend && npm run dev\" \"cd hiremind && npm start\""
  }
}
```

Run both:
```bash
npm run dev
```

## Success Checklist

- [ ] MongoDB is running
- [ ] Backend server starts without errors
- [ ] Backend API responds at `http://localhost:5000`
- [ ] Frontend starts at `http://localhost:3000`
- [ ] Can view jobs list (with dummy data if database is empty)
- [ ] Can post a new job
- [ ] New job appears in the jobs list
- [ ] Can view job details
- [ ] Backend API returns jobs at `http://localhost:5000/api/jobs`
- [ ] No CORS errors in browser console
- [ ] Toast notifications appear on success/error

## Next Steps

1. **Add Authentication**: Implement user login/signup
2. **Job Applications**: Add ability to apply for jobs
3. **User Profiles**: Create employer and freelancer profiles
4. **Search & Filters**: Enhance job search functionality
5. **Real-time Chat**: Implement messaging between users
6. **File Uploads**: Add resume upload functionality
7. **Email Notifications**: Send email alerts for new jobs

## Support

If you encounter any issues:
1. Check the console logs (both frontend and backend)
2. Verify all dependencies are installed
3. Ensure MongoDB is running
4. Check that ports 3000 and 5000 are available
5. Review the error messages in browser DevTools

Happy coding! 🚀
