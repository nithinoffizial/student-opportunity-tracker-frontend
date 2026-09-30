export default function StatusBadge({ status }) {
  const label = status ? status.replace(/_/g, ' ') : 'Unknown';
  const modifier = status ? status.toLowerCase() : 'unknown';
  return (
    <span className={`status-badge status-badge--${modifier}`} role="status">
      {label}
    </span>
  );
}
