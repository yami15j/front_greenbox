import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule, NavController, AlertController } from '@ionic/angular';

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
  // Mes actual
  currentMonth: string = '';
  currentYear: number = 0;
  currentMonthIndex: number = 0;

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
    private alertCtrl: AlertController
  ) {}

  ngOnInit() {
    this.initializeMonth();
    this.loadMonthData();
  }

  initializeMonth() {
    const today = new Date();
    this.currentMonthIndex = today.getMonth();
    this.currentYear = today.getFullYear();
    this.currentMonth = this.monthNames[this.currentMonthIndex];
    this.generateCalendar();
  }

  generateCalendar() {
    this.calendarDays = [];
    const firstDay = new Date(this.currentYear, this.currentMonthIndex, 1);
    const lastDay = new Date(this.currentYear, this.currentMonthIndex + 1, 0);
    const today = new Date();

    // Días vacíos al inicio
    for (let i = 0; i < firstDay.getDay(); i++) {
      this.calendarDays.push({
        date: null,
        isToday: false,
        hasEvent: false,
        isPast: false
      });
    }

    // Días del mes
    for (let day = 1; day <= lastDay.getDate(); day++) {
      const currentDate = new Date(this.currentYear, this.currentMonthIndex, day);
      const isToday = this.isSameDay(currentDate, today);
      const isPast = currentDate < today && !isToday;
      
      // Simular eventos en algunos días (días 5, 10, 15, 20, 25)
      const hasEvent = day % 5 === 0;

      this.calendarDays.push({
        date: day,
        isToday: isToday,
        hasEvent: hasEvent,
        isPast: isPast,
        fullDate: currentDate
      });
    }
  }

  isSameDay(date1: Date, date2: Date): boolean {
    return date1.getDate() === date2.getDate() &&
           date1.getMonth() === date2.getMonth() &&
           date1.getFullYear() === date2.getFullYear();
  }

  loadMonthData() {
    // Actividades de ejemplo
    this.activities = [
      {
        name: 'Riego programado',
        date: '20 Nov 2024',
        type: 'water',
        icon: 'water',
        status: 'completed',
        statusText: 'Completado'
      },
      {
        name: 'Fertilización',
        date: '15 Nov 2024',
        type: 'fertilize',
        icon: 'nutrition',
        status: 'completed',
        statusText: 'Completado'
      },
      {
        name: 'Revisión general',
        date: '10 Nov 2024',
        type: 'check',
        icon: 'checkmark-circle',
        status: 'completed',
        statusText: 'Completado'
      },
      {
        name: 'Próximo riego',
        date: '25 Nov 2024',
        type: 'water',
        icon: 'water',
        status: 'scheduled',
        statusText: 'Programado'
      }
    ];

    // Notas de ejemplo
    this.monthNotes = 'Las plantas muestran un crecimiento saludable. Se mantienen las condiciones óptimas de temperatura y humedad. Próxima poda programada para fin de mes.';
  }

  previousMonth() {
    this.currentMonthIndex--;
    if (this.currentMonthIndex < 0) {
      this.currentMonthIndex = 11;
      this.currentYear--;
    }
    this.currentMonth = this.monthNames[this.currentMonthIndex];
    this.generateCalendar();
    this.loadMonthData();
  }

  nextMonth() {
    this.currentMonthIndex++;
    if (this.currentMonthIndex > 11) {
      this.currentMonthIndex = 0;
      this.currentYear++;
    }
    this.currentMonth = this.monthNames[this.currentMonthIndex];
    this.generateCalendar();
    this.loadMonthData();
  }

  selectDay(day: CalendarDay) {
    if (!day.date) return;
    
    // Aquí puedes mostrar detalles del día o agregar eventos
    console.log('Día seleccionado:', day);
  }

  async addActivity() {
    const alert = await this.alertCtrl.create({
      header: 'Nueva Actividad',
      inputs: [
        {
          name: 'name',
          type: 'text',
          placeholder: 'Nombre de la actividad'
        },
        {
          name: 'date',
          type: 'date',
          placeholder: 'Fecha'
        }
      ],
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel'
        },
        {
          text: 'Agregar',
          handler: (data) => {
            if (data.name && data.date) {
              // Agregar la actividad
              console.log('Nueva actividad:', data);
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
        {
          name: 'notes',
          type: 'textarea',
          placeholder: 'Escribe tus observaciones...',
          value: this.monthNotes
        }
      ],
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel'
        },
        {
          text: 'Guardar',
          handler: (data) => {
            this.monthNotes = data.notes;
          }
        }
      ]
    });

    await alert.present();
  }

  async refreshData(event: any) {
    setTimeout(() => {
      this.loadMonthData();
      event.target.complete();
    }, 1000);
  }

  goBack() {
    this.navCtrl.back();
  }

  goHome() {
    this.navCtrl.navigateRoot('/home');
  }

  goHistory() {
    this.navCtrl.navigateForward('/weekly');
  }

  goMont() {
    // Ya estamos en mont, scroll to top
    const content = document.querySelector('ion-content');
    content?.scrollToTop(300);
  }
}