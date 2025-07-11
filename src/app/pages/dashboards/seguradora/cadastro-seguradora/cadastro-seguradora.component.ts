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
    { campo: 'tipoPessoa',   cabecalho: 'Tipo Pessoa'   },
    { campo: 'ddd',          cabecalho: 'DDD'           },
    { campo: 'telefone',     cabecalho: 'Telefone'      },
    { campo: 'tipoTelefone', cabecalho: 'Tipo Telefone' },
    { campo: 'email',        cabecalho: 'Email'         },
    { campo: 'nomeContato',  cabecalho: 'Nome Contato'  }
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
        Validators.pattern(/^\d{2}\.\d{3}\.\d{3}\/\d{4}\-\d{2}$/)
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

  private buildEnderecoGroup(): FormGroup {
    return this.fb.group({
      id: [null],
      tipoLogradouro: ['', Validators.required],
      logradouro: ['', Validators.required],
      numero: ['', Validators.required],
      complemento: [''],
      bairro: ['', Validators.required],
      cidade: ['', Validators.required],
      uf: ['', Validators.required],
      cep: ['', Validators.required],
      tipoEndereco: ['', Validators.required]
    });
  }

  private buildContatoGroup(): FormGroup {
    return this.fb.group({
      id: [null],
      tipoPessoa: ['FISICA', Validators.required],
      ddd: ['', Validators.required],
      telefone: ['', Validators.required],
      tipoTelefone: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      nomeContato: ['']
    });
  }

  openAddEndereco(): void {
    this.enderecos.push(this.buildEnderecoGroup());
  }

  openAddContato(): void {
    this.contatos.push(this.buildContatoGroup());
  }

  onEditarEndereco(e: Endereco): void {
    // Lógica de edição (se necessário)
  }

  onEditarContato(c: Contato): void {
    // Lógica de edição (se necessário)
  }

  onApagarEndereco(e: Endereco): void {
    const lista: Endereco[] = this.enderecos.value as Endereco[];
    const idx = lista.findIndex(x => x.id === e.id);
    if (idx < 0) return;

    const ref = this.modal.open(ConfirmModalComponent, { centered: true, backdrop: 'static' });
    ref.componentInstance.title = 'Confirma exclusão';
    ref.componentInstance.message = `Deseja realmente apagar o endereço “${e.logradouro}, ${e.numero}”?`;
    ref.componentInstance.confirmText = 'Apagar';
    ref.componentInstance.cancelText = 'Cancelar';

    ref.result.then(ok => {
      if (!ok) return;

      // Exibe o toast ANTES do update
      this.toast.show('Endereço apagado com sucesso.', {
        classname: 'bg-danger text-light', delay: 3000
      });

      this.enderecos.removeAt(idx);

      const v = this.form.value;
      const seg: Seguradora = {
        id: +v.id,
        nome: v.nome,
        ativa: v.ativa,
        cnpj: v.cnpj,
        enderecos: v.enderecos,
        contatos: v.contatos
      };

      this.service.update(seg).subscribe({
        error: () => {
          this.toast.show('Falha ao apagar endereço. Tente novamente.', {
            classname: 'bg-warning text-dark', delay: 5000
          });
        }
      });
    }).catch(() => {});
  }

  onApagarContato(c: Contato): void {
    const lista: Contato[] = this.contatos.value as Contato[];
    const idx = lista.findIndex(x => x.id === c.id);
    if (idx < 0) return;

    const ref = this.modal.open(ConfirmModalComponent, { centered: true, backdrop: 'static' });
    ref.componentInstance.title = 'Confirma exclusão';
    ref.componentInstance.message = `Deseja realmente apagar o contato “${c.email}”?`;
    ref.componentInstance.confirmText = 'Apagar';
    ref.componentInstance.cancelText = 'Cancelar';

    ref.result.then(ok => {
      if (!ok) return;

      // Exibe o toast ANTES do update
      this.toast.show('Contato apagado com sucesso.', {
        classname: 'bg-danger text-light', delay: 3000
      });

      this.contatos.removeAt(idx);

      const v = this.form.value;
      const seg: Seguradora = {
        id: +v.id,
        nome: v.nome,
        ativa: v.ativa,
        cnpj: v.cnpj,
        enderecos: v.enderecos,
        contatos: v.contatos
      };

      this.service.update(seg).subscribe({
        error: () => {
          this.toast.show('Falha ao apagar contato. Tente novamente.', {
            classname: 'bg-warning text-dark', delay: 5000
          });
        }
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

    const v = this.form.value;
    const seg: Seguradora = {
      id: +v.id,
      nome: v.nome,
      ativa: v.ativa,
      cnpj: v.cnpj,
      enderecos: v.enderecos,
      contatos: v.contatos
    };

    const op$ = this.isEdit ? this.service.update(seg) : this.service.create(seg);
    op$.subscribe({
      next: () => {
        const msg = this.isEdit
          ? `Seguradora "${seg.nome}" atualizada!`
          : `Seguradora "${seg.nome}" criada!`;

        this.toast.show(msg, {
          classname: this.isEdit ? 'bg-info text-light' : 'bg-success text-light',
          delay: 5000
        });

        if (!this.isEdit) {
          this.router.navigate(['/seguradora']);
        }
      },
      error: () => {
        this.toast.show('Erro ao salvar seguradora.', {
          classname: 'bg-warning text-dark', delay: 5000
        });
      }
    });
  }

  cancel(): void {
    this.router.navigate(['/seguradora']);
  }
}
