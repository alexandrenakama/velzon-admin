// src/app/pages/dashboards/grupo-usuario/lista-grupo-usuario/lista-grupo-usuario.component.ts
import { Component, OnInit }       from '@angular/core';
import { Router, ActivatedRoute }  from '@angular/router';
import { NgbModal }                from '@ng-bootstrap/ng-bootstrap';
import { take }                    from 'rxjs/operators';

import { GrupoUsuario }            from 'src/app/store/Grupo Usuario/grupo-usuario.model';
import { GrupoUsuarioService }     from 'src/app/core/services/grupo-usuario.service';
import { UsuarioService }          from 'src/app/core/services/usuario.service';
import { ToastService }            from 'src/app/shared/toasts/toast-service';
import { ConfirmModalComponent }   from 'src/app/shared/confirm-modal/confirm-modal.component';

import { DefinicaoColuna }         from 'src/app/shared/lista-base/lista-base.component';

@Component({
  selector: 'app-lista-grupo-usuario',
  templateUrl: './lista-grupo-usuario.component.html',
})
export class ListaGrupoUsuarioComponent implements OnInit {
  allGrupos: GrupoUsuario[] = [];
  colunas: DefinicaoColuna[] = [
    { campo: 'id',    cabecalho: 'ID',    ordenavel: true, largura: '80px' },
    { campo: 'cargo', cabecalho: 'Cargo', ordenavel: true             },
    { campo: 'ativo', cabecalho: 'Ativo', ordenavel: true, largura: '100px' }
  ];

  constructor(
    private grupoService:   GrupoUsuarioService,
    private usuarioService: UsuarioService,
    private router:         Router,
    private route:          ActivatedRoute,
    private toast:          ToastService,
    private modal:          NgbModal
  ) {}

  ngOnInit(): void {
    this.grupoService.getAll()
      .pipe(take(1))
      .subscribe(grupos => this.allGrupos = grupos);
  }

  onEdit(g: GrupoUsuario): void {
    this.router.navigate([ g.id, 'editar' ], { relativeTo: this.route });
  }

  onDelete(g: GrupoUsuario): void {
    // 1) verifica vínculos de Usuario → GrupoUsuario
    this.usuarioService.getAll()
      .pipe(take(1))
      .subscribe(usuarios => {
        const vinculados = usuarios.filter(u => u.grupoUsuario.id === g.id).length;

        if (vinculados > 0) {
          this.toast.show(
            `Falha ao apagar grupo. Você tem ${vinculados} usuário(s) vinculados.`,
            { classname: 'bg-warning text-dark', delay: 6000 }
          );
          return; // aborta a exclusão
        }

        // 2) se não houver vínculos, abre o modal de confirmação
        const ref = this.modal.open(ConfirmModalComponent, {
          centered: true,
          backdrop: 'static'
        });
        ref.componentInstance.title       = 'Confirma exclusão';
        ref.componentInstance.message     = `Deseja realmente apagar o grupo “${g.cargo}”?`;
        ref.componentInstance.confirmText = 'Apagar';
        ref.componentInstance.cancelText  = 'Cancelar';

        ref.result.then((ok: boolean) => {
          if (!ok) return;
          // 3) usuário confirmou: efetua a exclusão
          this.grupoService.delete(g.id).subscribe({
            next: () => {
              this.toast.show(
                `Grupo “${g.cargo}” apagado com sucesso!`,
                { classname: 'bg-danger text-light', delay: 5000 }
              );
              this.allGrupos = this.allGrupos.filter(x => x.id !== g.id);
            },
            error: () => {
              this.toast.show(
                'Falha ao apagar grupo. Tente novamente.',
                { classname: 'bg-warning text-dark', delay: 5000 }
              );
            }
          });
        }).catch(() => {
          // modal fechado sem confirmar
        });
      });
  }
}
