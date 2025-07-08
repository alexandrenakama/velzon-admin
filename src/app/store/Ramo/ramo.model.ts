// src/app/store/Ramo/ramo.model.ts
import { GrupoRamo } from '../Grupo Ramo/grupo-ramo.model';

export interface Ramo {
  grupo:             GrupoRamo;
  identificadorRamo: string;
  codigoRamo:        string;
  nomeRamo:          string;
  nomeAbreviado?:    string;
  inicioVigencia:    string;
  fimVigencia:       string;
  ramoAtivo:         boolean;
}
