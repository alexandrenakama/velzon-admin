// src/app/store/GrupoUsuario/grupo-usuario.model.ts

import { Funcao } from 'src/app/store/Funcao/funcao.model';

export interface GrupoUsuario {
  id:      number;
  cargo:   string;
  ativo:   boolean;
  funcoes: Funcao[];
}
