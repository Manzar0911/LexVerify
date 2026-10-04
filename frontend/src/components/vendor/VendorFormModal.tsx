import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { CreateVendorInput, Vendor } from '../../models/vendor.model';

const vendorSchema = z.object({
  companyName: z.string().min(2, 'Company name is required'),
  contactPerson: z.string().min(2, 'Contact person is required'),
  email: z.string().email('Invalid email address'),
  phone: z.string().min(10, 'Phone must be at least 10 digits'),
  address: z.string().min(5, 'Address is required'),
  registrationNumber: z.string().min(2, 'Registration number is required'),
  gstNumber: z.string().optional(),
  bankAccountNumber: z.string().optional(),
  ifscCode: z.string().optional(),
  changeReason: z.string().optional(),
});

type VendorFormValues = z.infer<typeof vendorSchema>;

interface VendorFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateVendorInput & { changeReason?: string }) => Promise<void>;
  initialData?: Vendor | null;
  isLoading?: boolean;
}

export const VendorFormModal: React.FC<VendorFormModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  isLoading = false,
}) => {
  const isEditing = Boolean(initialData);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<VendorFormValues>({
    resolver: zodResolver(vendorSchema),
    defaultValues: initialData
      ? {
          companyName: initialData.companyName,
          contactPerson: initialData.contactPerson,
          email: initialData.email,
          phone: initialData.phone,
          address: initialData.address,
          registrationNumber: initialData.registrationNumber,
          gstNumber: initialData.gstNumber || '',
          bankAccountNumber: initialData.bankAccountNumber || '',
          ifscCode: initialData.ifscCode || '',
          changeReason: '',
        }
      : {
          companyName: '',
          contactPerson: '',
          email: '',
          phone: '',
          address: '',
          registrationNumber: '',
          gstNumber: '',
          bankAccountNumber: '',
          ifscCode: '',
          changeReason: '',
        },
  });

  React.useEffect(() => {
    if (initialData) {
      reset({
        companyName: initialData.companyName,
        contactPerson: initialData.contactPerson,
        email: initialData.email,
        phone: initialData.phone,
        address: initialData.address,
        registrationNumber: initialData.registrationNumber,
        gstNumber: initialData.gstNumber || '',
        bankAccountNumber: initialData.bankAccountNumber || '',
        ifscCode: initialData.ifscCode || '',
        changeReason: '',
      });
    } else {
      reset({
        companyName: '',
        contactPerson: '',
        email: '',
        phone: '',
        address: '',
        registrationNumber: '',
        gstNumber: '',
        bankAccountNumber: '',
        ifscCode: '',
        changeReason: '',
      });
    }
  }, [initialData, reset]);

  const handleFormSubmit = async (values: VendorFormValues) => {
    const payload: Record<string, any> = {
      companyName: values.companyName?.trim(),
      contactPerson: values.contactPerson?.trim(),
      email: values.email?.trim(),
      phone: values.phone?.trim(),
      address: values.address?.trim(),
      registrationNumber: values.registrationNumber?.trim(),
    };
    if (values.gstNumber && values.gstNumber.trim()) {
      payload.gstNumber = values.gstNumber.trim();
    }
    if (values.bankAccountNumber && values.bankAccountNumber.trim()) {
      payload.bankAccountNumber = values.bankAccountNumber.trim();
    }
    if (values.ifscCode && values.ifscCode.trim()) {
      payload.ifscCode = values.ifscCode.trim();
    }
    if (values.changeReason && values.changeReason.trim()) {
      payload.changeReason = values.changeReason.trim();
    }

    await onSubmit(payload as CreateVendorInput & { changeReason?: string });
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? 'Edit Vendor Details' : 'Register New Vendor'}
      description={
        isEditing
          ? 'Updating vendor information will automatically create an immutable version history snapshot.'
          : 'Enter official business details to begin automated AI compliance verification.'
      }
      maxWidth="xl"
    >
      <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
              Company Name *
            </label>
            <input
              {...register('companyName')}
              type="text"
              placeholder="e.g. Apex Global Solutions Pvt Ltd"
              className="w-full px-3.5 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
            {errors.companyName && (
              <p className="text-xs text-red-600 mt-1">{errors.companyName.message}</p>
            )}
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
              Registration Number *
            </label>
            <input
              {...register('registrationNumber')}
              type="text"
              placeholder="e.g. U72200MH2021PTC123456"
              className="w-full px-3.5 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
            {errors.registrationNumber && (
              <p className="text-xs text-red-600 mt-1">{errors.registrationNumber.message}</p>
            )}
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
              Contact Person *
            </label>
            <input
              {...register('contactPerson')}
              type="text"
              placeholder="e.g. Rahul Sharma"
              className="w-full px-3.5 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
            {errors.contactPerson && (
              <p className="text-xs text-red-600 mt-1">{errors.contactPerson.message}</p>
            )}
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
              Business Email *
            </label>
            <input
              {...register('email')}
              type="email"
              placeholder="rahul@apexglobal.com"
              className="w-full px-3.5 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
            {errors.email && (
              <p className="text-xs text-red-600 mt-1">{errors.email.message}</p>
            )}
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
              Phone Number (10 digits) *
            </label>
            <input
              {...register('phone')}
              type="tel"
              placeholder="9876543210"
              className="w-full px-3.5 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
            {errors.phone && (
              <p className="text-xs text-red-600 mt-1">{errors.phone.message}</p>
            )}
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
              GST Number (Optional)
            </label>
            <input
              {...register('gstNumber')}
              type="text"
              placeholder="e.g. 27AABCU9603R1Z1"
              className="w-full px-3.5 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
              Bank Account Number
            </label>
            <input
              {...register('bankAccountNumber')}
              type="text"
              placeholder="e.g. 123456789012"
              className="w-full px-3.5 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
              IFSC Code
            </label>
            <input
              {...register('ifscCode')}
              type="text"
              placeholder="e.g. HDFC0001234"
              className="w-full px-3.5 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
              Registered Address *
            </label>
            <textarea
              {...register('address')}
              rows={2}
              placeholder="Full registered address (e.g. 123 Main Street, Mumbai, Maharashtra 400001)"
              className="w-full px-3.5 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
            {errors.address && (
              <p className="text-xs text-red-600 mt-1">{errors.address.message}</p>
            )}
          </div>

          {isEditing && (
            <div className="md:col-span-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-amber-800 mb-1">
                Reason for Change (Logged in Version Audit Trail)
              </label>
              <input
                {...register('changeReason')}
                type="text"
                placeholder="e.g. Updated GSTIN and corrected bank account number per official certificate"
                className="w-full px-3.5 py-2 border border-amber-300 bg-amber-50/50 rounded-lg text-sm focus:ring-2 focus:ring-amber-500 focus:outline-none"
              />
            </div>
          )}
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
          <Button type="button" variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" variant="royal" isLoading={isLoading}>
            {isEditing ? 'Save Changes' : 'Create Vendor'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
