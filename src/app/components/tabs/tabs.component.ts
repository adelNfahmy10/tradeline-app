import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { CartService } from 'src/core/services/cart/cart-service';

@Component({
  selector: 'app-tabs',
  templateUrl: './tabs.component.html',
  styleUrls: ['./tabs.component.scss'],
  standalone: true,
  imports: [CommonModule, RouterLinkActive, RouterLink],
})
export class TabsComponent {
  private readonly _CartService = inject(CartService);

  cartCount = this._CartService.productCount;
}
