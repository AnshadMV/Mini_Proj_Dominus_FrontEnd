import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Category } from 'src/app/core/models/base-models/Category.model';
import { Color } from 'src/app/core/models/base-models/Color.model';
import { CategoriesService } from 'src/app/core/services/base_services/categories.service';
import { ProductService } from 'src/app/core/services/product.service';
import { ToastService } from 'src/app/core/services/toast.service';

@Component({
  selector: 'app-admin-product-form',
  templateUrl: './admin-product-form.component.html',
  styleUrls: ['./admin-product-form.component.css']
})
export class AdminProductFormComponent implements OnInit {

  productForm!: FormGroup;

  categories: Category[] = [];
  colors: any[] = [];
  selectedColorIds: number[] = [];

  isEditMode = false;
  isSubmitting = false;
  imagePreviews: string[] = [];
  invalidImageUrls: number[] = [];
  uploadedFiles: File[] = [];  // Store actual files
  imageUrls: string[] = [];     // Store URLs separately

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private productService: ProductService,
    private categoriesService: CategoriesService,
    private toast: ToastService
  ) { }

  ngOnInit(): void {
    this.productForm = this.createProductForm();
    this.loadCategories();
    this.loadColors();
  }

  createProductForm(): FormGroup {
    return this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3)]],
      description: [''],
      price: [0, [Validators.required, Validators.min(0)]],
      currentStock: [0, [Validators.required, Validators.min(0)]],
      category: ['', Validators.required],
      status: ['active'],
      topSelling: ['no'],
      colors: [[], Validators.required],
      warranty: ['']
    });
  }

  loadCategories(): void {
    this.categoriesService.getCategories().subscribe({
      next: res => this.categories = (res as Category[]).filter(c => c.isActive === true),
      error: () => this.toast.error("Failed to load categories")
    });
  }

  loadColors() {
    this.productService.getAllColors().subscribe({
      next: res => {
        // this.colors =res.data 
        this.colors = (res.data as Color[]).filter(c => c.isActive === true)
      },
      error: () => this.toast.error("Failed to load colors")
    });
  }

  toggleColor(colorId: number) {
    if (this.selectedColorIds.includes(colorId)) {
      this.selectedColorIds = this.selectedColorIds.filter(c => c !== colorId);
    } else {
      this.selectedColorIds.push(colorId);
    }

    this.productForm.patchValue({
      colors: this.selectedColorIds
    });
  }

  onImageSelected(event: any) {
    const files: FileList = event.target.files;
    if (!files || files.length === 0) return;

    for (let file of Array.from(files)) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        this.toast.error(`${file.name} is not a valid image file`);
        continue;
      }

      // Validate file size (10MB max)
      if (file.size > 10 * 1024 * 1024) {
        this.toast.error(`${file.name} exceeds 10MB limit`);
        continue;
      }

      this.uploadedFiles.push(file);

      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.imagePreviews.push(e.target.result);
      };
      reader.readAsDataURL(file);
    }

    event.target.value = '';
  }

  // addImageByUrl(url: string): void {
  //   if (!url || url.trim() === '') return;

  //   try {
  //     new URL(url);
  //   } catch {
  //     this.toast.error('Invalid URL format');
  //     return;
  //   }

  //   if (this.imagePreviews.includes(url)) {
  //     this.toast.error('This URL has already been added');
  //     return;
  //   }

  //   this.imageUrls.push(url.trim());
  //   this.imagePreviews.push(url.trim());
  //   this.validateImageUrl(this.imagePreviews.length - 1);
  // }

  removeImage(index: number): void {
    const preview = this.imagePreviews[index];

    // Remove from uploaded files if it's a file
    if (preview.startsWith('data:')) {
      const fileIndex = this.imagePreviews.slice(0, index).filter(p => p.startsWith('data:')).length;
      this.uploadedFiles.splice(fileIndex, 1);
    }
    // Remove from URLs if it's a URL
    else {
      const urlIndex = this.imageUrls.indexOf(preview);
      if (urlIndex > -1) {
        this.imageUrls.splice(urlIndex, 1);
      }
    }

    this.imagePreviews.splice(index, 1);

    // Clean up invalid tracking
    const invalidIndex = this.invalidImageUrls.indexOf(index);
    if (invalidIndex > -1) {
      this.invalidImageUrls.splice(invalidIndex, 1);
    }
    // Adjust indices for remaining invalid images
    this.invalidImageUrls = this.invalidImageUrls.map(i => i > index ? i - 1 : i);
  }

  clearAllImages(): void {
    this.imagePreviews = [];
    this.uploadedFiles = [];
    this.imageUrls = [];
    this.invalidImageUrls = [];
  }

  reorderImages(): void {
    // Create mapping of old to new indices
    const combined = this.imagePreviews.map((v, i) => ({
      preview: v,
      sort: Math.random(),
      oldIndex: i
    }));

    combined.sort((a, b) => a.sort - b.sort);

    // Reorder previews
    this.imagePreviews = combined.map(x => x.preview);

    // Rebuild files and URLs arrays based on new order
    const newFiles: File[] = [];
    const newUrls: string[] = [];

    for (const item of combined) {
      if (item.preview.startsWith('data:')) {
        const fileIndex = this.imagePreviews.slice(0, item.oldIndex).filter(p => p.startsWith('data:')).length;
        newFiles.push(this.uploadedFiles[fileIndex]);
      } else {
        newUrls.push(item.preview);
      }
    }

    this.uploadedFiles = newFiles;
    this.imageUrls = newUrls;
    this.invalidImageUrls = [];
  }

  markImageAsInvalid(index: number): void {
    if (!this.invalidImageUrls.includes(index)) {
      this.invalidImageUrls.push(index);
    }
  }

  isImageUrlInvalid(index: number): boolean {
    return this.invalidImageUrls.includes(index);
  }

  getImageSourceType(imageUrl: string): string {
    if (imageUrl.startsWith('data:')) return 'Uploaded File';
    if (imageUrl.startsWith('blob:')) return 'Blob URL';
    return 'External URL';
  }

  private validateImageUrl(index: number): void {
    const imageUrl = this.imagePreviews[index];

    if (imageUrl.startsWith('data:') || imageUrl.startsWith('blob:')) return;

    const img = new Image();
    img.onload = () => {
      const i = this.invalidImageUrls.indexOf(index);
      if (i > -1) this.invalidImageUrls.splice(i, 1);
    };
    img.onerror = () => this.markImageAsInvalid(index);
    img.src = imageUrl;

    setTimeout(() => {
      if (!img.complete) this.markImageAsInvalid(index);
    }, 5000);
  }

  // ============== SUBMIT ====================
  onSubmit() {
    if (this.productForm.invalid) {
      this.productForm.markAllAsTouched();
      return;
    }

    if (this.uploadedFiles.length === 0) {
      this.toast.error('Please upload at least one product image');
      return;
    }

    this.isSubmitting = true;

    const payload = {
      ...this.productForm.value,

      categoryId: this.productForm.value.category,   // Map properly

      isActive: this.productForm.value.status === 'active',
      status: this.productForm.value.status === 'active',

      topSelling: this.productForm.value.topSelling === 'yes',

      colorIds: this.selectedColorIds,
      files: this.uploadedFiles
    };


    this.productService.createProduct(payload).subscribe({
      next: () => {
        this.toast.success('Product Created Successfully');
        this.router.navigate(['/admin/products/list']);
        this.isSubmitting = false;
      },
      error: (err) => {
        let message = 'Failed to create product';

        // ASP.NET Core ModelState errors
        if (err.error?.errors) {
          const firstKey = Object.keys(err.error.errors)[0];
          message = err.error.errors[firstKey][0];
        }
        // ApiResponse message
        else if (err.error?.message) {
          message = err.error.message;
        }
        // Fallback to HTTP status
        else if (err.status) {
          message = `Error ${err.status}: ${err.statusText}`;
        }

        this.toast.error(message);
        this.isSubmitting = false;
      }

    });
  }


  // Form Getters
  get name() {
    return this.productForm.get('name');
  }

  get price() {
    return this.productForm.get('price');
  }

  get currentStock() {
    return this.productForm.get('currentStock');
  }

  get category() {
    return this.productForm.get('category');
  }

  get colorsControl() {
    return this.productForm.get('colors');
  }
}