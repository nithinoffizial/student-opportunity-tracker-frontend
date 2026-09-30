import { useState, useEffect, useMemo } from 'react';
import {
  Plus,
  Search,
  Trash2,
  Users,
  Mail,
  GraduationCap,
} from 'lucide-react';
import { getStudents, createStudent, deleteStudent } from '../api/studentApi';
import Modal from '../components/shared/Modal';
import ConfirmDialog from '../components/shared/ConfirmDialog';
import LoadingState from '../components/shared/LoadingState';
import EmptyState from '../components/shared/EmptyState';
import ErrorState from '../components/shared/ErrorState';
import { useToast } from '../context/ToastContext';

const initialForm = { name: '', email: '', college: '' };

export default function StudentsPage() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
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
      const res = await getStudents();
      setStudents(res.data);
    } catch (err) {
      setError(err.userMessage || 'Failed to load students.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const filtered = useMemo(() => {
    if (!search) return students;
    const q = search.toLowerCase();
    return students.filter(
      (s) =>
        s.name?.toLowerCase().includes(q) ||
        s.email?.toLowerCase().includes(q) ||
        s.college?.toLowerCase().includes(q)
    );
  }, [students, search]);

  const validateForm = () => {
    const errs = {};
    if (!form.name.trim()) errs.name = 'Name is required';
    if (!form.email.trim()) errs.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errs.email = 'Enter a valid email address';
    if (!form.college.trim()) errs.college = 'College is required';
    setFormErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    setSubmitting(true);
    try {
      await createStudent(form);
      toast.success('Student added successfully!');
      setModalOpen(false);
      setForm(initialForm);
      setFormErrors({});
      fetchData();
    } catch (err) {
      const msg = err.userMessage || 'Failed to add student.';
      toast.error(typeof msg === 'string' ? msg : JSON.stringify(msg));
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await deleteStudent(deleteTarget.id);
      toast.success('Student deleted successfully!');
      setDeleteTarget(null);
      fetchData();
    } catch (err) {
      toast.error(err.userMessage || 'Failed to delete student.');
    } finally {
      setDeleting(false);
    }
  };

  if (loading) return <LoadingState message="Loading students..." />;
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
            placeholder="Search students..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            aria-label="Search students"
          />
        </div>
        <div className="page__filters">
          <button className="btn btn--primary" type="button" onClick={() => setModalOpen(true)} aria-label="Add Student">
            <Plus size={18} />
            <span className="btn__label">Add Student</span>
          </button>
        </div>
      </div>

      {/* Student list */}
      {filtered.length === 0 ? (
        <EmptyState
          icon={Users}
          title="No students found"
          message={students.length === 0 ? 'Add your first student profile.' : 'Try adjusting your search.'}
        />
      ) : (
        <div className="card-grid card-grid--students">
          {filtered.map((stu) => (
            <div className="student-card" key={stu.id}>
              <div className="student-card__avatar">
                {stu.name?.charAt(0)?.toUpperCase() || '?'}
              </div>
              <div className="student-card__info">
                <h3 className="student-card__name">{stu.name}</h3>
                <div className="student-card__detail">
                  <Mail size={14} />
                  <span>{stu.email}</span>
                </div>
                <div className="student-card__detail">
                  <GraduationCap size={14} />
                  <span>{stu.college}</span>
                </div>
              </div>
              <button
                type="button"
                className="btn-icon btn-icon--danger student-card__delete"
                onClick={() => setDeleteTarget(stu)}
                aria-label={`Delete ${stu.name}`}
                title="Delete student"
              >
                <Trash2 size={16} />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Add Modal */}
      <Modal open={modalOpen} title="Add Student" onClose={() => { setModalOpen(false); setFormErrors({}); setForm(initialForm); }}>
        <form className="form" onSubmit={handleSubmit} noValidate>
          <div className="form__group">
            <label className="form__label" htmlFor="stu-name">Name *</label>
            <input
              id="stu-name"
              className={`form__input ${formErrors.name ? 'form__input--error' : ''}`}
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="e.g. Jai Nithin"
            />
            {formErrors.name && <span className="form__error">{formErrors.name}</span>}
          </div>
          <div className="form__group">
            <label className="form__label" htmlFor="stu-email">Email *</label>
            <input
              id="stu-email"
              type="email"
              className={`form__input ${formErrors.email ? 'form__input--error' : ''}`}
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              placeholder="e.g. jainithin@example.com"
            />
            {formErrors.email && <span className="form__error">{formErrors.email}</span>}
          </div>
          <div className="form__group">
            <label className="form__label" htmlFor="stu-college">College *</label>
            <input
              id="stu-college"
              className={`form__input ${formErrors.college ? 'form__input--error' : ''}`}
              value={form.college}
              onChange={(e) => setForm({ ...form, college: e.target.value })}
              placeholder="e.g. St. Joseph's College of Engineering"
            />
            {formErrors.college && <span className="form__error">{formErrors.college}</span>}
          </div>
          <div className="form__actions">
            <button type="button" className="btn btn--ghost" onClick={() => { setModalOpen(false); setFormErrors({}); setForm(initialForm); }}>
              Cancel
            </button>
            <button type="submit" className="btn btn--primary" disabled={submitting}>
              {submitting ? 'Adding...' : 'Add Student'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmDialog
        open={!!deleteTarget}
        title="Delete Student"
        message={`Are you sure you want to delete "${deleteTarget?.name}"? This action cannot be undone.`}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
        loading={deleting}
      />
    </div>
  );
}
