// src/app/pages/dashboards/seguradora/cadastro-seguradora/cadastro-seguradora.component.ts
import { Component, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  FormArray,
  Validators,
  AbstractControl,
  ValidationErrors
} from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

import { Seguradora, Endereco, Contato } from 'src/app/store/Seguradora/seguradora.model';
import { SeguradoraService } from 'src/app/core/services/seguradora.service';
import { ToastService } from 'src/app/shared/toasts/toast-service';
import { ConfirmModalComponent } from 'src/app/shared/confirm-modal/confirm-modal.component';
import { EnderecoModalComponent } from './modal/endereco-modal.component';
import { ContatoModalComponent } from './modal/contato-modal.component';
import { DefinicaoColuna } from 'src/app/shared/lista-base/lista-base.component';

@Component({
  selector: 'app-cadastro-seguradora',
  templateUrl: './cadastro-seguradora.component.html',
  styleUrls: ['./cadastro-seguradora.component.scss']
})
export class CadastroSeguradoraComponent implements OnInit {
  form!: FormGroup;
  isEdit = false;
  submitted = false;
  private editingId?: number;

  colunasEndereco: DefinicaoColuna[] = [ /* ... */ ];
  colunasContato: DefinicaoColuna[] = [ /* ... */ ];

  constructor(
    private fb: FormBuilder,
    private service: SeguradoraService,
    private router: Router,
    private route: ActivatedRoute,
    private toast: ToastService,
    private modal: NgbModal
  ) {}

  ngOnInit(): void {
    this.buildForm();
    this.route.paramMap.subscribe(params => {
      const idParam = params.get('id');
      if (!idParam) return;
      this.isEdit = true;
      this.editingId = +idParam;
      const seg = this.service.getById(this.editingId);
      if (!seg) return;
      this.form.patchValue({ id: seg.id, nome: seg.nome, ativa: seg.ativa, cnpj: seg.cnpj });
      this.form.get('id')?.disable();
      this.enderecos.clear();
      seg.enderecos.forEach(e => this.enderecos.push(this.fb.group(e)));
      this.contatos.clear();
      seg.contatos.forEach(c => this.contatos.push(this.fb.group(c)));
    });
  }

  private buildForm(): void {
    this.form = this.fb.group({
      id:        [null, [Validators.required, Validators.pattern(/^\d+$/)]],
      nome:      ['', Validators.required],
      ativa:     [true],
      cnpj:      ['', [Validators.required, Validators.pattern(/^\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2}$/)]],
      enderecos: this.fb.array([]),
      contatos:  this.fb.array([])
    }, {
      validators: [
        this.uniqueIdValidator.bind(this),
        this.requireAddressAndContact.bind(this)
      ]
    });
  }

  get enderecos(): FormArray { return this.form.get('enderecos') as FormArray; }
  get contatos():  FormArray { return this.form.get('contatos')  as FormArray; }

  private uniqueIdValidator(c: AbstractControl): ValidationErrors | null {
    const id = c.get('id')?.value;
    if (id == null) return null;
    const existing = this.service.getById(+id);
    if (existing && (!this.isEdit || existing.id !== this.editingId)) {
      return { uniqueId: 'Já existe uma seguradora com este ID.' };
    }
    return null;
  }

  private requireAddressAndContact(c: AbstractControl): ValidationErrors | null {
    const hasAddress = (c.get('enderecos') as FormArray).length > 0;
    const hasContact = (c.get('contatos')  as FormArray).length > 0;
    return hasAddress && hasContact
      ? null
      : { requireAddressAndContact: 'Inclua pelo menos um endereço e um contato.' };
  }

  openAddEndereco(): void { /*...*/ }
  onEditarEndereco(e: Endereco): void { /*...*/ }
  onApagarEndereco(e: Endereco): void { /*...*/ }
  openAddContato(): void { /*...*/ }
  onEditarContato(c: Contato): void { /*...*/ }
  onApagarContato(c: Contato): void { /*...*/ }

  save(): void {
    this.submitted = true;
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const v = this.form.getRawValue();
    const seg: Seguradora = {
      id: +v.id, nome: v.nome, ativa: v.ativa, cnpj: v.cnpj,
      enderecos: v.enderecos, contatos: v.contatos
    };
    const op$ = this.isEdit ? this.service.update(seg) : this.service.create(seg);
    op$.subscribe({
      next: () => {
        this.toast.show(
          this.isEdit
            ? `Seguradora "${seg.nome}" atualizada!`
            : `Seguradora "${seg.nome}" criada!`,
          { classname: this.isEdit ? 'bg-info text-light' : 'bg-success text-light', delay: 5000 }
        );
        if (!this.isEdit) this.router.navigate(['/seguradora']);
      },
      error: () => this.toast.show('Erro ao salvar seguradora.', { classname: 'bg-warning text-dark', delay: 5000 })
    });
  }

  cancel(): void {
    this.router.navigate(['/seguradora']);
  }
}
