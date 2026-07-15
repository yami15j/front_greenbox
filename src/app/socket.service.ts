import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { io, Socket } from 'socket.io-client';

@Injectable({ providedIn: 'root' })
export class SocketService {
  private socket?: Socket;
  private data$ = new BehaviorSubject<any>({
    temp: '--',
    hum: '--',
    light: '--',
    water: '--'
  });
  private command$ = new BehaviorSubject<any>(null);

  connect(wsUrl: string): void {
    if (this.socket) {
      this.socket.disconnect();
    }
    
    // Connect to Socket.io server
    this.socket = io(wsUrl, {
      transports: ['websocket'],
    });

    this.socket.on('connect', () => {
      console.log('✅ Socket.io conectado');
      const activeUserPlantId = localStorage.getItem('activeUserPlantId');
      if (activeUserPlantId) {
        this.joinPlant(Number(activeUserPlantId));
      }
    });

    this.socket.on('disconnect', () => console.warn('⚠️ Socket.io desconectado'));
    this.socket.on('connect_error', (err) => console.error('❌ Error Socket.io', err));

    this.socket.on('reading:new', (data: any) => {
      console.log('📡 Lectura real-time recibida:', data);
      this.data$.next({
        boxId: data.boxId,
        temp: data.temperature,
        hum: data.humidity,
        light: data.lightHours,
        water: data.waterLevel,
        soilMoisture: data.soilMoisture,
        timestamp: data.timestamp
      });
    });

    this.socket.on('command:control', (data: any) => {
      console.log('📡 Comando real-time recibido:', data);
      this.command$.next(data);
    });
  }

  joinPlant(userPlantId: number): void {
    if (this.socket) {
      console.log(`🔌 Uniéndose a la sala de planta: ${userPlantId}`);
      this.socket.emit('join:plant', { userPlantId });
    }
  }

  leavePlant(userPlantId: number): void {
    if (this.socket) {
      console.log(`🔌 Dejando la sala de planta: ${userPlantId}`);
      this.socket.emit('leave:plant', { userPlantId });
    }
  }

  getData(): Observable<any> {
    return this.data$.asObservable();
  }

  getCommands(): Observable<any> {
    return this.command$.asObservable();
  }

  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = undefined;
    }
  }
}
