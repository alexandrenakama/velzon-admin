// src/app/shared/components/lista-base.component.ts
import {
  Component,
  Input,
  Output,
  EventEmitter,
  ContentChild,
  TemplateRef,
  OnInit,
  OnChanges,
  SimpleChanges
} from '@angular/core';

export interface DefinicaoColuna {
  /** caminho do campo no objeto (ex: 'id', 'grupo.nome') */
  campo: string;
  /** texto do cabeçalho da coluna */
  cabecalho: string;
  /** se true, permite ordenação ao clicar */
  ordenavel?: boolean;
  /** largura fixa (ex: '80px') */
  largura?: string;
}

@Component({
  selector: 'app-lista-base',
  templateUrl: './lista-base.component.html'
})
export class ListaBaseComponent<T> implements OnInit, OnChanges {
  /** array de itens brutos a exibir */
  @Input() todosItens: T[] = [];

  /** colunas a renderizar */
  @Input() colunas: DefinicaoColuna[] = [];

  /** campos (caminhos) a pesquisar; se vazio, usa todas as colunas */
  @Input() camposBusca: string[] = [];

  /** itens por página */
  @Input() tamanhoPagina = 10;

  /** template para toolbar (ex: botão “+ Novo”) */
  @ContentChild('toolbarTpl', { read: TemplateRef }) toolbarTpl!: TemplateRef<any>;
  /** template para ações da linha (editar/apagar) */
  @ContentChild('acoesTpl',   { read: TemplateRef }) acoesTpl!: TemplateRef<any>;

  /** emite item clicado em “Editar” */
  @Output() editar = new EventEmitter<T>();
  /** emite item clicado em “Apagar” */
  @Output() apagar = new EventEmitter<T>();

  // ============ estado interno ============
  itensPaginados: T[] = [];
  tamanhoColecao = 0;
  pagina = 1;
  termoBusca = '';
  campoOrdenacao = '';
  direcaoOrdenacao: 1 | -1 = 1;

  ngOnInit(): void {
    // se não informou camposBusca, usa todas as colunas
    if (!this.camposBusca?.length) {
      this.camposBusca = this.colunas.map(c => c.campo);
    }
    this.atualizarLista();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['todosItens']) {
      this.atualizarLista();
    }
  }

  /** chamada ao digitar no campo de busca */
  aoPesquisar(termo: string): void {
    this.termoBusca = termo.trim().toLowerCase();
    this.pagina = 1;
    this.atualizarLista();
  }

  /** chamada ao clicar no cabeçalho ordenável */
  aoOrdenar(campo: string): void {
    if (this.campoOrdenacao !== campo) {
      this.campoOrdenacao   = campo;
      this.direcaoOrdenacao = 1;
    } else if (this.direcaoOrdenacao === 1) {
      this.direcaoOrdenacao = -1;
    } else {
      this.campoOrdenacao   = '';
      this.direcaoOrdenacao = 1;
    }
    this.atualizarLista();
  }

  /** chamada ao mudar de página */
  aoMudarPagina(novaPagina: number): void {
    this.pagina = novaPagina;
    this.atualizarLista();
  }

  /** filtra, ordena e pagina os itens */
  protected atualizarLista(): void {
    // 1) filtro
    let filtrados = this.todosItens.filter(item => {
      if (!this.termoBusca) return true;
      return this.camposBusca.some(c => {
        const valor = this.obterPorCaminho(item, c);
        return (
          valor != null &&
          valor.toString().toLowerCase().includes(this.termoBusca)
        );
      });
    });

    // 2) ordenação
    if (this.campoOrdenacao) {
      filtrados.sort((a, b) => {
        const aVal = this.obterPorCaminho(a, this.campoOrdenacao);
        const bVal = this.obterPorCaminho(b, this.campoOrdenacao);
        return this.comparar(aVal, bVal) * this.direcaoOrdenacao;
      });
    }

    // 3) paginação
    this.tamanhoColecao = filtrados.length;
    const inicio = (this.pagina - 1) * this.tamanhoPagina;
    this.itensPaginados = filtrados.slice(inicio, inicio + this.tamanhoPagina);
  }

  /** obtém valor aninhado via “prop1.prop2” */
  protected obterPorCaminho(obj: any, caminho: string): any {
    return caminho.split('.').reduce((ac, chave) => ac?.[chave], obj);
  }

  /** comparação genérica */
  protected comparar(a: any, b: any): number {
    if (a == null)    return b == null ? 0 : -1;
    if (b == null)    return 1;
    if (typeof a === 'string') return a.localeCompare(b);
    return a < b ? -1 : a > b ? 1 : 0;
  }

  /** classes para os ícones de ordenação */
  getIconClasses(campo: string): { [klass: string]: boolean } {
    return {
      'position-absolute':     true,
      'top-50':                true,
      'translate-middle-y':    true,
      'end-2':                 true,
      'invisible':             this.campoOrdenacao !== campo,
      'ri-arrow-up-s-line':    this.campoOrdenacao === campo && this.direcaoOrdenacao === 1,
      'ri-arrow-down-s-line':  this.campoOrdenacao === campo && this.direcaoOrdenacao === -1
    };
  }
}
