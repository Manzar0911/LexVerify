import React, { useState } from 'react';
import { VendorDocument, ExtractionStatus, ExtractedDataField } from '../../models/document.model';
import { Badge } from '../common/Badge';
import { Button } from '../common/Button';
import {
  Trash2,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  FileCheck2,
  Edit2,
  Check,
  X,
  RefreshCw,
} from 'lucide-react';

interface DocumentCardProps {
  document: VendorDocument;
  onDelete: (id: string) => void;
  onEditField?: (fieldId: string, value: string) => Promise<void>;
  onExtract?: (id: string) => Promise<void>;
  isDeleting?: boolean;
  isExtracting?: boolean;
}

export const DocumentCard: React.FC<DocumentCardProps> = ({
  document,
  onDelete,
  onEditField,
  onExtract,
  isDeleting = false,
  isExtracting = false,
}) => {
  const [editingFieldId, setEditingFieldId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState<string>('');
  const [isSavingField, setIsSavingField] = useState(false);

  const getDocTypeLabel = (type: string) => {
    switch (type) {
      case 'registration_certificate':
        return 'Registration Certificate';
      case 'gst_certificate':
        return 'GST / Tax Certificate';
      case 'bank_document':
        return 'Bank Document';
      default:
        return type;
    }
  };

  const handleStartEdit = (field: ExtractedDataField) => {
    setEditingFieldId(field.id);
    setEditValue(field.editedValue || field.extractedValue || '');
  };

  const handleSaveEdit = async (fieldId: string) => {
    if (!onEditField) return;
    setIsSavingField(true);
    try {
      await onEditField(fieldId, editValue);
      setEditingFieldId(null);
    } finally {
      setIsSavingField(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col justify-between">
      <div>
        {/* Card Header */}
        <div className="p-4 border-b border-slate-100 flex items-start justify-between gap-3 bg-slate-50/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-700 flex-shrink-0">
              <FileCheck2 className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-900 leading-tight">
                {getDocTypeLabel(document.documentType)}
              </h4>
              <p
                className="text-[11px] text-slate-500 font-mono mt-0.5 truncate max-w-[180px]"
                title={document.fileName}
              >
                {document.fileName} {document.fileSize ? `(${(document.fileSize / 1024).toFixed(0)} KB)` : ''}
              </p>
            </div>
          </div>

          <div>
            {document.extractionStatus === ExtractionStatus.COMPLETED && (
              <Badge variant="success" size="sm" className="gap-1">
                <CheckCircle2 className="w-3 h-3" />
                Extracted
              </Badge>
            )}
            {document.extractionStatus === ExtractionStatus.FAILED && (
              <Badge variant="error" size="sm" className="gap-1">
                <AlertTriangle className="w-3 h-3" />
                Extraction Failed
              </Badge>
            )}
            {document.extractionStatus === ExtractionStatus.PENDING && (
              <Badge variant="warning" size="sm" className="gap-1">
                <RefreshCw className="w-3 h-3 animate-spin" />
                Extracting...
              </Badge>
            )}
          </div>
        </div>

        {/* Extracted Fields Content */}
        <div className="p-4 space-y-2.5 text-xs">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-amber-700 font-bold">
              <Sparkles className="w-3.5 h-3.5" />
              <span className="uppercase tracking-wider text-[10px]">AI Extracted Evidence</span>
            </div>
          </div>

          <div className="bg-slate-50 rounded-xl p-3 border border-slate-100 space-y-2">
            {!document.extractedFields || document.extractedFields.length === 0 ? (
              <p className="text-slate-400 italic text-[11px] text-center py-2">
                {document.extractionStatus === ExtractionStatus.PENDING
                  ? 'AI Vision extraction in progress...'
                  : 'No extracted fields available for this document.'}
              </p>
            ) : (
              document.extractedFields.map((field) => {
                const isEditing = editingFieldId === field.id;
                const displayVal = field.editedValue || field.extractedValue;

                return (
                  <div key={field.id} className="border-b border-slate-200/60 pb-1.5 last:border-none last:pb-0">
                    <div className="flex justify-between items-center gap-2">
                      <span className="text-slate-500 font-medium capitalize">
                        {field.fieldName.replace(/([A-Z])/g, ' $1')}:
                      </span>
                      {isEditing ? (
                        <div className="flex items-center gap-1">
                          <input
                            type="text"
                            value={editValue}
                            onChange={(e) => setEditValue(e.target.value)}
                            className="px-2 py-0.5 text-xs border border-blue-400 rounded bg-white text-slate-800 focus:outline-none"
                            autoFocus
                          />
                          <button
                            onClick={() => handleSaveEdit(field.id)}
                            disabled={isSavingField}
                            className="p-1 text-emerald-600 hover:bg-emerald-50 rounded"
                          >
                            <Check className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => setEditingFieldId(null)}
                            className="p-1 text-slate-400 hover:bg-slate-200 rounded"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1.5">
                          <span className="font-semibold text-slate-800 text-right">
                            {displayVal || <span className="text-slate-400 italic">Not found</span>}
                          </span>
                          {field.isEdited && (
                            <span className="text-[9px] bg-amber-100 text-amber-800 px-1 py-0.2 rounded font-bold">
                              edited
                            </span>
                          )}
                          <button
                            onClick={() => handleStartEdit(field)}
                            className="p-0.5 text-slate-400 hover:text-blue-600 rounded transition-colors"
                            title="Edit / Correct extracted value"
                          >
                            <Edit2 className="w-3 h-3" />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* Card Footer Actions */}
      <div className="px-4 py-3 bg-slate-50/50 border-t border-slate-100 flex items-center justify-between">
        <span className="text-[11px] text-slate-400">
          Uploaded: {new Date(document.uploadedAt).toLocaleDateString()}
        </span>

        <div className="flex items-center gap-2">
          {onExtract && document.extractionStatus !== ExtractionStatus.COMPLETED && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => onExtract(document.id)}
              isLoading={isExtracting}
              leftIcon={<Sparkles className="w-3.5 h-3.5 text-amber-500" />}
              className="text-xs text-amber-700 hover:bg-amber-50"
            >
              Extract with AI
            </Button>
          )}

          <Button
            variant="ghost"
            size="sm"
            onClick={() => onDelete(document.id)}
            isLoading={isDeleting}
            leftIcon={<Trash2 className="w-3.5 h-3.5 text-red-500" />}
            className="text-xs text-red-600 hover:text-red-700 hover:bg-red-50"
          >
            Remove
          </Button>
        </div>
      </div>
    </div>
  );
};
