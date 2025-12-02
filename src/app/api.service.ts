import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class ApiService {

  /** URL base del backend */
  private base = 'http://TU_BACKEND_API'; // ← Cambiar luego

  constructor(private http: HttpClient) {}

  // 🔐 Validación de código
  async validateCode(code: string): Promise<boolean> {
    console.log("Simulando validación del código:", code);
    return new Promise(resolve => {
      setTimeout(() => resolve(code === "1234"), 1200);
    });

    /*
    try {
      const res = await firstValueFrom(
        this.http.post<{ ok: boolean }>(`${this.base}/auth/code`, { code })
      );
      return res.ok;
    } catch (e) {
      console.error('Error validando código:', e);
      return false;
    }
    */
  }

  // 📡 CONSULTA DE DATOS
  async getLatest(): Promise<any> {
    try {
      return await firstValueFrom(
        this.http.get<any>(`${this.base}/sensors/latest`)
      );
    } catch (e) {
      console.error('Error obteniendo latest:', e);
      return null;
    }
  }

  async getHistoryLast24h(): Promise<any[]> {
    try {
      return await firstValueFrom(
        this.http.get<any[]>(`${this.base}/sensors/history/24h`)
      );
    } catch (e) {
      console.error('Error obteniendo history 24h:', e);
      return [];
    }
  }

  async getWeekly(): Promise<any> {
    try {
      return await firstValueFrom(
        this.http.get<any>(`${this.base}/sensors/history/7d`)
      );
    } catch (e) {
      console.error('Error obteniendo history 7d:', e);
      return null;
    }
  }
}
