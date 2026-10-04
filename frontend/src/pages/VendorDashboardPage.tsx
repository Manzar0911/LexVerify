import React, { useState } from 'react';
import { useVendorController } from '../controllers/useVendorController';
import { VendorTable } from '../components/vendor/VendorTable';
import { VendorFormModal } from '../components/vendor/VendorFormModal';
import { Button } from '../components/common/Button';
import { VendorStatus } from '../models/vendor.model';
import { Plus, Search, ShieldCheck, CheckCircle2, Clock, AlertTriangle } from 'lucide-react';

export const VendorDashboardPage: React.FC = () => {
  const [filterStatus, setFilterStatus] = useState<VendorStatus | undefined>(undefined);
  const [searchQuery, setSearchQuery] = useState('');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const {
    vendors,
    isLoadingVendors,
    createVendor,
    isCreating,
  } = useVendorController(undefined, filterStatus, searchQuery);

  const totalVendors = vendors.length;
  const approvedCount = vendors.filter((v) => v.status === VendorStatus.APPROVED).length;
  const reviewCount = vendors.filter((v) => v.status === VendorStatus.UNDER_REVIEW).length;
  const actionRequiredCount = vendors.filter(
    (v) => v.status === VendorStatus.ACTION_REQUIRED
  ).length;

  return (
    <div className="space-y-6">
      {/* Top Banner / Metrics */}
      <div className="bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 rounded-3xl p-8 text-white shadow-xl relative overflow-hidden border border-slate-800">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-400/30 text-xs font-semibold text-blue-300 mb-3">
              <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
              Automated AI Compliance Engine
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">
              Vendor Intelligence Workspace
            </h1>
            <p className="text-sm text-slate-300 mt-1 max-w-xl">
              Multi-modal AI document extraction, cross-document discrepancy detection, and OpenCorporates registry verification.
            </p>
          </div>

          <Button
            variant="gold"
            size="lg"
            onClick={() => setIsCreateModalOpen(true)}
            leftIcon={<Plus className="w-5 h-5 text-white" />}
            className="shadow-lg shadow-amber-600/20"
          >
            Onboard New Vendor
          </Button>
        </div>

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-8 pt-6 border-t border-slate-800/80">
          <div className="bg-slate-800/40 rounded-2xl p-4 border border-slate-700/40">
            <span className="text-xs font-semibold text-slate-400 block">Total Portfolio</span>
            <span className="text-2xl font-bold text-white mt-1 block">{totalVendors}</span>
          </div>

          <div className="bg-slate-800/40 rounded-2xl p-4 border border-slate-700/40">
            <span className="text-xs font-semibold text-emerald-400 flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5" /> Approved
            </span>
            <span className="text-2xl font-bold text-white mt-1 block">{approvedCount}</span>
          </div>

          <div className="bg-slate-800/40 rounded-2xl p-4 border border-slate-700/40">
            <span className="text-xs font-semibold text-blue-400 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5" /> Under Review
            </span>
            <span className="text-2xl font-bold text-white mt-1 block">{reviewCount}</span>
          </div>

          <div className="bg-slate-800/40 rounded-2xl p-4 border border-slate-700/40">
            <span className="text-xs font-semibold text-amber-400 flex items-center gap-1.5">
              <AlertTriangle className="w-3.5 h-3.5" /> Action Required
            </span>
            <span className="text-2xl font-bold text-white mt-1 block">{actionRequiredCount}</span>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Search */}
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search vendor by company name, registration number, or email..."
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
          />
        </div>

        {/* Status Filter Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
          <button
            onClick={() => setFilterStatus(undefined)}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              filterStatus === undefined
                ? 'bg-slate-900 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            All
          </button>
          {Object.values(VendorStatus).map((status) => (
            <button
              key={status}
              onClick={() => setFilterStatus(status)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
                filterStatus === status
                  ? 'bg-slate-900 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      {/* Vendor Table */}
      <VendorTable vendors={vendors} isLoading={isLoadingVendors} />

      {/* Create Vendor Modal */}
      <VendorFormModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSubmit={async (data) => {
          await createVendor(data);
        }}
        isLoading={isCreating}
      />
    </div>
  );
};
