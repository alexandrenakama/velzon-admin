// src/app/pages/dashboards/ramo/ramo.module.ts

import { NgModule }             from '@angular/core';
import { CommonModule }         from '@angular/common';
import { ReactiveFormsModule }  from '@angular/forms';
import { RamoRoutingModule }    from './ramo-routing.module';
import { ListaRamoComponent }   from './lista-ramo/lista-ramo.component';
import { CadastroRamoComponent }    from './cadastro-ramo/cadastro-ramo.component';

// ng-bootstrap pagination
import { NgbPaginationModule }  from '@ng-bootstrap/ng-bootstrap';

@NgModule({
  declarations: [
    ListaRamoComponent,
    CadastroRamoComponent
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RamoRoutingModule,
    NgbPaginationModule  
  ]
})
export class RamoModule {}
