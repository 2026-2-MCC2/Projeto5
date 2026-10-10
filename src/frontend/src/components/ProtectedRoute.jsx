import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function ProtectedRoute({ children, perfil }) {
  const { user } = useAuth();

  if (!user) return <Navigate to="/login" replace />;
  if (perfil && user.perfil !== perfil) return <Navigate to="/login" replace />;

  return children;
}