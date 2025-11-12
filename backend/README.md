# HireMinds Backend API

A comprehensive Node.js + Express + MongoDB backend for the HireMinds job portal application with AI-powered job recommendations.

## ✨ Features

- 🔐 **JWT Authentication** - Secure user registration and login
- 📝 **Job Management** - Full CRUD operations for job postings
- 🧠 **AI Recommendations** - Smart job recommendations based on user behavior
- 🔍 **Search & Filtering** - Advanced search capabilities
- 🔒 **Role-based Access Control** - Different permissions for different user types
- 🛡️ **Security** - Rate limiting, CORS, and security best practices
- 🚀 **Scalable** - Designed for production use

## 🚀 Getting Started

### Prerequisites

- Node.js (v14 or higher)
- MongoDB (local or cloud instance)
- npm or yarn

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/hireminds.git
   cd hireminds/backend
   ```

2. Install dependencies:
   ```bash
   npm install
   # or
   yarn install
   ```

3. Set up environment variables:
   - Copy `.env.example` to `.env`
   - Update the values in `.env` with your configuration

4. Start the development server:
   ```bash
   npm run dev
   # or
   yarn dev
   ```

5. The API will be available at `http://localhost:5000`

## 🔧 Environment Variables

Create a `.env` file in the root directory and add the following:

```env
NODE_ENV=development
PORT=5000
MONGO_URI=mongodb://localhost:27017/hireminds
JWT_SECRET=your_jwt_secret_key_here
JWT_EXPIRE=30d
JWT_COOKIE_EXPIRE=30
FRONTEND_URL=http://localhost:3000
```

## 🛠️ Development

- **Linting**: `npm run lint`
- **Formatting**: `npm run format`
- **Testing**: (Coming soon)

## 📚 API Documentation

### Authentication

| Method | Endpoint          | Description          | Protected |
|--------|-------------------|----------------------|-----------|
| POST   | /api/v1/auth/register | Register a new user  | No        |
| POST   | /api/v1/auth/login    | Login user           | No        |
| GET    | /api/v1/auth/me       | Get current user     | Yes       |
| GET    | /api/v1/auth/logout   | Logout user          | Yes       |

### Jobs

| Method | Endpoint          | Description          | Protected |
|--------|-------------------|----------------------|-----------|
| GET    | /api/v1/jobs     | Get all jobs         | No        |
| GET    | /api/v1/jobs/:id | Get single job       | No        |
| POST   | /api/v1/jobs     | Create new job       | Yes       |
| PUT    | /api/v1/jobs/:id | Update job           | Yes       |
| DELETE | /api/v1/jobs/:id | Delete job           | Yes       |

### Recommendations

| Method | Endpoint                     | Description                  | Protected |
|--------|------------------------------|------------------------------|-----------|
| GET    | /api/v1/recommendations      | Get job recommendations      | Yes       |
| POST   | /api/v1/recommendations/search | Add search to user history | Yes       |

## 🤖 AI-Powered Recommendations

The recommendation system uses:
- TF-IDF for text similarity
- User behavior analysis (searches, applications, saves)
- Content-based filtering

## 🔒 Security

- JWT authentication
- Rate limiting
- CORS protection
- XSS protection
- NoSQL injection prevention
- HTTP Parameter Pollution protection

## 🚀 Deployment

1. Set `NODE_ENV=production` in your environment
2. Configure your production database URL
3. Set a strong `JWT_SECRET`
4. Use a process manager like PM2 or deploy to a platform like Heroku/Railway

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Built with ❤️ by the HireMinds team
- Uses Natural.js for text processing
- Inspired by modern job board platforms

- **GET** `/api/jobs` - Get all jobs
- **GET** `/api/jobs/:id` - Get a single job by ID
- **POST** `/api/jobs` - Create a new job
- **PUT** `/api/jobs/:id` - Update a job
- **DELETE** `/api/jobs/:id` - Delete a job

### Request/Response Examples

#### Create Job (POST /api/jobs)
```json
{
  "title": "Full Stack Developer",
  "company": "TechCorp",
  "location": "Remote",
  "description": "We are looking for a skilled developer...",
  "salary": "$80,000 - $120,000",
  "type": "Full-time"
}
```

#### Response
```json
{
  "success": true,
  "data": {
    "_id": "...",
    "title": "Full Stack Developer",
    "company": "TechCorp",
    "location": "Remote",
    "description": "We are looking for a skilled developer...",
    "salary": "$80,000 - $120,000",
    "type": "Full-time",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

## Database Schema

### Job Model
```javascript
{
  title: String (required),
  company: String (required),
  location: String (required),
  description: String (required),
  salary: String (default: 'Not specified'),
  type: String (enum: ['Full-time', 'Part-time', 'Contract', 'Internship']),
  postedDate: Date (default: Date.now),
  timestamps: true
}
```

## Testing the API

### Using Browser
Navigate to: `http://localhost:5000/api/jobs`

### Using cURL
```bash
# Get all jobs
curl http://localhost:5000/api/jobs

# Create a job
curl -X POST http://localhost:5000/api/jobs \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Backend Developer",
    "company": "StartupXYZ",
    "location": "New York",
    "description": "Join our team...",
    "salary": "$90,000",
    "type": "Full-time"
  }'
```

## Project Structure

```
backend/
├── config/
│   └── db.js              # MongoDB connection
├── controllers/
│   └── jobController.js   # Job CRUD logic
├── models/
│   └── Job.js            # Job schema
├── routes/
│   └── jobRoutes.js      # API routes
├── .env                  # Environment variables
├── server.js             # Express server setup
└── package.json          # Dependencies
```

## Troubleshooting

### MongoDB Connection Issues
- Ensure MongoDB is running locally or update `MONGO_URI` in `.env`
- For local MongoDB: `mongodb://localhost:27017/hiremind`
- For MongoDB Atlas: Use your connection string

### Port Already in Use
- Change the `PORT` in `.env` file
- Default is 5000

### CORS Errors
- Frontend must run on `http://localhost:3000`
- Update CORS origin in `server.js` if needed
