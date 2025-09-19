# FixIt Civic Track Frontend

This is the frontend for the FixIt Civic Track application, built with React, Vite, and Tailwind CSS.

## Deployment

To deploy this frontend to Netlify:

1. Build the application:
   ```bash
   npm run build
   ```

2. The built files will be in the `dist` directory

3. Deploy to Netlify either by:
   - Dragging the `dist` folder to Netlify
   - Connecting to GitHub for continuous deployment

## Environment Variables

For production deployment, set the following environment variable in Netlify:

```
VITE_APP_API_URL=https://your-render-backend.onrender.com
```

## Development

To run the development server:

```bash
npm install
npm run dev
```

The development server will start on http://localhost:3001