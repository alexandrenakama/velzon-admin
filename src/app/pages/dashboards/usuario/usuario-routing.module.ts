// src/app/pages/dashboards/usuario/usuario-routing.module.ts

import { NgModule }             from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { ListaUsuarioComponent }    from './lista-usuario/lista-usuario.component';
import { CadastroUsuarioComponent } from './cadastro-usuario/cadastro-usuario.component';

const routes: Routes = [
  { path: '',           component: ListaUsuarioComponent },
  { path: 'cadastro',   component: CadastroUsuarioComponent },
  { path: ':id/editar', component: CadastroUsuarioComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class UsuarioRoutingModule {}
