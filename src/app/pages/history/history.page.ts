import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule, NavController } from '@ionic/angular';
import { ApiService, SensorReading } from 'src/app/api.service';

interface BarData {
  value: number;
  percentage: number;
}

@Component({
  selector: 'app-history',
  templateUrl: './history.page.html',
  styleUrls: ['./history.page.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule]
})
export class HistoryPage implements OnInit {
  isLoading = false;
  selectedRange: 'day' | 'week' | 'month' = 'week';

  temperatureData: BarData[] = [];
  humidityData: BarData[] = [];
  lightData: BarData[] = [];
  waterData: BarData[] = [];

  activePlantId: string | null = null;

  constructor(
    private navCtrl: NavController,
    private api: ApiService
  ) { }

  ngOnInit() {
    // Cargar planta activa para filtrar historial
    const plant = localStorage.getItem('activePlant');
    if (plant) {
      try {
        this.activePlantId = JSON.parse(plant).id;
      } catch {
        this.activePlantId = null;
      }
    }
    this.loadData();
  }

  onRangeChange(event: any) {
    this.selectedRange = event.detail.value;
    this.loadData();
  }

  /** Carga historial según rango seleccionado */
  async loadData() {
    if (!this.activePlantId) return;
    this.isLoading = true;

    try {
      let data: SensorReading[] = [];

      switch (this.selectedRange) {
        case 'day':
          data = await this.api.getHistoryByPlant(this.activePlantId, '24h');
          break;
        case 'week':
          data = await this.api.getHistoryByPlant(this.activePlantId, '7d');
          break;
        case 'month':
          data = await this.api.getHistoryByPlant(this.activePlantId, '30d');
          break;
      }

      // Mapear datos para mostrar en barras
      this.temperatureData = data.map(d => ({ value: d.temperature, percentage: d.temperature }));
      this.humidityData = data.map(d => ({ value: d.humidity, percentage: d.humidity }));
      this.lightData = data.map(d => ({ value: d.light, percentage: d.light }));
      this.waterData = data.map(d => ({ value: d.water, percentage: d.water }));

    } catch (err) {
      console.error('Error cargando datos históricos:', err);
    } finally {
      this.isLoading = false;
    }
  }

  /** Pull to refresh */
  refreshData(event: any) {
    setTimeout(async () => {
      await this.loadData();
      event.target.complete();
    }, 1000);
  }

  // Navegación
  goBack() { this.navCtrl.back(); }
  goHome() { this.navCtrl.navigateBack('/home'); }
  gohistory() { this.navCtrl.navigateForward('/weekly'); }
  goGuide() { this.navCtrl.navigateForward('/plant'); }
}
