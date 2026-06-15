# NayePankh Foundation — Backend API
### Volunteer Information Management System & AI Proxy Server

---

## Setup & Run

```bash
npm install

# (Optional) Set your Gemini API key in your environment:
# On Windows (cmd): set GEMINI_API_KEY=your_key_here
# On Windows (PowerShell): $env:GEMINI_API_KEY="your_key_here"
# On Linux/macOS: export GEMINI_API_KEY="your_key_here"

npm run dev       # development (nodemon)
npm start         # production
```

Server starts at **http://localhost:3001**
API docs at **http://localhost:3001/api**

---

## Default Admin Credentials
```
Email:    admin@nayepankh.com
Password: admin@123
```

---

## Authentication

All protected routes require a Bearer token in the Authorization header.

```bash
# 1. Login to get token
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@nayepankh.com","password":"admin@123"}'

# 2. Use token in protected requests
curl http://localhost:3001/api/volunteers \
  -H "Authorization: Bearer <your_token>"
```

---

## API Endpoints

### Auth
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| POST | `/api/auth/login` | Public | Get JWT token |
| GET | `/api/auth/me` | Protected | Current admin info |

### Volunteers
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| POST | `/api/volunteers/register` | Public | Register new volunteer |
| GET | `/api/volunteers` | Protected | List with filters & pagination |
| GET | `/api/volunteers/:id` | Protected | Get volunteer by ID |
| PUT | `/api/volunteers/:id` | Protected | Update volunteer details |
| PATCH | `/api/volunteers/:id/status` | Protected | Update status |
| DELETE | `/api/volunteers/:id` | Protected | Delete volunteer |
| GET | `/api/volunteers/export/csv` | Protected | Export CSV report |

### Programs
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| GET | `/api/programs` | Public | List active programs |
| POST | `/api/programs` | Protected | Create program |
| DELETE | `/api/programs/:id` | Protected | Deactivate program |

### Stats
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| GET | `/api/stats` | Protected | Dashboard statistics |

### AI Integration (Secure Proxy)
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| POST | `/api/ai/generate` | Public | Securely routes Gemini AI requests using the server's `GEMINI_API_KEY` environment variable. |

---

## AI Features & Key Management
To prevent exposing your private API keys in client-side HTML/JS code (which is insecure and allows anyone to steal your key):
1. **Server-Side Key**: Set the `GEMINI_API_KEY` environment variable on your deployment host (e.g. Render, Railway, Koyeb, etc.).
2. **Client-Side Key (Optional)**: Users/evaluators can still enter their own keys in the frontend input fields if desired.
3. **Graceful Fallbacks**: If no key is configured on either the server or client, the pages will automatically fallback to realistic interactive mock responses (Demo Mode) so the website remains fully functional.

---

## Tech Stack
- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: SQLite (via better-sqlite3) — zero config, file-based
- **Auth**: JWT (jsonwebtoken) + bcryptjs for password hashing
- **Export**: CSV generation
- **AI Integration**: Google Gemini 2.0 Flash

## Project Structure
```
nayepankh-backend/
├── src/
│   ├── server.js           # Express app entry point
│   ├── db/
│   │   └── database.js     # SQLite setup, schema, seeding
│   ├── middleware/
│   │   └── auth.js         # JWT auth middleware
│   └── routes/
│       ├── auth.js         # Login, /me
│       ├── volunteers.js   # Full CRUD + CSV export
│       ├── programs.js     # Programs CRUD
│       ├── stats.js        # Dashboard stats
│       └── ai.js           # Secure Gemini AI proxy
├── public/
│   └── logo.png
├── package.json
├── README.md
└── mnt/                    # Sub-pages and domain prototypes
```
