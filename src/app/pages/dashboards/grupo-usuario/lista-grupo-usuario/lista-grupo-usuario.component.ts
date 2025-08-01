// src/app/pages/dashboards/grupo-usuario/lista-grupo-usuario/lista-grupo-usuario.component.ts

import { Component, OnInit }      from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { NgbModal }               from '@ng-bootstrap/ng-bootstrap';

import { GrupoUsuario }           from 'src/app/store/Grupo Usuario/grupo-usuario.model';
import { GrupoUsuarioService }    from 'src/app/core/services/grupo-usuario.service';
import { ToastService }           from 'src/app/shared/toasts/toast-service';
import { ConfirmModalComponent }  from 'src/app/shared/confirm-modal/confirm-modal.component';

import { DefinicaoColuna }        from 'src/app/shared/lista-base/lista-base.component';

@Component({
  selector: 'app-lista-grupo-usuario',
  templateUrl: './lista-grupo-usuario.component.html',
})
export class ListaGrupoUsuarioComponent implements OnInit {
  allGrupos: GrupoUsuario[] = [];
  colunas: DefinicaoColuna[] = [
    { campo: 'id',    cabecalho: 'ID',     ordenavel: true, largura: '80px' },
    { campo: 'cargo', cabecalho: 'Cargo',  ordenavel: true             },
    { campo: 'ativo', cabecalho: 'Ativo',  ordenavel: true, largura: '100px' }
  ];

  constructor(
    private service: GrupoUsuarioService,
    private router:  Router,
    private route:   ActivatedRoute,
    private toast:   ToastService,
    private modal:   NgbModal
  ) {}

  ngOnInit(): void {
    this.service.getAll().subscribe(list => this.allGrupos = list);
  }

  onEdit(g: GrupoUsuario) {
    this.router.navigate([ g.id, 'editar' ], { relativeTo: this.route });
  }

  onDelete(g: GrupoUsuario) {
    const ref = this.modal.open(ConfirmModalComponent, { centered: true, backdrop: 'static' });
    ref.componentInstance.title       = 'Confirma exclusão';
    ref.componentInstance.message     = `Deseja realmente apagar o grupo “${g.cargo}”?`;
    ref.componentInstance.confirmText = 'Apagar';
    ref.componentInstance.cancelText  = 'Cancelar';
    ref.result.then(ok => {
      if (!ok) return;
      this.service.delete(g.id).subscribe({
        next: () => {
          this.toast.show(`Grupo “${g.cargo}” apagado.`, { classname: 'bg-danger text-light', delay: 5000 });
          this.allGrupos = this.allGrupos.filter(x => x.id !== g.id);
        },
        error: () => this.toast.show('Erro ao apagar. Tente novamente.', { classname: 'bg-warning text-dark', delay: 5000 })
      });
    }).catch(() => {});
  }
}
