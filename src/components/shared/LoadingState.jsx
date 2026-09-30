import { Loader2 } from 'lucide-react';

export default function LoadingState({ message = 'Loading...' }) {
  return (
    <div className="state-container state-container--loading">
      <Loader2 className="state-icon state-icon--spin" size={36} />
      <p className="state-message">{message}</p>
    </div>
  );
}
