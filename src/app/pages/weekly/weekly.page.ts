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
  selectedSensor: SensorType = 'temperature';
  
  currentAverage: string = '0';
  weeklyChange: number = 0;
  maxValue: string = '0';
  minValue: string = '0';
  currentUnit: string = '°C';
  sensorTitle: string = 'Temperatura';

  weeklyData: DayData[] = [];
  dailyDetails: DayData[] = [];
  
  isLoading = false;
  isOnline = true;

  private boxId = '1';
  private apiUrl = 'http://127.0.0.1:3000';
  private pollSubscription?: Subscription;

  constructor(
    private navCtrl: NavController,
    private http: HttpClient
  ) {}

  ngOnInit() {
    this.loadSensorData(this.selectedSensor);
    this.startPolling();
  }

  async loadSensorData(sensor: SensorType) {
    this.selectedSensor = sensor;
    this.sensorTitle = this.getSensorName(sensor);
    this.currentUnit = this.getUnit(sensor); // Unidad según sensor
    this.isLoading = true;

    this.http.get<any>(`${this.apiUrl}/history/box/${this.boxId}/type/${sensor}`).subscribe({
      next: (response) => {
        this.mapResponseToWeekly(response);
        this.isOnline = true;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error cargando datos del backend:', err);
        this.isOnline = false;
        this.isLoading = false;
      }
    });
  }

  private mapResponseToWeekly(response: any) {
    if (!response || response.length === 0) return;

    const data = response.slice(-7); 
    const values: number[] = data.map((d: any) => Number(d.value));

    const min = Math.min(...values);
    const max = Math.max(...values);
    const avg = (values.reduce((a, b) => a + b, 0) / values.length).toFixed(1);

    this.currentAverage = avg;
    this.maxValue = max.toString();
    this.minValue = min.toString();
    this.weeklyChange = values[values.length - 1] - values[0];

    this.weeklyData = data.map((d: any, i: number) => {
      const value = Number(d.value);
      const change = i === 0 ? 0 : value - values[i-1];
      const percentage = this.calculatePercentage(value, values);

      return {
        day: `D${i+1}`,
        dayName: this.getDayName(new Date(d.timestamp || d.date).getDay()),
        date: d.timestamp || d.date || '',
        value,
        change,
        percentage
      };
    });

    this.dailyDetails = [...this.weeklyData];
  }

  private startPolling() {
    this.pollSubscription = interval(30000)
      .pipe(
        switchMap(() => this.http.get<any>(`${this.apiUrl}/history/box/${this.boxId}/type/${this.selectedSensor}`))
      )
      .subscribe({
        next: (response) => this.mapResponseToWeekly(response),
        error: (err) => {
          console.error('Error en polling:', err);
          this.isOnline = false;
        }
      });
  }

  showDayDetail(day: DayData) {
    console.log('Detalle día:', day);
  }

  getSensorIcon(): string {
    const icons: Record<SensorType, string> = {
      temperature: 'assets/icon/temperatura.png',
      humidity: 'assets/icon/humedad.png',
      light: 'assets/icon/luz.png',
      water: 'assets/icon/agua.png'
    };
    return icons[this.selectedSensor];
  }

  goToSensorDetail(sensor: SensorType) {
    this.loadSensorData(sensor);
    document.querySelector('ion-content')?.scrollToTop(300);
  }

  calculatePercentage(value: number, allValues: number[]): number {
    const min = Math.min(...allValues);
    const max = Math.max(...allValues);
    if (max === min) return 80;
    return 40 + ((value - min) / (max - min)) * 60;
  }

  async refreshData(event: any) {
    await this.loadSensorData(this.selectedSensor);
    event?.target?.complete();
  }

  goBack() { this.navCtrl.back(); }
  goHome() { this.navCtrl.navigateBack('/home'); }
  goHistory() { this.navCtrl.navigateForward('/incubator'); }

  ngOnDestroy() {
    this.pollSubscription?.unsubscribe();
  }

  private getSensorName(sensor: SensorType): string {
    const names: Record<SensorType, string> = {
      temperature: 'Temperatura',
      humidity: 'Humedad',
      light: 'Luz',
      water: 'Agua'
    };
    return names[sensor] || sensor;
  }

  private getUnit(sensor: SensorType): string {
    // Solo temperatura en °C, los demás en %
    return sensor === 'temperature' ? '°C' : '%';
  }

  private getDayName(index: number): string {
    const dias = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
    return dias[index] || '';
  }
}
