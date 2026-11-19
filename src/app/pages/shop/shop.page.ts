import { Component, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

import {
  IonContent,
  IonHeader,
  IonTitle,
  IonToolbar,
  IonButtons,
  IonMenuToggle,
  IonFooter,
  IonRefresher,
  IonRefresherContent,
} from '@ionic/angular/standalone';

import { AuthService } from 'src/core/services/auth/auth-service';
import { CategoriesService } from 'src/core/services/categories/categories-service';
import { GlobalRefreshService } from 'src/core/services/global-refresh/global-refresh-service';

import { TabsComponent } from 'src/app/components/tabs/tabs.component';
import { SearchModalComponent } from 'src/app/components/search-modal/search-modal.component';
import { SkeletonReloadPage } from '../skeleton-reload/skeleton-reload.page';

@Component({
  selector: 'app-shop',
  templateUrl: './shop.page.html',
  styleUrls: ['./shop.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,

    // Ionic
    IonContent,
    IonHeader,
    IonTitle,
    IonToolbar,
    IonButtons,
    IonMenuToggle,
    IonFooter,
    IonRefresher,
    IonRefresherContent,

    // Components
    TabsComponent,
    SearchModalComponent,
    SkeletonReloadPage,
  ],
})
export class ShopPage {
  private readonly authService = inject(AuthService);
  private readonly categoriesService = inject(CategoriesService);
  private readonly globalRefreshService = inject(GlobalRefreshService);

  readonly token = this.authService.token;

  readonly categories = computed(() => this.categoriesService.catBanners());

  handleRefresh(event: CustomEvent): void {
    this.globalRefreshService.refresh();

    setTimeout(() => {
      (event.target as HTMLIonRefresherElement).complete();
    }, 1500);
  }
}
