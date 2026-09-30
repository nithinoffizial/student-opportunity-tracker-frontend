import { useState, useEffect, useMemo } from 'react';
import {
  Bell,
  CheckCircle2,
  Clock,
  CalendarClock,
  Plus,
  Search,
} from 'lucide-react';
import { getReminders, getTodayReminders, createReminder } from '../api/reminderApi';
import { getApplications } from '../api/applicationApi';
import Modal from '../components/shared/Modal';
import LoadingState from '../components/shared/LoadingState';
import EmptyState from '../components/shared/EmptyState';
import ErrorState from '../components/shared/ErrorState';
import { useToast } from '../context/ToastContext';
import { formatDate, todayString } from '../utils/dateUtils';

const initialForm = {
  applicationId: '',
  reminderDate: todayString(),
};

export default function RemindersPage() {
  const [reminders, setReminders] = useState([]);
  const [todayReminders, setTodayReminders] = useState([]);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState(initialForm);
  const [formErrors, setFormErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const toast = useToast();

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [allRes, todayRes, appRes] = await Promise.all([
        getReminders(),
        getTodayReminders(),
        getApplications(),
      ]);
      setReminders(allRes.data);
      setTodayReminders(todayRes.data);
      setApplications(appRes.data);
    } catch (err) {
      setError(err.userMessage || 'Failed to load reminders.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const filteredReminders = useMemo(() => {
    if (!search) return reminders;
    const q = search.toLowerCase();
    return reminders.filter(
      (r) =>
        r.application?.opportunity?.title?.toLowerCase().includes(q) ||
        r.application?.opportunity?.company?.toLowerCase().includes(q) ||
        r.application?.student?.name?.toLowerCase().includes(q)
    );
  }, [reminders, search]);

  const scheduled = filteredReminders.filter((r) => !r.sent);
  const sent = filteredReminders.filter((r) => r.sent);

  const validateForm = () => {
    const errs = {};
    if (!form.applicationId) errs.applicationId = 'Please select an application';
    if (!form.reminderDate) errs.reminderDate = 'Please select a reminder date';
    setFormErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    setSubmitting(true);
    try {
      await createReminder({
        application: { id: Number(form.applicationId) },
        reminderDate: form.reminderDate,
        sent: false,
      });
      toast.success('Reminder scheduled successfully!');
      setModalOpen(false);
      setForm(initialForm);
      setFormErrors({});
      fetchData();
    } catch (err) {
      const msg = err.userMessage || 'Failed to create reminder.';
      toast.error(typeof msg === 'string' ? msg : JSON.stringify(msg));
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <LoadingState message="Loading reminders..." />;
  if (error) return <ErrorState message={error} onRetry={fetchData} />;

  return (
    <div className="page">
      {/* Toolbar */}
      <div className="page__toolbar">
        <div className="page__search">
          <Search size={18} className="page__search-icon" />
          <input
            type="text"
            className="page__search-input"
            placeholder="Search reminders..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            aria-label="Search reminders"
          />
        </div>
        <div className="page__filters">
          <button className="btn btn--primary" type="button" onClick={() => setModalOpen(true)} aria-label="Schedule Reminder">
            <Plus size={18} />
            <span className="btn__label">Schedule Reminder</span>
          </button>
        </div>
      </div>

      {/* Today's Reminders */}
      <section className="reminders-section">
        <div className="section-header">
          <h2 className="section-header__title">
            <CalendarClock size={18} /> Today's Reminders
          </h2>
          {todayReminders.length > 0 && (
            <span className="section-header__count">{todayReminders.length}</span>
          )}
        </div>
        {todayReminders.length === 0 ? (
          <EmptyState
            icon={Bell}
            title="No reminders for today"
            message="You're all caught up for today!"
          />
        ) : (
          <div className="reminder-grid">
            {todayReminders.map((r) => (
              <div key={r.id} className="reminder-card reminder-card--today">
                <div className="reminder-card__icon">
                  <Bell size={20} />
                </div>
                <div className="reminder-card__content">
                  <h3 className="reminder-card__title">
                    {r.application?.opportunity?.title || 'Opportunity'}
                  </h3>
                  <p className="reminder-card__sub">
                    {r.application?.opportunity?.company || ''}
                    {r.application?.student?.name ? ` · ${r.application.student.name}` : ''}
                  </p>
                  <p className="reminder-card__date">
                    <Clock size={13} /> {formatDate(r.reminderDate)}
                  </p>
                </div>
                <div className="reminder-card__status">
                  {r.sent ? (
                    <span className="reminder-badge reminder-badge--sent">
                      <CheckCircle2 size={14} /> Sent
                    </span>
                  ) : (
                    <span className="reminder-badge reminder-badge--scheduled">
                      <Clock size={14} /> Scheduled
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Scheduled Reminders */}
      <section className="reminders-section">
        <div className="section-header">
          <h2 className="section-header__title">
            <Clock size={18} /> Scheduled Reminders
          </h2>
          <span className="section-header__count">{scheduled.length}</span>
        </div>
        {scheduled.length === 0 ? (
          <EmptyState
            icon={Clock}
            title="No scheduled reminders"
            message={reminders.length === 0 ? 'Schedule your first reminder to stay on track.' : 'No scheduled reminders match your search.'}
          />
        ) : (
          <div className="reminder-grid">
            {scheduled.map((r) => (
              <div key={r.id} className="reminder-card">
                <div className="reminder-card__icon">
                  <Clock size={20} />
                </div>
                <div className="reminder-card__content">
                  <h3 className="reminder-card__title">
                    {r.application?.opportunity?.title || 'Opportunity'}
                  </h3>
                  <p className="reminder-card__sub">
                    {r.application?.opportunity?.company || ''}
                    {r.application?.student?.name ? ` · ${r.application.student.name}` : ''}
                  </p>
                  <p className="reminder-card__date">
                    <Clock size={13} /> {formatDate(r.reminderDate)}
                  </p>
                </div>
                <div className="reminder-card__status">
                  <span className="reminder-badge reminder-badge--scheduled">
                    <Clock size={14} /> Scheduled
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Sent Reminders */}
      <section className="reminders-section">
        <div className="section-header">
          <h2 className="section-header__title">
            <CheckCircle2 size={18} /> Sent Reminders
          </h2>
          <span className="section-header__count">{sent.length}</span>
        </div>
        {sent.length === 0 ? (
          <EmptyState
            icon={CheckCircle2}
            title="No sent reminders"
            message="Reminders sent by the email reminder system will appear here."
          />
        ) : (
          <div className="reminder-grid">
            {sent.map((r) => (
              <div key={r.id} className="reminder-card reminder-card--sent">
                <div className="reminder-card__icon reminder-card__icon--sent">
                  <CheckCircle2 size={20} />
                </div>
                <div className="reminder-card__content">
                  <h3 className="reminder-card__title">
                    {r.application?.opportunity?.title || 'Opportunity'}
                  </h3>
                  <p className="reminder-card__sub">
                    {r.application?.opportunity?.company || ''}
                    {r.application?.student?.name ? ` · ${r.application.student.name}` : ''}
                  </p>
                  <p className="reminder-card__date">
                    <Clock size={13} /> {formatDate(r.reminderDate)}
                  </p>
                </div>
                <div className="reminder-card__status">
                  <span className="reminder-badge reminder-badge--sent">
                    <CheckCircle2 size={14} /> Sent
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Schedule Reminder Modal */}
      <Modal
        open={modalOpen}
        title="Schedule Reminder"
        onClose={() => {
          setModalOpen(false);
          setFormErrors({});
          setForm(initialForm);
        }}
      >
        <form className="form" onSubmit={handleSubmit} noValidate>
          <div className="form__group">
            <label className="form__label" htmlFor="reminder-app">
              Application *
            </label>
            <select
              id="reminder-app"
              className={`form__input ${formErrors.applicationId ? 'form__input--error' : ''}`}
              value={form.applicationId}
              onChange={(e) => setForm({ ...form, applicationId: e.target.value })}
            >
              <option value="">Select an application</option>
              {applications.map((app) => (
                <option key={app.id} value={app.id}>
                  {app.opportunity?.title || 'Opportunity'} ({app.opportunity?.company || 'Company'}) — {app.student?.name || 'Student'}
                </option>
              ))}
            </select>
            {formErrors.applicationId && (
              <span className="form__error">{formErrors.applicationId}</span>
            )}
          </div>

          <div className="form__group">
            <label className="form__label" htmlFor="reminder-date">
              Reminder Date *
            </label>
            <input
              id="reminder-date"
              type="date"
              className={`form__input ${formErrors.reminderDate ? 'form__input--error' : ''}`}
              value={form.reminderDate}
              onChange={(e) => setForm({ ...form, reminderDate: e.target.value })}
            />
            {formErrors.reminderDate && (
              <span className="form__error">{formErrors.reminderDate}</span>
            )}
          </div>

          <div className="form__actions">
            <button
              type="button"
              className="btn btn--ghost"
              onClick={() => {
                setModalOpen(false);
                setFormErrors({});
                setForm(initialForm);
              }}
            >
              Cancel
            </button>
            <button type="submit" className="btn btn--primary" disabled={submitting}>
              {submitting ? 'Scheduling...' : 'Schedule Reminder'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
