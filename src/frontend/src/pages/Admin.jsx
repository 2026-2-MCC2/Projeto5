import { useCallback, useEffect, useState } from "react";
import { LayoutDashboard, UserCheck } from "lucide-react";
import Layout from "../components/Layout";
import { listarPendentes } from "../services/authService";

// Área do admin: as telas de pages/admin aparecem dentro do Layout.
// A lista de pendentes fica aqui para o contador do menu atualizar junto com as telas.
export default function Admin() {
  const [pendentes, setPendentes] = useState([]);
  const [carregandoPendentes, setCarregandoPendentes] = useState(true);
  const [erroPendentes, setErroPendentes] = useState("");

  const buscar = useCallback(
    () =>
      listarPendentes()
        .then((lista) => {
          setPendentes(lista);
          setErroPendentes("");
        })
        .catch((err) => setErroPendentes(err.message))
        .finally(() => setCarregandoPendentes(false)),
    [],
  );

  useEffect(() => {
    buscar();
  }, [buscar]);

  // Chamado pelas telas depois de aprovar/rejeitar, ou pelo botão "Tentar de novo".
  const recarregarPendentes = useCallback(() => {
    setCarregandoPendentes(true);
    return buscar();
  }, [buscar]);

  const nav = [
    { rotulo: "Dashboard", para: "/admin", end: true, icone: LayoutDashboard },
    { rotulo: "Aprovações", para: "/admin/aprovacoes", contador: pendentes.length, icone: UserCheck },
  ];

  return <Layout nav={nav} contexto={{ pendentes, carregandoPendentes, erroPendentes, recarregarPendentes }} />;
}
