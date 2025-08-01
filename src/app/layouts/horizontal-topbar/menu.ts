import { MenuItem } from './menu.model';

export const MENU: MenuItem[] = [
  // separador de título
  {
    id: 1,
    label: 'MENUITEMS.MENU.TEXT',
    isTitle: true
  },
  // Cadastros
  {
    id: 2,
    label: 'MENUITEMS.CADASTROS.TEXT',
    icon: 'ri-dashboard-2-line',
    subItems: [
      {
        id: 11,
        label: 'MENUITEMS.CADASTROS.LIST.SEGURADORA',
        link: '/seguradora',
        parentId: 2
      },
      {
        id: 4,
        label: 'MENUITEMS.CADASTROS.LIST.GRUPO_RAMO',
        link: '/grupo-ramo',
        parentId: 2
      },
      {
        id: 3,
        label: 'MENUITEMS.CADASTROS.LIST.RAMO',
        link: '/ramo',
        parentId: 2
      },
      {
        id: 12,
        label: 'MENUITEMS.CADASTROS.LIST.PRODUTO',
        link: '/produto',
        parentId: 2
      },
      {
        id: 13,
        label: 'MENUITEMS.CADASTROS.LIST.CLIENTE',
        link: '/cliente',
        parentId: 2
      },
      {
        id: 14,
        label: 'MENUITEMS.CADASTROS.LIST.ASSESSORIA',
        link: '/assessoria',
        parentId: 2
      },
      {
        id: 15,
        label: 'MENUITEMS.CADASTROS.LIST.FILIAL',
        link: '/filial',
        parentId: 2
      },
      {
        id: 16,
        label: 'MENUITEMS.CADASTROS.LIST.GRUPO_USUARIO',
        link: '/grupo-usuario',
        parentId: 2
      },
      {
        id: 17,
        label: 'MENUITEMS.CADASTROS.LIST.USUARIO',
        link: '/usuario',
        parentId: 2
      }
    ]
  },
  // Apps
  {
    id: 5,
    label: 'MENUITEMS.APPS.TEXT',
    icon: 'ri-apps-2-line',
    link: '/apps'
  },
  // Authentication
  {
    id: 6,
    label: 'MENUITEMS.AUTHENTICATION.TEXT',
    icon: 'ri-lock-2-line',
    link: '/authentication'
  },
  // Pages
  {
    id: 7,
    label: 'MENUITEMS.PAGES.TEXT',
    icon: 'ri-pages-line',
    link: '/pages'
  },
  // Landing
  {
    id: 8,
    label: 'MENUITEMS.LANDING.TEXT',
    icon: 'ri-rocket-line',
    link: '/landing'
  },
  // Base UI
  {
    id: 9,
    label: 'MENUITEMS.BASEUI.TEXT',
    icon: 'ri-layout-3-line',
    link: '/base-ui'
  },
  // Mais (More)
  {
    id: 10,
    label: 'MENUITEMS.MORE.TEXT',
    icon: 'ri-briefcase-2-line',
    link: '/more'
  }
];
