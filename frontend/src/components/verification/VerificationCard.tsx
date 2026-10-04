import React from 'react';
import { Vendor } from '../../models/vendor.model';
import { VerificationResult } from '../../models/version.model';
import { VerificationStatusPill } from '../common/Badge';
import { Button } from '../common/Button';
import { ShieldCheck, AlertTriangle, CheckCircle2 } from 'lucide-react';

interface VerificationCardProps {
  vendor: Vendor;
  verification?: VerificationResult | null;
  onVerify: () => Promise<void>;
  isVerifying?: boolean;
}

export const VerificationCard: React.FC<VerificationCardProps> = ({
  vendor,
  verification,
  onVerify,
  isVerifying = false,
}) => {
  const isVerified = verification?.status === 'Verified';
  const isMismatch = verification?.status === 'Mismatch';

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-slate-100">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-slate-900 text-amber-400 flex items-center justify-center flex-shrink-0 shadow-sm">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900">
              OpenCorporates Official Registry Verification
            </h3>
            <p className="text-xs text-slate-500">
              Live corporate registry check against national registry database.
            </p>
          </div>
        </div>

        <Button
          variant="royal"
          size="sm"
          onClick={onVerify}
          isLoading={isVerifying}
          leftIcon={<ShieldCheck className="w-4 h-4 text-amber-400" />}
        >
          {verification ? 'Re-Verify with OpenCorporates' : 'Verify Company Registry'}
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4">
        <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
            Registry Status
          </span>
          {verification ? (
            <VerificationStatusPill status={verification.status} />
          ) : (
            <span className="text-xs font-semibold text-slate-500">Not verified yet</span>
          )}
        </div>

        <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
            Registry Legal Name
          </span>
          <p className="text-xs font-bold text-slate-800">
            {verification?.apiCompanyName || vendor.companyName}
          </p>
        </div>

        <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
            Company Number
          </span>
          <p className="text-xs font-mono font-bold text-slate-800">
            {verification?.apiRegistrationNumber || vendor.registrationNumber}
          </p>
        </div>
      </div>

      {isMismatch && (
        <div className="mt-4 p-3.5 bg-red-50 rounded-xl border border-red-200 flex items-start gap-2.5 text-xs text-red-800">
          <AlertTriangle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
          <div>
            <span className="font-bold">Mismatch with OpenCorporates:</span> Official government records do not match the registered company name or registration number. An Action Required task has been assigned for compliance reviewer attention.
          </div>
        </div>
      )}

      {isVerified && (
        <div className="mt-4 p-3.5 bg-emerald-50 rounded-xl border border-emerald-200 flex items-start gap-2.5 text-xs text-emerald-800">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
          <div>
            <span className="font-bold">Registry Confirmed:</span> Active legal entity found in OpenCorporates registry matching registration details. Verified at {new Date(verification.verifiedAt).toLocaleString()}.
          </div>
        </div>
      )}
    </div>
  );
};
