import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  Building2,
  FileCheck,
  History,
  CheckSquare2,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { useUIStore } from '../../store/ui.store';
import { clsx } from 'clsx';

export const Sidebar: React.FC = () => {
  const { sidebarOpen, toggleSidebar } = useUIStore();

  const navItems = [
    {
      label: 'All Vendors',
      to: '/',
      icon: <Building2 className="w-5 h-5 flex-shrink-0" />,
    },
    {
      label: 'Document Queue',
      to: '/?tab=documents',
      icon: <FileCheck className="w-5 h-5 flex-shrink-0" />,
    },
    {
      label: 'Pending Tasks',
      to: '/?tab=tasks',
      icon: <CheckSquare2 className="w-5 h-5 flex-shrink-0" />,
    },
  ];

  return (
    <aside
      className={clsx(
        'bg-slate-900 text-slate-300 flex flex-col justify-between border-r border-slate-800 transition-all duration-300 z-20 select-none',
        sidebarOpen ? 'w-64' : 'w-20'
      )}
    >
      {/* Navigation section */}
      <div className="p-3">
        <div className="flex items-center justify-between px-3 py-4 mb-2">
          {sidebarOpen ? (
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Navigation
            </span>
          ) : (
            <span className="w-full text-center text-xs font-bold text-slate-400">•</span>
          )}
          <button
            onClick={toggleSidebar}
            className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            title={sidebarOpen ? 'Collapse Sidebar' : 'Expand Sidebar'}
          >
            {sidebarOpen ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
          </button>
        </div>

        <nav className="space-y-1.5">
          {navItems.map((item) => (
            <NavLink
              key={item.label}
              to={item.to}
              className={({ isActive }) =>
                clsx(
                  'flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-medium text-sm transition-all',
                  isActive
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/80'
                )
              }
            >
              {item.icon}
              {sidebarOpen && <span>{item.label}</span>}
            </NavLink>
          ))}
        </nav>
      </div>

      {/* Footer Info Box */}
      <div className="p-4 border-t border-slate-800">
        {sidebarOpen ? (
          <div className="rounded-xl bg-slate-800/60 p-3.5 border border-slate-700/50">

          </div>
        ) : (
          <div className="flex justify-center text-slate-500">
            <History className="w-5 h-5" />
          </div>
        )}
      </div>
    </aside>
  );
};
