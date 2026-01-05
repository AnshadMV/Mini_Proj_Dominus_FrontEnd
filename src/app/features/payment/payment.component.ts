import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { ToastService } from 'src/app/core/services/toast.service';

@Component({
  selector: 'app-payment',
  templateUrl: './payment.component.html',
  styleUrls: ['./payment.component.css']
})
export class PaymentComponent implements OnInit, OnDestroy {

  qrCode: string = '';
  orderId!: number;

  poller: any;
  paymentTimeout: any;

  constructor(
    private route: ActivatedRoute,
    private http: HttpClient,
    private toast: ToastService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.orderId = Number(this.route.snapshot.paramMap.get('orderId'));
    this.startPayment();
  }

  startPayment() {
    this.http.post<any>(
      `${environment.API.BASE_URL}/Order/CreatePayment/${this.orderId}`,
      {},
      { withCredentials: true }
    ).subscribe({
      next: res => {
        this.qrCode = res.data.qrCode;
        this.toast.info("Scan QR to pay");

        this.startPolling();
        this.startTimeout();
      },
      error: () => this.toast.error("Failed to start payment")
    });
  }

  // 🔁 Check Payment Every 3 Sec
  startPolling() {
    this.poller = setInterval(() => {

      this.http.get<any>(
        `${environment.API.BASE_URL}/Order/MyOrders`,
        { withCredentials: true }
      ).subscribe(res => {

        const order = res.data.find((o: any) => o.orderId === this.orderId);

        if (order && order.status === 'Paid') {

          clearInterval(this.poller);
          clearTimeout(this.paymentTimeout);

          this.toast.success("Payment Successful 🎉");

          this.router.navigate(['/app-orders']);
        }
      });

    }, 3000);
  }

  // ⏳ 30 Sec Timeout → Cancel Order
  startTimeout() {
    this.paymentTimeout = setTimeout(() => {

      clearInterval(this.poller);

      // TODO: call cancel api if you have one
      // Example (backend must allow user cancel):
      // this.http.patch(
      //   `${environment.API.BASE_URL}/Order/Cancel/${this.orderId}`, 
      //   {}, 
      //   { withCredentials: true }
      // ).subscribe();

      this.toast.error("Payment time expired. Order cancelled.");
      this.router.navigate(['/app-orders']);

    }, 30000);
  }

  ngOnDestroy(): void {
    if (this.poller) clearInterval(this.poller);
    if (this.paymentTimeout) clearTimeout(this.paymentTimeout);
  }

}
