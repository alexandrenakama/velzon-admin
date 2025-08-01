// src/app/pages/dashboards/assessoria/lista-assessoria/lista-assessoria.component.ts
import { Component, OnInit }      from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { NgbModal }               from '@ng-bootstrap/ng-bootstrap';

import { Assessoria }             from 'src/app/store/Assessoria/assessoria.model';
import { AssessoriaService }      from 'src/app/core/services/assessoria.service';
import { ToastService }           from 'src/app/shared/toasts/toast-service';
import { ConfirmModalComponent }  from 'src/app/shared/confirm-modal/confirm-modal.component';

import { DefinicaoColuna }        from 'src/app/shared/lista-base/lista-base.component';

@Component({
  selector: 'app-lista-assessoria',
  templateUrl: './lista-assessoria.component.html',
})
export class ListaAssessoriaComponent implements OnInit {
  allAssessorias: Assessoria[] = [];

  colunas: DefinicaoColuna[] = [
    { campo: 'id',         cabecalho: 'ID',           ordenavel: true, largura: '80px'  },
    { campo: 'nome',       cabecalho: 'Nome',         ordenavel: true              },
    { campo: 'tipoPessoa', cabecalho: 'Tipo Pessoa',  ordenavel: true, largura: '120px' },
    { campo: 'documento',  cabecalho: 'Documento',    ordenavel: true              },
    { campo: 'ativo',      cabecalho: 'Ativo',        ordenavel: true, largura: '100px' }
  ];

  constructor(
    private service: AssessoriaService,
    private router:  Router,
    private route:   ActivatedRoute,
    private toast:   ToastService,
    private modal:   NgbModal
  ) {}

  ngOnInit(): void {
    this.service.getAll().subscribe(list => this.allAssessorias = list);
  }

  onEdit(a: Assessoria) {
    this.router.navigate([ a.id, 'editar' ], { relativeTo: this.route });
  }

  onDelete(a: Assessoria) {
    const ref = this.modal.open(ConfirmModalComponent, { centered: true, backdrop: 'static' });
    ref.componentInstance.title       = 'Confirma exclusão';
    ref.componentInstance.message     = `Deseja realmente apagar “${a.nome}”?`;
    ref.componentInstance.confirmText = 'Apagar';
    ref.componentInstance.cancelText  = 'Cancelar';
    ref.result.then(ok => {
      if (!ok) return;
      this.service.delete(a.id).subscribe({
        next: () => {
          this.toast.show(
            `Assessoria “${a.nome}” apagada.`,
            { classname: 'bg-danger text-light', delay: 5000 }
          );
          this.allAssessorias = this.allAssessorias.filter(x => x.id !== a.id);
        },
        error: () => this.toast.show(
          'Erro ao apagar. Tente novamente.',
          { classname: 'bg-warning text-dark', delay: 5000 }
        )
      });
    }).catch(() => {});
  }
}
