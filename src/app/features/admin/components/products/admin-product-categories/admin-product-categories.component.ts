import { Component, OnInit } from '@angular/core';
import { CategoriesService } from 'src/app/core/services/base_services/categories.service';
import { ToastService } from 'src/app/core/services/toast.service';
import { Category } from 'src/app/core/models/base-models/Category.model';

@Component({
  selector: 'app-admin-product-categories',
  templateUrl: './admin-product-categories.component.html',
  styleUrls: ['./admin-product-categories.component.css']
})
export class AdminProductCategoriesComponent implements OnInit {

  categories: Category[] = [];
  openMenuId: number | null = null;

  totalCategories = 0;
  activeCategories = 0;
  nonActiveCategories = 0;

  isModalOpen = false;
  modalMode: 'edit' | 'delete' | 'add' = 'add';
  selectedCategory: Category | null = null;

  constructor(
    private categoriesService: CategoriesService,
    private toast: ToastService
  ) {}

  ngOnInit() {
    this.loadCategories();
  }

  loadCategories() {
    this.categoriesService.getCategories().subscribe({
      next: (list: Category[]) => {
        this.categories = list;

        this.totalCategories = this.categories.length;
        this.activeCategories = this.categories.filter(x => x.isActive).length;
        this.nonActiveCategories = this.categories.filter(x => !x.isActive).length;
      },
      error: () => this.toast.error("Failed to load categories")
    });
  }

  menuOption(id: number) {
    this.openMenuId = this.openMenuId === id ? null : id;
  }

  openAddCategoryModal() {
    this.modalMode = 'add';
    this.selectedCategory = null;
    this.isModalOpen = true;
  }

  openEditCategoryModal(category: Category) {
    this.modalMode = 'edit';
    this.selectedCategory = { ...category };
    this.isModalOpen = true;
    this.openMenuId = null;
  }

  openDeleteCategoryModal(category: Category) {
    this.modalMode = 'delete';
    this.selectedCategory = { ...category };
    this.isModalOpen = true;
    this.openMenuId = null;
  }

  closeModal() {
    this.isModalOpen = false;
    this.selectedCategory = null;
    this.modalMode = 'add';
  }

  handleSave(data: Partial<Category>) {

    // ADD
    if (this.modalMode === 'add') {
      this.categoriesService.addCategory(data).subscribe({
        next: () => {
          this.toast.success("Category created");
          this.closeModal();
          this.loadCategories();
        },
        error: () => this.toast.error("Failed to create category")
      });
    }

    // EDIT
    else if (this.modalMode === 'edit' && this.selectedCategory) {

      const payload: Partial<Category> = {
        id: this.selectedCategory.id,
        ...data
      };

      this.categoriesService.updateCategory(payload).subscribe({
        next: () => {
          this.toast.success("Category updated");
          this.closeModal();
          this.loadCategories();
        },
        error: () => this.toast.error("Failed to update category")
      });
    }
  }

  handleDelete(id: number) {
    this.categoriesService.deleteCategory(id).subscribe({
      next: () => {
        this.toast.success("Category deleted");
        this.closeModal();
        this.loadCategories();
      },
      error: () => this.toast.error("Failed to delete category")
    });
  }

  toggleStatus(categoryId: number) {
    this.categoriesService.toggleStatus(categoryId).subscribe({
      next: (res: any) => {
        this.toast.success(res.message);
        this.loadCategories();
      },
      error: () => this.toast.error("Failed to change status")
    });
  }
}
