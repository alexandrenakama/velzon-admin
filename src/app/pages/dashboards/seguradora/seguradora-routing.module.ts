// src/app/pages/dashboards/seguradora/seguradora-routing.module.ts

import { NgModule }             from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { ListaSeguradoraComponent }    from './lista-seguradora/lista-seguradora.component';
import { CadastroSeguradoraComponent } from './cadastro-seguradora/cadastro-seguradora.component';

const routes: Routes = [
  { path: '',       component: ListaSeguradoraComponent },
  { path: 'cadastro',   component: CadastroSeguradoraComponent },
  { path: ':id/editar', component: CadastroSeguradoraComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class SeguradoraRoutingModule {}
