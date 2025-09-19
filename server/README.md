# FixIt Civic Track Backend

This is the backend for the FixIt Civic Track application, built with Node.js, Express, and MongoDB.

## Deployment

To deploy this backend to Render:

1. Push the code to GitHub
2. Connect Render to your GitHub repository
3. Configure the service with:
   - Build Command: `npm install`
   - Start Command: `npm start`
   - Root Directory: `server`

## Environment Variables

For production deployment, set the following environment variables in Render:

```
NODE_ENV=production
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
EMAIL_HOST=your_email_host
EMAIL_PORT=your_email_port
EMAIL_USER=your_email_user
EMAIL_PASS=your_email_password
FRONTEND_URL=https://your-frontend-domain.com
```

## Development

To run the development server:

```bash
npm install
npm run dev
```

The development server will start on http://localhost:5000

## API Endpoints

- Authentication: `/api/auth`
- Issues: `/api/issues`
- Notifications: `/api/notifications`
- Admin: `/api/admin`
- Health Check: `/api/health`

## Database

The application uses MongoDB for data storage. Make sure MongoDB is running or provide a MongoDB connection string via the `MONGODB_URI` environment variable.

## Features

- **Authentication**: JWT-based authentication with email OTP verification
- **Issue Management**: Full CRUD operations for civic issues
- **User Profiles**: User-specific issue tracking and statistics
- **Location-based Queries**: Find issues within specified radius
- **Real-time Statistics**: User and system-wide issue statistics

## Prerequisites

- Node.js (v14 or higher)
- MongoDB (local or cloud)
- npm or yarn

## Installation

1. **Clone the repository** (if not already done)
2. **Install dependencies**:
   ```bash
   cd server
   npm install
   ```

3. **Set up environment variables**:
   ```bash
   cp env.example .env
   ```
   
   Edit `.env` with your configuration:
   ```env
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/fixit
   JWT_SECRET=your-super-secret-jwt-key
   EMAIL_USER=your-email@gmail.com
   EMAIL_PASS=your-app-password
   NODE_ENV=development
   ```

## Database Setup

1. **Start MongoDB**:
   ```bash
   # Local MongoDB
   mongod
   
   # Or use MongoDB Atlas (cloud)
   # Update MONGODB_URI in .env
   ```

2. **Create a user account** (for testing):
   - Start the server: `npm run dev`
   - Register a user via the API or frontend
   - Or use the existing auth system

3. **Seed sample data** (optional):
   ```bash
   npm run seed
   ```
   This will create sample issues for testing the ProfilePage.

## Running the Server

### Development Mode
```bash
npm run dev
```

### Production Mode
```bash
npm start
```

The server will start on `http://localhost:5000`

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/verify-otp` - Verify email OTP
- `POST /api/auth/forgot-password` - Request password reset
- `POST /api/auth/reset-password` - Reset password

### Issues
- `GET /api/issues` - Get all issues (with filters)
- `GET /api/issues/my-issues` - Get user's issues
- `GET /api/issues/my-stats` - Get user statistics
- `GET /api/issues/:id` - Get single issue
- `POST /api/issues` - Create new issue
- `PUT /api/issues/:id` - Update issue
- `DELETE /api/issues/:id` - Delete issue
- `POST /api/issues/:id/comments` - Add comment
- `POST /api/issues/:id/vote` - Vote on issue
- `GET /api/issues/stats/overview` - Get system statistics

### Health Check
- `GET /api/health` - Server health status

## Database Models

### User Model
- Basic user information
- Email verification status
- Role-based access control

### Issue Model
- Title, description, category
- Location (lat/lng with geospatial indexing)
- Status tracking (reported, in_progress, resolved)
- User relationships (reporter, assignedTo)
- Voting and commenting system
- Image attachments
- Priority and severity levels

## Testing the ProfilePage

1. **Start the server**: `npm run dev`
2. **Seed sample data**: `npm run seed`
3. **Start the frontend**: `cd ../client && npm run dev`
4. **Login** and navigate to the Profile page
5. **View your issues** and statistics

## Development Notes

- The server uses MongoDB with Mongoose ODM
- JWT tokens for authentication
- Express-validator for input validation
- Rate limiting and security headers
- CORS configured for frontend integration
- Error handling middleware

## Troubleshooting

### Common Issues

1. **MongoDB Connection Error**:
   - Ensure MongoDB is running
   - Check MONGODB_URI in .env
   - Verify network connectivity

2. **JWT Token Issues**:
   - Check JWT_SECRET in .env
   - Ensure token is being sent in Authorization header

3. **Email Not Sending**:
   - Verify EMAIL_USER and EMAIL_PASS in .env
   - Check if using app password for Gmail
   - Test with a different email service

4. **CORS Issues**:
   - Update CORS origin in server.js
   - Check frontend URL configuration

### Logs

The server provides detailed logging:
- Database connection status
- API request/response logs
- Error details for debugging

## Contributing

1. Follow the existing code structure
2. Add proper error handling
3. Include input validation
4. Update documentation
5. Test thoroughly

## License

MIT License 