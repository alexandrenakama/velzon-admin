// src/app/pages/dashboards/cliente/cliente.module.ts

import { NgModule }                 from '@angular/core';
import { CommonModule }             from '@angular/common';
import { ReactiveFormsModule }      from '@angular/forms';
import { NgbPaginationModule }      from '@ng-bootstrap/ng-bootstrap';
import { NgbModalModule }           from '@ng-bootstrap/ng-bootstrap'; 
import { SharedModule }             from '../../../shared/shared.module';

import { ListaClienteComponent }     from './lista-cliente/lista-cliente.component';
import { CadastroClienteComponent }  from './cadastro-cliente/cadastro-cliente.component';
import { ClienteRoutingModule }      from './cliente-routing.module';

import { EnderecoModalComponent }    from './cadastro-cliente/modal/endereco-modal.component';
import { ContatoModalComponent }     from './cadastro-cliente/modal/contato-modal.component';

@NgModule({
  declarations: [
    ListaClienteComponent,
    CadastroClienteComponent,
    EnderecoModalComponent,
    ContatoModalComponent
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    SharedModule,
    NgbPaginationModule,
    NgbModalModule,        
    ClienteRoutingModule
  ]
})
export class ClienteModule {}
