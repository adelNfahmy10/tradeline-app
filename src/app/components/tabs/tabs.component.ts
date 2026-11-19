import { Component, DestroyRef, inject, OnInit } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router, RouterLink } from '@angular/router';

import { filter } from 'rxjs';

import { Haptics, ImpactStyle } from '@capacitor/haptics';
import { CartService } from 'src/core/services/cart/cart-service';

interface TabItem {
  route: string;
  icon: string;
  label: string;
  hasBadge?: boolean;
}

@Component({
  selector: 'app-tabs',
  templateUrl: './tabs.component.html',
  styleUrls: ['./tabs.component.scss'],
  standalone: true,
  imports: [RouterLink],
})
export class TabsComponent implements OnInit {
  private readonly _CartService = inject(CartService);
  private readonly _Router = inject(Router);
  private readonly _DestroyRef = inject(DestroyRef);

  cartCount = this._CartService.productCount;

  activeIndex = -1;
  indicatorTransform = 'translate3d(0, -50%, 0)';

  readonly tabs: TabItem[] = [
    { route: '/home', icon: 'fa-solid fa-compass', label: 'Explore' },
    { route: '/shop', icon: 'fa-solid fa-cart-shopping', label: 'Shop' },
    {
      route: '/notification',
      icon: 'fa-regular fa-bell',
      label: 'Notifications',
    },
    { route: '/support', icon: 'fa-solid fa-headset', label: 'Support' },
    {
      route: '/cart',
      icon: 'fa-solid fa-bag-shopping',
      label: 'Cart',
      hasBadge: true,
    },
  ];

  private readonly shopAliases = ['/product/', '/categories/'];
  private dirObserver?: MutationObserver;

  ngOnInit(): void {
    this.updateActiveTab();

    this._Router.events
      .pipe(
        filter(
          (event): event is NavigationEnd => event instanceof NavigationEnd
        ),
        takeUntilDestroyed(this._DestroyRef)
      )
      .subscribe(() => this.updateActiveTab());

    // تحديث الـ pill تلقائيًا لما اللغة/الاتجاه يتغير وقت التشغيل
    this.dirObserver = new MutationObserver(() => this.updateIndicator());
    this.dirObserver.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['dir'],
    });
    this._DestroyRef.onDestroy(() => this.dirObserver?.disconnect());
  }

  onTabClick(): void {
    Haptics.impact({ style: ImpactStyle.Light }).catch(() => {});
  }

  private updateActiveTab(): void {
    const currentUrl = this._Router.url.split(/[?#]/)[0];

    if (this.shopAliases.some((prefix) => currentUrl.startsWith(prefix))) {
      this.activeIndex = 1;
    } else {
      this.activeIndex = this.tabs.findIndex(
        (tab) =>
          currentUrl === tab.route || currentUrl.startsWith(`${tab.route}/`)
      );
    }

    this.updateIndicator();
  }

  private updateIndicator(): void {
    const isRtl = document.documentElement.dir === 'rtl';
    const direction = isRtl ? -1 : 1;
    const index = Math.max(this.activeIndex, 0);

    this.indicatorTransform = `translate3d(${
      direction * index * 100
    }%, -50%, 0)`;
  }
}
