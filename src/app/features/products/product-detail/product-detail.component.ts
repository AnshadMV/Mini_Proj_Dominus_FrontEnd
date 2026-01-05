import { HttpClient } from '@angular/common/http';
import { Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { switchMap } from 'rxjs';
import { Product } from 'src/app/core/models/product.model';
import { CartService } from 'src/app/core/services/cart.service';
import { CartBadgeService } from 'src/app/core/services/cartBadge.service';
import { ProductService } from 'src/app/core/services/product.service';
import { ToastService } from 'src/app/core/services/toast.service';
import { WishlistService } from 'src/app/core/services/wishlist.service';
import { WishlistBadgeService } from 'src/app/core/services/wishlistBadge.service';

@Component({
  selector: 'app-product-detail',
  templateUrl: './product-detail.component.html',
  styleUrls: ['./product-detail.component.css']
})
export class ProductDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private productService = inject(ProductService);
  private toast = inject(ToastService);
  private cartService = inject(CartService);
  private wishlistService = inject(WishlistService);
  private wishlistBadge = inject(WishlistBadgeService);
  private cartBadge = inject(CartBadgeService);

  product: Product | null = null;
  selectedImageIndex = 0;
  isLoading = true;
  showRelatedProducts = false
  wishlistProductIds = new Set<number>();
  cartProductMap = new Map<number, number>();
  cartQuantities = new Map<number, number>();
  ngOnInit() {
    this.route.paramMap.subscribe(params => {
      const id = Number(params.get('id'));
      if (id) {
        this.loadProduct(id);
      }
    });

    this.loadWishlist();
    this.loadCartStatus();
  }

  loadProduct(id: number) {
    this.productService.getAllProducts().subscribe({
      next: (products) => {
        this.product = products.find(p => p.id === id) ?? null;
        this.isLoading = false;

        if (!this.product) {
          this.toast.error("Product not found");
          this.router.navigate(['/products']);
        }
      },
      error: () => {
        this.toast.error("Failed to load product");
        this.isLoading = false;
      }
    });
  }

  loadWishlist() {
    this.wishlistService.getMyWishlist().subscribe({
      next: (res: any) => {
        if (res.statusCode === 200 && res.data?.items) {
          this.wishlistProductIds = new Set(
            res.data.items.map((x: any) => x.productId)
          );
        } else {
          this.wishlistProductIds.clear();
        }

        this.wishlistBadge.updatewishlistCount(this.wishlistProductIds.size);
      },
      error: () => {
        this.wishlistProductIds.clear();
        this.wishlistBadge.updatewishlistCount(0);
      }
    });
  }


  loadCartStatus() {
    this.cartService.getMyCart().subscribe(res => {
      this.cartProductMap.clear();
      this.cartQuantities.clear();

      if (res?.data?.items) {
        res.data.items.forEach((i: any) => {
          this.cartProductMap.set(i.productId, i.id);
          this.cartQuantities.set(i.productId, i.quantity);
        });
      }

      // OPTIONAL — only if you want badge update
      this.cartBadge.updateCartCount(this.cartQuantities.size);
    });
  }

  selectImage(index: number) {
    this.selectedImageIndex = index;
  }

  addToCart(product: Product) {

    if (product.currentStock <= 0) {
      this.toast.info("Out of stock");
      return;
    }

    const cartItemId = this.cartProductMap.get(product.id);

    // Already in cart → increase qty
    if (cartItemId) {
      const currentQty = this.cartQuantities.get(product.id) ?? 1;
      const nextQty = currentQty + 1;

      if (nextQty > product.currentStock) {
        this.toast.warning("Stock limit reached");
        return;
      }

      this.cartService.updateItem(cartItemId, nextQty).subscribe(() => {
        this.toast.success("Quantity updated");
        this.loadCartStatus();
      });

      return;
    }

    // New item
    this.cartService.addToCart(product.id, 1).subscribe(() => {
      this.toast.success("Added to cart");
      this.loadCartStatus();
    });
  }


  toggleWishlist(product: Product) {

    if (!product?.id) {
      this.toast.error("Invalid product");
      return;
    }

    this.wishlistService.toggle(product.id).subscribe({
      next: (res: any) => {

        if (res.statusCode === 200) {
          this.toast.success("Added to Wishlist");
          this.wishlistProductIds.add(product.id);
        }
        else if (res.statusCode === 201) {
          this.toast.info("Removed from Wishlist");
          this.wishlistProductIds.delete(product.id);
        }

        this.wishlistBadge.updatewishlistCount(this.wishlistProductIds.size);
      },
      error: (err) => {
        this.toast.error(err.error?.message || "Failed to update wishlist");
      }
    });

  }



  goBack() {
    this.router.navigate(['/products']);
  }
}