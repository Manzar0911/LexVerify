import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { vendorApi } from '../services/api/vendor.api';
import { CreateVendorInput, UpdateVendorInput, VendorStatus } from '../models/vendor.model';
import { useUIStore } from '../store/ui.store';

export function useVendorController(vendorId?: string, filterStatus?: VendorStatus, searchQuery?: string) {
  const queryClient = useQueryClient();
  const { addToast } = useUIStore();

  const vendorsQuery = useQuery({
    queryKey: ['vendors', filterStatus, searchQuery],
    queryFn: () => vendorApi.getAll(filterStatus, searchQuery),
    staleTime: 30000,
  });

  const vendorDetailQuery = useQuery({
    queryKey: ['vendor', vendorId],
    queryFn: () => (vendorId ? vendorApi.getById(vendorId) : null),
    enabled: Boolean(vendorId),
  });

  const createVendorMutation = useMutation({
    mutationFn: (input: CreateVendorInput) => vendorApi.create(input),
    onSuccess: (newVendor) => {
      queryClient.invalidateQueries({ queryKey: ['vendors'] });
      addToast({
        type: 'success',
        title: 'Vendor Created',
        message: `Successfully created ${newVendor.companyName}`,
      });
    },
    onError: (err: Error) => {
      addToast({
        type: 'error',
        title: 'Creation Failed',
        message: err.message,
      });
    },
  });

  const updateVendorMutation = useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateVendorInput }) =>
      vendorApi.update(id, input),
    onSuccess: (updatedVendor) => {
      queryClient.invalidateQueries({ queryKey: ['vendor', updatedVendor.id] });
      queryClient.invalidateQueries({ queryKey: ['vendors'] });
      queryClient.invalidateQueries({ queryKey: ['versions', updatedVendor.id] });
      addToast({
        type: 'success',
        title: 'Vendor Updated',
        message: `Successfully updated ${updatedVendor.companyName}. Version history updated.`,
      });
    },
    onError: (err: Error) => {
      addToast({
        type: 'error',
        title: 'Update Failed',
        message: err.message,
      });
    },
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: VendorStatus }) =>
      vendorApi.updateStatus(id, status),
    onSuccess: (updatedVendor) => {
      queryClient.invalidateQueries({ queryKey: ['vendor', updatedVendor.id] });
      queryClient.invalidateQueries({ queryKey: ['vendors'] });
      queryClient.invalidateQueries({ queryKey: ['workflow-logs', updatedVendor.id] });
      queryClient.invalidateQueries({ queryKey: ['versions', updatedVendor.id] });
      addToast({
        type: 'success',
        title: 'Status Updated',
        message: `Vendor status changed to ${updatedVendor.status}`,
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

  return {
    vendors: vendorsQuery.data || [],
    isLoadingVendors: vendorsQuery.isLoading,
    vendorsError: vendorsQuery.error,
    refetchVendors: vendorsQuery.refetch,

    vendor: vendorDetailQuery.data,
    isLoadingVendor: vendorDetailQuery.isLoading,
    vendorError: vendorDetailQuery.error,
    refetchVendor: vendorDetailQuery.refetch,

    createVendor: createVendorMutation.mutateAsync,
    isCreating: createVendorMutation.isPending,

    updateVendor: updateVendorMutation.mutateAsync,
    isUpdating: updateVendorMutation.isPending,

    updateStatus: updateStatusMutation.mutateAsync,
    isUpdatingStatus: updateStatusMutation.isPending,
  };
}
