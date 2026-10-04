# Code Style Guide
# AI-Powered Vendor Verification Workspace

---

## 1. Overview

This guide defines the coding standards and conventions for the AI-Powered Vendor Verification Workspace. Both the **React frontend** and **NestJS backend** are written in **TypeScript**. Consistency in code style ensures readability, maintainability, and ease of collaboration.

---

## 2. General Rules

### 2.1 Language

- All source files use **TypeScript** (`.ts` / `.tsx`)
- No plain `.js` files in the `src/` directory
- TypeScript **strict mode** is enabled in `tsconfig.json`

### 2.2 Formatting (Prettier)

All code is auto-formatted with **Prettier**. The config (`.prettierrc`):

```json
{
  "printWidth": 100,
  "tabWidth": 2,
  "useTabs": false,
  "semi": true,
  "singleQuote": true,
  "trailingComma": "all",
  "bracketSpacing": true,
  "arrowParens": "always",
  "endOfLine": "lf"
}
```

### 2.3 Linting (ESLint)

ESLint enforces code quality rules. Key rules:

```json
{
  "rules": {
    "no-unused-vars": "error",
    "no-explicit-any": "warn",
    "@typescript-eslint/explicit-function-return-type": "warn",
    "no-console": "warn",
    "prefer-const": "error",
    "no-var": "error"
  }
}
```

### 2.4 Editor Configuration (`.editorconfig`)

```ini
root = true

[*]
indent_style = space
indent_size = 2
end_of_line = lf
charset = utf-8
trim_trailing_whitespace = true
insert_final_newline = true
```

---

## 3. Naming Conventions

### 3.1 Files

| Type | Convention | Example |
|---|---|---|
| React Component | PascalCase + `.tsx` | `VendorForm.tsx` |
| React Page | PascalCase + `Page.tsx` | `VendorDetailPage.tsx` |
| Custom Hook | camelCase + `use` prefix | `useVendorController.ts` |
| Service (backend) | camelCase + `.service.ts` | `vendor.service.ts` |
| Controller (backend) | camelCase + `.controller.ts` | `vendor.controller.ts` |
| Module (backend) | camelCase + `.module.ts` | `vendor.module.ts` |
| Entity (backend) | camelCase + `.entity.ts` | `vendor.entity.ts` |
| DTO (backend) | camelCase + `.dto.ts` | `create-vendor.dto.ts` |
| API service (frontend) | camelCase + `.api.ts` | `vendor.api.ts` |
| Model/Interface | camelCase + `.model.ts` | `vendor.model.ts` |
| Utility | camelCase + `.util.ts` | `string.util.ts` |
| Test file | same name + `.spec.ts` | `vendor.service.spec.ts` |
| CSS Module | PascalCase + `.module.css` | `VendorForm.module.css` |

### 3.2 Variables and Functions

```typescript
// Variables: camelCase
const vendorList: Vendor[] = [];
let isLoading: boolean = false;

// Constants: SCREAMING_SNAKE_CASE
const MAX_FILE_SIZE = 10 * 1024 * 1024;
const ALLOWED_MIME_TYPES = ['application/pdf', 'image/png'];

// Functions: camelCase, verb-first
function createVendor(data: CreateVendorDto): Promise<Vendor> { ... }
function validateIFSC(code: string): boolean { ... }
function handleFileUpload(file: Express.Multer.File): void { ... }

// Boolean variables: is/has/can/should prefix
const isVerified: boolean = true;
const hasDocuments: boolean = false;
const canEdit: boolean = true;
```

### 3.3 Classes and Interfaces

```typescript
// Classes: PascalCase
class VendorService { ... }
class AIExtractor { ... }

// Interfaces: PascalCase (no "I" prefix)
interface Vendor { ... }
interface ExtractedField { ... }
interface VerificationResult { ... }

// Types: PascalCase
type VendorStatus = 'Draft' | 'Under Review' | 'Action Required' | 'Approved' | 'Rejected';
type DocumentType = 'registration_certificate' | 'gst_certificate' | 'bank_document';
```

### 3.4 Enums

```typescript
// NestJS backend: use TypeScript enums
export enum VendorStatus {
  DRAFT = 'Draft',
  UNDER_REVIEW = 'Under Review',
  ACTION_REQUIRED = 'Action Required',
  APPROVED = 'Approved',
  REJECTED = 'Rejected',
}

export enum TaskPriority {
  LOW = 'Low',
  MEDIUM = 'Medium',
  HIGH = 'High',
}
```

### 3.5 React Component Props

```typescript
// Props interface: ComponentNameProps
interface VendorFormProps {
  vendorId?: string;
  onSuccess: (vendor: Vendor) => void;
  isReadOnly?: boolean;
}

const VendorForm: React.FC<VendorFormProps> = ({ vendorId, onSuccess, isReadOnly = false }) => {
  // ...
};
```

---

## 4. TypeScript Standards

### 4.1 Strict Typing

```typescript
// CORRECT: explicit types
function formatDate(date: Date): string {
  return date.toISOString();
}

// WRONG: implicit any
function formatDate(date) {
  return date.toISOString();
}
```

### 4.2 No `any` Type

```typescript
// WRONG
const response: any = await aiService.extract(file);

// CORRECT: define a proper type
interface AIExtractionResponse {
  companyName: string | null;
  registrationNumber: string | null;
  gstNumber: string | null;
  address: string | null;
  bankAccountNumber: string | null;
  ifscCode: string | null;
}
const response: AIExtractionResponse = await aiService.extract(file);
```

If `any` is absolutely unavoidable, add a comment explaining why:

```typescript
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const rawApiResponse: any = await externalApi.fetch(); // API has dynamic shape
```

### 4.3 Optional Chaining and Nullish Coalescing

```typescript
// CORRECT
const companyName = vendor?.details?.companyName ?? 'Unknown';
const email = extracted?.email ?? null;

// WRONG
const companyName = vendor && vendor.details && vendor.details.companyName ? vendor.details.companyName : 'Unknown';
```

### 4.4 Type Assertions

```typescript
// Use 'as' sparingly, only when type is verified
const element = document.getElementById('root') as HTMLElement;

// Never use non-null assertion (!) without being certain
// WRONG: dangerous if null
const element = document.getElementById('root')!;
```

---

## 5. Backend (NestJS) Conventions

### 5.1 Controller Structure

```typescript
@Controller('vendors')
@UseGuards(AuthGuard)         // Apply guards at class level
export class VendorController {
  constructor(private readonly vendorService: VendorService) {}

  @Get()
  @ApiOperation({ summary: 'List all vendors' })
  async findAll(): Promise<ApiResponse<Vendor[]>> {
    return this.vendorService.findAll();
  }

  @Post()
  @ApiOperation({ summary: 'Create a vendor' })
  async create(
    @Body() createVendorDto: CreateVendorDto
  ): Promise<ApiResponse<Vendor>> {
    return this.vendorService.create(createVendorDto);
  }
}
```

**Rules:**
- Controller methods are `async` and return typed Promises
- No business logic in controllers - only call service methods
- All controllers have Swagger `@ApiOperation` and `@ApiResponse` decorators
- Use `@Body()`, `@Param()`, `@Query()` decorators explicitly

### 5.2 Service Structure

```typescript
@Injectable()
export class VendorService {
  constructor(
    @InjectRepository(Vendor)
    private readonly vendorRepository: Repository<Vendor>,
    private readonly versionHistoryService: VersionHistoryService,
    private readonly workflowService: WorkflowService,
  ) {}

  async create(dto: CreateVendorDto): Promise<Vendor> {
    try {
      const vendor = this.vendorRepository.create({
        ...dto,
        status: VendorStatus.DRAFT,
      });
      const saved = await this.vendorRepository.save(vendor);
      await this.versionHistoryService.createEntry(saved.id, null, saved, 'system');
      return saved;
    } catch (error) {
      throw new InternalServerErrorException('Failed to create vendor');
    }
  }
}
```

**Rules:**
- All service methods have try/catch
- Throw NestJS built-in exceptions (`NotFoundException`, `BadRequestException`, etc.)
- Never throw raw `Error` objects from services
- Constructor injection only (no property injection)

### 5.3 Entity Structure (TypeORM)

```typescript
@Entity('vendors')
export class Vendor {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 255 })
  companyName: string;

  @Column({ type: 'enum', enum: VendorStatus, default: VendorStatus.DRAFT })
  status: VendorStatus;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Relations
  @OneToMany(() => Document, (doc) => doc.vendor)
  documents: Document[];
}
```

**Rules:**
- Always use UUID primary keys (`@PrimaryGeneratedColumn('uuid')`)
- Always include `@CreateDateColumn()` and `@UpdateDateColumn()`
- Use snake_case for the actual database column name, camelCase for the TypeScript property
- Always define the relation on both sides

### 5.4 DTO Structure

```typescript
export class CreateVendorDto {
  @ApiProperty({ example: 'ABC Technologies Pvt Ltd' })
  @IsString()
  @MinLength(2)
  @MaxLength(255)
  companyName: string;

  @ApiProperty({ example: 'contact@abc.com' })
  @IsEmail()
  email: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @Matches(/^[A-Z]{4}0[A-Z0-9]{6}$/)
  ifscCode?: string;
}
```

**Rules:**
- Every DTO property has `@ApiProperty` or `@ApiPropertyOptional` for Swagger docs
- Every DTO property has at minimum one `class-validator` decorator
- Optional fields use `@IsOptional()` combined with the type decorator

### 5.5 Module Structure

```typescript
@Module({
  imports: [
    TypeOrmModule.forFeature([Vendor]),
    forwardRef(() => VersionHistoryModule), // use forwardRef for circular deps
  ],
  controllers: [VendorController],
  providers: [VendorService],
  exports: [VendorService],               // export if used by other modules
})
export class VendorModule {}
```

---

## 6. Frontend (React) Conventions

### 6.1 Component Structure

```typescript
// VendorForm.tsx
import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { vendorSchema, VendorFormData } from '../../models/vendor.model';
import { Button } from '../common/Button';
import styles from './VendorForm.module.css';

interface VendorFormProps {
  initialData?: Partial<VendorFormData>;
  onSubmit: (data: VendorFormData) => Promise<void>;
  isLoading?: boolean;
}

export const VendorForm: React.FC<VendorFormProps> = ({
  initialData,
  onSubmit,
  isLoading = false,
}) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<VendorFormData>({
    resolver: zodResolver(vendorSchema),
    defaultValues: initialData,
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className={styles.form}>
      {/* form fields */}
    </form>
  );
};
```

**Rules:**
- Components are function components with explicit `React.FC<PropsType>` type
- Named exports (not default exports) for components
- Props interface defined above the component
- Props destructured in function signature with default values

### 6.2 Custom Hook Structure

```typescript
// useVendorController.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { vendorApi } from '../services/api/vendor.api';
import { useUIStore } from '../store/uiStore';

export function useVendorController(vendorId?: string) {
  const queryClient = useQueryClient();
  const { addToast } = useUIStore();

  const { data: vendor, isLoading, error } = useQuery({
    queryKey: ['vendor', vendorId],
    queryFn: () => vendorApi.getById(vendorId!),
    enabled: !!vendorId,
  });

  const createMutation = useMutation({
    mutationFn: vendorApi.create,
    onSuccess: (newVendor) => {
      queryClient.invalidateQueries({ queryKey: ['vendors'] });
      addToast({ type: 'success', message: 'Vendor created successfully' });
    },
    onError: (error) => {
      addToast({ type: 'error', message: 'Failed to create vendor' });
    },
  });

  return {
    vendor,
    isLoading,
    error,
    createVendor: createMutation.mutate,
    isCreating: createMutation.isPending,
  };
}
```

**Rules:**
- Custom hooks always start with `use` prefix
- All API calls go through React Query (useQuery / useMutation)
- Toast notifications triggered from hooks, not components
- Hooks return named properties (not arrays) for clarity

### 6.3 API Service Structure

```typescript
// vendor.api.ts
import { axiosInstance } from './axios.instance';
import { Vendor, CreateVendorDto, UpdateVendorDto } from '../../models/vendor.model';
import { ApiResponse } from '../../models/common.model';

export const vendorApi = {
  getAll: async (): Promise<Vendor[]> => {
    const response = await axiosInstance.get<ApiResponse<Vendor[]>>('/vendors');
    return response.data.data;
  },

  getById: async (id: string): Promise<Vendor> => {
    const response = await axiosInstance.get<ApiResponse<Vendor>>(`/vendors/${id}`);
    return response.data.data;
  },

  create: async (data: CreateVendorDto): Promise<Vendor> => {
    const response = await axiosInstance.post<ApiResponse<Vendor>>('/vendors', data);
    return response.data.data;
  },
};
```

**Rules:**
- API services are plain objects (not classes) with async methods
- Always type request parameters and return values
- Extract the `data` property from the standardized API response
- No error handling in API services (handled by React Query)

---

## 7. Comments and Documentation

### 7.1 When to Comment

```typescript
// GOOD: explain WHY, not WHAT
// Fuzzy match threshold of 3 handles common typos like "Pvt Ltd" vs "Private Ltd"
const FUZZY_MATCH_THRESHOLD = 3;

// BAD: explaining the obvious
// Increment counter by 1
counter++;
```

### 7.2 JSDoc for Public APIs

```typescript
/**
 * Extracts structured data from a document using AI vision API.
 * Returns null values for fields that could not be detected.
 *
 * @param documentId - UUID of the document to extract
 * @returns ExtractedFields object with nullable field values
 * @throws InternalServerErrorException if AI API call fails after retries
 */
async extractDocument(documentId: string): Promise<ExtractedFields> {
  // ...
}
```

**Use JSDoc for:**
- Public service methods
- Public utility functions
- Complex business logic functions
- All exported hooks in frontend

### 7.3 TODO Comments

```typescript
// TODO(your-name): Replace with proper S3 integration in production
// Temporary: using local storage for now
const filePath = `./uploads/${filename}`;
```

---

## 8. Error Handling Patterns

### 8.1 Backend

```typescript
// In Services: throw typed NestJS exceptions
async findById(id: string): Promise<Vendor> {
  try {
    const vendor = await this.vendorRepository.findOne({ where: { id } });
    if (!vendor) {
      throw new NotFoundException(`Vendor with id ${id} not found`);
    }
    return vendor;
  } catch (error) {
    if (error instanceof NotFoundException) throw error; // rethrow known errors
    throw new InternalServerErrorException('Database error while fetching vendor');
  }
}
```

### 8.2 External API Calls

```typescript
async callExternalApi(): Promise<ExternalData> {
  try {
    const response = await axios.get(url, {
      timeout: 10000,  // always set timeout
      headers: { Authorization: `Token ${apiKey}` },
    });
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      if (error.response?.status === 404) throw new NotFoundException('Company not found');
      if (error.response?.status === 429) throw new TooManyRequestsException('API rate limit');
    }
    throw new ServiceUnavailableException('External API unavailable');
  }
}
```

---

## 9. Import Order

Imports must be sorted in this order (separated by blank lines):

```typescript
// 1. Node.js built-ins
import path from 'path';
import fs from 'fs';

// 2. External packages (alphabetical)
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import axios from 'axios';

// 3. Internal modules (absolute paths, alphabetical)
import { AIService } from '../ai/ai.service';
import { EmailService } from '../email/email.service';

// 4. Types / interfaces
import type { CreateVendorDto } from './dto/create-vendor.dto';
import type { Vendor } from './entities/vendor.entity';
```

---

## 10. Testing Standards

### 10.1 Test File Naming

```
vendor.service.ts        <- Implementation
vendor.service.spec.ts   <- Unit test (same directory)
vendor.controller.spec.ts
```

### 10.2 Test Structure (AAA Pattern)

```typescript
describe('VendorService', () => {
  describe('create()', () => {
    it('should create a vendor and return it with Draft status', async () => {
      // Arrange
      const dto: CreateVendorDto = { companyName: 'Test Corp', email: 'test@test.com', ... };
      mockVendorRepository.save.mockResolvedValue({ id: 'uuid-123', ...dto, status: 'Draft' });

      // Act
      const result = await vendorService.create(dto);

      // Assert
      expect(result.status).toBe('Draft');
      expect(mockVersionHistoryService.createEntry).toHaveBeenCalledOnce();
    });

    it('should throw NotFoundException when vendor does not exist', async () => {
      // Arrange
      mockVendorRepository.findOne.mockResolvedValue(null);

      // Act & Assert
      await expect(vendorService.findById('non-existent')).rejects.toThrow(NotFoundException);
    });
  });
});
```

---

## 11. Git Commit Message Convention

Format: `type(scope): short description`

| Type | Usage |
|---|---|
| `feat` | New feature |
| `fix` | Bug fix |
| `docs` | Documentation only |
| `style` | Formatting, no logic change |
| `refactor` | Code change without bug fix or feature |
| `test` | Adding or fixing tests |
| `chore` | Build process, dependency updates |

**Examples:**
```
feat(vendor): add version history restoration endpoint
fix(ai): handle null response when document is blank
docs(security): add API key rotation guidelines
test(workflow): add state transition edge case tests
chore(deps): upgrade TypeORM to 0.3.20
```

---

*Code Style Guide v1.0 | AI-Powered Vendor Verification Workspace*
