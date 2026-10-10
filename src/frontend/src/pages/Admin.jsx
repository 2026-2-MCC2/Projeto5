import { useState } from "react";
import Layout from "../components/Layout";
import { listarPendentes } from "../services/authService";

// Área do admin: as telas de pages/admin aparecem dentro do Layout.
// A lista de pendentes fica aqui para o contador do menu atualizar junto com as telas.
export default function Admin() {
  const [pendentes, setPendentes] = useState(listarPendentes());

  const nav = [
    { rotulo: "Dashboard", para: "/admin", end: true },
    { rotulo: "Aprovações", para: "/admin/aprovacoes", contador: pendentes.length },
  ];

  return <Layout nav={nav} contexto={{ pendentes, recarregarPendentes: () => setPendentes(listarPendentes()) }} />;
}
