import { useState, useContext, useEffect } from 'react';
import { AuthContext } from '../context/AuthContext';
import api from '../utils/api';

const GenerateQRPage = () => {
  const { user } = useContext(AuthContext);
  const [classes, setClasses] = useState([]);
  const [selectedClass, setSelectedClass] = useState('');
  const [lectureTiming, setLectureTiming] = useState('');
  const [duration, setDuration] = useState(120);
  const [qrCode, setQrCode] = useState('');
  const [sessionData, setSessionData] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchClasses();
  }, []);

  const fetchClasses = async () => {
    try {
      const res = await api.get('/classes');
      setClasses(res.data);
      if (res.data.length > 0) {
        setSelectedClass(res.data[0]._id);
      }
    } catch (error) {
      console.error('Error fetching classes:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (!user) {
      setError('You must be logged in as a teacher to generate session QR');
      setLoading(false);
      return;
    }

    if (user.role !== 'admin') {
      setError('Only teachers can generate session QR codes');
      setLoading(false);
      return;
    }

    if (!selectedClass) {
      setError('Please select a class');
      setLoading(false);
      return;
    }

    try {
      const res = await api.post('/sessions/generate', { 
        classId: selectedClass,
        lectureTiming,
        duration
      });
      setQrCode(res.data.qrCode);
      setSessionData(res.data);
      setLectureTiming('');
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || 'Failed to generate session QR';
      setError(errorMessage);
      console.error('Error:', error.response?.data || error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-container">
      <div className="form-container max-w-2xl w-full">
        <h1 className="text-3xl font-bold mb-8 text-center text-gray-800">Generate Lecture Session QR Code</h1>
        
        {!user && (
          <div className="mb-4 p-3 bg-yellow-100 border border-yellow-400 text-yellow-700 rounded-lg">
            Please log in as a teacher to generate session QR
          </div>
        )}

        {user && user.role !== 'admin' && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg">
            Only teachers can generate session QR codes
          </div>
        )}

        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg">
            {error}
          </div>
        )}

        {user && user.role === 'admin' && !qrCode && (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="label-field">Select Class</label>
              <select
                value={selectedClass}
                onChange={(e) => setSelectedClass(e.target.value)}
                className="input-field"
                required
              >
                <option value="">Choose a class</option>
                {classes.map((cls) => (
                  <option key={cls._id} value={cls._id}>
                    {cls.name} ({cls.code})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="label-field">Lecture Timing</label>
              <input
                type="text"
                value={lectureTiming}
                onChange={(e) => setLectureTiming(e.target.value)}
                className="input-field"
                placeholder="e.g., Monday 9:00 AM - 10:00 AM"
                required
              />
            </div>
            <div>
              <label className="label-field">Session Duration (minutes)</label>
              <input
                type="number"
                value={duration}
                onChange={(e) => setDuration(Number(e.target.value))}
                className="input-field"
                placeholder="120"
                min="15"
                max="240"
                required
              />
              <p className="text-sm text-gray-500 mt-1">
                QR code will expire after {duration} minutes
              </p>
            </div>
            <button 
              type="submit" 
              disabled={loading}
              className="btn-primary"
            >
              {loading ? 'Generating...' : '🎓 Generate Lecture QR'}
            </button>
          </form>
        )}

        {qrCode && sessionData && (
          <div className="mt-8 text-center">
            <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-6">
              <h2 className="text-2xl font-bold mb-2 text-green-800">✓ Session Active!</h2>
              <p className="text-gray-700 mb-2">{sessionData.lectureTiming}</p>
              <p className="text-sm text-gray-600">
                Expires at: {new Date(sessionData.expiresAt).toLocaleString()}
              </p>
            </div>

            <div className="bg-white border-4 border-purple-500 rounded-lg p-6 inline-block">
              <img src={qrCode} alt="Session QR Code" className="w-80 h-80" />
            </div>

            <div className="mt-6 space-y-3">
              <p className="text-gray-700 font-semibold">
                Students can scan this QR code to mark attendance
              </p>
              <div className="flex gap-4 justify-center">
                <button 
                  onClick={() => {
                    setQrCode('');
                    setSessionData(null);
                  }}
                  className="btn-secondary"
                >
                  Generate Another Session
                </button>
                <button
                  onClick={() => {
                    const link = document.createElement('a');
                    link.href = qrCode;
                    link.download = `session-qr-${sessionData.sessionId}.png`;
                    link.click();
                  }}
                  className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg font-bold transition"
                >
                  📥 Download QR Code
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default GenerateQRPage;
