import React from 'react';

export default function ToastContainer({ toasts }) {
  if (!toasts || toasts.length === 0) return null;

  return (
    <div className="cyber-toast-container">
      {toasts.map(t => (
        <div key={t.id} className="cyber-toast">
          {t.text}
        </div>
      ))}
    </div>
  );
}
