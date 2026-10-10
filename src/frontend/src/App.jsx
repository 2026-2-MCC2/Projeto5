import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import BotaoTema from "./components/BotaoTema";
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import CriarConta from "./pages/CriarConta";
import Organizador from "./pages/Organizador";
import MeusEventos from "./pages/organizador/MeusEventos";
import CriarEvento from "./pages/organizador/CriarEvento";
import DetalhesEvento from "./pages/organizador/DetalhesEvento";
import Propostas from "./pages/organizador/Propostas";
import ResultadoCustos from "./pages/organizador/ResultadoCustos";
import Fornecedor from "./pages/Fornecedor";
import Oportunidades from "./pages/fornecedor/Oportunidades";
import EnviarProposta from "./pages/fornecedor/EnviarProposta";
import MinhasPropostas from "./pages/fornecedor/MinhasPropostas";
import Reputacao from "./pages/fornecedor/Reputacao";
import Admin from "./pages/Admin";
import Dashboard from "./pages/admin/Dashboard";
import Aprovacoes from "./pages/admin/Aprovacoes";

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/criar-conta" element={<CriarConta />} />

          <Route
            path="/organizador"
            element={
              <ProtectedRoute perfil="organizador">
                <Organizador />
              </ProtectedRoute>
            }
          >
            <Route index element={<MeusEventos />} />
            <Route path="eventos/novo" element={<CriarEvento />} />
            <Route path="eventos/:id" element={<DetalhesEvento />} />
            <Route path="eventos/:id/propostas" element={<Propostas />} />
            <Route path="eventos/:id/resultado" element={<ResultadoCustos />} />
          </Route>
          <Route
            path="/fornecedor"
            element={
              <ProtectedRoute perfil="fornecedor">
                <Fornecedor />
              </ProtectedRoute>
            }
          >
            <Route index element={<Oportunidades />} />
            <Route path="eventos/:id" element={<EnviarProposta />} />
            <Route path="propostas" element={<MinhasPropostas />} />
            <Route path="reputacao" element={<Reputacao />} />
          </Route>
          <Route
            path="/admin"
            element={
              <ProtectedRoute perfil="admin">
                <Admin />
              </ProtectedRoute>
            }
          >
            <Route index element={<Dashboard />} />
            <Route path="aprovacoes" element={<Aprovacoes />} />
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
        <BotaoTema />
      </BrowserRouter>
    </AuthProvider>
  );
}