// src/app/pages/dashboards/filial/lista-filial/lista-filial.component.ts

import { Component, OnInit }      from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { NgbModal }               from '@ng-bootstrap/ng-bootstrap';

import { Filial }                 from 'src/app/store/Filial/filial.model';
import { FilialService }          from 'src/app/core/services/filial.service';
import { ToastService }           from 'src/app/shared/toasts/toast-service';
import { ConfirmModalComponent }  from 'src/app/shared/confirm-modal/confirm-modal.component';

import { DefinicaoColuna }        from 'src/app/shared/lista-base/lista-base.component';

@Component({
  selector: 'app-lista-filial',
  templateUrl: './lista-filial.component.html',
})
export class ListaFilialComponent implements OnInit {
  allFiliais: Filial[] = [];

  colunas: DefinicaoColuna[] = [
    { campo: 'id',         cabecalho: 'ID',           ordenavel: true, largura: '80px'  },
    { campo: 'nome',       cabecalho: 'Nome',         ordenavel: true              },
    { campo: 'tipoPessoa', cabecalho: 'Tipo Pessoa',  ordenavel: true, largura: '120px' },
    { campo: 'documento',  cabecalho: 'Documento',    ordenavel: true              },
    { campo: 'ativo',      cabecalho: 'Ativo',        ordenavel: true, largura: '100px' }
  ];

  constructor(
    private service: FilialService,
    private router:  Router,
    private route:   ActivatedRoute,
    private toast:   ToastService,
    private modal:   NgbModal
  ) {}

  ngOnInit(): void {
    this.service.getAll().subscribe(list => this.allFiliais = list);
  }

  onEdit(f: Filial) {
    this.router.navigate([ f.id, 'editar' ], { relativeTo: this.route });
  }

  onDelete(f: Filial) {
    const ref = this.modal.open(ConfirmModalComponent, { centered: true, backdrop: 'static' });
    ref.componentInstance.title       = 'Confirma exclusão';
    ref.componentInstance.message     = `Deseja realmente apagar “${f.nome}”?`;
    ref.componentInstance.confirmText = 'Apagar';
    ref.componentInstance.cancelText  = 'Cancelar';
    ref.result.then(ok => {
      if (!ok) return;
      this.service.delete(f.id).subscribe({
        next: () => {
          this.toast.show(
            `Filial “${f.nome}” apagada.`,
            { classname: 'bg-danger text-light', delay: 5000 }
          );
          this.allFiliais = this.allFiliais.filter(x => x.id !== f.id);
        },
        error: () => this.toast.show(
          'Erro ao apagar. Tente novamente.',
          { classname: 'bg-warning text-dark', delay: 5000 }
        )
      });
    }).catch(() => {});
  }
}
