import { HttpClient, HttpHeaders } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class PointsService {
  private readonly _HttpClient = inject(HttpClient)

  points = signal<number | null>(0);
  pointsData = signal<any | null>(null)

  pointsoptions = {
    headers: new HttpHeaders({
      "Content-Type": "Application/x-www-form-urlencoded"
    })
  };

  getPointsToken():Observable<any> {
    return this._HttpClient.post(
      "https://api.tradelinestores.net/token",
      "grant_type=password&Password=Tr%40deLin3&Username=Tradeline",
      this.pointsoptions
    );
  }

  getPoints(token:any, phone:any):Observable<any> {

    let op = {
      headers: new HttpHeaders({
        "Content-Type": "Application/x-www-form-urlencoded",
        Authorization: `Bearer ${token}`
      })
    };

    return this._HttpClient.get(
      "https://api.tradelinestores.net/api/Account/GetPoints/" + phone,
      op
    )
  }

  getPointsHistory(token:any, phone:any):Observable<any> {
    //phone = "01222186918";
    let op = {
      headers: new HttpHeaders({
        Authorization: `Bearer ${token}`,
        responseType: "text"
      })
    };

    return this._HttpClient.post(
      `https://api.tradelinestores.net/api/Account/GetCustomersPoints`,
      { id: `${phone}` },
      op
    );
  }
}
