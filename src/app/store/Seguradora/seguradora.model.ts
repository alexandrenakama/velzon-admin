// src/app/store/Seguradora/seguradora.model.ts

import { GrupoRamo } from '../Grupo Ramo/grupo-ramo.model';

export type PessoaTipo = 'FISICA' | 'JURIDICA';

export interface Endereco {
  /** Identificador único do endereço (gerado pelo back-end) */
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
  /** Identificador único do contato (gerado pelo back-end) */
  id?:            number;

  tipoPessoa:     PessoaTipo;
  ddd:            string;
  telefone:       string;
  tipoTelefone:   string;
  email:          string;
  nomeContato?:   string;
}

export interface Seguradora {
  /** Identificador único */
  id:        number;

  /** Nome da seguradora */
  nome:      string;

  /** Se está ativa */
  ativa:     boolean;

  /** CNPJ da empresa */
  cnpj:      string;

  /** Endereços associados */
  enderecos: Endereco[];

  /** Contatos associados */
  contatos:  Contato[];
}
