import { apiClient } from './client';
import { VerificationResult } from '../../models/version.model';

export const verificationApi = {
  async verifyVendor(vendorId: string): Promise<VerificationResult> {
    const { data } = await apiClient.post<VerificationResult>(
      `/verification/${vendorId}`
    );
    return data;
  },

  async getResult(vendorId: string): Promise<VerificationResult | null> {
    const { data } = await apiClient.get<VerificationResult | null>(
      `/verification/${vendorId}`
    );
    return data;
  },
};
