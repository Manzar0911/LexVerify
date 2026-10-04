import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Vendor } from '../../models/vendor.model';
import { VendorStatusPill } from '../common/Badge';
import { Building2, ChevronRight, Mail, Calendar } from 'lucide-react';
import { Button } from '../common/Button';

interface VendorTableProps {
  vendors: Vendor[];
  isLoading?: boolean;
}

export const VendorTable: React.FC<VendorTableProps> = ({ vendors, isLoading = false }) => {
  const navigate = useNavigate();

  if (isLoading) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 p-8 space-y-4 shadow-sm">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-14 rounded-xl skeleton-shimmer" />
        ))}
      </div>
    );
  }

  if (vendors.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center shadow-sm">
        <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mx-auto text-slate-400 mb-3">
          <Building2 className="w-6 h-6" />
        </div>
        <h3 className="text-base font-bold text-slate-800">No Vendors Found</h3>
        <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
          No vendor records match your search criteria. Add your first vendor to initiate compliance review.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50/75 text-[11px] font-bold uppercase tracking-wider text-slate-500">
              <th className="py-3.5 px-6">Company / Legal Name</th>
              <th className="py-3.5 px-6">Registration & GST</th>
              <th className="py-3.5 px-6">Primary Contact</th>
              <th className="py-3.5 px-6">Workflow Status</th>
              <th className="py-3.5 px-6">Version</th>
              <th className="py-3.5 px-6 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-sm">
            {vendors.map((vendor) => (
              <tr
                key={vendor.id}
                onClick={() => navigate(`/vendors/${vendor.id}`)}
                className="hover:bg-slate-50/80 transition-colors cursor-pointer group"
              >
                <td className="py-4 px-6">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-700 font-bold text-sm group-hover:bg-slate-900 group-hover:text-white transition-colors flex-shrink-0">
                      {vendor.companyName.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div className="font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                        {vendor.companyName}
                      </div>
                      <div className="text-xs text-slate-400 flex items-center gap-1.5 mt-0.5">
                        <Calendar className="w-3 h-3" />
                        <span>Created {new Date(vendor.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                </td>

                <td className="py-4 px-6 font-mono text-xs">
                  <div className="text-slate-800 font-medium">{vendor.registrationNumber}</div>
                  <div className="text-slate-400 text-[11px]">{vendor.gstNumber || 'No GST'}</div>
                </td>

                <td className="py-4 px-6 text-xs">
                  <div className="font-semibold text-slate-800">{vendor.contactPerson}</div>
                  <div className="text-slate-500 flex items-center gap-1 mt-0.5">
                    <Mail className="w-3 h-3 text-slate-400" />
                    <span>{vendor.email}</span>
                  </div>
                </td>

                <td className="py-4 px-6">
                  <VendorStatusPill status={vendor.status} />
                </td>

                <td className="py-4 px-6 font-mono text-xs font-semibold text-slate-600">
                  v{vendor.currentVersion}
                </td>

                <td className="py-4 px-6 text-right">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/vendors/${vendor.id}`);
                    }}
                    rightIcon={<ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-blue-600" />}
                  >
                    View
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
