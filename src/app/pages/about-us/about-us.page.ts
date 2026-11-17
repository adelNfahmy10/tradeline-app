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
import { AboutUsService } from 'src/core/services/about-us/about-us-service';
import { SafeHtmlPipe } from 'src/core/pipes/safeHtml/safe-html-pipe';
import { TabsComponent } from 'src/app/components/tabs/tabs.component';
import { GlobalRefreshService } from '../../../core/services/global-refresh/global-refresh-service';

@Component({
  selector: 'app-about-us',
  templateUrl: './about-us.page.html',
  styleUrls: ['./about-us.page.scss'],
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
    SafeHtmlPipe,
    TabsComponent,
  ],
})
export class AboutUsPage implements OnInit {
  private readonly _AboutUsService = inject(AboutUsService);
  private readonly _GlobalRefreshService = inject(GlobalRefreshService);

  aboutUsData: any;

  ngOnInit(): void {
    this.getAboutData();
  }

  getAboutData(): void {
    this._AboutUsService.getAbout().subscribe({
      next: (res) => {
        this.aboutUsData = res;
      },
    });
  }

  handleRefresh(event: any) {
    this._GlobalRefreshService.refresh();

    setTimeout(() => {
      event.target.complete();
    }, 1500);
  }
}
