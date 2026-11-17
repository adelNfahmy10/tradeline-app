import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  IonContent,
  IonHeader,
  IonTitle,
  IonToolbar,
  IonBackButton,
  IonButtons,
  IonRefresher,
  IonRefresherContent,
  IonFooter,
} from '@ionic/angular/standalone';
import { FavoriteService } from 'src/core/services/favorite/favorite-service';
import { RouterLink } from '@angular/router';
import { GlobalRefreshService } from 'src/core/services/global-refresh/global-refresh-service';
import { TabsComponent } from 'src/app/components/tabs/tabs.component';

@Component({
  selector: 'app-favorite',
  templateUrl: './favorite.page.html',
  styleUrls: ['./favorite.page.scss'],
  standalone: true,
  imports: [
    IonRefresherContent,
    IonRefresher,
    IonButtons,
    IonBackButton,
    IonContent,
    IonHeader,
    IonTitle,
    IonToolbar,
    CommonModule,
    FormsModule,
    RouterLink,
    IonFooter,
    TabsComponent,
  ],
})
export class FavoritePage implements OnInit {
  private readonly _FavoriteService = inject(FavoriteService);
  private readonly _GlobalRefreshService = inject(GlobalRefreshService);

  allFavorites = this._FavoriteService.allFavorites;

  ngOnInit() {
    this.getAllFavorites();
  }

  getAllFavorites(): void {
    this._FavoriteService.getFavorites().subscribe({
      next: (res) => {
        this._FavoriteService.setFavorites(res || []);
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
