import React, { useState, useContext, useRef, useEffect } from "react";
import { AuthContext } from "../context/AuthContext";
import api from "../utils/api";
import Webcam from "react-webcam";
import QrScanner from "qr-scanner";

const StudentQRScanner = ({ onClose, onMarked }) => {
  const { user } = useContext(AuthContext);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [scanning, setScanning] = useState(false);
  const webcamRef = useRef(null);
  const scanIntervalRef = useRef(null);

  // Start scanning loop
  const startScanning = () => {
    setMessage("");
    setScanning(true);
    // capture every 900ms
    scanIntervalRef.current = setInterval(captureAndScan, 900);
  };

  const stopScanning = () => {
    setScanning(false);
    if (scanIntervalRef.current) {
      clearInterval(scanIntervalRef.current);
      scanIntervalRef.current = null;
    }
  };

  useEffect(() => {
    // cleanup on unmount
    return () => stopScanning();
  }, []);

  const captureAndScan = async () => {
    if (!webcamRef.current) return;
    const screenshot = webcamRef.current.getScreenshot();
    if (!screenshot) return;

    try {
      // QrScanner.scanImage accepts dataURL
      const result = await QrScanner.scanImage(screenshot, { returnDetailedScanResult: false });
      if (result) {
        // stop further scanning
        stopScanning();
        await handleScanned(result);
      }
    } catch (err) {
      // no QR found in this frame - ignore
    }
  };

  const handleScanned = async (scannedText) => {
    setLoading(true);
    setMessage("");
    try {
      // Send scanned text as sessionId (server expects sessionId string)
      const res = await api.post("/attendance/mark", { sessionId: scannedText });
      setMessage(res.data.message || "Attendance marked successfully");
      if (onMarked) onMarked(res.data);
    } catch (err) {
      setMessage(err.response?.data?.message || "Error marking attendance. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Simulated scan fallback (for desktop)
  const handleSimulateScan = async () => {
    setLoading(true);
    setMessage("");
    try {
      if (!user?.classId) {
        setMessage("No class/session available to mark.");
        return;
      }
      // Try to mark using active session from server by asking for active session
      const active = await api.get(`/sessions/active/${user.classId}`);
      const sessionId = active.data?.sessionId;
      if (!sessionId) {
        setMessage("No active session to mark.");
        return;
      }
      const res = await api.post("/attendance/mark", { sessionId });
      setMessage(res.data.message || "Attendance marked successfully");
      if (onMarked) onMarked(res.data);
    } catch (err) {
      setMessage(err.response?.data?.message || "Failed to simulate scan.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full">
      <div className="flex flex-col items-center gap-4">
        {!scanning ? (
          <div className="flex gap-3">
            <button
              className="bg-blue-500 text-white px-4 py-2 rounded"
              onClick={startScanning}
            >
              Open Camera
            </button>
            <button
              className="bg-gray-200 text-gray-700 px-4 py-2 rounded"
              onClick={handleSimulateScan}
              disabled={loading}
            >
              Simulate Scan
            </button>
            <button
              className="bg-red-100 text-red-700 px-4 py-2 rounded"
              onClick={() => { stopScanning(); if (onClose) onClose(); }}
            >
              Close
            </button>
          </div>
        ) : (
          <div className="w-full flex flex-col items-center gap-3">
            <div className="w-full max-w-md bg-black rounded overflow-hidden">
              <Webcam
                audio={false}
                ref={webcamRef}
                screenshotFormat="image/jpeg"
                videoConstraints={{ facingMode: "environment" }}
                className="w-full h-auto"
              />
            </div>
            <div className="flex gap-3">
              <button
                className="bg-red-500 text-white px-4 py-2 rounded"
                onClick={() => { stopScanning(); }}
              >
                Stop Camera
              </button>
              <button
                className="bg-gray-200 text-gray-700 px-4 py-2 rounded"
                onClick={() => { stopScanning(); if (onClose) onClose(); }}
              >
                Close
              </button>
            </div>
          </div>
        )}

        {loading && <div className="text-sm text-gray-600">Processing...</div>}

        {message && (
          <div className={`mt-2 px-4 py-2 rounded ${message.toLowerCase().includes("success") ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
            {message}
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentQRScanner;
