import { hojeIso } from "../utils/formatar";

const PROPOSTAS_KEY = "propostas";

// Dados de exemplo enquanto o back-end não existe.
const eventos = [
  {
    id: 1,
    nome: "Festival Gastronômico SP",
    data: "2025-03-15",
    local: "Parque Ibirapuera, SP",
    categoria: "Festival & Show",
    necessidades: ["Buffet & Gastronomia", "Sonorização & Luz"],
    orcamento: { min: 45000, max: 55000 },
    convidados: 500,
    prazo: "2025-02-28",
    organizador: "Carlos Mendes",
    itens: [
      { descricao: "Buffet completo com bebidas", quantidade: 200, unidade: "pessoas" },
      { descricao: "Estação de massas ao vivo", quantidade: 1, unidade: "pacote" },
      { descricao: "Bar de drinks e coquetéis", quantidade: 200, unidade: "pessoas" },
      { descricao: "Coffee break (2 pausas)", quantidade: 200, unidade: "pessoas" },
    ],
  },
  {
    id: 2,
    nome: "Congresso Tech Brasil 2025",
    data: "2025-04-20",
    local: "Expo Center Norte, SP",
    categoria: "Corporativo",
    necessidades: ["Foto & Filmagem", "Sonorização & Luz"],
    orcamento: { min: 28000, max: 35000 },
    convidados: 800,
    prazo: "2025-03-05",
    organizador: "Patrícia Souza",
    itens: [
      { descricao: "Cobertura fotográfica", quantidade: 2, unidade: "diárias" },
      { descricao: "Filmagem com edição", quantidade: 1, unidade: "pacote" },
      { descricao: "Transmissão ao vivo", quantidade: 2, unidade: "diárias" },
    ],
  },
  {
    id: 3,
    nome: "Casamento Rodrigues & Lima",
    data: "2025-04-12",
    local: "Quinta da Boa Vista, RJ",
    categoria: "Casamento",
    necessidades: ["Buffet & Gastronomia", "Cenografia & Decoração", "Foto & Filmagem"],
    orcamento: { min: 80000, max: 100000 },
    convidados: 180,
    prazo: "2025-03-15",
    organizador: "Ana Lima",
    itens: [
      { descricao: "Jantar completo", quantidade: 180, unidade: "pessoas" },
      { descricao: "Mesa de doces", quantidade: 1, unidade: "pacote" },
      { descricao: "Bar de drinks e coquetéis", quantidade: 180, unidade: "pessoas" },
    ],
  },
  {
    id: 4,
    nome: "Show Nacional – Turnê Verão",
    data: "2025-05-01",
    local: "Arena Anhembi, SP",
    categoria: "Festival & Show",
    necessidades: ["Segurança & Apoio", "Transporte & Logística"],
    orcamento: { min: 15000, max: 25000 },
    convidados: 5000,
    prazo: "2025-03-10",
    organizador: "Roberto Castro",
    itens: [
      { descricao: "Seguranças", quantidade: 60, unidade: "profissionais" },
      { descricao: "Brigadistas", quantidade: 10, unidade: "profissionais" },
      { descricao: "Controle de acesso", quantidade: 1, unidade: "pacote" },
    ],
  },
  {
    id: 5,
    nome: "Expo Sustentabilidade 2025",
    data: "2025-07-28",
    local: "Ciesp Campinas, SP",
    categoria: "Corporativo",
    necessidades: ["Cenografia & Decoração", "Foto & Filmagem"],
    orcamento: { min: 18000, max: 22000 },
    convidados: 300,
    prazo: "2025-06-01",
    organizador: "Marina Oliveira",
    itens: [
      { descricao: "Montagem de estandes", quantidade: 20, unidade: "unidades" },
      { descricao: "Decoração do palco", quantidade: 1, unidade: "pacote" },
      { descricao: "Sinalização do evento", quantidade: 1, unidade: "pacote" },
    ],
  },
];

const propostasIniciais = [
  { id: 1, evento: "Festival Gastronômico SP", dataEvento: "2025-03-15", categoria: "Buffet & Gastronomia", valor: 43800, status: "Em análise", enviadaEm: "2025-01-18" },
  { id: 2, evento: "Casamento Rodrigues & Lima", dataEvento: "2025-04-12", categoria: "Buffet & Gastronomia", valor: 82000, status: "Aprovada", enviadaEm: "2025-01-05" },
  { id: 3, evento: "Congresso Tech Brasil 2025", dataEvento: "2025-04-20", categoria: "Buffet & Gastronomia", valor: 35500, status: "Em análise", enviadaEm: "2025-01-20" },
  { id: 4, evento: "Baile de Gala APAE", dataEvento: "2024-09-20", categoria: "Buffet & Gastronomia", valor: 28000, status: "Concluído", enviadaEm: "2024-08-01" },
  { id: 5, evento: "Formatura Medicina USP", dataEvento: "2024-11-05", categoria: "Buffet & Gastronomia", valor: 19500, status: "Rejeitada", enviadaEm: "2024-09-10" },
];

const avaliacoes = [
  { id: 1, evento: "Casamento Rodrigues & Lima", organizador: "Ana Lima", data: "2024-12-01", nota: 5, resumo: "Serviço impecável, pontual e de altíssima qualidade.", comentario: "O buffet foi simplesmente perfeito. Chegaram no horário combinado, montagem rápida e eficiente. A comida estava deliciosa e os convidados não pararam de elogiar. Superaram todas as expectativas. Com certeza contrataremos novamente!" },
  { id: 2, evento: "Festival Gastronômico SP", organizador: "Carlos Mendes", data: "2025-03-01", nota: 5, resumo: "Excelente profissionalismo e qualidade.", comentario: "Equipe muito profissional. Entregaram tudo dentro do prazo e o cardápio superou as expectativas. A logística para 500 pessoas foi impecável. Recomendo muito." },
  { id: 3, evento: "Congresso Tech Brasil", organizador: "Patrícia Souza", data: "2025-01-01", nota: 4, resumo: "Ótimo serviço, pequenos ajustes na montagem.", comentario: "O buffet foi muito bem executado. Houve um pequeno atraso na montagem inicial mas foi resolvido rapidamente. A qualidade da comida estava excelente e o atendimento foi muito atencioso." },
  { id: 4, evento: "Baile de Gala APAE", organizador: "Roberto Castro", data: "2024-09-01", nota: 5, resumo: "Perfeito do início ao fim. Muito obrigado!", comentario: "Trabalho excepcional. A decoração das mesas e a apresentação do buffet foram elogiadas por todos os convidados. A equipe foi extremamente cordial e eficiente." },
  { id: 5, evento: "Formatura Medicina USP", organizador: "Marina Oliveira", data: "2024-11-01", nota: 4, resumo: "Boa qualidade, preço justo.", comentario: "O serviço foi bom. Algumas opções do cardápio poderiam ser mais variadas, mas a qualidade geral foi satisfatória. A equipe foi simpática e o atendimento foi bom durante todo o evento." },
];

const desempenho = [
  { criterio: "Pontualidade", nota: 4.9 },
  { criterio: "Qualidade", nota: 4.8 },
  { criterio: "Comunicação", nota: 4.7 },
  { criterio: "Custo-benefício", nota: 4.6 },
];

export function listarEventos() {
  return eventos;
}

export function buscarEvento(id) {
  return eventos.find((e) => e.id === id);
}

// Lê as propostas salvas. Na primeira vez, começa com as propostas de exemplo.
export function listarPropostas() {
  const salvas = JSON.parse(localStorage.getItem(PROPOSTAS_KEY) || "null");
  if (salvas) return salvas;

  localStorage.setItem(PROPOSTAS_KEY, JSON.stringify(propostasIniciais));
  return propostasIniciais;
}

export function enviarProposta({ evento, valor, observacoes }) {
  const nova = {
    id: Date.now(),
    evento: evento.nome,
    dataEvento: evento.data,
    categoria: evento.necessidades[0],
    valor,
    observacoes,
    status: "Em análise",
    enviadaEm: hojeIso(),
  };
  localStorage.setItem(PROPOSTAS_KEY, JSON.stringify([nova, ...listarPropostas()]));
}

export function listarAvaliacoes() {
  return avaliacoes;
}

export function listarDesempenho() {
  return desempenho;
}
