import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule, NavController } from '@ionic/angular';
import { HttpClient } from '@angular/common/http';
import { interval, Subscription } from 'rxjs';
import { switchMap } from 'rxjs/operators';

interface DayData {
  day: string;
  dayName: string;
  date: string;
  value: number;
  change: number;
  percentage: number;
}

type SensorType = 'temperature' | 'humidity' | 'light' | 'water';

@Component({
  selector: 'app-weekly',
  templateUrl: './weekly.page.html',
  styleUrls: ['./weekly.page.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule]
})
export class WeeklyPage implements OnInit, OnDestroy {

  /* =====================
     ESTADO GENERAL
  ====================== */
  selectedSensor: SensorType = 'temperature';

  currentAverage = '0';
  weeklyChange = 0;
  maxValue = '0';
  minValue = '0';
  currentUnit = '°C';
  sensorTitle = 'Temperatura';

  weeklyData: DayData[] = [];
  dailyDetails: DayData[] = [];

  isLoading = false;
  isOnline = true;
  unreadCount = 0;

  /* =====================
     CONFIG
  ====================== */
  private readonly boxId = '1';
  private readonly apiUrl = 'http://127.0.0.1:3000';
  private pollSubscription?: Subscription;

  constructor(
    private navCtrl: NavController,
    private http: HttpClient
  ) { }

  /* =====================
     CICLO DE VIDA
  ====================== */
  ngOnInit(): void {
    this.loadSensorData(this.selectedSensor);
    this.startPolling();
    this.loadUnreadNotifications();
    this.loadUnreadCount();
  }

  ngOnDestroy(): void {
    this.pollSubscription?.unsubscribe();
  }

  /* =====================
     CARGA DE DATOS
  ====================== */
  async loadSensorData(sensor: SensorType): Promise<void> {
    this.selectedSensor = sensor;
    this.sensorTitle = this.getSensorName(sensor);
    this.currentUnit = this.getUnit(sensor);
    this.isLoading = true;

    // Usar el endpoint correcto: /sensors/history/:boxId/7d
    this.http
      .get<any[]>(`${this.apiUrl}/sensors/history/${this.boxId}/7d`)
      .subscribe({
        next: (response) => {
          this.mapResponseToWeekly(response, sensor);
          this.isOnline = true;
          this.isLoading = false;
        },
        error: (err) => {
          console.error('Error cargando datos:', err);
          this.isOnline = false;
          this.isLoading = false;
          // Usar datos de ejemplo en caso de error
          this.useMockData(sensor);
        }
      });
  }

  private mapResponseToWeekly(response: any[], sensor: SensorType): void {
    if (!response || response.length === 0) {
      this.useMockData(sensor);
      return;
    }

    // Extraer el valor correcto según el sensor
    const sensorField = this.getSensorField(sensor);
    const data = response.slice(-7); // Últimos 7 días
    const values = data.map(d => Number(d[sensorField] || 0));

    const min = Math.min(...values);
    const max = Math.max(...values);
    const avg = (values.reduce((a, b) => a + b, 0) / values.length).toFixed(1);

    this.currentAverage = avg;
    this.maxValue = max.toFixed(1);
    this.minValue = min.toFixed(1);
    this.weeklyChange = Number((values[values.length - 1] - values[0]).toFixed(1));

    this.weeklyData = data.map((d, i) => {
      const value = Number(d[sensorField] || 0);
      const change = i === 0 ? 0 : Number((value - values[i - 1]).toFixed(1));
      const timestamp = new Date(d.timestamp || d.createdAt);

      return {
        day: `D${i + 1}`,
        dayName: this.getDayName(timestamp.getDay()),
        date: timestamp.toLocaleDateString('es-ES'),
        value: Number(value.toFixed(1)),
        change,
        percentage: this.calculatePercentage(value, values)
      };
    });

    this.dailyDetails = [...this.weeklyData];
  }

  private getSensorField(sensor: SensorType): string {
    const fields: Record<SensorType, string> = {
      temperature: 'temperature',
      humidity: 'humidity',
      light: 'light',
      water: 'water'
    };
    return fields[sensor];
  }

  private useMockData(sensor: SensorType): void {
    // Datos de ejemplo para desarrollo
    const mockValues = sensor === 'temperature'
      ? [22, 23, 24, 23, 25, 24, 23]
      : [65, 68, 70, 67, 72, 69, 68];

    const min = Math.min(...mockValues);
    const max = Math.max(...mockValues);
    const avg = (mockValues.reduce((a, b) => a + b, 0) / mockValues.length).toFixed(1);

    this.currentAverage = avg;
    this.maxValue = max.toString();
    this.minValue = min.toString();
    this.weeklyChange = mockValues[mockValues.length - 1] - mockValues[0];

    this.weeklyData = mockValues.map((value, i) => ({
      day: `D${i + 1}`,
      dayName: this.getDayName((new Date().getDay() - 6 + i + 7) % 7),
      date: new Date(Date.now() - (6 - i) * 24 * 60 * 60 * 1000).toLocaleDateString('es-ES'),
      value,
      change: i === 0 ? 0 : value - mockValues[i - 1],
      percentage: this.calculatePercentage(value, mockValues)
    }));

    this.dailyDetails = [...this.weeklyData];
  }

  /* =====================
     POLLING (CORREGIDO)
  ====================== */
  private startPolling(): void {
    this.pollSubscription?.unsubscribe();

    this.pollSubscription = interval(30000)
      .pipe(
        switchMap(() =>
          this.http.get<any[]>(
            `${this.apiUrl}/sensors/history/${this.boxId}/7d`
          )
        )
      )
      .subscribe({
        next: (response) => this.mapResponseToWeekly(response, this.selectedSensor),
        error: (err) => {
          console.error('Error en polling:', err);
          this.isOnline = false;
        }
      });
  }

  /* =====================
     NOTIFICACIONES
  ====================== */
  private loadUnreadNotifications(): void {
    this.http
      .get<{ count: number }>(`${this.apiUrl}/notifications/unread-count`)
      .subscribe({
        next: res => this.unreadCount = res.count,
        error: err => console.error('Error notificaciones:', err)
      });
  }

  /* =====================
     UI / INTERACCIÓN
  ====================== */
  showDayDetail(day: DayData): void {
    console.log('Detalle día:', day);
  }

  goToSensorDetail(sensor: SensorType): void {
    this.loadSensorData(sensor);

    const content = document.querySelector('ion-content') as any;
    content?.scrollToTop(300);
  }

  async refreshData(event: any): Promise<void> {
    await this.loadSensorData(this.selectedSensor);
    event?.target?.complete();
  }

  /* =====================
     CÁLCULOS
  ====================== */
  calculatePercentage(value: number, values: number[]): number {
    const min = Math.min(...values);
    const max = Math.max(...values);
    if (max === min) return 80;
    return 40 + ((value - min) / (max - min)) * 60;
  }

  /* =====================
     ICONOS / TEXTO
  ====================== */
  getSensorIcon(): string {
    const icons: Record<SensorType, string> = {
      temperature: 'assets/icon/temperatura.png',
      humidity: 'assets/icon/humedad.png',
      light: 'assets/icon/luz.png',
      water: 'assets/icon/agua.png'
    };
    return icons[this.selectedSensor];
  }

  private getSensorName(sensor: SensorType): string {
    const names: Record<SensorType, string> = {
      temperature: 'Temperatura',
      humidity: 'Humedad',
      light: 'Luz',
      water: 'Agua'
    };
    return names[sensor];
  }

  private getUnit(sensor: SensorType): string {
    return sensor === 'temperature' ? '°C' : '%';
  }

  private getDayName(index: number): string {
    const dias = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
    return dias[index] || '';
  }

  /* =====================
     NAVEGACIÓN
  ====================== */
  goHistory(): void {
    // Scroll to top en lugar de navegar
    const content = document.querySelector('ion-content') as any;
    content?.scrollToTop(300);
  }

  goHome(): void {
    this.navCtrl.navigateBack('/home');
  }

  goNotifications(): void {
    this.navCtrl.navigateForward('/notification');
  }

  loadUnreadCount() {
    // Obtener boxId desde localStorage
    const boxId = localStorage.getItem('selectedBoxId') || '1';

    this.http.get<any[]>(`${this.apiUrl}/notifications/${boxId}/active`)
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

  goHistoryWeekly(): void {
    localStorage.setItem('historyRange', 'week');
    this.navCtrl.navigateForward('/history');
  }
}
