import React, { useState } from 'react';
import { VendorVersion } from '../../models/version.model';
import { Button } from '../common/Button';
import { Badge } from '../common/Badge';
import { History, RotateCcw, X, Clock } from 'lucide-react';

interface VersionHistoryDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  versions: VendorVersion[];
  onRestore: (versionNumber: number) => Promise<void>;
  isRestoring?: boolean;
}

export const VersionHistoryDrawer: React.FC<VersionHistoryDrawerProps> = ({
  isOpen,
  onClose,
  versions,
  onRestore,
  isRestoring = false,
}) => {
  const [selectedVersion, setSelectedVersion] = useState<VendorVersion | null>(null);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Drawer */}
      <div className="relative w-full max-w-xl bg-white h-full shadow-2xl z-10 flex flex-col overflow-hidden animate-in slide-in-from-right duration-200">
        {/* Header */}
        <div className="p-6 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center">
              <History className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Immutable Version Audit Trail</h3>
              <p className="text-xs text-slate-500">
                Append-only snapshots tracked per modification and restore event.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content list */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {versions.length === 0 ? (
            <div className="text-center py-12 text-slate-400">
              <Clock className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p className="text-xs">No modification history recorded yet.</p>
            </div>
          ) : (
            versions.map((ver) => {
              const isSelected = selectedVersion?.id === ver.id;

              return (
                <div
                  key={ver.id}
                  className={`p-4 rounded-xl border transition-all ${
                    isSelected
                      ? 'border-blue-500 bg-blue-50/40 ring-1 ring-blue-500'
                      : 'border-slate-200 hover:border-slate-300 bg-white'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-slate-900">
                        Version {ver.versionNumber}
                      </span>
                      {ver.versionNumber === versions[0]?.versionNumber && (
                        <Badge variant="gold" size="sm">
                          Current
                        </Badge>
                      )}
                    </div>
                    <span className="text-[11px] text-slate-400">
                      {new Date(ver.changedAt).toLocaleString()}
                    </span>
                  </div>

                  {ver.fieldName && (
                    <div className="text-xs bg-slate-50 p-2.5 rounded-lg border border-slate-100 mb-2.5 space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-slate-500 font-medium">Modified Field:</span>
                        <span className="font-mono font-bold text-slate-800">{ver.fieldName}</span>
                      </div>
                      {ver.previousValue && (
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="text-slate-400">Previous:</span>
                          <span className="text-red-600 line-through truncate max-w-[220px]">
                            {ver.previousValue}
                          </span>
                        </div>
                      )}
                      {ver.newValue && (
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="text-slate-400">New Value:</span>
                          <span className="text-emerald-700 font-semibold truncate max-w-[220px]">
                            {ver.newValue}
                          </span>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
                    <button
                      type="button"
                      onClick={() =>
                        setSelectedVersion(isSelected ? null : ver)
                      }
                      className="text-blue-600 font-semibold hover:underline"
                    >
                      {isSelected ? 'Hide Snapshot JSON' : 'Inspect Snapshot JSON'}
                    </button>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onRestore(ver.versionNumber)}
                      isLoading={isRestoring}
                      leftIcon={<RotateCcw className="w-3 h-3 text-slate-500" />}
                      className="text-xs py-1"
                    >
                      Restore to v{ver.versionNumber}
                    </Button>
                  </div>

                  {/* Snapshot JSON Details */}
                  {isSelected && (
                    <div className="mt-3 p-3 bg-slate-900 text-slate-100 rounded-lg font-mono text-[11px] overflow-x-auto max-h-48">
                      <pre>{JSON.stringify(ver.snapshot, null, 2)}</pre>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
