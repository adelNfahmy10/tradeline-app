import { Component, computed, inject, Signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  IonContent,
  IonHeader,
  IonTitle,
  IonToolbar,
  IonButtons,
  IonMenuButton,
  IonCardTitle,
  IonFooter,
  IonRefresher,
  IonRefresherContent,
} from '@ionic/angular/standalone';
import { AuthService } from 'src/core/services/auth/auth-service';
import { CategoriesService } from 'src/core/services/categories/categories-service';
import { TabsComponent } from 'src/app/components/tabs/tabs.component';
import { SkeletonReloadPage } from '../skeleton-reload/skeleton-reload.page';
import { RouterLink } from '@angular/router';
import { SearchModalComponent } from 'src/app/components/search-modal/search-modal.component';
import { GlobalRefreshService } from 'src/core/services/global-refresh/global-refresh-service';

@Component({
  selector: 'app-shop',
  templateUrl: './shop.page.html',
  styleUrls: ['./shop.page.scss'],
  standalone: true,
  imports: [
    IonRefresherContent,
    IonRefresher,
    IonFooter,
    IonButtons,
    IonContent,
    IonHeader,
    IonTitle,
    IonToolbar,
    CommonModule,
    FormsModule,
    IonMenuButton,
    TabsComponent,
    SkeletonReloadPage,
    RouterLink,
    SearchModalComponent,
  ],
})
export class ShopPage {
  private readonly _AuthService = inject(AuthService);
  private readonly _CategoriesService = inject(CategoriesService);
  private readonly _GlobalRefreshService = inject(GlobalRefreshService);
  
  categories: Signal<any[]> = computed(() =>
    this._CategoriesService.catBanners(),
  );
  token = this._AuthService.token;

  handleRefresh(event: any) {
    this._GlobalRefreshService.refresh();

    setTimeout(() => {
      event.target.complete();
    }, 1500);
  }
}
