// src/app/pages/dashboards/ramo/ramo-routing.module.ts
import { NgModule }     from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ListaRamoComponent }  from './lista-ramo/lista-ramo.component';
import { CadastroRamoComponent }   from './cadastro-ramo/cadastro-ramo.component';

const routes: Routes = [
  { path: '', component: ListaRamoComponent },
  { path: 'cadastro', component: CadastroRamoComponent },
  { path: ':id/editar', component: CadastroRamoComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class RamoRoutingModule {}
