// src/app/pages/dashboards/usuario/cadastro-usuario/cadastro-usuario.component.ts

import { Component, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  Validators,
  AbstractControl,
  ValidationErrors
} from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

import { Usuario }            from 'src/app/store/Usuario/usuario.model';
import { UsuarioService }     from 'src/app/core/services/usuario.service';
import { GrupoUsuario }       from 'src/app/store/Grupo Usuario/grupo-usuario.model';
import { GrupoUsuarioService }from 'src/app/core/services/grupo-usuario.service';
import { ToastService }       from 'src/app/shared/toasts/toast-service';

@Component({
  selector: 'app-cadastro-usuario',
  templateUrl: './cadastro-usuario.component.html',
})
export class CadastroUsuarioComponent implements OnInit {
  form!: FormGroup;
  isEdit = false;
  submitted = false;
  private editingId?: number;
  grupos: GrupoUsuario[] = [];

  constructor(
    private fb: FormBuilder,
    private service: UsuarioService,
    private grupoService: GrupoUsuarioService,
    private router: Router,
    private route: ActivatedRoute,
    private toast: ToastService
  ) {
    this.buildForm();
  }

  ngOnInit(): void {
    this.grupoService.getAll().subscribe(list => this.grupos = list);

    this.route.paramMap.subscribe(params => {
      const idParam = params.get('id');
      if (!idParam) return;

      this.isEdit = true;
      this.editingId = +idParam;
      const usr = this.service.getById(this.editingId);
      if (!usr) return;

      this.form.patchValue({
        id:           usr.id,
        nome:         usr.nome,
        email:        usr.email,
        senha:        usr.senha,
        grupoUsuario: usr.grupoUsuario.id,
        ativo:        usr.ativo
      });
      this.form.get('id')?.disable();
    });
  }

  private buildForm(): void {
    this.form = this.fb.group({
      id:           [null, [Validators.required, Validators.pattern(/^\d+$/)]],
      nome:         ['', Validators.required],
      email:        ['', [Validators.required, Validators.email]],
      senha:        ['', Validators.required],
      grupoUsuario: [null, Validators.required],
      ativo:        [true]
    }, {
      validators: this.uniqueIdValidator.bind(this)
    });
  }

  private uniqueIdValidator(c: AbstractControl): ValidationErrors | null {
    const id = c.get('id')?.value;
    if (id == null) return null;
    const existing = this.service.getById(+id);
    if (existing && (!this.isEdit || existing.id !== this.editingId)) {
      return { uniqueId: 'Já existe um usuário com este ID.' };
    }
    return null;
  }

  save(): void {
    this.submitted = true;
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const v = this.form.getRawValue();
    const selectedGroup = this.grupos.find(g => g.id === +v.grupoUsuario)!;
    const usr: Usuario = {
      id:           +v.id,
      nome:         v.nome,
      email:        v.email,
      senha:        v.senha,
      ativo:        v.ativo,
      grupoUsuario: selectedGroup
    };
    const op$ = this.isEdit
      ? this.service.update(usr)
      : this.service.create(usr);

    op$.subscribe({
      next: () => {
        this.toast.show(
          this.isEdit
            ? `Usuário "${usr.nome}" atualizado!`
            : `Usuário "${usr.nome}" criado!`,
          {
            classname: this.isEdit ? 'bg-info text-light' : 'bg-success text-light',
            delay: 5000
          }
        );
        if (!this.isEdit) this.router.navigate(['/usuario']);
      },
      error: () => {
        this.toast.show('Erro ao salvar usuário.', {
          classname: 'bg-warning text-dark',
          delay: 5000
        });
      }
    });
  }

  cancel(): void {
    this.router.navigate(['/usuario']);
  }
}
