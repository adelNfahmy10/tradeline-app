import { DecimalPipe } from '@angular/common';
import { Component, effect, inject, OnInit } from '@angular/core';

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
  IonIcon,
  IonRouterOutlet,
  Platform,
} from '@ionic/angular/standalone';

import { addIcons } from 'ionicons';

import {
  personOutline,
  starOutline,
  cardOutline,
  receiptOutline,
  timeOutline,
  heartOutline,
  informationCircleOutline,
  logOutOutline,
  trashOutline,
} from 'ionicons/icons';

import { NgxSpinnerComponent } from 'ngx-spinner';

import { AuthService } from 'src/core/services/auth/auth-service';
import { FavoriteService } from 'src/core/services/favorite/favorite-service';
import { NotificationService } from 'src/core/services/notification/notification-service';
import { PointsService } from 'src/core/services/points/points-service';

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
    IonIcon,
    IonRouterOutlet,

    DecimalPipe,
    NgxSpinnerComponent,
  ],
})
export class AppComponent implements OnInit {
  // ==========================================
  // DEPENDENCIES
  // ==========================================

  private readonly _AuthService = inject(AuthService);
  private readonly _PointsService = inject(PointsService);
  private readonly _FavoriteService = inject(FavoriteService);
  private readonly _Platform = inject(Platform);
  private readonly _NotificationService = inject(NotificationService);

  // ==========================================
  // USER DATA
  // ==========================================

  userName: string | null = localStorage.getItem('userName');

  phone: string | null = localStorage.getItem('phone');

  points = this._PointsService.points;

  favoriteCount = this._FavoriteService.favoriteCount;

  token = this._AuthService.token;

  // ==========================================
  // APPLICATION PAGES
  // ==========================================

  readonly appPages = [
    {
      title: 'My Account',
      url: '/account-info',
      icon: 'person-outline',
    },
    {
      title: 'Easy Pay',
      url: '/easypay',
      icon: 'card-outline',
    },
    {
      title: 'My Orders',
      url: '/orders',
      icon: 'receipt-outline',
    },
    {
      title: 'TVC History',
      url: '/tvc-history',
      icon: 'time-outline',
    },
    {
      title: 'Favorites',
      url: '/favorite',
      icon: 'heart-outline',
    },
    {
      title: 'About Us',
      url: '/about-us',
      icon: 'information-circle-outline',
    },
  ];

  // ==========================================
  // CONSTRUCTOR
  // ==========================================

  constructor() {
    // Register Ionic Icons once.
    addIcons({
      'person-outline': personOutline,
      'star-outline': starOutline,
      'card-outline': cardOutline,
      'receipt-outline': receiptOutline,
      'time-outline': timeOutline,
      'heart-outline': heartOutline,
      'information-circle-outline': informationCircleOutline,
      'log-out-outline': logOutOutline,
      'trash-outline': trashOutline,
    });

    // Update favorites whenever authentication changes.
    effect(() => {
      const currentToken = this.token();

      if (currentToken) {
        this.getFavCount();
      }
    });
  }

  // ==========================================
  // COMPONENT INITIALIZATION
  // ==========================================

  ngOnInit(): void {
    this.getPoints();

    // Initialize system theme.
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)');

    this.initializeDarkPalette(prefersDark.matches);

    prefersDark.addEventListener('change', (event) => {
      this.initializeDarkPalette(event.matches);
    });

    // Initialize native app services.
    this.initializeApp();
  }

  // ==========================================
  // GET USER POINTS
  // ==========================================

  getPoints(): void {
    this.userName = localStorage.getItem('userName');
    this.phone = localStorage.getItem('phone');

    const currentPhone = this.phone;

    if (!currentPhone) {
      return;
    }

    this._PointsService
      .getPointsToken()
      .pipe(
        // Get points using the access token.
        switchMap((res) =>
          this._PointsService.getPoints(res.access_token, currentPhone)
        ),

        // Parse response.
        map((res) => {
          return typeof res === 'string' ? JSON.parse(res) : res;
        }),

        // Update points state.
        tap((pointsData) => {
          this._PointsService.pointsData.set(pointsData);

          const pointsTotal = Number(pointsData?.TotalPoints ?? 0);

          const safePoints = Number.isFinite(pointsTotal) ? pointsTotal : 0;

          localStorage.setItem('userTradelinePoints', safePoints.toString());

          this._PointsService.points.set(safePoints);
        }),

        // Handle errors.
        catchError((error) => {
          console.error('Get Points Error:', error);
          return EMPTY;
        })
      )
      .subscribe();
  }

  // ==========================================
  // GET FAVORITES COUNT
  // ==========================================

  getFavCount(): void {
    this._FavoriteService
      .getFavorites()
      .pipe(
        tap((res: any) => {
          this._FavoriteService.setFavorites(res || []);
        }),

        catchError((error) => {
          console.error('Get Favorites Error:', error);
          return EMPTY;
        })
      )
      .subscribe();
  }

  // ==========================================
  // LOGOUT
  // ==========================================

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
          console.error('App Initialization Error:', error);
          return EMPTY;
        })
      )
      .subscribe();
  }

  // ==========================================
  // REQUEST APP PERMISSIONS
  // ==========================================

  private requestAppPermissions(): Observable<void> {
    return this._NotificationService.initializePushNotifications().pipe(
      tap(() => {
        console.log('OneSignal initialized');
      }),

      // Initialize Firebase.
      concatMap(() => this._NotificationService.initializeFirebaseMessaging()),

      // Check Firebase permission.
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

      // Get FCM Token.
      concatMap((granted) => {
        console.log('Firebase permission:', granted);

        return granted ? this._NotificationService.getFCMToken() : of(null);
      }),

      // Save FCM Token once.
      tap((token) => {
        if (token) {
          localStorage.setItem('fcmToken', token);
        }
      }),

      // Request OneSignal permission.
      concatMap(() =>
        this._NotificationService.requestNotificationPermission().pipe(
          tap((permission) => {
            console.log('OneSignal permission:', permission);
          }),

          catchError((error) => {
            console.error('OneSignal Permission Error:', error);

            return of(false);
          })
        )
      ),

      // Request location permission.
      concatMap(() => this.requestLocationPermission()),

      tap((allowed) => {
        console.log('Location allowed:', allowed);
      }),

      map((): void => undefined)
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
  // DARK MODE
  // ==========================================

  initializeDarkPalette(isDark: boolean): void {
    document.documentElement.classList.toggle('ion-palette-dark', isDark);
  }
}
