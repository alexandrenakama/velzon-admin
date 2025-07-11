// src/app/store/Seguradora/seguradora.model.ts

import { GrupoRamo } from '../Grupo Ramo/grupo-ramo.model';

export type PessoaTipo = 'FISICA' | 'JURIDICA';

export interface Endereco {
  id?:             number;
  tipoLogradouro: string;
  logradouro:      string;
  numero:          string;
  complemento?:    string;
  bairro:          string;
  cidade:          string;
  uf:              string;
  cep:             string;
  tipoEndereco:    string;
}

export interface Contato {
  id?:            number;
  tipoPessoa:     PessoaTipo;
  ddd:            string;
  telefone:       string;
  tipoTelefone:   string;
  email:          string;
  nomeContato?:   string;
}

export interface Seguradora {
  id:        number;
  nome:      string;
  ativa:     boolean;
  cnpj:      string;
  enderecos: Endereco[];
  contatos:  Contato[];
}
