// src/app/shared/directives/cnpj-mask.directive.ts
import { Directive, HostListener, ElementRef } from '@angular/core';

@Directive({
  selector: '[cnpjMask]'
})
export class CnpjMaskDirective {
  constructor(private el: ElementRef<HTMLInputElement>) {}

  @HostListener('input', ['$event'])
  onInput(): void {
    let v: string = this.el.nativeElement.value
      // remove tudo que não for dígito
      .replace(/\D/g, '');

    // limita a 14 dígitos
    if (v.length > 14) {
      v = v.substr(0, 14);
    }

    // aplica a máscara: 00.000.000/0000-00
    let masked = '';
    if (v.length >  0) masked = v.substr(0, 2);
    if (v.length >= 3) masked += '.' + v.substr(2, 3);
    if (v.length >= 6) masked += '.' + v.substr(5, 3);
    if (v.length >= 9) masked += '/' + v.substr(8, 4);
    if (v.length >= 13) masked += '-' + v.substr(12, 2);

    this.el.nativeElement.value = masked;
  }
}
