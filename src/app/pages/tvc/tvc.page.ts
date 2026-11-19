import { Component, inject, OnInit } from '@angular/core';
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
  IonRefresher,
  IonRefresherContent,
  IonMenuToggle,
} from '@ionic/angular/standalone';
import { AuthService } from 'src/core/services/auth/auth-service';
import { PointsService } from 'src/core/services/points/points-service';
import { TabsComponent } from 'src/app/components/tabs/tabs.component';
import { RouterLink } from '@angular/router';
import { SearchModalComponent } from 'src/app/components/search-modal/search-modal.component';
import { GlobalRefreshService } from 'src/core/services/global-refresh/global-refresh-service';

@Component({
  selector: 'app-tvc',
  templateUrl: './tvc.page.html',
  styleUrls: ['./tvc.page.scss'],
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
    RouterLink,
    SearchModalComponent,
    IonMenuToggle,
  ],
})
export class TvcPage {
  private readonly _AuthService = inject(AuthService);
  private readonly _PointsService = inject(PointsService);
  private readonly _GlobalRefreshService = inject(GlobalRefreshService);

  token = this._AuthService.token;
  pointsData = this._PointsService.pointsData;
  userName = localStorage.getItem('userName');

  handleRefresh(event: any) {
    this._GlobalRefreshService.refresh();

    setTimeout(() => {
      event.target.complete();
    }, 1500);
  }
}
