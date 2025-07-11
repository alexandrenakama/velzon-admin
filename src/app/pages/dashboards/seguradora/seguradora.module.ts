// src/app/pages/dashboards/seguradora/seguradora.module.ts

import { NgModule }                 from '@angular/core';
import { CommonModule }             from '@angular/common';
import { ReactiveFormsModule }      from '@angular/forms';
import { NgbPaginationModule }      from '@ng-bootstrap/ng-bootstrap';
import { SharedModule }             from '../../../shared/shared.module';

import { ListaSeguradoraComponent }   from './lista-seguradora/lista-seguradora.component';
import { CadastroSeguradoraComponent } from './cadastro-seguradora/cadastro-seguradora.component';
import { SeguradoraRoutingModule }     from './seguradora-routing.module';

@NgModule({
  declarations: [
    ListaSeguradoraComponent,
    CadastroSeguradoraComponent
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    SharedModule,        
    NgbPaginationModule,
    SeguradoraRoutingModule
  ]
})
export class SeguradoraModule {}
