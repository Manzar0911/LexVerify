import React, { useState } from 'react';
import { VendorStatus } from '../../models/vendor.model';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { AlertCircle } from 'lucide-react';

interface TransitionModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentStatus: VendorStatus;
  onTransition: (newStatus: VendorStatus, reason?: string) => Promise<void>;
  isLoading?: boolean;
}

export const TransitionModal: React.FC<TransitionModalProps> = ({
  isOpen,
  onClose,
  currentStatus,
  onTransition,
  isLoading = false,
}) => {
  const [selectedStatus, setSelectedStatus] = useState<VendorStatus>(currentStatus);
  const [reason, setReason] = useState('');

  // Valid state machine transitions
  const getAvailableTransitions = (): VendorStatus[] => {
    switch (currentStatus) {
      case VendorStatus.DRAFT:
        return [VendorStatus.UNDER_REVIEW];
      case VendorStatus.UNDER_REVIEW:
        return [VendorStatus.ACTION_REQUIRED, VendorStatus.APPROVED, VendorStatus.REJECTED];
      case VendorStatus.ACTION_REQUIRED:
        return [VendorStatus.UNDER_REVIEW, VendorStatus.REJECTED];
      case VendorStatus.APPROVED:
        return [VendorStatus.UNDER_REVIEW];
      case VendorStatus.REJECTED:
        return [VendorStatus.DRAFT];
      default:
        return [];
    }
  };

  const available = getAvailableTransitions();

  const handleConfirm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStatus) return;
    await onTransition(selectedStatus, reason || undefined);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Transition Workflow Status"
      description={`Currently in "${currentStatus}" status. State machine rules enforce valid transitions.`}
      maxWidth="md"
    >
      <form onSubmit={handleConfirm} className="space-y-4">
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
            Allowed Destination Statuses
          </label>
          <div className="space-y-2">
            {available.map((status) => (
              <label
                key={status}
                className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                  selectedStatus === status
                    ? 'border-blue-500 bg-blue-50/50 font-bold text-blue-900 ring-1 ring-blue-500'
                    : 'border-slate-200 hover:bg-slate-50 text-slate-700 font-medium'
                }`}
              >
                <input
                  type="radio"
                  name="workflow_status"
                  value={status}
                  checked={selectedStatus === status}
                  onChange={() => setSelectedStatus(status)}
                  className="w-4 h-4 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm">{status}</span>
              </label>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
            Transition Reason / Audit Comment
          </label>
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            rows={2}
            placeholder="e.g. All documents verified and OpenCorporates registration match confirmed."
            className="w-full px-3.5 py-2 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
          />
        </div>

        <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-800 flex items-start gap-2">
          <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
          <span>
            Transitioning to <strong>Action Required</strong> will automatically generate reviewer tasks.
          </span>
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
          <Button type="button" variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button
            type="submit"
            variant="royal"
            disabled={!selectedStatus || selectedStatus === currentStatus}
            isLoading={isLoading}
          >
            Apply Transition
          </Button>
        </div>
      </form>
    </Modal>
  );
};
