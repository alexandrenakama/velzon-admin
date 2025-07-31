// src/app/pages/dashboards/ramo/lista-ramo/lista-ramo.component.ts
import { Component, OnInit }       from '@angular/core';
import { Router, ActivatedRoute }  from '@angular/router';
import { NgbModal }                from '@ng-bootstrap/ng-bootstrap';
import { take }                    from 'rxjs/operators';

import { Ramo }                    from 'src/app/store/Ramo/ramo.model';
import { RamoService }             from 'src/app/core/services/ramo.service';
import { ProdutoService }          from 'src/app/core/services/produto.service';
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
    { campo: 'ativo',             cabecalho: 'Ativo',        ordenavel: true, largura: '100px' }
  ];

  constructor(
    private ramoService:    RamoService,
    private produtoService: ProdutoService,
    private router:         Router,
    private route:          ActivatedRoute,
    private toast:          ToastService,
    private modal:          NgbModal
  ) {}

  ngOnInit(): void {
    this.ramoService.getAll()
      .pipe(take(1))
      .subscribe(ramos => {
        this.allRamos = ramos;
      });
  }

  onEdit(r: Ramo): void {
    this.router.navigate([ r.identificadorRamo, 'editar' ], { relativeTo: this.route });
  }

  onDelete(r: Ramo): void {
    // 1) verifica vínculos de Produto → Ramo
    this.produtoService.getAll()
      .pipe(take(1))
      .subscribe(produtos => {
        const idRamoNum = Number(r.identificadorRamo);
        const vinculados = produtos
          .filter(p => p.ramoId === idRamoNum)
          .length;

        if (vinculados > 0) {
          this.toast.show(
            `Falha ao apagar ramo. Você tem ${vinculados} produto(s) vinculados.`,
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
        ref.componentInstance.message     = `Deseja realmente apagar o ramo “${r.nomeRamo}”?`;
        ref.componentInstance.confirmText = 'Apagar';
        ref.componentInstance.cancelText  = 'Cancelar';

        ref.result.then((ok: boolean) => {
          if (!ok) return;
          // 3) usuário confirmou: efetua a exclusão
          this.ramoService.delete(r.identificadorRamo).subscribe({
            next: () => {
              this.toast.show(
                `Ramo “${r.nomeRamo}” apagado com sucesso!`,
                { classname: 'bg-danger text-light', delay: 5000 }
              );
              this.allRamos = this.allRamos.filter(x => x.identificadorRamo !== r.identificadorRamo);
            },
            error: () => {
              this.toast.show(
                'Falha ao apagar ramo. Tente novamente.',
                { classname: 'bg-warning text-dark', delay: 5000 }
              );
            }
          });
        }).catch(() => {
          // Modal fechado sem confirmar
        });
      });
  }
}
