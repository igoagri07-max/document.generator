import React, { useEffect } from "react";
import { CheckCircle2, AlertCircle, X } from "lucide-react";

export default function Toast({ toast, onClose }) {
  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => {
      onClose();
    }, 4000);
    return () => clearTimeout(timer);
  }, [toast, onClose]);

  if (!toast) return null;

  const isError = toast.type === "error";
  const isWarning = toast.type === "warning";
  const isSuccess = toast.type === "success" || !toast.type;

  return (
    <div
      className={`fixed bottom-5 right-5 z-50 flex items-center gap-3 px-4 py-3 rounded-lg shadow-xl text-sm font-medium transition-all transform animate-bounce-in ${
        isError
          ? "bg-red-600 text-white"
          : isWarning
          ? "bg-amber-600 text-white"
          : "bg-emerald-700 text-white"
      }`}
      style={{
        position: "fixed",
        bottom: "20px",
        right: "20px",
        zIndex: 9999,
        display: "flex",
        alignItems: "center",
        gap: "10px",
        padding: "12px 18px",
        borderRadius: "8px",
        color: "#fff",
        backgroundColor: isError ? "#dc2626" : isWarning ? "#d97706" : "#15803d",
        boxShadow: "0 10px 25px -5px rgba(0,0,0,0.3)"
      }}
    >
      {isError && <AlertCircle size={20} />}
      {isWarning && <AlertCircle size={20} />}
      {isSuccess && <CheckCircle2 size={20} />}
      <span>{toast.message}</span>
      <button
        onClick={onClose}
        style={{
          background: "none",
          border: "none",
          color: "#fff",
          cursor: "pointer",
          marginLeft: "8px",
          padding: 0
        }}
        aria-label="Close"
      >
        <X size={16} />
      </button>
    </div>
  );
}
