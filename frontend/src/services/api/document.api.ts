import { apiClient } from './client';
import {
  DocumentChecklistResponse,
  DocumentType,
  ExtractedDataField,
  VendorDocument,
} from '../../models/document.model';

export const documentApi = {
  async getByVendorId(vendorId: string): Promise<VendorDocument[]> {
    const { data } = await apiClient.get<VendorDocument[]>(`/vendors/${vendorId}/documents`);
    return data;
  },

  async upload(vendorId: string, file: File, documentType: DocumentType): Promise<VendorDocument> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('documentType', documentType);

    const { data } = await apiClient.post<VendorDocument>(
      `/vendors/${vendorId}/documents`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    return data;
  },

  async getChecklist(vendorId: string): Promise<DocumentChecklistResponse> {
    const { data } = await apiClient.get<DocumentChecklistResponse>(
      `/vendors/${vendorId}/document-checklist`
    );
    return data;
  },

  async getExtractedData(documentId: string): Promise<ExtractedDataField[]> {
    const { data } = await apiClient.get<ExtractedDataField[]>(
      `/documents/${documentId}/extracted-data`
    );
    return data;
  },

  async editExtractedField(fieldId: string, editedValue: string): Promise<ExtractedDataField> {
    const { data } = await apiClient.put<ExtractedDataField>(
      `/extracted-data/${fieldId}`,
      { editedValue }
    );
    return data;
  },

  async triggerExtraction(documentId: string): Promise<any> {
    const { data } = await apiClient.post(`/ai/extract/${documentId}`);
    return data;
  },

  async delete(documentId: string): Promise<void> {
    await apiClient.delete(`/documents/${documentId}`);
  },
};
