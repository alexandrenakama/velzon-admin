// src/app/pages/dashboards/produto/produto.module.ts
import { NgModule }              from '@angular/core';
import { CommonModule }          from '@angular/common';
import { ReactiveFormsModule }   from '@angular/forms';
import { NgbTypeaheadModule }    from '@ng-bootstrap/ng-bootstrap';

import { ProdutoRoutingModule }  from './produto-routing.module';
import { SharedModule }          from 'src/app/shared/shared.module';

import { ListaProdutoComponent }    from './lista-produto/lista-produto.component';
import { CadastroProdutoComponent } from './cadastro-produto/cadastro-produto.component';

@NgModule({
  declarations: [
    ListaProdutoComponent,
    CadastroProdutoComponent
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    NgbTypeaheadModule,
    SharedModule,
    ProdutoRoutingModule
  ]
})
export class ProdutoModule {}
