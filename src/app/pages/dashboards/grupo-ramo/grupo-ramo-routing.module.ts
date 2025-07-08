// src/app/pages/dashboards/grupo-ramo/grupo-ramo-routing.module.ts
import { NgModule }                     from '@angular/core';
import { RouterModule, Routes }         from '@angular/router';
import { ListaGrupoRamoComponent }      from './lista-grupo-ramo/lista-grupo-ramo.component';
import { CadastroGrupoRamoComponent }   from './cadastro-grupo-ramo/cadastro-grupo-ramo.component';

const routes: Routes = [
  { path: '',          component: ListaGrupoRamoComponent },
  { path: 'cadastro',  component: CadastroGrupoRamoComponent },
  { path: ':id/editar', component: CadastroGrupoRamoComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class GrupoRamoRoutingModule {}
