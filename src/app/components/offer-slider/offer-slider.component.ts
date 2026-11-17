import {
  Component,
  computed,
  CUSTOM_ELEMENTS_SCHEMA,
  effect,
  inject,
  Signal,
} from '@angular/core';

import { OfferSilderService } from 'src/core/services/offer-silder/offer-silder-service';
import { SkeletonReloadPage } from 'src/app/pages/skeleton-reload/skeleton-reload.page';
import { RouterLink } from '@angular/router';
import { GlobalRefreshService } from 'src/core/services/global-refresh/global-refresh-service';

@Component({
  selector: 'app-offer-slider',
  standalone: true,
  templateUrl: './offer-slider.component.html',
  styleUrls: ['./offer-slider.component.scss'],
  imports: [SkeletonReloadPage, RouterLink],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class OfferSliderComponent {
  private readonly _OfferSilderService = inject(OfferSilderService);
  private readonly _GlobalRefreshService = inject(GlobalRefreshService);

  offerBanners: Signal<any[]> = computed(() =>
    this._OfferSilderService.offerBanners(),
  );

  private lastRefresh = 0;

  constructor() {
    effect(() => {
      const refreshId = this._GlobalRefreshService.refreshTrigger();

      if (refreshId === 0 || refreshId === this.lastRefresh) {
        return;
      }

      this.lastRefresh = refreshId;

      this.refreshOffers();
    });
  }

  private refreshOffers(): void {
    this._OfferSilderService.offerBanners();
  }
}
