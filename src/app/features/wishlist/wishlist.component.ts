import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ToastService } from 'src/app/core/services/toast.service';
import { WishlistBadgeService } from 'src/app/core/services/wishlistBadge.service';
import { WishlistService } from 'src/app/core/services/wishlist.service';
import { ProductService } from 'src/app/core/services/product.service';
import { WishlistItem } from 'src/app/core/models/WishlistItem.model';

@Component({
  selector: 'app-wishlist',
  templateUrl: './wishlist.component.html',
})
export class WishlistComponent implements OnInit {

  WishlistItems: WishlistItem[] = [];
  loading = true;
  showCart = false;

  constructor(
    private wishlistService: WishlistService,
    private toast: ToastService,
    private router: Router,
    private wishlistBadge: WishlistBadgeService,
    private productService: ProductService
  ) { }

  ngOnInit() {
    this.loadWishlist();
  }

  loadWishlist() {
    this.loading = true;

    this.wishlistService.getMyWishlist().subscribe({
      next: (res: any) => {

        if (res.statusCode === 200 && res.data?.items) {
          const wishlist = res.data.items;

          this.productService.getAllProducts().subscribe(products => {

            // build map for fast lookup
            const productMap = new Map(
              products.map(p => [p.id, p])
            );

            this.WishlistItems = wishlist.map((item: any) => {
              const prod = productMap.get(item.productId);
              const colors =
                prod?.availableColors ??
                prod?.colors ??
                item.colors ??
                [];
              return {
                ...item,
                category: prod?.categoryName || prod?.category || 'Unknown',
                currentStock: prod?.currentStock ?? 0,
                images: prod?.images || item.images,
                topSelling: prod?.topSelling ?? item.topSelling,
                colors: Array.isArray(colors)
                  ? colors
                  : (typeof colors === 'string'
                    ? colors.split(',').map(c => c.trim())
                    : [])
              };
            });

            this.wishlistBadge.updatewishlistCount(this.WishlistItems.length);
            this.loading = false;

          });

        } else {
          this.WishlistItems = [];
          this.wishlistBadge.updatewishlistCount(0);
          this.loading = false;
        }
      },
      error: () => {
        this.loading = false;
        this.WishlistItems = [];
        this.wishlistBadge.updatewishlistCount(0);
      }
    });
  }


  getAddToCartButtonClass(stock: number): string {
    const base = 'px-3 py-2 rounded-full text-sm transition-all duration-200';
    return stock === 0
      ? `${base} bg-gray-200 text-gray-400 cursor-not-allowed`
      : `${base} bg-yellow-500 text-black hover:bg-yellow-600`;
  }

  addToCart(item: any) {

    if ((item.currentStock ?? 0) <= 0) {
      this.toast.info("Out of Stock");
      return;
    }

    // TODO: Call your backend Cart Add API here
    this.toast.success("Added to Cart");

    this.removeFromWishlist(item.productId);
  }

  removeFromWishlist(productId: number) {
    this.wishlistService.toggle(productId).subscribe({
      next: () => {
        this.toast.success("Removed from Wishlist");
        this.loadWishlist();
      }
    });
  }

  clearWishlist() {
    this.wishlistService.clear().subscribe({
      next: () => {
        this.toast.success("Wishlist Cleared");
        this.loadWishlist();
      }
    });
  }

  goBack() {
    this.router.navigate(['/products']);
  }

}
