import { Component, HostListener, inject, OnInit, ElementRef, ViewChildren, QueryList, AfterViewInit } from '@angular/core';
import { Router } from '@angular/router';
import { website_constants } from 'src/app/core/constants/app.constant';
import { VideoServices } from 'src/app/core/models/homevideoservice.model';
import { Product } from 'src/app/core/models/product.model';
import { HomeVideoService } from 'src/app/core/services/homevideo.service';
import { ProductService } from 'src/app/core/services/product.service';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit, AfterViewInit {

  @ViewChildren('videoIframe') videoIframes!: QueryList<ElementRef<HTMLIFrameElement>>;

  videoError = false;
  isLoading = true;
  isMenuOpen = false;
  screenWidth = window.innerWidth;
  private HomeVideoService = inject(HomeVideoService);
  private router = inject(Router);
  private sanitizer = inject(DomSanitizer);
  
  private lazyVideoObserver!: IntersectionObserver;
  private videoLoadedMap = new Map<number, boolean>(); // Track loaded videos
  
  productCount: number = website_constants.HomePage.FeatureProductCount;
  products: Product[] = [];
  services: VideoServices[] = [];
  showSkeleton = true;
  
  ngOnInit() {
    this.loadVideoServices();
    if (this.screenWidth >= 768) this.isMenuOpen = true;
    document.body.classList.add('page-transition');
  }

  ngAfterViewInit() {
    this.initScrollAnimations();
    this.initIntersectionObserver();
    this.setupLazyVideoLoading();
  }

  ngOnDestroy() {
    if (this.lazyVideoObserver) {
      this.lazyVideoObserver.disconnect();
    }
  }

  setupLazyVideoLoading() {
    this.lazyVideoObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const iframe = entry.target as HTMLIFrameElement;
            const dataSrc = iframe.getAttribute('data-src');
            const index = parseInt(iframe.getAttribute('data-index') || '0');
            
            if (dataSrc && !this.videoLoadedMap.get(index)) {
              // Load the video
              iframe.src = dataSrc;
              this.videoLoadedMap.set(index, true);
              
              // Remove data attributes
              iframe.removeAttribute('data-src');
              iframe.removeAttribute('data-index');
              
              // Stop observing this element
              this.lazyVideoObserver.unobserve(iframe);
            }
          }
        });
      },
      {
        rootMargin: '50px', // Start loading 50px before entering viewport
        threshold: 0.1
      }
    );

    // Observe video iframes after they're available
    setTimeout(() => {
      this.videoIframes.forEach((iframeRef, index) => {
        const iframe = iframeRef.nativeElement;
        this.lazyVideoObserver.observe(iframe);
        this.videoLoadedMap.set(index, false);
      });
    }, 100);
  }

  toggleMenu(): void {
    this.isMenuOpen = !this.isMenuOpen;
  }

  loadVideoServices() {
    this.HomeVideoService.getFeaturedVideoServices(5)
      .subscribe({
        next: data => {
          this.services = data;
          // Initialize all videos as not loaded
          this.services.forEach((_, index) => {
            this.videoLoadedMap.set(index, false);
          });
        },
        error: () => console.error('Failed to load video services')
      });
  }

  getSafeUrl(url: string): SafeResourceUrl {
    // Return the URL as-is for lazy loading data-src
    return this.sanitizer.bypassSecurityTrustResourceUrl(url);
  }

  onVideoLoaded() {
    this.isLoading = false;
    const video = document.querySelector('video');
    if (video) {
      video.muted = true;
      video.classList.remove('opacity-0');
      video.classList.add('opacity-100');
    }
  }

  onResize(event: Event) {
    this.screenWidth = window.innerWidth;
    if (this.screenWidth >= 768) {
      this.isMenuOpen = true;
    } else {
      this.isMenuOpen = false;
    }
  }

  // Scroll animations
  initScrollAnimations() {
    window.addEventListener('scroll', this.throttle(this.handleScroll, 100));
  }

  throttle(func: Function, limit: number) {
    let inThrottle: boolean;
    return function (this: any) {
      const args = arguments;
      const context = this;
      if (!inThrottle) {
        func.apply(context, args);
        inThrottle = true;
        setTimeout(() => inThrottle = false, limit);
      }
    }
  }

  handleScroll = () => {
    const elements = document.querySelectorAll('.fade-in, .slide-in-left, .slide-in-right, .scale-in');

    elements.forEach(element => {
      const elementTop = element.getBoundingClientRect().top;
      const elementVisible = 150;

      if (elementTop < window.innerHeight - elementVisible) {
        element.classList.add('visible');
      }
    });
  }

  // Intersection Observer for more precise animations
  initIntersectionObserver() {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
        }
      });
    }, { threshold: 0.1 });

    document.querySelectorAll('.fade-in, .slide-in-left, .slide-in-right, .scale-in, .stagger-item')
      .forEach(el => observer.observe(el));
  }

  // Animate product cards with stagger effect
  animateProductCards() {
    const productCards = document.querySelectorAll('.product-card');
    productCards.forEach((card, index) => {
      (card as HTMLElement).style.transitionDelay = `${index * 0.1}s`;
      card.classList.add('stagger-item');
    });
  }

  // Animate service cards
  animateServiceCards() {
    const serviceCards = document.querySelectorAll('.service-card');
    serviceCards.forEach((card, index) => {
      (card as HTMLElement).style.transitionDelay = `${index * 0.15}s`;
      card.classList.add('slide-in-right');
    });
  }

  // Navigation animation
  navigateWithAnimation(route: string) {
    document.body.style.opacity = '0';
    document.body.style.transition = 'opacity 0.3s ease-out';

    setTimeout(() => {
      this.router.navigate([route]);
      document.body.style.opacity = '1';
    }, 300);
  }

  // Shimmer effect for loading states
  getSkeletonArray(count: number): any[] {
    return Array(count).fill(0);
  }

  @HostListener('window:beforeunload')
  onBeforeUnload() {
    document.body.classList.remove('page-transition');
  }
}