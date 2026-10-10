const EVENTOS_KEY = "eventosOrganizador";

const novoId = () => Date.now() + Math.random();

export function novoItem(categoria) {
  return { id: novoId(), descricao: "", quantidade: 1, unidade: "unidade", categoria, estimado: 0, acordado: null };
}

// Dados de exemplo enquanto o back-end não existe.
const evento = (dados) => ({ itens: [], propostas: [], selecionadas: [], ...dados });

const eventosIniciais = [
  evento({
    id: 1,
    nome: "Festival Gastronômico SP",
    data: "2025-03-15",
    local: "Parque Ibirapuera, São Paulo",
    status: "Em andamento",
    categoria: "Festival & Show",
    orcamento: 280000,
    convidados: 500,
    itens: [
      { id: 1, descricao: "Buffet principal", quantidade: 200, unidade: "pessoas", categoria: "Buffet & Gastronomia", estimado: 45000, acordado: 43800 },
      { id: 2, descricao: "Sonorização e iluminação", quantidade: 1, unidade: "pacote", categoria: "Sonorização & Luz", estimado: 28000, acordado: 26500 },
      { id: 3, descricao: "Foto e filmagem", quantidade: 1, unidade: "pacote", categoria: "Foto & Filmagem", estimado: 12000, acordado: 12000 },
      { id: 4, descricao: "Segurança patrimonial", quantidade: 8, unidade: "pessoas/dia", categoria: "Segurança & Apoio", estimado: 8500, acordado: 8200 },
      { id: 5, descricao: "Cenografia & Decoração", quantidade: 1, unidade: "pacote", categoria: "Cenografia & Decoração", estimado: 15000, acordado: 14800 },
    ],
    propostas: [
      { id: 1, fornecedor: "Sabores do Brasil Buffet", categoria: "Buffet & Gastronomia", nota: 4.8, avaliacoes: 142, valor: 43800, recomendado: true, itens: [{ descricao: "Buffet completo", quantidade: 200, unidade: "pessoas", preco: 219 }] },
      { id: 2, fornecedor: "SomMax Sonorização Pro", categoria: "Sonorização & Luz", nota: 4.6, avaliacoes: 89, valor: 26500, itens: [{ descricao: "Sistema de som e luz", quantidade: 1, unidade: "pacote", preco: 26500 }] },
      { id: 3, fornecedor: "LuzShow Produções", categoria: "Sonorização & Luz", nota: 4.9, avaliacoes: 211, valor: 28900, itens: [{ descricao: "Produção completa A/V", quantidade: 1, unidade: "pacote", preco: 28900 }] },
      { id: 4, fornecedor: "Segura Mais Eventos", categoria: "Segurança & Apoio", nota: 4.3, avaliacoes: 67, valor: 8200, itens: [{ descricao: "Equipe de segurança", quantidade: 8, unidade: "pessoas", preco: 1025 }] },
      { id: 5, fornecedor: "PhotoPro Studio", categoria: "Foto & Filmagem", nota: 4.7, avaliacoes: 178, valor: 12000, itens: [{ descricao: "Foto + vídeo completo", quantidade: 1, unidade: "pacote", preco: 12000 }] },
      { id: 6, fornecedor: "Cenário Perfeito", categoria: "Cenografia & Decoração", nota: 4.5, avaliacoes: 94, valor: 14800, itens: [{ descricao: "Decoração temática", quantidade: 1, unidade: "pacote", preco: 14800 }] },
    ],
    selecionadas: [1, 2, 4, 5, 6],
  }),
  evento({ id: 2, nome: "Congresso Tech Brasil 2025", data: "2025-04-20", local: "Expo Center Norte, São Paulo", status: "Em andamento", categoria: "Corporativo", orcamento: 420000, convidados: 800 }),
  evento({ id: 3, nome: "Casamento Silva & Ferreira", data: "2024-12-10", local: "Espaço Villa Bianca, Campinas", status: "Concluído", categoria: "Casamento", orcamento: 95000, convidados: 200 }),
  evento({ id: 4, nome: "Show Nacional – Turnê Verão", data: "2025-05-01", local: "Arena Anhembi, São Paulo", status: "Em andamento", categoria: "Festival & Show", orcamento: 850000, convidados: 5000 }),
  evento({ id: 5, nome: "Conferência de Inovação", data: "2025-06-15", local: "WTC Events Center, São Paulo", status: "Rascunho", categoria: "Corporativo", orcamento: 160000, convidados: 400 }),
  evento({ id: 6, nome: "Formatura Medicina USP", data: "2024-11-05", local: "Gran Estação, São Paulo", status: "Concluído", categoria: "Formatura", orcamento: 75000, convidados: 600 }),
  evento({ id: 7, nome: "Expo Sustentabilidade", data: "2025-07-28", local: "Ciesp Campinas", status: "Aguardando Data", categoria: "Corporativo", orcamento: 200000, convidados: 300 }),
  evento({ id: 8, nome: "Baile de Gala APAE", data: "2024-09-20", local: "Espaço Castello Branco", status: "Concluído", categoria: "Social", orcamento: 55000, convidados: 250 }),
];

// Lê os eventos salvos. Na primeira vez, começa com os eventos de exemplo.
export function listarEventos() {
  const salvos = JSON.parse(localStorage.getItem(EVENTOS_KEY) || "null");
  if (salvos) return salvos;

  localStorage.setItem(EVENTOS_KEY, JSON.stringify(eventosIniciais));
  return eventosIniciais;
}

export function buscarEvento(id) {
  return listarEventos().find((e) => e.id === id);
}

function atualizarEvento(id, alteracoes) {
  const eventos = listarEventos().map((e) => (e.id === id ? { ...e, ...alteracoes } : e));
  localStorage.setItem(EVENTOS_KEY, JSON.stringify(eventos));
}

export const somaEstimado = (itens) => itens.reduce((soma, i) => soma + i.estimado, 0);

export function criarEvento({ nome, data, local, convidados, categoria, itens, status }) {
  const novo = evento({ id: Date.now(), nome, data, local, convidados, categoria, itens, status, orcamento: somaEstimado(itens) });
  localStorage.setItem(EVENTOS_KEY, JSON.stringify([novo, ...listarEventos()]));
}

export function salvarItens(id, itens) {
  atualizarEvento(id, { itens });
}

export function salvarSelecao(id, selecionadas) {
  atualizarEvento(id, { selecionadas });
}

export function propostasSelecionadas(ev) {
  return ev.propostas.filter((p) => ev.selecionadas.includes(p.id));
}

// Fecha a composição de custos: cada item recebe o valor da proposta escolhida para a categoria dele.
export function finalizarEvento(id) {
  const ev = buscarEvento(id);
  const escolhidas = propostasSelecionadas(ev);
  const itens = ev.itens.map((item) => {
    const proposta = escolhidas.find((p) => p.categoria === item.categoria);
    return proposta ? { ...item, acordado: proposta.valor } : item;
  });
  atualizarEvento(id, { itens, status: "Aguardando Data" });
}
