import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';

export interface SensorData {
  temp: number;
  hum: number;
  light: number;
  water: number;
  timestamp?: string;
}

export interface SensorReading {
  timestamp: string;
  temperature: number;
  humidity: number;
  light: number;
  water: number;
}

@Injectable({ providedIn: 'root' })
export class ApiService {

  private base = 'http://127.0.0.1:3000'; // Cambiar por tu URL real

  constructor(private http: HttpClient) {}

  /** Datos más recientes de una planta */
  async getLatestByPlant(plantId: string): Promise<SensorData> {
    const res = await firstValueFrom(this.http.get<any>(`${this.base}/sensors/latest/${plantId}`));
    return this.transformToSensorData(res);
  }

  /** Historial de una planta ('24h', '7d', '30d') */
  async getHistoryByPlant(plantId: string, period: '24h' | '7d' | '30d'): Promise<SensorReading[]> {
    const res = await firstValueFrom(this.http.get<any[]>(`${this.base}/sensors/history/${plantId}/${period}`));
    return this.transformToSensorReading(res);
  }

  private transformToSensorData(data: any): SensorData {
    return {
      temp: Number(data.temperature || data.temp || 0),
      hum: Number(data.humidity || data.hum || 0),
      light: Number(data.light || data.luz || 0),
      water: Number(data.water || data.agua || data.nivel_agua || 0),
      timestamp: data.timestamp || new Date().toISOString()
    };
  }

  private transformToSensorReading(data: any[]): SensorReading[] {
    return data.map(item => ({
      timestamp: item.timestamp || new Date().toISOString(),
      temperature: Number(item.temperature || item.temp || 0),
      humidity: Number(item.humidity || item.hum || 0),
      light: Number(item.light || item.luz || 0),
      water: Number(item.water || item.agua || item.nivel_agua || 0)
    }));
  }

  /** Validar código de acceso (login) */
  async validateCode(code: string): Promise<boolean> {
    try {
      // Simulación de endpoint POST /auth/validate
      const res = await firstValueFrom(
        this.http.post<{ valid: boolean }>(`${this.base}/auth/validate`, { code })
      );
      return res.valid;
    } catch (err) {
      console.error('Error validando código:', err);
      return false;
    }
  }
}
