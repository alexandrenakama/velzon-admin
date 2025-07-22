// src/app/pages/dashboards/produto/produto-routing.module.ts
import { NgModule }           from '@angular/core';
import { RouterModule,
         Routes }            from '@angular/router';

import { ListaProdutoComponent }    from './lista-produto/lista-produto.component';
import { CadastroProdutoComponent } from './cadastro-produto/cadastro-produto.component';

const routes: Routes = [
  { path: '', component: ListaProdutoComponent },
  { path: 'cadastro', component: CadastroProdutoComponent },
  { path: ':id/editar', component: CadastroProdutoComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ProdutoRoutingModule {}
