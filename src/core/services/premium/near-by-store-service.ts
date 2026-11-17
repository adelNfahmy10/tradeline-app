import { HttpClient } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { environment } from 'src/environments/environment.prod';
import { Observable, tap } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class NearByStoreService {
  private readonly _HttpClient = inject(HttpClient);

  stores = signal<any[]>([]);

  private getDistance(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
  ): number {
    const R = 6371;

    const dLat = this.deg2rad(lat2 - lat1);
    const dLon = this.deg2rad(lon2 - lon1);

    const a =
      Math.sin(dLat / 2) ** 2 +
      Math.cos(this.deg2rad(lat1)) *
        Math.cos(this.deg2rad(lat2)) *
        Math.sin(dLon / 2) ** 2;

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c;
  }

  private deg2rad(deg: number): number {
    return deg * (Math.PI / 180);
  }

  getStoresWithDistance(userLat: number, userLng: number): Observable<any[]> {
    return this._HttpClient.get<any[]>(`${environment.baseUrl}stores/`).pipe(
      tap((res) => {
        const updated = res
          .map((store) => {
            let distance: number | null = null;

            if (store.coordinates) {
              const [lat, lng] = store.coordinates.split(',').map(Number);

              if (Number.isFinite(lat) && Number.isFinite(lng)) {
                distance = this.getDistance(userLat, userLng, lat, lng);
              }
            }

            return {
              ...store,
              distance,
            };
          })
          .sort((a, b) => (a.distance ?? Infinity) - (b.distance ?? Infinity));

        this.stores.set(updated);
      })
    );
  }

  clearStores(): void {
    this.stores.set([]);
  }
}
