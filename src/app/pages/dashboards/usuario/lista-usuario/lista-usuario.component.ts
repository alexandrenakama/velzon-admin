// src/app/pages/dashboards/usuario/lista-usuario/lista-usuario.component.ts

import { Component, OnInit }      from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { NgbModal }               from '@ng-bootstrap/ng-bootstrap';

import { Usuario }                from 'src/app/store/Usuario/usuario.model';
import { UsuarioService }         from 'src/app/core/services/usuario.service';
import { ToastService }           from 'src/app/shared/toasts/toast-service';
import { ConfirmModalComponent }  from 'src/app/shared/confirm-modal/confirm-modal.component';

import { DefinicaoColuna }        from 'src/app/shared/lista-base/lista-base.component';

@Component({
  selector: 'app-lista-usuario',
  templateUrl: './lista-usuario.component.html',
})
export class ListaUsuarioComponent implements OnInit {
  allUsuarios: Usuario[] = [];
  colunas: DefinicaoColuna[] = [
    { campo: 'id',                cabecalho: 'ID',     ordenavel: true, largura: '80px' },
    { campo: 'nome',              cabecalho: 'Nome',   ordenavel: true             },
    { campo: 'email',             cabecalho: 'Email',  ordenavel: true             },
    { campo: 'grupoUsuario.cargo',cabecalho: 'Grupo',  ordenavel: true             },
    { campo: 'ativo',             cabecalho: 'Ativo',  ordenavel: true, largura: '100px' }
  ];

  constructor(
    private service: UsuarioService,
    private router:  Router,
    private route:   ActivatedRoute,
    private toast:   ToastService,
    private modal:   NgbModal
  ) {}

  ngOnInit(): void {
    this.service.getAll().subscribe(list => this.allUsuarios = list);
  }

  onEdit(u: Usuario) {
    this.router.navigate([ u.id, 'editar' ], { relativeTo: this.route });
  }

  onDelete(u: Usuario) {
    const ref = this.modal.open(ConfirmModalComponent, { centered: true, backdrop: 'static' });
    ref.componentInstance.title       = 'Confirma exclusão';
    ref.componentInstance.message     = `Deseja realmente apagar “${u.nome}”?`;
    ref.componentInstance.confirmText = 'Apagar';
    ref.componentInstance.cancelText  = 'Cancelar';
    ref.result.then(ok => {
      if (!ok) return;
      this.service.delete(u.id).subscribe({
        next: () => {
          this.toast.show(
            `Usuário “${u.nome}” apagado.`,
            { classname: 'bg-danger text-light', delay: 5000 }
          );
          this.allUsuarios = this.allUsuarios.filter(x => x.id !== u.id);
        },
        error: () => this.toast.show(
          'Erro ao apagar. Tente novamente.',
          { classname: 'bg-warning text-dark', delay: 5000 }
        )
      });
    }).catch(() => {});
  }
}
