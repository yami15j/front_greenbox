import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule, NavController } from '@ionic/angular';
import { Router } from '@angular/router';

interface SensorData {
  temp: number;
  hum: number;
  light: number;
  water: number;
  timestamp?: string;
}

@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule]
})
export class HomePage implements OnInit, OnDestroy {
  data: SensorData = {
    temp: 26.5,
    hum: 60,
    light: 80,
    water: 75
  };

  isLoading = false;
  isOnline = true;

  constructor(
    private router: Router,
    private navCtrl: NavController
  ) {}

  ngOnInit() {
    this.loadData();
    // Si tienes backend, descomenta y configura:
    // this.initializeBackend();
  }

  // Cargar datos (puede ser desde backend o datos de ejemplo)
  async loadData() {
    try {
      this.isLoading = true;
      
      // OPCIÓN 1: Si tienes ApiService configurado
      // const latest = await this.api.getLatest();
      // this.data = latest;
      
      // OPCIÓN 2: Datos de ejemplo (mientras configuras el backend)
      this.data = {
        temp: 26.5,
        hum: 60,
        light: 80,
        water: 75
      };

      this.isLoading = false;
    } catch (err) {
      console.error('Error cargando datos:', err);
      this.isLoading = false;
    }
  }

  // Si tienes backend con WebSocket
  /*
  private initializeBackend() {
    // Importar ApiService y SocketService
    this.socket.connect('ws:https://github.com/daniu006/restaurant-');
    this.socketSub = this.socket.getData().subscribe(update => {
      this.data = {
        temp: this.parseNumber(update.temp),
        hum: this.parseNumber(update.hum),
        light: this.parseNumber(update.light),
        water: this.parseNumber(update.water)
      };
      this.isOnline = true;
    });
  }

  private parseNumber(value: any): number {
    if (typeof value === 'number') return value;
    const parsed = parseFloat(value);
    return isNaN(parsed) ? 0 : parsed;
  }
  */

  getSensorStatus(sensor: 'temp' | 'hum' | 'light' | 'water'): string {
    const value = this.data[sensor];
    
    switch (sensor) {
      case 'temp':
        if (value >= 20 && value <= 30) return 'status-optimal';
        if (value >= 15 && value <= 35) return 'status-good';
        return 'status-warning';
      
      case 'hum':
        if (value >= 50 && value <= 70) return 'status-optimal';
        if (value >= 40 && value <= 80) return 'status-good';
        return 'status-warning';
      
      case 'light':
        if (value >= 60 && value <= 90) return 'status-optimal';
        if (value >= 40) return 'status-good';
        return 'status-warning';
      
      case 'water':
        if (value >= 60) return 'status-sufficient';
        if (value >= 30) return 'status-warning';
        return 'status-critical';
      
      default:
        return 'status-good';
    }
  }

  getSensorStatusText(sensor: 'temp' | 'hum' | 'light' | 'water'): string {
    const status = this.getSensorStatus(sensor);
    
    switch (status) {
      case 'status-optimal':
        return '● Óptimo';
      case 'status-good':
        return '● Bueno';
      case 'status-sufficient':
        return '● Suficiente';
      case 'status-warning':
        return '● Advertencia';
      case 'status-critical':
        return '● Crítico';
      default:
        return '● Normal';
    }
  }

  // Navegar al Historial Semanal
  goHistory() {
    this.navCtrl.navigateForward('/weekly');
  }

  // Ya estamos en home
  goHome() {
    const content = document.querySelector('ion-content');
    content?.scrollToTop(300);
  }

  // Refrescar datos (Pull to refresh)
  async refreshData(event?: any) {
    try {
      await this.loadData();
    } finally {
      event?.target?.complete();
    }
  }

  ngOnDestroy() {
    // Si usas WebSocket, desconectar aquí
    // this.socketSub?.unsubscribe();
    // this.socket.disconnect();
  }
}