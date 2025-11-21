# Deployment Guide

This guide covers steps to deploy both the Flask backend and React frontend.

## Table of Contents
1. [Backend Deployment](#backend-deployment)
2. [Frontend Deployment](#frontend-deployment)
3. [Environment Variables](#environment-variables)
4. [Post-Deployment](#post-deployment)

---

## Backend Deployment

### Option 1: Railway (Recommended - Easy)

1. **Sign up** at [railway.app](https://railway.app)
2. **Create a new project** and select "Deploy from GitHub repo" or "Deploy from Git repo"
3. **Connect Bitbucket:**
   - Click "New Project"
   - Select "Deploy from Git repo"
   - Choose Bitbucket and authorize
   - Select your repository
4. **Configure the service:**
   - Root Directory: `backend`
   - Start Command: `python app.py`
5. **Add environment variables** in Railway dashboard:
   ```
   FLASK_APP=app.py
   FLASK_ENV=production
   FLASK_DEBUG=False
   FLASK_RUN_HOST=0.0.0.0
   FLASK_RUN_PORT=$PORT
   DB_FILE=db.json
   ```
6. **Deploy** - Railway will automatically deploy

### Option 2: Render

1. **Sign up** at [render.com](https://render.com)
2. **Create a new Web Service**
3. **Connect Bitbucket repository:**
   - Click "New" → "Web Service"
   - Select "Connect account" → Choose Bitbucket
   - Authorize and select your repository
4. **Configure:**
   - Build Command: `cd backend && pip install -r requirements.txt`
   - Start Command: `cd backend && python app.py`
   - Environment: Python 3
5. **Add environment variables** (same as Railway)
6. **Deploy**

### Option 3: Heroku

1. **Install Heroku CLI** and login
2. **Create Procfile** in `backend/`:
   ```
   web: python app.py
   ```
3. **Create runtime.txt** in `backend/`:
   ```
   python-3.11.0
   ```
4. **Deploy:**
   ```bash
   cd backend
   heroku create your-app-name
   heroku config:set FLASK_ENV=production
   heroku config:set FLASK_DEBUG=False
   git push heroku main
   ```

### Option 4: AWS EC2 / DigitalOcean

1. **Create a server** (Ubuntu recommended)
2. **SSH into the server**
3. **Install dependencies:**
   ```bash
   sudo apt update
   sudo apt install python3-pip python3-venv nginx
   ```
4. **Clone your repository**
5. **Set up virtual environment:**
   ```bash
   cd backend
   python3 -m venv venv
   source venv/bin/activate
   pip install -r requirements.txt
   ```
6. **Create systemd service** (`/etc/systemd/system/flask-app.service`):
   ```ini
   [Unit]
   Description=Flask App
   After=network.target

   [Service]
   User=ubuntu
   WorkingDirectory=/path/to/backend
   Environment="PATH=/path/to/backend/venv/bin"
   ExecStart=/path/to/backend/venv/bin/python app.py

   [Install]
   WantedBy=multi-user.target
   ```
7. **Start service:**
   ```bash
   sudo systemctl start flask-app
   sudo systemctl enable flask-app
   ```
8. **Configure Nginx** as reverse proxy

---

## Frontend Deployment

### Option 1: Vercel (Recommended - Easy)

1. **Sign up** at [vercel.com](https://vercel.com)
2. **Import your Bitbucket repository:**
   - Click "Add New" → "Project"
   - Select "Import Git Repository"
   - Choose Bitbucket and authorize
   - Select your repository
3. **Configure:**
   - Framework Preset: Create React App
   - Root Directory: `frontend`
   - Build Command: `npm run build`
   - Output Directory: `build`
4. **Add environment variables:**
   ```
   REACT_APP_API_URL=https://your-backend-url.com
   REACT_APP_ENV=production
   ```
5. **Deploy**

### Option 2: Netlify

1. **Sign up** at [netlify.com](https://netlify.com)
2. **Import your Bitbucket repository:**
   - Click "Add new site" → "Import an existing project"
   - Choose "Bitbucket" and authorize
   - Select your repository
3. **Configure:**
   - Base directory: `frontend`
   - Build command: `npm run build`
   - Publish directory: `frontend/build`
4. **Add environment variables** (same as Vercel)
5. **Deploy**

### Option 3: AWS S3 + CloudFront

1. **Build the React app:**
   ```bash
   cd frontend
   npm run build
   ```
2. **Create S3 bucket** and enable static website hosting
3. **Upload build folder** contents to S3
4. **Set up CloudFront** distribution
5. **Configure environment variables** in build process

---

## Environment Variables

### Backend Production `.env`
```env
FLASK_APP=app.py
FLASK_ENV=production
FLASK_DEBUG=False
FLASK_RUN_HOST=0.0.0.0
FLASK_RUN_PORT=5000
DB_FILE=db.json
```

### Frontend Production `.env`
```env
REACT_APP_API_URL=https://your-backend-url.railway.app
REACT_APP_ENV=production
```

**Important:** Update `REACT_APP_API_URL` with your actual backend URL after deployment.

---

## Post-Deployment

### 1. Update CORS Settings (if needed)

If your frontend and backend are on different domains, update CORS in `backend/app.py`:

```python
CORS(app, origins=["https://your-frontend-domain.com"])
```

### 2. Test the APIs

Test your backend endpoints:
- `GET https://your-backend-url.com/mfa/hardware-token/feitian-c100/get-details`
- `GET https://your-backend-url.com/mfa/hardware-token/feitian-c200/get-details`

### 3. Update Frontend API URL

Make sure `REACT_APP_API_URL` in frontend points to your deployed backend.

### 4. Database Persistence

For production, consider:
- Using a proper database (PostgreSQL, MongoDB) instead of JSON file
- Setting up database backups
- Using environment-specific database files

---

## Quick Start (Railway + Vercel) - Bitbucket

### Backend (Railway)
1. Go to railway.app
2. New Project → Deploy from Git repo
3. Connect Bitbucket → Select repo → Add Service → Select backend folder
4. Add environment variables
5. Deploy

### Frontend (Vercel)
1. Go to vercel.com
2. Add New → Project → Import Git Repository
3. Connect Bitbucket → Select repo
4. Root Directory: `frontend`
5. Add `REACT_APP_API_URL` = your Railway backend URL
6. Deploy

## Bitbucket Setup

### Initializing Git Repository (if not already done)

1. **Initialize Git:**
   ```bash
   git init
   ```

2. **Add files:**
   ```bash
   git add .
   git commit -m "Initial commit"
   ```

3. **Connect to Bitbucket:**
   ```bash
   git remote add origin https://bitbucket.org/your-username/idp-utility.git
   git push -u origin main
   ```

4. **Create `.gitignore`** (already created) to exclude:
   - `node_modules/`
   - `.env` files
   - `__pycache__/`
   - etc.

---

## Troubleshooting

### Backend Issues
- **Port binding:** Use `$PORT` environment variable on platforms like Railway/Heroku
- **CORS errors:** Update CORS origins in `app.py`
- **Database not found:** Ensure `db.json` is in the correct path

### Frontend Issues
- **API calls failing:** Check `REACT_APP_API_URL` is correct
- **Build errors:** Ensure all dependencies are in `package.json`
- **404 on refresh:** Configure redirect rules (Vercel/Netlify handle this automatically)

---

## Security Considerations

1. **Never commit `.env` files** (already in `.gitignore`)
2. **Use HTTPS** for production
3. **Set `FLASK_DEBUG=False`** in production
4. **Consider adding authentication** for API endpoints
5. **Use environment variables** for all sensitive data

