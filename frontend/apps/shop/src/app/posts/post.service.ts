import { Injectable, signal, computed, inject } from '@angular/core';
import { SignalRService } from '../core/signalr.service';

export interface Comment {
  id: string;
  postId: string;
  author: string;
  text: string;
  parentId: string | null;
  createdAt: Date;
}

export interface Post {
  id: string;
  author: string;
  title: string;
  body: string;
  createdAt: Date;
}

interface CommentNode {
  comment: Comment;
  replies: Comment[];
}

interface PostComments {
  comments: CommentNode[];
  allFlat: Comment[];
}

@Injectable({ providedIn: 'root' })
export class PostService {
  private sr = inject(SignalRService);

  readonly posts = signal<Post[]>([]);
  readonly comments = signal<Comment[]>([]);

  readonly commentsByPost = computed(() => {
    const grouped = new Map<string, PostComments>();

    this.comments().forEach((c) => {
      if (!grouped.has(c.postId)) {
        grouped.set(c.postId, { comments: [], allFlat: [] });
      }

      const post = grouped.get(c.postId)!;
      post.allFlat.push(c);

      // Nếu là reply (có parentId), skip ở đây - sẽ add vào parent.replies
      if (!c.parentId) {
        post.comments.push({ comment: c, replies: [] });
      }
    });

    // Build tree: add replies vào parent comment
    this.comments().forEach((c) => {
      if (c.parentId) {
        const postData = grouped.get(c.postId);
        if (postData) {
          const parent = postData.comments.find(
            (cn) => cn.comment.id === c.parentId,
          );
          if (parent) {
            parent.replies.push(c);
          }
        }
      }
    });

    return grouped;
  });

  constructor() {
    // Listen for new posts from SignalR
    this.sr.onReceive<Partial<Post>>('ReceivePost', (payload) => {
      const post: Post = {
        id: payload.id ?? crypto.randomUUID(),
        author: payload.author ?? '',
        title: payload.title ?? '',
        body: payload.body ?? '',
        createdAt: payload.createdAt ? new Date(payload.createdAt) : new Date(),
      };
      // Update posts signal if post not already added locally
      this.posts.update((list) =>
        list.some((p) => p.id === post.id) ? list : [post, ...list],
      );
    });

    // Listen for new comments from SignalR
    this.sr.onReceive<Partial<Comment>>('ReceiveComment', (payload) => {
      const comment: Comment = {
        id: payload.id ?? crypto.randomUUID(),
        postId: payload.postId ?? '',
        author: payload.author ?? '',
        text: payload.text ?? '',
        parentId: payload.parentId ?? null,
        createdAt: payload.createdAt ? new Date(payload.createdAt) : new Date(),
      };
      // Update comments signal if comment not already added locally
      this.comments.update((list) =>
        list.some((c) => c.id === comment.id) ? list : [...list, comment],
      );
    });
  }

  commentsFor(postId: string) {
    return computed(() => this.comments().filter((c) => c.postId === postId));
  }

  createPost(author: string, title: string, body: string): void {
    const post: Post = {
      id: crypto.randomUUID(),
      author,
      title,
      body,
      createdAt: new Date(),
    };
    // Add locally first
    this.posts.update((list) => [post, ...list]);
    // Send to backend via SignalR
    this.sr
      .invoke('SendPost', post.id, author, title, body)
      .catch((err) => console.error('Failed to send post:', err));
  }

  addComment(
    postId: string,
    author: string,
    text: string,
    parentId: string | null = null,
  ): void {
    const comment: Comment = {
      id: crypto.randomUUID(),
      postId,
      author,
      text,
      parentId,
      createdAt: new Date(),
    };
    this.comments.update((list) => [...list, comment]);
    // Send to backend via SignalR
    this.sr
      .invoke('SendComment', comment.id, postId, author, text, parentId)
      .catch((err) => console.error('Failed to send comment:', err));
  }
}
