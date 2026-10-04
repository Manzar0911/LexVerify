import React from 'react';
import { Vendor } from '../../models/vendor.model';
import { VendorDocument } from '../../models/document.model';
import { CheckCircle2, AlertTriangle, Sparkles, HelpCircle } from 'lucide-react';
import { Badge } from '../common/Badge';

interface DocumentComparisonViewProps {
  vendor: Vendor;
  documents: VendorDocument[];
}

export const DocumentComparisonView: React.FC<DocumentComparisonViewProps> = ({
  vendor,
  documents,
}) => {
  // Build comparison rows across all documents
  const fieldDefinitions = [
    {
      key: 'companyName',
      label: 'Company Name',
      canonical: vendor.companyName,
      extractedKey: ['companyName', 'company_name', 'legal_name'],
    },
    {
      key: 'registrationNumber',
      label: 'Registration Number',
      canonical: vendor.registrationNumber,
      extractedKey: ['registrationNumber', 'registration_number', 'cin'],
    },
    {
      key: 'gstNumber',
      label: 'GST / Tax ID',
      canonical: vendor.gstNumber || '',
      extractedKey: ['gstNumber', 'gst_number', 'tax_id'],
    },
    {
      key: 'bankAccountNumber',
      label: 'Bank Account Number',
      canonical: vendor.bankAccountNumber || '',
      extractedKey: ['bankAccountNumber', 'bank_account_number', 'account_number'],
    },
    {
      key: 'ifscCode',
      label: 'IFSC Code',
      canonical: vendor.ifscCode || '',
      extractedKey: ['ifscCode', 'ifsc_code', 'ifsc'],
    },
  ];

  const comparisonRows = fieldDefinitions.map((fieldDef) => {
    const docValues = documents.map((doc) => {
      const matchField = doc.extractedFields?.find((f) =>
        fieldDef.extractedKey.some(
          (k) => k.toLowerCase() === f.fieldName.toLowerCase().replace(/[^a-z0-9]/g, '')
        )
      );

      const val = matchField ? matchField.editedValue || matchField.extractedValue : null;

      let status: 'MATCH' | 'MISMATCH' | 'MISSING' = 'MISSING';
      if (val && fieldDef.canonical) {
        const cleanVal = val.toLowerCase().replace(/[^a-z0-9]/g, '');
        const cleanCanon = fieldDef.canonical.toLowerCase().replace(/[^a-z0-9]/g, '');
        status = cleanVal === cleanCanon || cleanVal.includes(cleanCanon) || cleanCanon.includes(cleanVal)
          ? 'MATCH'
          : 'MISMATCH';
      }

      return {
        docType: doc.documentType,
        value: val,
        status,
      };
    });

    const hasMismatch = docValues.some((d) => d.status === 'MISMATCH');
    const hasMatch = docValues.some((d) => d.status === 'MATCH');

    return {
      label: fieldDef.label,
      canonical: fieldDef.canonical,
      docValues,
      overallStatus: hasMismatch ? 'MISMATCH' : hasMatch ? 'MATCH' : 'MISSING',
    };
  });

  const totalMismatches = comparisonRows.filter((r) => r.overallStatus === 'MISMATCH').length;

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-slate-50/50">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-base font-bold text-slate-900">
              AI Cross-Document Discrepancy Matrix
            </h3>
            <Badge variant="gold" size="sm" className="gap-1">
              <Sparkles className="w-3 h-3 text-amber-600" />
              Automated Match
            </Badge>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Automated verification comparing profile information with multi-modal AI extracted values.
          </p>
        </div>

        <div>
          {totalMismatches > 0 ? (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-50 text-red-700 border border-red-200 text-xs font-bold">
              <AlertTriangle className="w-3.5 h-3.5 text-red-600" />
              {totalMismatches} Discrepancy Detected
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-bold">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              All Fields Validated
            </span>
          )}
        </div>
      </div>

      {/* Comparison Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50/75 text-[11px] font-bold uppercase tracking-wider text-slate-500">
              <th className="py-3 px-6">Field Name</th>
              <th className="py-3 px-6">Canonical Value</th>
              <th className="py-3 px-6">Extracted Document Values</th>
              <th className="py-3 px-6 text-right">Result</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-xs">
            {comparisonRows.map((row) => (
              <tr
                key={row.label}
                className={`hover:bg-slate-50/70 transition-colors ${
                  row.overallStatus === 'MISMATCH' ? 'bg-red-50/20' : ''
                }`}
              >
                <td className="py-3.5 px-6 font-bold text-slate-800">{row.label}</td>

                <td className="py-3.5 px-6 font-medium text-slate-700 font-mono">
                  {row.canonical || <span className="text-slate-400 italic">Not set</span>}
                </td>

                <td className="py-3.5 px-6">
                  {row.docValues.length === 0 ? (
                    <span className="text-slate-400 italic">No documents uploaded</span>
                  ) : (
                    <div className="space-y-1">
                      {row.docValues.map((dv, idx) => (
                        <div key={idx} className="flex items-center gap-2 font-mono text-[11px]">
                          <span className="text-slate-400">[{dv.docType}]:</span>
                          <span
                            className={
                              dv.status === 'MISMATCH'
                                ? 'text-red-700 font-bold bg-red-100/70 px-1.5 py-0.5 rounded'
                                : dv.status === 'MATCH'
                                ? 'text-emerald-700 font-semibold'
                                : 'text-slate-400 italic'
                            }
                          >
                            {dv.value || 'Not extracted'}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </td>

                <td className="py-3.5 px-6 text-right">
                  {row.overallStatus === 'MATCH' && (
                    <span className="inline-flex items-center gap-1 font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-md text-[11px]">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Match
                    </span>
                  )}
                  {row.overallStatus === 'MISMATCH' && (
                    <span className="inline-flex items-center gap-1 font-bold text-red-700 bg-red-50 border border-red-200 px-2 py-0.5 rounded-md text-[11px]">
                      <AlertTriangle className="w-3.5 h-3.5" />
                      Mismatch
                    </span>
                  )}
                  {row.overallStatus === 'MISSING' && (
                    <span className="inline-flex items-center gap-1 font-medium text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md text-[11px]">
                      <HelpCircle className="w-3.5 h-3.5" />
                      Pending Docs
                    </span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
