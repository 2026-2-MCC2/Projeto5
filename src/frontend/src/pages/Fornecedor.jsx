import { Briefcase, FileText, Star } from "lucide-react";
import Layout from "../components/Layout";

const nav = [
  { rotulo: "Oportunidades & Cotações", para: "/fornecedor", end: true, icone: Briefcase },
  { rotulo: "Minhas Propostas", para: "/fornecedor/propostas", icone: FileText },
  { rotulo: "Minha Reputação", para: "/fornecedor/reputacao", icone: Star },
];

// Área do fornecedor: as telas de pages/fornecedor aparecem dentro do Layout.
export default function Fornecedor() {
  return <Layout nav={nav} />;
}
