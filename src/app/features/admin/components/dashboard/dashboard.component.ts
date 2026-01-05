// dashboard.component.ts
import { Component, OnInit, OnDestroy } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ProductService } from 'src/app/core/services/product.service';
import { UserService } from 'src/app/core/services/user.service';
import { OrderService } from 'src/app/core/services/order.service';
import { CategoriesService } from 'src/app/core/services/base_services/categories.service';
import { Chart, ChartConfiguration, registerables } from 'chart.js';
import { DashboardStats } from '../../../../core/models/admin-models/dashboardStats';
import { RecentOrder } from '../../../../core/models/admin-models/recentOrder';
import { ProductAnalysis } from '../../../../core/models/admin-models/productAnanlysis';
import { SalesData } from '../../../../core/models/admin-models/salesData';
import { RecentActivity } from '../../../../core/models/admin-models/recentActivity';
import { environment } from 'src/environments/environment';
import { Category } from 'src/app/core/models/base-models/Category.model';

Chart.register(...registerables);

@Component({
  selector: 'dashboard',
  templateUrl: './dashboard.component.html',
  // styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit, OnDestroy {
  stats: DashboardStats[] = [];
  recentOrders: RecentOrder[] = [];
  isLoading = true;
  chartData: any = {};
  chartInstances: Chart[] = [];
  products: any[] = [];
  allOrders: any[] = [];
  allUsers: any[] = [];
  productAnalysis: ProductAnalysis = {
    totalProducts: 0,
    activeProducts: 0,
    lowStockProducts: 0,
    outOfStockProducts: 0,
    topSellingProducts: 0
  };

  salesData: SalesData = {
    totalRevenue: 0,
    dailyRevenue: 0,
    revenueChange: 0,
    averageOrderValue: 0
  };

  topSellingProducts: any[] = [];
  lowStockProducts: any[] = [];
  recentActivities: RecentActivity[] = [];
  categories: Category[] = [];

  private refreshInterval: any;

  constructor(
    private http: HttpClient,
    private productService: ProductService,
    private userService: UserService,
    private orderService: OrderService,
    private categoriesService: CategoriesService
  ) { }

  ngOnInit(): void {
    this.loadDashboardData();
    this.startRealtimeUpdates();
  }

  ngOnDestroy(): void {
    this.destroyCharts();
    this.stopRealtimeUpdates();
  }

  private startRealtimeUpdates(): void {
    this.refreshInterval = setInterval(() => {
      this.loadDashboardData();
    }, 120000);
  }

  private stopRealtimeUpdates(): void {
    if (this.refreshInterval) {
      clearInterval(this.refreshInterval);
    }
  }

  loadDashboardData(): void {
    this.isLoading = true;

    Promise.all([
      this.loadProductsData(),
      this.loadUsersData(),
      this.loadOrdersData(),
      this.loadCategoriesData()
    ]).then(() => {
      this.updateStats();
      setTimeout(() => {
        this.initializeCharts();
      }, 10);
      this.isLoading = false;
    }).catch((error) => {
      console.error('Error loading dashboard data:', error);
      this.isLoading = false;
    });
  }

  private loadProductsData(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.productService.getAllProducts().subscribe({
        next: (products) => {
          this.products = products;
          this.analyzeProducts(products);
          this.identifyTopSellingProducts(products);
          this.identifyLowStockProducts(products);
          resolve();
        },
        error: (error) => {
          console.error('Error loading products:', error);
          reject(error);
        }
      });
    });
  }

  private loadUsersData(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.userService.getAllUsers().subscribe({
        next: (users) => {
          this.allUsers = users;
          resolve();
        },
        error: (error) => {
          console.error('Error loading users:', error);
          reject(error);
        }
      });
    });
  }

  private loadOrdersData(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.orderService.getAllOrders_Admin().subscribe({
        next: (orders) => {
          console.log('ORDER SAMPLE:', orders?.[0]); // 👈 ADD THIS

          this.allOrders = orders || [];
          this.processOrdersData(orders || []);
          resolve();
        },
        error: (error) => {
          console.error('Error loading orders:', error);
          reject(error);
        }
      });
    });
  }
  private getUserNameById(userId: string | number): string {
    if (!userId) return 'Unknown Customer';

    const user = this.allUsers.find(u => String(u.id) === String(userId));
    return user?.name || user?.email || 'Unknown Customer';
  }

  private loadCategoriesData(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.categoriesService.getCategories().subscribe({
        next: (categories) => {
          this.categories = categories;
          resolve();
        },
        error: (error) => {
          console.error('Error loading categories:', error);
          reject(error);
        }
      });
    });
  }

  public calculateUserStats(): any {
    if (!this.allUsers || this.allUsers.length === 0) {
      return {
        totalUsers: 0,
        activeUsers: 0,
        newUsersToday: 0
      };
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const toLocalDateString = (value: any): string | null => {
      if (!value) return null;

      const d = new Date(value);
      if (isNaN(d.getTime())) return null;

      const local = new Date(d.getTime() - d.getTimezoneOffset() * 60000);
      return local.toISOString().split('T')[0];
    };

    const todayStr = toLocalDateString(today);

    // ✅ ACTIVE USERS
    const activeUsers = this.allUsers.filter(user =>
      user.isActive !== false && user.isBlocked !== true
    ).length;

    // ✅ USERS CREATED TODAY
    const newUsersToday = this.allUsers.filter(user => {
      const created =
        user.createdAt ||
        user.createdOn ||
        user.created_date ||
        user.created;

      const userDateStr = toLocalDateString(created);
      return userDateStr === todayStr;
    }).length;

    return {
      totalUsers: this.allUsers.length,
      activeUsers,
      newUsersToday
    };
  }

  private identifyTopSellingProducts(products: any[]): void {
    // Create a map to track product sales from orders
    const productSalesMap = new Map<number, { sales: number, revenue: number }>();

    // Process all orders to calculate actual sales
    this.allOrders
      .filter(order => {
        // Only count completed/delivered orders for sales
        const status = order.status;
        return status === 5 || status === 'Delivered' || status === 'delivered' ||
          status === 4 || status === 'Shipped' || status === 'shipped' ||
          status === 2 || status === 'Paid' || status === 'paid';
      })
      .forEach(order => {
        if (order.items && Array.isArray(order.items)) {
          order.items.forEach((item: any) => {
            const productId = item.productId || item.product?.id;
            const quantity = item.quantity || 0;
            const price = item.price || item.product?.price || 0;

            if (productId && quantity > 0) {
              const current = productSalesMap.get(productId) || { sales: 0, revenue: 0 };
              productSalesMap.set(productId, {
                sales: current.sales + quantity,
                revenue: current.revenue + (quantity * price)
              });
            }
          });
        }
      });

    // Combine product data with actual sales data
    // NEW CODE with fallback:
    // Combine product data with actual sales data
    let productsWithSales = products
      .filter(p => p.isActive !== false)
      .map(product => {
        const salesData = productSalesMap.get(product.id) || { sales: 0, revenue: 0 };
        return {
          ...product,
          actualSales: salesData.sales,
          actualRevenue: salesData.revenue
        };
      })
      .sort((a, b) => b.actualSales - a.actualSales) // Sort by actual sales

    // If no products have actual sales, fall back to topSelling flag or price
    if (productsWithSales.every(p => p.actualSales === 0)) {
      productsWithSales = products
        .filter(p => p.isActive !== false)
        .sort((a, b) => {
          // First priority: topSelling flag
          if (a.topSelling && !b.topSelling) return -1;
          if (!a.topSelling && b.topSelling) return 1;
          // Second priority: higher price
          return (b.price || 0) - (a.price || 0);
        });
    }

    productsWithSales = productsWithSales.slice(0, 5);

    this.topSellingProducts = productsWithSales.map(product => ({
      id: product.id,
      name: product.name,
      sales: product.actualSales || 0,
      revenue: product.actualRevenue || (product.price || 0) * (product.salesCount || 0),
      currentStock: product.currentStock || 0,
      image: product.imageUrls?.[0] || product.primaryImage || '/assets/noimage.png'
    }));
  }

  private identifyLowStockProducts(products: any[]): void {
    this.lowStockProducts = products
      .filter(p => p.currentStock > 0 && p.currentStock <= 10)
      .slice(0, 5)
      .map(product => ({
        id: product.id,
        name: product.name,
        currentStock: product.currentStock,
        status: product.currentStock === 0 ? 'Out of Stock' : 'Low Stock',
        minimumStock: product.minimumStock || 5
      }));
  }

  // In dashboard.component.ts, update the processOrdersData method:

  private processOrdersData(orders: any[]): void {
    if (!orders || orders.length === 0) {
      this.recentOrders = [];
      this.calculateOrderMetrics([]);
      this.generateRecentActivities();
      return;
    }

    const sortedOrders = [...orders]
      .sort((a, b) => {
        const dateA = a.orderDate ? new Date(a.orderDate).getTime() : 0;
        const dateB = b.orderDate ? new Date(b.orderDate).getTime() : 0;
        return dateB - dateA;
      })
      .slice(0, 10);

    this.recentOrders = sortedOrders.map(order => ({
      id: order.orderId || order.id,
      customer: this.getUserNameById(order.userId),
      customerEmail: order.customerEmail || order.user?.email || '',
      amount: order.totalAmount || order.grandTotal || 0,
      status: this.mapOrderStatus(order.status),
      date: order.orderDate || order.createdAt,
      items: order.items || []
    }));

    // Fix: Pass the orders array to calculate metrics
    this.calculateOrderMetrics(orders);
    this.generateRecentActivities();
  }

  private calculateOrderMetrics(orders: any[]): void {
    // NEW CODE:
    const revenueOrders = orders.filter(order => {
      const status = order.status;
      return status === 2 || status === 'Paid' ||
        status === 3 || status === 'Shipped' ||
        status === 4 || status === 'Delivered' ||
        status === 'paid' || status === 'shipped' || status === 'delivered';
    });

    // NEW CODE:
    const totalRevenue = revenueOrders.reduce((sum, order) =>
      sum + (order.totalAmount || order.grandTotal || 0), 0
    );

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // NEW CODE:
    const dailyRevenue = revenueOrders
      .filter(order => {
        if (!order.orderDate) return false;
        const orderDate = new Date(order.orderDate);
        return orderDate >= today;
      })
      .reduce((sum, order) => sum + (order.totalAmount || order.grandTotal || 0), 0);
    const revenueChange = this.calculateRevenueChange(orders);

    this.salesData = {
      totalRevenue,
      dailyRevenue,
      revenueChange,
      // NEW CODE:
      averageOrderValue: revenueOrders.length > 0 ? totalRevenue / revenueOrders.length : 0
    };
  }

  // Add helper method to convert status string to number
  private mapStatusToNumber(status: string): number {
    const statusMap: Record<string, number> = {
      'pending': 1,
      'paid': 2,
      'processing': 3,
      'shipped': 4,
      'delivered': 5,
      'cancelled': 6
    };

    const normalizedStatus = status.toLowerCase();
    return statusMap[normalizedStatus] || 1;
  }



  private mapOrderStatus(status: any): string {
    if (typeof status === 'number') {
      const statusMap: Record<number, string> = {
        1: 'Pending',
        2: 'Paid',
        3: 'Processing',
        4: 'Shipped',
        5: 'Delivered',
        6: 'Cancelled'
      };
      return statusMap[status] || 'Pending';
    }

    if (typeof status === 'string') {
      // Handle various string formats
      const statusLower = status.toLowerCase();
      const statusMap: Record<string, string> = {
        'pending': 'Pending',
        'paid': 'Paid',
        'processing': 'Processing',
        'shipped': 'Shipped',
        'delivered': 'Delivered',
        'cancelled': 'Cancelled',
      };
      return statusMap[statusLower] ||
        status.charAt(0).toUpperCase() + status.slice(1).toLowerCase();
    }

    return 'Pending';
  }



  private generateRecentActivities(): void {
    const activities: any[] = [];
    const now = Date.now();

    // Add recent orders
    const recentOrders = this.allOrders
      .filter(order => order.orderDate)
      .sort((a, b) => {
        const dateA = new Date(a.orderDate).getTime();
        const dateB = new Date(b.orderDate).getTime();
        return dateB - dateA;
      })
      .slice(0, 3);

    recentOrders.forEach(order => {
      activities.push({
        action: `New order #${order.orderId || order.id} from ${order.customerName || 'Customer'}`,
        time: this.getTimeAgo(order.orderDate),
        type: 'order',
        timestamp: new Date(order.orderDate).getTime()
      });
    });

    // Add low stock alerts
    const lowStockAlerts = this.lowStockProducts.slice(0, 2);
    lowStockAlerts.forEach(product => {
      activities.push({
        action: `Low stock alert: ${product.name} (${product.currentStock} remaining)`,
        time: 'Just now',
        type: 'currentStock',
        timestamp: now
      });
    });

    // Add user registrations
    const recentUsers = this.allUsers
      .filter(user => user.createdAt)
      .sort((a, b) => {
        const dateA = new Date(a.createdAt).getTime();
        const dateB = new Date(b.createdAt).getTime();
        return dateB - dateA;
      })
      .slice(0, 2);

    recentUsers.forEach(user => {
      activities.push({
        action: `New user registered: ${user.name || user.email}`,
        time: this.getTimeAgo(user.createdAt),
        type: 'user',
        timestamp: new Date(user.createdAt).getTime()
      });
    });

    // Sort all activities by timestamp
    this.recentActivities = activities
      .sort((a, b) => b.timestamp - a.timestamp)
      .slice(0, 8);

    // If no activities, add a default message
    if (this.recentActivities.length === 0) {
      this.recentActivities = [{
        action: 'No recent activity',
        time: 'N/A',
        type: 'system',
        timestamp: now
      }];
    }
  }

  private getTimeAgo(dateString: string | Date): string {
    if (!dateString) return 'Recently';

    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return 'Recently';

      const now = new Date();
      const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

      if (seconds < 0) return 'Just now';
      if (seconds < 60) return `${seconds} seconds ago`;

      const minutes = Math.floor(seconds / 60);
      if (minutes < 60) return `${minutes} ${minutes === 1 ? 'minute' : 'minutes'} ago`;

      const hours = Math.floor(minutes / 60);
      if (hours < 24) return `${hours} ${hours === 1 ? 'hour' : 'hours'} ago`;

      const days = Math.floor(hours / 24);
      if (days < 30) return `${days} ${days === 1 ? 'day' : 'days'} ago`;

      const months = Math.floor(days / 30);
      if (months < 12) return `${months} ${months === 1 ? 'month' : 'months'} ago`;

      const years = Math.floor(months / 12);
      return `${years} ${years === 1 ? 'year' : 'years'} ago`;
    } catch (error) {
      return 'Recently';
    }
  }

  private calculateRevenueChange(orders: any[]): number {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    // Use the same revenue filtering logic
    const todayRevenue = orders
      .filter(order => {
        if (!order.orderDate) return false;
        const orderDate = new Date(order.orderDate);
        return orderDate >= today;
      })
      .reduce((sum, order) => sum + (order.totalAmount || order.grandTotal || 0), 0);

    const yesterdayRevenue = orders
      .filter(order => {
        if (!order.orderDate) return false;
        const orderDate = new Date(order.orderDate);
        return orderDate >= yesterday && orderDate < today;
      })
      .reduce((sum, order) => sum + (order.totalAmount || order.grandTotal || 0), 0);

    if (yesterdayRevenue === 0) {
      return todayRevenue > 0 ? 100 : 0;
    }

    const change = ((todayRevenue - yesterdayRevenue) / yesterdayRevenue) * 100;
    return Number(change.toFixed(1)); // Return as number with 1 decimal
  }

  private updateStats(): void {
    const userStats = this.calculateUserStats();

    this.stats = [
      {
        title: 'Total Revenue',
        value: this.formatCurrency(this.salesData.totalRevenue),
        change: `${this.salesData.revenueChange > 0 ? '+' : ''}${this.salesData.revenueChange.toFixed(1)}%`,
        icon: 'fa-solid fa-dollar-sign',
        color: 'bg-green-500',
        description: `Today: ${this.formatCurrency(this.salesData.dailyRevenue)}`
      },
      {
        title: 'Total Orders',
        value: this.allOrders.length,
        change: this.allOrders.length > 0 ? '+8%' : '0%',
        icon: 'fa-solid fa-shopping-cart',
        color: 'bg-blue-500',
        description: `Avg. Order: ${this.formatCurrency(this.salesData.averageOrderValue)}`
      },
      {
        title: 'Total Products',
        value: this.productAnalysis.totalProducts,
        change: `${this.productAnalysis.activeProducts} active`,
        icon: 'fa-solid fa-box',
        color: 'bg-purple-500',
        description: `${this.productAnalysis.topSellingProducts} top selling`
      },
      {
        title: 'Total Users',
        value: userStats.totalUsers,
        change: `${userStats.newUsersToday} new today`,
        icon: 'fa-solid fa-users',
        color: 'bg-indigo-500',
        description: `${userStats.activeUsers} active users`
      }
    ];
  }

  private formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  }

  getStatusClass(status: string): string {
    const statusLower = status.toLowerCase();
    switch (statusLower) {
      case 'delivered':
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'pending':
      case 'pendingpayment':
        return 'bg-yellow-100 text-yellow-800';
      case 'processing':
      case 'confirmed':
      case 'shipped':
      case 'paid':
        return 'bg-blue-100 text-blue-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  }

  getStockStatusClass(currentStock: number): string {
    if (currentStock === 0) return 'bg-red-100 text-red-800';
    if (currentStock <= 5) return 'bg-orange-100 text-orange-800';
    return 'bg-green-100 text-green-800';
  }

  refreshDashboard(): void {
    this.loadDashboardData();
  }

  private initializeCharts(): void {
    this.destroyCharts();
    this.createSalesChart();
    this.createCategoriesChart();
    this.createStockChart();
    this.createOrderStatusChart();
  }

  private createSalesChart(): void {
    const ctx = document.getElementById('salesChart') as HTMLCanvasElement;
    if (ctx) {
      const dailyRevenue = this.calculateDailyRevenue();
      const chart = new Chart(ctx, {
        type: 'line',
        data: {
          labels: this.getLast7DaysLabels(),
          datasets: [{
            label: 'Daily Revenue (₹)',
            data: dailyRevenue,
            borderColor: '#3B82F6',
            backgroundColor: 'rgba(59, 130, 246, 0.1)',
            tension: 0.4,
            fill: true,
            pointRadius: 4,
            pointHoverRadius: 6
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            title: {
              display: true,
              text: 'Daily Revenue Trend (Last 7 Days)',
              font: {
                size: 14,
                weight: 'bold'
              }
            },
            legend: {
              display: true,
              position: 'top'
            },
            tooltip: {
              callbacks: {
                label: function (context) {
                  let label = context.dataset.label || '';
                  if (label) {
                    label += ': ';
                  }
                  if (context.parsed.y !== null) {
                    label += new Intl.NumberFormat('en-IN', {
                      style: 'currency',
                      currency: 'INR'
                    }).format(context.parsed.y);
                  }
                  return label;
                }
              }
            }
          },
          scales: {
            y: {
              beginAtZero: true,
              ticks: {
                callback: function (value) {
                  return '₹' + value.toLocaleString('en-IN');
                }
              }
            }
          }
        }
      });
      this.chartInstances.push(chart);
    }
  }

  private getLast7DaysLabels(): string[] {
    const days = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      if (i === 0) {
        days.push('Today');
      } else if (i === 1) {
        days.push('Yesterday');
      } else {
        days.push(date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }));
      }
    }
    return days;
  }

  // NEW CODE:
  private calculateDailyRevenue(): number[] {
    const dailyRevenue = new Array(7).fill(0);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    this.allOrders
      .filter(order => {
        if (!order.orderDate) return false;

        const status = order.status;
        // Include Paid (2), Shipped (3/4), Delivered (5) orders
        return (status === 2 || status === 'Paid' || status === 'paid' ||
          status === 3 || status === 4 || status === 'Shipped' || status === 'shipped' ||
          status === 5 || status === 'Delivered' || status === 'delivered');
      })
      .forEach(order => {
        try {
          const orderDate = new Date(order.orderDate);
          if (isNaN(orderDate.getTime())) return;

          orderDate.setHours(0, 0, 0, 0);
          const dayDiff = Math.floor((today.getTime() - orderDate.getTime()) / (1000 * 60 * 60 * 24));

          if (dayDiff >= 0 && dayDiff < 7) {
            dailyRevenue[6 - dayDiff] += order.totalAmount || order.grandTotal || 0;
          }
        } catch (error) {
          console.error('Error processing order date:', error);
        }
      });

    return dailyRevenue;
  }

  private createCategoriesChart(): void {
    const ctx = document.getElementById('categoriesChart') as HTMLCanvasElement;
    if (ctx && this.categories.length > 0) {
      const categoryData = this.calculateCategoryDistribution();
      const chart = new Chart(ctx, {
        type: 'doughnut',
        data: {
          labels: categoryData.labels,
          datasets: [{
            data: categoryData.values,
            backgroundColor: [
              '#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6',
              '#06B6D4', '#F97316', '#EC4899', '#84CC16', '#6366F1'
            ]
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            title: {
              display: true,
              text: 'Products by Category',
              font: {
                size: 14,
                weight: 'bold'
              }
            },
            legend: {
              position: 'bottom',
              labels: {
                boxWidth: 12,
                font: {
                  size: 10
                }
              }
            }
          }
        }
      });
      this.chartInstances.push(chart);
    }
  }

  private calculateCategoryDistribution(): { labels: string[], values: number[] } {
    const categoryMap = new Map<string, number>();

    // Count products per category
    this.products.forEach(product => {
      const categoryName = product.category?.name || product.categoryName || 'Uncategorized';
      categoryMap.set(categoryName, (categoryMap.get(categoryName) || 0) + 1);
    });

    // Fallback to categories from service if no products have categories
    if (categoryMap.size === 0 && this.categories.length > 0) {
      this.categories.forEach(category => {
        categoryMap.set(category.name || 'Unnamed', 0);
      });
    }

    const labels = Array.from(categoryMap.keys());
    const values = Array.from(categoryMap.values());

    return { labels, values };
  }

  private createStockChart(): void {
    const ctx = document.getElementById('stockChart') as HTMLCanvasElement;
    if (ctx) {
      const chart = new Chart(ctx, {
        type: 'bar',
        data: {
          labels: ['In Stock', 'Low Stock', 'Out of Stock'],
          datasets: [{
            label: 'Products',
            data: [
              this.productAnalysis.totalProducts - this.productAnalysis.lowStockProducts - this.productAnalysis.outOfStockProducts,
              this.productAnalysis.lowStockProducts,
              this.productAnalysis.outOfStockProducts
            ],
            backgroundColor: [
              '#10B981',
              '#F59E0B',
              '#EF4444'
            ]
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            title: {
              display: true,
              text: 'Stock Status Overview',
              font: {
                size: 14,
                weight: 'bold'
              }
            },
            legend: {
              display: false
            }
          },
          scales: {
            y: {
              beginAtZero: true,
              ticks: {
                stepSize: 1
              }
            }
          }
        }
      });
      this.chartInstances.push(chart);
    }
  }

  private createOrderStatusChart(): void {
    const ctx = document.getElementById('orderStatusChart') as HTMLCanvasElement;
    if (ctx && this.allOrders.length > 0) {
      const statusData = this.calculateOrderStatusDistribution();
      const chart = new Chart(ctx, {
        type: 'pie',
        data: {
          labels: statusData.labels,
          datasets: [{
            data: statusData.values,
            backgroundColor: [
              '#10B981', // Paid
              '#3B82F6', // Pending Payemnt
              '#EF4444', // Cancelled
              '#6B7280', // Delivered
              '#F59E0B'  // Shipped
            ]
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            title: {
              display: true,
              text: 'Order Status Distribution',
              font: {
                size: 14,
                weight: 'bold'
              }
            },
            legend: {
              position: 'bottom'
            }
          }
        }
      });
      this.chartInstances.push(chart);
    }
  }

  private calculateOrderStatusDistribution(): { labels: string[], values: number[] } {
    const statusMap = new Map<string, number>();

    this.allOrders.forEach(order => {
      const status = this.mapOrderStatus(order.status);
      statusMap.set(status, (statusMap.get(status) || 0) + 1);
    });

    const labels = Array.from(statusMap.keys());
    const values = Array.from(statusMap.values());

    return { labels, values };
  }

  private destroyCharts(): void {
    this.chartInstances.forEach(chart => chart.destroy());
    this.chartInstances = [];
  }

  private analyzeProducts(products: any[]): void {
    this.productAnalysis = {
      totalProducts: products.length,
      activeProducts: products.filter(p => p.isActive !== false).length,
      lowStockProducts: products.filter(p => p.currentStock > 0 && p.currentStock <= 10).length,
      outOfStockProducts: products.filter(p => p.currentStock === 0).length,
      topSellingProducts: this.topSellingProducts.filter(p => p.sales > 0).length
    };
  }
}