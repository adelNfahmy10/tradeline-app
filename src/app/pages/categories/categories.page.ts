import { Component, DestroyRef, inject, OnInit } from '@angular/core';

import { CommonModule } from '@angular/common';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

import { ActivatedRoute, RouterLink } from '@angular/router';

import { EMPTY } from 'rxjs';

import {
  catchError,
  distinctUntilChanged,
  switchMap,
  finalize,
} from 'rxjs/operators';

import {
  IonContent,
  IonHeader,
  IonTitle,
  IonToolbar,
  IonButtons,
  IonBackButton,
  IonFooter,
  IonRefresher,
  IonRefresherContent,
} from '@ionic/angular/standalone';

import { CategoriesService } from 'src/core/services/categories/categories-service';
import { TabsComponent } from 'src/app/components/tabs/tabs.component';
import { GlobalRefreshService } from 'src/core/services/global-refresh/global-refresh-service';

/* =========================================
   CATEGORY INTERFACES
   ========================================= */

interface Subcategory {
  name: string;
  seo_slug: string;
  picture?: string;
  picture_alt?: string;
}

interface Category {
  name: string;
  cat_subcategories: Subcategory[];
}

/* =========================================
   COMPONENT
   ========================================= */

@Component({
  selector: 'app-categories',
  templateUrl: './categories.page.html',
  styleUrls: ['./categories.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    IonContent,
    IonHeader,
    IonTitle,
    IonToolbar,
    IonButtons,
    IonBackButton,
    IonFooter,
    IonRefresher,
    IonRefresherContent,
    TabsComponent,
  ],
})
export class CategoriesPage implements OnInit {
  /* =========================================
     INJECTIONS
     ========================================= */

  private readonly _CategoriesService = inject(CategoriesService);
  private readonly _ActivatedRoute = inject(ActivatedRoute);
  private readonly _GlobalRefreshService = inject(GlobalRefreshService);
  private readonly _DestroyRef = inject(DestroyRef);

  /* =========================================
     VARIABLES
     ========================================= */

  categories: Category | null = null;

  isLoading = false;
  errorMessage = '';

  /* =========================================
     LIFECYCLE
     ========================================= */

  ngOnInit(): void {
    this.getAllSubCategories();
  }

  /* =========================================
     GET SUBCATEGORIES
     ========================================= */

  getAllSubCategories(): void {
    this._ActivatedRoute.paramMap
      .pipe(
        distinctUntilChanged(
          (previous, current) =>
            previous.get('catName') === current.get('catName')
        ),

        switchMap((params) => {
          const catName = params.get('catName');

          if (!catName) {
            this.categories = null;
            this.errorMessage = 'Category not found';
            this.isLoading = false;

            return EMPTY;
          }

          this.isLoading = true;
          this.errorMessage = '';

          return this._CategoriesService.getCategoryByName(catName).pipe(
            catchError((error) => {
              console.error('Error loading subcategories:', error);

              this.categories = null;
              this.errorMessage =
                'Unable to load subcategories. Please try again.';

              return EMPTY;
            }),

            finalize(() => {
              this.isLoading = false;
            })
          );
        }),

        takeUntilDestroyed(this._DestroyRef)
      )
      .subscribe({
        next: (res) => {
          this.categories = res;
        },
      });
  }

  /* =========================================
     PULL TO REFRESH
     ========================================= */

  handleRefresh(event: any): void {
    this._GlobalRefreshService.refresh();

    setTimeout(() => {
      event.target.complete();
    }, 1500);
  }
}
