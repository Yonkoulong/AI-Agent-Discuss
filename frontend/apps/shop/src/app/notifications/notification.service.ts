import { Injectable, signal, computed, inject } from '@angular/core';
import { Subject, Observable } from 'rxjs';
import { SignalRService } from '../core/signalr.service';

export type NotificationType = 'NEW_COMMENT' | 'NEW_REPLY';

export interface AppNotification {
  id: string;
  type: NotificationType;
  postId: string | number;
  commentId: string | number;
  message: string;
  createdAt: Date;
  read: boolean;
}

@Injectable({ providedIn: 'root' })
export class NotificationService {
  private sr = inject(SignalRService);
  private incoming = new Subject<AppNotification>();

  readonly notifications$: Observable<AppNotification> =
    this.incoming.asObservable();

  readonly list = signal<AppNotification[]>([]);
  readonly unreadCount = computed(
    () => this.list().filter((n) => !n.read).length,
  );

  constructor() {
    this.sr.onReceive<Partial<AppNotification>>(
      'ReceiveNotification',
      (payload) => {
        const n: AppNotification = {
          id: payload.id ?? crypto.randomUUID(),
          type: payload.type as NotificationType,
          postId: payload.postId ?? '',
          commentId: payload.commentId ?? '',
          message: payload.message ?? '',
          createdAt: payload.createdAt
            ? new Date(payload.createdAt)
            : new Date(),
          read: false,
        };
        this.list.update((l) => [n, ...l]);
        this.incoming.next(n);
      },
    );
  }

  markRead(id: string): void {
    this.list.update((l) =>
      l.map((n) => (n.id === id ? { ...n, read: true } : n)),
    );
  }

  markAllRead(): void {
    this.list.update((l) => l.map((n) => ({ ...n, read: true })));
  }

  clear(): void {
    this.list.set([]);
  }
}
