// src/app/pages/dashboards/grupo-usuario/grupo-usuario-routing.module.ts

import { NgModule }             from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { ListaGrupoUsuarioComponent }    from './lista-grupo-usuario/lista-grupo-usuario.component';
import { CadastroGrupoUsuarioComponent } from './cadastro-grupo-usuario/cadastro-grupo-usuario.component';

const routes: Routes = [
  { path: '',            component: ListaGrupoUsuarioComponent },
  { path: 'cadastro',    component: CadastroGrupoUsuarioComponent },
  { path: ':id/editar',  component: CadastroGrupoUsuarioComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class GrupoUsuarioRoutingModule {}
