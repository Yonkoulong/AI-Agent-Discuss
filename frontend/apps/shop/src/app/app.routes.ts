import { Route } from '@angular/router';

export const appRoutes: Route[] = [
  {
    path: '',
    redirectTo: 'posts',
    pathMatch: 'full',
  },
  {
    path: 'products',
    loadChildren: () =>
      import('@org/shop/feature-products').then(m => m.featureProductsRoutes),
  },
  {
    path: 'products',
    loadChildren: () =>
      import('@org/shop/feature-product-detail').then(
        m => m.featureProductDetailRoutes
      ),
  },
  {
    path: 'posts',
    loadComponent: () =>
      import('./posts/post-list.component').then((m) => m.PostListComponent),
  },
  {
    path: 'posts/:id',
    loadComponent: () =>
      import('./posts/post-detail.component').then((m) => m.PostDetailComponent),
  },
  {
    path: '**',
    redirectTo: 'posts',
  },
];
