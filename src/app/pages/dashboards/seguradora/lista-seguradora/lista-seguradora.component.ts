import { Component, OnInit }      from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { NgbModal }               from '@ng-bootstrap/ng-bootstrap';

import { Seguradora }             from 'src/app/store/Seguradora/seguradora.model';
import { SeguradoraService }      from 'src/app/core/services/seguradora.service';
import { GrupoRamoService }       from 'src/app/core/services/grupo-ramo.service';
import { ToastService }           from 'src/app/shared/toasts/toast-service';
import { ConfirmModalComponent }  from 'src/app/shared/confirm-modal/confirm-modal.component';

import { DefinicaoColuna }        from 'src/app/shared/lista-base/lista-base.component';

@Component({
  selector: 'app-lista-seguradora',
  templateUrl: './lista-seguradora.component.html',
  styleUrls: ['./lista-seguradora.component.scss']
})
export class ListaSeguradoraComponent implements OnInit {
  /** dados puros */
  allSeguradoras: Seguradora[] = [];

  /** colunas que vão para o <app-lista-base> */
  colunas: DefinicaoColuna[] = [
    { campo: 'id',    cabecalho: 'ID',    ordenavel: true, largura: '80px' },
    { campo: 'nome',  cabecalho: 'Nome',  ordenavel: true },
    { campo: 'cnpj',  cabecalho: 'CNPJ',  ordenavel: true },
    { campo: 'ativa', cabecalho: 'Ativa', ordenavel: true, largura: '100px' }
  ];

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
    });
  }

  /** dispara ao clicar em “Editar” no componente genérico */
  onEdit(s: Seguradora) {
    this.router.navigate([ s.id, 'editar' ], { relativeTo: this.route });
  }

  /** dispara ao clicar em “Apagar” no componente genérico */
  onDelete(s: Seguradora) {
    this.grupoRamoSvc.getAll().subscribe(allGroups => {
      const vinculados = allGroups.filter(g => g.seguradoraId === s.id).length;
      if (vinculados > 0) {
        this.toast.show(
          `Falha ao apagar seguradora. Você tem ${vinculados} grupo(s) de ramo vinculados.`,
          { classname: 'bg-warning text-dark', delay: 6000 }
        );
        return;
      }
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
            // atualiza lista
            this.allSeguradoras = this.allSeguradoras.filter(x => x.id !== s.id);
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
