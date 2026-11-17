import {
  Component,
  computed,
  effect,
  inject,
  OnInit,
  Signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import {
  IonContent,
  IonHeader,
  IonTitle,
  IonToolbar,
  IonButtons,
  IonBackButton,
  IonSelectOption,
  IonList,
  IonItem,
  IonRow,
  IonGrid,
  IonCol,
  IonSelect,
  IonFooter,
  IonRefresher,
  IonRefresherContent,
} from '@ionic/angular/standalone';
import { EasyPayService } from 'src/core/services/easypay/easy-pay-service';
import { SafeHtmlPipe } from 'src/core/pipes/safeHtml/safe-html-pipe';
import { SkeletonReloadPage } from '../skeleton-reload/skeleton-reload.page';
import { TabsComponent } from 'src/app/components/tabs/tabs.component';
import { GlobalRefreshService } from 'src/core/services/global-refresh/global-refresh-service';

interface Rule {
  icon: string;
  text: string;
}

@Component({
  selector: 'app-easypay',
  templateUrl: './easypay.page.html',
  styleUrls: ['./easypay.page.scss'],
  standalone: true,
  imports: [
    IonRefresherContent,
    IonRefresher,
    IonFooter,
    IonCol,
    IonGrid,
    IonRow,
    IonItem,
    IonList,
    IonBackButton,
    IonButtons,
    IonContent,
    IonHeader,
    IonTitle,
    IonToolbar,
    CommonModule,
    FormsModule,
    IonSelectOption,
    SafeHtmlPipe,
    ReactiveFormsModule,
    IonSelect,
    SkeletonReloadPage,
    TabsComponent,
  ],
})
export class EasypayPage {
  private readonly easypay = inject(EasyPayService);
  private readonly _GlobalRefreshService = inject(GlobalRefreshService);

  tradeIn: Signal<any[]> = computed(() => this.easypay.tradeInArr());
  offers: Signal<any[]> = computed(() => this.easypay.offerArr());
  types: Signal<any[]> = computed(() => this.easypay.typesArr());
  oldDevices: Signal<any[]> = computed(() => this.easypay.oldDevicesArr());
  newDevices: Signal<any[]> = computed(() => this.easypay.newDevicesArr());

  tab: 'tradein' | 'offers' = 'tradein';
  selectedType: string | number | null = null;
  selectedNewDevice: number = 0;
  selectedOldDevice: number = 0;

  rules: Rule[] = [
    {
      icon: '01.png',
      text: 'Your device (iPhone & Mac) powers up and functions normally',
    },
    {
      icon: '02.png',
      text: 'Your device display is in good condition (iPhone & Mac)',
    },
    {
      icon: '03.png',
      text: 'Your device enclosure is in good condition (Free from dents)',
    },
    {
      icon: '04.png',
      text: 'Your device has no obvious signs of liquid contact (iPhone & Mac)',
    },
    {
      icon: '05.png',
      text: 'Your device keys or buttons are in good working condition (iPhone & Mac)',
    },
    {
      icon: '06.png',
      text: 'You have the device original power cable and adapter (iPhone & Mac)',
    },
    { icon: '07.png', text: 'Your device has no iCloud account it' },
    { icon: '08.png', text: 'Your device is signed off from Find My iPhone' },
  ];

  constructor() {
    effect(() => {
      const t = this.types();
      if (t && t.length && !this.selectedType) {
        this.selectedType = t[0].key ?? t[0].id;
        this.loadDevicesForSelectedType();
      }
    });
  }

  handleRefresh(event: any) {
    this._GlobalRefreshService.refresh();

    setTimeout(() => {
      event.target.complete();
    }, 1500);
  }

  loadDevicesForSelectedType() {
    if (!this.selectedType) return;
    this.selectedOldDevice = 0;
    this.selectedNewDevice = 0;
    this.easypay.loadOldDevice(this.selectedType);
    this.easypay.loadNewDevice(this.selectedType);
  }

  onTypeSelect(value: any) {
    if (this.selectedType !== value) {
      this.selectedType = value;
      this.loadDevicesForSelectedType();
    }
  }

  getLogos(body: string): string {
    if (!body) return '';
    const all = body.split('LOG-');

    return all
      .map((str) => {
        if (!str) return '';
        return /^[0-9]/.test(str[0])
          ? `<div><img loading="lazy" src="/assets/images/easypay-images/trade-in/${str[0]}.png" alt="icon" /></div>${str.slice(1)}`
          : str;
      })
      .join('');
  }

  get resultAmount(): number {
    return (
      (Number(this.selectedNewDevice) || 0) -
      (Number(this.selectedOldDevice) || 0)
    );
  }
}
