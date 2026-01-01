import { HttpClient } from '@angular/common/http';
import { Component, OnInit, inject } from '@angular/core';
import { Router } from '@angular/router';
import { map, Subscription, switchMap } from 'rxjs';
import { ProductService } from 'src/app/core/services/product.service';
import { ToastService } from 'src/app/core/services/toast.service';
import { SearchService } from 'src/app/core/services/navbar_search.service';
import { Product } from 'src/app/core/models/product.model';
import { Category } from 'src/app/core/models/category.model';
import { website_constants } from 'src/app/core/constants/app.constant';
import { CartService } from 'src/app/core/services/cart.service';
import { WishlistService } from 'src/app/core/services/wishlist.service';
import { WishlistBadgeService } from 'src/app/core/services/wishlistBadge.service';

@Component({
    selector: 'app-product-list',
    templateUrl: 'product-list.component.html',
    styleUrls: ['product-list.component.css']
})
export class ProductListComponent implements OnInit {

    private productService = inject(ProductService);
    private router = inject(Router);
    private http = inject(HttpClient);
    private toast = inject(ToastService)
    private searchService = inject(SearchService);
    private cartService = inject(CartService);
    private wishlistService = inject(WishlistService);
    private wishlistBadge = inject(WishlistBadgeService);


    products: Product[] = [];
    filteredProducts: Product[] = [];
    categories: Category[] = [];
    isLoading = true;


    //Filter From backend
    searchTerm: string = '';
    selectedCategory: string = 'all';
    priceRange: [number, number] = [0, 100000];
    showOnlyPopular: boolean = false;
    showOnlyInStock: boolean = false;

    page = 1;
    pageSize = 20;
    sortBy: string = 'name';
    descending = true;


    sortDirection: 'asc' | 'desc' = 'asc';
    showFilters: boolean = false;
    private searchSubscription!: Subscription;
    private usersUrl = website_constants.API.USERURL;
    userId: string | null = null;
    isBlockedUser: boolean = false;
    minPrice: number = 0;
    maxPrice: number = 1000000;
    availableColors: { id: string, name: string }[] = [];
    selectedColors: string[] = []; // will store colorIds

    // UserDataforChecking = JSON.parse(localStorage.getItem("currentUser") || '{}');
    currentPage: number = 1;
    itemsPerPage: number = 8;
    wishlistProductIds = new Set<number>();
    cartProductMap = new Map<number, number>();
    cartQuantities = new Map<number, number>();

    ngOnInit() {
        this.loadProducts();
        this.loadCategories();
        this.loadColors();
        this.loadCartStatus();
        this.loadWishlist();

        this.searchSubscription = this.searchService.searchTerm$.subscribe(term => {
            this.searchTerm = term;
            this.applyFilters();
        });
    }

    ngOnDestroy() {
        if (this.searchSubscription) {
            this.searchSubscription.unsubscribe();
        }
    }

    loadProducts() {
        this.productService.getAllProducts().subscribe({
            next: (products) => {
                console.log("🔵 RAW PRODUCTS FROM API:", products);
                //  products.forEach(p => {
                //         console.log(
                //           `Product: ${p.name} (ID: ${p.id})`,
                //           "Colors =>",
                //           p.availableColors
                //         );
                //       });
                this.products = products;
                this.filteredProducts = products;

                // Price
                this.minPrice = Math.min(...products.map(p => p.price));
                this.maxPrice = Math.max(...products.map(p => p.price));
                this.priceRange = [this.minPrice, this.maxPrice];

                // Colors (flatten + unique)
                // // const colorSet = new Set<string>();

                // // products.forEach(p => {
                // //     if (p.availableColors?.length) {
                // //         p.availableColors.forEach((c: string) => colorSet.add(c));
                // //     }
                // // });

                // this.availableColors = Array.from(colorSet);

                this.isLoading = false;
            },
            error: () => this.isLoading = false
        });
    }


    loadCategories() {
        this.productService.getCategories().subscribe({
            next: (categories) => {
                console.log('Fetched categories:', categories);
                this.categories = categories;
            },
            error: (error) => {
                console.error('Error loading categories:', error);

            }
        });
    }
    loadColors() {
        this.productService.getAllColors().subscribe({
            next: (res: any) => {
                this.availableColors = res.data.map((c: any) => ({
                    id: c.id,
                    name: c.name
                }));

                console.log("Colors Loaded", this.availableColors);
            },
            error: err => {
                console.error("Failed to load colors", err);
                this.availableColors = [];
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
        });
    }

    addToCart(product: Product) {

        if (product.currentStock <= 0) {
            this.toast.info("Out of stock");
            return;
        }

        const cartItemId = this.cartProductMap.get(product.id);

        // Already in cart -> increase qty
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

        // Not in cart -> add
        this.cartService.addToCart(product.id, 1).subscribe(() => {
            this.toast.success("Added to cart");
            this.loadCartStatus();
        });
    }


    addTowishlist(product: Product) {

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

    isInCart(productId: number): boolean {
        return this.cartProductMap.has(productId);
    }

    initializeFilters(products: Product[]) {
    }

    applyFilters() {
        const params: any = {
            page: this.currentPage,
            pageSize: this.itemsPerPage,
            sortBy: this.sortBy,
            descending: this.sortDirection === 'desc',
            isActive: true 
        };

        if (this.searchTerm?.trim()) params.name = this.searchTerm.trim();
        if (this.selectedCategory !== 'all') params.categoryId = this.selectedCategory;

        params.minPrice = this.priceRange[0];
        params.maxPrice = this.priceRange[1];

        if (this.selectedColors.length > 0)
            params.ColorId = this.selectedColors[0];

        if (this.showOnlyInStock)
            params.inStock = true;

        this.isLoading = true;

        this.productService.filterProducts(params).subscribe({
            next: res => {
                let result = res.items || res;

                if (this.showOnlyPopular)
                    result = result.filter((p: any) => p.topSelling === true);

                this.filteredProducts = result;
                this.isLoading = false;
            },
            error: () => {
                this.filteredProducts = [];
                this.isLoading = false;
            }
        });
    }






    onSearchChange() {
        this.currentPage = 1;
        this.applyFilters();
    }

    onCategoryChange(categoryId: string) {
        this.selectedCategory = categoryId;
        this.currentPage = 1;
        this.applyFilters();
    }

    onPriceRangeChange() {
        this.applyFilters();
    }

    toggleColorFilter(colorId: string) {
        if (this.selectedColors.includes(colorId)) {
            this.selectedColors = this.selectedColors.filter(c => c !== colorId);
        } else {
            this.selectedColors = [colorId]; // ONLY ONE SUPPORTED
        }

        this.applyFilters();
    }




    togglePopularFilter() {
        this.showOnlyPopular = !this.showOnlyPopular;
        this.applyFilters();
    }

    toggleInStockFilter() {
        this.showOnlyInStock = !this.showOnlyInStock;
        this.applyFilters();
    }


    toggleFilters() {
        this.showFilters = !this.showFilters;
    }




    sortProducts() {
        this.filteredProducts.sort((a, b) => {
            let a_Value: any = a[this.sortBy as keyof Product];
            let b_Value: any = b[this.sortBy as keyof Product];
            if (a_Value < b_Value) return this.sortDirection === 'asc' ? -1 : 1;
            if (a_Value > b_Value) return this.sortDirection === 'asc' ? 1 : -1;
            return 0;
        });
    }
    onSortChange(sortBy: string) {
        if (this.sortBy === sortBy) {
            this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
        } else {
            this.sortBy = sortBy;
            this.sortDirection = 'asc';
        }
        this.applyFilters();
    }
    get activeFilterCount(): number {
        let count = 0;
        if (this.selectedCategory !== 'all') count++;
        if (this.priceRange[0] > this.minPrice || this.priceRange[1] < this.maxPrice) count++;
        if (this.selectedColors.length > 0) count++;
        if (this.showOnlyPopular) count++;
        if (this.showOnlyInStock) count++;
        return count;
    }
    get paginatedProducts(): Product[] {
        const start = (this.currentPage - 1) * this.itemsPerPage;
        const end = start + this.itemsPerPage;
        return this.filteredProducts.slice(start, end);
    }

    get totalPages(): number {
        return Math.ceil(this.filteredProducts.length / this.itemsPerPage);
    }

    // Navigate pages
    goToPage(page: number) {
        if (page >= 1 && page <= this.totalPages) {
            this.currentPage = page;
        }
    }

    nextPage() {
        if (this.currentPage < this.totalPages) this.currentPage++;
    }

    prevPage() {
        if (this.currentPage > 1) this.currentPage--;
    }



    // viewProduct(product: Product) {
    //     this.router.navigate(['/product', product.slug || product.id]);
    // }









    viewProduct(product: Product) {
        // const user = JSON.parse(localStorage.getItem("currentUser") || '{}');
        // this.userId = user?.id || null;

        if (product.currentStock <= 0) {
            this.toast.info("⚠️ Out of currentStock");
            return;
        }

        if (!this.userId) {
            this.toast.error("User not logged in");
            return;
        }

        this.http.get<any>(`${this.usersUrl}/${this.userId}`).subscribe({
            next: (userData) => {
                if (userData.isBlocked) {
                    this.toast.error("User is blocked. Please contact administrator");
                } else {
                    this.router.navigate(['/products/product-buy'], {
                        state: { product: [product] }
                    });
                }
            },
            error: (err) => {
                console.error("Error fetching user data:", err);
                this.toast.error("Failed to verify user status");
            }
        });
    }


    viewProductDetail(product: Product) {
        this.router.navigate(['products/product-detail', product.id]);
    }

    getAddToCartButtonClass(product: Product): string {
        const base = 'px-3 py-2 rounded-full text-sm transition-all duration-200';
        return product.currentStock === 0
            ? `${base} bg-gray-200 text-gray-400 cursor-not-allowed`
            : `${base} bg-yellow-500 text-black hover:bg-yellow-600`;
    }

    clearFilters() {
        this.searchTerm = '';
        this.selectedCategory = 'all';
        this.priceRange = [this.minPrice, this.maxPrice];
        this.selectedColors = [];
        this.showOnlyPopular = false;
        this.showOnlyInStock = false;
        this.applyFilters();
    }


}
