import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  IonContent,
  IonHeader,
  IonTitle,
  IonToolbar,
  IonButtons,
  IonBackButton,
  IonFooter,
  IonRefresher,
  IonRefresherContent,
} from '@ionic/angular/standalone';
import { TabsComponent } from 'src/app/components/tabs/tabs.component';
import { AuthService } from 'src/core/services/auth/auth-service';
import { PointsService } from 'src/core/services/points/points-service';
import { GlobalRefreshService } from 'src/core/services/global-refresh/global-refresh-service';

@Component({
  selector: 'app-tvc-details',
  templateUrl: './tvc-details.page.html',
  styleUrls: ['./tvc-details.page.scss'],
  standalone: true,
  imports: [
    IonRefresherContent,
    IonRefresher,
    IonFooter,
    IonBackButton,
    IonButtons,
    IonContent,
    IonHeader,
    IonTitle,
    IonToolbar,
    CommonModule,
    FormsModule,
    TabsComponent,
  ],
})
export class TvcDetailsPage {
  private readonly _AuthService = inject(AuthService);
  private readonly _PointsService = inject(PointsService);
  private readonly _GlobalRefreshService = inject(GlobalRefreshService);

  token = this._AuthService.token;
  pointsData = this._PointsService.pointsData;
  pointsHistory: any[] = [];
  userName = localStorage.getItem('userName');
  phone = localStorage.getItem('phone');

  handleRefresh(event: any) {
    this._GlobalRefreshService.refresh();

    setTimeout(() => {
      event.target.complete();
    }, 1500);
  }
}
