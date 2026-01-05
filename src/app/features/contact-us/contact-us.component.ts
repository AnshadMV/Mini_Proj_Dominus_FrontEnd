import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-contact-us',
  templateUrl: './contact-us.component.html',
  styleUrls: ['./contact-us.component.css']
})
export class ContactUsComponent {

  activeTab: string = 'general';

  name: string = '';
  email: string = '';
  message: string = '';

  constructor(private router: Router) { }

  showTab(tab: string) {
    this.activeTab = tab;
  }

  sendWhatsApp() {
    const phone = '919400300166';  // Without + sign

    if (!this.name || !this.email || !this.message) {
      alert("Please fill all fields");
      return;
    }

    const text = `Welcome to Dominus contact Support
Name: ${this.name}
Email: ${this.email}
Message: ${this.message}`;

    const url = `https://wa.me/${phone}?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  }
}
