// src/app/pages/dashboards/grupo-ramo/lista-grupo-ramo/lista-grupo-ramo.component.ts
import { Component, OnInit }      from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { NgbModal }               from '@ng-bootstrap/ng-bootstrap';

import { GrupoRamo }               from 'src/app/store/Grupo Ramo/grupo-ramo.model';
import { GrupoRamoService }        from 'src/app/core/services/grupo-ramo.service';
import { ToastService }            from 'src/app/shared/toasts/toast-service';
import { ConfirmModalComponent }   from 'src/app/shared/confirm-modal/confirm-modal.component';

@Component({
  selector: 'app-lista-grupo-ramo',
  templateUrl: './lista-grupo-ramo.component.html',
  styleUrls: ['./lista-grupo-ramo.component.scss']
})
export class ListaGrupoRamoComponent implements OnInit {
  private allGroups: GrupoRamo[]  = [];
  paginatedGroups:   GrupoRamo[] = [];

  page           = 1;
  pageSize       = 10;
  collectionSize = 0;
  searchTerm     = '';

  // propriedades de ordenação
  sortField = '';
  sortDir: 1 | -1 = 1;

  constructor(
    private service: GrupoRamoService,
    private router:  Router,
    private route:   ActivatedRoute,
    private toast:   ToastService,
    private modal:   NgbModal
  ) {}

  ngOnInit(): void {
    this.service.getAll().subscribe(groups => {
      this.allGroups      = groups;
      this.collectionSize = groups.length;
      this.refreshGroups();
    });
  }

  onSearch(term: string): void {
    this.searchTerm = term.trim().toLowerCase();
    this.page       = 1;
    this.refreshGroups();
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
    this.refreshGroups();
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

  refreshGroups(): void {
    let filtered = this.allGroups
      .filter(g => this.matchesSearch(g));

    if (this.sortField) {
      filtered = filtered.sort((a, b) => {
        const aVal = this.sortField === 'id' ? a.id : a.nome.toLowerCase();
        const bVal = this.sortField === 'id' ? b.id : b.nome.toLowerCase();
        if (aVal < bVal) return -1 * this.sortDir;
        if (aVal > bVal) return  1 * this.sortDir;
        return 0;
      });
    } else {
      filtered = filtered.sort((a, b) => a.nome.localeCompare(b.nome));
    }

    this.collectionSize = filtered.length;
    const start = (this.page - 1) * this.pageSize;
    this.paginatedGroups = filtered.slice(start, start + this.pageSize);
  }

  private matchesSearch(g: GrupoRamo): boolean {
    if (!this.searchTerm) return true;
    const term = this.searchTerm;
    return [ g.id.toString(), g.nome ]
      .some(v => v.toLowerCase().includes(term));
  }

  onPageChange(pageNum: number): void {
    this.page = pageNum;
    this.refreshGroups();
  }

  onEdit(g: GrupoRamo): void {
    this.router.navigate([ g.id, 'editar' ], { relativeTo: this.route });
  }

  onDelete(g: GrupoRamo): void {
    const ref = this.modal.open(ConfirmModalComponent, {
      centered: true,
      backdrop: 'static'
    });
    ref.componentInstance.title       = 'Confirma exclusão';
    ref.componentInstance.message     = `Deseja realmente apagar o grupo “${g.nome}”?`;
    ref.componentInstance.confirmText = 'Apagar';
    ref.componentInstance.cancelText  = 'Cancelar';

    ref.result
      .then(ok => {
        if (!ok) return;
        this.service.delete(g.id).subscribe({
          next: () => {
            this.toast.show(
              `Grupo “${g.nome}” apagado com sucesso!`,
              { classname: 'bg-danger text-light', delay: 5000 }
            );
            this.allGroups = this.allGroups.filter(x => x.id !== g.id);
            this.refreshGroups();
          },
          error: () => this.toast.show(
            'Falha ao apagar grupo. Tente novamente.',
            { classname: 'bg-warning text-dark', delay: 5000 }
          )
        });
      })
      .catch(() => {});
  }
}
