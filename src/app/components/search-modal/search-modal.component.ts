import { DecimalPipe } from '@angular/common';
import { Component, DestroyRef, ViewChild, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import {
  IonContent,
  IonModal,
  IonSearchbar,
  IonSpinner,
} from '@ionic/angular/standalone';
import {
  Subject,
  catchError,
  distinctUntilChanged,
  finalize,
  map,
  of,
  switchMap,
  timer,
} from 'rxjs';
import { Router } from '@angular/router';

import { SearchService } from 'src/core/services/search/search-service';

@Component({
  selector: 'app-search-modal',
  templateUrl: './search-modal.component.html',
  styleUrls: ['./search-modal.component.scss'],
  imports: [IonSearchbar, IonModal, IonContent, IonSpinner, DecimalPipe],
})
export class SearchModalComponent {
  private readonly _SearchService = inject(SearchService);
  private readonly _Router = inject(Router);
  private readonly _DestroyRef = inject(DestroyRef);

  @ViewChild('modal') modal!: IonModal;
  @ViewChild('searchbar') searchbar!: HTMLIonSearchbarElement;

  private readonly searchSubject = new Subject<string>();

  searchResults: any[] = [];
  isSearching = false;

  constructor() {
    this.searchSubject
      .pipe(
        map((word) => word.trim()),
        distinctUntilChanged(),

        switchMap((word) => {
          // Empty search
          if (!word) {
            this.searchResults = [];
            this.isSearching = false;

            return of([]);
          }

          this.isSearching = true;

          // Debounce + cancel previous request immediately
          return timer(400).pipe(
            switchMap(() => this._SearchService.autoSearch(word)),

            map((response) => response?.results ?? response ?? []),

            catchError((error) => {
              console.error('Search error:', error);
              return of([]);
            }),

            finalize(() => {
              this.isSearching = false;
            })
          );
        }),

        takeUntilDestroyed(this._DestroyRef)
      )
      .subscribe((results) => {
        this.searchResults = results;
      });
  }

  onSearch(event: any): void {
    const value = event?.detail?.value ?? '';
    this.searchSubject.next(value);
  }

  async open(): Promise<void> {
    this.searchResults = [];
    this.isSearching = false;

    this.searchSubject.next('');

    await this.modal.present();
  }

  async close(): Promise<void> {
    await this.modal.dismiss();
  }

  onModalDismiss(): void {
    this.searchResults = [];
    this.isSearching = false;

    // Cancel any pending search or active request
    this.searchSubject.next('');

    if (this.searchbar) {
      this.searchbar.value = '';
    }
  }

  async goToProduct(slug: string): Promise<void> {
    if (!slug) return;

    // Clear search data
    this.searchResults = [];
    this.isSearching = false;

    this.searchSubject.next('');

    if (this.searchbar) {
      this.searchbar.value = '';
    }

    // Close modal first
    await this.modal.dismiss();

    // Navigate to product
    await this._Router.navigate(['/product', slug]);
  }
}
