// src/app/pages/dashboards/filial/filial.module.ts

import { NgModule }                 from '@angular/core';
import { CommonModule }             from '@angular/common';
import { ReactiveFormsModule }      from '@angular/forms';
import { NgbPaginationModule }      from '@ng-bootstrap/ng-bootstrap';
import { NgbModalModule }           from '@ng-bootstrap/ng-bootstrap'; 
import { SharedModule }             from '../../../shared/shared.module';

import { ListaFilialComponent }     from './lista-filial/lista-filial.component';
import { CadastroFilialComponent }  from './cadastro-filial/cadastro-filial.component';
import { EnderecoModalComponent }   from './cadastro-filial/modal/endereco-modal.component';
import { ContatoModalComponent }    from './cadastro-filial/modal/contato-modal.component';
import { FilialRoutingModule }      from './filial-routing.module';

@NgModule({
  declarations: [
    ListaFilialComponent,
    CadastroFilialComponent,
    EnderecoModalComponent,
    ContatoModalComponent
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    SharedModule,
    NgbPaginationModule,
    NgbModalModule,        
    FilialRoutingModule
  ]
})
export class FilialModule {}
