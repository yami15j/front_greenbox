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
        temp: res.temp ?? res.temperature ?? 0,
        hum: res.hum ?? res.humidity ?? 0,
        light: res.light ?? res.lightHours ?? 0,
        water: res.water ?? res.waterLevel ?? 0,
        soilMoisture: res.soilMoisture ?? 0,
        timestamp: res.timestamp || new Date().toISOString()
      };
    } catch (err) {
      console.error('Error obteniendo datos recientes:', err);
      return { temp: 0, hum: 0, light: 0, water: 0, soilMoisture: 0, timestamp: new Date().toISOString() };
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
  async validateCode(code: string): Promise<{ valid: boolean; boxId?: string; boxName?: string }> {
    try {
      if (environment.allowOfflineLogin) {
        console.warn('Modo offline activado: validación de login omitida en desarrollo.');
        const cleanCode = code.trim();
        let name = cleanCode;
        if (name.length > 0) {
          name = name.charAt(0).toUpperCase() + name.slice(1).toLowerCase();
        } else {
          name = 'Usuario';
        }
        const fakeRes = { valid: cleanCode.length > 0, boxId: 'dev-box-id', boxName: name };
        if (fakeRes.valid) {
          localStorage.setItem('selectedBoxId', fakeRes.boxId);
          localStorage.setItem('selectedBoxName', fakeRes.boxName);
        }
        return fakeRes;
      }
      const res = await firstValueFrom(
        this.http.post<{ valid: boolean; boxId?: string; boxName?: string }>(`${this.base}/auth/validate`, { code })
      );

      // Si es válido y tiene boxId, guardarlo en localStorage
      if (res.valid && res.boxId) {
        localStorage.setItem('selectedBoxId', res.boxId);
        if (res.boxName) {
          localStorage.setItem('selectedBoxName', res.boxName);
        }
      }

      return res;
    } catch (err) {
      console.error('Error validando código:', err);
      if (environment.allowOfflineLogin) {
        const cleanCode = code.trim();
        let name = cleanCode;
        if (name.length > 0) {
          name = name.charAt(0).toUpperCase() + name.slice(1).toLowerCase();
        } else {
          name = 'Usuario';
        }
        const fakeRes = { valid: cleanCode.length > 0, boxId: 'dev-box-id', boxName: name };
        if (fakeRes.valid) {
          localStorage.setItem('selectedBoxId', fakeRes.boxId);
          localStorage.setItem('selectedBoxName', fakeRes.boxName);
        }
        return fakeRes;
      }
      return { valid: false };
    }
  }

  /* ========== BOX OPERATIONS ========== */

  /** Actualizar la planta de un box */
  async updateBoxPlant(boxId: string, plantId: string): Promise<any> {
    try {
      if (environment.allowOfflineLogin && boxId === 'dev-box-id') {
        console.warn('Modo offline: simulando actualización de planta en backend.');
        return { success: true };
      }
      return await firstValueFrom(
        this.http.patch(`${this.base}/box/${boxId}`, { plantId })
      );
    } catch (err) {
      console.error('Error actualizando planta del box:', err);
      if (environment.allowOfflineLogin) {
        console.warn('Modo offline: ignorando error del backend y simulando éxito.');
        return { success: true };
      }
      throw err;
    }
  }

  /** Obtener información completa del box */
  async getBoxInfo(boxId: string): Promise<any> {
    try {
      if (environment.allowOfflineLogin && boxId === 'dev-box-id') {
        console.warn('Modo offline: simulando obtención de información del box.');
        return { id: 'dev-box-id', plant: null };
      }
      return await firstValueFrom(
        this.http.get(`${this.base}/box/${boxId}`)
      );
    } catch (err) {
      console.error('Error obteniendo información del box:', err);
      if (environment.allowOfflineLogin) {
        console.warn('Modo offline: ignorando error de obtención de info del box.');
        return { id: boxId, plant: null };
      }
      throw err;
    }
  }

  /* ========== PLANT PROGRESS ENDPOINTS ========== */
  async getPlantProgress(boxId: string): Promise<any[]> {
    try {
      return await firstValueFrom(
        this.http.get<any[]>(`${this.base}/progress/${boxId}`)
      );
    } catch (err) {
      console.error('Error fetching plant progress:', err);
      return [];
    }
  }

  async savePlantProgress(boxId: string, payload: any): Promise<any> {
    try {
      return await firstValueFrom(
        this.http.post<any>(`${this.base}/progress/${boxId}`, payload)
      );
    } catch (err) {
      console.error('Error saving plant progress:', err);
      throw err;
    }
  }

  async deletePlantProgress(progressId: number): Promise<any> {
    try {
      return await firstValueFrom(
        this.http.delete<any>(`${this.base}/progress/${progressId}`)
      );
    } catch (err) {
      console.error('Error deleting plant progress:', err);
      throw err;
    }
  }
}
