import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CartService } from 'src/app/core/services/cart.service';
import { CartBadgeService } from 'src/app/core/services/cartBadge.service';
import { ProductService } from 'src/app/core/services/product.service';
import { ToastService } from 'src/app/core/services/toast.service';

@Component({
  selector: 'app-cart',
  templateUrl: './cart.component.html',
  styleUrls: ['./cart.component.css']
})
export class CartComponent implements OnInit {

  cartItems: any[] = [];
  loading = true;
  TotalAmountofAllProduct = 0;
  showRelated = false;
  productsStockMap = new Map<number, number>();

  constructor(
    private cartService: CartService,
    private toast: ToastService,
    private router: Router,
    private cartBadge: CartBadgeService,
    private productService: ProductService,
  ) { }

  ngOnInit(): void {
    this.loadProductsStock();
    this.loadCartItems();

  }
  loadProductsStock() {
    this.productService.getAllProducts().subscribe(products => {
      products.forEach(p => {
        this.productsStockMap.set(p.id, p.currentStock ?? p.inStock ?? 0);
      });
    });
  }
  loadCartItems() {
    this.loading = true;

    this.cartService.getMyCart().subscribe({
      next: (res) => {
        if (!res.data || !res.data.items) {
          this.cartItems = [];
          this.cartBadge.updateCartCount(0);
          this.loading = false;
          console.log(res)
          console.log(res.data)
          console.log(this.cartBadge)
          return;
        }
        console.log('RAW CART DATA', res.data.items);

        // Map backend DTO → UI model
        this.cartItems = res.data.items.map((i: any) => ({
          id: i.id,
          quantity: i.quantity,
          product: {
            id: i.productId,
            name: i.productName,
            price: i.price,
            images: i.images,

          }
        }));

        this.TotalAmountofAllProduct = res.data.grandTotal;
        this.cartBadge.updateCartCount(this.cartItems.length);
        this.loading = false;
      },
      error: () => {
        this.loading = false;
        this.toast.error('Failed to load cart');
      }
    });
  }

  increment(item: any) {
    const stock = this.productsStockMap.get(item.product.id) ?? 0;
    const nextQty = item.quantity + 1;
    console.log(stock)
    console.log(nextQty)
    if (nextQty > stock) {
      this.toast.warning(`Stock limit reached (${stock})`);
      return;
    }
    this.cartService
      .updateItem(item.id, nextQty)
      .subscribe(() => this.loadCartItems());
  }


  decrement(item: any) {

    if (item.quantity <= 1) 
      return this.toast.error("At least one needed in Cart");
    
    this.cartService
      .updateItem(item.id, item.quantity - 1)
      .subscribe(() => this.loadCartItems());
  }

  removeFromCart(itemId: number) {
    this.cartService.removeItem(itemId).subscribe(() => {
      this.toast.error('Item removed from cart');
      this.loadCartItems();
    });
  }

  buyProduct(product: any) {
    this.router.navigate(['/products/product-buy'], {
      state: { product: [{ ...product, quantity: 1 }] }
    });
  }

  proceedToCheckout() {
    const products = this.cartItems.map(i => ({
      ...i.product,
      quantity: i.quantity
    }));

    this.router.navigate(['/products/product-buy'], {
      state: { product: products }
    });
  }

  goBack() {
    this.router.navigate(['/products']);
  }
}
