import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule, MenuController } from '@ionic/angular';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule]
})
export class AppComponent implements OnInit {

  hamburgerActive = false;
  showHamburger = false;
  notificationCount = 3; // Número de notificaciones sin leer

  // Rutas donde NO debe mostrarse el menú hamburguesa
  private hideMenuRoutes = ['/splash', '/login'];

  constructor(
    private menu: MenuController,
    private router: Router
  ) {
    // Escuchar cambios de ruta para mostrar/ocultar hamburguesa
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: any) => {
      this.showHamburger = !this.hideMenuRoutes.includes(event.url);
    });
  }

  ngOnInit() {
    this.checkNotifications();
  }

  /** Toggle del menú hamburguesa */
  toggleHamburger() {
    this.hamburgerActive = !this.hamburgerActive;
    this.menu.toggle('main-menu');
  }

  /** Cerrar menú */
  closeMenu() {
    this.hamburgerActive = false;
    this.menu.close('main-menu');
  }

  /** Navegación con cierre de menú */
  goHome() { 
    this.router.navigate(['/home']); 
    this.closeMenu(); 
  }

  goHistory() { 
    this.router.navigate(['/history']); 
    this.closeMenu(); 
  }

  goGuide() { 
    this.router.navigate(['/guide']); 
    this.closeMenu(); 
  }

  goPlants() { 
    this.router.navigate(['/plant']); 
    this.closeMenu(); 
  }

  goNotification() { 
    this.router.navigate(['/notification']); 
    this.closeMenu(); 
  }

  goSettings() {
    // TODO: Crear página de configuración
    this.closeMenu();
    console.log('Configuración - Próximamente');
  }

  goHelp() {
    // Abrir correo de soporte
    window.open('mailto:soporte@greenbox.com', '_system');
    this.closeMenu();
  }

  /** Verificar notificaciones pendientes */
  private checkNotifications() {
    // TODO: Obtener el conteo real de notificaciones desde el servicio
    // Por ahora es un valor de ejemplo
    const notifications = localStorage.getItem('unreadNotifications');
    if (notifications) {
      this.notificationCount = parseInt(notifications, 10);
    }
  }
}