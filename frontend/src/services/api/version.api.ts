import { apiClient } from './client';
import { VendorVersion } from '../../models/version.model';
import { Vendor } from '../../models/vendor.model';

export const versionApi = {
  async getHistory(vendorId: string): Promise<VendorVersion[]> {
    const { data } = await apiClient.get<VendorVersion[]>(
      `/vendors/${vendorId}/versions`
    );
    return data;
  },

  async restoreVersion(vendorId: string, versionNumber: number): Promise<Vendor> {
    const { data } = await apiClient.post<Vendor>(
      `/vendors/${vendorId}/versions/${versionNumber}/restore`
    );
    return data;
  },
};
