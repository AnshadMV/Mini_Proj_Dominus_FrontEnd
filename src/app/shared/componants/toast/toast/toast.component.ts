import { Component, OnInit, OnDestroy } from '@angular/core';
import { Toast } from 'src/app/core/models/toast.model';
import { ToastService } from 'src/app/core/services/toast.service';

@Component({
  selector: 'app-toast',
  templateUrl: './toast.component.html',
  styleUrls: ['./toast.component.css']
})
export class ToastComponent implements OnInit, OnDestroy {
  toasts: Toast[] = [];
  private intervalIds: Map<number, any> = new Map(); // Store interval IDs for cleanup

  constructor(private toastService: ToastService) {}

  ngOnInit(): void {
    this.toastService.toastState$.subscribe(toasts => {
      // Clear all existing intervals when new toasts arrive
      this.clearAllIntervals();
      this.toasts = toasts;

      // Initialize a timer for each toast
      this.toasts.forEach(toast => {
        this.startProgressTimer(toast);
      });
    });
  }

  private startProgressTimer(toast: Toast): void {
    if (toast.duration) {
      toast.progress = 100;
      
      const interval = setInterval(() => {
        if (toast.progress > 0) {
          toast.progress -= 1; 
        } else {
          clearInterval(interval);
          this.intervalIds.delete(toast.id);
          this.remove(toast.id);
        }
      }, toast.duration / 100);
      
      this.intervalIds.set(toast.id, interval);
    }
  }

  remove(id: number): void {
    // Clear interval for this toast
    const intervalId = this.intervalIds.get(id);
    if (intervalId) {
      clearInterval(intervalId);
      this.intervalIds.delete(id);
    }
    
    this.toastService.remove(id);
  }

  private clearAllIntervals(): void {
    this.intervalIds.forEach((intervalId) => {
      clearInterval(intervalId);
    });
    this.intervalIds.clear();
  }

  ngOnDestroy(): void {
    this.clearAllIntervals();
  }
}