// src/app/pages/dashboards/corretor/corretor.module.ts

import { NgModule }                 from '@angular/core';
import { CommonModule }             from '@angular/common';
import { ReactiveFormsModule }      from '@angular/forms';
import { NgbPaginationModule }      from '@ng-bootstrap/ng-bootstrap';
import { NgbModalModule }           from '@ng-bootstrap/ng-bootstrap';
import { SharedModule }             from '../../../shared/shared.module';

import { CorretorRoutingModule }    from './corretor-routing.module';

// componentes principais
import { ListaCorretorComponent }     from './lista-corretor/lista-corretor.component';
import { CadastroCorretorComponent }  from './cadastro-corretor/cadastro-corretor.component';

@NgModule({
  declarations: [
    ListaCorretorComponent,
    CadastroCorretorComponent
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    SharedModule,
    NgbPaginationModule,
    NgbModalModule,
    CorretorRoutingModule
  ]
})
export class CorretorModule {}
