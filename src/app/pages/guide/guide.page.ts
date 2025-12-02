import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule, NavController } from '@ionic/angular';
import { Router } from '@angular/router';

@Component({
  selector: 'app-guide',
  templateUrl: './guide.page.html',
  styleUrls: ['./guide.page.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule]
})
export class GuidePage implements OnInit {

  constructor(
    private navCtrl: NavController,
    private router: Router
  ) {}

  ngOnInit() {
    console.log('Guía de uso cargada');
  }

  // Navegar hacia atrás
  goBack() {
    this.navCtrl.back();
  }

  // Ir al inicio
  goHome() {
    this.navCtrl.navigateBack('/home');
  }

  // Scroll suave a una sección específica
  scrollToSection(sectionId: string) {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ 
        behavior: 'smooth', 
        block: 'start' 
      });
    }
  }

  // Pull to refresh
  refreshData(event: any) {
    setTimeout(() => {
      console.log('Datos de guía actualizados');
      event.target.complete();
    }, 1000);
  }

  // Abrir enlace de soporte (opcional)
  openSupport() {
    // Aquí podrías abrir un email o un chat de soporte
    window.open('mailto:soporte@greenbox.com', '_system');
  }
}