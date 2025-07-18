// src/app/app.module.ts

import { NgModule }                                from '@angular/core';
import { BrowserModule }                           from '@angular/platform-browser';
import { BrowserAnimationsModule }                 from '@angular/platform-browser/animations';
import { HttpClient, HTTP_INTERCEPTORS }           from '@angular/common/http';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';

import { AppRoutingModule }                        from './app-routing.module';
import { AppComponent }                            from './app.component';

import { LayoutsModule }                           from './layouts/layouts.module';
import { PagesModule }                             from './pages/pages.module';
import { SharedModule }                            from './shared/shared.module'; // <-- import do SharedModule

// Pipes
import { NgPipesModule }                           from 'ngx-pipes';

// Auth & Interceptors
import { environment }                             from '../environments/environment';
import { initFirebaseBackend }                     from './authUtils';
import { FakeBackendInterceptor }                  from './core/helpers/fake-backend';
import { ErrorInterceptor }                        from './core/helpers/error.interceptor';
import { JwtInterceptor }                          from './core/helpers/jwt.interceptor';

// i18n
import { TranslateModule, TranslateLoader }        from '@ngx-translate/core';
import { TranslateHttpLoader }                     from '@ngx-translate/http-loader';

// NgRx
import { StoreModule }                             from '@ngrx/store';
import { StoreDevtoolsModule }                     from '@ngrx/store-devtools';
import { EffectsModule }                           from '@ngrx/effects';
import { rootReducer }                             from './store';
import { AuthenticationEffects }                   from './store/Authentication/authentication.effects';
import { EcommerceEffects }                        from './store/Ecommerce/ecommerce_effect';
import { ProjectEffects }                          from './store/Project/project_effect';
import { TaskEffects }                             from './store/Task/task_effect';
import { CRMEffects }                              from './store/CRM/crm_effect';
import { CryptoEffects }                           from './store/Crypto/crypto_effect';
import { InvoiceEffects }                          from './store/Invoice/invoice_effect';
import { TicketEffects }                           from './store/Ticket/ticket_effect';
import { FileManagerEffects }                      from './store/File Manager/filemanager_effect';
import { TodoEffects }                             from './store/Todo/todo_effect';
import { ApplicationEffects }                      from './store/Jobs/jobs_effect';
import { ApikeyEffects }                           from './store/APIKey/apikey_effect';

export function createTranslateLoader(http: HttpClient): any {
  return new TranslateHttpLoader(http, 'assets/i18n/', '.json');
}

// Inicializa o fake-backend ou Firebase
if (environment.defaultauth === 'firebase') {
  initFirebaseBackend(environment.firebaseConfig);
}

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,

    // Internacionalização
    TranslateModule.forRoot({
      defaultLanguage: 'en',
      loader: {
        provide: TranslateLoader,
        useFactory: createTranslateLoader,
        deps: [HttpClient]
      }
    }),

    // Router e layout
    AppRoutingModule,
    LayoutsModule,
    PagesModule,

    // Shared (inclui ToastsContainer e NgbToastModule)
    SharedModule,

    // Pipes
    NgPipesModule,

    // Store + Effects
    StoreModule.forRoot(rootReducer),
    StoreDevtoolsModule.instrument({
      maxAge: 25,
      logOnly: environment.production
    }),
    EffectsModule.forRoot([
      AuthenticationEffects,
      EcommerceEffects,
      ProjectEffects,
      TaskEffects,
      CRMEffects,
      CryptoEffects,
      InvoiceEffects,
      TicketEffects,
      FileManagerEffects,
      TodoEffects,
      ApplicationEffects,
      ApikeyEffects
    ])
  ],
  providers: [
    { provide: HTTP_INTERCEPTORS, useClass: JwtInterceptor, multi: true },
    { provide: HTTP_INTERCEPTORS, useClass: ErrorInterceptor, multi: true },
    { provide: HTTP_INTERCEPTORS, useClass: FakeBackendInterceptor, multi: true },
    provideHttpClient(withInterceptorsFromDi())
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
