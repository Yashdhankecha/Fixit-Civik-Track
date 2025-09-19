# FixIt Civic Track - Deployment Guide

This guide provides step-by-step instructions for deploying the FixIt Civic Track application with the frontend on Netlify and the backend on Render.

## Prerequisites

Before starting the deployment process, ensure you have:

1. **GitHub Account** - To host your code repository
2. **Netlify Account** - For frontend hosting
3. **Render Account** - For backend hosting
4. **MongoDB Atlas Account** - For database hosting (or use Render's MongoDB addon)
5. **Domain Name** (optional) - For custom domains

## Project Structure

```
Fixit-Civik-Track/
├── client/              # React frontend
├── server/              # Node.js/Express backend
├── README.md
└── DEPLOYMENT.md        # This file
```

## Backend Deployment (Render)

### 1. Prepare the Server for Deployment

First, we need to make some modifications to the server to work with Render's environment.

#### Update server.js

Modify the server configuration to work with Render's environment variables:

```javascript
// In server.js, update the PORT and MongoDB configuration
const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/fixit';
```

#### Update CORS Configuration

Update the CORS configuration in server.js to allow your Netlify domain:

```javascript
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? [
        'https://your-fixit-app.netlify.app',  // Replace with your Netlify URL
        'https://your-custom-domain.com'       // If you have a custom domain
      ] 
    : ['http://localhost:3000', 'http://localhost:3001', 'http://127.0.0.1:3000'],
  credentials: true
}));
```

#### Update API Base URL

In server.js, update the health check or any references to use the Render URL:

```javascript
// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'FixIt Server is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    mongodb: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
    renderUrl: process.env.RENDER_EXTERNAL_URL || 'Not set'
  })
})
```

### 2. Create Render Configuration

Create a `render.yaml` file in the root directory:

```yaml
services:
  - type: web
    name: fixit-backend
    env: node
    plan: free
    buildCommand: npm install
    startCommand: npm start
    envVars:
      - key: NODE_ENV
        value: production
      - key: MONGODB_URI
        sync: false
      - key: JWT_SECRET
        sync: false
      - key: EMAIL_HOST
        sync: false
      - key: EMAIL_PORT
        sync: false
      - key: EMAIL_USER
        sync: false
      - key: EMAIL_PASS
        sync: false
    domains:
      - your-custom-domain.com  # Optional
```

### 3. Set Up MongoDB

You have two options:

#### Option A: MongoDB Atlas (Recommended)
1. Create a MongoDB Atlas account
2. Create a new cluster
3. Add a database user
4. Add your Render service IP to the whitelist (or allow access from anywhere for development)
5. Get the connection string

#### Option B: Render MongoDB Addon
1. In Render dashboard, when creating the service, you can add a MongoDB addon

### 4. Deploy to Render

1. Push your code to GitHub:
   ```bash
   git add .
   git commit -m "Prepare for Render deployment"
   git push origin main
   ```

2. Go to [Render Dashboard](https://dashboard.render.com/)
3. Click "New+" and select "Web Service"
4. Connect your GitHub repository
5. Configure the service:
   - Name: `fixit-backend`
   - Region: Choose your preferred region
   - Branch: `main`
   - Root Directory: `server`
   - Build Command: `npm install`
   - Start Command: `npm start`
   - Plan: Choose Free or paid plan

6. Add Environment Variables:
   - `NODE_ENV`: `production`
   - `MONGODB_URI`: Your MongoDB connection string
   - `JWT_SECRET`: A strong secret key for JWT tokens
   - `EMAIL_HOST`: Your email provider's SMTP host
   - `EMAIL_PORT`: Your email provider's SMTP port
   - `EMAIL_USER`: Your email address
   - `EMAIL_PASS`: Your email password or app-specific password

7. Click "Create Web Service"

8. Wait for deployment to complete (this may take a few minutes)

### 5. Test Backend Deployment

Once deployed, test your backend:
- API URL: `https://your-render-service.onrender.com/api/health`
- Replace `your-render-service` with your actual Render service name

## Frontend Deployment (Netlify)

### 1. Update API Configuration

Update the client's API configuration to point to your Render backend.

In `client/src/utils/api.js`, modify the baseURL:

```javascript
const api = axios.create({
  baseURL: process.env.NODE_ENV === 'production' 
    ? process.env.REACT_APP_API_URL || 'https://your-render-service.onrender.com'
    : 'http://localhost:5000',
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});
```

### 2. Create Environment Variables

Create a `.env.production` file in the `client` directory:

```
VITE_APP_API_URL=https://your-render-service.onrender.com
```

### 3. Update package.json Build Script

In `client/package.json`, ensure the build script is correct:

```json
{
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "lint": "eslint . --ext js,jsx --report-unused-disable-directives --max-warnings 0",
    "preview": "vite preview"
  }
}
```

### 4. Deploy to Netlify

#### Option A: Manual Deployment

1. Build the frontend:
   ```bash
   cd client
   npm run build
   ```

2. This creates a `dist` folder with the production build

3. Go to [Netlify Dashboard](https://app.netlify.com/)
4. Click "New site from Git" or drag and drop the `dist` folder

#### Option B: Continuous Deployment with GitHub

1. Push your code to GitHub:
   ```bash
   git add .
   git commit -m "Prepare for Netlify deployment"
   git push origin main
   ```

2. Go to [Netlify Dashboard](https://app.netlify.com/)
3. Click "New site from Git"
4. Connect to GitHub and select your repository
5. Configure the deployment:
   - Branch to deploy: `main`
   - Build command: `npm run build`
   - Publish directory: `dist`
   - Base directory: `client`

6. Add Environment Variables in Netlify:
   - `VITE_APP_API_URL`: `https://your-render-service.onrender.com`

7. Click "Deploy site"

### 5. Test Frontend Deployment

Once deployed, visit your Netlify URL to test the application.

## Post-Deployment Configuration

### 1. Set Up Custom Domains (Optional)

#### For Render (Backend):
1. In Render dashboard, go to your service
2. Click "Settings"
3. Scroll to "Custom Domains"
4. Add your custom domain
5. Follow DNS configuration instructions

#### For Netlify (Frontend):
1. In Netlify dashboard, go to your site
2. Click "Domain settings"
3. Add your custom domain
4. Follow DNS configuration instructions

### 2. Environment Variables Summary

Make sure all required environment variables are set:

**Render (Backend):**
- `NODE_ENV`: `production`
- `MONGODB_URI`: Your MongoDB connection string
- `JWT_SECRET`: Strong secret key
- `EMAIL_HOST`: SMTP host
- `EMAIL_PORT`: SMTP port
- `EMAIL_USER`: Email address
- `EMAIL_PASS`: Email password

**Netlify (Frontend):**
- `VITE_APP_API_URL`: `https://your-render-service.onrender.com`

### 3. Enable Auto-Deployment

Both Netlify and Render support auto-deployment from GitHub:
- Push to your main branch to automatically deploy updates
- Create separate branches for development and testing

## Troubleshooting

### Common Issues

1. **CORS Errors**:
   - Ensure CORS configuration in server.js includes your Netlify domain
   - Check that the frontend is making requests to the correct backend URL

2. **Environment Variables Not Set**:
   - Verify all required environment variables are configured in both platforms
   - Check for typos in variable names

3. **Database Connection Issues**:
   - Ensure MongoDB URI is correct
   - Check that IP whitelisting is configured properly in MongoDB Atlas
   - Verify database credentials

4. **Build Failures**:
   - Check build logs in both platforms
   - Ensure all dependencies are correctly specified in package.json
   - Verify Node.js versions are compatible

### Checking Logs

- **Render**: Go to your service dashboard and click "Logs"
- **Netlify**: Go to your site dashboard and click "Deploys" then view deploy logs

## Maintenance

### Monitoring

1. Set up uptime monitoring for both frontend and backend
2. Monitor database usage and performance
3. Set up error tracking (e.g., Sentry)

### Updates

1. Make changes in your local development environment
2. Test thoroughly
3. Commit and push to GitHub
4. Both platforms will automatically deploy the updates

### Scaling

- **Netlify**: Automatically scales with traffic
- **Render**: Upgrade from free plan to paid plans for more resources
- **MongoDB**: Upgrade Atlas tier as needed

## Security Considerations

1. Use strong, unique passwords for all services
2. Rotate secrets and API keys regularly
3. Enable two-factor authentication on all accounts
4. Use HTTPS for all communications
5. Implement proper rate limiting
6. Regularly update dependencies

## Backup and Recovery

1. Regularly backup your MongoDB database
2. Keep copies of environment variables in a secure location
3. Maintain version control with Git
4. Test recovery procedures periodically

## Support

For issues with deployment:
1. Check the official documentation for [Netlify](https://docs.netlify.com/) and [Render](https://render.com/docs)
2. Review application logs
3. Verify all configuration steps were completed
4. Reach out to platform support if needed