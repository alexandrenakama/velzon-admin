// src/app/shared/toasts/toast.service.ts
import { Injectable, TemplateRef } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class ToastService {
  toasts: Array<{ textOrTpl: string | TemplateRef<any>, classname?: string, delay?: number }> = [];

  show(textOrTpl: string | TemplateRef<any>, options: { classname?: string, delay?: number } = {}) {
    this.toasts.push({ textOrTpl, ...options });
  }

  remove(toast: any) {
    this.toasts = this.toasts.filter(t => t !== toast);
  }
}
