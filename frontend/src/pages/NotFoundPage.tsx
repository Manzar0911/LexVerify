import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/common/Button';
import { ShieldAlert } from 'lucide-react';

export const NotFoundPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="py-24 text-center">
      <div className="w-16 h-16 rounded-3xl bg-red-50 border border-red-200 flex items-center justify-center text-red-600 mx-auto mb-4">
        <ShieldAlert className="w-8 h-8" />
      </div>
      <h2 className="text-2xl font-bold text-slate-900">404 - Workspace Page Not Found</h2>
      <p className="text-xs text-slate-500 mt-1 mb-6 max-w-sm mx-auto">
        The compliance resource or vendor link you requested does not exist or has been relocated.
      </p>
      <Button variant="royal" onClick={() => navigate('/')}>
        Return to Vendor Portfolio
      </Button>
    </div>
  );
};
