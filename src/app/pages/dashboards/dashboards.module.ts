// src/app/pages/dashboards/dashboards.module.ts
import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule }                    from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgbToastModule }                  from '@ng-bootstrap/ng-bootstrap';
import { NgbModalModule, NgbPaginationModule } from '@ng-bootstrap/ng-bootstrap';


import { SharedModule }            from '../../shared/shared.module';
import { DashboardsRoutingModule } from './dashboards-routing.module';

// **Importe o feature-module de ramo**:
import { RamoModule }              from './ramo/ramo.module';

@NgModule({
  // não declare ListaRamoComponent / NovoRamoComponent aqui!
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    NgbToastModule,
    NgbModalModule,
    SharedModule,
    NgbPaginationModule,
    RamoModule,            // ← aqui
    DashboardsRoutingModule
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class DashboardsModule { }
