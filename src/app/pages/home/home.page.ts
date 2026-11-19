import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

import {
  IonContent,
  IonHeader,
  IonTitle,
  IonToolbar,
  IonButtons,
  IonMenuButton,
  IonFooter,
  IonRefresher,
  IonRefresherContent,
  IonMenuToggle,
} from '@ionic/angular/standalone';

import { OfferSliderComponent } from 'src/app/components/offer-slider/offer-slider.component';
import { CategoriesSliderComponent } from 'src/app/components/categories-slider/categories-slider.component';
import { ListItemsHomeComponent } from 'src/app/components/list-items-home/list-items-home.component';
import { TabsComponent } from 'src/app/components/tabs/tabs.component';
import { SearchModalComponent } from 'src/app/components/search-modal/search-modal.component';

import { AuthService } from 'src/core/services/auth/auth-service';
import { PointsService } from 'src/core/services/points/points-service';
import { GlobalRefreshService } from 'src/core/services/global-refresh/global-refresh-service';

@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
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
    IonMenuButton,
    IonFooter,
    IonRefresher,
    IonRefresherContent,
    IonMenuToggle,

    // Components
    OfferSliderComponent,
    CategoriesSliderComponent,
    ListItemsHomeComponent,
    TabsComponent,
    SearchModalComponent,
  ],
})
export class HomePage {
  private readonly authService = inject(AuthService);
  private readonly pointsService = inject(PointsService);
  private readonly globalRefreshService = inject(GlobalRefreshService);

  readonly token = this.authService.token;
  readonly points = this.pointsService.points;

  handleRefresh(event: CustomEvent): void {
    this.globalRefreshService.refresh();

    setTimeout(() => {
      (event.target as HTMLIonRefresherElement).complete();
    }, 1500);
  }
}
