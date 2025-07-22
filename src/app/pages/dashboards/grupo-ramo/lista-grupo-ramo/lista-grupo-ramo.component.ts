// src/app/pages/dashboards/grupo-ramo/lista-grupo-ramo/lista-grupo-ramo.component.ts
import { Component, OnInit }      from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { NgbModal }               from '@ng-bootstrap/ng-bootstrap';

import { GrupoRamo }              from 'src/app/store/Grupo Ramo/grupo-ramo.model';
import { GrupoRamoService }       from 'src/app/core/services/grupo-ramo.service';
import { Seguradora }             from 'src/app/store/Seguradora/seguradora.model';
import { SeguradoraService }      from 'src/app/core/services/seguradora.service';
import { RamoService }            from 'src/app/core/services/ramo.service';
import { ToastService }           from 'src/app/shared/toasts/toast-service';
import { ConfirmModalComponent }  from 'src/app/shared/confirm-modal/confirm-modal.component';
import { take }                   from 'rxjs/operators';

import { DefinicaoColuna }        from 'src/app/shared/lista-base/lista-base.component';

@Component({
  selector: 'app-lista-grupo-ramo',
  templateUrl: './lista-grupo-ramo.component.html',
})
export class ListaGrupoRamoComponent implements OnInit {
  allGroups: Array<GrupoRamo & { seguradoraNome: string }> = [];

  // Colunas que o <app-lista-base> vai renderizar
  colunas: DefinicaoColuna[] = [
    { campo: 'id',               cabecalho: 'ID',           ordenavel: true, largura: '80px' },
    { campo: 'nome',             cabecalho: 'Nome Grupo',   ordenavel: true },
    { campo: 'seguradoraNome',   cabecalho: 'Seguradora',   ordenavel: true }
  ];

  private seguradoras: Seguradora[] = [];

  constructor(
    private service:       GrupoRamoService,
    private seguradoraSrv: SeguradoraService,
    private ramoService:   RamoService,
    private router:        Router,
    private route:         ActivatedRoute,
    private toast:         ToastService,
    private modal:         NgbModal
  ) {}

  ngOnInit(): void {
    // 1) carrega seguradoras primeiro
    this.seguradoraSrv.getAll().pipe(take(1)).subscribe(segs => {
      this.seguradoras = segs;

      // 2) depois carrega grupos e já injeta `seguradoraNome` em cada um
      this.service.getAll().pipe(take(1)).subscribe(groups => {
        this.allGroups = groups.map(g => ({
          ...g,
          seguradoraNome: this.getSeguradoraNome(g.seguradoraId)
        }));
      });
    });
  }

  onEdit(g: GrupoRamo): void {
    this.router.navigate([ g.id, 'editar' ], { relativeTo: this.route });
  }

  onDelete(g: GrupoRamo): void {
    // verifica vínculos
    this.ramoService.getAll().pipe(take(1)).subscribe(allRamos => {
      const vinculados = allRamos.filter(r => r.grupo.id === g.id).length;
      if (vinculados > 0) {
        this.toast.show(
          `Falha ao apagar grupo. Você tem ${vinculados} ramo(s) vinculados.`,
          { classname: 'bg-warning text-dark', delay: 6000 }
        );
        return;
      }

      // confirma exclusão
      const ref = this.modal.open(ConfirmModalComponent, {
        centered: true,
        backdrop: 'static'
      });
      ref.componentInstance.title       = 'Confirma exclusão';
      ref.componentInstance.message     = `Deseja realmente apagar o grupo “${g.nome}”?`;
      ref.componentInstance.confirmText = 'Apagar';
      ref.componentInstance.cancelText  = 'Cancelar';

      ref.result.then(ok => {
        if (!ok) return;
        this.service.delete(g.id).subscribe({
          next: () => {
            this.toast.show(
              `Grupo “${g.nome}” apagado com sucesso!`,
              { classname: 'bg-danger text-light', delay: 5000 }
            );
            // remove da lista — o app-lista-base já reage via ngOnChanges
            this.allGroups = this.allGroups.filter(x => x.id !== g.id);
          },
          error: () => this.toast.show(
            'Falha ao apagar grupo. Tente novamente.',
            { classname: 'bg-warning text-dark', delay: 5000 }
          )
        });
      }).catch(() => {});
    });
  }

  /** mapeia o nome da seguradora a partir do id */
  private getSeguradoraNome(id: number): string {
    const seg = this.seguradoras.find(s => s.id === id);
    return seg ? seg.nome : '–';
  }
}
