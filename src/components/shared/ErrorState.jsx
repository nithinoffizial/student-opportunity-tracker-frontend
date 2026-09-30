import { AlertTriangle, RefreshCw } from 'lucide-react';

export default function ErrorState({ message = 'Something went wrong.', onRetry }) {
  return (
    <div className="state-container state-container--error">
      <AlertTriangle className="state-icon state-icon--error" size={40} />
      <h3 className="state-title">Error</h3>
      <p className="state-message">{message}</p>
      {onRetry && (
        <button className="btn btn--secondary" type="button" onClick={onRetry}>
          <RefreshCw size={16} />
          Try again
        </button>
      )}
    </div>
  );
}
