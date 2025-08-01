// src/app/pages/dashboards/filial/cadastro-filial/cadastro-filial.component.ts

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

import {
  Filial,
  Endereco,
  Contato,
  PessoaTipo
} from 'src/app/store/Filial/filial.model';
import { FilialService }           from 'src/app/core/services/filial.service';
import { ToastService }            from 'src/app/shared/toasts/toast-service';
import { ConfirmModalComponent }   from 'src/app/shared/confirm-modal/confirm-modal.component';
import { EnderecoModalComponent }  from './modal/endereco-modal.component';
import { ContatoModalComponent }   from './modal/contato-modal.component';
import { DefinicaoColuna }         from 'src/app/shared/lista-base/lista-base.component';

@Component({
  selector: 'app-cadastro-filial',
  templateUrl: './cadastro-filial.component.html',
})
export class CadastroFilialComponent implements OnInit {
  form!: FormGroup;
  isEdit = false;
  submitted = false;
  private editingId?: number;

  pessoaTipos: PessoaTipo[] = ['Física', 'Jurídica'];

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
  colunasContato: DefinicaoColuna[] = [
    { campo: 'nomeContato',  cabecalho: 'Nome Contato'  },
    { campo: 'ddd',          cabecalho: 'DDD'           },
    { campo: 'telefone',     cabecalho: 'Telefone'      },
    { campo: 'tipoTelefone', cabecalho: 'Tipo Telefone' },
    { campo: 'email',        cabecalho: 'Email'         }
  ];

  constructor(
    private fb: FormBuilder,
    private service: FilialService,
    private router: Router,
    private route: ActivatedRoute,
    private toast: ToastService,
    private modal: NgbModal
  ) {
    this.buildForm();
  }

  ngOnInit(): void {
    this.form.get('tipoPessoa')!.valueChanges.subscribe(() => {
      this.form.get('documento')!.reset();
    });

    this.route.paramMap.subscribe(params => {
      const idParam = params.get('id');
      if (!idParam) return;

      this.isEdit = true;
      this.editingId = +idParam;
      const fil = this.service.getById(this.editingId);
      if (!fil) return;

      this.form.patchValue({
        id:         fil.id,
        nome:       fil.nome,
        tipoPessoa: fil.tipoPessoa,
        ativo:      fil.ativo,
        documento:  fil.documento
      });
      this.form.get('id')?.disable();

      this.enderecos.clear();
      fil.enderecos.forEach(e => this.enderecos.push(this.fb.group(e)));

      this.contatos.clear();
      fil.contatos.forEach(c => this.contatos.push(this.fb.group(c)));
    });
  }

  private buildForm(): void {
    this.form = this.fb.group({
      id:         [null, [Validators.required, Validators.pattern(/^\d+$/)]],
      nome:       ['', Validators.required],
      tipoPessoa: ['Física', Validators.required],
      ativo:      [true],
      documento:  ['', Validators.required],
      enderecos:  this.fb.array([]),
      contatos:   this.fb.array([])
    }, {
      validators: [
        this.uniqueIdValidator.bind(this),
        this.requireAddressAndContact.bind(this)
      ]
    });
  }

  get enderecos(): FormArray { return this.form.get('enderecos') as FormArray; }
  get contatos():  FormArray { return this.form.get('contatos')  as FormArray; }

  get isJuridica(): boolean {
    return this.form.get('tipoPessoa')?.value === 'Jurídica';
  }

  private uniqueIdValidator(c: AbstractControl): ValidationErrors | null {
    const id = c.get('id')?.value;
    if (id == null) return null;
    const existing = this.service.getById(+id);
    if (existing && (!this.isEdit || existing.id !== this.editingId)) {
      return { uniqueId: 'Já existe uma filial com este ID.' };
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

  openAddEndereco(): void {
    const modalRef = this.modal.open(EnderecoModalComponent, { centered: true, backdrop: 'static' });
    modalRef.componentInstance.endereco = null;
    modalRef.result
      .then((novo: Endereco) => this.enderecos.push(this.fb.group(novo)))
      .catch(() => {});
  }

  onEditarEndereco(e: Endereco): void {
    const i = this.enderecos.value.findIndex((x: Endereco) => x.id === e.id);
    if (i < 0) return;
    const modalRef = this.modal.open(EnderecoModalComponent, { centered: true, backdrop: 'static' });
    modalRef.componentInstance.endereco = e;
    modalRef.result
      .then((edit: Endereco) => this.enderecos.at(i).patchValue(edit))
      .catch(() => {});
  }

  onApagarEndereco(e: Endereco): void {
    const i = this.enderecos.value.findIndex((x: Endereco) => x.id === e.id);
    if (i < 0) return;
    const ref = this.modal.open(ConfirmModalComponent, { centered: true, backdrop: 'static' });
    ref.componentInstance.title = 'Confirma exclusão';
    ref.componentInstance.message = `Deseja realmente apagar o endereço “${e.tipoLogradouro} ${e.logradouro}, ${e.numero}”?`;
    ref.componentInstance.confirmText = 'Apagar';
    ref.componentInstance.confirmButtonClass = 'btn-danger';
    ref.result.then(ok => {
      if (!ok) return;
      if (this.isEdit && this.editingId != null) {
        this.service.deleteEndereco(this.editingId, i).subscribe({
          next: () => {
            this.enderecos.removeAt(i);
            this.toast.show('Endereço excluído com sucesso.', { classname: 'bg-danger text-light', delay: 3000 });
          },
          error: () => this.toast.show('Falha ao excluir endereço.', { classname: 'bg-warning text-dark', delay: 5000 })
        });
      } else {
        this.enderecos.removeAt(i);
      }
    }).catch(() => {});
  }

  openAddContato(): void {
    const modalRef = this.modal.open(ContatoModalComponent, { centered: true, backdrop: 'static' });
    modalRef.componentInstance.contato = null;
    modalRef.result
      .then((novo: Contato) => this.contatos.push(this.fb.group(novo)))
      .catch(() => {});
  }

  onEditarContato(c: Contato): void {
    const i = this.contatos.value.findIndex((x: Contato) => x.id === c.id);
    if (i < 0) return;
    const modalRef = this.modal.open(ContatoModalComponent, { centered: true, backdrop: 'static' });
    modalRef.componentInstance.contato = c;
    modalRef.result
      .then((edit: Contato) => this.contatos.at(i).patchValue(edit))
      .catch(() => {});
  }

  onApagarContato(c: Contato): void {
    const i = this.contatos.value.findIndex((x: Contato) => x.id === c.id);
    if (i < 0) return;
    const ref = this.modal.open(ConfirmModalComponent, { centered: true, backdrop: 'static' });
    ref.componentInstance.title = 'Confirma exclusão';
    ref.componentInstance.message = `Deseja realmente apagar o contato “${c.email}”?`;
    ref.componentInstance.confirmText = 'Apagar';
    ref.componentInstance.confirmButtonClass = 'btn-danger';
    ref.result.then(ok => {
      if (!ok) return;
      if (this.isEdit && this.editingId != null) {
        this.service.deleteContato(this.editingId, i).subscribe({
          next: () => {
            this.contatos.removeAt(i);
            this.toast.show('Contato excluído com sucesso.', { classname: 'bg-danger text-light', delay: 3000 });
          },
          error: () => this.toast.show('Falha ao excluir contato.', { classname: 'bg-warning text-dark', delay: 5000 })
        });
      } else {
        this.contatos.removeAt(i);
      }
    }).catch(() => {});
  }

  save(): void {
    this.submitted = true;
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const v = this.form.getRawValue();
    const fil: Filial = {
      id:         +v.id,
      nome:       v.nome,
      tipoPessoa: v.tipoPessoa as PessoaTipo,
      ativo:      v.ativo,
      documento:  v.documento,
      enderecos:  v.enderecos,
      contatos:   v.contatos
    };
    const op$ = this.isEdit
      ? this.service.update(fil)
      : this.service.create(fil);

    op$.subscribe({
      next: () => {
        this.toast.show(
          this.isEdit
            ? `Filial "${fil.nome}" atualizada!`
            : `Filial "${fil.nome}" criada!`,
          {
            classname: this.isEdit ? 'bg-info text-light' : 'bg-success text-light',
            delay: 5000
          }
        );
        if (!this.isEdit) this.router.navigate(['/filial']);
      },
      error: () => {
        this.toast.show('Erro ao salvar filial.', {
          classname: 'bg-warning text-dark',
          delay: 5000
        });
      }
    });
  }

  cancel(): void {
    this.router.navigate(['/filial']);
  }
}
