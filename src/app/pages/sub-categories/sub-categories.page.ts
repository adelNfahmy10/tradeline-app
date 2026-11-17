import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  IonContent,
  IonHeader,
  IonTitle,
  IonToolbar,
  IonButtons,
  IonBackButton,
  IonSpinner,
  IonFooter,
  IonRefresher,
  IonRefresherContent,
} from '@ionic/angular/standalone';
import { CategoriesService } from 'src/core/services/categories/categories-service';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { filter, map, switchMap } from 'rxjs';
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
  ],
})
export class SubCategoriesPage implements OnInit {
  private _CategoriesService = inject(CategoriesService);
  private _ActivatedRoute = inject(ActivatedRoute);
  private readonly _GlobalRefreshService = inject(GlobalRefreshService);
  private _Router = inject(Router);

  subCategory: any;
  SubSizeId: any;
  subCategoryProducts: any[] = [];
  selectedSizeId: any = null;

  ngOnInit(): void {
    this.getSubCategory();
  }

  handleRefresh(event: any) {
    this._GlobalRefreshService.refresh();

    setTimeout(() => {
      event.target.complete();
    }, 1500);
  }

  getSubCategory(): void {
    this._ActivatedRoute.paramMap
      .pipe(
        map((params) => params.get('subName')),
        filter((name) => !!name),
        switchMap((name: any) =>
          this._CategoriesService.getSubCategoriesByName(name)
        ),
        switchMap((res: any) => {
          this.subCategory = res;
          this.SubSizeId = this.subCategory?.sub_category_size?.[0]?.id;
          this.selectedSizeId = this.SubSizeId;

          return this._CategoriesService.getSubCategoryBySize(
            this.subCategory.seo_slug,
            10,
            1,
            this.SubSizeId
          );
        })
      )
      .subscribe({
        next: (res: any) => {
          this.subCategoryProducts = res.results || [];

          if (
            !this.subCategory?.sub_category_size?.length &&
            this.subCategoryProducts.length === 1
          ) {
            const product = this.subCategoryProducts[0];
            this._Router.navigate(['/product', product.seo_slug], {
              replaceUrl: true,
            });
            return;
          }
        },
      });
  }

  getSubCatBySize(sizeId: any): void {
    this.SubSizeId = sizeId;
    this.selectedSizeId = sizeId;
    this.subCategoryProducts = [];
    this._CategoriesService
      .getSubCategoryBySize(this.subCategory.seo_slug, 10, 1, this.SubSizeId)
      .subscribe({
        next: (res: any) => {
          this.subCategoryProducts = res.results || [];
          // Sub Category
          if (
            !this.subCategory?.sub_category_size?.length &&
            this.subCategoryProducts.length === 1
          ) {
            const product = this.subCategoryProducts[0];
            this._Router.navigate(['/product', product.seo_slug], {
              replaceUrl: true,
            });
            return;
          }
        },
      });
  }
}
