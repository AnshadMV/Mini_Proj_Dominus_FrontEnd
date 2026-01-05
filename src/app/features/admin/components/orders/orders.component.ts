import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ToastService } from 'src/app/core/services/toast.service';
import { OrderService } from 'src/app/core/services/order.service';
import { UserService } from 'src/app/core/services/user.service';

@Component({
  selector: 'app-orders',
  templateUrl: './orders.component.html',
  styleUrls: ['./orders.component.css'],
})
export class AdminOrdersComponent implements OnInit {

  orders: any[] = [];
  filteredOrders: any[] = [];

  isLoading = true;
  selectedOrder: any = null;



  statusCounts: any = {
    PendingPayment: 0,
    Paid: 0,
    Shipped: 0,
    Delivered: 0,
    Cancelled: 0
  };
  statusTotals: any = {
    PendingPayment: 0,
    Paid: 0,
    Shipped: 0,
    Delivered: 0,
    Cancelled: 0
  };




  constructor(
    private orderService: OrderService,
    private toast: ToastService,
    private router: Router,
    private userService: UserService
  ) { }

  ngOnInit(): void {
    this.loadOrders();
  }

  loadOrders(): void {
    this.isLoading = true;

    this.orderService.getAllOrders_Admin().subscribe({
      next: (orders: any) => {

        const list = Array.isArray(orders)
          ? orders
          : orders?.items || [];

        this.userService.getAllUsers().subscribe(users => {
          const userMap = new Map(
            users.map((u: any) => [String(u.id), u.name])   
          );
          console.log(orders)
          this.orders = list
            .map((o: any) => ({
              ...o,
              userName: userMap.get(String(o.userId)) || 'Unknown User', 
              status: o.status?.trim(),
              orderDate: o.orderDate,
              items: o.items.map((i: any) => ({
                name: i.productName,
                image: i.productImages?.length ? i.productImages[0] : '/assets/noimage.png',
                quantity: i.quantity,
                price: i.price,
                color: i.colorName,
                category: i.category ?? ''
              }))
            }))
            .sort((a: any, b: any) =>
              new Date(b.orderDate).getTime() - new Date(a.orderDate).getTime()
            );

          this.filteredOrders = this.orders;
          this.calculateStatusCounts();
          this.isLoading = false;
        });

      },
      error: () => {
        this.toast.error('Failed to load orders');
        this.isLoading = false;
      }
    });
  }



  viewOrderDetails(order: any) {
    this.selectedOrder = order;
  }

  closeOrderDetails() {
    this.selectedOrder = null;
  }

  getStatusColor(status: string): string {
    const colors: any = {
      PendingPayment: 'bg-yellow-100 text-yellow-800',
      Paid: 'bg-blue-100 text-blue-800',
      Shipped: 'bg-purple-100 text-purple-800',
      Delivered: 'bg-green-100 text-green-800',
      Cancelled: 'bg-red-100 text-red-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  }
  calculateStatusCounts() {
    const counts: any = {
      PendingPayment: 0,
      Paid: 0,
      Shipped: 0,
      Delivered: 0,
      Cancelled: 0
    };

    const totals: any = {
      PendingPayment: 0,
      Paid: 0,
      Shipped: 0,
      Delivered: 0,
      Cancelled: 0
    };

    this.orders.forEach(o => {
      if (counts[o.status] !== undefined) {
        counts[o.status]++;
        totals[o.status] += o.totalAmount || 0;
      }
    });

    this.statusCounts = counts;
    this.statusTotals = totals;
  }


  changeStatus(order: any, newStatus: string) {
    this.orderService.toggleOrderStatus(order.orderId, newStatus).subscribe({
      next: res => {
        this.toast.success(res.message || 'Status updated successfully');
        order.status = newStatus;
      },
      error: err => {
        this.toast.error(err?.error?.message || 'Failed to update status');
      }
    });
  }

  goBack() {
    this.router.navigate(['/products']);
  }
}
