import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule, NavController } from '@ionic/angular';
import { Router } from '@angular/router';
import { addIcons } from 'ionicons';
import {
  notificationsOutline,
  homeOutline,
  statsChartOutline,
  leafOutline,
  chevronForwardOutline,
  sparklesOutline,
  gridOutline
} from 'ionicons/icons';

@Component({
  selector: 'app-select',
  templateUrl: './select.page.html',
  styleUrls: ['./select.page.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule, FormsModule]
})
export class SelectPage implements OnInit {
  userName = 'Zaida Jumbo';
  profileImage: string | null = null;
  unreadCount = 0;

  constructor(
    private navCtrl: NavController,
    private router: Router
  ) {
    addIcons({
      notificationsOutline,
      homeOutline,
      statsChartOutline,
      leafOutline,
      chevronForwardOutline,
      sparklesOutline,
      gridOutline
    });
  }

  ngOnInit() {
    this.loadLocalData();
  }

  ionViewWillEnter() {
    this.loadLocalData();
  }

  private loadLocalData() {
    const savedName = localStorage.getItem('userName');
    if (savedName) {
      this.userName = this.getUserDisplayName(savedName);
    }
    this.profileImage = localStorage.getItem('profileImage') || null;
  }

  private getUserDisplayName(fullName: string): string {
    if (!fullName) return 'Usuario';
    const parts = fullName.trim().split(/\s+/);
    if (parts.length >= 2) {
      return `${parts[0]} ${parts[1]}`;
    }
    return parts[0];
  }

  selectCategory(category: string) {
    console.log('Categoría seleccionada:', category);
    // Navegar a la pantalla de selección de plantas con el filtro correspondiente
    // Guardamos en localStorage para que la vista de plantas filtre automáticamente
    localStorage.setItem('selectedCategoryFilter', category);
    this.router.navigate(['/select-plant']);
  }

  goHelp() {
    console.log('Clic en botón Ayudarme');
    // Navegar a guía o asistente
    this.router.navigate(['/guide']);
  }

  goNotifications() {
    this.router.navigate(['/notification']);
  }

  goProfile() {
    this.router.navigate(['/perfil']);
  }

  // Métodos de navegación del Tab Bar Inferior
  goHome() {
    this.router.navigate(['/home']);
  }

  goStats() {
    this.router.navigate(['/weekly']);
  }

  goMyPlant() {
    // Al estar en "Plantas", si hace clic en el tab activo, hace scroll al inicio o se queda
    document.querySelector('ion-content')?.scrollToTop(300);
  }
}
