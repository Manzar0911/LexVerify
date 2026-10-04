import React from 'react';
import { DocumentStatus } from '../../models/document.model';
import { CheckCircle2, XCircle, Send } from 'lucide-react';
import { Button } from '../common/Button';

export interface ChecklistItem {
  type: string;
  label: string;
  status: DocumentStatus;
  documentId?: string;
}

interface ChecklistTrackerProps {
  checklist: ChecklistItem[] | null;
  onSendEmailReminder: () => Promise<void>;
  isSendingEmail?: boolean;
}

export const ChecklistTracker: React.FC<ChecklistTrackerProps> = ({
  checklist,
  onSendEmailReminder,
  isSendingEmail = false,
}) => {
  if (!checklist || !Array.isArray(checklist)) return null;

  const totalRequired = checklist.length;
  const totalPresent = checklist.filter(
    (item) => item.status === DocumentStatus.AVAILABLE || item.status === DocumentStatus.VERIFIED
  ).length;
  const allPresent = totalPresent === totalRequired && totalRequired > 0;

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-base font-bold text-slate-900">Required Document Checklist</h3>
            <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700">
              {totalPresent} / {totalRequired} Complete
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            All 3 foundational compliance documents are mandatory for verification approval.
          </p>
        </div>

        {!allPresent && (
          <Button
            variant="gold"
            size="sm"
            onClick={onSendEmailReminder}
            isLoading={isSendingEmail}
            leftIcon={<Send className="w-3.5 h-3.5 text-white" />}
          >
            Email Vendor for Missing Docs
          </Button>
        )}
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-slate-100 rounded-full h-2 my-4 overflow-hidden">
        <div
          className={`h-full transition-all duration-500 rounded-full ${
            allPresent ? 'bg-emerald-500' : 'bg-amber-500'
          }`}
          style={{
            width: `${totalRequired > 0 ? (totalPresent / totalRequired) * 100 : 0}%`,
          }}
        />
      </div>

      {/* Checklist Items */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {checklist.map((item) => {
          const isPresent =
            item.status === DocumentStatus.AVAILABLE || item.status === DocumentStatus.VERIFIED;

          return (
            <div
              key={item.type}
              className={`p-3.5 rounded-xl border flex items-center gap-3 transition-all ${
                isPresent
                  ? 'bg-emerald-50/40 border-emerald-200 text-emerald-900'
                  : 'bg-amber-50/40 border-amber-200 text-amber-900'
              }`}
            >
              {isPresent ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
              ) : (
                <XCircle className="w-5 h-5 text-amber-600 flex-shrink-0" />
              )}
              <div className="min-w-0">
                <h4 className="text-xs font-bold leading-tight truncate">{item.label}</h4>
                <p className="text-[11px] opacity-75 mt-0.5 font-medium">
                  {isPresent ? 'Verified & Available' : 'Missing Document'}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
