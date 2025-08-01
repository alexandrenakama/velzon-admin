// src/app/pages/dashboards/assessoria/assessoria-routing.module.ts

import { NgModule }             from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { ListaAssessoriaComponent }    from './lista-assessoria/lista-assessoria.component';
import { CadastroAssessoriaComponent } from './cadastro-assessoria/cadastro-assessoria.component';

const routes: Routes = [
  { path: '',            component: ListaAssessoriaComponent },
  { path: 'cadastro',    component: CadastroAssessoriaComponent },
  { path: ':id/editar',  component: CadastroAssessoriaComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AssessoriaRoutingModule {}
