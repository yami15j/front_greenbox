import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule, NavController, AlertController } from '@ionic/angular';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';

interface Notification {
  id: string;
  type: 'alert' | 'reminder' | 'system' | 'info';
  priority: 'high' | 'medium' | 'low';
  title: string;
  message: string;
  plantName?: string;
  plantId?: string;
  timestamp: Date;
  time?: string;
  date?: string;
  read: boolean;
  actionUrl?: string;
  sensorType?: 'temperature' | 'humidity' | 'light' | 'water';
  sensorValue?: number;
}

@Component({
  selector: 'app-notification',
  templateUrl: './notification.page.html',
  styleUrls: ['./notification.page.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule]
})
export class NotificationPage implements OnInit {
  
  isLoading = false;
  selectedFilter: 'all' | 'alerts' | 'reminders' | 'system' = 'all';
  
  notifications: Notification[] = [];
  filteredNotifications: Notification[] = [];
  todayNotifications: Notification[] = [];
  olderNotifications: Notification[] = [];
  
  unreadCount = 0;
  
  private apiUrl = 'http://127.0.0.1:3000';
  private activePlantId: string | null = null;

  constructor(
    private navCtrl: NavController,
    private alertCtrl: AlertController,
    private http: HttpClient
  ) {}

  ngOnInit() {
    this.loadActivePlant();
    this.loadNotifications();
  }

  loadActivePlant() {
    const plant = localStorage.getItem('activePlant');
    if (plant) {
      try {
        this.activePlantId = JSON.parse(plant).id;
      } catch {
        this.activePlantId = null;
      }
    }
  }

  async loadNotifications() {
    this.isLoading = true;
    
    try {
      // Intentar cargar desde backend
      const response = await firstValueFrom(
        this.http.get<Notification[]>(`${this.apiUrl}/notifications/${this.activePlantId || 'default'}`)
      );
      this.notifications = this.processNotifications(response);
    } catch (error) {
      console.log('Backend no disponible, usando notificaciones de ejemplo');
      // Usar notificaciones de ejemplo si el backend no está disponible
      this.notifications = this.getMockNotifications();
    }
    
    this.filterNotifications();
    this.categorizeByDate();
    this.updateUnreadCount();
    this.isLoading = false;
  }

  private processNotifications(notifications: Notification[]): Notification[] {
    return notifications.map(n => ({
      ...n,
      timestamp: new Date(n.timestamp),
      time: this.getTimeString(new Date(n.timestamp)),
      date: this.getDateString(new Date(n.timestamp))
    }));
  }

  private getMockNotifications(): Notification[] {
    const now = new Date();
    const today = new Date(now);
    const yesterday = new Date(now.setDate(now.getDate() - 1));
    const twoDaysAgo = new Date(now.setDate(now.getDate() - 1));

    return [
      {
        id: '1',
        type: 'alert',
        priority: 'high',
        title: 'Temperatura Alta',
        message: 'La temperatura ha superado el rango óptimo (28°C). Se recomienda revisar ventilación.',
        plantName: 'Fresa',
        plantId: 'strawberry',
        timestamp: today,
        time: this.getTimeString(today),
        date: this.getDateString(today),
        read: false,
        sensorType: 'temperature',
        sensorValue: 28,
        actionUrl: '/home'
      },
      {
        id: '2',
        type: 'reminder',
        priority: 'medium',
        title: 'Hora de Regar',
        message: 'Es momento de verificar el nivel de agua de tu planta.',
        plantName: 'Fresa',
        plantId: 'strawberry',
        timestamp: today,
        time: this.getTimeString(today),
        date: this.getDateString(today),
        read: false,
        actionUrl: '/home'
      },
      {
        id: '3',
        type: 'alert',
        priority: 'medium',
        title: 'Humedad Baja',
        message: 'La humedad ha bajado a 45%. Considera aumentar la humedad ambiental.',
        plantName: 'Fresa',
        plantId: 'strawberry',
        timestamp: yesterday,
        time: this.getTimeString(yesterday),
        date: this.getDateString(yesterday),
        read: false,
        sensorType: 'humidity',
        sensorValue: 45
      },
      {
        id: '4',
        type: 'system',
        priority: 'low',
        title: 'Sistema Actualizado',
        message: 'GREENBOX se ha actualizado correctamente a la versión 2.1.0',
        timestamp: yesterday,
        time: this.getTimeString(yesterday),
        date: this.getDateString(yesterday),
        read: true
      },
      {
        id: '5',
        type: 'info',
        priority: 'low',
        title: 'Consejo del Día',
        message: 'Las fresas necesitan al menos 6 horas de luz directa para un crecimiento óptimo.',
        plantName: 'Fresa',
        timestamp: twoDaysAgo,
        time: this.getTimeString(twoDaysAgo),
        date: this.getDateString(twoDaysAgo),
        read: true
      },
      {
        id: '6',
        type: 'reminder',
        priority: 'medium',
        title: 'Fertilización Programada',
        message: 'Según tu calendario, es momento de fertilizar tu cultivo.',
        plantName: 'Fresa',
        timestamp: twoDaysAgo,
        time: this.getTimeString(twoDaysAgo),
        date: this.getDateString(twoDaysAgo),
        read: true,
        actionUrl: '/mont'
      }
    ];
  }

  onFilterChange(event: any) {
    this.selectedFilter = event.detail.value;
    this.filterNotifications();
    this.categorizeByDate();
  }

  filterNotifications() {
    if (this.selectedFilter === 'all') {
      this.filteredNotifications = [...this.notifications];
    } else {
      this.filteredNotifications = this.notifications.filter(n => {
        switch (this.selectedFilter) {
          case 'alerts':
            return n.type === 'alert';
          case 'reminders':
            return n.type === 'reminder';
          case 'system':
            return n.type === 'system' || n.type === 'info';
          default:
            return true;
        }
      });
    }
  }

  categorizeByDate() {
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    this.todayNotifications = this.filteredNotifications.filter(n => 
      n.timestamp >= todayStart
    );

    this.olderNotifications = this.filteredNotifications.filter(n => 
      n.timestamp < todayStart
    );
  }

  updateUnreadCount() {
    this.unreadCount = this.notifications.filter(n => !n.read).length;
  }

  async openNotification(notification: Notification) {
    // Marcar como leída
    if (!notification.read) {
      notification.read = true;
      this.updateUnreadCount();
      
      // Intentar actualizar en backend
      try {
        await firstValueFrom(
          this.http.patch(`${this.apiUrl}/notifications/${notification.id}/read`, {})
        );
      } catch (error) {
        console.log('No se pudo actualizar en backend');
      }
    }

    // Si tiene una acción, navegar
    if (notification.actionUrl) {
      this.navCtrl.navigateForward(notification.actionUrl);
    } else {
      // Mostrar detalles
      await this.showNotificationDetail(notification);
    }
  }

  async showNotificationDetail(notification: Notification) {
    const alert = await this.alertCtrl.create({
      header: notification.title,
      message: `
        <p>${notification.message}</p>
        ${notification.plantName ? `<p><strong>Planta:</strong> ${notification.plantName}</p>` : ''}
        ${notification.sensorValue ? `<p><strong>Valor:</strong> ${notification.sensorValue}${notification.sensorType === 'temperature' ? '°C' : '%'}</p>` : ''}
        <p><small>${notification.date} a las ${notification.time}</small></p>
      `,
      buttons: ['OK']
    });
    await alert.present();
  }

  async dismissNotification(notification: Notification, event: Event) {
    event.stopPropagation();
    
    const alert = await this.alertCtrl.create({
      header: '¿Eliminar notificación?',
      message: 'Esta acción no se puede deshacer.',
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel'
        },
        {
          text: 'Eliminar',
          role: 'destructive',
          handler: async () => {
            // Eliminar localmente
            this.notifications = this.notifications.filter(n => n.id !== notification.id);
            this.filterNotifications();
            this.categorizeByDate();
            this.updateUnreadCount();
            
            // Intentar eliminar en backend
            try {
              await firstValueFrom(
                this.http.delete(`${this.apiUrl}/notifications/${notification.id}`)
              );
            } catch (error) {
              console.log('No se pudo eliminar en backend');
            }
          }
        }
      ]
    });
    await alert.present();
  }

  async markAllAsRead() {
    const unreadNotifications = this.notifications.filter(n => !n.read);
    
    if (unreadNotifications.length === 0) return;

    unreadNotifications.forEach(n => n.read = true);
    this.updateUnreadCount();

    // Intentar actualizar en backend
    try {
      await firstValueFrom(
        this.http.patch(`${this.apiUrl}/notifications/mark-all-read`, {
          plantId: this.activePlantId
        })
      );
    } catch (error) {
      console.log('No se pudo actualizar en backend');
    }
  }

  async openSettings() {
    const alert = await this.alertCtrl.create({
      header: 'Configuración de Notificaciones',
      message: 'Personaliza qué alertas deseas recibir',
      inputs: [
        {
          name: 'temperature',
          type: 'checkbox',
          label: 'Alertas de Temperatura',
          value: 'temperature',
          checked: true
        },
        {
          name: 'humidity',
          type: 'checkbox',
          label: 'Alertas de Humedad',
          value: 'humidity',
          checked: true
        },
        {
          name: 'light',
          type: 'checkbox',
          label: 'Alertas de Luz',
          value: 'light',
          checked: true
        },
        {
          name: 'water',
          type: 'checkbox',
          label: 'Alertas de Agua',
          value: 'water',
          checked: true
        },
        {
          name: 'reminders',
          type: 'checkbox',
          label: 'Recordatorios de Cuidado',
          value: 'reminders',
          checked: true
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
            console.log('Configuración guardada:', data);
            // Aquí puedes guardar en localStorage o backend
            localStorage.setItem('notificationSettings', JSON.stringify(data));
          }
        }
      ]
    });
    await alert.present();
  }

  getIconName(type: string): string {
    const icons = {
      alert: 'warning',
      reminder: 'alarm',
      system: 'information-circle',
      info: 'bulb'
    };
    return icons[type as keyof typeof icons] || 'notifications';
  }

  getIconClass(type: string): string {
    return `icon-${type}`;
  }

  getPriorityText(priority: string): string {
    const texts = {
      high: 'Alta',
      medium: 'Media',
      low: 'Baja'
    };
    return texts[priority as keyof typeof texts] || priority;
  }

  private getTimeString(date: Date): string {
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes}`;
  }

  private getDateString(date: Date): string {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date >= today) {
      return 'Hoy';
    } else if (date >= yesterday) {
      return 'Ayer';
    } else {
      const day = date.getDate().toString().padStart(2, '0');
      const month = (date.getMonth() + 1).toString().padStart(2, '0');
      return `${day}/${month}`;
    }
  }

  async refreshData(event: any) {
    await this.loadNotifications();
    event.target.complete();
  }

  goBack() { this.navCtrl.back(); }
  goHome() { this.navCtrl.navigateBack('/home'); }
  goHistory() { this.navCtrl.navigateForward('/weekly'); }
}