import React, { useEffect, useState, useContext, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../utils/api";
import { AuthContext } from "../context/AuthContext";

const LiveSession = () => {
  const { classId } = useParams();
  const navigate = useNavigate();
  const { user, loading: authLoading } = useContext(AuthContext);

  const [qrImage, setQrImage] = useState(null);
  const [expiresAt, setExpiresAt] = useState(null);
  const [classDetails, setClassDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const countdownRef = useRef(null);
  const [secondsLeft, setSecondsLeft] = useState(0);

  const fetchQR = async () => {
    try {
      setError("");
      const res = await api.get(`/attendance/live-qr/${classId}`);
      if (!res.data?.qrImage) {
        throw new Error("No active session found");
      }
      setQrImage(res.data.qrImage);
      setExpiresAt(res.data.expiresAt ? new Date(res.data.expiresAt) : null);
      setClassDetails(res.data.classDetails || null);
      setLoading(false);
    } catch (err) {
      setError(err.response?.data?.message || err.message || "Could not fetch QR");
      setQrImage(null);
      setExpiresAt(null);
      setClassDetails(null);
      setLoading(false);
    }
  };

  useEffect(() => {
    if (authLoading) return; // wait for auth state
    const isTeacher = user && (user.role === "admin" || user.role === "teacher");
    if (!isTeacher) {
      navigate("/dashboard");
      return;
    }
    fetchQR();
    const refresh = setInterval(fetchQR, 30000);
    return () => clearInterval(refresh);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authLoading, user, classId]);

  useEffect(() => {
    if (!expiresAt) {
      setSecondsLeft(0);
      return;
    }
    countdownRef.current && clearInterval(countdownRef.current);
    const tick = () => {
      const diff = Math.max(0, expiresAt.getTime() - Date.now());
      setSecondsLeft(Math.floor(diff / 1000));
    };
    tick();
    countdownRef.current = setInterval(tick, 1000);
    return () => countdownRef.current && clearInterval(countdownRef.current);
  }, [expiresAt]);

  return (
    <div className="flex flex-col justify-center items-center h-screen bg-gray-100 px-4">
      <h1 className="text-3xl font-bold mb-6">Live Attendance QR</h1>

      {/* Loading */}
      {loading && <p className="text-lg text-gray-700">Loading QR Session...</p>}

      {/* Error message */}
      {error && !loading && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {/* QR Code */}
      {!loading && !error && qrImage && (
        <>
          <img
            src={qrImage}
            alt="Live QR"
            className="w-64 h-64 border shadow-xl rounded-lg bg-white"
          />

          {/* Expiry timer */}
          {secondsLeft > 0 ? (
            <p className="mt-4 text-lg font-medium text-gray-700">
              Expires in: <span className="text-red-600">{secondsLeft} seconds</span>
            </p>
          ) : (
            <p className="mt-4 text-lg font-medium text-red-600">
              Session Expired — Generate a new QR.
            </p>
          )}
        </>
      )}

      {/* Back button */}
      <button
        onClick={() => navigate("/dashboard")}
        className="mt-8 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg shadow transition"
      >
        ← Back to Dashboard
      </button>
    </div>
  );
};

export default LiveSession;
