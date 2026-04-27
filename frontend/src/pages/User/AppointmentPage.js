import { useState, useEffect, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { appointmentAPI } from '../../utils/api';

const API_BASE = '/api';

const AppointmentPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const selectedDoctorFromState = location.state?.doctor || null;
  const searchParams = new URLSearchParams(location.search);
  const doctorIdFromQuery = searchParams.get('doctorId');

  const [doctors, setDoctors] = useState([]);
  const [doctor, setDoctor] = useState(selectedDoctorFromState);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [editId, setEditId] = useState(null);
  const [formData, setFormData] = useState({
    doctorId: selectedDoctorFromState?._id || doctorIdFromQuery || '',
    appointmentDate: '',
    appointmentTime: '09:00',
    reason: '',
  });

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const res = await fetch(`${API_BASE}/users/doctors/public?limit=100`);
        const data = await res.json();
        const list = (data.doctors || []).map((doc) => ({
          ...doc,
          name: `${doc.firstName || ''} ${doc.lastName || ''}`.trim(),
          specialization: doc.doctorDetails?.specialization || 'General Practice',
          availableDays: (doc.doctorDetails?.availableSlots || []).map((slot) => slot.day).filter(Boolean),
          consultationHours: doc.doctorDetails?.availableSlots?.[0]
            ? { start: doc.doctorDetails.availableSlots[0].startTime, end: doc.doctorDetails.availableSlots[0].endTime }
            : doc.consultationHours || { start: '09:00', end: '17:00' },
        }));
        setDoctors(list);
        if (!doctor && doctorIdFromQuery) {
          const found = list.find((item) => item._id === doctorIdFromQuery);
          if (found) setDoctor(found);
        }
        await loadAppointments();
      } catch (error) {
        toast.error('Unable to load doctors or appointments.');
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  const loadAppointments = async () => {
    try {
      const res = await appointmentAPI.getAll();
      setAppointments(res.data.appointments || []);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to load appointments');
    }
  };

  const selectedDoctor = useMemo(() => {
    if (doctor) return doctor;
    return doctors.find((doc) => doc._id === formData.doctorId) || null;
  }, [doctor, doctors, formData.doctorId]);

  const resetForm = () => {
    setEditId(null);
    setFormData((prev) => ({
      ...prev,
      appointmentDate: '',
      appointmentTime: '09:00',
      reason: '',
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.doctorId) return toast.error('Please select a doctor.');
    if (!formData.appointmentDate) return toast.error('Select an appointment date.');
    if (!formData.appointmentTime) return toast.error('Select an appointment time.');

    setSubmitting(true);
    try {
      const payload = {
        doctorId: formData.doctorId,
        appointmentDate: formData.appointmentDate,
        appointmentTime: formData.appointmentTime,
        reason: formData.reason,
      };

      if (editId) {
        await appointmentAPI.update(editId, payload);
        toast.success('Appointment updated successfully.');
      } else {
        await appointmentAPI.create(payload);
        toast.success('Appointment booked successfully.');
      }

      resetForm();
      setDoctor(selectedDoctor || doctor);
      await loadAppointments();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Unable to save appointment.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (appointment) => {
    setEditId(appointment._id);
    setFormData({
      doctorId: appointment.doctor._id,
      appointmentDate: appointment.appointmentDate.slice(0, 10),
      appointmentTime: appointment.appointmentTime,
      reason: appointment.reason || '',
    });
    setDoctor(appointment.doctor);
    if (window.scrollTo) window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCancel = async (id) => {
    if (!window.confirm('Cancel this appointment?')) return;
    try {
      await appointmentAPI.delete(id);
      toast.success('Appointment cancelled.');
      if (editId === id) resetForm();
      await loadAppointments();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Unable to cancel appointment.');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-8 sm:px-6 lg:px-10">
      <div className="mx-auto max-w-6xl rounded-3xl bg-white p-6 shadow-lg sm:p-10">
        <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.25em] text-slate-400">Appointments</p>
            <h1 className="mt-2 text-3xl font-bold text-slate-900">Book & manage your appointments</h1>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-600">
              Create a new booking, update your scheduled appointments, or cancel if plans change.
            </p>
          </div>
          <button
            onClick={() => {
              setDoctor(null);
              setFormData({ ...formData, doctorId: '', appointmentDate: '', appointmentTime: '09:00', reason: '' });
              setEditId(null);
            }}
            className="inline-flex items-center justify-center rounded-full border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-slate-300 hover:bg-slate-50"
          >
            New Appointment
          </button>
        </div>

        <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
          <section className="rounded-[28px] border border-slate-200 bg-slate-50 p-6">
            <div className="mb-6 flex items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-semibold text-slate-900">Appointment details</h2>
                <p className="mt-1 text-sm text-slate-500">Use the form to book or edit a patient appointment.</p>
              </div>
              {selectedDoctor && (
                <div className="rounded-3xl bg-white px-4 py-3 text-sm text-slate-600 shadow-sm">
                  Doctor selected:
                  <div className="mt-2 font-semibold text-slate-900">Dr. {selectedDoctor.name}</div>
                </div>
              )}
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">Doctor</label>
                <select
                  className="w-full rounded-3xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-slate-500"
                  value={formData.doctorId}
                  onChange={(e) => {
                    setFormData((prev) => ({ ...prev, doctorId: e.target.value }));
                    const selected = doctors.find((doc) => doc._id === e.target.value);
                    if (selected) setDoctor(selected);
                  }}
                  required
                >
                  <option value="">Select a doctor</option>
                  {selectedDoctorFromState && !formData.doctorId && (
                    <option value={selectedDoctorFromState._id}>Dr. {selectedDoctorFromState.name}</option>
                  )}
                  {doctors.map((doc) => (
                    <option key={doc._id} value={doc._id}>
                      Dr. {doc.name} — {doc.specialization}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid gap-5 md:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">Date</label>
                  <input
                    type="date"
                    min={new Date().toISOString().split('T')[0]}
                    className="w-full rounded-3xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-slate-500"
                    value={formData.appointmentDate}
                    onChange={(e) => setFormData((prev) => ({ ...prev, appointmentDate: e.target.value }))}
                    required
                  />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">Time</label>
                  <input
                    type="time"
                    className="w-full rounded-3xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-slate-500"
                    value={formData.appointmentTime}
                    onChange={(e) => setFormData((prev) => ({ ...prev, appointmentTime: e.target.value }))}
                    required
                  />
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">Reason for visit</label>
                <textarea
                  rows={4}
                  className="w-full rounded-3xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-slate-500"
                  value={formData.reason}
                  onChange={(e) => setFormData((prev) => ({ ...prev, reason: e.target.value }))}
                  placeholder="Tell us briefly why you need the appointment"
                />
              </div>

              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-end">
                {editId && (
                  <button
                    type="button"
                    onClick={() => resetForm()}
                    className="rounded-3xl border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
                  >
                    Cancel edit
                  </button>
                )}
                <button
                  type="submit"
                  disabled={submitting}
                  className="inline-flex items-center justify-center rounded-3xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {submitting ? 'Saving...' : editId ? 'Update Appointment' : 'Book Appointment'}
                </button>
              </div>
            </form>

            {selectedDoctor && (
              <div className="mt-8 rounded-3xl bg-white p-5 shadow-sm">
                <h3 className="text-lg font-semibold text-slate-900">Doctor summary</h3>
                <p className="mt-3 text-sm text-slate-600">{selectedDoctor.bio || 'No biography available.'}</p>
                <div className="mt-5 grid gap-3 sm:grid-cols-2">
                  <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
                    <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Specialty</p>
                    <p className="mt-2 font-semibold text-slate-900">{selectedDoctor.specialization}</p>
                  </div>
                  <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
                    <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Available</p>
                    <p className="mt-2 text-sm font-semibold text-slate-900">{selectedDoctor.availableDays?.join(', ') || 'Not specified'}</p>
                  </div>
                  <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
                    <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Hours</p>
                    <p className="mt-2 font-semibold text-slate-900">{selectedDoctor.consultationHours?.start} - {selectedDoctor.consultationHours?.end}</p>
                  </div>
                  <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
                    <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Fee</p>
                    <p className="mt-2 font-semibold text-slate-900">LKR {selectedDoctor.consultationFee || '—'}</p>
                  </div>
                </div>
              </div>
            )}
          </section>

          <aside className="space-y-6 rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
            <div>
              <h2 className="text-xl font-semibold text-slate-900">Your bookings</h2>
              <p className="mt-2 text-sm text-slate-500">Manage existing appointments from one place.</p>
            </div>

            {loading ? (
              <div className="rounded-3xl border border-dashed border-slate-300 p-6 text-center text-slate-500">Loading appointments…</div>
            ) : appointments.length === 0 ? (
              <div className="rounded-3xl border border-dashed border-slate-300 p-6 text-center text-slate-500">No appointments yet.</div>
            ) : (
              <div className="space-y-4">
                {appointments.map((appointment) => (
                  <div key={appointment._id} className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <div className="text-sm text-slate-500">Dr. {appointment.doctor?.firstName} {appointment.doctor?.lastName}</div>
                        <h3 className="mt-1 text-base font-semibold text-slate-900">{appointment.doctor?.doctorDetails?.specialization || 'General Practice'}</h3>
                      </div>
                      <span className="rounded-full bg-slate-900 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-white">
                        {appointment.status}
                      </span>
                    </div>
                    <div className="mt-4 grid gap-3 sm:grid-cols-2">
                      <div>
                        <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Date</p>
                        <p className="mt-1 text-sm font-semibold text-slate-900">{new Date(appointment.appointmentDate).toLocaleDateString()}</p>
                      </div>
                      <div>
                        <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Time</p>
                        <p className="mt-1 text-sm font-semibold text-slate-900">{appointment.appointmentTime}</p>
                      </div>
                    </div>
                    <p className="mt-4 text-sm text-slate-600">{appointment.reason || 'No reason provided.'}</p>
                    <div className="mt-5 flex flex-wrap gap-3">
                      <button
                        type="button"
                        onClick={() => handleEdit(appointment)}
                        className="rounded-3xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800"
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => handleCancel(appointment._id)}
                        className="rounded-3xl border border-red-200 bg-red-50 px-4 py-2 text-sm font-semibold text-red-700 transition hover:bg-red-100"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </aside>
        </div>
      </div>
    </div>
  );
};

export default AppointmentPage;
