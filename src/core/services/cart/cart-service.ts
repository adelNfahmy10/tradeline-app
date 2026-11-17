import { HttpClient } from '@angular/common/http';
import { effect, inject, Injectable, signal, WritableSignal } from '@angular/core';
import { AuthService } from '../auth/auth-service';
import { environment } from 'src/environments/environment.prod';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class CartService {
  private _HttpClient = inject(HttpClient);
  private _AuthService = inject(AuthService); // هنستخدمه صح

  // Signals
  cartItems = signal<any[]>([]);
  token = this._AuthService.token; // مرتبط بـ AuthService
  currentCartId = this._AuthService.currentCartId; // مرتبط بـ AuthService
  productCount:WritableSignal<number> = signal(0)

  constructor() {
    // effect يستمع لأي تغيّر في token أو currentCartId
    effect(() => {
      if (this.token()) {
        // Logged-in user
        this.fetchUserCart();
        this.getCart()
        this.getCartCount()

      } else {
        // Guest
        if (this.currentCartId()) {
          this.fetchGuestCart(this.currentCartId());
          this.getCart()
          this.getCartCount()

        } else {
          this.addCart();
        }
      }
    });
  }

  // 🔹 User Cart
  private fetchUserCart(): void {
    this._HttpClient.get<any>(`${environment.baseUrl}carts/2/?Authorization=${this.token()}`).subscribe({
      next: (res) =>{
        this.handleCartResponse(res)
        localStorage.setItem('userCartId', res.id)
      },
      error: () => this.addCart(),
    });
  }

  // 🔹 Guest Cart
  private fetchGuestCart(cartId: string): void {
    if (!cartId) {
      this.addCart();
      return;
    }

    this._HttpClient.get<any>(`${environment.baseUrl}carts/${cartId}`).subscribe({
      next: (res) => this.handleCartResponse(res),
      error: () => this.addCart(),
    });
  }

  // Get Cart In Cart Page
  getCart():Observable<any> {
    const id = this.token() ? 2 : this.currentCartId();
    return this._HttpClient.get(`${environment.baseUrl}carts/${id}/`);
  }

  // Get Count Cart
  getCartCount() {
    const id = this.token() ? 2 : this.currentCartId();
    this._HttpClient.get(`${environment.baseUrl}carts/${id}/`).subscribe({
      next:(res:any)=>{
        this.productCount.set(res?.total_quantity)
      }
    });
  }

  // 🔹 Create Cart
  addCart(): void {
    this._HttpClient.post<any>(`${environment.baseUrl}carts/`, {}).subscribe({
      next: (res) => {
        // حدث الـ signal في AuthService
        if(!this.currentCartId()){
          this.currentCartId.set(res.id);
          localStorage.setItem('tradelineCartId', res.id);
          this.handleCartResponse(res);
        }
      },
      error: (err) => console.error('Error creating cart', err),
    });
  }

  // 🔹 Shared Handler
  private handleCartResponse(res: any): void {
    this.cartItems.set(res?.items || []);
  }

  // Add Product To Cart
  addProductToCart(body:any) {
    return this._HttpClient.post( `${environment.baseUrl}cartproducts/?product_page=true`, body);
  }

  // Shipping Api
  getShipping():Observable<any>{
    return this._HttpClient.get(`${environment.baseUrl}shipping-value/`);
  }

  // Delete Product In Cart
  deleteCartProduct(id:any):Observable<any> {
    return this._HttpClient.delete( `${environment.baseUrl}cartproducts/${id}/`);
  }
}
