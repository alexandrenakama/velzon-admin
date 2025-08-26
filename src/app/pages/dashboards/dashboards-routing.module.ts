import { NgModule } from '@angular/core';
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
  },
  {
    path: 'assessoria',
    loadChildren: () =>
      import('./assessoria/assessoria.module').then(m => m.AssessoriaModule)
  },
  {
    path: 'filial',
    loadChildren: () =>
      import('./filial/filial.module').then(m => m.FilialModule)
  },
  {
    path: 'grupo-usuario',
    loadChildren: () =>
      import('./grupo-usuario/grupo-usuario.module').then(m => m.GrupoUsuarioModule)
  },
  {
    path: 'usuario',
    loadChildren: () =>
      import('./usuario/usuario.module').then(m => m.UsuarioModule)
  },
  {
    path: 'corretor',
    loadChildren: () =>
      import('./corretor/corretor.module').then(m => m.CorretorModule)
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class DashboardsRoutingModule {}
