// src/app/shared/shared.module.ts

import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule }                   from '@angular/common';
import { ReactiveFormsModule }            from '@angular/forms';
import {
  NgbNavModule,
  NgbAccordionModule,
  NgbDropdownModule,
  NgbToastModule,
  NgbModalModule,
  NgbPaginationModule
} from '@ng-bootstrap/ng-bootstrap';

import { SlickCarouselModule }            from 'ngx-slick-carousel';
import { CountUpModule }                  from 'ngx-countup';

import { BreadcrumbsComponent }           from './breadcrumbs/breadcrumbs.component';
import { ClientLogoComponent }            from './landing/index/client-logo/client-logo.component';
import { ServicesComponent }              from './landing/index/services/services.component';
import { CollectionComponent }            from './landing/index/collection/collection.component';
import { CtaComponent }                   from './landing/index/cta/cta.component';
import { DesignedComponent }              from './landing/index/designed/designed.component';
import { PlanComponent }                  from './landing/index/plan/plan.component';
import { FaqsComponent }                  from './landing/index/faqs/faqs.component';
import { ReviewComponent }                from './landing/index/review/review.component';
import { CounterComponent }               from './landing/index/counter/counter.component';
import { WorkProcessComponent }           from './landing/index/work-process/work-process.component';
import { TeamComponent }                  from './landing/index/team/team.component';
import { ContactComponent }               from './landing/index/contact/contact.component';
import { FooterComponent }                from './landing/index/footer/footer.component';

import { MarketPlaceComponent }           from './landing/nft/market-place/market-place.component';
import { WalletComponent }                from './landing/nft/wallet/wallet.component';
import { FeaturesComponent }              from './landing/nft/features/features.component';
import { CategoriesComponent }            from './landing/nft/categories/categories.component';
import { DiscoverComponent }              from './landing/nft/discover/discover.component';
import { TopCreatorComponent }            from './landing/nft/top-creator/top-creator.component';

import { ProcessComponent }               from './landing/job/process/process.component';
import { FindjobsComponent }              from './landing/job/findjobs/findjobs.component';
import { CandidatesComponent }            from './landing/job/candidates/candidates.component';
import { BlogComponent }                  from './landing/job/blog/blog.component';
import { JobcategoriesComponent }         from './landing/job/jobcategories/jobcategories.component';
import { JobFooterComponent }             from './landing/job/job-footer/job-footer.component';

import { ToastsContainer }                from './toasts/toasts-container.component';

import { ScrollspyDirective }             from './scrollspy.directive';
import { LandingScrollspyDirective }      from './landingscrollspy.directive';

import { ConfirmModalComponent }          from './confirm-modal/confirm-modal.component';
import { MascaraDirective }               from './mascara/mascara.directive';

import { ListaBaseComponent }             from './lista-base/lista-base.component';

const SHARED_DECLARATIONS = [
  BreadcrumbsComponent,
  ClientLogoComponent,
  ServicesComponent,
  CollectionComponent,
  CtaComponent,
  DesignedComponent,
  PlanComponent,
  FaqsComponent,
  ReviewComponent,
  CounterComponent,
  WorkProcessComponent,
  TeamComponent,
  ContactComponent,
  FooterComponent,

  MarketPlaceComponent,
  WalletComponent,
  FeaturesComponent,
  CategoriesComponent,
  DiscoverComponent,
  TopCreatorComponent,

  ProcessComponent,
  FindjobsComponent,
  CandidatesComponent,
  BlogComponent,
  JobcategoriesComponent,
  JobFooterComponent,

  ToastsContainer,

  ScrollspyDirective,
  LandingScrollspyDirective,

  ConfirmModalComponent,
  MascaraDirective,

  ListaBaseComponent,
];

@NgModule({
  declarations: [
    ...SHARED_DECLARATIONS
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    NgbNavModule,
    NgbAccordionModule,
    NgbDropdownModule,
    NgbToastModule,
    NgbModalModule,
    NgbPaginationModule,
    SlickCarouselModule,
    CountUpModule
  ],
  exports: [
    ...SHARED_DECLARATIONS,
    ReactiveFormsModule,
    NgbPaginationModule
  ],
  schemas: [
    CUSTOM_ELEMENTS_SCHEMA
  ]
})
export class SharedModule {}
