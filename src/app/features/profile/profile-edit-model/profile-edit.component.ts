import { Component, EventEmitter, Input, Output, OnChanges } from '@angular/core';

@Component({
  selector: 'app-profile-edit',
  templateUrl: './profile-edit.component.html'
})
export class ProfileEditComponent implements OnChanges {

  @Input() user: any;
  @Input() visible = false;

  @Output() closeModal = new EventEmitter<void>();
  @Output() updateUser = new EventEmitter<{ name: string }>();

  form = {
    name: ''
  };

  ngOnChanges() {
    if (this.user) {
      this.form.name = this.user.name;
    }
  }

  close() {
    this.closeModal.emit();
  }
saveChanges() {
  this.updateUser.emit({
    name: this.form.name.trim()
  });
}

  

}
