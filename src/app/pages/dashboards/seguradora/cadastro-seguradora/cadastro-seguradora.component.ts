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

import { Seguradora, Endereco, Contato } from 'src/app/store/Seguradora/seguradora.model';
import { SeguradoraService }             from 'src/app/core/services/seguradora.service';
import { ToastService }                  from 'src/app/shared/toasts/toast-service';

@Component({
  selector: 'app-cadastro-seguradora',
  templateUrl: './cadastro-seguradora.component.html',
  styleUrls: ['./cadastro-seguradora.component.scss']
})
export class CadastroSeguradoraComponent implements OnInit {
  form!: FormGroup;
  isEdit = false;
  private editingId?: number;

  constructor(
    private fb:      FormBuilder,
    private service: SeguradoraService,
    private router:  Router,
    private route:   ActivatedRoute,
    private toast:   ToastService
  ) {}

  ngOnInit(): void {
    this.buildForm();

    this.route.paramMap.subscribe(params => {
      const idParam = params.get('id');
      if (!idParam) return;

      this.isEdit    = true;
      this.editingId = +idParam;

      const seg = this.service.getById(this.editingId);
      if (!seg) return;

      // campos básicos
      this.form.patchValue({
        id:    seg.id,
        nome:  seg.nome,
        ativa: seg.ativa,
        cnpj:  seg.cnpj
      });

      // endereços
      this.enderecos.clear();
      seg.enderecos.forEach(e =>
        this.enderecos.push(this.fb.group(e))
      );

      // contatos
      this.contatos.clear();
      seg.contatos.forEach(c =>
        this.contatos.push(this.fb.group(c))
      );
    });
  }

  private buildForm(): void {
    this.form = this.fb.group({
      id:        [null, [Validators.required, Validators.pattern(/^\d+$/)]],
      nome:      ['', Validators.required],
      ativa:     [true],
      cnpj:      ['', [
        Validators.required,
        Validators.pattern(/^\d{2}\.\d{3}\.\d{3}\/\d{4}\-\d{2}$/)
      ]],
      enderecos: this.fb.array([]),
      contatos:  this.fb.array([])
    }, {
      validators: [ this.uniqueIdValidator.bind(this) ]
    });
  }

  get enderecos(): FormArray {
    return this.form.get('enderecos') as FormArray;
  }
  get contatos(): FormArray {
    return this.form.get('contatos') as FormArray;
  }

  private buildEnderecoGroup(): FormGroup {
    return this.fb.group({
      tipoLogradouro: ['', Validators.required],
      logradouro:      ['', Validators.required],
      numero:          ['', Validators.required],
      complemento:     [''],
      bairro:          ['', Validators.required],
      cidade:          ['', Validators.required],
      uf:              ['', Validators.required],
      cep:             ['', Validators.required],
      tipoEndereco:    ['', Validators.required]
    });
  }

  private buildContatoGroup(): FormGroup {
    return this.fb.group({
      tipoPessoa:   ['FISICA', Validators.required],
      ddd:          ['', Validators.required],
      telefone:     ['', Validators.required],
      tipoTelefone: ['', Validators.required],
      email:        ['', [Validators.required, Validators.email]],
      nomeContato:  ['']
    });
  }

  // endereços
  openAddEndereco(): void {
    this.enderecos.push(this.buildEnderecoGroup());
  }
  openEditEndereco(i: number): void {
    console.log('Editar endereço', this.enderecos.at(i)?.value);
  }
  removeEndereco(i: number): void {
    this.enderecos.removeAt(i);
  }

  // contatos
  openAddContato(): void {
    this.contatos.push(this.buildContatoGroup());
  }
  openEditContato(i: number): void {
    console.log('Editar contato', this.contatos.at(i)?.value);
  }
  removeContato(i: number): void {
    this.contatos.removeAt(i);
  }

  private uniqueIdValidator(c: AbstractControl): ValidationErrors | null {
    const id = c.get('id')?.value;
    if (id == null) return null;
    const existing = this.service.getById(+id);
    if (existing && (!this.isEdit || existing.id !== this.editingId)) {
      return { uniqueId: 'Já existe uma seguradora com este ID.' };
    }
    return null;
  }

  save(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const v = this.form.value;
    const seg: Seguradora = {
      id:        +v.id,
      nome:      v.nome,
      ativa:     v.ativa,
      cnpj:      v.cnpj,
      enderecos: v.enderecos as Endereco[],
      contatos:  v.contatos  as Contato[]
    };

    const op$ = this.isEdit
      ? this.service.update(seg)
      : this.service.create(seg);

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
      error: () => {
        this.toast.show('Erro ao salvar seguradora.', { classname: 'bg-warning text-dark', delay: 5000 });
      }
    });
  }

  cancel(): void {
    this.router.navigate(['/seguradora']);
  }
}
