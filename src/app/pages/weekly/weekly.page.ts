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
  ) {}

  /* =====================
     CICLO DE VIDA
  ====================== */
  ngOnInit(): void {
    this.loadSensorData(this.selectedSensor);
    this.startPolling();
    this.loadUnreadNotifications();
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

    this.http
      .get<any[]>(`${this.apiUrl}/history/box/${this.boxId}/type/${sensor}`)
      .subscribe({
        next: (response) => {
          this.mapResponseToWeekly(response);
          this.isOnline = true;
          this.isLoading = false;
        },
        error: (err) => {
          console.error('Error cargando datos:', err);
          this.isOnline = false;
          this.isLoading = false;
        }
      });
  }

  private mapResponseToWeekly(response: any[]): void {
    if (!response || response.length === 0) return;

    const data = response.slice(-7);
    const values = data.map(d => Number(d.value));

    const min = Math.min(...values);
    const max = Math.max(...values);
    const avg = (values.reduce((a, b) => a + b, 0) / values.length).toFixed(1);

    this.currentAverage = avg;
    this.maxValue = max.toString();
    this.minValue = min.toString();
    this.weeklyChange = values[values.length - 1] - values[0];

    this.weeklyData = data.map((d, i) => {
      const value = Number(d.value);
      const change = i === 0 ? 0 : value - values[i - 1];

      return {
        day: `D${i + 1}`,
        dayName: this.getDayName(new Date(d.timestamp || d.date).getDay()),
        date: d.timestamp || d.date || '',
        value,
        change,
        percentage: this.calculatePercentage(value, values)
      };
    });

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
            `${this.apiUrl}/history/box/${this.boxId}/type/${this.selectedSensor}`
          )
        )
      )
      .subscribe({
        next: (response) => this.mapResponseToWeekly(response),
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
    this.navCtrl.navigateForward('/history');
  }

  goHome(): void {
    this.navCtrl.navigateBack('/home');
  }

  goNotifications(): void {
    this.navCtrl.navigateForward('/notification');
  }

  goBack(): void {
    this.navCtrl.back();
  }

  goHistoryWeekly(): void {
    localStorage.setItem('historyRange', 'week');
    this.navCtrl.navigateForward('/history');
  }
}
