# Shrigovinda Portfolio — Microservices Architecture

> A production-quality microservices backend for the Shrigovinda T Kulkarni portfolio.  
> Frontend (Netlify) → API Gateway → 5 Independent Microservices → Firebase

---

## Architecture Overview

```
Frontend (Netlify)
    │
    └──/api/*──► API Gateway :8080
                      │
                      ├──/api/auth/*──────► Auth Service      :3001
                      ├──/api/contact/*───► Contact Service   :3002
                      ├──/api/portfolio/*─► Portfolio Service :3003
                      ├──/api/upload/*────► Upload Service    :3004
                      └──/api/ai/*────────► AI Service        :3005
```

---

## Project Structure

```
My Portfolio/
├── public/                    ← Frontend (unchanged UI)
│   ├── index.html, about.html, skills.html, projects.html, certifications.html, contact.html
│   ├── css/style.css
│   ├── assets/                ← Images, PDFs, Resume
│   └── js/
│       ├── firebase-config.js ← Firebase Analytics (client-side)
│       └── main.js            ← UI logic (contact form → POST /api/contact/submit)
│
├── gateway/                   ← API Gateway
│   ├── src/index.js           ← Express proxy server
│   ├── src/routes/proxy.js    ← Route definitions
│   ├── package.json
│   ├── .env.example
│   └── vercel.json
│
├── services/
│   ├── auth-service/          ← Firebase Auth (login, signup, verify)
│   ├── contact-service/       ← Form storage (Firestore) + Email (Nodemailer)
│   ├── portfolio-service/     ← Projects, Skills, Education REST API
│   ├── upload-service/        ← Resume/Image uploads to Firebase Storage
│   └── ai-service/            ← AI placeholder (future OpenAI/Gemini)
│
├── shared/
│   ├── firebase/admin.js      ← Singleton Firebase Admin SDK
│   ├── middleware/
│   │   ├── errorHandler.js    ← Centralized error handler
│   │   └── authGuard.js       ← JWT/Firebase token verifier
│   ├── utils/
│   │   ├── logger.js          ← Structured logger
│   │   ├── sanitize.js        ← HTML sanitization
│   │   └── validate.js        ← Shared validators
│   └── config/constants.js    ← Service ports, rate limits, Firestore collection names
│
├── server.js                  ← Static file server (serves public/)
├── package.json               ← Root (frontend server)
├── netlify.toml               ← Netlify hosting + /api/* proxy
└── firestore.rules            ← Firestore security rules
```

---

## Quick Start — Local Development

### Prerequisites

- Node.js ≥ 18
- Firebase project (shrigovinda-portfolio)
- Firebase Service Account Key (download from Firebase Console)

### Step 1: Get Your Firebase Service Account Key

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Open your project → **Project Settings** → **Service Accounts**
3. Click **Generate new private key** → Download `serviceAccountKey.json`
4. **Keep this file secret — NEVER commit it.**

### Step 2: Set Up Environment Files

Copy `.env.example` to `.env` in each service directory and fill in your values:

```bash
# Gateway
copy gateway\.env.example gateway\.env

# Contact Service (the most important one — does the actual work)
copy services\contact-service\.env.example services\contact-service\.env

# Auth Service
copy services\auth-service\.env.example services\auth-service\.env

# Portfolio Service
copy services\portfolio-service\.env.example services\portfolio-service\.env

# Upload Service
copy services\upload-service\.env.example services\upload-service\.env

# AI Service
copy services\ai-service\.env.example services\ai-service\.env
```

For `FIREBASE_SERVICE_ACCOUNT`, paste the entire `serviceAccountKey.json` content as a single-line JSON string.

### Step 3: Install Dependencies

```bash
# Root (frontend static server)
npm install

# API Gateway
cd gateway && npm install && cd ..

# All services
cd services\contact-service && npm install && cd ..\..
cd services\portfolio-service && npm install && cd ..\..
cd services\auth-service && npm install && cd ..\..
cd services\upload-service && npm install && cd ..\..
cd services\ai-service && npm install && cd ..\..
```

### Step 4: Run Everything

Open **6 separate terminals**:

```bash
# Terminal 1 — Frontend (serves public/)
npm start
# → http://localhost:3000

# Terminal 2 — API Gateway
cd gateway && npm start
# → http://localhost:8080

# Terminal 3 — Contact Service (REQUIRED for contact form)
cd services\contact-service && npm start
# → http://localhost:3002

# Terminal 4 — Portfolio Service
cd services\portfolio-service && npm start
# → http://localhost:3003

# Terminal 5 — Auth Service
cd services\auth-service && npm start
# → http://localhost:3001

# Terminal 6 — AI Service
cd services\ai-service && npm start
# → http://localhost:3005
```

---

## API Endpoints

### Health Checks
```
GET /health                         → Gateway health
GET http://localhost:3001/health    → Auth Service
GET http://localhost:3002/health    → Contact Service
GET http://localhost:3003/health    → Portfolio Service
GET http://localhost:3004/health    → Upload Service
GET http://localhost:3005/health    → AI Service
```

### Contact Service
```
POST /api/contact/submit
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "message": "Hello, I'd like to connect!"
}
```

### Portfolio Service
```
GET /api/portfolio/projects           → All projects
GET /api/portfolio/projects?featured=true → Featured only
GET /api/portfolio/projects/:id       → Single project
GET /api/portfolio/skills             → All skills
GET /api/portfolio/education          → Education history
GET /api/portfolio/experience         → Work experience
GET /api/portfolio/achievements       → Achievements
GET /api/portfolio/owner              → Owner info
GET /api/portfolio/resume             → Resume file info
```

### Auth Service
```
POST /api/auth/signup                 → Create Firebase user
POST /api/auth/login                  → Login (returns ID token)
POST /api/auth/logout                 → Revoke tokens
GET  /api/auth/verify                 → Verify ID token
GET  /api/auth/me                     → Get current user
```

### AI Service (Placeholder)
```
GET  /api/ai/status                   → AI service status
POST /api/ai/chat     {"message":""}  → Chat (placeholder)
POST /api/ai/summarize {"text":""}    → Summarize (placeholder)
```

---

## Deployment

### Deploy to Vercel (Recommended per service)

Each service has its own `vercel.json`. Deploy independently:

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy Contact Service
cd services\contact-service
vercel --prod

# Deploy Portfolio Service
cd services\portfolio-service
vercel --prod

# Deploy Auth Service
cd services\auth-service
vercel --prod

# Deploy API Gateway (deploy LAST after other services have URLs)
cd gateway
vercel --prod
```

**After deploying all services:**
1. Note each service's Vercel URL
2. Update `gateway/.env` with the production URLs
3. Redeploy the gateway
4. Update `netlify.toml` — change the `/api/*` proxy URL to your gateway's Vercel URL

### Deploy to Render

1. Create a new **Web Service** on Render for each service
2. Set **Build Command**: `npm install`
3. Set **Start Command**: `npm start`
4. Add all environment variables from `.env.example`

### Deploy to Railway

```bash
npm install -g @railway/cli
railway login
cd services\contact-service && railway up
```

---

## Environment Variables Reference

### All Services Share
| Variable | Description |
|---|---|
| `NODE_ENV` | `development` or `production` |
| `PORT` | Service port |
| `ALLOWED_ORIGINS` | Comma-separated allowed CORS origins |

### Firebase Services (contact, auth, upload)
| Variable | Description |
|---|---|
| `FIREBASE_SERVICE_ACCOUNT` | JSON string of serviceAccountKey.json |
| `FIREBASE_PROJECT_ID` | Firebase project ID |
| `FIREBASE_STORAGE_BUCKET` | Storage bucket URL |

### Contact Service Only
| Variable | Description |
|---|---|
| `ENABLE_EMAIL_NOTIFICATIONS` | `true` to send emails |
| `SMTP_HOST` | SMTP host (smtp.gmail.com) |
| `SMTP_PORT` | SMTP port (587) |
| `SMTP_USER` | Gmail address |
| `SMTP_PASS` | Gmail App Password (16 chars) |
| `CONTACT_RECIPIENT_EMAIL` | Where to send notifications |

### Gateway Only
| Variable | Description |
|---|---|
| `AUTH_SERVICE_URL` | Auth Service URL |
| `CONTACT_SERVICE_URL` | Contact Service URL |
| `PORTFOLIO_SERVICE_URL` | Portfolio Service URL |
| `UPLOAD_SERVICE_URL` | Upload Service URL |
| `AI_SERVICE_URL` | AI Service URL |

---

## Security

- **Helmet** — Security headers on every service
- **CORS** — Strict origin allowlist
- **Rate Limiting** — Per-service limits (strictest on Auth: 10 req/15min)
- **express-validator** — Input validation on all write endpoints
- **Sanitization** — HTML escaping before Firestore storage
- **Firebase Admin SDK** — Server-side Auth verification (never client tokens trusted)
- **authGuard middleware** — Protects upload endpoints with Firebase ID token verification
- **Error Handler** — Never exposes stack traces to clients

---

## Testing the Contact Form

1. Run frontend server (`npm start` from root) + Contact Service + Gateway
2. Open `http://localhost:3000/contact.html`
3. Fill and submit the form
4. Check Firebase Console → Firestore → `messages` collection for the new document
5. (If email enabled) Check your Gmail inbox for the notification email

---

## Adding Real AI (Future)

1. Install OpenAI or Gemini SDK in `ai-service`:
   ```bash
   cd services\ai-service && npm install openai
   ```
2. Add `OPENAI_API_KEY` to `ai-service/.env`
3. Replace the placeholder responses in `src/controllers/ai.controller.js` with real API calls

---

Built with ❤️ by Shrigovinda T Kulkarni
