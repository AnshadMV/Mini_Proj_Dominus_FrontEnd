import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { forkJoin, map, of, switchMap } from 'rxjs';
import { ProductWithQuantity } from 'src/app/core/models/base-models/productwithquantity';
import { ToastService } from 'src/app/core/services/toast.service';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-product-buy',
  templateUrl: './product-buy.component.html',
  styleUrls: ['./product-buy.component.css']
})
export class ProductBuyComponent implements OnInit {
  private productsUrl = environment.API.PRODUCTURL;
  private usersUrl = environment.API.BASE_URL;
  products: ProductWithQuantity[] = [];
  TotalAmountofSelectedProduct: number = 0;
  userId: string = '';
  isProcessing: boolean = false;
  isLoading = false;
  showBuy: boolean = false;
  productId!: number;

  constructor(
    private router: Router,
    private toast: ToastService,
    private http: HttpClient, private route: ActivatedRoute,

  ) {

  }

  ngOnInit(): void {
    const navState: any = history.state;

    // CASE 1: Came from Cart / Buy Now
    if (navState && navState.product) {
      this.isLoading = true;
      this.loadProductsFromCart(navState.product);
      return;
    }

    // CASE 2: Direct Buy Page Route (/product-buy/:id)
    this.productId = Number(this.route.snapshot.paramMap.get('id'));
    if (this.productId) {
      this.loadProduct();
    }
    // this.route.queryParams.subscribe(p => {
    //   const orderId = p['orderId'];
    //   const ref = p['ref'];

    //   if (!orderId || !ref) return;

    //   const dto = { paymentReference: ref };

    //   this.http.post(`${this.usersUrl}/Order/PayBy_${orderId}`, dto,
    //     { withCredentials: true })
    //     .subscribe(() => {
    //       this.toast.success("Payment Successful");
    //       this.router.navigate(['/app-orders']);
    //     });
    // });

  }
  loadProduct() {
    this.isLoading = true;

    const product$ = this.http.get<any>(
      `${this.productsUrl}/GetBy_${this.productId}`
    );

    const colors$ = this.http.get<any>(
      `${environment.API.BASE_URL}/Colors/GetAll`
    );

    forkJoin([product$, colors$]).subscribe({
      next: ([prodRes, colorRes]) => {

        const product = prodRes.data || prodRes;

        const allColors = colorRes.data || [];

        // Build mapping using real DB colors
        const mappedColors = (product.availableColors || [])
          .map((name: string) => allColors.find((c: any) => c.name === name))
          .filter((c: any) => c && c.isActive)   // ONLY ACTIVE COLORS
          .map((c: any) => ({
            colorId: c.id,
            colorName: c.name,
            hexCode: c.hexCode
          }));

        if (!mappedColors.length) {
          this.toast.error("No active colors available for this product");
          this.isLoading = false;
          return;
        }

        this.products = [{
          ...product,
          quantity: 1,
          availableColors: mappedColors,
          selectedColorId: mappedColors[0].colorId
        }];

        this.CalculateTotalSelectedProduct();
        this.isLoading = false;
      },
      error: () => {
        this.toast.error("Failed to load product");
        this.isLoading = false;
      }
    });
  }

  loadProductsFromCart(cartProducts: any[]) {
    const productRequests = cartProducts.map(p =>
      this.http.get<any>(`${this.productsUrl}/GetBy_${p.id}`)
    );

    const colors$ = this.http.get<any>(
      `${environment.API.BASE_URL}/Colors/GetAll`
    );

    forkJoin([forkJoin(productRequests), colors$]).subscribe({
      next: ([productsRes, colorRes]) => {

        const allColors = colorRes.data || [];

        this.products = productsRes.map((res, index) => {
          const product = res.data || res;

          const mappedColors = (product.availableColors || [])
            .map((name: string) =>
              allColors.find((c: any) => c.name === name && c.isActive)
            )
            .filter(Boolean)
            .map((c: any) => ({
              colorId: c.id,
              colorName: c.name,
              hexCode: c.hexCode
            }));

          return {
            ...product,
            quantity: cartProducts[index].quantity,
            availableColors: mappedColors,
            selectedColorId: mappedColors[0]?.colorId
          };
        });

        this.CalculateTotalSelectedProduct();
        this.isLoading = false;
      },
      error: () => {
        this.toast.error('Failed to load products');
        this.isLoading = false;
      }
    });
  }

  CalculateTotalSelectedProduct() {
    this.TotalAmountofSelectedProduct = this.products.reduce(
      (sum, p) => sum + (p.price * (p.quantity || 1)),
      0
    );
  }


  confirmPurchace() {
    this.isProcessing = true;

    const createOrderDto = {
      items: this.products.map(p => ({
        productId: p.id,
        colorId: p.selectedColorId!,   // always exists now
        quantity: p.quantity || 1
      }))
    };

    this.http.post<any>(`${this.usersUrl}/Order/Add`, createOrderDto, {
      withCredentials: true
    }).subscribe({
      next: res => {
        const orderId = res.data.orderId;
        this.router.navigate(['/app-payment', orderId]);
      },
      error: err => {
        this.toast.error(err.error?.message || "Order failed");
        this.isProcessing = false;
      }
    });
  }
  startUroPayment(orderId: number) {
    // OPEN A SAFE BLANK WINDOW FIRST (Browser won't block this)
    const qrWindow = window.open('', '_blank');

    this.http.post<any>(
      `${this.usersUrl}/Order/CreatePayment/${orderId}`,
      {},
      { withCredentials: true }
    )
      .subscribe({
        next: res => {
          const data = res.data;

          if (!data) {
            this.toast.error("Payment session failed");
            this.isProcessing = false;
            qrWindow?.close();
            return;
          }

          const upiLink = data.upiString;
          const qr = data.qrCode;

          const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);

          if (isMobile && upiLink) {
            window.location.href = upiLink;
          }
          else {
            // Desktop → Show QR inside popup window
            qrWindow!.document.write(`
          <html>
            <head>
              <title>UPI Payment</title>
            </head>
            <body style="display:flex;justify-content:center;align-items:center;height:100vh;background:#111">
              <img src="${qr}" style="width:350px;height:350px;border-radius:10px" />
            </body>
          </html>
        `);

            this.toast.info("Scan QR with any UPI app");
          }
        },

        error: () => {
          this.toast.error("Payment failed to start");
          this.isProcessing = false;
          qrWindow?.close();
        }
      });
  }





  createOrder() {

  }

  calculateEstimatedDelivery() {

  }

  clearCartItems(): void {

  }

  goBack() {
    this.router.navigate(['/products']);
  }
}