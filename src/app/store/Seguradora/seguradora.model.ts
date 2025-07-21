// src/app/store/Seguradora/seguradora.model.ts

// tipo de pessoa (pessoa física ou jurídica), agora aplicável à Seguradora
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

// agora a Seguradora tem seu tipo de pessoa
export interface Seguradora {
  id:          number;
  nome:        string;
  tipoPessoa:  PessoaTipo;
  ativa:       boolean;
  cnpj:        string;
  enderecos:   Endereco[];
  contatos:    Contato[];
}
