// src/app/pages/dashboards/grupo-usuario/cadastro-grupo-usuario/cadastro-grupo-usuario.component.ts

import { Component, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  Validators,
  AbstractControl,
  ValidationErrors
} from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

import { GrupoUsuario }         from 'src/app/store/Grupo Usuario/grupo-usuario.model';
import { GrupoUsuarioService }  from 'src/app/core/services/grupo-usuario.service';
import { ToastService }         from 'src/app/shared/toasts/toast-service';

@Component({
  selector: 'app-cadastro-grupo-usuario',
  templateUrl: './cadastro-grupo-usuario.component.html',
})
export class CadastroGrupoUsuarioComponent implements OnInit {
  form!: FormGroup;
  isEdit = false;
  private editingId?: number;
  allGrupos: GrupoUsuario[] = [];

  constructor(
    private fb: FormBuilder,
    private service: GrupoUsuarioService,
    private router: Router,
    private route: ActivatedRoute,
    private toast: ToastService
  ) {
    this.buildForm();
  }

  ngOnInit(): void {
    // carrega lista atual de grupos para validação
    this.service.getAll().subscribe(list => this.allGrupos = list);

    this.route.paramMap.subscribe(params => {
      const idParam = params.get('id');
      if (!idParam) return;

      this.isEdit = true;
      this.editingId = +idParam;
      const grp = this.service.getById(this.editingId);
      if (!grp) return;

      this.form.patchValue({
        id:    grp.id,
        cargo: grp.cargo,
        ativo: grp.ativo
      });
      this.form.get('id')?.disable();
    });
  }

  private buildForm(): void {
    this.form = this.fb.group({
      id:    [null, [Validators.required, Validators.pattern(/^\d+$/)]],
      cargo: ['', Validators.required],
      ativo: [true]
    }, {
      // adiciona aqui o validador de cargo único
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
    const cargoCtrl = c.get('cargo');
    const cargo = cargoCtrl?.value?.trim().toLowerCase();
    if (!cargo) return null;

    // verifica se já existe outro grupo com mesmo cargo
    const exists = this.allGrupos.some(g =>
      g.cargo.trim().toLowerCase() === cargo &&
      (!this.isEdit || g.id !== this.editingId)
    );
    return exists
      ? { uniqueCargo: 'Já existe um grupo com este cargo.' }
      : null;
  }

  save(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const v = this.form.getRawValue();
    const grp: GrupoUsuario = {
      id:    +v.id,
      cargo: v.cargo.trim(),
      ativo: v.ativo
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
        if (!this.isEdit) this.router.navigate(['/grupo-usuario']);
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
