import React, { useState, useEffect } from 'react';
import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import api from '../utils/api';
import StudentQRScanner from '../components/StudentQRScanner';

const StudentDashboard = () => {
  const { user } = useContext(AuthContext);
  const [activeSession, setActiveSession] = useState(null);
  const [attendanceHistory, setAttendanceHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [scanning, setScanning] = useState(false);
  const [attendancePercentage, setAttendancePercentage] = useState(0);
  const [studentProfile, setStudentProfile] = useState(null);
  const [availableClasses, setAvailableClasses] = useState([]);
  const [selectedClassId, setSelectedClassId] = useState(user?.classId || null);

  useEffect(() => {
    fetchStudentData();
  }, []);

  useEffect(() => {
    // Poll for active session every 5 seconds for the selected class
    if (user?.role === 'student' && selectedClassId) {
      const interval = setInterval(() => fetchActiveSession(selectedClassId), 5000);
      return () => clearInterval(interval);
    }
  }, [user, selectedClassId]);

  const fetchStudentData = async (preferredClassId = null) => {
    try {
      setLoading(true);
      // First get student profile (for display)
      const profileRes = await api.get('/students/profile');
      const profileData = profileRes.data;
      setStudentProfile(profileData);

      const classesFromProfile = profileData.classes || [];
      setAvailableClasses(classesFromProfile);

      const resolvedClassId = preferredClassId
        || selectedClassId
        || user?.classId
        || classesFromProfile[0]?.classId
        || profileData.class?._id
        || null;

      if (resolvedClassId) {
        setSelectedClassId(resolvedClassId);
        await Promise.all([
          fetchActiveSession(resolvedClassId),
          fetchAttendanceHistory(resolvedClassId),
        ]);
      } else {
        setActiveSession(null);
        setAttendanceHistory([]);
        setAttendancePercentage(0);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };

  const fetchActiveSession = async (classId) => {
    if (!classId) {
      setActiveSession(null);
      return;
    }
    try {
      const res = await api.get(`/sessions/active/${classId}`);
      console.log('Active session response:', res.data);
      setActiveSession(res.data || null);
    } catch (err) {
      console.log('No active session or error:', err.response?.data || err.message);
      // No active session - this is normal, not an error
      setActiveSession(null);
    }
  };

  const fetchAttendanceHistory = async (classId) => {
    if (!classId) {
      setAttendanceHistory([]);
      setAttendancePercentage(0);
      return;
    }
    try {
      const res = await api.get('/attendance/history', { params: { classId } });
      setAttendanceHistory(res.data.attendanceRecords || []);
      setAttendancePercentage(res.data.percentage || 0);
    } catch (err) {
      console.error('Error fetching attendance history:', err);
    }
  };

  const handleClassChange = async (event) => {
    const classId = event.target.value;
    setSelectedClassId(classId);
    await Promise.all([
      fetchActiveSession(classId),
      fetchAttendanceHistory(classId),
    ]);
  };

  const markAttendance = async (sessionId) => {
    // kept for compatibility if direct marking is needed elsewhere
    try {
      await api.post('/attendance/mark', { sessionId });
      await fetchStudentData(selectedClassId);
      setError('');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to mark attendance. Session may have expired.');
    }
  };

  if (loading) return <div className="p-8 text-center">Loading dashboard...</div>;

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Welcome, {user?.name || 'Student'}!</h1>

      {/* Student Profile Info */}
      {studentProfile && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
          <p className="text-blue-700">
            <strong>Class:</strong> {studentProfile.class?.name || 'Not assigned'} | 
            <strong> Enrollment:</strong> {studentProfile.enrollmentNumber || 'N/A'}
          </p>
        </div>
      )}

      {availableClasses.length > 0 && (
        <div className="bg-white border border-gray-200 rounded-lg p-4 mb-6 flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm text-gray-500">Viewing Class</p>
            <p className="text-lg font-semibold">
              {availableClasses.find((cls) => cls.classId === selectedClassId)?.className || studentProfile?.class?.name || 'Select a class'}
            </p>
          </div>
          {availableClasses.length > 1 && (
            <select
              value={selectedClassId || ''}
              onChange={handleClassChange}
              className="px-4 py-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500"
            >
              {availableClasses.map((cls) => (
                <option key={cls.classId} value={cls.classId}>
                  {cls.className} ({cls.classCode})
                </option>
              ))}
            </select>
          )}
        </div>
      )}

      {!studentProfile?.class && (
        <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded mb-4">
          You are not enrolled in any class. Please contact your teacher or re-register with a valid class.
        </div>
      )}

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {/* Active Session / QR Section */}
      <div className="bg-white rounded-lg shadow p-8 mb-8 text-center">
        <h2 className="text-2xl font-bold mb-6">Today's Lecture</h2>
        
        {activeSession ? (
          <>
            <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-6">
              <p className="text-green-700 font-semibold mb-2">✓ Session Active</p>
              <p className="text-gray-600 mb-4">
                {activeSession.lectureTiming || 'Lecture in progress'}
              </p>
              
              {activeSession.qrCode && (
                <div className="flex justify-center mb-6">
                  <div className="border-4 border-purple-500 p-4 bg-white rounded-lg">
                    <img 
                      src={activeSession.qrCode} 
                      alt="Session QR Code" 
                      className="w-64 h-64"
                    />
                  </div>
                </div>
              )}

              <button
                onClick={() => setScanning(true)}
                disabled={scanning}
                className="bg-green-500 hover:bg-green-600 disabled:bg-gray-400 text-white px-8 py-3 rounded-lg font-bold transition"
              >
                {scanning ? 'Opening camera...' : '📱 Mark Attendance'}
              </button>

              {/* Camera scanner opens when `scanning` is true. */}
              {scanning && (
                <div className="mt-6">
                  <StudentQRScanner
                    onClose={() => setScanning(false)}
                    onMarked={async () => {
                      setScanning(false);
                      await fetchStudentData(selectedClassId);
                    }}
                  />
                </div>
              )}
            </div>
          </>
        ) : (
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
            <p className="text-gray-600 text-lg">
              No active lecture at the moment. Check back later!
            </p>
          </div>
        )}
      </div>

      {/* Attendance Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6 border-l-4 border-blue-500">
          <h3 className="text-gray-500 text-sm font-semibold">Attendance Percentage</h3>
          <div className="flex items-end justify-between mt-4">
            <p className="text-4xl font-bold text-blue-600">{Math.round(attendancePercentage)}%</p>
            <div className="w-24 h-24 relative">
              <svg className="transform -rotate-90" width="100" height="100" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="45" fill="none" stroke="#e0e0e0" strokeWidth="8" />
                <circle
                  cx="50"
                  cy="50"
                  r="45"
                  fill="none"
                  stroke="#3b82f6"
                  strokeWidth="8"
                  strokeDasharray={`${2 * 3.14159 * 45 * (attendancePercentage / 100)} ${2 * 3.14159 * 45}`}
                />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-gray-500 text-sm font-semibold mb-4">Quick Stats</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Total Classes</span>
              <span className="font-bold text-lg">{attendanceHistory.length}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Present</span>
              <span className="font-bold text-lg text-green-600">
                {attendanceHistory.filter(a => a.status?.toLowerCase() === 'present').length}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Absent</span>
              <span className="font-bold text-lg text-red-600">
                {attendanceHistory.filter(a => a.status?.toLowerCase() === 'absent').length}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Attendance History */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-bold mb-4">Attendance History</h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b bg-gray-50">
                <th className="text-left py-3 px-4">Date</th>
                <th className="text-left py-3 px-4">Subject</th>
                <th className="text-left py-3 px-4">Status</th>
                <th className="text-left py-3 px-4">Time</th>
              </tr>
            </thead>
            <tbody>
              {attendanceHistory.length > 0 ? (
                attendanceHistory.map((record) => (
                  <tr key={record._id} className="border-b hover:bg-gray-50">
                    <td className="py-3 px-4">
                      {new Date(record.createdAt).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-4">{record.className || 'Class'}</td>
                    <td className="py-3 px-4">
                      <span
                        className={`px-3 py-1 rounded-full text-sm font-semibold ${
                          record.status === 'Present'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {record.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-600">
                      {record.scanTime ? new Date(record.scanTime).toLocaleTimeString() : 'N/A'}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4" className="py-8 text-center text-gray-500">
                    No attendance records yet
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;
