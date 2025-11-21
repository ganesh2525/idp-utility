# IDP Utilities - Hardware Token Management

A full-stack application for managing Feitian hardware tokens (C100 and C200) with OTP generation capabilities.

## Features

- View all hardware tokens in a card-based interface
- Generate HOTP (C100) and TOTP (C200) codes
- Real-time counter updates
- Copy secret keys to clipboard
- Dark theme UI with responsive design
- Auto-reset OTP after 60 seconds

## Tech Stack

### Backend
- Flask (Python)
- pyotp for OTP generation
- JSON file-based storage

### Frontend
- React
- Tailwind CSS
- Axios for API calls

## Quick Start

### Prerequisites
- Python 3.11+
- Node.js 18+
- npm or yarn

### Backend Setup

1. Navigate to backend folder:
   ```bash
   cd backend
   ```

2. Create virtual environment:
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

4. Create `.env` file:
   ```env
   FLASK_APP=app.py
   FLASK_ENV=development
   FLASK_DEBUG=True
   FLASK_RUN_HOST=0.0.0.0
   FLASK_RUN_PORT=5000
   DB_FILE=db.json
   ```

5. Run the server:
   ```bash
   python app.py
   ```

Backend will run on `http://localhost:5000`

### Frontend Setup

1. Navigate to frontend folder:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create `.env` file:
   ```env
   REACT_APP_API_URL=http://localhost:5000
   REACT_APP_ENV=development
   ```

4. Start the development server:
   ```bash
   npm start
   ```

Frontend will run on `http://localhost:3000`

## API Endpoints

### C100 (HOTP)
- `GET /mfa/hardware-token/feitian-c100/get-details` - Get all C100 tokens
- `POST /mfa/hardware-token/feitian-c100/generate-otp` - Generate OTP (requires `tokenSecretKey` in body)

### C200 (TOTP)
- `GET /mfa/hardware-token/feitian-c200/get-details` - Get all C200 tokens
- `POST /mfa/hardware-token/feitian-c200/generate-otp` - Generate OTP (requires `tokenSecretKey` in body)

## Routes

- `/` - Welcome page
- `/mfa/hardware-tokens` - Hardware tokens management page
- `*` - 404 page

## Deployment

See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed deployment instructions.

### Quick Deploy Options

**Backend:** Railway, Render, or Heroku (supports Bitbucket)  
**Frontend:** Vercel or Netlify (supports Bitbucket)

### Bitbucket Integration

All recommended platforms (Railway, Vercel, Netlify, Render) support Bitbucket repositories. Simply connect your Bitbucket account during the deployment setup.

## Project Structure

```
idp-utility/
├── backend/
│   ├── app.py              # Flask application
│   ├── db.json             # Token database
│   ├── requirements.txt    # Python dependencies
│   └── .env                # Environment variables
├── frontend/
│   ├── src/
│   │   ├── components/     # React components
│   │   └── App.js          # Main app component
│   ├── public/             # Static files
│   ├── package.json        # Node dependencies
│   └── .env                # Environment variables
└── DEPLOYMENT.md           # Deployment guide
```

## Environment Variables

### Backend
- `FLASK_APP` - Flask application file
- `FLASK_ENV` - Environment (development/production)
- `FLASK_DEBUG` - Debug mode (True/False)
- `FLASK_RUN_HOST` - Host to bind to
- `FLASK_RUN_PORT` - Port to run on
- `DB_FILE` - Database file path

### Frontend
- `REACT_APP_API_URL` - Backend API URL
- `REACT_APP_ENV` - Environment (development/production)

## License

MIT

