import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AboutUsService {
  private readonly _HttpClient = inject(HttpClient)

  getAbout():Observable<any> {
    return this._HttpClient.get(`https://tradelineserver.bit68.com/rest_api/about-us/`);
  }
}
