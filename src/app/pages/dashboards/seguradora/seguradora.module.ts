// src/app/pages/dashboards/seguradora/seguradora.module.ts

import { NgModule }                 from '@angular/core';
import { CommonModule }             from '@angular/common';
import { ReactiveFormsModule }      from '@angular/forms';
import { NgbPaginationModule }      from '@ng-bootstrap/ng-bootstrap';
import { NgbModalModule }           from '@ng-bootstrap/ng-bootstrap'; 
import { SharedModule }             from '../../../shared/shared.module';

import { ListaSeguradoraComponent }   from './lista-seguradora/lista-seguradora.component';
import { CadastroSeguradoraComponent } from './cadastro-seguradora/cadastro-seguradora.component';
import { SeguradoraRoutingModule }     from './seguradora-routing.module';

// ← importe aqui os componentes de modal que você criou
import { EnderecoModalComponent }      from './cadastro-seguradora/modal/endereco-modal.component';
import { ContatoModalComponent }       from './cadastro-seguradora/modal/contato-modal.component';

@NgModule({
  declarations: [
    ListaSeguradoraComponent,
    CadastroSeguradoraComponent,
    EnderecoModalComponent,
    ContatoModalComponent
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    SharedModule,
    NgbPaginationModule,
    NgbModalModule,        
    SeguradoraRoutingModule
  ]
})
export class SeguradoraModule {}
