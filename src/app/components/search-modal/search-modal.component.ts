import { Component, inject, ViewChild } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import {
  IonModal,
  IonSearchbar,
  IonContent,
  IonSpinner,
  IonList,
  IonItem,
  IonThumbnail,
  IonLabel,
} from '@ionic/angular/standalone';
import { SearchService } from 'src/core/services/search/search-service';
import {
  Subject,
  debounceTime,
  distinctUntilChanged,
  switchMap,
  takeUntil,
  of,
} from 'rxjs';
import { Router } from '@angular/router';
import { DecimalPipe } from '@angular/common';

@Component({
  selector: 'app-search-modal',
  templateUrl: './search-modal.component.html',
  styleUrls: ['./search-modal.component.scss'],
  imports: [IonSearchbar, IonModal, IonContent, IonSpinner, DecimalPipe],
})
export class SearchModalComponent {
  private readonly _SearchService = inject(SearchService);
  private readonly _Router = inject(Router);

  @ViewChild('modal') modal!: IonModal;
  @ViewChild('searchbar') searchbar!: HTMLIonSearchbarElement;

  private searchSubject = new Subject<string>();
  private destroy$ = new Subject<void>();
  searchResults: any[] = [];
  isSearching = false;

  constructor() {
    this.searchSubject
      .pipe(
        debounceTime(800),
        distinctUntilChanged(),

        switchMap((word) => {
          if (!word.trim()) {
            this.searchResults = [];
            this.isSearching = false;

            return of([]);
          }

          this.isSearching = true;

          return this._SearchService.autoSearch(word);
        }),

        takeUntil(this.destroy$)
      )
      .subscribe({
        next: (response) => {
          this.isSearching = false;

          console.log('Search response:', response);

          this.searchResults = response?.results ?? response ?? [];
        },

        error: (error) => {
          this.isSearching = false;

          console.error('Search error:', error);

          this.searchResults = [];
        },
      });
  }

  onSearch(event: any) {
    const value = event.detail.value || '';
    this.searchSubject.next(value);
  }

  async open() {
    this.searchResults = [];
    this.isSearching = false;

    await this.modal.present();
  }

  async close() {
    await this.modal.dismiss();
  }

  async onModalDismiss() {
    this.searchResults = [];
    this.isSearching = false;

    this.searchSubject.next('');

    if (this.searchbar) {
      this.searchbar.value = '';
    }
  }

  async goToProduct(slug: string): Promise<void> {
    // امسح الداتا فورًا
    this.searchResults = [];
    this.isSearching = false;

    this.searchSubject.next('');

    if (this.searchbar) {
      this.searchbar.value = '';
    }

    // اقفل الـ modal
    await this.modal.dismiss();

    // روح للـ product
    await this._Router.navigate(['/product', slug]);
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
