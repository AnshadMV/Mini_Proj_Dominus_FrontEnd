import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { forkJoin, map, of, switchMap } from 'rxjs';
import { ProductWithQuantity } from 'src/app/core/models/base-models/productwithquantity';
import { OrderService } from 'src/app/core/services/order.service';
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
    private order: OrderService
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

    if (!this.products.length) {
      this.toast.error("No products to purchase");
      return;
    }

    this.isProcessing = true;

    const dto = {
      items: this.products.map(p => ({
        productId: p.id,
        quantity: p.quantity || 1,
        colorId: p.selectedColorId
      }))
    };

    this.http.post<any>(
      `${this.usersUrl}/Order/Add`,
      dto,
      { withCredentials: true }
    ).subscribe({
      next: res => {
        const order = res.data;
        this.isProcessing = false;

        if (!order?.razorOrderId || !order?.razorKey) {
          this.toast.error("Payment could not be initialized");
          return;
        }

        this.openRazorpay(order);
      },
      error: () => {
        this.isProcessing = false;
        this.toast.error("Order creation failed");
      } 
    });
  }

  openRazorpay(order: any) {

    const options: any = {
      key: order.razorKey,
      amount: order.totalAmount * 100,
      currency: "INR",
      name: "Dominus Store",
      description: "Order Payment",
      order_id: order.razorOrderId,

      handler: (response: any) => {
        this.verifyPayment(response, order.orderId);
      },

      modal: {
        confirm_close: true,
        ondismiss: () => {
          console.log("ondismiss triggered");
          this.cancelPendingOrder(order.orderId);
        }
      },

      theme: { color: "#000000" }
    };

    const rzp = new (window as any).Razorpay(options);

    // MUST BE BEFORE open()

    // 🔥 Fires when user clicks "Yes, exit"
    rzp.on("modal.closed", () => {
      console.log("modal.closed triggered");
      this.cancelPendingOrder(order.orderId);
    });

    // 🔥 Razorpay new UI throws failed event on exit
    rzp.on("payment.failed", (resp: any) => {
      console.log("payment.failed triggered", resp);

      if (!resp?.error?.metadata?.payment_id) {
        // no payment happened → user exited
        this.cancelPendingOrder(order.orderId);
      }
    });

    rzp.open();
  }


  verifyPayment(resp: any, orderId: number) {

    const dto = {
      orderId: orderId,
      razorOrderId: resp.razorpay_order_id,
      paymentId: resp.razorpay_payment_id,
      signature: resp.razorpay_signature
    };

    this.http.post<any>(
      `${this.usersUrl}/Order/VerifyPayment`,
      dto,
      { withCredentials: true }
    ).subscribe({
      next: () => {
        this.toast.success("Payment Successful 🎉");
        this.router.navigate(['/app-orders']);
      },
      error: () => {
        this.toast.error("Payment Verification Failed ❌");
      }
    });
  }


  cancelPendingOrder(orderId: number) {
    console.log("Canceling");

    this.order.cancelMyOrder(orderId).subscribe(() => {
      this.toast.info("Payment cancelled. Order reverted.");
    });
  }






  goBack() {
    this.router.navigate(['/products']);
  }
}