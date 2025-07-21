// src/app/pages/dashboards/seguradora/cadastro-seguradora/modal/contato-modal.component.ts
import { Component, Input, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { Contato } from 'src/app/store/Seguradora/seguradora.model';

@Component({
  selector: 'app-contato-modal',
  templateUrl: './contato-modal.component.html',
})
export class ContatoModalComponent implements OnInit {
  @Input() contato?: Contato;
  form!: FormGroup;

  constructor(
    private fb: FormBuilder,
    public activeModal: NgbActiveModal
  ) {}

  ngOnInit(): void {
    this.form = this.fb.group({
      id:           [this.contato?.id || null],
      nomeContato:  [this.contato?.nomeContato || '', Validators.required],
      ddd:          [this.contato?.ddd         || '', Validators.required],
      telefone:     [this.contato?.telefone    || '', Validators.required],
      tipoTelefone: [this.contato?.tipoTelefone|| '', Validators.required],
      email:        [
        this.contato?.email || '',
        [Validators.required, Validators.email]
      ]
    });
  }

  salvar(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.activeModal.close(this.form.value as Contato);
  }

  cancelar(): void {
    this.activeModal.dismiss();
  }
}
