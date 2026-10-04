import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException } from '@nestjs/common';
import { getRepositoryToken } from '@nestjs/typeorm';
import { WorkflowService } from './workflow.service';
import { Task, TaskPriority, TaskStatus } from './entities/task.entity';
import { WorkflowLog } from './entities/workflow-log.entity';
import { VendorService } from '../vendor/vendor.service';
import { VendorStatus } from '../vendor/entities/vendor-status.enum';
import { Vendor } from '../vendor/entities/vendor.entity';

const mockVendor: Partial<Vendor> = {
  id: 'vendor-uuid',
  companyName: 'ABC Corp',
  contactPerson: 'John',
  email: 'john@abc.com',
  phone: '9876543210',
  address: '123 Main St',
  registrationNumber: 'REG123',
  status: VendorStatus.DRAFT,
  currentVersion: 1,
  createdAt: new Date(),
  updatedAt: new Date(),
};

const mockTaskRepo = () => ({
  create: jest.fn(),
  save: jest.fn(),
  find: jest.fn(),
  findOne: jest.fn(),
});

const mockLogRepo = () => ({
  create: jest.fn(),
  save: jest.fn(),
  find: jest.fn(),
});

const mockVendorService = {
  findById: jest.fn(),
  updateStatus: jest.fn(),
};

describe('WorkflowService', () => {
  let service: WorkflowService;
  let taskRepo: ReturnType<typeof mockTaskRepo>;
  let logRepo: ReturnType<typeof mockLogRepo>;
  let vendorService: typeof mockVendorService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WorkflowService,
        { provide: getRepositoryToken(Task), useFactory: mockTaskRepo },
        { provide: getRepositoryToken(WorkflowLog), useFactory: mockLogRepo },
        { provide: VendorService, useValue: mockVendorService },
      ],
    }).compile();

    service = module.get<WorkflowService>(WorkflowService);
    taskRepo = module.get(getRepositoryToken(Task));
    logRepo = module.get(getRepositoryToken(WorkflowLog));
    vendorService = module.get(VendorService);
  });

  afterEach(() => jest.clearAllMocks());

  describe('transitionStatus() — valid transitions', () => {
    it('Draft -> Under Review: allowed', async () => {
      vendorService.findById.mockResolvedValue({ ...mockVendor, status: VendorStatus.DRAFT });
      vendorService.updateStatus.mockResolvedValue({
        ...mockVendor,
        status: VendorStatus.UNDER_REVIEW,
      });

      const result = await service.transitionStatus('vendor-uuid', {
        status: VendorStatus.UNDER_REVIEW,
      });

      expect(result).toBe(VendorStatus.UNDER_REVIEW);
      expect(vendorService.updateStatus).toHaveBeenCalledWith(
        'vendor-uuid',
        VendorStatus.UNDER_REVIEW,
      );
    });

    it('Under Review -> Approved: allowed', async () => {
      vendorService.findById.mockResolvedValue({
        ...mockVendor,
        status: VendorStatus.UNDER_REVIEW,
      });
      vendorService.updateStatus.mockResolvedValue({
        ...mockVendor,
        status: VendorStatus.APPROVED,
      });

      const result = await service.transitionStatus('vendor-uuid', {
        status: VendorStatus.APPROVED,
      });

      expect(result).toBe(VendorStatus.APPROVED);
    });

    it('Under Review -> Action Required: allowed', async () => {
      vendorService.findById.mockResolvedValue({
        ...mockVendor,
        status: VendorStatus.UNDER_REVIEW,
      });
      vendorService.updateStatus.mockResolvedValue({
        ...mockVendor,
        status: VendorStatus.ACTION_REQUIRED,
      });

      const result = await service.transitionStatus('vendor-uuid', {
        status: VendorStatus.ACTION_REQUIRED,
      });

      expect(result).toBe(VendorStatus.ACTION_REQUIRED);
    });

    it('Action Required -> Under Review: allowed', async () => {
      vendorService.findById.mockResolvedValue({
        ...mockVendor,
        status: VendorStatus.ACTION_REQUIRED,
      });
      vendorService.updateStatus.mockResolvedValue({
        ...mockVendor,
        status: VendorStatus.UNDER_REVIEW,
      });

      const result = await service.transitionStatus('vendor-uuid', {
        status: VendorStatus.UNDER_REVIEW,
      });

      expect(result).toBe(VendorStatus.UNDER_REVIEW);
    });
  });

  describe('transitionStatus() — invalid transitions throw BadRequestException', () => {
    it('Draft -> Approved: NOT allowed (must go through review)', async () => {
      vendorService.findById.mockResolvedValue({ ...mockVendor, status: VendorStatus.DRAFT });

      await expect(
        service.transitionStatus('vendor-uuid', { status: VendorStatus.APPROVED }),
      ).rejects.toThrow(BadRequestException);
    });

    it('Draft -> Action Required: NOT allowed', async () => {
      vendorService.findById.mockResolvedValue({ ...mockVendor, status: VendorStatus.DRAFT });

      await expect(
        service.transitionStatus('vendor-uuid', { status: VendorStatus.ACTION_REQUIRED }),
      ).rejects.toThrow(BadRequestException);
    });

    it('Approved -> Action Required: NOT allowed directly', async () => {
      vendorService.findById.mockResolvedValue({ ...mockVendor, status: VendorStatus.APPROVED });

      await expect(
        service.transitionStatus('vendor-uuid', { status: VendorStatus.ACTION_REQUIRED }),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('transitionStatus() — auto-task creation', () => {
    it('should auto-create a task when transitioning to Action Required', async () => {
      vendorService.findById.mockResolvedValue({
        ...mockVendor,
        status: VendorStatus.UNDER_REVIEW,
      });
      vendorService.updateStatus.mockResolvedValue({
        ...mockVendor,
        status: VendorStatus.ACTION_REQUIRED,
      });

      const mockTask: Partial<Task> = {
        id: 'task-uuid',
        vendorId: 'vendor-uuid',
        description: 'Auto-task: Verification mismatch or missing document requires resolution',
        priority: TaskPriority.MEDIUM,
        dueDate: new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0],
        status: TaskStatus.PENDING,
      };
      taskRepo.create.mockReturnValue(mockTask);
      taskRepo.save.mockResolvedValue(mockTask);

      await service.transitionStatus('vendor-uuid', {
        status: VendorStatus.ACTION_REQUIRED,
        reason: 'Missing GST doc',
      });

      expect(taskRepo.save).toHaveBeenCalled();
    });

    it('should NOT create task for other transitions', async () => {
      vendorService.findById.mockResolvedValue({ ...mockVendor, status: VendorStatus.DRAFT });
      vendorService.updateStatus.mockResolvedValue({
        ...mockVendor,
        status: VendorStatus.UNDER_REVIEW,
      });

      await service.transitionStatus('vendor-uuid', {
        status: VendorStatus.UNDER_REVIEW,
      });

      expect(taskRepo.save).not.toHaveBeenCalled();
    });
  });

  describe('transitionStatus() — audit logging', () => {
    it('should always create a workflow log entry on valid transition', async () => {
      vendorService.findById.mockResolvedValue({ ...mockVendor, status: VendorStatus.DRAFT });
      vendorService.updateStatus.mockResolvedValue({
        ...mockVendor,
        status: VendorStatus.UNDER_REVIEW,
      });

      const mockLog: Partial<WorkflowLog> = {
        id: 'log-uuid',
        vendorId: 'vendor-uuid',
        fromStatus: VendorStatus.DRAFT,
        toStatus: VendorStatus.UNDER_REVIEW,
        triggeredBy: 'reviewer',
        reason: 'Initial submission verified',
        changedAt: new Date(),
      };
      logRepo.create.mockReturnValue(mockLog);
      logRepo.save.mockResolvedValue(mockLog);

      await service.transitionStatus('vendor-uuid', {
        status: VendorStatus.UNDER_REVIEW,
        reason: 'Initial submission verified',
      });

      expect(logRepo.save).toHaveBeenCalledTimes(1);
    });
  });
});
