// src/app/pages/dashboards/cliente/cliente-routing.module.ts

import { NgModule }             from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { ListaClienteComponent }    from './lista-cliente/lista-cliente.component';
import { CadastroClienteComponent } from './cadastro-cliente/cadastro-cliente.component';

const routes: Routes = [
  { path: '',          component: ListaClienteComponent },
  { path: 'cadastro',  component: CadastroClienteComponent },
  { path: ':id/editar', component: CadastroClienteComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ClienteRoutingModule {}
