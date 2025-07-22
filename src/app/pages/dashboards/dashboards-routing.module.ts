// src/app/pages/dashboards/dashboards-routing.module.ts
import { NgModule }             from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  {
    path: 'seguradora',
    loadChildren: () =>
      import('./seguradora/seguradora.module').then(m => m.SeguradoraModule)
  },
  {
    path: 'cliente',
    loadChildren: () =>
      import('./cliente/cliente.module').then(m => m.ClienteModule)
  },
  {
    path: 'ramo',
    loadChildren: () =>
      import('./ramo/ramo.module').then(m => m.RamoModule)
  },
  {
    path: 'grupo-ramo',
    loadChildren: () =>
      import('./grupo-ramo/grupo-ramo.module').then(m => m.GrupoRamoModule)
  },
  {
    path: 'produto',
    loadChildren: () =>
      import('./produto/produto.module').then(m => m.ProdutoModule)
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class DashboardsRoutingModule {}
