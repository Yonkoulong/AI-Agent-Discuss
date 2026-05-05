import {
  AfterViewInit,
  Component,
  OnDestroy,
  OnInit,
  computed,
  inject,
  signal,
} from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { DatePipe } from '@angular/common';
import { Subscription } from 'rxjs';
import { PostService } from './post.service';
import { SignalRService } from '../core/signalr.service';

@Component({
  selector: 'app-post-detail',
  standalone: true,
  imports: [FormsModule, DatePipe, RouterLink],
  template: `
    @if (post(); as p) {
      <article class="wrap">
        <a routerLink="/posts" class="back">← Back to posts</a>
        <h1>{{ p.title }}</h1>
        <div class="meta">
          by <strong>{{ p.author }}</strong> ·
          {{ p.createdAt | date: 'short' }}
        </div>
        <p class="body">{{ p.body }}</p>

        <section class="comments">
          <h2>Comments ({{ commentCount() }})</h2>

          @for (node of commentNodes(); track node.comment.id) {
            <div
              class="comment"
              [id]="'comment-' + node.comment.id"
              [class.comment--highlight]="highlightId() === node.comment.id"
            >
              <div class="comment__head">
                <strong>{{ node.comment.author }}</strong>
                <span class="comment__time">
                  {{ node.comment.createdAt | date: 'short' }}
                </span>
              </div>
              <p class="comment__text">{{ node.comment.text }}</p>
              <button
                type="button"
                class="comment__reply-btn"
                (click)="startReply(node.comment.id)"
              >
                Reply
              </button>

              @if (replyTo() === node.comment.id) {
                <form class="reply" (ngSubmit)="submitReply(node.comment.id)">
                  <input
                    placeholder="Your name"
                    [(ngModel)]="replyAuthor"
                    [name]="'replyAuthor-' + node.comment.id"
                  />
                  <input
                    placeholder="Write a reply..."
                    [(ngModel)]="replyText"
                    [name]="'replyText-' + node.comment.id"
                  />
                  <button
                    type="submit"
                    [disabled]="!replyAuthor || !replyText.trim()"
                  >
                    Send
                  </button>
                  <button type="button" (click)="cancelReply()">Cancel</button>
                </form>
              }

              @if (node.replies.length > 0) {
                <div class="replies">
                  @for (reply of node.replies; track reply.id) {
                    <div
                      class="comment comment--reply"
                      [id]="'comment-' + reply.id"
                      [class.comment--highlight]="highlightId() === reply.id"
                    >
                      <div class="comment__head">
                        <strong>{{ reply.author }}</strong>
                        <span class="comment__time">
                          {{ reply.createdAt | date: 'short' }}
                        </span>
                      </div>
                      <p class="comment__text">{{ reply.text }}</p>
                    </div>
                  }
                </div>
              }
            </div>
          } @empty {
            <p class="empty">No comments yet.</p>
          }

          <form class="add" (ngSubmit)="addComment()">
            <input placeholder="Your name" [(ngModel)]="author" name="author" />
            <input
              placeholder="Add a comment..."
              [(ngModel)]="text"
              name="text"
            />
            <button type="submit" [disabled]="!author || !text.trim()">
              Comment
            </button>
          </form>
        </section>
      </article>
    } @else {
      <p class="not-found">Post not found.</p>
    }
  `,
  styles: [
    `
      .wrap {
        max-width: 720px;
        margin: 2rem auto;
        font-family: system-ui, sans-serif;
      }
      .back {
        font-size: 0.85rem;
        color: #4f46e5;
        text-decoration: none;
      }
      .meta {
        color: #6b7280;
        font-size: 0.85rem;
        margin-bottom: 1rem;
      }
      .body {
        background: #fff;
        padding: 1rem;
        border: 1px solid #e3e6ea;
        border-radius: 10px;
      }
      .comments {
        margin-top: 2rem;
      }
      .comment {
        padding: 0.8rem 1rem;
        background: #fff;
        border: 1px solid #e3e6ea;
        border-radius: 10px;
        margin-bottom: 0.6rem;
        transition:
          background 0.8s,
          border-color 0.8s;
      }
      .comment--reply {
        margin-left: 2rem;
        background: #f9fafb;
      }
      .comment--highlight {
        background: #fef3c7;
        border-color: #fbbf24;
      }
      .comment__head {
        display: flex;
        justify-content: space-between;
        align-items: baseline;
      }
      .comment__time {
        color: #9ca3af;
        font-size: 0.75rem;
      }
      .comment__text {
        margin: 0.3rem 0;
      }
      .comment__reply-btn {
        background: none;
        border: none;
        color: #4f46e5;
        cursor: pointer;
        font-size: 0.8rem;
        padding: 0;
      }
      .reply,
      .add {
        display: flex;
        gap: 0.4rem;
        margin-top: 0.6rem;
      }
      .reply input,
      .add input {
        padding: 0.45rem 0.7rem;
        border: 1px solid #d4d8de;
        border-radius: 8px;
        flex: 1;
      }
      .reply button,
      .add button {
        padding: 0 0.9rem;
        background: #4f46e5;
        color: #fff;
        border: none;
        border-radius: 8px;
        cursor: pointer;
      }
      .reply button[type='button'] {
        background: #e5e7eb;
        color: #374151;
      }
      .add {
        margin-top: 1rem;
      }
      .empty {
        color: #98a1ad;
      }
      .not-found {
        text-align: center;
        margin-top: 3rem;
        color: #6b7280;
      }
    `,
  ],
})
export class PostDetailComponent implements OnInit, AfterViewInit, OnDestroy {
  private route = inject(ActivatedRoute);
  private svc = inject(PostService);
  private sr = inject(SignalRService);
  private subs: Subscription[] = [];

  postId = signal<string>('');
  highlightId = signal<string | null>(null);
  replyTo = signal<string | null>(null);

  author = '';
  text = '';
  replyAuthor = '';
  replyText = '';

  post = computed(() => this.svc.posts().find((p) => p.id === this.postId()));

  commentNodes = computed(() => {
    const postData = this.svc.commentsByPost()?.get(this.postId());
    return postData?.comments ?? [];
  });

  commentCount = computed(() => {
    const postData = this.svc.commentsByPost()?.get(this.postId());
    return postData?.allFlat.length ?? 0;
  });

  ngOnInit(): void {
    this.subs.push(
      this.route.paramMap.subscribe((p) => {
        const id = p.get('id') ?? '';
        this.postId.set(id);
        // Join post group on SignalR
        this.sr
          .joinGroup(`post-${id}`)
          .catch((err) => console.error('Failed to join post group:', err));
      }),
    );
  }

  ngAfterViewInit(): void {
    this.subs.push(
      this.route.fragment.subscribe((fragment) => {
        if (!fragment?.startsWith('comment-')) return;
        const commentId = fragment.replace('comment-', '');
        requestAnimationFrame(() => {
          const el = document.getElementById(fragment);
          if (el) {
            el.scrollIntoView({ behavior: 'smooth', block: 'center' });
            this.highlightId.set(commentId);
            setTimeout(() => this.highlightId.set(null), 2000);
          }
        });
      }),
    );
  }

  ngOnDestroy(): void {
    // Leave post group on SignalR
    if (this.postId()) {
      this.sr
        .leaveGroup(`post-${this.postId()}`)
        .catch((err) => console.error('Failed to leave post group:', err));
    }
    this.subs.forEach((s) => s.unsubscribe());
  }

  addComment(): void {
    const text = this.text.trim();
    if (!this.author || !text) return;
    this.svc.addComment(this.postId(), this.author, text);
    this.text = '';
  }

  startReply(commentId: string): void {
    this.replyTo.set(commentId);
  }

  cancelReply(): void {
    this.replyTo.set(null);
    this.replyText = '';
  }

  submitReply(parentId: string): void {
    const text = this.replyText.trim();
    if (!this.replyAuthor || !text) return;
    this.svc.addComment(this.postId(), this.replyAuthor, text, parentId);
    this.replyText = '';
    this.replyTo.set(null);
  }
}
