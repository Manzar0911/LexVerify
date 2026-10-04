import React, { useState } from 'react';
import { UploadCloud, AlertCircle, CheckCircle2 } from 'lucide-react';
import { DocumentType } from '../../models/document.model';
import { Button } from '../common/Button';

interface DocumentUploaderProps {
  onUpload: (file: File, documentType: DocumentType) => Promise<void>;
  isUploading?: boolean;
}

export const DocumentUploader: React.FC<DocumentUploaderProps> = ({
  onUpload,
  isUploading = false,
}) => {
  const [selectedType, setSelectedType] = useState<DocumentType>(
    DocumentType.REGISTRATION_CERTIFICATE
  );
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);

  const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg'];
  const maxSizeBytes = 10 * 1024 * 1024; // 10MB

  const handleFile = (file: File) => {
    setError(null);
    if (!allowedTypes.includes(file.type)) {
      setError('Invalid file format. Only PDF, JPG, and PNG documents are allowed.');
      return;
    }
    if (file.size > maxSizeBytes) {
      setError('File exceeds maximum allowed size of 10MB.');
      return;
    }
    setSelectedFile(file);
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) return;
    try {
      await onUpload(selectedFile, selectedType);
      setSelectedFile(null);
    } catch {
      // Handled by controller
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-bold text-slate-900">Upload & AI Extract Compliance Document</h3>
          <p className="text-xs text-slate-500">
            Upload PDF or scanned image. AI vision will automatically extract attributes and detect discrepancies.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        <div className="md:col-span-1">
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
            Document Type
          </label>
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value as DocumentType)}
            className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-medium text-slate-800 focus:ring-2 focus:ring-blue-500 focus:outline-none"
          >
            <option value={DocumentType.REGISTRATION_CERTIFICATE}>
              Company Registration Certificate
            </option>
            <option value={DocumentType.GST_CERTIFICATE}>
              GST / Tax Certificate
            </option>
            <option value={DocumentType.BANK_DOCUMENT}>
              Bank Document (Cheque / Statement)
            </option>
          </select>
        </div>

        <div className="md:col-span-2">
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
            File Attachment (Max 10MB: PDF, PNG, JPG)
          </label>
          <div
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            className={`border-2 border-dashed rounded-xl p-4 text-center cursor-pointer transition-all ${
              dragActive
                ? 'border-blue-500 bg-blue-50/50'
                : selectedFile
                ? 'border-emerald-400 bg-emerald-50/20'
                : 'border-slate-300 hover:border-slate-400 bg-slate-50/40'
            }`}
            onClick={() => document.getElementById('file-upload-input')?.click()}
          >
            <input
              id="file-upload-input"
              type="file"
              accept=".pdf,.png,.jpg,.jpeg"
              onChange={handleChange}
              className="hidden"
            />
            {selectedFile ? (
              <div className="flex items-center justify-center gap-2 text-emerald-700 text-xs font-semibold">
                <CheckCircle2 className="w-4 h-4" />
                <span>Selected: {selectedFile.name} ({(selectedFile.size / 1024).toFixed(1)} KB)</span>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center gap-1 text-slate-500">
                <UploadCloud className="w-6 h-6 text-slate-400" />
                <span className="text-xs font-medium">
                  <strong className="text-blue-600">Click to browse</strong> or drag & drop document here
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-2 text-xs text-red-600 bg-red-50 p-2.5 rounded-lg mb-4 border border-red-200">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <div className="flex justify-end">
        <Button
          type="submit"
          variant="royal"
          disabled={!selectedFile || isUploading}
          isLoading={isUploading}
          leftIcon={<UploadCloud className="w-4 h-4 text-amber-400" />}
        >
          Upload & Trigger AI Extraction
        </Button>
      </div>
    </form>
  );
};
