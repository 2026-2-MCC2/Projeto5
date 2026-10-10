import { Outlet } from "react-router-dom";
import Layout from "../components/Layout";

const nav = [
  { rotulo: "Oportunidades & Cotações", para: "/fornecedor", end: true },
  { rotulo: "Minhas Propostas", para: "/fornecedor/propostas" },
  { rotulo: "Minha Reputação", para: "/fornecedor/reputacao" },
];

// Área do fornecedor: as telas de pages/fornecedor aparecem dentro do Layout.
export default function Fornecedor() {
  return (
    <Layout nav={nav}>
      <Outlet />
    </Layout>
  );
}
