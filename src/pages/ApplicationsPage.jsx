import { useState, useEffect, useMemo } from 'react';
import {
  Plus,
  Search,
  Trash2,
  Filter,
  FileText,
  Clock,
} from 'lucide-react';
import { getApplications, createApplication, deleteApplication } from '../api/applicationApi';
import { getStudents } from '../api/studentApi';
import { getOpportunities } from '../api/opportunityApi';
import Modal from '../components/shared/Modal';
import ConfirmDialog from '../components/shared/ConfirmDialog';
import StatusBadge from '../components/shared/StatusBadge';
import LoadingState from '../components/shared/LoadingState';
import EmptyState from '../components/shared/EmptyState';
import ErrorState from '../components/shared/ErrorState';
import { useToast } from '../context/ToastContext';
import { formatDate, deadlineLabel, deadlineUrgency, todayString } from '../utils/dateUtils';

const APP_STATUSES = ['INTERESTED', 'APPLIED', 'SHORTLISTED', 'SELECTED', 'REJECTED'];

const initialForm = {
  studentId: '',
  opportunityId: '',
  status: 'INTERESTED',
  appliedDate: todayString(),
  notes: '',
};

export default function ApplicationsPage() {
  const [applications, setApplications] = useState([]);
  const [students, setStudents] = useState([]);
  const [opportunities, setOpportunities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState(initialForm);
  const [formErrors, setFormErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [detailTarget, setDetailTarget] = useState(null);

  const toast = useToast();

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [appRes, stuRes, oppRes] = await Promise.all([
        getApplications(),
        getStudents(),
        getOpportunities(),
      ]);
      setApplications(appRes.data);
      setStudents(stuRes.data);
      setOpportunities(oppRes.data);
    } catch (err) {
      setError(err.userMessage || 'Failed to load applications.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const filtered = useMemo(() => {
    let list = [...applications];
    if (search) {
      const q = search.toLowerCase();
      list = list.filter(
        (a) =>
          a.opportunity?.title?.toLowerCase().includes(q) ||
          a.opportunity?.company?.toLowerCase().includes(q) ||
          a.student?.name?.toLowerCase().includes(q) ||
          a.notes?.toLowerCase().includes(q)
      );
    }
    if (filterStatus !== 'ALL') {
      list = list.filter((a) => a.status === filterStatus);
    }
    return list;
  }, [applications, search, filterStatus]);

  const validateForm = () => {
    const errs = {};
    if (!form.studentId) errs.studentId = 'Select a student';
    if (!form.opportunityId) errs.opportunityId = 'Select an opportunity';
    if (!form.status) errs.status = 'Select a status';
    if (!form.appliedDate) errs.appliedDate = 'Applied date is required';
    setFormErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    setSubmitting(true);
    try {
      await createApplication({
        student: { id: Number(form.studentId) },
        opportunity: { id: Number(form.opportunityId) },
        status: form.status,
        appliedDate: form.appliedDate,
        notes: form.notes,
      });
      toast.success('Application created successfully!');
      setModalOpen(false);
      setForm(initialForm);
      setFormErrors({});
      fetchData();
    } catch (err) {
      const msg = err.userMessage || 'Failed to create application.';
      toast.error(typeof msg === 'string' ? msg : JSON.stringify(msg));
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await deleteApplication(deleteTarget.id);
      toast.success('Application deleted successfully!');
      setDeleteTarget(null);
      fetchData();
    } catch (err) {
      toast.error(err.userMessage || 'Failed to delete application.');
    } finally {
      setDeleting(false);
    }
  };

  if (loading) return <LoadingState message="Loading applications..." />;
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
            placeholder="Search applications..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            aria-label="Search applications"
          />
        </div>
        <div className="page__filters">
          <div className="select-wrap">
            <Filter size={15} className="select-wrap__icon" />
            <select
              className="page__select"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              aria-label="Filter by status"
            >
              <option value="ALL">All Statuses</option>
              {APP_STATUSES.map((s) => (
                <option key={s} value={s}>{s.charAt(0) + s.slice(1).toLowerCase()}</option>
              ))}
            </select>
          </div>
          <button className="btn btn--primary" type="button" onClick={() => setModalOpen(true)} aria-label="Add Application">
            <Plus size={18} />
            <span className="btn__label">Add Application</span>
          </button>
        </div>
      </div>

      {/* Applications table / cards */}
      {filtered.length === 0 ? (
        <EmptyState
          icon={FileText}
          title="No applications found"
          message={applications.length === 0 ? 'Start tracking your applications.' : 'Try adjusting your search or filter.'}
        />
      ) : (
        <div className="table-responsive">
          <table className="data-table" aria-label="Applications">
            <thead>
              <tr>
                <th>Opportunity</th>
                <th>Company</th>
                <th>Student</th>
                <th>Status</th>
                <th>Applied Date</th>
                <th>Deadline</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((app) => (
                <tr key={app.id}>
                  <td>
                    <button type="button" className="link-btn" onClick={() => setDetailTarget(app)}>
                      {app.opportunity?.title || '—'}
                    </button>
                  </td>
                  <td>{app.opportunity?.company || '—'}</td>
                  <td>{app.student?.name || '—'}</td>
                  <td><StatusBadge status={app.status} /></td>
                  <td>{formatDate(app.appliedDate)}</td>
                  <td>
                    <span className={`deadline-text deadline-text--${deadlineUrgency(app.opportunity?.deadline)}`}>
                      {deadlineLabel(app.opportunity?.deadline) || '—'}
                    </span>
                  </td>
                  <td>
                    <button
                      type="button"
                      className="btn-icon btn-icon--danger"
                      onClick={() => setDeleteTarget(app)}
                      aria-label={`Delete application for ${app.opportunity?.title}`}
                      title="Delete application"
                    >
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Mobile cards fallback */}
      {filtered.length > 0 && (
        <div className="mobile-cards">
          {filtered.map((app) => (
            <div className="mobile-card" key={app.id}>
              <div className="mobile-card__header">
                <div>
                  <h3 className="mobile-card__title">{app.opportunity?.title || '—'}</h3>
                  <p className="mobile-card__sub">{app.opportunity?.company || ''}</p>
                </div>
                <StatusBadge status={app.status} />
              </div>
              <div className="mobile-card__body">
                <div className="mobile-card__row">
                  <span className="mobile-card__label">Student</span>
                  <span>{app.student?.name || '—'}</span>
                </div>
                <div className="mobile-card__row">
                  <span className="mobile-card__label">Applied</span>
                  <span>{formatDate(app.appliedDate)}</span>
                </div>
                <div className="mobile-card__row">
                  <span className="mobile-card__label">Deadline</span>
                  <span className={`deadline-text deadline-text--${deadlineUrgency(app.opportunity?.deadline)}`}>
                    {deadlineLabel(app.opportunity?.deadline) || '—'}
                  </span>
                </div>
                {app.notes && (
                  <div className="mobile-card__row">
                    <span className="mobile-card__label">Notes</span>
                    <span>{app.notes}</span>
                  </div>
                )}
              </div>
              <div className="mobile-card__actions">
                <button
                  type="button"
                  className="btn btn--sm btn--danger"
                  onClick={() => setDeleteTarget(app)}
                >
                  <Trash2 size={14} /> Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Application Detail Modal */}
      <Modal open={!!detailTarget} title="Application Details" onClose={() => setDetailTarget(null)}>
        {detailTarget && (
          <div className="detail-view">
            <div className="detail-view__row">
              <span className="detail-view__label">Opportunity</span>
              <span>{detailTarget.opportunity?.title || '—'}</span>
            </div>
            <div className="detail-view__row">
              <span className="detail-view__label">Company</span>
              <span>{detailTarget.opportunity?.company || '—'}</span>
            </div>
            <div className="detail-view__row">
              <span className="detail-view__label">Student</span>
              <span>{detailTarget.student?.name || '—'}</span>
            </div>
            <div className="detail-view__row">
              <span className="detail-view__label">Status</span>
              <StatusBadge status={detailTarget.status} />
            </div>
            <div className="detail-view__row">
              <span className="detail-view__label">Applied Date</span>
              <span>{formatDate(detailTarget.appliedDate)}</span>
            </div>
            <div className="detail-view__row">
              <span className="detail-view__label">Deadline</span>
              <span className={`deadline-text deadline-text--${deadlineUrgency(detailTarget.opportunity?.deadline)}`}>
                {formatDate(detailTarget.opportunity?.deadline)} · {deadlineLabel(detailTarget.opportunity?.deadline)}
              </span>
            </div>
            {detailTarget.notes && (
              <div className="detail-view__row">
                <span className="detail-view__label">Notes</span>
                <span>{detailTarget.notes}</span>
              </div>
            )}
          </div>
        )}
      </Modal>

      {/* Add Modal */}
      <Modal open={modalOpen} title="Add Application" onClose={() => { setModalOpen(false); setFormErrors({}); setForm(initialForm); }}>
        <form className="form" onSubmit={handleSubmit} noValidate>
          <div className="form__row">
            <div className="form__group">
              <label className="form__label" htmlFor="app-student">Student *</label>
              <select
                id="app-student"
                className={`form__input ${formErrors.studentId ? 'form__input--error' : ''}`}
                value={form.studentId}
                onChange={(e) => setForm({ ...form, studentId: e.target.value })}
              >
                <option value="">Select a student</option>
                {students.map((s) => (
                  <option key={s.id} value={s.id}>{s.name} — {s.college}</option>
                ))}
              </select>
              {formErrors.studentId && <span className="form__error">{formErrors.studentId}</span>}
            </div>
            <div className="form__group">
              <label className="form__label" htmlFor="app-opp">Opportunity *</label>
              <select
                id="app-opp"
                className={`form__input ${formErrors.opportunityId ? 'form__input--error' : ''}`}
                value={form.opportunityId}
                onChange={(e) => setForm({ ...form, opportunityId: e.target.value })}
              >
                <option value="">Select an opportunity</option>
                {opportunities.map((o) => (
                  <option key={o.id} value={o.id}>{o.title} — {o.company}</option>
                ))}
              </select>
              {formErrors.opportunityId && <span className="form__error">{formErrors.opportunityId}</span>}
            </div>
          </div>
          <div className="form__row">
            <div className="form__group">
              <label className="form__label" htmlFor="app-status">Status *</label>
              <select
                id="app-status"
                className={`form__input ${formErrors.status ? 'form__input--error' : ''}`}
                value={form.status}
                onChange={(e) => setForm({ ...form, status: e.target.value })}
              >
                {APP_STATUSES.map((s) => (
                  <option key={s} value={s}>{s.charAt(0) + s.slice(1).toLowerCase()}</option>
                ))}
              </select>
              {formErrors.status && <span className="form__error">{formErrors.status}</span>}
            </div>
            <div className="form__group">
              <label className="form__label" htmlFor="app-date">Applied Date *</label>
              <input
                id="app-date"
                type="date"
                className={`form__input ${formErrors.appliedDate ? 'form__input--error' : ''}`}
                value={form.appliedDate}
                onChange={(e) => setForm({ ...form, appliedDate: e.target.value })}
              />
              {formErrors.appliedDate && <span className="form__error">{formErrors.appliedDate}</span>}
            </div>
          </div>
          <div className="form__group">
            <label className="form__label" htmlFor="app-notes">Notes</label>
            <textarea
              id="app-notes"
              className="form__input form__textarea"
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              rows={3}
              placeholder="Any additional notes..."
            />
          </div>
          <div className="form__actions">
            <button type="button" className="btn btn--ghost" onClick={() => { setModalOpen(false); setFormErrors({}); setForm(initialForm); }}>
              Cancel
            </button>
            <button type="submit" className="btn btn--primary" disabled={submitting}>
              {submitting ? 'Creating...' : 'Add Application'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmDialog
        open={!!deleteTarget}
        title="Delete Application"
        message={`Are you sure you want to delete the application for "${deleteTarget?.opportunity?.title || 'this opportunity'}"?`}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
        loading={deleting}
      />
    </div>
  );
}
