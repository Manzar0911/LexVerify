import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { versionApi } from '../services/api/version.api';
import { useUIStore } from '../store/ui.store';

export function useVersionHistoryController(vendorId?: string) {
  const queryClient = useQueryClient();
  const { addToast } = useUIStore();

  const historyQuery = useQuery({
    queryKey: ['versions', vendorId],
    queryFn: () => (vendorId ? versionApi.getHistory(vendorId) : []),
    enabled: Boolean(vendorId),
  });

  const restoreMutation = useMutation({
    mutationFn: (versionNumber: number) => {
      if (!vendorId) throw new Error('Vendor ID is required');
      return versionApi.restoreVersion(vendorId, versionNumber);
    },
    onSuccess: (restoredVendor) => {
      queryClient.invalidateQueries({ queryKey: ['vendor', vendorId] });
      queryClient.invalidateQueries({ queryKey: ['vendors'] });
      queryClient.invalidateQueries({ queryKey: ['versions', vendorId] });
      addToast({
        type: 'success',
        title: 'Version Restored',
        message: `Successfully restored state to Version ${restoredVendor.currentVersion}. An append-only version record has been created.`,
      });
    },
    onError: (err: Error) => {
      addToast({
        type: 'error',
        title: 'Restore Failed',
        message: err.message,
      });
    },
  });

  return {
    versions: historyQuery.data || [],
    isLoadingVersions: historyQuery.isLoading,
    refetchVersions: historyQuery.refetch,

    restoreVersion: restoreMutation.mutateAsync,
    isRestoring: restoreMutation.isPending,
  };
}
