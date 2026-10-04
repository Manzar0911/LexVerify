import React from 'react';
import { VendorStatus } from '../../models/vendor.model';
import { Check, Clock, XCircle, ChevronRight } from 'lucide-react';
import { Button } from '../common/Button';

interface WorkflowStepperProps {
  currentStatus: VendorStatus;
  onOpenTransitionModal: () => void;
}

export const WorkflowStepper: React.FC<WorkflowStepperProps> = ({
  currentStatus,
  onOpenTransitionModal,
}) => {
  const steps: { key: VendorStatus; label: string; desc: string }[] = [
    { key: VendorStatus.DRAFT, label: '1. Draft', desc: 'Profile initialized' },
    { key: VendorStatus.UNDER_REVIEW, label: '2. Under Review', desc: 'AI docs & registry check' },
    { key: VendorStatus.ACTION_REQUIRED, label: '3. Action Required', desc: 'Resolve tasks & issues' },
    { key: VendorStatus.APPROVED, label: '4. Approved', desc: 'Compliance cleared' },
  ];

  const getStepState = (stepKey: VendorStatus) => {
    if (currentStatus === VendorStatus.REJECTED) {
      return stepKey === currentStatus ? 'rejected' : 'inactive';
    }
    if (stepKey === currentStatus) return 'current';

    const order = [
      VendorStatus.DRAFT,
      VendorStatus.UNDER_REVIEW,
      VendorStatus.ACTION_REQUIRED,
      VendorStatus.APPROVED,
    ];
    const currentIndex = order.indexOf(currentStatus);
    const stepIndex = order.indexOf(stepKey);

    if (stepIndex < currentIndex) return 'completed';
    return 'upcoming';
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-slate-100">
        <div>
          <h3 className="text-base font-bold text-slate-900">Compliance Workflow Pipeline</h3>
          <p className="text-xs text-slate-500">
            Strict state-machine transitions driven by AI discrepancy detection and reviewer sign-off.
          </p>
        </div>

        <Button
          variant="royal"
          size="sm"
          onClick={onOpenTransitionModal}
          rightIcon={<ChevronRight className="w-4 h-4" />}
        >
          Change Workflow Status
        </Button>
      </div>

      {/* Stepper Display */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 pt-6">
        {steps.map((step) => {
          const state = getStepState(step.key);

          return (
            <div
              key={step.key}
              className={`p-4 rounded-xl border relative transition-all ${
                state === 'current'
                  ? 'bg-blue-50/50 border-blue-500 ring-2 ring-blue-500/20 shadow-sm'
                  : state === 'completed'
                  ? 'bg-emerald-50/30 border-emerald-300'
                  : 'bg-slate-50/50 border-slate-200 opacity-60'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-slate-800">{step.label}</span>
                {state === 'completed' && (
                  <div className="w-5 h-5 rounded-full bg-emerald-500 text-white flex items-center justify-center">
                    <Check className="w-3 h-3 stroke-[3]" />
                  </div>
                )}
                {state === 'current' && (
                  <div className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center">
                    <Clock className="w-3 h-3" />
                  </div>
                )}
              </div>
              <p className="text-[11px] text-slate-500">{step.desc}</p>
            </div>
          );
        })}
      </div>

      {currentStatus === VendorStatus.REJECTED && (
        <div className="mt-4 p-3 bg-red-50 rounded-xl border border-red-200 flex items-center gap-2 text-xs text-red-700 font-semibold">
          <XCircle className="w-4 h-4 text-red-600 flex-shrink-0" />
          <span>This vendor application has been formally REJECTED.</span>
        </div>
      )}
    </div>
  );
};
