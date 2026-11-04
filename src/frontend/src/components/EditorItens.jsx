import { Plus, Trash2 } from "lucide-react";
import { BotaoIcone, Btn, Input, Select, Tabela, Linha, Celula, RodapeCard, Valor } from "./ui";
import { CATEGORIAS_ITEM } from "../data/categorias";
import { TIPOS_CUSTO } from "../data/tiposCusto";
import { novoItem, somaEstimado } from "../services/organizadorService";
import { moeda } from "../utils/formatar";

const estiloCampoTabela = { minHeight: "36px", padding: "0 var(--esp-2)", borderRadius: "var(--raio-sm)", fontSize: "var(--tam-sm)" };
const estiloNumero = estiloCampoTabela;
const estiloCelula = { padding: "10px 6px" };

// Tabela editável dos itens de custo de um evento.
// Com `comAcordado`, mostra também a coluna do valor acordado com o fornecedor.
export default function EditorItens({ itens, onChange, comAcordado = false }) {
  const colunas = ["Descrição", "Qtd.", "Unidade", "Categoria", "Tipo", "Custo Estimado", ...(comAcordado ? ["Valor Acordado"] : []), ""];

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
              <Select opcoes={CATEGORIAS_ITEM} aria-label={`Categoria de ${item.descricao || "item novo"}`} value={item.categoria} onChange={(e) => alterar(item.id, "categoria", e.target.value)} style={{ ...estiloCampoTabela, minWidth: "170px" }} />
            </Celula>
            <Celula style={estiloCelula}>
              <Select opcoes={TIPOS_CUSTO} aria-label={`Tipo de ${item.descricao || "item novo"}`} value={item.tipo} onChange={(e) => alterar(item.id, "tipo", e.target.value)} style={{ ...estiloCampoTabela, minWidth: "120px" }} />
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
              <BotaoIcone icone={Trash2} rotulo="Remover item" cor="var(--vermelho-texto)" tamanho={16} onClick={() => onChange(itens.filter((x) => x.id !== item.id))} />
            </Celula>
          </Linha>
        ))}
      </Tabela>

      <RodapeCard>
        <Btn variante="ghost" tamanho="sm" icone={Plus} onClick={() => onChange([...itens, novoItem(CATEGORIAS_ITEM[0])])}>
          Adicionar Item
        </Btn>
        <div>
          <span style={{ fontSize: "var(--tam-base)", color: "var(--texto-suave)", marginRight: "var(--esp-3)" }}>Total Estimado</span>
          <Valor cor="var(--texto)" tamanho="var(--tam-lg)" peso={700}>
            {moeda(somaEstimado(itens))}
          </Valor>
        </div>
      </RodapeCard>
    </>
  );
}
