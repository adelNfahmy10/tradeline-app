import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  IonContent,
  IonHeader,
  IonTitle,
  IonToolbar,
  IonButtons,
  IonFooter,
} from '@ionic/angular/standalone';
import { AuthService } from 'src/core/services/auth/auth-service';
import { GlobalRefreshService } from 'src/core/services/global-refresh/global-refresh-service';
import { IonMenuButton } from '@ionic/angular/standalone';
import { TabsComponent } from 'src/app/components/tabs/tabs.component';
import { SearchModalComponent } from 'src/app/components/search-modal/search-modal.component';
import { Router } from '@angular/router';

@Component({
  selector: 'app-order-successfully',
  templateUrl: './order-successfully.page.html',
  styleUrls: ['./order-successfully.page.scss'],
  standalone: true,
  imports: [
    IonFooter,
    IonButtons,
    IonContent,
    IonHeader,
    IonTitle,
    IonToolbar,
    CommonModule,
    FormsModule,
    IonMenuButton,
    TabsComponent,
    SearchModalComponent,
  ],
})
export class OrderSuccessfullyPage implements OnInit, OnDestroy {
  private readonly _AuthService = inject(AuthService);
  private readonly _GlobalRefreshService = inject(GlobalRefreshService);
  private readonly _Router = inject(Router);

  private redirectTimer?: ReturnType<typeof setTimeout>;

  token = this._AuthService.token;

  ngOnInit(): void {
    this.redirectTimer = setTimeout(() => {
      this._Router.navigateByUrl('/home');
    }, 10_000);
  }

  ngOnDestroy(): void {
    if (this.redirectTimer) {
      clearTimeout(this.redirectTimer);
    }
  }

  handleRefresh(event: any): void {
    this._GlobalRefreshService.refresh();

    setTimeout(() => {
      event.target.complete();
    }, 1500);
  }
}
