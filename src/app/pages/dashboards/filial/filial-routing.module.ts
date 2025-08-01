// src/app/pages/dashboards/filial/filial-routing.module.ts

import { NgModule }             from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { ListaFilialComponent }    from './lista-filial/lista-filial.component';
import { CadastroFilialComponent } from './cadastro-filial/cadastro-filial.component';

const routes: Routes = [
  { path: '',           component: ListaFilialComponent },
  { path: 'cadastro',   component: CadastroFilialComponent },
  { path: ':id/editar', component: CadastroFilialComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class FilialRoutingModule {}
