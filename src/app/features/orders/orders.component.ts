import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { website_constants } from 'src/app/core/constants/app.constant';
import { Order } from 'src/app/core/models/order.model';
import { ToastService } from 'src/app/core/services/toast.service';
import { environment } from 'src/environments/environment';



@Component({
  selector: 'app-orders',
  templateUrl: './orders.component.html',
  styleUrls: ['./orders.component.css']
})
export class OrdersComponent implements OnInit {
  private usersUrl = environment.API.BASE_URL;
  orders: Order[] = [];
  filteredOrders: Order[] = [];
  userId: string = '';
  isLoading: boolean = true;
  selectedOrder: Order | null = null;
  filterStatus: string = 'all';
  showOrders: boolean = false;

  constructor(
    private http: HttpClient,
    private toast: ToastService,
    private route: Router,
  ) { }

  ngOnInit(): void {


    this.loadOrders();

  }

  loadOrders(): void {
    this.isLoading = true;

    this.http.get<any>(`${this.usersUrl}/Order/MyOrders`, {
      withCredentials: true
    }).subscribe({
      next: (res) => {
        const orders = res.data ?? [];

        this.orders = orders
          .map((o: any) => {
            const statusMap: Record<number, string> = {
              1: 'PendingPayment',
              2: 'Paid',
              3: 'Shipped',
              4: 'Delivered',
              5: 'Cancelled'
            };

            const orderDateObj = new Date(o.orderDate);

            return {
              orderId: o.orderId,
              orderDate: orderDateObj.toLocaleDateString(),
              orderDateRaw: orderDateObj, // 👈 for sorting
              status: typeof o.status === 'number' ? statusMap[o.status] : o.status,
              totalAmount: o.totalAmount,
              shippingAddress: o.shippingAddress,
              paymentMethod:
                o.status === 2 || o.status === 'Paid' || o.status === 'Delivered'
                  ? 'UPI'
                  : 'Pending',
              items: o.items.map((i: any) => ({
                name: i.productName,
                image: i.productImages?.[0] || '/assets/noimage.png',
                quantity: i.quantity,
                price: i.price,
                color: i.colorName,
                category: 'Product'
              }))
            };
          })
          .sort((a: Order, b: Order) =>
            b.orderDateRaw.getTime() - a.orderDateRaw.getTime()
          );




        this.filteredOrders = this.orders;
        this.showOrders = this.orders.length > 0;
        this.isLoading = false;
      },
      error: (err) => {
        console.error(err);
        this.toast.error('Failed to load orders');
        this.isLoading = false;
      }
    });
  }



  filterOrders(status: string): void {
    this.filterStatus = status;

    if (status === 'all') {
      this.filteredOrders = [...this.orders];
      return;
    }

    this.filteredOrders = this.orders.filter(
      o => o.status === status
    );
  }



  viewOrderDetails(order: Order): void {
    this.selectedOrder = order;
  }

  closeOrderDetails(): void {
    this.selectedOrder = null;
  }

  getStatusColor(status: string): string {
    const colors: { [key: string]: string } = {
      'PendingPayment': 'bg-yellow-100 text-yellow-800',
      'Paid': 'bg-blue-100 text-blue-800',
      'Shipped': 'bg-purple-100 text-purple-800',
      'Delivered': 'bg-green-100 text-green-800',
      'Cancelled': 'bg-red-100 text-red-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  }

  getStatusIcon(status: string): string {
    const icons: { [key: string]: string } = {
      'PendingPayment': 'fa-clock',
      'Paid': 'fa-check-circle',
      'Shipped': 'fa-truck',
      'Delivered': 'fa-box-check',
      'Cancelled': 'fa-times-circle'
    };
    return icons[status] || 'fa-circle';
  }


  cancelOrder(order: Order): void {

    if (order.status !== 'PendingPayment') {
      this.toast.warning('Only Pending Payment orders can be cancelled');
      return;
    }

    if (!confirm('Are you sure you want to cancel this order?')) return;

    this.isLoading = true;

    this.http.patch<any>(
      `${this.usersUrl}/Order/Cancel?orderId=${order.orderId}`,
      null,
      { withCredentials: true }
    ).subscribe({
      next: () => {
        this.toast.success('Order cancelled successfully');

        order.status = 'Cancelled';

        this.filterOrders(this.filterStatus);

        this.isLoading = false;
      },
      error: () => {
        this.toast.error('Failed to cancel order');
        this.isLoading = false;
      }
    });
  }



  getTotalItems(order: Order) {
    // return order.items.reduce((total, item) => total + item.quantity, 0);
  }

  goBack() {
    this.route.navigate(['/products']);
  }
}