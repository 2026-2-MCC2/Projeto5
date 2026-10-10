import { Plus, Trash2 } from "lucide-react";
import { BotaoIcone, Btn, Input, Select, Tabela, Linha, Celula, RodapeCard, Valor } from "./ui";
import { CATEGORIAS_FORNECEDOR } from "../data/categorias";
import { novoItem, somaEstimado } from "../services/organizadorService";
import { moeda } from "../utils/formatar";

const estiloCampoTabela = { padding: "6px 9px", borderRadius: "6px", fontSize: "0.8125rem" };
const estiloNumero = { ...estiloCampoTabela, fontFamily: "JetBrains Mono" };
const estiloCelula = { padding: "10px 6px" };

// Tabela editável dos itens de custo de um evento.
// Com `comAcordado`, mostra também a coluna do valor acordado com o fornecedor.
export default function EditorItens({ itens, onChange, comAcordado = false }) {
  const colunas = ["Descrição", "Qtd.", "Unidade", "Categoria", "Custo Estimado", ...(comAcordado ? ["Valor Acordado"] : []), ""];

  function alterar(id, campo, valor) {
    onChange(itens.map((item) => (item.id === id ? { ...item, [campo]: valor } : item)));
  }

  const numero = (valor) => (valor === "" ? 0 : Number(valor));

  return (
    <>
      <Tabela colunas={colunas}>
        {itens.map((item, i) => (
          <Linha key={item.id} ultima={i === itens.length - 1}>
            <Celula style={{ ...estiloCelula, paddingLeft: "16px" }}>
              <Input placeholder="Ex: Buffet principal" value={item.descricao} onChange={(e) => alterar(item.id, "descricao", e.target.value)} style={{ ...estiloCampoTabela, minWidth: "170px" }} />
            </Celula>
            <Celula style={estiloCelula}>
              <Input type="number" min="1" value={item.quantidade} onChange={(e) => alterar(item.id, "quantidade", numero(e.target.value))} style={{ ...estiloNumero, width: "64px" }} />
            </Celula>
            <Celula style={estiloCelula}>
              <Input value={item.unidade} onChange={(e) => alterar(item.id, "unidade", e.target.value)} style={{ ...estiloCampoTabela, width: "95px" }} />
            </Celula>
            <Celula style={estiloCelula}>
              <Select opcoes={CATEGORIAS_FORNECEDOR} value={item.categoria} onChange={(e) => alterar(item.id, "categoria", e.target.value)} style={{ ...estiloCampoTabela, minWidth: "170px" }} />
            </Celula>
            <Celula style={estiloCelula}>
              <Input type="number" min="0" placeholder="0" value={item.estimado || ""} onChange={(e) => alterar(item.id, "estimado", numero(e.target.value))} style={{ ...estiloNumero, width: "105px" }} />
            </Celula>
            {comAcordado && (
              <Celula style={estiloCelula}>
                <Input
                  type="number"
                  min="0"
                  placeholder="—"
                  value={item.acordado ?? ""}
                  onChange={(e) => alterar(item.id, "acordado", e.target.value === "" ? null : Number(e.target.value))}
                  destacado
                  style={{ ...estiloNumero, width: "105px", color: "var(--ativo-texto)" }}
                />
              </Celula>
            )}
            <Celula style={estiloCelula}>
              <BotaoIcone icone={Trash2} rotulo="Remover item" cor="#DC2626" tamanho={16} onClick={() => onChange(itens.filter((x) => x.id !== item.id))} />
            </Celula>
          </Linha>
        ))}
      </Tabela>

      <RodapeCard>
        <Btn variante="ghost" tamanho="sm" icone={Plus} onClick={() => onChange([...itens, novoItem(CATEGORIAS_FORNECEDOR[0])])}>
          Adicionar Item
        </Btn>
        <div>
          <span style={{ fontSize: "0.875rem", color: "var(--texto-suave)", marginRight: "12px" }}>Total Estimado</span>
          <Valor cor="var(--texto)" tamanho="1.125rem" peso={700}>
            {moeda(somaEstimado(itens))}
          </Valor>
        </div>
      </RodapeCard>
    </>
  );
}
