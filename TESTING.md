# Testing Guide
# AI-Powered Vendor Verification Workspace

---

## 1. Overview

This document defines the testing strategy, tooling, and conventions for the AI-Powered Vendor Verification Workspace. It covers both **backend (NestJS)** and **frontend (React)** testing.

---

## 2. Testing Philosophy

| Principle | Description |
|---|---|
| **Test behavior, not implementation** | Tests verify what a function does, not how it does it internally |
| **Isolate external dependencies** | Mock AI APIs, email services, and OpenCorporates API in all unit tests |
| **Test edge cases first** | Always test: empty input, null values, API failures, invalid formats |
| **Fast feedback loop** | Unit tests must run in under 10 seconds total |
| **Deterministic** | Tests must not depend on external services or time |

---

## 3. Testing Stack

### 3.1 Backend (NestJS)

| Tool | Purpose |
|---|---|
| Jest | Test runner, assertion library |
| `@nestjs/testing` | NestJS test module utilities |
| `supertest` | HTTP integration testing |
| `ts-jest` | TypeScript support for Jest |
| Mock Repositories | TypeORM repo mocking |

### 3.2 Frontend (React)

| Tool | Purpose |
|---|---|
| Vitest | Test runner (Vite-native, Jest-compatible) |
| React Testing Library | Component rendering & interaction |
| `@testing-library/user-event` | Simulating user interactions |
| `msw` (Mock Service Worker) | API mocking in tests |
| `vi.fn()` | Function mocking |

---

## 4. Test Types

### 4.1 Unit Tests

Test individual functions/classes in isolation with all dependencies mocked.

**What to unit test:**
- All Service methods (backend)
- Utility functions
- Validation functions
- Workflow state machine transitions
- Custom hooks (frontend)
- AI extraction parsing logic

### 4.2 Integration Tests

Test multiple components working together, with only external services mocked.

**What to integration test:**
- Controller + Service + Repository (NestJS)
- Complete API endpoint request/response cycle
- Database operations (using test database)

### 4.3 End-to-End Tests (Optional for Assessment)

Full workflow testing from frontend to backend. Optional given the 8-hour constraint.

---

## 5. Backend Testing

### 5.1 Test File Location

```
backend/
  src/
    modules/
      vendor/
        vendor.service.ts
        vendor.service.spec.ts       <- Unit test for service
        vendor.controller.ts
        vendor.controller.spec.ts    <- Integration test for controller
      ai/
        ai.service.spec.ts
      workflow/
        workflow.service.spec.ts
      email/
        email.service.spec.ts
```

### 5.2 Service Unit Test Template

```typescript
// vendor.service.spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NotFoundException, InternalServerErrorException } from '@nestjs/common';
import { VendorService } from './vendor.service';
import { Vendor } from './entities/vendor.entity';
import { VersionHistoryService } from '../version-history/version-history.service';
import { WorkflowService } from '../workflow/workflow.service';
import { VendorStatus } from './enums/vendor-status.enum';

// Mock factory for TypeORM repository
const mockRepository = () => ({
  create: jest.fn(),
  save: jest.fn(),
  findOne: jest.fn(),
  find: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
});

describe('VendorService', () => {
  let service: VendorService;
  let vendorRepository: jest.Mocked<Repository<Vendor>>;
  let versionHistoryService: jest.Mocked<VersionHistoryService>;
  let workflowService: jest.Mocked<WorkflowService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        VendorService,
        { provide: getRepositoryToken(Vendor), useFactory: mockRepository },
        { provide: VersionHistoryService, useValue: { createEntry: jest.fn() } },
        { provide: WorkflowService, useValue: { checkAndAutoTransition: jest.fn() } },
      ],
    }).compile();

    service = module.get<VendorService>(VendorService);
    vendorRepository = module.get(getRepositoryToken(Vendor));
    versionHistoryService = module.get(VersionHistoryService);
    workflowService = module.get(WorkflowService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  // -----------------------------------------------------------------------
  // create()
  // -----------------------------------------------------------------------
  describe('create()', () => {
    const createDto = {
      companyName: 'ABC Corp',
      contactPerson: 'John Doe',
      email: 'john@abc.com',
      phone: '9876543210',
      address: '123 Main St',
      registrationNumber: 'REG123',
    };

    it('should create a vendor with Draft status', async () => {
      const mockVendor = { id: 'uuid-1', ...createDto, status: VendorStatus.DRAFT };
      vendorRepository.create.mockReturnValue(mockVendor as any);
      vendorRepository.save.mockResolvedValue(mockVendor as any);

      const result = await service.create(createDto as any);

      expect(vendorRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({ status: VendorStatus.DRAFT }),
      );
      expect(result.status).toBe(VendorStatus.DRAFT);
    });

    it('should call versionHistoryService.createEntry after creation', async () => {
      const mockVendor = { id: 'uuid-1', ...createDto, status: VendorStatus.DRAFT };
      vendorRepository.create.mockReturnValue(mockVendor as any);
      vendorRepository.save.mockResolvedValue(mockVendor as any);

      await service.create(createDto as any);

      expect(versionHistoryService.createEntry).toHaveBeenCalledWith(
        'uuid-1', null, mockVendor, 'system'
      );
    });

    it('should throw InternalServerErrorException on database error', async () => {
      vendorRepository.save.mockRejectedValue(new Error('DB connection failed'));

      await expect(service.create(createDto as any)).rejects.toThrow(
        InternalServerErrorException,
      );
    });
  });

  // -----------------------------------------------------------------------
  // findById()
  // -----------------------------------------------------------------------
  describe('findById()', () => {
    it('should return the vendor when found', async () => {
      const mockVendor = { id: 'uuid-1', companyName: 'ABC Corp' };
      vendorRepository.findOne.mockResolvedValue(mockVendor as any);

      const result = await service.findById('uuid-1');

      expect(vendorRepository.findOne).toHaveBeenCalledWith({ where: { id: 'uuid-1' } });
      expect(result).toEqual(mockVendor);
    });

    it('should throw NotFoundException when vendor does not exist', async () => {
      vendorRepository.findOne.mockResolvedValue(null);

      await expect(service.findById('non-existent-id')).rejects.toThrow(NotFoundException);
    });
  });
});
```

### 5.3 Controller Integration Test Template

```typescript
// vendor.controller.spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { VendorModule } from './vendor.module';
import { TypeOrmModule } from '@nestjs/typeorm';

describe('VendorController (Integration)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        TypeOrmModule.forRoot({
          type: 'sqlite',        // use in-memory SQLite for tests
          database: ':memory:',
          autoLoadEntities: true,
          synchronize: true,
        }),
        VendorModule,
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('POST /vendors', () => {
    it('should create a vendor and return 201', async () => {
      const payload = {
        companyName: 'ABC Corp',
        contactPerson: 'John Doe',
        email: 'john@abc.com',
        phone: '9876543210',
        address: '123 Main St',
        registrationNumber: 'REG123',
      };

      const response = await request(app.getHttpServer())
        .post('/vendors')
        .send(payload)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.status).toBe('Draft');
    });

    it('should return 400 when required fields are missing', async () => {
      await request(app.getHttpServer())
        .post('/vendors')
        .send({ companyName: 'Only Name' })
        .expect(400);
    });

    it('should return 400 for invalid email format', async () => {
      await request(app.getHttpServer())
        .post('/vendors')
        .send({ companyName: 'ABC', email: 'not-an-email', ... })
        .expect(400);
    });
  });

  describe('GET /vendors/:id', () => {
    it('should return 404 for non-existent vendor', async () => {
      await request(app.getHttpServer())
        .get('/vendors/non-existent-uuid')
        .expect(404);
    });
  });
});
```

### 5.4 AI Service Test Template

```typescript
// ai.service.spec.ts
describe('AIService', () => {
  let service: AIService;
  let mockOpenAI: jest.Mocked<OpenAI>;

  describe('extractDocument()', () => {
    it('should return extracted fields from a valid document', async () => {
      mockOpenAI.chat.completions.create.mockResolvedValue({
        choices: [{
          message: {
            content: JSON.stringify({
              companyName: 'ABC Corp',
              registrationNumber: 'REG123',
              gstNumber: null,
              address: '123 Main St',
              bankAccountNumber: null,
              ifscCode: null,
            })
          }
        }]
      } as any);

      const result = await service.extractDocument('doc-uuid-1');

      expect(result.companyName).toBe('ABC Corp');
      expect(result.gstNumber).toBeNull();
    });

    it('should return all null fields when AI returns empty JSON', async () => {
      mockOpenAI.chat.completions.create.mockResolvedValue({
        choices: [{ message: { content: '{}' } }]
      } as any);

      const result = await service.extractDocument('doc-uuid-1');

      expect(result.companyName).toBeNull();
    });

    it('should throw InternalServerErrorException when AI API fails', async () => {
      mockOpenAI.chat.completions.create.mockRejectedValue(new Error('API Error'));

      await expect(service.extractDocument('doc-uuid-1')).rejects.toThrow(
        InternalServerErrorException,
      );
    });

    it('should handle invalid JSON response from AI gracefully', async () => {
      mockOpenAI.chat.completions.create.mockResolvedValue({
        choices: [{ message: { content: 'not valid json' } }]
      } as any);

      await expect(service.extractDocument('doc-uuid-1')).rejects.toThrow();
    });
  });
});
```

### 5.5 Workflow Service Tests

```typescript
// workflow.service.spec.ts
describe('WorkflowService', () => {
  describe('transitionStatus()', () => {
    const validTransitions = [
      ['Draft', 'Under Review'],
      ['Under Review', 'Action Required'],
      ['Under Review', 'Approved'],
      ['Under Review', 'Rejected'],
      ['Action Required', 'Under Review'],
      ['Action Required', 'Approved'],
      ['Action Required', 'Rejected'],
    ];

    test.each(validTransitions)(
      'should allow transition from %s to %s',
      async (from, to) => {
        await expect(service.transitionStatus(vendorId, from, to)).resolves.not.toThrow();
      }
    );

    it('should throw BadRequestException for invalid transition from Draft to Approved', async () => {
      await expect(service.transitionStatus(vendorId, 'Draft', 'Approved')).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should auto-create a task when transitioning to Action Required', async () => {
      await service.transitionStatus(vendorId, 'Under Review', 'Action Required');

      expect(mockTaskRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({
          priority: 'Medium',
          status: 'Pending',
        })
      );
    });

    it('should log every transition in workflow_logs', async () => {
      await service.transitionStatus(vendorId, 'Draft', 'Under Review');

      expect(mockWorkflowLogRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({
          fromStatus: 'Draft',
          toStatus: 'Under Review',
        })
      );
    });
  });
});
```

### 5.6 Email Service Tests

```typescript
// email.service.spec.ts
describe('EmailService', () => {
  describe('sendMissingDocumentEmail()', () => {
    it('should send email with correct content', async () => {
      mockResendClient.emails.send.mockResolvedValue({ id: 'email-123' });

      await service.sendMissingDocumentEmail(vendorId);

      expect(mockResendClient.emails.send).toHaveBeenCalledWith(
        expect.objectContaining({
          to: 'vendor@company.com',
          subject: expect.stringContaining('Missing Documents'),
        })
      );
    });

    it('should log the email send attempt regardless of success/failure', async () => {
      mockResendClient.emails.send.mockRejectedValue(new Error('SMTP Error'));

      // Should not throw - email failures must not block workflow
      await expect(service.sendMissingDocumentEmail(vendorId)).resolves.not.toThrow();

      expect(mockEmailLogRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({ status: 'failed' })
      );
    });

    it('should NOT send email when no documents are missing', async () => {
      mockDocumentRepository.find.mockResolvedValue([]); // no missing docs

      await service.sendMissingDocumentEmail(vendorId);

      expect(mockResendClient.emails.send).not.toHaveBeenCalled();
    });
  });
});
```

---

## 6. Frontend Testing

### 6.1 Test File Location

```
frontend/
  src/
    components/
      vendor/
        VendorForm.tsx
        VendorForm.test.tsx         <- Component test
      common/
        Button.tsx
        Button.test.tsx
    controllers/
      useVendorController.test.ts   <- Hook test
    services/
      api/
        vendor.api.test.ts          <- API function test
    utils/
      validation.util.test.ts       <- Utility test
```

### 6.2 Component Test Template

```typescript
// VendorForm.test.tsx
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';
import { VendorForm } from './VendorForm';

describe('VendorForm', () => {
  const mockOnSubmit = vi.fn();

  beforeEach(() => {
    mockOnSubmit.mockClear();
  });

  it('renders all required form fields', () => {
    render(<VendorForm onSubmit={mockOnSubmit} />);

    expect(screen.getByLabelText(/company name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/phone/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/gst number/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /save/i })).toBeInTheDocument();
  });

  it('shows validation error for invalid email', async () => {
    render(<VendorForm onSubmit={mockOnSubmit} />);

    const emailInput = screen.getByLabelText(/email/i);
    await userEvent.type(emailInput, 'not-an-email');
    fireEvent.blur(emailInput);

    await waitFor(() => {
      expect(screen.getByText(/invalid email/i)).toBeInTheDocument();
    });
  });

  it('calls onSubmit with form data when form is valid', async () => {
    render(<VendorForm onSubmit={mockOnSubmit} />);

    await userEvent.type(screen.getByLabelText(/company name/i), 'ABC Corp');
    await userEvent.type(screen.getByLabelText(/email/i), 'test@abc.com');
    // ... fill all required fields

    await userEvent.click(screen.getByRole('button', { name: /save/i }));

    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalledWith(
        expect.objectContaining({ companyName: 'ABC Corp' })
      );
    });
  });

  it('does not call onSubmit when required fields are empty', async () => {
    render(<VendorForm onSubmit={mockOnSubmit} />);

    await userEvent.click(screen.getByRole('button', { name: /save/i }));

    expect(mockOnSubmit).not.toHaveBeenCalled();
  });

  it('populates fields with initialData when provided', () => {
    render(
      <VendorForm
        onSubmit={mockOnSubmit}
        initialData={{ companyName: 'Pre-filled Corp' }}
      />
    );

    expect(screen.getByDisplayValue('Pre-filled Corp')).toBeInTheDocument();
  });
});
```

### 6.3 API Mock Setup (MSW)

```typescript
// src/mocks/handlers.ts
import { http, HttpResponse } from 'msw';
import { API_BASE_URL } from '../config';

export const handlers = [
  http.get(`${API_BASE_URL}/vendors`, () => {
    return HttpResponse.json({
      success: true,
      data: [
        { id: '1', companyName: 'ABC Corp', status: 'Draft' },
      ],
    });
  }),

  http.post(`${API_BASE_URL}/vendors`, async ({ request }) => {
    const body = await request.json();
    return HttpResponse.json({
      success: true,
      data: { id: 'new-uuid', ...body, status: 'Draft' },
    }, { status: 201 });
  }),

  http.post(`${API_BASE_URL}/ai/extract/:documentId`, ({ params }) => {
    return HttpResponse.json({
      success: true,
      data: {
        companyName: 'ABC Corp',
        registrationNumber: 'REG123',
        gstNumber: null,
        address: '123 Main St',
        bankAccountNumber: null,
        ifscCode: null,
      },
    });
  }),
];
```

---

## 7. Test Coverage Requirements

### Minimum Coverage Targets

| Layer | Target | Priority |
|---|---|---|
| Service (backend) | 85% | Critical |
| Controller (backend) | 70% | High |
| Workflow state machine | 100% of transitions | Critical |
| AI extraction parsing | 90% | High |
| Email service | 80% | High |
| React components | 60% | Medium |
| Custom hooks | 75% | High |
| Utility functions | 95% | High |

### Running Coverage

```bash
# Backend
cd backend && npm run test:cov

# Frontend
cd frontend && npm run test:coverage
```

---

## 8. Test Scripts

### Backend `package.json` scripts

```json
{
  "scripts": {
    "test": "jest",
    "test:watch": "jest --watch",
    "test:cov": "jest --coverage",
    "test:debug": "node --inspect-brk -r tsconfig-paths/register -r ts-node/register node_modules/.bin/jest --runInBand",
    "test:e2e": "jest --config ./test/jest-e2e.json"
  }
}
```

### Frontend `package.json` scripts

```json
{
  "scripts": {
    "test": "vitest",
    "test:ui": "vitest --ui",
    "test:coverage": "vitest --coverage",
    "test:run": "vitest run"
  }
}
```

---

## 9. Critical Test Scenarios by Feature

### Feature 1: Vendor Details

| Scenario | Test Type | Priority |
|---|---|---|
| Create vendor with all required fields | Unit + Integration | Critical |
| Create vendor missing required fields | Unit + Integration | Critical |
| Update vendor triggers version history | Unit | Critical |
| Invalid email format rejected | Unit | High |
| Invalid IFSC code rejected | Unit | High |

### Feature 2: Document Upload & AI Extraction

| Scenario | Test Type | Priority |
|---|---|---|
| Valid PDF upload succeeds | Integration | Critical |
| Invalid file type (exe) rejected | Unit | Critical |
| File > 10MB rejected | Unit | Critical |
| AI returns all fields extracted | Unit | Critical |
| AI returns null for missing fields | Unit | Critical |
| AI API timeout handled gracefully | Unit | Critical |
| AI returns invalid JSON handled | Unit | High |
| Cross-document comparison detects mismatch | Unit | Critical |
| Cross-document comparison detects missing field | Unit | Critical |

### Feature 3: Company Verification

| Scenario | Test Type | Priority |
|---|---|---|
| Company found - returns Verified | Unit | Critical |
| Company found with mismatch - returns Mismatch | Unit | Critical |
| Company not found (404) - returns Unable to Verify | Unit | Critical |
| API timeout - returns Unable to Verify | Unit | Critical |
| API rate limit (429) handled | Unit | High |

### Feature 4: Email Automation

| Scenario | Test Type | Priority |
|---|---|---|
| Email sent when documents missing | Unit | Critical |
| Email NOT sent when no documents missing | Unit | Critical |
| Email failure does NOT block workflow | Unit | Critical |
| Email logged on success | Unit | High |
| Email logged on failure | Unit | High |
| Email contains correct company name | Unit | High |
| Email contains correct missing doc list | Unit | High |

### Feature 5: Workflow

| Scenario | Test Type | Priority |
|---|---|---|
| All valid state transitions succeed | Unit | Critical |
| Invalid transitions return 400 | Unit | Critical |
| Transition to Action Required creates task | Unit | Critical |
| Every transition is logged | Unit | High |

### Feature 6: Version History

| Scenario | Test Type | Priority |
|---|---|---|
| Version entry created on vendor create | Unit | Critical |
| Version entry created on vendor update | Unit | Critical |
| Version history returns correct diff | Unit | Critical |
| Restoring a version creates new entry | Unit | Critical |
| Original entries never modified | Unit | Critical |

---

## 10. CI/CD Testing Integration

```yaml
# .github/workflows/test.yml (example)
name: Run Tests

on: [push, pull_request]

jobs:
  backend-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Install dependencies
        run: cd backend && npm ci
      - name: Run unit tests
        run: cd backend && npm test
      - name: Run coverage check
        run: cd backend && npm run test:cov -- --coverageThreshold='{"global":{"lines":80}}'

  frontend-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Install dependencies
        run: cd frontend && npm ci
      - name: Run tests
        run: cd frontend && npm run test:run
```

---

*Testing Guide v1.0 | AI-Powered Vendor Verification Workspace*
