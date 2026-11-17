import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class GlobalRefreshService {

  private readonly _refreshTrigger = signal(0);

  readonly refreshTrigger = this._refreshTrigger.asReadonly();

  refresh(): void {
    this._refreshTrigger.update(value => value + 1);
  }
}
