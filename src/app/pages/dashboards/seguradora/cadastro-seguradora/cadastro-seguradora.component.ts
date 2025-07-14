// src/app/pages/dashboards/seguradora/cadastro-seguradora/cadastro-seguradora.component.ts
import { Component, OnInit } from '@angular/core';
import {
  FormBuilder, FormGroup, FormArray,
  Validators, AbstractControl, ValidationErrors
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
  private editingId?: number;

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
    { campo: 'tipoPessoa',   cabecalho: 'Tipo Pessoa'   },
    { campo: 'ddd',          cabecalho: 'DDD'           },
    { campo: 'telefone',     cabecalho: 'Telefone'      },
    { campo: 'tipoTelefone', cabecalho: 'Tipo Telefone' },
    { campo: 'email',        cabecalho: 'Email'         }
  ];

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

      this.form.patchValue({
        id: seg.id,
        nome: seg.nome,
        ativa: seg.ativa,
        cnpj: seg.cnpj
      });
      this.form.get('id')?.disable();
      this.enderecos.clear();
      seg.enderecos.forEach(e => this.enderecos.push(this.fb.group(e)));
      this.contatos.clear();
      seg.contatos.forEach(c => this.contatos.push(this.fb.group(c)));
    });
  }

  private buildForm(): void {
    this.form = this.fb.group({
      id: [null, [Validators.required, Validators.pattern(/^\d+$/)]],
      nome: ['', Validators.required],
      ativa: [true],
      cnpj: ['', [
        Validators.required,
        Validators.pattern(/^\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2}$/)
      ]],
      enderecos: this.fb.array([]),
      contatos: this.fb.array([])
    }, {
      validators: [this.uniqueIdValidator.bind(this)]
    });
  }

  get enderecos(): FormArray {
    return this.form.get('enderecos') as FormArray;
  }

  get contatos(): FormArray {
    return this.form.get('contatos') as FormArray;
  }

  openAddEndereco(): void {
    const modalRef = this.modal.open(EnderecoModalComponent, { centered: true, backdrop: 'static' });
    modalRef.componentInstance.endereco = null;
    modalRef.result.then((novo: Endereco) => {
      this.enderecos.push(this.fb.group(novo));
    }).catch(() => {});
  }

  onEditarEndereco(e: Endereco): void {
    const idx = (this.enderecos.value as Endereco[]).findIndex(x => x.id === e.id);
    if (idx < 0) return;

    const modalRef = this.modal.open(EnderecoModalComponent, { centered: true, backdrop: 'static' });
    modalRef.componentInstance.endereco = e;
    modalRef.result.then((editado: Endereco) => {
      this.enderecos.at(idx).patchValue(editado);
      const v = this.form.getRawValue();
      const seg: Seguradora = {
        id: +v.id, nome: v.nome, ativa: v.ativa, cnpj: v.cnpj,
        enderecos: v.enderecos, contatos: v.contatos
      };
      this.service.update(seg).subscribe({
        next: () => this.toast.show('Endereço atualizado com sucesso.', { classname: 'bg-info text-light', delay: 3000 }),
        error: () => this.toast.show('Falha ao atualizar endereço.', { classname: 'bg-warning text-dark', delay: 5000 })
      });
    }).catch(() => {});
  }

  onApagarEndereco(e: Endereco): void {
    const idx = (this.enderecos.value as Endereco[]).findIndex(x => x.id === e.id);
    if (idx < 0) return;
    const ref = this.modal.open(ConfirmModalComponent, { centered: true, backdrop: 'static' });
    ref.componentInstance.title = 'Confirma exclusão';
    ref.componentInstance.message = `Deseja realmente apagar o endereço “${e.tipoLogradouro} ${e.logradouro}, ${e.numero}”?`;
    ref.componentInstance.confirmText = 'Apagar';
    ref.componentInstance.cancelText = 'Cancelar';
    ref.result.then(ok => {
      if (!ok) return;
      const v = this.form.getRawValue();
      const seg: Seguradora = {
        id: +v.id, nome: v.nome, ativa: v.ativa, cnpj: v.cnpj,
        enderecos: v.enderecos, contatos: v.contatos
      };
      this.service.deleteEndereco(seg.id, idx).subscribe({
        next: () => {
          this.enderecos.removeAt(idx);
          this.toast.show('Endereço apagado com sucesso.', { classname: 'bg-danger text-light', delay: 3000 });
        },
        error: () => this.toast.show('Falha ao apagar endereço.', { classname: 'bg-warning text-dark', delay: 5000 })
      });
    }).catch(() => {});
  }

  openAddContato(): void {
    const modalRef = this.modal.open(ContatoModalComponent, { centered: true, backdrop: 'static' });
    modalRef.componentInstance.contato = null;
    modalRef.result.then((novo: Contato) => {
      this.contatos.push(this.fb.group(novo));
    }).catch(() => {});
  }

  onEditarContato(c: Contato): void {
    const idx = (this.contatos.value as Contato[]).findIndex(x => x.id === c.id);
    if (idx < 0) return;
    const modalRef = this.modal.open(ContatoModalComponent, { centered: true, backdrop: 'static' });
    modalRef.componentInstance.contato = c;
    modalRef.result.then((editado: Contato) => {
      this.contatos.at(idx).patchValue(editado);
      const v = this.form.getRawValue();
      const seg: Seguradora = {
        id: +v.id, nome: v.nome, ativa: v.ativa, cnpj: v.cnpj,
        enderecos: v.enderecos, contatos: v.contatos
      };
      this.service.update(seg).subscribe({
        next: () => this.toast.show('Contato atualizado com sucesso.', { classname: 'bg-info text-light', delay: 3000 }),
        error: () => this.toast.show('Falha ao atualizar contato.', { classname: 'bg-warning text-dark', delay: 5000 })
      });
    }).catch(() => {});
  }

  onApagarContato(c: Contato): void {
    const idx = (this.contatos.value as Contato[]).findIndex(x => x.id === c.id);
    if (idx < 0) return;
    const ref = this.modal.open(ConfirmModalComponent, { centered: true, backdrop: 'static' });
    ref.componentInstance.title = 'Confirma exclusão';
    ref.componentInstance.message = `Deseja realmente apagar o contato “${c.email}”?`;
    ref.componentInstance.confirmText = 'Apagar';
    ref.componentInstance.cancelText = 'Cancelar';
    ref.result.then(ok => {
      if (!ok) return;
      this.service.deleteContato(+this.form.getRawValue().id, idx).subscribe({
        next: () => {
          this.contatos.removeAt(idx);
          this.toast.show('Contato apagado com sucesso.', { classname: 'bg-danger text-light', delay: 3000 });
        },
        error: () => this.toast.show('Falha ao apagar contato.', { classname: 'bg-warning text-dark', delay: 5000 })
      });
    }).catch(() => {});
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
          {
            classname: this.isEdit ? 'bg-info text-light' : 'bg-success text-light',
            delay: 5000
          }
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
