// src/app/pages/dashboards/grupo-ramo/grupo-ramo.module.ts
import { NgModule }                 from '@angular/core';
import { CommonModule }             from '@angular/common';
import { ReactiveFormsModule }      from '@angular/forms';
import { GrupoRamoRoutingModule }   from './grupo-ramo-routing.module';
import { ListaGrupoRamoComponent }  from './lista-grupo-ramo/lista-grupo-ramo.component';
import { CadastroGrupoRamoComponent } from './cadastro-grupo-ramo/cadastro-grupo-ramo.component';
import { NgbPaginationModule }      from '@ng-bootstrap/ng-bootstrap';

@NgModule({
  declarations: [
    ListaGrupoRamoComponent,
    CadastroGrupoRamoComponent
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    GrupoRamoRoutingModule,
    NgbPaginationModule
  ]
})
export class GrupoRamoModule {}
