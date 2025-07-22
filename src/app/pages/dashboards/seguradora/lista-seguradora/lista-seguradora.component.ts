// src/app/pages/dashboards/seguradora/lista-seguradora/lista-seguradora.component.ts
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
})
export class ListaSeguradoraComponent implements OnInit {
  allSeguradoras: Seguradora[] = [];

  colunas: DefinicaoColuna[] = [
    { campo: 'id',          cabecalho: 'ID',            ordenavel: true, largura: '80px'  },
    { campo: 'nome',        cabecalho: 'Nome',          ordenavel: true              },
    { campo: 'tipoPessoa',  cabecalho: 'Tipo Pessoa',   ordenavel: true, largura: '120px' },
    { campo: 'documento',        cabecalho: 'Documento',     ordenavel: true              },
    { campo: 'ativo',       cabecalho: 'Ativo',         ordenavel: true, largura: '100px' }
  ];

  constructor(
    private service:      SeguradoraService,
    private grupoRamoSvc: GrupoRamoService,
    private router:       Router,
    private route:        ActivatedRoute,
    private toast:        ToastService,
    private modal:        NgbModal
  ) {}

  ngOnInit(): void {
    this.service.getAll().subscribe(list => this.allSeguradoras = list);
  }

  onEdit(s: Seguradora) {
    this.router.navigate([ s.id, 'editar' ], { relativeTo: this.route });
  }

  onDelete(s: Seguradora) {
    this.grupoRamoSvc.getAll().subscribe(allG => {
      const vinculados = allG.filter(g => g.seguradoraId === s.id).length;
      if (vinculados > 0) {
        this.toast.show(
          `Não foi possível apagar. Há ${vinculados} grupo(s) vinculados.`,
          { classname: 'bg-warning text-dark', delay: 6000 }
        );
        return;
      }
      const ref = this.modal.open(ConfirmModalComponent, { centered: true, backdrop: 'static' });
      ref.componentInstance.title       = 'Confirma exclusão';
      ref.componentInstance.message     = `Deseja realmente apagar “${s.nome}”?`;
      ref.componentInstance.confirmText = 'Apagar';
      ref.componentInstance.cancelText  = 'Cancelar';
      ref.result.then(ok => {
        if (!ok) return;
        this.service.delete(s.id).subscribe({
          next: () => {
            this.toast.show(
              `Seguradora “${s.nome}” apagada.`,
              { classname: 'bg-danger text-light', delay: 5000 }
            );
            this.allSeguradoras = this.allSeguradoras.filter(x => x.id !== s.id);
          },
          error: () => this.toast.show(
            'Erro ao apagar. Tente novamente.',
            { classname: 'bg-warning text-dark', delay: 5000 }
          )
        });
      }).catch(() => {});
    });
  }
}
