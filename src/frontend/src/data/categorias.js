import { Building2, GraduationCap, Heart, Music, PartyPopper, Trophy } from "lucide-react";

// Categorias de serviço que os fornecedores oferecem.
export const CATEGORIAS_FORNECEDOR = [
  "Buffet & Gastronomia",
  "Sonorização & Luz",
  "Foto & Filmagem",
  "Cenografia & Decoração",
  "Segurança & Apoio",
  "Transporte & Logística",
];

// Categorias de um item de custo: os serviços acima e os custos que não vêm de fornecedores.
export const CATEGORIAS_ITEM = [...CATEGORIAS_FORNECEDOR, "Impostos & Taxas", "Operacional", "Outros"];

// Tipos de evento que o organizador pode criar.
export const CATEGORIAS_EVENTO = [
  { rotulo: "Corporativo", icone: Building2 },
  { rotulo: "Festival & Show", icone: Music },
  { rotulo: "Casamento", icone: Heart },
  { rotulo: "Formatura", icone: GraduationCap },
  { rotulo: "Social", icone: PartyPopper },
  { rotulo: "Esportivo", icone: Trophy },
];
