import React from 'react';
import { ShieldCheck, Sparkles, Bell, UserCircle2 } from 'lucide-react';
import { Badge } from '../common/Badge';

export const Header: React.FC = () => {
  return (
    <header className="h-16 bg-white border-b border-slate-200 px-6 flex items-center justify-between sticky top-0 z-30 shadow-sm">
      {/* Brand Identity */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-slate-900 via-blue-900 to-blue-700 flex items-center justify-center text-white shadow-md border border-slate-700/30">
          <ShieldCheck className="w-6 h-6 text-amber-400" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-base font-bold text-slate-900 tracking-tight">
              LEXVERIFY
            </h1>
            <Badge variant="gold" size="sm" className="gap-1 shadow-xs">
              <Sparkles className="w-3 h-3 text-amber-600" />
              AI Verified
            </Badge>
          </div>
          <p className="text-xs text-slate-500 font-medium">
            Vendor Verification & Compliance Workspace
          </p>
        </div>
      </div>

      {/* System Status & Profile */}
      <div className="flex items-center gap-4">
        <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-50 border border-slate-200 text-xs font-medium text-slate-600">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>OpenCorporates API: Connected</span>
        </div>

        <button
          className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors relative"
          title="Notifications"
        >
          <Bell className="w-5 h-5" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-blue-600" />
        </button>

        <div className="flex items-center gap-2.5 pl-3 border-l border-slate-200">
          <div className="w-8 h-8 rounded-full bg-slate-100 border border-slate-300 flex items-center justify-center text-slate-700">
            <UserCircle2 className="w-6 h-6 text-slate-600" />
          </div>
          <div className="hidden md:block text-left">
            <div className="text-xs font-semibold text-slate-900 leading-tight">
              Senior Compliance Reviewer
            </div>
            <div className="text-[11px] text-slate-500 leading-tight">
              review@lextigress.com
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
