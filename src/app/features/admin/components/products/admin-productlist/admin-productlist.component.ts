import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { Category } from 'src/app/core/models/base-models/Category.model';
import { Product } from 'src/app/core/models/product.model';
import { ProductService } from 'src/app/core/services/product.service';
import { ToastService } from 'src/app/core/services/toast.service';

@Component({
  selector: 'app-admin-productlist',
  templateUrl: './admin-productlist.component.html',
  styleUrls: ['./admin-productlist.component.css']
})
export class AdminProductlistComponent implements OnInit {

  products: Product[] = [];
  activeProductsCount: number = 0;
  lowStockCount: number = 0;
  filteredProducts: Product[] = [];
  isLoading: boolean = false;



  searchTerm: string = '';

  outOfStockCount: number = 0;

  isEditModalOpen = false;
  isDeleteModalOpen = false;
  selectedProduct: Product | null = null;
  isModalOpen = false;
  modalMode: 'edit' | 'delete' = 'edit';



  constructor(
    private productService: ProductService,
    private toast: ToastService
  ) { }



  ngOnInit(): void {
    console.log('AdminProductlistComponent initialized');
    this.getProducts();

  }



  getProducts() {
    this.isLoading = true;

    this.productService.getAllProducts().subscribe({
      next: (products) => {
        this.products = products;
        this.filteredProducts = products;
        // this.totalItems = this.filteredProducts.length;
        // this.updatePagination();
        console.log(this.filteredProducts)
        console.log(this.products)
        this.calculateCounts();
      },
      error: (error) => {
        console.error('Error loading products:', error);
      }, complete: () => {
        this.isLoading = false;
      }
    });
  }


  filterProducts() {
    const term = this.searchTerm.trim();

    if (!term) {
      this.filteredProducts = this.products;
      return;
    }

    this.productService.searchProducts(term).subscribe({
      next: (res) => {
        console.log("RAW SEARCH RESPONSE:", res);

        if (res?.data?.items) {
          this.filteredProducts = res.data.items;
        } else {
          this.filteredProducts = [];
        }

        console.log("FILTERED PRODUCTS:", this.filteredProducts);
      },
      error: (err) => console.error("Search failed", err)
    });
  }



  calculateCounts() {
    this.activeProductsCount = this.products.filter(p => p.isActive).length;
    this.lowStockCount = this.products.filter(p => p.currentStock >= 0 && p.currentStock <= 10).length;
    this.outOfStockCount = this.products.filter(p => p.currentStock === 0).length;
  }


  openModal(mode: 'edit' | 'delete', product: Product) {
    this.selectedProduct = product;
    this.modalMode = mode;
    this.isModalOpen = true;
  }

  closeModal() {
    this.isModalOpen = false;
    this.selectedProduct = null;
  }

  handleSave(form: any) {

    if (!this.selectedProduct) return;

    const payload: any = {
      id: this.selectedProduct.id,

      name: form.name,
      description: form.description || '',

      price: Number(form.price),
      currentStock: Number(form.currentStock),

      categoryId: Number(form.category ?? form.categoryId),

      isActive: !!form.isActive,
      status: !!form.status,
      topSelling: !!form.topSelling,

      warranty: form.warranty || '',

      colorIds: (form.colorIds || []).map((x: number) => Number(x)),  // MUST NOT BE EMPTY!
      files: form.files || []
    };


    console.log('UPDATE PAYLOAD', payload);

    // AdminProductlistComponent.handleSave(formDto)
    this.productService.updateProduct(payload).subscribe({
      next: () => { this.closeModal(); this.getProducts(); this.toast.success('Product updated successfully'); },
      error: err => {
        console.error('Update error', err);
        const msg = err?.error?.message || err?.message || 'Update failed';
        this.toast.error(msg);
      }
    });

  }



  handleDelete(id: number) {
    this.productService.deleteProduct(id).subscribe({
      next: () => {
        this.toast.success("Product deleted");
        this.closeModal();
        this.getProducts();
      },
      error: () => this.toast.error("Delete failed")
    });
  }




}