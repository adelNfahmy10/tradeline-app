import {
  Component,
  effect,
  inject,
  OnInit,
  signal,
  WritableSignal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  IonContent,
  IonHeader,
  IonTitle,
  IonToolbar,
  IonItemOptions,
  IonItemOption,
  IonList,
  IonItemSliding,
  IonItem,
  IonLabel,
  IonButtons,
  IonMenuButton,
  IonFooter,
  IonRefresher,
  IonRefresherContent,
  IonMenuToggle,
} from '@ionic/angular/standalone';
import { TabsComponent } from 'src/app/components/tabs/tabs.component';
import { CartService } from 'src/core/services/cart/cart-service';
import { AuthService } from 'src/core/services/auth/auth-service';
import { Router, RouterLink } from '@angular/router';
import { Subscription } from 'rxjs';
import { SearchModalComponent } from 'src/app/components/search-modal/search-modal.component';
import { ToastrService } from 'ngx-toastr';
import { GlobalRefreshService } from 'src/core/services/global-refresh/global-refresh-service';
import { IonicModule } from '@ionic/angular';

@Component({
  selector: 'app-cart',
  templateUrl: './cart.page.html',
  styleUrls: ['./cart.page.scss'],
  standalone: true,
  imports: [
    IonMenuToggle,
    IonRefresherContent,
    IonRefresher,
    IonFooter,
    IonButtons,
    IonLabel,
    IonItem,
    IonItemSliding,
    IonList,
    IonItemOption,
    IonItemOptions,
    IonContent,
    IonHeader,
    IonTitle,
    IonToolbar,
    CommonModule,
    FormsModule,
    TabsComponent,
    RouterLink,
    IonMenuButton,
    RouterLink,
    SearchModalComponent,
  ],
})
export class CartPage implements OnInit {
  private _CartService = inject(CartService);
  private _AuthService = inject(AuthService);
  private _ToastrService = inject(ToastrService);
  private readonly _GlobalRefreshService = inject(GlobalRefreshService);
  private _Router = inject(Router);

  cartItems: WritableSignal<any[]> = signal([]);
  token = this._AuthService.token;
  currentCartId = this._AuthService.currentCartId;
  count: WritableSignal<number> = signal(0);
  totalAmount: WritableSignal<number> = signal(0);
  subTotal: WritableSignal<number> = signal(0);
  tax: WritableSignal<number> = signal(0);
  shippingValue: WritableSignal<number> = signal(0);

  allProductsCart!: Subscription;

  ngOnInit(): void {
    this.fetchCartData();
  }

  handleRefresh(event: any) {
    this._GlobalRefreshService.refresh();

    setTimeout(() => {
      event.target.complete();
    }, 1500);
  }

  constructor() {
    effect(() => {
      const token = this.token();
      const cartId = this.currentCartId();
      if (token || cartId) {
        this.fetchCartData();
      }
    });
  }

  fetchCartData(): void {
    const id = this.token() ? 2 : this.currentCartId();
    if (!id) return;

    this.allProductsCart = this._CartService.getCart().subscribe({
      next: (res) => {
        this.cartItems.set([]);
        this.cartItems.set(res?.cartproduct || []);
        console.log(this.cartItems());
        this.getShipping();

        this.totalAmount.set(
          this.cartItems().reduce(
            (sum, item) => sum + item.product.price * item.quantity,
            0
          ) + this.shippingValue()
        );

        this.count.set(res?.total_quantity || 0);
        // this.subTotal.set(res?.total / 1.14);
        // this.tax.set(this.totalAmount() - this.subTotal());
        // this.totalAmount.set(res?.total + this.shippingValue());
        this._CartService.productCount.set(this.count());
      },
      error: () => {
        this.cartItems.set([]);
        this.count.set(0);
        this.shippingValue.set(0);
      },
    });
  }

  getShipping(): void {
    this._CartService.getShipping().subscribe({
      next: (res) => {
        if (this.cartItems().length > 0) {
          this.shippingValue.set(res.shipping_value || 0);
          this.totalAmount.set(
            this.cartItems().reduce(
              (sum, item) => sum + item.product.price * item.quantity,
              0
            ) + this.shippingValue()
          );
        } else {
          this.shippingValue.set(0);
          this.tax.set(0);
          this.totalAmount.set(0);
        }
      },
    });
  }

  deleteProductInCart(id: any): void {
    this._CartService.deleteCartProduct(id).subscribe({
      next: (res) => {
        this.fetchCartData();
        this._ToastrService.success('Product deleted successfully');
      },
      error: (err) => {
        this._ToastrService.error('Failed to delete the product');
      },
    });
  }

  checkoutCart(): void {
    if (this.cartItems().length !== 0) {
      this._Router.navigate(['/checkout']);
    }
  }

  /*##################################### Unsubscrib ##################################### */
  ngOnDestroy(): void {
    this.allProductsCart?.unsubscribe();
  }
  ionViewWillEnter() {
    this.fetchCartData();
  }
}
