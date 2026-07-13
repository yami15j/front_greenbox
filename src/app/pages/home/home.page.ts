import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule, NavController, MenuController } from '@ionic/angular';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { ApiService, SensorData } from 'src/app/api.service';
import { SocketService } from 'src/app/socket.service';
import { ActuatorStatus } from 'src/app/models/api.models';
import { environment } from 'src/environments/environment';
import { addIcons } from 'ionicons';
import {
  thermometerOutline,
  waterOutline,
  sunnyOutline,
  leafOutline,
  helpCircleOutline,
  notificationsOutline,
  homeOutline,
  statsChartOutline,
  timeOutline,
  camera,
  cloudyOutline,
  eyeOffOutline,
  rainyOutline,
  snowOutline,
  thunderstormOutline
} from 'ionicons/icons';
import { Subscription } from 'rxjs';

interface ActivePlant {
  id: string;
  name: string;
  type: string;
  icon: string;
  imageUrl: string;
  optimalConditions: {
    tempMin: number;
    tempMax: number;
    lightMin: number;
    lightMax: number;
    waterMin: number;
    tempMax_?: number; // Optional fields matching actual usage if any
  };
}

@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule],
})
export class HomePage implements OnInit, OnDestroy {

  isLoading = true;
  activePlant: any | null = null;
  data: SensorData = { temp: 0, hum: 0, light: 0, water: 0 };
  actuatorStatus: ActuatorStatus | null = null;
  isOnline = true;
  hamburgerActive = false;
  unreadCount = 0;
  userName = 'Usuario';

  // Variables para el Clima Real
  weatherData: any = null;
  weatherLocation = 'Eindhoven, Países Bajos';
  weatherTime = '';

  private socketSub?: Subscription;

  constructor(
    private navCtrl: NavController,
    private router: Router,
    private api: ApiService,
    private menu: MenuController,
    private http: HttpClient,
    private socketService: SocketService
  ) {
    // Registrar iconos
    addIcons({
      'help-circle-outline': helpCircleOutline,
      'leaf-outline': leafOutline,
      'notifications-outline': notificationsOutline,
      'home-outline': homeOutline,
      'stats-chart-outline': statsChartOutline,
      'time-outline': timeOutline,
      'camera': camera,
      'sunny-outline': sunnyOutline,
      'cloudy-outline': cloudyOutline,
      'eye-off-outline': eyeOffOutline,
      'rainy-outline': rainyOutline,
      'snow-outline': snowOutline,
      'thunderstorm-outline': thunderstormOutline
    });
  }

  ngOnInit() {
    this.loadActivePlant();
    this.loadSensorData();
    this.loadActuatorStatus();
    this.loadUnreadCount();
    this.loadUserName();
    this.setupWebSocket();
    this.loadWeather();
  }

  ngOnDestroy() {
    if (this.socketSub) {
      this.socketSub.unsubscribe();
    }
    this.socketService.disconnect();
  }

  setupWebSocket() {
    try {
      const wsUrl = environment.apiUrl.replace(/^http/, 'ws');
      console.log('🔌 Conectando WebSocket a:', wsUrl);
      this.socketService.connect(wsUrl);

      this.socketSub = this.socketService.getData().subscribe({
        next: (wsData) => {
          const boxId = localStorage.getItem('selectedBoxId');
          // Verificar si recibimos datos válidos y corresponden al box actual
          if (wsData && wsData.boxId && String(wsData.boxId) === String(boxId)) {
            console.log('📡 Lectura recibida por WebSocket:', wsData);
            this.data = {
              temp: wsData.temp ?? 0,
              hum: wsData.hum ?? 0,
              light: wsData.light ?? 0,
              water: wsData.water ?? 0,
              soilMoisture: wsData.soilMoisture ?? 0,
              timestamp: wsData.timestamp || new Date().toISOString()
            };
            // Guardar en localStorage para consistencia offline
            localStorage.setItem('activePlantData', JSON.stringify(this.data));
          }
        },
        error: (err) => {
          console.error('❌ Error en suscripción de WebSocket:', err);
        }
      });
    } catch (e) {
      console.error('❌ Error al inicializar WebSocket:', e);
    }
  }

  loadUserName() {
    const savedName = localStorage.getItem('selectedBoxName');
    const registeredName = localStorage.getItem('userName');
    const rawName = savedName || registeredName || 'Usuario';
    
    // Remueve "Caja de " (sin importar mayúsculas/minúsculas) al inicio
    this.userName = rawName.replace(/^caja de\s+/i, '').trim();
  }

  toggleHamburger() {
    this.hamburgerActive = !this.hamburgerActive;
    this.menu.toggle('main-menu');
  }

  closeMenu() {
    this.menu.close('main-menu');
  }

  loadActivePlant() {
    const plantData = localStorage.getItem('activePlant');
    if (plantData) {
      try {
        this.activePlant = JSON.parse(plantData);
      } catch {
        this.activePlant = null;
      }
    }
  }

  loadSensorData() {
    const sensorData = localStorage.getItem('activePlantData');
    if (sensorData) {
      try {
        this.data = JSON.parse(sensorData);
        this.isLoading = false;
        this.isOnline = true;
      } catch {
        this.isOnline = false;
      }
    } else {
      this.refreshData();
    }
  }

  async loadActuatorStatus() {
    const boxId = localStorage.getItem('selectedBoxId');
    if (!boxId) return;
    try {
      this.actuatorStatus = await this.api.getActuatorStatus(boxId);
    } catch (err) {
      console.error('Error cargando estado de actuadores:', err);
      this.actuatorStatus = null;
    }
  }

  async refreshData(event?: any) {
    const boxId = localStorage.getItem('selectedBoxId');
    if (!boxId) return;
    this.isLoading = true;
    try {
      const latestData = await this.api.getLatestByBox(boxId);
      this.data = latestData;
      localStorage.setItem('activePlantData', JSON.stringify(latestData));

      // También actualizar estado de actuadores
      await this.loadActuatorStatus();

      this.isOnline = true;
    } catch {
      this.isOnline = false;
    } finally {
      this.isLoading = false;
      if (event) event.target.complete();
    }
  }

  getPlantHealthStatus(): string {
    if (!this.activePlant) return '';
    const c = this.activePlant.optimalConditions;
    return (
      this.data.temp < c.tempMin || this.data.temp > c.tempMax ||
      this.data.hum < c.humMin || this.data.hum > c.humMax ||
      this.data.light < c.lightMin || this.data.light > c.lightMax ||
      this.data.water < c.waterMin
    ) ? 'bad' : 'good';
  }

  getPlantHealthText(): string {
    return this.getPlantHealthStatus() === 'good' ? 'Saludable' : 'Precaución';
  }

  getSensorStatus(sensor: 'temp' | 'hum' | 'light' | 'water'): string {
    if (!this.activePlant) return '';
    const c = this.activePlant.optimalConditions;
    switch (sensor) {
      case 'temp': return (this.data.temp >= c.tempMin && this.data.temp <= c.tempMax) ? 'good' : 'bad';
      case 'hum': return (this.data.hum >= c.humMin && this.data.hum <= c.humMax) ? 'good' : 'bad';
      case 'light': return (this.data.light >= c.lightMin && this.data.light <= c.lightMax) ? 'good' : 'bad';
      case 'water': return (this.data.water >= c.waterMin) ? 'good' : 'bad';
    }
  }

  getSensorStatusText(sensor: 'temp' | 'hum' | 'light' | 'water'): string {
    return this.getSensorStatus(sensor) === 'good' ? 'Óptimo' : 'Revisar';
  }

  // ✅ NAVEGACIÓN TABS CORREGIDA
  goHome() {
    document.querySelector('ion-content')?.scrollToTop(300);
    this.closeMenu();
  }

  goStats() {
    this.router.navigate(['/weekly']);
    this.closeMenu();
  }

  goMyPlant() {
    this.router.navigate(['/plant']);
    this.closeMenu();
  }

  goNotifications() {
    this.router.navigate(['/notification']);
    this.closeMenu();
  }

  goPlants() {
    this.router.navigate(['/select-plant']);
    this.closeMenu();
  }

  goCamera() {
    this.router.navigate(['/camera']);
    this.closeMenu();
  }

  goGuide() {
    this.router.navigate(['/guide']);
    this.closeMenu();
  }

  loadUnreadCount() {
    // Obtener boxId desde localStorage
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

  // ====================
  // SISTEMA DE CLIMA REAL
  // ====================
  get todayDateString(): string {
    const d = new Date();
    return d.toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
  }

  getWeatherInfo(code: number): { text: string; icon: string } {
    if (code === 0) return { text: 'Despejado', icon: 'sunny-outline' };
    if (code >= 1 && code <= 3) return { text: 'Algo Nublado', icon: 'cloudy-outline' };
    if (code >= 45 && code <= 48) return { text: 'Neblina', icon: 'eye-off-outline' };
    if (code >= 51 && code <= 55) return { text: 'Llovizna', icon: 'rainy-outline' };
    if (code >= 61 && code <= 65) return { text: 'Lluvia', icon: 'rainy-outline' };
    if (code >= 71 && code <= 77) return { text: 'Nieve', icon: 'snow-outline' };
    if (code >= 80 && code <= 82) return { text: 'Chubasco', icon: 'rainy-outline' };
    if (code >= 95 && code <= 99) return { text: 'Tormenta', icon: 'thunderstorm-outline' };
    return { text: 'Despejado', icon: 'sunny-outline' };
  }

  loadWeather() {
    // 1. Hora actual formateada
    const now = new Date();
    this.weatherTime = now.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });

    // 2. Intentar geolocalizar al usuario
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const lat = position.coords.latitude;
          const lon = position.coords.longitude;
          this.fetchWeather(lat, lon);
          this.fetchCityName(lat, lon);
        },
        (error) => {
          console.warn('Geolocation failed, defaulting to Eindhoven');
          this.fetchWeather(51.4416, 5.4697);
        }
      );
    } else {
      this.fetchWeather(51.4416, 5.4697);
    }
  }

  fetchWeather(lat: number, lon: number) {
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,is_day,precipitation,rain,weather_code&hourly=temperature_2m,weather_code&forecast_days=1`;
    this.http.get<any>(url).subscribe({
      next: (res) => {
        if (res && res.current) {
          const currentHour = new Date().getHours();
          const hourlyForecast: any[] = [];
          
          if (res.hourly && res.hourly.time) {
            for (let i = 0; i < 24; i++) {
              const hourTime = new Date(res.hourly.time[i]);
              const hourVal = hourTime.getHours();
              if (hourVal > currentHour && hourlyForecast.length < 5) {
                hourlyForecast.push({
                  time: hourTime.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' }),
                  temp: Math.round(res.hourly.temperature_2m[i]),
                  code: res.hourly.weather_code[i]
                });
              }
            }
          }

          this.weatherData = {
            temp: Math.round(res.current.temperature_2m),
            humidity: res.current.relative_humidity_2m,
            rain: res.current.rain,
            code: res.current.weather_code,
            hourly: hourlyForecast
          };
        }
      },
      error: (err) => console.error('Error fetching weather:', err)
    });
  }

  fetchCityName(lat: number, lon: number) {
    const url = `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json`;
    this.http.get<any>(url).subscribe({
      next: (res) => {
        if (res && res.address) {
          const city = res.address.city || res.address.town || res.address.village || res.address.suburb;
          const country = res.address.country;
          if (city) {
            this.weatherLocation = `${city}, ${country}`;
          } else {
            this.weatherLocation = country;
          }
        }
      },
      error: (err) => console.warn('Error reverse geocoding city name:', err)
    });
  }
}
