import React, { useState, useEffect } from 'react';
import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import api from '../utils/api';

const TeacherDashboard = () => {
  const { user } = useContext(AuthContext);
  const [stats, setStats] = useState(null);
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedClass, setSelectedClass] = useState(null);

  useEffect(() => {
    fetchTeacherData();
  }, []);

  const fetchTeacherData = async () => {
    try {
      setLoading(true);
      // Fetch teacher's classes
      const classRes = await api.get('/classes');
      setClasses(classRes.data);
      
      // If classes exist, fetch stats for first class
      if (classRes.data.length > 0) {
        setSelectedClass(classRes.data[0]._id);
        await fetchStats(classRes.data[0]._id);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async (classId) => {
    try {
      const res = await api.get(`/attendance/summary?classId=${classId}`);
      setStats(res.data);
    } catch (err) {
      console.error('Error fetching stats:', err);
    }
  };

  const handleClassChange = (classId) => {
    setSelectedClass(classId);
    fetchStats(classId);
  };

  if (loading) return <div className="p-8 text-center">Loading dashboard...</div>;

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Teacher Dashboard</h1>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {/* Class Selector */}
      {classes.length > 0 && (
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Select Class
          </label>
          <select
            value={selectedClass || ''}
            onChange={(e) => handleClassChange(e.target.value)}
            className="w-full max-w-xs px-4 py-2 border border-gray-300 rounded focus:outline-none focus:border-purple-500"
          >
            {classes.map((cls) => (
              <option key={cls._id} value={cls._id}>
                {cls.name} ({cls.code})
              </option>
            ))}
          </select>
        </div>
      )}

      {classes.length === 0 && (
        <div className="bg-blue-100 border border-blue-400 text-blue-700 px-4 py-3 rounded mb-4">
          No classes found. <a href="/classes" className="font-bold underline">Create one now</a>
        </div>
      )}

      {/* Summary Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-lg shadow p-6 border-l-4 border-blue-500">
            <h3 className="text-gray-500 text-sm font-semibold">Total Students</h3>
            <p className="text-3xl font-bold text-blue-600 mt-2">{stats.totalStudents || 0}</p>
          </div>

          <div className="bg-white rounded-lg shadow p-6 border-l-4 border-green-500">
            <h3 className="text-gray-500 text-sm font-semibold">Present Today</h3>
            <p className="text-3xl font-bold text-green-600 mt-2">{stats.presentToday || 0}</p>
          </div>

          <div className="bg-white rounded-lg shadow p-6 border-l-4 border-red-500">
            <h3 className="text-gray-500 text-sm font-semibold">Absent Today</h3>
            <p className="text-3xl font-bold text-red-600 mt-2">
              {(stats.totalStudents || 0) - (stats.presentToday || 0)}
            </p>
          </div>

          <div className="bg-white rounded-lg shadow p-6 border-l-4 border-purple-500">
            <h3 className="text-gray-500 text-sm font-semibold">Average Attendance</h3>
            <p className="text-3xl font-bold text-purple-600 mt-2">
              {Math.round(stats.averageAttendance || 0)}%
            </p>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <a
          href="/classes"
          className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg flex items-center justify-center gap-2 transition"
        >
          📚 Manage Classes
        </a>
        <a
          href="/students"
          className="bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-lg flex items-center justify-center gap-2 transition"
        >
          👥 Manage Students
        </a>
          {/* Reports section removed */}
      </div>

      {/* Recent Attendance Logs */}
      {stats && stats.recentLogs && (
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-bold mb-4">Recent Attendance Logs</h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2 px-2">Student</th>
                  <th className="text-left py-2 px-2">Class</th>
                  <th className="text-left py-2 px-2">Status</th>
                  <th className="text-left py-2 px-2">Time</th>
                </tr>
              </thead>
              <tbody>
                {stats.recentLogs.length > 0 ? (
                  stats.recentLogs.map((log) => (
                    <tr key={log._id} className="border-b hover:bg-gray-50">
                      <td className="py-3 px-2">{log.studentName || 'Unknown'}</td>
                      <td className="py-3 px-2 text-sm text-gray-600">
                        {log.className || 'Class'} {log.classCode ? `(${log.classCode})` : ''}
                      </td>
                      <td className="py-3 px-2">
                        <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm">
                          Present
                        </span>
                      </td>
                      <td className="py-3 px-2 text-sm text-gray-600">
                        {new Date(log.scanTime).toLocaleTimeString()}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="3" className="py-4 text-center text-gray-500">
                      No attendance records yet
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default TeacherDashboard;
