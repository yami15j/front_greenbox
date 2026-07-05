// Manejador de errores global para depurar en producción
window.addEventListener('error', (event) => {
  const errDiv = document.createElement('div');
  errDiv.style.position = 'fixed';
  errDiv.style.top = '0';
  errDiv.style.left = '0';
  errDiv.style.width = '100%';
  errDiv.style.background = '#ffdddd';
  errDiv.style.color = '#ff0000';
  errDiv.style.padding = '15px';
  errDiv.style.zIndex = '99999';
  errDiv.style.border = '2px solid red';
  errDiv.style.fontSize = '12px';
  errDiv.style.fontFamily = 'monospace';
  errDiv.style.whiteSpace = 'pre-wrap';
  errDiv.innerHTML = `<strong>Error de JS detectado:</strong><br>${event.message}<br>en ${event.filename}:${event.lineno}:${event.colno}<br>${event.error?.stack || ''}`;
  document.body.appendChild(errDiv);
});

window.addEventListener('unhandledrejection', (event) => {
  const errDiv = document.createElement('div');
  errDiv.style.position = 'fixed';
  errDiv.style.top = '100px';
  errDiv.style.left = '0';
  errDiv.style.width = '100%';
  errDiv.style.background = '#ffeeee';
  errDiv.style.color = '#990000';
  errDiv.style.padding = '15px';
  errDiv.style.zIndex = '99999';
  errDiv.style.border = '2px solid darkred';
  errDiv.style.fontSize = '12px';
  errDiv.style.fontFamily = 'monospace';
  errDiv.style.whiteSpace = 'pre-wrap';
  errDiv.innerHTML = `<strong>Promesa rechazada no manejada:</strong><br>${event.reason}`;
  document.body.appendChild(errDiv);
});

import { bootstrapApplication } from '@angular/platform-browser';
import { RouteReuseStrategy, provideRouter, withPreloading, PreloadAllModules } from '@angular/router';
import { IonicRouteStrategy, provideIonicAngular } from '@ionic/angular/standalone';
import { importProvidersFrom } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';


import { routes } from './app/app.routes';
import { AppComponent } from './app/app.component';

bootstrapApplication(AppComponent, {
  providers: [
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy },
    provideIonicAngular(),
    provideRouter(routes, withPreloading(PreloadAllModules)),
    importProvidersFrom(HttpClientModule),
    
  ],
});
