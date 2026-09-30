import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Briefcase,
  FileText,
  Star,
  Send,
  Award,
  CheckCircle2,
  Clock,
  Bell,
  ArrowRight,
  TrendingUp,
} from 'lucide-react';
import { getOpportunities } from '../api/opportunityApi';
import { getApplications } from '../api/applicationApi';
import { getReminders, getTodayReminders } from '../api/reminderApi';
import StatCard from '../components/shared/StatCard';
import StatusBadge from '../components/shared/StatusBadge';
import LoadingState from '../components/shared/LoadingState';
import ErrorState from '../components/shared/ErrorState';
import EmptyState from '../components/shared/EmptyState';
import { formatDate, deadlineLabel, deadlineUrgency, daysRemaining } from '../utils/dateUtils';

export default function Dashboard() {
  const [opportunities, setOpportunities] = useState([]);
  const [applications, setApplications] = useState([]);
  const [reminders, setReminders] = useState([]);
  const [todayReminders, setTodayReminders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [oppRes, appRes, remRes, todayRes] = await Promise.all([
        getOpportunities(),
        getApplications(),
        getReminders(),
        getTodayReminders(),
      ]);
      setOpportunities(oppRes.data);
      setApplications(appRes.data);
      setReminders(remRes.data);
      setTodayReminders(todayRes.data);
    } catch (err) {
      setError(err.userMessage || 'Failed to load dashboard data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  if (loading) return <LoadingState message="Loading dashboard..." />;
  if (error) return <ErrorState message={error} onRetry={fetchData} />;

  const statusCount = (status) => applications.filter((a) => a.status === status).length;

  const upcomingOpportunities = [...opportunities]
    .filter((o) => daysRemaining(o.deadline) >= 0)
    .sort((a, b) => daysRemaining(a.deadline) - daysRemaining(b.deadline))
    .slice(0, 5);

  const recentApplications = [...applications].slice(-5).reverse();

  const upcomingReminders = [...reminders]
    .filter((r) => !r.sent)
    .sort((a, b) => (a.reminderDate > b.reminderDate ? 1 : -1))
    .slice(0, 5);

  // Status distribution for visual bar
  const statuses = [
    { key: 'INTERESTED', label: 'Interested', color: 'var(--color-interested)', count: statusCount('INTERESTED') },
    { key: 'APPLIED', label: 'Applied', color: 'var(--color-applied)', count: statusCount('APPLIED') },
    { key: 'SHORTLISTED', label: 'Shortlisted', color: 'var(--color-shortlisted)', count: statusCount('SHORTLISTED') },
    { key: 'SELECTED', label: 'Selected', color: 'var(--color-selected)', count: statusCount('SELECTED') },
    { key: 'REJECTED', label: 'Rejected', color: 'var(--color-rejected)', count: statusCount('REJECTED') },
  ];
  const totalApps = applications.length;

  return (
    <div className="dashboard">
      {/* Summary cards */}
      <div className="dashboard__stats">
        <StatCard icon={Briefcase} label="Opportunities" value={opportunities.length} accent="primary" />
        <StatCard icon={FileText} label="Applications" value={applications.length} accent="secondary" />
        <StatCard icon={Star} label="Interested" value={statusCount('INTERESTED')} accent="interested" />
        <StatCard icon={Send} label="Applied" value={statusCount('APPLIED')} accent="applied" />
        <StatCard icon={Award} label="Shortlisted" value={statusCount('SHORTLISTED')} accent="shortlisted" />
        <StatCard icon={CheckCircle2} label="Selected" value={statusCount('SELECTED')} accent="selected" />
      </div>

      {/* Status distribution */}
      {totalApps > 0 && (
        <div className="dashboard__section">
          <div className="section-header">
            <h2 className="section-header__title"><TrendingUp size={18} /> Application Status Overview</h2>
          </div>
          <div className="status-distribution">
            <div className="status-distribution__bar">
              {statuses.map((s) =>
                s.count > 0 ? (
                  <div
                    key={s.key}
                    className="status-distribution__segment"
                    style={{ flex: s.count, backgroundColor: s.color }}
                    title={`${s.label}: ${s.count}`}
                  />
                ) : null
              )}
            </div>
            <div className="status-distribution__legend">
              {statuses.map((s) => (
                <div key={s.key} className="status-distribution__item">
                  <span className="status-distribution__dot" style={{ backgroundColor: s.color }} />
                  <span className="status-distribution__label">{s.label}</span>
                  <span className="status-distribution__count">{s.count}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Today's Reminders */}
      {todayReminders.length > 0 && (
        <div className="dashboard__section dashboard__section--highlight">
          <div className="section-header">
            <h2 className="section-header__title"><Bell size={18} /> Today's Reminders</h2>
          </div>
          <div className="dashboard__reminder-list">
            {todayReminders.map((r) => (
              <Link to="/reminders" key={r.id} className="reminder-mini">
                <Bell size={16} className="reminder-mini__icon" />
                <div className="reminder-mini__info">
                  <span className="reminder-mini__title">
                    {r.application?.opportunity?.title || 'Opportunity'}
                  </span>
                  <span className="reminder-mini__sub">
                    {r.application?.opportunity?.company || ''}
                  </span>
                </div>
                <StatusBadge status={r.sent ? 'SENT' : 'SCHEDULED'} />
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Two-column grid: Upcoming Opportunities & Recent Applications */}
      <div className="dashboard__grid">
        {/* Upcoming Opportunities */}
        <div className="dashboard__section">
          <div className="section-header">
            <h2 className="section-header__title"><Clock size={18} /> Upcoming Deadlines</h2>
            <Link to="/opportunities" className="section-header__link">
              View all <ArrowRight size={14} />
            </Link>
          </div>
          {upcomingOpportunities.length === 0 ? (
            <EmptyState title="No upcoming deadlines" message="Add your first opportunity to get started." />
          ) : (
            <div className="dashboard__list">
              {upcomingOpportunities.map((opp) => (
                <Link to="/opportunities" key={opp.id} className="opp-mini">
                  <div className="opp-mini__info">
                    <span className="opp-mini__title">{opp.title}</span>
                    <span className="opp-mini__company">{opp.company}</span>
                  </div>
                  <div className={`opp-mini__deadline opp-mini__deadline--${deadlineUrgency(opp.deadline)}`}>
                    {deadlineLabel(opp.deadline)}
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Recent Applications */}
        <div className="dashboard__section">
          <div className="section-header">
            <h2 className="section-header__title"><FileText size={18} /> Recent Applications</h2>
            <Link to="/applications" className="section-header__link">
              View all <ArrowRight size={14} />
            </Link>
          </div>
          {recentApplications.length === 0 ? (
            <EmptyState title="No applications yet" message="Start tracking your applications." />
          ) : (
            <div className="dashboard__list">
              {recentApplications.map((app) => (
                <Link to="/applications" key={app.id} className="app-mini">
                  <div className="app-mini__info">
                    <span className="app-mini__title">
                      {app.opportunity?.title || 'Opportunity'}
                    </span>
                    <span className="app-mini__sub">
                      {app.opportunity?.company || ''} · {formatDate(app.appliedDate)}
                    </span>
                  </div>
                  <StatusBadge status={app.status} />
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Upcoming Reminders */}
      <div className="dashboard__section">
        <div className="section-header">
          <h2 className="section-header__title"><Bell size={18} /> Upcoming Reminders</h2>
          <Link to="/reminders" className="section-header__link">
            View all <ArrowRight size={14} />
          </Link>
        </div>
        {upcomingReminders.length === 0 ? (
          <EmptyState title="No upcoming reminders" message="Reminders you create will appear here." />
        ) : (
          <div className="dashboard__list">
            {upcomingReminders.map((r) => (
              <Link to="/reminders" key={r.id} className="reminder-mini">
                <Bell size={16} className="reminder-mini__icon" />
                <div className="reminder-mini__info">
                  <span className="reminder-mini__title">
                    {r.application?.opportunity?.title || 'Opportunity'}
                  </span>
                  <span className="reminder-mini__sub">
                    {formatDate(r.reminderDate)}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
