import { apiClient } from './client';

export interface EmailLog {
  id: string;
  vendorId: string;
  recipientEmail: string;
  subject: string;
  body: string;
  status: 'sent' | 'failed';
  providerMessageId?: string | null;
  errorMessage?: string | null;
  sentAt: string;
}

export const emailApi = {
  async sendMissingDocsNotice(vendorId: string): Promise<{ sent: boolean; missingDocs: string[] }> {
    const { data } = await apiClient.post<{ sent: boolean; missingDocs: string[] }>(
      `/email/missing-documents/${vendorId}`
    );
    return data;
  },

  async getLogs(vendorId: string): Promise<EmailLog[]> {
    const { data } = await apiClient.get<EmailLog[]>(`/email/logs/${vendorId}`);
    return data;
  },
};
