// src/app/shared/directives/mascara.directive.ts
import { Directive, HostListener, ElementRef, Input } from '@angular/core';

export type TipoMascara = 'cep' | 'cnpj' | 'telefone';

@Directive({
  selector: '[mascara]'
})
export class MascaraDirective {
  @Input('mascara') tipo!: TipoMascara;

  constructor(private el: ElementRef<HTMLInputElement>) {}

  @HostListener('input')
  onInput(): void {
    let v = this.el.nativeElement.value.replace(/\D/g, '');

    let masked = '';

    if (this.tipo === 'cep') {
      if (v.length > 8) v = v.substr(0, 8);
      masked = v.length > 5
        ? `${v.substr(0,5)}-${v.substr(5)}`
        : v;

    } else if (this.tipo === 'cnpj') {
      if (v.length > 14) v = v.substr(0, 14);
      if (v.length > 12) {
        masked = `${v.substr(0,2)}.${v.substr(2,3)}.${v.substr(5,3)}/${v.substr(8,4)}-${v.substr(12)}`;
      } else if (v.length > 8) {
        masked = `${v.substr(0,2)}.${v.substr(2,3)}.${v.substr(5,3)}/${v.substr(8)}`;
      } else if (v.length > 5) {
        masked = `${v.substr(0,2)}.${v.substr(2,3)}.${v.substr(5)}`;
      } else if (v.length > 2) {
        masked = `${v.substr(0,2)}.${v.substr(2)}`;
      } else {
        masked = v;
      }

    } else if (this.tipo === 'telefone') {
      // sem DDD: 8 ou 9 dígitos
      if (v.length > 9) v = v.substr(0, 9);

      if (v.length <= 4) {
        masked = v;
      } else if (v.length <= 8) {
        // 4+4
        masked = `${v.substr(0,4)}-${v.substr(4)}`;
      } else {
        // 5+4
        masked = `${v.substr(0,5)}-${v.substr(5)}`;
      }
    }

    this.el.nativeElement.value = masked;
    this.el.nativeElement.dispatchEvent(new Event('input', { bubbles: true }));
  }
}
