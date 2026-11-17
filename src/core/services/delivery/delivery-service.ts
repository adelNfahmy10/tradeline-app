import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment.prod';

@Injectable({
  providedIn: 'root',
})
export class DeliveryService {
  private readonly _HttpClient = inject(HttpClient)

  shippingPgae():Observable<any> {
    return this._HttpClient.get(`${environment.baseUrl}shipping-and-delivery-instructions/`);
  }
}
