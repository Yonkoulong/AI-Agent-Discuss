import { Injectable } from '@angular/core';
import * as signalR from '@microsoft/signalr';

@Injectable({ providedIn: 'root' })
export class SignalRService {
  private hub: signalR.HubConnection;

  get connection(): signalR.HubConnection {
    return this.hub;
  }

  constructor() {
    this.hub = new signalR.HubConnectionBuilder()
      .withUrl('http://localhost:5286/chatHub')
      .withAutomaticReconnect()
      .build();

    this.hub
      .start()
      .catch((err) => console.error('SignalR connection error:', err));
  }

  onReceive<T>(eventName: string, handler: (data: T) => void): void {
    this.hub.on(eventName, handler);
  }

  offReceive(eventName: string): void {
    this.hub.off(eventName);
  }

  invoke<T = void>(methodName: string, ...args: any[]): Promise<T> {
    return this.hub.invoke<T>(methodName, ...args);
  }

  joinGroup(groupName: string): Promise<void> {
    return this.hub.invoke('JoinPostGroup', groupName);
  }

  leaveGroup(groupName: string): Promise<void> {
    return this.hub.invoke('LeavePostGroup', groupName);
  }
}
