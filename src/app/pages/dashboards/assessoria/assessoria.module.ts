// src/app/pages/dashboards/assessoria/assessoria.module.ts

import { NgModule }                 from '@angular/core';
import { CommonModule }             from '@angular/common';
import { ReactiveFormsModule }      from '@angular/forms';
import { NgbPaginationModule }      from '@ng-bootstrap/ng-bootstrap';
import { NgbModalModule }           from '@ng-bootstrap/ng-bootstrap'; 
import { SharedModule }             from '../../../shared/shared.module';

import { ListaAssessoriaComponent }     from './lista-assessoria/lista-assessoria.component';
import { CadastroAssessoriaComponent }  from './cadastro-assessoria/cadastro-assessoria.component';
import { EnderecoModalComponent }       from './cadastro-assessoria/modal/endereco-modal.component';
import { ContatoModalComponent }        from './cadastro-assessoria/modal/contato-modal.component';
import { AssessoriaRoutingModule }      from './assessoria-routing.module';

@NgModule({
  declarations: [
    ListaAssessoriaComponent,
    CadastroAssessoriaComponent,
    EnderecoModalComponent,
    ContatoModalComponent
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    SharedModule,
    NgbPaginationModule,
    NgbModalModule,
    AssessoriaRoutingModule
  ]
})
export class AssessoriaModule {}
