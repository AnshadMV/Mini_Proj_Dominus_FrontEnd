import { HttpClient } from '@angular/common/http';
import { Component, HostListener, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CartBadgeService } from 'src/app/core/services/cartBadge.service';
import { ToastService } from 'src/app/core/services/toast.service';
import { WishlistBadgeService } from 'src/app/core/services/wishlistBadge.service';
import { SearchService } from 'src/app/core/services/navbar_search.service';
import { AuthService } from 'src/app/core/services/auth.service';
import { CartService } from 'src/app/core/services/cart.service';
import { WishlistService } from 'src/app/core/services/wishlist.service';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent implements OnInit {
  isModalOpen = false;
  isMenuOpen = false;
  isScrollingDown = false;
  lastScrollTop = 0;
  isDarkBackground = true;
  showProfileDropdown = false;
  cartItemCount: number = 0;
  wishListItemCount: number = 0;
  searchTerm: string = '';
  role: string = 'admin';
  userProfile: any = null;

  closeMenu() {
    this.isMenuOpen = false;
  }

  menuItems = [
    { label: 'Shop', route: '/products' },
    { label: 'Contact Us', route: '/app-contact-us' },
    { label: 'About Us', route: '/app-about' },
  ];
  constructor(
    private router: Router,
    private auth: AuthService,
    private toast: ToastService,
    private cartBadgeService: CartBadgeService,
    private http: HttpClient,
    private cartService: CartService,
    private wishlistService: WishlistService,
    private WishlistBadgeService: WishlistBadgeService,
    private searchService: SearchService) { }
  ngOnInit() {
    this.auth.getMyProfile().subscribe({
      next: (res) => {
        console.log("Navbar Profile:", res.data);
        this.userProfile = res.data;
      },
      error: () => {
        console.log("Navbar: No logged user");
        this.userProfile = null;
      }
    });
    const currentUser = JSON.parse(localStorage.getItem("currentUser") || '{}');
    this.role = currentUser.role || '';
    this.loadCartCount();
    this.loadwishlistCount();

    this.cartBadgeService.cartItemCount$.subscribe(count => {
      this.cartItemCount = count;  // Remove loadCartCount() here!
    });

    this.WishlistBadgeService.WishlistItemCount$.subscribe(count => {
      this.wishListItemCount = count;  // Remove loadwishlistCount()!
    });
    this.searchService.searchTerm$.subscribe(term => {
      this.searchTerm = term;
    });
  }
  get isAdmin(): boolean {
    return this.userProfile?.role?.toLowerCase() === 'admin';
  }

  navigation() {
    console.log('=== ADMIN NAVIGATION DEBUG ===');
    if (this.userProfile?.role?.toLowerCase() === 'admin') {
      this.router.navigate(['/admin']);
      this.closeProfileDropdown();
    } else {
      this.toast.error('Admin access required');
      this.router.navigate(['/app-home']);
    }

  }

  toggleModal() {
    this.isModalOpen = !this.isModalOpen;
  }
  loadCartCount() {
    this.cartService.getMyCart().subscribe({
      next: (res: any) => {
        const count = res?.data?.items?.length || 0;
        this.cartBadgeService.updateCartCount(count);
      },
      error: () => {
        this.cartBadgeService.updateCartCount(0);
      }
    });
  }

  loadwishlistCount() {
    this.wishlistService.getMyWishlist().subscribe({
      next: (res: any) => {
        const count = res?.data?.items?.length || 0;
        this.WishlistBadgeService.updatewishlistCount(count);
      },
      error: () => {
        this.WishlistBadgeService.updatewishlistCount(0);
      }
    });
  }


  @HostListener('window:scroll')
  onWindowScroll() {
    const st = window.pageYOffset || document.documentElement.scrollTop;

    if (st > this.lastScrollTop && st > 50) {
      // scrolling down
      this.isScrollingDown = true;
    } else {
      // scrolling up
      this.isScrollingDown = false;
    }
    this.lastScrollTop = st <= 0 ? 0 : st;
  }


  toggleProfileDropdown() {
    this.showProfileDropdown = !this.showProfileDropdown;
  }

  closeProfileDropdown() {
    this.showProfileDropdown = false;
  }
  profileClicked() {
    this.router.navigate(['/app-profile']);
  }
  naviagteToOrder() {
    this.router.navigate(['/app-orders']);
    this.showProfileDropdown = false;
  }
  handleLogout() {
    this.auth.logout().subscribe({
      next: () => {
        localStorage.clear();
        this.showProfileDropdown = false;
        this.toast.success('Logout successful');
      },
      error: () => {
        localStorage.clear();
        this.toast.success('Logout successful');
      }
    });
  }



  // Close dropdown when clicking outside
  @HostListener('document:click', ['$event'])
  onDocumentClick(event: Event) {
    const target = event.target as HTMLElement;
    if (!target.closest('.relative')) {
      this.showProfileDropdown = false;
    }
  }
  onSearchChange(event: any): void {
    const term = event.target.value;
    this.searchService.setSearchTerm(term);

    // Navigate to product list if not already there and search is active
    if (term.length > 0 && !this.router.url.includes('/products/product-list')) {
      this.router.navigate(['/products/product-list']);
    }
  }

  clearSearch(): void {
    this.searchTerm = '';
    this.searchService.clearSearch();
  }



}