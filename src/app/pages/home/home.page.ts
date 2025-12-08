import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule, NavController } from '@ionic/angular';
import { Router } from '@angular/router';
import { ApiService, SensorData } from 'src/app/api.service';

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
  imports: [CommonModule, IonicModule]
})
export class HomePage implements OnInit {

  activePlant: ActivePlant | null = null;
  data: SensorData = { temp: 0, hum: 0, light: 0, water: 0 };
  isLoading = true;
  isOnline = true;

  constructor(
    private router: Router,
    private navCtrl: NavController,
    private api: ApiService
  ) {}

  ngOnInit() {
    this.loadActivePlant();
    this.loadSensorData();
  }

  /** Cargar planta activa desde localStorage */
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

  /** Cargar datos de sensores desde localStorage */
  loadSensorData() {
    const sensorData = localStorage.getItem('activePlantData');
    if (sensorData) {
      try {
        this.data = JSON.parse(sensorData);
        this.isLoading = false;
        this.isOnline = true;
      } catch {
        this.data = { temp: 0, hum: 0, light: 0, water: 0 };
        this.isOnline = false;
      }
    } else {
      this.refreshData();
    }
  }

  /** Pull-to-refresh o actualización manual */
  async refreshData(event?: any) {
    if (!this.activePlant) return;
    this.isLoading = true;
    try {
      const latestData = await this.api.getLatestByPlant(this.activePlant.id);
      this.data = latestData;
      localStorage.setItem('activePlantData', JSON.stringify(latestData));
      this.isOnline = true;
    } catch (err) {
      console.error('Error al actualizar sensores:', err);
      this.isOnline = false;
    } finally {
      this.isLoading = false;
      if (event) event.target.complete();
    }
  }

  /** Estado general de la planta */
  getPlantHealthStatus(): string {
    if (!this.activePlant) return '';
    const c = this.activePlant.optimalConditions;
    if (
      this.data.temp < c.tempMin || this.data.temp > c.tempMax ||
      this.data.hum < c.humMin || this.data.hum > c.humMax ||
      this.data.light < c.lightMin || this.data.light > c.lightMax ||
      this.data.water < c.waterMin
    ) return 'bad';
    return 'good';
  }

  getPlantHealthText(): string {
    return this.getPlantHealthStatus() === 'good' ? 'Saludable' : 'Precaución';
  }

  /** Estado de cada sensor */
  getSensorStatus(sensor: 'temp' | 'hum' | 'light' | 'water'): string {
    if (!this.activePlant) return '';
    const c = this.activePlant.optimalConditions;
    switch(sensor) {
      case 'temp': return (this.data.temp >= c.tempMin && this.data.temp <= c.tempMax) ? 'good' : 'bad';
      case 'hum': return (this.data.hum >= c.humMin && this.data.hum <= c.humMax) ? 'good' : 'bad';
      case 'light': return (this.data.light >= c.lightMin && this.data.light <= c.lightMax) ? 'good' : 'bad';
      case 'water': return (this.data.water >= c.waterMin) ? 'good' : 'bad';
    }
  }

  getSensorStatusText(sensor: 'temp' | 'hum' | 'light' | 'water'): string {
    return this.getSensorStatus(sensor) === 'good' ? 'Óptimo' : 'Fuera de rango';
  }

  /** Obtener unidad según el sensor */
  getSensorUnit(sensor: 'temp' | 'hum' | 'light' | 'water'): string {
    // Solo la temperatura se muestra como porcentaje
    if (sensor === 'temp') return '%';
    // Los demás sensores se muestran en °C
    return '°C';
  }

  /** Navegación */
  goPlants() { this.router.navigate(['/plant']); }
  goHistory() { this.router.navigate(['/history']); }
  goHome() { document.querySelector('ion-content')?.scrollToTop(300); }
}
