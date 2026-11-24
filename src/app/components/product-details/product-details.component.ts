import { DecimalPipe, NgStyle, NgClass } from '@angular/common';
import {
  Component,
  CUSTOM_ELEMENTS_SCHEMA,
  effect,
  inject,
  OnInit,
} from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { CartService } from 'src/core/services/cart/cart-service';
import { ProductSerivce } from 'src/core/services/products/product-serivce';
import {
  IonAccordionGroup,
  IonAccordion,
  IonGrid,
  IonCol,
  IonItem,
  IonLabel,
} from '@ionic/angular/standalone';
import { SkeletonReloadPage } from 'src/app/pages/skeleton-reload/skeleton-reload.page';
import { FavoriteService } from 'src/core/services/favorite/favorite-service';
import { ToastrService } from 'ngx-toastr';
import { from, Observable } from 'rxjs';
import { Share } from '@capacitor/share';
import { GlobalRefreshService } from 'src/core/services/global-refresh/global-refresh-service';

@Component({
  selector: 'app-product-details',
  templateUrl: './product-details.component.html',
  styleUrls: ['./product-details.component.scss'],
  imports: [
    DecimalPipe,
    IonAccordion,
    IonAccordionGroup,
    IonItem,
    IonLabel,
    SkeletonReloadPage,
    IonGrid,
    IonCol,
    RouterLink,
  ],
  standalone: true,
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class ProductDetailsComponent implements OnInit {
  private readonly _ActivatedRoute = inject(ActivatedRoute);
  private readonly _ProductService = inject(ProductSerivce);
  private readonly _FavoriteService = inject(FavoriteService);
  private readonly _CartService = inject(CartService);
  private readonly _ToastrService = inject(ToastrService);
  private readonly _GlobalRefreshService = inject(GlobalRefreshService);

  private lastRefresh = 0;

  cartProducts: any[] = [];
  productId: any;
  productSlug: any;
  productDetails: any;
  productVariants: any[] = [];

  capacities: any[] = [];
  availableColors: any[] = [];
  selectedColor: any = null;

  selectedCapacity: any = null;
  selectedVariant: any = null;

  displayedPrice: number = 0;
  selectedScreenSize: any = null;
  sliderImages: string[] = [];

  out_of_stock: boolean = false;

  cartCount = this._CartService.productCount;

  ngOnInit(): void {
    this.getProductDetails();
  }

  constructor() {
    effect(() => {
      const refreshId = this._GlobalRefreshService.refreshTrigger();

      if (refreshId === 0 || refreshId === this.lastRefresh) {
        return;
      }

      this.lastRefresh = refreshId;

      this.getProductDetails();
    });
  }

  /* ================================================
    1) Fetch product
  ================================================ */
  getProductDetails(): void {
    this._ActivatedRoute.paramMap.subscribe({
      next: (params) => {
        this.productSlug = params.get('id');
        if (this.productSlug) {
          this._ProductService.getProductByName(this.productSlug).subscribe({
            next: (res) => {
              this.productDetails = res;
              this.productVariants = res?.productproperties;
              this.productId = this.productDetails.id;
              console.log(this.productDetails);

              this.getCart();
              this.getAllFavoites();

              // اختار أول variant
              this.selectVariant(this?.productVariants[0]);

              // حضر الـ capacities
              this.prepareCapacities();

              // حضّر الألوان الخاصة بالـ capacity الحالية
              this.filterColorsByCapacity();
            },
          });
        }
      },
    });
  }

  /* ================================================
    2) Select Variant
  ================================================ */
  selectVariant(variant: any) {
    this.selectedVariant = variant;

    this.selectedCapacity = variant?.capacity;
    this.selectedColor = variant?.color;

    // الصور
    this.sliderImages = [
      variant?.color?.picture,
      variant?.color?.picture2,
      variant?.color?.picture3,
      variant?.color?.picture4,
      variant?.color?.picture5,
    ].filter((img) => !!img);

    // السعر
    this.displayedPrice = variant?.price;

    // المقاس
    this.selectedScreenSize = variant?.screen_size?.name;

    // المخزون
    this.out_of_stock = !variant?.in_stock;

    // ألوان متاحة حسب السعة
    this.filterColorsByCapacity();
  }

  /* ================================================
    3) Prepare Capacities
  ================================================ */
  prepareCapacities() {
    const map = new Map();

    this.productVariants.forEach((variant) => {
      if (!map.has(variant?.capacity?.id)) {
        map.set(variant?.capacity?.id, {
          ...variant?.capacity,
          out_of_stock: !this.productVariants.some(
            (v) => v.capacity?.id === variant?.capacity?.id && v.in_stock,
          ),
        });
      }
    });

    this.capacities = Array.from(map.values());
  }

  /* ================================================
    4) Filter colors by selected capacity
  ================================================ */
  filterColorsByCapacity() {
    this.availableColors = this.productVariants
      .filter((v) => v.capacity?.id === this.selectedCapacity?.id)
      .sort((a, b) => (a.in_stock === b.in_stock ? 0 : a.in_stock ? -1 : 1));
    this.getCart();
  }

  /* ================================================
    5) On Capacity Change
  ================================================ */
  selectCapacity(cap: any) {
    this.selectedCapacity = cap;

    this.filterColorsByCapacity();

    const firstVariant = this.availableColors[0];

    if (firstVariant) {
      this.selectVariant(firstVariant);
      this.out_of_stock = !firstVariant?.in_stock;
    } else {
      this.out_of_stock = true;
    }
  }

  /* ================================================
    6) On Color Change
  ================================================ */
  selectColor(colorVariant: any) {
    this.selectVariant(colorVariant);
  }

  /* ================================================
    6) Pay Type Method
  ================================================ */
  selectedPaymentType: string = 'full';

  switchPayType(type: any): void {
    this.selectedPaymentType = type;
  }

  /* ================================================
    6) Cart Login
  ================================================ */
  checkProductInCart: boolean = false;

  getCart(): void {
    this._CartService.getCart().subscribe({
      next: (res) => {
        this.cartProducts = res?.cartproduct || [];
        this.checkProductInCart = this.cartProducts.some(
          (item: any) =>
            item?.product_property?.id === this.selectedVariant?.id,
        );
      },
    });
  }

  addToCart(): void {
    if (!this.selectedVariant || this.out_of_stock) return;
    const body: any = {
      product: this.productId,
      product_property: this.selectedVariant?.id,
      quantity: 1,
      insurance: null,
      branded_page_product: null,
    };

    body.cart = localStorage.getItem('userCartId')
      ? 2
      : this._CartService.currentCartId();

    if (localStorage.getItem(`userCartId`)) {
      this._CartService.addProductToCart(body).subscribe({
        next: (res) => {
          this._ToastrService.success('Product added to cart');
          this._CartService.getCartCount();
          this.getCart();
          console.log(res);
        },
        error: (err) => {
          this._ToastrService.error(err.error?.detail);
        },
      });
    } else {
      body.cart = this._CartService.currentCartId();
      this._CartService.addProductToCart(body).subscribe({
        next: (res) => {
          // this._ToastrService.success('Product added to cart')
          this._CartService.getCartCount();
          this.getCart();
        },
        error: (err) => {
          // this._ToastrService.error(err.error?.detail)
        },
      });
    }
  }

  /* ================================================
    6) Favorites Login
  ================================================ */
  allFavorites: any[] = [];

  getAllFavoites(): void {
    this._FavoriteService.getFavorites().subscribe({
      next: (res) => {
        this.allFavorites = res;
      },
    });
  }

  isFavorite(): boolean {
    return (
      this.allFavorites?.some(
        (favorite: any) => favorite?.id === this.productId,
      ) ?? false
    );
  }

  toggleFavorite(): void {
    if (!this.productId) return;

    const favorite = this.allFavorites?.find(
      (item: any) => item?.id === this.productId,
    );

    if (favorite) {
      // Remove
      this._FavoriteService.deleteFavorites(favorite.id).subscribe({
        next: () => {
          this.allFavorites = this.allFavorites.filter(
            (item: any) => item.id !== favorite.id,
          );

          // Update global count
          this._FavoriteService.removeFavoriteFromState(favorite.id);

          this._ToastrService.success(
            'Product removed from favorites successfully',
          );
        },
        error: ()=>{
          this._ToastrService.error(
            'Unable to remove this product from your favorites. Please try again.'
          );
        }
      });
    } else {
      // Add
      this._FavoriteService.addFavorites(this.productId).subscribe({
        next: () => {
          this.allFavorites = [...this.allFavorites, this.productDetails];

          // Update global count
          this._FavoriteService.addFavoriteToState(this.productDetails);

          this._ToastrService.success(
            'Product added to favorites successfully',
          );
        },
        error: ()=>{
          this._ToastrService.error(
            'Unable to add this product to your favorites. Please try again.'
          );
        }
      });
    }
  }

  shareProduct(): void {
    const productUrl = this.productDetails?.website_link;
    from(
      Share.share({
        title: this.productDetails?.name || 'Product',
        text: `Check out ${this.productDetails?.name || 'this product'}`,
        url: productUrl,
        dialogTitle: 'Share Product',
      }),
    ).subscribe({
      next: (res) => {},
      error: (err) => {},
    });
  }
}
