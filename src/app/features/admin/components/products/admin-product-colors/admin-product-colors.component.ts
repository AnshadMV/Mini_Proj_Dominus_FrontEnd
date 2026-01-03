import { Component, OnInit } from '@angular/core';
import { Color } from 'src/app/core/models/base-models/Color.model';
import { ColorService } from 'src/app/core/services/base_services/color.service';
import { ToastService } from 'src/app/core/services/toast.service';
import { SharedModule } from "src/app/shared/shared.module";
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-admin-colors',
  templateUrl: './admin-product-colors.component.html',
  styleUrls: ['./admin-product-colors.component.css'],
})
export class AdminProductColorsComponent implements OnInit {

  colors: Color[] = [];
  openMenuId: number | null = null;

  isModalOpen = false;
  modalMode: 'add' | 'edit' | 'delete' = 'add';
  selectedColor: Color | undefined;



  totalCategories = 0;
  activeCategories = 0;
  nonActiveCategories = 0;

  constructor(
    private colorService: ColorService,
    private toast: ToastService
  ) { }

  ngOnInit() {
    this.load();
  }

  load() {
    this.colorService.getAll().subscribe({
      next: (res: any) => {
        this.colors = res.data;
        // console.log(res.length)
        // console.log(res.data.length)
        this.totalCategories = this.colors.length
        this.activeCategories = this.colors.filter(x => x.isActive).length
        this.nonActiveCategories = this.colors.filter(x => !x.isActive).length
      },
      error: () => this.toast.error("Failed to load colors")
    });
  }

  menuOption(id: number) {
    this.openMenuId = this.openMenuId === id ? null : id;
  }

  openAdd() {
    this.modalMode = 'add';
    this.selectedColor = undefined;
    this.isModalOpen = true;
  }

  openEdit(color: Color) {
    this.modalMode = 'edit';
    this.selectedColor = color;
    this.isModalOpen = true;
    this.openMenuId = null;
  }

  openDelete(color: Color) {
    this.modalMode = 'delete';
    this.selectedColor = color;
    this.isModalOpen = true;
    this.openMenuId = null;
  }

  closeModal() {
    this.isModalOpen = false;
    this.selectedColor = undefined;
  }

  save(data: Partial<Color>) {

    // ADD
    if (this.modalMode === 'add') {
      this.colorService.create(data).subscribe({
        next: (res: any) => {
          this.toast.success(res.message);
          this.closeModal();
          this.load();
        },
        error: (err) => {
          let message = 'Failed to create color';
          if (err.error?.errors) {
            const firstKey = Object.keys(err.error.errors)[0];
            message = err.error.errors[firstKey][0];
          }
          // ApiResponse message
          else if (err.error?.message) {
            message = err.error.message;
          }

          this.toast.error(message);
        }




      });
    }

    // EDIT
    else if (this.modalMode === 'edit') {
      const payload = {
        id: this.selectedColor!.id,
        name: data.name,
        hexCode: data.hexCode,
        isActive: data.isActive
      };

      this.colorService.update(payload).subscribe({
        next: (res: any) => {
          this.toast.success(res.message || 'Color updated successfully');
          this.closeModal();
          this.load();
        },
        error: err => {
          this.toast.error(err?.error?.message || "Failed to update color");
        }
      });
    }


  }

  confirmDelete(id: number) {
    this.colorService.delete(id).subscribe({
      next: (res: any) => {
        this.toast.success(res.message);
        this.closeModal();
        this.load();
      },
      error: () => this.toast.error("Delete failed")
    });
  }

  toggle(id: number) {
    this.colorService.toggle(id).subscribe({
      next: (res: any) => {
        this.toast.success(res.message);
        this.load();
      },
      error: () => this.toast.error("Failed to change status")
    });
  }

}
