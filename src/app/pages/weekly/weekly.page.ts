import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule, NavController } from '@ionic/angular';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { addIcons } from 'ionicons';
import {
  arrowBack,
  calendarOutline,
  homeOutline,
  statsChartOutline,
  leafOutline,
  timeOutline,
  thermometerOutline,
  waterOutline,
  sunnyOutline,
  personOutline
} from 'ionicons/icons';

interface ChartPoint {
  x: number;
  y: number;
  val: string;
  label: string;
}

interface ChartDataset {
  title: string;
  key: string;
  color: string;
  pointsString: string;
  points: ChartPoint[];
  icon: string;
  unit: string;
}

@Component({
  selector: 'app-weekly',
  templateUrl: './weekly.page.html',
  styleUrls: ['./weekly.page.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule]
})
export class WeeklyPage implements OnInit {

  selectedRange: 'day' | 'week' | 'month' = 'week';
  isLoading = false;
  unreadCount = 0;
  charts: ChartDataset[] = [];

  constructor(
    private navCtrl: NavController,
    private http: HttpClient
  ) {
    addIcons({
      'arrow-back': arrowBack,
      'calendar-outline': calendarOutline,
      'home-outline': homeOutline,
      'stats-chart-outline': statsChartOutline,
      'leaf-outline': leafOutline,
      'time-outline': timeOutline,
      'thermometer-outline': thermometerOutline,
      'water-outline': waterOutline,
      'sunny-outline': sunnyOutline,
      'person-outline': personOutline
    });
  }

  ngOnInit(): void {
    this.loadAllChartsData();
    this.loadUnreadCount();
  }

  changeRange(range: 'day' | 'week' | 'month'): void {
    this.selectedRange = range;
    this.loadAllChartsData();
  }

  async loadAllChartsData(): Promise<void> {
    this.isLoading = true;
    const boxId = localStorage.getItem('selectedBoxId') || 'dev-box-id';
    const period = this.selectedRange === 'day' ? '24h' : this.selectedRange === 'week' ? '7d' : '30d';

    if (environment.allowOfflineLogin && boxId === 'dev-box-id') {
      setTimeout(() => {
        this.generateMockCharts();
        this.isLoading = false;
      }, 500);
      return;
    }

    this.http.get<any[]>(`${environment.apiUrl}/sensors/history/${boxId}/${period}`)
      .subscribe({
        next: (response) => {
          this.processHistoryResponse(response);
          this.isLoading = false;
        },
        error: (err) => {
          console.error('Error loading history data:', err);
          this.generateMockCharts();
          this.isLoading = false;
        }
      });
  }

  private processHistoryResponse(response: any[]): void {
    if (!response || response.length === 0) {
      this.generateMockCharts();
      return;
    }

    // Sample exactly 6 data points evenly from response
    const sampledData = this.sampleArray(response, 6);
    
    // Prepare the 4 datasets
    const configs = [
      { title: 'Temperatura', key: 'temperature', color: '#ff7043', icon: 'thermometer-outline', unit: '°' },
      { title: 'Humedad', key: 'humidity', color: '#26c6da', icon: 'water-outline', unit: '%' },
      { title: 'Luz', key: 'light', color: '#ffca28', icon: 'sunny-outline', unit: '%' },
      { title: 'Humedad del Suelo', key: 'soilMoisture', color: '#66bb6a', icon: 'leaf-outline', unit: '%' }
    ];

    this.charts = configs.map(cfg => {
      const values = sampledData.map(d => {
        let val = Number(d[cfg.key]);
        if (isNaN(val)) {
          // Fallback field mapping variants
          if (cfg.key === 'light') val = Number(d.lightHours || 0);
          else if (cfg.key === 'water') val = Number(d.waterLevel || 0);
          else if (cfg.key === 'soilMoisture') val = Number(d.soilMoisture || 0);
          else val = 0;
        }
        return val;
      });

      const labels = sampledData.map((d, i) => {
        const date = new Date(d.timestamp || d.createdAt || Date.now());
        if (this.selectedRange === 'day') {
          return date.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
        } else if (this.selectedRange === 'week') {
          const days = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
          return days[date.getDay()];
        } else {
          return `${date.getDate()}/${date.getMonth() + 1}`;
        }
      });

      return this.buildDataset(cfg.title, cfg.key, cfg.color, cfg.icon, cfg.unit, values, labels);
    });
  }

  private sampleArray<T>(arr: T[], count: number): T[] {
    if (arr.length <= count) return arr;
    const sampled: T[] = [];
    const step = (arr.length - 1) / (count - 1);
    for (let i = 0; i < count; i++) {
      sampled.push(arr[Math.round(i * step)]);
    }
    return sampled;
  }

  private buildDataset(
    title: string,
    key: string,
    color: string,
    icon: string,
    unit: string,
    values: number[],
    labels: string[]
  ): ChartDataset {
    const minVal = Math.min(...values);
    const maxVal = Math.max(...values);
    const range = maxVal - minVal || 1;

    // SVG coordinate settings
    const chartWidth = 250;
    const chartHeight = 55;
    const paddingLeft = 32;
    const paddingTop = 20;

    const points: ChartPoint[] = values.map((val, i) => {
      const x = paddingLeft + i * (chartWidth / (values.length - 1 || 1));
      const y = paddingTop + chartHeight - ((val - minVal) / range) * chartHeight;
      return {
        x: Math.round(x),
        y: Math.round(y),
        val: val.toFixed(key === 'temperature' ? 1 : 0),
        label: labels[i] || ''
      };
    });

    const pointsString = points.map(pt => `${pt.x},${pt.y}`).join(' ');

    return {
      title,
      key,
      color,
      pointsString,
      points,
      icon,
      unit
    };
  }

  private generateMockCharts(): void {
    // Generate beautiful mockup-matching datasets
    const labels = this.selectedRange === 'day' 
      ? ['00:00', '04:00', '08:00', '12:00', '14:00', '20:00']
      : this.selectedRange === 'week'
      ? ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb']
      : ['01/07', '06/07', '11/07', '16/07', '21/07', '26/07'];

    const mockSets = [
      {
        title: 'Temperatura',
        key: 'temperature',
        color: '#f26419',
        icon: 'thermometer-outline',
        unit: '°',
        values: [18.2, 18.7, 19.1, 20.3, 20.1, 19.2]
      },
      {
        title: 'Humedad',
        key: 'humidity',
        color: '#33a8c7',
        icon: 'water-outline',
        unit: '%',
        values: [55, 57, 60, 62, 61, 58]
      },
      {
        title: 'Luz',
        key: 'light',
        color: '#f5b301',
        icon: 'sunny-outline',
        unit: '%',
        values: [48, 52, 58, 64, 62, 55]
      },
      {
        title: 'Humedad del Suelo',
        key: 'soilMoisture',
        color: '#5fb89a',
        icon: 'leaf-outline',
        unit: '%',
        values: [65, 68, 70, 74, 72, 69]
      }
    ];

    this.charts = mockSets.map(cfg => {
      // Modify values slightly based on period
      let valMod = cfg.values;
      if (this.selectedRange === 'day') {
        valMod = cfg.values;
      } else if (this.selectedRange === 'month') {
        valMod = cfg.values.map(v => v * 1.05); // slightly higher
      }
      return this.buildDataset(cfg.title, cfg.key, cfg.color, cfg.icon, cfg.unit, valMod, labels);
    });
  }

  loadUnreadCount() {
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

  goBack(): void {
    this.navCtrl.back();
  }

  goHome(): void {
    this.navCtrl.navigateBack('/home');
  }

  goPlants(): void {
    this.navCtrl.navigateForward('/plant');
  }

  goNotifications(): void {
    this.navCtrl.navigateForward('/notification');
  }

  goHistory(): void {
    this.navCtrl.navigateForward('/history');
  }

  goProfile(): void {
    this.navCtrl.navigateForward('/perfil');
  }

  refreshData(event: any): void {
    this.loadAllChartsData();
    event?.target?.complete();
  }
}
