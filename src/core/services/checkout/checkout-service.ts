import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment.prod';

@Injectable({
  providedIn: 'root',
})
export class CheckoutService {
  private readonly _HttpClient = inject(HttpClient)

  hiddingPayment():Observable<any> {
    return this._HttpClient.get(`${environment.baseUrl}hidden-payment-methods/`);
  }

  getStores():Observable<any> {
    return this._HttpClient.get(`${environment.baseUrl}stores/`);
  }

  addOrder(data:any):Observable<any> {
    return this._HttpClient.post(`${environment.baseUrl}orders/`, data)
  }

  // This method will be called by your component
  getPaymobData(slug: string):Observable<any> {
    // Added type for slug
    return this._HttpClient.get(`${environment.baseUrl}paymob_iframe/?slug=${slug}`);
  }

  getIframe(slug: string):Observable<any> {
    // Added type for slug
    return this._HttpClient.get(`${environment.baseUrl}iframe/?slug=${slug}`);
  }

  getIframeGetGo(slug: string) {
    // Added type for slug
    return this._HttpClient.get(`${environment.baseUrl}getgo-iframe/?slug=${slug}`);
  }

  getIframeSouhoola(slug: string) {
    // Added type for slug
    return this._HttpClient.get(`${environment.baseUrl}souhoola-iframe/?slug=${slug}`);
  }

  getIframeforsa(slug: string) {
    // Added type for slug
    return this._HttpClient.get(`${environment.baseUrl}FORSA-iframe/?slug=${slug}`);
  }

  getIframevodafone(slug: string) {
    // Added type for slug
    return this._HttpClient.get(`${environment.baseUrl}vodafone-iframe/?slug=${slug}`);
  }

  getSymplIframe(slug: string) {
    // Added type for slug
    return this._HttpClient.get(`${environment.baseUrl}sympl-iframe/?slug=${slug}`);
  }

  createPremiumCard(body:any):Observable<any> {
    // Added types
    return this._HttpClient.post(`https://tradelineserver.bit68.com/fawry/CreatePremiumCardOtp/`, body);
    // body ==> { card: card, expiry: expiry, order_id: order_id }
  }

  validatePremiumCard(body:any):Observable<any> {
    // Added types
    return this._HttpClient.post(`https://tradelineserver.bit68.com/fawry/PayWithPremiumCard/`, body);
    // body ==> { otp: otp, order_id: order_id }
  }

  submitFawry(body: any):Observable<any> {
    // Added type
    return this._HttpClient.post(`https://tradelineserver.bit68.com/fawry/FawryPaymentPendingPage/`, body);
  }
}
