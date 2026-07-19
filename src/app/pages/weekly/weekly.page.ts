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
  thermometerOutline,
  waterOutline,
  sunnyOutline,
  closeOutline,
  chevronForwardOutline,
} from 'ionicons/icons';

interface ChartPoint {
  x: number;
  y: number;
  val: string;
  label: string;
}

interface HistoryEntry {
  timestamp: string;
  temperature: number;
  humidity: number;
  light: number;
  soilMoisture: number;
  water: number;
}

interface ChartDataset {
  title: string;
  key: 'temperature' | 'humidity' | 'light' | 'soilMoisture';
  color: string;
  pointsString: string;
  points: ChartPoint[];
  icon: string;
  unit: string;
  hint: string;
}

interface ChartDetailEntry {
  timestamp: string;
  dateLabel: string;
  dayLabel: string;
  timeLabel: string;
  valueLabel: string;
}

interface ChartDetailModal {
  title: string;
  color: string;
  icon: string;
  unit: string;
  rangeLabel: string;
  averageLabel: string;
  minLabel: string;
  maxLabel: string;
  entries: ChartDetailEntry[];
}

@Component({
  selector: 'app-weekly',
  templateUrl: './weekly.page.html',
  styleUrls: ['./weekly.page.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule],
})
export class WeeklyPage implements OnInit {
  selectedRange: 'day' | 'week' | 'month' = 'week';
  isLoading = false;
  unreadCount = 0;
  charts: ChartDataset[] = [];
  historyEntries: HistoryEntry[] = [];
  selectedChartDetail: ChartDetailModal | null = null;

  constructor(
    private navCtrl: NavController,
    private http: HttpClient,
  ) {
    addIcons({
      'arrow-back': arrowBack,
      'calendar-outline': calendarOutline,
      'home-outline': homeOutline,
      'stats-chart-outline': statsChartOutline,
      'leaf-outline': leafOutline,
      'thermometer-outline': thermometerOutline,
      'water-outline': waterOutline,
      'sunny-outline': sunnyOutline,
      'close-outline': closeOutline,
      'chevron-forward-outline': chevronForwardOutline,
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
    this.selectedChartDetail = null;

    const boxId = localStorage.getItem('selectedBoxId') || 'dev-box-id';
    const period =
      this.selectedRange === 'day'
        ? '24h'
        : this.selectedRange === 'week'
          ? '7d'
          : '30d';

    if (environment.allowOfflineLogin && boxId === 'dev-box-id') {
      setTimeout(() => {
        this.generateMockCharts();
        this.isLoading = false;
      }, 500);
      return;
    }

    this.http.get<any[]>(`${environment.apiUrl}/sensors/history/${boxId}/${period}`).subscribe({
      next: (response) => {
        this.processHistoryResponse(response);
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error loading history data:', err);
        this.generateMockCharts();
        this.isLoading = false;
      },
    });
  }

  private processHistoryResponse(response: any[]): void {
    if (!response || response.length === 0) {
      this.generateMockCharts();
      return;
    }

    this.historyEntries = response
      .map((entry) => this.normalizeHistoryEntry(entry))
      .sort(
        (a, b) =>
          new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime(),
      );

    const sampledData = this.sampleArray(this.historyEntries, 6);

    const configs: Array<{
      title: ChartDataset['title'];
      key: ChartDataset['key'];
      color: string;
      icon: string;
      unit: string;
    }> = [
      {
        title: 'Temperatura',
        key: 'temperature',
        color: '#ff7043',
        icon: 'thermometer-outline',
        unit: 'C',
      },
      {
        title: 'Humedad',
        key: 'humidity',
        color: '#26c6da',
        icon: 'water-outline',
        unit: '%',
      },
      {
        title: 'Luz',
        key: 'light',
        color: '#ffca28',
        icon: 'sunny-outline',
        unit: 'h',
      },
      {
        title: 'Humedad del suelo',
        key: 'soilMoisture',
        color: '#66bb6a',
        icon: 'leaf-outline',
        unit: '%',
      },
    ];

    this.charts = configs.map((cfg) => {
      const values = sampledData.map((entry) => Number(entry[cfg.key] ?? 0));
      const labels = sampledData.map((entry) => this.getChartLabel(entry.timestamp));
      return this.buildDataset(cfg.title, cfg.key, cfg.color, cfg.icon, cfg.unit, values, labels);
    });
  }

  private normalizeHistoryEntry(entry: any): HistoryEntry {
    return {
      timestamp: entry.timestamp || entry.createdAt || new Date().toISOString(),
      temperature: Number(entry.temperature ?? entry.temp ?? 0),
      humidity: Number(entry.humidity ?? entry.hum ?? 0),
      light: Number(entry.light ?? entry.lightHours ?? 0),
      soilMoisture: Number(entry.soilMoisture ?? 0),
      water: Number(entry.water ?? entry.waterLevel ?? 0),
    };
  }

  private getChartLabel(timestamp: string): string {
    const date = new Date(timestamp);

    if (this.selectedRange === 'day') {
      return date.toLocaleTimeString('es-ES', {
        hour: '2-digit',
        minute: '2-digit',
      });
    }

    if (this.selectedRange === 'week') {
      const days = ['Dom', 'Lun', 'Mar', 'Mie', 'Jue', 'Vie', 'Sab'];
      return days[date.getDay()];
    }

    return `${date.getDate()}/${date.getMonth() + 1}`;
  }

  private sampleArray<T>(arr: T[], count: number): T[] {
    if (arr.length <= count) {
      return arr;
    }

    const sampled: T[] = [];
    const step = (arr.length - 1) / (count - 1);

    for (let i = 0; i < count; i++) {
      sampled.push(arr[Math.round(i * step)]);
    }

    return sampled;
  }

  private buildDataset(
    title: ChartDataset['title'],
    key: ChartDataset['key'],
    color: string,
    icon: string,
    unit: string,
    values: number[],
    labels: string[],
  ): ChartDataset {
    const minVal = Math.min(...values);
    const maxVal = Math.max(...values);
    const range = maxVal - minVal || 1;

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
        label: labels[i] || '',
      };
    });

    const pointsString = points.map((pt) => `${pt.x},${pt.y}`).join(' ');

    return {
      title,
      key,
      color,
      pointsString,
      points,
      icon,
      unit,
      hint: 'Toca para ver el desglose',
    };
  }

  openChartDetail(chart: ChartDataset): void {
    const entries = [...this.historyEntries]
      .sort(
        (a, b) =>
          new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
      )
      .map((entry) => {
        const date = new Date(entry.timestamp);
        const value = Number(entry[chart.key] ?? 0);

        return {
          timestamp: entry.timestamp,
          dateLabel: date.toLocaleDateString('es-ES', {
            day: '2-digit',
            month: 'long',
            year: 'numeric',
          }),
          dayLabel: date.toLocaleDateString('es-ES', {
            weekday: 'long',
          }),
          timeLabel: date.toLocaleTimeString('es-ES', {
            hour: '2-digit',
            minute: '2-digit',
          }),
          valueLabel: this.formatValue(value, chart.unit, chart.key),
        };
      });

    const rawValues = this.historyEntries.map((entry) => Number(entry[chart.key] ?? 0));
    const average =
      rawValues.reduce((total, value) => total + value, 0) / (rawValues.length || 1);
    const min = Math.min(...rawValues);
    const max = Math.max(...rawValues);

    this.selectedChartDetail = {
      title: chart.title,
      color: chart.color,
      icon: chart.icon,
      unit: chart.unit,
      rangeLabel: this.getRangeLabel(),
      averageLabel: this.formatValue(average, chart.unit, chart.key),
      minLabel: this.formatValue(min, chart.unit, chart.key),
      maxLabel: this.formatValue(max, chart.unit, chart.key),
      entries,
    };
  }

  closeChartDetail(): void {
    this.selectedChartDetail = null;
  }

  private formatValue(
    value: number,
    unit: string,
    key: ChartDataset['key'],
  ): string {
    const rounded = key === 'temperature' ? value.toFixed(1) : value.toFixed(0);
    return key === 'temperature'
      ? `${rounded}°${unit}`
      : `${rounded}${unit}`;
  }

  private getRangeLabel(): string {
    if (this.selectedRange === 'day') {
      return 'Ultimas 24 horas';
    }

    if (this.selectedRange === 'week') {
      return 'Ultimos 7 dias';
    }

    return 'Ultimos 30 dias';
  }

  private generateMockCharts(): void {
    const now = new Date();
    const mockEntries: HistoryEntry[] = Array.from({ length: 8 }).map((_, index) => {
      const date = new Date(now);

      if (this.selectedRange === 'day') {
        date.setHours(now.getHours() - (7 - index) * 3);
      } else if (this.selectedRange === 'week') {
        date.setDate(now.getDate() - (7 - index));
      } else {
        date.setDate(now.getDate() - (7 - index) * 4);
      }

      return {
        timestamp: date.toISOString(),
        temperature: [18.2, 18.7, 19.1, 20.3, 20.1, 19.2, 18.9, 19.4][index],
        humidity: [55, 57, 60, 62, 61, 58, 56, 59][index],
        light: [4, 5, 6, 7, 7, 6, 5, 6][index],
        soilMoisture: [65, 68, 70, 74, 72, 69, 67, 70][index],
        water: [82, 81, 80, 79, 78, 77, 76, 75][index],
      };
    });

    this.processHistoryResponse(mockEntries);
  }

  loadUnreadCount(): void {
    const boxId = localStorage.getItem('selectedBoxId') || '1';

    this.http.get<any[]>(`${environment.apiUrl}/notifications/${boxId}/active`).subscribe({
      next: (notifications) => {
        this.unreadCount = notifications.length;
      },
      error: (err) => {
        console.error('Error loading unread count:', err);
        this.unreadCount = 0;
      },
    });
  }

  goBack(): void {
    this.navCtrl.back();
  }

  goHome(): void {
    this.navCtrl.navigateForward('/home');
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

  refreshData(event: any): void {
    this.loadAllChartsData();
    event?.target?.complete();
  }
}
