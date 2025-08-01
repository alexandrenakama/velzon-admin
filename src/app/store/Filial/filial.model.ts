// src/app/store/Filial/filial.model.ts

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

export interface Contato {
  id?:           number;
  ddd:           string;
  telefone:      string;
  tipoTelefone:  string;
  email:         string;
  nomeContato?:  string;
}

export interface Filial {
  id:            number;
  nome:          string;
  tipoPessoa:    PessoaTipo;
  ativo:         boolean;
  documento:     string;
  enderecos:     Endereco[];
  contatos:      Contato[];
}
