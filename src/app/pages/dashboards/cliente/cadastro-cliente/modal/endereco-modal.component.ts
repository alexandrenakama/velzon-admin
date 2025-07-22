// src/app/pages/dashboards/seguradora/cadastro-seguradora/modal/endereco-modal.component.ts
import { Component, Input, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Subscription } from 'rxjs';
import { debounceTime, distinctUntilChanged, filter, map } from 'rxjs/operators';
import { HttpClient } from '@angular/common/http';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { Endereco } from 'src/app/store/Seguradora/seguradora.model';

@Component({
  selector: 'app-endereco-modal',
  templateUrl: './endereco-modal.component.html',
})
export class EnderecoModalComponent implements OnInit, OnDestroy {
  @Input() endereco?: Endereco;
  form!: FormGroup;
  private cepSub!: Subscription;

  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
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

    this.cepSub = this.form.get('cep')!.valueChanges.pipe(
      map(v => (v || '').toString().replace(/\D/g, '')),
      filter(digits => digits.length === 8),
      debounceTime(300),
      distinctUntilChanged()
    ).subscribe(digits => this.buscarCep(digits));
  }

  buscarCep(digits: string): void {
    this.http
      .get<{
        erro?: boolean;
        logradouro: string;
        complemento: string;
        bairro: string;
        localidade: string;
        uf: string;
      }>(`https://viacep.com.br/ws/${digits}/json/`)
      .subscribe(data => {
        if (data.erro) {
          return;
        }
        const parts = (data.logradouro || '').split(' ');
        const tipo = parts.shift() || '';
        const nome = parts.join(' ');
        let comp = data.complemento || '';
        if (/^até\s*\d+/i.test(comp.trim())) {
          comp = '';
        }
        this.form.patchValue({
          tipoLogradouro: tipo,
          logradouro:     nome,
          complemento:    comp,
          bairro:         data.bairro || '',
          cidade:         data.localidade || '',
          uf:             data.uf || ''
        });
      }, err => {
        console.error('Erro ao consultar ViaCEP:', err);
      });
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

  ngOnDestroy(): void {
    this.cepSub.unsubscribe();
  }
}
