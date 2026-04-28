import { useState, useEffect, useMemo, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import toast from 'react-hot-toast';
import { appointmentAPI } from '../../utils/api';

const API_BASE = '/api';

// ─── Helpers ─────────────────────────────────────────────────────────────────

/** Generate HH:mm slots from startTime to endTime every `step` minutes. */
const generateSlots = (start, end, step = 15) => {
  const slots = [];
  if (!start || !end) return slots;
  const [sh, sm] = start.split(':').map(Number);
  const [eh, em] = end.split(':').map(Number);
  let cur = sh * 60 + sm;
  const endMin = eh * 60 + em;
  while (cur < endMin) {
    const h = String(Math.floor(cur / 60)).padStart(2, '0');
    const m = String(cur % 60).padStart(2, '0');
    slots.push(`${h}:${m}`);
    cur += step;
  }
  return slots;
};

/** "09:00" → "9:00 AM" */
const fmt12 = (time) => {
  if (!time) return '';
  const [h, m] = time.split(':').map(Number);
  const suffix = h >= 12 ? 'PM' : 'AM';
  return `${h % 12 || 12}:${String(m).padStart(2, '0')} ${suffix}`;
};

// ─── Component ────────────────────────────────────────────────────────────────

const AppointmentPage = () => {
  const location = useLocation();
  const selectedDoctorFromState = location.state?.doctor || null;
  const searchParams = new URLSearchParams(location.search);
  const doctorIdFromQuery = searchParams.get('doctorId');

  const [doctors, setDoctors] = useState([]);
  const [doctor, setDoctor] = useState(selectedDoctorFromState);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [editId, setEditId] = useState(null);

  // Booked slots fetched from the public endpoint — reflects ALL patients
  const [bookedTimes, setBookedTimes] = useState(new Set());
  const [slotsLoading, setSlotsLoading] = useState(false);

  const [formData, setFormData] = useState({
    doctorId: selectedDoctorFromState?._id || doctorIdFromQuery || '',
    appointmentDate: '',
    appointmentTime: '',
    reason: '',
  });

  // ── Initial data load ─────────────────────────────────────────────────────

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
          availableDays: (doc.doctorDetails?.availableSlots || []).map((s) => s.day).filter(Boolean),
          availableSlots: doc.doctorDetails?.availableSlots || [],
          consultationHours: doc.doctorDetails?.availableSlots?.[0]
            ? {
                start: doc.doctorDetails.availableSlots[0].startTime,
                end: doc.doctorDetails.availableSlots[0].endTime,
              }
            : doc.consultationHours || { start: '09:00', end: '17:00' },
        }));
        setDoctors(list);
        if (!doctor && doctorIdFromQuery) {
          const found = list.find((d) => d._id === doctorIdFromQuery);
          if (found) setDoctor(found);
        }
        await loadAppointments();
      } catch {
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

  // ── Fetch booked slots from public endpoint (all patients) ────────────────

  const fetchBookedSlots = useCallback(async (doctorId, date) => {
    if (!doctorId || !date) {
      setBookedTimes(new Set());
      return;
    }
    try {
      setSlotsLoading(true);
      const res = await fetch(
        `${API_BASE}/appointments/booked-slots?doctorId=${doctorId}&date=${date}`
      );
      const data = await res.json();
      setBookedTimes(data.success ? new Set(data.bookedTimes) : new Set());
    } catch {
      setBookedTimes(new Set());
    } finally {
      setSlotsLoading(false);
    }
  }, []);

  // Re-fetch whenever doctor or date changes
  useEffect(() => {
    fetchBookedSlots(formData.doctorId, formData.appointmentDate);
  }, [formData.doctorId, formData.appointmentDate, fetchBookedSlots]);

  const refreshBookedSlots = () => fetchBookedSlots(formData.doctorId, formData.appointmentDate);

  // ── Derived state ─────────────────────────────────────────────────────────

  const selectedDoctor = useMemo(() => {
    if (doctor) return doctor;
    return doctors.find((d) => d._id === formData.doctorId) || null;
  }, [doctor, doctors, formData.doctorId]);

  /** Slot range for the chosen day-of-week */
  const slotRange = useMemo(() => {
    if (!selectedDoctor || !formData.appointmentDate) return null;
    const dayName = new Date(formData.appointmentDate + 'T00:00:00').toLocaleDateString('en-US', {
      weekday: 'long',
    });
    const match = (selectedDoctor.availableSlots || []).find(
      (s) => s.day?.toLowerCase() === dayName.toLowerCase()
    );
    if (match) return { start: match.startTime, end: match.endTime };
    return selectedDoctor.consultationHours || null;
  }, [selectedDoctor, formData.appointmentDate]);

  /** All 15-min slots for the chosen doctor + date */
  const allSlots = useMemo(() => {
    if (!slotRange) return [];
    return generateSlots(slotRange.start, slotRange.end, 15);
  }, [slotRange]);

  /**
   * Booked set minus the currently-edited appointment's time.
   * This lets the patient keep their existing slot when editing.
   */
  const effectiveBookedTimes = useMemo(() => {
    if (!editId) return bookedTimes;
    const editing = appointments.find((a) => a._id === editId);
    if (!editing) return bookedTimes;
    const copy = new Set(bookedTimes);
    copy.delete(editing.appointmentTime);
    return copy;
  }, [bookedTimes, editId, appointments]);

  // ── Handlers ──────────────────────────────────────────────────────────────

  const resetForm = () => {
    setEditId(null);
    setFormData((prev) => ({ ...prev, appointmentDate: '', appointmentTime: '', reason: '' }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.doctorId) return toast.error('Please select a doctor.');
    if (!formData.appointmentDate) return toast.error('Select an appointment date.');
    if (!formData.appointmentTime) return toast.error('Select an appointment time slot.');

    // Race-condition guard: re-check the slot is still free right before submitting
    if (effectiveBookedTimes.has(formData.appointmentTime)) {
      toast.error('That slot was just taken. Please choose another time.');
      await refreshBookedSlots();
      setFormData((prev) => ({ ...prev, appointmentTime: '' }));
      return;
    }

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
      await loadAppointments();
      await refreshBookedSlots(); // immediately lock the slot for this patient too
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
    window.scrollTo?.({ top: 0, behavior: 'smooth' });
  };

  const handleCancel = async (id) => {
    if (!window.confirm('Cancel this appointment?')) return;
    try {
      await appointmentAPI.delete(id);
      toast.success('Appointment cancelled.');
      if (editId === id) resetForm();
      await loadAppointments();
      await refreshBookedSlots(); // free the slot immediately
    } catch (error) {
      toast.error(error.response?.data?.message || 'Unable to cancel appointment.');
    }
  };

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-8 sm:px-6 lg:px-10">
      <div className="mx-auto max-w-6xl rounded-3xl bg-white p-6 shadow-lg sm:p-10">

        {/* Header */}
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
              setDoctor(selectedDoctorFromState || null);
              setFormData({
                doctorId: selectedDoctorFromState?._id || doctorIdFromQuery || '',
                appointmentDate: '',
                appointmentTime: '',
                reason: '',
              });
              setEditId(null);
            }}
            className="inline-flex items-center justify-center rounded-full border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-slate-300 hover:bg-slate-50"
          >
            New Appointment
          </button>
        </div>

        <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">

          {/* ── Left: Form ──────────────────────────────────────────────────── */}
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

              {/* Doctor */}
              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">Doctor</label>
                <select
                  className={`w-full rounded-3xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-slate-500 ${
                    selectedDoctorFromState ? 'cursor-not-allowed opacity-75' : ''
                  }`}
                  value={formData.doctorId}
                  onChange={(e) => {
                    if (selectedDoctorFromState) return;
                    setFormData((prev) => ({ ...prev, doctorId: e.target.value, appointmentTime: '' }));
                    setDoctor(doctors.find((d) => d._id === e.target.value) || null);
                  }}
                  disabled={!!selectedDoctorFromState}
                  required
                >
                  <option value="">Select a doctor</option>
                  {doctors.map((doc) => (
                    <option key={doc._id} value={doc._id}>
                      Dr. {doc.name} — {doc.specialization}
                    </option>
                  ))}
                </select>
                {selectedDoctorFromState && (
                  <p className="mt-1 text-xs text-slate-500">
                    Doctor selection is locked when booking from doctor profile.
                  </p>
                )}
              </div>

              {/* Date */}
              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">Date</label>
                <input
                  type="date"
                  min={new Date().toISOString().split('T')[0]}
                  className="w-full rounded-3xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-slate-500"
                  value={formData.appointmentDate}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, appointmentDate: e.target.value, appointmentTime: '' }))
                  }
                  required
                />
              </div>

              {/* Time slot grid */}
              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Available Time Slots
                  {slotRange && (
                    <span className="ml-2 font-normal text-slate-400">
                      ({fmt12(slotRange.start)} – {fmt12(slotRange.end)}, 15-min slots)
                    </span>
                  )}
                </label>

                {!formData.doctorId || !formData.appointmentDate ? (
                  <div className="rounded-3xl border border-dashed border-slate-300 px-4 py-6 text-center text-sm text-slate-400">
                    Select a doctor and date to see available slots.
                  </div>
                ) : slotsLoading ? (
                  <div className="rounded-3xl border border-dashed border-slate-300 px-4 py-6 text-center text-sm text-slate-400">
                    Checking availability…
                  </div>
                ) : allSlots.length === 0 ? (
                  <div className="rounded-3xl border border-dashed border-slate-300 px-4 py-6 text-center text-sm text-slate-400">
                    No available slots for this day.
                  </div>
                ) : (
                  <>
                    <div className="grid grid-cols-4 gap-2 sm:grid-cols-5">
                      {allSlots.map((slot) => {
                        const isBooked = effectiveBookedTimes.has(slot);
                        const isSelected = formData.appointmentTime === slot;
                        return (
                          <button
                            key={slot}
                            type="button"
                            disabled={isBooked}
                            onClick={() =>
                              !isBooked && setFormData((prev) => ({ ...prev, appointmentTime: slot }))
                            }
                            title={isBooked ? 'Already booked' : fmt12(slot)}
                            className={`
                              rounded-2xl border px-2 py-2.5 text-xs font-semibold transition
                              ${isBooked
                                ? 'cursor-not-allowed border-slate-200 bg-slate-100 text-slate-300 line-through'
                                : isSelected
                                ? 'border-slate-900 bg-slate-900 text-white shadow-sm'
                                : 'border-slate-300 bg-white text-slate-700 hover:border-slate-500 hover:bg-slate-50'
                              }
                            `}
                          >
                            {fmt12(slot)}
                          </button>
                        );
                      })}
                    </div>

                    {/* Legend */}
                    <div className="mt-3 flex flex-wrap items-center gap-4 text-xs text-slate-500">
                      <span className="flex items-center gap-1.5">
                        <span className="inline-block h-3 w-3 rounded-sm border border-slate-300 bg-white" />
                        Available
                      </span>
                      <span className="flex items-center gap-1.5">
                        <span className="inline-block h-3 w-3 rounded-sm bg-slate-900" />
                        Selected
                      </span>
                      <span className="flex items-center gap-1.5">
                        <span className="inline-block h-3 w-3 rounded-sm bg-slate-100" />
                        Booked
                      </span>
                    </div>
                  </>
                )}
              </div>

              {/* Reason */}
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

              {/* Submit */}
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-end">
                {editId && (
                  <button
                    type="button"
                    onClick={resetForm}
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

            {/* Doctor summary */}
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
                    <p className="mt-2 text-sm font-semibold text-slate-900">
                      {selectedDoctor.availableDays?.join(', ') || 'Not specified'}
                    </p>
                  </div>
                  <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
                    <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Hours</p>
                    <p className="mt-2 font-semibold text-slate-900">
                      {selectedDoctor.consultationHours?.start} – {selectedDoctor.consultationHours?.end}
                    </p>
                  </div>
                  <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
                    <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Fee</p>
                    <p className="mt-2 font-semibold text-slate-900">LKR {selectedDoctor.consultationFee || '—'}</p>
                  </div>
                </div>
              </div>
            )}
          </section>

          {/* ── Right: Bookings list ─────────────────────────────────────────── */}
          <aside className="space-y-6 rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
            <div>
              <h2 className="text-xl font-semibold text-slate-900">Your bookings</h2>
              <p className="mt-2 text-sm text-slate-500">Manage existing appointments from one place.</p>
            </div>

            {loading ? (
              <div className="rounded-3xl border border-dashed border-slate-300 p-6 text-center text-slate-500">
                Loading appointments…
              </div>
            ) : appointments.length === 0 ? (
              <div className="rounded-3xl border border-dashed border-slate-300 p-6 text-center text-slate-500">
                No appointments yet.
              </div>
            ) : (
              <div className="space-y-4">
                {appointments.map((appointment) => (
                  <div key={appointment._id} className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <div className="text-sm text-slate-500">
                          Dr. {appointment.doctor?.firstName} {appointment.doctor?.lastName}
                        </div>
                        <h3 className="mt-1 text-base font-semibold text-slate-900">
                          {appointment.doctor?.doctorDetails?.specialization || 'General Practice'}
                        </h3>
                      </div>
                      <span className="rounded-full bg-slate-900 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-white">
                        {appointment.status}
                      </span>
                    </div>
                    <div className="mt-4 grid gap-3 sm:grid-cols-2">
                      <div>
                        <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Date</p>
                        <p className="mt-1 text-sm font-semibold text-slate-900">
                          {new Date(appointment.appointmentDate).toLocaleDateString()}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Time</p>
                        <p className="mt-1 text-sm font-semibold text-slate-900">
                          {fmt12(appointment.appointmentTime)}
                        </p>
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