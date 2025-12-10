'use client';

import { useEffect, useState } from 'react';

interface ClassTimetable {
  id: string;
  programName: string;
  semester: string;
  dayOfWeek: string;
  period: string;
  subject: string;
  faculty: string | null;
  room: string | null;
  createdAt: string;
  updatedAt: string;
}

interface ExamTimetable {
  id: string;
  programName: string;
  semester: string;
  examName: string;
  subject: string;
  examDate: string;
  startTime: string;
  endTime: string;
  room: string | null;
  createdAt: string;
  updatedAt: string;
}

export default function AcademicsPage() {
  const [classTimetables, setClassTimetables] = useState<ClassTimetable[]>([]);
  const [examTimetables, setExamTimetables] = useState<ExamTimetable[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'class' | 'exam'>('class');
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState<ClassTimetable | ExamTimetable | null>(null);
  const [formData, setFormData] = useState<any>({
    programName: '',
    semester: '',
    dayOfWeek: '',
    period: '',
    subject: '',
    faculty: '',
    room: '',
    examName: '',
    examDate: '',
    startTime: '',
    endTime: '',
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [classRes, examRes] = await Promise.all([
        fetch('/api/admin/class-timetable'),
        fetch('/api/admin/exam-timetable'),
      ]);
      
      const classData = await classRes.json();
      const examData = await examRes.json();
      
      setClassTimetables(classData || []);
      setExamTimetables(examData || []);
    } catch (error) {
      console.error('Failed to load academics data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const url = activeTab === 'class'
        ? editingItem
          ? `/api/admin/class-timetable/${editingItem.id}`
          : '/api/admin/class-timetable'
        : editingItem
          ? `/api/admin/exam-timetable/${editingItem.id}`
          : '/api/admin/exam-timetable';
      
      const method = editingItem ? 'PUT' : 'POST';
      
      const payload = activeTab === 'class' ? {
        programName: formData.programName,
        semester: formData.semester,
        dayOfWeek: formData.dayOfWeek,
        period: formData.period,
        subject: formData.subject,
        faculty: formData.faculty || null,
        room: formData.room || null,
      } : {
        programName: formData.programName,
        semester: formData.semester,
        examName: formData.examName,
        subject: formData.subject,
        examDate: formData.examDate,
        startTime: formData.startTime,
        endTime: formData.endTime,
        room: formData.room || null,
      };

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        setShowModal(false);
        setEditingItem(null);
        setFormData({
          programName: '',
          semester: '',
          dayOfWeek: '',
          period: '',
          subject: '',
          faculty: '',
          room: '',
          examName: '',
          examDate: '',
          startTime: '',
          endTime: '',
        });
        loadData();
      } else {
        const error = await res.json();
        alert(error.error || 'Failed to save');
      }
    } catch (error) {
      console.error('Failed to save:', error);
      alert('Failed to save');
    }
  };

  const handleEdit = (item: ClassTimetable | ExamTimetable) => {
    setEditingItem(item);
    if (activeTab === 'class') {
      const classItem = item as ClassTimetable;
      setFormData({
        programName: classItem.programName,
        semester: classItem.semester,
        dayOfWeek: classItem.dayOfWeek,
        period: classItem.period,
        subject: classItem.subject,
        faculty: classItem.faculty || '',
        room: classItem.room || '',
      });
    } else {
      const examItem = item as ExamTimetable;
      setFormData({
        programName: examItem.programName,
        semester: examItem.semester,
        examName: examItem.examName,
        subject: examItem.subject,
        examDate: examItem.examDate.split('T')[0],
        startTime: examItem.startTime,
        endTime: examItem.endTime,
        room: examItem.room || '',
      });
    }
    setShowModal(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this entry?')) return;
    
    try {
      const url = activeTab === 'class'
        ? `/api/admin/class-timetable/${id}`
        : `/api/admin/exam-timetable/${id}`;
      
      const res = await fetch(url, { method: 'DELETE' });
      
      if (res.ok) {
        loadData();
      } else {
        alert('Failed to delete');
      }
    } catch (error) {
      console.error('Failed to delete:', error);
      alert('Failed to delete');
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-charcoal mb-2">Academics</h1>
          <p className="text-gray-600">Manage class and exam timetables</p>
        </div>
        <button
          onClick={() => {
            setEditingItem(null);
            setFormData({
              programName: '',
              semester: '',
              dayOfWeek: '',
              period: '',
              subject: '',
              faculty: '',
              room: '',
              examName: '',
              examDate: '',
              startTime: '',
              endTime: '',
            });
            setShowModal(true);
          }}
          className="btn-primary px-6 py-3 rounded-xl text-white font-semibold hover-lift transition-all"
          style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}
        >
          + Add Entry
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-gray-200">
        <button
          onClick={() => setActiveTab('class')}
          className={`px-6 py-3 font-semibold transition-all ${
            activeTab === 'class'
              ? 'text-primary border-b-2 border-primary'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Class Timetable ({classTimetables.length})
        </button>
        <button
          onClick={() => setActiveTab('exam')}
          className={`px-6 py-3 font-semibold transition-all ${
            activeTab === 'exam'
              ? 'text-primary border-b-2 border-primary'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Exam Timetable ({examTimetables.length})
        </button>
      </div>

      {/* Class Timetable */}
      {activeTab === 'class' && (
        <div className="glass-card rounded-2xl overflow-hidden" style={{ background: 'rgba(255, 255, 255, 0.4)', backdropFilter: 'blur(15px)' }}>
          {loading ? (
            <div className="p-12 text-center">
              <p className="text-gray-600">Loading...</p>
            </div>
          ) : classTimetables.length === 0 ? (
            <div className="p-12 text-center">
              <p className="text-gray-600">No class timetable entries found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="px-6 py-3 text-left text-sm font-semibold">Program</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold">Semester</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold">Day</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold">Period</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold">Subject</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold">Faculty</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold">Room</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {classTimetables.map((item) => (
                    <tr key={item.id} className="border-b border-gray-200 hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm">{item.programName}</td>
                      <td className="px-6 py-4 text-sm">{item.semester}</td>
                      <td className="px-6 py-4 text-sm">{item.dayOfWeek}</td>
                      <td className="px-6 py-4 text-sm">{item.period}</td>
                      <td className="px-6 py-4 text-sm">{item.subject}</td>
                      <td className="px-6 py-4 text-sm">{item.faculty || '-'}</td>
                      <td className="px-6 py-4 text-sm">{item.room || '-'}</td>
                      <td className="px-6 py-4 text-sm">
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleEdit(item)}
                            className="text-blue-600 hover:text-blue-800 font-medium"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(item.id)}
                            className="text-red-600 hover:text-red-800 font-medium"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Exam Timetable */}
      {activeTab === 'exam' && (
        <div className="glass-card rounded-2xl overflow-hidden" style={{ background: 'rgba(255, 255, 255, 0.4)', backdropFilter: 'blur(15px)' }}>
          {loading ? (
            <div className="p-12 text-center">
              <p className="text-gray-600">Loading...</p>
            </div>
          ) : examTimetables.length === 0 ? (
            <div className="p-12 text-center">
              <p className="text-gray-600">No exam timetable entries found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="px-6 py-3 text-left text-sm font-semibold">Program</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold">Semester</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold">Exam Name</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold">Subject</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold">Date</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold">Time</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold">Room</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {examTimetables.map((item) => (
                    <tr key={item.id} className="border-b border-gray-200 hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm">{item.programName}</td>
                      <td className="px-6 py-4 text-sm">{item.semester}</td>
                      <td className="px-6 py-4 text-sm">{item.examName}</td>
                      <td className="px-6 py-4 text-sm">{item.subject}</td>
                      <td className="px-6 py-4 text-sm">{new Date(item.examDate).toLocaleDateString()}</td>
                      <td className="px-6 py-4 text-sm">{item.startTime} - {item.endTime}</td>
                      <td className="px-6 py-4 text-sm">{item.room || '-'}</td>
                      <td className="px-6 py-4 text-sm">
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleEdit(item)}
                            className="text-blue-600 hover:text-blue-800 font-medium"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(item.id)}
                            className="text-red-600 hover:text-red-800 font-medium"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="glass-card rounded-2xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto" style={{ background: 'rgba(255, 255, 255, 0.95)', backdropFilter: 'blur(20px)' }}>
            <h2 className="text-2xl font-bold text-charcoal mb-4">
              {editingItem ? 'Edit Entry' : 'Add Entry'} - {activeTab === 'class' ? 'Class Timetable' : 'Exam Timetable'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-charcoal mb-2">Program Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.programName}
                    onChange={(e) => setFormData({ ...formData, programName: e.target.value })}
                    className="modern-input w-full rounded-xl py-3 px-4"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-charcoal mb-2">Semester *</label>
                  <input
                    type="text"
                    required
                    value={formData.semester}
                    onChange={(e) => setFormData({ ...formData, semester: e.target.value })}
                    className="modern-input w-full rounded-xl py-3 px-4"
                  />
                </div>
              </div>

              {activeTab === 'class' ? (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-charcoal mb-2">Day of Week *</label>
                      <input
                        type="text"
                        required
                        value={formData.dayOfWeek}
                        onChange={(e) => setFormData({ ...formData, dayOfWeek: e.target.value })}
                        className="modern-input w-full rounded-xl py-3 px-4"
                        placeholder="e.g., Monday"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-charcoal mb-2">Period *</label>
                      <input
                        type="text"
                        required
                        value={formData.period}
                        onChange={(e) => setFormData({ ...formData, period: e.target.value })}
                        className="modern-input w-full rounded-xl py-3 px-4"
                        placeholder="e.g., Period 1"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-charcoal mb-2">Subject *</label>
                    <input
                      type="text"
                      required
                      value={formData.subject}
                      onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                      className="modern-input w-full rounded-xl py-3 px-4"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-charcoal mb-2">Faculty</label>
                      <input
                        type="text"
                        value={formData.faculty}
                        onChange={(e) => setFormData({ ...formData, faculty: e.target.value })}
                        className="modern-input w-full rounded-xl py-3 px-4"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-charcoal mb-2">Room</label>
                      <input
                        type="text"
                        value={formData.room}
                        onChange={(e) => setFormData({ ...formData, room: e.target.value })}
                        className="modern-input w-full rounded-xl py-3 px-4"
                      />
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <div>
                    <label className="block text-sm font-medium text-charcoal mb-2">Exam Name *</label>
                    <input
                      type="text"
                      required
                      value={formData.examName}
                      onChange={(e) => setFormData({ ...formData, examName: e.target.value })}
                      className="modern-input w-full rounded-xl py-3 px-4"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-charcoal mb-2">Subject *</label>
                    <input
                      type="text"
                      required
                      value={formData.subject}
                      onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                      className="modern-input w-full rounded-xl py-3 px-4"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-charcoal mb-2">Exam Date *</label>
                      <input
                        type="date"
                        required
                        value={formData.examDate}
                        onChange={(e) => setFormData({ ...formData, examDate: e.target.value })}
                        className="modern-input w-full rounded-xl py-3 px-4"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-charcoal mb-2">Room</label>
                      <input
                        type="text"
                        value={formData.room}
                        onChange={(e) => setFormData({ ...formData, room: e.target.value })}
                        className="modern-input w-full rounded-xl py-3 px-4"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-charcoal mb-2">Start Time *</label>
                      <input
                        type="time"
                        required
                        value={formData.startTime}
                        onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                        className="modern-input w-full rounded-xl py-3 px-4"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-charcoal mb-2">End Time *</label>
                      <input
                        type="time"
                        required
                        value={formData.endTime}
                        onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                        className="modern-input w-full rounded-xl py-3 px-4"
                      />
                    </div>
                  </div>
                </>
              )}

              <div className="flex gap-3 justify-end pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    setEditingItem(null);
                  }}
                  className="px-6 py-3 rounded-xl text-charcoal font-semibold hover-lift transition-all"
                  style={{ background: 'rgba(255, 255, 255, 0.5)' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-3 rounded-xl text-white font-semibold hover-lift transition-all"
                  style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}
                >
                  {editingItem ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}



