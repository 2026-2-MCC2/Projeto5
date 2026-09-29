import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import Login from "./pages/Login";
import CriarConta from "./pages/CriarConta";
import Organizador from "./pages/Organizador";
import Fornecedor from "./pages/Fornecedor";
import Admin from "./pages/Admin";

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="/login" element={<Login />} />
          <Route path="/criar-conta" element={<CriarConta />} />

          <Route
            path="/organizador"
            element={
              <ProtectedRoute perfil="organizador">
                <Organizador />
              </ProtectedRoute>
            }
          />
          <Route
            path="/fornecedor"
            element={
              <ProtectedRoute perfil="fornecedor">
                <Fornecedor />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin"
            element={
              <ProtectedRoute perfil="admin">
                <Admin />
              </ProtectedRoute>
            }
          />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}