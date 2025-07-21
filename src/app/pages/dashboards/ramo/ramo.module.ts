// src/app/pages/dashboards/ramo/ramo.module.ts
import { NgModule }             from '@angular/core';
import { CommonModule }         from '@angular/common';
import { ReactiveFormsModule }  from '@angular/forms';
import { NgbTypeaheadModule }   from '@ng-bootstrap/ng-bootstrap';
import { RamoRoutingModule }    from './ramo-routing.module';
import { SharedModule }         from 'src/app/shared/shared.module';
import { ListaRamoComponent }    from './lista-ramo/lista-ramo.component';
import { CadastroRamoComponent } from './cadastro-ramo/cadastro-ramo.component';

@NgModule({
  declarations: [
    ListaRamoComponent,
    CadastroRamoComponent
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    NgbTypeaheadModule,
    SharedModule,
    RamoRoutingModule
  ]
})
export class RamoModule {}
