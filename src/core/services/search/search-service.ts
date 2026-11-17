import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root',
})
export class SearchService {
  private _HttpClient = inject(HttpClient)

  autoSearch(word:any):Observable<any> {
    return this._HttpClient.get(`${environment.baseUrl}product-startswith/?search=${word}`);
  }
}


