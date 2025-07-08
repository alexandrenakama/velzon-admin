// This file can be replaced during build by using the `fileReplacements` array.
// `ng build` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

export const environment = {
  production: false,

  // controla se o service deve usar apenas fake em memória
  defaultauth: 'fakebackend',

  // quando defaultauth==='realbackend', aponta para sua API local de dev
  apiBaseUrl: 'http://localhost:3000/api',

  firebaseConfig: {
    apiKey: '',
    authDomain: '',
    databaseURL: '',
    projectId: '',
    storageBucket: '',
    messagingSenderId: '',
    appId: '',
    measurementId: ''
  }
};

/*
 * Por padrão deixamos habilitado o fakebackend para
 * prototipação sem servidor real.
 *
 * Para debugging de zone.js, descomente a linha abaixo:
 */
// import 'zone.js/plugins/zone-error';
