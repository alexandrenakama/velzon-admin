// src/app/pages/dashboards/grupo-usuario/cadastro-grupo-usuario/cadastro-grupo-usuario.component.ts

import { Component, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  Validators,
  AbstractControl,
  ValidationErrors,
  FormArray,
  FormControl
} from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

import { GrupoUsuario }        from 'src/app/store/Grupo Usuario/grupo-usuario.model';
import { GrupoUsuarioService } from 'src/app/core/services/grupo-usuario.service';
import { Funcao }              from 'src/app/store/Funcao/funcao.model';
import { FuncaoService }       from 'src/app/core/services/funcao.service';
import { ToastService }        from 'src/app/shared/toasts/toast-service';
import { DefinicaoColuna }     from 'src/app/shared/lista-base/lista-base.component';

@Component({
  selector: 'app-cadastro-grupo-usuario',
  templateUrl: './cadastro-grupo-usuario.component.html',
})
export class CadastroGrupoUsuarioComponent implements OnInit {
  form!: FormGroup;
  isEdit = false;
  private editingId?: number;
  allGrupos: GrupoUsuario[] = [];
  funcoesList: Funcao[] = [];

  funcColunas: DefinicaoColuna[] = [
    { campo: 'id',        cabecalho: 'ID',      ordenavel: true, largura: '80px' },
    { campo: 'nome',      cabecalho: 'Função',  ordenavel: true              },
    { campo: 'descricao', cabecalho: 'Descrição'                              }
  ];

  constructor(
    private fb: FormBuilder,
    private service: GrupoUsuarioService,
    private funcaoSrv: FuncaoService,
    private router: Router,
    private route: ActivatedRoute,
    private toast: ToastService
  ) {
    this.buildForm();
  }

  ngOnInit(): void {
    this.service.getAll().subscribe(list => this.allGrupos = list);

    this.route.paramMap.subscribe(params => {
      const idParam = params.get('id');
      if (idParam) {
        this.isEdit = true;
        this.editingId = +idParam;
        const grp = this.service.getById(this.editingId);
        if (grp) {
          this.form.patchValue({
            id:    grp.id,
            cargo: grp.cargo,
            ativo: grp.ativo
          });
          this.form.get('id')?.disable();
        }
      }
    });

    this.funcaoSrv.getAll().subscribe(funcoes => {
      this.funcoesList = funcoes;
      const selected = this.isEdit
        ? (this.service.getById(this.editingId!)?.funcoes || [])
        : [];
      this.initFuncoesFlags(selected);
    });
  }

  private buildForm(): void {
    this.form = this.fb.group({
      id:           [null,   [Validators.required, Validators.pattern(/^\d+$/)]],
      cargo:        ['',     Validators.required],
      ativo:        [true],
      funcoesFlags: this.fb.array<FormControl>([])
    }, {
      validators: [
        this.uniqueIdValidator.bind(this),
        this.uniqueCargoValidator.bind(this)
      ]
    });
  }

  private uniqueIdValidator(c: AbstractControl): ValidationErrors | null {
    const id = c.get('id')?.value;
    if (id == null) return null;
    const existing = this.service.getById(+id);
    if (existing && (!this.isEdit || existing.id !== this.editingId)) {
      return { uniqueId: 'Já existe um grupo com este ID.' };
    }
    return null;
  }

  private uniqueCargoValidator(c: AbstractControl): ValidationErrors | null {
    const cargo = c.get('cargo')?.value?.trim().toLowerCase();
    if (!cargo) return null;
    const exists = this.allGrupos.some(g =>
      g.cargo.trim().toLowerCase() === cargo &&
      (!this.isEdit || g.id !== this.editingId)
    );
    return exists
      ? { uniqueCargo: 'Já existe um grupo com este cargo.' }
      : null;
  }

  private initFuncoesFlags(selected: Funcao[]): void {
    const controls = this.funcoesList.map(fn =>
      this.fb.control(selected.some(s => s.id === fn.id))
    );
    this.form.setControl('funcoesFlags', this.fb.array(controls));
  }

  get funcoesFlags(): FormArray {
    return this.form.get('funcoesFlags') as FormArray;
  }

  isAllSelected(): boolean {
    return this.funcoesFlags.length > 0 &&
      this.funcoesFlags.controls.every(ctrl => ctrl.value === true);
  }

  toggleAll(checked: boolean): void {
    this.funcoesFlags.controls.forEach(ctrl => ctrl.setValue(checked));
    this.form.markAsDirty();      // <–– marca o form como “dirty”
  }

  isChecked(fn: Funcao): boolean {
    const idx = this.funcoesList.findIndex(x => x.id === fn.id);
    return this.funcoesFlags.at(idx).value;
  }

  onCheckboxChange(evt: Event, fn: Funcao): void {
    const checked = (evt.target as HTMLInputElement).checked;
    const idx = this.funcoesList.findIndex(x => x.id === fn.id);
    this.funcoesFlags.at(idx).setValue(checked);
    this.form.markAsDirty();      // <–– marca o form como “dirty”
  }

  save(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const v = this.form.getRawValue();
    const escolhidas = this.funcoesList.filter((_, i) => v.funcoesFlags[i]);

    const grp: GrupoUsuario = {
      id:      +v.id,
      cargo:   v.cargo.trim(),
      ativo:   v.ativo,
      funcoes: escolhidas
    };

    const op$ = this.isEdit
      ? this.service.update(grp)
      : this.service.create(grp);

    op$.subscribe({
      next: () => {
        this.toast.show(
          this.isEdit
            ? `Grupo "${grp.cargo}" atualizado!`
            : `Grupo "${grp.cargo}" criado!`,
          {
            classname: this.isEdit ? 'bg-info text-light' : 'bg-success text-light',
            delay: 5000
          }
        );
        if (!this.isEdit) {
          this.router.navigate(['/grupo-usuario']);
        }
      },
      error: () => {
        this.toast.show('Erro ao salvar grupo.', {
          classname: 'bg-warning text-dark',
          delay: 5000
        });
      }
    });
  }

  cancel(): void {
    this.router.navigate(['/grupo-usuario']);
  }
}
