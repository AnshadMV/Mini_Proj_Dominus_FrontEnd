import { Component, EventEmitter, Input, Output, OnChanges } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Product } from 'src/app/core/models/product.model';
import { ProductService } from 'src/app/core/services/product.service';
import { Category } from 'src/app/core/models/base-models/Category.model';
import { CategoriesService } from 'src/app/core/services/base_services/categories.service';
import { User } from 'src/app/core/models/user.model';
import { Color } from 'src/app/core/models/base-models/Color.model';

@Component({
  selector: 'app-admin-modals',
  templateUrl: './admin-modals.component.html',
  styleUrls: ['./admin-modals.component.css']
})

export class AdminModalsComponent implements OnChanges {
  @Input() isOpen: boolean = false;
  @Input() mode: 'edit' | 'delete' | 'add' | 'view' = 'edit';
  @Input() entityType: 'product' | 'category' | 'user' | 'color' = 'product';
  @Input() product: Product | null = null;
  @Input() category: Category | null = null;
  @Output() close = new EventEmitter<void>();
  @Output() save = new EventEmitter<any>();
  @Output() confirmDelete = new EventEmitter<number>();
  @Input() user: User | null = null;
  @Input() color?: Color;

  editForm: FormGroup;
  categories: Category[] = [];
  selectedImageFile: File | null = null;
  imagePreview: string | null = null;
  colors: any[] = [];
  selectedColorIds: number[] = [];

  constructor(
    private fb: FormBuilder,
    private productService: ProductService,
    private categoriesService: CategoriesService
  ) {
    this.editForm = this.fb.group({
      name: ['', Validators.required],
      description: [''],
      status: [true],
      price: [null, [Validators.required, Validators.min(0)]],
      currentStock: [null, [Validators.required, Validators.min(0)]],
      category: ['', Validators.required],
      colorIds: [[]],
      warranty: [''],
      topSelling: [false],
      hexCode: ['']
    });
    this.loadCategories();
    this.loadColors();

  }

  ngOnChanges() {
    if (this.isOpen) {
      // Clear all validators first
      this.editForm.get('name')?.setValidators([Validators.required]);
      this.editForm.get('price')?.clearValidators();
      this.editForm.get('currentStock')?.clearValidators();
      this.editForm.get('category')?.clearValidators();
      this.editForm.get('colors')?.clearValidators();
      this.editForm.get('warranty')?.clearValidators();
      this.editForm.get('description')?.clearValidators();
      this.editForm.get('topSelling')?.clearValidators();
      this.editForm.get('color')?.clearValidators();
      this.editForm.get('status')?.clearValidators();

      if (this.entityType === 'product') {
        // Set validators for product fields
        this.editForm.get('price')?.setValidators([Validators.required, Validators.min(0)]);
        this.editForm.get('currentStock')?.setValidators([Validators.required, Validators.min(0)]);
        this.editForm.get('category')?.setValidators([Validators.required]);
      } else if (this.entityType === 'category') {
        // Set validators for category fields
        this.editForm.get('color')?.setValidators([Validators.required]);
        this.editForm.get('status')?.setValidators([Validators.required]);
      } else if (this.entityType === 'color' && this.color) {
        this.editForm.patchValue({
          name: this.color.name,
          hexCode: this.color.hexCode,
          status: this.color.isActive
        });
      }



      // Update validators
      this.editForm.get('name')?.updateValueAndValidity();
      this.editForm.get('price')?.updateValueAndValidity();
      this.editForm.get('currentStock')?.updateValueAndValidity();
      this.editForm.get('category')?.updateValueAndValidity();
      this.editForm.get('colors')?.updateValueAndValidity();
      this.editForm.get('warranty')?.updateValueAndValidity();
      this.editForm.get('description')?.updateValueAndValidity();
      this.editForm.get('topSelling')?.updateValueAndValidity();
      this.editForm.get('color')?.updateValueAndValidity();
      this.editForm.get('status')?.updateValueAndValidity();
      this.editForm.get('hexCode')?.updateValueAndValidity();

      if (this.mode === 'edit' || this.mode === 'add') {
        if (this.entityType === 'product' && this.product) {
          this.editForm.patchValue({
            name: this.product.name,
            price: this.product.price,
            currentStock: this.product.currentStock,
            category: this.product.categoryId,
            colorIds: this.mapColorNamesToIds(this.product.availableColors),
            warranty: this.product.warranty,
            description: this.product.description,
            topSelling: this.product.topSelling
          });
          this.imagePreview = null;
        } else if (this.entityType === 'category' && this.category) {
          this.editForm.patchValue({
            name: this.category.name,
            description: this.category.description,
            status: this.category.isActive
          });
        } else if (this.entityType === 'color' && this.color) {
          this.editForm.patchValue({
            name: this.color.name,
            description: '',
            hexCode: this.color.hexCode,
            status: this.color.isActive
          });
        }


        else if (this.mode === 'add') {
          // Reset form for new entity
          this.resetForm();
        }
      }
    }
  }

  onImageSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.selectedImageFile = file;
      const reader = new FileReader();
      reader.onload = () => {
        this.imagePreview = reader.result as string;
      };
      reader.readAsDataURL(file);
    }
  }
  private mapColorNamesToIds(colorNames: any): number[] {
    if (!colorNames || !this.colors || this.colors.length === 0) return [];

    return (Array.isArray(colorNames) ? colorNames : [colorNames])
      .map((name: string) => {
        const match = this.colors.find((c: any) =>
          c.name.trim().toLowerCase() === name.trim().toLowerCase()
        );
        return match ? match.id : null;
      })
      .filter((id: number | null) => id !== null) as number[];
  }

  onClose() {
    this.close.emit();
    this.resetForm();
  }

  onSave() {
    if (!this.editForm.valid) {
      this.markFormGroupTouched();
      return;
    }
    const f = this.editForm.value;

    if ((this.mode === 'edit' || this.mode === 'add') && this.editForm.valid) {
      const formValue = this.editForm.value;

      if (this.entityType === 'product') {

        const dto = {
          id: this.product?.id,
          name: f.name,
          description: f.description || '',
          price: Number(f.price),
          currentStock: Number(f.currentStock),

          categoryId: Number(f.category),   // ✅ FIXED

          isActive: f.status ?? true,
          topSelling: f.topSelling ?? false,
          status: f.status ?? true,         // ✅ REQUIRED

          warranty: f.warranty || '',
          colorIds: (f.colorIds || []).map((x: any) => Number(x))  // ✅ ensure int[]
        };

        this.save.emit(dto);
      }


      if (this.entityType === 'category') {
        this.save.emit({
          id: this.category?.id,     // <-- add this
          name: f.name,
          description: f.description ?? '',
          isActive: f.status
        });
      }
      if (this.entityType === 'color') {
        this.save.emit({
          id: this.color?.id,
          name: f.name,
          hexCode: f.hexCode,
          isActive: f.status
        });
      }


      this.onClose();
    } else {
      console.log('Form is invalid:', this.editForm.errors);
      this.markFormGroupTouched();
    }
  }
  parseColors(colors: string) {
    if (!colors) return [];
    return colors.split(',')
      .map(c => c.trim())
      .filter(c => c !== '')
      .map((_, i) => i + 1);   // temporary mapping until real colorId list used
  }

  // categoryIdFromName(name: string) {
  //   const cat = this.categories.find(c => c.name === name);
  //   return cat ? cat.id : null;
  // }


  onDelete() {
    if (this.mode === 'delete') {
      const id =
        this.entityType === 'product' ? this.product?.id :
          this.entityType === 'category' ? this.category?.id :
            this.entityType === 'color' ? this.color?.id :
              null;

      if (id != null) {
        this.confirmDelete.emit(id);
        this.onClose();
      }
    }
  }

  loadColors() {
    this.productService.getAllColors().subscribe({
      next: res => {
        this.colors = res.data.filter((c: any) => c.isActive && !c.isDeleted);
      },
      error: err => console.error("Failed loading colors", err)
    });
  }


  getModalTitle(): string {
    if (this.mode === 'delete') return `Delete ${this.entityType}`;
    if (this.mode === 'view') return `User Details`;
    return this.mode === 'add'
      ? `Add New ${this.entityType}`
      : `Edit ${this.entityType}`;
  }


  private resetForm() {
    // Reset form values
    this.editForm.reset({
      description: '',
      status: true

    });

    // Clear all validators
    this.editForm.get('name')?.setValidators([Validators.required]);
    this.editForm.get('price')?.clearValidators();
    this.editForm.get('currentStock')?.clearValidators();
    this.editForm.get('category')?.clearValidators();
    this.editForm.get('colors')?.clearValidators();
    this.editForm.get('warranty')?.clearValidators();
    this.editForm.get('description')?.clearValidators();
    this.editForm.get('topSelling')?.clearValidators();
    this.editForm.get('color')?.clearValidators();
    this.editForm.get('status')?.clearValidators();

    // Set validators based on entityType
    if (this.entityType === 'product') {
      this.editForm.get('price')?.setValidators([Validators.required, Validators.min(0)]);
      this.editForm.get('currentStock')?.setValidators([Validators.required, Validators.min(0)]);
      this.editForm.get('category')?.setValidators([Validators.required]);
    } else if (this.entityType === 'category') {
      this.editForm.get('color')?.setValidators([Validators.required]);
      this.editForm.get('status')?.setValidators([Validators.required]);
    }

    // Update validators
    this.editForm.get('name')?.updateValueAndValidity();
    this.editForm.get('price')?.updateValueAndValidity();
    this.editForm.get('currentStock')?.updateValueAndValidity();
    this.editForm.get('category')?.updateValueAndValidity();
    this.editForm.get('colors')?.updateValueAndValidity();
    this.editForm.get('warranty')?.updateValueAndValidity();
    this.editForm.get('description')?.updateValueAndValidity();
    this.editForm.get('topSelling')?.updateValueAndValidity();
    this.editForm.get('color')?.updateValueAndValidity();
    this.editForm.get('status')?.updateValueAndValidity();

    // Set default category if available for product
    if (this.entityType === 'product' && this.categories.length > 0 && !this.editForm.get('category')?.value) {
      this.editForm.patchValue({ category: this.categories[0] });
    }

    this.imagePreview = null;
    this.selectedImageFile = null;
  }

  private markFormGroupTouched() {
    Object.keys(this.editForm.controls).forEach(key => {
      const control = this.editForm.get(key);
      control?.markAsTouched();
    });
  }

  private loadCategories() {
    this.categoriesService.getCategories().subscribe({
      next: (categories) => {
        // this.categories = categories;
        this.categories = (categories as Category[]).filter(c => c.isActive === true)

      },
      error: (err) => console.error('Error loading categories:', err),
    });
  }

}