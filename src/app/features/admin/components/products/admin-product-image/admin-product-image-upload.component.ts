import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastService } from 'src/app/core/services/toast.service';
import { ProductService } from 'src/app/core/services/product.service';
import { Product } from 'src/app/core/models/product.model';

@Component({
    selector: 'app-admin-product-image-upload',
    templateUrl: './admin-product-image-upload.component.html',
    styleUrls: ['./admin-product-image-upload.component.css']
})
export class AdminProductImageUploadComponent implements OnInit {

    productId!: number;
    defaultText: string="Select Product";
    selectedFiles: File[] = [];
    previews: string[] = [];
    isSubmitting = false;
    products: Product[] = [];

    constructor(
        private route: ActivatedRoute,
        private productService: ProductService,
        private toast: ToastService,
        private router: Router
    ) { }

    ngOnInit(): void {
        this.productId = Number(this.route.snapshot.paramMap.get('id'));
        this.productService.getAllProducts().subscribe(res => {
            this.products = res;
        });

    }

    onFileChange(event: any) {
        const files: FileList = event.target.files;

        if (!files || files.length === 0) return;

        for (let file of Array.from(files)) {

            if (!file.type.startsWith('image/')) {
                this.toast.error(`${file.name} is not an image`);
                continue;
            }

            if (file.size > 10 * 1024 * 1024) {
                this.toast.error(`${file.name} exceeds 10MB`);
                continue;
            }

            this.selectedFiles.push(file);

            const reader = new FileReader();
            reader.onload = (e: any) => this.previews.push(e.target.result);
            reader.readAsDataURL(file);
        }

        event.target.value = '';
    }

    removeImage(index: number) {
        this.selectedFiles.splice(index, 1);
        this.previews.splice(index, 1);
    }

    clearAll() {
        this.selectedFiles = [];
        this.previews = [];
    }

    submit() {
        if (!this.productId) {
            this.toast.error("Select product first");
            return;
        }

        if (this.selectedFiles.length === 0) {
            this.toast.error("Select at least one image");
            return;
        }

        this.isSubmitting = true;

        this.productService.addImages(this.productId, this.selectedFiles)
            .subscribe({
                next: res => {
                    this.toast.success("Images uploaded successfully");
                    this.router.navigate(['/admin/products/list']);
                    this.isSubmitting = false;
                },
                error: err => {
                    this.toast.error(err.error?.message || "Upload failed");
                    this.isSubmitting = false;
                }
            });
    }

}
