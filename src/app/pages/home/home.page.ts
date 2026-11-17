import { Component, inject, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  IonContent,
  IonHeader,
  IonTitle,
  IonToolbar,
  IonButtons,
  IonMenuButton,
  IonFooter,
  IonModal,
  IonRefresher,
  IonRefresherContent,
} from '@ionic/angular/standalone';
import { OfferSliderComponent } from 'src/app/components/offer-slider/offer-slider.component';
import { SkeletonReloadPage } from '../skeleton-reload/skeleton-reload.page';
import { CategoriesSliderComponent } from 'src/app/components/categories-slider/categories-slider.component';
import { ListItemsHomeComponent } from 'src/app/components/list-items-home/list-items-home.component';
import { AuthService } from 'src/core/services/auth/auth-service';
import { TabsComponent } from 'src/app/components/tabs/tabs.component';
import { RouterLink } from '@angular/router';
import { MenuController } from '@ionic/angular';
import { PointsService } from 'src/core/services/points/points-service';
import { SearchModalComponent } from 'src/app/components/search-modal/search-modal.component';
import { GlobalRefreshService } from 'src/core/services/global-refresh/global-refresh-service';

@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
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
    OfferSliderComponent,
    CategoriesSliderComponent,
    ListItemsHomeComponent,
    IonMenuButton,
    TabsComponent,
    RouterLink,
    SearchModalComponent,
  ],
})
export class HomePage {
  private readonly _AuthService = inject(AuthService);
  private readonly _PointsService = inject(PointsService);
  private readonly _GlobalRefreshService = inject(GlobalRefreshService);

  token = this._AuthService.token;
  points =
    this._PointsService.points || localStorage.getItem('userTradelinePoints');

  handleRefresh(event: any) {
    this._GlobalRefreshService.refresh();

    setTimeout(() => {
      event.target.complete();
    }, 1500);
  }
}
