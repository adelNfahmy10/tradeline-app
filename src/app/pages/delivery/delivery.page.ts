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
  IonItem,
  IonFooter,
  IonRefresher,
  IonRefresherContent,
} from '@ionic/angular/standalone';
import { DeliveryService } from 'src/core/services/delivery/delivery-service';
import { SafeHtmlPipe } from 'src/core/pipes/safeHtml/safe-html-pipe';
import { TabsComponent } from 'src/app/components/tabs/tabs.component';
import { GlobalRefreshService } from 'src/core/services/global-refresh/global-refresh-service';

@Component({
  selector: 'app-delivery',
  templateUrl: './delivery.page.html',
  styleUrls: ['./delivery.page.scss'],
  standalone: true,
  imports: [
    IonRefresherContent,
    IonRefresher,
    IonFooter,
    IonButtons,
    IonBackButton,
    IonContent,
    IonHeader,
    IonTitle,
    IonToolbar,
    CommonModule,
    FormsModule,
    SafeHtmlPipe,
    TabsComponent,
  ],
})
export class DeliveryPage implements OnInit {
  private readonly _DeliveryService = inject(DeliveryService);
  private readonly _GlobalRefreshService = inject(GlobalRefreshService);

  deliveryData: any[] = [];

  ngOnInit() {
    this.getDeliveryData();
  }

  getDeliveryData(): void {
    this._DeliveryService.shippingPgae().subscribe({
      next: (res) => {
        this.deliveryData = res;
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
