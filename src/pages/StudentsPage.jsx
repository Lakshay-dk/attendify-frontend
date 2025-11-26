import { useState, useEffect, useContext } from 'react';
import { useSearchParams } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import StudentCard from '../components/StudentCard';
import api from '../utils/api';

const StudentsPage = () => {
  const { user } = useContext(AuthContext);
  const [searchParams] = useSearchParams();
  const classId = searchParams.get('classId');

  const [students, setStudents] = useState([]);
  const [classes, setClasses] = useState([]);
  const [selectedClass, setSelectedClass] = useState(classId || null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchData();
  }, [selectedClass]);

  const fetchData = async () => {
    try {
      setLoading(true);

      // If teacher, fetch classes first
      if (user?.role === 'admin') {
        const classRes = await api.get('/classes');
        setClasses(classRes.data);

        if (!selectedClass && classRes.data.length > 0) {
          setSelectedClass(classRes.data[0]._id);
        }
      }

      // Fetch students for selected class with attendance percentage
      if (selectedClass) {
        const res = await api.get(`/students/class/${selectedClass}/with-attendance`);
        setStudents(res.data);
      }

      setError('');
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to fetch data';
      setError(errorMessage);
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredStudents = students.filter(student =>
    student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.enrollmentNumber.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (!user || user.role !== 'admin') {
    return (
      <div className="p-8 text-center">
        <p className="text-red-600 text-lg">Access Denied. Only teachers can view students.</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Manage Students</h1>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {/* Class Selector */}
      {classes.length > 0 && (
        <div className="mb-6 flex gap-4 items-end">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Class
            </label>
            <select
              value={selectedClass || ''}
              onChange={(e) => setSelectedClass(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500"
            >
              <option value="">-- Choose a class --</option>
              {classes.map((cls) => (
                <option key={cls._id} value={cls._id}>
                  {cls.name} ({cls.code})
                </option>
              ))}
            </select>
          </div>

          <a
            href={`/add-students?classId=${selectedClass}`}
            className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded transition whitespace-nowrap"
          >
            + Add Student
          </a>
        </div>
      )}

      {/* Search Box */}
      <div className="mb-6">
        <input
          type="text"
          placeholder="Search by name or enrollment number..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500"
        />
      </div>

      {loading && (
        <div className="text-center py-8">Loading students...</div>
      )}

      {!loading && students.length === 0 && !error && (
        <div className="bg-gray-100 rounded-lg p-8 text-center">
          <p className="text-gray-600 mb-4">No students in this class yet</p>
          <a
            href={`/add-students?classId=${selectedClass}`}
            className="text-blue-600 underline hover:text-blue-800"
          >
            Add the first student
          </a>
        </div>
      )}

      {/* Students Table */}
      {!loading && filteredStudents.length > 0 && (
        <div className="bg-white rounded-lg shadow overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b">
                <th className="text-left py-3 px-4">Name</th>
                <th className="text-left py-3 px-4">Enrollment #</th>
                <th className="text-left py-3 px-4">Email</th>
                <th className="text-left py-3 px-4">Attendance %</th>
                <th className="text-left py-3 px-4">Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredStudents.map((student) => (
                <tr key={student._id} className="border-b hover:bg-gray-50">
                  <td className="py-3 px-4 font-semibold">{student.name}</td>
                  <td className="py-3 px-4 font-mono text-sm bg-gray-50">{student.enrollmentNumber}</td>
                  <td className="py-3 px-4 text-sm">{student.email || 'N/A'}</td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      <div className="w-16 h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-green-500"
                          style={{
                            width: `${Math.min(student.attendancePercentage || 0, 100)}%`,
                          }}
                        />
                      </div>
                      <span className="text-sm font-semibold">
                        {Math.round(student.attendancePercentage || 0)}%
                      </span>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        (student.attendancePercentage || 0) >= 75
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {(student.attendancePercentage || 0) >= 75 ? 'Regular' : 'Irregular'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {!loading && searchTerm && filteredStudents.length === 0 && (
        <div className="bg-gray-100 rounded-lg p-8 text-center">
          <p className="text-gray-600">No students match your search</p>
        </div>
      )}
    </div>
  );
};

export default StudentsPage;
