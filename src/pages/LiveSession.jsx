import React, { useEffect, useState, useContext, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../utils/api';
import { AuthContext } from '../context/AuthContext';

const LiveSession = () => {
  const { classId } = useParams();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);

  const [qrImage, setQrImage] = useState(null);
  const [expiresAt, setExpiresAt] = useState(null);
  const [classDetails, setClassDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [countdown, setCountdown] = useState(0);
  const countdownRef = useRef(null);
  const refreshRef = useRef(null);

  const fetchLiveQR = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await api.get(`/attendance/live-qr/${classId}`);
      const { qrImage, expiresAt, classDetails: cls, lectureTiming } = res.data;
      setQrImage(qrImage);
      setExpiresAt(expiresAt ? new Date(expiresAt) : null);
      setClassDetails({ ...cls, lectureTiming });
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load live QR');
      setQrImage(null);
      setExpiresAt(null);
      setClassDetails(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // only teachers/admins allowed on this page
    if (!user || user.role !== 'admin') {
      navigate('/dashboard');
      return;
    }

    fetchLiveQR();

    // countdown timer tick every second
    countdownRef.current = setInterval(() => {
      if (!expiresAt) return setCountdown(0);
      const diff = Math.max(0, new Date(expiresAt).getTime() - Date.now());
      setCountdown(Math.floor(diff / 1000));
    }, 1000);

    // optional auto-refresh of QR (every 30s) in case backend rotates
    refreshRef.current = setInterval(() => {
      fetchLiveQR();
    }, 30000);

    return () => {
      clearInterval(countdownRef.current);
      clearInterval(refreshRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [classId, user, expiresAt]);

  const formatCountdown = (secs) => {
    const h = Math.floor(secs / 3600);
    const m = Math.floor((secs % 3600) / 60);
    const s = secs % 60;
    return `${h > 0 ? `${h}:` : ''}${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`;
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-3xl mx-auto bg-white rounded-lg shadow p-6 text-center">
        <h1 className="text-2xl font-bold mb-4">Live QR Session</h1>

        {loading && <p className="text-gray-600">Loading session...</p>}

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        {classDetails && (
          <div className="mb-4">
            <p className="text-sm text-gray-500">Class</p>
            <p className="text-lg font-semibold">{classDetails.name || classDetails.code || 'Class'}</p>
            {classDetails.subject && <p className="text-sm text-gray-600">{classDetails.subject}</p>}
            {classDetails.lectureTiming && <p className="text-sm text-gray-500">{classDetails.lectureTiming}</p>}
          </div>
        )}

        <div className="flex flex-col items-center gap-4">
          {qrImage ? (
            <div className="p-4 bg-gray-50 rounded-lg">
              <img src={qrImage} alt="Live session QR" className="w-64 h-64 md:w-80 md:h-80 object-contain" />
            </div>
          ) : (
            !loading && <p className="text-gray-600">No active QR session for this class.</p>
          )}

          <div className="mt-2 text-gray-700">
            <span className="font-semibold">Expires in: </span>
            <span className="ml-2 text-lg font-mono">{countdown > 0 ? formatCountdown(countdown) : 'Expired'}</span>
          </div>

          <div className="flex gap-3 mt-6">
            <button
              className="bg-gray-200 text-gray-700 px-4 py-2 rounded"
              onClick={() => navigate('/dashboard')}
            >
              Back to Dashboard
            </button>

            <button
              className="bg-blue-500 text-white px-4 py-2 rounded"
              onClick={() => fetchLiveQR()}
            >
              Refresh QR
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LiveSession;
