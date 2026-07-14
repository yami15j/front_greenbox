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
  goHome() { this.navCtrl.navigateBack('/home'); }
  goStats() { this.navCtrl.navigateForward('/weekly'); }
  goMyPlant() { this.navCtrl.navigateForward('/plant'); }
  goNotifications() { this.navCtrl.navigateForward('/notification'); }
  goHistory() { document.querySelector('ion-content')?.scrollToTop(300); }
}
