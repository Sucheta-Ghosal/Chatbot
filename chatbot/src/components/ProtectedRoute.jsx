// ProtectedRoute.jsx
import { Navigate } from "react-router-dom";

export default function ProtectedRoute({ children }) {
  const token = localStorage.getItem("token"); // or from context
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  return children;
}
