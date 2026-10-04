import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { NotFoundException, InternalServerErrorException } from '@nestjs/common';
import { VendorService } from './vendor.service';
import { Vendor } from './entities/vendor.entity';
import { VendorStatus } from './entities/vendor-status.enum';
import { VersionHistoryService } from '../version-history/version-history.service';

const mockRepo = () => ({
  create: jest.fn(),
  save: jest.fn(),
  findOne: jest.fn(),
  find: jest.fn(),
  remove: jest.fn(),
  update: jest.fn(),
});

const mockVendor: Vendor = {
  id: 'uuid-123',
  companyName: 'ABC Corp',
  contactPerson: 'John Doe',
  email: 'john@abc.com',
  phone: '9876543210',
  address: '123 Main St, Mumbai',
  registrationNumber: 'REG123',
  gstNumber: '27AABCU9603R1Z1',
  bankAccountNumber: '1234567890',
  ifscCode: 'HDFC0001234',
  status: VendorStatus.DRAFT,
  currentVersion: 1,
  createdAt: new Date(),
  updatedAt: new Date(),
};

describe('VendorService', () => {
  let service: VendorService;
  let repo: ReturnType<typeof mockRepo>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        VendorService,
        { provide: getRepositoryToken(Vendor), useFactory: mockRepo },
        {
          provide: VersionHistoryService,
          useValue: {
            recordChange: jest.fn().mockResolvedValue(undefined),
            getHistory: jest.fn().mockResolvedValue([]),
          },
        },
      ],
    }).compile();

    service = module.get<VendorService>(VendorService);
    repo = module.get(getRepositoryToken(Vendor));
  });

  afterEach(() => jest.clearAllMocks());

  // -----------------------------------------------------------------------
  // create()
  // -----------------------------------------------------------------------
  describe('create()', () => {
    it('should create a vendor with Draft status', async () => {
      repo.create.mockReturnValue(mockVendor);
      repo.save.mockResolvedValue(mockVendor);

      const result = await service.create({
        companyName: 'ABC Corp',
        contactPerson: 'John Doe',
        email: 'john@abc.com',
        phone: '9876543210',
        address: '123 Main St, Mumbai',
        registrationNumber: 'REG123',
      });

      expect(result.status).toBe(VendorStatus.DRAFT);
      expect(repo.save).toHaveBeenCalledTimes(1);
    });

    it('should throw InternalServerErrorException on DB error', async () => {
      repo.create.mockReturnValue(mockVendor);
      repo.save.mockRejectedValue(new Error('DB Error'));

      await expect(
        service.create({
          companyName: 'ABC',
          contactPerson: 'John',
          email: 'j@j.com',
          phone: '9876543210',
          address: '123 St',
          registrationNumber: 'REG',
        }),
      ).rejects.toThrow(InternalServerErrorException);
    });
  });

  // -----------------------------------------------------------------------
  // findById()
  // -----------------------------------------------------------------------
  describe('findById()', () => {
    it('should return vendor when found', async () => {
      repo.findOne.mockResolvedValue(mockVendor);
      const result = await service.findById('uuid-123');
      expect(result.id).toBe('uuid-123');
    });

    it('should throw NotFoundException when vendor not found', async () => {
      repo.findOne.mockResolvedValue(null);
      await expect(service.findById('non-existent')).rejects.toThrow(NotFoundException);
    });
  });

  // -----------------------------------------------------------------------
  // findAll()
  // -----------------------------------------------------------------------
  describe('findAll()', () => {
    it('should return array of vendors', async () => {
      repo.find.mockResolvedValue([mockVendor]);
      const result = await service.findAll();
      expect(result).toHaveLength(1);
      expect(result[0].companyName).toBe('ABC Corp');
    });
  });

  // -----------------------------------------------------------------------
  // update()
  // -----------------------------------------------------------------------
  describe('update()', () => {
    it('should update vendor and increment version', async () => {
      repo.findOne.mockResolvedValue(mockVendor);
      const updated = { ...mockVendor, companyName: 'Updated Corp', currentVersion: 2 };
      repo.save.mockResolvedValue(updated);

      const result = await service.update('uuid-123', { companyName: 'Updated Corp' });
      expect(result.companyName).toBe('Updated Corp');
    });
  });

  // -----------------------------------------------------------------------
  // updateStatus()
  // -----------------------------------------------------------------------
  describe('updateStatus()', () => {
    it('should update vendor status to Under Review', async () => {
      repo.findOne.mockResolvedValue(mockVendor);
      repo.save.mockResolvedValue({ ...mockVendor, status: VendorStatus.UNDER_REVIEW });

      const result = await service.updateStatus('uuid-123', VendorStatus.UNDER_REVIEW);
      expect(result.status).toBe(VendorStatus.UNDER_REVIEW);
    });
  });
});
