import React, { useState } from 'react';
import { AlertTriangle, Phone, X } from 'lucide-react';

export const EmergencyBanner: React.FC = () => {
  const [collapsed, setCollapsed] = useState(false);

  if (collapsed) {
    return (
      <div className="bg-rose-900 text-rose-100 px-4 py-1.5 text-xs flex justify-between items-center no-print">
        <div className="flex items-center gap-2">
          <AlertTriangle className="w-3.5 h-3.5 text-rose-300" />
          <span>Experiencing a medical emergency? Call <strong>112</strong> (India) or your local emergency number.</span>
        </div>
        <button
          onClick={() => setCollapsed(false)}
          className="text-xs underline text-rose-200 hover:text-white"
        >
          View Emergency Guide
        </button>
      </div>
    );
  }

  return (
    <div className="bg-rose-600 text-white px-4 py-2.5 shadow-md no-print relative transition-all">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-3 text-left">
          <div className="p-2 bg-rose-700 rounded-full flex-shrink-0 animate-pulse">
            <AlertTriangle className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className="text-sm font-semibold tracking-wide flex items-center gap-2">
              EMERGENCY MEDICAL WARNING
              <span className="bg-rose-800 text-rose-100 text-xs px-2 py-0.5 rounded-full font-normal">Immediate Action</span>
            </p>
            <p className="text-xs text-rose-100">
              If you or someone with you has crushing chest pain, difficulty breathing, slurred speech, or heavy bleeding, call emergency services immediately.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
          <a
            href="tel:112"
            className="flex items-center justify-center gap-2 bg-white text-rose-700 hover:bg-rose-50 font-bold px-4 py-1.5 rounded-lg text-sm shadow transition-colors"
          >
            <Phone className="w-4 h-4 fill-rose-600" />
            <span>Call 112 (India)</span>
          </a>
          <button
            onClick={() => setCollapsed(true)}
            aria-label="Dismiss banner"
            className="text-rose-200 hover:text-white p-1 rounded-md"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

