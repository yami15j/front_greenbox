import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { environment } from '../environments/environment';
import { SensorData, SensorReading, ActuatorStatus } from './models/api.models';

// Re-export for backward compatibility
export { SensorData, SensorReading };

const PLANT_PROFILES_MAP: { [key: string]: any } = {
  '1': {
    id: 'strawberry',
    name: 'Fresa',
    type: 'Fruto',
    icon: '🍓',
    imageUrl: 'assets/plants/fresa.jpg',
    growthTime: '50-60 días',
    difficulty: 'Intermedio',
    benefits: ['VITAMINA C', 'DULCE']
  },
  '3': {
    id: 'poto',
    name: 'Poto',
    type: 'Hoja Verde',
    icon: '🌿',
    imageUrl: 'https://images.unsplash.com/photo-1614594975525-e45190c55d0b?q=80&w=500&auto=format&fit=crop',
    growthTime: 'Constante',
    difficulty: 'Fácil',
    benefits: ['SALUDABLE', 'ORGÁNICO']
  },
  '4': {
    id: 'crassula_muscosa',
    name: 'Crassula Muscosa',
    type: 'Fruto',
    icon: '🌱',
    imageUrl: 'assets/plants/crassula_mucosa.jpg',
    growthTime: 'Lento',
    difficulty: 'Fácil',
    benefits: ['SALUDABLE', 'ORGÁNICO']
  },
  '5': {
    id: 'basil',
    name: 'Albahaca',
    type: 'Hierba Aromática',
    icon: '🌿',
    imageUrl: 'assets/plants/albahaca.jpg',
    growthTime: '20-30 días',
    difficulty: 'Fácil',
    benefits: ['DIGESTIVO', 'SABOR']
  },
  '6': {
    id: 'chives',
    name: 'Cebollín',
    type: 'Hierba Aromática',
    icon: '🧅',
    imageUrl: 'assets/plants/cebollin.jpg',
    growthTime: '30-40 días',
    difficulty: 'Fácil',
    benefits: ['SAZONADOR']
  },
  '7': {
    id: 'coriander',
    name: 'Cilantro',
    type: 'Hierba Aromática',
    icon: '🌿',
    imageUrl: 'assets/plants/cilantro.jpg',
    growthTime: '20-30 días',
    difficulty: 'Fácil',
    benefits: ['FRESCO']
  },
  '8': {
    id: 'kale',
    name: 'Colrizada',
    type: 'Hoja Verde',
    icon: '🥬',
    imageUrl: 'assets/plants/colrizada.jpg',
    growthTime: '45-60 días',
    difficulty: 'Intermedio',
    benefits: ['SÚPER ALIMENTO']
  },
  '9': {
    id: 'spinach',
    name: 'Espinaca',
    type: 'Hoja Verde',
    icon: '🥗',
    imageUrl: 'assets/plants/espinacas.jpg',
    growthTime: '35-45 días',
    difficulty: 'Fácil',
    benefits: ['HIERRO']
  },
  '10': {
    id: 'lettuce',
    name: 'Lechuga',
    type: 'Hoja Verde',
    icon: '🥬',
    imageUrl: 'assets/plants/lechuga.jpg',
    growthTime: '30-45 días',
    difficulty: 'Fácil',
    benefits: ['LIGERA']
  },
  '11': {
    id: 'mint',
    name: 'Menta',
    type: 'Hierba Aromática',
    icon: '🌱',
    imageUrl: 'assets/plants/menta.jpg',
    growthTime: '25-35 días',
    difficulty: 'Fácil',
    benefits: ['MEDICINAL', 'DIGESTIVA']
  },
  '12': {
    id: 'cucumber',
    name: 'Pepino',
    type: 'Fruto',
    icon: '🥒',
    imageUrl: 'assets/plants/pepino.jpg',
    growthTime: '50-60 días',
    difficulty: 'Intermedio',
    benefits: ['HIDRATACIÓN']
  },
  '13': {
    id: 'parsley',
    name: 'Perejil',
    type: 'Hierba Aromática',
    icon: '🌿',
    imageUrl: 'assets/plants/perejil.jpg',
    growthTime: '25-35 días',
    difficulty: 'Fácil',
    benefits: ['ANTOXIDANTE']
  },
  '14': {
    id: 'pepper',
    name: 'Pimiento',
    type: 'Fruto',
    icon: '🌶️',
    imageUrl: 'assets/plants/pimiento.jpg',
    growthTime: '60-85 días',
    difficulty: 'Intermedio',
    benefits: ['VITAMINA A']
  },
  '15': {
    id: 'radish',
    name: 'Rábano',
    type: 'Raíz',
    icon: '🔴',
    imageUrl: 'assets/plants/rabano.jpg',
    growthTime: '25-35 días',
    difficulty: 'Fácil',
    benefits: ['PICANTE']
  },
  '16': {
    id: 'arugula',
    name: 'Rúcula',
    type: 'Hoja Verde',
    icon: '🥬',
    imageUrl: 'assets/plants/rucula.jpg',
    growthTime: '30-40 días',
    difficulty: 'Fácil',
    benefits: ['SABOR INTENSO']
  },
  '17': {
    id: 'tomato',
    name: 'Tomate',
    type: 'Fruto',
    icon: '🍅',
    imageUrl: 'assets/plants/tomato.jpg',
    growthTime: '60-80 días',
    difficulty: 'Intermedio',
    benefits: ['LICOPENO']
  },
  '18': {
    id: 'carrot',
    name: 'Zanahoria',
    type: 'Raíz',
    icon: '🥕',
    imageUrl: 'assets/plants/zanahoria.jpg',
    growthTime: '70-90 días',
    difficulty: 'Intermedio',
    benefits: ['BETACAROTENO']
  }
};

function mapBackendPlantToProfile(dbPlant: any): any {
  if (!dbPlant) return null;
  const key = String(dbPlant.id);
  const baseProfile = PLANT_PROFILES_MAP[key] || {
    id: String(dbPlant.id),
    name: dbPlant.name,
    type: 'Otros',
    icon: '🌱',
    imageUrl: 'assets/plant/default-plant.jpg',
    growthTime: 'Desconocido',
    difficulty: 'Fácil',
    benefits: []
  };

  return {
    ...baseProfile,
    optimalConditions: {
      tempMin: dbPlant.minTemperature ?? 15,
      tempMax: dbPlant.maxTemperature ?? 30,
      humMin: dbPlant.minHumidity ?? 40,
      humMax: dbPlant.maxHumidity ?? 80,
      lightMin: dbPlant.lightHours ? (dbPlant.lightHours * 8.3) : 50,
      lightMax: dbPlant.lightHours ? (dbPlant.lightHours * 8.3 + 20) : 80,
      waterMin: dbPlant.minWaterLevel ?? 30
    }
  };
}

@Injectable({ providedIn: 'root' })
export class ApiService {

  private base = environment.apiUrl;

  constructor(private http: HttpClient) { }

  /* ========== SENSOR DATA ENDPOINTS ========== */

  /** Datos más recientes de un box (dispositivo físico) */
  async getLatestByBox(boxId: string): Promise<SensorData> {
    if (environment.allowOfflineLogin && boxId === 'dev-box-id') {
      const localData = localStorage.getItem('activePlantData');
      if (localData) {
        try { return JSON.parse(localData); } catch {}
      }
      return { temp: 22.5, hum: 65, light: 60, water: 80, soilMoisture: 65, timestamp: new Date().toISOString() };
    }
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
    if (environment.allowOfflineLogin && boxId === 'dev-box-id') {
      return [];
    }
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
    if (environment.allowOfflineLogin && boxId === 'dev-box-id') {
      return { boxId: 1, boxName: 'dev-box-id', led: false, pump: false, wateringCount: 0, lastWateringDate: null };
    }
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
    if (environment.allowOfflineLogin && boxId === 'dev-box-id') {
      return { success: true };
    }
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
  async validateCode(code: string): Promise<{ valid: boolean; boxId?: string; boxName?: string; profileImage?: string; plant?: any }> {
    try {
      // Intentar primero validación real contra el backend
      const res = await firstValueFrom(
        this.http.post<any>(`${this.base}/auth/validate`, { code })
      );

      // Si es válido y tiene boxId, guardarlo en localStorage
      if (res && res.data && res.data.box) {
        const box = res.data.box;
        const userPlantId = res.data.userPlantId;
        const plant = res.data.plant;

        localStorage.setItem('selectedBoxId', String(box.id));
        localStorage.setItem('selectedBoxName', box.locationName || `Caja ${box.code}`);
        
        if (box.profileImage) {
          localStorage.setItem('profileImage', box.profileImage);
        } else {
          localStorage.removeItem('profileImage');
        }

        if (userPlantId) {
          localStorage.setItem('activeUserPlantId', String(userPlantId));
        } else {
          localStorage.removeItem('activeUserPlantId');
        }

        if (plant) {
          const mappedPlant = mapBackendPlantToProfile(plant);
          localStorage.setItem('activePlant', JSON.stringify(mappedPlant));
          localStorage.setItem('activePlantId', String(mappedPlant.id));
        } else {
          localStorage.removeItem('activePlant');
          localStorage.removeItem('activePlantId');
        }

        return {
          valid: true,
          boxId: String(box.id),
          boxName: box.locationName || `Caja ${box.code}`,
          profileImage: box.profileImage || undefined,
          plant: plant,
        };
      }

      return { valid: false };
    } catch (err) {
      console.error('Error validando código en backend:', err);
      
      // Fallback offline si está permitido en la configuración
      if (environment.allowOfflineLogin) {
        console.warn('Modo offline: simulando login exitoso con dev-box-id.');
        const cleanCode = code.trim();
        let name = cleanCode;
        if (name.length > 0) {
          name = name.charAt(0).toUpperCase() + name.slice(1).toLowerCase();
        } else {
          name = 'Usuario';
        }
        const fakeRes = { valid: cleanCode.length > 0, boxId: 'dev-box-id', boxName: name, profileImage: '', plant: null };
        if (fakeRes.valid) {
          localStorage.setItem('selectedBoxId', fakeRes.boxId);
          localStorage.setItem('selectedBoxName', fakeRes.boxName);
          localStorage.removeItem('profileImage');
          localStorage.removeItem('activePlant');
          localStorage.removeItem('activePlantId');
          localStorage.removeItem('activeUserPlantId');
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

      // Map string frontend ID to numeric backend ID
      const idMapping: { [key: string]: number } = {
        'strawberry': 1,
        'poto': 3,
        'crassula_muscosa': 4,
        'basil': 5,
        'chives': 6,
        'coriander': 7,
        'kale': 8,
        'spinach': 9,
        'lettuce': 10,
        'mint': 11,
        'cucumber': 12,
        'parsley': 13,
        'pepper': 14,
        'radish': 15,
        'arugula': 16,
        'tomato': 17,
        'carrot': 18
      };
      
      const mappedPlantId = idMapping[plantId] || parseInt(plantId, 10) || 1;

      return await firstValueFrom(
        this.http.patch(`${this.base}/box/${boxId}`, { plantId: mappedPlantId })
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
      const res: any = await firstValueFrom(
        this.http.get(`${this.base}/box/${boxId}`)
      );
      if (res && res.box && res.box.plant) {
        res.box.plant = mapBackendPlantToProfile(res.box.plant);
      }
      return res;
    } catch (err) {
      console.error('Error obteniendo información del box:', err);
      if (environment.allowOfflineLogin) {
        console.warn('Modo offline: ignorando error de obtención de info del box.');
        return { id: boxId, plant: null };
      }
      throw err;
    }
  }

  /** Actualizar perfil de box (nombre y foto de perfil) */
  async updateBoxProfile(boxId: string, name: string, profileImage: string | null): Promise<any> {
    try {
      if (environment.allowOfflineLogin && boxId === 'dev-box-id') {
        console.warn('Modo offline: simulando actualización de perfil.');
        return { success: true };
      }
      return await firstValueFrom(
        this.http.patch(`${this.base}/box/${boxId}`, { name, profileImage })
      );
    } catch (err) {
      console.error('Error actualizando perfil del box:', err);
      if (environment.allowOfflineLogin) {
        return { success: true };
      }
      throw err;
    }
  }

  /* ========== PLANT PROGRESS ENDPOINTS ========== */
  async getPlantProgress(boxId: string): Promise<any[]> {
    if (environment.allowOfflineLogin && boxId === 'dev-box-id') {
      return [];
    }
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
    if (environment.allowOfflineLogin && boxId === 'dev-box-id') {
      return { success: true };
    }
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

  /** Generar y enviar código de acceso a la caja por correo electrónico */
  async generateAndSendBoxCode(email: string, name: string): Promise<any> {
    try {
      return await firstValueFrom(
        this.http.post<any>(`${this.base}/auth/register-send-code`, { email, name })
      );
    } catch (err) {
      console.error('Error al generar y enviar código de caja:', err);
      throw err;
    }
  }
}
