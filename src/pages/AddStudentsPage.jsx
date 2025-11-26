import React, { useState, useEffect } from 'react';
import { useContext } from 'react';
import { useSearchParams } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import api from '../utils/api';

const AddStudentsPage = () => {
  const { user } = useContext(AuthContext);
  const [searchParams] = useSearchParams();
  const classId = searchParams.get('classId');

  const [formData, setFormData] = useState({
    name: '',
    enrollmentNumber: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [removingId, setRemovingId] = useState('');

  useEffect(() => {
    if (classId) {
      fetchStudents();
    }
  }, [classId]);

  const fetchStudents = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/classes/${classId}/students`);
      setStudents(res.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch students');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleAddStudent = async (e) => {
    e.preventDefault();
    if (!classId) {
      setError('Class ID is required');
      return;
    }

    try {
      setSubmitting(true);
      await api.post(`/classes/${classId}/students`, formData);
      setFormData({ name: '', enrollmentNumber: '' });
      setSuccess('Student added successfully!');
      await fetchStudents();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add student');
    } finally {
      setSubmitting(false);
    }
  };

  const handleRemoveStudent = async (studentId) => {
    if (!classId) return;
    const confirm = window.confirm('Remove this student from the class? This will also clear their attendance for this class.');
    if (!confirm) return;

    try {
      setRemovingId(studentId);
      await api.delete(`/classes/${classId}/students/${studentId}`);
      setSuccess('Student removed successfully');
      await fetchStudents();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to remove student');
    } finally {
      setRemovingId('');
    }
  };

  if (!user || user.role !== 'admin') {
    return (
      <div className="p-8 text-center">
        <p className="text-red-600 text-lg">Access Denied. Only teachers can add students.</p>
      </div>
    );
  }

  if (!classId) {
    return (
      <div className="p-8 text-center">
        <p className="text-red-600 text-lg">No class selected. <a href="/classes" className="text-blue-600 underline">Go back to classes</a></p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Add Students to Class</h1>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {success && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
          {success}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Add Student Form */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-bold mb-6">Add New Student</h2>
          <form onSubmit={handleAddStudent}>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Student Name *
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="e.g., John Doe"
                required
                className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500"
              />
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Enrollment Number *
              </label>
              <input
                type="text"
                name="enrollmentNumber"
                value={formData.enrollmentNumber}
                onChange={handleInputChange}
                placeholder="e.g., EN001"
                required
                className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500"
              />
            </div>

            <div className="mb-6">
              {/* Email field removed */}
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 text-white px-4 py-2 rounded font-bold transition"
            >
              {submitting ? 'Adding Student...' : 'Add Student'}
            </button>
          </form>
        </div>

        {/* Students List */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-bold mb-4">Enrolled Students</h2>
          {loading ? (
            <div className="text-center py-4">Loading students...</div>
          ) : students.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No students enrolled yet
            </div>
          ) : (
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {students.map((student, idx) => (
                <div key={student._id} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                  <div>
                    <p className="font-semibold text-gray-800">{student.name}</p>
                    <p className="text-sm text-gray-600">{student.enrollmentNumber}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <p className="text-xs font-mono bg-blue-100 text-blue-800 px-2 py-1 rounded">
                      {student.attendancePercentage ? `${Math.round(student.attendancePercentage)}%` : 'N/A'}
                    </p>
                    <button
                      onClick={() => handleRemoveStudent(student._id)}
                      disabled={removingId === student._id}
                      className="text-sm text-red-600 hover:text-red-800"
                    >
                      {removingId === student._id ? 'Removing...' : 'Remove'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AddStudentsPage;
