import React from 'react';
import { Icon } from './Icons';

export const Toast = ({ message, type = 'info', onClose }) => {
  if (!message) return null;

  const bgColors = {
    success: 'border-emerald-500/40 bg-emerald-950/90 text-emerald-200',
    error: 'border-rose-500/40 bg-rose-950/90 text-rose-200',
    info: 'border-sky-500/40 bg-sky-950/90 text-sky-200',
    warning: 'border-amber-500/40 bg-amber-950/90 text-amber-200'
  };

  return (
    <div className={`toast-notification toast-${type}`}>
      <div className="toast-content">
        <span className="toast-icon">
          {type === 'success' && <Icon name="checkCircle" size={18} color="#10b981" />}
          {type === 'error' && <Icon name="alert" size={18} color="#f43f5e" />}
          {type === 'info' && <Icon name="sparkles" size={18} color="#38bdf8" />}
          {type === 'warning' && <Icon name="alert" size={18} color="#f59e0b" />}
        </span>
        <span className="toast-message">{message}</span>
      </div>
      {onClose && (
        <button onClick={onClose} className="toast-close" title="Dismiss">
          <Icon name="close" size={14} />
        </button>
      )}
    </div>
  );
};
