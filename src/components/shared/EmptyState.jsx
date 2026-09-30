import { Inbox } from 'lucide-react';

export default function EmptyState({ icon: Icon = Inbox, title = 'No data yet', message = '' }) {
  return (
    <div className="state-container state-container--empty">
      <Icon className="state-icon state-icon--empty" size={48} />
      <h3 className="state-title">{title}</h3>
      {message && <p className="state-message">{message}</p>}
    </div>
  );
}
