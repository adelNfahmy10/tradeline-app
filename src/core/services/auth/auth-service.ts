import { HttpClient, HttpHeaders } from '@angular/common/http';
import { computed, inject, Injectable, signal, WritableSignal } from '@angular/core';
import { from, Observable, tap } from 'rxjs';
import { Preferences } from '@capacitor/preferences';
import { environment } from 'src/environments/environment.prod';
import { PointsService } from '../points/points-service';
import { ToastrService } from 'ngx-toastr';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly _HttpClient = inject(HttpClient);
  private readonly _PointsService = inject(PointsService);

  // التوكن Signal
  token: WritableSignal<string | null> = signal(null);
  // signal للـ userName
  userName = signal<string | null>(null);
  points = this._PointsService.points
  // هل المستخدم مسجّل دخول؟
  isLoggedIn = computed(() => !!this.token());
  currentCartId: WritableSignal<string> = signal(localStorage.getItem('tradelineCartId') || '');

  constructor() {
    this.loadToken();
    this.loadUserData()
  }

  // Load token من Preferences بدل localStorage
  loadToken(): void {
    from(Preferences.get({ key: 'tradelineToken' }))
      .pipe(tap(({ value }) => this.token.set(value)))
      .subscribe();
  }

  loadUserData() {
    // جلب البيانات من localStorage أو Preferences
    this.userName.set(localStorage.getItem('userName'));
  }

  // Login Cycle Endpoints
  login(data: any): Observable<any> {
    return this._HttpClient.post(`${environment.baseUrl}users/login/`, data);
  }

  private readonly _ToastrService = inject(ToastrService)

  // Logout
  logout(): void {
    this.token.set(null);
    this.userName.set(null);
    this.points.set(null);
    localStorage.removeItem('tradelineToken')
    localStorage.removeItem('CapacitorStorage.tradelineToken')
    localStorage.removeItem('userId')
    localStorage.removeItem('userName')
    localStorage.removeItem('phone')
    localStorage.removeItem('userCartId')
    localStorage.removeItem('userTradelinePoints')
    this.points.set(0);
    Preferences.remove({ key: 'tradelineToken' });
    this._ToastrService.success('Signed out successfully!');
  }

  // Set token
  setToken(token: string): void {
    this.token.set(token);
    localStorage.setItem('tradelineToken', token);
    Preferences.set({ key: 'tradelineToken', value: token }); // آمن على Android
  }

  getUserInfo(token: any): Observable<any> {
    return this._HttpClient.get(`${environment.baseUrl}users/me/?Authorization=${token}`);
  }

  getPointsToken(): Observable<any> {
    const body = "grant_type=password&Username=Tradeline&Password=Tr%40deLin3";
    const headerPoint = {
      headers: new HttpHeaders({
        "Content-Type": "application/x-www-form-urlencoded",
        "X-Skip-Auth": "true"
      })
    };
    return this._HttpClient.post('https://api.tradelinestores.net/token', body, headerPoint);
  }

  getPoints(token: any, phone: any): Observable<any> {
    const header = {
      headers: new HttpHeaders({
        "Content-Type": "application/x-www-form-urlencoded",
        Authorization: `Bearer ${token}`,
        'X-Skip-Auth': 'true'
      })
    };
    return this._HttpClient.get(`https://api.tradelinestores.net/api/Account/GetPoints/${phone}`, header);
  }

  // Register Cycle Endpoints
  register(data: any): Observable<any> {
    return this._HttpClient.post(`${environment.baseUrl}users/me/`, data);
  }

  // Delete Account Endpoint
  deleteAccount():Observable<any> {
    return this._HttpClient.put(`${environment.baseUrl}users/me/deactivate/?Authorization=${this.token()}`, {});
  }

  // Forget Password Endoints
  sendForgetEmail(data:any):Observable<any> {
    return this._HttpClient.post(`${environment.baseUrl}users/me/forget_password/`, data);
  }

  sendResetCode(code:any):Observable<any> {
    return this._HttpClient.get(`${environment.baseUrl}users/me/reset_password/?password_reset_code=${code}`);
  }

  resetPass(data:any):Observable<any> {
    return this._HttpClient.post(`${environment.baseUrl}users/me/reset_password/`, data);
  }
}
