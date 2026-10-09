import React from 'react';
import { CheckCircle2, Info, AlertCircle } from 'lucide-react';

export default function Toast({ message, type = 'success' }) {
  if (!message) return null;

  return (
    <div className="toast-notification">
      {type === 'success' && <CheckCircle2 size={18} color="#10b981" />}
      {type === 'info' && <Info size={18} color="#818cf8" />}
      {type === 'error' && <AlertCircle size={18} color="#ef4444" />}
      <span style={{ fontSize: '0.88rem', fontWeight: 600, color: '#f3f4f6' }}>{message}</span>
    </div>
  );
}
