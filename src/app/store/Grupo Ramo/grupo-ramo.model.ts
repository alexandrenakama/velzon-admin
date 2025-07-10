export interface GrupoRamo {
  /** Identificador único do grupo de ramo */
  id: number;

  /** Nome do grupo de ramo (ex.: “Seguro Vida”) */
  nome: string;

  /** FK para a seguradora dona deste grupo */
  seguradoraId: number;

}
