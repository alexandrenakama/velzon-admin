// src/app/pages/pages.module.ts

import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule }                      from '@angular/common';
import { FormsModule }                       from '@angular/forms';

// ng-bootstrap modules
import {
  NgbToastModule,
  NgbProgressbarModule,
  NgbDropdownModule,
  NgbPaginationModule
} from '@ng-bootstrap/ng-bootstrap';

// third-party & shared
import { FlatpickrModule }    from 'angularx-flatpickr';
import { CountUpModule }       from 'ngx-countup';
import { NgApexchartsModule }  from 'ng-apexcharts';
import { LeafletModule }       from '@asymmetrik/ngx-leaflet';
import { SimplebarAngularModule } from 'simplebar-angular';
import { SlickCarouselModule } from 'ngx-slick-carousel';
import { LightboxModule }      from 'ngx-lightbox';

import { defineElement } from "@lordicon/element";
import lottie from 'lottie-web';

import { PagesRoutingModule } from './pages-routing.module';
import { SharedModule }       from '../shared/shared.module';
import { WidgetModule }       from '../shared/widget/widget.module';

import { DashboardComponent } from './dashboards/dashboard/dashboard.component';
import { DashboardsModule }   from './dashboards/dashboards.module';

@NgModule({
  declarations: [
    DashboardComponent,
  ],
  imports: [
    CommonModule,
    FormsModule,

    // ng-bootstrap
    NgbToastModule,
    NgbProgressbarModule,
    NgbDropdownModule,
    NgbPaginationModule,  // ← habilita <ngb-pagination>

    // outras libs
    FlatpickrModule.forRoot(),
    CountUpModule,
    NgApexchartsModule,
    LeafletModule,
    SimplebarAngularModule,
    SlickCarouselModule,
    LightboxModule,

    // rotas e módulos da aplicação
    PagesRoutingModule,
    SharedModule,
    WidgetModule,
    DashboardsModule,
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class PagesModule {
  constructor() {
    // LordIcon
    defineElement(lottie.loadAnimation);
  }
}
