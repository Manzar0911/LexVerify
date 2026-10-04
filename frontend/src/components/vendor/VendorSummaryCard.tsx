import React from 'react';
import { Vendor } from '../../models/vendor.model';
import { VerificationResult } from '../../models/version.model';
import { VendorStatusPill, VerificationStatusPill } from '../common/Badge';
import {
  Building2,
  Mail,
  Phone,
  MapPin,
  Calendar,
  FileText,
  Edit3,
  History,
  ShieldCheck,
  CreditCard,
  Landmark,
} from 'lucide-react';
import { Button } from '../common/Button';

interface VendorSummaryCardProps {
  vendor: Vendor;
  verification?: VerificationResult | null;
  onEdit: () => void;
  onViewHistory: () => void;
  onVerify: () => void;
  isVerifying?: boolean;
}

export const VendorSummaryCard: React.FC<VendorSummaryCardProps> = ({
  vendor,
  verification,
  onEdit,
  onViewHistory,
  onVerify,
  isVerifying = false,
}) => {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 relative overflow-hidden">
      {/* Top Accent Strip */}
      <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-slate-900 via-blue-800 to-amber-500" />

      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 pb-6 border-b border-slate-100">
        <div className="flex items-start gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-slate-900 to-blue-900 flex items-center justify-center text-white text-xl font-black shadow-md border border-slate-700/50 flex-shrink-0">
            {vendor.companyName.charAt(0).toUpperCase()}
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-3">
              <h2 className="text-xl font-bold text-slate-900">
                {vendor.companyName}
              </h2>
              <VendorStatusPill status={vendor.status} />
              {verification ? (
                <VerificationStatusPill status={verification.status} />
              ) : (
                <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-slate-100 text-slate-600 border border-slate-200">
                  Unverified
                </span>
              )}
              <span className="text-xs font-mono font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200">
                v{vendor.currentVersion}
              </span>
            </div>
            <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 mt-2 font-medium">
              <span className="flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-slate-400" />
                Reg No: <strong className="text-slate-700">{vendor.registrationNumber}</strong>
              </span>
              {vendor.gstNumber && (
                <span className="flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-slate-400" />
                  GST: <strong className="text-slate-700">{vendor.gstNumber}</strong>
                </span>
              )}
              <span className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                Created: <strong className="text-slate-700">{new Date(vendor.createdAt).toLocaleDateString()}</strong>
              </span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2.5">
          <Button
            variant="outline"
            size="sm"
            onClick={onViewHistory}
            leftIcon={<History className="w-4 h-4 text-slate-500" />}
          >
            Version History
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={onEdit}
            leftIcon={<Edit3 className="w-4 h-4 text-slate-500" />}
          >
            Edit Details
          </Button>
          <Button
            variant="royal"
            size="sm"
            onClick={onVerify}
            isLoading={isVerifying}
            leftIcon={<ShieldCheck className="w-4 h-4 text-amber-400" />}
          >
            Verify with OpenCorporates
          </Button>
        </div>
      </div>

      {/* Grid of details */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 pt-6">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-1">
            Registered Address
          </span>
          <p className="text-sm font-medium text-slate-800 flex items-start gap-1.5">
            <MapPin className="w-4 h-4 text-slate-400 flex-shrink-0 mt-0.5" />
            <span>{vendor.address}</span>
          </p>
        </div>

        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-1">
            Contact Person
          </span>
          <p className="text-sm font-semibold text-slate-800 flex items-center gap-1.5">
            <Building2 className="w-4 h-4 text-slate-400" />
            <span>{vendor.contactPerson}</span>
          </p>
        </div>

        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-1">
            Email & Phone
          </span>
          <p className="text-sm font-medium text-slate-800 flex items-center gap-1.5">
            <Mail className="w-4 h-4 text-slate-400" />
            <a href={`mailto:${vendor.email}`} className="text-blue-600 hover:underline">
              {vendor.email}
            </a>
          </p>
          <p className="text-xs font-medium text-slate-600 flex items-center gap-1.5 mt-1">
            <Phone className="w-3.5 h-3.5 text-slate-400" />
            <span>{vendor.phone}</span>
          </p>
        </div>

        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-1">
            Banking Details
          </span>
          {vendor.bankAccountNumber ? (
            <div className="space-y-1 text-xs font-mono">
              <p className="text-slate-800 flex items-center gap-1.5">
                <CreditCard className="w-3.5 h-3.5 text-slate-400" />
                <span>A/C: {vendor.bankAccountNumber}</span>
              </p>
              {vendor.ifscCode && (
                <p className="text-slate-600 flex items-center gap-1.5">
                  <Landmark className="w-3.5 h-3.5 text-slate-400" />
                  <span>IFSC: {vendor.ifscCode}</span>
                </p>
              )}
            </div>
          ) : (
            <span className="text-sm text-slate-400 italic">No bank info provided</span>
          )}
        </div>
      </div>
    </div>
  );
};
