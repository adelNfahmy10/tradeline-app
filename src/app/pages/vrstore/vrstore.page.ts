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
  IonRefresherContent,
  IonRefresher,
} from '@ionic/angular/standalone';
import { GlobalRefreshService } from 'src/core/services/global-refresh/global-refresh-service';

@Component({
  selector: 'app-vrstore',
  templateUrl: './vrstore.page.html',
  styleUrls: ['./vrstore.page.scss'],
  standalone: true,
  imports: [
    IonRefresher,
    IonRefresherContent,
    IonBackButton,
    IonButtons,
    IonContent,
    IonHeader,
    IonTitle,
    IonToolbar,
    CommonModule,
    FormsModule,
  ],
})
export class VrstorePage implements OnInit {
  private readonly _GlobalRefreshService = inject(GlobalRefreshService);

  ngOnInit() {}

  handleRefresh(event: any) {
    this._GlobalRefreshService.refresh();

    setTimeout(() => {
      event.target.complete();
    }, 1500);
  }
}
