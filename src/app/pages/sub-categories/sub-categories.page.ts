import { Component, DestroyRef, inject, OnInit } from '@angular/core';

import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

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
  IonSpinner
} from '@ionic/angular/standalone';

import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

import { EMPTY, Subject } from 'rxjs';

import {
  catchError,
  distinctUntilChanged,
  finalize,
  map,
  switchMap,
  tap,
} from 'rxjs/operators';

import { CategoriesService } from 'src/core/services/categories/categories-service';
import { SkeletonReloadPage } from '../skeleton-reload/skeleton-reload.page';
import { TabsComponent } from 'src/app/components/tabs/tabs.component';
import { GlobalRefreshService } from 'src/core/services/global-refresh/global-refresh-service';

@Component({
  selector: 'app-sub-categories',
  templateUrl: './sub-categories.page.html',
  styleUrls: ['./sub-categories.page.scss'],
  standalone: true,
  imports: [
    IonRefresherContent,
    IonRefresher,
    IonFooter,
    IonBackButton,
    IonButtons,
    IonContent,
    IonHeader,
    IonTitle,
    IonToolbar,
    CommonModule,
    FormsModule,
    SkeletonReloadPage,
    RouterLink,
    TabsComponent,
    IonSpinner
  ],
})
export class SubCategoriesPage implements OnInit {
  private readonly _CategoriesService = inject(CategoriesService);
  private readonly _ActivatedRoute = inject(ActivatedRoute);
  private readonly _GlobalRefreshService = inject(GlobalRefreshService);
  private readonly _Router = inject(Router);
  private readonly _DestroyRef = inject(DestroyRef);

  isAutoNavigating = false;

  private readonly productRequests$ = new Subject<{
    slug: string;
    sizeId: number | null;
  }>();

  subCategory: any = null;

  SubSizeId: number | null = null;
  selectedSizeId: number | null = null;

  subCategoryProducts: any[] = [];

  isLoading = false;
  isCategoryLoading = false;
  errorMessage = '';

  ngOnInit(): void {
    this.listenToProductRequests();
    this.getSubCategory();
  }

  // Get Sub Category
  getSubCategory(): void {
    this._ActivatedRoute.paramMap
      .pipe(
        map((params) => params.get('subName')),
        distinctUntilChanged(),

        switchMap((name) => {
          if (!name) {
            this.subCategory = null;
            this.subCategoryProducts = [];
            this.errorMessage = 'Subcategory not found.';
            return EMPTY;
          }

          this.isCategoryLoading = true;
          this.isLoading = true;
          this.errorMessage = '';

          return this._CategoriesService.getSubCategoriesByName(name).pipe(
            tap((res: any) => {
              this.subCategory = res;

              const firstSize =
                this.subCategory?.sub_category_size?.[0]?.id ?? null;

              this.SubSizeId = firstSize;
              this.selectedSizeId = firstSize;

              this.subCategoryProducts = [];

              this.productRequests$.next({
                slug: this.subCategory.seo_slug,
                sizeId: firstSize,
              });
            }),

            catchError((error) => {
              console.error('Error loading subcategory:', error);

              this.subCategory = null;
              this.subCategoryProducts = [];
              this.errorMessage =
                'Unable to load subcategory. Please try again.';

              return EMPTY;
            }),

            finalize(() => {
              this.isCategoryLoading = false;
            })
          );
        }),

        takeUntilDestroyed(this._DestroyRef)
      )
      .subscribe();
  }

  // Listen To Product Requests
  // private listenToProductRequests(): void {
  //   this.productRequests$
  //     .pipe(
  //       switchMap(({ slug, sizeId }) => {
  //         this.isLoading = true;
  //         this.errorMessage = '';

  //         return this._CategoriesService
  //           .getSubCategoryBySize(slug, 10, 1, sizeId)
  //           .pipe(
  //             catchError((error) => {
  //               console.error('Error loading products:', error);

  //               this.subCategoryProducts = [];
  //               this.errorMessage =
  //                 'Unable to load products. Please try again.';

  //               return EMPTY;
  //             }),

  //             finalize(() => {
  //               this.isLoading = false;
  //             })
  //           );
  //       }),

  //       takeUntilDestroyed(this._DestroyRef)
  //     )
  //     .subscribe({
  //       next: (res: any) => {
  //         this.subCategoryProducts = res?.results || [];

  //         // Automatic Navigation When Only One Product Exists
  //         if (
  //           !this.subCategory?.sub_category_size?.length &&
  //           this.subCategoryProducts.length === 1
  //         ) {
  //           const product = this.subCategoryProducts[0];

  //           this._Router.navigate(['/product', product.seo_slug], {
  //             replaceUrl: true,
  //           });
  //         }
  //       },
  //     });
  // }

    
  private listenToProductRequests(): void {
    this.productRequests$
      .pipe(
        switchMap(({ slug, sizeId }) => {
          this.isLoading = true;
          this.isAutoNavigating = false;
          this.errorMessage = '';

          return this._CategoriesService
            .getSubCategoryBySize(slug, 10, 1, sizeId)
            .pipe(
              catchError((error) => {
                console.error('Error loading products:', error);

                this.subCategoryProducts = [];
                this.errorMessage =
                  'Unable to load products. Please try again.';

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
        next: (res: any) => {
          const results = res?.results || [];

          this.subCategoryProducts = results;

          if (results.length === 1) {
            const product = results[0];

            this.isAutoNavigating = true;

            setTimeout(() => {
              this._Router.navigate(['/product', product.seo_slug], {
                replaceUrl: true,
              });
            }, 1000);
          }
        },
      });
  }

  // Select Size

  
  getSubCatBySize(sizeId: number): void {
    if (!this.subCategory?.seo_slug || this.selectedSizeId === sizeId) {
      return;
    }

    this.SubSizeId = sizeId;
    this.selectedSizeId = sizeId;

    this.subCategoryProducts = [];

    this.productRequests$.next({
      slug: this.subCategory.seo_slug,
      sizeId,
    });
  }

  // Pull To Refresh
  handleRefresh(event: any): void {
    this._GlobalRefreshService.refresh();

    setTimeout(() => {
      event.target.complete();
    }, 1500);
  }
}
