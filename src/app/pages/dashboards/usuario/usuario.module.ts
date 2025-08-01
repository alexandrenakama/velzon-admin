// src/app/pages/dashboards/usuario/usuario.module.ts

import { NgModule }                 from '@angular/core';
import { CommonModule }             from '@angular/common';
import { ReactiveFormsModule }      from '@angular/forms';
import { NgbPaginationModule }      from '@ng-bootstrap/ng-bootstrap';
import { NgbModalModule }           from '@ng-bootstrap/ng-bootstrap';
import { SharedModule }             from '../../../shared/shared.module';

import { ListaUsuarioComponent }    from './lista-usuario/lista-usuario.component';
import { CadastroUsuarioComponent } from './cadastro-usuario/cadastro-usuario.component';
import { UsuarioRoutingModule }     from './usuario-routing.module';

@NgModule({
  declarations: [
    ListaUsuarioComponent,
    CadastroUsuarioComponent
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    SharedModule,
    NgbPaginationModule,
    NgbModalModule,
    UsuarioRoutingModule
  ]
})
export class UsuarioModule {}
