// src/app/pages/dashboards/grupo-usuario/grupo-usuario.module.ts

import { NgModule }                 from '@angular/core';
import { CommonModule }             from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms'; 
import { NgbPaginationModule }      from '@ng-bootstrap/ng-bootstrap';
import { NgbModalModule }           from '@ng-bootstrap/ng-bootstrap';
import { SharedModule }             from '../../../shared/shared.module';

import { ListaGrupoUsuarioComponent }    from './lista-grupo-usuario/lista-grupo-usuario.component';
import { CadastroGrupoUsuarioComponent } from './cadastro-grupo-usuario/cadastro-grupo-usuario.component';
import { GrupoUsuarioRoutingModule }     from './grupo-usuario-routing.module';

@NgModule({
  declarations: [
    ListaGrupoUsuarioComponent,
    CadastroGrupoUsuarioComponent
  ],
  imports: [
    CommonModule,
    FormsModule,  
    ReactiveFormsModule,
    SharedModule,
    NgbPaginationModule,
    NgbModalModule,
    GrupoUsuarioRoutingModule
  ]
})
export class GrupoUsuarioModule {}
