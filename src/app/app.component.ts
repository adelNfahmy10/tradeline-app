import { DecimalPipe } from '@angular/common';
import { Component, effect, inject, OnInit, signal } from '@angular/core';

import { RouterLink, RouterLinkActive } from '@angular/router';

import {
  IonApp,
  IonSplitPane,
  IonMenu,
  IonContent,
  IonList,
  IonListHeader,
  IonNote,
  IonMenuToggle,
  IonItem,
  IonLabel,
  IonRouterOutlet,
  IonRouterLink,
  IonButton,
  IonModal,
  IonToolbar,
  IonHeader,
  IonTitle,
  IonButtons,
  IonToast,
  IonToggle,
  Platform,
} from '@ionic/angular/standalone';

import { addIcons } from 'ionicons';

import {
  mailOutline,
  mailSharp,
  paperPlaneOutline,
  paperPlaneSharp,
  heartOutline,
  heartSharp,
  archiveOutline,
  archiveSharp,
  trashOutline,
  trashSharp,
  warningOutline,
  warningSharp,
  bookmarkOutline,
  bookmarkSharp,
  search,
  personCircle,
  personCircleOutline,
  sunny,
  sunnyOutline,
} from 'ionicons/icons';

import { NgxSpinnerComponent } from 'ngx-spinner';

import { AuthService } from 'src/core/services/auth/auth-service';
import { FavoriteService } from 'src/core/services/favorite/favorite-service';
import { NotificationService } from 'src/core/services/notification/notification-service';
import { PointsService } from 'src/core/services/points/points-service';
import { ToastService } from 'src/core/services/toaster/toast-service';

import {
  catchError,
  concatMap,
  defer,
  EMPTY,
  from,
  map,
  Observable,
  of,
  switchMap,
  tap,
} from 'rxjs';

import { Geolocation } from '@capacitor/geolocation';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
  imports: [
    RouterLink,
    RouterLinkActive,
    IonApp,
    IonSplitPane,
    IonMenu,
    IonContent,
    IonList,
    IonListHeader,
    IonNote,
    IonMenuToggle,
    IonItem,
    IonLabel,
    IonRouterLink,
    IonRouterOutlet,
    DecimalPipe,
    NgxSpinnerComponent,
  ],
})
export class AppComponent implements OnInit {
  private readonly _AuthService = inject(AuthService);
  private readonly _PointsService = inject(PointsService);
  private readonly _FavoriteService = inject(FavoriteService);
  private readonly _ToastService = inject(ToastService);
  private readonly _Platform = inject(Platform);
  private readonly _NotificationService = inject(NotificationService);

  userName: string | null = localStorage.getItem('userName');
  phone: string | null = localStorage.getItem('phone');

  points = this._PointsService.points;
  favoriteCount = this._FavoriteService.favoriteCount;
  token = this._AuthService.token;

  public appPages = [
    {
      title: 'My Account',
      url: '/account-info',
      icon: 'mail',
    },
    {
      title: 'Eeasy Pay',
      url: '/easypay',
      icon: 'paper-plane',
    },
    {
      title: 'My Orders',
      url: '/orders',
      icon: 'heart',
    },
    {
      title: 'TVC History',
      url: '/tvc-history',
      icon: 'archive',
    },
    {
      title: 'Favorites',
      url: '/favorite',
      icon: 'trash',
    },
    {
      title: 'About Us',
      url: '/about-us',
      icon: 'warning',
    },
  ];

  public labels = ['Family', 'Friends', 'Notes', 'Work', 'Travel', 'Reminders'];

  constructor() {
    effect(() => {
      addIcons({
        personCircle,
        personCircleOutline,
        sunny,
        sunnyOutline,
      });

      const token = this.token();

      if (token) {
        this.getFavCount();
      }
    });

    addIcons({
      mailOutline,
      mailSharp,
      paperPlaneOutline,
      paperPlaneSharp,
      heartOutline,
      heartSharp,
      archiveOutline,
      archiveSharp,
      trashOutline,
      trashSharp,
      warningOutline,
      warningSharp,
      bookmarkOutline,
      bookmarkSharp,
      search,
    });
  }

  ngOnInit(): void {
    this.getPoints();

    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)');

    this.initializeDarkPalette(prefersDark.matches);

    prefersDark.addEventListener('change', (mediaQuery) =>
      this.initializeDarkPalette(mediaQuery.matches)
    );

    this.initializeApp();

    this._NotificationService.getFCMToken().subscribe({
      next: (token) => {
        if (token) {
          // alert('FCM Token:\n\n' + token);
          localStorage.setItem('fcmToken', token);
        } else {
          // alert('FCM Token not available!');
        }
      },
      error: (error) => {
        // alert('Error getting FCM Token: ' + error);
      },
    });
  }

  getPoints(): void {
    this.userName = localStorage.getItem('userName');

    if (this.userName && this.phone) {
      this._PointsService.getPointsToken().subscribe({
        next: (res) => {
          this._PointsService
            .getPoints(res.access_token, this.phone!)
            .subscribe({
              next: (res) => {
                const pointsData = JSON.parse(res);

                this._PointsService.pointsData.set(pointsData);

                const pointsTotal = Number(pointsData.TotalPoints ?? 0);

                localStorage.setItem(
                  'userTradelinePoints',
                  pointsTotal.toString()
                );

                this._PointsService.points.set(pointsTotal);
              },
            });
        },
      });
    }
  }

  getFavCount(): void {
    this._FavoriteService.getFavorites().subscribe({
      next: (res: any) => {
        this._FavoriteService.setFavorites(res || []);
      },
    });
  }

  logout(): void {
    this._AuthService.logout();
  }

  // ==========================================
  // APP INITIALIZATION
  // ==========================================

  private initializeApp(): void {
    from(this._Platform.ready())
      .pipe(
        concatMap(() => this.requestAppPermissions()),
        catchError((error) => {
          console.error('App initialization error:', error);
          return EMPTY;
        })
      )
      .subscribe();
  }

  // ==========================================
  // REQUEST ALL APP PERMISSIONS
  // ==========================================

  private requestAppPermissions(): Observable<void> {
    return this._NotificationService.initializePushNotifications().pipe(
      tap(() => console.log('OneSignal initialized')),

      // Firebase initialization
      concatMap(() => this._NotificationService.initializeFirebaseMessaging()),

      // Firebase permission
      concatMap(() =>
        this._NotificationService.checkFirebasePermission().pipe(
          switchMap((granted) => {
            if (granted) {
              return of(true);
            }

            return this._NotificationService.requestFirebasePermission();
          })
        )
      ),

      // Get FCM Token
      concatMap((granted) => {
        console.log('Firebase permission:', granted);

        return granted ? this._NotificationService.getFCMToken() : of(null);
      }),

      tap((token) => {
        if (token) {
          console.log('FCM Device Token:', token);
        }
      }),

      // Keep existing OneSignal permission
      concatMap(() =>
        this._NotificationService.requestNotificationPermission().pipe(
          tap((permission) => console.log('OneSignal permission:', permission)),
          catchError((error) => {
            console.error('OneSignal permission error:', error);

            return of(false);
          })
        )
      ),

      // Keep existing Location Permission
      concatMap(() => this.requestLocationPermission()),

      tap((allowed) => {
        console.log('Location allowed:', allowed);
      }),

      map(() => undefined)
    );
  }

  // ==========================================
  // LOCATION PERMISSION
  // ==========================================
  private requestLocationPermission(): Observable<boolean> {
    return defer(() =>
      from(
        Geolocation.requestPermissions({
          permissions: ['location', 'coarseLocation'],
        })
      )
    ).pipe(
      map((result) => {
        return (
          result.location === 'granted' || result.coarseLocation === 'granted'
        );
      }),
      catchError((error) => {
        console.error('Location Permission Error:', error);
        return of(false);
      })
    );
  }

  // ==========================================
  // MODAL
  // ==========================================

  async canDismiss(data?: undefined, role?: string) {
    return role !== 'gesture';
  }

  // ==========================================
  // DARK MODE
  // ==========================================

  readonly paletteToggle = signal(false);

  initializeDarkPalette(isDark: boolean) {
    this.paletteToggle.set(isDark);
    this.toggleDarkPalette(isDark);
  }

  toggleChange(event: CustomEvent) {
    this.initializeDarkPalette(event.detail.checked);
  }

  toggleDarkPalette(shouldAdd: boolean) {
    document.documentElement.classList.toggle('ion-palette-dark', shouldAdd);
  }
}
