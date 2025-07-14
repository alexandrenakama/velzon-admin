// src/app/pages/dashboards/seguradora/cadastro-seguradora/modal/endereco-modal.component.ts
import { Component, Input, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { Endereco } from 'src/app/store/Seguradora/seguradora.model';

@Component({
  selector: 'app-endereco-modal',
  templateUrl: './endereco-modal.component.html',
})
export class EnderecoModalComponent implements OnInit {
  @Input() endereco?: Endereco;
  form!: FormGroup;

  constructor(
    private fb: FormBuilder,
    public activeModal: NgbActiveModal
  ) {}

  ngOnInit(): void {
    this.form = this.fb.group({
      id:            [this.endereco?.id || null],
      cep:           [this.endereco?.cep || '', Validators.required],
      tipoLogradouro:[this.endereco?.tipoLogradouro || '', Validators.required],
      logradouro:    [this.endereco?.logradouro || '', Validators.required],
      numero:        [this.endereco?.numero || '', Validators.required],
      complemento:   [this.endereco?.complemento || ''],
      bairro:        [this.endereco?.bairro || '', Validators.required],
      cidade:        [this.endereco?.cidade || '', Validators.required],
      uf:            [this.endereco?.uf || '', Validators.required],
      tipoEndereco:  [this.endereco?.tipoEndereco || '', Validators.required]
    });
  }

  buscarCep(): void {
    const cepCtrl = this.form.get('cep');
    if (!cepCtrl) return;

    const onlyDigits = (cepCtrl.value || '').toString().replace(/\D/g, '');
    if (onlyDigits.length !== 8) return;

    fetch(`https://viacep.com.br/ws/${onlyDigits}/json/`)
      .then(res => res.json())
      .then(data => {
        if (data.erro) return;

        const full = data.logradouro || '';
        const parts = full.split(' ');
        const tipo = parts.shift() || '';
        const nome = parts.join(' ');

        let comp = data.complemento || '';
        if (/^até\s*\d+/i.test(comp.trim())) comp = '';

        this.form.patchValue({
          tipoLogradouro: tipo,
          logradouro:     nome,
          complemento:    comp,
          bairro:         data.bairro     || '',
          cidade:         data.localidade || '',
          uf:             data.uf         || ''
        });
      })
      .catch(() => {});
  }

  salvar(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.activeModal.close(this.form.value as Endereco);
  }

  cancelar(): void {
    this.activeModal.dismiss();
  }
}
