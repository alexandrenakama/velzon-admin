// src/app/store/Produto/produto.model.ts

export interface Produto {
  id: number;
  ramoId: number;
  nomeRamo: string;
  nomeProduto: string;
  nomeAbreviadoProduto?: string;
  inicioVigencia: string;
  fimVigencia: string;    
  numeroProcessoSusep: number;
  permitePessoaFisica: boolean;
  permitePessoaJuridica: boolean;
  ativo: boolean;
}
