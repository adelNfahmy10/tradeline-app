import { HttpClient } from '@angular/common/http';
import { effect, inject, Injectable, signal, WritableSignal } from '@angular/core';
import { environment } from 'src/environments/environment.prod';

@Injectable({
  providedIn: 'root',
})
export class OfferSilderService {
  private readonly _HttpClient = inject(HttpClient);

  offerBanners: WritableSignal<any[]> = signal<any[]>([]);
  catBanners: WritableSignal<any[]> = signal<any[]>([]);

  constructor() {
    effect(() => {
      this.loadHomeBanners();
    });
  }

  private loadHomeBanners() {
    this._HttpClient.get<any>(`${environment.baseUrl}home?is_mobile=True`).subscribe({
      next: (res) => {
        this.offerBanners.set(res.slider);
      }
    });
  }

}
