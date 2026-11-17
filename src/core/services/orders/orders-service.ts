import { HttpClient } from '@angular/common/http';
import { effect, inject, Injectable, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { AuthService } from '../auth/auth-service';
import { environment } from 'src/environments/environment.prod';

@Injectable({
  providedIn: 'root',
})
export class OrdersService{
  private readonly _HttpClient = inject(HttpClient)
  private readonly _AuthService = inject(AuthService)

  token = this._AuthService.token

  deleteOrder(id: string):Observable<any> {
    return this._HttpClient.get(`${environment.baseUrl}orders/?Authorization=${this.token()}&device_id=${id}}`);
  }

  getOrders():Observable<any> {
    return this._HttpClient.get(`${environment.baseUrl}orders/?Authorization=${this.token()}`);
  }

  // getOrders() {
  //   let res = this._HttpClient.get(this.url + "?Authorization=" + this.token);
  //   return res;
  // }

  cancelOrder(id: string, reason: string):Observable<any> {
    // Added types
    return this._HttpClient.put(
      `${environment.baseUrl}orders/${id}/?Authorization=${this.token()}`,
      { status: "Canceled", reason_for_cancelation: reason }
    );
  }

  getOrderDetails(id: string):Observable<any> {
    // Added type for id
    return this._HttpClient.get(`${environment.baseUrl}orders/${id}/`);
  }
}
