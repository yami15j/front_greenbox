// This file can be replaced during build by using the `fileReplacements` array.
// `ng build` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

// Este archivo se usa cuando ejecutas: ionic serve o ng serve
export const environment = {
  production: false,
  apiUrl: 'https://greenbox01-production.up.railway.app',  // ← Railway backend
  allowOfflineLogin: false,  // Desactivado para consumir datos reales del backend
  firebase: {
    apiKey: "AIzaSyCGA2vn1DZan29mH6Lz_XpmHPrUCRVhlrk",
    authDomain: "greenbox1.firebaseapp.com",
    projectId: "greenbox1",
    storageBucket: "greenbox1.firebasestorage.app",
    messagingSenderId: "502680482164",
    appId: "1:502680482164:web:f36f5e6497458efdcefc21"
  }
};
/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
// import 'zone.js/plugins/zone-error';  // Included with Angular CLI.

