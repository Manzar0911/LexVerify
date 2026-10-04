# Product Requirements Document (PRD)
# AI-Powered Vendor Verification Workspace

---

## 1. Overview

| Field | Details |
|---|---|
| **Project Name** | AI-Powered Vendor Verification Workspace |
| **Version** | 1.0.0 |
| **Date** | 2026-10-03 |
| **Assessment** | Technical Assessment – Full Stack Developer |
| **Time Constraint** | 8 Hours |

---

## 2. Objective

Build a working web application for **onboarding and verifying a vendor/company**. The application must integrate AI-powered document processing, external company verification APIs, email automation, and a structured workflow engine.

> **Priority Focus:** Functionality, Integration Quality, and Code Quality. Visual design is secondary.

---

## 3. Target Users

| Role | Description |
|---|---|
| **Reviewer / Admin** | Internal user who manages vendor onboarding, reviews documents, triggers verifications, and approves/rejects vendors |
| **Vendor (indirect)** | Receives email notifications requesting missing documents; does not directly log in |

---

## 4. Core Features

### 4.1 Vendor Details Management

**Goal:** Capture and manage all key vendor information through a form interface.

**Fields Required:**
| Field | Type | Required |
|---|---|---|
| Company Name | Text | Yes |
| Contact Person | Text | Yes |
| Email | Email | Yes |
| Phone | Phone Number | Yes |
| Address | Textarea | Yes |
| Company Registration Number | Text | Yes |
| GST / Tax Number | Text | Yes |
| Bank Account Number | Text | Yes |
| IFSC Code | Text | Yes |

**Functional Requirements:**
- FR-VD-01: User can **create** a new vendor with all required fields
- FR-VD-02: User can **edit** existing vendor information
- FR-VD-03: User can **save** vendor details to persistent storage
- FR-VD-04: Each save/edit must create a **version history entry** (see Section 4.6)
- FR-VD-05: Basic field-level validation (email format, phone format, IFSC format)

---

### 4.2 Document Upload & AI Extraction

**Goal:** Allow upload of vendor documents and automatically extract key information using an AI API.

**Supported Document Types:**
| Document | Key Fields Expected |
|---|---|
| Company Registration Certificate | Company Name, Registration Number, Address |
| GST / Tax Certificate | Company Name, GST/Tax Number, Address |
| Bank Document | Bank Account Number, IFSC Code, Company Name |

**Functional Requirements:**
- FR-DOC-01: User can upload **2-3 documents** (PDF or image format)
- FR-DOC-02: Each document is processed by an **AI extraction API** upon upload
- FR-DOC-03: Extracted fields are displayed per document on screen
- FR-DOC-04: User can **edit incorrect extracted information** inline
- FR-DOC-05: Extraction results are saved to the database

**AI Comparison Requirements:**
- FR-AI-01: System compares extracted data **across all uploaded documents**
- FR-AI-02: Identify **mismatches** between documents (e.g., Company Name differs between Registration and GST document)
- FR-AI-03: Identify **missing fields** that should have been extracted but are absent
- FR-AI-04: Display a **comparison report** with mismatch highlighting

**Example Mismatch:**
```
Registration Document -> Company Name: "ABC Technologies Pvt Ltd"
GST Document          -> Company Name: "ABC Technology Pvt Ltd"
Result: MISMATCH FOUND
```

---

### 4.3 Company Verification - External API

**Goal:** Verify the vendor's company information against a trusted external registry.

**Preferred API:** OpenCorporates API (https://api.opencorporates.com/)

**Functional Requirements:**
- FR-CV-01: User can trigger company verification using **Company Name** or **Registration Number**
- FR-CV-02: System fetches available company information from the external API
- FR-CV-03: Display API result alongside vendor-submitted information
- FR-CV-04: System compares API result with vendor data and displays one of:
  - VERIFIED - Data matches
  - MISMATCH - Data exists but differs
  - UNABLE TO VERIFY - API did not return a result or error occurred
- FR-CV-05: Handle API errors gracefully (timeout, rate limit, not found)
- FR-CV-06: API credentials stored in **environment variables only** (never hardcoded)

---

### 4.4 Missing Document + Email Automation

**Goal:** Track document completeness and automatically notify vendors of missing documents.

**Document Checklist States:**
| Status | Description |
|---|---|
| Available | Document has been uploaded |
| Missing | Document is required but not uploaded |
| Verified | Document has been extracted and verified |

**Functional Requirements:**
- FR-EMAIL-01: System checks which required documents are missing
- FR-EMAIL-02: If any required document is missing, system **automatically sends an email** to the vendor's registered email address
- FR-EMAIL-03: Email must include:
  - Vendor's Company Name
  - Name of the missing document(s)
  - Polite request to provide the document
- FR-EMAIL-04: Email service can be Resend, SendGrid, Brevo, or SMTP
- FR-EMAIL-05: Email credentials stored in **environment variables only**
- FR-EMAIL-06: Display confirmation that email was sent in the UI

> **Note:** No vendor-facing upload portal is required.

---

### 4.5 Basic Verification Workflow

**Goal:** Track vendor onboarding through a multi-stage lifecycle.

**Workflow States:**
```
Draft -> Under Review -> Action Required -> Approved / Rejected
```

**State Transition Rules:**
| Trigger | New State |
|---|---|
| Vendor record created | Draft |
| Reviewer begins review | Under Review |
| Missing document OR API mismatch detected | Action Required |
| Reviewer approves | Approved |
| Reviewer rejects | Rejected |

**Task Management:**
When status becomes `Action Required`, a task is automatically created:

| Task Field | Type | Required |
|---|---|---|
| Task Description | Text | Yes |
| Priority | Enum: Low / Medium / High | Yes |
| Due Date | Date | Yes |
| Status | Enum: Pending / Completed | Yes |

**Functional Requirements:**
- FR-WF-01: Vendor record always starts in `Draft` state
- FR-WF-02: Reviewer can manually transition status
- FR-WF-03: System auto-transitions to `Action Required` on mismatch/missing document
- FR-WF-04: Task is auto-created when `Action Required` is triggered
- FR-WF-05: Tasks can be marked `Completed` by the reviewer
- FR-WF-06: Workflow history/audit trail is maintained

---

### 4.6 Version History

**Goal:** Maintain a complete, restorable audit trail of all vendor detail changes.

**Functional Requirements:**
- FR-VH-01: Every save/edit of vendor details creates a new versioned record
- FR-VH-02: Display version history with:
  - Version number
  - Field that changed (previous value -> new value)
  - Date and time of change
  - Who made the change
- FR-VH-03: User can **restore** any previous version
- FR-VH-04: Restoring a version creates a new version entry (not overwriting history)

**Version History Display Example:**
```
Version 3 | 2026-10-01 14:22 | Changed by: Admin
  * Company Name: "ABC Technologies" -> "ABC Technologies Pvt Ltd"

Version 2 | 2026-10-01 10:10 | Changed by: Admin
  * GST Number: null -> "27AABCU9603R1Z1"
```

---

## 5. Non-Functional Requirements

| Category | Requirement |
|---|---|
| **Security** | All API keys in environment variables; no secrets in source code |
| **Error Handling** | All API calls and database operations must have try/catch with meaningful errors |
| **Validation** | Server-side validation on all API endpoints; client-side as UX aid |
| **Performance** | Document AI extraction should respond within 30 seconds |
| **Scalability** | MVC architecture must allow future module additions without refactoring |
| **Reliability** | Email failures must not block the verification workflow |
| **Auditability** | All state changes and AI actions should be logged |

---

## 6. Expected Workflow (End-to-End)

```
1. Vendor Details   -> Fill & save vendor form
         |
2. Upload Docs      -> Upload 2-3 documents
         |
3. AI Extraction    -> AI parses documents, extracts fields
         |
4. AI Comparison    -> Cross-document mismatch detection
         |
5. Company API      -> OpenCorporates verification
   Verification
         |
6. Missing Doc      -> Checklist + auto email
   Check + Email
         |
7. Review           -> Reviewer inspects all data
         |
8. Approve/Reject   -> Final decision
```

---

## 7. Technical Stack Specification

| Layer | Technology |
|---|---|
| **Frontend** | React (TypeScript) |
| **Backend** | NestJS (TypeScript) |
| **Architecture** | MVC (Model-View-Controller) |
| **Database** | PostgreSQL |
| **ORM** | TypeORM / Prisma |
| **AI API** | Google Gemini Vision / OpenAI GPT-4 Vision / AWS Textract |
| **Company Verification API** | OpenCorporates API |
| **Email Service** | Resend / SendGrid / Brevo |
| **File Storage** | Local filesystem / AWS S3 |
| **Environment Config** | .env files with dotenv |

---

## 8. Submission Checklist

- [ ] Working application (frontend + backend)
- [ ] Source code (well-structured, readable)
- [ ] Database schema / migrations
- [ ] README with setup instructions
- [ ] Brief architecture explanation
- [ ] 5-minute demo capability

---

## 9. Evaluation Criteria

| Criteria | Weight |
|---|---|
| Full-stack development | High |
| AI integration | High |
| Document processing | High |
| External API integration | High |
| Email automation | Medium |
| Database design | Medium |
| Workflow logic | Medium |
| Error handling | Medium |
| Code structure | High |
| Visual design | Low |

---

*Document generated from: Technical Assessment Test - Full Stack Developer*
