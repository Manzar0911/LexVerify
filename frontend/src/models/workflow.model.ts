import { VendorStatus } from './vendor.model';

export enum TaskPriority {
  LOW = 'Low',
  MEDIUM = 'Medium',
  HIGH = 'High',
}

export enum TaskStatus {
  PENDING = 'Pending',
  COMPLETED = 'Completed',
}

export interface Task {
  id: string;
  vendorId: string;
  description: string;
  priority: TaskPriority;
  dueDate: string;
  status: TaskStatus;
  createdAt: string;
  completedAt?: string | null;
}

export interface CreateTaskInput {
  description: string;
  priority: TaskPriority;
  dueDate: string;
}

export interface UpdateTaskDto {
  description?: string;
  priority?: TaskPriority;
  dueDate?: string;
  status?: TaskStatus;
}

export interface WorkflowLog {
  id: string;
  vendorId: string;
  fromStatus: string;
  toStatus: string;
  triggeredBy: string;
  reason?: string;
  changedAt: string;
}

export interface UpdateWorkflowStatusInput {
  status: VendorStatus;
  reason?: string;
}
