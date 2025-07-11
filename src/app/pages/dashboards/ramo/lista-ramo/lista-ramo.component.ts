// src/app/pages/dashboards/ramo/lista-ramo/lista-ramo.component.ts
import { Component, OnInit }       from '@angular/core';
import { Router, ActivatedRoute }  from '@angular/router';
import { NgbModal }                from '@ng-bootstrap/ng-bootstrap';

import { Ramo }                    from 'src/app/store/Ramo/ramo.model';
import { RamoService }             from 'src/app/core/services/ramo.service';
import { ToastService }            from 'src/app/shared/toasts/toast-service';
import { ConfirmModalComponent }   from 'src/app/shared/confirm-modal/confirm-modal.component';

import { DefinicaoColuna }         from 'src/app/shared/lista-base/lista-base.component';

@Component({
  selector: 'app-lista-ramo',
  templateUrl: './lista-ramo.component.html',
  styleUrls: ['./lista-ramo.component.scss']
})
export class ListaRamoComponent implements OnInit {
  allRamos: Ramo[] = [];

  colunas: DefinicaoColuna[] = [
    { campo: 'grupo.id',          cabecalho: 'Grupo',        ordenavel: true, largura: '80px' },
    { campo: 'grupo.nome',        cabecalho: 'Nome Grupo',   ordenavel: true           },
    { campo: 'identificadorRamo', cabecalho: 'ID Ramo',      ordenavel: true           },
    { campo: 'codigoRamo',        cabecalho: 'Cód. Ramo',    ordenavel: true           },
    { campo: 'nomeRamo',          cabecalho: 'Nome Ramo',    ordenavel: true           },
    { campo: 'nomeAbreviado',     cabecalho: 'Abrev.',       ordenavel: true           },
    {
      campo: 'inicioVigencia',
      cabecalho: 'Início Vig.',
      ordenavel: true,
      formatoData: 'dd/MM/yyyy'
    },
    {
      campo: 'fimVigencia',
      cabecalho: 'Fim Vig.',
      ordenavel: true,
      formatoData: 'dd/MM/yyyy'
    },
    { campo: 'ramoAtivo',         cabecalho: 'Ativo',        ordenavel: true, largura: '100px' }
  ];

  constructor(
    private ramoService: RamoService,
    private router:      Router,
    private route:       ActivatedRoute,
    private toast:       ToastService,
    private modal:       NgbModal
  ) {}

  ngOnInit(): void {
    this.ramoService.getAll().subscribe(ramos => {
      this.allRamos = ramos;
    });
  }

  onEdit(r: Ramo) {
    this.router.navigate([ r.identificadorRamo, 'editar' ], { relativeTo: this.route });
  }

  onDelete(r: Ramo) {
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
        },
        error: () => this.toast.show(
          'Falha ao apagar ramo. Tente novamente.',
          { classname: 'bg-warning text-dark', delay: 5000 }
        )
      });
    }).catch(() => {});
  }
}
