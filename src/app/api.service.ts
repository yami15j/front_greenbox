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

  /** Datos más recientes de un box (dispositivo físico) */
  async getLatestByBox(boxId: string): Promise<SensorData> {
    try {
      const res = await firstValueFrom(
        this.http.get<any>(`${this.base}/sensors/latest/${boxId}`)
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

  /** Historial de un box ('24h', '7d', '30d') */
  async getHistoryByBox(boxId: string, period: '24h' | '7d' | '30d'): Promise<SensorReading[]> {
    try {
      const res = await firstValueFrom(
        this.http.get<SensorReading[]>(`${this.base}/sensors/history/${boxId}/${period}`)
      );
      return res;
    } catch (err) {
      console.error('Error obteniendo historial:', err);
      return [];
    }
  }

  /* ========== ACTUATOR STATUS ========== */

  /** Obtener estado de actuadores (LED y Bomba) */
  async getActuatorStatus(boxId: string): Promise<ActuatorStatus | null> {
    try {
      return await firstValueFrom(
        this.http.get<ActuatorStatus>(`${this.base}/sensors/actuators/${boxId}`)
      );
    } catch (err) {
      console.error('Error obteniendo estado de actuadores:', err);
      return null;
    }
  }

  /** Control manual de actuadores (opcional) */
  async controlActuators(boxId: string, led?: boolean, pump?: boolean) {
    try {
      return await firstValueFrom(
        this.http.post(`${this.base}/box/${boxId}/actuators`, { led, pump })
      );
    } catch (err) {
      console.error('Error controlando actuadores:', err);
      throw err;
    }
  }

  /* ========== AUTHENTICATION ========== */

  /** Validar código de acceso (login) */
  async validateCode(code: string): Promise<{ valid: boolean; boxId?: string }> {
    try {
      const res = await firstValueFrom(
        this.http.post<{ valid: boolean; boxId?: string }>(`${this.base}/auth/validate`, { code })
      );

      // Si es válido y tiene boxId, guardarlo en localStorage
      if (res.valid && res.boxId) {
        localStorage.setItem('selectedBoxId', res.boxId);
      }

      return res;
    } catch (err) {
      console.error('Error validando código:', err);
      // Por ahora permitir acceso con cualquier código para desarrollo
      return { valid: code.length > 0, boxId: 'dev-box-id' };
    }
  }

  /* ========== BOX OPERATIONS ========== */

  /** Actualizar la planta de un box */
  async updateBoxPlant(boxId: string, plantId: string): Promise<any> {
    try {
      return await firstValueFrom(
        this.http.patch(`${this.base}/box/${boxId}`, { plantId })
      );
    } catch (err) {
      console.error('Error actualizando planta del box:', err);
      throw err;
    }
  }

  /** Obtener información completa del box */
  async getBoxInfo(boxId: string): Promise<any> {
    try {
      return await firstValueFrom(
        this.http.get(`${this.base}/box/${boxId}`)
      );
    } catch (err) {
      console.error('Error obteniendo información del box:', err);
      throw err;
    }
  }
}
