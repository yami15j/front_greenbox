import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule, NavController } from '@ionic/angular';
import { HttpClient } from '@angular/common/http';
import { ApiService, SensorReading } from 'src/app/api.service';
import { environment } from 'src/environments/environment';
import { addIcons } from 'ionicons';
import {
  homeOutline,
  statsChartOutline,
  leafOutline,
  timeOutline
} from 'ionicons/icons';

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
  unreadCount = 0;

  temperatureData: BarData[] = [];
  humidityData: BarData[] = [];
  lightData: BarData[] = [];
  waterData: BarData[] = [];

  constructor(
    private navCtrl: NavController,
    private api: ApiService,
    private http: HttpClient
  ) {
    addIcons({
      'home-outline': homeOutline,
      'stats-chart-outline': statsChartOutline,
      'leaf-outline': leafOutline,
      'time-outline': timeOutline
    });
  }

  ngOnInit() {
    this.loadData();
    this.loadUnreadCount();
  }

  onRangeChange(event: any) {
    this.selectedRange = event.detail.value;
    this.loadData();
  }

  /** Carga historial según rango seleccionado */
  async loadData() {
    const boxId = localStorage.getItem('selectedBoxId');
    if (!boxId) return;
    this.isLoading = true;

    try {
      let data: SensorReading[] = [];

      switch (this.selectedRange) {
        case 'day':
          data = await this.api.getHistoryByBox(boxId, '24h');
          break;
        case 'week':
          data = await this.api.getHistoryByBox(boxId, '7d');
          break;
        case 'month':
          data = await this.api.getHistoryByBox(boxId, '30d');
          break;
      }

      const chartData = this.sampleReadings(data, 24);

      this.temperatureData = chartData.map(d => ({ value: d.temperature, percentage: this.clampPercentage(d.temperature) }));
      this.humidityData = chartData.map(d => ({ value: d.humidity, percentage: this.clampPercentage(d.humidity) }));
      this.lightData = chartData.map(d => ({ value: d.light, percentage: this.clampPercentage(d.light) }));
      this.waterData = chartData.map(d => ({ value: d.water, percentage: this.clampPercentage(d.water) }));

    } catch (err) {
      console.error('Error cargando datos históricos:', err);
    } finally {
      this.isLoading = false;
    }
  }

  private sampleReadings<T>(data: T[], maxItems: number): T[] {
    if (data.length <= maxItems) {
      return data;
    }

    const sampled: T[] = [];
    const step = (data.length - 1) / (maxItems - 1);
    for (let i = 0; i < maxItems; i++) {
      sampled.push(data[Math.round(i * step)]);
    }
    return sampled;
  }

  private clampPercentage(value: number): number {
    return Math.max(0, Math.min(100, Number(value) || 0));
  }

  trackByIndex(index: number): number {
    return index;
  }

  /** Pull to refresh */
  refreshData(event: any) {
    setTimeout(async () => {
      await this.loadData();
      event.target.complete();
    }, 1000);
  }

  loadUnreadCount() {
    const boxId = localStorage.getItem('selectedBoxId') || '1';
    this.http.get<any[]>(`${environment.apiUrl}/notifications/${boxId}/active`)
      .subscribe({
        next: (notifications) => {
          this.unreadCount = notifications.length;
        },
        error: (err) => {
          console.error('Error loading unread count in history page:', err);
          this.unreadCount = 0;
        }
      });
  }

  // Navegación
  goBack() { this.navCtrl.back(); }
  goHome() { this.navCtrl.navigateRoot('/home'); }
  goStats() { this.navCtrl.navigateRoot('/weekly'); }
  goMyPlant() { this.navCtrl.navigateRoot('/plant'); }
  goNotifications() { this.navCtrl.navigateForward('/notification'); }
  goHistory() { document.querySelector('ion-content')?.scrollToTop(300); }
}
