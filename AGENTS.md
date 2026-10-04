# AGENTS.md
# AI Agent Instructions – AI-Powered Vendor Verification Workspace

---

## 1. Project Summary

This is a **full-stack web application** for vendor onboarding and verification.

| Layer | Technology | Pattern |
|---|---|---|
| Frontend | React 18 + TypeScript | Component-based + Custom Hooks as Controllers |
| Backend | NestJS 10 + TypeScript | MVC (Controllers / Services / Entities) |
| Database | PostgreSQL 15 | TypeORM |
| AI | OpenAI GPT-4 Vision / Google Gemini Vision | REST API |
| Company Verification | OpenCorporates API | REST API |
| Email | Resend / SendGrid / Brevo | REST API |

---

## 2. Repository Structure

```
project-root/
  frontend/          <- React app (Vite)
  backend/           <- NestJS app
  docker-compose.yml <- Optional containerization
  PRD.md             <- Product requirements
  ARCHITECTURE.md    <- System architecture
  DESIGN_SYSTEM.md   <- UI/UX design system
  AGENTS.md          <- This file (AI agent instructions)
  README.md          <- Setup & run instructions
```

---

## 3. Absolute Rules for AI Agents

### 3.1 Never Do These Things

1. **Never hardcode API keys, secrets, or credentials** in any source file
2. **Never bypass the DTO validation layer** - all input must pass through class-validator DTOs
3. **Never skip error handling** on any external API call (AI, OpenCorporates, Email)
4. **Never modify database migrations** retroactively - always create new migrations
5. **Never directly mutate the database schema** - all changes go through TypeORM migration files
6. **Never change the workflow state machine transitions** without updating `workflow.service.ts` tests
7. **Never expose raw AI API responses** to the frontend without parsing/validating them first
8. **Never skip version history creation** when updating vendor details
9. **Never delete or overwrite version history records** - they are append-only
10. **Never commit `.env` files** to version control

### 3.2 Always Do These Things

1. **Always create a new TypeORM migration** when changing any entity schema
2. **Always update DTOs** when adding new fields to entities
3. **Always handle the three verification states**: `Verified`, `Mismatch`, `Unable_to_Verify`
4. **Always log workflow state transitions** in the `workflow_logs` table
5. **Always log email sends** in the `email_logs` table (including failures)
6. **Always use `ConfigService`** to access environment variables (never `process.env` directly in modules)
7. **Always validate file uploads** (MIME type + file size) before processing
8. **Always update the document checklist** after any document operation
9. **Always run tests** after modifying any service with business logic
10. **Always use TypeScript** - no plain JavaScript files in source

---

## 4. Module-Specific Instructions

### 4.1 Vendor Module (`backend/src/modules/vendor/`)

**Controller responsibilities:**
- Handle HTTP routing only
- Call service methods; never put business logic in the controller
- Return standardized response objects

**Service responsibilities:**
- All business logic lives here
- Trigger `VersionHistoryService.createEntry()` on every `update()` call
- Trigger `WorkflowService.checkAndAutoTransition()` after saves

**When modifying vendor entity:**
- Update `vendor.entity.ts`
- Update `create-vendor.dto.ts` and `update-vendor.dto.ts`
- Create a new TypeORM migration
- Update frontend `vendor.model.ts` interface

### 4.2 Document Module (`backend/src/modules/document/`)

**File Upload handling:**
- Multer configured with: PDF, PNG, JPG, JPEG only; max 10MB
- Files saved to `./uploads/vendors/:vendorId/` directory structure
- Filename sanitized using `sanitize-filename` before saving
- On successful upload, immediately trigger `AIService.extractDocument(documentId)`

**AI Extraction:**
- Handle AI API timeouts with a 30-second limit
- If AI extraction fails, document status remains `Available` but extraction status is `failed`
- Do NOT fail the upload if extraction fails - decouple these operations
- Save raw AI response to `extracted_data.raw_response` for debugging

### 4.3 AI Module (`backend/src/modules/ai/`)

**Provider abstraction:**
- `AIService` must be provider-agnostic
- Use strategy pattern: `OpenAIExtractor` and `GeminiExtractor` both implement `IAIExtractor`
- `AI_PROVIDER` env variable switches the active provider

**Extraction prompt guidelines:**
- Always request **structured JSON output** from AI
- Include explicit field names in the prompt
- Handle cases where fields are not found (return `null`, not an error)
- Validate AI JSON response before saving

**Comparison logic:**
- Compare fields case-insensitively
- Use fuzzy matching (Levenshtein distance < 3 = match) for company names
- Flag `null` extracted values as `MISSING`
- Flag differing values as `MISMATCH`

### 4.4 Verification Module (`backend/src/modules/verification/`)

**OpenCorporates API:**
- Base URL: `https://api.opencorporates.com/v0.4`
- Use API key from `OPENCORPORATES_API_KEY` env variable
- Search endpoint: `/companies/search?q={name}&api_token={key}`
- Always handle: 404 (not found), 429 (rate limit), 500 (API error)
- Cache verification results (don't re-verify on every page load)

**Comparison logic:**
- Normalize company names before comparing (remove "Pvt Ltd", "Inc", "LLC" etc.)
- Compare registration numbers exactly (case-insensitive)
- Return `Unable_to_Verify` for any API error, not just 404

### 4.5 Email Module (`backend/src/modules/email/`)

**Critical rules:**
- Email failures must NEVER block the main workflow
- Always wrap email sends in try/catch
- Always log both successful and failed sends in `email_logs`
- Email is triggered automatically when document status check finds missing documents

**Email template:**
```
Subject: Action Required: Missing Documents - {Company Name}
Body:
  Dear {Contact Person},
  We are reviewing your vendor application for {Company Name}.
  The following required documents are currently missing:
    - {Document 1}
    - {Document 2}
  Please provide these documents at your earliest convenience.
  Thank you.
```

### 4.6 Workflow Module (`backend/src/modules/workflow/`)

**State machine rules (strict):**
- Valid transitions only: see ARCHITECTURE.md Section 9
- Invalid transition attempts must return `400 Bad Request`
- Every transition must create a `workflow_logs` entry

**Auto-task creation:**
- When transitioning to `Action Required`, ALWAYS create a task automatically
- Task description should describe the reason (missing doc or mismatch)
- Default priority: `Medium`
- Default due date: 7 days from now

### 4.7 Version History Module (`backend/src/modules/version-history/`)

**Append-only rules:**
- `vendor_versions` records are NEVER updated or deleted
- Restoring a version: copies old snapshot values and creates a NEW version entry
- The restored version gets a new version number

**What to track:**
- Only track changes to these vendor fields: all fields in `vendors` table except `id`, `created_at`, `updated_at`
- Store full JSON snapshot in `snapshot` JSONB column per version

---

## 5. Frontend Instructions

### 5.1 Component Structure Rules

- **Pages** (`src/pages/`): Compose components, no direct API calls
- **Components** (`src/components/`): Purely presentational, receive props
- **Custom Hooks / Controllers** (`src/controllers/`): Handle all data fetching and mutation
- **Services** (`src/services/api/`): Pure API call functions, no state management

### 5.2 Data Fetching Pattern

```typescript
// CORRECT pattern using React Query
const { data: vendor, isLoading, error } = useQuery({
  queryKey: ['vendor', vendorId],
  queryFn: () => vendorApi.getById(vendorId),
});

// WRONG - never fetch directly in components
const [vendor, setVendor] = useState(null);
useEffect(() => { fetch('/api/vendors/' + vendorId) ... }, []);
```

### 5.3 Form Pattern

```typescript
// Use React Hook Form + Zod always
const schema = z.object({
  companyName: z.string().min(1, 'Required'),
  email: z.string().email('Invalid email'),
});
const form = useForm<VendorFormData>({ resolver: zodResolver(schema) });
```

### 5.4 Error Handling in Frontend

- All API errors caught at the custom hook/controller level
- Display errors via Toast notifications (not alerts)
- Never expose internal error details to the user (show friendly message)
- Log detailed errors to browser console for debugging

### 5.5 State Management Rules

- **Server state**: React Query (all API data)
- **Global UI state**: Zustand (sidebar open/close, active vendor, toast queue)
- **Form state**: React Hook Form (form field values, validation)
- **Local component state**: useState (dropdown open, modal visible)

---

## 6. Database / Migration Rules

### Creating New Migration
```bash
# From backend directory
npm run typeorm migration:generate -- -n MigrationName
npm run typeorm migration:run
```

### Migration Rules
- Always test migrations on a copy of the database first
- Never drop columns in migrations (mark as deprecated, remove in next major version)
- Always include `down()` method for rollback in migration files
- Migration files are version-controlled and immutable once merged

---

## 7. Testing Requirements

### Backend Testing
- All service methods must have unit tests (Jest)
- Mock all external services (AI, OpenCorporates, Email) in unit tests
- Integration tests for all controller endpoints
- Test all three verification result types
- Test all workflow state transitions (valid and invalid)

### Frontend Testing
- Utility functions tested with Vitest
- Component rendering tested with React Testing Library
- Forms test: validation errors, successful submission, API error display

---

## 8. When Adding a New Feature

Follow this checklist:

**Backend:**
1. Create/update TypeORM Entity
2. Create migration if schema changed
3. Create/update DTOs with class-validator decorators
4. Implement Service method with error handling
5. Implement Controller route
6. Register in Module
7. Write unit tests for Service
8. Write integration test for Controller
9. Update Swagger documentation (`@ApiOperation`, `@ApiResponse`)

**Frontend:**
1. Add TypeScript interface to `src/models/`
2. Add API call function to `src/services/api/`
3. Create custom hook in `src/controllers/`
4. Build component(s) in `src/components/`
5. Compose into page in `src/pages/`
6. Add route to `src/router/routes.ts`

---

## 9. External API Rate Limits & Limits

| API | Rate Limit | Notes |
|---|---|---|
| OpenAI GPT-4 Vision | Varies by tier | Add retry with exponential backoff |
| Google Gemini | 60 requests/min (free) | Add queue for bulk processing |
| OpenCorporates | 500/day (free tier) | Cache results aggressively |
| Resend | 100/day (free tier) | Log every send attempt |
| SendGrid | 100/day (free tier) | Log every send attempt |

---

## 10. Environment Variable Reference

| Variable | Required | Description |
|---|---|---|
| `NODE_ENV` | Yes | development / production |
| `PORT` | Yes | Backend port (default 3001) |
| `DB_HOST` | Yes | PostgreSQL host |
| `DB_PORT` | Yes | PostgreSQL port |
| `DB_NAME` | Yes | Database name |
| `DB_USER` | Yes | Database user |
| `DB_PASSWORD` | Yes | Database password |
| `AI_PROVIDER` | Yes | openai or gemini |
| `OPENAI_API_KEY` | If AI_PROVIDER=openai | OpenAI API key |
| `GEMINI_API_KEY` | If AI_PROVIDER=gemini | Google Gemini API key |
| `OPENCORPORATES_API_KEY` | Yes | OpenCorporates API token |
| `EMAIL_PROVIDER` | Yes | resend / sendgrid / brevo |
| `RESEND_API_KEY` | If EMAIL_PROVIDER=resend | Resend API key |
| `SENDGRID_API_KEY` | If EMAIL_PROVIDER=sendgrid | SendGrid API key |
| `EMAIL_FROM` | Yes | Sender email address |
| `STORAGE_TYPE` | Yes | local or s3 |
| `UPLOAD_DIR` | If STORAGE_TYPE=local | Local upload path |
| `VITE_API_BASE_URL` | Yes (frontend) | Backend API URL |

---

## 11. Code Quality Standards

- TypeScript strict mode enabled (`"strict": true` in tsconfig)
- No `any` types without explicit comment justification
- All functions must have explicit return type annotations
- Maximum function length: 50 lines (split if longer)
- No unused variables or imports (ESLint enforced)
- Consistent naming: camelCase for variables/functions, PascalCase for classes/types

---

*AGENTS.md v1.0 | AI-Powered Vendor Verification Workspace*
