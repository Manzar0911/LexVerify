# Architecture Document
# AI-Powered Vendor Verification Workspace

---

## 1. System Overview

The AI-Powered Vendor Verification Workspace is a full-stack web application built with a **React frontend** and a **NestJS backend**, following the **MVC (Model-View-Controller) architecture pattern**. It integrates AI APIs for document extraction, the OpenCorporates API for company verification, and an email service for automated notifications.

---

## 2. High-Level Architecture

```
+-----------------------------------------------------------+
|                      CLIENT BROWSER                        |
|  +--------------+  +-----------+  +-------------------+   |
|  |  React App   |  | React     |  | Axios HTTP Client |   |
|  |  (TypeScript)|  | Router v6 |  | (API Layer)       |   |
|  +--------------+  +-----------+  +-------------------+   |
+--------------------------|--------------------------------+
                           | HTTP/REST (JSON)
+--------------------------|--------------------------------+
|                    NESTJS BACKEND (MVC)                    |
|  +----------------+  +-----------+  +------------------+  |
|  | Controllers    |  | Services  |  | TypeORM Entities |  |
|  | (REST Routes)  |->| (Business |->| (DB Models)      |  |
|  |                |  |  Logic)   |  |                  |  |
|  +----------------+  +-----------+  +------------------+  |
|                           |                                |
|  +--------------------+  +-------------------------+       |
|  | AI Service Module  |  | Email Service Module    |       |
|  | (OpenAI/Gemini)    |  | (Resend/SendGrid)       |       |
|  +--------------------+  +-------------------------+       |
|                           |                                |
|  +--------------------+                                    |
|  | Company API Module |                                    |
|  | (OpenCorporates)   |                                    |
|  +--------------------+                                    |
+--------------------------|--------------------------------+
                           |
+--------------------------|--------------------------------+
|                      POSTGRESQL DATABASE                   |
|  vendors | documents | tasks | vendor_versions |           |
|  workflow_logs | email_logs | extracted_data              |
+-----------------------------------------------------------+
```

---

## 3. Technology Stack

### 3.1 Frontend

| Technology | Version | Purpose |
|---|---|---|
| React | 18.x | UI framework |
| TypeScript | 5.x | Type safety |
| React Router v6 | 6.x | Client-side routing |
| Axios | 1.x | HTTP client |
| React Query (TanStack) | 5.x | Server state management |
| Zustand | 4.x | Client state management |
| React Hook Form | 7.x | Form management |
| Zod | 3.x | Schema validation |
| CSS Modules | - | Scoped styling |
| Heroicons | 2.x | Icon library |
| Vite | 5.x | Build tool / dev server |

### 3.2 Backend

| Technology | Version | Purpose |
|---|---|---|
| NestJS | 10.x | Backend framework |
| TypeScript | 5.x | Type safety |
| TypeORM | 0.3.x | ORM |
| PostgreSQL | 15.x | Primary database |
| Multer | - | File upload handling |
| class-validator | - | DTO validation |
| class-transformer | - | DTO transformation |
| Passport.js | - | Authentication (optional) |
| Swagger/OpenAPI | - | API documentation |
| Jest | - | Unit + integration testing |

### 3.3 External Services

| Service | Purpose |
|---|---|
| OpenAI GPT-4 Vision / Google Gemini Vision | AI document extraction |
| OpenCorporates API | Company verification |
| Resend / SendGrid / Brevo | Email automation |
| AWS S3 / Local Filesystem | Document file storage |

---

## 4. MVC Architecture Pattern

### 4.1 Backend MVC Structure (NestJS)

```
backend/
  src/
    modules/
      vendor/
        vendor.controller.ts     <- Controller (routes, HTTP handling)
        vendor.service.ts        <- Service (business logic)
        vendor.module.ts         <- Module (DI wiring)
        entities/
          vendor.entity.ts       <- Model (TypeORM Entity)
        dto/
          create-vendor.dto.ts   <- Data Transfer Objects
          update-vendor.dto.ts
      document/
        document.controller.ts
        document.service.ts
        document.module.ts
        entities/
          document.entity.ts
          extracted-data.entity.ts
        dto/
      ai/
        ai.controller.ts
        ai.service.ts            <- Calls OpenAI/Gemini
        ai.module.ts
      verification/
        verification.controller.ts
        verification.service.ts  <- Calls OpenCorporates
        verification.module.ts
      email/
        email.service.ts         <- Calls Resend/SendGrid
        email.module.ts
      workflow/
        workflow.controller.ts
        workflow.service.ts      <- State machine logic
        workflow.module.ts
        entities/
          task.entity.ts
          workflow-log.entity.ts
      version-history/
        version-history.controller.ts
        version-history.service.ts
        version-history.module.ts
        entities/
          vendor-version.entity.ts
    common/
      filters/
        http-exception.filter.ts <- Global error handling
      guards/
        auth.guard.ts
      interceptors/
        logging.interceptor.ts
        transform.interceptor.ts
      decorators/
      pipes/
        validation.pipe.ts
    config/
      database.config.ts
      app.config.ts
    app.module.ts
    main.ts
```

### 4.2 Frontend MVC-inspired Structure (React)

```
frontend/
  src/
    pages/                       <- View layer (page components)
      VendorListPage.tsx
      VendorDetailPage.tsx
      DocumentUploadPage.tsx
      VerificationPage.tsx
      WorkflowPage.tsx
      VersionHistoryPage.tsx
    components/                  <- Reusable UI components
      vendor/
        VendorForm.tsx
        VendorCard.tsx
        VendorStatusBadge.tsx
      document/
        DocumentUploader.tsx
        DocumentCard.tsx
        ExtractedDataForm.tsx
        ComparisonTable.tsx
      verification/
        VerificationPanel.tsx
        VerificationResult.tsx
      workflow/
        WorkflowStepper.tsx
        TaskCard.tsx
        TaskForm.tsx
      version-history/
        VersionList.tsx
        VersionDiff.tsx
      common/
        Button.tsx
        Input.tsx
        Badge.tsx
        Modal.tsx
        Toast.tsx
        Spinner.tsx
        Table.tsx
        Sidebar.tsx
        PageHeader.tsx
    controllers/                 <- Custom hooks acting as Controllers
      useVendorController.ts
      useDocumentController.ts
      useVerificationController.ts
      useWorkflowController.ts
      useVersionHistoryController.ts
    models/                      <- TypeScript interfaces/types
      vendor.model.ts
      document.model.ts
      verification.model.ts
      workflow.model.ts
      version.model.ts
    services/                    <- API call layer
      api/
        axios.instance.ts        <- Configured Axios
        vendor.api.ts
        document.api.ts
        ai.api.ts
        verification.api.ts
        email.api.ts
        workflow.api.ts
        version.api.ts
    store/                       <- Zustand global state
      vendorStore.ts
      uiStore.ts
    router/
      AppRouter.tsx
      routes.ts
    styles/
      variables.css
      global.css
      reset.css
    App.tsx
    main.tsx
    vite.config.ts
```

---

## 5. Database Design

### 5.1 Entity Relationship Diagram

```
vendors (1) ----< documents (many)
vendors (1) ----< vendor_versions (many)
vendors (1) ----< workflow_logs (many)
vendors (1) ---- tasks (many when Action Required)
documents (1) ----< extracted_data (many fields)
vendors (1) ---- verification_results (one per verification run)
vendors (1) ---- email_logs (many)
```

### 5.2 Database Tables

#### `vendors`
| Column | Type | Constraints |
|---|---|---|
| id | UUID | PK, auto-generated |
| company_name | VARCHAR(255) | NOT NULL |
| contact_person | VARCHAR(255) | NOT NULL |
| email | VARCHAR(255) | NOT NULL |
| phone | VARCHAR(50) | NOT NULL |
| address | TEXT | NOT NULL |
| registration_number | VARCHAR(100) | NOT NULL |
| gst_number | VARCHAR(100) | |
| bank_account_number | VARCHAR(100) | |
| ifsc_code | VARCHAR(20) | |
| status | ENUM | NOT NULL, DEFAULT 'Draft' |
| current_version | INTEGER | DEFAULT 1 |
| created_at | TIMESTAMP | DEFAULT NOW() |
| updated_at | TIMESTAMP | |

**Status ENUM values:** `Draft`, `Under Review`, `Action Required`, `Approved`, `Rejected`

#### `documents`
| Column | Type | Constraints |
|---|---|---|
| id | UUID | PK |
| vendor_id | UUID | FK -> vendors.id |
| document_type | ENUM | NOT NULL |
| file_name | VARCHAR(255) | NOT NULL |
| file_path | TEXT | NOT NULL |
| file_size | INTEGER | |
| mime_type | VARCHAR(50) | |
| status | ENUM | DEFAULT 'Available' |
| uploaded_at | TIMESTAMP | DEFAULT NOW() |

**Document Type ENUM:** `registration_certificate`, `gst_certificate`, `bank_document`
**Document Status ENUM:** `Available`, `Missing`, `Verified`

#### `extracted_data`
| Column | Type | Constraints |
|---|---|---|
| id | UUID | PK |
| document_id | UUID | FK -> documents.id |
| field_name | VARCHAR(100) | NOT NULL |
| extracted_value | TEXT | |
| edited_value | TEXT | |
| confidence_score | DECIMAL(5,4) | |
| is_edited | BOOLEAN | DEFAULT false |
| extracted_at | TIMESTAMP | |

#### `vendor_versions`
| Column | Type | Constraints |
|---|---|---|
| id | UUID | PK |
| vendor_id | UUID | FK -> vendors.id |
| version_number | INTEGER | NOT NULL |
| field_name | VARCHAR(100) | NOT NULL |
| previous_value | TEXT | |
| new_value | TEXT | |
| changed_by | VARCHAR(255) | |
| changed_at | TIMESTAMP | DEFAULT NOW() |
| snapshot | JSONB | Full vendor snapshot |

#### `verification_results`
| Column | Type | Constraints |
|---|---|---|
| id | UUID | PK |
| vendor_id | UUID | FK -> vendors.id |
| api_provider | VARCHAR(100) | |
| api_response | JSONB | |
| verification_status | ENUM | |
| mismatch_fields | JSONB | |
| verified_at | TIMESTAMP | DEFAULT NOW() |

**Verification Status ENUM:** `Verified`, `Mismatch`, `Unable_to_Verify`

#### `tasks`
| Column | Type | Constraints |
|---|---|---|
| id | UUID | PK |
| vendor_id | UUID | FK -> vendors.id |
| description | TEXT | NOT NULL |
| priority | ENUM | NOT NULL |
| due_date | DATE | NOT NULL |
| status | ENUM | DEFAULT 'Pending' |
| created_at | TIMESTAMP | DEFAULT NOW() |
| completed_at | TIMESTAMP | |

**Priority ENUM:** `Low`, `Medium`, `High`
**Task Status ENUM:** `Pending`, `Completed`

#### `workflow_logs`
| Column | Type | Constraints |
|---|---|---|
| id | UUID | PK |
| vendor_id | UUID | FK -> vendors.id |
| from_status | VARCHAR(50) | |
| to_status | VARCHAR(50) | |
| triggered_by | VARCHAR(50) | system or user |
| reason | TEXT | |
| changed_at | TIMESTAMP | DEFAULT NOW() |

#### `email_logs`
| Column | Type | Constraints |
|---|---|---|
| id | UUID | PK |
| vendor_id | UUID | FK -> vendors.id |
| recipient_email | VARCHAR(255) | |
| subject | VARCHAR(255) | |
| body | TEXT | |
| status | ENUM | |
| provider_message_id | VARCHAR(255) | |
| sent_at | TIMESTAMP | |

---

## 6. API Design

### 6.1 Base URL
```
Development: http://localhost:3001/api/v1
Production:  https://your-domain.com/api/v1
```

### 6.2 API Endpoints

#### Vendors
| Method | Endpoint | Description |
|---|---|---|
| GET | `/vendors` | List all vendors |
| POST | `/vendors` | Create a new vendor |
| GET | `/vendors/:id` | Get vendor by ID |
| PUT | `/vendors/:id` | Update vendor |
| DELETE | `/vendors/:id` | Delete vendor |

#### Documents
| Method | Endpoint | Description |
|---|---|---|
| POST | `/vendors/:id/documents` | Upload document |
| GET | `/vendors/:id/documents` | List vendor documents |
| GET | `/documents/:id` | Get document details |
| DELETE | `/documents/:id` | Delete document |

#### AI Extraction
| Method | Endpoint | Description |
|---|---|---|
| POST | `/ai/extract/:documentId` | Trigger AI extraction |
| GET | `/ai/extracted/:documentId` | Get extracted data |
| PUT | `/ai/extracted/:documentId/fields` | Edit extracted field |
| POST | `/ai/compare/:vendorId` | Run cross-document comparison |

#### Company Verification
| Method | Endpoint | Description |
|---|---|---|
| POST | `/verification/:vendorId` | Trigger company verification |
| GET | `/verification/:vendorId` | Get verification result |

#### Workflow
| Method | Endpoint | Description |
|---|---|---|
| GET | `/vendors/:id/workflow` | Get current workflow status |
| PUT | `/vendors/:id/workflow/status` | Update workflow status |
| GET | `/vendors/:id/tasks` | Get vendor tasks |
| POST | `/vendors/:id/tasks` | Create task |
| PUT | `/tasks/:id` | Update task |

#### Email
| Method | Endpoint | Description |
|---|---|---|
| POST | `/email/missing-documents/:vendorId` | Send missing document email |
| GET | `/vendors/:id/email-logs` | Get email history |

#### Version History
| Method | Endpoint | Description |
|---|---|---|
| GET | `/vendors/:id/versions` | Get version history |
| POST | `/vendors/:id/versions/:versionNumber/restore` | Restore a version |

### 6.3 Standard Response Format

```json
// Success
{
  "success": true,
  "data": { ... },
  "message": "Operation completed successfully"
}

// Error
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Company name is required",
    "details": { ... }
  }
}
```

---

## 7. AI Integration Architecture

```
Document Upload
      |
      v
[Multer Middleware] -> File saved to storage
      |
      v
[AI Service] -> Sends file (base64/URL) to OpenAI Vision / Gemini API
      |
      v
[Structured Extraction Prompt]
  "Extract the following fields from this document:
   - Company Name
   - Registration Number
   - GST/Tax Number
   - Address
   - Bank Account Number
   - IFSC Code
   Return as JSON."
      |
      v
[Parse AI Response] -> Map to ExtractedData entities
      |
      v
[Save to DB: extracted_data table]
      |
      v
[Return to Frontend]
```

### AI Comparison Flow

```
All Documents Extracted?
      |
      v
[AI Comparison Service]
  - Group extracted fields by field_name across documents
  - Compare values using string similarity (exact + fuzzy)
  - Identify: MATCH / MISMATCH / MISSING
      |
      v
[Return Comparison Matrix to Frontend]
```

---

## 8. Email Automation Flow

```
Vendor Saved / Status Changed
      |
      v
[Check Document Checklist]
  - Query all required document types
  - Identify which are missing (status = 'Missing')
      |
      v
[Missing Docs Found?] -- NO --> Exit, no email
      |
      YES
      v
[Email Service] -> Compose email with:
  - Vendor Company Name
  - List of missing documents
  - Request message
      |
      v
[Send via Resend/SendGrid API]
      |
      v
[Log to email_logs table]
      |
      v
[Return result to Frontend]
```

---

## 9. Workflow State Machine

```
                    +---------+
               +--> | Approved|
               |    +---------+
+---------+    |    +---------+
|  Draft  | -> |    |Rejected |
+---------+    |    +---------+
     |         |
     v         |
+------------+ |
|Under Review|-+
+------------+
     |
     v (mismatch/missing doc detected)
+-----------------+
| Action Required |
+-----------------+
     |
     v (issue resolved + reviewer decision)
+---------+    +---------+
| Approved| or |Rejected |
+---------+    +---------+
```

**Auto-Transitions (System-triggered):**
- `Draft` -> `Under Review`: When reviewer opens vendor for review
- `Under Review` -> `Action Required`: When AI mismatch or missing document detected

**Manual Transitions (Reviewer-triggered):**
- Any state -> `Approved`
- Any state -> `Rejected`
- `Action Required` -> `Under Review`: After issue resolved

---

## 10. Security Architecture

### 10.1 API Key Management
- All external API keys stored in `.env` files
- `.env` never committed to version control
- `ConfigModule` from NestJS used for structured config access
- Frontend API calls proxied through backend (keys never exposed to browser)

### 10.2 File Upload Security
- Validate MIME types (PDF, PNG, JPG, JPEG only)
- Validate file size (max 10MB per file)
- Sanitize filenames before saving
- Store files outside web root

### 10.3 Input Validation
- All DTOs validated with `class-validator`
- Global `ValidationPipe` with `whitelist: true` (strips unknown properties)
- SQL injection prevention via TypeORM parameterized queries

### 10.4 CORS
- CORS configured to allow only the frontend origin
- `credentials: true` for cookie-based sessions if auth added

---

## 11. Environment Configuration

### Backend `.env`
```env
# App
NODE_ENV=development
PORT=3001

# Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=vendor_verification
DB_USER=postgres
DB_PASSWORD=your_password

# AI API
AI_PROVIDER=openai          # openai | gemini
OPENAI_API_KEY=sk-...
GEMINI_API_KEY=...

# Company Verification
OPENCORPORATES_API_KEY=...

# Email Service
EMAIL_PROVIDER=resend       # resend | sendgrid | brevo
RESEND_API_KEY=re_...
SENDGRID_API_KEY=SG...
EMAIL_FROM=noreply@yourcompany.com

# File Storage
STORAGE_TYPE=local          # local | s3
UPLOAD_DIR=./uploads
AWS_ACCESS_KEY_ID=...
AWS_SECRET_ACCESS_KEY=...
AWS_S3_BUCKET=...
```

### Frontend `.env`
```env
VITE_API_BASE_URL=http://localhost:3001/api/v1
```

---

## 12. Deployment Architecture

```
+------------------+      +------------------+      +------------------+
|   Nginx / CDN    |      |   NestJS App     |      |   PostgreSQL     |
|   (Frontend)     | ---> |   (Backend)      | ---> |   Database       |
|   Static Files   |      |   Port 3001      |      |   Port 5432      |
+------------------+      +------------------+      +------------------+
                                  |
                    +-------------+-------------+
                    |             |             |
              +----------+  +---------+  +----------+
              | OpenAI / |  | OpenCorp|  | Resend / |
              | Gemini   |  | ates API|  | SendGrid |
              +----------+  +---------+  +----------+
```

### Docker Setup (Optional)
```
docker-compose.yml
  services:
    - postgres (PostgreSQL 15)
    - backend (NestJS app)
    - frontend (React build served via Nginx)
```

---

## 13. Inter-Module Communication

```
Frontend (React) 
  -> HTTP REST API 
    -> NestJS Controller 
      -> NestJS Service 
        -> TypeORM Repository 
          -> PostgreSQL

NestJS Service (internal) 
  -> AI Service 
    -> OpenAI/Gemini API

NestJS Service (internal) 
  -> Verification Service 
    -> OpenCorporates API

NestJS Service (internal) 
  -> Email Service 
    -> Resend/SendGrid API
```

---

*Architecture Document v1.0 | AI-Powered Vendor Verification Workspace*
