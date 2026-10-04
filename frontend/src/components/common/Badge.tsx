import React from 'react';
import { clsx } from 'clsx';
import { VendorStatus, VerificationStatus } from '../../models/vendor.model';

export interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'success' | 'warning' | 'error' | 'info' | 'royal' | 'gold';
  size?: 'sm' | 'md';
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'default',
  size = 'md',
  className,
}) => {
  const baseStyles = 'inline-flex items-center font-semibold rounded-full';
  const sizeStyles = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-1 text-xs',
  };

  const variantStyles = {
    default: 'bg-slate-100 text-slate-700 border border-slate-200',
    success: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
    warning: 'bg-amber-50 text-amber-800 border border-amber-200',
    error: 'bg-red-50 text-red-700 border border-red-200',
    info: 'bg-blue-50 text-blue-700 border border-blue-200',
    royal: 'bg-slate-900 text-slate-100 border border-slate-700',
    gold: 'bg-amber-100 text-amber-900 border border-amber-300',
  };

  return (
    <span
      className={clsx(
        baseStyles,
        sizeStyles[size],
        variantStyles[variant],
        className
      )}
    >
      {children}
    </span>
  );
};

export const VendorStatusPill: React.FC<{ status: VendorStatus; className?: string }> = ({
  status,
  className,
}) => {
  switch (status) {
    case VendorStatus.DRAFT:
      return <Badge variant="default" className={className}>Draft</Badge>;
    case VendorStatus.UNDER_REVIEW:
      return <Badge variant="info" className={className}>Under Review</Badge>;
    case VendorStatus.ACTION_REQUIRED:
      return <Badge variant="warning" className={className}>Action Required</Badge>;
    case VendorStatus.APPROVED:
      return <Badge variant="success" className={className}>Approved</Badge>;
    case VendorStatus.REJECTED:
      return <Badge variant="error" className={className}>Rejected</Badge>;
    default:
      return <Badge variant="default" className={className}>{status}</Badge>;
  }
};

export const VerificationStatusPill: React.FC<{ status: VerificationStatus; className?: string }> = ({
  status,
  className,
}) => {
  switch (status) {
    case VerificationStatus.VERIFIED:
      return <Badge variant="success" className={className}>✓ Verified</Badge>;
    case VerificationStatus.MISMATCH:
      return <Badge variant="error" className={className}>⚠ Mismatch</Badge>;
    case VerificationStatus.UNABLE_TO_VERIFY:
      return <Badge variant="default" className={className}>? Unable to Verify</Badge>;
    default:
      return <Badge variant="info" className={className}>⏳ Pending</Badge>;
  }
};
