import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule, NavController } from '@ionic/angular';
import { Router } from '@angular/router';

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
export class WeeklyPage implements OnInit {
  selectedSensor: SensorType = 'temperature';
  
  currentAverage: string = '25.6';
  weeklyChange: number = 2;
  maxValue: string = '27';
  minValue: string = '24';
  currentUnit: string = '°C';
  sensorTitle: string = 'Temperatura';

  weeklyData: DayData[] = [];
  dailyDetails: DayData[] = [];

  // Datos de ejemplo para cada sensor
  private sensorData = {
    temperature: {
      title: 'Temperatura',
      unit: '°C',
      average: '25.6',
      change: 2,
      max: '27',
      min: '24',
      weeklyValues: [24, 26, 25, 27, 26, 25, 26],
      dailyValues: [
        { day: 'Lun', date: 'Día 1', value: 24, change: -1.8 },
        { day: 'Mar', date: 'Día 2', value: 26, change: 2 },
        { day: 'Mié', date: 'Día 3', value: 25, change: -1 },
        { day: 'Jue', date: 'Día 4', value: 27, change: 2 },
        { day: 'Vie', date: 'Día 5', value: 26, change: -1 },
        { day: 'Sáb', date: 'Día 6', value: 25, change: -1 },
        { day: 'Dom', date: 'Día 7', value: 26, change: 1 }
      ]
    },
    humidity: {
      title: 'Humedad',
      unit: '%',
      average: '61.3',
      change: 3,
      max: '65',
      min: '58',
      weeklyValues: [58, 62, 60, 65, 61, 60, 63],
      dailyValues: [
        { day: 'Lun', date: 'Día 1', value: 58, change: -4 },
        { day: 'Mar', date: 'Día 2', value: 62, change: 4 },
        { day: 'Mié', date: 'Día 3', value: 60, change: -2 },
        { day: 'Jue', date: 'Día 4', value: 65, change: 5 },
        { day: 'Vie', date: 'Día 5', value: 61, change: -4 },
        { day: 'Sáb', date: 'Día 6', value: 60, change: -1 },
        { day: 'Dom', date: 'Día 7', value: 63, change: 3 }
      ]
    },
    light: {
      title: 'Luz',
      unit: '%',
      average: '78.5',
      change: 5,
      max: '85',
      min: '70',
      weeklyValues: [75, 80, 78, 85, 82, 79, 81],
      dailyValues: [
        { day: 'Lun', date: 'Día 1', value: 75, change: -5 },
        { day: 'Mar', date: 'Día 2', value: 80, change: 5 },
        { day: 'Mié', date: 'Día 3', value: 78, change: -2 },
        { day: 'Jue', date: 'Día 4', value: 85, change: 7 },
        { day: 'Vie', date: 'Día 5', value: 82, change: -3 },
        { day: 'Sáb', date: 'Día 6', value: 79, change: -3 },
        { day: 'Dom', date: 'Día 7', value: 81, change: 2 }
      ]
    },
    water: {
      title: 'Nivel de Agua',
      unit: '%',
      average: '73.2',
      change: -2,
      max: '78',
      min: '68',
      weeklyValues: [70, 75, 72, 78, 76, 74, 73],
      dailyValues: [
        { day: 'Lun', date: 'Día 1', value: 70, change: -3 },
        { day: 'Mar', date: 'Día 2', value: 75, change: 5 },
        { day: 'Mié', date: 'Día 3', value: 72, change: -3 },
        { day: 'Jue', date: 'Día 4', value: 78, change: 6 },
        { day: 'Vie', date: 'Día 5', value: 76, change: -2 },
        { day: 'Sáb', date: 'Día 6', value: 74, change: -2 },
        { day: 'Dom', date: 'Día 7', value: 73, change: -1 }
      ]
    }
  };

  constructor(
    private navCtrl: NavController,
    private router: Router
  ) {}

  ngOnInit() {
    this.loadSensorData('temperature');
  }

  loadSensorData(sensor: SensorType) {
    this.selectedSensor = sensor;
    const data = this.sensorData[sensor];

    this.sensorTitle = data.title;
    this.currentUnit = data.unit;
    this.currentAverage = data.average;
    this.weeklyChange = data.change;
    this.maxValue = data.max;
    this.minValue = data.min;

    // Preparar datos para el gráfico semanal
    this.weeklyData = data.weeklyValues.map((value, index) => {
      const dayData = data.dailyValues[index];
      return {
        day: dayData.day,
        dayName: dayData.day,
        date: dayData.date,
        value: value,
        change: dayData.change,
        percentage: this.calculatePercentage(value, data.weeklyValues)
      };
    });

    // Preparar datos para el detalle diario
    this.dailyDetails = this.weeklyData;
  }

  calculatePercentage(value: number, allValues: number[]): number {
    const min = Math.min(...allValues);
    const max = Math.max(...allValues);
    if (max === min) return 80;
    
    const normalized = (value - min) / (max - min);
    return 40 + (normalized * 60); // Entre 40% y 100%
  }

  goToSensorDetail(sensor: SensorType) {
    this.loadSensorData(sensor);
    
    // Scroll al inicio
    const content = document.querySelector('ion-content');
    content?.scrollToTop(300);
  }

  showDayDetail(day: DayData) {
    // Aquí podrías navegar a una página de detalle del día
    console.log('Mostrar detalle del día:', day);
    // this.router.navigate(['/day-detail'], { queryParams: { day: day.date } });
  }

  getSensorIcon(): string {
    const icons = {
      temperature: 'assets/icon/temperatura.png',
      humidity: 'assets/icon/humedad.png',
      light: 'assets/icon/luz.png',
      water: 'assets/icon/agua.png'
    };
    return icons[this.selectedSensor];
  }

  refreshData(event: any) {
    setTimeout(() => {
      this.loadSensorData(this.selectedSensor);
      event.target.complete();
    }, 1000);
  }

  goBack() {
    this.navCtrl.back();
  }

  goHome() {
    this.navCtrl.navigateBack('/home');
  }
}