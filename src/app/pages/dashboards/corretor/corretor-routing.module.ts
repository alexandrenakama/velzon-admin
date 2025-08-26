// src/app/pages/dashboards/corretor/corretor-routing.module.ts

import { NgModule }             from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { ListaCorretorComponent }    from './lista-corretor/lista-corretor.component';
import { CadastroCorretorComponent } from './cadastro-corretor/cadastro-corretor.component';

const routes: Routes = [
  { path: '',           component: ListaCorretorComponent },
  { path: 'cadastro',   component: CadastroCorretorComponent },
  { path: ':id/editar', component: CadastroCorretorComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class CorretorRoutingModule {}
