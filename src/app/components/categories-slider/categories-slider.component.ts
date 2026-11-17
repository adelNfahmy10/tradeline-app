import {
  Component,
  computed,
  CUSTOM_ELEMENTS_SCHEMA,
  effect,
  inject,
  Signal,
} from '@angular/core';
import { RouterLink } from '@angular/router';
import { CategoriesService } from 'src/core/services/categories/categories-service';
import { GlobalRefreshService } from 'src/core/services/global-refresh/global-refresh-service';

@Component({
  selector: 'app-categories-slider',
  templateUrl: './categories-slider.component.html',
  styleUrls: ['./categories-slider.component.scss'],
  standalone: true,
  imports: [RouterLink],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class CategoriesSliderComponent {
  private readonly _CategoriesService = inject(CategoriesService);
  private readonly _GlobalRefreshService = inject(GlobalRefreshService);

  categoriesBanners: Signal<any[]> = computed(() =>
    this._CategoriesService.catBanners(),
  );

  private lastRefresh = 0;

  constructor() {
    effect(() => {
      const refreshId = this._GlobalRefreshService.refreshTrigger();

      if (refreshId === 0 || refreshId === this.lastRefresh) {
        return;
      }

      this.lastRefresh = refreshId;

      this.refreshCategories();
    });
  }

  private refreshCategories(): void {
    this._CategoriesService.catBanners();
  }
}
