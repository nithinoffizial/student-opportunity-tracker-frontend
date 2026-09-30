import { useState, useEffect, useMemo } from 'react';
import {
  Plus,
  Search,
  Trash2,
  ExternalLink,
  Filter,
  ArrowUpDown,
  Briefcase,
  Clock,
} from 'lucide-react';
import { getOpportunities, createOpportunity, deleteOpportunity } from '../api/opportunityApi';
import Modal from '../components/shared/Modal';
import ConfirmDialog from '../components/shared/ConfirmDialog';
import LoadingState from '../components/shared/LoadingState';
import EmptyState from '../components/shared/EmptyState';
import ErrorState from '../components/shared/ErrorState';
import { useToast } from '../context/ToastContext';
import { formatDate, deadlineLabel, deadlineUrgency } from '../utils/dateUtils';

const OPPORTUNITY_TYPES = [
  'INTERNSHIP',
  'HACKATHON',
  'CODING_CONTEST',
  'CERTIFICATION',
  'WORKSHOP',
  'SCHOLARSHIP',
  'OTHER',
];

const TYPE_LABELS = {
  INTERNSHIP: 'Internship',
  HACKATHON: 'Hackathon',
  CODING_CONTEST: 'Coding Contest',
  CERTIFICATION: 'Certification',
  WORKSHOP: 'Workshop',
  SCHOLARSHIP: 'Scholarship',
  OTHER: 'Other',
};

const initialForm = {
  title: '',
  company: '',
  type: 'INTERNSHIP',
  description: '',
  deadline: '',
  registrationLink: '',
};

export default function OpportunitiesPage() {
  const [opportunities, setOpportunities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState('ALL');
  const [sortBy, setSortBy] = useState('deadline');
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState(initialForm);
  const [formErrors, setFormErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const toast = useToast();

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getOpportunities();
      setOpportunities(res.data);
    } catch (err) {
      setError(err.userMessage || 'Failed to load opportunities.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const filtered = useMemo(() => {
    let list = [...opportunities];

    if (search) {
      const q = search.toLowerCase();
      list = list.filter(
        (o) =>
          o.title?.toLowerCase().includes(q) ||
          o.company?.toLowerCase().includes(q) ||
          o.description?.toLowerCase().includes(q)
      );
    }

    if (filterType !== 'ALL') {
      list = list.filter((o) => o.type === filterType);
    }

    if (sortBy === 'deadline') {
      list.sort((a, b) => (a.deadline > b.deadline ? 1 : -1));
    } else if (sortBy === 'title') {
      list.sort((a, b) => (a.title || '').localeCompare(b.title || ''));
    }

    return list;
  }, [opportunities, search, filterType, sortBy]);

  const validateForm = () => {
    const errs = {};
    if (!form.title.trim()) errs.title = 'Title is required';
    if (!form.company.trim()) errs.company = 'Company is required';
    if (!form.type) errs.type = 'Type is required';
    if (!form.description.trim()) errs.description = 'Description is required';
    if (!form.deadline) errs.deadline = 'Deadline is required';
    if (!form.registrationLink.trim()) errs.registrationLink = 'Registration link is required';
    else {
      try {
        new URL(form.registrationLink);
      } catch {
        errs.registrationLink = 'Please enter a valid URL';
      }
    }
    setFormErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    setSubmitting(true);
    try {
      await createOpportunity(form);
      toast.success('Opportunity created successfully!');
      setModalOpen(false);
      setForm(initialForm);
      setFormErrors({});
      fetchData();
    } catch (err) {
      const msg = err.userMessage || 'Failed to create opportunity.';
      toast.error(typeof msg === 'string' ? msg : JSON.stringify(msg));
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await deleteOpportunity(deleteTarget.id);
      toast.success('Opportunity deleted successfully!');
      setDeleteTarget(null);
      fetchData();
    } catch (err) {
      toast.error(err.userMessage || 'Failed to delete opportunity.');
    } finally {
      setDeleting(false);
    }
  };

  if (loading) return <LoadingState message="Loading opportunities..." />;
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
            placeholder="Search opportunities..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            aria-label="Search opportunities"
          />
        </div>
        <div className="page__filters">
          <div className="select-wrap">
            <Filter size={15} className="select-wrap__icon" />
            <select
              className="page__select"
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              aria-label="Filter by type"
            >
              <option value="ALL">All Types</option>
              {OPPORTUNITY_TYPES.map((t) => (
                <option key={t} value={t}>{TYPE_LABELS[t]}</option>
              ))}
            </select>
          </div>
          <div className="select-wrap">
            <ArrowUpDown size={15} className="select-wrap__icon" />
            <select
              className="page__select"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              aria-label="Sort by"
            >
              <option value="deadline">Sort by Deadline</option>
              <option value="title">Sort by Title</option>
            </select>
          </div>
          <button className="btn btn--primary" type="button" onClick={() => setModalOpen(true)} aria-label="Add Opportunity">
            <Plus size={18} />
            <span className="btn__label">Add Opportunity</span>
          </button>
        </div>
      </div>

      {/* Opportunities list */}
      {filtered.length === 0 ? (
        <EmptyState
          icon={Briefcase}
          title="No opportunities found"
          message={opportunities.length === 0 ? 'Start by adding your first opportunity.' : 'Try adjusting your search or filter.'}
        />
      ) : (
        <div className="card-grid">
          {filtered.map((opp) => (
            <div className="opp-card" key={opp.id}>
              <div className="opp-card__header">
                <span className={`opp-card__type opp-card__type--${opp.type?.toLowerCase()}`}>
                  {TYPE_LABELS[opp.type] || opp.type}
                </span>
                <button
                  type="button"
                  className="btn-icon btn-icon--danger"
                  onClick={() => setDeleteTarget(opp)}
                  aria-label={`Delete ${opp.title}`}
                  title="Delete opportunity"
                >
                  <Trash2 size={16} />
                </button>
              </div>
              <h3 className="opp-card__title">{opp.title}</h3>
              <p className="opp-card__company">{opp.company}</p>
              <p className="opp-card__desc">{opp.description}</p>
              <div className="opp-card__footer">
                <div className={`opp-card__deadline opp-card__deadline--${deadlineUrgency(opp.deadline)}`}>
                  <Clock size={14} />
                  <span>{formatDate(opp.deadline)} · {deadlineLabel(opp.deadline)}</span>
                </div>
                <a
                  href={opp.registrationLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn--sm btn--outline"
                >
                  Apply <ExternalLink size={13} />
                </a>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Modal */}
      <Modal open={modalOpen} title="Add Opportunity" onClose={() => { setModalOpen(false); setFormErrors({}); setForm(initialForm); }}>
        <form className="form" onSubmit={handleSubmit} noValidate>
          <div className="form__group">
            <label className="form__label" htmlFor="opp-title">Title *</label>
            <input
              id="opp-title"
              className={`form__input ${formErrors.title ? 'form__input--error' : ''}`}
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="e.g. Java Full Stack Developer Internship"
            />
            {formErrors.title && <span className="form__error">{formErrors.title}</span>}
          </div>
          <div className="form__row">
            <div className="form__group">
              <label className="form__label" htmlFor="opp-company">Company *</label>
              <input
                id="opp-company"
                className={`form__input ${formErrors.company ? 'form__input--error' : ''}`}
                value={form.company}
                onChange={(e) => setForm({ ...form, company: e.target.value })}
                placeholder="e.g. Example Technologies"
              />
              {formErrors.company && <span className="form__error">{formErrors.company}</span>}
            </div>
            <div className="form__group">
              <label className="form__label" htmlFor="opp-type">Type *</label>
              <select
                id="opp-type"
                className={`form__input ${formErrors.type ? 'form__input--error' : ''}`}
                value={form.type}
                onChange={(e) => setForm({ ...form, type: e.target.value })}
              >
                {OPPORTUNITY_TYPES.map((t) => (
                  <option key={t} value={t}>{TYPE_LABELS[t]}</option>
                ))}
              </select>
              {formErrors.type && <span className="form__error">{formErrors.type}</span>}
            </div>
          </div>
          <div className="form__group">
            <label className="form__label" htmlFor="opp-desc">Description *</label>
            <textarea
              id="opp-desc"
              className={`form__input form__textarea ${formErrors.description ? 'form__input--error' : ''}`}
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              rows={3}
              placeholder="Describe the opportunity..."
            />
            {formErrors.description && <span className="form__error">{formErrors.description}</span>}
          </div>
          <div className="form__row">
            <div className="form__group">
              <label className="form__label" htmlFor="opp-deadline">Deadline *</label>
              <input
                id="opp-deadline"
                type="date"
                className={`form__input ${formErrors.deadline ? 'form__input--error' : ''}`}
                value={form.deadline}
                onChange={(e) => setForm({ ...form, deadline: e.target.value })}
              />
              {formErrors.deadline && <span className="form__error">{formErrors.deadline}</span>}
            </div>
            <div className="form__group">
              <label className="form__label" htmlFor="opp-link">Registration Link *</label>
              <input
                id="opp-link"
                type="url"
                className={`form__input ${formErrors.registrationLink ? 'form__input--error' : ''}`}
                value={form.registrationLink}
                onChange={(e) => setForm({ ...form, registrationLink: e.target.value })}
                placeholder="https://example.com/apply"
              />
              {formErrors.registrationLink && <span className="form__error">{formErrors.registrationLink}</span>}
            </div>
          </div>
          <div className="form__actions">
            <button type="button" className="btn btn--ghost" onClick={() => { setModalOpen(false); setFormErrors({}); setForm(initialForm); }}>
              Cancel
            </button>
            <button type="submit" className="btn btn--primary" disabled={submitting}>
              {submitting ? 'Creating...' : 'Add Opportunity'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmDialog
        open={!!deleteTarget}
        title="Delete Opportunity"
        message={`Are you sure you want to delete "${deleteTarget?.title}"? This action cannot be undone.`}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
        loading={deleting}
      />
    </div>
  );
}
