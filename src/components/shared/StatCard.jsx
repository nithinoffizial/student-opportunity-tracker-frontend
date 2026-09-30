export default function StatCard({ icon: Icon, label, value, accent = 'primary' }) {
  return (
    <div className={`stat-card stat-card--${accent}`}>
      <div className="stat-card__icon-wrap">
        <Icon size={22} />
      </div>
      <div className="stat-card__content">
        <span className="stat-card__value">{value}</span>
        <span className="stat-card__label">{label}</span>
      </div>
    </div>
  );
}
