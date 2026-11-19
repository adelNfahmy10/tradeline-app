import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  IonContent,
  IonHeader,
  IonTitle,
  IonToolbar,
  IonRow,
  IonCol,
  IonButtons,
  IonBackButton,
  IonFooter,
  IonRefresher,
  IonRefresherContent,
} from '@ionic/angular/standalone';
import { AuthService } from 'src/core/services/auth/auth-service';
import { PointsService } from 'src/core/services/points/points-service';
import { TabsComponent } from 'src/app/components/tabs/tabs.component';
import { GlobalRefreshService } from 'src/core/services/global-refresh/global-refresh-service';

@Component({
  selector: 'app-tvc-history',
  templateUrl: './tvc-history.page.html',
  styleUrls: ['./tvc-history.page.scss'],
  standalone: true,
  imports: [
    IonRefresherContent,
    IonRefresher,
    IonFooter,
    IonBackButton,
    IonButtons,
    IonCol,
    IonRow,
    IonContent,
    IonHeader,
    IonTitle,
    IonToolbar,
    CommonModule,
    FormsModule,
    TabsComponent,
  ],
})
export class TvcHistoryPage implements OnInit {
  private readonly _AuthService = inject(AuthService);
  private readonly _PointsService = inject(PointsService);
  private readonly _GlobalRefreshService = inject(GlobalRefreshService);
  token = this._AuthService.token;
  pointsData = this._PointsService.pointsData;
  pointsHistory: any[] = [];
  userName = localStorage.getItem('userName');
  phone = localStorage.getItem('phone');

  ngOnInit() {
    this.getTvcHistory();
  }

  getTvcHistory(): void {
    this._PointsService.getPointsToken().subscribe({
      next: (res) => {
        this._PointsService
          .getPointsHistory(res.access_token, this.phone)
          .subscribe({
            next: (res) => {
              this.pointsHistory = res.data;
              console.log(this.pointsHistory);
            },
          });
      },
    });
  }

  handleRefresh(event: any) {
    this._GlobalRefreshService.refresh();

    setTimeout(() => {
      event.target.complete();
    }, 1500);
  }
}
