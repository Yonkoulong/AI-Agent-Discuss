import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { NotificationService, AppNotification } from './notification.service';
import { DatePipe } from 'node_modules/@angular/common/types/_common_module-chunk';

@Component({
  selector: 'app-notification-list',
  standalone: true,
  template: `
    <div class="notifications">
      <h3>Notifications ({{ svc.unreadCount() }})</h3>
      <ul>
        @for (n of svc.list(); track n.id) {
          <li
            [class.read]="n.read"
            (click)="onClick(n)"
            (keydown.enter)="onClick(n)"
            tabindex="0"
          >
            {{ n.message }}
            <small>{{ n.createdAt | date: 'short' }}</small>
          </li>
        }
      </ul>
      <button (click)="svc.markAllRead()">Mark All Read</button>
    </div>
  `,
  styles: [
    `
      .notifications {
        max-width: 400px;
        margin: 1rem;
      }
      ul {
        list-style: none;
        padding: 0;
      }
      li {
        padding: 0.5rem;
        border: 1px solid #ccc;
        margin-bottom: 0.5rem;
        cursor: pointer;
      }
      li.read {
        opacity: 0.6;
      }
      button {
        margin-top: 1rem;
      }
    `,
  ],
  imports: [DatePipe],
})
export class NotificationListComponent {
  svc = inject(NotificationService);
  router = inject(Router);

  onClick(notification: AppNotification) {
    this.svc.markRead(notification.id);
    this.router.navigate(['/posts', notification.postId]);
  }
}
