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
  IonList,
  IonItem,
  IonRow,
  IonCol,
  IonGrid,
  IonFooter,
  IonRefresher,
  IonRefresherContent,
  IonIcon,
} from '@ionic/angular/standalone';
import { RouterLink } from '@angular/router';

import { TabsComponent } from 'src/app/components/tabs/tabs.component';
import { OrdersService } from 'src/core/services/orders/orders-service';
import { ToastrService } from 'ngx-toastr';
import { GlobalRefreshService } from 'src/core/services/global-refresh/global-refresh-service';

@Component({
  selector: 'app-orders',
  templateUrl: './orders.page.html',
  styleUrls: ['./orders.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterLink,
    IonIcon,
    IonRefresherContent,
    IonRefresher,
    IonFooter,
    IonGrid,
    IonCol,
    IonRow,
    IonItem,
    IonList,
    IonBackButton,
    IonButtons,
    IonContent,
    IonHeader,
    IonTitle,
    IonToolbar,
    TabsComponent,
  ],
})
export class OrdersPage implements OnInit {
  private readonly _OrdersService = inject(OrdersService);
  private readonly _ToastrService = inject(ToastrService);
  private readonly _GlobalRefreshService = inject(GlobalRefreshService);

  allOrders: any[] = [];

  // Cancel order modal
  isCancelModalOpen = false;
  cancelReason = '';
  cancelReasonError = '';
  isCancelling = false;
  selectedOrderForCancellation: any = null;

  ngOnInit(): void {
    this.getAllOrders();
  }

  handleRefresh(event: any): void {
    this._GlobalRefreshService.refresh();

    setTimeout(() => {
      event.target.complete();
    }, 1500);
  }

  getAllOrders(): void {
    this._OrdersService.getOrders().subscribe({
      next: (res) => {
        this.allOrders = res;
      },
      error: (err) => {
        console.error('Get orders error:', err);
        this._ToastrService.error('Failed to load orders');
      },
    });
  }

  openCancelModal(order: any): void {
    if (!order) {
      this._ToastrService.error('Invalid order');
      return;
    }

    this.selectedOrderForCancellation = order;
    this.cancelReason = '';
    this.cancelReasonError = '';
    this.isCancelModalOpen = true;
  }

  closeCancelModal(): void {
    if (this.isCancelling) return;

    this.isCancelModalOpen = false;
    this.cancelReason = '';
    this.cancelReasonError = '';
    this.selectedOrderForCancellation = null;
  }

  confirmCancelOrder(): void {
    const order = this.selectedOrderForCancellation;
    const reason = this.cancelReason.trim();
    const orderId = order?.id;

    if (this.isCancelling) return;

    if (!orderId) {
      this._ToastrService.error('Invalid order ID');
      return;
    }

    if (!reason) {
      this.cancelReasonError = 'Please enter a cancellation reason.';
      return;
    }

    this.cancelReasonError = '';
    this.isCancelling = true;

    this._OrdersService.cancelOrder(orderId, reason).subscribe({
      next: (res) => {
        this._ToastrService.success('Order cancelled successfully');

        this.isCancelModalOpen = false;
        this.cancelReason = '';
        this.selectedOrderForCancellation = null;
        this.isCancelling = false;

        this.getAllOrders();
      },

      error: (err) => {
        console.error('Cancel order error:', err);

        this.isCancelling = false;

        this._ToastrService.error(
          err?.error?.message || 'Failed to cancel order'
        );
      },
    });
  }
}
