import React, { useState, useEffect } from 'react';
import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import api from '../utils/api';

const ClassesPage = () => {
  const { user } = useContext(AuthContext);
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [activeSession, setActiveSession] = useState(null);
  const [sessionDuration, setSessionDuration] = useState(60); // minutes

  useEffect(() => {
    fetchClasses();
  }, []);

  const fetchClasses = async () => {
    try {
      setLoading(true);
      const res = await api.get('/classes');
      setClasses(res.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch classes');
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

  const handleCreateClass = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      await api.post('/classes', formData);
      setFormData({ name: '', description: '' });
      setShowForm(false);
      await fetchClasses();
      setError('');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create class');
    } finally {
      setSubmitting(false);
    }
  };

  const handleGenerateQR = async (classId) => {
    try {
      setActiveSession(classId);
      const res = await api.post('/sessions/generate', {
        classId,
        lectureTiming: new Date().toLocaleTimeString(),
        durationMinutes: sessionDuration,
      });
      alert('QR Code generated! Students can now scan to mark attendance.');
      // Show QR for some time
      setTimeout(() => setActiveSession(null), 300000); // 5 minutes
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to generate QR');
    }
  };

  if (!user || user.role !== 'admin') {
    return (
      <div className="p-8 text-center">
        <p className="text-red-600 text-lg">Access Denied. Only teachers can manage classes.</p>
      </div>
    );
  }

  if (loading) return <div className="p-8 text-center">Loading classes...</div>;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">My Classes</h1>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg transition"
        >
          {showForm ? 'Cancel' : '+ New Class'}
        </button>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {/* Create Class Form */}
      {showForm && (
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h2 className="text-xl font-bold mb-4">Create New Class</h2>
          <form onSubmit={handleCreateClass}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Class Name *
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="e.g., Mathematics 101"
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <input
                  type="text"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="e.g., Advanced Algebra"
                  className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>
            <button
              type="submit"
              disabled={submitting}
              className="bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 text-white px-6 py-2 rounded transition"
            >
              {submitting ? 'Creating...' : 'Create Class'}
            </button>
          </form>
        </div>
      )}

      {/* Classes Grid */}
      {classes.length === 0 ? (
        <div className="bg-gray-100 rounded-lg p-8 text-center">
          <p className="text-gray-600 mb-4">No classes yet. Create one to get started!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {classes.map((cls) => (
            <div key={cls._id} className="bg-white rounded-lg shadow hover:shadow-lg transition overflow-hidden">
              <div className="bg-gradient-to-r from-purple-500 to-blue-500 text-white p-6">
                <h3 className="text-2xl font-bold">{cls.name}</h3>
                <p className="text-purple-100 mt-2">{cls.description}</p>
              </div>

              <div className="p-6">
                <div className="mb-4">
                  <p className="text-sm text-gray-600">Class Code:</p>
                  <p className="text-lg font-bold text-gray-800 font-mono bg-gray-100 p-2 rounded">
                    {cls.code}
                  </p>
                </div>

                {/* QR Generation Section */}
                {activeSession === cls._id ? (
                  <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded">
                    <p className="text-green-700 font-semibold text-sm mb-2">✓ QR Code Active</p>
                    <p className="text-xs text-green-600">Session will expire in 5 minutes</p>
                  </div>
                ) : (
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Session Duration (minutes)
                    </label>
                    <input
                      type="number"
                      value={sessionDuration}
                      onChange={(e) => setSessionDuration(parseInt(e.target.value))}
                      min="5"
                      max="180"
                      className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
                    />
                  </div>
                )}

                <div className="space-y-2">
                  <button
                    onClick={() => handleGenerateQR(cls._id)}
                    disabled={activeSession === cls._id}
                    className="w-full bg-purple-500 hover:bg-purple-600 disabled:bg-gray-400 text-white px-4 py-2 rounded transition text-sm font-semibold"
                  >
                    {activeSession === cls._id ? '✓ QR Active' : '🔲 Generate QR Code'}
                  </button>

                  <a
                    href={`/students?classId=${cls._id}`}
                    className="block w-full bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded transition text-sm font-semibold text-center"
                  >
                    👥 View Students ({cls.studentCount || 0})
                  </a>

                  <a
                    href={`/add-students?classId=${cls._id}`}
                    className="block w-full bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded transition text-sm font-semibold text-center"
                  >
                    ➕ Add Students
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ClassesPage;
