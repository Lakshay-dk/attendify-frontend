import React, { useState, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import api from "../utils/api";

const StudentQRScanner = ({ sessionId }) => {
  const { user } = useContext(AuthContext);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  // Simulated scan handler
  const handleSimulateScan = async () => {
    if (!sessionId) {
      setMessage("No active session to scan.");
      return;
    }

    setLoading(true);
    setMessage("");
    try {
      const res = await api.post("/attendance/mark", { sessionId });
      setMessage(res.data.message || "Attendance marked successfully");
    } catch (err) {
      setMessage(
        err.response?.data?.message ||
          "Error marking attendance. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  // Tooltip for dev button
  const devTooltip = "Use this only for laptop development testing";

  return (
    <div className="flex flex-col items-center gap-6">
      {/* ...existing QR scan UI (camera) can go here if needed... */}

      {/* Simulate Scan Button (always available in this build) */}
      <button
        type="button"
        className="bg-gray-200 text-gray-700 px-6 py-2 rounded-lg border border-dashed border-gray-400 mt-4 hover:bg-gray-300 transition relative"
        style={{ position: "relative" }}
        onClick={handleSimulateScan}
        disabled={loading}
        title={devTooltip}
      >
        Simulate Scan
        <span
          style={{
            position: "absolute",
            top: "-1.5rem",
            left: "50%",
            transform: "translateX(-50%)",
            fontSize: "0.85rem",
            color: "#6b7280",
            background: "#f3f4f6",
            padding: "2px 8px",
            borderRadius: "6px",
            boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
            whiteSpace: "nowrap",
          }}
        >
          {devTooltip}
        </span>
      </button>

      {/* Response Message */}
      {message && (
        <div
          className={`mt-4 px-4 py-2 rounded ${
            message.toLowerCase().includes("success")
              ? "bg-green-100 text-green-700"
              : "bg-red-100 text-red-700"
          }`}
        >
          {message}
        </div>
      )}
    </div>
  );
};

export default StudentQRScanner;
