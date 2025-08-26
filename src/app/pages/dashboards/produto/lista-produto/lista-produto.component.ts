// src/app/pages/dashboards/produto/lista-produto/lista-produto.component.ts
import { Component, OnInit }       from '@angular/core';
import { Router, ActivatedRoute }  from '@angular/router';
import { NgbModal }                from '@ng-bootstrap/ng-bootstrap';

import { Produto }                 from 'src/app/store/Produto/produto.model';
import { ProdutoService }          from 'src/app/core/services/produto.service';
import { ToastService }            from 'src/app/shared/toasts/toast-service';
import { ConfirmModalComponent }   from 'src/app/shared/confirm-modal/confirm-modal.component';

import { DefinicaoColuna }         from 'src/app/shared/lista-base/lista-base.component';

@Component({
  selector: 'app-lista-produto',
  templateUrl: './lista-produto.component.html',
})
export class ListaProdutoComponent implements OnInit {
  allProdutos: Produto[] = [];

  colunas: DefinicaoColuna[] = [
    { campo: 'ramoId',               cabecalho: 'ID Ramo',       ordenavel: true, largura: '80px' },
    { campo: 'nomeRamo',             cabecalho: 'Nome Ramo',     ordenavel: true            },
    { campo: 'id',                   cabecalho: 'ID Produto',    ordenavel: true            },
    { campo: 'nomeProduto',          cabecalho: 'Nome Produto',  ordenavel: true            },
    { campo: 'nomeAbreviadoProduto', cabecalho: 'Nome Abrev.',        ordenavel: true            },
    { campo: 'numeroProcessoSusep',  cabecalho: 'Nº Proc. SUSEP',   ordenavel: true            },
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
    { campo: 'ativo',   cabecalho: 'PF',            ordenavel: true, largura: '60px' },
    { campo: 'ativo', cabecalho: 'PJ',            ordenavel: true, largura: '60px' },
    { campo: 'ativo',          cabecalho: 'Ativo',         ordenavel: true, largura: '80px' }
  ];

  constructor(
    private produtoService: ProdutoService,
    private router:         Router,
    private route:          ActivatedRoute,
    private toast:          ToastService,
    private modal:          NgbModal
  ) {}

  ngOnInit(): void {
    this.produtoService.getAll().subscribe(produtos => {
      this.allProdutos = produtos;
    });
  }

  onEdit(p: Produto) {
    this.router.navigate([ p.id, 'editar' ], { relativeTo: this.route });
  }

  onDelete(p: Produto) {
    const ref = this.modal.open(ConfirmModalComponent, { centered: true, backdrop: 'static' });
    ref.componentInstance.title       = 'Confirma exclusão';
    ref.componentInstance.message     = `Deseja realmente apagar o produto “${p.nomeProduto}”?`;
    ref.componentInstance.confirmText = 'Apagar';
    ref.componentInstance.cancelText  = 'Cancelar';

    ref.result.then((ok: boolean) => {
      if (!ok) return;
      this.produtoService.delete(p.id).subscribe({
        next: () => {
          this.toast.show(
            `Produto “${p.nomeProduto}” apagado com sucesso!`,
            { classname: 'bg-danger text-light', delay: 5000 }
          );
          this.allProdutos = this.allProdutos.filter(x => x.id !== p.id);
        },
        error: () => this.toast.show(
          'Falha ao apagar produto. Tente novamente.',
          { classname: 'bg-warning text-dark', delay: 5000 }
        )
      });
    }).catch(() => {});
  }
}
