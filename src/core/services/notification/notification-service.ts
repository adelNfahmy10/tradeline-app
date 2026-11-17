import { HttpClient } from '@angular/common/http';

import { computed, inject, Injectable, signal } from '@angular/core';

import { toSignal } from '@angular/core/rxjs-interop';

import { Capacitor } from '@capacitor/core';

import OneSignal from '@onesignal/capacitor-plugin';

import { FirebaseMessaging } from '@capacitor-firebase/messaging';

import {
  catchError,
  defer,
  finalize,
  from,
  map,
  Observable,
  of,
  shareReplay,
  startWith,
  Subject,
  switchMap,
  tap,
} from 'rxjs';

import { environment } from 'src/environments/environment.prod';

// ==========================================
// TYPES
// ==========================================

export interface NotificationItem {
  id?: number | string;
  title?: string;
  message?: string;
  body?: string;
  is_read?: boolean;
  created_at?: string;
  [key: string]: any;
}

@Injectable({
  providedIn: 'root',
})
export class NotificationService {
  private readonly http = inject(HttpClient);

  private readonly APP_ID = '8e79ca88-5f06-4445-9fbe-a3b040cb26f4';

  // ==========================================
  // BACKEND NOTIFICATIONS STATE
  // ==========================================

  private readonly refreshTrigger$ = new Subject<void>();

  readonly isLoading = signal(false);

  readonly error = signal<string | null>(null);

  readonly notifications = toSignal(
    this.refreshTrigger$.pipe(
      startWith(undefined),

      tap(() => {
        this.isLoading.set(true);
        this.error.set(null);
      }),

      switchMap(() =>
        this.http
          .get<NotificationItem[]>(`${environment.baseUrl}notifications/`)
          .pipe(
            catchError((error) => {
              console.error('Notifications API Error:', error);

              this.error.set('Unable to load notifications.');

              return of([]);
            }),

            finalize(() => this.isLoading.set(false))
          )
      )
    ),
    {
      initialValue: [] as NotificationItem[],
    }
  );

  readonly notificationsCount = computed(() => this.notifications().length);

  readonly unreadNotificationsCount = computed(
    () =>
      this.notifications().filter((notification) => !notification.is_read)
        .length
  );

  // ==========================================
  // ONESIGNAL PUSH NOTIFICATIONS STATE
  // ==========================================

  readonly hasNotificationPermission = signal(false);

  readonly subscriptionId = signal<string | null>(null);

  readonly lastPushNotification = signal<any | null>(null);

  readonly isPushInitialized = signal(false);

  private initializationPromise?: Promise<void>;

  // ==========================================
  // FIREBASE FCM STATE
  // ==========================================

  readonly fcmToken = signal<string | null>(localStorage.getItem('fcmToken'));

  readonly lastFirebaseNotification = signal<any | null>(null);

  readonly isFirebaseInitialized = signal(false);

  readonly hasFirebasePermission = signal(false);

  private firebaseInitializationPromise?: Promise<void>;

  // ==========================================
  // INITIALIZE ONESIGNAL
  // ==========================================

  initializePushNotifications(): Observable<void> {
    return defer(() => from(this.initializeOneSignal()));
  }

  private async initializeOneSignal(): Promise<void> {
    if (!Capacitor.isNativePlatform()) {
      console.warn('Push notifications require a native platform.');
      return;
    }

    if (this.initializationPromise) {
      return this.initializationPromise;
    }

    this.initializationPromise = (async () => {
      this.registerPushListeners();

      await OneSignal.initialize(this.APP_ID);

      this.isPushInitialized.set(true);

      await this.checkNotificationPermission();

      await this.getSubscriptionId();

      console.log('OneSignal initialized successfully.');
    })();

    try {
      await this.initializationPromise;
    } catch (error) {
      this.initializationPromise = undefined;

      console.error('OneSignal initialization failed:', error);

      throw error;
    }
  }

  // ==========================================
  // INITIALIZE FIREBASE MESSAGING
  // ==========================================

  initializeFirebaseMessaging(): Observable<void> {
    return defer(() => {
      if (!Capacitor.isNativePlatform()) {
        console.warn('Firebase Messaging requires a native platform.');
        return of(undefined);
      }

      if (this.firebaseInitializationPromise) {
        return from(this.firebaseInitializationPromise);
      }

      this.firebaseInitializationPromise = this.registerFirebaseListeners()
        .then(() => {
          this.isFirebaseInitialized.set(true);

          console.log('Firebase Messaging initialized successfully.');
        })
        .catch((error) => {
          this.firebaseInitializationPromise = undefined;

          console.error('Firebase Messaging initialization failed:', error);

          throw error;
        });

      return from(this.firebaseInitializationPromise);
    });
  }

  // ==========================================
  // ONESIGNAL EVENT LISTENERS
  // ==========================================

  private registerPushListeners(): void {
    // Notification clicked
    OneSignal.Notifications.addEventListener('click', (event) => {
      const notification = event.notification;

      console.log('Notification clicked:', notification);

      this.lastPushNotification.set(notification);

      this.refreshNotifications();
    });

    // Permission changed
    OneSignal.Notifications.addEventListener('permissionChange', (granted) => {
      this.hasNotificationPermission.set(granted);

      console.log('Notification permission:', granted);
    });

    // Push subscription changed
    OneSignal.User.pushSubscription.addEventListener('change', (event: any) => {
      this.subscriptionId.set(event.current.id);

      console.log('Push subscription changed:', event.current);
    });
  }

  // ==========================================
  // FIREBASE EVENT LISTENERS
  // ==========================================

  private async registerFirebaseListeners(): Promise<void> {
    await Promise.all([
      // FCM Token received or refreshed
      FirebaseMessaging.addListener('tokenReceived', (event) => {
        this.updateFCMToken(event.token);
      }),

      // Notification received while app is open
      FirebaseMessaging.addListener('notificationReceived', (event) => {
        console.log('========== FCM RECEIVED ==========');
        console.log('Notification:', event.notification);

        this.lastFirebaseNotification.set({
          ...event.notification,
          title: event.notification.title || 'Tradeline',
          body: event.notification.body || '',
        });

        this.refreshNotifications();
      }),

      // User clicked Firebase notification
      FirebaseMessaging.addListener('notificationActionPerformed', (event) => {
        console.log('========== FCM CLICKED ==========');
        console.log('Notification:', event.notification);

        this.lastFirebaseNotification.set(event.notification);

        this.refreshNotifications();
      }),
    ]);
  }

  // ==========================================
  // UPDATE FCM TOKEN
  // ==========================================

  private updateFCMToken(token: string): void {
    if (!token) {
      return;
    }

    this.fcmToken.set(token);

    localStorage.setItem('fcmToken', token);

    console.log('FCM Token Updated:', token);

    // TODO: Save updated token in Firestore.
  }

  // ==========================================
  // REQUEST FIREBASE PERMISSION
  // ==========================================

  requestFirebasePermission(): Observable<boolean> {
    return defer(() => {
      if (!Capacitor.isNativePlatform()) {
        return of(false);
      }

      return from(FirebaseMessaging.requestPermissions()).pipe(
        map((result) => result.receive === 'granted'),

        tap((granted) => {
          this.hasFirebasePermission.set(granted);

          console.log('Firebase Permission:', granted);
        }),

        catchError((error) => {
          console.error('Firebase Permission Error:', error);

          return of(false);
        })
      );
    });
  }

  // ==========================================
  // CHECK FIREBASE PERMISSION
  // ==========================================

  checkFirebasePermission(): Observable<boolean> {
    return defer(() => {
      if (!Capacitor.isNativePlatform()) {
        return of(false);
      }

      return from(FirebaseMessaging.checkPermissions()).pipe(
        map((result) => result.receive === 'granted'),

        tap((granted) => {
          this.hasFirebasePermission.set(granted);
        }),

        catchError((error) => {
          console.error('Firebase Permission Check Error:', error);

          return of(false);
        })
      );
    });
  }

  // ==========================================
  // GET FIREBASE FCM TOKEN
  // ==========================================

  // getFCMToken(): Observable<string | null> {
  //   return defer(() => {
  //     if (!Capacitor.isNativePlatform()) {
  //       return of(null);
  //     }

  //     return from(FirebaseMessaging.getToken()).pipe(
  //       map((result) => result.token),

  //       tap((token) => {
  //         this.updateFCMToken(token);
  //       }),

  //       catchError((error) => {
  //         console.error('FCM Token Error:', error);

  //         return of(null);
  //       })
  //     );
  //   });
  // }

  getFCMToken(): Observable<string | null> {
    return defer(() => {
      if (!Capacitor.isNativePlatform()) {
        console.error(
          'Not running on native platform:',
          Capacitor.getPlatform()
        );

        return of(null);
      }

      return from(FirebaseMessaging.checkPermissions()).pipe(
        switchMap((permission) => {
          console.log('FCM Permission:', permission);

          if (permission.receive !== 'granted') {
            throw new Error('FCM notification permission is not granted.');
          }

          return from(FirebaseMessaging.getToken());
        }),

        tap((result) => {
          console.log('FCM Token Response:', result);
        }),

        map((result) => result.token || null),

        tap((token) => {
          if (token) {
            this.updateFCMToken(token);

            console.log('Current FCM Token:', token);
          } else {
            console.error('Firebase returned an empty token.');
          }
        }),

        catchError((error) => {
          console.error('FCM Token Error:', error);

          return of(null);
        })
      );
    });
  }

  // ==========================================
  // CHECK ONESIGNAL PERMISSION
  // ==========================================

  async checkNotificationPermission(): Promise<boolean> {
    if (!Capacitor.isNativePlatform()) {
      return false;
    }

    try {
      const granted = await OneSignal.Notifications.hasPermission();

      this.hasNotificationPermission.set(granted);

      return granted;
    } catch (error) {
      console.error('Permission check error:', error);

      return false;
    }
  }

  // ==========================================
  // REQUEST ONESIGNAL PERMISSION
  // ==========================================

  requestNotificationPermission(): Observable<boolean> {
    return defer(async () => {
      if (!Capacitor.isNativePlatform()) {
        return false;
      }

      await this.initializeOneSignal();

      const granted = await OneSignal.Notifications.requestPermission(true);

      this.hasNotificationPermission.set(granted);

      if (granted) {
        await this.getSubscriptionId();
      }

      return granted;
    });
  }

  // ==========================================
  // GET ONESIGNAL SUBSCRIPTION ID
  // ==========================================

  async getSubscriptionId(): Promise<string | null> {
    if (!Capacitor.isNativePlatform()) {
      return null;
    }

    try {
      const id = await OneSignal.User.pushSubscription.getIdAsync();

      this.subscriptionId.set(id);

      console.log('OneSignal Subscription ID:', id);

      return id;
    } catch (error) {
      console.error('Subscription ID error:', error);

      return null;
    }
  }

  // ==========================================
  // REFRESH BACKEND NOTIFICATIONS
  // ==========================================

  refreshNotifications(): void {
    this.refreshTrigger$.next();
  }

  // ==========================================
  // CLEAR PUSH NOTIFICATIONS
  // ==========================================

  async clearPushNotifications(): Promise<void> {
    if (!Capacitor.isNativePlatform()) {
      return;
    }

    try {
      await OneSignal.Notifications.clearAll();
    } catch (error) {
      console.error('Clear notifications error:', error);
    }
  }

  // ==========================================
  // CLEAR FIREBASE NOTIFICATIONS
  // ==========================================

  clearFirebaseNotifications(): Observable<void> {
    return defer(() => {
      if (!Capacitor.isNativePlatform()) {
        return of(undefined);
      }

      return from(FirebaseMessaging.removeAllListeners()).pipe(
        map(() => undefined),

        tap(() => {
          console.log('Firebase listeners removed.');
        })
      );
    });
  }
}
