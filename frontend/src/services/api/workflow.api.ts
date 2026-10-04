import { apiClient } from './client';
import {
  CreateTaskInput,
  Task,
  UpdateTaskDto,
  UpdateWorkflowStatusInput,
  WorkflowLog,
} from '../../models/workflow.model';
import { VendorStatus } from '../../models/vendor.model';

export const workflowApi = {
  async updateStatus(
    vendorId: string,
    input: UpdateWorkflowStatusInput
  ): Promise<{ status: VendorStatus }> {
    const { data } = await apiClient.put<{ status: VendorStatus }>(
      `/vendors/${vendorId}/workflow/status`,
      input
    );
    return data;
  },

  async getLogs(vendorId: string): Promise<WorkflowLog[]> {
    const { data } = await apiClient.get<WorkflowLog[]>(
      `/vendors/${vendorId}/workflow/logs`
    );
    return data;
  },

  async getTasks(vendorId: string): Promise<Task[]> {
    const { data } = await apiClient.get<Task[]>(`/vendors/${vendorId}/tasks`);
    return data;
  },

  async createTask(vendorId: string, input: CreateTaskInput): Promise<Task> {
    const { data } = await apiClient.post<Task>(`/vendors/${vendorId}/tasks`, input);
    return data;
  },

  async updateTask(taskId: string, input: UpdateTaskDto): Promise<Task> {
    const { data } = await apiClient.put<Task>(`/tasks/${taskId}`, input);
    return data;
  },
};
