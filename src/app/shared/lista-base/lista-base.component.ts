// src/app/shared/lista-base/lista-base.component.ts
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
  campo: string;
  cabecalho: string;
  ordenavel?: boolean;
  largura?: string;
  formatoData?: string;
}

@Component({
  selector: 'app-lista-base',
  templateUrl: './lista-base.component.html'
})
export class ListaBaseComponent<T> implements OnInit, OnChanges {
  @Input() todosItens: T[] = [];
  @Input() colunas: DefinicaoColuna[] = [];
  @Input() camposBusca: string[] = [];
  @Input() tamanhoPagina = 10;

  @ContentChild('toolbarTpl', { read: TemplateRef }) toolbarTpl!: TemplateRef<any>;
  @ContentChild('acoesTpl',   { read: TemplateRef }) acoesTpl!: TemplateRef<any>;

  @Output() editar = new EventEmitter<T>();
  @Output() apagar = new EventEmitter<T>();

  itensPaginados: T[] = [];
  tamanhoColecao = 0;
  pagina = 1;
  termoBusca = '';
  campoOrdenacao = '';
  direcaoOrdenacao: 1 | -1 = 1;

  ngOnInit(): void {
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

  aoPesquisar(termo: string): void {
    this.termoBusca = termo.trim().toLowerCase();
    this.pagina = 1;
    this.atualizarLista();
  }

  aoOrdenar(campo: string): void {
    if (this.campoOrdenacao !== campo) {
      this.campoOrdenacao = campo;
      this.direcaoOrdenacao = 1;
    } else if (this.direcaoOrdenacao === 1) {
      this.direcaoOrdenacao = -1;
    } else {
      this.campoOrdenacao = '';
      this.direcaoOrdenacao = 1;
    }
    this.atualizarLista();
  }

  aoMudarPagina(novaPagina: number): void {
    this.pagina = novaPagina;
    this.atualizarLista();
  }

  protected atualizarLista(): void {
    let filtrados = this.todosItens.filter(item => {
      if (!this.termoBusca) return true;
      return this.camposBusca.some(c => {
        const v = this.obterPorCaminho(item, c);
        return v != null && v.toString().toLowerCase().includes(this.termoBusca);
      });
    });

    if (this.campoOrdenacao) {
      filtrados.sort((a, b) => {
        const aVal = this.obterPorCaminho(a, this.campoOrdenacao);
        const bVal = this.obterPorCaminho(b, this.campoOrdenacao);
        return (aVal == null && bVal != null) ? -1
          : (bVal == null && aVal != null) ? 1
          : (typeof aVal === 'string' ? aVal.localeCompare(bVal) : aVal < bVal ? -1 : aVal > bVal ? 1 : 0)
          * this.direcaoOrdenacao;
      });
    }

    this.tamanhoColecao = filtrados.length;
    const inicio = (this.pagina - 1) * this.tamanhoPagina;
    this.itensPaginados = filtrados.slice(inicio, inicio + this.tamanhoPagina);
  }

  protected obterPorCaminho(obj: any, caminho: string): any {
    return caminho.split('.').reduce((o, k) => o?.[k], obj);
  }

  getIconClasses(campo: string): { [klass: string]: boolean } {
    return {
      'ri-arrow-up-s-line':   this.campoOrdenacao === campo && this.direcaoOrdenacao === 1,
      'ri-arrow-down-s-line': this.campoOrdenacao === campo && this.direcaoOrdenacao === -1
    };
  }
}
