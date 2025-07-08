import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-layout',
  templateUrl: './layout.component.html',
  styleUrls: ['./layout.component.scss']
})
export class LayoutComponent implements OnInit {

  ngOnInit(): void {
    // Força sempre o layout horizontal
    document.documentElement.setAttribute('data-layout', 'horizontal');
    // Tema claro (light) — ajuste para 'dark' se precisar
    document.documentElement.setAttribute('data-bs-theme', 'light');
    // Largura fluida
    document.documentElement.setAttribute('data-layout-width', 'fluid');
    // Posição fixa
    document.documentElement.setAttribute('data-layout-position', 'fixed');
    // Topbar claro
    document.documentElement.setAttribute('data-topbar', 'light');

    // Remove qualquer sidebar (não queremos mais menu lateral)
    document.documentElement.removeAttribute('data-sidebar');
    document.documentElement.removeAttribute('data-sidebar-size');
    document.documentElement.removeAttribute('data-sidebar-image');
    document.documentElement.removeAttribute('data-layout-style');
    document.documentElement.removeAttribute('data-sidebar-visibility');

    // Se você não usar preloader, pode remover também
    document.documentElement.removeAttribute('data-preloader');
  }

}
