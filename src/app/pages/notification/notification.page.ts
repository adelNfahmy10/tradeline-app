import { Component, computed, inject, OnInit, Signal } from '@angular/core';
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
} from '@ionic/angular/standalone';
import { NotificationService } from 'src/core/services/notification/notification-service';
import { AuthService } from 'src/core/services/auth/auth-service';
import { TabsComponent } from 'src/app/components/tabs/tabs.component';
import { SkeletonReloadPage } from '../skeleton-reload/skeleton-reload.page';
import { RouterLink } from '@angular/router';
import { SearchModalComponent } from 'src/app/components/search-modal/search-modal.component';
import { GlobalRefreshService } from 'src/core/services/global-refresh/global-refresh-service';

@Component({
  selector: 'app-notification',
  templateUrl: './notification.page.html',
  styleUrls: ['./notification.page.scss'],
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
export class NotificationPage {
  private readonly _NotificationSerives = inject(NotificationService);
  private readonly _AuthService = inject(AuthService);
  private readonly _GlobalRefreshService = inject(GlobalRefreshService);

  token = this._AuthService.token;
  notifications: Signal<any[]> = computed(() =>
    this._NotificationSerives.notifications(),
  );

  handleRefresh(event: any) {
    this._GlobalRefreshService.refresh();

    setTimeout(() => {
      event.target.complete();
    }, 1500);
  }
}
