import { useEffect, useRef } from 'react';
import { AlertTriangle, X } from 'lucide-react';

export default function ConfirmDialog({ open, title, message, confirmLabel = 'Delete', onConfirm, onCancel, loading = false }) {
  const dialogRef = useRef(null);

  useEffect(() => {
    if (open) {
      dialogRef.current?.focus();
    }
  }, [open]);

  if (!open) return null;

  return (
    <div className="modal-overlay" onClick={onCancel} role="presentation">
      <div
        className="modal modal--confirm"
        onClick={(e) => e.stopPropagation()}
        ref={dialogRef}
        tabIndex={-1}
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="confirm-title"
        aria-describedby="confirm-message"
      >
        <div className="modal__header modal__header--warn">
          <AlertTriangle size={20} className="modal__header-icon" />
          <h2 id="confirm-title" className="modal__title">{title}</h2>
          <button className="modal__close" type="button" onClick={onCancel} aria-label="Cancel">
            <X size={18} />
          </button>
        </div>
        <div className="modal__body">
          <p id="confirm-message">{message}</p>
        </div>
        <div className="modal__footer">
          <button className="btn btn--ghost" type="button" onClick={onCancel} disabled={loading}>
            Cancel
          </button>
          <button className="btn btn--danger" type="button" onClick={onConfirm} disabled={loading}>
            {loading ? 'Deleting...' : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
