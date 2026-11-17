import {
  Component,
  computed,
  inject,
  OnDestroy,
  OnInit,
  signal,
} from '@angular/core';

import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import {
  IonContent,
  IonHeader,
  IonTitle,
  IonToolbar,
  IonBackButton,
  IonButtons,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardContent,
  IonIcon,
  IonFooter,
  IonRefresher,
  IonRefresherContent,
} from '@ionic/angular/standalone';

import { App } from '@capacitor/app';
import { PluginListenerHandle } from '@capacitor/core';
import { Geolocation } from '@capacitor/geolocation';

import {
  AndroidSettings,
  IOSSettings,
  NativeSettings,
} from 'capacitor-native-settings';

import { firstValueFrom } from 'rxjs';

import { NearByStoreService } from 'src/core/services/premium/near-by-store-service';
import { TabsComponent } from 'src/app/components/tabs/tabs.component';

@Component({
  selector: 'app-nearbystore',
  templateUrl: './nearbystore.page.html',
  styleUrls: ['./nearbystore.page.scss'],
  standalone: true,
  imports: [
    IonRefresherContent,
    IonRefresher,
    IonFooter,
    IonIcon,
    IonCardContent,
    IonCardTitle,
    IonCardHeader,
    IonCard,
    IonButtons,
    IonBackButton,
    IonContent,
    IonHeader,
    IonTitle,
    IonToolbar,
    CommonModule,
    FormsModule,
    TabsComponent,
  ],
})
export class NearbystorePage implements OnInit, OnDestroy {
  private readonly _NearByStoreService = inject(NearByStoreService);

  stores = computed(() => this._NearByStoreService.stores());

  userCoordinates: {
    latitude: number;
    longitude: number;
  } | null = null;

  loading = signal(false);

  locationStatus = signal<
    'loading' | 'ready' | 'services-disabled' | 'permission-denied' | 'error'
  >('loading');

  private isPageActive = false;
  private appStateListener?: PluginListenerHandle;

  ngOnInit(): void {
    this.registerAppStateListener();
  }

  // Ionic lifecycle: runs whenever the page is entered
  async ionViewWillEnter(): Promise<void> {
    this.isPageActive = true;

    await this.loadNearbyStores(true);
  }

  ionViewWillLeave(): void {
    this.isPageActive = false;
  }

  // Detect returning from Android / iOS Settings
  private async registerAppStateListener(): Promise<void> {
    this.appStateListener = await App.addListener(
      'appStateChange',
      async ({ isActive }) => {
        if (isActive && this.isPageActive) {
          console.log('App returned to foreground. Checking location...');

          const shouldRequestPermission =
            this.locationStatus() === 'services-disabled';

          await this.loadNearbyStores(shouldRequestPermission);
        }
      }
    );
  }

  private async loadNearbyStores(requestPermission: boolean): Promise<void> {
    if (this.loading()) return;

    this.loading.set(true);
    this.locationStatus.set('loading');

    try {
      let permission = await Geolocation.checkPermissions();

      const hasPermission =
        permission.location === 'granted' ||
        permission.coarseLocation === 'granted';

      // Request permission only when needed
      if (!hasPermission && requestPermission) {
        permission = await Geolocation.requestPermissions({
          permissions: ['location', 'coarseLocation'],
        });
      }

      const allowed =
        permission.location === 'granted' ||
        permission.coarseLocation === 'granted';

      if (!allowed) {
        this.locationStatus.set('permission-denied');
        return;
      }

      // Get current location
      const position = await Geolocation.getCurrentPosition({
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 0,
      });

      this.userCoordinates = {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
      };

      // Load stores and calculate distances
      await firstValueFrom(
        this._NearByStoreService.getStoresWithDistance(
          position.coords.latitude,
          position.coords.longitude
        )
      );

      this.locationStatus.set('ready');
    } catch (error: any) {
      console.error('Nearby Store Location Error:', error);

      const errorMessage = String(error?.message ?? error).toLowerCase();

      const errorCode = String(error?.code ?? '');

      if (
        errorCode === 'OS-PLUG-GLOC-0007' ||
        errorMessage.includes('location services are not enabled') ||
        errorMessage.includes('location services')
      ) {
        this.locationStatus.set('services-disabled');
      } else {
        this.locationStatus.set('error');
      }
    } finally {
      this.loading.set(false);
    }
  }

  async handleRefresh(event: any): Promise<void> {
    try {
      await this.loadNearbyStores(false);
    } finally {
      event.target.complete();
    }
  }

  openMap(coordinates: string): void {
    const [lat, lng] = coordinates.split(',').map(Number);

    if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
      return;
    }

    window.open(
      `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`,
      '_blank'
    );
  }

  async openLocationSettings(): Promise<void> {
    try {
      await NativeSettings.open({
        optionAndroid: AndroidSettings.Location,
        optionIOS: IOSSettings.LocationServices,
      });
    } catch (error) {
      console.error('Failed to open location settings:', error);
    }
  }

  async ngOnDestroy(): Promise<void> {
    this.isPageActive = false;

    await this.appStateListener?.remove();
  }

  async handleManualRetry(): Promise<void> {
    await this.loadNearbyStores(true);
  }
}
