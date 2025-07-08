// src/app/shared/confirm-modal/confirm-modal.component.ts
import { Component, Input } from '@angular/core';
import { NgbActiveModal }    from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-confirm-modal',
  templateUrl: './confirm-modal.component.html',
})
export class ConfirmModalComponent {
  @Input() title       = 'Atenção';
  @Input() message     = 'Tem certeza que deseja continuar?';
  @Input() confirmText = 'Sim';
  @Input() cancelText  = 'Não';

  constructor(public activeModal: NgbActiveModal) {}
}
