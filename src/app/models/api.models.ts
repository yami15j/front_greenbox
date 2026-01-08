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

export interface ActuatorStatus {
    boxId: number;
    boxName: string;
    led: boolean;
    pump: boolean;
    wateringCount: number;
    lastWateringDate: string | null;
}

export interface Box {
    id: number;
    code: string;
    name: string;
    plantId?: number;
    wateringCount: number;
    lastWateringDate?: string;
    ledStatus: boolean;
    pumpStatus: boolean;
    createdAt: string;
}

export interface Plant {
    id: number;
    name: string;
    minTemperature: number;
    maxTemperature: number;
    minHumidity: number;
    maxHumidity: number;
    lightHours: number;
    minWaterLevel: number;
    wateringFrequency: number;
    createdAt: string;
}
