// src/app/pages/dashboards/dashboards-routing.module.ts
import { NgModule }             from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  {
    path: 'ramo',
    loadChildren: () =>
      import('./ramo/ramo.module').then(m => m.RamoModule)
  },
  {
    path: 'grupo-ramo',
    loadChildren: () =>
      import('./grupo-ramo/grupo-ramo.module').then(m => m.GrupoRamoModule)
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class DashboardsRoutingModule {}
