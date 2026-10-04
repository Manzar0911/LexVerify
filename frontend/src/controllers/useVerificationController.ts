import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { verificationApi } from '../services/api/verification.api';
import { useUIStore } from '../store/ui.store';

export function useVerificationController(vendorId?: string) {
  const queryClient = useQueryClient();
  const { addToast } = useUIStore();

  const verificationQuery = useQuery({
    queryKey: ['verification', vendorId],
    queryFn: () => (vendorId ? verificationApi.getResult(vendorId) : null),
    enabled: Boolean(vendorId),
  });

  const verifyMutation = useMutation({
    mutationFn: () => {
      if (!vendorId) throw new Error('Vendor ID is required');
      return verificationApi.verifyVendor(vendorId);
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ['verification', vendorId] });
      queryClient.invalidateQueries({ queryKey: ['vendor', vendorId] });
      queryClient.invalidateQueries({ queryKey: ['vendors'] });
      queryClient.invalidateQueries({ queryKey: ['tasks', vendorId] });
      queryClient.invalidateQueries({ queryKey: ['workflow-logs', vendorId] });

      if (result.status === 'Verified') {
        addToast({
          type: 'success',
          title: 'Company Verified',
          message: `${result.apiCompanyName || 'Company'} successfully verified against official registry.`,
        });
      } else if (result.status === 'Mismatch') {
        addToast({
          type: 'warning',
          title: 'Verification Mismatch',
          message: 'Mismatch found in registration data. Action Required task generated.',
        });
      } else {
        addToast({
          type: 'info',
          title: 'Unable to Verify',
          message: result.errorMessage || 'Could not verify company automatically against official registry.',
        });
      }
    },
    onError: (err: Error) => {
      addToast({
        type: 'error',
        title: 'Verification Error',
        message: err.message,
      });
    },
  });

  return {
    verification: verificationQuery.data,
    isLoadingVerification: verificationQuery.isLoading,
    refetchVerification: verificationQuery.refetch,

    verifyCompany: verifyMutation.mutateAsync,
    isVerifying: verifyMutation.isPending,
  };
}
