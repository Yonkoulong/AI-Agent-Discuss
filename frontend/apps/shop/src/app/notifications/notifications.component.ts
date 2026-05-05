import { Component, OnDestroy, OnInit, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { AppNotification, NotificationService } from './notification.service';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-notifications',
  standalone: true,
  template: `
    <div class="notif">
      <button
        class="notif__bell"
        type="button"
        (click)="togglePanel()"
        aria-label="Notifications"
      >
        🔔
        @if (svc.unreadCount() > 0) {
          <span class="notif__badge">{{ svc.unreadCount() }}</span>
        }
      </button>

      @if (panelOpen()) {
        <div class="notif__panel">
          <div class="notif__header">
            <strong>Notifications</strong>
            <button
              class="notif__clear"
              type="button"
              (click)="svc.markAllRead()"
              [disabled]="svc.unreadCount() === 0"
            >
              Mark all read
            </button>
          </div>

          @if (svc.list().length === 0) {
            <p class="notif__empty">No notifications</p>
          }

          @for (n of svc.list(); track n.id) {
            <div
              class="notif__item"
              [class.notif__item--unread]="!n.read"
              (click)="open(n)"
              (keydown.enter)="open(n)"
              tabindex="0"
            >
              <span class="notif__type">
                {{ n.type === 'NEW_COMMENT' ? 'Comment' : 'Reply' }}
              </span>
              <div class="notif__body">
                <div class="notif__msg">{{ n.message }}</div>
                <div class="notif__time">{{ n.createdAt | date: 'short' }}</div>
              </div>
            </div>
          }
        </div>
      }

      @if (toast(); as t) {
        <div
          class="toast"
          (click)="open(t)"
          (keydown.enter)="open(t)"
          tabindex="0"
        >
          <strong>{{
            t.type === 'NEW_COMMENT' ? 'New comment' : 'New reply'
          }}</strong>
          <div>{{ t.message }}</div>
        </div>
      }
    </div>
  `,
  styles: [
    `
      :host {
        position: relative;
        display: inline-block;
      }
      .notif__bell {
        position: relative;
        background: transparent;
        border: none;
        font-size: 1.2rem;
        cursor: pointer;
        padding: 0.25rem 0.5rem;
      }
      .notif__badge {
        position: absolute;
        top: 0;
        right: 0;
        background: #ef4444;
        color: #fff;
        font-size: 0.7rem;
        padding: 0 0.35rem;
        border-radius: 999px;
        min-width: 1.1rem;
        text-align: center;
      }
      .notif__panel {
        position: absolute;
        top: 120%;
        right: 0;
        width: 320px;
        max-height: 400px;
        overflow-y: auto;
        background: #fff;
        border: 1px solid #e3e6ea;
        border-radius: 10px;
        box-shadow: 0 10px 30px rgba(0, 0, 0, 0.12);
        z-index: 100;
      }
      .notif__header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 0.6rem 0.8rem;
        border-bottom: 1px solid #eef0f3;
      }
      .notif__clear {
        font-size: 0.75rem;
        background: none;
        border: none;
        color: #4f46e5;
        cursor: pointer;
      }
      .notif__clear:disabled {
        color: #9ca3af;
        cursor: default;
      }
      .notif__empty {
        padding: 1rem;
        text-align: center;
        color: #98a1ad;
        margin: 0;
      }
      .notif__item {
        display: flex;
        gap: 0.6rem;
        padding: 0.6rem 0.8rem;
        border-bottom: 1px solid #f3f4f6;
        cursor: pointer;
        transition: background 0.15s;
      }
      .notif__item:hover {
        background: #f9fafb;
      }
      .notif__item--unread {
        background: #eef2ff;
      }
      .notif__msg {
        font-size: 0.88rem;
      }
      .notif__time {
        font-size: 0.7rem;
        color: #9ca3af;
        margin-top: 0.15rem;
      }
      .toast {
        position: fixed;
        bottom: 1.5rem;
        right: 1.5rem;
        background: #111827;
        color: #fff;
        padding: 0.8rem 1rem;
        border-radius: 10px;
        box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
        cursor: pointer;
        max-width: 320px;
        z-index: 200;
        animation: slide 0.25s ease-out;
      }
      @keyframes slide {
        from {
          transform: translateY(20px);
          opacity: 0;
        }
        to {
          transform: translateY(0);
          opacity: 1;
        }
      }
    `,
  ],
  imports: [DatePipe],
})
export class NotificationsComponent implements OnInit, OnDestroy {
  svc = inject(NotificationService);
  private router = inject(Router);
  private sub?: Subscription;

  panelOpen = signal(false);
  toast = signal<AppNotification | null>(null);
  private toastTimer?: ReturnType<typeof setTimeout>;

  ngOnInit(): void {
    this.sub = this.svc.notifications$.subscribe((n) => this.showToast(n));
  }

  ngOnDestroy(): void {
    this.sub?.unsubscribe();
    clearTimeout(this.toastTimer);
  }

  togglePanel(): void {
    this.panelOpen.update((v) => !v);
  }

  open(n: AppNotification): void {
    this.svc.markRead(n.id);
    this.panelOpen.set(false);
    this.toast.set(null);
    this.router.navigate(['/posts', n.postId], {
      fragment: `comment-${n.commentId}`,
    });
  }

  private showToast(n: AppNotification): void {
    this.toast.set(n);
    clearTimeout(this.toastTimer);
    this.toastTimer = setTimeout(() => this.toast.set(null), 4000);
  }
}
