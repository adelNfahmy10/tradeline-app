import { Component, OnInit } from '@angular/core';
import { IonList, IonListHeader, IonSkeletonText, IonItem, IonLabel, IonThumbnail } from '@ionic/angular/standalone';

@Component({
  selector: 'app-skeleton-reload',
  templateUrl: './skeleton-reload.page.html',
  styleUrls: ['./skeleton-reload.page.scss'],
  standalone: true,
  imports: [IonLabel, IonSkeletonText, IonItem, IonListHeader, IonList, IonThumbnail]
})
export class SkeletonReloadPage implements OnInit {

  constructor() { }

  ngOnInit() {
  }

}
