import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class SocketService {
  private ws?: WebSocket;
  private data$ = new BehaviorSubject<any>({
    temp: '--',
    hum: '--',
    light: '--',
    water: '--'
  });

  connect(wsUrl: string): void {
    this.ws = new WebSocket(wsUrl);

    this.ws.onopen = () => console.log('✅ WebSocket conectado');
    this.ws.onclose = () => console.warn('⚠️ WebSocket cerrado');
    this.ws.onerror = (err) => console.error('❌ Error WebSocket', err);

    this.ws.onmessage = (event) => {
      try {
        const payload = JSON.parse(event.data);
        this.data$.next(payload);
      } catch (e) {
        console.error('Error al parsear mensaje WS', e);
      }
    };
  }

  // observable para componentes
  getData(): Observable<any> {
    return this.data$.asObservable();
  }

  // opcional: enviar datos al servidor WS
  send(message: any): void {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(message));
    }
  }

  disconnect(): void {
    if (this.ws) this.ws.close();
  }
}
