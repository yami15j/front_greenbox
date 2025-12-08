import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule, NavController, AlertController } from '@ionic/angular';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';

interface CalendarDay {
  date: number | null;
  isToday: boolean;
  hasEvent: boolean;
  isPast: boolean;
  fullDate?: Date;
}

interface Activity {
  name: string;
  date: string;
  type: 'water' | 'fertilize' | 'prune' | 'check';
  icon: string;
  status: 'completed' | 'pending' | 'scheduled';
  statusText: string;
}

@Component({
  selector: 'app-mont',
  templateUrl: './mont.page.html',
  styleUrls: ['./mont.page.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule]
})
export class MontPage implements OnInit {
  isLoading = false;

  // Mes actual
  currentMonth: string = '';
  currentYear: number = 0;
  currentMonthIndex: number = 0;

  // Plant activo
  activePlantId: number | null = null;

  // Resumen del mes
  monthStatus: string = 'Óptimo';
  daysActive: number = 30;
  growthStage: string = 'Vegetativo';
  healthScore: number = 95;

  // Calendario
  weekDays: string[] = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
  calendarDays: CalendarDay[] = [];

  // Actividades
  activities: Activity[] = [];

  // Condiciones promedio
  avgTemp: number = 25.5;
  avgHumidity: number = 62;
  avgLight: number = 78;
  avgWater: number = 72;

  // Notas
  monthNotes: string = '';

  private monthNames: string[] = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];

  constructor(
    private navCtrl: NavController,
    private alertCtrl: AlertController,
    private http: HttpClient
  ) {}

  ngOnInit() {
    this.loadActivePlant();
  }

  loadActivePlant() {
    const plant = localStorage.getItem('activePlant');
    if (plant) {
      try { this.activePlantId = JSON.parse(plant).id; } 
      catch { this.activePlantId = null; }
    }
    this.initializeMonth();
    if (this.activePlantId) this.loadMonthData();
  }

  initializeMonth() {
    const today = new Date();
    this.currentMonthIndex = today.getMonth();
    this.currentYear = today.getFullYear();
    this.currentMonth = this.monthNames[this.currentMonthIndex];

    // Inicializamos calendario vacío
    this.calendarDays = this.generateCalendarDays([]);
  }

  async loadMonthData() {
    if (!this.activePlantId) return;
    this.isLoading = true;
    try {
      const BASE_URL = 'http://127.0.0.1:3000'; // Cambiar si tu backend es otro host
      const url = `${BASE_URL}/plant/${this.activePlantId}/month?month=${this.currentMonthIndex + 1}&year=${this.currentYear}`;
      const data: any = await firstValueFrom(this.http.get(url));

      // Resumen del mes
      this.monthStatus = data.monthStatus || 'Óptimo';
      this.daysActive = data.daysActive || 30;
      this.growthStage = data.growthStage || 'Vegetativo';
      this.healthScore = data.healthScore || 95;

      // Actividades y calendario
      this.activities = data.activities || [];
      this.calendarDays = this.generateCalendarDays(this.activities);

      // Condiciones promedio
      this.avgTemp = data.avgTemp || 25;
      this.avgHumidity = data.avgHumidity || 60;
      this.avgLight = data.avgLight || 70;
      this.avgWater = data.avgWater || 50;

      // Notas
      this.monthNotes = data.monthNotes || '';
    } catch (err) {
      console.error('Error cargando datos del mes:', err);
    } finally {
      this.isLoading = false;
    }
  }

  generateCalendarDays(activities: Activity[]): CalendarDay[] {
    const days: CalendarDay[] = [];
    const firstDay = new Date(this.currentYear, this.currentMonthIndex, 1);
    const lastDay = new Date(this.currentYear, this.currentMonthIndex + 1, 0);
    const today = new Date();

    // Días vacíos al inicio
    for (let i = 0; i < firstDay.getDay(); i++) {
      days.push({ date: null, isToday: false, hasEvent: false, isPast: false });
    }

    // Días del mes
    for (let day = 1; day <= lastDay.getDate(); day++) {
      const currentDate = new Date(this.currentYear, this.currentMonthIndex, day);
      const isToday = this.isSameDay(currentDate, today);
      const isPast = currentDate < today && !isToday;

      const dayActivities = activities.filter(act => {
        const actDate = new Date(act.date);
        return this.isSameDay(actDate, currentDate);
      });

      days.push({
        date: day,
        isToday,
        isPast,
        hasEvent: dayActivities.length > 0,
        fullDate: currentDate
      });
    }
    return days;
  }

  isSameDay(date1: Date, date2: Date): boolean {
    return date1.getDate() === date2.getDate() &&
           date1.getMonth() === date2.getMonth() &&
           date1.getFullYear() === date2.getFullYear();
  }

  previousMonth() {
    this.currentMonthIndex--;
    if (this.currentMonthIndex < 0) {
      this.currentMonthIndex = 11;
      this.currentYear--;
    }
    this.currentMonth = this.monthNames[this.currentMonthIndex];
    if (this.activePlantId) this.loadMonthData();
  }

  nextMonth() {
    this.currentMonthIndex++;
    if (this.currentMonthIndex > 11) {
      this.currentMonthIndex = 0;
      this.currentYear++;
    }
    this.currentMonth = this.monthNames[this.currentMonthIndex];
    if (this.activePlantId) this.loadMonthData();
  }

  selectDay(day: CalendarDay) {
    if (!day.date) return;
    console.log('Día seleccionado:', day);
    // Aquí puedes abrir detalles de actividades del día
  }

  async addActivity() {
    const alert = await this.alertCtrl.create({
      header: 'Nueva Actividad',
      inputs: [
        { name: 'name', type: 'text', placeholder: 'Nombre de la actividad' },
        { name: 'date', type: 'date', placeholder: 'Fecha' }
      ],
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        {
          text: 'Agregar',
          handler: async (data) => {
            if (!data.name || !data.date) return;
            try {
              const BASE_URL = 'http://127.0.0.1:3000';
              const url = `${BASE_URL}/plant/${this.activePlantId}/activities`;
              await firstValueFrom(this.http.post(url, { name: data.name, date: data.date }));
              this.loadMonthData(); // recarga actividades
            } catch (err) {
              console.error('Error agregando actividad:', err);
            }
          }
        }
      ]
    });
    await alert.present();
  }

  async editNotes() {
    const alert = await this.alertCtrl.create({
      header: 'Notas del Mes',
      inputs: [
        { name: 'notes', type: 'textarea', placeholder: 'Escribe tus observaciones...', value: this.monthNotes }
      ],
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        {
          text: 'Guardar',
          handler: async (data) => {
            try {
              const BASE_URL = 'http://127.0.0.1:3000';
              const url = `${BASE_URL}/plant/${this.activePlantId}/notes`;
              await firstValueFrom(this.http.put(url, { notes: data.notes }));
              this.monthNotes = data.notes;
            } catch (err) {
              console.error('Error guardando notas:', err);
            }
          }
        }
      ]
    });
    await alert.present();
  }

  async refreshData(event: any) {
    if (this.activePlantId) await this.loadMonthData();
    setTimeout(() => event.target.complete(), 1000);
  }

  goBack() { this.navCtrl.back(); }
  goHome() { this.navCtrl.navigateRoot('/home'); }
  goHistory() { this.navCtrl.navigateForward('/weekly'); }
  goMont() {
    const content = document.querySelector('ion-content');
    content?.scrollToTop(300);
  }
}
