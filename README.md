# LexVerify • AI-Powered Vendor Verification Workspace

> Next-generation enterprise web application for automated vendor onboarding, document AI extraction, mismatch detection, OpenCorporates verification, and compliance workflow orchestration.

---

### 🌐 Live Production Deployment
- **Live URL**: [http://assessment.creativeinfozone.com](http://assessment.creativeinfozone.com)
- **API Base URL**: `http://assessment.creativeinfozone.com/api/v1`
- **Swagger Docs**: `http://assessment.creativeinfozone.com/api/docs`

---

## Table of Contents

- [Project Overview](#project-overview)
- [Live Deployment](#-live-production-deployment)
- [Technologies Used](#technologies-used)
- [Features](#features)
- [Project Structure](#project-structure)
- [Prerequisites](#prerequisites)
- [Setup & Installation](#setup--installation)
- [Environment Variables](#environment-variables)
- [Running with Docker](#running-the-application)
- [API Documentation](#api-documentation)
- [Testing](#testing)

---

## Project Overview

This application streamlines the **vendor onboarding and verification process** for organizations. It provides:

1. A structured vendor detail form with version history
2. AI-powered document extraction from uploaded PDFs and images
3. Cross-document data comparison to detect mismatches
4. External company verification via the OpenCorporates API
5. Automated email notifications for missing documents
6. A multi-stage verification workflow (Draft → Approved/Rejected)
7. Task management for action items

**Expected Workflow:**
```
Vendor Details → Upload Documents → AI Extraction → AI Comparison
→ Company API Verification → Missing Document Check + Email
→ Review → Approve / Reject
```

---

## Technologies Used

| Layer | Technology |
|---|---|
| **Frontend** | React 18, TypeScript, Vite, React Router v6 |
| **State Management** | TanStack React Query, Zustand |
| **Forms** | React Hook Form + Zod |
| **Backend** | NestJS 10, TypeScript |
| **Database** | PostgreSQL 15 |
| **ORM** | TypeORM |
| **AI API** | OpenAI GPT-4 Vision (or Google Gemini Vision) |
| **Company Verification API** | OpenCorporates API |
| **Email Service** | Resend (or SendGrid / Brevo) |
| **File Storage** | Local filesystem (or AWS S3) |
| **API Documentation** | Swagger/OpenAPI (auto-generated) |
| **Testing (Backend)** | Jest, Supertest |
| **Testing (Frontend)** | Vitest, React Testing Library, MSW |

---

## Features

| # | Feature | Status |
|---|---|---|
| 1 | Vendor Details (Create / Edit) | Implemented |
| 2 | Document Upload (PDF / Image) | Implemented |
| 3 | AI Document Extraction | Implemented |
| 4 | Cross-Document AI Comparison | Implemented |
| 5 | Company Verification (OpenCorporates) | Implemented |
| 6 | Missing Document Checklist | Implemented |
| 7 | Automated Email Notification | Implemented |
| 8 | Verification Workflow | Implemented |
| 9 | Task Management | Implemented |
| 10 | Version History with Restore | Implemented |

---

## Project Structure

```
vendor-verification/
  backend/                  <- NestJS API server
    src/
      modules/
        vendor/             <- Vendor CRUD + version history triggers
        document/           <- File upload + document management
        ai/                 <- AI extraction + comparison
        verification/       <- OpenCorporates API integration
        email/              <- Email automation
        workflow/           <- State machine + task management
        version-history/    <- Version tracking + restore
      common/               <- Filters, guards, interceptors
      config/               <- Database + app configuration
    uploads/                <- Uploaded files (gitignored)
    .env                    <- Environment variables (gitignored)
    .env.example            <- Environment variable template
  frontend/                 <- React + Vite application
    src/
      pages/                <- Page components
      components/           <- Reusable UI components
      controllers/          <- Custom React hooks (data logic)
      models/               <- TypeScript interfaces
      services/api/         <- API call functions
      store/                <- Zustand global state
      styles/               <- CSS variables + global styles
  docker-compose.yml        <- Optional Docker setup
  PRD.md                    <- Product requirements
  ARCHITECTURE.md           <- System architecture
  DESIGN_SYSTEM.md          <- UI/UX design guide
  AGENTS.md                 <- AI agent instructions
  SECURITY.md               <- Security guidelines
  CODE_STYLE.md             <- Coding conventions
  TESTING.md                <- Testing guide
  README.md                 <- This file
```

---

## Prerequisites

Ensure you have the following installed:

| Tool | Version | Download |
|---|---|---|
| Node.js | 18.x or 20.x | https://nodejs.org |
| npm | 9.x+ | (included with Node.js) |
| PostgreSQL | 15.x | https://postgresql.org |
| Git | Latest | https://git-scm.com |

---

## Setup & Installation

### 1. Clone the Repository

```bash
git clone https://github.com/your-username/vendor-verification.git
cd vendor-verification
```

### 2. Set Up PostgreSQL Database

```sql
-- Connect to PostgreSQL and run:
CREATE DATABASE vendor_verification;
CREATE USER vendor_user WITH ENCRYPTED PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE vendor_verification TO vendor_user;
```

### 3. Install Backend Dependencies

```bash
cd backend
npm install
```

### 4. Configure Backend Environment

```bash
cp .env.example .env
# Edit .env with your values (see Environment Variables section below)
```

### 5. Run Database Migrations

```bash
cd backend
npm run typeorm migration:run
```

### 6. Install Frontend Dependencies

```bash
cd ../frontend
npm install
```

### 7. Configure Frontend Environment

```bash
cp .env.example .env
# Set VITE_API_BASE_URL=http://localhost:3001/api/v1
```

---

## Environment Variables

### Backend `.env`

```env
# Application
NODE_ENV=development
PORT=3001

# Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=vendor_verification
DB_USER=vendor_user
DB_PASSWORD=your_password

# AI Provider (choose: openai | gemini)
AI_PROVIDER=openai
OPENAI_API_KEY=sk-your-openai-key-here
GEMINI_API_KEY=your-gemini-key-here

# Company Verification
OPENCORPORATES_API_KEY=your-opencorporates-api-key

# Email Provider (choose: resend | sendgrid | brevo)
EMAIL_PROVIDER=resend
RESEND_API_KEY=re_your-resend-key
SENDGRID_API_KEY=SG.your-sendgrid-key
EMAIL_FROM=noreply@yourcompany.com

# File Storage (choose: local | s3)
STORAGE_TYPE=local
UPLOAD_DIR=./uploads

# AWS S3 (only if STORAGE_TYPE=s3)
AWS_ACCESS_KEY_ID=your-access-key
AWS_SECRET_ACCESS_KEY=your-secret-key
AWS_S3_BUCKET=your-bucket-name
AWS_REGION=us-east-1

# CORS
ALLOWED_ORIGINS=http://localhost:5173
```

### Frontend `.env`

```env
VITE_API_BASE_URL=http://localhost:3001/api/v1
```

> **Security Note:** Never commit `.env` files. The `.env.example` file provides a safe template with placeholder values.

---

## Running the Application

### Development Mode

**Start Backend:**
```bash
cd backend
npm run start:dev
# Backend runs at: http://localhost:3001
# Swagger docs at: http://localhost:3001/api/docs
```

**Start Frontend (in a new terminal):**
```bash
cd frontend
npm run dev
# Frontend runs at: http://localhost:5173
```

### Using Docker (Optional)

```bash
# From project root
docker-compose up --build

# Services:
# - PostgreSQL: localhost:5432
# - Backend: localhost:3001
# - Frontend: localhost:5173 (or 80 in production)
```

---

## API Documentation

Once the backend is running, interactive API documentation is available at:

```
http://localhost:3001/api/docs
```

### Key Endpoints

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/v1/vendors` | Create a vendor |
| GET | `/api/v1/vendors` | List all vendors |
| GET | `/api/v1/vendors/:id` | Get vendor details |
| PUT | `/api/v1/vendors/:id` | Update vendor |
| POST | `/api/v1/vendors/:id/documents` | Upload a document |
| POST | `/api/v1/ai/extract/:documentId` | Trigger AI extraction |
| POST | `/api/v1/ai/compare/:vendorId` | Run AI comparison |
| POST | `/api/v1/verification/:vendorId` | Verify company |
| POST | `/api/v1/email/missing-documents/:vendorId` | Send missing doc email |
| PUT | `/api/v1/vendors/:id/workflow/status` | Update workflow status |
| GET | `/api/v1/vendors/:id/versions` | Get version history |
| POST | `/api/v1/vendors/:id/versions/:vNo/restore` | Restore a version |

---

## Database

| Setting | Value |
|---|---|
| **Database** | PostgreSQL 15 |
| **ORM** | TypeORM |
| **Default Port** | 5432 |

### Key Tables

| Table | Description |
|---|---|
| `vendors` | Core vendor information and workflow status |
| `documents` | Uploaded document metadata |
| `extracted_data` | AI-extracted field values per document |
| `vendor_versions` | Append-only version history records |
| `verification_results` | Company verification API results |
| `tasks` | Action items created during workflow |
| `workflow_logs` | Audit trail of all status transitions |
| `email_logs` | Record of all email send attempts |

### Running Migrations

```bash
# Run all pending migrations
npm run typeorm migration:run

# Revert last migration
npm run typeorm migration:revert

# Generate new migration after entity changes
npm run typeorm migration:generate -- -n YourMigrationName
```

---

## Architecture

The application follows **MVC (Model-View-Controller)** architecture:

- **Models:** TypeORM entities define the database schema
- **Views:** React components render the UI
- **Controllers:** NestJS controllers handle HTTP routing; React custom hooks coordinate data

For the complete architecture documentation, see [ARCHITECTURE.md](./ARCHITECTURE.md).

**Architecture Overview:**
```
React Frontend (Port 5173)
    |
    | HTTP REST API
    |
NestJS Backend (Port 3001)
    |
    |-- PostgreSQL (Port 5432)
    |-- OpenAI / Gemini API (External)
    |-- OpenCorporates API (External)
    |-- Resend / SendGrid (External)
```

---

## Testing

### Run Backend Tests

```bash
cd backend

# Run all unit tests
npm test

# Run with coverage
npm run test:cov

# Run in watch mode
npm run test:watch
```

### Run Frontend Tests

```bash
cd frontend

# Run all tests
npm run test:run

# Run with UI
npm run test:ui

# Run with coverage
npm run test:coverage
```

### Test Coverage Targets

| Area | Minimum Coverage |
|---|---|
| Services (backend) | 85% |
| Workflow state machine | 100% of transitions |
| AI extraction parsing | 90% |
| Custom hooks (frontend) | 75% |

For full testing documentation, see [TESTING.md](./TESTING.md).

---

## Common Issues & Troubleshooting

### Database connection error
```
Error: connect ECONNREFUSED 127.0.0.1:5432
```
**Fix:** Ensure PostgreSQL is running and `.env` DB credentials are correct.

### AI API rate limit
```
Error: 429 Too Many Requests
```
**Fix:** Wait a moment and retry. The system handles this gracefully with an "Unable to Extract" status.

### File upload fails (MIME type error)
```
Error: Invalid file type. Only PDF, PNG, JPG allowed.
```
**Fix:** Upload only PDF, PNG, or JPG files. Maximum file size is 10MB.

### OpenCorporates company not found
The system returns `Unable to Verify` status. This is expected behavior for companies not in the OpenCorporates registry.

---

## License

This project is submitted as a technical assessment. All rights reserved by the submitting developer.

---

*README v1.0 | AI-Powered Vendor Verification Workspace*
