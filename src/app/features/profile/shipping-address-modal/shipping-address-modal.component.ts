import { Component, EventEmitter, Input, Output, OnChanges } from '@angular/core';
import { ShippingAddress } from 'src/app/core/models/shipping-address.model';
import { ShippingAddressService } from 'src/app/core/services/shipping-address.service';
import { ToastService } from 'src/app/core/services/toast.service';

@Component({
  selector: 'app-shipping-address-modal',
  templateUrl: './shipping-address-modal.component.html',
})
export class ShippingAddressModalComponent implements OnChanges {

  @Input() address: ShippingAddress | null = null;

  @Output() close = new EventEmitter<void>();
  @Output() refresh = new EventEmitter<void>();

  form: ShippingAddress = {
    addressLine: '',
    city: '',
    state: '',
    pincode: 0,
    phone: 0
  };

  constructor(
    private shippingService: ShippingAddressService,
    private toast: ToastService
  ) {}

  ngOnChanges(): void {
    if (this.address) {
      this.form = { ...this.address };
    } else {
      this.resetForm();
    }
  }

  submit(): void {
    const payload = {
      addressLine: this.form.addressLine.trim(),
      city: this.form.city.trim(),
      state: this.form.state.trim(),
      pincode: Number(this.form.pincode),
      phone: Number(this.form.phone)
    };

    const request$ = this.form.id
      ? this.shippingService.update(this.form.id, payload)
      : this.shippingService.add(payload);

    request$.subscribe({
      next: () => {
        this.toast.success(
          this.form.id ? 'Address updated successfully' : 'Address added successfully'
        );
        this.refresh.emit();
        this.close.emit();
      },
      error: () => this.toast.error('Failed to save address')
    });
  }

  onCancel(): void {
    this.close.emit();
  }

  private resetForm(): void {
    this.form = {
      addressLine: '',
      city: '',
      state: '',
      pincode: 0,
      phone: 0
    };
  }
}
