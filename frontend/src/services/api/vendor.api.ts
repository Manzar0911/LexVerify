import { apiClient } from './client';
import { CreateVendorInput, UpdateVendorInput, Vendor, VendorStatus } from '../../models/vendor.model';

export const vendorApi = {
  async getAll(status?: VendorStatus, search?: string): Promise<Vendor[]> {
    const params = new URLSearchParams();
    if (status) params.append('status', status);
    if (search) params.append('search', search);
    const { data } = await apiClient.get<Vendor[]>('/vendors', { params });
    return data;
  },

  async getById(id: string): Promise<Vendor> {
    const { data } = await apiClient.get<Vendor>(`/vendors/${id}`);
    return data;
  },

  async create(input: CreateVendorInput): Promise<Vendor> {
    const { data } = await apiClient.post<Vendor>('/vendors', input);
    return data;
  },

  async update(id: string, input: UpdateVendorInput): Promise<Vendor> {
    const { data } = await apiClient.put<Vendor>(`/vendors/${id}`, input);
    return data;
  },

  async updateStatus(id: string, status: VendorStatus): Promise<Vendor> {
    const { data } = await apiClient.put<Vendor>(`/vendors/${id}/status`, {
      status,
    });
    return data;
  },
};
