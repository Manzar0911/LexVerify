# Technical Decisions Log
# AI-Powered Vendor Verification Workspace

> A chronological record of important technical decisions made during the design and planning of this project.
> **Source:** Derived from analysis of the project requirements document (`Technical Assessment Test (3).docx`) and the documentation files created during project setup.
> **Note:** This project is in pre-implementation (documentation) phase. Decisions marked "INFERRED" are based on requirements analysis. Decisions marked "EXPLICIT" are directly stated in the requirements.

---

## Decision Log

---

### Decision 001 — Frontend Framework: React + TypeScript

| Property | Value |
|---|---|
| **Date** | 2026-10-03 |
| **Status** | Decided |
| **Decision** | Use React 18 with TypeScript as the frontend framework |
| **Why** | React is the most widely adopted frontend library for internal tooling applications. TypeScript provides type safety critical for complex data structures (vendor details, extracted fields, comparison results). Chosen by the project implementer based on stack preferences and assessment requirements. |
| **Current Implementation** | Not yet implemented (documentation phase) |
| **Files/Components Affected** | All `frontend/src/` files |
| **Trade-offs** | React is a library, not a full framework — requires additional choices (routing, state management). Next.js could provide SSR and routing out of the box, but adds complexity for a single-user internal tool. |
| **Verification** | INFERRED — The requirements say "any suitable technology stack." React was chosen by the developer. |

---

### Decision 002 — Backend Framework: NestJS + TypeScript

| Property | Value |
|---|---|
| **Date** | 2026-10-03 |
| **Status** | Decided |
| **Decision** | Use NestJS 10 with TypeScript as the backend framework |
| **Why** | NestJS enforces MVC architecture natively with its module/controller/service/provider pattern. TypeScript support is first-class. Dependency injection is built-in, making unit testing (mocking services) straightforward. Built-in Swagger/OpenAPI documentation generation is critical for a well-structured submission. |
| **Current Implementation** | Not yet implemented (documentation phase) |
| **Files/Components Affected** | All `backend/src/` files |
| **Trade-offs** | Heavier boilerplate than Express.js. More setup time. However, the enforced structure aligns directly with the assessment's "code structure" evaluation criterion. |
| **Verification** | INFERRED — Requirements specify "Backend/API" without prescribing the framework. |

---

### Decision 003 — Architecture Pattern: MVC

| Property | Value |
|---|---|
| **Date** | 2026-10-03 |
| **Status** | Decided |
| **Decision** | Adopt MVC (Model-View-Controller) architecture for both frontend and backend |
| **Why** | Assessment explicitly evaluates "code structure." MVC is the most universally understood pattern that separates concerns clearly: Models (TypeORM entities), Views (React components), Controllers (NestJS controllers + React custom hooks). This makes the codebase readable to evaluators. |
| **Current Implementation** | Defined in ARCHITECTURE.md, not yet coded |
| **Files/Components Affected** | Entire project directory structure |
| **Trade-offs** | Strict MVC can feel rigid for small applications. Some logic (e.g., AI comparison) sits awkwardly in a "Service" rather than a traditional MVC layer. This is acceptable given NestJS's service layer pattern. |
| **Verification** | EXPLICIT — User requested MVC architecture |

---

### Decision 004 — Database: PostgreSQL with TypeORM

| Property | Value |
|---|---|
| **Date** | 2026-10-03 |
| **Status** | Decided |
| **Decision** | Use PostgreSQL 15 as the primary database with TypeORM as the ORM |
| **Why** | The application requires: relational data (vendors → documents → extracted_data), JSONB columns (for AI response storage and version snapshots), and ACID compliance (for workflow state transitions and append-only version history). PostgreSQL excels at all three. TypeORM provides TypeScript-native entity definitions and migration tooling compatible with NestJS. |
| **Current Implementation** | Schema defined in ARCHITECTURE.md Section 5, not yet migrated |
| **Files/Components Affected** | All `backend/src/modules/*/entities/`, migration files |
| **Trade-offs** | Prisma is an alternative ORM with better DX but less battle-tested with NestJS decorators. TypeORM has known quirks (lazy loading, migration generation). These are manageable with disciplined usage. |
| **Verification** | INFERRED — Requirements say "Database." PostgreSQL + TypeORM chosen by developer. |

---

### Decision 005 — AI Provider: OpenAI GPT-4 Vision (Primary) / Google Gemini (Fallback)

| Property | Value |
|---|---|
| **Date** | 2026-10-03 |
| **Status** | Decided |
| **Decision** | Use OpenAI GPT-4 Vision as the primary AI extraction provider with Gemini Vision as a configurable alternative |
| **Why** | GPT-4 Vision has strong document OCR and structured extraction capabilities. The `AI_PROVIDER` environment variable allows switching providers without code changes, supporting both options. This is abstracted behind an `IAIExtractor` interface in the AI module. |
| **Current Implementation** | Not yet implemented. Strategy pattern defined in AGENTS.md Section 4.3 |
| **Files/Components Affected** | `backend/src/modules/ai/ai.service.ts`, `providers/openai.extractor.ts`, `providers/gemini.extractor.ts` |
| **Trade-offs** | OpenAI has per-request costs. Gemini free tier has 60 req/min limit. For a 2-3 document assessment demo, costs are negligible. Both require API keys that must be kept secure. |
| **Verification** | INFERRED — Requirements say "Use an AI API." Specific provider choices are developer decisions. |

---

### Decision 006 — Company Verification API: OpenCorporates

| Property | Value |
|---|---|
| **Date** | 2026-10-03 |
| **Status** | Decided |
| **Decision** | Use the OpenCorporates API for company verification |
| **Why** | Requirements explicitly state "preferably OpenCorporates API." OpenCorporates provides a free tier with global company data. Supports search by company name and registration number — both required by the specification. |
| **Current Implementation** | Not yet implemented |
| **Files/Components Affected** | `backend/src/modules/verification/verification.service.ts` |
| **Trade-offs** | Free tier is limited to 500 requests/day. Results may not include all Indian companies (OpenCorporates coverage varies by jurisdiction). `Unable to Verify` is a valid handled state for this scenario. |
| **Verification** | EXPLICIT — Requirements state "preferably OpenCorporates API" |

---

### Decision 007 — Email Service: Resend (Primary)

| Property | Value |
|---|---|
| **Date** | 2026-10-03 |
| **Status** | Decided |
| **Decision** | Use Resend as the primary email service with SendGrid and Brevo as configurable alternatives |
| **Why** | Resend has a simple REST API, generous free tier (100 emails/day), and excellent developer experience. The `EMAIL_PROVIDER` env variable allows switching. Requirements explicitly list Resend, SendGrid, and Brevo as acceptable options. |
| **Current Implementation** | Not yet implemented |
| **Files/Components Affected** | `backend/src/modules/email/email.service.ts` |
| **Trade-offs** | Resend requires a verified domain for production use. For testing, sandbox mode works with any address. |
| **Verification** | EXPLICIT — Requirements list "Resend, SendGrid, Brevo or SMTP" as options |

---

### Decision 008 — Version History: Append-Only JSONB Snapshot

| Property | Value |
|---|---|
| **Date** | 2026-10-03 |
| **Status** | Decided |
| **Decision** | Store version history as append-only records with both field-level diffs AND full JSON snapshots |
| **Why** | Field-level diffs enable human-readable comparison display (required by assessment: "Show previous value / new value"). Full snapshots enable reliable restore (copy snapshot → update vendor) without complex diff-reconstruction logic. JSONB in PostgreSQL efficiently stores the snapshot. |
| **Current Implementation** | Schema defined in ARCHITECTURE.md (`vendor_versions` table), not yet implemented |
| **Files/Components Affected** | `vendor_versions` table, `version-history.service.ts` |
| **Trade-offs** | Storing full snapshots is redundant (data duplication). For a vendor record of ~10 fields, this is negligible. The reliability benefit outweighs storage cost. |
| **Verification** | INFERRED — Requirements specify "maintain version history" and "restore previous version." Snapshot approach is a developer architectural choice. |

---

### Decision 009 — Workflow State Machine: Explicit Enum with Transition Whitelist

| Property | Value |
|---|---|
| **Date** | 2026-10-03 |
| **Status** | Decided |
| **Decision** | Implement workflow as a TypeScript enum with an explicit whitelist of valid transitions |
| **Why** | Prevents invalid state transitions at the service layer before they reach the database. Makes the allowed workflow paths explicit and testable. Aligns with the assessment requirement for a "simple workflow." |
| **Current Implementation** | Defined in ARCHITECTURE.md Section 9, not yet implemented |
| **Files/Components Affected** | `workflow.service.ts`, `vendor.entity.ts` (status column) |
| **Trade-offs** | A state machine library (e.g., XState) would provide more features (guards, actions) but adds complexity. A simple whitelist map is sufficient for 5 states and ~7 transitions. |
| **Verification** | INFERRED — Requirements specify the states and transitions. Implementation approach is a developer choice. |

---

### Decision 010 — AI Document Extraction Decoupled from Upload

| Property | Value |
|---|---|
| **Date** | 2026-10-03 |
| **Status** | Decided |
| **Decision** | Document upload and AI extraction are separate operations. Upload always succeeds; extraction may fail independently. |
| **Why** | AI APIs can fail (timeout, rate limit, invalid document). If upload and extraction are coupled and extraction fails, the user loses their upload. Decoupling means the document is always saved; extraction can be retried. |
| **Current Implementation** | Defined in AGENTS.md Section 4.2, not yet implemented |
| **Files/Components Affected** | `document.service.ts`, `ai.service.ts` |
| **Trade-offs** | Creates a more complex status model for documents (uploaded but not yet extracted). Requires an extraction status field on the document or extracted_data record. Adds a "Re-extract" button to the UI. Worth the reliability improvement. |
| **Verification** | INFERRED — Requirements do not specify this. Architectural decision to improve reliability. |

---

### Decision 011 — Frontend State Management: React Query + Zustand

| Property | Value |
|---|---|
| **Date** | 2026-10-03 |
| **Status** | Decided |
| **Decision** | Use TanStack React Query for server state and Zustand for global UI state. Do not use Redux. |
| **Why** | React Query handles caching, background refetching, loading/error states for all API data — eliminating boilerplate `useEffect` patterns. Zustand provides simple, lightweight global UI state (toast queue, sidebar state) without Redux's verbosity. Both complement each other without overlap. |
| **Current Implementation** | Defined in AGENTS.md Section 5.5, not yet implemented |
| **Files/Components Affected** | All `frontend/src/controllers/*.ts` hooks, `frontend/src/store/*.ts` |
| **Trade-offs** | Two state libraries could feel like over-engineering for a small app. However, the distinction (server state vs. UI state) is philosophically correct and makes the codebase cleaner. |
| **Verification** | INFERRED — Requirements do not prescribe frontend state management. Developer architectural choice. |

---

### Decision 012 — File Storage: Local Filesystem (with S3 Flag)

| Property | Value |
|---|---|
| **Date** | 2026-10-03 |
| **Status** | Decided |
| **Decision** | Use local filesystem for file storage during development/assessment. Abstract storage behind a configurable `STORAGE_TYPE` env variable to support S3 in production. |
| **Why** | AWS S3 requires additional AWS credentials and configuration. For an 8-hour assessment, local storage is sufficient. The `STORAGE_TYPE` abstraction allows future production use without code changes. |
| **Current Implementation** | Defined in ARCHITECTURE.md and .env template, not yet implemented |
| **Files/Components Affected** | Multer configuration, `document.service.ts` |
| **Trade-offs** | Local storage is not suitable for multi-server production deployments. Files are lost on server restart if not in a persistent volume. Acceptable for assessment context. |
| **Verification** | INFERRED — Requirements say "file storage" without specifying the mechanism. |

---

*Decisions Log v1.0 | Created: 2026-10-03 | All decisions are from design/planning phase — no source code exists*
