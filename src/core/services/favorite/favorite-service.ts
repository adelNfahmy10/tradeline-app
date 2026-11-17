import { HttpClient, HttpHeaders } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { environment } from 'src/environments/environment.prod';
import { AuthService } from '../auth/auth-service';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class FavoriteService {
  private readonly _HttpClient = inject(HttpClient)
  private readonly _AuthService = inject(AuthService)

  token = this._AuthService.token

  options = {
    headers: new HttpHeaders({
      "Content-Type": "application/json"
    })
  };

  // Favorites list
  allFavorites = signal<any[]>([]);
  favoriteCount = signal<number>(0);

  setFavorites(favorites: any[]): void {
    this.allFavorites.set(favorites);
    this.favoriteCount.set(favorites.length);
  }

  addFavoriteToState(favorite: any): void {
    this.allFavorites.update(items => [ ...items, favorite ]);
    this.favoriteCount.update(count => count + 1);
  }

  removeFavoriteFromState(favoriteId: any): void {
    this.allFavorites.update(items => items.filter(item => item?.id !== favoriteId) );
    this.favoriteCount.update(count => Math.max(0, count - 1) );
  }

  getFavorites():Observable<any> {
    return this._HttpClient.get(`${environment.baseUrl}users/me/favorites/?Authorization=${this.token()}`,
      this.options
    )
  }

  addFavorites(id:any):Observable<any> {
    return this._HttpClient.put(`${environment.baseUrl}users/me/favorites/?Authorization=${this.token()}`,
      { product_id: id },
      this.options
    )
  }


  deleteFavorites(id:any) {
    return this._HttpClient.delete(`${environment.baseUrl}users/me/favorites/${id}/?Authorization=${this.token()}`,
      this.options
    )
  }
}
