import { Component, TemplateRef } from '@angular/core';
import { ToastService }           from './toast-service';

@Component({
  selector: 'app-toasts',
  templateUrl: './toasts-container.component.html',
  host: {
    'class': 'toast-container position-fixed top-0 end-0 p-3',
    'style': 'z-index: 1200'
  }
})
export class ToastsContainer {
  constructor(public toastService: ToastService) {}

  isTemplate(toast: { textOrTpl: any }): boolean {
    return toast.textOrTpl instanceof TemplateRef;
  }

  // Novo método para desfazer o union e retornar somente TemplateRef<any>
  getTemplate(toast: { textOrTpl: any }): TemplateRef<any> {
    return toast.textOrTpl as TemplateRef<any>;
  }
}
