// src/app/store/Corretor/corretor.model.ts

import { Produto } from '../Produto/produto.model';
import { Filial } from '../Filial/filial.model';

export type PessoaTipo = 'Física' | 'Jurídica';

export interface Endereco {
  id?:           number;
  tipoLogradouro:string;
  logradouro:    string;
  numero:        string;
  complemento?:  string;
  bairro:        string;
  cidade:        string;
  uf:            string;
  cep:           string;
  tipoEndereco:  string;
}

export interface Contato{
  id?:           number;
  ddd:           string;
  telefone:      string;
  tipoTelefone:  string;
  email:         string;
  nomeContato?:  string;
}

export interface Corretor {
  id:             number;
  nome:           string;
  tipoPessoa:     PessoaTipo;
  documento:      string;
  ativo:          boolean;
  enderecos:      Endereco[];
  contatos:       Contato[];
  produtos:       Produto[];
  filiais:        Filial[];
  dataCadastro:   string | Date;
  comissaoMinima: number;
  comissaoMaxima: number;
  comissaoPadrao: number;
}
