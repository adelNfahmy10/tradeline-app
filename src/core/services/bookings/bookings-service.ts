import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment.prod';
import { AuthService } from '../auth/auth-service';

@Injectable({
  providedIn: 'root',
})
export class BookingsService {
  private readonly _AuthService = inject(AuthService);
  private readonly _HttpClient = inject(HttpClient);

  token = this._AuthService.token


  getBookApointment(name:any, number:any, date:any, time:any, email:any, branch:any):Observable<any> {
    return this._HttpClient.post(`${environment.baseUrl}support/` + 'appointment-book/', { name: name, email: email, date: date, time: time, branch: branch, phone: number });
  }


  getSessions(type: string):Observable<any> {
    // Added type
    return this._HttpClient.get(
      `${environment.baseUrl}onlineSession/online-sessions/?Authorization=${this.token()}&finished=${type} `
    );
  }
  getSession(id: string):Observable<any> {
    // Added type
    return this._HttpClient.get(
      `${environment.baseUrl}onlineSession/questions/?Authorization=${this.token()}&id=${id}`
    );
  }

  editSession(id: string, time_id: string, date: string, order: any):Observable<any> {
    // Added types
    return this._HttpClient.put(
      `${environment.baseUrl}onlineSession/online-sessions/?Authorization=${this.token()}&id=${id}`,
      { time_id: time_id, date: date, order: order }
    );
  }

  cancelSession(id: string) {
    // Added type
    return this._HttpClient.delete(
      `${environment.baseUrl}onlineSession/online-sessions/?Authorization=${this.token()}&id=${id}`,
      {}
    );
  }

}
