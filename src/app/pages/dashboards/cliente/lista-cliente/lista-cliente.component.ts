// src/app/pages/dashboards/cliente/lista-cliente/lista-cliente.component.ts
import { Component, OnInit }      from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { NgbModal }               from '@ng-bootstrap/ng-bootstrap';

import { Cliente }                from 'src/app/store/Cliente/cliente.model';
import { ClienteService }         from 'src/app/core/services/cliente.service';
import { ToastService }           from 'src/app/shared/toasts/toast-service';
import { ConfirmModalComponent }  from 'src/app/shared/confirm-modal/confirm-modal.component';

import { DefinicaoColuna }        from 'src/app/shared/lista-base/lista-base.component';

@Component({
  selector: 'app-lista-cliente',
  templateUrl: './lista-cliente.component.html',
})
export class ListaClienteComponent implements OnInit {
  allClientes: Cliente[] = [];

  colunas: DefinicaoColuna[] = [
    { campo: 'id',         cabecalho: 'ID',           ordenavel: true, largura: '80px'  },
    { campo: 'nome',       cabecalho: 'Nome',         ordenavel: true              },
    { campo: 'tipoPessoa', cabecalho: 'Tipo Pessoa',  ordenavel: true, largura: '120px' },
    { campo: 'documento',  cabecalho: 'Documento',    ordenavel: true              },
    { campo: 'ativo',      cabecalho: 'Ativo',        ordenavel: true, largura: '100px' }
  ];

  constructor(
    private service: ClienteService,
    private router:  Router,
    private route:   ActivatedRoute,
    private toast:   ToastService,
    private modal:   NgbModal
  ) {}

  ngOnInit(): void {
    this.service.getAll().subscribe(list => this.allClientes = list);
  }

  onEdit(c: Cliente) {
    this.router.navigate([ c.id, 'editar' ], { relativeTo: this.route });
  }

  onDelete(c: Cliente) {
    const ref = this.modal.open(ConfirmModalComponent, { centered: true, backdrop: 'static' });
    ref.componentInstance.title       = 'Confirma exclusão';
    ref.componentInstance.message     = `Deseja realmente apagar “${c.nome}”?`;
    ref.componentInstance.confirmText = 'Apagar';
    ref.componentInstance.cancelText  = 'Cancelar';
    ref.result.then(ok => {
      if (!ok) return;
      this.service.delete(c.id).subscribe({
        next: () => {
          this.toast.show(
            `Cliente “${c.nome}” apagado.`,
            { classname: 'bg-danger text-light', delay: 5000 }
          );
          this.allClientes = this.allClientes.filter(x => x.id !== c.id);
        },
        error: () => this.toast.show(
          'Erro ao apagar. Tente novamente.',
          { classname: 'bg-warning text-dark', delay: 5000 }
        )
      });
    }).catch(() => {});
  }
}
