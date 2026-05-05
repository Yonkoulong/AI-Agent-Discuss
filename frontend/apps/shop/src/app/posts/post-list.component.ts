import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { DatePipe } from '@angular/common';
import { PostService } from './post.service';

@Component({
  selector: 'app-post-list',
  standalone: true,
  imports: [RouterLink, FormsModule, DatePipe],
  template: `
    <section class="wrap">
      <h1>Posts</h1>

      <form class="new" (ngSubmit)="create()">
        <input placeholder="Your name" [(ngModel)]="author" name="author" />
        <input placeholder="Post title" [(ngModel)]="title" name="title" />
        <textarea
          placeholder="What's on your mind?"
          [(ngModel)]="body"
          name="body"
          rows="3"
        ></textarea>
        <button type="submit" [disabled]="!author || !title.trim()">
          Create post
        </button>
      </form>

      <ul class="list">
        @for (p of svc.posts(); track p.id) {
          <li class="post">
            <a [routerLink]="['/posts', p.id]" class="post__title">
              {{ p.title }}
            </a>
            <div class="post__meta">
              by <strong>{{ p.author }}</strong> ·
              {{ p.createdAt | date: 'short' }} ·
              {{ svc.commentsFor(p.id)().length }} comments
            </div>
            <p class="post__body">{{ p.body }}</p>
          </li>
        } @empty {
          <p class="empty">No posts yet. Be the first!</p>
        }
      </ul>
    </section>
  `,
  styles: [
    `
      .wrap {
        max-width: 720px;
        margin: 2rem auto;
        font-family: system-ui, sans-serif;
      }
      .new {
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
        padding: 1rem;
        background: #fff;
        border: 1px solid #e3e6ea;
        border-radius: 10px;
        margin-bottom: 1.5rem;
      }
      .new input,
      .new textarea {
        padding: 0.55rem 0.8rem;
        border: 1px solid #d4d8de;
        border-radius: 8px;
        font-family: inherit;
        font-size: 0.95rem;
      }
      .new button {
        align-self: flex-start;
        padding: 0.5rem 1.1rem;
        background: #4f46e5;
        color: #fff;
        border: none;
        border-radius: 8px;
        cursor: pointer;
        font-weight: 600;
      }
      .new button:disabled {
        background: #c7c9d1;
      }
      .list {
        list-style: none;
        padding: 0;
        margin: 0;
      }
      .post {
        padding: 1rem;
        background: #fff;
        border: 1px solid #e3e6ea;
        border-radius: 10px;
        margin-bottom: 0.6rem;
      }
      .post__title {
        font-size: 1.1rem;
        font-weight: 600;
        color: #111827;
        text-decoration: none;
      }
      .post__title:hover {
        color: #4f46e5;
      }
      .post__meta {
        font-size: 0.8rem;
        color: #6b7280;
        margin: 0.2rem 0 0.5rem;
      }
      .post__body {
        margin: 0;
        color: #374151;
      }
      .empty {
        color: #98a1ad;
        text-align: center;
      }
    `,
  ],
})
export class PostListComponent {
  svc = inject(PostService);

  author = '';
  title = '';
  body = '';

  create(): void {
    if (!this.author || !this.title.trim()) return;
    this.svc.createPost(this.author, this.title.trim(), this.body.trim());
    this.title = '';
    this.body = '';
  }
}
