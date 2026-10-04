import {
  Injectable,
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { VendorService } from '../vendor/vendor.service';
import { VendorStatus } from '../vendor/entities/vendor-status.enum';
import { Task, TaskPriority, TaskStatus } from './entities/task.entity';
import { WorkflowLog } from './entities/workflow-log.entity';
import { UpdateTaskDto } from './dto/update-task.dto';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateWorkflowStatusDto } from './dto/update-workflow-status.dto';

// Valid state machine transitions
const ALLOWED_TRANSITIONS: Record<VendorStatus, VendorStatus[]> = {
  [VendorStatus.DRAFT]: [VendorStatus.UNDER_REVIEW],
  [VendorStatus.UNDER_REVIEW]: [
    VendorStatus.ACTION_REQUIRED,
    VendorStatus.APPROVED,
    VendorStatus.REJECTED,
  ],
  [VendorStatus.ACTION_REQUIRED]: [
    VendorStatus.UNDER_REVIEW,
    VendorStatus.APPROVED,
    VendorStatus.REJECTED,
  ],
  [VendorStatus.APPROVED]: [],
  [VendorStatus.REJECTED]: [],
};

@Injectable()
export class WorkflowService {
  constructor(
    @InjectRepository(Task)
    private readonly taskRepository: Repository<Task>,
    @InjectRepository(WorkflowLog)
    private readonly workflowLogRepository: Repository<WorkflowLog>,
    private readonly vendorService: VendorService,
  ) {}

  async transitionStatus(
    vendorId: string,
    dto: UpdateWorkflowStatusDto,
    triggeredBy = 'user',
  ): Promise<VendorStatus> {
    const vendor = await this.vendorService.findById(vendorId);
    const fromStatus = vendor.status;
    const toStatus = dto.status as unknown as VendorStatus;

    const allowed = ALLOWED_TRANSITIONS[fromStatus];
    if (!allowed.includes(toStatus)) {
      throw new BadRequestException(
        `Transition from "${fromStatus}" to "${toStatus}" is not allowed.`,
      );
    }

    try {
      await this.vendorService.updateStatus(vendorId, toStatus);

      // Always log the transition
      await this.workflowLogRepository.save(
        this.workflowLogRepository.create({
          vendorId,
          fromStatus,
          toStatus,
          triggeredBy,
          reason: dto.reason,
        }),
      );

      // Auto-create task when moving to Action Required
      if (toStatus === VendorStatus.ACTION_REQUIRED) {
        const dueDate = new Date();
        dueDate.setDate(dueDate.getDate() + 7);
        await this.taskRepository.save(
          this.taskRepository.create({
            vendorId,
            description:
              dto.reason || 'Action required: review missing or mismatched information.',
            priority: TaskPriority.MEDIUM,
            dueDate: dueDate.toISOString().split('T')[0],
            status: TaskStatus.PENDING,
          }),
        );
      }

      return toStatus;
    } catch (error) {
      if (error instanceof BadRequestException) throw error;
      throw new InternalServerErrorException('Failed to update workflow status');
    }
  }

  async getWorkflowLogs(vendorId: string): Promise<WorkflowLog[]> {
    return this.workflowLogRepository.find({
      where: { vendorId },
      order: { changedAt: 'DESC' },
    });
  }

  async getTasks(vendorId: string): Promise<Task[]> {
    return this.taskRepository.find({
      where: { vendorId },
      order: { createdAt: 'DESC' },
    });
  }

  async createTask(vendorId: string, dto: CreateTaskDto): Promise<Task> {
    await this.vendorService.findById(vendorId); // Validate vendor exists
    try {
      const task = this.taskRepository.create({
        ...dto,
        vendorId,
        status: TaskStatus.PENDING,
      });
      return await this.taskRepository.save(task);
    } catch (error) {
      throw new InternalServerErrorException('Failed to create task');
    }
  }

  async updateTask(taskId: string, dto: UpdateTaskDto): Promise<Task> {
    const task = await this.taskRepository.findOne({ where: { id: taskId } });
    if (!task) throw new BadRequestException(`Task "${taskId}" not found`);

    const updates: Partial<Task> = { ...dto };
    if (dto.status === TaskStatus.COMPLETED && task.status !== TaskStatus.COMPLETED) {
      updates.completedAt = new Date();
    }
    return this.taskRepository.save({ ...task, ...updates });
  }
}
