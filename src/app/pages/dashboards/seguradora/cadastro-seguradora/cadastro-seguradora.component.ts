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
import { DefinicaoColuna }               from 'src/app/shared/lista-base/lista-base.component';

@Component({
  selector: 'app-cadastro-seguradora',
  templateUrl: './cadastro-seguradora.component.html',
  styleUrls: ['./cadastro-seguradora.component.scss']
})
export class CadastroSeguradoraComponent implements OnInit {
  form!: FormGroup;
  isEdit = false;
  private editingId?: number;

  // configurações de colunas e paginações
  colunasEndereco: DefinicaoColuna[] = [
    { campo: 'tipoLogradouro', cabecalho: 'Tipo Logradouro' },
    { campo: 'logradouro',     cabecalho: 'Logradouro'      },
    { campo: 'numero',         cabecalho: 'Número'          },
    { campo: 'complemento',    cabecalho: 'Complemento'     },
    { campo: 'bairro',         cabecalho: 'Bairro'          },
    { campo: 'cidade',         cabecalho: 'Cidade'          },
    { campo: 'uf',             cabecalho: 'UF'              },
    { campo: 'cep',            cabecalho: 'CEP'             },
    { campo: 'tipoEndereco',   cabecalho: 'Tipo Endereço'   }
  ];
  paginaEndereco = 1;
  tamanhoPaginaEndereco = 5;

  colunasContato: DefinicaoColuna[] = [
    { campo: 'tipoPessoa',  cabecalho: 'Tipo Pessoa'   },
    { campo: 'ddd',         cabecalho: 'DDD'           },
    { campo: 'telefone',    cabecalho: 'Telefone'      },
    { campo: 'tipoTelefone',cabecalho: 'Tipo Telefone' },
    { campo: 'email',       cabecalho: 'Email'         },
    { campo: 'nomeContato', cabecalho: 'Nome Contato'  }
  ];
  paginaContato = 1;
  tamanhoPaginaContato = 5;

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

      // preenche formulário
      this.form.patchValue({
        id:    seg.id,
        nome:  seg.nome,
        ativa: seg.ativa,
        cnpj:  seg.cnpj
      });

      // popula endereços
      this.enderecos.clear();
      seg.enderecos.forEach((e: Endereco) =>
        this.enderecos.push(this.fb.group(e))
      );

      // popula contatos
      this.contatos.clear();
      seg.contatos.forEach((c: Contato) =>
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

  get enderecos(): FormArray { return this.form.get('enderecos') as FormArray; }
  get contatos():  FormArray { return this.form.get('contatos')  as FormArray; }

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

  // controles de array
  openAddEndereco(): void {
    this.enderecos.push(this.buildEnderecoGroup());
  }
  openEditEndereco(i: number): void {
    console.log('Editar endereço na posição', i);
  }
  removeEndereco(i: number): void {
    this.enderecos.removeAt(i);
  }

  openAddContato(): void {
    this.contatos.push(this.buildContatoGroup());
  }
  openEditContato(i: number): void {
    console.log('Editar contato na posição', i);
  }
  removeContato(i: number): void {
    this.contatos.removeAt(i);
  }

  // **handlers do ListaBaseComponent** — sem modal por enquanto
  onEditarEndereco(e: Endereco): void {
    console.log('Editar endereço', e);
  }
  onApagarEndereco(e: Endereco): void {
    console.log('Apagar endereço', e);
  }
  onEditarContato(c: Contato): void {
    console.log('Editar contato', c);
  }
  onApagarContato(c: Contato): void {
    console.log('Apagar contato', c);
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
