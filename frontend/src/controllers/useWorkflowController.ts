import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { workflowApi } from '../services/api/workflow.api';
import { CreateTaskInput, UpdateTaskDto, UpdateWorkflowStatusInput } from '../models/workflow.model';
import { useUIStore } from '../store/ui.store';

export function useWorkflowController(vendorId?: string) {
  const queryClient = useQueryClient();
  const { addToast } = useUIStore();

  const logsQuery = useQuery({
    queryKey: ['workflow-logs', vendorId],
    queryFn: () => (vendorId ? workflowApi.getLogs(vendorId) : []),
    enabled: Boolean(vendorId),
  });

  const tasksQuery = useQuery({
    queryKey: ['tasks', vendorId],
    queryFn: () => (vendorId ? workflowApi.getTasks(vendorId) : []),
    enabled: Boolean(vendorId),
  });

  const updateStatusMutation = useMutation({
    mutationFn: (input: UpdateWorkflowStatusInput) => {
      if (!vendorId) throw new Error('Vendor ID is required');
      return workflowApi.updateStatus(vendorId, input);
    },
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ['vendor', vendorId] });
      queryClient.invalidateQueries({ queryKey: ['vendors'] });
      queryClient.invalidateQueries({ queryKey: ['workflow-logs', vendorId] });
      queryClient.invalidateQueries({ queryKey: ['tasks', vendorId] });
      addToast({
        type: 'success',
        title: 'Workflow Transitioned',
        message: `Status updated to ${res.status}`,
      });
    },
    onError: (err: Error) => {
      addToast({
        type: 'error',
        title: 'Transition Failed',
        message: err.message,
      });
    },
  });

  const createTaskMutation = useMutation({
    mutationFn: (input: CreateTaskInput) => {
      if (!vendorId) throw new Error('Vendor ID is required');
      return workflowApi.createTask(vendorId, input);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks', vendorId] });
      addToast({
        type: 'success',
        title: 'Task Created',
        message: 'New compliance task successfully assigned.',
      });
    },
    onError: (err: Error) => {
      addToast({
        type: 'error',
        title: 'Task Creation Failed',
        message: err.message,
      });
    },
  });

  const updateTaskMutation = useMutation({
    mutationFn: ({ taskId, input }: { taskId: string; input: UpdateTaskDto }) =>
      workflowApi.updateTask(taskId, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks', vendorId] });
      addToast({
        type: 'success',
        title: 'Task Updated',
        message: 'Task progress updated.',
      });
    },
    onError: (err: Error) => {
      addToast({
        type: 'error',
        title: 'Task Update Failed',
        message: err.message,
      });
    },
  });

  return {
    logs: logsQuery.data || [],
    isLoadingLogs: logsQuery.isLoading,
    refetchLogs: logsQuery.refetch,

    tasks: tasksQuery.data || [],
    isLoadingTasks: tasksQuery.isLoading,
    refetchTasks: tasksQuery.refetch,

    transitionStatus: updateStatusMutation.mutateAsync,
    isTransitioning: updateStatusMutation.isPending,

    createTask: createTaskMutation.mutateAsync,
    isCreatingTask: createTaskMutation.isPending,

    updateTask: updateTaskMutation.mutateAsync,
    isUpdatingTask: updateTaskMutation.isPending,
  };
}
