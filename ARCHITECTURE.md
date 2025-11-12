# HireMind Application Architecture

## System Overview

```
┌─────────────────────────────────────────────────────────────┐
│                         CLIENT SIDE                          │
│                    (React Frontend)                          │
│                   http://localhost:3000                      │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │   JobList    │  │   PostJob    │  │  JobDetails  │      │
│  │    Page      │  │     Page     │  │     Page     │      │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘      │
│         │                  │                  │              │
│         └──────────────────┼──────────────────┘              │
│                            │                                 │
│                     ┌──────▼───────┐                         │
│                     │   api.js     │                         │
│                     │  (axios)     │                         │
│                     └──────┬───────┘                         │
└────────────────────────────┼─────────────────────────────────┘
                             │
                             │ HTTP Requests
                             │ (CORS enabled)
                             │
┌────────────────────────────▼─────────────────────────────────┐
│                        SERVER SIDE                            │
│                   (Node.js + Express)                         │
│                   http://localhost:5000                       │
├───────────────────────────────────────────────────────────────┤
│                                                               │
│                     ┌──────────────┐                          │
│                     │  server.js   │                          │
│                     │  (Express)   │                          │
│                     └──────┬───────┘                          │
│                            │                                  │
│                     ┌──────▼───────┐                          │
│                     │  jobRoutes   │                          │
│                     │  /api/jobs   │                          │
│                     └──────┬───────┘                          │
│                            │                                  │
│                     ┌──────▼───────┐                          │
│                     │jobController │                          │
│                     │   (CRUD)     │                          │
│                     └──────┬───────┘                          │
│                            │                                  │
│                     ┌──────▼───────┐                          │
│                     │  Job Model   │                          │
│                     │  (Mongoose)  │                          │
│                     └──────┬───────┘                          │
└────────────────────────────┼─────────────────────────────────┘
                             │
                             │ MongoDB Queries
                             │
┌────────────────────────────▼─────────────────────────────────┐
│                       DATABASE                                │
│                   MongoDB Database                            │
│              mongodb://localhost:27017/hiremind               │
├───────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌─────────────────────────────────────────────────────┐    │
│  │              jobs Collection                         │    │
│  ├─────────────────────────────────────────────────────┤    │
│  │  {                                                   │    │
│  │    _id: ObjectId,                                    │    │
│  │    title: String,                                    │    │
│  │    company: String,                                  │    │
│  │    location: String,                                 │    │
│  │    description: String,                              │    │
│  │    salary: String,                                   │    │
│  │    type: String,                                     │    │
│  │    postedDate: Date,                                 │    │
│  │    createdAt: Date,                                  │    │
│  │    updatedAt: Date                                   │    │
│  │  }                                                   │    │
│  └─────────────────────────────────────────────────────┘    │
└───────────────────────────────────────────────────────────────┘
```

## API Endpoints Flow

### GET /api/jobs (Fetch All Jobs)
```
Frontend (JobList.jsx)
    │
    ├─> useEffect() triggers on mount
    │
    ├─> jobAPI.getAllJobs()
    │
    ├─> axios.get('http://localhost:5000/api/jobs')
    │
    └─> Backend receives request
            │
            ├─> jobRoutes.js routes to controller
            │
            ├─> jobController.getJobs()
            │
            ├─> Job.find() queries MongoDB
            │
            ├─> Returns array of jobs
            │
            └─> Frontend updates state & displays jobs
```

### POST /api/jobs (Create New Job)
```
Frontend (PostJob.jsx)
    │
    ├─> User fills form & submits
    │
    ├─> handleSubmit() called
    │
    ├─> jobAPI.createJob(formData)
    │
    ├─> axios.post('http://localhost:5000/api/jobs', data)
    │
    └─> Backend receives request
            │
            ├─> jobRoutes.js routes to controller
            │
            ├─> jobController.addJob()
            │
            ├─> Validates required fields
            │
            ├─> Job.create() inserts to MongoDB
            │
            ├─> Returns created job with _id
            │
            └─> Frontend shows success toast & redirects
```

## File Structure

### Backend Structure
```
backend/
├── config/
│   └── db.js                 # MongoDB connection logic
├── controllers/
│   └── jobController.js      # Business logic for CRUD operations
├── models/
│   └── Job.js               # Mongoose schema definition
├── routes/
│   └── jobRoutes.js         # Express route definitions
├── .env                     # Environment variables
├── server.js                # Express app setup & middleware
├── package.json             # Dependencies & scripts
└── README.md                # Backend documentation
```

### Frontend Integration
```
hiremind/src/
├── api.js                   # Axios API client & endpoints
├── components/
│   └── JobCard.jsx          # Job display component (updated)
├── pages/
│   ├── JobList.jsx          # Fetches & displays jobs (updated)
│   └── PostJob.jsx          # Creates new jobs (updated)
└── ...
```

## Data Flow

### 1. Application Startup
```
1. User starts MongoDB service
2. User runs: cd backend && npm run dev
   - Express server starts on port 5000
   - Connects to MongoDB
   - Registers API routes
3. User runs: cd hiremind && npm start
   - React app starts on port 3000
   - Opens in browser
```

### 2. Viewing Jobs
```
1. User navigates to /jobs page
2. JobList component mounts
3. useEffect triggers API call
4. GET request to /api/jobs
5. Backend queries MongoDB
6. Returns jobs array
7. Frontend displays in JobCard components
8. If no jobs, shows dummy data as fallback
```

### 3. Creating a Job
```
1. User navigates to /post-job page
2. User fills out form
3. User clicks "Post Job"
4. Form validation runs
5. POST request to /api/jobs with form data
6. Backend validates required fields
7. Backend creates job in MongoDB
8. Returns success response with job data
9. Frontend shows success toast
10. Frontend redirects to /jobs page
11. New job appears in the list
```

## Technology Stack

### Frontend
- **React 19.2.0** - UI framework
- **React Router DOM 7.9.5** - Client-side routing
- **Axios** - HTTP client
- **Framer Motion 12.23.24** - Animations
- **Tailwind CSS 3.4.18** - Styling
- **React Hot Toast 2.6.0** - Notifications
- **Lucide React 0.552.0** - Icons

### Backend
- **Node.js** - Runtime environment
- **Express 5.1.0** - Web framework
- **Mongoose 8.19.3** - MongoDB ODM
- **Dotenv 17.2.3** - Environment variables
- **CORS 2.8.5** - Cross-origin resource sharing
- **Nodemon 3.1.10** - Development auto-restart

### Database
- **MongoDB** - NoSQL database
- **Collections**: jobs
- **Schema**: Defined in Job.js model

## Security Considerations

### Current Implementation
- CORS enabled for localhost:3000
- Environment variables for sensitive data
- Input validation on backend
- Mongoose schema validation

### Recommended Enhancements
- Add authentication (JWT)
- Implement rate limiting
- Add input sanitization
- Use HTTPS in production
- Implement API key authentication
- Add request logging
- Set up error monitoring

## Performance Optimizations

### Current
- Async/await for non-blocking operations
- Mongoose indexing on _id
- React component memoization with motion

### Future Improvements
- Add pagination for job listings
- Implement caching (Redis)
- Database indexing on frequently queried fields
- Image optimization
- Code splitting
- Lazy loading components

## Error Handling

### Backend
- Try-catch blocks in all async functions
- Consistent error response format
- HTTP status codes (200, 201, 400, 404, 500)
- Mongoose validation errors

### Frontend
- API error catching
- Toast notifications for user feedback
- Loading states
- Fallback to dummy data
- Form validation

## Environment Variables

### Backend (.env)
```
MONGO_URI=mongodb://localhost:27017/hiremind
PORT=5000
```

### Frontend
- No environment variables currently
- Can add .env for API URL in production

## Deployment Considerations

### Backend
- Use MongoDB Atlas for cloud database
- Deploy to Heroku, Railway, or DigitalOcean
- Set environment variables in hosting platform
- Use production-ready process manager (PM2)

### Frontend
- Build: `npm run build`
- Deploy to Vercel, Netlify, or AWS S3
- Update API URL to production backend
- Enable HTTPS

### Full Stack
- Use Docker for containerization
- Set up CI/CD pipeline
- Implement monitoring and logging
- Configure auto-scaling
