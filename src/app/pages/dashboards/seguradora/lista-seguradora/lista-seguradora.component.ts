// src/app/pages/dashboards/seguradora/lista-seguradora/lista-seguradora.component.ts

import { Component, OnInit }       from '@angular/core';
import { Router, ActivatedRoute }  from '@angular/router';
import { NgbModal }                from '@ng-bootstrap/ng-bootstrap';

import { Seguradora }              from 'src/app/store/Seguradora/seguradora.model';
import { SeguradoraService }       from 'src/app/core/services/seguradora.service';
import { GrupoRamoService }        from 'src/app/core/services/grupo-ramo.service';
import { ToastService }            from 'src/app/shared/toasts/toast-service';
import { ConfirmModalComponent }   from 'src/app/shared/confirm-modal/confirm-modal.component';

@Component({
  selector: 'app-lista-seguradora',
  templateUrl: './lista-seguradora.component.html',
  styleUrls: ['./lista-seguradora.component.scss']
})
export class ListaSeguradoraComponent implements OnInit {
  allSeguradoras:       Seguradora[] = [];
  paginatedSeguradoras: Seguradora[] = [];

  page = 1;
  pageSize = 10;
  collectionSize = 0;
  searchTerm = '';

  sortField = '';
  sortDir: 1 | -1 = 1;

  constructor(
    private service:       SeguradoraService,
    private grupoRamoSvc:  GrupoRamoService,
    private router:        Router,
    private route:         ActivatedRoute,
    private toast:         ToastService,
    private modal:         NgbModal
  ) {}

  ngOnInit(): void {
    this.service.getAll().subscribe(list => {
      this.allSeguradoras = list;
      this.collectionSize = list.length;
      this.refreshList();
    });
  }

  onSearch(term: string): void {
    this.searchTerm = term.trim().toLowerCase();
    this.page       = 1;
    this.refreshList();
  }

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
    this.refreshList();
  }

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

  private getByPath(obj: any, path: string): any {
    return path.split('.').reduce((o, key) => o?.[key], obj);
  }

  private compare(a: any, b: any): number {
    if (a == null) return b == null ? 0 : -1;
    if (b == null) return 1;
    if (typeof a === 'string') return a.localeCompare(b);
    return a < b ? -1 : a > b ? 1 : 0;
  }

  private matchesSearch(s: Seguradora): boolean {
    if (!this.searchTerm) return true;
    const term = this.searchTerm;
    return [ String(s.id), s.nome, s.cnpj ]
      .some(v => v.toLowerCase().includes(term));
  }

  refreshList(): void {
    let filtered = this.allSeguradoras.filter(s => this.matchesSearch(s));

    if (this.sortField) {
      filtered = filtered.sort((a, b) =>
        this.compare(this.getByPath(a, this.sortField), this.getByPath(b, this.sortField))
        * this.sortDir
      );
    }

    this.collectionSize = filtered.length;
    const start = (this.page - 1) * this.pageSize;
    this.paginatedSeguradoras = filtered.slice(start, start + this.pageSize);
  }

  onPageChange(pageNum: number): void {
    this.page = pageNum;
    this.refreshList();
  }

  onEdit(s: Seguradora): void {
    this.router.navigate([ s.id, 'editar' ], { relativeTo: this.route });
  }

  onDelete(s: Seguradora): void {
    // Conta quantos grupos de ramo estão vinculados a esta seguradora
    this.grupoRamoSvc.getAll().subscribe(allGroups => {
      const vinculados = allGroups.filter(g => g.seguradoraId === s.id).length;

      if (vinculados > 0) {
        // Se houver vínculos, exibe mensagem de falha personalizada
        this.toast.show(
          `Falha ao apagar seguradora. Você tem ${vinculados} grupo(s) de ramo vinculados.`,
          { classname: 'bg-warning text-dark', delay: 6000 }
        );
        return;
      }

      // Caso contrário, confirma e prossegue com a exclusão
      const ref = this.modal.open(ConfirmModalComponent, { centered: true, backdrop: 'static' });
      ref.componentInstance.title       = 'Confirma exclusão';
      ref.componentInstance.message     = `Deseja realmente apagar a seguradora “${s.nome}”?`;
      ref.componentInstance.confirmText = 'Apagar';
      ref.componentInstance.cancelText  = 'Cancelar';

      ref.result.then((ok: boolean) => {
        if (!ok) return;
        this.service.delete(s.id).subscribe({
          next: () => {
            this.toast.show(
              `Seguradora “${s.nome}” apagada com sucesso!`,
              { classname: 'bg-danger text-light', delay: 5000 }
            );
            this.allSeguradoras = this.allSeguradoras.filter(x => x.id !== s.id);
            this.refreshList();
          },
          error: () => this.toast.show(
            'Falha ao apagar seguradora. Tente novamente.',
            { classname: 'bg-warning text-dark', delay: 5000 }
          )
        });
      }).catch(() => {});
    });
  }
}
