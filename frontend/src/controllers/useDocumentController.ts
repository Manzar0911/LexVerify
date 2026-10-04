import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { documentApi } from '../services/api/document.api';
import { DocumentType } from '../models/document.model';
import { useUIStore } from '../store/ui.store';

export function useDocumentController(vendorId?: string) {
  const queryClient = useQueryClient();
  const { addToast } = useUIStore();

  const documentsQuery = useQuery({
    queryKey: ['documents', vendorId],
    queryFn: async () => {
      if (!vendorId) return [];
      const docs = await documentApi.getByVendorId(vendorId);
      // Fetch extracted fields for each document
      const withFields = await Promise.all(
        docs.map(async (doc) => {
          try {
            const fields = await documentApi.getExtractedData(doc.id);
            return { ...doc, extractedFields: fields };
          } catch {
            return { ...doc, extractedFields: [] };
          }
        })
      );
      return withFields;
    },
    enabled: Boolean(vendorId),
  });

  const checklistQuery = useQuery({
    queryKey: ['checklist', vendorId],
    queryFn: () => (vendorId ? documentApi.getChecklist(vendorId) : null),
    enabled: Boolean(vendorId),
  });

  const uploadMutation = useMutation({
    mutationFn: async ({ file, documentType }: { file: File; documentType: DocumentType }) => {
      if (!vendorId) throw new Error('Vendor ID is required for upload');
      const doc = await documentApi.upload(vendorId, file, documentType);
      // Immediately trigger AI extraction
      try {
        await documentApi.triggerExtraction(doc.id);
      } catch (e) {
        console.warn('Auto-extraction trigger:', e);
      }
      return doc;
    },
    onSuccess: (doc) => {
      queryClient.invalidateQueries({ queryKey: ['documents', vendorId] });
      queryClient.invalidateQueries({ queryKey: ['checklist', vendorId] });
      queryClient.invalidateQueries({ queryKey: ['vendor', vendorId] });
      queryClient.invalidateQueries({ queryKey: ['tasks', vendorId] });
      addToast({
        type: 'success',
        title: 'Document Uploaded & Extracted',
        message: `${doc.documentType} uploaded. AI vision extraction completed.`,
      });
    },
    onError: (err: Error) => {
      addToast({
        type: 'error',
        title: 'Upload Failed',
        message: err.message,
      });
    },
  });

  const extractMutation = useMutation({
    mutationFn: (documentId: string) => documentApi.triggerExtraction(documentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['documents', vendorId] });
      queryClient.invalidateQueries({ queryKey: ['checklist', vendorId] });
      queryClient.invalidateQueries({ queryKey: ['vendor', vendorId] });
      addToast({
        type: 'success',
        title: 'Extraction Completed',
        message: 'AI document attributes extracted successfully.',
      });
    },
    onError: (err: Error) => {
      addToast({
        type: 'error',
        title: 'Extraction Failed',
        message: err.message,
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (documentId: string) => documentApi.delete(documentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['documents', vendorId] });
      queryClient.invalidateQueries({ queryKey: ['checklist', vendorId] });
      queryClient.invalidateQueries({ queryKey: ['vendor', vendorId] });
      addToast({
        type: 'info',
        title: 'Document Removed',
        message: 'Document was successfully deleted.',
      });
    },
    onError: (err: Error) => {
      addToast({
        type: 'error',
        title: 'Delete Failed',
        message: err.message,
      });
    },
  });

  const editFieldMutation = useMutation({
    mutationFn: ({ fieldId, editedValue }: { fieldId: string; editedValue: string }) =>
      documentApi.editExtractedField(fieldId, editedValue),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['documents', vendorId] });
      addToast({
        type: 'success',
        title: 'Field Updated',
        message: 'Extracted field override saved successfully.',
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

  return {
    documents: documentsQuery.data || [],
    isLoadingDocuments: documentsQuery.isLoading,
    refetchDocuments: documentsQuery.refetch,

    checklist: checklistQuery.data,
    isLoadingChecklist: checklistQuery.isLoading,
    refetchChecklist: checklistQuery.refetch,

    uploadDocument: uploadMutation.mutateAsync,
    isUploading: uploadMutation.isPending,

    deleteDocument: deleteMutation.mutateAsync,
    isDeleting: deleteMutation.isPending,

    editExtractedField: editFieldMutation.mutateAsync,
    isEditingField: editFieldMutation.isPending,

    extractDocument: extractMutation.mutateAsync,
    isExtracting: extractMutation.isPending,
  };
}
