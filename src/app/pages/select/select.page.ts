import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonIcon } from '@ionic/angular/standalone';
import { Router } from '@angular/router';
import { addIcons } from 'ionicons';
import {
  notificationsOutline,
  homeOutline,
  statsChartOutline,
  leafOutline,
  chevronForwardOutline,
  sparklesOutline,
  gridOutline,
} from 'ionicons/icons';

@Component({
  selector: 'app-select',
  templateUrl: './select.page.html',
  styleUrls: ['./select.page.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, IonContent, IonIcon],
})
export class SelectPage implements OnInit {
  userName = 'Zaida Jumbo';
  profileImage: string | null = null;
  unreadCount = 0;

  constructor(private router: Router) {
    addIcons({
      notificationsOutline,
      homeOutline,
      statsChartOutline,
      leafOutline,
      chevronForwardOutline,
      sparklesOutline,
      gridOutline,
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

  private blurActiveElement() {
    (document.activeElement as HTMLElement | null)?.blur();
  }

  selectCategory(category: string) {
    this.blurActiveElement();
    localStorage.setItem('selectedCategoryFilter', category);
    this.router.navigate(['/select-plant']);
  }

  goHelp() {
    this.blurActiveElement();
    this.router.navigate(['/guide']);
  }

  goNotifications() {
    this.blurActiveElement();
    this.router.navigate(['/notification']);
  }

  goProfile() {
    this.blurActiveElement();
    this.router.navigate(['/perfil']);
  }

  goHome() {
    this.blurActiveElement();
    this.router.navigate(['/home']);
  }

  goStats() {
    this.blurActiveElement();
    this.router.navigate(['/weekly']);
  }

  goMyPlant() {
    this.blurActiveElement();
    document.querySelector('ion-content')?.scrollToTop(300);
  }
}
