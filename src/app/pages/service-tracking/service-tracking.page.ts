import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  IonContent,
  IonHeader,
  IonTitle,
  IonToolbar,
  IonButtons,
  IonFooter,
} from '@ionic/angular/standalone';
import { AuthService } from 'src/core/services/auth/auth-service';
import { GlobalRefreshService } from 'src/core/services/global-refresh/global-refresh-service';
import { SearchModalComponent } from 'src/app/components/search-modal/search-modal.component';
import { TabsComponent } from 'src/app/components/tabs/tabs.component';
import { IonMenuButton } from '@ionic/angular/standalone';

@Component({
  selector: 'app-service-tracking',
  templateUrl: './service-tracking.page.html',
  styleUrls: ['./service-tracking.page.scss'],
  standalone: true,
  imports: [
    IonFooter,
    IonButtons,
    IonContent,
    IonHeader,
    IonTitle,
    IonToolbar,
    CommonModule,
    FormsModule,
    SearchModalComponent,
    TabsComponent,
    IonMenuButton,
  ],
})
export class ServiceTrackingPage {
  private readonly _AuthService = inject(AuthService);
  private readonly _GlobalRefreshService = inject(GlobalRefreshService);

  token = this._AuthService.token;

  handleRefresh(event: any) {
    this._GlobalRefreshService.refresh();

    setTimeout(() => {
      event.target.complete();
    }, 1500);
  }
}
