import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'home',
    pathMatch: 'full',
  },
  {
    path: 'folder/:id',
    loadComponent: () =>
      import('./folder/folder.page').then((m) => m.FolderPage),
  },
  {
    path: 'home',
    loadComponent: () =>
      import('./pages/home/home.page').then((m) => m.HomePage),
  },
  {
    path: 'skeleton-reload',
    loadComponent: () =>
      import('./pages/skeleton-reload/skeleton-reload.page').then(
        (m) => m.SkeletonReloadPage
      ),
  },
  {
    path: 'shop',
    loadComponent: () =>
      import('./pages/shop/shop.page').then((m) => m.ShopPage),
  },
  {
    path: 'notification',
    loadComponent: () =>
      import('./pages/notification/notification.page').then(
        (m) => m.NotificationPage
      ),
  },
  {
    path: 'support',
    loadComponent: () =>
      import('./pages/support/support.page').then((m) => m.SupportPage),
  },
  {
    path: 'product/:id',
    loadComponent: () =>
      import('./pages/product/product.page').then((m) => m.ProductPage),
  },
  {
    path: 'products',
    loadComponent: () =>
      import('./pages/products/products.page').then((m) => m.ProductsPage),
  },
  {
    path: 'categories/:catName',
    loadComponent: () =>
      import('./pages/categories/categories.page').then(
        (m) => m.CategoriesPage
      ),
  },
  {
    path: 'sub-categories/:subName',
    loadComponent: () =>
      import('./pages/sub-categories/sub-categories.page').then(
        (m) => m.SubCategoriesPage
      ),
  },
  {
    path: 'cart',
    loadComponent: () =>
      import('./pages/cart/cart.page').then((m) => m.CartPage),
  },
  {
    path: 'checkout',
    loadComponent: () =>
      import('./pages/checkout/checkout.page').then((m) => m.CheckoutPage),
  },
  {
    path: 'auth',
    loadComponent: () =>
      import('./pages/auth/auth.page').then((m) => m.AuthPage),
  },
  {
    path: 'easypay',
    loadComponent: () =>
      import('./pages/easypay/easypay.page').then((m) => m.EasypayPage),
  },
  {
    path: 'callback',
    loadComponent: () =>
      import('./pages/callback/callback.page').then((m) => m.CallbackPage),
  },
  {
    path: 'nearbystore',
    loadComponent: () =>
      import('./pages/nearbystore/nearbystore.page').then(
        (m) => m.NearbystorePage
      ),
  },
  {
    path: 'vrstore',
    loadComponent: () =>
      import('./pages/vrstore/vrstore.page').then((m) => m.VrstorePage),
  },
  {
    path: 'account-info',
    loadComponent: () =>
      import('./pages/account-info/account-info.page').then(
        (m) => m.AccountInfoPage
      ),
  },
  {
    path: 'tvc-history',
    loadComponent: () =>
      import('./pages/tvc-history/tvc-history.page').then(
        (m) => m.TvcHistoryPage
      ),
  },
  {
    path: 'tvc',
    loadComponent: () => import('./pages/tvc/tvc.page').then((m) => m.TvcPage),
  },
  {
    path: 'tvc-details',
    loadComponent: () =>
      import('./pages/tvc-details/tvc-details.page').then(
        (m) => m.TvcDetailsPage
      ),
  },
  {
    path: 'about-us',
    loadComponent: () =>
      import('./pages/about-us/about-us.page').then((m) => m.AboutUsPage),
  },
  {
    path: 'orders',
    loadComponent: () =>
      import('./pages/orders/orders.page').then((m) => m.OrdersPage),
  },
  {
    path: 'delivery',
    loadComponent: () =>
      import('./pages/delivery/delivery.page').then((m) => m.DeliveryPage),
  },
  {
    path: 'favorite',
    loadComponent: () =>
      import('./pages/favorite/favorite.page').then((m) => m.FavoritePage),
  },
  {
    path: 'bookings',
    loadComponent: () =>
      import('./pages/bookings/bookings.page').then((m) => m.BookingsPage),
  },
  {
    path: 'service-tracking',
    loadComponent: () =>
      import('./pages/service-tracking/service-tracking.page').then(
        (m) => m.ServiceTrackingPage
      ),
  },
  {
    path: 'order-successfully',
    loadComponent: () =>
      import('./pages/order-successfully/order-successfully.page').then(
        (m) => m.OrderSuccessfullyPage
      ),
  },
];
