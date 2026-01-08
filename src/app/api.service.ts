import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { environment } from '../environments/environment';
import { SensorData, SensorReading, ActuatorStatus } from './models/api.models';

// Re-export for backward compatibility
export { SensorData, SensorReading };

@Injectable({ providedIn: 'root' })
export class ApiService {

  private base = environment.apiUrl;

  constructor(private http: HttpClient) { }

  /* ========== SENSOR DATA ENDPOINTS ========== */

  /** Datos más recientes de una planta (usa plantId como boxId) */
  async getLatestByPlant(plantId: string): Promise<SensorData> {
    try {
      const res = await firstValueFrom(
        this.http.get<any>(`${this.base}/sensors/latest/${plantId}`)
      );
      return {
        temp: res.temperature || 0,
        hum: res.humidity || 0,
        light: res.light || 0,
        water: res.water || 0,
        timestamp: res.timestamp || new Date().toISOString()
      };
    } catch (err) {
      console.error('Error obteniendo datos recientes:', err);
      return { temp: 0, hum: 0, light: 0, water: 0, timestamp: new Date().toISOString() };
    }
  }

  /** Historial de una planta ('24h', '7d', '30d') */
  async getHistoryByPlant(plantId: string, period: '24h' | '7d' | '30d'): Promise<SensorReading[]> {
    try {
      const res = await firstValueFrom(
        this.http.get<SensorReading[]>(`${this.base}/sensors/history/${plantId}/${period}`)
      );
      return res;
    } catch (err) {
      console.error('Error obteniendo historial:', err);
      return [];
    }
  }

  /* ========== ACTUATOR STATUS ========== */

  /** Obtener estado de actuadores (LED y Bomba) */
  async getActuatorStatus(plantId: string): Promise<ActuatorStatus | null> {
    try {
      return await firstValueFrom(
        this.http.get<ActuatorStatus>(`${this.base}/sensors/actuators/${plantId}`)
      );
    } catch (err) {
      console.error('Error obteniendo estado de actuadores:', err);
      return null;
    }
  }

  /** Control manual de actuadores (opcional) */
  async controlActuators(plantId: string, led?: boolean, pump?: boolean) {
    try {
      return await firstValueFrom(
        this.http.post(`${this.base}/box/${plantId}/actuators`, { led, pump })
      );
    } catch (err) {
      console.error('Error controlando actuadores:', err);
      throw err;
    }
  }

  /* ========== AUTHENTICATION ========== */

  /** Validar código de acceso (login) */
  async validateCode(code: string): Promise<boolean> {
    try {
      const res = await firstValueFrom(
        this.http.post<{ valid: boolean }>(`${this.base}/auth/validate`, { code })
      );
      return res.valid;
    } catch (err) {
      console.error('Error validando código:', err);
      // Por ahora permitir acceso con cualquier código para desarrollo
      return code.length > 0;
    }
  }
}
