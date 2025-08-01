// src/app/store/Usuario/usuario.model.ts

import { GrupoUsuario } from '../Grupo Usuario/grupo-usuario.model';

export interface Usuario {
  id:            number;
  nome:          string;
  email:         string;
  senha:         string;
  ativo:         boolean;
  grupoUsuario:  GrupoUsuario;
}
