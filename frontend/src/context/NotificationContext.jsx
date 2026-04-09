import React, { createContext, useContext, useCallback } from "react";
import toast, { Toaster } from "react-hot-toast";

const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
  const notifySuccess = useCallback((message) => {
    toast.success(message, {
      style: {
        background: "#ECFDF5", // Light green
        color: "#065F46", // Dark green
        border: "1px solid #A7F3D0",
        fontWeight: "bold",
        fontSize: "14px",
        borderRadius: "12px",
        padding: "12px 24px",
      },
      iconTheme: {
        primary: "#10B981",
        secondary: "#ECFDF5",
      },
    });
  }, []);

  const notifyError = useCallback((message) => {
    toast.error(message, {
      style: {
        background: "#FEF2F2", // Light red
        color: "#991B1B", // Dark red
        border: "1px solid #FECACA",
        fontWeight: "bold",
        fontSize: "14px",
        borderRadius: "12px",
        padding: "12px 24px",
      },
      iconTheme: {
        primary: "#EF4444",
        secondary: "#FEF2F2",
      },
    });
  }, []);

  const notifyInfo = useCallback((message) => {
    toast(message, {
      icon: "ℹ️",
      style: {
        background: "#EFF6FF", // Light blue
        color: "#1E40AF", // Dark blue
        border: "1px solid #BFDBFE",
        fontWeight: "bold",
        fontSize: "14px",
        borderRadius: "12px",
        padding: "12px 24px",
      },
    });
  }, []);

  const notifyWarning = useCallback((message) => {
    toast(message, {
      icon: "⚠️",
      style: {
        background: "#FFFBEB", // Light yellow
        color: "#92400E", // Dark yellow
        border: "1px solid #FDE68A",
        fontWeight: "bold",
        fontSize: "14px",
        borderRadius: "12px",
        padding: "12px 24px",
      },
    });
  }, []);

  return (
    <NotificationContext.Provider value={{ notifySuccess, notifyError, notifyInfo, notifyWarning }}>
      {children}
      <Toaster position="top-right" reverseOrder={false} />
    </NotificationContext.Provider>
  );
};

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error("useNotification must be used within a NotificationProvider");
  }
  return context;
};
