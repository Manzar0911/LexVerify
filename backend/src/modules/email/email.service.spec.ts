import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { EmailService } from './email.service';
import { EmailLog, EmailLogStatus } from './email-log.entity';
import { VendorService } from '../vendor/vendor.service';
import { DocumentService } from '../document/document.service';
import { ConfigService } from '@nestjs/config';
import { DocumentStatus, DocumentType } from '../document/entities/document.enums';
import { VendorStatus } from '../vendor/entities/vendor-status.enum';
import { Vendor } from '../vendor/entities/vendor.entity';

const mockVendor: Partial<Vendor> = {
  id: 'vendor-uuid',
  companyName: 'ABC Corp',
  contactPerson: 'John Doe',
  email: 'john@abc.com',
  phone: '9876543210',
  address: '123 Main St',
  registrationNumber: 'REG123',
  status: VendorStatus.DRAFT,
  currentVersion: 1,
  createdAt: new Date(),
  updatedAt: new Date(),
};

const mockEmailLogRepo = () => ({
  create: jest.fn(),
  save: jest.fn(),
  find: jest.fn(),
});

const mockVendorService = { findById: jest.fn() };
const mockDocumentService = { getDocumentChecklist: jest.fn() };
const mockConfigService = {
  get: jest.fn((key: string) => {
    const config: Record<string, string> = {
      RESEND_API_KEY: 're_test_key',
      EMAIL_FROM: 'noreply@vendorverify.com',
    };
    return config[key];
  }),
};

jest.mock('resend', () => ({
  Resend: jest.fn().mockImplementation(() => ({
    emails: {
      send: jest.fn().mockResolvedValue({ id: 'resend-email-id' }),
    },
  })),
}));

describe('EmailService', () => {
  let service: EmailService;
  let emailLogRepo: ReturnType<typeof mockEmailLogRepo>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EmailService,
        { provide: getRepositoryToken(EmailLog), useFactory: mockEmailLogRepo },
        { provide: VendorService, useValue: mockVendorService },
        { provide: DocumentService, useValue: mockDocumentService },
        { provide: ConfigService, useValue: mockConfigService },
      ],
    }).compile();

    service = module.get<EmailService>(EmailService);
    emailLogRepo = module.get(getRepositoryToken(EmailLog));
  });

  afterEach(() => jest.clearAllMocks());

  describe('sendMissingDocumentEmail()', () => {
    it('should NOT send email when no documents are missing', async () => {
      mockVendorService.findById.mockResolvedValue(mockVendor);
      mockDocumentService.getDocumentChecklist.mockResolvedValue([
        { type: DocumentType.REGISTRATION_CERTIFICATE, label: 'Company Registration', status: DocumentStatus.AVAILABLE },
        { type: DocumentType.GST_CERTIFICATE, label: 'GST Certificate', status: DocumentStatus.AVAILABLE },
        { type: DocumentType.BANK_DOCUMENT, label: 'Bank Document', status: DocumentStatus.AVAILABLE },
      ]);

      const result = await service.sendMissingDocumentEmail('vendor-uuid');

      expect(result.sent).toBe(false);
      expect(result.missingDocs).toHaveLength(0);
    });

    it('should send email when there are missing documents', async () => {
      mockVendorService.findById.mockResolvedValue(mockVendor);
      mockDocumentService.getDocumentChecklist.mockResolvedValue([
        { type: DocumentType.REGISTRATION_CERTIFICATE, label: 'Company Registration', status: DocumentStatus.AVAILABLE },
        { type: DocumentType.GST_CERTIFICATE, label: 'GST Certificate', status: DocumentStatus.MISSING },
        { type: DocumentType.BANK_DOCUMENT, label: 'Bank Document', status: DocumentStatus.MISSING },
      ]);

      const mockLog: Partial<EmailLog> = {
        id: 'log-uuid',
        vendorId: 'vendor-uuid',
        recipientEmail: 'john@abc.com',
        subject: 'Action Required: Missing Documents - ABC Corp',
        body: 'email body',
        status: EmailLogStatus.SENT,
        providerMessageId: 'resend-email-id',
        sentAt: new Date(),
      };
      emailLogRepo.create.mockReturnValue(mockLog);
      emailLogRepo.save.mockResolvedValue(mockLog);

      const result = await service.sendMissingDocumentEmail('vendor-uuid');

      expect(result.missingDocs).toHaveLength(2);
      expect(emailLogRepo.save).toHaveBeenCalled();
    });

    it('should NOT throw when email send fails — failures are logged silently', async () => {
      mockVendorService.findById.mockResolvedValue(mockVendor);
      mockDocumentService.getDocumentChecklist.mockResolvedValue([
        { type: DocumentType.REGISTRATION_CERTIFICATE, label: 'Company Registration', status: DocumentStatus.MISSING },
        { type: DocumentType.GST_CERTIFICATE, label: 'GST Certificate', status: DocumentStatus.AVAILABLE },
        { type: DocumentType.BANK_DOCUMENT, label: 'Bank Document', status: DocumentStatus.AVAILABLE },
      ]);

      emailLogRepo.create.mockReturnValue({});
      emailLogRepo.save.mockResolvedValue({});

      await expect(
        service.sendMissingDocumentEmail('vendor-uuid'),
      ).resolves.not.toThrow();
    });

    it('should always call emailLogRepo.save regardless of email success or failure', async () => {
      mockVendorService.findById.mockResolvedValue(mockVendor);
      mockDocumentService.getDocumentChecklist.mockResolvedValue([
        { type: DocumentType.REGISTRATION_CERTIFICATE, label: 'Company Registration', status: DocumentStatus.MISSING },
        { type: DocumentType.GST_CERTIFICATE, label: 'GST Certificate', status: DocumentStatus.AVAILABLE },
        { type: DocumentType.BANK_DOCUMENT, label: 'Bank Document', status: DocumentStatus.AVAILABLE },
      ]);

      emailLogRepo.create.mockReturnValue({});
      emailLogRepo.save.mockResolvedValue({});

      await service.sendMissingDocumentEmail('vendor-uuid');

      expect(emailLogRepo.save).toHaveBeenCalled();
    });
  });
});
