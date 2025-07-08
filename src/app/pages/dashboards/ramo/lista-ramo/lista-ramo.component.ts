// src/app/pages/dashboards/ramo/lista-ramo/lista-ramo.component.ts
import { Component, OnInit }       from '@angular/core';
import { Router, ActivatedRoute }  from '@angular/router';
import { NgbModal }                from '@ng-bootstrap/ng-bootstrap';

import { Ramo }                    from 'src/app/store/Ramo/ramo.model';
import { RamoService }             from 'src/app/core/services/ramo.service';
import { ToastService }            from 'src/app/shared/toasts/toast-service';
import { ConfirmModalComponent }   from 'src/app/shared/confirm-modal/confirm-modal.component';

@Component({
  selector: 'app-lista-ramo',
  templateUrl: './lista-ramo.component.html',
  styleUrls: ['./lista-ramo.component.scss']
})
export class ListaRamoComponent implements OnInit {
  allRamos:       Ramo[] = [];
  paginatedRamos: Ramo[] = [];

  page = 1;
  pageSize = 10;
  collectionSize = 0;
  searchTerm = '';

  // → Propriedades de ordenação
  sortField = '';
  sortDir: 1 | -1 = 1;

  constructor(
    private ramoService: RamoService,
    private router:      Router,
    private route:       ActivatedRoute,
    private toast:       ToastService,
    private modal:       NgbModal
  ) {}

  ngOnInit(): void {
    this.ramoService.getAll().subscribe(ramos => {
      this.allRamos       = ramos;
      this.collectionSize = ramos.length;
      this.refreshRamos();
    });
  }

  onSearch(term: string): void {
    this.searchTerm = term.trim().toLowerCase();
    this.page       = 1;
    this.refreshRamos();
  }

  /** 3-state sort: none → asc → desc → none */
  onSort(field: string): void {
    if (this.sortField !== field) {
      this.sortField = field;
      this.sortDir   = 1;
    } else if (this.sortDir === 1) {
      this.sortDir = -1;
    } else {
      this.sortField = '';
      this.sortDir   = 1;
    }
    this.refreshRamos();
  }

  /**
   * Classes para o ícone de ordenação:
   * - posicionamento absoluto (não afeta largura)
   * - invisible quando não for a coluna ativa (reserva espaço)
   * - seta up/down quando ativo
   */
  getIconClasses(field: string): { [klass: string]: boolean } {
    return {
      'position-absolute':    true,
      'top-50':               true,
      'translate-middle-y':   true,
      'end-2':                true,
      'invisible':            this.sortField !== field,
      'ri-arrow-up-s-line':   this.sortField === field && this.sortDir === 1,
      'ri-arrow-down-s-line': this.sortField === field && this.sortDir === -1
    };
  }

  refreshRamos(): void {
    let filtered = this.allRamos.filter(r => this.matchesSearch(r));

    if (this.sortField) {
      filtered.sort((a, b) => {
        const aVal = this.getByPath(a, this.sortField);
        const bVal = this.getByPath(b, this.sortField);
        return this.compare(aVal, bVal) * this.sortDir;
      });
    } else {
      // ordenação padrão por vigência
      filtered.sort((a, b) => {
        const aStart = new Date(a.inicioVigencia).getTime();
        const bStart = new Date(b.inicioVigencia).getTime();
        if (bStart !== aStart) return bStart - aStart;
        return new Date(b.fimVigencia).getTime() - new Date(a.fimVigencia).getTime();
      });
    }

    this.collectionSize = filtered.length;
    const start = (this.page - 1) * this.pageSize;
    this.paginatedRamos = filtered.slice(start, start + this.pageSize);
  }

  private matchesSearch(r: Ramo): boolean {
    if (!this.searchTerm) return true;
    const term = this.searchTerm;
    return [
      String(r.grupo.id),
      r.grupo.nome,
      r.identificadorRamo,
      r.codigoRamo,
      r.nomeRamo,
      r.nomeAbreviado || ''
    ].some(v => v.toLowerCase().includes(term));
  }

  onPageChange(pageNum: number): void {
    this.page = pageNum;
    this.refreshRamos();
  }

  onEdit(r: Ramo): void {
    this.router.navigate([ r.identificadorRamo, 'editar' ], { relativeTo: this.route });
  }

  onDelete(r: Ramo): void {
    const ref = this.modal.open(ConfirmModalComponent, { centered: true, backdrop: 'static' });
    ref.componentInstance.title       = 'Confirma exclusão';
    ref.componentInstance.message     = `Deseja realmente apagar o ramo “${r.nomeRamo}”?`;
    ref.componentInstance.confirmText = 'Apagar';
    ref.componentInstance.cancelText  = 'Cancelar';

    ref.result.then((ok: boolean) => {
      if (!ok) return;
      this.ramoService.delete(r.identificadorRamo).subscribe({
        next: () => {
          this.toast.show(
            `Ramo “${r.nomeRamo}” apagado com sucesso!`,
            { classname: 'bg-danger text-light', delay: 5000 }
          );
          this.allRamos = this.allRamos.filter(x => x.identificadorRamo !== r.identificadorRamo);
          this.refreshRamos();
        },
        error: () => this.toast.show(
          'Falha ao apagar ramo. Tente novamente.',
          { classname: 'bg-warning text-dark', delay: 5000 }
        )
      });
    }).catch(() => {});
  }

  private getByPath(obj: any, path: string): any {
    return path.split('.').reduce((o, key) => o?.[key], obj);
  }

  private compare(a: any, b: any): number {
    if (a == null) return b == null ? 0 : -1;
    if (b == null) return 1;
    if (typeof a === 'string') return a.localeCompare(b);
    return a < b ? -1 : a > b ? 1 : 0;
  }
}
