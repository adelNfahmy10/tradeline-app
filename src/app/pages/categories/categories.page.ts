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
  IonFooter,
  IonRefresher,
  IonRefresherContent,
} from '@ionic/angular/standalone';
import { CategoriesService } from 'src/core/services/categories/categories-service';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { TabsComponent } from 'src/app/components/tabs/tabs.component';
import { GlobalRefreshService } from 'src/core/services/global-refresh/global-refresh-service';

@Component({
  selector: 'app-categories',
  templateUrl: './categories.page.html',
  styleUrls: ['./categories.page.scss'],
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
    RouterLink,
    TabsComponent,
  ],
})
export class CategoriesPage implements OnInit {
  private readonly _CategoriesService = inject(CategoriesService);
  private readonly _ActivatedRoute = inject(ActivatedRoute);
  private readonly _GlobalRefreshService = inject(GlobalRefreshService);

  categories: any;
  catName: string = '';

  ngOnInit(): void {
    this.getAllSubCategories();
  }

  handleRefresh(event: any) {
    this._GlobalRefreshService.refresh();

    setTimeout(() => {
      event.target.complete();
    }, 1500);
  }

  getAllSubCategories(): void {
    this._ActivatedRoute.paramMap.subscribe({
      next: (param) => {
        let catName = param.get('catName');
        this._CategoriesService.getCategoryByName(catName).subscribe({
          next: (res) => {
            this.categories = res;
          },
        });
      },
    });
  }
}
