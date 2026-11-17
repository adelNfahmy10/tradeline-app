import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from 'src/environments/environment.prod';

@Injectable({
  providedIn: 'root',
})
export class CallBackService {
  private readonly _HttpClient = inject(HttpClient);

  sendCallback(data: any) {
    return this._HttpClient.post(`${environment.baseUrl}call-back/`, data);
  }
}
