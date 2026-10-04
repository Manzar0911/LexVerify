import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useVendorController } from '../controllers/useVendorController';
import { useDocumentController } from '../controllers/useDocumentController';
import { useVerificationController } from '../controllers/useVerificationController';
import { useWorkflowController } from '../controllers/useWorkflowController';
import { useVersionHistoryController } from '../controllers/useVersionHistoryController';
import { emailApi } from '../services/api/email.api';
import { useUIStore } from '../store/ui.store';

import { VendorSummaryCard } from '../components/vendor/VendorSummaryCard';
import { VendorFormModal } from '../components/vendor/VendorFormModal';
import { WorkflowStepper } from '../components/workflow/WorkflowStepper';
import { TransitionModal } from '../components/workflow/TransitionModal';
import { VerificationCard } from '../components/verification/VerificationCard';
import { ChecklistTracker, ChecklistItem } from '../components/document/ChecklistTracker';
import { DocumentUploader } from '../components/document/DocumentUploader';
import { DocumentCard } from '../components/document/DocumentCard';
import { DocumentComparisonView } from '../components/document/DocumentComparisonView';
import { TaskBoard } from '../components/workflow/TaskBoard';
import { TaskModal } from '../components/workflow/TaskModal';
import { VersionHistoryDrawer } from '../components/version/VersionHistoryDrawer';
import { Button } from '../components/common/Button';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { TaskStatus } from '../models/workflow.model';

export const VendorDetailPage: React.FC = () => {
  const { vendorId } = useParams<{ vendorId: string }>();
  const navigate = useNavigate();
  const { addToast } = useUIStore();

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isTransitionModalOpen, setIsTransitionModalOpen] = useState(false);
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [isHistoryDrawerOpen, setIsHistoryDrawerOpen] = useState(false);
  const [isSendingEmail, setIsSendingEmail] = useState(false);

  // Controllers
  const {
    vendor,
    isLoadingVendor,
    vendorError,
    updateVendor,
    isUpdating,
  } = useVendorController(vendorId);

  const {
    documents,
    checklist,
    uploadDocument,
    isUploading,
    deleteDocument,
    isDeleting,
    editExtractedField,
    extractDocument,
    isExtracting,
  } = useDocumentController(vendorId);

  const {
    verification,
    verifyCompany,
    isVerifying,
  } = useVerificationController(vendorId);

  const {
    tasks,
    transitionStatus,
    isTransitioning,
    createTask,
    isCreatingTask,
    updateTask,
  } = useWorkflowController(vendorId);

  const {
    versions,
    restoreVersion,
    isRestoring,
  } = useVersionHistoryController(vendorId);

  const handleSendEmailReminder = async () => {
    if (!vendorId) return;
    setIsSendingEmail(true);
    try {
      const res = await emailApi.sendMissingDocsNotice(vendorId);
      if (res.sent) {
        addToast({
          type: 'success',
          title: 'Missing Docs Notice Dispatched',
          message: `Notice sent to vendor for ${res.missingDocs.length} missing document(s).`,
        });
      } else {
        addToast({
          type: 'info',
          title: 'No Email Sent',
          message: 'All required documents are already available.',
        });
      }
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to send notice';
      addToast({
        type: 'error',
        title: 'Email Dispatch Failed',
        message: errorMsg,
      });
    } finally {
      setIsSendingEmail(false);
    }
  };

  if (isLoadingVendor) {
    return (
      <div className="py-24 text-center">
        <Loader2 className="w-10 h-10 text-blue-600 animate-spin mx-auto mb-3" />
        <p className="text-sm font-semibold text-slate-700">
          Loading vendor intelligence profile...
        </p>
      </div>
    );
  }

  if (vendorError || !vendor) {
    return (
      <div className="bg-white rounded-2xl border border-red-200 p-12 text-center shadow-sm">
        <h3 className="text-lg font-bold text-red-700">Vendor Profile Not Found</h3>
        <p className="text-xs text-slate-500 mt-1 mb-6">
          The requested vendor ID does not exist or could not be loaded.
        </p>
        <Button variant="royal" onClick={() => navigate('/')}>
          Return to Dashboard
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-12">
      {/* Back button */}
      <div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate('/')}
          leftIcon={<ArrowLeft className="w-4 h-4 text-slate-500" />}
          className="text-slate-600 hover:text-slate-900"
        >
          Back to Vendor Directory
        </Button>
      </div>

      {/* Main Vendor Summary Card */}
      <VendorSummaryCard
        vendor={vendor}
        verification={verification}
        onEdit={() => setIsEditModalOpen(true)}
        onViewHistory={() => setIsHistoryDrawerOpen(true)}
        onVerify={() => verifyCompany()}
        isVerifying={isVerifying}
      />

      {/* Workflow Stepper */}
      <WorkflowStepper
        currentStatus={vendor.status}
        onOpenTransitionModal={() => setIsTransitionModalOpen(true)}
      />

      {/* OpenCorporates Verification */}
      <VerificationCard
        vendor={vendor}
        verification={verification}
        onVerify={async () => {
          await verifyCompany();
        }}
        isVerifying={isVerifying}
      />

      {/* Required Documents Checklist */}
      <ChecklistTracker
        checklist={(checklist as unknown as ChecklistItem[]) || null}
        onSendEmailReminder={handleSendEmailReminder}
        isSendingEmail={isSendingEmail}
      />

      {/* Document Uploader */}
      <DocumentUploader
        onUpload={async (file, type) => {
          await uploadDocument({ file, documentType: type });
        }}
        isUploading={isUploading}
      />

      {/* Document Grid */}
      <div className="space-y-3">
        <h3 className="text-base font-bold text-slate-900">
          Uploaded Documents & Extracted Evidence ({documents.length})
        </h3>
        {documents.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center">
            <p className="text-xs text-slate-500">
              No documents uploaded yet. Upload the Registration Certificate, GST Certificate, and Bank Document above.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {documents.map((doc) => (
              <DocumentCard
                key={doc.id}
                document={doc}
                onDelete={(id) => deleteDocument(id)}
                onEditField={async (fieldId, val) => {
                  await editExtractedField({ fieldId, editedValue: val });
                }}
                onExtract={async (id) => {
                  await extractDocument(id);
                }}
                isExtracting={isExtracting}
                isDeleting={isDeleting}
              />
            ))}
          </div>
        )}
      </div>

      {/* AI Cross-Document Discrepancy Matrix */}
      <DocumentComparisonView
        vendor={vendor}
        documents={documents}
      />

      {/* Action Required & Compliance Tasks */}
      <TaskBoard
        tasks={tasks}
        onOpenCreateTask={() => setIsTaskModalOpen(true)}
        onUpdateTaskStatus={async (taskId, status) => {
          await updateTask({ taskId, input: { status: status as TaskStatus } });
        }}
      />

      {/* Modals & Drawers */}
      <VendorFormModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        initialData={vendor}
        onSubmit={async (data) => {
          await updateVendor({ id: vendor.id, input: data });
        }}
        isLoading={isUpdating}
      />

      <TransitionModal
        isOpen={isTransitionModalOpen}
        onClose={() => setIsTransitionModalOpen(false)}
        currentStatus={vendor.status}
        onTransition={async (status, reason) => {
          await transitionStatus({ status, reason });
        }}
        isLoading={isTransitioning}
      />

      <TaskModal
        isOpen={isTaskModalOpen}
        onClose={() => setIsTaskModalOpen(false)}
        onSubmit={async (data) => {
          await createTask(data);
        }}
        isLoading={isCreatingTask}
      />

      <VersionHistoryDrawer
        isOpen={isHistoryDrawerOpen}
        onClose={() => setIsHistoryDrawerOpen(false)}
        versions={versions}
        onRestore={async (versionNum) => {
          await restoreVersion(versionNum);
        }}
        isRestoring={isRestoring}
      />
    </div>
  );
};
