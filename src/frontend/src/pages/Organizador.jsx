import Layout from "../components/Layout";

const nav = [{ rotulo: "Meus Eventos", para: "/organizador", end: true }];

// Área do organizador: as telas de pages/organizador aparecem dentro do Layout.
export default function Organizador() {
  return <Layout nav={nav} />;
}
