import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule, NavController, MenuController } from '@ionic/angular';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { ApiService, SensorData } from 'src/app/api.service';
import { ActuatorStatus } from 'src/app/models/api.models';
import { environment } from 'src/environments/environment';
import { addIcons } from 'ionicons';
import { thermometerOutline, waterOutline, sunnyOutline, leafOutline, helpCircleOutline } from 'ionicons/icons';

interface ActivePlant {
  id: string;
  name: string;
  type: string;
  icon: string;
  imageUrl: string;
  optimalConditions: {
    tempMin: number;
    tempMax: number;
    humMin: number;
    humMax: number;
    lightMin: number;
    lightMax: number;
    waterMin: number;
  };
}

@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule],
})
export class HomePage implements OnInit {

  isLoading = true;
  activePlant: ActivePlant | null = null;
  data: SensorData = { temp: 0, hum: 0, light: 0, water: 0 };
  actuatorStatus: ActuatorStatus | null = null;
  isOnline = true;
  hamburgerActive = false;
  unreadCount = 0;

  constructor(
    private navCtrl: NavController,
    private router: Router,
    private api: ApiService,
    private menu: MenuController,
    private http: HttpClient
  ) {
    // Registrar icono de ayuda
    addIcons({
      'help-circle-outline': helpCircleOutline
    });
  }

  ngOnInit() {
    this.loadActivePlant();
    this.loadSensorData();
    this.loadActuatorStatus();
    this.loadUnreadCount();
  }

  toggleHamburger() {
    this.hamburgerActive = !this.hamburgerActive;
    this.menu.toggle('main-menu');
  }

  closeMenu() {
    this.menu.close('main-menu');
  }

  loadActivePlant() {
    const plantData = localStorage.getItem('activePlant');
    if (plantData) {
      try {
        this.activePlant = JSON.parse(plantData);
      } catch {
        this.activePlant = null;
      }
    }
  }

  loadSensorData() {
    const sensorData = localStorage.getItem('activePlantData');
    if (sensorData) {
      try {
        this.data = JSON.parse(sensorData);
        this.isLoading = false;
        this.isOnline = true;
      } catch {
        this.isOnline = false;
      }
    } else {
      this.refreshData();
    }
  }

  async loadActuatorStatus() {
    if (!this.activePlant) return;
    try {
      this.actuatorStatus = await this.api.getActuatorStatus(this.activePlant.id);
    } catch (err) {
      console.error('Error cargando estado de actuadores:', err);
      this.actuatorStatus = null;
    }
  }

  async refreshData(event?: any) {
    if (!this.activePlant) return;
    this.isLoading = true;
    try {
      const latestData = await this.api.getLatestByPlant(this.activePlant.id);
      this.data = latestData;
      localStorage.setItem('activePlantData', JSON.stringify(latestData));

      // También actualizar estado de actuadores
      await this.loadActuatorStatus();

      this.isOnline = true;
    } catch {
      this.isOnline = false;
    } finally {
      this.isLoading = false;
      if (event) event.target.complete();
    }
  }

  getPlantHealthStatus(): string {
    if (!this.activePlant) return '';
    const c = this.activePlant.optimalConditions;
    return (
      this.data.temp < c.tempMin || this.data.temp > c.tempMax ||
      this.data.hum < c.humMin || this.data.hum > c.humMax ||
      this.data.light < c.lightMin || this.data.light > c.lightMax ||
      this.data.water < c.waterMin
    ) ? 'bad' : 'good';
  }

  getPlantHealthText(): string {
    return this.getPlantHealthStatus() === 'good' ? 'Saludable' : 'Precaución';
  }

  getSensorStatus(sensor: 'temp' | 'hum' | 'light' | 'water'): string {
    if (!this.activePlant) return '';
    const c = this.activePlant.optimalConditions;
    switch (sensor) {
      case 'temp': return (this.data.temp >= c.tempMin && this.data.temp <= c.tempMax) ? 'good' : 'bad';
      case 'hum': return (this.data.hum >= c.humMin && this.data.hum <= c.humMax) ? 'good' : 'bad';
      case 'light': return (this.data.light >= c.lightMin && this.data.light <= c.lightMax) ? 'good' : 'bad';
      case 'water': return (this.data.water >= c.waterMin) ? 'good' : 'bad';
    }
  }

  getSensorStatusText(sensor: 'temp' | 'hum' | 'light' | 'water'): string {
    return this.getSensorStatus(sensor) === 'good' ? 'Óptimo' : 'Revisar';
  }

  // ✅ NAVEGACIÓN CORREGIDA
  goPlants() {
    this.router.navigate(['/plant']);
    this.closeMenu();
  }

  goNotifications() {
    this.router.navigate(['/notification']);
    this.closeMenu();
  }

  goHistory() {
    this.router.navigate(['/weekly']);
    this.closeMenu();
  }

  goHome() {
    document.querySelector('ion-content')?.scrollToTop(300);
    this.closeMenu();
  }

  goGuide() {
    this.router.navigate(['/guide']);
    this.closeMenu();
  }

  loadUnreadCount() {
    // Obtener boxId desde localStorage
    const boxId = localStorage.getItem('selectedBoxId') || '1';

    this.http.get<any[]>(`${environment.apiUrl}/notifications/${boxId}/active`)
      .subscribe({
        next: (notifications) => {
          this.unreadCount = notifications.length;
        },
        error: (err) => {
          console.error('Error loading unread count:', err);
          this.unreadCount = 0;
        }
      });
  }
}
