import React from 'react';
import { ShieldAlert } from 'lucide-react';

export const DisclaimerBanner: React.FC = () => {
  return (
    <div className="bg-amber-50 border-b border-amber-200 text-amber-900 px-4 py-2 text-xs no-print">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <ShieldAlert className="w-4 h-4 text-amber-600 flex-shrink-0" />
          <span>
            <strong>Educational Companion Only:</strong> Medisense does not provide definitive medical diagnoses, prescriptions, or replace clinical consultation with a qualified doctor.
          </span>
        </div>
        <span className="hidden md:inline-block text-amber-700 bg-amber-100 px-2 py-0.5 rounded font-medium">
          Verified Safety Guardrails Active
        </span>
      </div>
    </div>
  );
};

