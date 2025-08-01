// src/app/pages/dashboards/dashboards.module.ts
import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule }                    from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgbToastModule }                  from '@ng-bootstrap/ng-bootstrap';
import { NgbModalModule, NgbPaginationModule } from '@ng-bootstrap/ng-bootstrap';

import { SharedModule }            from '../../shared/shared.module';
import { DashboardsRoutingModule } from './dashboards-routing.module';

// feature-modules:
import { SeguradoraModule }        from './seguradora/seguradora.module';
import { ClienteModule }           from './cliente/cliente.module';
import { RamoModule }              from './ramo/ramo.module';
import { GrupoRamoModule }         from './grupo-ramo/grupo-ramo.module';

import { AssessoriaModule }        from './assessoria/assessoria.module';
import { FilialModule }            from './filial/filial.module';
import { GrupoUsuarioModule }      from './grupo-usuario/grupo-usuario.module';
import { UsuarioModule }           from './usuario/usuario.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    NgbToastModule,
    NgbModalModule,
    SharedModule,
    NgbPaginationModule,

    SeguradoraModule,
    ClienteModule,
    RamoModule,
    GrupoRamoModule,

    AssessoriaModule,
    FilialModule,
    GrupoUsuarioModule,
    UsuarioModule,

    DashboardsRoutingModule
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class DashboardsModule {}
