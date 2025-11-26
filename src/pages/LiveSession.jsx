import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

const LiveSession = () => {
  const { classId } = useParams();
  const navigate = useNavigate();

  const [qrData, setQrData] = useState(null);
  const [expiresIn, setExpiresIn] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchQR = async () => {
    try {
      setError("");

      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/api/attendance/qr/${classId}`
      );

      if (!res.ok) {
        throw new Error("Failed to load QR");
      }

      const data = await res.json();

      if (!data.qrImage) {
        throw new Error("No active session found");
      }

      setQrData(data.qrImage);
      setExpiresIn(data.expiresIn);
      setLoading(false);
    } catch (err) {
      setError(err.message || "Could not fetch QR");
      setQrData(null);
      setLoading(false);
    }
  };

  // Fetch QR & refresh every 5 seconds
  useEffect(() => {
    fetchQR();
    const interval = setInterval(fetchQR, 5000);
    return () => clearInterval(interval);
  }, []);

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
      {!loading && !error && qrData && (
        <>
          <img
            src={qrData}
            alt="Live QR"
            className="w-64 h-64 border shadow-xl rounded-lg bg-white"
          />

          {/* Expiry timer */}
          {expiresIn > 0 ? (
            <p className="mt-4 text-lg font-medium text-gray-700">
              Expires in: <span className="text-red-600">{expiresIn} seconds</span>
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
